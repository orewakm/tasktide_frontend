'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/components/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { inputClass } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board, Member, OnlineUser } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { removeWhere, upsert } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';

interface MembersDialogProps {
    open: boolean;
    onClose: () => void;
    board: Board;
    members: Member[];
    online: OnlineUser[];
    isOwner: boolean;
}

export function MembersDialog({ open, onClose, board, members, online, isOwner }: MembersDialogProps) {
    const { t } = useLanguage();

    return (
        <Dialog open={open} onClose={onClose} title={t.members.title} width="md">
            <div className="flex flex-col gap-5">
                {isOwner && <InviteForm boardId={board.id} />}
                <MemberList board={board} members={members} online={online} isOwner={isOwner} />
            </div>
        </Dialog>
    );
}

function InviteForm({ boardId }: { boardId: string }) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const value = email.trim();
        if (!value) return;
        setBusy(true);
        setError(null);
        try {
            const member = await api.members.add(boardId, { email: value });
            queryClient.setQueryData<Member[]>(queryKeys.members(boardId), (list) => upsert(list, member));
            toast.success(t.members.inviteSent(member.email));
            setEmail('');
        } catch (err) {
            setError(errorText(err, t));
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-[13px] font-medium">
                {t.members.inviteLabel}
            </label>
            <div className="flex gap-2">
                <input
                    id="invite-email"
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'invite-error' : undefined}
                    className={`${inputClass} h-10 ${error ? 'border-danger' : 'border-line'}`}
                />
                <Button type="submit" disabled={busy || !email.trim()}>
                    {t.members.invite}
                </Button>
            </div>
            {error && (
                <p id="invite-error" className="text-[13px] text-danger">
                    {error}
                </p>
            )}
        </form>
    );
}

function MemberList({ board, members, online, isOwner }: Omit<MembersDialogProps, 'open' | 'onClose'>) {
    const { t } = useLanguage();
    const me = useCurrentUser();
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<string | null>(null);

    const onlineIds = new Set(online.map((u) => u.id));
    // Owner first, then active members, then invitations, each by name.
    const rank = (m: Member) => (m.id === board.owner_id ? 0 : m.status === 'active' ? 1 : 2);
    const sorted = [...members].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));

    async function remove(member: Member) {
        setBusyId(member.id);
        try {
            await api.members.remove(board.id, member.id);
            queryClient.setQueryData<Member[]>(queryKeys.members(board.id), (list) =>
                removeWhere(list, (m) => m.id === member.id),
            );
            toast.success(t.members.removed(member.name));
        } catch (err) {
            toast.error(errorText(err, t));
        } finally {
            setBusyId(null);
        }
    }

    return (
        <ul className="-mx-2 flex max-h-[50vh] flex-col overflow-y-auto">
            {sorted.map((member) => {
                const isBoardOwner = member.id === board.owner_id;
                const invited = member.status === 'invited';
                return (
                    <li key={member.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sunken">
                        <Avatar name={member.name} size="md" online={onlineIds.has(member.id)} />
                        <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium">
                                {member.name}
                                {member.id === me.id && <span className="font-normal text-muted"> ({t.common.you})</span>}
                            </span>
                            <span className="truncate text-xs text-muted">{member.email}</span>
                        </div>
                        {isBoardOwner && (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent-ink">
                                {t.members.owner}
                            </span>
                        )}
                        {invited && (
                            <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[11px] font-medium text-muted">
                                {t.members.invited}
                            </span>
                        )}
                        {isOwner && !isBoardOwner && (
                            <button
                                type="button"
                                disabled={busyId === member.id}
                                onClick={() => void remove(member)}
                                className="h-8 shrink-0 rounded-lg px-2.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                            >
                                {invited ? t.members.cancelInvite : t.members.remove}
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
