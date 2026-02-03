package com.sahtek.sahtekexpress.repository;

import com.sahtek.sahtekexpress.entities.OrderItem;
import com.sahtek.sahtekexpress.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProduct(Product product);
}
