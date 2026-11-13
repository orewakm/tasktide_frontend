import type { Dictionary } from '@/i18n/en';
import { ApiError, NETWORK_ERROR } from '@/lib/api';

// Turns any error into a message for the user.
// TR: Herhangi bir hatayı kullanıcıya gösterilecek bir mesaja çevirir.
export function errorText(err: unknown, t: Dictionary): string {
    if (err instanceof ApiError) {
        return err.status === NETWORK_ERROR ? t.common.networkError : err.message;
    }
    return t.common.somethingWrong;
}

// Returns true if the error is an API error with this status.
// TR: Hata bu durum koduna sahip bir API hatasıysa true döndürür.
export function isStatus(err: unknown, status: number): boolean {
    return err instanceof ApiError && err.status === status;
}
