package com.sahtek.sahtekexpress.controller;

import com.sahtek.sahtekexpress.dto.OrderDTO;
import com.sahtek.sahtekexpress.dto.OrderItemDTO;
import com.sahtek.sahtekexpress.entities.Order;
import com.sahtek.sahtekexpress.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sahtek_db/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<OrderDTO> dtos = orders.stream()
                .map(this::convertOrderToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok().body("Commande supprimée avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body("Le statut est requis");
        }
        try {
            Order updatedOrder = orderService.updateStatus(id, status);
            return ResponseEntity.ok(convertOrderToDTO(updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

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

        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    
                    if (item.getProduct() != null) {
                        itemDTO.setProductId(item.getProduct().getId());
                        itemDTO.setProductName(item.getProduct().getName());
                        String img = item.getProduct().getImageUrl();
                        itemDTO.setProductImage((img != null && !img.isEmpty()) ? img : "default.png");
                    } else {
                        itemDTO.setProductId(0L);
                        itemDTO.setProductName("Produit supprimé");
                        itemDTO.setProductImage("default.png");
                    }
                    
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setUnitPrice(item.getUnitPrice());
                    itemDTO.setSubtotal(item.getUnitPrice() * item.getQuantity());
                    return itemDTO;
                })
                .collect(Collectors.toList());
        
        dto.setItems(itemDTOs);
        return dto;
    }
}
