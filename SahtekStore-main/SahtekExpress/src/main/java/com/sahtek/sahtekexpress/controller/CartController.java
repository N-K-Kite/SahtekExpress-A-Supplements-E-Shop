package com.sahtek.sahtekexpress.controller;

import com.sahtek.sahtekexpress.dto.*;
import com.sahtek.sahtekexpress.entities.*;
import com.sahtek.sahtekexpress.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sahtek_db/api/carts")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    // 1. Obtenir le panier d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long userId) {
        try {
            Cart cart = cartService.getCartWithItems(userId);
            CartDTO cartDTO = convertToDTO(cart);
            return ResponseEntity.ok(cartDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 2. Ajouter un produit au panier
    @PostMapping("/user/{userId}/add")
    public ResponseEntity<?> addToCart(
            @PathVariable Long userId,
            @RequestBody AddToCartRequest request) {
        try {
            Cart cart = cartService.addToCart(userId, request.getProductId(), request.getQuantity());
            CartDTO cartDTO = convertToDTO(cart);
            return ResponseEntity.ok(cartDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // 3. Mettre à jour la quantité
    @PutMapping("/user/{userId}/item/{productId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestBody UpdateCartRequest request) {
        try {
            Cart cart = cartService.updateCartItem(userId, productId, request.getQuantity());
            CartDTO cartDTO = convertToDTO(cart);
            return ResponseEntity.ok(cartDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // 4. Supprimer un produit du panier
    @DeleteMapping("/user/{userId}/item/{productId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        try {
            Cart cart = cartService.removeFromCart(userId, productId);
            CartDTO cartDTO = convertToDTO(cart);
            return ResponseEntity.ok(cartDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // 5. Vider le panier
    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            Cart cart = cartService.clearCart(userId);
            CartDTO cartDTO = convertToDTO(cart);
            return ResponseEntity.ok(cartDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // 6. Passer commande
    @PostMapping("/user/{userId}/checkout")
    public ResponseEntity<?> checkout(@PathVariable Long userId, @RequestBody CheckoutRequest checkoutRequest) {
        try {
            Order order = cartService.checkout(userId, checkoutRequest);
            OrderDTO orderDTO = convertOrderToDTO(order);
            return ResponseEntity.ok(orderDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }   
    }

    // Méthode pour convertir Cart en CartDTO
    private CartDTO convertToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setTotalPrice(cart.getTotalPrice());

        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }

    // Méthode pour convertir CartItem en CartItemDTO
    private CartItemDTO convertItemToDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductPrice(item.getProduct().getPrice());
        dto.setProductImage(item.getProduct().getImageUrl());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getProduct().getPrice() * item.getQuantity());
        return dto;
    }

    // Méthode pour convertir Order en OrderDTO
    private OrderDTO convertOrderToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUser().getId());
        dto.setFirstName(order.getFirstName());
        dto.setLastName(order.getLastName());
        dto.setEmail(order.getEmail());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setStatus(order.getStatus().toString());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setShippingCost(order.getShippingCost());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setCity(order.getCity());
        dto.setZipCode(order.getZipCode());
        
        if (order.getPaymentMethod() != null) {
            dto.setPaymentMethod(order.getPaymentMethod().toString());
        }
        if (order.getPaymentStatus() != null) {
            dto.setPaymentStatus(order.getPaymentStatus().toString());
        }
        
        dto.setPaymentUrl(order.getPaymentUrl());

        List<com.sahtek.sahtekexpress.dto.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    com.sahtek.sahtekexpress.dto.OrderItemDTO itemDto = new com.sahtek.sahtekexpress.dto.OrderItemDTO();
                    itemDto.setProductId(item.getProduct().getId());
                    itemDto.setProductName(item.getProduct().getName());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setSubtotal(item.getUnitPrice() * item.getQuantity());
                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}