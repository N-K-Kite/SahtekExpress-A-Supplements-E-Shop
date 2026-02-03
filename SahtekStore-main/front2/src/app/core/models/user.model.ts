export interface User {
    id?: number;
    firstName?: string;
    lastName?: string;
    email: string;
    password?: string;
    role?: 'USER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
    user: User;
}
