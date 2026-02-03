import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Cart, CartItem } from '../../core/models/cart.model';
import { Observable } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
    cart$: Observable<Cart>;

    constructor(
        private cartService: CartService,
        private notificationService: NotificationService,
        private router: Router
    ) {
        this.cart$ = this.cartService.cart$;
    }

    ngOnInit(): void {
        this.cartService.loadCart();
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId).subscribe({
            next: () => this.notificationService.success('Article supprimé du panier'),
            error: () => this.notificationService.error('Erreur lors de la suppression')
        });
    }

    clearCart(): void {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            this.cartService.clearCart().subscribe({
                next: () => this.notificationService.info('Panier vidé'),
                error: () => this.notificationService.error('Erreur lors du vidage du panier')
            });
        }
    }

    updateQuantity(productId: number, newQuantity: number, currentQuantity: number): void {
        if (newQuantity < 1) return;
        const diff = newQuantity - currentQuantity;
        if (diff === 0) return;

        this.cartService.addToCart(productId, diff).subscribe({
            next: () => this.notificationService.success('Quantité mise à jour'),
            error: () => this.notificationService.error('Erreur de mise à jour')
        });
    }

    incrementItem(item: CartItem): void {
        const productId = item.product?.id || item.productId || (item as any).id;
        if (productId) {
            this.cartService.addToCart(productId, 1).subscribe({
                next: () => this.notificationService.success('Article ajouté (+1)'),
                error: () => this.notificationService.error('Erreur lors de l\'ajout')
            });
        }
    }

    decrementItem(item: CartItem): void {
        const productId = item.product?.id || item.productId || (item as any).id;
        const currentQty = this.getItemQuantity(item);
        if (productId && currentQty > 1) {
            this.cartService.addToCart(productId, -1).subscribe({
                next: () => this.notificationService.info('Article retiré (-1)'),
                error: () => this.notificationService.error('Erreur lors du retrait')
            });
        }
    }

    getItemPrice(item: CartItem): number {
        return (item as any).price || (item as any).prix || (item as any).productPrice || (item as any).unitPrice || item.product?.price || 0;
    }

    getItemQuantity(item: CartItem): number {
        return item.quantity || item.quantite || 0;
    }

    checkout(): void {
        this.router.navigate(['/checkout']);
    }

    getImageUrl(imageUrl: string | undefined): string {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:9002/sahtek_db/sahtek_db/api/products/image/${imageUrl}`;
    }

    getItemImage(item: CartItem): string {
        const imageUrl = item.product?.imageUrl || item.productImageUrl || item.productImage || item.image || item.photo || '';
        return this.getImageUrl(imageUrl);
    }
}
