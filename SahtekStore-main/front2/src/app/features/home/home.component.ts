import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  products: Product[] = [];
  categories = this.productService.categories;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.slice().reverse().slice(0, 8);
      },
      error: (err) => { }
    });
  }

  addToCart(product: Product) {
    if (!this.authService.getUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (product.id) {
      this.cartService.addToCart(product.id, 1).subscribe({
        next: () => {
          this.notificationService.success(`${product.name} ajouté au panier`);
        },
        error: (err) => {
          this.notificationService.error('Erreur lors de l\'ajout au panier');
        }
      });
    }
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:9002/sahtek_db/sahtek_db/api/products/image/${imageUrl}`;
  }
}
