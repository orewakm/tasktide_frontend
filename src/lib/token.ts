// The session token is kept in localStorage so the user stays logged in after a reload.
// localStorage can be missing (server render) or blocked (private mode), so every access is guarded.
// TR: Oturum token'ı localStorage'da tutulur, böylece sayfa yenilense de kullanıcı giriş yapmış kalır.
// TR: localStorage olmayabilir (sunucu render'ı) veya engellenmiş olabilir (gizli mod), bu yüzden her erişim korunur.
const TOKEN_KEY = 'tasktide.token';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token: string) {
    try {
        window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
        // Storage blocked: the session still works until the page is reloaded.
        // TR: Depolama engelli: oturum sayfa yenilenene kadar yine de çalışır.
    }
}

export function clearToken() {
    try {
        window.localStorage.removeItem(TOKEN_KEY);
    } catch {
        // Nothing to clear.
        // TR: Temizlenecek bir şey yok.
    }
}
