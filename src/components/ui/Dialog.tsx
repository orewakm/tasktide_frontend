'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    // Narrow confirm dialogs vs. wider content dialogs.
    width?: 'sm' | 'md';
}

// Uses the browser's own <dialog> element: it traps focus, closes on Escape and
// blocks the page behind it, without any extra library.
// TR: Tarayıcının kendi <dialog> elementini kullanır: odağı içeride tutar, Escape ile kapanır
// TR: ve arkadaki sayfayı engeller; ek bir kütüphaneye gerek kalmaz.
export function Dialog({ open, onClose, title, description, children, width = 'sm' }: DialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            // A click on the dialog element itself (not its content) is a click on the backdrop.
            onClick={(event) => {
                if (event.target === ref.current) onClose();
            }}
            className={`m-auto w-[calc(100%-2rem)] rounded-xl border border-line bg-surface p-0 text-ink shadow-[0_24px_64px_-16px_rgb(0_0_0/0.35)] backdrop:bg-zinc-950/45 motion-safe:animate-rise ${
                width === 'sm' ? 'max-w-sm' : 'max-w-lg'
            }`}
        >
            {open && (
                <div className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                        {description && <div className="text-sm leading-relaxed text-muted">{description}</div>}
                    </div>
                    {children}
                </div>
            )}
        </dialog>
    );
}
