'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { RealtimeConnection } from '@/components/RealtimeConnection';

// Everything after login sits inside this shell. The token is in localStorage, so only the
// browser knows who is logged in: until it does, a logo shows instead of the page.
// TR: Girişten sonraki her şey bu kabuğun içindedir. Token localStorage'da olduğu için kimin giriş
// TR: yaptığını sadece tarayıcı bilir: o bilene kadar sayfa yerine bir logo görünür.
export function AppShell({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Not logged in (or just logged out): go to the login page.
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
