import { useEffect, useEffectEvent } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/interfaces';
import { API_URL } from '@/lib/config';
import { getToken } from '@/lib/token';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// One socket for the whole app, created on first use in the browser.
// It doesn't connect by itself: <RealtimeConnection> connects it after login.
// TR: Tüm uygulama için tek bir socket, tarayıcıda ilk kullanımda oluşturulur.
// TR: Kendi kendine bağlanmaz: <RealtimeConnection> girişten sonra bağlar.
let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
    if (!socket) {
        const options = {
            autoConnect: false,
            // Read the token on every (re)connect, so a new login is picked up.
            // TR: Token her (yeniden) bağlanmada okunur, böylece yeni bir giriş fark edilir.
            auth: (cb: (data: object) => void) => cb({ token: getToken() }),
        };
        socket = API_URL ? io(API_URL, options) : io(options);
    }
    return socket;
}

// Listen to a server event while the component is on screen.
// The handler always sees the latest props and state.
// TR: Bileşen ekrandayken bir sunucu event'ini dinle. Handler her zaman en güncel props ve state'i görür.
export function useSocketEvent<E extends keyof ServerToClientEvents>(event: E, handler: ServerToClientEvents[E]) {
    const onEvent = useEffectEvent(handler as (...args: unknown[]) => void);

    useEffect(() => {
        const s = getSocket();
        const listener = (...args: unknown[]) => onEvent(...args);
        s.on(event, listener as never);
        return () => {
            s.off(event, listener as never);
        };
    }, [event]);
}
