import type { Board, Column, Member, OnlineUser } from './board';
import type { Card } from './card';
import type { Note } from './note';
import type { TimeEntryDetails } from './time';

export interface Position {
    id: string;
    position: number;
}

export type BoardMember = Member & { board_id: string };
export type MovedCard = Card & { from_column_id: string };

export interface ServerToClientEvents {
    presence: (payload: { board_id: string; online: OnlineUser[] }) => void;

    'board:updated': (board: Board) => void;
    'board:deleted': (payload: { id: string }) => void;

    'member:added': (member: BoardMember) => void;
    'member:updated': (member: BoardMember) => void;
    'member:removed': (payload: { board_id: string; user_id: string }) => void;

    'column:created': (column: Column) => void;
    'column:updated': (column: Column) => void;
    'column:moved': (column: Column) => void;
    'column:deleted': (payload: { id: string; board_id: string }) => void;
    'columns:renumbered': (payload: { board_id: string; columns: Position[] }) => void;

    'card:created': (card: Card) => void;
    'card:updated': (card: Card) => void;
    'card:moved': (card: MovedCard) => void;
    'card:deleted': (payload: { id: string; column_id: string }) => void;
    'cards:renumbered': (payload: { column_id: string; cards: Position[] }) => void;

    'note:created': (note: Note) => void;
    'note:updated': (note: Note) => void;
    'note:deleted': (payload: { id: string; card_id: string }) => void;

    'timer:started': (entry: TimeEntryDetails) => void;
    'timer:stopped': (entry: TimeEntryDetails) => void;
    'time-entry:deleted': (payload: { id: string; card_id: string; user_id: string }) => void;

    'invitation:received': (board: Board) => void;
    'board:added': (board: Board) => void;
    'board:removed': (payload: { id: string }) => void;
}

export type JoinBoardReply = { ok: true; online: OnlineUser[] } | { ok: false; error: string };

export interface ClientToServerEvents {
    'board:join': (boardId: string, ack: (reply: JoinBoardReply) => void) => void;
    'board:leave': (boardId: string) => void;
}
