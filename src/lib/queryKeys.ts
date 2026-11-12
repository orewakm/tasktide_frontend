import type { CardQuery } from '@/interfaces';

// Every React Query key in one place, so live updates and pages always agree on the names.
// TR: Tüm React Query anahtarları tek yerde, böylece canlı güncellemeler ve sayfalar isimlerde hep anlaşır.
export const queryKeys = {
    me: ['me'] as const,
    timer: ['timer'] as const,
    boards: ['boards'] as const,
    invitations: ['invitations'] as const,
    board: (boardId: string) => ['board', boardId] as const,
    members: (boardId: string) => ['members', boardId] as const,
    columns: (boardId: string) => ['columns', boardId] as const,
    cards: (boardId: string) => ['cards', boardId] as const,
    notes: (cardId: string) => ['notes', cardId] as const,
    timeEntries: (cardId: string) => ['time-entries', cardId] as const,
    cardStats: (cardId: string) => ['card-stats', cardId] as const,
    boardStats: (boardId: string, days: number) => ['board-stats', boardId, days] as const,
    myStats: (days: number) => ['my-stats', days] as const,
    boardSummary: (boardId: string) => ['board-summary', boardId] as const,
    tasks: (query: CardQuery) => ['tasks', query] as const,
    adminUsers: ['admin-users'] as const,
};
