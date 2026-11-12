'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Logo } from '@/components/Logo';
import { buttonClass } from '@/components/ui/Button';
import { useLanguage } from '@/i18n/useLanguage';

// Top bar of the landing page. Logged-in people get a shortcut to their boards.
// TR: Landing sayfasının üst çubuğu. Giriş yapmış kişiler panolarına kısayol görür.
export function LandingNav() {
    const { t } = useLanguage();
    const { user, loading } = useAuth();

    return (
        <header className="theme-deep sticky top-0 z-20 border-b border-line bg-canvas text-ink">
            <nav className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
                <Link href="/" aria-label="TaskTide" className="mr-auto rounded-lg">
                    <Logo />
                </Link>
                <LanguageSwitch />
                {/* Wait for the login check, so the buttons don't flash and swap. */}
                {!loading &&
                    (user ? (
                        <Link href="/boards" className={buttonClass('primary')}>
                            {t.landing.nav.openBoards}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className={`${buttonClass('ghost')} max-sm:hidden`}>
                                {t.landing.nav.login}
                            </Link>
                            <Link href="/register" className={buttonClass('primary')}>
                                {t.landing.nav.start}
                            </Link>
                        </>
                    ))}
            </nav>
        </header>
    );
}
