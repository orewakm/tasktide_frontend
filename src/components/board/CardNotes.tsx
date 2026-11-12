'use client';

import { LockSimpleIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/components/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { inputClass } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import type { Card, Note } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { removeWhere, upsert } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';

export function CardNotes({ card, isOwner }: { card: Card; isOwner: boolean }) {
    const { t } = useLanguage();
    const me = useCurrentUser();
    const queryClient = useQueryClient();
    const notes = useQuery({ queryKey: queryKeys.notes(card.id), queryFn: () => api.notes.list(card.id) });
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    // Only the card's assignee can write notes (the API checks this too).
    const canAdd = card.assignee_id === me.id;

    const setNotes = (update: (list: Note[] | undefined) => Note[] | undefined) =>
        queryClient.setQueryData<Note[]>(queryKeys.notes(card.id), update);

    async function addNote(event?: SubmitEvent<HTMLFormElement>) {
        event?.preventDefault();
        const content = text.trim();
        if (!content) return;
        setBusy(true);
        try {
            const note = await api.notes.create(card.id, content);
            setNotes((list) => upsert(list, note));
            setText('');
        } catch (err) {
            toast.error(errorText(err, t));
        } finally {
            setBusy(false);
        }
    }

    return (
        <section aria-labelledby={`notes-${card.id}`} className="flex flex-col gap-3">
            <h3 id={`notes-${card.id}`} className="text-sm font-semibold">
                {t.card.notes}
                {notes.data && notes.data.length > 0 && (
                    <span className="ml-2 font-mono text-xs font-normal text-muted">{notes.data.length}</span>
                )}
            </h3>

            {notes.isPending ? (
                <Skeleton className="h-16" />
            ) : !notes.data || notes.data.length === 0 ? (
                <p className="text-[13px] text-muted">{t.card.noNotes}</p>
            ) : (
                <ol className="flex flex-col gap-4">
                    {notes.data.map((note) => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            canEdit={note.author_id === me.id}
                            canDelete={note.author_id === me.id || isOwner}
                            onSaved={(saved) => setNotes((list) => upsert(list, saved))}
                            onDeleted={() => setNotes((list) => removeWhere(list, (n) => n.id === note.id))}
                        />
                    ))}
                </ol>
            )}

            {canAdd ? (
                <form onSubmit={addNote} className="flex flex-col gap-2">
                    <textarea
                        aria-label={t.card.notePlaceholder}
                        placeholder={t.card.notePlaceholder}
                        rows={3}
                        maxLength={5000}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') e.preventDefault();
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void addNote();
                        }}
                        className={`${inputClass} border-line py-2 leading-relaxed`}
                    />
                    <Button type="submit" size="sm" disabled={busy || !text.trim()} className="self-start">
                        {t.card.addNote}
                    </Button>
                </form>
            ) : (
                <p className="flex items-center gap-2 text-[13px] text-muted">
                    <LockSimpleIcon size={14} />
                    {t.card.notesAssigneeOnly}
                </p>
            )}
        </section>
    );
}

interface NoteItemProps {
    note: Note;
    canEdit: boolean;
    canDelete: boolean;
    onSaved: (note: Note) => void;
    onDeleted: () => void;
}

function NoteItem({ note, canEdit, canDelete, onSaved, onDeleted }: NoteItemProps) {
    const { t, language } = useLanguage();
    const [draft, setDraft] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function save() {
        const content = draft?.trim();
        if (!content) return;
        setBusy(true);
        try {
            onSaved(await api.notes.update(note.id, content));
            setDraft(null);
        } catch (err) {
            toast.error(errorText(err, t));
        } finally {
            setBusy(false);
        }
    }

    async function remove() {
        setBusy(true);
        try {
            await api.notes.remove(note.id);
            onDeleted();
        } catch (err) {
            toast.error(errorText(err, t));
            setBusy(false);
        }
    }

    return (
        <li className="group flex gap-3">
            <Avatar name={note.author_name} size="md" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{note.author_name}</span>
                    <span className="text-xs text-muted">{formatDateTime(note.created_at, language)}</span>
                    <div className="ml-auto flex opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                        {canEdit && draft === null && (
                            <IconButton size="sm" label={t.card.editNote} onClick={() => setDraft(note.content)}>
                                <PencilSimpleIcon size={14} />
                            </IconButton>
                        )}
                        {canDelete && (
                            <IconButton size="sm" label={t.card.deleteNote} onClick={() => void remove()} disabled={busy}>
                                <TrashIcon size={14} />
                            </IconButton>
                        )}
                    </div>
                </div>
                {draft === null ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{note.content}</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        <textarea
                            autoFocus
                            aria-label={t.card.editNote}
                            rows={3}
                            maxLength={5000}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setDraft(null);
                                }
                            }}
                            className={`${inputClass} border-line py-2 leading-relaxed`}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => void save()} disabled={busy || !draft.trim()}>
                                {t.common.save}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDraft(null)} disabled={busy}>
                                {t.common.cancel}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </li>
    );
}
