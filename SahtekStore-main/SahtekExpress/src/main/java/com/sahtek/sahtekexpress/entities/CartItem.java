package com.sahtek.sahtekexpress.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne

    @JoinColumn(name = "cart_id")
    @ToString.Exclude
    @EqualsAndHashCode.Include
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @EqualsAndHashCode.Include
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 1;
}