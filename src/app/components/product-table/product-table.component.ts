import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import Swal from 'sweetalert2';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
    selector: 'app-product-table',
    standalone: true,
    imports: [CommonModule, FormsModule, ProductFormComponent],
    template: `
        <div class="container-fluid mt-4">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h3>Gestión de Productos</h3>
                </div>
                <div class="card-body">
                    <!-- Barra de búsqueda -->
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <div class="input-group">
                                <input type="text" 
                                       class="form-control" 
                                       placeholder="Buscar por SKU, nombre o categoría..."
                                       [(ngModel)]="searchTerm"
                                       (keyup)="onSearch()">
                                <button class="btn btn-primary" (click)="onSearch()">
                                    <i class="fas fa-search"></i> Buscar
                                </button>
                                <button class="btn btn-secondary" (click)="clearSearch()">
                                    Limpiar
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-success" (click)="openProductForm()" *ngIf="isAdmin">
                                <i class="fas fa-plus"></i> Nuevo Producto
                            </button>
                        </div>
                    </div>

                    <!-- Tabla de productos -->
                    <div class="table-responsive">
                        <table class="table table-hover table-striped">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>SKU</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Precio Compra</th>
                                    <th>Precio Venta</th>
                                    <th>Stock</th>
                                    <th>Stock Mínimo</th>
                                    <th *ngIf="isAdmin">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let product of products" 
                                    (click)="isAdmin && editProduct(product)" 
                                    [style.cursor]="isAdmin ? 'pointer' : 'default'"
                                    (mouseenter)="showImage(product, $event)"
                                    (mouseleave)="hideImage()">
                                    <td>{{product.id}}</td>
                                    <td>{{product.sku}}</td>
                                    <td>{{product.nombre}}</td>
                                    <td>{{product.categoria}}</td>
                                    <td>{{product.precio_compra | currency}}</td>
                                    <td>{{product.precio_venta | currency}}</td>
                                    <td [class.text-danger]="product.stock_actual === 0"
                                        [class.text-warning]="product.stock_actual < product.stock_minimo && product.stock_actual > 0">
                                        {{product.stock_actual}}
                                        <span *ngIf="product.stock_actual === 0" class="badge bg-danger ms-2">
                                            AGOTADO
                                        </span>
                                        <span *ngIf="product.stock_actual < product.stock_minimo && product.stock_actual > 0" 
                                              class="badge bg-warning ms-2">
                                            Bajo Stock
                                        </span>
                                    </td>
                                    <td>{{product.stock_minimo}}</td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button *ngIf="!isAdmin" 
                                                    class="btn btn-sm btn-primary" 
                                                    [disabled]="product.stock_actual === 0"
                                                    (click)="addToCart(product); $event.stopPropagation()">
                                                <i class="fas fa-cart-plus"></i> Añadir
                                            </button>
                                            <button *ngIf="isAdmin" 
                                                    class="btn btn-sm btn-danger" 
                                                    (click)="product.id !== undefined && deleteProduct(product.id); $event.stopPropagation()">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Imagen flotante al hacer hover -->
                    <div *ngIf="hoveredImage" 
                         class="product-image-popup"
                         [style.top]="mouseY + 'px'"
                         [style.left]="mouseX + 'px'">
                        <img [src]="hoveredImage" alt="Producto" class="img-fluid">
                        <div class="image-caption">{{hoveredProductName}}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal del formulario -->
        <app-product-form 
            [product]="selectedProduct"
            (onSave)="saveProduct($event)">
        </app-product-form>
    `,
    styles: [`
        .product-image-popup {
            position: fixed;
            z-index: 9999;
            background: white;
            border: 2px solid #007bff;
            border-radius: 10px;
            padding: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            pointer-events: none;
            transform: translate(10px, -50%);
            max-width: 250px;
        }
        .product-image-popup img {
            max-width: 200px;
            max-height: 200px;
            border-radius: 5px;
            object-fit: cover;
        }
        .image-caption {
            text-align: center;
            margin-top: 5px;
            font-size: 12px;
            color: #333;
            font-weight: bold;
        }
        .table tbody tr:hover {
            background-color: #f0f8ff;
            transition: all 0.3s ease;
        }
    `]
})
export class ProductTableComponent implements OnInit {
    products: Product[] = [];
    searchTerm: string = '';
    selectedProduct: Product | null = null;
    isAdmin: boolean = false;
    
    // Propiedades para la imagen flotante
    hoveredImage: string | null = null;
    hoveredProductName: string = '';
    mouseX: number = 0;
    mouseY: number = 0;

    constructor(
        private productService: ProductService,
        private authService: AuthService,
        private cartService: CartService
    ) {}

    ngOnInit() {
        this.loadProducts();
        this.isAdmin = this.authService.isAdmin();
    }

    loadProducts() {
        this.productService.getProducts(this.searchTerm).subscribe({
            next: (response) => {
                if (response.success) {
                    this.products = response.data;
                }
            },
            error: (error) => {
                Swal.fire('Error', 'Error al cargar productos', 'error');
            }
        });
    }

    addToCart(product: Product) {
        if (product.id) {
            this.cartService.addToCart(product.id, 1).subscribe({
                next: (response) => {
                    Swal.fire({
                        title: '¡Añadido!',
                        text: `${product.nombre} se agregó al carrito`,
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                },
                error: (error) => {
                    Swal.fire('Error', error.error.error || 'Error al añadir al carrito', 'error');
                }
            });
        }
    }

    onSearch() {
        this.loadProducts();
    }

    clearSearch() {
        this.searchTerm = '';
        this.loadProducts();
    }

    openProductForm() {
        this.selectedProduct = null;
        const modalElement = document.getElementById('productModal');
        if (modalElement) {
            const bootstrap = (window as any).bootstrap;
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        }
    }

    editProduct(product: Product) {
        this.selectedProduct = { ...product };
        const modalElement = document.getElementById('productModal');
        if (modalElement) {
            const bootstrap = (window as any).bootstrap;
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        }
    }

    saveProduct(product: Product) {
        const modalElement = document.getElementById('productModal');
        const bootstrap = (window as any).bootstrap;
        const modal = bootstrap.Modal.getInstance(modalElement);

        if (product.id) {
            this.productService.updateProduct(product.id, product).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Producto actualizado', 'success');
                    this.loadProducts();
                    if (modal) modal.hide();
                },
                error: (error) => {
                    Swal.fire('Error', error.error.error || 'Error al actualizar', 'error');
                }
            });
        } else {
            this.productService.createProduct(product).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Producto creado', 'success');
                    this.loadProducts();
                    if (modal) modal.hide();
                },
                error: (error) => {
                    Swal.fire('Error', error.error.error || 'Error al crear', 'error');
                }
            });
        }
    }

    deleteProduct(id: number) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.productService.deleteProduct(id).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Producto eliminado', 'success');
                        this.loadProducts();
                    },
                    error: (error) => {
                        Swal.fire('Error', 'Error al eliminar', 'error');
                    }
                });
            }
        });
    }

    // Métodos para mostrar imagen al hacer hover
    showImage(product: Product, event: MouseEvent) {
        if (product.imagen_url) {
            this.hoveredImage = product.imagen_url;
            this.hoveredProductName = product.nombre;
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        }
    }

    hideImage() {
        this.hoveredImage = null;
        this.hoveredProductName = '';
    }
}