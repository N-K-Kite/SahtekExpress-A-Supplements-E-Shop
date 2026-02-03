package com.sahtek.sahtekexpress.repository;

import com.sahtek.sahtekexpress.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Trouver un utilisateur par email
    Optional<User> findByEmail(String email);

    // Trouver un utilisateur par token de réinitialisation

    // Vérifier si un email existe déjà
    boolean existsByEmail(String email);

    // Trouver par nom et prénom
    Optional<User> findByFirstNameAndLastName(String firstName, String lastName);

    // Trouver tous les utilisateurs activés
    java.util.List<User> findByEnabledTrue();

    // Trouver par rôle
    java.util.List<User> findByRole(String role);
}
