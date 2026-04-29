import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
// Layout
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';

// Componentes principales
import { ProductTableComponent } from './components/product-table/product-table.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';

// Nuevos componentes
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CartComponent } from './components/cart/cart.component';
import { OrdersComponent } from './components/orders/orders.component';

import { PaymentService } from './services/payment.service';
// Services
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
    declarations: [
    ],
    imports: [
        
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AppRoutingModule,
        CheckoutComponent       
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: []
})
export class AppModule { }