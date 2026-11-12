export type Priority = 'low' | 'medium' | 'high';

export interface Card {
    id: string;
    column_id: string;
    assignee_id: string | null;
    title: string;
    description: string | null;
    priority: Priority;
    position: number;
    // Send it back when editing; the server answers 409 if someone saved first.
    // TR: Düzenlerken geri gönderilir; başkası önce kaydettiyse sunucu 409 döner.
    version: number;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

// GET /cards/:id also tells which board the card belongs to.
// TR: GET /cards/:id, kartın hangi panoya ait olduğunu da döner.
export interface CardWithBoard extends Card {
    board_id: string;
}

// Request bodies use camelCase ids (assigneeId), responses use snake_case.
// TR: İstek gövdeleri camelCase id kullanır (assigneeId), yanıtlar snake_case kullanır.
export interface CreateCardInput {
    title: string;
    description?: string;
    priority?: Priority;
    assigneeId?: string | null;
}

// Leaving a field out keeps it; null clears description / assigneeId.
// TR: Bir alanı göndermemek onu korur; null, description / assigneeId'yi temizler.
export interface UpdateCardInput {
    version: number;
    title?: string;
    description?: string | null;
    priority?: Priority;
    assigneeId?: string | null;
    completed?: boolean;
}

// index = where the card ends up in the target column, counted without the card itself.
// TR: index = kartın hedef sütunda varacağı yer, kartın kendisi sayılmadan.
export interface MoveCardInput {
    columnId: string;
    index: number;
}

export type CardStatus = 'completed' | 'pending';
export type CardSort = 'created_at' | 'updated_at' | 'priority' | 'title';

// Filters for GET /cards (the task list). Every field is optional.
// assigneeId is a user id, or 'me' for the logged-in user.
// TR: GET /cards (görev listesi) filtreleri. Tüm alanlar isteğe bağlıdır.
// TR: assigneeId bir kullanıcı id'si ya da giriş yapan kullanıcı için 'me' olur.
export interface CardQuery {
    boardId?: string;
    columnId?: string;
    status?: CardStatus;
    priority?: Priority;
    assigneeId?: string;
    search?: string;
    sort?: CardSort;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// A card in the task list, with the names the list shows next to it.
// TR: Görev listesindeki bir kart, listede yanında görünen isimlerle birlikte.
export interface CardListItem extends Card {
    board_id: string;
    board_name: string;
    column_name: string;
    assignee_name: string | null;
}

// One page of the task list. total counts every match, across all pages.
// TR: Görev listesinin bir sayfası. total, tüm sayfalardaki bütün eşleşmeleri sayar.
export interface CardPage {
    data: CardListItem[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface CardCounts {
    total: number;
    completed: number;
    pending: number;
}

// GET /boards/:id/summary: done vs not done cards, overall and broken down.
// by_column lists every column left to right (empty ones too), by_priority is always
// high, medium, low, and a null user_id in by_assignee means unassigned.
// TR: GET /boards/:id/summary: tamamlanan ve tamamlanmayan kartlar, toplamda ve kırılımlarıyla.
// TR: by_column her sütunu soldan sağa listeler (boş olanlar dahil), by_priority her zaman
// TR: high, medium, low sırasındadır; by_assignee'de null user_id atanmamış demektir.
export interface BoardSummary extends CardCounts {
    by_column: (CardCounts & { column_id: string; name: string })[];
    by_priority: (CardCounts & { priority: Priority })[];
    by_assignee: (CardCounts & { user_id: string | null; name: string | null })[];
}
