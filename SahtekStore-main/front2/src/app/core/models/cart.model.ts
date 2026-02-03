import { Product } from './product.model';

export interface CartItem {
    id?: number;
    productId?: number;
    productName?: string;
    productImageUrl?: string;
    productImage?: string;
    image?: string;
    photo?: string;
    productBrand?: string;
    product?: Product; // Nested structure
    quantity: number;
    quantite?: number; // Fallback
    price: number;
    prix?: number;
    productPrice?: number;
    unitPrice?: number;
}

export interface Cart {
    id?: number;
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
}
