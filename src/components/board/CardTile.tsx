'use client';

import { CheckCircleIcon, TextAlignLeftIcon, TimerIcon } from '@phosphor-icons/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar } from '@/components/ui/Avatar';
import { useLanguage } from '@/i18n/useLanguage';
import type { Card, Member } from '@/interfaces';
import { PriorityTag } from './PriorityTag';

interface CardFaceProps {
    card: Card;
    assignee?: Member;
    timerRunning: boolean;
}

// Shows a card's title, priority, status and assignee.
// TR: Bir kartın başlığını, önceliğini, durumunu ve atanan kişisini gösterir.
export function CardFace({ card, assignee, timerRunning }: CardFaceProps) {
    const { t } = useLanguage();
    const done = card.completed_at !== null;

    return (
        <>
            <p className={`text-[13px] leading-snug font-medium break-words ${done ? 'text-muted line-through' : ''}`}>
                {card.title}
            </p>
            <div className="mt-2.5 flex min-h-5 items-center gap-2.5">
                <PriorityTag priority={card.priority} />
                {done && <CheckCircleIcon size={15} weight="fill" className="text-done" aria-label={t.card.done} />}
                {card.description && <TextAlignLeftIcon size={14} className="text-muted" aria-hidden />}
                {timerRunning && (
                    <TimerIcon
                        size={15}
                        weight="bold"
                        className="text-accent-ink motion-safe:animate-pulse"
                        aria-label={t.board.timerOnCard}
                    />
                )}
                {assignee && <Avatar name={assignee.name} size="sm" className="ml-auto" />}
            </div>
        </>
    );
}

const tileClass =
    'rounded-lg border bg-surface p-3 shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-[border-color,box-shadow] duration-150';

interface CardTileProps extends CardFaceProps {
    onOpen: () => void;
}

// Shows a card in its column that can be dragged or opened.
// TR: Sütunundaki bir kartı sürüklenebilir ve açılabilir şekilde gösterir.
export function CardTile({ card, assignee, timerRunning, onOpen }: CardTileProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: { type: 'card' },
    });

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            {...attributes}
            {...listeners}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    onOpen();
                    return;
                }
                listeners?.onKeyDown?.(event);
            }}
            onClick={onOpen}
            className={`${tileClass} cursor-pointer touch-manipulation select-none ${
                timerRunning ? 'border-accent ring-3 ring-accent/25' : 'border-line hover:border-line-strong'
            } ${isDragging ? 'opacity-40' : ''}`}
        >
            <CardFace card={card} assignee={assignee} timerRunning={timerRunning} />
        </li>
    );
}

// Shows the copy of a card that follows the pointer while dragging.
// TR: Sürüklerken imleci takip eden kart kopyasını gösterir.
export function CardDragPreview(props: CardFaceProps) {
    return (
        <div className={`${tileClass} rotate-[1.5deg] border-line cursor-grabbing shadow-[0_16px_32px_-12px_rgb(0_0_0/0.35)]`}>
            <CardFace {...props} />
        </div>
    );
}
