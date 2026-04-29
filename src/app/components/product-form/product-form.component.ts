import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            {{product ? 'Editar Producto' : 'Nuevo Producto'}}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">SKU *</label>
                                    <input type="text" class="form-control" formControlName="sku">
                                    <div class="text-danger" *ngIf="productForm.get('sku')?.invalid && productForm.get('sku')?.touched">
                                        SKU es requerido
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nombre *</label>
                                    <input type="text" class="form-control" formControlName="nombre">
                                    <div class="text-danger" *ngIf="productForm.get('nombre')?.invalid && productForm.get('nombre')?.touched">
                                        Nombre es requerido
                                    </div>
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">Descripción</label>
                                    <textarea class="form-control" rows="3" formControlName="descripcion"></textarea>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Categoría *</label>
                                    <select class="form-control" formControlName="categoria">
                                        <option value="">Seleccionar...</option>
                                        <option value="Electrónica">Electrónica</option>
                                        <option value="Accesorios">Accesorios</option>
                                        <option value="Almacenamiento">Almacenamiento</option>
                                        <option value="Audio">Audio</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Proveedor</label>
                                    <input type="text" class="form-control" formControlName="proveedor">
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">URL de Imagen</label>
                                    <input type="text" class="form-control" formControlName="imagen_url" placeholder="https://ejemplo.com/imagen.jpg">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Precio Compra *</label>
                                    <input type="number" class="form-control" formControlName="precio_compra">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Precio Venta *</label>
                                    <input type="number" class="form-control" formControlName="precio_venta">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Stock Actual *</label>
                                    <input type="number" class="form-control" formControlName="stock_actual">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Stock Mínimo *</label>
                                    <input type="number" class="form-control" formControlName="stock_minimo">
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid">
                                    {{product ? 'Actualizar' : 'Guardar'}}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ProductFormComponent implements OnInit {
    @Input() product: Product | null = null;
    @Output() onSave = new EventEmitter<Product>();
    
    productForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.productForm = this.fb.group({
            id: [null],
            sku: ['', Validators.required],
            nombre: ['', Validators.required],
            descripcion: [''],
            categoria: ['', Validators.required],
            precio_compra: [0, [Validators.required, Validators.min(0)]],
            precio_venta: [0, [Validators.required, Validators.min(0)]],
            stock_actual: [0, [Validators.required, Validators.min(0)]],
            stock_minimo: [0, [Validators.required, Validators.min(0)]],
            proveedor: [''],
            imagen_url: ['']
        });
    }

    ngOnInit() {
        if (this.product) {
            this.productForm.patchValue(this.product);
        }
    }

    onSubmit() {
        if (this.productForm.valid) {
            this.onSave.emit(this.productForm.value);
        }
    }
}