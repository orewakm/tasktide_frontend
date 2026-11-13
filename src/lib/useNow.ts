import { useEffect, useState } from 'react';

// Returns the current time, updated every second while active.
// TR: Etkinken her saniye güncellenen şu anki zamanı döndürür.
export function useNow(active: boolean): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!active) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [active]);

    return now;
}
