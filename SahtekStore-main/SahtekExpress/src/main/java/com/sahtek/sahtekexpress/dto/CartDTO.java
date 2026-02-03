package com.sahtek.sahtekexpress.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDTO {
    private Long id;
    private Long userId;
    private Double totalPrice;
    private List<CartItemDTO> items;
}

