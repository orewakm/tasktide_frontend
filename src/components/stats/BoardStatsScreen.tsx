'use client';

import { ArrowLeftIcon } from '@phosphor-icons/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { BoardNotFound } from '@/components/board/BoardNotFound';
import { Avatar } from '@/components/ui/Avatar';
import { useLanguage } from '@/i18n/useLanguage';
import type { BoardStats } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText, isStatus } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import { CardSummary } from './CardSummary';
import { DailyChart } from './DailyChart';
import { RangePicker } from './RangePicker';
import { RankedList } from './RankedList';
import { StatsSkeleton } from './StatsSkeleton';
import { StatsEmpty, StatsHero, TopItem } from './StatsSummary';

// Shows a board's card summary and time stats for the chosen range.
// TR: Bir panonun kart özetini ve seçilen aralığın süre istatistiklerini gösterir.
export function BoardStatsScreen({ boardId }: { boardId: string }) {
    const { t } = useLanguage();
    const [days, setDays] = useState(30);

    const board = useQuery({ queryKey: queryKeys.board(boardId), queryFn: () => api.boards.get(boardId) });
    const stats = useQuery({
        queryKey: queryKeys.boardStats(boardId, days),
        queryFn: () => api.stats.board(boardId, days),
        placeholderData: keepPreviousData,
    });

    if (isStatus(board.error, 404) || isStatus(stats.error, 404)) return <BoardNotFound />;

    const error = board.error ?? stats.error;

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
            <div className="flex flex-col gap-3">
                <Link
                    href={`/boards/${boardId}`}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
                >
                    <ArrowLeftIcon size={14} weight="bold" />
                    {t.stats.backToBoard}
                </Link>
                <div>
                    <p className="min-h-5 truncate text-[13px] text-muted">{board.data?.name}</p>
                    <h1 className="text-2xl font-semibold tracking-tight">{t.stats.title}</h1>
                </div>
            </div>

            <section aria-labelledby="cards-title" className="flex flex-col gap-4">
                <h2 id="cards-title" className="text-lg font-semibold tracking-tight">
                    {t.stats.cards}
                </h2>
                <CardSummary boardId={boardId} />
            </section>

            <section aria-labelledby="time-title" className="flex flex-col gap-4 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="time-title" className="text-lg font-semibold tracking-tight">
                        {t.stats.timeSection}
                    </h2>
                    <RangePicker value={days} onChange={setDays} />
                </div>

                {error ? (
                    <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                        {errorText(error, t)}
                    </p>
                ) : !stats.data ? (
                    <StatsSkeleton />
                ) : (
                    <div
                        className={`flex flex-col gap-4 transition-opacity duration-200 ${
                            stats.isPlaceholderData ? 'opacity-60' : ''
                        }`}
                    >
                        <BoardStatsBody stats={stats.data} />
                    </div>
                )}
            </section>
        </main>
    );
}

// Shows the board's total time, daily chart and lists per person and card.
// TR: Panonun toplam süresini, günlük grafiğini ve kişi ile kart listelerini gösterir.
function BoardStatsBody({ stats }: { stats: BoardStats }) {
    const { t } = useLanguage();
    const top = [...stats.by_user].sort((a, b) => b.seconds - a.seconds)[0];

    return (
        <>
            <StatsHero
                total={stats.total_seconds}
                days={stats.by_day}
                sideLabel={t.stats.topPerson}
                side={
                    top && top.seconds > 0 ? (
                        <TopItem
                            name={top.name}
                            seconds={top.seconds}
                            total={stats.total_seconds}
                            leading={<Avatar name={top.name} size="md" />}
                        />
                    ) : undefined
                }
            />

            {stats.total_seconds === 0 ? (
                <StatsEmpty text={t.stats.empty} />
            ) : (
                <>
                    <DailyChart title={t.stats.perDay} days={stats.by_day} />
                    <div className="grid gap-4 lg:grid-cols-2">
                        <RankedList
                            title={t.stats.byPerson}
                            rows={stats.by_user.map((u) => ({
                                id: u.user_id,
                                label: u.name,
                                seconds: u.seconds,
                                leading: <Avatar name={u.name} size="md" />,
                            }))}
                        />
                        <RankedList
                            title={t.stats.byCard}
                            rows={stats.by_card.map((c) => ({ id: c.card_id, label: c.title, seconds: c.seconds }))}
                        />
                    </div>
                </>
            )}
        </>
    );
}
