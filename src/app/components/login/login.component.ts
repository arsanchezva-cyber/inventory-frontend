import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
        <div class="login-container">
            <div class="card shadow-lg" style="max-width: 400px; margin: 100px auto;">
                <div class="card-header bg-primary text-white text-center">
                    <h3>Iniciar Sesión</h3>
                </div>
                <div class="card-body">
                    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" formControlName="email" placeholder="admin@carrito.com">
                            <div class="text-danger" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                                Email requerido
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" class="form-control" formControlName="password" placeholder="Admin123!">
                            <div class="text-danger" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                                Contraseña requerida
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary w-100" [disabled]="loginForm.invalid">
                            Ingresar
                        </button>
                        <div class="text-center mt-3">
                            <a routerLink="/register">¿No tienes cuenta? Regístrate</a>
                        </div>
                        <div class="alert alert-info mt-3">
                            <small>
                                <strong>Cuentas de prueba:</strong><br>
                                Admin: admin&#64;carrito.com / admin<br>
                                User: usuario&#64;test.com / usuario
                            </small>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    `]
})
export class LoginComponent {
    loginForm: FormGroup;
    returnUrl: string = '/';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: (response) => {
                    if (response.success) {
                        Swal.fire('Éxito', 'Bienvenido!', 'success');
                        this.router.navigate([this.returnUrl]);
                    }
                },
                error: (error) => {
                    Swal.fire('Error', error.error.error || 'Error al iniciar sesión', 'error');
                }
            });
        }
    }
}