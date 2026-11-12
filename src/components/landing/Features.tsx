'use client';

import {
    ChartBarIcon,
    DeviceMobileIcon,
    EnvelopeSimpleIcon,
    KanbanIcon,
    ListChecksIcon,
    MoonStarsIcon,
    TimerIcon,
    TranslateIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { useLanguage } from '@/i18n/useLanguage';
import { formatDuration } from '@/lib/format';

// Four feature tiles (two wide ones with a small picture), then a row of smaller extras.
// TR: Dört özellik kutusu (ikisi geniş ve küçük bir resimli), ardından küçük ekstralar satırı.
export function Features() {
    const { t } = useLanguage();
    const f = t.landing.features;

    const extras = [
        { icon: TranslateIcon, text: f.extras.languages },
        { icon: MoonStarsIcon, text: f.extras.themes },
        { icon: EnvelopeSimpleIcon, text: f.extras.invites },
        { icon: DeviceMobileIcon, text: f.extras.phone },
    ];

    return (
        <section
            aria-labelledby="features-title"
            className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28"
        >
            <div className="max-w-2xl">
                <p className="text-[13px] font-semibold tracking-wide text-accent-ink uppercase">
                    {f.eyebrow}
                </p>
                <h2
                    id="features-title"
                    className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
                >
                    {f.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted">{f.body}</p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
                <Tile
                    wide
                    icon={<KanbanIcon size={20} weight="bold" />}
                    title={f.boards.title}
                    body={f.boards.body}
                >
                    <ActivityFeed />
                </Tile>
                <Tile
                    icon={<TimerIcon size={20} weight="bold" />}
                    title={f.timers.title}
                    body={f.timers.body}
                />
                <Tile
                    icon={<ListChecksIcon size={20} weight="bold" />}
                    title={f.tasks.title}
                    body={f.tasks.body}
                />
                <Tile
                    wide
                    icon={<ChartBarIcon size={20} weight="bold" />}
                    title={f.stats.title}
                    body={f.stats.body}
                >
                    <WeekChart />
                </Tile>
            </div>

            <ul className="mt-10 grid gap-x-8 gap-y-4 border-t border-line pt-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
                {extras.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5">
                        <Icon size={18} className="shrink-0 text-accent-ink" aria-hidden />
                        {text}
                    </li>
                ))}
            </ul>
        </section>
    );
}

interface TileProps {
    icon: ReactNode;
    title: string;
    body: string;
    // Wide tiles take two of the three columns on big screens, with the picture next to the text.
    // TR: Geniş kutular büyük ekranlarda üç sütunun ikisini kaplar; resim metnin yanında durur.
    wide?: boolean;
    children?: ReactNode;
}

function Tile({ icon, title, body, wide = false, children }: TileProps) {
    return (
        <div
            className={`grid gap-6 rounded-2xl border border-line bg-surface p-6 sm:p-8 ${
                wide ? 'sm:grid-cols-2 sm:items-center lg:col-span-2' : ''
            }`}
        >
            <div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent-ink">
                    {icon}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
            {children}
        </div>
    );
}

// Two made-up updates, like the ones you see on a board when a teammate does something.
// TR: Bir ekip arkadaşı bir şey yaptığında panoda gördüklerinize benzeyen iki uydurma güncelleme.
function ActivityFeed() {
    const { t } = useLanguage();
    const a = t.landing.features.activity;
    const items = [
        { person: 'Mert Demir', text: a.moved, when: a.now },
        { person: 'Ayşe Yılmaz', text: a.started, when: a.earlier },
    ];

    return (
        <ul aria-hidden className="flex flex-col gap-2">
            {items.map((item) => (
                <li
                    key={item.person}
                    className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3"
                >
                    <Avatar name={item.person} size="md" online />
                    <p className="text-[13px] leading-snug">
                        <span className="font-semibold">{item.person}</span> {item.text}
                        <span className="mt-1 block text-xs text-muted">{item.when}</span>
                    </p>
                </li>
            ))}
        </ul>
    );
}

// A made-up week of tracked hours, Monday to Sunday.
// TR: Uydurma bir haftanın takip edilen saatleri, pazartesiden pazara.
const WEEK_HOURS = [3.5, 5.25, 2, 6.5, 4, 1.5, 0.5];

function WeekChart() {
    const { t } = useLanguage();
    const total = WEEK_HOURS.reduce((sum, hours) => sum + hours, 0);
    const highest = Math.max(...WEEK_HOURS);

    return (
        <div aria-hidden className="rounded-xl border border-line bg-canvas p-4">
            <p className="text-xs text-muted">{t.landing.features.week}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                {formatDuration(total * 3600, t)}
            </p>
            <div className="mt-4 flex h-24 items-end gap-2 border-b border-line">
                {WEEK_HOURS.map((hours, day) => (
                    <div
                        key={day}
                        className="flex-1 rounded-t-[4px] bg-chart"
                        style={{ height: `${(hours / highest) * 100}%` }}
                    />
                ))}
            </div>
        </div>
    );
}
