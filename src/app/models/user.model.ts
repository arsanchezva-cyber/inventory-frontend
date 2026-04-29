export interface User {
    id: number;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    created_at?: Date;
    last_login?: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    role?: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
    };
}