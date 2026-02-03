import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap, throwError } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private baseUrl = 'http://localhost:9002/sahtek_db/sahtek_db/api';
    private cartUrl = `${this.baseUrl}/carts`;

    private cartSubject = new BehaviorSubject<Cart>({ items: [], totalAmount: 0, totalItems: 0 });
    public cart$ = this.cartSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notificationService: NotificationService
    ) {
        this.loadCart();
    }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            // Use Basic instead of Bearer as per user's Postman config
            const authHeader = `Basic ${token}`;
            headers = headers.set('Authorization', authHeader);
        }
        return headers;
    }

    public loadCart() {
        const user = this.authService.getUser();
        if (user && user.id) {
            this.http.get<any>(`${this.cartUrl}/user/${user.id}`, { headers: this.getHeaders() }).subscribe({
                next: (response) => {
                    // Check if response is the items array directly or a cart object
                    const items = Array.isArray(response) ? response : (response.items || []);
                    this.updateCartState(items);
                },
                error: (err) => {
                    this.notificationService.error('Erreur lors du chargement du panier.');
                }
            });
        }
    }

    private updateCartState(items: CartItem[]) {
        const totalAmount = items.reduce((sum, item: any) => {
            // Check all possible naming conventions for price and quantity
            const price = item.price || item.prix || item.productPrice || item.unitPrice || item.product?.price || 0;
            const qty = item.quantity || item.quantite || 0;
            return sum + (price * qty);
        }, 0);
        const totalItems = items.reduce((sum, item: any) => sum + (item.quantity || item.quantite || 0), 0);

        this.cartSubject.next({
            items: items || [],
            totalAmount,
            totalItems
        });
    }

    addToCart(productId: number, quantity: number = 1): Observable<any> {
        const user = this.authService.getUser();
        if (!user || !user.id) {
            return of(null);
        }

        const payload = {
            productId: productId,
            quantity: quantity
        };

        return this.http.post(`${this.cartUrl}/user/${user.id}/add`, payload, {
            headers: this.getHeaders(),
            responseType: 'text' as 'json' // Handle potential plain text success messages
        }).pipe(
            tap(() => this.loadCart())
        );
    }

    removeFromCart(productId: number): Observable<any> {
        const user = this.authService.getUser();
        if (!user || !user.id) return of(null);

        return this.http.delete(`${this.cartUrl}/user/${user.id}/item/${productId}`, {
            headers: this.getHeaders(),
            responseType: 'text' as 'json'
        }).pipe(
            tap(() => this.loadCart())
        );
    }

    clearCart(): Observable<any> {
        const user = this.authService.getUser();
        if (!user || !user.id) return of(null);

        return this.http.delete(`${this.cartUrl}/user/${user.id}/clear`, {
            headers: this.getHeaders(),
            responseType: 'text' as 'json'
        }).pipe(
            tap(() => this.updateCartState([]))
        );
    }

    checkout(orderData: any): Observable<any> {
        const user = this.authService.getUser();
        if (!user || !user.id) return of(null);

        // Sanitize phoneNumber (remove spaces, +, etc.)
        let rawPhone = orderData.phone || orderData.phoneNumber || '';
        let sanitizedPhone = rawPhone.replace(/\D/g, '');

        // If it's a standard 8-digit Tunisian number, prepend country code 216
        if (sanitizedPhone.length === 8) {
            sanitizedPhone = '216' + sanitizedPhone;
        }

        const city = orderData.city || '';
        const shippingAddress = city.toLowerCase().includes('tunisie') ? city : (city ? `${city}, Tunisie` : 'Tunis, Tunisie');

        const payload = {
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            email: orderData.email,
            shippingAddress: shippingAddress,
            city: orderData.city,
            zipCode: orderData.zipCode,
            paymentMethod: orderData.paymentMethod,
            phoneNumber: sanitizedPhone
        };

        return this.http.post(`${this.cartUrl}/user/${user.id}/checkout`, payload, {
            headers: this.getHeaders()
        });
    }
}
