'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { formatDuration } from '@/lib/format';

export interface RankedRow {
    id: string;
    label: string;
    seconds: number;
    leading?: ReactNode;
    href?: string;
}

interface RankedListProps {
    title: string;
    rows: RankedRow[];
}

// A list sorted by time, each row with a thin bar scaled to the biggest one.
// The number is always written next to the bar.
// TR: Süreye göre sıralı bir liste; her satırda en büyüğe göre ölçeklenmiş ince bir çubuk var.
// TR: Sayı her zaman çubuğun yanında yazılıdır.
export function RankedList({ title, rows }: RankedListProps) {
    const { t } = useLanguage();
    const sorted = [...rows].sort((a, b) => b.seconds - a.seconds);
    const max = sorted[0]?.seconds ?? 0;

    return (
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
            <h2 className="text-sm font-semibold">{title}</h2>
            <ol className="-mr-2 flex max-h-96 flex-col gap-3.5 overflow-y-auto pr-2">
                {sorted.map((row) => (
                    <li key={row.id} className="flex items-center gap-3">
                        {row.leading}
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex items-baseline justify-between gap-3 text-[13px]">
                                {row.href ? (
                                    <Link href={row.href} className="truncate font-medium underline-offset-4 hover:underline">
                                        {row.label}
                                    </Link>
                                ) : (
                                    <span className="truncate font-medium">{row.label}</span>
                                )}
                                <span className="shrink-0 font-mono text-muted tabular-nums">
                                    {formatDuration(row.seconds, t)}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-chart/15">
                                <div
                                    className="h-full rounded-full bg-chart"
                                    style={{ width: `${max > 0 ? Math.max(2, (row.seconds / max) * 100) : 0}%` }}
                                />
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
