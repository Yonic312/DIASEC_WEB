package com.diasec.diasec_backend.vo;

import java.util.List;

import lombok.Data;

@Data
public class OrderItemsVo {
    private Long itemId;
    private Long oid;
    private Long cid;
    private Long pid;
    private String category;
    private String title;
    private int quantity;
    private int deposit;
    private int price;
    private String period;
    private int finalPrice;
    private String size;
    private String thumbnail;
    private String orderStatus;
    private String trackingNumber;
    private String trackingCompany;

    private String leaseStart;
    private String leaseEnd;

    // 반품
    private String reason;
    private String detail;
    private String bankName;
    private String accountNumber;
    private String accountHolder;

    // 보정
    private Integer retouchEnabled;
    private String retouchTypes;
    private String retouchNote;

    // 이미지
    private List<OrderItemClaimFileVo> claimFiles;

    // Join
    private String id;
    private String createdAt;
    private int usedCredit;

    private boolean reviewed; // 필수!
}
