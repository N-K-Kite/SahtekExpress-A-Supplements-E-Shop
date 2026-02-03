import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="category-detail-page">
      <!-- Ultra-Pro Advanced Dark Banner -->
      <div class="category-banner-ultra">
        <div class="animated-beams">
          <div class="beam beam-1"></div>
          <div class="beam beam-2"></div>
        </div>
        <div class="prism-overlay"></div>
        
        <div class="container relative-content">
          <nav aria-label="breadcrumb" class="mb-5 animate-slide-down">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><a routerLink="/categories">Univers</a></li>
              <li class="breadcrumb-item active text-white fw-800">/ {{ categoryName }}</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-lg-8">
              <div class="d-flex align-items-center gap-5">
                <div class="cat-icon-3d-wrapper">
                  <div class="glow-ring-animated"></div>
                  <div class="cat-icon-pro-3d">
                    <i class="bi" [ngClass]="getCategoryIcon(categoryName)"></i>
                  </div>
                </div>
                
                <div class="title-reveal-wrapper">
                  <h1 class="display-2 fw-900 text-white mb-2 reveal-text">{{ categoryName }}</h1>
                  <div class="stats-premium-badge">
                    <i class="bi bi-lightning-fill"></i>
                    <span>{{ products.length }} SÉLECTIONS D'ÉLITE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Light (Home Style) -->
      <div class="content-light">
        <div class="container py-5">
          <div *ngIf="products.length === 0" class="empty-state-visual">
            <div class="empty-glow"></div>
            <i class="bi bi-stars"></i>
            <h2 class="fw-800 text-dark">Bientôt disponible</h2>
            <p class="text-muted">Nos experts sélectionnent le meilleur pour vous.</p>
            <a routerLink="/categories" class="btn-return-pro">Découvrir les autres univers</a>
          </div>

          <div class="row g-4" *ngIf="products.length > 0">
            <div class="col-xl-3 col-lg-4 col-sm-6 animate-fade-in-up" *ngFor="let product of products; let i = index" [style.animation-delay]="i * 0.1 + 's'">
              <a [routerLink]="['/products', product.id]" class="product-card-premium-light">
                <div class="img-zone-premium">
                  <div class="img-accent-gradient"></div>
                  <img *ngIf="product.imageUrl" [src]="getImageUrl(product.imageUrl)" [alt]="product.name" class="img-elite">
                  <div *ngIf="!product.imageUrl" class="img-elite-empty">
                    <i class="bi bi-box-seam"></i>
                  </div>
                  
                  <div class="badge-stock-pro" [class.out-pro]="(product.stockQuantity ?? 0) <= 0">
                    <span class="status-dot"></span>
                    {{ (product.stockQuantity ?? 0) > 0 ? 'DISPONIBLE' : 'RUPTURE' }}
                  </div>

                  <div class="overlay-details">
                    <div class="view-pill">Voir Détails</div>
                  </div>
                </div>

                <div class="info-zone-premium">
                  <div class="prefix-cat">Sahtek Elite</div>
                  <h4 class="product-name-premium">{{ product.name }}</h4>
                  
                  <div class="price-action-row-premium">
                    <div class="price-stack">
                      <span class="price-val">{{ product.price | number:'1.2-2' }}</span>
                      <span class="price-cur">TND</span>
                    </div>
                    <button class="btn-cart-pro-light" 
                      [disabled]="(product.stockQuantity ?? 0) <= 0"
                      (click)="$event.preventDefault(); $event.stopPropagation(); addToCart(product)">
                      <i class="bi bi-cart3"></i>
                    </button>
                  </div>
                </div>
                <div class="card-glass-shimmer"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');

    .category-detail-page {
      background: #fcfdfe;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
    }

    /* Ultra-Pro Dark Banner */
    .category-banner-ultra {
      height: 450px;
      background: #020617;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding-top: 60px;
      border-bottom: 3px solid #0062ff;
    }

    .animated-beams .beam {
      position: absolute;
      width: 2px; height: 100%;
      background: linear-gradient(to bottom, transparent, rgba(0, 212, 255, 0.2), transparent);
      animation: sweep-beam 10s infinite linear;
    }
    .beam-1 { left: 20%; animation-delay: 0s; }
    .beam-2 { left: 80%; animation-delay: 5s; }

    @keyframes sweep-beam {
      0% { transform: translateY(-100%) rotate(45deg); }
      100% { transform: translateY(100%) rotate(45deg); }
    }

    .prism-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 20%, rgba(0, 98, 255, 0.1) 0%, transparent 60%);
      z-index: 1;
    }

    .relative-content { position: relative; z-index: 10; }

    .breadcrumb-item a { color: rgba(255,255,255,0.4); text-decoration: none; transition: 0.3s; }
    .breadcrumb-item a:hover { color: #00d4ff; }

    .cat-icon-3d-wrapper {
      position: relative;
      width: 100px; height: 100px;
    }

    .glow-ring-animated {
      position: absolute;
      inset: -5px;
      border: 2px dashed rgba(0, 212, 255, 0.3);
      border-radius: 30px;
      animation: rotate-ring 10s infinite linear;
    }

    @keyframes rotate-ring { 100% { transform: rotate(360deg); } }

    .cat-icon-pro-3d {
      width: 100px; height: 100px;
      background: linear-gradient(135deg, #0062ff, #00d4ff);
      border-radius: 28px;
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem; color: white;
      box-shadow: 0 20px 50px rgba(0, 98, 255, 0.5);
      transition: 0.5s;
    }
    .cat-icon-3d-wrapper:hover .cat-icon-pro-3d { transform: translateZ(50px) rotateY(15deg); }

    .reveal-text {
      animation: reveal-y 1s cubic-bezier(0.77, 0, 0.175, 1);
    }

    @keyframes reveal-y {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .stats-premium-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #00d4ff;
      font-weight: 900;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }

    /* Content Light Premium Cards */
    .content-light {
      margin-top: 50px;
      padding-bottom: 100px;
    }

    .product-card-premium-light {
      background: white;
      border-radius: 28px;
      overflow: hidden;
      display: block;
      height: 100%;
      text-decoration: none;
      border: 1px solid rgba(0,0,0,0.03);
      box-shadow: 0 15px 35px rgba(0,0,0,0.02);
      transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
      position: relative;
    }

    .product-card-premium-light:hover {
      transform: translateY(-12px);
      box-shadow: 0 35px 70px rgba(0,0,0,0.08);
      border-color: #0062ff11;
    }

    .img-zone-premium {
      height: 300px;
      background: #f8fafc;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 25px;
      overflow: hidden;
    }

    .img-accent-gradient {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 30%, rgba(0,98,255,0.02) 100%);
    }

    .img-elite { max-width: 100%; max-height: 100%; object-fit: contain; z-index: 2; transition: transform 0.8s ease; }
    .product-card-premium-light:hover .img-elite { transform: scale(1.1) rotate(2deg); }

    .badge-stock-pro {
      position: absolute; top: 20px; left: 20px; z-index: 10;
      background: rgba(16, 185, 129, 0.1); color: #10b981;
      padding: 7px 15px; border-radius: 50px;
      font-size: 0.75rem; font-weight: 800;
      display: flex; align-items: center; gap: 8px;
    }
    .badge-stock-pro.out-pro { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; box-shadow: 0 0 10px currentColor; }

    .overlay-details {
      position: absolute; inset: 0;
      background: rgba(255,255,255,0.4);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: 0.4s; z-index: 5;
    }
    .product-card-premium-light:hover .overlay-details { opacity: 1; backdrop-filter: blur(5px); }
    
    .view-pill {
      background: #0062ff; color: white; padding: 12px 25px;
      border-radius: 50px; font-weight: 700; font-size: 0.9rem;
      transform: translateY(20px); transition: 0.4s;
    }
    .product-card-premium-light:hover .view-pill { transform: translateY(0); }

    .info-zone-premium { padding: 30px; }
    .prefix-cat { color: #64748b; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 10px; }
    .product-name-premium { color: #0f172a; font-weight: 800; font-size: 1.25rem; margin-bottom: 25px; height: 3.2rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; }

    .price-action-row-premium { display: flex; align-items: center; justify-content: space-between; }
    .price-stack { display: flex; align-items: baseline; gap: 5px; }
    .price-val { font-size: 1.7rem; color: #0f172a; font-weight: 900; }
    .price-cur { font-size: 0.9rem; color: #64748b; font-weight: 700; }

    .btn-cart-pro-light {
      width: 55px; height: 55px;
      border-radius: 18px; background: #f1f5f9;
      color: #0f172a; border: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; transition: 0.3s;
    }
    .btn-cart-pro-light:hover:not(:disabled) { background: #0062ff; color: white; transform: rotate(10deg); box-shadow: 0 12px 24px rgba(0, 98, 255, 0.2); }
    .btn-cart-pro-light:disabled { opacity: 0.3; cursor: not-allowed; }

    .card-glass-shimmer {
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
      transition: 0.8s; z-index: 6;
    }
    .product-card-premium-light:hover .card-glass-shimmer { left: 150%; }

    /* Empty State Visual */
    .empty-state-visual { text-align: center; padding: 120px 0; position: relative; }
    .empty-glow { position: absolute; top: 50%; left: 50%; width: 200px; height: 200px; background: #0062ff; filter: blur(100px); opacity: 0.05; transform: translate(-50%, -50%); }
    .empty-state-visual i { font-size: 6rem; color: #cbd5e1; margin-bottom: 30px; display: block; }
    .btn-return-pro { background: #0f172a; color: white; padding: 15px 40px; border-radius: 18px; font-weight: 700; text-decoration: none; transition: 0.3s; display: inline-block; }
    .btn-return-pro:hover { background: #0062ff; transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
  `]
})
export class CategoryDetailComponent implements OnInit {
  categorySlug: string = '';
  categoryName: string = '';
  products: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categorySlug = params['slug'] || params['name'];
      this.loadCategoryInfo();
    });
  }

  loadCategoryInfo() {
    const category = this.productService.categories.find(c => c.slug === this.categorySlug || c.name === this.categorySlug);
    if (category) {
      this.categoryName = category.displayName;
      this.loadProducts(category.name);
    } else {
      this.categoryName = this.categorySlug;
      this.loadProducts(this.categorySlug);
    }
  }

  loadProducts(apiCategoryName: string) {
    this.productService.getProductsByCategory(apiCategoryName).subscribe({
      next: (data) => {
        this.products = data;
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

  getCategoryIcon(name: string): string {
    const category = this.productService.categories.find(c =>
      c.name === name || c.displayName === name || c.slug === name);
    return category?.icon || 'bi-grid-fill';
  }
}
