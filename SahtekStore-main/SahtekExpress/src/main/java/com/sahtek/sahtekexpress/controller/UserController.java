package com.sahtek.sahtekexpress.controller;

import com.sahtek.sahtekexpress.dto.LoginDTO;
import com.sahtek.sahtekexpress.dto.RegisterDTO;
import com.sahtek.sahtekexpress.dto.UserDTO;
import com.sahtek.sahtekexpress.dto.ResetPasswordWithPinRequest;
import com.sahtek.sahtekexpress.dto.ChangePasswordRequest;
import com.sahtek.sahtekexpress.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/sahtek_db/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    // POST /api/users/register - Inscription
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterDTO registerDTO) {
        UserDTO createdUser = userService.register(registerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // POST /api/users/login - Connexion
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginDTO loginDTO) {
        UserDTO user = userService.login(loginDTO.getEmail(), loginDTO.getPassword());
        return ResponseEntity.ok(user);
    }

    // POST /api/users/reset-password-pin - Réinitialiser avec PIN
    @PostMapping("/reset-password-pin")
    public ResponseEntity<Void> resetPasswordWithPin(@RequestBody ResetPasswordWithPinRequest request) {
        userService.resetPasswordWithPin(request.getEmail(), request.getSecretPin(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    // PUT /api/users/{id}/password - Changer le mot de passe (Profil)
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    // GET /api/users - Tous les utilisateurs
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // GET /api/users/{id} - Utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // GET /api/users/email/{email} - Utilisateur par email
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    // PUT /api/users/{id} - Mettre à jour un utilisateur
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                              @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // DELETE /api/users/{id} - Supprimer un utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/users/search?keyword=... - Rechercher des utilisateurs
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String keyword) {
        List<UserDTO> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(users);
    }

    // PUT /api/users/{id}/role - Changer le rôle
    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> changeRole(@PathVariable Long id,
                                              @RequestParam String role) {
        UserDTO updatedUser = userService.changeUserRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }

    // PUT /api/users/{id}/status - Activer/désactiver
    @PutMapping("/{id}/status")
    public ResponseEntity<UserDTO> toggleStatus(@PathVariable Long id,
                                                @RequestParam boolean enabled) {
        UserDTO updatedUser = userService.toggleUserStatus(id, enabled);
        return ResponseEntity.ok(updatedUser);
    }

    // Test endpoint
    @GetMapping("/test")
    public String test() {
        return "✅ User API is working!";
    }
}
