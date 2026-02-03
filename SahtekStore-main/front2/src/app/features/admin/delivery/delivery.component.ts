import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-delivery',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './delivery.component.html',
    styles: [`
        .delivery-container {
            background: #f8f9fa;
            min-height: 100%;
            padding-bottom: 2rem;
        }
        .card-order {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            margin-bottom: 1.5rem;
            border: none;
            overflow: hidden;
            transition: transform 0.2s;
        }
        .card-order:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        .order-header {
            padding: 1rem 1.5rem;
            background: #fff;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .order-body {
            padding: 1.5rem;
        }
        .status-tracker {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
            position: relative;
        }
        .status-tracker::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: #e9ecef;
            z-index: 0;
            transform: translateY(-50%);
        }
        .status-step {
            position: relative;
            z-index: 1;
            background: white;
            padding: 0 0.5rem;
            text-align: center;
            color: #ccc;
        }
        .status-step.active {
            color: #0d6efd;
            font-weight: 600;
        }
        .status-step i {
            font-size: 1.2rem;
            display: block;
            margin-bottom: 0.25rem;
            background: white;
            border-radius: 50%;
            border: 2px solid #e9ecef;
            width: 32px;
            height: 32px;
            line-height: 28px;
            margin-left: auto;
            margin-right: auto;
        }
        .status-step.active i {
            border-color: #0d6efd;
            background: #0d6efd;
            color: white;
        }
        .btn-action {
            width: 100%;
            margin-top: 0.5rem;
            padding: 0.75rem;
            border-radius: 8px;
            font-weight: 500;
        }
        .btn-danger-soft {
            color: #dc3545;
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid rgba(220, 53, 69, 0.15);
            padding: 0.6rem 1.2rem;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            display: flex;
            align-items: center;
        }
        .btn-danger-soft:hover {
            background: #dc3545;
            color: white;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2);
            transform: translateY(-1px);
        }
    `]
})
export class DeliveryComponent implements OnInit {
    orders: Order[] = [];
    isLoading = true;

    // Ordered steps for delivery logic
    steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

    constructor(
        private orderService: OrderService,
        private productService: ProductService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;
        this.orderService.getAllOrders().subscribe({
            next: (data) => {
                // Filter only relevant order statuses for this view
                const relevantStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                this.orders = data.filter(o => relevantStatuses.includes(o.status?.toUpperCase()));
                this.isLoading = false;
            },
            error: (err) => {
                this.notificationService.error('Impossible de charger les livraisons.');
                this.isLoading = false;
            }
        });
    }

    updateStatus(id: number, newStatus: string) {
        this.orderService.updatePaymentStatus(id, newStatus).subscribe({
            next: () => {
                this.notificationService.success(`Statut mis à jour : ${newStatus}`);
                this.loadOrders();
            },
            error: (err) => {
                console.error(err);
                this.notificationService.error('Erreur de mise à jour.');
            }
        });
    }

    finalizeSale(order: Order) {
        if (confirm('Confirmer la vente ? Si le stock tombe à 0, le produit sera désactivé du site.')) {
            this.isLoading = true;
            let errors = 0;
            let processed = 0;

            if (!order.items || order.items.length === 0) {
                this.isLoading = false;
                return;
            }

            order.items.forEach(item => {
                const prodId = item.product?.id || item.productId || item.product_id || item.id;
                const quantitySold = item.quantity || 1;

                if (prodId) {
                    // 1. Get current product state to check stock
                    this.productService.getProduct(prodId).subscribe({
                        next: (product) => {
                            const currentStock = product.stockQuantity || 0;
                            const newStock = currentStock - quantitySold;

                            if (newStock > 0) {
                                // 2a. Still in stock -> Update quantity only
                                const updatedProduct = { ...product, stockQuantity: newStock };
                                this.productService.updateProduct(prodId, updatedProduct).subscribe({
                                    next: () => {
                                        processed++;
                                        this.checkCompletion(processed, order.items.length, errors, order.id);
                                    },
                                    error: (err) => {
                                        console.error('Update Stock Error', err);
                                        errors++;
                                        processed++;
                                        this.checkCompletion(processed, order.items.length, errors, order.id);
                                    }
                                });
                            } else {
                                // 2b. Out of stock -> Soft Delete (Hide from site)
                                this.productService.deleteProductStandard(prodId).subscribe({
                                    next: () => {
                                        processed++;
                                        this.checkCompletion(processed, order.items.length, errors, order.id);
                                    },
                                    error: (err) => {
                                        console.error('Soft Delete Error', err);
                                        errors++;
                                        processed++;
                                        this.checkCompletion(processed, order.items.length, errors, order.id);
                                    }
                                });
                            }
                        },
                        error: () => {
                            // If product not found (already deleted?), skip
                            processed++;
                            this.checkCompletion(processed, order.items.length, errors, order.id);
                        }
                    });
                } else {
                    processed++;
                    this.checkCompletion(processed, order.items.length, errors, order.id);
                }
            });
        }
    }

    private checkCompletion(processed: number, total: number, errors: number, orderId: number) {
        if (processed === total) {
            this.isLoading = false;
            if (errors === 0) {
                this.notificationService.success('Vente finalisée ! Produits supprimés du stock.');
                // Optionally update order status to SOLD or archived, or confirm deletion
                // For now, reload serves to remove them if backend logic handles cascading deletes,
                // or if we just want to refresh the view.
                this.loadOrders();
            } else {
                this.notificationService.info(`Vente partielle. ${errors} produits n'ont pas pu être supprimés.`);
                this.loadOrders();
            }
        }
    }

    getImageUrl(imageUrl: string | undefined): string {
        if (!imageUrl) return 'assets/images/placeholder.jpg';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:9002/sahtek_db/sahtek_db/api/products/image/${imageUrl}`;
    }

    getItemImage(item: any): string {
        const imageUrl = item.product?.imageUrl || item.productImageUrl || item.productImage || item.image || item.photo || '';
        return this.getImageUrl(imageUrl);
    }

    calculateOrderTotal(order: Order): number {
        if (!order || !order.items) return 0;
        return order.items.reduce((acc, item: any) => {
            const price = item.price || item.prix || item.unitPrice || item.product?.price || 0;
            const qty = item.quantity || item.quantite || 1;
            return acc + (Number(price) * Number(qty));
        }, 0);
    }

    clearAllDeliveries() {
        if (this.orders.length === 0) {
            this.notificationService.info('Aucune livraison à supprimer.');
            return;
        }

        if (confirm('Vider tout le suivi des livraisons ?')) {
            const total = this.orders.length;
            let deletedCount = 0;

            this.orders.forEach(order => {
                this.orderService.deleteOrder(order.id).subscribe({
                    next: () => {
                        deletedCount++;
                        if (deletedCount === total) {
                            this.notificationService.success('Suivi vidé.');
                            this.loadOrders();
                        }
                    },
                    error: () => {
                        console.error(`Error deleting order ${order.id}`);
                    }
                });
            });
        }
    }
}
