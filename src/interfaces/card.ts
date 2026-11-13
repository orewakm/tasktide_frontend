export type Priority = 'low' | 'medium' | 'high';

export interface Card {
    id: string;
    column_id: string;
    assignee_id: string | null;
    title: string;
    description: string | null;
    priority: Priority;
    position: number;
    version: number;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CardWithBoard extends Card {
    board_id: string;
}

export interface CreateCardInput {
    title: string;
    description?: string;
    priority?: Priority;
    assigneeId?: string | null;
}

export interface UpdateCardInput {
    version: number;
    title?: string;
    description?: string | null;
    priority?: Priority;
    assigneeId?: string | null;
    completed?: boolean;
}

export interface MoveCardInput {
    columnId: string;
    index: number;
}

export type CardStatus = 'completed' | 'pending';
export type CardSort = 'created_at' | 'updated_at' | 'priority' | 'title';

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

export interface CardListItem extends Card {
    board_id: string;
    board_name: string;
    column_name: string;
    assignee_name: string | null;
}

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

export interface BoardSummary extends CardCounts {
    by_column: (CardCounts & { column_id: string; name: string })[];
    by_priority: (CardCounts & { priority: Priority })[];
    by_assignee: (CardCounts & { user_id: string | null; name: string | null })[];
}
