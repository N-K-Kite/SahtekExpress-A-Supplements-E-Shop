import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
    customers: User[] = [];
    loading = true;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.loadCustomers();
    }

    loadCustomers() {
        this.loading = true;
        this.authService.getAllUsers().subscribe({
            next: (data) => {
                // Filter to show only CLIENTS or check for role if needed
                this.customers = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading customers', err);
                this.loading = false;
            }
        });
    }

    getInitials(user: User): string {
        const first = user.firstName?.charAt(0) || '';
        const last = user.lastName?.charAt(0) || '';
        return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
    }
}
