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

type OpenDialog =
    | { kind: 'members' }
    | { kind: 'renameBoard' }
    | { kind: 'deleteBoard' }
    | { kind: 'leave' }
    | { kind: 'renameColumn'; column: Column }
    | { kind: 'deleteColumn'; column: Column }
    | null;

// Loads a board and shows it with its dialogs and the card panel.
// TR: Bir panoyu yükler ve pencereleri ile kart paneliyle birlikte gösterir.
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

    const searchParams = useSearchParams();
    const openCardId = searchParams.get('card');

    // Opens or closes a card by writing its id in the URL.
    // TR: Kart kimliğini URL'ye yazarak bir kartı açar ya da kapatır.
    function setOpenCardId(id: string | null) {
        const url = new URL(window.location.href);
        if (id) url.searchParams.set('card', id);
        else url.searchParams.delete('card');
        window.history.replaceState(null, '', url);
    }
    const [dialog, setDialog] = useState<OpenDialog>(null);

    // Closes the open dialog.
    // TR: Açık pencereyi kapatır.
    const closeDialog = () => setDialog(null);

    const leavingOnPurpose = useRef(false);

    // Removes this board from my board list.
    // TR: Bu panoyu pano listemden kaldırır.
    function dropBoardFromList() {
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => removeWhere(list, (b) => b.id === boardId));
    }

    // Leaves the page when the board is deleted or my access ends.
    // TR: Pano silinince ya da erişimim bitince sayfadan çıkar.
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

    const others = Object.values(timers).filter((entry) => entry.user_id !== me.id);
    const cardsWithTimer = new Set(others.map((entry) => entry.card_id));
    if (myTimer.data?.board_id === boardId) cardsWithTimer.add(myTimer.data.card_id);

    const openCard = openCardId ? cards.data.find((card) => card.id === openCardId) : undefined;
    const openCardColumn = openCard ? columns.data.find((column) => column.id === openCard.column_id) : undefined;

    // Renames the board and updates the cache.
    // TR: Panoyu yeniden adlandırır ve önbelleği günceller.
    async function renameBoard(name: string) {
        const updated = await api.boards.rename(boardId, name);
        queryClient.setQueryData(queryKeys.board(boardId), updated);
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => upsert(list, updated));
        toast.success(t.boards.renamed);
    }

    // Deletes the board and goes back to the board list.
    // TR: Panoyu siler ve pano listesine geri döner.
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

    // Leaves the board and goes back to the board list.
    // TR: Panodan ayrılır ve pano listesine geri döner.
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

    // Renames a column and updates the cache.
    // TR: Bir sütunu yeniden adlandırır ve önbelleği günceller.
    async function renameColumn(column: Column, name: string) {
        const updated = await api.columns.rename(column.id, name);
        queryClient.setQueryData<Column[]>(queryKeys.columns(boardId), (list) => upsert(list, updated));
    }

    // Deletes a column together with its cards.
    // TR: Bir sütunu kartlarıyla birlikte siler.
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

    // Returns how many cards a column has.
    // TR: Bir sütunda kaç kart olduğunu döndürür.
    const columnCardCount = (column: Column) => cards.data.filter((card) => card.column_id === column.id).length;

    return (
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

// Shows an error when the board can't be loaded.
// TR: Pano yüklenemediğinde bir hata gösterir.
function LoadError({ message }: { message: string }) {
    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {message}
            </p>
        </main>
    );
}
