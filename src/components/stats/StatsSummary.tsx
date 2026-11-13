'use client';

import { ChartBarIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import type { DaySeconds } from '@/interfaces';
import { formatDay, formatDuration } from '@/lib/format';

interface StatsHeroProps {
    total: number;
    days: DaySeconds[];
    sideLabel: string;
    side?: ReactNode;
}

// Shows the total time with the item that took the most time.
// TR: Toplam süreyi en çok süre alan öğeyle birlikte gösterir.
export function StatsHero({ total, days, sideLabel, side }: StatsHeroProps) {
    const { t, language } = useLanguage();
    const first = days[0]?.day;
    const last = days.at(-1)?.day;

    return (
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-2 bg-surface p-5 sm:p-6">
                <p className="text-[13px] text-muted">{t.stats.total}</p>
                <p className="text-5xl font-semibold tracking-tight">{formatDuration(total, t)}</p>
                {first && last && (
                    <p className="text-xs text-muted">
                        {formatDay(first, language)} - {formatDay(last, language)}
                    </p>
                )}
            </div>
            <div className="flex flex-col justify-center gap-3 bg-surface p-5 sm:p-6">
                <p className="text-[13px] text-muted">{sideLabel}</p>
                {side ?? <p className="text-base font-semibold text-muted">-</p>}
            </div>
        </div>
    );
}

interface TopItemProps {
    name: string;
    seconds: number;
    total: number;
    leading?: ReactNode;
    href?: string;
}

// Shows the item with the most time and its share of the total.
// TR: En çok süre alan öğeyi ve toplamdaki payını gösterir.
export function TopItem({ name, seconds, total, leading, href }: TopItemProps) {
    const { t } = useLanguage();
    const percent = total > 0 ? Math.round((seconds / total) * 100) : 0;

    return (
        <div className="flex items-center gap-3">
            {leading}
            <div className="flex min-w-0 flex-col">
                {href ? (
                    <Link href={href} className="truncate text-base font-semibold underline-offset-4 hover:underline">
                        {name}
                    </Link>
                ) : (
                    <span className="truncate text-base font-semibold">{name}</span>
                )}
                <span className="text-xs text-muted">
                    {formatDuration(seconds, t)}
                    <span className="mx-1.5" aria-hidden>
                        ·
                    </span>
                    {t.stats.share(percent)}
                </span>
            </div>
        </div>
    );
}

// Shows a message when no time was tracked.
// TR: Hiç süre takip edilmediğinde bir mesaj gösterir.
export function StatsEmpty({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-line-strong px-6 py-10">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                <ChartBarIcon size={22} />
            </span>
            <p className="max-w-[52ch] text-sm leading-relaxed text-muted">{text}</p>
        </div>
    );
}
