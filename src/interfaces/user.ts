export type Role = 'user' | 'admin' | 'super_admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface AdminUser extends User {
    created_at: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
