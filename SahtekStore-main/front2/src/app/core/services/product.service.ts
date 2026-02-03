import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private baseUrl = 'http://localhost:9002/sahtek_db/sahtek_db/api';
    private productUrl = `${this.baseUrl}/products`;
    private uploadUrl = `${this.baseUrl}/upload`;

    categories = [
        { id: 1, name: 'Protéines & Whey', displayName: 'Protéines & Whey', slug: 'proteines', icon: 'bi-cup-hot-fill', description: 'Isolats, concentrés et mélanges premium pour la construction musculaire.' },
        { id: 2, name: 'Créatine & Force', displayName: 'Créatine & Force', slug: 'creatine', icon: 'bi-lightning-charge-fill', description: 'Performance pure et explosion musculaire pour vos séances intenses.' },
        { id: 3, name: 'Acides Aminés & BCAA', displayName: 'Acides Aminés & BCAA', slug: 'acides-amines', icon: 'bi-patch-check-fill', description: 'Récupération et protection musculaire post-entraînement.' },
        { id: 4, name: 'Pré-Workouts', displayName: 'Pré-Workouts', slug: 'pre-workouts', icon: 'bi-fire', description: 'Énergie, focus et congestion maximale avant votre entraînement.' },
        { id: 5, name: 'Prise de Masse', displayName: 'Prise de Masse', slug: 'prise-de-masse', icon: 'bi-trophy-fill', description: 'Gainers et calories de haute qualité pour dépasser vos plateaux.' },
        { id: 6, name: 'Bien-être & Vitamines', displayName: 'Bien-être & Vitamines', slug: 'vitamines', icon: 'bi-heart-pulse-fill', description: 'Santé globale et vitalité pour les athlètes accomplis.' }
    ];

    constructor(private http: HttpClient) { }

    // Upload d'image
    uploadImage(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(this.uploadUrl, formData, { responseType: 'text' });
    }

    // Créer un produit avec image
    createProductWithImage(productData: any, imageFile?: File): Observable<Product> {
        return new Observable(observer => {
            if (imageFile) {
                // Upload l'image d'abord
                this.uploadImage(imageFile).subscribe({
                    next: (imageUrl) => {
                        // Créer le produit avec l'URL de l'image
                        const productWithImage = {
                            ...productData,
                            imageUrl: imageUrl
                        };
                        this.http.post<Product>(this.productUrl, productWithImage)
                            .subscribe(observer);
                    },
                    error: (error) => observer.error(error)
                });
            } else {
                // Créer le produit sans image
                this.http.post<Product>(this.productUrl, productData)
                    .subscribe(observer);
            }
        });
    }

    // Méthode alternative avec FormData pour tout envoyer en une requête
    createProductWithFormData(product: Product, imageFile?: File): Observable<Product> {
        const formData = new FormData();

        // Ajouter les champs du produit
        formData.append('name', product.name);
        formData.append('description', product.description || '');
        formData.append('brand', product.brand || '');
        formData.append('price', product.price.toString());
        // Handle optional stockQuantity safely
        formData.append('stockQuantity', (product.stockQuantity || 0).toString());

        if (product.category?.id) {
            formData.append('categoryId', product.category.id.toString());
        }

        if (product.category?.name) {
            formData.append('category', product.category.name);
        } else if (typeof product.category === 'string') {
            formData.append('category', product.category);
        }

        // Ajouter l'image si fournie
        if (imageFile) {
            formData.append('image', imageFile);
        }

        // POST to /create-with-image endpoint
        return this.http.post<Product>(`${this.productUrl}/create-with-image`, formData);
    }

    // Mettre à jour un produit avec image
    updateProductWithImage(id: number, productData: any, imageFile?: File, currentImageUrl?: string): Observable<Product> {
        const formData = new FormData();

        formData.append('name', productData.name);
        formData.append('description', productData.description || '');
        formData.append('brand', productData.brand || '');
        formData.append('price', productData.price.toString());
        formData.append('stockQuantity', (productData.stockQuantity || 0).toString());

        if (productData.category?.id) {
            formData.append('categoryId', productData.category.id.toString());
        }

        if (productData.category?.name) {
            formData.append('category', productData.category.name);
        } else if (typeof productData.category === 'string') {
            formData.append('category', productData.category);
        }

        if (currentImageUrl) {
            formData.append('currentImageUrl', currentImageUrl);
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        return this.http.put<Product>(`${this.productUrl}/${id}/with-image`, formData);
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.productUrl);
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.productUrl}/${id}`);
    }

    getProductsByCategory(category: string): Observable<Product[]> {
        const encodedCategory = encodeURIComponent(category);
        return this.http.get<Product[]>(`${this.productUrl}/category/${encodedCategory}`);
    }

    updateProduct(id: number, product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.productUrl}/${id}`, product);
    }

    // Hard Delete (Admin Inventory)
    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.productUrl}/permanent/${id}`, { responseType: 'text' });
    }

    // Standard Delete (For Delivery/Safe Delete)
    // DELETE http://localhost:9002/sahtek_db/sahtek_db/api/products/{{id}}
    deleteProductStandard(id: number): Observable<any> {
        return this.http.delete(`${this.productUrl}/${id}`, { responseType: 'text' });
    }

    // Update stock quantity (reduce stock after order confirmation)
    updateStock(productId: number, quantityToReduce: number): Observable<Product> {
        return this.http.put<Product>(`${this.productUrl}/${productId}/reduce-stock`, {
            quantity: quantityToReduce
        });
    }

    // Check if product is in stock
    isInStock(product: Product): boolean {
        const stock = product.stockQuantity ?? product.stock ?? 0;
        return stock > 0;
    }

    // Get available stock
    getStock(product: Product): number {
        return product.stockQuantity ?? product.stock ?? 0;
    }

    // Search products
    searchProducts(keyword: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.productUrl}/search?keyword=${keyword}`);
    }
}
