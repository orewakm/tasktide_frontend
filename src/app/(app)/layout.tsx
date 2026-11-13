import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';

export const instant = false;

// Wraps every page behind login in the app shell.
// TR: Giriş gerektiren tüm sayfaları uygulama kabuğuyla sarar.
export default function AppLayout({ children }: { children: ReactNode }) {
    return <AppShell>{children}</AppShell>;
}
