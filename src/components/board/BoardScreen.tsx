'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/components/AuthProvider';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NameDialog } from '@/components/ui/NameDialog';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board, Card, Column } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText, isStatus } from '@/lib/errors';
import { removeWhere, upsert } from '@/lib/lists';
import { isBoardOwner } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryKeys';
import { useMyTimer } from '@/lib/timer';
import { BoardCanvas } from './BoardCanvas';
import { BoardHeader } from './BoardHeader';
import { BoardNotFound } from './BoardNotFound';
import { BoardSkeleton } from './BoardSkeleton';
import { CardPanel } from './CardPanel';
import { MembersDialog } from './MembersDialog';
import { useBoardRealtime, type GoneReason } from './useBoardRealtime';

// Only one dialog is open at a time, so one piece of state describes it.
// TR: Aynı anda sadece bir diyalog açık olur, bu yüzden onu tek bir state tanımlar.
type OpenDialog =
    | { kind: 'members' }
    | { kind: 'renameBoard' }
    | { kind: 'deleteBoard' }
    | { kind: 'leave' }
    | { kind: 'renameColumn'; column: Column }
    | { kind: 'deleteColumn'; column: Column }
    | null;

export function BoardScreen({ boardId }: { boardId: string }) {
    const { t } = useLanguage();
    const me = useCurrentUser();
    const router = useRouter();
    const queryClient = useQueryClient();

    const board = useQuery({ queryKey: queryKeys.board(boardId), queryFn: () => api.boards.get(boardId) });
    const columns = useQuery({ queryKey: queryKeys.columns(boardId), queryFn: () => api.columns.list(boardId) });
    const cards = useQuery({ queryKey: queryKeys.cards(boardId), queryFn: () => api.cards.list(boardId) });
    const members = useQuery({ queryKey: queryKeys.members(boardId), queryFn: () => api.members.list(boardId) });
    const myTimer = useMyTimer();

    // The open card lives in the URL (?card=id), so a card can be linked to (from the task list,
    // or shared) and stays open after a reload. replaceState updates the URL without a reload,
    // and Next.js keeps useSearchParams in sync with it.
    // TR: Açık kart URL'de durur (?card=id); böylece bir karta bağlantı verilebilir (görev listesinden
    // TR: ya da paylaşarak) ve sayfa yenilenince açık kalır. replaceState URL'yi sayfayı yenilemeden
    // TR: günceller, Next.js de useSearchParams'ı bununla senkron tutar.
    const searchParams = useSearchParams();
    const openCardId = searchParams.get('card');
    function setOpenCardId(id: string | null) {
        const url = new URL(window.location.href);
        if (id) url.searchParams.set('card', id);
        else url.searchParams.delete('card');
        window.history.replaceState(null, '', url);
    }
    const [dialog, setDialog] = useState<OpenDialog>(null);
    const closeDialog = () => setDialog(null);

    // Set right before this user deletes or leaves the board, so the live event
    // that follows doesn't show a second message.
    // TR: Bu kullanıcı panoyu silmeden veya panodan ayrılmadan hemen önce ayarlanır;
    // TR: böylece ardından gelen canlı event ikinci bir mesaj göstermez.
    const leavingOnPurpose = useRef(false);

    function dropBoardFromList() {
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => removeWhere(list, (b) => b.id === boardId));
    }

    function handleGone(reason: GoneReason) {
        if (leavingOnPurpose.current) return;
        dropBoardFromList();
        toast(reason === 'deleted' ? t.board.deletedElsewhere : t.board.lostAccess);
        router.replace('/boards');
    }

    const { online, timers } = useBoardRealtime(boardId, handleGone);

    if (board.isError) {
        if (isStatus(board.error, 404)) return <BoardNotFound />;
        return <LoadError message={errorText(board.error, t)} />;
    }
    const failed = [columns, cards, members].find((query) => query.isError);
    if (failed) return <LoadError message={errorText(failed.error, t)} />;
    if (!board.data || !columns.data || !cards.data || !members.data) return <BoardSkeleton />;

    const canManage = isBoardOwner(board.data, me);
    const canLeave = board.data.owner_id !== me.id;
    const membersById = new Map(members.data.map((member) => [member.id, member]));

    // Running timers on this board: other people's from live events, plus our own.
    const others = Object.values(timers).filter((entry) => entry.user_id !== me.id);
    const cardsWithTimer = new Set(others.map((entry) => entry.card_id));
    if (myTimer.data?.board_id === boardId) cardsWithTimer.add(myTimer.data.card_id);

    const openCard = openCardId ? cards.data.find((card) => card.id === openCardId) : undefined;
    const openCardColumn = openCard ? columns.data.find((column) => column.id === openCard.column_id) : undefined;

    async function renameBoard(name: string) {
        const updated = await api.boards.rename(boardId, name);
        queryClient.setQueryData(queryKeys.board(boardId), updated);
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => upsert(list, updated));
        toast.success(t.boards.renamed);
    }

    async function deleteBoard() {
        leavingOnPurpose.current = true;
        try {
            await api.boards.remove(boardId);
        } catch (err) {
            leavingOnPurpose.current = false;
            toast.error(errorText(err, t));
            throw err;
        }
        dropBoardFromList();
        toast.success(t.boards.deleted);
        router.replace('/boards');
    }

    async function leaveBoard() {
        leavingOnPurpose.current = true;
        try {
            await api.members.remove(boardId, me.id);
        } catch (err) {
            leavingOnPurpose.current = false;
            toast.error(errorText(err, t));
            throw err;
        }
        dropBoardFromList();
        toast.success(t.members.left);
        router.replace('/boards');
    }

    async function renameColumn(column: Column, name: string) {
        const updated = await api.columns.rename(column.id, name);
        queryClient.setQueryData<Column[]>(queryKeys.columns(boardId), (list) => upsert(list, updated));
    }

    async function deleteColumn(column: Column) {
        try {
            await api.columns.remove(column.id);
        } catch (err) {
            toast.error(errorText(err, t));
            throw err;
        }
        queryClient.setQueryData<Column[]>(queryKeys.columns(boardId), (list) =>
            removeWhere(list, (c) => c.id === column.id),
        );
        queryClient.setQueryData<Card[]>(queryKeys.cards(boardId), (list) =>
            removeWhere(list, (c) => c.column_id === column.id),
        );
    }

    const columnCardCount = (column: Column) => cards.data.filter((card) => card.column_id === column.id).length;

    return (
        // 57px is the app header (h-14 plus its 1px border). The board fills the rest,
        // and long columns scroll on their own.
        <main className="flex h-[calc(100dvh-57px)] min-h-0 flex-col">
            <BoardHeader
                board={board.data}
                memberCount={members.data.filter((m) => m.status === 'active').length}
                online={online}
                workingOn={others}
                canManage={canManage}
                canLeave={canLeave}
                onOpenMembers={() => setDialog({ kind: 'members' })}
                onRename={() => setDialog({ kind: 'renameBoard' })}
                onDelete={() => setDialog({ kind: 'deleteBoard' })}
                onLeave={() => setDialog({ kind: 'leave' })}
                onOpenCard={setOpenCardId}
            />

            <BoardCanvas
                boardId={boardId}
                columns={columns.data}
                cards={cards.data}
                membersById={membersById}
                cardsWithTimer={cardsWithTimer}
                isOwner={canManage}
                onOpenCard={setOpenCardId}
                onRenameColumn={(column) => setDialog({ kind: 'renameColumn', column })}
                onDeleteColumn={(column) => setDialog({ kind: 'deleteColumn', column })}
            />

            {openCard && (
                <CardPanel
                    key={openCard.id}
                    boardId={boardId}
                    card={openCard}
                    columnName={openCardColumn?.name ?? ''}
                    members={members.data}
                    isOwner={canManage}
                    onClose={() => setOpenCardId(null)}
                />
            )}

            <MembersDialog
                open={dialog?.kind === 'members'}
                onClose={closeDialog}
                board={board.data}
                members={members.data}
                online={online}
                isOwner={canManage}
            />
            <NameDialog
                open={dialog?.kind === 'renameBoard'}
                onClose={closeDialog}
                title={t.boards.renameTitle}
                label={t.boards.boardName}
                submitLabel={t.common.save}
                initialName={board.data.name}
                onSubmit={renameBoard}
            />
            <ConfirmDialog
                open={dialog?.kind === 'deleteBoard'}
                onClose={closeDialog}
                title={t.boards.deleteTitle}
                description={t.boards.deleteBody(board.data.name)}
                confirmLabel={t.common.delete}
                onConfirm={deleteBoard}
            />
            <ConfirmDialog
                open={dialog?.kind === 'leave'}
                onClose={closeDialog}
                title={t.members.leaveTitle}
                description={t.members.leaveBody}
                confirmLabel={t.members.leave}
                onConfirm={leaveBoard}
            />
            <NameDialog
                open={dialog?.kind === 'renameColumn'}
                onClose={closeDialog}
                title={t.board.renameColumn}
                label={t.board.columnName}
                submitLabel={t.common.save}
                initialName={dialog?.kind === 'renameColumn' ? dialog.column.name : ''}
                onSubmit={(name) => (dialog?.kind === 'renameColumn' ? renameColumn(dialog.column, name) : Promise.resolve())}
            />
            <ConfirmDialog
                open={dialog?.kind === 'deleteColumn'}
                onClose={closeDialog}
                title={t.board.deleteColumnTitle}
                description={
                    dialog?.kind === 'deleteColumn'
                        ? t.board.deleteColumnBody(dialog.column.name, columnCardCount(dialog.column))
                        : ''
                }
                confirmLabel={t.common.delete}
                onConfirm={() => (dialog?.kind === 'deleteColumn' ? deleteColumn(dialog.column) : Promise.resolve())}
            />
        </main>
    );
}

function LoadError({ message }: { message: string }) {
    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {message}
            </p>
        </main>
    );
}
