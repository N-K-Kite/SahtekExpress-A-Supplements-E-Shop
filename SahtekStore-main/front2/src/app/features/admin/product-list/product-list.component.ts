import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => { }
    });
  }

  getSafeUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl; // Already absolute
    // Use correct backend image endpoint
    return `http://localhost:9002/sahtek_db/sahtek_db/api/products/image/${imageUrl}`;
  }

  onImageError(event: any) {
    event.target.src = 'assets/placeholder.png'; // Make sure you have a placeholder or handle it
    event.target.onerror = null; // Prevent infinite loop
  }

  onDelete(id: number | undefined) {
    if (id !== undefined && confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.success('Produit supprimé avec succès');
          this.loadProducts(); // Refresh list
        },
        error: (err) => this.notificationService.error('Erreur lors de la suppression')
      });
    }
  }
}
