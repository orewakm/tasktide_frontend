const TOKEN_KEY = 'tasktide.token';

// Returns the session token from localStorage.
// TR: Oturum token'ını localStorage'dan döndürür.
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

// Saves the session token in localStorage.
// TR: Oturum token'ını localStorage'a kaydeder.
export function setToken(token: string) {
    try {
        window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
    }
}

// Removes the session token from localStorage.
// TR: Oturum token'ını localStorage'dan siler.
export function clearToken() {
    try {
        window.localStorage.removeItem(TOKEN_KEY);
    } catch {
    }
}
