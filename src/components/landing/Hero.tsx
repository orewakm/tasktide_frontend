'use client';

import { ArrowRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { buttonClass } from '@/components/ui/Button';
import { useLanguage } from '@/i18n/useLanguage';
import { BoardPreview } from './BoardPreview';

// Shows the landing page headline, buttons and board preview.
// TR: Tanıtım sayfasının başlığını, butonlarını ve pano önizlemesini gösterir.
export function Hero() {
    const { t } = useLanguage();
    const { user } = useAuth();

    return (
        <section className="theme-deep relative overflow-hidden border-b border-line bg-canvas text-ink">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(70%_55%_at_100%_0%,rgb(99_132_255/0.30),transparent_70%),radial-gradient(60%_50%_at_0%_100%,rgb(76_110_220/0.18),transparent_65%)]"
            />

            <div
                className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6
  lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:pt-24 lg:pb-28"
            >
                <div className="flex flex-col items-start motion-safe:animate-enter">
                    <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-[13px] text-muted">
                        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                        {t.landing.hero.eyebrow}
                    </p>
                    <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        {t.landing.hero.title.map((line) => (
                            <span key={line} className="block">
                                {line}
                            </span>
                        ))}
                        <span className="block text-accent">{t.landing.hero.titleAccent}</span>
                    </h1>
                    <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg">
                        {t.landing.hero.body}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        {user ? (
                            <Link href="/boards" className={buttonClass('primary', 'lg')}>
                                {t.landing.nav.openBoards}
                                <ArrowRightIcon size={16} weight="bold" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/demo" className={buttonClass('primary', 'lg')}>
                                    {t.landing.hero.demo}
                                    <ArrowRightIcon size={16} weight="bold" />
                                </Link>
                                <Link href="/register" className={buttonClass('secondary', 'lg')}>
                                    {t.landing.hero.start}
                                </Link>
                            </>
                        )}
                    </div>
                    {!user && <p className="mt-3 text-sm text-muted">{t.landing.hero.demoNote}</p>}
                </div>

                <div className="motion-safe:animate-enter motion-safe:[animation-delay:150ms]">
                    <BoardPreview />
                </div>
            </div>
        </section>
    );
}
