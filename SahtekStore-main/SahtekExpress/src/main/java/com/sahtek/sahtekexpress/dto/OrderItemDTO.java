package com.sahtek.sahtekexpress.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;
}
