export interface TimeEntry {
    id: string;
    card_id: string;
    user_id: string;
    user_name: string;
    started_at: string;
    // null while the timer is running.
    // TR: Zamanlayıcı çalışırken null.
    ended_at: string | null;
    // For a running timer: seconds up to the moment of the request.
    // TR: Çalışan bir zamanlayıcı için: isteğin yapıldığı ana kadar geçen saniye.
    duration_seconds: number;
}

// Returned by start / stop / current, and sent in timer events.
// TR: start / stop / current tarafından döner ve zamanlayıcı event'lerinde gönderilir.
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

// day is "YYYY-MM-DD" (UTC). Days with no tracked time come back with 0.
// TR: day "YYYY-MM-DD" (UTC) biçimindedir. Süre kaydı olmayan günler 0 ile döner.
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
