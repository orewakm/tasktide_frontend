import type { ApiErrorBody, FieldError } from '@/interfaces';
import { API_URL } from '@/lib/config';
import { clearToken, getToken } from '@/lib/token';

export const NETWORK_ERROR = 0;

// Holds the status, message and field errors of a failed request.
// TR: Başarısız bir isteğin durumunu, mesajını ve alan hatalarını tutar.
export class ApiError extends Error {
    readonly status: number;
    readonly details: FieldError[];

    constructor(status: number, message: string, details: FieldError[] = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }

    // Returns the validation messages by field name.
    // TR: Doğrulama mesajlarını alan adına göre döndürür.
    get fieldErrors(): Record<string, string> {
        return Object.fromEntries(this.details.map((d) => [d.field, d.message]));
    }
}

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

// Registers a listener that runs when the session ends.
// TR: Oturum bitince çalışan bir dinleyici kaydeder.
export function onUnauthorized(listener: Listener): () => void {
    unauthorizedListeners.add(listener);
    return () => unauthorizedListeners.delete(listener);
}

// Clears the token and tells the listeners the session ended.
// TR: Token'ı siler ve dinleyicilere oturumun bittiğini bildirir.
export function reportUnauthorized() {
    clearToken();
    unauthorizedListeners.forEach((listener) => listener());
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    auth?: boolean;
}

// Builds the full API URL with the query parameters.
// TR: Sorgu parametreleriyle tam API URL'sini oluşturur.
function buildUrl(path: string, query?: RequestOptions['query']): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined) params.set(key, String(value));
    }
    const qs = params.toString();
    return `${API_URL}/api${path}${qs ? `?${qs}` : ''}`;
}

// Sends a request to the API and returns the answer or throws an ApiError.
// TR: API'ye istek gönderir, cevabı döndürür ya da ApiError fırlatır.
export async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
    const { body, query, auth = true } = options;

    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = auth ? getToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
        res = await fetch(buildUrl(path, query), {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(NETWORK_ERROR, 'Network error');
    }

    if (res.status === 204) return undefined as T;

    const data: unknown = await res.json().catch(() => null);

    if (!res.ok) {
        if (res.status === 401 && auth) {
            if (token && getToken() === token) clearToken();
            unauthorizedListeners.forEach((listener) => listener());
        }
        const err = data as ApiErrorBody | null;
        if (typeof err?.error !== 'string') throw new ApiError(NETWORK_ERROR, 'Server unreachable');
        throw new ApiError(res.status, err.error, err.details ?? []);
    }

    return data as T;
}
