import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="product-detail-page">
      <!-- High-Impact Background Decoration -->
      <div class="bg-blur-decoration main-decor"></div>
      <div class="bg-blur-decoration sub-decor"></div>

      <div class="container py-5 position-relative">
        <nav aria-label="breadcrumb" class="mb-5">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
            <li class="breadcrumb-item" *ngIf="product?.category">
              <a [routerLink]="['/categories', getCategorySlug(product?.category)]">
                {{ getCategoryName(product?.category) }}
              </a>
            </li>
            <li class="breadcrumb-item active">{{ product?.name }}</li>
          </ol>
        </nav>

        <div class="glass-container" *ngIf="product">
          <div class="row g-0">
            <!-- Left Column: Immersive Image Section -->
            <div class="col-lg-6">
              <div class="image-showcase">
                <div class="image-wrapper-premium">
                  <img *ngIf="product.imageUrl" [src]="getImageUrl(product.imageUrl)" [alt]="product.name" class="main-image">
                  <div *ngIf="!product.imageUrl" class="no-image-placeholder">
                    <i class="bi bi-image"></i>
                    <p>Visual pending</p>
                  </div>
                  
                  <div class="badge-overlay">
                    <span class="badge-premium">SAHTEK ELITE</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Product Intelligence & Actions -->
            <div class="col-lg-6">
              <div class="product-intelligence">
                <div class="brand-header mb-2">
                  <span class="brand-name">{{ product.brand || 'Sahtek Performance' }}</span>
                  <div class="stock-status" [ngClass]="{'in-stock': isAvailable(), 'out-of-stock': !isAvailable()}">
                    <i class="bi" [ngClass]="isAvailable() ? 'bi-patch-check-fill' : 'bi-x-circle-fill'"></i>
                    {{ isAvailable() ? 'IN STOCK' : 'OUT OF STOCK' }}
                  </div>
                </div>

                <h1 class="product-title-large mb-3">{{ product.name }}</h1>
                
                <div class="price-section mb-4">
                  <span class="price-value">{{ product.price }} <small>TND</small></span>
                  <span class="price-tax-label">Including all performance taxes</span>
                </div>

                <div class="description-section mb-5">
                  <h3 class="section-label">THE PERFORMANCE SPECS</h3>
                  <p class="product-description-text">{{ product.description }}</p>
                </div>

                <!-- Purchase Flow -->
                <div class="purchase-zone" *ngIf="isAvailable()">
                  <div class="quantity-control-wrapper mb-4">
                    <label class="control-label">QUANTITY</label>
                    <div class="quantity-selector-premium">
                      <button class="selector-btn" (click)="decrement()" [disabled]="quantity <= 1">
                        <i class="bi bi-dash"></i>
                      </button>
                      <input type="number" class="quantity-input" [(ngModel)]="quantity" min="1" [max]="product.stockQuantity || 10">
                      <button class="selector-btn" (click)="increment()" [disabled]="quantity >= (product.stockQuantity || 10)">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>

                  <div class="action-buttons">
                    <button class="btn-add-cart-large" (click)="addToCart()">
                      <span class="btn-content">
                        <i class="bi bi-cart-plus-fill me-2"></i> AJOUTER AU PANIER
                      </span>
                      <div class="btn-glow"></div>
                    </button>
                  </div>
                </div>

                <!-- Features list -->
                <div class="performance-highlights mt-5">
                    <div class="highlight-item">
                        <i class="bi bi-shield-check"></i>
                        <span>100% Authentic Quality</span>
                    </div>
                    <div class="highlight-item">
                        <i class="bi bi-truck"></i>
                        <span>24H Express Delivery</span>
                    </div>
                    <div class="highlight-item">
                        <i class="bi bi-lightning-fill"></i>
                        <span>Instant Results Formula</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!product && !isLoading" class="error-container text-center py-5">
           <i class="bi bi-search display-1 text-muted"></i>
           <h2 class="mt-4">Produit non trouvé</h2>
           <p class="text-secondary">L'article que vous recherchez semble avoir quitté l'arène.</p>
           <a routerLink="/" class="btn btn-primary mt-3">Retour à l'accueil</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --accent-color: #0062ff;
      --accent-gradient: linear-gradient(135deg, #0062ff 0%, #00d2ff 100%);
      --dark-bg: #0a0f1d;
      --glass-bg: rgba(255, 255, 255, 0.95);
    }

    .product-detail-page {
      background: #f1f5f9;
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      padding-top: 40px;
    }

    /* Background Decorations */
    .bg-blur-decoration {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      z-index: 0;
      opacity: 0.15;
    }

    .main-decor {
      width: 600px;
      height: 600px;
      background: var(--accent-color);
      top: -200px;
      right: -100px;
    }

    .sub-decor {
      width: 400px;
      height: 400px;
      background: #4facfe;
      bottom: -100px;
      left: -100px;
    }

    /* Breadcrumb */
    .breadcrumb {
      background: transparent;
      padding: 0;
      margin: 0;
    }

    .breadcrumb-item a {
      color: #64748b;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .breadcrumb-item a:hover {
      color: var(--accent-color);
    }

    .breadcrumb-item.active {
      color: #0f172a;
      font-weight: 700;
    }

    /* Glass Container */
    .glass-container {
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 40px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08);
      position: relative;
      z-index: 10;
    }

    /* Image Section */
    .image-showcase {
      padding: 60px;
      background: #f8fafc;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .image-wrapper-premium {
      width: 100%;
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden; /* Ensure zoom stays within bounds */
      border-radius: 20px;
    }

    .main-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.15));
      transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .image-wrapper-premium:hover .main-image {
      transform: scale(1.15); /* More aggressive zoom */
    }

    .no-image-placeholder {
      text-align: center;
      color: #cbd5e1;
    }

    .no-image-placeholder i {
      font-size: 5rem;
      margin-bottom: 10px;
    }

    .badge-overlay {
      position: absolute;
      top: 0;
      left: 0;
    }

    .badge-premium {
      background: var(--accent-gradient);
      color: white;
      padding: 8px 20px;
      border-radius: 0 0 20px 0;
      font-weight: 800;
      letter-spacing: 2px;
      font-size: 0.75rem;
      box-shadow: 0 10px 20px rgba(0, 98, 255, 0.2);
    }

    /* Intelligence Section */
    .product-intelligence {
      padding: 60px;
      height: 100%;
    }

    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-name {
      text-transform: uppercase;
      letter-spacing: 3px;
      font-weight: 800;
      color: var(--accent-color);
      font-size: 0.85rem;
    }

    .stock-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      font-size: 0.7rem;
      padding: 6px 12px;
      border-radius: 50px;
    }

    .stock-status.in-stock {
      background: #ecfdf5;
      color: #059669;
    }

    .stock-status.out-of-stock {
      background: #fef2f2;
      color: #dc2626;
    }

    .product-title-large {
      font-size: 3rem;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.1;
      letter-spacing: -1px;
    }

    /* Price */
    .price-section {
      display: flex;
      flex-direction: column;
    }

    .price-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: #0f172a;
    }

    .price-value small {
      font-size: 1.2rem;
      color: #64748b;
    }

    .price-tax-label {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 600;
    }

    /* Description */
    .section-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 2px;
      margin-bottom: 15px;
    }

    .product-description-text {
      color: #475569;
      line-height: 1.8;
      font-size: 1.05rem;
    }

    /* Purchase Zone */
    .purchase-zone {
      background: #f8fafc;
      padding: 30px;
      border-radius: 25px;
      border: 1px solid #e2e8f0;
    }

    .control-label {
      font-weight: 800;
      font-size: 0.7rem;
      color: #64748b;
      margin-bottom: 10px;
      display: block;
    }

    .quantity-selector-premium {
      display: flex;
      align-items: center;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 15px;
      width: fit-content;
      padding: 5px;
    }

    .selector-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      color: #0f172a;
      font-size: 1.2rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .selector-btn:hover:not(:disabled) {
      background: #f1f5f9;
      color: var(--accent-color);
    }

    .selector-btn:disabled {
      color: #cbd5e1;
    }

    .quantity-input {
      width: 60px;
      border: none;
      text-align: center;
      font-weight: 800;
      font-size: 1.1rem;
      color: #0f172a;
    }

    /* Remove arrows from number input */
    .quantity-input::-webkit-outer-spin-button,
    .quantity-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .btn-add-cart-large {
      width: 100%;
      height: 65px;
      border: none;
      border-radius: 18px;
      background: var(--accent-gradient);
      color: white;
      font-weight: 800;
      font-size: 1.1rem;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      box-shadow: 0 15px 30px rgba(0, 98, 255, 0.25);
    }

    .btn-add-cart-large:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 98, 255, 0.35);
    }

    .btn-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      transition: left 0.5s;
    }

    .btn-add-cart-large:hover .btn-glow {
      left: 100%;
    }

    /* Highlights */
    .performance-highlights {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .highlight-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
    }

    .highlight-item i {
      font-size: 1.5rem;
      color: var(--accent-color);
    }

    .highlight-item span {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      line-height: 1.3;
    }

    @media (max-width: 991px) {
      .image-showcase { height: 400px; padding: 40px; }
      .product-intelligence { padding: 40px; }
      .product-title-large { font-size: 2.2rem; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  quantity: number = 1;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(+id).subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        }
      });
    }
  }

  isAvailable(): boolean {
    if (!this.product) return false;
    const stock = this.product.stockQuantity ?? this.product.stock ?? 0;
    return stock > 0;
  }

  increment() {
    const maxStock = this.product?.stockQuantity ?? this.product?.stock ?? 10;
    if (this.quantity < maxStock) {
      this.quantity++;
    }
  }

  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.authService.getUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.product && this.product.id && this.quantity > 0) {
      this.cartService.addToCart(this.product.id, this.quantity).subscribe({
        next: () => {
          this.notificationService.success(`${this.quantity} x ${this.product?.name} ajouté au panier`);
        },
        error: () => {
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

  getCategorySlug(category: any): string {
    if (!category) return 'all';
    const categoryName = typeof category === 'string' ? category : (category.name || '');
    const found = this.productService.categories.find(c =>
      c.name === categoryName || c.displayName === categoryName || c.slug === categoryName
    );
    return found?.slug || 'all';
  }

  getCategoryName(category: any): string {
    if (!category) return 'Produit';
    if (typeof category === 'string') {
      const found = this.productService.categories.find(c => c.name === category);
      return found?.displayName || category;
    }
    return category.displayName || category.name || 'Produit';
  }
}
