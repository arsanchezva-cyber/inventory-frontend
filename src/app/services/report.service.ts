import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = 'http://localhost:3000/api/reports';

    constructor(private http: HttpClient) {}

    downloadOperationalReport(categoria: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/operational?categoria=${categoria || 'todas'}`, {
            responseType: 'blob'
        });
    }

    downloadManagementReport(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/management`, {
            responseType: 'blob'
        });
    }
}