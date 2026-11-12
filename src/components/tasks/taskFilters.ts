'use client';

import { useSearchParams } from 'next/navigation';
import type { CardQuery, CardSort, CardStatus, Priority } from '@/interfaces';

export const PAGE_SIZE = 20;

// Each sort option in the menu is one sort column plus a direction for the API.
// TR: Menüdeki her sıralama seçeneği, API için bir sıralama kolonu artı bir yöndür.
export const SORTS = {
    newest: { sort: 'created_at', order: 'desc' },
    oldest: { sort: 'created_at', order: 'asc' },
    updated: { sort: 'updated_at', order: 'desc' },
    priority: { sort: 'priority', order: 'desc' },
    title: { sort: 'title', order: 'asc' },
} as const satisfies Record<string, { sort: CardSort; order: 'asc' | 'desc' }>;

export type SortKey = keyof typeof SORTS;
export type Scope = 'me' | 'all';

export interface TaskFilters {
    search: string;
    board: string;
    status: CardStatus | '';
    priority: Priority | '';
    scope: Scope;
    sort: SortKey;
    page: number;
}

const DEFAULTS: TaskFilters = {
    search: '',
    board: '',
    status: '',
    priority: '',
    scope: 'me',
    sort: 'newest',
    page: 1,
};

// The name of each filter in the URL, e.g. /tasks?q=logo&status=pending&page=2
// Default values are left out, so a plain /tasks means "my tasks, newest first".
// TR: Her filtrenin URL'deki adı, örneğin /tasks?q=logo&status=pending&page=2
// TR: Varsayılan değerler yazılmaz; düz /tasks "görevlerim, en yeni önce" demektir.
const URL_NAMES: Record<keyof TaskFilters, string> = {
    search: 'q',
    board: 'board',
    status: 'status',
    priority: 'priority',
    scope: 'show',
    sort: 'sort',
    page: 'page',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? (value as T) : fallback;
}

// Reads the filters from the URL. Unknown or broken values fall back to the default,
// so a hand-edited link shows a normal list instead of an error.
// TR: Filtreleri URL'den okur. Bilinmeyen ya da bozuk değerler varsayılana döner;
// TR: böylece elle değiştirilmiş bir bağlantı hata yerine normal bir liste gösterir.
function readFilters(params: { get(name: string): string | null }): TaskFilters {
    const board = params.get(URL_NAMES.board) ?? '';
    const page = Number(params.get(URL_NAMES.page));

    return {
        search: (params.get(URL_NAMES.search) ?? '').trim().slice(0, 100),
        board: UUID.test(board) ? board : '',
        status: oneOf<CardStatus | ''>(params.get(URL_NAMES.status), ['pending', 'completed'], ''),
        priority: oneOf<Priority | ''>(params.get(URL_NAMES.priority), ['high', 'medium', 'low'], ''),
        scope: oneOf<Scope>(params.get(URL_NAMES.scope), ['me', 'all'], 'me'),
        sort: oneOf(params.get(URL_NAMES.sort), Object.keys(SORTS) as SortKey[], 'newest'),
        page: Number.isInteger(page) && page > 0 ? page : 1,
    };
}

// The current filters. Re-renders whenever the URL changes.
// TR: Geçerli filtreler. URL her değiştiğinde yeniden render eder.
export function useTaskFilters(): TaskFilters {
    return readFilters(useSearchParams());
}

// Writes changes into the URL. Changing a filter goes back to page 1.
// A filter change replaces the history entry, so typing a search doesn't fill up the Back button;
// a page change adds one, so Back returns to the previous page.
// TR: Değişiklikleri URL'ye yazar. Bir filtreyi değiştirmek 1. sayfaya döner.
// TR: Filtre değişikliği geçmiş kaydının yerine geçer, böylece arama yazmak Geri butonunu doldurmaz;
// TR: sayfa değişikliği yeni kayıt ekler, böylece Geri önceki sayfaya döner.
export function updateFilters(changes: Partial<TaskFilters>) {
    const next: TaskFilters = { ...readFilters(new URLSearchParams(window.location.search)), page: 1, ...changes };
    const params = new URLSearchParams();
    for (const key of Object.keys(URL_NAMES) as (keyof TaskFilters)[]) {
        if (next[key] !== DEFAULTS[key]) params.set(URL_NAMES[key], String(next[key]));
    }

    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    if (changes.page !== undefined) window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
}

// Search, board, status and priority. The scope and sort are views, not filters,
// so "Clear filters" keeps them.
// TR: Arama, pano, durum ve öncelik. Kapsam ve sıralama filtre değil görünüm olduğu için
// TR: "Filtreleri temizle" onları korur.
export function hasFilters(filters: TaskFilters): boolean {
    return Boolean(filters.search || filters.board || filters.status || filters.priority);
}

export function clearFilters() {
    updateFilters({ search: '', board: '', status: '', priority: '' });
}

export function toCardQuery(filters: TaskFilters): CardQuery {
    return {
        search: filters.search || undefined,
        boardId: filters.board || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        assigneeId: filters.scope === 'me' ? 'me' : undefined,
        ...SORTS[filters.sort],
        page: filters.page,
        limit: PAGE_SIZE,
    };
}
