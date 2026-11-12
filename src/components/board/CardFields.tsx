'use client';

import { CheckCircleIcon, CircleIcon, WarningIcon } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import type { Card, Member, Priority, UpdateCardInput } from '@/interfaces';
import { PRIORITY_STYLES } from './PriorityTag';

export type SaveResult = 'ok' | 'conflict' | 'error';
export type SaveCard = (fields: Omit<UpdateCardInput, 'version'>, version: number) => Promise<SaveResult>;

interface FieldProps {
    card: Card;
    onSave: SaveCard;
}

// The title edits in place. The version is taken when editing starts, so if someone else
// saves in between, the server answers 409 instead of silently overwriting their change.
// TR: Başlık yerinde düzenlenir. Versiyon düzenleme başlarken alınır; böylece arada başka biri
// TR: kaydederse sunucu onun değişikliğinin üzerine sessizce yazmak yerine 409 döner.
export function TitleField({ card, onSave, id }: FieldProps & { id: string }) {
    const { t } = useLanguage();
    const [draft, setDraft] = useState<string | null>(null);
    const startVersion = useRef(card.version);
    const cancelled = useRef(false);

    return (
        <textarea
            id={id}
            aria-label={t.card.title}
            rows={1}
            maxLength={200}
            value={draft ?? card.title}
            onFocus={() => {
                startVersion.current = card.version;
                cancelled.current = false;
                setDraft(card.title);
            }}
            onChange={(e) => setDraft(e.target.value.replace(/\n/g, ' '))}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelled.current = true;
                    e.currentTarget.blur();
                }
            }}
            onBlur={() => {
                const next = (draft ?? '').trim();
                setDraft(null);
                if (!cancelled.current && next && next !== card.title) void onSave({ title: next }, startVersion.current);
            }}
            className="-mx-2 w-[calc(100%+1rem)] resize-none rounded-lg bg-transparent px-2 py-1 text-xl leading-snug font-semibold tracking-tight [field-sizing:content] hover:bg-sunken focus:bg-surface focus:ring-2 focus:ring-accent/30 focus-visible:outline-none"
        />
    );
}

interface DescriptionFieldProps extends FieldProps {
    // Did someone else save the card between these two versions?
    changedByOthers: (since: number, latest: number) => boolean;
}

export function DescriptionField({ card, onSave, changedByOthers }: DescriptionFieldProps) {
    const { t } = useLanguage();
    const [editing, setEditing] = useState<{ text: string; version: number } | null>(null);
    const [busy, setBusy] = useState(false);

    if (!editing) {
        const start = () => setEditing({ text: card.description ?? '', version: card.version });
        return card.description ? (
            <button
                type="button"
                onClick={start}
                className="-mx-3 w-[calc(100%+1.5rem)] rounded-lg px-3 py-2 text-left text-sm leading-relaxed whitespace-pre-wrap break-words hover:bg-sunken"
            >
                {card.description}
            </button>
        ) : (
            <button
                type="button"
                onClick={start}
                className="w-full rounded-lg border border-dashed border-line-strong px-3 py-3 text-left text-sm text-muted hover:border-accent hover:text-accent-ink"
            >
                {t.card.addDescription}
            </button>
        );
    }

    const changedElsewhere = changedByOthers(editing.version, card.version);

    async function save() {
        if (!editing) return;
        setBusy(true);
        const text = editing.text.trim();
        const result = await onSave({ description: text || null }, editing.version);
        setBusy(false);
        // On a conflict the card was reloaded: close the editor so the user starts from the new text.
        if (result !== 'error') setEditing(null);
    }

    return (
        <div className="flex flex-col gap-2">
            {changedElsewhere && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-warn/10 px-3 py-2 text-[13px] text-warn">
                    <WarningIcon size={16} weight="bold" className="shrink-0" />
                    <span className="flex-1">{t.card.changedElsewhere}</span>
                    <button
                        type="button"
                        className="font-semibold underline-offset-2 hover:underline"
                        onClick={() => setEditing({ text: card.description ?? '', version: card.version })}
                    >
                        {t.card.loadLatest}
                    </button>
                </div>
            )}
            <textarea
                autoFocus
                aria-label={t.card.description}
                rows={6}
                maxLength={5000}
                value={editing.text}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        setEditing(null);
                    }
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void save();
                }}
                className={`${inputClass} border-line py-2 leading-relaxed`}
            />
            <div className="flex gap-2">
                <Button size="sm" onClick={() => void save()} disabled={busy}>
                    {busy ? t.common.saving : t.common.save}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(null)} disabled={busy}>
                    {t.common.cancel}
                </Button>
            </div>
        </div>
    );
}

// Status, priority and assignee save right away with the card's current version.
// TR: Durum, öncelik ve atanan kişi kartın güncel versiyonuyla hemen kaydedilir.
export function CardProperties({ card, onSave, members }: FieldProps & { members: Member[] }) {
    const { t } = useLanguage();
    const done = card.completed_at !== null;
    const activeMembers = members.filter((m) => m.status === 'active');
    const assigneeMissing = card.assignee_id !== null && !activeMembers.some((m) => m.id === card.assignee_id);

    return (
        <dl className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
            <dt className="text-[13px] text-muted">{t.card.status}</dt>
            <dd>
                <button
                    type="button"
                    aria-pressed={done}
                    onClick={() => void onSave({ completed: !done }, card.version)}
                    className={`inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 text-[13px] font-medium transition-colors ${
                        done
                            ? 'border-done/30 bg-done/10 text-done'
                            : 'border-line text-ink hover:border-line-strong hover:bg-sunken'
                    }`}
                >
                    {done ? <CheckCircleIcon size={16} weight="fill" /> : <CircleIcon size={16} />}
                    {done ? t.card.done : t.card.notDone}
                </button>
            </dd>

            <dt className="text-[13px] text-muted">{t.card.priority}</dt>
            <dd>
                <div
                    role="radiogroup"
                    aria-label={t.card.priority}
                    className="inline-flex h-8 items-center rounded-lg border border-line bg-sunken p-0.5"
                >
                    {(['low', 'medium', 'high'] as Priority[]).map((priority) => {
                        const { icon: Icon, className } = PRIORITY_STYLES[priority];
                        const selected = card.priority === priority;
                        return (
                            <button
                                key={priority}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => !selected && void onSave({ priority }, card.version)}
                                className={`flex h-full items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors ${
                                    selected ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                                }`}
                            >
                                <Icon size={14} weight="bold" className={selected ? className : ''} />
                                {t.card.priorities[priority]}
                            </button>
                        );
                    })}
                </div>
            </dd>

            <dt className="text-[13px] text-muted">
                <label htmlFor={`assignee-${card.id}`}>{t.card.assignee}</label>
            </dt>
            <dd>
                <select
                    id={`assignee-${card.id}`}
                    value={card.assignee_id ?? ''}
                    onChange={(e) => void onSave({ assigneeId: e.target.value || null }, card.version)}
                    className={`${inputClass} h-8 max-w-64 border-line pr-8`}
                >
                    <option value="">{t.card.unassigned}</option>
                    {assigneeMissing && <option value={card.assignee_id!}>?</option>}
                    {activeMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </dd>
        </dl>
    );
}
