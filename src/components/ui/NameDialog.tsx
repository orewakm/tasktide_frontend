'use client';

import { useState, type SubmitEvent } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { errorText } from '@/lib/errors';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { TextField } from './TextField';

interface NameDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    label: string;
    submitLabel: string;
    initialName?: string;
    maxLength?: number;
    // Throws to keep the dialog open and show the error.
    onSubmit: (name: string) => Promise<void>;
}

// A dialog with one name field. Used to create and rename boards and columns.
// TR: Tek bir isim alanı olan diyalog. Pano ve sütun oluşturmak ve yeniden adlandırmak için kullanılır.
export function NameDialog({ open, onClose, title, ...formProps }: NameDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} title={title}>
            <NameForm onClose={onClose} {...formProps} />
        </Dialog>
    );
}

// A separate component so its state starts fresh every time the dialog opens.
function NameForm({
    onClose,
    label,
    submitLabel,
    initialName = '',
    maxLength = 100,
    onSubmit,
}: Omit<NameDialogProps, 'open' | 'title'>) {
    const { t } = useLanguage();
    const [name, setName] = useState(initialName);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        setBusy(true);
        setError(null);
        try {
            await onSubmit(trimmed);
            onClose();
        } catch (err) {
            setError(errorText(err, t));
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
                label={label}
                autoFocus
                required
                maxLength={maxLength}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={error ?? undefined}
            />
            <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
                    {t.common.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={busy || !name.trim()}>
                    {busy ? t.common.saving : submitLabel}
                </Button>
            </div>
        </form>
    );
}
