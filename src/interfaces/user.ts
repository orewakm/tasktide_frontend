export type Role = 'user' | 'admin' | 'super_admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

// The admin user list also includes when each account was created.
// TR: Admin kullanıcı listesi, her hesabın ne zaman oluşturulduğunu da içerir.
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
