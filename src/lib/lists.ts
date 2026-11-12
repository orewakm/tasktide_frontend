import type { Position } from '@/interfaces';

// Helpers for keeping cached lists in sync with live events. Events are applied by id,
// so getting the same change twice (HTTP response + socket event) is harmless.
// TR: Önbellekteki listeleri canlı event'lerle senkron tutmak için yardımcılar. Event'ler id ile
// TR: uygulanır, bu yüzden aynı değişikliği iki kez almak (HTTP yanıtı + socket event'i) zararsızdır.

interface WithId {
    id: string;
}

interface Positioned extends WithId {
    position: number;
}

// Lists are always shown sorted by position, then id, so every screen shows the same order.
// TR: Listeler her zaman önce pozisyona, sonra id'ye göre sıralı gösterilir; böylece her ekran aynı sırayı gösterir.
export function byPosition(a: Positioned, b: Positioned): number {
    if (a.position !== b.position) return a.position - b.position;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

// Replace the item if it's there, add it if it isn't. Leaves a list that isn't loaded alone.
// TR: Öğe varsa değiştir, yoksa ekle. Yüklenmemiş bir listeye dokunmaz.
export function upsert<T extends WithId>(list: T[] | undefined, item: T): T[] | undefined {
    if (!list) return list;
    const index = list.findIndex((existing) => existing.id === item.id);
    if (index === -1) return [...list, item];
    const next = list.slice();
    next[index] = { ...list[index], ...item };
    return next;
}

export function removeWhere<T>(list: T[] | undefined, shouldRemove: (item: T) => boolean): T[] | undefined {
    return list?.filter((item) => !shouldRemove(item));
}

export function applyPositions<T extends Positioned>(list: T[] | undefined, positions: Position[]): T[] | undefined {
    if (!list) return list;
    const byId = new Map(positions.map((p) => [p.id, p.position]));
    return list.map((item) => (byId.has(item.id) ? { ...item, position: byId.get(item.id)! } : item));
}

// The same rule the server uses: land halfway between the new neighbours.
// Only used to show a drop right away; the server's answer replaces it.
// TR: Sunucunun kullandığı kuralın aynısı: yeni komşuların tam ortasına yerleş.
// TR: Sadece bırakmayı hemen göstermek için kullanılır; sunucunun cevabı bunun yerine geçer.
export function positionAt(positions: number[], index: number): number {
    const prev = positions[index - 1];
    const next = positions[index];
    if (prev === undefined) return next === undefined ? 1000 : next - 1000;
    if (next === undefined) return prev + 1000;
    return (prev + next) / 2;
}
