'use client';

import { ArrowRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { buttonClass } from '@/components/ui/Button';
import { useLanguage } from '@/i18n/useLanguage';

// Shows the last call to sign up before the footer.
// TR: Alt bilgiden önce son kayıt çağrısını gösterir.
export function ClosingCta() {
    const { t } = useLanguage();
    const { user } = useAuth();

    return (
        <section
            aria-labelledby="cta-title"
            className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28"
        >
            <div className="theme-deep relative overflow-hidden rounded-2xl border border-line bg-canvas px-6 py-12 text-ink sm:px-12 sm:py-16">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(60%_90%_at_100%_100%,rgb(99_132_255/0.28),transparent_70%)]"
                />
                <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-xl">
                        <h2
                            id="cta-title"
                            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
                        >
                            {t.landing.cta.title}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-muted">
                            {t.landing.cta.body}
                        </p>
                    </div>
                    <Link
                        href={user ? '/boards' : '/register'}
                        className={buttonClass('primary', 'lg')}
                    >
                        {user ? t.landing.nav.openBoards : t.landing.hero.start}
                        <ArrowRightIcon size={16} weight="bold" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
