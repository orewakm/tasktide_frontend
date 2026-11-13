'use client';

import {
    closestCenter,
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MouseSensor,
    pointerWithin,
    TouchSensor,
    useSensor,
    useSensors,
    type CollisionDetection,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ColumnsIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/useLanguage';
import type { Card, Column, Member } from '@/interfaces';
import { api } from '@/lib/api';
import { byPosition, positionAt, upsert } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';
import { CardDragPreview } from './CardTile';
import { ColumnHeader, ColumnView } from './ColumnView';
import { InlineAdd } from './InlineAdd';

interface BoardCanvasProps {
    boardId: string;
    columns: Column[];
    cards: Card[];
    membersById: Map<string, Member>;
    cardsWithTimer: Set<string>;
    isOwner: boolean;
    onOpenCard: (cardId: string) => void;
    onRenameColumn: (column: Column) => void;
    onDeleteColumn: (column: Column) => void;
}

type Dragging = { type: 'card' | 'column'; id: string };
type Origin = { columnId: string; position: number; index: number };

// Shows the columns and cards and handles drag and drop.
// TR: Sütunları ve kartları gösterir ve sürükle bırakı yönetir.
export function BoardCanvas({
    boardId,
    columns,
    cards,
    membersById,
    cardsWithTimer,
    isOwner,
    onOpenCard,
    onRenameColumn,
    onDeleteColumn,
}: BoardCanvasProps) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [dragging, setDragging] = useState<Dragging | null>(null);
    const origin = useRef<Origin | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] },
        }),
    );

    const sortedColumns = [...columns].sort(byPosition);
    const cardsByColumn = new Map<string, Card[]>(sortedColumns.map((column) => [column.id, []]));
    for (const card of [...cards].sort(byPosition)) cardsByColumn.get(card.column_id)?.push(card);

    // Returns the board's cards from the cache.
    // TR: Panonun kartlarını önbellekten döndürür.
    const getCards = () => queryClient.getQueryData<Card[]>(queryKeys.cards(boardId)) ?? [];

    // Updates the board's cards in the cache.
    // TR: Panonun kartlarını önbellekte günceller.
    const setCards = (update: (list: Card[]) => Card[]) =>
        queryClient.setQueryData<Card[]>(queryKeys.cards(boardId), (list) => (list ? update(list) : list));

    // Updates the board's columns in the cache.
    // TR: Panonun sütunlarını önbellekte günceller.
    const setColumns = (update: (list: Column[]) => Column[]) =>
        queryClient.setQueryData<Column[]>(queryKeys.columns(boardId), (list) => (list ? update(list) : list));

    // Picks the column or card under the pointer while dragging.
    // TR: Sürüklerken imlecin altındaki sütunu ya da kartı seçer.
    const collisionDetection: CollisionDetection = (args) => {
        if (args.active.data.current?.type === 'column') {
            return closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter((c) => c.data.current?.type === 'column'),
            });
        }
        const hits = pointerWithin(args);
        if (hits.length > 0) {
            const cardHit = hits.find((hit) => hit.data?.droppableContainer?.data.current?.type === 'card');
            return cardHit ? [cardHit] : hits;
        }
        return closestCorners(args);
    };

    // Remembers what is being dragged and where it started.
    // TR: Neyin sürüklendiğini ve nereden başladığını hatırlar.
    function handleDragStart({ active }: DragStartEvent) {
        const id = String(active.id);
        const type = active.data.current?.type as Dragging['type'];
        setDragging({ type, id });

        if (type === 'card') {
            const card = cards.find((c) => c.id === id);
            if (!card) return;
            const index = (cardsByColumn.get(card.column_id) ?? []).findIndex((c) => c.id === id);
            origin.current = { columnId: card.column_id, position: card.position, index };
        } else {
            const column = sortedColumns.find((c) => c.id === id);
            if (!column) return;
            origin.current = { columnId: column.id, position: column.position, index: sortedColumns.indexOf(column) };
        }
    }

    // Moves a dragged card into the column under the pointer.
    // TR: Sürüklenen kartı imlecin altındaki sütuna taşır.
    function handleDragOver({ active, over }: DragOverEvent) {
        if (!over || active.data.current?.type !== 'card') return;
        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;

        const current = getCards();
        const activeCard = current.find((c) => c.id === activeId);
        if (!activeCard) return;

        const overIsColumn = over.data.current?.type === 'column';
        const targetColumnId = overIsColumn ? overId : current.find((c) => c.id === overId)?.column_id;
        if (!targetColumnId || targetColumnId === activeCard.column_id) return;

        const target = current.filter((c) => c.column_id === targetColumnId && c.id !== activeId).sort(byPosition);
        let index = target.length;
        if (!overIsColumn) {
            index = target.findIndex((c) => c.id === overId);
            const dragged = active.rect.current.translated;
            if (dragged && dragged.top > over.rect.top + over.rect.height / 2) index += 1;
        }
        const position = positionAt(
            target.map((c) => c.position),
            index,
        );
        setCards((list) => list.map((c) => (c.id === activeId ? { ...c, column_id: targetColumnId, position } : c)));
    }

    // Puts a card back where it was before the drag.
    // TR: Bir kartı sürüklemeden önceki yerine geri koyar.
    function putCardBack(cardId: string, from: Origin) {
        setCards((list) =>
            list.map((c) => (c.id === cardId ? { ...c, column_id: from.columnId, position: from.position } : c)),
        );
    }

    // Saves a card's new place, or puts it back if the server refuses.
    // TR: Kartın yeni yerini kaydeder, sunucu reddederse geri koyar.
    function finishCardDrag(cardId: string, overId: string | null, overType: unknown, from: Origin) {
        const card = getCards().find((c) => c.id === cardId);
        if (!card) return;

        const list = getCards()
            .filter((c) => c.column_id === card.column_id)
            .sort(byPosition);
        const fromIndex = list.findIndex((c) => c.id === cardId);
        let toIndex = fromIndex;
        if (overId && overType === 'card' && overId !== cardId) {
            const overIndex = list.findIndex((c) => c.id === overId);
            if (overIndex !== -1) toIndex = overIndex;
        }

        if (card.column_id === from.columnId && toIndex === from.index) {
            putCardBack(cardId, from);
            return;
        }

        const others = list.filter((c) => c.id !== cardId);
        const position = positionAt(
            others.map((c) => c.position),
            toIndex,
        );
        setCards((all) => all.map((c) => (c.id === cardId ? { ...c, position } : c)));

        api.cards
            .move(cardId, { columnId: card.column_id, index: toIndex })
            .then((saved) => setCards((all) => upsert(all, saved) ?? all))
            .catch(() => {
                putCardBack(cardId, from);
                toast.error(t.board.moveFailed);
            });
    }

    // Saves a column's new place, or puts it back if the server refuses.
    // TR: Sütunun yeni yerini kaydeder, sunucu reddederse geri koyar.
    function finishColumnDrag(columnId: string, overId: string | null, from: Origin) {
        if (!overId || overId === columnId) return;
        const toIndex = sortedColumns.findIndex((c) => c.id === overId);
        if (toIndex === -1 || toIndex === from.index) return;

        const others = sortedColumns.filter((c) => c.id !== columnId);
        const position = positionAt(
            others.map((c) => c.position),
            toIndex,
        );
        setColumns((list) => list.map((c) => (c.id === columnId ? { ...c, position } : c)));

        api.columns
            .move(columnId, toIndex)
            .then((saved) => setColumns((list) => upsert(list, saved) ?? list))
            .catch(() => {
                setColumns((list) => list.map((c) => (c.id === columnId ? { ...c, position: from.position } : c)));
                toast.error(t.board.moveFailed);
            });
    }

    // Finishes a card or column drag.
    // TR: Bir kart ya da sütun sürüklemesini bitirir.
    function handleDragEnd({ active, over }: DragEndEvent) {
        const from = origin.current;
        origin.current = null;
        setDragging(null);
        if (!from) return;

        const id = String(active.id);
        const overId = over ? String(over.id) : null;
        if (active.data.current?.type === 'column') finishColumnDrag(id, overId, from);
        else finishCardDrag(id, overId, over?.data.current?.type, from);
    }

    // Puts the dragged item back when the drag is cancelled.
    // TR: Sürükleme iptal edilince öğeyi geri koyar.
    function handleDragCancel() {
        const from = origin.current;
        origin.current = null;
        if (dragging?.type === 'card' && from) putCardBack(dragging.id, from);
        setDragging(null);
    }

    // Creates a card at the bottom of a column.
    // TR: Bir sütunun en altına kart oluşturur.
    async function addCard(columnId: string, title: string) {
        const card = await api.cards.create(columnId, { title });
        setCards((list) => upsert(list, card) ?? list);
    }

    // Creates a column at the end of the board.
    // TR: Panonun sonuna bir sütun oluşturur.
    async function addColumn(name: string) {
        const column = await api.columns.create(boardId, name);
        setColumns((list) => upsert(list, column) ?? list);
    }

    const draggedCard = dragging?.type === 'card' ? cards.find((c) => c.id === dragging.id) : undefined;
    const draggedColumn = dragging?.type === 'column' ? columns.find((c) => c.id === dragging.id) : undefined;

    return (
        <DndContext
            id={`board-${boardId}`}
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex min-h-0 flex-1 items-start gap-3 overflow-x-auto px-4 py-4 sm:px-6 sm:py-5">
                <SortableContext items={sortedColumns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                    {sortedColumns.map((column) => (
                        <ColumnView
                            key={column.id}
                            column={column}
                            cards={cardsByColumn.get(column.id) ?? []}
                            membersById={membersById}
                            cardsWithTimer={cardsWithTimer}
                            canDelete={isOwner}
                            onOpenCard={onOpenCard}
                            onAddCard={addCard}
                            onRename={() => onRenameColumn(column)}
                            onDelete={() => onDeleteColumn(column)}
                        />
                    ))}
                </SortableContext>

                <div className="flex w-[18rem] shrink-0 flex-col gap-3">
                    {sortedColumns.length === 0 && (
                        <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
                            <ColumnsIcon size={22} className="text-accent-ink" />
                            <h2 className="text-sm font-semibold">{t.board.emptyTitle}</h2>
                            <p className="text-[13px] leading-relaxed text-muted">{t.board.emptyBody}</p>
                        </div>
                    )}
                    <InlineAdd
                        variant="column"
                        buttonLabel={t.board.addColumn}
                        inputLabel={t.board.columnName}
                        maxLength={100}
                        onAdd={addColumn}
                    />
                </div>
            </div>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                {draggedCard ? (
                    <CardDragPreview
                        card={draggedCard}
                        assignee={draggedCard.assignee_id ? membersById.get(draggedCard.assignee_id) : undefined}
                        timerRunning={cardsWithTimer.has(draggedCard.id)}
                    />
                ) : draggedColumn ? (
                    <div className="w-[18rem] rotate-[1deg] rounded-xl bg-sunken opacity-95 shadow-[0_20px_40px_-16px_rgb(0_0_0/0.4)] ring-1 ring-line">
                        <ColumnHeader
                            column={draggedColumn}
                            count={cardsByColumn.get(draggedColumn.id)?.length ?? 0}
                            canDelete={false}
                        />
                        <div className="h-24" />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
