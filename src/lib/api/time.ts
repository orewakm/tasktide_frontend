import type { BoardStats, BoardSummary, CardStats, MyStats, TimeEntry, TimeEntryDetails } from '@/interfaces';
import { request } from './client';

export const timeApi = {
    // Starts my timer on a card.
    // TR: Bir kartta zamanlayıcımı başlatır.
    start: (cardId: string) => request<TimeEntryDetails>('POST', `/cards/${cardId}/time-entries`),

    // Lists a card's time entries.
    // TR: Bir kartın zaman kayıtlarını listeler.
    listForCard: (cardId: string) => request<TimeEntry[]>('GET', `/cards/${cardId}/time-entries`),

    // Returns my running timer, or null.
    // TR: Çalışan zamanlayıcımı ya da null döndürür.
    current: () => request<TimeEntryDetails | null>('GET', '/time-entries/current'),

    // Stops my running timer.
    // TR: Çalışan zamanlayıcımı durdurur.
    stop: () => request<TimeEntryDetails>('POST', '/time-entries/stop'),

    // Deletes a time entry.
    // TR: Bir zaman kaydını siler.
    remove: (id: string) => request<void>('DELETE', `/time-entries/${id}`),
};

export const statsApi = {
    // Returns a board's time stats for the last days.
    // TR: Bir panonun son günlerdeki süre istatistiklerini döndürür.
    board: (boardId: string, days?: number) => request<BoardStats>('GET', `/boards/${boardId}/stats`, { query: { days } }),

    // Returns a card's total tracked time.
    // TR: Bir kartın toplam takip edilen süresini döndürür.
    card: (cardId: string) => request<CardStats>('GET', `/cards/${cardId}/stats`),

    // Returns my own time stats for the last days.
    // TR: Son günlerdeki kendi süre istatistiklerimi döndürür.
    mine: (days?: number) => request<MyStats>('GET', '/time-entries/stats', { query: { days } }),

    // Returns a board's done and pending card counts.
    // TR: Bir panonun tamamlanan ve bekleyen kart sayılarını döndürür.
    summary: (boardId: string) => request<BoardSummary>('GET', `/boards/${boardId}/summary`),
};
