import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = 'http://localhost:3000/api/products';

    constructor(private http: HttpClient) {}

    getProducts(search?: string, categoria?: string): Observable<any> {
        let params: any = {};
        if (search) params.search = search;
        if (categoria) params.categoria = categoria;
        return this.http.get(this.apiUrl, { params });
    }

    getProductById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createProduct(product: Product): Observable<any> {
        return this.http.post(this.apiUrl, product);
    }

    updateProduct(id: number, product: Product): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, product);
    }

    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}