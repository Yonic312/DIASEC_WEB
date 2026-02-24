package com.diasec.diasec_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.diasec.diasec_backend.service.AdminOrderService;
import com.diasec.diasec_backend.service.CreditService;
import com.diasec.diasec_backend.service.OrderService;
import com.diasec.diasec_backend.vo.CreditVo;
import com.diasec.diasec_backend.vo.OrderItemsVo;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "${custom.cors.origin}", allowCredentials = "true")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminOrderController {
    
    private final AdminOrderService adminOrderService;
    private final CreditService creditService;
    private final OrderService orderService;

    // 주문 상태 목록 가져오기
    @PostMapping("/orders")
    public List<OrderItemsVo> getOrdersByStatus(@RequestBody Map<String, String> request) {
        String status = request.get("status");
        String startDate = request.get("startDate");
        String endDate = request.get("endDate");
        String keyword = request.get("keyword");
        String category = request.get("category");
        return adminOrderService.getOrderItemsByStatus(status, startDate, endDate, keyword, category);
    }

    // 목록에서 진행상태 업데이트
    @PostMapping("/order/update-status")
    public Map<String, Object> updateStatus(@RequestBody Map<String, Object> request) {
        System.out.println("update-status body = " + request);

        Object itemIdObj = request.get("itemId");
        Object statusObj = request.get("orderStatus");
        if (statusObj == null) {
            statusObj = request.get("newStatus");
        }

        if (itemIdObj == null || statusObj == null) {
            return Map.of(
                "success", false,
                "message", "필수값 누락: itemId 또는 newStatus",
                "receivedKeys", request.keySet()
            );
        }
        
        Long itemId = Long.valueOf(String.valueOf(itemIdObj));
        String newStatus = String.valueOf(statusObj);

        String id = request.get("id") == null ? null : String.valueOf(request.get("id"));
        int usedCredit = request.get("usedCredit") == null ? 0 : Integer.valueOf(String.valueOf(request.get("usedCredit")));
        Long oid = request.get("oid") == null ? null : Long.valueOf(String.valueOf(request.get("oid")));

        return adminOrderService.updateStatusWithSideEffects(itemId, newStatus, id, usedCredit, oid);

        // boolean success = adminOrderService.updateOrderItmeStatus(itemId, orderStatus);

        // // 교환 완료거나 환불 완료일때 적립금 반환
        // if (success && ("환불완료".equals(orderStatus))) {
        //     System.out.println("교환, 환불 적립금 되돌리기!");

        //     // 사용 적립금이 0원 이상이라면
        //     if ((Integer)request.get("usedCredit") > 0) {
        //         CreditVo creditVo = new CreditVo();
        //         creditVo.setId(String.valueOf(request.get("id")));
        //         creditVo.setAmount((Integer)request.get("usedCredit"));
        //         creditVo.setType("적립");
        //         creditVo.setDescription(String.valueOf(orderStatus));
        //         creditVo.setOid(Long.valueOf(String.valueOf(request.get("oid"))));
                
        //         creditService.insertCreditHistory(creditVo);
        //     }
        // }
        // return Map.of("success", success);
    }

    // 상세 정보에서 배송 정보 업데이트
    @PostMapping("/order/update-detail")
    public Map<String, Object> updateOrderDetail(@RequestBody Map<String, Object> request) {
        Long itemId = Long.valueOf(request.get("itemId").toString());
        String trackingCompany = (String) request.get("trackingCompany");
        String trackingNumber = (String) request.get("trackingNumber");

        // 환불 정보는 optional
        String bankName = (String) request.getOrDefault("bankName", null);
        String accountNubmer = (String) request.getOrDefault("accountNubmer", null);
        String accountHolder = (String) request.getOrDefault("accountHolder", null);

        boolean success = adminOrderService.updateOrderDetail(
            itemId, trackingCompany, trackingNumber, bankName, accountNubmer, accountHolder
        );

        return Map.of("success", success);
    }

    // 리스정보 수정
    @PostMapping("/order/update-lease-period")
    public ResponseEntity<?> updateLeasePeriod(@RequestBody Map<String, Object> body) {
        try {
            Long itemId = Long.parseLong(body.get("itemId").toString());
            String leaseStart = (String) body.get("leaseStart");
            String leaseEnd = (String) body.get("leaseEnd");

            adminOrderService.updateLeasePeriod(itemId, leaseStart, leaseEnd);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/order/delete-custom-image")
    public ResponseEntity<?> deleteCustomImage(@RequestBody Map<String, Object> body) {
        try {
            Long itemId = Long.valueOf(body.get("itemId").toString());

            boolean success = adminOrderService.deleteCustomImage(itemId);

            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/order/delete-claim-files")
    public ResponseEntity<?> deleteClaimFiles(@RequestBody Map<String, Object> body) {
        try {
            Long itemId = Long.parseLong(body.get("itemId").toString());
            int deleted = orderService.deleteClaimFiles(itemId);
            return ResponseEntity.ok(Map.of("success", true, "deleted", deleted));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
