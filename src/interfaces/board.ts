export interface Board {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
}

export type MemberStatus = 'invited' | 'active';

export interface Member {
    id: string;
    name: string;
    email: string;
    status: MemberStatus;
}

export interface Column {
    id: string;
    board_id: string;
    name: string;
    position: number;
}

export interface OnlineUser {
    id: string;
    name: string;
}

export interface AddMemberInput {
    email: string;
    status?: MemberStatus;
}
