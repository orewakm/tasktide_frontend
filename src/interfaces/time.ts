export interface TimeEntry {
    id: string;
    card_id: string;
    user_id: string;
    user_name: string;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number;
}

export interface TimeEntryDetails extends TimeEntry {
    card_title: string;
    board_id: string;
}

export interface Seconds {
    seconds: number;
}

export interface UserSeconds extends Seconds {
    user_id: string;
    name: string;
}

export interface CardSeconds extends Seconds {
    card_id: string;
    title: string;
}

export interface BoardSeconds extends Seconds {
    board_id: string;
    name: string;
}

export interface DaySeconds extends Seconds {
    day: string;
}

export interface BoardStats {
    from: string;
    to: string;
    total_seconds: number;
    by_user: UserSeconds[];
    by_card: CardSeconds[];
    by_day: DaySeconds[];
}

export interface CardStats {
    total_seconds: number;
    by_user: UserSeconds[];
}

export interface MyStats {
    from: string;
    to: string;
    total_seconds: number;
    by_board: BoardSeconds[];
    by_day: DaySeconds[];
}
