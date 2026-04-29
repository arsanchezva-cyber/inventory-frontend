import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="container-fluid mt-4">
            <h2 class="text-center mb-4">Panel de Control - Estadísticas</h2>
            
            <!-- KPIs -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-white bg-primary">
                        <div class="card-body position-relative">
                            <h5 class="card-title">Total Productos</h5>
                            <h2>{{kpis?.total_products || 0}}</h2>
                            <i class="fas fa-boxes fa-2x position-absolute end-0 bottom-0 me-3 mb-3"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-success">
                        <div class="card-body position-relative">
                            <h5 class="card-title">Valor Inventario</h5>
                            <h2>{{(kpis?.total_inventory_value || 0) | currency}}</h2>
                            <i class="fas fa-dollar-sign fa-2x position-absolute end-0 bottom-0 me-3 mb-3"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-warning">
                        <div class="card-body position-relative">
                            <h5 class="card-title">Bajo Stock</h5>
                            <h2>{{kpis?.low_stock_count || 0}}</h2>
                            <i class="fas fa-exclamation-triangle fa-2x position-absolute end-0 bottom-0 me-3 mb-3"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-info">
                        <div class="card-body position-relative">
                            <h5 class="card-title">Producto Más Valioso</h5>
                            <h6>{{kpis?.most_valuable_product?.nombre || 'N/A'}}</h6>
                            <small>{{(kpis?.most_valuable_product?.valor_total || 0) | currency}}</small>
                            <i class="fas fa-trophy fa-2x position-absolute end-0 bottom-0 me-3 mb-3"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos -->
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-secondary text-white">
                            Top 10 Categorías con Más Productos
                        </div>
                        <div class="card-body">
                            <canvas id="barChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-secondary text-white">
                            Distribución de Productos por Categoría
                        </div>
                        <div class="card-body">
                            <canvas id="pieChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de bajo stock -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-danger text-white">
                            Productos que Necesitan Reorden (Bajo Stock)
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>SKU</th>
                                            <th>Nombre</th>
                                            <th>Stock Actual</th>
                                            <th>Stock Mínimo</th>
                                            <th>Proveedor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let product of lowStockProducts">
                                            <td>{{product.sku}}</td>
                                            <td>{{product.nombre}}</td>
                                            <td class="text-danger fw-bold">{{product.stock_actual}}</td>
                                            <td>{{product.stock_minimo}}</td>
                                            <td>{{product.proveedor || 'N/A'}}</td>
                                        </tr>
                                        <tr *ngIf="lowStockProducts.length === 0">
                                            <td colspan="5" class="text-center text-success py-4">
                                                <i class="fas fa-check-circle"></i> No hay productos con bajo stock
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            overflow: hidden;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .card-body {
            position: relative;
            min-height: 130px;
        }
        .card-body i {
            opacity: 0.3;
            transition: opacity 0.3s ease;
        }
        .card:hover .card-body i {
            opacity: 0.6;
        }
        .bg-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .bg-success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .bg-warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .bg-info { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        
        canvas {
            max-height: 300px;
        }
        
        .table tbody tr:hover {
            background-color: #f8f9fa;
            transform: scale(1.01);
            transition: all 0.2s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
            animation: fadeIn 0.5s ease-out;
        }
    `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
    kpis: any = null;
    lowStockProducts: any[] = [];
    private barChart: Chart | null = null;
    private pieChart: Chart | null = null;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadKPIs();
        this.loadChartData();
    }

    ngAfterViewInit() {
        // Esperar a que el DOM esté listo
        setTimeout(() => {
            if (this.barChart === null && this.pieChart === null) {
                this.loadChartData();
            }
        }, 500);
    }

    loadKPIs() {
        this.dashboardService.getKPIs().subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.kpis = response.data;
                    console.log('KPIs cargados:', this.kpis);
                } else {
                    console.error('Error en respuesta de KPIs:', response);
                }
            },
            error: (error) => {
                console.error('Error loading KPIs:', error);
                // Datos de ejemplo para mostrar mientras carga
                this.kpis = {
                    total_products: 0,
                    total_inventory_value: 0,
                    low_stock_count: 0,
                    most_valuable_product: { nombre: 'Cargando...', valor_total: 0 }
                };
            }
        });
    }

    loadChartData() {
        this.dashboardService.getChartData().subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.lowStockProducts = response.data.low_stock_products || [];
                    this.createBarChart(response.data.top_categories || []);
                    this.createPieChart(response.data.category_distribution || []);
                    console.log('Datos de gráficos cargados');
                } else {
                    console.error('Error en respuesta de gráficos:', response);
                }
            },
            error: (error) => {
                console.error('Error loading chart data:', error);
                // Mostrar gráficos vacíos
                this.createBarChart([]);
                this.createPieChart([]);
                this.lowStockProducts = [];
            }
        });
    }

    createBarChart(data: any[]) {
        const canvas = document.getElementById('barChart') as HTMLCanvasElement;
        if (!canvas) {
            console.warn('Canvas barChart no encontrado');
            return;
        }

        if (this.barChart) {
            this.barChart.destroy();
        }

        // Si no hay datos, mostrar mensaje
        if (!data || data.length === 0) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = '16px Arial';
                ctx.fillStyle = '#999';
                ctx.fillText('No hay datos disponibles', canvas.width / 2 - 100, canvas.height / 2);
            }
            return;
        }

        this.barChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.map((item: any) => item.categoria),
                datasets: [{
                    label: 'Cantidad de Productos',
                    data: data.map((item: any) => item.count),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Productos: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Número de Productos',
                            font: { weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Categorías',
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            autoSkip: true,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    createPieChart(data: any[]) {
        const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
        if (!canvas) {
            console.warn('Canvas pieChart no encontrado');
            return;
        }

        if (this.pieChart) {
            this.pieChart.destroy();
        }

        // Si no hay datos, mostrar mensaje
        if (!data || data.length === 0) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = '16px Arial';
                ctx.fillStyle = '#999';
                ctx.fillText('No hay datos disponibles', canvas.width / 2 - 100, canvas.height / 2);
            }
            return;
        }

        // Colores para el gráfico de pastel
        const colores = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(255, 99, 255, 0.7)',
            'rgba(99, 255, 132, 0.7)'
        ];

        this.pieChart = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: data.map((item: any) => item.categoria),
                datasets: [{
                    data: data.map((item: any) => item.count),
                    backgroundColor: colores.slice(0, data.length),
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 },
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw as number;
                                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} productos (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}