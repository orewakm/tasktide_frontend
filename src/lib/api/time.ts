import type { BoardStats, BoardSummary, CardStats, MyStats, TimeEntry, TimeEntryDetails } from '@/interfaces';
import { request } from './client';

export const timeApi = {
    // Starts my timer on this card. 409 if I already have one running.
    // TR: Bu kartta zamanlayıcımı başlatır. Zaten çalışan bir tane varsa 409.
    start: (cardId: string) => request<TimeEntryDetails>('POST', `/cards/${cardId}/time-entries`),
    listForCard: (cardId: string) => request<TimeEntry[]>('GET', `/cards/${cardId}/time-entries`),
    // null when nothing is running.
    // TR: Çalışan bir şey yoksa null.
    current: () => request<TimeEntryDetails | null>('GET', '/time-entries/current'),
    stop: () => request<TimeEntryDetails>('POST', '/time-entries/stop'),
    remove: (id: string) => request<void>('DELETE', `/time-entries/${id}`),
};

// days: 1-365. Defaults on the server: 30 for a board, 7 for me.
// TR: days: 1-365. Sunucudaki varsayılanlar: pano için 30, benim için 7.
export const statsApi = {
    board: (boardId: string, days?: number) => request<BoardStats>('GET', `/boards/${boardId}/stats`, { query: { days } }),
    card: (cardId: string) => request<CardStats>('GET', `/cards/${cardId}/stats`),
    mine: (days?: number) => request<MyStats>('GET', '/time-entries/stats', { query: { days } }),
    // Done vs not done card counts for a board. Not tied to a date range.
    // TR: Bir panodaki tamamlanan ve tamamlanmayan kart sayıları. Tarih aralığına bağlı değildir.
    summary: (boardId: string) => request<BoardSummary>('GET', `/boards/${boardId}/summary`),
};
