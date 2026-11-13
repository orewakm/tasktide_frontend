'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { useLanguage } from '@/i18n/useLanguage';
import { AuthProvider } from './AuthProvider';

// Provides data caching, login, toasts and the page language to the app.
// TR: Uygulamaya veri önbelleği, oturum, bildirimler ve sayfa dilini sağlar.
export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { retry: false } },
            }),
    );
    const { language } = useLanguage();

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
            <Toaster
                theme="system"
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'var(--surface)',
                        color: 'var(--ink)',
                        border: '1px solid var(--line)',
                        fontFamily: 'var(--font-geist-sans)',
                    },
                }}
            />
        </QueryClientProvider>
    );
}
