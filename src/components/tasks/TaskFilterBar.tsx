'use client';

import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { inputClass } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import type { Board, CardStatus, Priority } from '@/interfaces';
import { clearFilters, hasFilters, SORTS, updateFilters, type Scope, type SortKey, type TaskFilters } from './taskFilters';

const SEARCH_DELAY_MS = 300;
// Its own class instead of inputClass, which is full width with bigger text.
// TR: inputClass yerine kendi sınıfı; inputClass tam genişlikte ve yazısı daha büyük.
const selectClass =
    'h-9 min-w-0 rounded-lg border border-line bg-surface pr-8 pl-3 text-[13px] text-ink transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent/15 focus-visible:outline-none';

interface TaskFilterBarProps {
    filters: TaskFilters;
    boards: Board[];
}

export function TaskFilterBar({ filters, boards }: TaskFilterBarProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <SearchBox value={filters.search} />
                <ScopeSwitch value={filters.scope} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    aria-label={t.tasks.board}
                    value={filters.board}
                    onChange={(e) => updateFilters({ board: e.target.value })}
                    className={`${selectClass} max-w-56`}
                >
                    <option value="">{t.tasks.allBoards}</option>
                    {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                            {board.name}
                        </option>
                    ))}
                </select>

                <select
                    aria-label={t.tasks.status}
                    value={filters.status}
                    onChange={(e) => updateFilters({ status: e.target.value as CardStatus | '' })}
                    className={selectClass}
                >
                    <option value="">{t.tasks.anyStatus}</option>
                    <option value="pending">{t.tasks.statuses.pending}</option>
                    <option value="completed">{t.tasks.statuses.completed}</option>
                </select>

                <select
                    aria-label={t.tasks.priority}
                    value={filters.priority}
                    onChange={(e) => updateFilters({ priority: e.target.value as Priority | '' })}
                    className={selectClass}
                >
                    <option value="">{t.tasks.anyPriority}</option>
                    {(['high', 'medium', 'low'] as const).map((priority) => (
                        <option key={priority} value={priority}>
                            {t.card.priorities[priority]}
                        </option>
                    ))}
                </select>

                <select
                    aria-label={t.tasks.sort}
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value as SortKey })}
                    className={selectClass}
                >
                    {(Object.keys(SORTS) as SortKey[]).map((key) => (
                        <option key={key} value={key}>
                            {t.tasks.sorts[key]}
                        </option>
                    ))}
                </select>

                {hasFilters(filters) && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-sunken hover:text-ink"
                    >
                        <XIcon size={14} weight="bold" />
                        {t.tasks.clear}
                    </button>
                )}
            </div>
        </div>
    );
}

// The search box keeps what you type in its own state and writes it to the URL a moment
// after you stop typing, so the list doesn't reload on every key press.
// TR: Arama kutusu yazdıklarınızı kendi state'inde tutar ve yazmayı bıraktıktan kısa süre sonra
// TR: URL'ye yazar; böylece liste her tuşta yeniden yüklenmez.
function SearchBox({ value }: { value: string }) {
    const { t } = useLanguage();
    const [text, setText] = useState(value);
    const timer = useRef<number | undefined>(undefined);

    // When the URL changes from outside (Clear filters, Back button), show its value.
    // React's pattern for adjusting state when a prop changes: compare during render.
    // TR: URL dışarıdan değişince (Filtreleri temizle, Geri butonu) onun değerini göster.
    // TR: Bir prop değişince state'i ayarlamak için React'in önerdiği yol: render sırasında karşılaştırmak.
    const [lastValue, setLastValue] = useState(value);
    if (value !== lastValue) {
        setLastValue(value);
        setText(value);
    }

    useEffect(() => () => window.clearTimeout(timer.current), []);

    function onChange(next: string) {
        setText(next);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => updateFilters({ search: next.trim() }), SEARCH_DELAY_MS);
    }

    return (
        <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <input
                type="search"
                aria-label={t.tasks.search}
                placeholder={t.tasks.search}
                maxLength={100}
                value={text}
                onChange={(e) => onChange(e.target.value)}
                className={`${inputClass} h-9 border-line pl-9`}
            />
        </div>
    );
}

// "Assigned to me" or "All tasks". A radio group: arrow keys move between the options.
// TR: "Bana atananlar" ya da "Tüm görevler". Bir radio grubu: ok tuşları seçenekler arasında gezer.
function ScopeSwitch({ value }: { value: Scope }) {
    const { t } = useLanguage();
    const scopes: Scope[] = ['me', 'all'];

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = scopes[(scopes.indexOf(value) + 1) % scopes.length];
        updateFilters({ scope: next });
        event.currentTarget.querySelector<HTMLButtonElement>(`[data-scope="${next}"]`)?.focus();
    }

    return (
        <div
            role="radiogroup"
            aria-label={t.tasks.scope}
            onKeyDown={onKeyDown}
            className="inline-flex h-9 w-fit items-center rounded-lg border border-line bg-sunken p-0.5"
        >
            {scopes.map((scope) => (
                <button
                    key={scope}
                    type="button"
                    role="radio"
                    data-scope={scope}
                    aria-checked={value === scope}
                    tabIndex={value === scope ? 0 : -1}
                    onClick={() => updateFilters({ scope })}
                    className={`h-full rounded-md px-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                        value === scope ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                    }`}
                >
                    {t.tasks.scopes[scope]}
                </button>
            ))}
        </div>
    );
}
