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

export const columnsApi = {
    // Lists a board's columns.
    // TR: Bir panonun sütunlarını listeler.
    list: (boardId: string) => request<Column[]>('GET', `/boards/${boardId}/columns`),

    // Adds a column to a board.
    // TR: Bir panoya sütun ekler.
    create: (boardId: string, name: string) => request<Column>('POST', `/boards/${boardId}/columns`, { body: { name } }),

    // Renames a column.
    // TR: Bir sütunu yeniden adlandırır.
    rename: (id: string, name: string) => request<Column>('PATCH', `/columns/${id}`, { body: { name } }),

    // Deletes a column and its cards.
    // TR: Bir sütunu ve kartlarını siler.
    remove: (id: string) => request<void>('DELETE', `/columns/${id}`),

    // Moves a column to a new place.
    // TR: Bir sütunu yeni bir yere taşır.
    move: (id: string, index: number) => request<Column>('PATCH', `/columns/${id}/move`, { body: { index } }),
};

export const cardsApi = {
    // Lists all cards of a board.
    // TR: Bir panonun tüm kartlarını listeler.
    list: (boardId: string) => request<Card[]>('GET', `/boards/${boardId}/cards`),

    // Returns one page of the task list with filters and sorting.
    // TR: Görev listesinin bir sayfasını filtre ve sıralamayla döndürür.
    find: (query: CardQuery) => request<CardPage>('GET', '/cards', { query: { ...query } }),

    // Creates a card in a column.
    // TR: Bir sütunda kart oluşturur.
    create: (columnId: string, input: CreateCardInput) =>
        request<Card>('POST', `/columns/${columnId}/cards`, { body: input }),

    // Returns one card.
    // TR: Bir kartı döndürür.
    get: (id: string) => request<CardWithBoard>('GET', `/cards/${id}`),

    // Saves card changes with the card's version.
    // TR: Kart değişikliklerini kartın sürümüyle kaydeder.
    update: (id: string, input: UpdateCardInput) => request<Card>('PATCH', `/cards/${id}`, { body: input }),

    // Deletes a card.
    // TR: Bir kartı siler.
    remove: (id: string) => request<void>('DELETE', `/cards/${id}`),

    // Moves a card to a column and position.
    // TR: Bir kartı bir sütuna ve konuma taşır.
    move: (id: string, input: MoveCardInput) => request<Card>('PATCH', `/cards/${id}/move`, { body: input }),
};

export const notesApi = {
    // Lists a card's notes.
    // TR: Bir kartın notlarını listeler.
    list: (cardId: string) => request<Note[]>('GET', `/cards/${cardId}/notes`),

    // Adds a note to a card.
    // TR: Bir karta not ekler.
    create: (cardId: string, content: string) => request<Note>('POST', `/cards/${cardId}/notes`, { body: { content } }),

    // Edits a note.
    // TR: Bir notu düzenler.
    update: (id: string, content: string) => request<Note>('PATCH', `/notes/${id}`, { body: { content } }),

    // Deletes a note.
    // TR: Bir notu siler.
    remove: (id: string) => request<void>('DELETE', `/notes/${id}`),
};
