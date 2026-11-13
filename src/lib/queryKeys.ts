import type { CardQuery } from '@/interfaces';

export const queryKeys = {
    me: ['me'] as const,
    timer: ['timer'] as const,
    boards: ['boards'] as const,
    invitations: ['invitations'] as const,

    // Returns the cache key of a board.
    // TR: Bir panonun önbellek anahtarını döndürür.
    board: (boardId: string) => ['board', boardId] as const,

    // Returns the cache key of a board's members.
    // TR: Bir panonun üyelerinin önbellek anahtarını döndürür.
    members: (boardId: string) => ['members', boardId] as const,

    // Returns the cache key of a board's columns.
    // TR: Bir panonun sütunlarının önbellek anahtarını döndürür.
    columns: (boardId: string) => ['columns', boardId] as const,

    // Returns the cache key of a board's cards.
    // TR: Bir panonun kartlarının önbellek anahtarını döndürür.
    cards: (boardId: string) => ['cards', boardId] as const,

    // Returns the cache key of a card's notes.
    // TR: Bir kartın notlarının önbellek anahtarını döndürür.
    notes: (cardId: string) => ['notes', cardId] as const,

    // Returns the cache key of a card's time entries.
    // TR: Bir kartın zaman kayıtlarının önbellek anahtarını döndürür.
    timeEntries: (cardId: string) => ['time-entries', cardId] as const,

    // Returns the cache key of a card's time stats.
    // TR: Bir kartın süre istatistiklerinin önbellek anahtarını döndürür.
    cardStats: (cardId: string) => ['card-stats', cardId] as const,

    // Returns the cache key of a board's time stats for a range.
    // TR: Bir panonun bir aralıktaki süre istatistiklerinin önbellek anahtarını döndürür.
    boardStats: (boardId: string, days: number) => ['board-stats', boardId, days] as const,

    // Returns the cache key of my time stats for a range.
    // TR: Bir aralıktaki süre istatistiklerimin önbellek anahtarını döndürür.
    myStats: (days: number) => ['my-stats', days] as const,

    // Returns the cache key of a board's card summary.
    // TR: Bir panonun kart özetinin önbellek anahtarını döndürür.
    boardSummary: (boardId: string) => ['board-summary', boardId] as const,

    // Returns the cache key of a task list query.
    // TR: Bir görev listesi sorgusunun önbellek anahtarını döndürür.
    tasks: (query: CardQuery) => ['tasks', query] as const,
    adminUsers: ['admin-users'] as const,
};
