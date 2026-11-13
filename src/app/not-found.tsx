'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { buttonClass } from '@/components/ui/Button';
import { useLanguage } from '@/i18n/useLanguage';

// Shows the error page for an unknown URL.
// TR: Bilinmeyen bir URL için hata sayfasını gösterir.
export default function NotFound() {
    const { t } = useLanguage();

    return (
        <main className="flex min-h-[100dvh] flex-col px-4 py-5 sm:px-10">
            <Logo />
            <div className="flex flex-1 items-center">
                <div className="mx-auto flex w-full max-w-md flex-col items-start gap-4">
                    <p className="font-mono text-sm text-accent-ink">404</p>
                    <h1 className="text-3xl font-semibold tracking-tight">{t.notFound.title}</h1>
                    <p className="text-sm text-muted">{t.notFound.body}</p>
                    <Link href="/boards" className={buttonClass()}>
                        {t.notFound.home}
                    </Link>
                </div>
            </div>
        </main>
    );
}
