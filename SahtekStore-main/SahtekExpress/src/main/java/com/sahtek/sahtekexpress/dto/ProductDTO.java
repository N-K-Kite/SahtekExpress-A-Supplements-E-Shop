package com.sahtek.sahtekexpress.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ProductDTO {
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;
    private String brand;
    private String imageUrl;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double price;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private Integer stockQuantity;

    private Long categoryId;
    private String categoryName;
    private Boolean active = true;
}