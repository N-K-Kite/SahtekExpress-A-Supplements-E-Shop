package com.sahtek.sahtekexpress.repository;

import com.sahtek.sahtekexpress.entities.Order;
import com.sahtek.sahtekexpress.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByUserId(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
}