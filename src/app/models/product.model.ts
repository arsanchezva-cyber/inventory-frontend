export interface Product {
    id?: number;
    sku: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    precio_compra: number;
    precio_venta: number;
    stock_actual: number;
    stock_minimo: number;
    proveedor: string;
    imagen_url?: string;
    fecha_creacion?: Date;
    fecha_ultima_actualizacion?: Date;
}

export interface KPI {
    total_products: number;
    total_inventory_value: number;
    low_stock_count: number;
    most_valuable_product: {
        nombre: string;
        valor_total: number;
    };
}

export interface ChartData {
    top_categories: Array<{categoria: string, count: number}>;
    category_distribution: Array<{categoria: string, count: number}>;
    low_stock_products: Array<Product>;
}