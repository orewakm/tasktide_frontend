import type { LoginInput, LoginResponse, RegisterInput, User } from '@/interfaces';
import { request } from './client';

export const authApi = {
    register: (input: RegisterInput) => request<User>('POST', '/auth/register', { body: input, auth: false }),
    login: (input: LoginInput) => request<LoginResponse>('POST', '/auth/login', { body: input, auth: false }),
    me: () => request<User>('GET', '/auth/me'),
    logout: () => request<void>('POST', '/auth/logout'),
};
