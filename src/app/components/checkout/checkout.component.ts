import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { CartItem } from '../../models/cart.model';
import Swal from 'sweetalert2';

declare var paypal: any;

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    template: `
        <div class="container mt-4">
            <h2 class="mb-4"><i class="fas fa-credit-card"></i> Finalizar Compra</h2>
            
            <div class="row">
                <div class="col-md-7">
                    <!-- Formulario de envío -->
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <h5>Información de Envío</h5>
                        </div>
                        <div class="card-body">
                            <form [formGroup]="shippingForm">
                                <div class="mb-3">
                                    <label class="form-label">Dirección completa *</label>
                                    <input type="text" class="form-control" formControlName="direccion" 
                                           placeholder="Calle, número, colonia, ciudad">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Teléfono de contacto *</label>
                                    <input type="tel" class="form-control" formControlName="telefono"
                                           placeholder="Ej: 555-123-4567">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Notas adicionales</label>
                                    <textarea class="form-control" rows="3" formControlName="notas"
                                              placeholder="Instrucciones de entrega..."></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-5">
                    <!-- Resumen del pedido -->
                    <div class="card mb-4">
                        <div class="card-header bg-success text-white">
                            <h5>Resumen del Pedido</h5>
                        </div>
                        <div class="card-body">
                            <div *ngFor="let item of cartItems" class="d-flex justify-content-between mb-2">
                                <span>{{item.nombre}} x {{item.cantidad}}</span>
                                <span>{{item.subtotal | currency}}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong class="h5 text-primary">{{total | currency}}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Métodos de pago -->
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5>Método de Pago</h5>
                        </div>
                        <div class="card-body">
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="radio" name="paymentMethod" 
                                       id="paypal" value="paypal" [(ngModel)]="paymentMethod">
                                <label class="form-check-label" for="paypal">
                                    <i class="fab fa-paypal text-primary"></i> PayPal
                                </label>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="radio" name="paymentMethod" 
                                       id="card" value="card" [(ngModel)]="paymentMethod">
                                <label class="form-check-label" for="card">
                                    <i class="fas fa-credit-card"></i> Tarjeta de Crédito/Débito (Simulado)
                                </label>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="radio" name="paymentMethod" 
                                       id="transfer" value="transfer" [(ngModel)]="paymentMethod">
                                <label class="form-check-label" for="transfer">
                                    <i class="fas fa-university"></i> Transferencia Bancaria (Simulado)
                                </label>
                            </div>
                            
                            <hr>
                            
                            <!-- Botón de PayPal -->
                            <div id="paypal-button-container" *ngIf="paymentMethod === 'paypal'"></div>
                            
                            <!-- Botón de pago simulado -->
                            <button class="btn btn-success w-100" 
                                    *ngIf="paymentMethod !== 'paypal'"
                                    (click)="processPayment()"
                                    [disabled]="!shippingForm.valid || processing">
                                <i class="fas fa-lock"></i>
                                {{processing ? 'Procesando...' : 'Pagar ahora'}}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .form-check {
            cursor: pointer;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        .form-check:hover {
            background-color: #f8f9fa;
            border-color: #007bff;
        }
        .form-check-input {
            margin-top: 0;
        }
        .form-check-label {
            margin-left: 10px;
            cursor: pointer;
        }
    `]
})
export class CheckoutComponent implements OnInit, AfterViewInit {
    cartItems: CartItem[] = [];
    total: number = 0;
    paymentMethod: string = 'card';
    processing: boolean = false;
    orden_id: number | null = null;
    
    shippingForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private cartService: CartService,
        private orderService: OrderService,
        private paymentService: PaymentService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.initForm();
        this.loadCart();
    }

    ngAfterViewInit() {
        // Esperar a que PayPal esté disponible
        setTimeout(() => {
            this.loadPayPalScript();
        }, 1000);
    }

    initForm() {
        this.shippingForm = this.fb.group({
            direccion: ['', [Validators.required, Validators.minLength(5)]],
            telefono: ['', [Validators.required, Validators.pattern('^[0-9+ ]+$')]],
            notas: ['']
        });
    }

    loadCart() {
        this.cartService.getCart().subscribe({
            next: (response) => {
                if (response.success) {
                    this.cartItems = response.data.items;
                    this.total = response.data.total;
                    
                    if (this.cartItems.length === 0) {
                        Swal.fire('Carrito vacío', 'Agrega productos antes de continuar', 'warning');
                        this.router.navigate(['/products']);
                    }
                }
            },
            error: (error) => {
                console.error('Error loading cart:', error);
            }
        });
    }

    loadPayPalScript() {
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=USD';
        script.onload = () => {
            this.renderPayPalButton();
        };
        document.body.appendChild(script);
    }

    renderPayPalButton() {
        if (typeof paypal === 'undefined') return;
        
        paypal.Buttons({
            createOrder: (data: any, actions: any) => {
                return this.createPayPalOrder();
            },
            onApprove: (data: any, actions: any) => {
                return this.onPayPalApprove(data);
            },
            onError: (err: any) => {
                console.error('PayPal Error:', err);
                Swal.fire('Error', 'Error al procesar el pago con PayPal', 'error');
            }
        }).render('#paypal-button-container');
    }

    async createPayPalOrder(): Promise<string> {
        try {
            // Primero crear la orden en el backend
            const orderResponse = await this.createOrder();
            if (!orderResponse.success) {
                throw new Error('Error al crear la orden');
            }
            
            this.orden_id = orderResponse.data.id;
            
            // Crear orden de PayPal
            const paypalResponse = await lastValueFrom(this.paymentService.createPayPalOrder(this.total, this.orden_id!));
            return paypalResponse.data.orderId;
        } catch (error) {
            console.error('Error creating PayPal order:', error);
            throw error;
        }
    }

    async onPayPalApprove(data: any): Promise<void> {
        try {
            const captureResponse = await lastValueFrom(this.paymentService.capturePayPalOrder(data.orderID, this.orden_id!));
            
            if (captureResponse.success) {
                Swal.fire('¡Pago exitoso!', 'Tu compra ha sido procesada correctamente', 'success');
                this.router.navigate(['/orders']);
            } else {
                Swal.fire('Error', captureResponse.error || 'Error al procesar el pago', 'error');
            }
        } catch (error) {
            console.error('Error capturing PayPal order:', error);
            Swal.fire('Error', 'Error al confirmar el pago', 'error');
        }
    }

    async createOrder(): Promise<any> {
        if (this.shippingForm.invalid) {
            Swal.fire('Campos incompletos', 'Por favor completa la información de envío correctamente', 'warning');
            throw new Error('Shipping info incomplete');
        }
        
        const formValue = this.shippingForm.value;
        const orderData = {
            direccion_envio: formValue.direccion,
            telefono_contacto: formValue.telefono,
            notas: formValue.notas,
            metodo_pago: this.paymentMethod
        };
        
        return await lastValueFrom(this.orderService.createOrder(orderData));
    }

    async processPayment() {
        if (this.shippingForm.invalid) {
            Swal.fire('Campos incompletos', 'Por favor completa la información de envío correctamente', 'warning');
            return;
        }
        
        this.processing = true;
        
        try {
            // Crear la orden primero
            const orderResponse = await this.createOrder();
            if (!orderResponse.success) {
                throw new Error('Error al crear la orden');
            }
            
            const orden_id = orderResponse.data.id;
            
            // Procesar pago simulado
            const paymentResponse = await lastValueFrom(this.paymentService.simulatePayment(orden_id, this.paymentMethod));
            
            if (paymentResponse.success) {
                // Vaciar carrito
                await lastValueFrom(this.cartService.clearCart());
                
                Swal.fire({
                    title: '¡Compra exitosa!',
                    text: 'Tu pedido ha sido procesado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Ver mis órdenes'
                }).then(() => {
                    this.router.navigate(['/orders']);
                });
            } else {
                Swal.fire('Error', 'No se pudo procesar el pago', 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            Swal.fire('Error', 'Error al procesar el pago', 'error');
        } finally {
            this.processing = false;
        }
    }
}