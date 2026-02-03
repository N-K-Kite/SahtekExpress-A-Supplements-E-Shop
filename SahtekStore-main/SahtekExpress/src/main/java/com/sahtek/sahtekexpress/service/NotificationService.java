package com.sahtek.sahtekexpress.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Value("${infobip.api_key:}")
    private String apiKey;

    @Value("${infobip.base_url:}")
    private String baseUrl;

    @Autowired
    private RestTemplate restTemplate;

    @jakarta.annotation.PostConstruct
    public void checkConfig() {
        System.out.println("DEBUG: Infobip API Key present: " + (apiKey != null && !apiKey.isEmpty()));
        System.out.println("DEBUG: Infobip Base URL: " + baseUrl);
    }

    public void sendOrderConfirmationSms(String phoneNumber, String orderNumber, Double amount, String productNames) {
        // Normalisation du numéro (ajout auto du code pays Tunisie 216 si 8 chiffres)
        if (phoneNumber != null) {
            phoneNumber = phoneNumber.replaceAll("\\s+", ""); // Enlever les espaces
            if (phoneNumber.length() == 8 && phoneNumber.matches("\\d+")) {
                phoneNumber = "216" + phoneNumber;
                System.out.println("DEBUG: Numéro normalisé en format international : " + phoneNumber);
            }
        }

        String displayProducts = (productNames != null && !productNames.isEmpty()) ? " (" + productNames + ")" : "";
        String messageBody = "SahtekExpress - Votre commande " + orderNumber + 
                           displayProducts + " d'un montant de " + amount + 
                           " DT a bien été enregistrée. Nous vous contacterons prochainement pour la confirmation.";

        if (apiKey != null && !apiKey.isEmpty() && baseUrl != null && !baseUrl.isEmpty()) {
            try {
                System.out.println("Tentative d'envoi SMS réel à " + phoneNumber + " via " + baseUrl);
                sendInfobipSms(phoneNumber, messageBody);
                System.out.println("✅ SMS réel envoyé via Infobip à : " + phoneNumber);
            } catch (Exception e) {
                System.err.println("❌ Erreur lors de l'envoi API Infobip : " + e.getMessage());
                simulateSms(phoneNumber, messageBody);
            }
        } else {
            System.out.println("DEBUG: Configuration Infobip manquante. Basculement en simulation.");
            simulateSms(phoneNumber, messageBody);
        }
    }

    private void sendInfobipSms(String phoneNumber, String text) {
        String url = "https://" + baseUrl + "/sms/2/text/advanced";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "App " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        // Construction du JSON
        Map<String, Object> request = new HashMap<>();
        Map<String, Object> message = new HashMap<>();
        
        // Supprimé 'from': Les comptes d'essai bloquent souvent les Sender ID personnalisés.
        // En le supprimant, Infobip utilisera le Sender ID par défaut du compte.
        
        Map<String, String> destination = new HashMap<>();
        destination.put("to", phoneNumber);
        
        message.put("destinations", Collections.singletonList(destination));
        message.put("text", text);
        
        request.put("messages", Collections.singletonList(message));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        System.out.println("\n--- SUPER-DEBUG SMS START ---");
        System.out.println("DESTINATION: " + phoneNumber);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("INFOBIP STATUS: " + response.getStatusCode());
            System.out.println("INFOBIP BODY: " + response.getBody());
            System.out.println("--- SUPER-DEBUG SMS END ---\n");

            if (response.getStatusCode() != HttpStatus.OK && response.getStatusCode() != HttpStatus.ACCEPTED) {
                throw new RuntimeException("Infobip API error: " + response.getBody());
            }
        } catch (Exception e) {
            System.out.println("!!! INFOBIP CRITICAL ERROR: " + e.getMessage());
            System.out.println("--- SUPER-DEBUG SMS END ---\n");
            throw e;
        }
    }

    private void simulateSms(String phoneNumber, String messageBody) {
        System.out.println("--------------------------------------------------");
        System.out.println("SIMULATION SMS à : " + phoneNumber);
        System.out.println("Message : " + messageBody);
        System.out.println("--------------------------------------------------");
    }
}
