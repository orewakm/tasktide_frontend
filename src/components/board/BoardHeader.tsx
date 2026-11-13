'use client';

import {
    CaretLeftIcon,
    ChartBarIcon,
    PencilSimpleIcon,
    SignOutIcon,
    TrashIcon,
    UsersIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button, buttonClass } from '@/components/ui/Button';
import { Menu, type MenuItem } from '@/components/ui/Menu';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board, OnlineUser, TimeEntryDetails } from '@/interfaces';

interface BoardHeaderProps {
    board: Board;
    memberCount: number;
    online: OnlineUser[];
    workingOn: TimeEntryDetails[];
    canManage: boolean;
    canLeave: boolean;
    onOpenMembers: () => void;
    onRename: () => void;
    onDelete: () => void;
    onLeave: () => void;
    onOpenCard: (cardId: string) => void;
}

// Shows the board name, who is online and the board actions.
// TR: Pano adını, çevrimiçi kişileri ve pano işlemlerini gösterir.
export function BoardHeader({
    board,
    memberCount,
    online,
    workingOn,
    canManage,
    canLeave,
    onOpenMembers,
    onRename,
    onDelete,
    onLeave,
    onOpenCard,
}: BoardHeaderProps) {
    const { t } = useLanguage();

    const menuItems: MenuItem[] = [
        ...(canManage
            ? [
                  { label: t.board.renameBoard, icon: <PencilSimpleIcon size={16} />, onSelect: onRename },
                  { label: t.board.deleteBoard, icon: <TrashIcon size={16} />, onSelect: onDelete, danger: true },
              ]
            : []),
        ...(canLeave
            ? [{ label: t.board.leaveBoard, icon: <SignOutIcon size={16} />, onSelect: onLeave, danger: true }]
            : []),
    ];

    return (
        <div className="border-b border-line bg-surface/60 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex min-w-0 items-center gap-1.5">
                    <Link
                        href="/boards"
                        aria-label={t.board.backToBoards}
                        title={t.board.backToBoards}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sunken hover:text-ink"
                    >
                        <CaretLeftIcon size={18} weight="bold" />
                    </Link>
                    <h1 className="truncate text-lg font-semibold tracking-tight">{board.name}</h1>
                    <Menu label={t.common.more} items={menuItems} align="start" />
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <OnlineStack online={online} />
                    <Button variant="secondary" size="sm" onClick={onOpenMembers}>
                        <UsersIcon size={16} />
                        <span className="hidden sm:inline">{t.board.members}</span>
                        <span className="font-mono text-xs text-muted tabular-nums">{memberCount}</span>
                    </Button>
                    <Link href={`/boards/${board.id}/stats`} className={buttonClass('secondary', 'sm')}>
                        <ChartBarIcon size={16} />
                        <span className="hidden sm:inline">{t.board.stats}</span>
                    </Link>
                </div>
            </div>

            {workingOn.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                    {workingOn.map((entry) => (
                        <li key={entry.user_id}>
                            <button
                                type="button"
                                onClick={() => onOpenCard(entry.card_id)}
                                className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-xs transition-colors hover:border-line-strong motion-safe:animate-fade"
                            >
                                <Avatar name={entry.user_name} size="xs" />
                                <span className="relative flex size-1.5 shrink-0">
                                    <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                                    <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                                </span>
                                <span className="truncate">{t.board.workingOn(entry.user_name, entry.card_title)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Shows the avatars of everyone who has the board open.
// TR: Panoyu açık tutan herkesin avatarlarını gösterir.
function OnlineStack({ online }: { online: OnlineUser[] }) {
    const { t } = useLanguage();
    if (online.length === 0) return null;
    const shown = online.slice(0, 4);
    const names = online.map((u) => u.name).join(', ');

    return (
        <div className="flex items-center gap-2 pr-1" title={`${t.board.online}: ${names}`}>
            <span className="sr-only">
                {t.board.online}: {names}
            </span>
            <span className="size-2 rounded-full bg-online" aria-hidden />
            <div className="flex -space-x-1.5" aria-hidden>
                {shown.map((user) => (
                    <Avatar key={user.id} name={user.name} size="sm" />
                ))}
            </div>
            {online.length > shown.length && (
                <span className="font-mono text-xs text-muted tabular-nums" aria-hidden>
                    +{online.length - shown.length}
                </span>
            )}
        </div>
    );
}
