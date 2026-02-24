package com.diasec.diasec_backend.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.diasec.diasec_backend.vo.OrderItemsVo;

@Mapper
public interface AdminOrderMapper {
    
    // 상태별 주문 리스트 조회
    List<OrderItemsVo> selectOrderItemsByStatus(@Param("status") String status, @Param("startDate") String startDate,
                                                @Param("endDate") String endDate, @Param("keyword") String keyword, @Param("category") String category);

    // 상태 변경
    int updateOrderItemStatus(@Param("itemId") Long itemId, @Param("orderStatus") String orderStatus);

    // 상세 정보에서 배송 정보 업데이트
    boolean updateOrderDetail(@Param("itemId") Long itemId,
                            @Param("trackingCompany") String trackingCompany,
                            @Param("trackingNumber") String trackingNumber,
                            @Param("bankName") String bankName,
                            @Param("accountNumber") String accountNumber,
                            @Param("accountHolder") String accountHolder);

    // 리스정보 수정
    void updateLeasePeriod(@Param("itemId") Long itemId, @Param("leaseStart") String leaseStart, @Param("leaseEnd") String leaseEnd);

    String selectThumbnailByItemId(@Param("itemId") Long itemId);
    int clearThumbnail(@Param("itemId") Long itemId);

    int markCreditRefundedIfNotYet(Long itemId);
}
