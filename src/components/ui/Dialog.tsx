'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    width?: 'sm' | 'md';
}

// Shows a modal dialog with the browser's dialog element.
// TR: Tarayıcının dialog öğesiyle modal bir pencere gösterir.
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
