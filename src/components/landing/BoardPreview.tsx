'use client';

import { CheckCircleIcon } from '@phosphor-icons/react';
import { useEffect, useState, type ReactNode } from 'react';
import { PriorityTag } from '@/components/board/PriorityTag';
import { Avatar } from '@/components/ui/Avatar';
import { useLanguage } from '@/i18n/useLanguage';
import type { Priority } from '@/interfaces';
import { formatClock } from '@/lib/format';

// The preview timer starts at 1:24:05 and counts up like a real one.
// TR: Önizleme zamanlayıcısı 1:24:05'ten başlar ve gerçeği gibi ileri sayar.
const TIMER_START = 5045;

// A small, made-up board that looks like the real one. It's only a picture, so screen
// readers skip it (aria-hidden); the text next to it says the same thing.
// Phones show two columns, bigger screens three.
// TR: Gerçeğine benzeyen küçük, uydurma bir pano. Sadece bir resim olduğu için ekran
// TR: okuyucular onu atlar (aria-hidden); yanındaki metin aynı şeyi söyler.
// TR: Telefonlar iki sütun, büyük ekranlar üç sütun gösterir.
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
    // The running clock, e.g. "1:24:05". Only the card with a timer has one.
    // TR: İşleyen saat, ör. "1:24:05". Sadece zamanlayıcısı olan kartta bulunur.
    timer?: string;
}
// Looks like the real CardTile, without the dragging and clicking.
// TR: Gerçek CardTile gibi görünür, sürükleme ve tıklama olmadan.
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
