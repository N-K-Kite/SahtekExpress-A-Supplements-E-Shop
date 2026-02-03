package com.sahtek.sahtekexpress.service;

import com.sahtek.sahtekexpress.dto.RegisterDTO;
import com.sahtek.sahtekexpress.dto.UserDTO;
import com.sahtek.sahtekexpress.entities.User;
import com.sahtek.sahtekexpress.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Inscription d'un nouvel utilisateur
    public UserDTO register(RegisterDTO registerDTO) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new RuntimeException("Email déjà utilisé: " + registerDTO.getEmail());
        }

        // Créer un nouvel utilisateur
        User user = new User();
        user.setFirstName(registerDTO.getFirstName());
        user.setLastName(registerDTO.getLastName());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword())); // Crypter le mot de passe
        user.setPhone(registerDTO.getPhone());
        user.setEnabled(true);
        user.setRole("USER");
        
        // Code PIN Secret
        String pin = registerDTO.getSecretPin();
        user.setSecretPin((pin != null && !pin.isEmpty()) ? pin : "0000");

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    // Authentification simple
    public UserDTO login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        if (!user.getEnabled()) {
            throw new RuntimeException("Compte désactivé");
        }

        return convertToDTO(user);
    }

    // Récupérer tous les utilisateurs
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id: " + id));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec email: " + email));
        return convertToDTO(user);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id: " + id));

        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
            if (!user.getEmail().equals(userDTO.getEmail()) && userRepository.existsByEmail(userDTO.getEmail())) {
                throw new RuntimeException("Cet email est d�j� utilis�.");
            }
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getFirstName() != null) user.setFirstName(userDTO.getFirstName());
        if (userDTO.getLastName() != null) user.setLastName(userDTO.getLastName());
        if (userDTO.getPhone() != null) user.setPhone(userDTO.getPhone());
        if (userDTO.getAddress() != null) user.setAddress(userDTO.getAddress());
        if (userDTO.getCity() != null) user.setCity(userDTO.getCity());
        if (userDTO.getPostalCode() != null) user.setPostalCode(userDTO.getPostalCode());
        if (userDTO.getRole() != null) user.setRole(userDTO.getRole());
        if (userDTO.getEnabled() != null) user.setEnabled(userDTO.getEnabled());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id: " + id));
        user.setEnabled(false);
        userRepository.save(user);
    }

    public List<UserDTO> searchUsers(String keyword) {
        return userRepository.findAll().stream()
                .filter(user -> user.getEnabled())
                .filter(user -> user.getFirstName().toLowerCase().contains(keyword.toLowerCase()) ||
                        user.getLastName().toLowerCase().contains(keyword.toLowerCase()) ||
                        user.getEmail().toLowerCase().contains(keyword.toLowerCase()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO changeUserRole(Long id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id: " + id));
        user.setRole(newRole);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public UserDTO toggleUserStatus(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id: " + id));
        user.setEnabled(enabled);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    // Changer le mot de passe (via Profil)
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    // Réinitialisation par Code PIN
    public void resetPasswordWithPin(String email, String pin, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String userPin = user.getSecretPin();
        if (userPin == null || !userPin.equals(pin)) {
            throw new RuntimeException("Code PIN incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole())
                .disabled(!user.getEnabled())
                .build();
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setPostalCode(user.getPostalCode());
        dto.setRole(user.getRole());
        dto.setEnabled(user.getEnabled());
        return dto;
    }
}
