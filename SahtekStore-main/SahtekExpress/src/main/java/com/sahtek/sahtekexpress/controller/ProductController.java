package com.sahtek.sahtekexpress.controller;

import com.sahtek.sahtekexpress.entities.Product;
import com.sahtek.sahtekexpress.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/sahtek_db/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private static final String UPLOAD_DIR = "uploads/";

    @Autowired
    private ProductService productService;

    // ========== CRÉATION ==========

    // 1. Créer un produit SANS image (JSON)
    @PostMapping("/create")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            product.setActive(true);
            Product savedProduct = productService.createProduct(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    // 2. Créer un produit AVEC image (FormData)
    @PostMapping(value = "/create-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProductWithImage(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam("category") String category,
            @RequestParam("price") Double price,
            @RequestParam(value = "stockQuantity", defaultValue = "0") Integer stockQuantity,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            // Créer le produit
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setBrand(brand);
            product.setPrice(price);
            product.setStockQuantity(stockQuantity);
            product.setCategory(category);
            product.setActive(true);

            // Gérer l'image si elle existe
            if (image != null && !image.isEmpty()) {
                // Vérifier la taille
                if (image.getSize() > 50 * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                            .body("Image trop grande (max 50MB)");
                }

                // Vérifier le type
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest()
                            .body("Format d'image non supporté");
                }

                String imageUrl = saveImage(image);
                product.setImageUrl(imageUrl);
            }

            Product savedProduct = productService.createProduct(product);
            return ResponseEntity.ok(savedProduct);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'enregistrement de l'image: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur: " + e.getMessage());
        }
    }

    // ========== LECTURE ==========

    // 3. Obtenir TOUS les produits
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // 4. Obtenir un produit par ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    // 5. Obtenir les produits ACTIFS seulement
    @GetMapping("/active")
    public ResponseEntity<List<Product>> getActiveProducts() {
        List<Product> products = productService.getActiveProducts();
        return ResponseEntity.ok(products);
    }

    // 6. Obtenir produits par CATÉGORIE
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    // 7. Obtenir toutes les CATÉGORIES distinctes
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = productService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // ========== MISE À JOUR ==========

    // 8. Mettre à jour un produit (JSON)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product updatedProduct = productService.updateProduct(id, product);
            if (updatedProduct != null) {
                return ResponseEntity.ok(updatedProduct);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur: " + e.getMessage());
        }
    }

    // 9. Mettre à jour avec image
    @PutMapping(value = "/{id}/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProductWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam("price") Double price,
            @RequestParam(value = "stockQuantity", defaultValue = "0") Integer stockQuantity,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setBrand(brand);
            product.setCategory(category);
            product.setPrice(price);
            product.setStockQuantity(stockQuantity);

            // Gérer l'image
            if (image != null && !image.isEmpty()) {
                String imageUrl = saveImage(image);
                product.setImageUrl(imageUrl);
            }

            Product updatedProduct = productService.updateProduct(id, product);
            if (updatedProduct != null) {
                return ResponseEntity.ok(updatedProduct);
            }
            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur: " + e.getMessage());
        }
    }

    // ========== SUPPRESSION ==========

    // 10. EFFACER un produit (SOFT DELETE - désactiver)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Produit supprimé avec succès (désactivé)");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression: " + e.getMessage());
        }
    }

    // 11. SUPPRIMER DÉFINITIVEMENT un produit
    @DeleteMapping("/permanent/{id}")
    public ResponseEntity<String> deleteProductPermanently(@PathVariable Long id) {
        try {
            productService.deleteProductPermanently(id);
            return ResponseEntity.ok("Produit supprimé définitivement");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression définitive: " + e.getMessage());
        }
    }

    // ========== GESTION DU STOCK ==========

    // 18. Réduire le stock d'un produit
    @PutMapping("/{id}/reduce-stock")
    public ResponseEntity<?> reduceStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        try {
            int quantity = body.get("quantity");
            Product product = productService.getProductById(id);
            
            if (product == null) {
                return ResponseEntity.notFound().build();
            }
            
            if (product.getStockQuantity() < quantity) {
                return ResponseEntity.badRequest()
                        .body("Stock insuffisant. Stock actuel: " + product.getStockQuantity());
            }
            
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productService.save(product);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur: " + e.getMessage());
        }
    }

    // ========== IMAGES ==========

    // 12. Servir une image
    @GetMapping("/image/{filename}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) throws IOException {
        Path imagePath = Paths.get(UPLOAD_DIR + filename);

        if (!Files.exists(imagePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] imageBytes = Files.readAllBytes(imagePath);
        String contentType = Files.probeContentType(imagePath);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"))
                .body(imageBytes);
    }

    // 13. Supprimer une image
    @DeleteMapping("/image/{filename}")
    public ResponseEntity<String> deleteImage(@PathVariable String filename) {
        try {
            Path imagePath = Paths.get(UPLOAD_DIR + filename);
            if (Files.exists(imagePath)) {
                Files.delete(imagePath);
                return ResponseEntity.ok("Image supprimée avec succès");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression de l'image: " + e.getMessage());
        }
    }

    // ========== RECHERCHE ==========

    // 14. Rechercher des produits par nom
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    // 15. Obtenir les produits en stock
    @GetMapping("/in-stock")
    public ResponseEntity<List<Product>> getProductsInStock() {
        List<Product> products = productService.getProductsInStock();
        return ResponseEntity.ok(products);
    }

    // 16. Rechercher dans une catégorie
    @GetMapping("/category/{category}/search")
    public ResponseEntity<List<Product>> searchInCategory(
            @PathVariable String category,
            @RequestParam String keyword) {
        List<Product> products = productService.searchProductsInCategory(category, keyword);
        return ResponseEntity.ok(products);
    }

    // 17. Produits en stock par catégorie
    @GetMapping("/category/{category}/in-stock")
    public ResponseEntity<List<Product>> getProductsInStockByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsInStockByCategory(category);
        return ResponseEntity.ok(products);
    }

    // ========== MÉTHODES PRIVÉES ==========

    // Sauvegarder une image
    private String saveImage(MultipartFile image) throws IOException {
        // Créer le dossier
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Nom unique
        String originalFilename = image.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);

        // Sauvegarder
        Files.copy(image.getInputStream(), filePath);

        return filename;
    }
}