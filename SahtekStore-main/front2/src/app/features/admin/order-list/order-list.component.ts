import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './order-list.component.html',
    styles: [`
        .table-responsive {
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            padding: 1.5rem;
        }
        .order-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 10px;
        }
        .order-table th {
            padding: 1rem;
            color: #6c757d;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            border-bottom: 2px solid #f0f0f0;
        }
        .order-table td {
            padding: 1rem;
            background: white;
            border-top: 1px solid #f8f9fa;
            border-bottom: 1px solid #f8f9fa;
            vertical-align: middle;
        }
        .order-table tr:hover td {
            background: #f8f9fa;
        }
        .badge-custom {
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .badge-pending { background: #fff3cd; color: #856404; }
        .badge-completed { background: #d4edda; color: #155724; }
        .badge-cancelled { background: #f8d7da; color: #721c24; }
        
        .action-btn {
            border: none;
            background: none;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .btn-validate { color: #28a745; background: rgba(40, 167, 69, 0.1); }
        .btn-validate:hover { background: #28a745; color: white; }
        
        .btn-cancel { color: #dc3545; background: rgba(220, 53, 69, 0.1); }
        .btn-cancel:hover { background: #dc3545; color: white; }
        
        .btn-danger-soft {
            color: #dc3545;
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid rgba(220, 53, 69, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-danger-soft:hover {
            background: #dc3545;
            color: white;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
        }

        .btn-delete { color: #6c757d; background: rgba(108, 117, 125, 0.1); }
        .btn-delete:hover { background: #6c757d; color: white; }

        .items-list {
            font-size: 0.9rem;
            color: #555;
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .items-list li { margin-bottom: 4px; }
        .user-info {
            font-size: 0.9rem;
        }
        .user-name { font-weight: 600; color: #2c3e50; display: block; }
        .user-contact { display: block; font-size: 0.8rem; color: #6c757d; }

        /* Ultra-Premium Receipt Modal Styles */
        .receipt-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(12px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.4s ease;
        }

        .receipt-container {
            background: white;
            width: 100%;
            max-width: 800px;
            max-height: 95vh;
            border-radius: 32px;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 40px 100px rgba(0,0,0,0.4);
            animation: slideUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
            border: 1px solid rgba(255,255,255,0.1);
        }

        .receipt-pro {
            padding: 50px;
            color: #0f172a;
            position: relative;
        }

        .receipt-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 8rem;
            font-weight: 900;
            color: rgba(0, 98, 255, 0.03);
            pointer-events: none;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .receipt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #f1f5f9;
            padding-bottom: 35px;
            margin-bottom: 40px;
        }

        .receipt-logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-box {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #0062ff, #00d2ff);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.8rem;
            box-shadow: 0 10px 20px rgba(0,98,255,0.2);
        }

        .brand-info h2 { font-weight: 800; margin: 0; font-size: 2rem; letter-spacing: -0.5px; }
        .brand-info p { margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 500; }

        .receipt-meta { text-align: right; }
        .receipt-title-badge {
            background: #0f172a;
            color: white;
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            display: inline-block;
        }
        .receipt-no { font-weight: 900; font-size: 1.5rem; color: #0f172a; display: block; margin-bottom: 4px;}
        .receipt-date { color: #64748b; font-size: 0.85rem; font-weight: 600; }

        .info-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }

        .info-box {
            padding: 24px;
            background: #f8fafc;
            border-radius: 20px;
            border: 1px solid #f1f5f9;
        }

        .info-label {
            font-size: 0.7rem;
            font-weight: 800;
            color: #0062ff;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
            display: block;
        }

        .client-name { font-weight: 800; font-size: 1.1rem; margin-bottom: 10px; color: #0f172a; display: block;}
        .info-item { display: flex; align-items: center; gap: 10px; color: #475569; font-size: 0.9rem; margin-bottom: 6px;}
        .info-item i { color: #94a3b8; font-size: 0.8rem; }

        .items-table {
            width: 100%;
            margin-bottom: 40px;
            border-collapse: separate;
            border-spacing: 0;
        }

        .items-table th {
            padding: 15px 20px;
            background: #f1f5f9;
            color: #475569;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .items-table th:first-child { border-radius: 12px 0 0 12px; }
        .items-table th:last-child { border-radius: 0 12px 12px 0; }

        .items-table td {
            padding: 20px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.95rem;
        }

        .prod-id { color: #94a3b8; font-family: monospace; font-size: 0.8rem; }
        .prod-name { font-weight: 700; color: #0f172a; }

        .grand-total-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }

        .total-summary {
            width: 320px;
            background: #0f172a;
            color: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(15,23,42,0.2);
        }

        .total-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .total-line.final {
            border: none;
            margin: 0;
            padding: 0;
        }

        .total-final-label { font-weight: 600; font-size: 1rem; opacity: 0.7; }
        .total-final-value { font-weight: 900; font-size: 2.2rem; display: block; }

        .receipt-footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .thank-you { max-width: 300px; }
        .thank-you h4 { font-weight: 800; size: 1.2rem; margin-bottom: 10px; }
        .thank-you p { color: #64748b; font-size: 0.85rem; margin: 0; line-height: 1.5;}

        .signature-box {
            text-align: center;
            width: 200px;
        }
        .sig-line { border-bottom: 1px solid #0f172a; height: 40px; margin-bottom: 10px; }
        .sig-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

        .receipt-actions {
            display: flex;
            gap: 15px;
            margin-top: 40px;
            border-top: 1px solid #f1f5f9;
            padding: 30px 50px;
            background: #f8fafc;
        }

        button.btn-pro {
            padding: 16px 30px;
            border-radius: 16px;
            font-weight: 800;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .btn-print {
            background: linear-gradient(135deg, #0062ff, #00d2ff);
            color: white;
            border: none;
            box-shadow: 0 10px 20px rgba(0,98,255,0.2);
        }

        .btn-print:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,98,255,0.3); }

        .btn-close-pro {
            background: white;
            color: #0f172a;
            border: 2px solid #f1f5f9;
        }

        .btn-close-pro:hover { background: #f1f5f9; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media print {
            body { background: white; }
            .receipt-modal-overlay { background: white; padding: 0; position: static; }
            .receipt-container { box-shadow: none; border: none; width: 100%; max-width: 100%; position: static; max-height: none; }
            .receipt-actions { display: none !important; }
            .receipt-pro { padding: 30px; }
            .total-summary { background: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact; }
        }
    `]
})
export class OrderListComponent implements OnInit {
    orders: Order[] = [];
    isLoading = true;
    showReceipt = false;
    selectedOrder: Order | null = null;

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
                this.orders = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Load Orders Error:', err);
                const message = err.error?.message || err.statusText || 'Erreur inconnue';
                this.notificationService.error(`Impossible de charger les commandes: ${message}`);
                this.isLoading = false;
            }
        });
    }

    deleteOrder(id: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            this.orderService.deleteOrder(id).subscribe({
                next: () => {
                    this.notificationService.success('Commande supprimée.');
                    this.loadOrders();
                },
                error: () => this.notificationService.error('Erreur lors de la suppression.')
            });
        }
    }

    updateStatus(id: number, newStatus: string) {
        // Find the order to get items for stock update
        const order = this.orders.find(o => o.id === id);

        this.orderService.updatePaymentStatus(id, newStatus).subscribe({
            next: () => {
                // If order is confirmed, reduce stock for each product
                if (newStatus === 'CONFIRMED' && order && order.items) {
                    this.reduceStockForOrder(order);
                }
                this.notificationService.success(`Statut mis à jour : ${newStatus}`);
                this.loadOrders();
            },
            error: (err) => {
                console.error('Update Error:', err);
                const message = err.error?.message || err.statusText || 'Erreur inconnue';
                this.notificationService.error(`Erreur (${err.status}): ${message}`);
            }
        });
    }

    viewReceipt(order: Order) {
        this.selectedOrder = order;
        this.showReceipt = true;
    }

    closeReceipt() {
        this.showReceipt = false;
        this.selectedOrder = null;
    }

    printReceipt() {
        const printContent = document.getElementById('receipt-content');
        if (!printContent) return;

        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Reçu Officiel - Sahtek Nutrition</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
                            body { font-family: 'Outfit', sans-serif; padding: 0; margin: 0; background: white; color: #0f172a; }
                            .receipt-pro { padding: 40px; position: relative; }
                            .receipt-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 8rem; font-weight: 900; color: rgba(0, 98, 255, 0.03); pointer-events: none; text-transform: uppercase; white-space: nowrap; }
                            .receipt-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
                            .receipt-logo { display: flex; align-items: center; gap: 15px; }
                            .logo-box { width: 50px; height: 50px; background: #0062ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; -webkit-print-color-adjust: exact; }
                            .brand-info h2 { font-weight: 800; margin: 0; font-size: 1.8rem; }
                            .brand-info p { margin: 0; color: #64748b; font-size: 0.85rem; }
                            .receipt-meta { text-align: right; }
                            .receipt-title-badge { background: #0f172a; color: white; padding: 4px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; -webkit-print-color-adjust: exact; }
                            .receipt-no { font-weight: 800; font-size: 1.3rem; display: block; margin-top: 8px; }
                            .receipt-date { color: #64748b; font-size: 0.8rem; }
                            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                            .info-box { padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; -webkit-print-color-adjust: exact; }
                            .info-label { font-size: 0.65rem; font-weight: 800; color: #0062ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                            .client-name { font-weight: 800; font-size: 1rem; margin-bottom: 6px; display: block; }
                            .info-item { color: #475569; font-size: 0.85rem; margin-bottom: 4px; }
                            .items-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
                            .items-table th { padding: 12px 15px; background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; text-align: left; -webkit-print-color-adjust: exact; }
                            .items-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
                            .grand-total-section { display: flex; justify-content: flex-end; }
                            .total-summary { width: 250px; background: #0f172a; color: white; padding: 20px; border-radius: 16px; -webkit-print-color-adjust: exact; }
                            .total-final-label { font-weight: 600; font-size: 0.85rem; opacity: 0.7; }
                            .total-final-value { font-weight: 900; font-size: 1.5rem; display: block; }
                            .receipt-footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; }
                            .thank-you h4 { font-weight: 800; size: 1.1rem; margin-bottom: 5px; }
                            .thank-you p { color: #64748b; font-size: 0.8rem; line-height: 1.4; margin: 0; }
                            .signature-box { text-align: center; width: 150px; }
                            .sig-line { border-bottom: 1px solid #0f172a; height: 30px; margin-bottom: 8px; }
                            .sig-label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
                            @media print { .no-print { display: none; } }
                        </style>
                    </head>
                    <body onload="setTimeout(function(){ window.print(); window.close(); }, 500)">
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    }

    calculateOrderTotal(order: Order): number {
        if (!order || !order.items) return 0;
        return order.items.reduce((acc, item: any) => {
            const price = item.price || item.prix || item.unitPrice || item.product?.price || 0;
            const qty = item.quantity || item.quantite || 1;
            return acc + (Number(price) * Number(qty));
        }, 0);
    }

    clearAllOrders() {
        if (this.orders.length === 0) {
            this.notificationService.info('Aucune commande à supprimer.');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir vider tout l\'historique des commandes ? Cette action est irréversible.')) {
            let deletedCount = 0;
            const total = this.orders.length;

            this.orders.forEach(order => {
                this.orderService.deleteOrder(order.id).subscribe({
                    next: () => {
                        deletedCount++;
                        if (deletedCount === total) {
                            this.notificationService.success('Historique vidé avec succès.');
                            this.loadOrders();
                        }
                    },
                    error: () => {
                        console.error(`Erreur lors de la suppression de la commande ${order.id}`);
                    }
                });
            });
        }
    }

    // Reduce stock for all products in an order
    private reduceStockForOrder(order: Order) {
        if (!order.items || order.items.length === 0) return;

        order.items.forEach((item: any) => {
            const productId = item.productId || item.product_id || item.product?.id;
            const quantity = item.quantity || item.quantite || 1;

            if (productId && quantity > 0) {
                this.productService.updateStock(productId, quantity).subscribe({
                    next: () => {
                        console.log(`Stock réduit pour produit ${productId}: -${quantity}`);
                    },
                    error: (err) => {
                        console.error(`Erreur réduction stock produit ${productId}:`, err);
                    }
                });
            }
        });
    }

    getStatusBadge(status: string): string {
        if (!status) return 'badge-pending';
        switch (status.toUpperCase()) {
            case 'DELIVERED':
            case 'CONFIRMED': return 'badge-completed'; // Green for confirmed
            case 'PROCESSING': return 'badge-primary';
            case 'SHIPPED': return 'badge-warning';
            case 'CANCELLED':
            case 'CANCELED': return 'badge-cancelled';
            default: return 'badge-pending';
        }
    }

    getStatusLabel(status: string): string {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': return 'Livrée';
            case 'CONFIRMED': return 'Confirmée';
            case 'PROCESSING': return 'En Traitement';
            case 'SHIPPED': return 'Expédiée';
            case 'CANCELLED':
            case 'CANCELED': return 'Annulée';
            default: return 'En Attente';
        }
    }

    getImageUrl(imageUrl: string | undefined): string {
        if (!imageUrl) return 'assets/images/placeholder.jpg'; // Verify placeholder path
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:9002/sahtek_db/sahtek_db/api/products/image/${imageUrl}`;
    }

    getItemImage(item: any): string {
        // Handle various possible field names from backend
        const imageUrl = item.product?.imageUrl || item.productImageUrl || item.productImage || item.image || item.photo || '';
        return this.getImageUrl(imageUrl);
    }
}
