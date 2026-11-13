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
    onConfirm: () => Promise<void>;
}

// Shows a dialog that asks the user to confirm an action.
// TR: Kullanıcıdan bir işlemi onaylamasını isteyen bir pencere gösterir.
export function ConfirmDialog({ open, onClose, title, description, confirmLabel, onConfirm }: ConfirmDialogProps) {
    const { t } = useLanguage();
    const [busy, setBusy] = useState(false);

    // Runs the action and closes the dialog if it succeeds.
    // TR: İşlemi çalıştırır ve başarılı olursa pencereyi kapatır.
    async function confirm() {
        setBusy(true);
        try {
            await onConfirm();
            onClose();
        } catch {
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
