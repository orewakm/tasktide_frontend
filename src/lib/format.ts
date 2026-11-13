import type { Dictionary } from '@/i18n/en';
import type { Language } from '@/i18n/useLanguage';

const LOCALES: Record<Language, string> = { en: 'en-US', tr: 'tr-TR' };

// Formats a date like "Nov 10, 2026" in the chosen language.
// TR: Bir tarihi seçilen dilde "10 Kas 2026" gibi biçimlendirir.
export function formatDate(iso: string, language: Language): string {
    return new Intl.DateTimeFormat(LOCALES[language], { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(iso),
    );
}

// Formats a date and time like "Nov 10, 9:04 PM" in the chosen language.
// TR: Bir tarih ve saati seçilen dilde "10 Kas 21:04" gibi biçimlendirir.
export function formatDateTime(iso: string, language: Language): string {
    return new Intl.DateTimeFormat(LOCALES[language], {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}

// Formats a stats day like "Nov 10", in UTC.
// TR: Bir istatistik gününü UTC'de "10 Kas" gibi biçimlendirir.
export function formatDay(day: string, language: Language): string {
    return new Intl.DateTimeFormat(LOCALES[language], { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
        new Date(`${day}T00:00:00Z`),
    );
}

// Formats seconds as a duration like "2h 5m".
// TR: Saniyeleri "2 sa 5 dk" gibi bir süre olarak biçimlendirir.
export function formatDuration(totalSeconds: number, t: Dictionary): string {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return t.time.hoursMinutes(h, m);
    if (m > 0) return t.time.minutes(m);
    return t.time.seconds(seconds);
}

// Formats seconds as a clock like "1:02:09".
// TR: Saniyeleri "1:02:09" gibi bir saat olarak biçimlendirir.
export function formatClock(totalSeconds: number): string {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
    return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

// Returns the initials of a name.
// TR: Bir ismin baş harflerini döndürür.
export function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
    return letters.toLocaleUpperCase();
}
