'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLanguage } from '@/i18n/useLanguage';
import type { DaySeconds } from '@/interfaces';
import { formatDay, formatDuration } from '@/lib/format';

interface DailyChartProps {
    title: string;
    days: DaySeconds[];
}

const axisTick = { fill: 'var(--muted)', fontSize: 12 };

// Shows the tracked time per day as a bar chart.
// TR: Gün başına takip edilen süreyi çubuk grafikle gösterir.
export function DailyChart({ title, days }: DailyChartProps) {
    const { t, language } = useLanguage();

    const max = Math.max(0, ...days.map((d) => d.seconds));
    const unit = max >= 3600 ? 3600 : 60;
    const data = days.map((d) => ({ day: d.day, value: d.seconds / unit, seconds: d.seconds }));

    // Formats an axis value in hours or minutes.
    // TR: Bir eksen değerini saat ya da dakika olarak biçimlendirir.
    const formatTick = (value: number) => (unit === 3600 ? t.time.hours(value) : t.time.minutes(value));

    return (
        <figure className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
            <figcaption className="text-sm font-semibold">{title}</figcaption>

            <div className="h-64 w-full">
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }} barCategoryGap="20%">
                        <CartesianGrid vertical={false} stroke="var(--line)" />
                        <XAxis
                            dataKey="day"
                            tickFormatter={(day: string) => formatDay(day, language)}
                            axisLine={false}
                            tickLine={false}
                            tick={axisTick}
                            tickMargin={8}
                            minTickGap={28}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tickFormatter={formatTick}
                            axisLine={false}
                            tickLine={false}
                            tick={axisTick}
                            allowDecimals={false}
                            width={52}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--sunken)' }}
                            isAnimationActive={false}
                            content={({ active, payload }) => {
                                const point = payload?.[0]?.payload as (typeof data)[number] | undefined;
                                if (!active || !point) return null;
                                return (
                                    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.25)]">
                                        <p className="flex items-center gap-2 text-sm font-semibold">
                                            <span className="h-0.5 w-3 rounded-full bg-chart" aria-hidden />
                                            {formatDuration(point.seconds, t)}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted">{formatDay(point.day, language)}</p>
                                    </div>
                                );
                            }}
                        />
                        <Bar
                            dataKey="value"
                            fill="var(--chart)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={24}
                            isAnimationActive={false}
                            activeBar={{ fillOpacity: 0.8 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <details className="text-[13px]">
                <summary className="w-fit cursor-pointer text-muted hover:text-ink">{t.stats.showTable}</summary>
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-line">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-sunken text-xs text-muted">
                            <tr>
                                <th scope="col" className="px-3 py-1.5 font-medium">
                                    {t.stats.day}
                                </th>
                                <th scope="col" className="px-3 py-1.5 text-right font-medium">
                                    {t.stats.time}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {days.map((d) => (
                                <tr key={d.day}>
                                    <td className="px-3 py-1.5">{formatDay(d.day, language)}</td>
                                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                                        {d.seconds > 0 ? formatDuration(d.seconds, t) : '0'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </figure>
    );
}
