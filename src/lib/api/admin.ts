import type { AdminUser, User } from '@/interfaces';
import { request } from './client';

export const adminApi = {
    // Lists every user account.
    // TR: Tüm kullanıcı hesaplarını listeler.
    users: () => request<AdminUser[]>('GET', '/admin/users'),

    // Changes a user's role.
    // TR: Bir kullanıcının rolünü değiştirir.
    setRole: (userId: string, role: 'user' | 'admin') =>
        request<User>('PATCH', `/admin/users/${userId}/role`, { body: { role } }),
};
