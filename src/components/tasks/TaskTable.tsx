'use client';

import { CheckCircleIcon, CircleIcon, UserCircleDashedIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { PriorityTag } from '@/components/board/PriorityTag';
import { Avatar } from '@/components/ui/Avatar';
import { useLanguage } from '@/i18n/useLanguage';
import type { CardListItem } from '@/interfaces';
import { formatDate } from '@/lib/format';

// One row per card. The title links to the card on its board; the link covers the whole row.
// Smaller screens hide the priority, assignee and date columns and show the first two under the title.
// TR: Her kart için bir satır. Başlık, kartın panosundaki haline gider; bağlantı tüm satırı kaplar.
// TR: Küçük ekranlar öncelik, atanan ve tarih kolonlarını gizler; ilk ikisini başlığın altında gösterir.
export function TaskTable({ cards }: { cards: CardListItem[] }) {
    const { t, language } = useLanguage();

    return (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-sunken/60 text-[13px] text-muted">
                    <tr>
                        <th scope="col" className="px-4 py-2.5 font-medium">
                            {t.tasks.task}
                        </th>
                        <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
                            {t.tasks.priority}
                        </th>
                        <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">
                            {t.tasks.assignee}
                        </th>
                        <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">
                            {t.tasks.updated}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {cards.map((card) => {
                        const done = card.completed_at !== null;
                        return (
                            <tr key={card.id} className="relative transition-colors hover:bg-sunken/50">
                                <td className="w-full max-w-0 px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        {done ? (
                                            <CheckCircleIcon size={18} weight="fill" className="mt-px shrink-0 text-done" aria-hidden />
                                        ) : (
                                            <CircleIcon size={18} className="mt-px shrink-0 text-muted" aria-hidden />
                                        )}
                                        <span className="sr-only">{done ? t.card.done : t.card.notDone}</span>
                                        <div className="flex min-w-0 flex-col gap-0.5">
                                            <Link
                                                href={`/boards/${card.board_id}?card=${card.id}`}
                                                className={`truncate font-medium after:absolute after:inset-0 ${
                                                    done ? 'text-muted line-through' : ''
                                                }`}
                                            >
                                                {card.title}
                                            </Link>
                                            <p className="truncate text-[13px] text-muted">
                                                {card.board_name}
                                                <span className="mx-1.5" aria-hidden>
                                                    ·
                                                </span>
                                                {card.column_name}
                                            </p>
                                            <div className="mt-1.5 flex items-center gap-2 sm:hidden">
                                                <PriorityTag priority={card.priority} />
                                                {card.assignee_name && <Avatar name={card.assignee_name} size="xs" />}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden px-4 py-3 align-top sm:table-cell">
                                    <PriorityTag priority={card.priority} />
                                </td>
                                <td className="hidden px-4 py-3 align-top md:table-cell">
                                    {card.assignee_name ? (
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            <Avatar name={card.assignee_name} />
                                            <span className="max-w-36 truncate text-[13px]">{card.assignee_name}</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-[13px] whitespace-nowrap text-muted">
                                            <UserCircleDashedIcon size={24} />
                                            {t.card.unassigned}
                                        </span>
                                    )}
                                </td>
                                <td className="hidden px-4 py-3 align-top text-[13px] whitespace-nowrap text-muted lg:table-cell">
                                    {formatDate(card.updated_at, language)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
