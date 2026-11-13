'use client';

import { ArrowLeftIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLanguage } from '@/i18n/useLanguage';

// Shows a message when the board doesn't exist or isn't mine.
// TR: Pano yoksa ya da bana ait değilse bir mesaj gösterir.
export function BoardNotFound() {
    const { t } = useLanguage();

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <EmptyState
                icon={<MagnifyingGlassIcon size={22} />}
                title={t.board.notFoundTitle}
                body={t.board.notFoundBody}
                action={
                    <Link href="/boards" className={buttonClass('secondary', 'sm')}>
                        <ArrowLeftIcon size={14} weight="bold" />
                        {t.board.backToBoards}
                    </Link>
                }
            />
        </main>
    );
}
