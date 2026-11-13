'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board } from '@/interfaces';
import { reportUnauthorized } from '@/lib/api';
import { removeWhere, upsert } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';
import { getSocket, useSocketEvent } from '@/lib/socket';

// Keeps the live connection open and handles personal events.
// TR: Canlı bağlantıyı açık tutar ve kişiye özel olayları işler.
export function RealtimeConnection() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    useEffect(() => {
        const socket = getSocket();
        let connectedBefore = false;

        // Reloads boards, invitations and the timer after a reconnect.
        // TR: Yeniden bağlanınca panoları, davetleri ve zamanlayıcıyı yeniden yükler.
        function onConnect() {
            if (connectedBefore) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.boards });
                void queryClient.invalidateQueries({ queryKey: queryKeys.invitations });
                void queryClient.invalidateQueries({ queryKey: queryKeys.timer });
            }
            connectedBefore = true;
        }

        // Logs out when the server rejects the session.
        // TR: Sunucu oturumu reddederse çıkış yapar.
        function onConnectError(err: Error) {
            if (err.message === 'Unauthorized') reportUnauthorized();
        }

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.connect();
        return () => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.disconnect();
        };
    }, [queryClient]);

    useSocketEvent('invitation:received', (board) => {
        queryClient.setQueryData<Board[]>(queryKeys.invitations, (list) => upsert(list, board));
        toast(t.boards.invitationReceived(board.name));
    });

    useSocketEvent('board:added', (board) => {
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => upsert(list, board));
        queryClient.setQueryData<Board[]>(queryKeys.invitations, (list) => removeWhere(list, (b) => b.id === board.id));
    });

    useSocketEvent('board:removed', ({ id }) => {
        queryClient.setQueryData<Board[]>(queryKeys.boards, (list) => removeWhere(list, (b) => b.id === id));
        queryClient.setQueryData<Board[]>(queryKeys.invitations, (list) => removeWhere(list, (b) => b.id === id));
    });

    return null;
}
