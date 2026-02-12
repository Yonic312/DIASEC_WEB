package com.diasec.diasec_backend.controller;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.diasec.diasec_backend.service.CartService;
import com.diasec.diasec_backend.service.CreditService;
import com.diasec.diasec_backend.service.OrderService;
import com.diasec.diasec_backend.service.ProductService;
import com.diasec.diasec_backend.util.ImageUtil;
import com.diasec.diasec_backend.vo.CreditVo;
import com.diasec.diasec_backend.vo.OrderItemsVo;
import com.diasec.diasec_backend.vo.OrderVo;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "${custom.cors.origin}", allowCredentials = "true")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {
    
    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.access.url}")
    private String accessUrl;

    private final OrderService orderService;
    private final CartService cartService;
    private final CreditService creditService;
    private final ProductService productService;
    private final ImageUtil imageUtil;
    private final PasswordEncoder passwordEncoder;

    // OrderForm 주문 저장    
    @PostMapping("/insert")
    public ResponseEntity<?> insertOrder(@RequestBody OrderVo ordervo) {
        try {
            // 주문 저장 전에 상품 판매량 1 올리기
            for (int i = 0; i < ordervo.getItems().size(); i++) {
                productService.updateProductSales(ordervo.getItems().get(i).getPid());
            }

            // 주문중 하나라도 customFrames인 항목이 있는지 확인
            boolean hasCustomFrames = ordervo.getItems().stream()
                .anyMatch(item -> "customFrames".equals(item.getCategory()));

            if (hasCustomFrames) {
                for (OrderItemsVo item : ordervo.getItems()) {
                    // 맞춤액자 만 for문을 돌림
                    if ("customFrames".equals(item.getCategory())) {
                        // 클라이언트에서 넘어온 base64 파일 가져옴
                        String base64 = item.getThumbnail();

                        // 넘어온 파일 유효성 검사
                        if (base64 != null && base64.startsWith("data:image")) {
                            String[] parts = base64.split(",");
                            String metadata = parts[0];
                            String base64Data = parts[1];

                            String extension = "jpg";
                            // 이미지 확장자를 추출해서 png라면 png로 저장
                            if (metadata.contains("png")) {
                                extension = "png";
                            } else if (metadata.contains("jpeg")) {
                                extension = "jpg";
                            }

                            // ImageUtil 메서드 사용하여 저장
                            String imageUrl = imageUtil.saveBase64Image(base64Data, extension, "customFrames");
                            item.setThumbnail(imageUrl);
                        }
                    }
                }
            }

            // 비회원 비밀번호 암호화
            if (ordervo.getGuestPassword() != null && !ordervo.getGuestPassword().isBlank()) {
                String encodedPw = passwordEncoder.encode(ordervo.getGuestPassword());
                ordervo.setGuestPassword(encodedPw);
            }

            orderService.insertOrder(ordervo);
            return ResponseEntity.ok(Map.of("success", true,
                                            "oid", ordervo.getOid()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 주문 완료시 유저의 카트 목록 정리
    @PostMapping("/deleteList")
    public  ResponseEntity<?> deleteCartList(@RequestBody Map<String, Object> body) {
        String id = (String) body.get("id");
        List<Integer> cidList = (List<Integer>) body.get("cidList");

        try {
            cartService.deleteCartItems(id, cidList);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 주문내역 조회 리스트 가져오기
    @PostMapping("/list")
    public List<OrderVo> getOrderList(@RequestBody Map<String, String> body) {
        String id = body.get("id");
        String startDate = body.get("startDate");
        String endDate = body.get("endDate");
        String status = body.get("status");

        return orderService.selectOrderListWithFilter(id, startDate, endDate, status);
    }

    // 주문내역 상세조회 (개별)
    @GetMapping("detail/{itemId}")
    public OrderVo getOrderInfoDetail(@PathVariable Long itemId) {
        return orderService.selectOrderInfoByItemId(itemId);
    }

    // 주문내역 상세조회 (주문별 전체)
    @GetMapping("/detail/oid/{oid}")
    public OrderVo getOrderDetail(@PathVariable Long oid) {
        return orderService.selectOrderByOid(oid);
    }

    // 주문내역 전체 취소
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelOrderItem(@RequestBody Map<String, Object> body) {
        try {
            Long oid = Long.parseLong(body.get("oid").toString());
            String id = String.valueOf(body.get("id"));
            int usedCredit = (Integer)body.get("usedCredit");

            // 전체 취소 처리
            orderService.cancelAllOrderItems(oid);

            // 크레딧 반환
            if (usedCredit > 0) {
                CreditVo creditVo = new CreditVo();
                creditVo.setId(id);
                creditVo.setAmount(usedCredit);
                creditVo.setType("적립");
                creditVo.setDescription("주문 취소");
                creditVo.setOid(oid);
                
                creditService.insertCreditHistory(creditVo);
            }

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/cancelRequest")
    public ResponseEntity<?> requestCancelOrder(@RequestBody Map<String, Object> body) {
        Long oid = Long.parseLong(body.get("oid").toString());
        try {
            orderService.requestCancelOrder(oid);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 주문 반품 신청
    @PostMapping("/claim")
    public ResponseEntity<?> handleReturnRequest(@RequestBody OrderItemsVo vo) {
        boolean success = orderService.processClaim(vo);
        return ResponseEntity.ok(Map.of("success", success));
    }

    // 주문내역 삭제
    @PostMapping("/delete")
    public ResponseEntity<?> deleteOrder(@RequestBody Map<String, Object> body) {
        try {
            Long oid = Long.parseLong(body.get("oid").toString());
            List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

            for (Map<String, Object> item : items) {
                String category = (String) item.get("category");
                String thumbnail = (String) item.get("thumbnail");

                if ("customFrames".equals(category) && thumbnail != null && !thumbnail.isBlank()) {
                    imageUtil.deleteImage(thumbnail);
                }
            }

            orderService.deleteOrder(oid);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 비회원 조회
    @PostMapping("/guest-search")
    public ResponseEntity<?> guestSearch(@RequestBody Map<String, String> req) {
        Long oid = Long.valueOf(req.get("oid"));
        String guestPassword = req.get("guestPassword");

        try {
            OrderVo order = orderService.selectOrderByOid(oid);

            if (order == null || order.getGuestPassword() == null) {
                return ResponseEntity.ok(Map.of("success", false, "message", "주문을 찾을 수 없습니다."));
            }

            if (!passwordEncoder.matches(guestPassword, order.getGuestPassword())) {
                return ResponseEntity.ok(Map.of("success", false, "message", "비밀번호가 일치하지 않습니다."));
            }

            return ResponseEntity.ok(Map.of("success", true, "order", order));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 비회원 주문 비밀번호 재설정
    @PostMapping("/guest-reset-password")
    public ResponseEntity<?> resetGuestPassword(@RequestBody Map<String, String> req) {
        try {
            Long oid = Long.valueOf(req.get("oid"));
            String phone = req.get("phone");

            // 주문 확인
            OrderVo order = orderService.selectOrderByOid(oid);
            if (order == null || !phone.equals(order.getRecipientPhone())) {
                return ResponseEntity.ok(Map.of("success", false, "message", "주문번호 또는 휴대폰 번호가 일치하지 않습니다."));
            }

            // 임시 비밀번호 생성 (6자리 숫자)
            String newPassword = String.valueOf((int)(Math.random() * 900000) + 100000);

            // 암호화 후 DB 업데이트
            String encodedPw = passwordEncoder.encode(newPassword);
            orderService.updateGuestPassword(oid, encodedPw);

            // 프론트에 전달 (-> 프론트에서 고객 안내 or SMS 발송)
            return ResponseEntity.ok(Map.of("success", true, "newPassword", newPassword));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 맞춤액자 보정정보 수정 (입금대기/결제완료/배송준비중만 허용)
    @PostMapping("/update-retouch")
    public ResponseEntity<?> updateRetouch(@RequestBody Map<String, Object> body) {
        try {
            Long itemId = Long.parseLong(body.get("itemId").toString());
            int retouchEnabled = Integer.parseInt(body.get("retouchEnabled").toString());
            String retouchTypes = body.get("retouchTypes") == null ? null : body.get("retouchTypes").toString();
            String retouchNote = body.get("retouchNote") == null ? null : body.get("retouchNote").toString();

            // enabled=0이면 나버지 null  처리
            if (retouchEnabled == 0) {
                retouchTypes = null;
                retouchNote = null;
            }

            boolean success = orderService.updateRetouchInfo(itemId, retouchEnabled, retouchTypes, retouchNote);

            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/admin/count-by-status")
    public ResponseEntity<?> countByStatus() {
        try {
            return ResponseEntity.ok(orderService.selectOrderItemCountsByStatus());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}