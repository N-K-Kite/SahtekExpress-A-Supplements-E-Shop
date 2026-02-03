package com.sahtek.sahtekexpress.service;

import com.sahtek.sahtekexpress.entities.Product;
import com.sahtek.sahtekexpress.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // ========== CRÉATION ==========

    // CREATE
    public Product createProduct(Product product) {
        // S'assurer que la catégorie a une valeur par défaut si null
        if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
            product.setCategory("Non catégorisé");
        }
        return productRepository.save(product);
    }

    // ========== LECTURE ==========

    // READ ALL
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // READ ACTIVE
    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    // READ ONE
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    // ========== MÉTHODES PAR CATÉGORIE ==========

    // Obtenir produits par catégorie
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }

    // Obtenir toutes les catégories distinctes
    public List<String> getAllCategories() {
        return productRepository.findAllDistinctCategories();
    }

    // Rechercher dans une catégorie
    public List<Product> searchProductsInCategory(String category, String keyword) {
        return productRepository.findByCategoryAndNameContainingIgnoreCase(category, keyword);
    }

    // Produits en stock par catégorie
    public List<Product> getProductsInStockByCategory(String category) {
        return productRepository.findByCategoryAndStockQuantityGreaterThan(category, 0);
    }

    // Produits par catégorie et fourchette de prix
    public List<Product> getProductsByCategoryAndPriceRange(String category, Double minPrice, Double maxPrice) {
        return productRepository.findByCategoryAndPriceBetween(category, minPrice, maxPrice);
    }

    // Produits par catégorie et marque
    public List<Product> getProductsByCategoryAndBrand(String category, String brand) {
        return productRepository.findByCategoryAndBrand(category, brand);
    }

    // ========== MISE À JOUR ==========

    // UPDATE
    public Product updateProduct(Long id, Product productUpdates) {
        Product existing = getProductById(id);
        if (existing == null) {
            return null;
        }

        // Mettre à jour les champs
        if (productUpdates.getName() != null) existing.setName(productUpdates.getName());
        if (productUpdates.getDescription() != null) existing.setDescription(productUpdates.getDescription());
        if (productUpdates.getBrand() != null) existing.setBrand(productUpdates.getBrand());
        if (productUpdates.getPrice() != null) existing.setPrice(productUpdates.getPrice());
        if (productUpdates.getStockQuantity() != null) existing.setStockQuantity(productUpdates.getStockQuantity());
        if (productUpdates.getImageUrl() != null) existing.setImageUrl(productUpdates.getImageUrl());
        if (productUpdates.getActive() != null) existing.setActive(productUpdates.getActive());
        if (productUpdates.getCategory() != null) existing.setCategory(productUpdates.getCategory());

        return productRepository.save(existing);
    }

    // ========== SUPPRESSION ==========

    // DELETE (soft delete - désactiver)
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        if (product != null) {
            product.setActive(false);
            productRepository.save(product);
        }
    }

    // DELETE PERMANENT
    public void deleteProductPermanently(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
        }
    }

    // ========== RECHERCHE ==========

    // SEARCH
    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    // IN STOCK
    public List<Product> getProductsInStock() {
        return productRepository.findByStockQuantityGreaterThan(0);
    }

    // Produits par fourchette de prix
    public List<Product> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    // Produits par marque
    public List<Product> getProductsByBrand(String brand) {
        return productRepository.findByBrand(brand);
    }

    // SAVE (pour sauvegarder les modifications directes)
    public Product save(Product product) {
        return productRepository.save(product);
    }
}