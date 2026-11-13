'use client';

import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { removeWhere, upsert } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';

// Shows my pending invitations with accept and decline buttons.
// TR: Bekleyen davetlerimi kabul ve ret butonlarıyla gösterir.
export function InvitationList({ invitations }: { invitations: Board[] }) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<string | null>(null);

    // Removes an invitation from the list.
    // TR: Bir daveti listeden kaldırır.
    function dropInvitation(boardId: string) {
        queryClient.setQueryData<Board[]>(queryKeys.invitations, (list) => removeWhere(list, (b) => b.id === boardId));
    }

    // Accepts an invitation and adds the board to my list.
    // TR: Bir daveti kabul eder ve panoyu listeme ekler.
    async function accept(board: Board) {
        setBusyId(board.id);
        try {
            await api.invitations.accept(board.id);
            dropInvitation(board.id);
            queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => upsert(list, board));
            toast.success(t.boards.joined(board.name));
        } catch (err) {
            toast.error(errorText(err, t));
        } finally {
            setBusyId(null);
        }
    }

    // Declines an invitation.
    // TR: Bir daveti reddeder.
    async function decline(board: Board) {
        setBusyId(board.id);
        try {
            await api.invitations.decline(board.id);
            dropInvitation(board.id);
            toast(t.boards.declined);
        } catch (err) {
            toast.error(errorText(err, t));
        } finally {
            setBusyId(null);
        }
    }

    return (
        <section aria-labelledby="invitations-title" className="rounded-xl border border-accent/25 bg-accent/6 p-2">
            <h2 id="invitations-title" className="flex items-center gap-2 px-3 pt-2 pb-1 text-[13px] font-semibold">
                {t.boards.invitations}
                <span className="rounded-full bg-accent px-1.5 text-[11px] leading-4.5 font-semibold text-on-accent tabular-nums">
                    {invitations.length}
                </span>
            </h2>
            <ul className="flex flex-col">
                {invitations.map((board) => (
                    <li
                        key={board.id}
                        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-2.5 hover:bg-surface/70"
                    >
                        <EnvelopeSimpleIcon size={18} className="shrink-0 text-accent-ink" />
                        <p className="min-w-0 flex-1 text-sm">{t.boards.invitationText(board.name)}</p>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={busyId === board.id}
                                onClick={() => void decline(board)}
                            >
                                {t.boards.decline}
                            </Button>
                            <Button size="sm" disabled={busyId === board.id} onClick={() => void accept(board)}>
                                {t.boards.accept}
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
