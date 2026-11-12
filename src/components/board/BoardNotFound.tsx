'use client';

import { ArrowLeftIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLanguage } from '@/i18n/useLanguage';

// The API answers 404 both when a board doesn't exist and when you're not a member.
// TR: API, hem pano yokken hem de üye değilken 404 döner.
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
