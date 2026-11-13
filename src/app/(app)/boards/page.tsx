'use client';

import { KanbanIcon, PlusIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/components/AuthProvider';
import { BoardTile } from '@/components/boards/BoardTile';
import { InvitationList } from '@/components/boards/InvitationList';
import { TodayGreeting } from '@/components/boards/TodayGreeting';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { NameDialog } from '@/components/ui/NameDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { removeWhere, upsert } from '@/lib/lists';
import { isBoardOwner } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryKeys';

// Shows my boards, pending invitations and the new board button.
// TR: Panolarımı, bekleyen davetleri ve yeni pano butonunu gösterir.
export default function BoardsPage() {
    const { t } = useLanguage();
    const user = useCurrentUser();
    const router = useRouter();
    const queryClient = useQueryClient();

    const boards = useQuery({ queryKey: queryKeys.boards, queryFn: api.boards.list });
    const invitations = useQuery({ queryKey: queryKeys.invitations, queryFn: api.invitations.list });

    const [creating, setCreating] = useState(false);
    const [renaming, setRenaming] = useState<Board | null>(null);
    const [deleting, setDeleting] = useState<Board | null>(null);

    const sortedBoards = [...(boards.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));

    // Creates a board, adds it to the list and opens it.
    // TR: Bir pano oluşturur, listeye ekler ve onu açar.
    async function createBoard(name: string) {
        const board = await api.boards.create(name);
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => upsert(list, board));
        toast.success(t.boards.created);
        router.push(`/boards/${board.id}`);
    }

    // Renames a board and updates the list.
    // TR: Bir panoyu yeniden adlandırır ve listeyi günceller.
    async function renameBoard(board: Board, name: string) {
        const updated = await api.boards.rename(board.id, name);
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => upsert(list, updated));
        toast.success(t.boards.renamed);
    }

    // Deletes a board and removes it from the list.
    // TR: Bir panoyu siler ve listeden kaldırır.
    async function deleteBoard(board: Board) {
        try {
            await api.boards.remove(board.id);
            queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => removeWhere(list, (b) => b.id === board.id));
            toast.success(t.boards.deleted);
        } catch (err) {
            toast.error(errorText(err, t));
            throw err;
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <TodayGreeting />
                <Button onClick={() => setCreating(true)}>
                    <PlusIcon size={16} weight="bold" />
                    {t.boards.newBoard}
                </Button>
            </div>

            {invitations.data && invitations.data.length > 0 && <InvitationList invitations={invitations.data} />}

            <div className="-mb-4 flex items-baseline gap-3">
                <h2 className="text-sm font-semibold tracking-tight text-muted uppercase">{t.boards.title}</h2>
                {boards.data && boards.data.length > 0 && (
                    <span className="font-mono text-sm text-muted tabular-nums">{boards.data.length}</span>
                )}
            </div>

            {boards.isPending ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            ) : boards.isError ? (
                <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                    {errorText(boards.error, t)}
                </p>
            ) : sortedBoards.length === 0 ? (
                <EmptyState
                    icon={<KanbanIcon size={22} />}
                    title={t.boards.emptyTitle}
                    body={t.boards.emptyBody}
                    action={
                        <Button size="sm" onClick={() => setCreating(true)}>
                            <PlusIcon size={14} weight="bold" />
                            {t.boards.createBoard}
                        </Button>
                    }
                />
            ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedBoards.map((board) => (
                        <li key={board.id}>
                            <BoardTile
                                board={board}
                                isOwner={isBoardOwner(board, user)}
                                onRename={() => setRenaming(board)}
                                onDelete={() => setDeleting(board)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <NameDialog
                open={creating}
                onClose={() => setCreating(false)}
                title={t.boards.newBoard}
                label={t.boards.boardName}
                submitLabel={t.boards.createBoard}
                onSubmit={createBoard}
            />
            <NameDialog
                open={renaming !== null}
                onClose={() => setRenaming(null)}
                title={t.boards.renameTitle}
                label={t.boards.boardName}
                submitLabel={t.common.save}
                initialName={renaming?.name}
                onSubmit={(name) => renameBoard(renaming!, name)}
            />
            <ConfirmDialog
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                title={t.boards.deleteTitle}
                description={deleting ? t.boards.deleteBody(deleting.name) : ''}
                confirmLabel={t.common.delete}
                onConfirm={() => deleteBoard(deleting!)}
            />
        </main>
    );
}
