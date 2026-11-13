import type { Position } from '@/interfaces';

interface WithId {
    id: string;
}

interface Positioned extends WithId {
    position: number;
}

// Sorts items by position, then by id.
// TR: Öğeleri konuma, sonra kimliğe göre sıralar.
export function byPosition(a: Positioned, b: Positioned): number {
    if (a.position !== b.position) return a.position - b.position;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

// Replaces the item in the list, or adds it if it's missing.
// TR: Listedeki öğeyi değiştirir ya da yoksa ekler.
export function upsert<T extends WithId>(list: T[] | undefined, item: T): T[] | undefined {
    if (!list) return list;
    const index = list.findIndex((existing) => existing.id === item.id);
    if (index === -1) return [...list, item];
    const next = list.slice();
    next[index] = { ...list[index], ...item };
    return next;
}

// Removes the items that match from the list.
// TR: Eşleşen öğeleri listeden kaldırır.
export function removeWhere<T>(list: T[] | undefined, shouldRemove: (item: T) => boolean): T[] | undefined {
    return list?.filter((item) => !shouldRemove(item));
}

// Sets new positions on the items in the list.
// TR: Listedeki öğelere yeni konumlar verir.
export function applyPositions<T extends Positioned>(list: T[] | undefined, positions: Position[]): T[] | undefined {
    if (!list) return list;
    const byId = new Map(positions.map((p) => [p.id, p.position]));
    return list.map((item) => (byId.has(item.id) ? { ...item, position: byId.get(item.id)! } : item));
}

// Returns the position for a drop at an index, like the server does.
// TR: Bir sıraya bırakılan öğenin konumunu sunucu gibi hesaplar.
export function positionAt(positions: number[], index: number): number {
    const prev = positions[index - 1];
    const next = positions[index];
    if (prev === undefined) return next === undefined ? 1000 : next - 1000;
    if (next === undefined) return prev + 1000;
    return (prev + next) / 2;
}
