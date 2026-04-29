import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductTableComponent } from './components/product-table/product-table.component';
import { ReportsComponent } from './components/reports/reports.component';
import { CartComponent } from './components/cart/cart.component';
import { OrdersComponent } from './components/orders/orders.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [AuthGuard] 
    },
    { 
        path: 'products', 
        component: ProductTableComponent,
        canActivate: [AuthGuard] 
    },
    { 
        path: 'reports', 
        component: ReportsComponent,
        canActivate: [AuthGuard] 
    },
    { 
        path: 'cart', 
        component: CartComponent,
        canActivate: [AuthGuard] 
    },
    { 
        path: 'checkout', 
        component: CheckoutComponent,
        canActivate: [AuthGuard] 
    },
    { 
        path: 'orders', 
        component: OrdersComponent,
        canActivate: [AuthGuard] 
    },
    { 
        path: 'admin/orders', 
        component: OrdersComponent,
        canActivate: [AuthGuard, AdminGuard] 
    },
    { path: '**', redirectTo: 'dashboard' }
];
