package com.sahtek.sahtekexpress.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(unique = true)
    private String orderNumber;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Informations Personnelles au moment de la commande
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private Double totalAmount;

    private Double shippingCost;

    @Column(nullable = false)
    private String shippingAddress;

    private String city;
    private String zipCode;

    @Column(nullable = false)
    private LocalDateTime orderDate = LocalDateTime.now();

    private LocalDateTime deliveryDate;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String paymentUrl;
    private String transactionId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @ToString.Exclude
    private Set<OrderItem> orderItems = new HashSet<>();
}