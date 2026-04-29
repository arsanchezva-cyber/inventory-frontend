export interface CartItem {
    id: number;
    producto_id: number;
    sku: string;
    nombre: string;
    precio_venta: number;
    cantidad: number;
    subtotal: number;
    imagen_url: string;
    stock_actual: number;
}

export interface CartResponse {
    success: boolean;
    data: {
        items: CartItem[];
        total: number;
    };
}

export interface Order {
    id: number;
    usuario_id: number;
    full_name?: string;
    email?: string;
    fecha_orden: Date;
    estado: 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
    total: number;
    metodo_pago: string;
    direccion_envio: string;
    telefono_contacto: string;
    detalles?: OrderDetail[];
}

export interface OrderDetail {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}