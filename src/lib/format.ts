import type { Dictionary } from '@/i18n/en';
import type { Language } from '@/i18n/useLanguage';

const LOCALES: Record<Language, string> = { en: 'en-US', tr: 'tr-TR' };

// "Nov 10, 2026" / "10 Kas 2026"
export function formatDate(iso: string, language: Language): string {
    return new Intl.DateTimeFormat(LOCALES[language], { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(iso),
    );
}

// "Nov 10, 9:04 PM" / "10 Kas 21:04"
export function formatDateTime(iso: string, language: Language): string {
    return new Intl.DateTimeFormat(LOCALES[language], {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}

// Stats days are "YYYY-MM-DD" in UTC, so they are formatted in UTC too.
// TR: İstatistik günleri UTC'de "YYYY-MM-DD" biçimindedir, bu yüzden UTC'de biçimlendirilir.
export function formatDay(day: string, language: Language): string {
    return new Intl.DateTimeFormat(LOCALES[language], { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
        new Date(`${day}T00:00:00Z`),
    );
}

// "2h 5m", "12m", "40s"
export function formatDuration(totalSeconds: number, t: Dictionary): string {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return t.time.hoursMinutes(h, m);
    if (m > 0) return t.time.minutes(m);
    return t.time.seconds(seconds);
}

// A ticking clock: "4:07" or "1:02:09".
// TR: İşleyen bir saat: "4:07" veya "1:02:09".
export function formatClock(totalSeconds: number): string {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
    return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

export function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
    return letters.toLocaleUpperCase();
}
