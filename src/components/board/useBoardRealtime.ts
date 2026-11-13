import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/components/AuthProvider';
import type {
    Board,
    Card,
    Column,
    Member,
    Note,
    OnlineUser,
    TimeEntry,
    TimeEntryDetails,
} from '@/interfaces';
import { applyPositions, removeWhere, upsert } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';
import { getSocket, useSocketEvent } from '@/lib/socket';

export type GoneReason = 'deleted' | 'removed';

// Joins the board's live room and applies its events to the cache.
// TR: Panonun canlı odasına katılır ve olaylarını önbelleğe uygular.
export function useBoardRealtime(boardId: string, onGone: (reason: GoneReason) => void) {
    const queryClient = useQueryClient();
    const me = useCurrentUser();
    const [online, setOnline] = useState<OnlineUser[]>([]);
    const [timers, setTimers] = useState<Record<string, TimeEntryDetails>>({});

    useEffect(() => {
        const socket = getSocket();
        let joinedBefore = false;

        // Joins the board's room and saves who is online.
        // TR: Panonun odasına katılır ve çevrimiçi kişileri kaydeder.
        function join() {
            socket
                .emitWithAck('board:join', boardId)
                .then((reply) => {
                    if (reply.ok) setOnline(reply.online);
                })
                .catch(() => {});
            if (joinedBefore) {
                for (const key of [
                    queryKeys.board(boardId),
                    queryKeys.columns(boardId),
                    queryKeys.cards(boardId),
                    queryKeys.members(boardId),
                ]) {
                    void queryClient.invalidateQueries({ queryKey: key });
                }
            }
            joinedBefore = true;
        }

        if (socket.connected) join();
        socket.on('connect', join);
        return () => {
            socket.off('connect', join);
            socket.emit('board:leave', boardId);
        };
    }, [boardId, queryClient]);

    // Updates the board's columns in the cache.
    // TR: Panonun sütunlarını önbellekte günceller.
    const setColumns = (update: (list: Column[] | undefined) => Column[] | undefined) =>
        queryClient.setQueryData<Column[]>(queryKeys.columns(boardId), update);

    // Updates the board's cards in the cache.
    // TR: Panonun kartlarını önbellekte günceller.
    const setCards = (update: (list: Card[] | undefined) => Card[] | undefined) =>
        queryClient.setQueryData<Card[]>(queryKeys.cards(boardId), update);

    // Updates the board's members in the cache.
    // TR: Panonun üyelerini önbellekte günceller.
    const setMembers = (update: (list: Member[] | undefined) => Member[] | undefined) =>
        queryClient.setQueryData<Member[]>(queryKeys.members(boardId), update);

    // Returns true if the column belongs to this board.
    // TR: Sütun bu panoya aitse true döndürür.
    const isOurColumn = (columnId: string) =>
        queryClient.getQueryData<Column[]>(queryKeys.columns(boardId))?.some((c) => c.id === columnId) ?? false;

    useSocketEvent('presence', (payload) => {
        if (payload.board_id === boardId) setOnline(payload.online);
    });

    useSocketEvent('board:updated', (board) => {
        if (board.id !== boardId) return;
        queryClient.setQueryData(queryKeys.board(boardId), board);
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => upsert(list, board));
    });
    useSocketEvent('board:deleted', ({ id }) => {
        if (id === boardId) onGone('deleted');
    });
    useSocketEvent('board:removed', ({ id }) => {
        if (id === boardId) onGone('removed');
    });

    useSocketEvent('member:added', ({ board_id, ...member }) => {
        if (board_id === boardId) setMembers((list) => upsert(list, member));
    });
    useSocketEvent('member:updated', ({ board_id, ...member }) => {
        if (board_id === boardId) setMembers((list) => upsert(list, member));
    });
    useSocketEvent('member:removed', ({ board_id, user_id }) => {
        if (board_id === boardId) setMembers((list) => removeWhere(list, (m) => m.id === user_id));
    });

    // Adds or updates a column from a live event.
    // TR: Canlı bir olaydan gelen sütunu ekler ya da günceller.
    const onColumn = (column: Column) => {
        if (column.board_id === boardId) setColumns((list) => upsert(list, column));
    };
    useSocketEvent('column:created', onColumn);
    useSocketEvent('column:updated', onColumn);
    useSocketEvent('column:moved', onColumn);
    useSocketEvent('column:deleted', ({ id, board_id }) => {
        if (board_id !== boardId) return;
        setColumns((list) => removeWhere(list, (c) => c.id === id));
        setCards((list) => removeWhere(list, (c) => c.column_id === id));
    });
    useSocketEvent('columns:renumbered', ({ board_id, columns }) => {
        if (board_id === boardId) setColumns((list) => applyPositions(list, columns));
    });

    // Adds or updates a card from a live event.
    // TR: Canlı bir olaydan gelen kartı ekler ya da günceller.
    const onCard = (card: Card) => {
        if (isOurColumn(card.column_id)) setCards((list) => upsert(list, card));
    };
    useSocketEvent('card:created', onCard);
    useSocketEvent('card:updated', onCard);
    useSocketEvent('card:moved', onCard);
    useSocketEvent('card:deleted', ({ id }) => setCards((list) => removeWhere(list, (c) => c.id === id)));
    useSocketEvent('cards:renumbered', ({ column_id, cards }) => {
        if (isOurColumn(column_id)) setCards((list) => applyPositions(list, cards));
    });

    // Adds or updates a note from a live event.
    // TR: Canlı bir olaydan gelen notu ekler ya da günceller.
    const onNote = (note: Note) =>
        queryClient.setQueryData<Note[]>(queryKeys.notes(note.card_id), (list) => upsert(list, note));
    useSocketEvent('note:created', onNote);
    useSocketEvent('note:updated', onNote);
    useSocketEvent('note:deleted', ({ id, card_id }) =>
        queryClient.setQueryData<Note[]>(queryKeys.notes(card_id), (list) => removeWhere(list, (n) => n.id === id)),
    );

    useSocketEvent('timer:started', (entry) => {
        if (entry.board_id !== boardId) return;
        setTimers((current) => ({ ...current, [entry.user_id]: entry }));
        if (entry.user_id === me.id) queryClient.setQueryData(queryKeys.timer, entry);
        void queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries(entry.card_id) });
    });
    useSocketEvent('timer:stopped', (entry) => {
        if (entry.board_id !== boardId) return;
        setTimers((current) => {
            const next = { ...current };
            delete next[entry.user_id];
            return next;
        });
        if (entry.user_id === me.id) queryClient.setQueryData(queryKeys.timer, null);
        void queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries(entry.card_id) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.cardStats(entry.card_id) });
    });
    useSocketEvent('time-entry:deleted', ({ id, card_id }) => {
        queryClient.setQueryData<TimeEntry[]>(queryKeys.timeEntries(card_id), (list) =>
            removeWhere(list, (e) => e.id === id),
        );
        void queryClient.invalidateQueries({ queryKey: queryKeys.cardStats(card_id) });
    });

    return { online, timers };
}
