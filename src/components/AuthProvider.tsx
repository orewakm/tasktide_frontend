'use client';

import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/useLanguage';
import type { User } from '@/interfaces';
import { api, onUnauthorized } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { clearToken, getToken, setToken } from '@/lib/token';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Removes the token and all data loaded for the user.
// TR: Token'ı ve kullanıcı için yüklenen tüm verileri siler.
function endSession(queryClient: QueryClient) {
    clearToken();
    queryClient.setQueryData(queryKeys.me, null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' });
}

// Loads the current user and shares login and logout with the app.
// TR: Geçerli kullanıcıyı yükler ve giriş ile çıkışı uygulamaya sunar.
export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const meQuery = useQuery({
        queryKey: queryKeys.me,
        queryFn: async () => (getToken() ? api.auth.me() : null),
        staleTime: Infinity,
    });

    useEffect(() => {
        return onUnauthorized(() => {
            toast.error(t.auth.sessionExpired, { id: 'session-expired' });
            endSession(queryClient);
        });
    }, [queryClient, t]);

    // Saves the token and the logged-in user.
    // TR: Token'ı ve giriş yapan kullanıcıyı kaydeder.
    function login(token: string, user: User) {
        setToken(token);
        queryClient.setQueryData(queryKeys.me, user);
    }

    // Logs out on the server and ends the session in the browser.
    // TR: Sunucuda çıkış yapar ve tarayıcıdaki oturumu bitirir.
    async function logout() {
        try {
            await api.auth.logout();
        } catch {
        }
        endSession(queryClient);
    }

    return (
        <AuthContext value={{ user: meQuery.data ?? null, loading: meQuery.isPending, login, logout }}>
            {children}
        </AuthContext>
    );
}

// Returns the current user with the login and logout functions.
// TR: Geçerli kullanıcıyı giriş ve çıkış fonksiyonlarıyla döndürür.
export function useAuth() {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('useAuth must be used inside <AuthProvider>');
    return auth;
}

// Returns the logged-in user on pages behind login.
// TR: Giriş gerektiren sayfalarda giriş yapmış kullanıcıyı döndürür.
export function useCurrentUser(): User {
    const { user } = useAuth();
    if (!user) throw new Error('useCurrentUser needs a logged-in user');
    return user;
}
