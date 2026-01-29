package com.diasec.diasec_backend.vo;

import java.util.List;

import lombok.Data;

@Data
public class OrderVo {
    private Long oid;
    private String id;
    private String ordererName;
    private String ordererPhone;
    private String email;
    private String recipient;
    private String postcode;
    private String address;
    private String detailAddress;
    private int usedCredit;
    private String paymentMethod;
    private String receiptType; // 현금영수증 [개인, 사업자]
    private int totalPrice;
    private int totalDeposit;
    private int deliveryFee;
    private int finalPrice;
    private String buyerRequest;
    private String deliveryMessage;
    private String recipientPhone;

    private String createdAt;

    private String depositor; // 입금자명 
    private String bankAccount; // 계좌
    private String receiptInfo;
    private String receiptMethod; // [휴대폰번호, 현금영수증카드]

    private String guestPassword;

    private List<OrderItemsVo> items;
}
