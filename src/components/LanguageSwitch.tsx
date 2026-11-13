'use client';

import { useLanguage, type Language } from '@/i18n/useLanguage';

const LANGUAGES: Language[] = ['en', 'tr'];

// Shows the EN/TR switch and saves the chosen language.
// TR: EN/TR seçicisini gösterir ve seçilen dili kaydeder.
export function LanguageSwitch() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div
            role="group"
            aria-label={t.header.language}
            className="flex h-8 items-center rounded-lg border border-line bg-sunken p-0.5 text-[11px] font-semibold tracking-wide"
        >
            {LANGUAGES.map((lang) => (
                <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    aria-pressed={language === lang}
                    className={`h-full rounded-md px-2 uppercase transition-colors ${
                        language === lang ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                    }`}
                >
                    {lang}
                </button>
            ))}
        </div>
    );
}
