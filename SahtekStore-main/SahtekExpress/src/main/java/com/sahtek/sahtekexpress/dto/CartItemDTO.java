package com.sahtek.sahtekexpress.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Double productPrice;
    private String productImage;
    private Integer quantity;
    private Double subtotal;
}

