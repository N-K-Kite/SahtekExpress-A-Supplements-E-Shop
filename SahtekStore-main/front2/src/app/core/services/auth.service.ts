import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:9002/sahtek_db/sahtek_db/api/users';
    private currentUserSubject = new BehaviorSubject<User | null>(this.getUser());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    register(user: User): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user);
    }

    login(credentials: User): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(res => {
                const user = res.user || res;

                // Construct Basic Auth token from credentials
                const basicAuthToken = btoa(`${credentials.email}:${credentials.password}`);

                this.saveToken(basicAuthToken);
                this.saveUser(user);
                this.currentUserSubject.next(user);
            })
        );
    }

    // Helper to manually trigger update (useful for external state changes)
    updateAuthState(user: User, token: string): void {
        this.saveToken(token);
        this.saveUser(user);
        this.currentUserSubject.next(user);
    }

    saveToken(token: string): void {
        localStorage.setItem('token', token);
    }

    saveUser(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    getUser(): User | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAdmin(): boolean {
        const user = this.getUser();
        return user?.role === 'ADMIN';
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
            tap(updatedUser => {
                const currentUser = this.getUser();
                if (currentUser && currentUser.id === updatedUser.id) {
                    // Preserve token, just update user info
                    this.saveUser(updatedUser);
                    this.currentUserSubject.next(updatedUser);
                }
            })
        );
    }

    changePassword(id: number, data: any): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/password`, data);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }
}
