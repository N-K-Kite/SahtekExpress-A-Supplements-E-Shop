import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Order {
    id: number;
    user_id: number;
    items: any[];
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    shippingAddress: string;
    phoneNumber: string;
    firstName?: string; // Optional if backend joins with user or if saved in order
    lastName?: string;
    email?: string;
    transactionId?: string;
    created_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private baseUrl = 'http://localhost:9002/sahtek_db/sahtek_db/api';
    private ordersUrl = `${this.baseUrl}/orders`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            const authHeader = `Basic ${token}`;
            headers = headers.set('Authorization', authHeader);
        }
        return headers;
    }

    // Get all orders (admin only)
    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}`, { headers: this.getHeaders() });
    }

    // Delete order
    deleteOrder(id: number): Observable<any> {
        return this.http.delete(`${this.ordersUrl}/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    // Update payment status (e.g., PENDING -> COMPLETED)
    // Unified status update method
    updatePaymentStatus(id: number, status: string): Observable<any> {
        // Confirmed: Backend expects a JSON body { "status": "VALUE" }
        return this.http.put(`${this.ordersUrl}/${id}/status`, { status }, {
            headers: this.getHeaders(),
            responseType: 'text' as 'json'
        });
    }
}
