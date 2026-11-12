import type {
    Card,
    CardPage,
    CardQuery,
    CardWithBoard,
    Column,
    CreateCardInput,
    MoveCardInput,
    Note,
    UpdateCardInput,
} from '@/interfaces';
import { request } from './client';

// For moves, never send a position: send the index where the item should end up.
// The server picks the position and returns the item with it.
// TR: Taşımada asla position gönderilmez: öğenin varacağı index gönderilir.
// TR: Pozisyonu sunucu seçer ve öğeyi yeni pozisyonuyla döner.
export const columnsApi = {
    list: (boardId: string) => request<Column[]>('GET', `/boards/${boardId}/columns`),
    create: (boardId: string, name: string) => request<Column>('POST', `/boards/${boardId}/columns`, { body: { name } }),
    rename: (id: string, name: string) => request<Column>('PATCH', `/columns/${id}`, { body: { name } }),
    remove: (id: string) => request<void>('DELETE', `/columns/${id}`),
    move: (id: string, index: number) => request<Column>('PATCH', `/columns/${id}/move`, { body: { index } }),
};

export const cardsApi = {
    list: (boardId: string) => request<Card[]>('GET', `/boards/${boardId}/cards`),
    // The task list: cards across all my boards, filtered, sorted and one page at a time.
    // TR: Görev listesi: tüm panolarımdaki kartlar; filtrelenmiş, sıralanmış ve sayfa sayfa.
    find: (query: CardQuery) => request<CardPage>('GET', '/cards', { query: { ...query } }),
    create: (columnId: string, input: CreateCardInput) =>
        request<Card>('POST', `/columns/${columnId}/cards`, { body: input }),
    get: (id: string) => request<CardWithBoard>('GET', `/cards/${id}`),
    // 409 means someone else saved first: reload the card and let the user redo the edit.
    // TR: 409, başka birinin önce kaydettiği anlamına gelir: kartı yeniden yükle ve kullanıcının düzenlemeyi tekrar yapmasına izin ver.
    update: (id: string, input: UpdateCardInput) => request<Card>('PATCH', `/cards/${id}`, { body: input }),
    remove: (id: string) => request<void>('DELETE', `/cards/${id}`),
    move: (id: string, input: MoveCardInput) => request<Card>('PATCH', `/cards/${id}/move`, { body: input }),
};

export const notesApi = {
    list: (cardId: string) => request<Note[]>('GET', `/cards/${cardId}/notes`),
    create: (cardId: string, content: string) => request<Note>('POST', `/cards/${cardId}/notes`, { body: { content } }),
    update: (id: string, content: string) => request<Note>('PATCH', `/notes/${id}`, { body: { content } }),
    remove: (id: string) => request<void>('DELETE', `/notes/${id}`),
};
