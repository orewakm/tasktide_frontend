'use client';

import { PlusIcon } from '@phosphor-icons/react';
import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import { errorText } from '@/lib/errors';

interface InlineAddProps {
    buttonLabel: string;
    inputLabel: string;
    maxLength: number;
    onAdd: (text: string) => Promise<void>;
    variant?: 'card' | 'column';
}

// Shows an add button that turns into a one-line form.
// TR: Tek satırlık bir forma dönüşen bir ekleme butonu gösterir.
export function InlineAdd({ buttonLabel, inputLabel, maxLength, onAdd, variant = 'card' }: InlineAddProps) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    // Adds the typed item and keeps the form open for the next one.
    // TR: Yazılan öğeyi ekler ve formu bir sonraki için açık tutar.
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        setBusy(true);
        try {
            await onAdd(trimmed);
            setText('');
        } catch (err) {
            toast.error(errorText(err, t));
        } finally {
            setBusy(false);
        }
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={
                    variant === 'card'
                        ? 'flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-surface hover:text-ink'
                        : 'flex h-11 w-full items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 text-[13px] font-medium text-muted transition-colors hover:border-accent hover:text-accent-ink'
                }
            >
                <PlusIcon size={15} weight="bold" />
                {buttonLabel}
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-2 ${variant === 'column' ? 'rounded-xl bg-sunken p-2' : ''}`}
        >
            <input
                autoFocus
                aria-label={inputLabel}
                placeholder={inputLabel}
                maxLength={maxLength}
                value={text}
                disabled={busy}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setOpen(false);
                        setText('');
                    }
                }}
                className={`${inputClass} h-9 border-line`}
            />
            <div className="flex gap-1.5">
                <Button type="submit" size="sm" disabled={busy || !text.trim()}>
                    {buttonLabel}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setOpen(false);
                        setText('');
                    }}
                >
                    {t.common.cancel}
                </Button>
            </div>
        </form>
    );
}
