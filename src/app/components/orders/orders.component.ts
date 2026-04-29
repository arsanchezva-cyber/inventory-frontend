import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/cart.model';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="container mt-4">
            <h2 class="mb-4">
                <i class="fas fa-truck"></i> 
                {{isAdmin ? 'Gestión de Órdenes' : 'Mis Órdenes'}}
            </h2>
            
            <div class="row" *ngIf="orders.length === 0">
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        No hay órdenes registradas
                        <a routerLink="/products" class="btn btn-primary mt-3">Ver Productos</a>
                    </div>
                </div>
            </div>
            
            <div class="row" *ngFor="let order of orders">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-header" [ngClass]="getStatusColor(order.estado)">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Orden #{{order.id}}</strong>
                                    <small class="ms-3">{{order.fecha_orden | date:'dd/MM/yyyy HH:mm'}}</small>
                                </div>
                                <div>
                                    <span class="badge bg-white text-dark">
                                        Estado: {{getStatusText(order.estado)}}
                                    </span>
                                    <select *ngIf="isAdmin" 
                                            class="form-select form-select-sm d-inline-block ms-2" 
                                            style="width: auto;"
                                            [value]="order.estado"
                                            (change)="updateStatus(order.id, $event)">
                                        <option value="pendiente">Pendiente</option>
                                        <option value="pagado">Pagado</option>
                                        <option value="enviado">Enviado</option>
                                        <option value="entregado">Entregado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row" *ngIf="isAdmin">
                                <div class="col-md-6">
                                    <p><strong>Cliente:</strong> {{order.full_name}}</p>
                                    <p><strong>Email:</strong> {{order.email}}</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Dirección:</strong> {{order.direccion_envio}}</p>
                                    <p><strong>Teléfono:</strong> {{order.telefono_contacto}}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Método de Pago:</strong> {{order.metodo_pago}}</p>
                                    <p><strong>Total:</strong> <span class="h5">{{order.total | currency}}</span></p>
                                </div>
                            </div>
                            <hr>
                            <h6>Productos:</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let detail of order.detalles">
                                            <td>Producto #{{detail.producto_id}}</td>
                                            <td>{{detail.cantidad}}</td>
                                            <td>{{detail.precio_unitario | currency}}</td>
                                            <td>{{detail.subtotal | currency}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .bg-pendiente { background-color: #ffc107; color: #000; }
        .bg-pagado { background-color: #28a745; color: #fff; }
        .bg-enviado { background-color: #17a2b8; color: #fff; }
        .bg-entregado { background-color: #007bff; color: #fff; }
        .bg-cancelado { background-color: #dc3545; color: #fff; }
    `]
})
export class OrdersComponent implements OnInit {
    orders: Order[] = [];
    isAdmin: boolean = false;

    constructor(
        private orderService: OrderService,
        private authService: AuthService
    ) {
        this.isAdmin = this.authService.isAdmin();
    }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        if (this.isAdmin) {
            this.orderService.getAllOrders().subscribe({
                next: (response) => {
                    if (response.success) {
                        this.orders = response.data;
                    }
                },
                error: (error) => console.error(error)
            });
        } else {
            this.orderService.getUserOrders().subscribe({
                next: (response) => {
                    if (response.success) {
                        this.orders = response.data;
                    }
                },
                error: (error) => console.error(error)
            });
        }
    }

    updateStatus(id: number, event: any) {
        const newStatus = event.target.value;
        this.orderService.updateOrderStatus(id, newStatus).subscribe({
            next: () => this.loadOrders()
        });
    }

    getStatusColor(status: string): string {
        return `bg-${status}`;
    }

    getStatusText(status: string): string {
        const statusMap: any = {
            'pendiente': 'Pendiente',
            'pagado': 'Pagado',
            'enviado': 'Enviado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
    }
}