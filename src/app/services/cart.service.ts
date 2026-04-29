import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem, CartResponse } from '../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'http://localhost:3000/api/cart';
    private cartCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public cartCount$ = this.cartCountSubject.asObservable();

    constructor(private http: HttpClient) {}

    getCart(): Observable<CartResponse> {
        return this.http.get<CartResponse>(this.apiUrl).pipe(
            tap(response => {
                if (response.success) {
                    const count = response.data.items.reduce((sum, item) => sum + item.cantidad, 0);
                    this.cartCountSubject.next(count);
                }
            })
        );
    }

    addToCart(producto_id: number, cantidad: number = 1): Observable<any> {
        return this.http.post(`${this.apiUrl}/add`, { producto_id, cantidad }).pipe(
            tap(() => {
                this.refreshCartCount();
            })
        );
    }

    updateQuantity(cart_id: number, cantidad: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/update`, { cart_id, cantidad }).pipe(
            tap(() => {
                this.refreshCartCount();
            })
        );
    }

    removeFromCart(cart_id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/remove/${cart_id}`).pipe(
            tap(() => {
                this.refreshCartCount();
            })
        );
    }

    clearCart(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/clear`).pipe(
            tap(() => {
                this.cartCountSubject.next(0);
            })
        );
    }

    private refreshCartCount(): void {
        this.getCart().subscribe(response => {
            if (response.success) {
                const count = response.data.items.reduce((sum, item) => sum + item.cantidad, 0);
                this.cartCountSubject.next(count);
            }
        });
    }
}