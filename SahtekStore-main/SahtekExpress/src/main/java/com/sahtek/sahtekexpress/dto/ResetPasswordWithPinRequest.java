package com.sahtek.sahtekexpress.dto;

public class ResetPasswordWithPinRequest {
    private String email;
    private String secretPin;
    private String newPassword;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSecretPin() { return secretPin; }
    public void setSecretPin(String secretPin) { this.secretPin = secretPin; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
