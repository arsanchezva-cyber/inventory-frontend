import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { CartItem } from '../../models/cart.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
        <div class="container mt-4">
            <h2 class="mb-4"><i class="fas fa-shopping-cart"></i> Mi Carrito</h2>
            
            <div class="row" *ngIf="cartItems.length === 0">
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="fas fa-info-circle"></i> Tu carrito está vacío
                        <br>
                        <a routerLink="/products" class="btn btn-primary mt-3">Ver Productos</a>
                    </div>
                </div>
            </div>
            
            <div class="row" *ngIf="cartItems.length > 0">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5>Productos</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Precio</th>
                                            <th>Cantidad</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let item of cartItems">
                                            <td style="min-width: 250px;">
                                                <div class="d-flex align-items-center">
                                                    <img [src]="item.imagen_url || 'https://via.placeholder.com/50'" 
                                                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                                                         [alt]="item.nombre"
                                                         (error)="handleImageError($event)">
                                                    <div class="ms-3">
                                                        <strong>{{item.nombre}}</strong>
                                                        <br>
                                                        <small class="text-muted">SKU: {{item.sku}}</small>
                                                        <br>
                                                        <small class="text-warning" *ngIf="item.stock_actual <= 5 && item.stock_actual > 0">
                                                            ⚠️ Pocas unidades disponibles
                                                        </small>
                                                        <small class="text-danger" *ngIf="item.stock_actual === 0">
                                                            ❌ Agotado
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{{item.precio_venta | currency}}</td>
                                            <td>
                                                <input type="number" 
                                                       class="form-control form-control-sm" 
                                                       style="width: 80px;"
                                                       [(ngModel)]="item.cantidad"
                                                       (change)="updateQuantity(item)"
                                                       (click)="$event.stopPropagation()"
                                                       [max]="item.stock_actual"
                                                       min="1">
                                            </td>
                                            <td><strong>{{item.subtotal | currency}}</strong></td>
                                            <td>
                                                <button class="btn btn-danger btn-sm" 
                                                        (click)="removeItem(item.id); $event.stopPropagation()">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card sticky-top" style="top: 20px;">
                        <div class="card-header bg-success text-white">
                            <h5>Resumen del Pedido</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>{{total | currency}}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Envío:</span>
                                <span class="text-success">Gratis</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong class="h5 text-primary">{{total | currency}}</strong>
                            </div>
                            <hr>
                            <button class="btn btn-success w-100 mb-2" (click)="proceedToCheckout()">
                                <i class="fas fa-credit-card"></i> Comprar Ahora
                            </button>
                            <button class="btn btn-outline-secondary w-100" (click)="continueShopping()">
                                <i class="fas fa-shopping-bag"></i> Seguir Comprando
                            </button>
                            <hr>
                            <button class="btn btn-link text-danger w-100" (click)="clearCart()">
                                <i class="fas fa-trash-alt"></i> Vaciar Carrito
                            </button>
                        </div>
                    </div>

                    <!-- Métodos de pago aceptados -->
                    <div class="card mt-3">
                        <div class="card-body text-center">
                            <small class="text-muted">Métodos de pago aceptados:</small>
                            <div class="mt-2">
                                <i class="fab fa-cc-visa fa-2x mx-1"></i>
                                <i class="fab fa-cc-mastercard fa-2x mx-1"></i>
                                <i class="fab fa-cc-amex fa-2x mx-1"></i>
                                <i class="fab fa-paypal fa-2x mx-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .table tbody tr {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .table tbody tr:hover {
            background-color: #f8f9fa;
            transform: scale(1.01);
        }
        .sticky-top {
            position: sticky;
            top: 20px;
            z-index: 100;
        }
        input[type="number"] {
            text-align: center;
        }
        input[type="number"]:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.25);
        }
        .btn-success {
            transition: all 0.3s ease;
        }
        .btn-success:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
        }
    `]
})
export class CartComponent implements OnInit {
    cartItems: CartItem[] = [];
    total: number = 0;

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadCart();
    }

    loadCart() {
        this.cartService.getCart().subscribe({
            next: (response) => {
                if (response.success) {
                    this.cartItems = response.data.items;
                    this.total = response.data.total;
                }
            },
            error: (error) => {
                console.error('Error loading cart:', error);
                Swal.fire('Error', 'Error al cargar el carrito', 'error');
            }
        });
    }

    updateQuantity(item: CartItem) {
        if (item.cantidad > item.stock_actual) {
            Swal.fire('Error', `Stock insuficiente. Solo hay ${item.stock_actual} unidades de ${item.nombre}`, 'error');
            item.cantidad = item.stock_actual;
            this.loadCart(); // Recargar para resetear valores
            return;
        }
        
        if (item.cantidad < 1) {
            item.cantidad = 1;
        }
        
        this.cartService.updateQuantity(item.id, item.cantidad).subscribe({
            next: () => {
                this.loadCart();
                Swal.fire({
                    icon: 'success',
                    title: 'Cantidad actualizada',
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            error: (error) => {
                Swal.fire('Error', 'Error al actualizar cantidad', 'error');
                this.loadCart(); // Recargar para revertir cambios
            }
        });
    }

    removeItem(id: number) {
        Swal.fire({
            title: '¿Eliminar producto?',
            text: '¿Estás seguro de eliminar este producto del carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cartService.removeFromCart(id).subscribe({
                    next: () => {
                        this.loadCart();
                        Swal.fire('Eliminado', 'Producto eliminado del carrito', 'success');
                    },
                    error: (error) => {
                        Swal.fire('Error', 'Error al eliminar producto', 'error');
                    }
                });
            }
        });
    }

    clearCart() {
        if (this.cartItems.length === 0) {
            Swal.fire('Info', 'El carrito ya está vacío', 'info');
            return;
        }
        
        Swal.fire({
            title: '¿Vaciar carrito?',
            text: 'Esta acción eliminará todos los productos de tu carrito',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cartService.clearCart().subscribe({
                    next: () => {
                        this.loadCart();
                        Swal.fire('Carrito vacío', 'Todos los productos fueron eliminados', 'success');
                    },
                    error: (error) => {
                        Swal.fire('Error', 'Error al vaciar el carrito', 'error');
                    }
                });
            }
        });
    }

    // NUEVO MÉTODO: Redirigir al checkout
    proceedToCheckout() {
        if (this.cartItems.length === 0) {
            Swal.fire('Carrito vacío', 'Agrega productos antes de continuar', 'warning');
            return;
        }
        
        // Verificar stock antes de continuar
        const hasStockIssues = this.cartItems.some(item => item.cantidad > item.stock_actual);
        if (hasStockIssues) {
            Swal.fire({
                title: 'Problemas de stock',
                text: 'Algunos productos tienen stock insuficiente. Por favor revisa las cantidades.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        
        this.router.navigate(['/checkout']);
    }

    // NUEVO MÉTODO: Seguir comprando
    continueShopping() {
        this.router.navigate(['/products']);
    }

    // Manejador de error de imagen
    handleImageError(event: any) {
        event.target.src = 'https://via.placeholder.com/60?text=No+Image';
    }
}