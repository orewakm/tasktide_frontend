import type { Dictionary } from '@/i18n/en';
import type { LoginInput, LoginResponse, Priority } from '@/interfaces';
import { api } from '@/lib/api';
import { isStatus } from '@/lib/errors';
import { setToken } from '@/lib/token';

const GUEST_KEY = 'tasktide.guest';

type SampleKey = keyof Dictionary['demo']['cards'];

interface SampleCard {
    column: number;
    key: SampleKey;
    priority: Priority;
    mine?: boolean;
    done?: boolean;
}

const SAMPLE_CARDS: SampleCard[] = [
    { column: 0, key: 'faq', priority: 'medium' },
    { column: 0, key: 'analytics', priority: 'low' },
    { column: 0, key: 'launchDate', priority: 'high' },
    { column: 1, key: 'copy', priority: 'high', mine: true },
    { column: 1, key: 'illustration', priority: 'medium', mine: true },
    { column: 2, key: 'palette', priority: 'medium', done: true },
    { column: 2, key: 'domain', priority: 'low', done: true },
];

// Returns the guest login saved in this browser, or null.
// TR: Bu tarayıcıda kayıtlı misafir girişini döndürür, yoksa null.
function getSavedGuest(): LoginInput | null {
    try {
        const saved = window.localStorage.getItem(GUEST_KEY);
        return saved ? (JSON.parse(saved) as LoginInput) : null;
    } catch {
        return null;
    }
}

// Saves the guest login in this browser, or removes it when given null.
// TR: Misafir girişini bu tarayıcıya kaydeder, null verilirse siler.
function saveGuest(guest: LoginInput | null) {
    try {
        if (guest) window.localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
        else window.localStorage.removeItem(GUEST_KEY);
    } catch {
    }
}

type DemoSession = LoginResponse & { path: string };
let pending: Promise<DemoSession> | null = null;

// Starts the demo; calls made while it is still running get the same result instead of a second guest.
// TR: Demoyu başlatır; o sırada yapılan çağrılar ikinci bir misafir yerine aynı sonucu alır.
export function startDemo(t: Dictionary): Promise<DemoSession> {
    pending ??= openDemo(t).finally(() => {
        pending = null;
    });
    return pending;
}

// Logs back in to this browser's guest account, or creates one with a sample board; returns the session and the page to open.
// TR: Bu tarayıcının misafir hesabına tekrar giriş yapar ya da örnek panolu yeni bir hesap açar; oturumu ve açılacak sayfayı döndürür.
async function openDemo(t: Dictionary): Promise<DemoSession> {
    const saved = getSavedGuest();
    if (saved) {
        try {
            return { ...(await api.auth.login(saved)), path: '/boards' };
        } catch (err) {
            if (!isStatus(err, 401)) throw err;
            saveGuest(null);
        }
    }

    const guest = { email: `guest-${crypto.randomUUID().slice(0, 13)}@demo.tasktide.live`, password: crypto.randomUUID() };
    await api.auth.register({ name: t.demo.guestName, ...guest });
    const session = await api.auth.login(guest);
    setToken(session.token);

    const board = await api.boards.create(t.demo.board);
    const columns = [];
    for (const name of t.demo.columns) {
        columns.push(await api.columns.create(board.id, name));
    }

    for (const sample of SAMPLE_CARDS) {
        const text = t.demo.cards[sample.key];
        const card = await api.cards.create(columns[sample.column].id, {
            title: text.title,
            description: text.description,
            priority: sample.priority,
            assigneeId: sample.mine ? session.user.id : null,
        });
        if (sample.done) await api.cards.update(card.id, { version: card.version, completed: true });
    }

    saveGuest(guest);
    return { ...session, path: `/boards/${board.id}` };
}
