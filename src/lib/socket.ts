import { useEffect, useEffectEvent } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/interfaces';
import { API_URL } from '@/lib/config';
import { getToken } from '@/lib/token';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

// Returns the shared Socket.IO connection, creating it once.
// TR: Ortak Socket.IO bağlantısını döndürür, gerekirse bir kez oluşturur.
export function getSocket(): AppSocket {
    if (!socket) {
        const options = {
            autoConnect: false,
            auth: (cb: (data: object) => void) => cb({ token: getToken() }),
        };
        socket = API_URL ? io(API_URL, options) : io(options);
    }
    return socket;
}

// Listens to a live event while the component is on screen.
// TR: Bileşen ekrandayken canlı bir olayı dinler.
export function useSocketEvent<E extends keyof ServerToClientEvents>(event: E, handler: ServerToClientEvents[E]) {
    const onEvent = useEffectEvent(handler as (...args: unknown[]) => void);

    useEffect(() => {
        const s = getSocket();

        // Passes the event to the latest handler.
        // TR: Olayı en güncel işleyiciye iletir.
        const listener = (...args: unknown[]) => onEvent(...args);
        s.on(event, listener as never);
        return () => {
            s.off(event, listener as never);
        };
    }, [event]);
}
