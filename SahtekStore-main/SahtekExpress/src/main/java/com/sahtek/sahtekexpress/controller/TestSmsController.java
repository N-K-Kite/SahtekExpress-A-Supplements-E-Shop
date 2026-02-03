package com.sahtek.sahtekexpress.controller;

import com.sahtek.sahtekexpress.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sahtek_db/api/test")
public class TestSmsController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/sms")
    public String testSms(@RequestParam String phone) {
        try {
            notificationService.sendOrderConfirmationSms(phone, "TEST-123", 99.0, "Produit Test");
            return "✅ Tentative d'envoi effectuée vers " + phone + ". Vérifie la console du serveur pour les détails (DEBUG logs).";
        } catch (Exception e) {
            return "❌ Erreur : " + e.getMessage();
        }
    }
}
