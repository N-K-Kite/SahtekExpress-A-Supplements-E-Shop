import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="categories-page">
      <!-- Ultra-Dynamic Premium Hero -->
      <div class="hero-premium-ultra">
        <div class="mesh-gradient-bg"></div>
        <div class="glass-panels">
          <div class="glass-panel panel-1"></div>
          <div class="glass-panel panel-2"></div>
          <div class="glass-panel panel-3"></div>
        </div>
        
        <div class="container text-center relative-content">
          <div class="hero-labels" data-aos="fade-down">
            <span class="elite-label">EXCELLENCE</span>
            <div class="label-line"></div>
            <span class="performance-label">PERFORMANCE</span>
          </div>
          
          <h1 class="hero-title">
            <span class="title-top">EXPLOREZ VOS</span>
            <span class="title-bottom">UNIVERS <span class="text-glow-breath">ELITE</span></span>
          </h1>
          
          <p class="hero-desc-pro">
            Découvrez une sélection rigoureuse des meilleurs suppléments mondiaux pour transformer votre physique.
          </p>
          
          <div class="scroll-pro">
            <div class="scroll-mouse">
              <div class="scroll-wheel"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Light Content Section -->
      <div class="content-light">
        <div class="container py-5">
          <div class="row g-4 justify-content-center">
            <div class="col-xl-4 col-md-6" *ngFor="let cat of categories; let i = index">
              <a [routerLink]="['/categories', cat.slug]" class="category-card-pro">
                <div class="card-inner-pro">
                  <div class="icon-wrapper-pro">
                    <div class="icon-back" [style.background]="cat.color || '#0062ff'"></div>
                    <div class="icon-front">
                      <i class="bi" [ngClass]="cat.icon"></i>
                    </div>
                  </div>
                  
                  <div class="card-body-pro">
                    <h3 class="cat-name-pro">{{ cat.displayName }}</h3>
                    <p class="cat-desc-pro">{{ cat.description }}</p>
                    
                    <div class="cat-action-pro">
                      <span>DÉCOUVRIR</span>
                      <div class="action-circle">
                        <i class="bi bi-chevron-right"></i>
                      </div>
                    </div>
                  </div>
                  <div class="shimmer-pro"></div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');

    .categories-page {
      background: #fcfdfe;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
    }

    /* Ultra-Dynamic Hero */
    .hero-premium-ultra {
      height: 600px;
      background: #020617;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-bottom: 2px solid rgba(0, 98, 255, 0.2);
    }

    .mesh-gradient-bg {
      position: absolute;
      inset: 0;
      background-color: #020617;
      background-image: 
        radial-gradient(at 0% 0%, rgba(0, 98, 255, 0.3) 0, transparent 50%),
        radial-gradient(at 100% 0%, rgba(0, 212, 255, 0.2) 0, transparent 50%),
        radial-gradient(at 50% 100%, rgba(124, 58, 237, 0.15) 0, transparent 50%);
      filter: blur(40px);
      animation: mesh-move 20s infinite alternate ease-in-out;
    }

    @keyframes mesh-move {
      0% { transform: scale(1) translate(0, 0); }
      100% { transform: scale(1.1) translate(20px, 20px); }
    }

    .glass-panels {
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    .glass-panel {
      position: absolute;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 40px;
      animation: float-panel 10s infinite alternate ease-in-out;
    }

    .panel-1 { width: 300px; height: 300px; top: -100px; left: -50px; transform: rotate(45deg); animation-delay: 0s; }
    .panel-2 { width: 200px; height: 200px; bottom: 10%; right: -50px; transform: rotate(-15deg); animation-delay: -2s; }
    .panel-3 { width: 150px; height: 150px; top: 20%; right: 15%; transform: rotate(30deg); animation-delay: -4s; }

    @keyframes float-panel {
      0% { transform: translate(0, 0) rotate(inherit); }
      100% { transform: translate(30px, -30px) rotate(inherit); }
    }

    .relative-content { position: relative; z-index: 10; }

    .hero-labels {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 2rem;
    }

    .elite-label, .performance-label {
      font-weight: 800;
      font-size: 0.8rem;
      letter-spacing: 4px;
      color: #00d4ff;
    }

    .label-line {
      width: 50px;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
    }

    .hero-title {
      font-weight: 900;
      line-height: 1;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .title-top { font-size: 3rem; color: #fff; opacity: 0.9; }
    .title-bottom { font-size: 5.5rem; color: #fff; letter-spacing: -2px; }

    .text-glow-breath {
      color: #00d4ff;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
      animation: glow-breath 3s infinite alternate;
    }

    @keyframes glow-breath {
      0% { text-shadow: 0 0 10px rgba(0, 212, 255, 0.3); }
      100% { text-shadow: 0 0 30px rgba(0, 212, 255, 0.8); }
    }

    .hero-desc-pro {
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.25rem;
      max-width: 600px;
      margin: 0 auto 3rem;
      line-height: 1.6;
      font-weight: 300;
    }

    .scroll-pro {
      display: flex;
      justify-content: center;
    }

    .scroll-mouse {
      width: 30px; height: 50px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      position: relative;
    }

    .scroll-wheel {
      width: 4px; height: 8px;
      background: #00d4ff;
      border-radius: 2px;
      position: absolute;
      top: 10px; left: 50%;
      transform: translateX(-50%);
      animation: scroll-wheel 2s infinite;
    }

    @keyframes scroll-wheel {
      0% { transform: translate(-50%, 0); opacity: 1; }
      100% { transform: translate(-50%, 15px); opacity: 0; }
    }

    /* Content Light Adjustments */
    .content-light {
      margin-top: 40px;
      padding-bottom: 100px;
    }

    .category-card-pro {
      display: block;
      text-decoration: none;
      height: 100%;
      perspective: 1000px;
    }

    .card-inner-pro {
      background: white;
      border-radius: 35px;
      padding: 45px;
      height: 100%;
      border: 1px solid rgba(0, 0, 0, 0.03);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.02);
      position: relative;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
    }

    .category-card-pro:hover .card-inner-pro {
      transform: translateY(-15px) rotateX(5deg);
      box-shadow: 0 40px 80px rgba(0, 0, 0, 0.08);
      border-color: #0062ff22;
    }

    .icon-wrapper-pro {
      width: 90px; height: 90px;
      margin-bottom: 35px;
      position: relative;
    }

    .icon-back {
      position: absolute;
      inset: 8px;
      filter: blur(25px);
      opacity: 0.15;
      border-radius: 25px;
      transition: all 0.5s ease;
    }

    .icon-front {
      width: 90px; height: 90px;
      background: #f8fafc;
      border-radius: 25px;
      display: flex; align-items: center; justify-content: center;
      font-size: 2.8rem; color: #0062ff;
      position: relative; z-index: 2;
      transition: all 0.5s ease;
    }

    .category-card-pro:hover .icon-front {
      background: #0062ff;
      color: white;
      transform: scale(1.1) rotate(-10deg);
    }

    .category-card-pro:hover .icon-back {
      opacity: 0.4;
      transform: scale(1.4);
    }

    .cat-name-pro {
      color: #0f172a;
      font-weight: 800;
      font-size: 1.8rem;
      margin-bottom: 15px;
    }

    .cat-desc-pro {
      color: #64748b;
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 30px;
      font-weight: 400;
    }

    .cat-action-pro {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 15px;
      color: #0062ff;
      font-weight: 800;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .action-circle {
      width: 40px; height: 40px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: 0.4s;
    }

    .category-card-pro:hover .action-circle {
      background: #0062ff;
      color: white;
      transform: translateX(10px);
    }

    .shimmer-pro {
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 98, 255, 0.03), transparent);
      transition: 0.8s;
    }
    .category-card-pro:hover .shimmer-pro { left: 100%; }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: any[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.categories = this.productService.categories;
  }
}
