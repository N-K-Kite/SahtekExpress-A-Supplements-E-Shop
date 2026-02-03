import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { Subscription, Observable } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Cart } from '../../models/cart.model';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  showProfileDropdown = false;
  currentUser: User | null = null;
  private authSubscription: Subscription | null = null;

  categories = this.productService.categories;
  cart$: Observable<Cart>;

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  searchQuery = '';
  showSearch = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close profile dropdown
    if (!target.closest('.profile-dropdown-container')) {
      this.showProfileDropdown = false;
    }

    // Close search bar if clicked outside and search bar is active
    if (!target.closest('.search-bar-container') && this.showSearch) {
      this.showSearch = false;
      this.searchQuery = '';
    }
  }

  logout() {
    this.authService.logout();
    this.showProfileDropdown = false;
    this.router.navigate(['/login']);
  }

  handleSearchClick() {
    if (!this.showSearch) {
      this.showSearch = true;
    } else if (this.searchQuery.trim()) {
      this.onSearch();
    } else {
      this.showSearch = false;
    }
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { keyword: this.searchQuery.trim() } });
      this.showSearch = false;
      this.searchQuery = '';
    }
  }
}

