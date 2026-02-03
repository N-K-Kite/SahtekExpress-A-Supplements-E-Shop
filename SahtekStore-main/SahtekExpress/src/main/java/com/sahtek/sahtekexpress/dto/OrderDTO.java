package com.sahtek.sahtekexpress.dto;

import lombok.Data;
import java.util.List;
@Data
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String status;
    private Double totalAmount;
    private Double shippingCost;
    private String shippingAddress;
    private String city;
    private String zipCode;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentUrl;
    private List<OrderItemDTO> items;
}

