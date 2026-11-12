'use client';

import { UserCircleDashedIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { PRIORITY_STYLES } from '@/components/board/PriorityTag';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/i18n/useLanguage';
import type { BoardSummary, CardCounts } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';

const percentDone = (counts: CardCounts) =>
    counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

// How far the board's cards are: done vs not done, overall and per column, priority and person.
// Card counts are not tied to the date range below, so this section has its own query.
// TR: Panodaki kartların durumu: tamamlanan ve tamamlanmayan, toplamda ve sütun, öncelik ve kişiye göre.
// TR: Kart sayıları aşağıdaki tarih aralığına bağlı değil, bu yüzden bu bölümün kendi sorgusu var.
export function CardSummary({ boardId }: { boardId: string }) {
    const { t } = useLanguage();
    const summary = useQuery({ queryKey: queryKeys.boardSummary(boardId), queryFn: () => api.stats.summary(boardId) });

    if (summary.error) {
        return (
            <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {errorText(summary.error, t)}
            </p>
        );
    }

    if (!summary.data) {
        return (
            <div className="flex flex-col gap-4" aria-busy="true">
                <Skeleton className="h-32 rounded-xl" />
                <div className="grid gap-4 lg:grid-cols-3">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (summary.data.total === 0) {
        return <p className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted">{t.stats.noCards}</p>;
    }

    return <SummaryBody summary={summary.data} />;
}

function SummaryBody({ summary }: { summary: BoardSummary }) {
    const { t } = useLanguage();
    const percent = percentDone(summary);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                    <div className="flex flex-col gap-1">
                        <p className="text-5xl font-semibold tracking-tight tabular-nums">{t.stats.percentDone(percent)}</p>
                        <p className="text-sm text-muted">{t.stats.doneOf(summary.completed, summary.total)}</p>
                    </div>
                    <p className="text-[13px] text-muted">{t.stats.notDoneCount(summary.pending)}</p>
                </div>
                <Meter counts={summary} size="lg" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <BreakdownList
                    title={t.stats.byColumn}
                    rows={summary.by_column.map((column) => ({ id: column.column_id, label: column.name, counts: column }))}
                />
                <BreakdownList
                    title={t.stats.byPriority}
                    rows={summary.by_priority.map((row) => {
                        const { icon: Icon, className } = PRIORITY_STYLES[row.priority];
                        return {
                            id: row.priority,
                            label: t.card.priorities[row.priority],
                            counts: row,
                            leading: <Icon size={16} weight="bold" className={`shrink-0 ${className}`} />,
                        };
                    })}
                />
                <BreakdownList
                    title={t.stats.byPerson}
                    rows={summary.by_assignee.map((row) => ({
                        id: row.user_id ?? 'unassigned',
                        label: row.name ?? t.card.unassigned,
                        muted: row.user_id === null,
                        counts: row,
                        leading:
                            row.name === null ? (
                                <UserCircleDashedIcon size={24} className="shrink-0 text-muted" />
                            ) : (
                                <Avatar name={row.name} />
                            ),
                    }))}
                />
            </div>
        </div>
    );
}

interface BreakdownRow {
    id: string;
    label: string;
    counts: CardCounts;
    leading?: ReactNode;
    muted?: boolean;
}

// One panel of rows, each with "done/total" and a bar showing the share that's done.
// TR: Satırlardan oluşan bir panel; her satırda "tamamlanan/toplam" ve tamamlanan payını gösteren bir çubuk.
function BreakdownList({ title, rows }: { title: string; rows: BreakdownRow[] }) {
    const { t } = useLanguage();

    return (
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
            <h3 className="text-sm font-semibold">{title}</h3>
            <ul className="-mr-2 flex max-h-80 flex-col gap-3.5 overflow-y-auto pr-2">
                {rows.map((row) => (
                    <li key={row.id} className="flex items-center gap-3">
                        {row.leading}
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex items-baseline justify-between gap-3 text-[13px]">
                                <span className={`truncate font-medium ${row.muted ? 'text-muted' : ''}`}>{row.label}</span>
                                <span className="shrink-0 font-mono text-muted tabular-nums">
                                    {row.counts.total === 0 ? (
                                        t.stats.emptyColumn
                                    ) : (
                                        <>
                                            <span aria-hidden>{t.stats.rowDone(row.counts.completed, row.counts.total)}</span>
                                            {/* Screen readers get the full sentence instead of "3/5". */}
                                            <span className="sr-only">
                                                {t.stats.rowDoneLabel(row.counts.completed, row.counts.total)}
                                            </span>
                                        </>
                                    )}
                                </span>
                            </div>
                            <Meter counts={row.counts} />
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

// A thin track filled up to the share of cards that are done. The numbers are always written
// next to it, so the bar is never the only way to read the value.
// TR: Tamamlanan kart payı kadar dolan ince bir çubuk. Sayılar her zaman yanında yazılı,
// TR: bu yüzden değeri okumanın tek yolu çubuk değildir.
function Meter({ counts, size = 'sm' }: { counts: CardCounts; size?: 'sm' | 'lg' }) {
    const percent = percentDone(counts);

    return (
        <div aria-hidden className={`rounded-full bg-progress/15 ${size === 'lg' ? 'h-2.5' : 'h-1.5'}`}>
            {percent > 0 && <div className="h-full rounded-full bg-progress" style={{ width: `${Math.max(2, percent)}%` }} />}
        </div>
    );
}
