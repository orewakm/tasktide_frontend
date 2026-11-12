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

// Connects the socket while someone is logged in, and handles the events that are
// sent to the user personally (invitations, boards added or removed).
// TR: Biri giriş yapmışken socket'i bağlar ve doğrudan kullanıcıya gönderilen
// TR: event'leri (davetler, eklenen veya çıkarılan panolar) işler.
export function RealtimeConnection() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    useEffect(() => {
        const socket = getSocket();
        let connectedBefore = false;

        function onConnect() {
            // Events sent while we were offline are lost, so reload the lists after a reconnect.
            // TR: Çevrimdışıyken gönderilen event'ler kaybolur, bu yüzden yeniden bağlanınca listeleri yeniden yükle.
            if (connectedBefore) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.boards });
                void queryClient.invalidateQueries({ queryKey: queryKeys.invitations });
                void queryClient.invalidateQueries({ queryKey: queryKeys.timer });
            }
            connectedBefore = true;
        }

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
