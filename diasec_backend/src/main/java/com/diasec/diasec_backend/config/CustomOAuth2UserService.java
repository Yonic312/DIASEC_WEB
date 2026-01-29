package com.diasec.diasec_backend.config;

import com.diasec.diasec_backend.service.MemberService;
import com.diasec.diasec_backend.vo.MemberVo;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberService memberService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = user.getAttributes();

        String email;
        String nickname;
        String providerUid;
        Map<String, Object> userAttributes;

        if ("kakao".equals(provider)) {
            providerUid = String.valueOf(attributes.get("id"));

            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

            email = (String) kakaoAccount.get("email");
            nickname = (String) profile.get("nickname");

            kakaoAccount.put("email", email);
            kakaoAccount.put("nickname", nickname);
            kakaoAccount.put("provider", provider);
            kakaoAccount.put("providerUid", providerUid);

            userAttributes = kakaoAccount;

        } else if ("naver".equals(provider)) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");

            providerUid = String.valueOf(response.get("id"));
            email = (String) response.get("email");
            nickname = (String) response.get("name");

            // 반환 키로 사용할 필드를 userAttributes에 넣어줘야 함
            response.put("nickname", nickname); // UI용
            response.put("email", email); // 로그인 처리 키
            response.put("provider", provider);
            response.put("providerUid", providerUid);

            userAttributes = response;

        } else {
            throw new OAuth2AuthenticationException("UNSUPPORTED_PROVIDER");
        }

        // 1) providerUid로 연결된 소셜 계정 찾기
        MemberVo linked = memberService.findByProviderUid(provider, providerUid);
        if (linked != null) {
            return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + linked.getRole())),
                userAttributes,
                "nickname"
            );
        }

        // 2) 연결된 계정이 아니면 email로 기존 web 회원 존재 확인
        MemberVo webMember = memberService.findWebMemberByEmail(email);
        if (webMember != null) {
            
            ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                HttpSession session = req.getSession(true);

                Map<String, Object> pending = new java.util.HashMap<>();
                pending.put("email", email);
                pending.put("provider", provider);
                pending.put("providerUid", providerUid);
                pending.put("nickname", nickname);
                
                session.setAttribute("PENDING_SOCIAL", pending);
            }

            throw new OAuth2AuthenticationException(new OAuth2Error("LINK_REQUIRED"), "LINK_REQUIRED");
        }

        // 3) 완전 신규면 소셜 회원 생성
        memberService.createSocialMember(email, nickname, provider, providerUid);
        MemberVo created = memberService.findByProviderUid(provider, providerUid);

        String role = (created != null && created.getRole() != null) ? created.getRole() : "USER";

        return new DefaultOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role)),
            userAttributes,
            "nickname"
        );
    }
}
