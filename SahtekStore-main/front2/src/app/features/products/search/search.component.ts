import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
    query: string = '';
    products: Product[] = [];
    loading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.query = params['keyword'] || params['query'] || '';
            if (this.query) {
                this.performSearch();
            } else {
                this.loading = false;
            }
        });
    }

    performSearch() {
        this.loading = true;
        this.productService.searchProducts(this.query).subscribe({
            next: (results) => {
                this.products = results;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors de la recherche:', error);
                this.loading = false;
            }
        });
    }

    getImageUrl(imageUrl: string): string {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:9002/sahtek_db/sahtek_db/api/products/image/${imageUrl}`;
    }

    addToCart(product: Product) {
        if (product.id) {
            this.cartService.addToCart(product.id).subscribe();
        }
    }
}

