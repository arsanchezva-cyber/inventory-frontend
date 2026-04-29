import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductTableComponent } from './components/product-table/product-table.component';
import { ReportsComponent } from './components/reports/reports.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CartComponent } from './components/cart/cart.component';
import { OrdersComponent } from './components/orders/orders.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';  import { CheckoutComponent } from './components/checkout/checkout.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'products', component: ProductTableComponent, canActivate: [AuthGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
    { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
    { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
    { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }