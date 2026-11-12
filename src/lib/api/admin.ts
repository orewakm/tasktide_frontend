import type { AdminUser, User } from '@/interfaces';
import { request } from './client';

export const adminApi = {
    // admin and super_admin only.
    // TR: Sadece admin ve super_admin.
    users: () => request<AdminUser[]>('GET', '/admin/users'),
    // super_admin only.
    // TR: Sadece super_admin.
    setRole: (userId: string, role: 'user' | 'admin') =>
        request<User>('PATCH', `/admin/users/${userId}/role`, { body: { role } }),
};
