import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';

// The pages in here only render in the browser, after the token in localStorage is read,
// so the server can't prerender them. This tells Next.js not to expect instant navigation here.
// TR: Buradaki sayfalar sadece tarayıcıda, localStorage'daki token okunduktan sonra render edilir;
// TR: bu yüzden sunucu onları önceden render edemez. Bu, Next.js'e burada anlık geçiş beklememesini söyler.
export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
    return <AppShell>{children}</AppShell>;
}
