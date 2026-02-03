package com.sahtek.sahtekexpress.service;

import com.sahtek.sahtekexpress.dto.CheckoutRequest;
import com.sahtek.sahtekexpress.entities.*;
import com.sahtek.sahtekexpress.repository.CartItemRepository;
import com.sahtek.sahtekexpress.repository.CartRepository;
import com.sahtek.sahtekexpress.repository.ProductRepository;
import com.sahtek.sahtekexpress.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.sahtek.sahtekexpress.repository.OrderRepository orderRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PaymentService paymentService;

    // Créer ou récupérer le panier d'un utilisateur
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                    Cart cart = Cart.builder()
                            .user(user)
                            .totalPrice(0.0)
                            .build();

                    return cartRepository.save(cart);
                });
    }

    // Ajouter un produit au panier
    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("La quantité doit être supérieure à 0");
        }

        if (productId == null) {
            throw new RuntimeException("L'identifiant du produit (productId) ne peut pas être null");
        }

        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Vérifier le stock
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Stock insuffisant. Disponible: " + product.getStockQuantity());
        }

        // Chercher si le produit est déjà dans le panier
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        if (existingItem.isPresent()) {
            // Mettre à jour la quantité
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Ajouter nouveau produit
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        updateCartTotal(cart);
        return cartRepository.save(cart);
    }

    // Mettre à jour la quantité d'un produit dans le panier
    public Cart updateCartItem(Long userId, Long productId, Integer quantity) {
        if (quantity < 0) {
            throw new RuntimeException("La quantité ne peut pas être négative");
        }

        if (productId == null) {
            throw new RuntimeException("L'identifiant du produit (productId) ne peut pas être null");
        }

        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        if (quantity == 0) {
            // Supprimer l'article
            cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
            cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        } else {
            // Vérifier le stock
            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException("Stock insuffisant. Disponible: " + product.getStockQuantity());
            }

            // Mettre à jour la quantité
            CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé dans le panier"));

            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        updateCartTotal(cart);
        return cartRepository.save(cart);
    }

    // Supprimer un produit du panier
    public Cart removeFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);

        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));

        updateCartTotal(cart);
        return cartRepository.save(cart);
    }

    // Vider le panier
    public Cart clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);

        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cart.setTotalPrice(0.0);

        return cartRepository.save(cart);
    }

    // Obtenir le panier avec tous les détails
    public Cart getCartWithItems(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> getOrCreateCart(userId));
    }

    // Calculer le total du panier
    private void updateCartTotal(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
        cart.setTotalPrice(total);
    }

    // Passer la commande
    public Order checkout(Long userId, CheckoutRequest checkoutRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Cart cart = getCartWithItems(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Le panier est vide");
        }

        // Vérification du stock (Déjà existant)
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Stock insuffisant pour " + product.getName() + ". Disponible: " + product.getStockQuantity());
            }
        }

        // 2. Créer l'objet Order avec les détails du checkoutRequest
        Order order = Order.builder()
                .user(user)
                .orderNumber("ORD-" + System.currentTimeMillis())
                .status(OrderStatus.PENDING)
                .firstName(checkoutRequest.getFirstName())
                .lastName(checkoutRequest.getLastName())
                .email(checkoutRequest.getEmail())
                .phoneNumber(checkoutRequest.getPhoneNumber())
                .totalAmount(cart.getTotalPrice() + 10.0)
                .shippingCost(10.0) // Frais de port
                .shippingAddress(checkoutRequest.getShippingAddress())
                .city(checkoutRequest.getCity())
                .zipCode(checkoutRequest.getZipCode())
                .orderDate(java.time.LocalDateTime.now())
                .paymentMethod(checkoutRequest.getPaymentMethod() != null ? 
                              checkoutRequest.getPaymentMethod() : 
                              PaymentMethod.WAFA_CASH)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        // 3. Créer les OrderItems à partir des CartItems
        java.util.Set<OrderItem> orderItems = new java.util.HashSet<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getProduct().getPrice())
                    .build();
            orderItems.add(orderItem);

            // Mettre à jour les stocks
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }
        order.setOrderItems(orderItems);

        // 4. Sauvegarder la commande (Une première fois pour avoir l'ID)
        Order savedOrder = orderRepository.save(order);

        // 5. Générer le lien de paiement si nécessaire
        String paymentUrl = paymentService.generatePaymentLink(savedOrder);
        if (paymentUrl != null) {
            savedOrder.setPaymentUrl(paymentUrl);
            savedOrder = orderRepository.save(savedOrder);
        }

        // Collecter les noms des produits AVANT de vider le panier
        String productNames = cart.getItems().stream()
                .map(item -> item.getProduct().getName())
                .collect(java.util.stream.Collectors.joining(", "));

        // 6. Vider le panier
        clearCart(userId);

        // 7. Envoyer la notification SMS (réelle via Infobip)
        String phone = (checkoutRequest.getPhoneNumber() != null) ?
                       checkoutRequest.getPhoneNumber() : user.getPhone();

        if (phone != null && !phone.trim().isEmpty()) {
            notificationService.sendOrderConfirmationSms(phone, savedOrder.getOrderNumber(), savedOrder.getTotalAmount(), productNames);
        } else {
            System.out.println("⚠️ Aucun numéro de téléphone trouvé (ni dans la requête, ni dans le profil utilisateur). Le SMS n'a pas été envoyé.");
        }

        return savedOrder;
    }
}