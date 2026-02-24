package com.diasec.diasec_backend.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.diasec.diasec_backend.dao.CreditMapper;
import com.diasec.diasec_backend.dao.OrderMapper;
import com.diasec.diasec_backend.util.ImageUtil;
import com.diasec.diasec_backend.vo.CreditVo;
import com.diasec.diasec_backend.vo.OrderItemClaimFileVo;
import com.diasec.diasec_backend.vo.OrderItemsVo;
import com.diasec.diasec_backend.vo.OrderVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderMapper orderMapper;
    private final CreditService creditService;
    private final ImageUtil imageUtil;

    private static final int MAX_FILES = 5;
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    // OrderForm 주문 저장
    @Transactional
    public void insertOrder(OrderVo orderVo) {
        // 1. orders 테이블에 주문 저장 (oid 생성)
        orderMapper.insertOrder(orderVo);

        // 2. order_items 테이블에 주문 아이템 리스트 저장
        List<OrderItemsVo> items = orderVo.getItems();
        for (OrderItemsVo item : items) {
            orderMapper.insertOrderItem(orderVo.getOid(), item);
        }

        // 3. 적립금 차감
        if (orderVo.getUsedCredit() > 0) {
            // 사용 내역 기록 추가 (주문)
            CreditVo usedCredit = new CreditVo();
            usedCredit.setId(orderVo.getId());
            usedCredit.setType("사용");
            usedCredit.setAmount(orderVo.getUsedCredit());
            usedCredit.setDescription("주문 결제 사용");
            usedCredit.setOid(orderVo.getOid());

            creditService.insertCreditHistory(usedCredit);
        }
    }

    // 주문내역 조회 리스트 가져오기 (주문 목록 날짜, 타입)
    public List<OrderVo> selectOrderListWithFilter(String id, String startDate, String endDate, String status) {
        List<OrderVo> orders = orderMapper.selectOrderListWithFilter(id, startDate, endDate, status);
        
        for (OrderVo order : orders) {
            List<OrderItemsVo> items = orderMapper.selectOrderItems(order.getOid());
            order.setItems(items);
        }
        
        return orders;
    }

    // 주문목록 상세페이지
    public Long getOidByItemId(Long itemId) {
        return orderMapper.selectOidByItemId(itemId);
    }
    public OrderVo selectOrderByOid(Long oid) {
        OrderVo order = orderMapper.selectOrderByOid(oid);
        List<OrderItemsVo> items = orderMapper.selectOrderItems(oid);

        for (OrderItemsVo item : items) {
            item.setClaimFiles(orderMapper.selectOrderItemClaimFiles(item.getItemId()));
        }

        order.setItems(items);
        return order;
    }

    // 주문목록 상세페이지 (order_items 하나씩 불러오기)
    public OrderVo selectOrderInfoByItemId(Long itemId) {
        // 1. itemId로 oid 조회
        Long oid = orderMapper.selectOidByItemId(itemId);
        if (oid == null) return null;

        // 2. oid로 주문정보 + 주문상품 목록 조회
        OrderVo order = orderMapper.selectOrderByOid(oid);

        // 3. 상세페이지로 들어갈 itemId 개별 주문 상품 조회
        OrderItemsVo singleitem = orderMapper.selectOrderItemById(itemId);

        // 3.1 주문 상품에 클레임 이미지 정보 조회
        List<OrderItemClaimFileVo> files = orderMapper.selectOrderItemClaimFiles(itemId);
        singleitem.setClaimFiles(files);

        // 4. 주문내역 items 리스트에 order_items 테이블 매핑
        order.setItems(List.of(singleitem));
        return order;
    }

    // 주문 취소
    @Transactional
    public void cancelAllOrderItems(Long oid) {
        orderMapper.cancelAllOrderItems(oid);
    }

    // 주문 취소 요청 ( 결제 후 )
    public void requestCancelOrder(Long oid) {
        orderMapper.updateOrderItemsStatus(oid, "취소요청");
    }

    // 주문 반품 신청
    public boolean processClaim(OrderItemsVo vo) {
        return orderMapper.updateClaimInfo(vo);
    }

    // 주문 삭제
    public void deleteOrder(Long oid) {
        // orderMapper.deleteOrderItemsByOid(oid);
        orderMapper.deleteOrderByOid(oid);
    }

    // 비회원 주문 비밀번호 재설정
    public void updateGuestPassword(Long oid, String encodedPw) {
        orderMapper.updateGuestPassword(oid, encodedPw);
    }

    public boolean updateRetouchInfo(Long itemId, int retouchEnabled, String retouchTypes, String retouchNote) {
        return orderMapper.updateRetouchInfo(itemId, retouchEnabled, retouchTypes, retouchNote) > 0;
    }

    public List<Map<String, Object>> selectOrderItemCountsByStatus() {
        return orderMapper.selectOrderItemCountsByStatus();
    }

    public void saveClaimImages(long itemId, List<MultipartFile> images) throws IOException {
        
        if (images == null || images.isEmpty()) {
            return;
        }

        if (images.size() > MAX_FILES) {
            throw new IllegalArgumentException("이미지는 최대" + MAX_FILES + "장까지 가능합니다.");
        }

        int order = 0;
        for (MultipartFile f : images) {
            if (f == null || f.isEmpty()) continue;

            if (f.getSize() > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("파일은 5MB 이하만 가능합니다: " + f.getOriginalFilename());
            }

            String url = imageUtil.saveImage(f, "orderClaim");

            OrderItemClaimFileVo vo = new OrderItemClaimFileVo();
            vo.setItemId(itemId);
            vo.setFileUrl(url);
            vo.setOriginalName(f.getOriginalFilename());
            vo.setFileSize(f.getSize());
            vo.setImgOrder(order++);

            orderMapper.insertOrderItemClaimFile(vo);
        }
    }

    @Transactional
    public int deleteClaimFiles(Long itemId) {
        // 1) DB에서 파일 목록 조회
        List<OrderItemClaimFileVo> files = orderMapper.selectOrderItemClaimFiles(itemId);

        // 2) 실제 파일 삭제
        if (files != null) {
            for (OrderItemClaimFileVo f : files) {
                if (f.getFileUrl() != null && !f.getFileUrl().isBlank()) {
                    imageUtil.deleteImage(f.getFileUrl());
                }
            }
        }

        // 3) DB 레코드 삭제
        return orderMapper.deleteOrderItemClaimFiles(itemId);
    }
}