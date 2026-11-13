'use client';

import { TrashIcon, XIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconButton } from '@/components/ui/IconButton';
import { useLanguage } from '@/i18n/useLanguage';
import type { Card, Member } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText, isStatus } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { removeWhere, upsert } from '@/lib/lists';
import { queryKeys } from '@/lib/queryKeys';
import { CardProperties, DescriptionField, TitleField, type SaveCard, type SaveResult } from './CardFields';
import { CardNotes } from './CardNotes';
import { CardTime } from './CardTime';

interface CardPanelProps {
    boardId: string;
    card: Card;
    columnName: string;
    members: Member[];
    isOwner: boolean;
    onClose: () => void;
}

// Shows the side panel with everything about one card.
// TR: Bir kartla ilgili her şeyi içeren yan paneli gösterir.
export function CardPanel({ boardId, card, columnName, members, isOwner, onClose }: CardPanelProps) {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const panelRef = useRef<HTMLElement>(null);
    const titleId = useId();
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        panelRef.current?.focus();
    }, []);

    const close = useEffectEvent(onClose);
    useEffect(() => {
        // Closes the panel on Escape unless a dialog is open.
        // TR: Açık bir pencere yoksa Escape ile paneli kapatır.
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Escape' || event.defaultPrevented) return;
            if (document.querySelector('dialog[open]')) return;
            close();
        }
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    // Updates the board's cards in the cache.
    // TR: Panonun kartlarını önbellekte günceller.
    const setCards = (update: (list: Card[] | undefined) => Card[] | undefined) =>
        queryClient.setQueryData<Card[]>(queryKeys.cards(boardId), update);

    const ownVersions = useRef(new Set<number>());
    const queue = useRef<Promise<unknown>>(Promise.resolve());

    // Returns true if someone else saved the card since a version.
    // TR: Kart bir sürümden beri başka biri tarafından kaydedildiyse true döndürür.
    const changedByOthers = (since: number, latest: number) => {
        for (let v = since + 1; v <= latest; v++) if (!ownVersions.current.has(v)) return true;
        return false;
    };

    // Saves card fields with their version and handles conflicts.
    // TR: Kart alanlarını sürümleriyle kaydeder ve çakışmaları yönetir.
    const save: SaveCard = (fields, version) => {
        // Sends the save and reloads the card on a version conflict.
        // TR: Kaydı gönderir ve sürüm çakışmasında kartı yeniden yükler.
        const run = async (): Promise<SaveResult> => {
            const latest =
                queryClient.getQueryData<Card[]>(queryKeys.cards(boardId))?.find((c) => c.id === card.id)?.version ??
                version;
            const base = latest > version && !changedByOthers(version, latest) ? latest : version;
            try {
                const updated = await api.cards.update(card.id, { version: base, ...fields });
                ownVersions.current.add(updated.version);
                setCards((list) => upsert(list, updated));
                return 'ok';
            } catch (err) {
                if (isStatus(err, 409)) {
                    toast.error(t.card.conflict);
                    try {
                        const fresh = await api.cards.get(card.id);
                        setCards((list) => upsert(list, fresh));
                    } catch {
                    }
                    return 'conflict';
                }
                toast.error(errorText(err, t));
                return 'error';
            }
        };
        const result = queue.current.then(run);
        queue.current = result;
        return result;
    };

    // Deletes the card and closes the panel.
    // TR: Kartı siler ve paneli kapatır.
    async function deleteCard() {
        try {
            await api.cards.remove(card.id);
            setCards((list) => removeWhere(list, (c) => c.id === card.id));
            toast.success(t.card.deleted);
            onClose();
        } catch (err) {
            toast.error(errorText(err, t));
            throw err;
        }
    }

    return (
        <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-zinc-950/30 motion-safe:animate-fade" onClick={onClose} aria-hidden />
            <aside
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-surface shadow-[-24px_0_64px_-24px_rgb(0_0_0/0.35)] focus-visible:outline-none motion-safe:animate-panel"
            >
                <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                    <span className="truncate rounded-md bg-sunken px-2 py-1 text-xs font-medium text-muted">
                        {t.card.inColumn(columnName)}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                        {isOwner && (
                            <IconButton label={t.card.deleteCard} onClick={() => setConfirmDelete(true)}>
                                <TrashIcon size={18} />
                            </IconButton>
                        )}
                        <IconButton label={t.common.close} onClick={onClose}>
                            <XIcon size={18} />
                        </IconButton>
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-5 pt-5 pb-10">
                    <div className="flex flex-col gap-5">
                        <TitleField id={titleId} card={card} onSave={save} />
                        <CardProperties card={card} members={members} onSave={save} />
                    </div>

                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold">{t.card.description}</h3>
                        <DescriptionField card={card} onSave={save} changedByOthers={changedByOthers} />
                    </section>

                    <CardTime card={card} isOwner={isOwner} />
                    <CardNotes card={card} isOwner={isOwner} />

                    <p className="mt-auto text-xs text-muted">
                        {t.card.createdOn(formatDate(card.created_at, language))}
                        <span className="mx-2" aria-hidden>
                            ·
                        </span>
                        {t.card.updatedOn(formatDate(card.updated_at, language))}
                    </p>
                </div>
            </aside>

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title={t.card.deleteTitle}
                description={t.card.deleteBody}
                confirmLabel={t.common.delete}
                onConfirm={deleteCard}
            />
        </div>
    );
}
