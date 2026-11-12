'use client';

import { CaretLeftIcon, CaretRightIcon, FunnelSimpleXIcon, ListChecksIcon, TrayIcon } from '@phosphor-icons/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button, buttonClass } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/i18n/useLanguage';
import type { CardPage } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import { TaskFilterBar } from './TaskFilterBar';
import { TaskTable } from './TaskTable';
import { clearFilters, hasFilters, PAGE_SIZE, toCardQuery, updateFilters, useTaskFilters, type TaskFilters } from './taskFilters';

// The task list: cards from all my boards, with search, filters, sorting and pages.
// Everything you pick is kept in the URL, so it survives a reload and can be shared.
// TR: Görev listesi: tüm panolarımdaki kartlar; arama, filtre, sıralama ve sayfalarla.
// TR: Seçtiğiniz her şey URL'de tutulur; böylece sayfa yenilense de kalır ve paylaşılabilir.
export function TasksScreen() {
    const { t } = useLanguage();
    const filters = useTaskFilters();
    const query = toCardQuery(filters);

    const tasks = useQuery({
        queryKey: queryKeys.tasks(query),
        queryFn: () => api.cards.find(query),
        // While new results load, keep showing the old ones (faded) instead of a skeleton.
        // TR: Yeni sonuçlar yüklenirken iskelet yerine eskilerini (soluk) göstermeye devam et.
        placeholderData: keepPreviousData,
    });
    const boards = useQuery({ queryKey: queryKeys.boards, queryFn: api.boards.list });

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t.tasks.title}</h1>
                    <p className="mt-1 text-sm text-muted">{t.tasks.subtitle}</p>
                </div>
                {tasks.data && <p className="text-[13px] text-muted tabular-nums">{t.tasks.count(tasks.data.total)}</p>}
            </div>

            <TaskFilterBar filters={filters} boards={boards.data ?? []} />

            {tasks.error ? (
                <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                    {errorText(tasks.error, t)}
                    {hasFilters(filters) && (
                        <Button variant="secondary" size="sm" onClick={clearFilters}>
                            {t.tasks.clear}
                        </Button>
                    )}
                </div>
            ) : !tasks.data ? (
                <TasksSkeleton />
            ) : (
                <div className={`flex flex-col gap-4 transition-opacity duration-200 ${tasks.isPlaceholderData ? 'opacity-60' : ''}`}>
                    <TaskResults page={tasks.data} filters={filters} />
                </div>
            )}
        </main>
    );
}

function TaskResults({ page, filters }: { page: CardPage; filters: TaskFilters }) {
    const { t } = useLanguage();

    if (page.total === 0) {
        if (hasFilters(filters)) {
            return (
                <EmptyState
                    icon={<FunnelSimpleXIcon size={22} />}
                    title={t.tasks.noMatchTitle}
                    body={t.tasks.noMatchBody}
                    action={
                        <Button variant="secondary" onClick={clearFilters}>
                            {t.tasks.clear}
                        </Button>
                    }
                />
            );
        }
        if (filters.scope === 'me') {
            return (
                <EmptyState
                    icon={<ListChecksIcon size={22} />}
                    title={t.tasks.noneMineTitle}
                    body={t.tasks.noneMineBody}
                    action={
                        <Button variant="secondary" onClick={() => updateFilters({ scope: 'all' })}>
                            {t.tasks.showAll}
                        </Button>
                    }
                />
            );
        }
        return (
            <EmptyState
                icon={<TrayIcon size={22} />}
                title={t.tasks.noneTitle}
                body={t.tasks.noneBody}
                action={
                    <Link href="/boards" className={buttonClass('secondary')}>
                        {t.tasks.goToBoards}
                    </Link>
                }
            />
        );
    }

    // A link to a page past the end (e.g. ?page=9 when there are 3 pages).
    // TR: Son sayfadan sonraki bir sayfaya bağlantı (ör. 3 sayfa varken ?page=9).
    if (page.data.length === 0) {
        return (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-6 text-sm text-muted">
                {t.tasks.pageEmpty}
                <Button variant="secondary" size="sm" onClick={() => updateFilters({ page: 1 })}>
                    {t.tasks.firstPage}
                </Button>
            </div>
        );
    }

    return (
        <>
            <TaskTable cards={page.data} />
            <Pagination page={page} />
        </>
    );
}

function Pagination({ page }: { page: CardPage }) {
    const { t } = useLanguage();
    const from = (page.page - 1) * PAGE_SIZE + 1;
    const to = from + page.data.length - 1;

    function goTo(next: number) {
        updateFilters({ page: next });
        window.scrollTo({ top: 0 });
    }

    return (
        <nav
            aria-label={t.tasks.pagination}
            className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted"
        >
            <p className="tabular-nums">{t.tasks.range(from, to, page.total)}</p>
            {page.total_pages > 1 && (
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" disabled={page.page <= 1} onClick={() => goTo(page.page - 1)}>
                        <CaretLeftIcon size={14} weight="bold" />
                        {t.tasks.previous}
                    </Button>
                    <span className="px-1 tabular-nums">{t.tasks.pageOf(page.page, page.total_pages)}</span>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={page.page >= page.total_pages}
                        onClick={() => goTo(page.page + 1)}
                    >
                        {t.tasks.next}
                        <CaretRightIcon size={14} weight="bold" />
                    </Button>
                </div>
            )}
        </nav>
    );
}

// Same shape as the real table: a header row and a few task rows.
// TR: Gerçek tabloyla aynı şekil: bir başlık satırı ve birkaç görev satırı.
function TasksSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-line bg-surface" aria-busy="true">
            <div className="h-10 border-b border-line bg-sunken/60" />
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0">
                    <Skeleton className="size-[18px] rounded-full" />
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-3.5 w-2/5" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}
