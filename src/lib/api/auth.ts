import type { LoginInput, LoginResponse, RegisterInput, User } from '@/interfaces';
import { request } from './client';

export const authApi = {
    // Creates a new account.
    // TR: Yeni bir hesap oluşturur.
    register: (input: RegisterInput) => request<User>('POST', '/auth/register', { body: input, auth: false }),

    // Logs in and returns the token and the user.
    // TR: Giriş yapar ve token ile kullanıcıyı döndürür.
    login: (input: LoginInput) => request<LoginResponse>('POST', '/auth/login', { body: input, auth: false }),

    // Returns the logged-in user.
    // TR: Giriş yapmış kullanıcıyı döndürür.
    me: () => request<User>('GET', '/auth/me'),

    // Ends the session on the server.
    // TR: Sunucudaki oturumu sonlandırır.
    logout: () => request<void>('POST', '/auth/logout'),
};
