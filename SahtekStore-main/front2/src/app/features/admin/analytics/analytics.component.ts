import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
    loading = true;
    totalRevenue = 0;
    totalOrders = 0;
    totalProducts = 0;
    averageOrderValue = 0;

    lowStockProducts: Product[] = [];
    statusDistribution: { [key: string]: number } = {};

    recentOrders: Order[] = [];

    private salesChart: any;
    private pendingChartData: Order[] | null = null;

    constructor(
        private orderService: OrderService,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit(): void {
        if (this.pendingChartData) {
            this.createCharts(this.pendingChartData);
        }
    }

    loadData() {
        this.loading = true;
        forkJoin({
            orders: this.orderService.getAllOrders(),
            products: this.productService.getProducts()
        }).subscribe({
            next: (data) => {
                this.processOrders(data.orders);
                this.processProducts(data.products);
                this.pendingChartData = data.orders;
                this.loading = false;

                // Use timeout to ensure DOM is updated after loading = false
                setTimeout(() => {
                    if (this.pendingChartData) {
                        this.createCharts(this.pendingChartData);
                    }
                }, 100);
            },
            error: (err) => {
                console.error('Error loading analytics data', err);
                this.loading = false;
            }
        });
    }

    processOrders(orders: Order[]) {
        this.totalOrders = orders.length;
        this.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        this.averageOrderValue = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;

        this.statusDistribution = {};
        orders.forEach(order => {
            const status = order.status || 'PENDING';
            this.statusDistribution[status] = (this.statusDistribution[status] || 0) + 1;
        });

        this.recentOrders = [...orders]
            .sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5);
    }

    processProducts(products: Product[]) {
        this.totalProducts = products.length;
        this.lowStockProducts = products.filter(p => {
            const stock = p.stockQuantity ?? p.stock ?? 0;
            return stock < 5;
        }).slice(0, 5);
    }

    getStatusColor(status: string): string {
        switch (status.toUpperCase()) {
            case 'DELIVERED': return 'bg-success';
            case 'CANCELLED': return 'bg-danger';
            case 'SHIPPED': return 'bg-info';
            case 'CONFIRMED': return 'bg-primary';
            default: return 'bg-warning';
        }
    }

    createCharts(orders: Order[]) {
        // Process data for the last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('fr-FR', { weekday: 'short' });
        });

        const dailyRevenue = [...Array(7)].fill(0);
        const today = new Date();

        orders.forEach(order => {
            if (order.created_at) {
                const orderDate = new Date(order.created_at);
                const diffTime = Math.abs(today.getTime() - orderDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 7) {
                    dailyRevenue[6 - diffDays] += order.totalAmount;
                }
            }
        });

        if (this.salesChart) {
            this.salesChart.destroy();
        }

        const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
        if (ctx) {
            this.salesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'Ventes (TND)',
                        data: dailyRevenue,
                        borderColor: '#0062ff',
                        backgroundColor: 'rgba(0, 98, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#0062ff',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { display: true },
                            ticks: { color: '#94a3b8' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8' }
                        }
                    }
                }
            });
        }
    }
}
