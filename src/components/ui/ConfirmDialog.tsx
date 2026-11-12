'use client';

import { useState, type ReactNode } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { Button } from './Button';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    // Should resolve when done. If it throws, the dialog stays open so the user can retry.
    onConfirm: () => Promise<void>;
}

export function ConfirmDialog({ open, onClose, title, description, confirmLabel, onConfirm }: ConfirmDialogProps) {
    const { t } = useLanguage();
    const [busy, setBusy] = useState(false);

    async function confirm() {
        setBusy(true);
        try {
            await onConfirm();
            onClose();
        } catch {
            // The caller already showed the error.
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title={title} description={description}>
            <div className="flex justify-end gap-2 pt-1">
                <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
                    {t.common.cancel}
                </Button>
                <Button variant="danger" size="sm" onClick={confirm} disabled={busy}>
                    {confirmLabel}
                </Button>
            </div>
        </Dialog>
    );
}
