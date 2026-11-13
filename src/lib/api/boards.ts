import type { AddMemberInput, Board, Member } from '@/interfaces';
import { request } from './client';

export const boardsApi = {
    // Lists the boards I'm a member of.
    // TR: Üyesi olduğum panoları listeler.
    list: () => request<Board[]>('GET', '/boards'),

    // Creates a board.
    // TR: Bir pano oluşturur.
    create: (name: string) => request<Board>('POST', '/boards', { body: { name } }),

    // Returns one board.
    // TR: Bir panoyu döndürür.
    get: (id: string) => request<Board>('GET', `/boards/${id}`),

    // Renames a board.
    // TR: Bir panoyu yeniden adlandırır.
    rename: (id: string, name: string) => request<Board>('PATCH', `/boards/${id}`, { body: { name } }),

    // Deletes a board.
    // TR: Bir panoyu siler.
    remove: (id: string) => request<void>('DELETE', `/boards/${id}`),
};

export const membersApi = {
    // Lists a board's members and invitations.
    // TR: Bir panonun üyelerini ve davetlerini listeler.
    list: (boardId: string) => request<Member[]>('GET', `/boards/${boardId}/members`),

    // Invites someone to a board by email.
    // TR: Birini e-postayla bir panoya davet eder.
    add: (boardId: string, input: AddMemberInput) =>
        request<Member>('POST', `/boards/${boardId}/members`, { body: input }),

    // Removes a member, or leaves the board when it's my own id.
    // TR: Bir üyeyi çıkarır, kendi kimliğimse panodan ayrılır.
    remove: (boardId: string, userId: string) => request<void>('DELETE', `/boards/${boardId}/members/${userId}`),
};

export const invitationsApi = {
    // Lists my pending invitations.
    // TR: Bekleyen davetlerimi listeler.
    list: () => request<Board[]>('GET', '/invitations'),

    // Accepts an invitation.
    // TR: Bir daveti kabul eder.
    accept: (boardId: string) => request<void>('POST', `/invitations/${boardId}/accept`),

    // Declines an invitation.
    // TR: Bir daveti reddeder.
    decline: (boardId: string) => request<void>('DELETE', `/invitations/${boardId}`),
};
