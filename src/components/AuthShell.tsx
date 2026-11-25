'use client';

import { CheckCircleIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';

interface AuthShellProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer: ReactNode;
}

// Shows the login and sign-up layout with the form and the product pitch.
// TR: Giriş ve kayıt düzenini form ve ürün tanıtımıyla gösterir.
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
    const { t } = useLanguage();

    return (
        <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <main className="flex flex-col px-4 py-5 sm:px-10">
                <div className="flex items-center justify-between">
                    <Link href="/" aria-label="TaskTide" className="rounded-lg">
                        <Logo />
                    </Link>
                    <LanguageSwitch />
                </div>

                <div className="flex flex-1 items-center">
                    <div className="mx-auto w-full max-w-sm py-12">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
                        <div className="mt-8">{children}</div>
                        <p className="mt-6 text-sm text-muted">{footer}</p>
                        <p className="mt-2 text-sm text-muted">
                            {t.auth.demoPrompt}{' '}
                            <Link href="/demo" className="font-medium text-accent-ink hover:underline">
                                {t.auth.demoLink}
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <aside className="theme-deep relative hidden overflow-hidden bg-canvas text-ink lg:flex">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(70%_55%_at_100%_0%,rgb(99_132_255/0.30),transparent_70%),radial-gradient(60%_50%_at_0%_100%,rgb(76_110_220/0.18),transparent_65%)]"
                />
                <div className="relative flex max-w-xl flex-col justify-end gap-6 p-14 xl:p-20">
                    <h2 className="text-4xl leading-[1.1] font-semibold tracking-tight xl:text-5xl">{t.auth.pitchTitle}</h2>
                    <p className="max-w-[40ch] text-base leading-relaxed text-muted">{t.auth.pitchBody}</p>
                    <ul className="mt-2 flex flex-col gap-3 text-sm text-ink/90">
                        {t.auth.pitchPoints.map((point) => (
                            <li key={point} className="flex items-center gap-2.5">
                                <CheckCircleIcon size={18} weight="fill" className="shrink-0 text-accent" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
}
