package com.sahtek.sahtekexpress.dto;

import com.sahtek.sahtekexpress.entities.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String shippingAddress;
    private String city;
    private String zipCode;
    private PaymentMethod paymentMethod;
}
