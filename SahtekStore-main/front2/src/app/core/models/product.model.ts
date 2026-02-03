export interface Product {
    id?: number;
    name: string;
    description: string;
    brand?: string;
    price: number;
    imageUrl?: string;
    // Allow object (backend) or string (form input)
    category?: any;
    stockQuantity?: number;
    // Keeping logic flexible
    stock?: number;
    active?: boolean | number;
}
