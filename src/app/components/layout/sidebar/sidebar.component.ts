import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterModule, CommonModule],
    template: `
        <nav class="sidebar bg-dark vh-100 p-3" style="width: 250px; position: fixed;" *ngIf="isAuthenticated">
            <h4 class="text-white text-center mb-4">Inventory System</h4>
            <ul class="nav nav-pills flex-column">
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" routerLink="/dashboard" routerLinkActive="active">
                        <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" routerLink="/products" routerLinkActive="active">
                        <i class="fas fa-boxes me-2"></i> Productos
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" routerLink="/reports" routerLinkActive="active">
                        <i class="fas fa-chart-bar me-2"></i> Reportes
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" routerLink="/cart" routerLinkActive="active">
                        <i class="fas fa-shopping-cart me-2"></i> Carrito 
                        <span class="badge bg-danger" *ngIf="cartCount > 0">{{cartCount}}</span>
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" routerLink="/orders" routerLinkActive="active">
                        <i class="fas fa-truck me-2"></i> Mis Órdenes
                    </a>
                </li>
                <li class="nav-item mb-2" *ngIf="isAdmin">
                    <a class="nav-link text-white" routerLink="/admin/orders" routerLinkActive="active">
                        <i class="fas fa-chart-line me-2"></i> Admin Órdenes
                    </a>
                </li>
                <li class="nav-item mb-2 mt-5">
                    <a class="nav-link text-white" (click)="logout()" style="cursor: pointer;">
                        <i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                    </a>
                </li>
            </ul>
        </nav>
    `,
    styles: [`
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
        }
        .nav-link:hover {
            background-color: #495057;
        }
        .nav-link.active {
            background-color: #007bff;
        }
    `]
})
export class SidebarComponent implements OnInit {
    cartCount = 0;
    isAdmin = false;
    isAuthenticated = false;

    constructor(
        private authService: AuthService,
        private cartService: CartService
    ) {}

    ngOnInit() {
        // Suscribirse a cambios en el usuario
        this.authService.currentUser.subscribe(user => {
            this.isAdmin = this.authService.isAdmin();
            this.isAuthenticated = !!user;
            
            // Si el usuario se acaba de loguear, cargar el carrito
            if (this.isAuthenticated) {
                this.cartService.getCart().subscribe();
            }
        });

        // Suscribirse al conteo del carrito
        this.cartService.cartCount$.subscribe(count => {
            this.cartCount = count;
        });
    }

    logout() {
        this.authService.logout();
    }
}