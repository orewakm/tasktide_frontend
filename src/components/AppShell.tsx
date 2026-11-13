'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { RealtimeConnection } from '@/components/RealtimeConnection';

// Shows the header and the page once logged in, or goes to the login page.
// TR: Giriş yapılmışsa üst çubuğu ve sayfayı gösterir, yapılmamışsa giriş sayfasına gider.
export function AppShell({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    if (!user) {
        return (
            <div className="flex flex-1 items-center justify-center motion-safe:animate-pulse">
                <Logo withText={false} />
            </div>
        );
    }

    return (
        <>
            <RealtimeConnection />
            <Header />
            <div className="flex flex-1 flex-col">{children}</div>
        </>
    );
}
