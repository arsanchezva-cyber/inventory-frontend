import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = 'https://inventory-backend-moj2.onrender.com/api/payments';

    constructor(private http: HttpClient) {}

    createPayPalOrder(total: number, orden_id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/paypal/create`, { total, orden_id });
    }

    capturePayPalOrder(orderId: string, orden_id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/paypal/capture`, { orderId, orden_id });
    }

    simulatePayment(orden_id: number, metodo_pago: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/simulate`, { orden_id, metodo_pago });
    }
}