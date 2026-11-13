'use client';

import { StopIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/useLanguage';
import { formatClock } from '@/lib/format';
import { elapsedSeconds, useMyTimer, useTimerActions } from '@/lib/timer';
import { useNow } from '@/lib/useNow';

// Shows my running timer in the header with a stop button.
// TR: Çalışan zamanlayıcımı üst çubukta durdur butonuyla gösterir.
export function RunningTimer() {
    const { t } = useLanguage();
    const timer = useMyTimer();
    const { stop } = useTimerActions();
    const entry = timer.data;
    const now = useNow(Boolean(entry));

    if (!entry) return null;

    return (
        <div className="flex h-8 items-center gap-1 rounded-full border border-accent/40 bg-accent/15 pr-0.5 pl-3 text-[13px] shadow-[0_0_24px_-6px_var(--accent)]">
            <span className="relative mr-1 flex size-2" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-accent motion-safe:animate-ping" />
                <span className="relative size-2 rounded-full bg-accent" />
            </span>
            <Link
                href={`/boards/${entry.board_id}`}
                className="hidden max-w-40 truncate font-medium text-ink hover:underline md:block"
                title={entry.card_title}
            >
                {entry.card_title}
            </Link>
            <span className="font-mono text-[13px] font-medium text-accent-ink tabular-nums md:ml-1.5">
                {formatClock(elapsedSeconds(entry, timer.dataUpdatedAt, now))}
            </span>
            <button
                type="button"
                onClick={() => void stop().catch(() => {})}
                aria-label={t.header.stopTimer}
                title={t.header.stopTimer}
                className="ml-1 flex size-7 items-center justify-center rounded-full text-accent-ink transition-colors hover:bg-accent/25"
            >
                <StopIcon size={14} weight="fill" />
            </button>
        </div>
    );
}
