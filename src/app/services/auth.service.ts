import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // URL de producción en Render - CAMBIADA DIRECTAMENTE
    private apiUrl = 'https://inventory-backend-moj2.onrender.com/api/auth';
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;
    private isAuthenticatedSubject: BehaviorSubject<boolean>;
    public isAuthenticated$: Observable<boolean>;

    constructor(private http: HttpClient, private router: Router) {
        const user = this.getUserFromStorage();
        this.currentUserSubject = new BehaviorSubject<User | null>(user);
        this.currentUser = this.currentUserSubject.asObservable();
        this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!user);
        this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    private getUserFromStorage(): User | null {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                localStorage.removeItem('currentUser');
                return null;
            }
        }
        return null;
    }

    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response.success) {
                    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.token);
                    this.currentUserSubject.next(response.data.user);
                    this.isAuthenticatedSubject.next(true);
                }
            })
        );
    }

    register(userData: RegisterData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
            tap(response => {
                if (response.success) {
                    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.token);
                    this.currentUserSubject.next(response.data.user);
                    this.isAuthenticatedSubject.next(true);
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAdmin(): boolean {
        const user = this.currentUserValue;
        return user?.role === 'admin';
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}