import { adminApi } from './admin';
import { authApi } from './auth';
import { boardsApi, invitationsApi, membersApi } from './boards';
import { cardsApi, columnsApi, notesApi } from './cards';
import { statsApi, timeApi } from './time';

// One object for every endpoint, e.g. api.cards.update(id, { version, title }).
// TR: Her endpoint için tek bir nesne, örneğin api.cards.update(id, { version, title }).
export const api = {
    auth: authApi,
    boards: boardsApi,
    members: membersApi,
    invitations: invitationsApi,
    columns: columnsApi,
    cards: cardsApi,
    notes: notesApi,
    time: timeApi,
    stats: statsApi,
    admin: adminApi,
};

export { ApiError, NETWORK_ERROR, onUnauthorized, reportUnauthorized } from './client';
