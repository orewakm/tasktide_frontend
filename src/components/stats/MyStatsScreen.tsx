'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import { DailyChart } from './DailyChart';
import { RangePicker } from './RangePicker';
import { RankedList } from './RankedList';
import { StatsSkeleton } from './StatsSkeleton';
import { StatsEmpty, StatsHero, TopItem } from './StatsSummary';

// Shows my own tracked time across all my boards.
// TR: Tüm panolarımda takip ettiğim kendi süremi gösterir.
export function MyStatsScreen() {
    const { t } = useLanguage();
    const [days, setDays] = useState(30);

    const stats = useQuery({
        queryKey: queryKeys.myStats(days),
        queryFn: () => api.stats.mine(days),
        placeholderData: keepPreviousData,
    });

    const data = stats.data;
    const top = data ? [...data.by_board].sort((a, b) => b.seconds - a.seconds)[0] : undefined;

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t.myStats.title}</h1>
                <p className="mt-1 text-sm text-muted">{t.myStats.subtitle}</p>
            </div>

            <RangePicker value={days} onChange={setDays} />

            {stats.isError ? (
                <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                    {errorText(stats.error, t)}
                </p>
            ) : !data ? (
                <StatsSkeleton />
            ) : (
                <div
                    className={`flex flex-col gap-4 transition-opacity duration-200 ${
                        stats.isPlaceholderData ? 'opacity-60' : ''
                    }`}
                >
                    <StatsHero
                        total={data.total_seconds}
                        days={data.by_day}
                        sideLabel={t.myStats.topBoard}
                        side={
                            top && top.seconds > 0 ? (
                                <TopItem
                                    name={top.name}
                                    seconds={top.seconds}
                                    total={data.total_seconds}
                                    href={`/boards/${top.board_id}`}
                                />
                            ) : undefined
                        }
                    />

                    {data.total_seconds === 0 ? (
                        <StatsEmpty text={t.myStats.empty} />
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                            <DailyChart title={t.stats.perDay} days={data.by_day} />
                            <RankedList
                                title={t.myStats.byBoard}
                                rows={data.by_board.map((b) => ({
                                    id: b.board_id,
                                    label: b.name,
                                    seconds: b.seconds,
                                    href: `/boards/${b.board_id}/stats`,
                                }))}
                            />
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
