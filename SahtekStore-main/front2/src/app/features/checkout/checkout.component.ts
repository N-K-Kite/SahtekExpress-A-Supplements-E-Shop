import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router, RouterModule } from '@angular/router';
import { Cart, CartItem } from '../../core/models/cart.model';
import { Observable, take } from 'rxjs';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
    cart$: Observable<Cart>;

    checkoutData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'LAIVRAISON',
        promoCode: ''
    };

    isSubmitting = false;

    constructor(
        private cartService: CartService,
        private authService: AuthService,
        private notificationService: NotificationService,
        private router: Router
    ) {
        this.cart$ = this.cartService.cart$;
    }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user) {
            this.checkoutData.firstName = user.firstName || '';
            this.checkoutData.lastName = user.lastName || '';
            this.checkoutData.email = user.email || '';
        }
    }

    getItemPrice(item: CartItem): number {
        return (item as any).price || (item as any).prix || (item as any).productPrice || (item as any).unitPrice || item.product?.price || 0;
    }

    getItemQuantity(item: CartItem): number {
        return item.quantity || item.quantite || 0;
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

    placeOrder() {
        if (this.isSubmitting) return;

        this.isSubmitting = true;

        // Get current cart state to include in notification
        this.cart$.pipe(take(1)).subscribe(cart => {
            if (!cart || cart.items.length === 0) {
                this.isSubmitting = false;
                return;
            }

            const productNames = cart.items
                .map(item => item.product?.name || item.productName || 'Produit')
                .join(', ');
            const totalAmount = cart.totalAmount;

            this.cartService.checkout(this.checkoutData).subscribe({
                next: (response: any) => {
                    const orderId = response?.id || response?.orderId || 'N/A';
                    const message = `Sahtek Nutrition : Votre commande #${orderId} (${productNames}) d'un montant total de ${totalAmount} DT a été enregistrée avec succès. Nous vous contacterons prochainement pour la confirmation.`;
                    this.notificationService.success(message);

                    // Clear cart locally and on server
                    this.cartService.clearCart().subscribe();

                    this.router.navigate(['/']);
                    this.isSubmitting = false;
                },
                error: (err) => {
                    const detailedError = err.error?.message || err.message || 'Une erreur est survenue';
                    this.notificationService.error(`Erreur: ${detailedError}`);
                    this.isSubmitting = false;
                }
            });
        });
    }

    applyPromo() {
        if (this.checkoutData.promoCode) {
            this.notificationService.info(`Code promo "${this.checkoutData.promoCode}" appliqué (Simulation)`);
        }
    }
}
