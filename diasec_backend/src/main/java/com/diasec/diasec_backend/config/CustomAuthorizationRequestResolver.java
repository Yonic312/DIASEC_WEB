package com.diasec.diasec_backend.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import jakarta.servlet.http.HttpServletRequest;

// ✅ 새로 만든 클래스 (Spring Security의 기본 resolver 커스터마이징)
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver defaultResolver;

    // 🔸 기본 요청 해석기 초기화
    public CustomAuthorizationRequestResolver(ClientRegistrationRepository repo) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest original = defaultResolver.resolve(request);
        return customizeRequest(request, original); // 🔥 URI 기반 분기 로직 사용
    }


    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String registrationId) {
        OAuth2AuthorizationRequest original = defaultResolver.resolve(request, registrationId);
        if (original == null) return null;

        Map<String, Object> extraParams = new HashMap<>(original.getAdditionalParameters());

        if ("kakao".equals(registrationId)) {
            extraParams.put("prompt", "login");
        } else if ("naver".equals(registrationId)) {
            extraParams.put("auth_type", "reprompt"); // ✅ 네이버용 추가!
        }

        System.out.println("✅ 요청 플랫폼: " + registrationId + ", 파라미터: " + extraParams);

        return OAuth2AuthorizationRequest.from(original)
                .additionalParameters(extraParams)
                .build();
    }


    // ✅ 소셜 플랫폼에 따라 파라미터 다르게 설정하는 메서드
    private OAuth2AuthorizationRequest customizeRequest(HttpServletRequest request, OAuth2AuthorizationRequest original) {
        if (original == null) return null;

        Map<String, Object> extraParams = new HashMap<>(original.getAdditionalParameters());

        String uri = request.getRequestURI();

        if (uri.contains("kakao")) {
            extraParams.put("prompt", "login"); // 🔥 카카오용
        } else if (uri.contains("naver")) {
            extraParams.put("auth_type", "reprompt"); // 🔥 네이버용
        }

        System.out.println("✅ 커스터마이징 URL: " + uri);
        System.out.println("✅ 파라미터 설정됨: " + extraParams);

        return OAuth2AuthorizationRequest.from(original)
                .additionalParameters(extraParams)
                .build();
    }

}

