'use client';

import { LightningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCurrentUser } from '@/components/AuthProvider';
import { useLanguage } from '@/i18n/useLanguage';
import { api } from '@/lib/api';
import { formatDuration } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';

// Greets me and shows how much time I tracked today.
// TR: Beni selamlar ve bugün ne kadar süre takip ettiğimi gösterir.
export function TodayGreeting() {
    const { t } = useLanguage();
    const me = useCurrentUser();
    const [hour] = useState(() => new Date().getHours());
    const today = useQuery({ queryKey: queryKeys.myStats(1), queryFn: () => api.stats.mine(1) });

    const firstName = me.name.trim().split(/\s+/)[0];
    const greeting =
        hour < 12
            ? t.boards.greeting.morning(firstName)
            : hour < 18
              ? t.boards.greeting.afternoon(firstName)
              : t.boards.greeting.evening(firstName);
    const seconds = today.data?.total_seconds ?? 0;

    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{greeting}</h1>
            <p className="min-h-7">
                {today.data &&
                    (seconds > 0 ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 py-1 pr-3 pl-2 text-sm font-medium motion-safe:animate-fade">
                            <LightningIcon size={16} weight="fill" className="text-accent-ink" />
                            {t.boards.todayTracked(formatDuration(seconds, t))}
                        </span>
                    ) : (
                        <span className="text-sm text-muted motion-safe:animate-fade">{t.boards.todayNothing}</span>
                    ))}
            </p>
        </div>
    );
}
