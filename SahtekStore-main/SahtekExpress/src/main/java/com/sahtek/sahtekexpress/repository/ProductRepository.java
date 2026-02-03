package com.sahtek.sahtekexpress.repository;

import com.sahtek.sahtekexpress.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Trouver tous les produits actifs
    List<Product> findByActiveTrue();

    // Rechercher par nom (insensible à la casse)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Trouver par fourchette de prix
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);

    // Trouver par marque
    List<Product> findByBrand(String brand);

    // Produits en stock (quantité > 0)
    List<Product> findByStockQuantityGreaterThan(Integer quantity);

    // ========== NOUVELLES MÉTHODES POUR CATÉGORIE ==========

    // Trouver par catégorie
    List<Product> findByCategory(String category);

    // Trouver par catégorie et actif
    List<Product> findByCategoryAndActiveTrue(String category);

    // Trouver par catégorie et nom
    List<Product> findByCategoryAndNameContainingIgnoreCase(String category, String name);

    // Toutes les catégories distinctes
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.active = true")
    List<String> findAllDistinctCategories();

    // Produits par catégorie et stock
    List<Product> findByCategoryAndStockQuantityGreaterThan(String category, Integer quantity);

    // Produits par catégorie et fourchette de prix
    List<Product> findByCategoryAndPriceBetween(String category, Double minPrice, Double maxPrice);

    // Rechercher par marque dans une catégorie
    List<Product> findByCategoryAndBrand(String category, String brand);
}