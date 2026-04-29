import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
        <div class="register-container">
            <div class="card shadow-lg" style="max-width: 450px; margin: 80px auto;">
                <div class="card-header bg-success text-white text-center">
                    <h3>Registro de Usuario</h3>
                </div>
                <div class="card-body">
                    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                        <div class="mb-3">
                            <label class="form-label">Nombre Completo</label>
                            <input type="text" class="form-control" formControlName="full_name">
                            <div class="text-danger" *ngIf="registerForm.get('full_name')?.invalid && registerForm.get('full_name')?.touched">
                                Nombre requerido
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" formControlName="email">
                            <div class="text-danger" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                                Email válido requerido
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" class="form-control" formControlName="password">
                            <div class="text-danger" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                                La contraseña debe tener al menos 6 caracteres
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Confirmar Contraseña</label>
                            <input type="password" class="form-control" formControlName="confirmPassword">
                            <div class="text-danger" *ngIf="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched">
                                Las contraseñas no coinciden
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success w-100" [disabled]="registerForm.invalid">
                            Registrarse
                        </button>
                        <div class="text-center mt-3">
                            <a routerLink="/login">¿Ya tienes cuenta? Inicia Sesión</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .register-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    `]
})
export class RegisterComponent {
    registerForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            full_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit() {
        if (this.registerForm.valid) {
            const { full_name, email, password } = this.registerForm.value;
            this.authService.register({ full_name, email, password }).subscribe({
                next: (response) => {
                    if (response.success) {
                        Swal.fire('Éxito', 'Registro exitoso!', 'success');
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (error) => {
                    Swal.fire('Error', error.error.error || 'Error al registrar', 'error');
                }
            });
        }
    }
}