import type { ApiErrorBody, FieldError } from '@/interfaces';
import { API_URL } from '@/lib/config';
import { clearToken, getToken } from '@/lib/token';

// Status used when the request never reached the server (offline, API down).
// TR: İstek sunucuya hiç ulaşamadığında kullanılan durum kodu (çevrimdışı, API kapalı).
export const NETWORK_ERROR = 0;

export class ApiError extends Error {
    readonly status: number;
    readonly details: FieldError[];

    constructor(status: number, message: string, details: FieldError[] = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }

    // Validation messages keyed by field name, ready to show next to form inputs.
    // TR: Alan adına göre doğrulama mesajları, form alanlarının yanında göstermeye hazır.
    get fieldErrors(): Record<string, string> {
        return Object.fromEntries(this.details.map((d) => [d.field, d.message]));
    }
}

// Any 401 means the session is gone. The auth provider listens here to log the user out.
// TR: Her 401, oturumun bittiği anlamına gelir. Auth provider kullanıcıyı çıkarmak için burayı dinler.
type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

export function onUnauthorized(listener: Listener): () => void {
    unauthorizedListeners.add(listener);
    return () => unauthorizedListeners.delete(listener);
}

// For the socket: the server rejected its session, which means the same as a 401.
// TR: Socket için: sunucu oturumunu reddetti, bu da bir 401 ile aynı anlama gelir.
export function reportUnauthorized() {
    clearToken();
    unauthorizedListeners.forEach((listener) => listener());
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    // false for register and login, which don't send a token.
    // TR: Token göndermeyen register ve login için false.
    auth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined) params.set(key, String(value));
    }
    const qs = params.toString();
    return `${API_URL}/api${path}${qs ? `?${qs}` : ''}`;
}

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
        // Only clear the token this request used: another tab may have logged in again meanwhile.
        // TR: Sadece bu isteğin kullandığı token temizlenir: bu arada başka bir sekme yeniden giriş yapmış olabilir.
        if (res.status === 401 && auth) {
            if (token && getToken() === token) clearToken();
            unauthorizedListeners.forEach((listener) => listener());
        }
        const err = data as ApiErrorBody | null;
        throw new ApiError(res.status, err?.error ?? res.statusText, err?.details ?? []);
    }

    return data as T;
}
