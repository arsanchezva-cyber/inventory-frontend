import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ProductService } from '../../services/product.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="container mt-4">
            <h2 class="text-center mb-4">Módulo de Reportes</h2>
            
            <div class="row">
                <!-- Reporte Operacional -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <h4>Reporte Operacional</h4>
                        </div>
                        <div class="card-body">
                            <p class="card-text">
                                Genera un reporte PDF con el listado detallado de todos los productos,
                                incluyendo SKU, nombre, stock y valor total.
                            </p>
                            <div class="mb-3">
                                <label class="form-label">Filtrar por categoría:</label>
                                <select class="form-control" [(ngModel)]="selectedCategory">
                                    <option value="todas">Todas las categorías</option>
                                    <option *ngFor="let cat of categories" [value]="cat.categoria">
                                        {{cat.categoria}}
                                    </option>
                                </select>
                            </div>
                            <button class="btn btn-primary w-100" (click)="generateOperationalReport()">
                                <i class="fas fa-file-pdf"></i> Generar Reporte Operacional
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Reporte de Gestión -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            <h4>Reporte de Gestión</h4>
                        </div>
                        <div class="card-body">
                            <p class="card-text">
                                Genera un reporte PDF con análisis completo incluyendo KPIs,
                                gráficos estadísticos y lista de productos a reordenar.
                            </p>
                            <button class="btn btn-success w-100" (click)="generateManagementReport()">
                                <i class="fas fa-chart-line"></i> Generar Reporte de Gestión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Información adicional -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        Los reportes se generarán en formato PDF con diseño profesional,
                        listos para imprimir o compartir.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ReportsComponent {
    categories: any[] = [];
    selectedCategory: string = 'todas';

    constructor(
        private reportService: ReportService,
        private productService: ProductService
    ) {
        this.loadCategories();
    }

    loadCategories() {
        this.productService.getProducts().subscribe({
            next: (response) => {
                if (response.success) {
                    const uniqueCategories = new Set();
                    response.data.forEach((product: any) => {
                        uniqueCategories.add(product.categoria);
                    });
                    this.categories = Array.from(uniqueCategories).map(cat => ({ categoria: cat }));
                }
            }
        });
    }

    generateOperationalReport() {
        Swal.fire({
            title: 'Generando reporte...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.reportService.downloadOperationalReport(this.selectedCategory).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_operacional_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                Swal.fire('Éxito', 'Reporte generado correctamente', 'success');
            },
            error: (error) => {
                Swal.fire('Error', 'Error al generar el reporte', 'error');
            }
        });
    }

    generateManagementReport() {
        Swal.fire({
            title: 'Generando reporte de gestión...',
            text: 'Esto puede tomar unos segundos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.reportService.downloadManagementReport().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_gestion_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                Swal.fire('Éxito', 'Reporte de gestión generado correctamente', 'success');
            },
            error: (error) => {
                Swal.fire('Error', 'Error al generar el reporte de gestión', 'error');
            }
        });
    }
}