'use client';

import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { Menu } from '@/components/ui/Menu';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board } from '@/interfaces';
import { formatDate } from '@/lib/format';

interface BoardTileProps {
    board: Board;
    isOwner: boolean;
    onRename: () => void;
    onDelete: () => void;
}

export function BoardTile({ board, isOwner, onRename, onDelete }: BoardTileProps) {
    const { t, language } = useLanguage();

    return (
        <article className="group relative flex min-h-32 flex-col justify-between gap-6 rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-line-strong hover:shadow-[0_12px_28px_-16px_rgb(0_0_0/0.25)]">
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-[15px] leading-snug font-semibold tracking-tight">
                    {/* The ::after stretches the link over the whole tile, so the tile is clickable
                        while the menu button stays a separate control. */}
                    <Link
                        href={`/boards/${board.id}`}
                        className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
                    >
                        {board.name}
                    </Link>
                </h2>
                {isOwner && (
                    <div className="relative z-10 -mt-1 -mr-1">
                        <Menu
                            label={t.common.more}
                            items={[
                                { label: t.common.rename, icon: <PencilSimpleIcon size={16} />, onSelect: onRename },
                                {
                                    label: t.common.delete,
                                    icon: <TrashIcon size={16} />,
                                    onSelect: onDelete,
                                    danger: true,
                                },
                            ]}
                        />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-muted">
                <span>{t.boards.createdOn(formatDate(board.created_at, language))}</span>
                {isOwner && (
                    <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent-ink">
                        {t.boards.owner}
                    </span>
                )}
            </div>
        </article>
    );
}
