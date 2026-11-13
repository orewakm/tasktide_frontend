'use client';

import { useSearchParams } from 'next/navigation';
import type { CardQuery, CardSort, CardStatus, Priority } from '@/interfaces';

export const PAGE_SIZE = 20;

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

// Returns the value if it is allowed, otherwise the fallback.
// TR: Değer izinliyse onu, değilse varsayılanı döndürür.
function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? (value as T) : fallback;
}

// Reads the filters from the URL, using defaults for broken values.
// TR: Filtreleri URL'den okur, bozuk değerler için varsayılanları kullanır.
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

// Returns the current filters from the URL.
// TR: URL'deki geçerli filtreleri döndürür.
export function useTaskFilters(): TaskFilters {
    return readFilters(useSearchParams());
}

// Writes filter changes to the URL and goes back to page 1.
// TR: Filtre değişikliklerini URL'ye yazar ve 1. sayfaya döner.
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

// Returns true if a search, board, status or priority filter is set.
// TR: Arama, pano, durum ya da öncelik filtresi varsa true döndürür.
export function hasFilters(filters: TaskFilters): boolean {
    return Boolean(filters.search || filters.board || filters.status || filters.priority);
}

// Clears the search and the filters but keeps the scope and sort.
// TR: Aramayı ve filtreleri temizler, kapsamı ve sıralamayı korur.
export function clearFilters() {
    updateFilters({ search: '', board: '', status: '', priority: '' });
}

// Turns the filters into the query for the task list API.
// TR: Filtreleri görev listesi API'sinin sorgusuna çevirir.
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
