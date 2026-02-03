package com.sahtek.sahtekexpress.service;

import com.sahtek.sahtekexpress.entities.Order;
import com.sahtek.sahtekexpress.entities.OrderItem;
import com.sahtek.sahtekexpress.entities.OrderStatus;
import com.sahtek.sahtekexpress.entities.Product;
import com.sahtek.sahtekexpress.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductService productService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'ID : " + id));
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : Commande non trouvée avec l'ID : " + id);
        }
        orderRepository.deleteById(id);
    }

    public Order updateStatus(Long id, String statusStr) {
        Order order = getOrderById(id);
        OrderStatus oldStatus = order.getStatus();
        
        System.out.println("========================================");
        System.out.println("DEBUG: Appel updateStatus pour ID=" + id);
        System.out.println("DEBUG: Status Actuel=" + oldStatus);
        System.out.println("DEBUG: Status Reçu=" + statusStr);
        
        try {
            String normalized = statusStr.toUpperCase().trim()
                .replace("É", "E")
                .replace("È", "E")
                .replace("Ê", "E");

            if (normalized.equals("ANNULEE") || normalized.equals("ANNULE") || normalized.equals("ANNULÉE") || normalized.equals("ANNULÉ")) {
                normalized = "CANCELLED";
            }
            
            if (normalized.equals("CANCELED")) {
                normalized = "CANCELLED";
            }
            
            OrderStatus newStatus = OrderStatus.valueOf(normalized);
            System.out.println("DEBUG: Status Normalisé (Enum)=" + newStatus);
            
            if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
                System.out.println("DEBUG: >>> DÉBUT RESTAURATION STOCK");
                updateStockForOrder(order, true);
            } else if (oldStatus == OrderStatus.CANCELLED && newStatus != OrderStatus.CANCELLED) {
                System.out.println("DEBUG: >>> DÉBUT RÉ-DÉDUCTION STOCK");
                updateStockForOrder(order, false);
            } else {
                System.out.println("DEBUG: Pas de changement de stock requis (old=" + oldStatus + ", new=" + newStatus + ")");
            }
            
            order.setStatus(newStatus);
            Order result = orderRepository.save(order);
            System.out.println("DEBUG: Commande sauvegardée avec succès");
            System.out.println("========================================");
            return result;
        } catch (IllegalArgumentException e) {
            System.out.println("DEBUG: ERROR - Statut invalide: " + statusStr);
            throw new RuntimeException("Statut invalide : " + statusStr);
        }
    }

    /**
     * Met à jour le stock des produits d'une commande.
     * @param order La commande concernée
     * @param isRestoring true pour ajouter au stock (annulation), false pour soustraire
     */
    private void updateStockForOrder(Order order, boolean isRestoring) {
        System.out.println("DEBUG: --- updateStockForOrder (Restore=" + isRestoring + ") ---");
        
        if (order.getOrderItems() == null) {
            System.out.println("DEBUG: ERROR - orderItems est NULL");
            return;
        }
        
        System.out.println("DEBUG: Nombre d'items trouvés : " + order.getOrderItems().size());

        for (OrderItem item : order.getOrderItems()) {
            if (item == null) {
                System.out.println("DEBUG: Item de commande NULL ignoré");
                continue;
            }
            
            Product product = item.getProduct();
            if (product != null && item.getQuantity() != null) {
                System.out.println("DEBUG: Traitement produit ID=" + product.getId() + " (" + product.getName() + ")");
                
                Product dbProduct = productService.getProductById(product.getId());
                
                if (dbProduct != null) {
                    int currentStock = dbProduct.getStockQuantity() != null ? dbProduct.getStockQuantity() : 0;
                    int quantity = item.getQuantity();
                    int newStock = isRestoring ? (currentStock + quantity) : (currentStock - quantity);
                    
                    System.out.println("DEBUG:    Ancien stock=" + currentStock + ", Quantité=" + quantity + ", Nouveau=" + newStock);
                    
                    dbProduct.setStockQuantity(newStock);
                    productService.save(dbProduct);
                    System.out.println("DEBUG:    Stock MAJ sauvegardée");
                } else {
                    System.out.println("DEBUG: ERROR - Produit non trouvé en DB");
                }
            } else {
                System.out.println("DEBUG: WARN - Product ou Quantity est NULL pour cet item");
            }
        }
        System.out.println("DEBUG: --- FIN DU TRAITEMENT DES STOCKS ---");
    }
}
