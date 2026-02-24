package com.diasec.diasec_backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.diasec.diasec_backend.dao.AdminOrderMapper;
import com.diasec.diasec_backend.util.ImageUtil;
import com.diasec.diasec_backend.vo.CreditVo;
import com.diasec.diasec_backend.vo.OrderItemsVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminOrderService {
    
    private final AdminOrderMapper adminOrderMapper;
    private final ImageUtil imageUtil;
    private final OrderService orderService;
    private final CreditService creditService;

    // 상태별 주문 리스트 조회
    public List<OrderItemsVo> getOrderItemsByStatus(String status, String startDate, String endDate, String keyword, String category) {
        return adminOrderMapper.selectOrderItemsByStatus(status, startDate, endDate, keyword, category);
    }

    // 상태 변경
    public boolean updateOrderItemStatus(Long itemId, String orderStatus) {
        return adminOrderMapper.updateOrderItemStatus(itemId, orderStatus) > 0;
    }

    // 상세 정보에서 배송 정보 업데이트
    public boolean updateOrderDetail(Long itemId, String trackingCompany, String trackingNumber,
                                    String bankName, String accountNumber, String accountHolder) {
        return adminOrderMapper.updateOrderDetail(itemId, trackingCompany, trackingNumber, bankName, accountNumber, accountHolder);
    }

    // 리스 정보 수정
    public void updateLeasePeriod(Long itemId, String leaseStart, String leaseEnd) {
        adminOrderMapper.updateLeasePeriod(itemId, leaseStart, leaseEnd);
    }

    // 어드민페이지 맞춤액자 이미지 삭제
    public boolean deleteCustomImage(Long itemId) {
        // itemId로 thumbnail 조회
        String thumbnail = adminOrderMapper.selectThumbnailByItemId(itemId);
        System.out.println("썸네일 : " + thumbnail);

        // thumbnail이 없으면 이미 삭제된 상태로 처리
        if (thumbnail == null || thumbnail.isBlank()) {
            // DB도 확실히 NULL로 맞춰주고 true 반환 (멱등)
            adminOrderMapper.clearThumbnail(itemId);
            return true;
        }

        // 실제 파일 삭제
        imageUtil.deleteImage(thumbnail);

        //  DB thumbnail Null 처리
         return adminOrderMapper.clearThumbnail(itemId) > 0;
    }

    @Transactional
    public Map<String, Object> updateStatusWithSideEffects(Long itemId, String newStatus, String id, int usedCredit, Long oid) {
        
        // System.out.println("refund-check: status=" + newStatus + ", usedCredit=" + usedCredit + ", id=" + id + ", oid=" + oid);
        // int updated = adminOrderMapper.markCreditRefundedIfNotYet(itemId);
        // System.out.println("credit_refunded update rows=" + updated);

        boolean success = updateOrderItemStatus(itemId, newStatus);
        if (!success) return Map.of("success", false);

        int refundedAmount = 0;
        int deletedClaimFiles = 0;

        // 완료 상태에서 클레임 이미지 삭제
        if ("교환완료".equals(newStatus) || "환불완료".equals(newStatus)) {
            deletedClaimFiles = orderService.deleteClaimFiles(itemId);
        }

        // 환불완료일때 적립금 반환
        if ("환불완료".equals(newStatus) && usedCredit > 0 && id != null && oid != null) {
            int updated = adminOrderMapper.markCreditRefundedIfNotYet(itemId);

            if (updated == 1) {
                CreditVo creditVo = new CreditVo();
                creditVo.setId(id);
                creditVo.setAmount(usedCredit);
                creditVo.setType("적립");
                creditVo.setDescription(newStatus);
                creditVo.setOid(oid);
                creditService.insertCreditHistory(creditVo);
                refundedAmount = usedCredit;
            }
        }

        return Map.of(
            "success", true,
            "refundedAmount", refundedAmount,
            "deletedClaimFiles", deletedClaimFiles
        );
    }
}
