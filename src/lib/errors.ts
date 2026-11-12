import type { Dictionary } from '@/i18n/en';
import { ApiError, NETWORK_ERROR } from '@/lib/api';

// Turns any thrown error into a message for the user.
// Server messages are safe to show (they come from the API in English).
// TR: Fırlatılan herhangi bir hatayı kullanıcıya gösterilecek bir mesaja çevirir.
// TR: Sunucu mesajları gösterilmeye uygundur (API'den İngilizce gelir).
export function errorText(err: unknown, t: Dictionary): string {
    if (err instanceof ApiError) {
        return err.status === NETWORK_ERROR ? t.common.networkError : err.message;
    }
    return t.common.somethingWrong;
}

export function isStatus(err: unknown, status: number): boolean {
    return err instanceof ApiError && err.status === status;
}
