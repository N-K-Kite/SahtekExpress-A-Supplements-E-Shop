import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { ProductListComponent } from './features/admin/product-list/product-list.component';
import { ProductFormComponent } from './features/admin/product-form/product-form.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [authGuard] },
    { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },
            { path: 'products', component: ProductListComponent },
            { path: 'products/add', component: ProductFormComponent },
            { path: 'products/edit/:id', component: ProductFormComponent },
            { path: 'orders', loadComponent: () => import('./features/admin/order-list/order-list.component').then(m => m.OrderListComponent) },
            { path: 'analytics', loadComponent: () => import('./features/admin/analytics/analytics.component').then(m => m.AnalyticsComponent) },
            { path: 'customers', loadComponent: () => import('./features/admin/customer-list/customer-list.component').then(m => m.CustomerListComponent) },
            { path: 'delivery', loadComponent: () => import('./features/admin/delivery/delivery.component').then(m => m.DeliveryComponent) }
        ]
    },
    { path: 'categories', loadComponent: () => import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent) },
    { path: 'categories/:slug', loadComponent: () => import('./features/categories/category-detail/category-detail.component').then(m => m.CategoryDetailComponent) },
    { path: 'products/:id', loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
    { path: 'search', loadComponent: () => import('./features/products/search/search.component').then(m => m.SearchComponent) },
    { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
    { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
