'use client';

import { Logo } from '@/components/Logo';
import { useLanguage } from '@/i18n/useLanguage';

export function LandingFooter() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-line">
            <div
                className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between 
  sm:px-6"
            >
                <p className="flex items-center gap-3">
                    <Logo withText={false} />
                    {t.landing.footer.tagline}
                </p>
                <p>© 2026 TaskTide</p>
            </div>
        </footer>
    );
}
