'use client';

import { PlayIcon, StopIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/components/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/i18n/useLanguage';
import type { Card, TimeEntry } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { formatClock, formatDateTime, formatDuration } from '@/lib/format';
import { removeWhere } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';
import { elapsedSeconds, useMyTimer, useTimerActions } from '@/lib/timer';
import { useNow } from '@/lib/useNow';

export function CardTime({ card, isOwner }: { card: Card; isOwner: boolean }) {
    const { t, language } = useLanguage();
    const me = useCurrentUser();
    const queryClient = useQueryClient();
    const timer = useMyTimer();
    const { start, stop } = useTimerActions();
    const [busy, setBusy] = useState(false);

    const entries = useQuery({
        queryKey: queryKeys.timeEntries(card.id),
        queryFn: () => api.time.listForCard(card.id),
    });
    const stats = useQuery({ queryKey: queryKeys.cardStats(card.id), queryFn: () => api.stats.card(card.id) });

    const mine = timer.data ?? null;
    const runningHere = mine?.card_id === card.id;
    const anyRunning = entries.data?.some((entry) => entry.ended_at === null) ?? false;
    const now = useNow(runningHere || anyRunning);

    async function toggle() {
        setBusy(true);
        try {
            if (runningHere) await stop();
            else await start(card.id);
        } catch {
            // The timer actions already showed the error.
        } finally {
            setBusy(false);
        }
    }

    async function removeEntry(entry: TimeEntry) {
        try {
            await api.time.remove(entry.id);
            queryClient.setQueryData<TimeEntry[]>(queryKeys.timeEntries(card.id), (list) =>
                removeWhere(list, (e) => e.id === entry.id),
            );
            void queryClient.invalidateQueries({ queryKey: queryKeys.cardStats(card.id) });
        } catch (err) {
            toast.error(errorText(err, t));
        }
    }

    return (
        <section aria-labelledby={`time-${card.id}`} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <h3 id={`time-${card.id}`} className="text-sm font-semibold">
                    {t.card.time}
                </h3>
                {stats.data && (
                    <p className="text-[13px] text-muted">
                        {t.card.totalTracked}{' '}
                        <span className="font-mono font-medium text-ink tabular-nums">
                            {formatDuration(stats.data.total_seconds, t)}
                        </span>
                    </p>
                )}
            </div>

            {runningHere && mine ? (
                <Button variant="secondary" onClick={() => void toggle()} disabled={busy} className="self-start">
                    <StopIcon size={15} weight="fill" className="text-danger" />
                    {t.card.stopTimer}
                    <span className="font-mono text-accent-ink tabular-nums">
                        {formatClock(elapsedSeconds(mine, timer.dataUpdatedAt, now))}
                    </span>
                </Button>
            ) : (
                <Button onClick={() => void toggle()} disabled={busy} className="self-start">
                    <PlayIcon size={15} weight="fill" />
                    {mine ? t.card.switchTimer : t.card.startTimer}
                </Button>
            )}

            {entries.isPending ? (
                <Skeleton className="h-16" />
            ) : !entries.data || entries.data.length === 0 ? (
                <p className="text-[13px] text-muted">{t.card.noTime}</p>
            ) : (
                <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
                    {entries.data.map((entry) => {
                        const running = entry.ended_at === null;
                        const canDelete = !running && (entry.user_id === me.id || isOwner);
                        return (
                            <li key={entry.id} className="flex items-center gap-3 px-3 py-2">
                                <Avatar name={entry.user_name} size="sm" />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-[13px] font-medium">{entry.user_name}</span>
                                    <span className="text-xs text-muted">{formatDateTime(entry.started_at, language)}</span>
                                </div>
                                {running ? (
                                    <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent-ink tabular-nums">
                                        {t.card.running}{' '}
                                        {formatClock(entry.duration_seconds + Math.max(0, now - entries.dataUpdatedAt) / 1000)}
                                    </span>
                                ) : (
                                    <span className="font-mono text-[13px] tabular-nums">
                                        {formatDuration(entry.duration_seconds, t)}
                                    </span>
                                )}
                                {canDelete ? (
                                    <IconButton size="sm" label={t.card.deleteEntry} onClick={() => void removeEntry(entry)}>
                                        <TrashIcon size={15} />
                                    </IconButton>
                                ) : (
                                    <span className="size-7" aria-hidden />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
