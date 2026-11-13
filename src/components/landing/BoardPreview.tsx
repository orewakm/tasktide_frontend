'use client';

import { CheckCircleIcon } from '@phosphor-icons/react';
import { useEffect, useState, type ReactNode } from 'react';
import { PriorityTag } from '@/components/board/PriorityTag';
import { Avatar } from '@/components/ui/Avatar';
import { useLanguage } from '@/i18n/useLanguage';
import type { Priority } from '@/interfaces';
import { formatClock } from '@/lib/format';

const TIMER_START = 5045;

// Shows a made-up board with a ticking timer on the landing page.
// TR: Tanıtım sayfasında işleyen zamanlayıcılı örnek bir pano gösterir.
export function BoardPreview() {
    const { t } = useLanguage();
    const p = t.landing.preview;
    const [seconds, setSeconds] = useState(TIMER_START);

    useEffect(() => {
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div
            aria-hidden
            className="rounded-2xl border border-line bg-canvas/80 p-3 shadow-[0_32px_80px_-24px_rgb(0_0_0/0.7)] backdrop-blur-sm sm:p-4"
        >
            <div className="flex items-center justify-between gap-3 px-1 pb-3">
                <p className="truncate text-sm font-semibold">{p.board}</p>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <Avatar name="Ayşe Yılmaz" online />
                        <Avatar name="Mert Demir" online />
                        <Avatar name="Elif Kaya" />
                    </div>
                    <span className="text-xs whitespace-nowrap text-muted">{p.online}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-3 sm:gap-3">
                <PreviewColumn title={p.todo} count={2}>
                    <PreviewCard title={p.cards.onboarding} priority="high" person="Elif Kaya" />
                    <PreviewCard title={p.cards.server} priority="medium" />
                </PreviewColumn>
                <PreviewColumn title={p.doing} count={1}>
                    <PreviewCard
                        title={p.cards.notes}
                        priority="medium"
                        person="Ayşe Yılmaz"
                        timer={formatClock(seconds)}
                    />
                </PreviewColumn>
                <PreviewColumn title={p.done} count={2} hideOnPhone>
                    <PreviewCard title={p.cards.safari} priority="high" person="Mert Demir" done />
                    <PreviewCard title={p.cards.palette} priority="low" done />
                </PreviewColumn>
            </div>
        </div>
    );
}

interface PreviewColumnProps {
    title: string;
    count: number;
    hideOnPhone?: boolean;
    children: ReactNode;
}

// Shows one column of the preview board.
// TR: Önizleme panosunun bir sütununu gösterir.
function PreviewColumn({ title, count, hideOnPhone = false, children }: PreviewColumnProps) {
    return (
        <div
            className={`flex-col gap-2 rounded-xl bg-sunken p-2 ring-1 ring-line ${
                hideOnPhone ? 'hidden sm:flex' : 'flex'
            }`}
        >
            <p className="flex items-center gap-1.5 px-1 pt-0.5 text-[13px] font-semibold">
                {title}
                <span className="font-mono text-xs font-normal text-muted">{count}</span>
            </p>
            {children}
        </div>
    );
}

interface PreviewCardProps {
    title: string;
    priority: Priority;
    person?: string;
    done?: boolean;
    timer?: string;
}

// Shows one card of the preview board.
// TR: Önizleme panosunun bir kartını gösterir.
function PreviewCard({ title, priority, person, done = false, timer }: PreviewCardProps) {
    return (
        <div
            className={`rounded-lg border bg-surface p-3 ${
                timer ? 'border-accent ring-3 ring-accent/25' : 'border-line'
            }`}
        >
            <p
                className={`text-[13px] leading-snug font-medium ${done ? 'text-muted line-through' : ''}`}
            >
                {title}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
                <PriorityTag priority={priority} />
                {done && <CheckCircleIcon size={15} weight="fill" className="text-done" />}
                {person && <Avatar name={person} className="ml-auto" />}
            </div>
            {timer && (
                <p className="mt-3 flex items-center gap-2 border-t border-line pt-2.5 font-mono text-xs font-medium text-accent-ink tabular-nums">
                    <span className="relative flex size-2">
                        <span className="absolute inset-0 rounded-full bg-accent motion-safe:animate-ping" />
                        <span className="relative size-2 rounded-full bg-accent" />
                    </span>
                    {timer}
                </p>
            )}
        </div>
    );
}
