package com.diasec.diasec_backend.service;

import java.io.File;
import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import com.diasec.diasec_backend.dao.InquiryMapper;
import com.diasec.diasec_backend.util.ImageUtil;
import com.diasec.diasec_backend.vo.InquiryVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InquiryService {
    
    private final InquiryMapper inquiryMapper;
    private final ImageUtil imageUtil;

    // 문의사항 등록 ( 상품별 문의 )
    public void insertInquiry (InquiryVo vo) {
        inquiryMapper.insertInquiry(vo);
    }

    // 문의사항 이미지 등록
    public void insertInquiryImage (Long iid, String url) {
        InquiryVo vo = new InquiryVo();
        vo.setIid(iid);
        vo.setImageUrl(url);
        inquiryMapper.insertInquiryImage(vo);
    }

    // 문의사항 리스트 가져오기
    public List<InquiryVo> getInquiriesByProduct(Long pid) {
        return inquiryMapper.selectInquiriesByPid(pid);
    }

    public void registerAnswer(Long iid, String adminId, String content) {

        // 답변 등록 (inquiry_replies 테이블)
        inquiryMapper.insertInquiryReply(iid, adminId, content);

        // 문의 상태만 업데이트
        inquiryMapper.updateInquiryStatus(iid, "답변완료");

    }

    // 문의 답변 수정
    public void updateReply(Long rid, String content) {
        inquiryMapper.updateInquiryReply(rid, content);
    }

    // 문의 답변 삭제
    public void deleteReply(Long rid) {
        Long iid = inquiryMapper.getIidByRid(rid);
        inquiryMapper.deleteInquiryReply(rid);
        inquiryMapper.updateInquiryStatus(iid, "답변대기");
    }

    // 고객 마이페이지 문의사항 가져오기
    public List<InquiryVo> getInquiryById (String id) {
        return inquiryMapper.getInquiryById(id);
    }

    // 관리자 전용 전체 문의 목록 가져오기
    public List<InquiryVo> getAllInquiries () {
        return inquiryMapper.getAllInquiries();
    }

    // 관리자 페이지 문의 삭제
    public void deleteInquiry(Long iid) {
        // 1. 이미지 URL들 먼저 조회
        List<String> imageUrls = inquiryMapper.selectInquiryImageUrls(iid);

        // 2. 실제 이미지 파일 삭제
        for (String url : imageUrls) {
            imageUtil.deleteImage(url);
        }

        // 3. DB에서 이미지 레코드 삭제
        inquiryMapper.deleteInquiryImages(iid);

        // 4. 답변 먼저 삭제 (FK 제약 방지용)
        inquiryMapper.deleteReplyByIid(iid);

        // 5. 문의글 삭제
        inquiryMapper.deleteInquiry(iid);
    }

    // 미답변 개수 가져오기
    public Long selectUnanswered() {
        return inquiryMapper.selectUnanswered();
    }
}
