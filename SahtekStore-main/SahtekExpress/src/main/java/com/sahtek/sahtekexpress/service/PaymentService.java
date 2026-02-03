package com.sahtek.sahtekexpress.service;

import com.sahtek.sahtekexpress.entities.Order;
import com.sahtek.sahtekexpress.entities.PaymentMethod;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    public String generatePaymentLink(Order order) {
        PaymentMethod method = order.getPaymentMethod();
        
        if (method == null) return null;

        switch (method) {
            case FLOUCI:
                return generateFlouciLink(order);
            case E_DINAR:
                return generateEDinarLink(order);
            case PAYONEER:
                return "https://payoneer.com/pay/simulated-" + order.getOrderNumber();
            default:
                return null; // Pas de lien pour le Cash on Delivery (WafaCash)
        }
    }

    private String generateFlouciLink(Order order) {
        // En vrai, ici on ferait un Appel API à Flouci avec RestTemplate ou WebClient
        // pour récupérer un payment_url réel.
        String simulationToken = UUID.randomUUID().toString();
        return "https://app.flouci.com/payment/" + simulationToken;
    }

    private String generateEDinarLink(Order order) {
        // Simulation pour la plateforme de la Poste Tunisienne
        return "https://www.poste.tn/payment/edinar?order=" + order.getOrderNumber() + "&amount=" + order.getTotalAmount();
    }
}
