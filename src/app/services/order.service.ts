import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'https://inventory-backend-moj2.onrender.com/api/orders';

    constructor(private http: HttpClient) {}

    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, orderData);
    }

    getUserOrders(): Observable<any> {
        return this.http.get(`${this.apiUrl}/my-orders`);
    }

    getAllOrders(): Observable<any> {
        return this.http.get(`${this.apiUrl}/all`);
    }

    updateOrderStatus(id: number, estado: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/status`, { estado });
    }
}