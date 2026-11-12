'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { useLanguage } from '@/i18n/useLanguage';
import { AuthProvider } from './AuthProvider';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { retry: false } },
            }),
    );
    const { language } = useLanguage();

    // Keep <html lang="..."> in sync so the browser and screen readers know the language.
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
