import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'https://inventory-backend-moj2.onrender.com/api/dashboard';

    constructor(private http: HttpClient) {}

    getKPIs(): Observable<any> {
        return this.http.get(`${this.apiUrl}/kpis`);
    }

    getChartData(): Observable<any> {
        return this.http.get(`${this.apiUrl}/charts`);
    }
}