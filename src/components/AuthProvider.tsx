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

// Forget the session: no user, and drop all data loaded for them.
function endSession(queryClient: QueryClient) {
    clearToken();
    queryClient.setQueryData(queryKeys.me, null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' });
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    // Who am I? Only asks the API if a token is saved.
    const meQuery = useQuery({
        queryKey: queryKeys.me,
        queryFn: async () => (getToken() ? api.auth.me() : null),
        staleTime: Infinity,
    });

    // The API client calls this on any 401 (session expired or deleted).
    useEffect(() => {
        return onUnauthorized(() => {
            toast.error(t.auth.sessionExpired, { id: 'session-expired' });
            endSession(queryClient);
        });
    }, [queryClient, t]);

    function login(token: string, user: User) {
        setToken(token);
        queryClient.setQueryData(queryKeys.me, user);
    }

    async function logout() {
        try {
            await api.auth.logout();
        } catch {
            // The session was already gone on the server.
        }
        endSession(queryClient);
    }

    return (
        <AuthContext value={{ user: meQuery.data ?? null, loading: meQuery.isPending, login, logout }}>
            {children}
        </AuthContext>
    );
}

export function useAuth() {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('useAuth must be used inside <AuthProvider>');
    return auth;
}

// For pages inside (app): the layout only renders them once someone is logged in.
// TR: (app) içindeki sayfalar için: layout onları sadece biri giriş yaptıktan sonra gösterir.
export function useCurrentUser(): User {
    const { user } = useAuth();
    if (!user) throw new Error('useCurrentUser needs a logged-in user');
    return user;
}
