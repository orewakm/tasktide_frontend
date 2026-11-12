import { useEffect, useState } from 'react';

// The current time, updated every second while `active` is true. Used for ticking timers,
// computed in the browser instead of asking the API every second.
// TR: Şu anki zaman, `active` true olduğu sürece her saniye güncellenir. İşleyen zamanlayıcılar
// TR: için kullanılır; API'ye her saniye sormak yerine tarayıcıda hesaplanır.
export function useNow(active: boolean): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!active) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [active]);

    return now;
}
