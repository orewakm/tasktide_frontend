import type { AddMemberInput, Board, Member } from '@/interfaces';
import { request } from './client';

export const boardsApi = {
    list: () => request<Board[]>('GET', '/boards'),
    create: (name: string) => request<Board>('POST', '/boards', { body: { name } }),
    get: (id: string) => request<Board>('GET', `/boards/${id}`),
    rename: (id: string, name: string) => request<Board>('PATCH', `/boards/${id}`, { body: { name } }),
    remove: (id: string) => request<void>('DELETE', `/boards/${id}`),
};

export const membersApi = {
    list: (boardId: string) => request<Member[]>('GET', `/boards/${boardId}/members`),
    add: (boardId: string, input: AddMemberInput) =>
        request<Member>('POST', `/boards/${boardId}/members`, { body: input }),
    // Also used to leave a board: pass your own user id.
    // TR: Panodan ayrılmak için de kullanılır: kendi kullanıcı id'ni gönder.
    remove: (boardId: string, userId: string) => request<void>('DELETE', `/boards/${boardId}/members/${userId}`),
};

export const invitationsApi = {
    list: () => request<Board[]>('GET', '/invitations'),
    accept: (boardId: string) => request<void>('POST', `/invitations/${boardId}/accept`),
    decline: (boardId: string) => request<void>('DELETE', `/invitations/${boardId}`),
};
