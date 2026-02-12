package com.diasec.diasec_backend.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.transaction.annotation.Transactional;

import com.diasec.diasec_backend.vo.OrderItemsVo;
import com.diasec.diasec_backend.vo.OrderVo;

@Mapper
public interface OrderMapper {
    
    // orders 테이블에 주문 저장
    void insertOrder(OrderVo orderVo);

    // order_items 테이블에 주문 아이템 목록 저장
    void insertOrderItem(@Param("oid") Long oid, @Param("item") OrderItemsVo item);

    // @유저 사용한 적립금 적립@
    void increaseCredit(@Param("id") String memberId, @Param("credit") int credit);

    // @유저 사용한 적립금 차감@
    void decreaseCredit(@Param("id") String memberId, @Param("credit") int credit);

    // 날짜, 타입 필터로 값 가져오기
    List<OrderVo> selectOrderListWithFilter(@Param("id") String id, @Param("startDate") String startDate, @Param("endDate") String endDate, @Param("status") String status);

    // itemId로 oid 조회
    Long selectOidByItemId(@Param("itemId") Long itemId);
    

    // oid로 주문정보 + 주문상품 목록 조회
    OrderVo selectOrderByOid(@Param("oid") Long oid);

    // 3. 상세페이지로 들어갈 itemId 개별 주문 상품 조회
    OrderItemsVo selectOrderItemById(@Param("itemId") Long itemId);

    // order_items 아이템 목록 가져오기 (orders에 들어갈)
    List<OrderItemsVo> selectOrderItems(Long oid);
 
    // 주문 취소
    void cancelAllOrderItems(@Param("oid") Long oid);

    // 주문 취소 요청 ( 결제 후 )
    void updateOrderItemsStatus(Long oid, String status);

    // 주문 반품 신청
    boolean updateClaimInfo(OrderItemsVo vo);

    // 주문 삭제
    // void deleteOrderItemsByOid(Long oid);
    void deleteOrderByOid(Long oid);

    void deleteOrdersById(String id);

    // 비회원 주문 비밀번호 재설정
    void updateGuestPassword(@Param("oid") Long oid, @Param("encodedPw") String encodedPw);

    int updateRetouchInfo(Long itemId, int retouchEnabled, String retouchTypes, String retouchNote);

    // 사이드바 상태 검색
    List<Map<String, Object>> selectOrderItemCountsByStatus();
}
