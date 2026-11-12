'use client';

import { DotsSixVerticalIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { Menu } from '@/components/ui/Menu';
import { useLanguage } from '@/i18n/useLanguage';
import type { Card, Column, Member } from '@/interfaces';
import { CardTile } from './CardTile';
import { InlineAdd } from './InlineAdd';

interface ColumnViewProps {
    column: Column;
    cards: Card[];
    membersById: Map<string, Member>;
    cardsWithTimer: Set<string>;
    canDelete: boolean;
    onOpenCard: (cardId: string) => void;
    onAddCard: (columnId: string, title: string) => Promise<void>;
    onRename: () => void;
    onDelete: () => void;
}

export function ColumnView({
    column,
    cards,
    membersById,
    cardsWithTimer,
    canDelete,
    onOpenCard,
    onAddCard,
    onRename,
    onDelete,
}: ColumnViewProps) {
    const { t } = useLanguage();
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: { type: 'column' },
    });

    return (
        <section
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            aria-label={column.name}
            className={`flex max-h-full w-[18rem] shrink-0 flex-col rounded-xl bg-sunken ring-1 ring-line/60 ${
                isDragging ? 'opacity-40' : ''
            }`}
        >
            <ColumnHeader
                column={column}
                count={cards.length}
                canDelete={canDelete}
                onRename={onRename}
                onDelete={onDelete}
                handle={
                    <button
                        ref={setActivatorNodeRef}
                        type="button"
                        {...attributes}
                        {...listeners}
                        aria-label={t.board.moveColumn}
                        title={t.board.moveColumn}
                        className="flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink active:cursor-grabbing"
                    >
                        <DotsSixVerticalIcon size={16} weight="bold" />
                    </button>
                }
            />

            <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                <ol className="flex min-h-14 flex-col gap-2 overflow-y-auto px-2 pt-1 pb-2">
                    {cards.map((card) => (
                        <CardTile
                            key={card.id}
                            card={card}
                            assignee={card.assignee_id ? membersById.get(card.assignee_id) : undefined}
                            timerRunning={cardsWithTimer.has(card.id)}
                            onOpen={() => onOpenCard(card.id)}
                        />
                    ))}
                    {cards.length === 0 && (
                        <li className="flex h-14 items-center justify-center rounded-lg border border-dashed border-line-strong text-xs text-muted">
                            {t.board.dropHere}
                        </li>
                    )}
                </ol>
            </SortableContext>

            <div className="px-2 pb-2">
                <InlineAdd
                    buttonLabel={t.board.addCard}
                    inputLabel={t.board.cardTitle}
                    maxLength={200}
                    onAdd={(title) => onAddCard(column.id, title)}
                />
            </div>
        </section>
    );
}

interface ColumnHeaderProps {
    column: Column;
    count: number;
    canDelete: boolean;
    onRename?: () => void;
    onDelete?: () => void;
    handle?: ReactNode;
}

export function ColumnHeader({ column, count, canDelete, onRename, onDelete, handle }: ColumnHeaderProps) {
    const { t } = useLanguage();

    return (
        <header className="flex items-center gap-1 py-2 pr-1.5 pl-1.5">
            {handle}
            <h2 className="min-w-0 truncate text-[13px] font-semibold">{column.name}</h2>
            <span className="font-mono text-xs text-muted tabular-nums">{count}</span>
            <div className="ml-auto">
                {onRename && onDelete && (
                    <Menu
                        label={t.common.more}
                        items={[
                            { label: t.board.renameColumn, icon: <PencilSimpleIcon size={16} />, onSelect: onRename },
                            ...(canDelete
                                ? [
                                      {
                                          label: t.board.deleteColumn,
                                          icon: <TrashIcon size={16} />,
                                          onSelect: onDelete,
                                          danger: true,
                                      },
                                  ]
                                : []),
                        ]}
                    />
                )}
            </div>
        </header>
    );
}
