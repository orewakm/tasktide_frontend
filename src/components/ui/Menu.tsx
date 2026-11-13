'use client';

import { DotsThreeIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconButton } from './IconButton';

export interface MenuItem {
    label: string;
    icon?: ReactNode;
    onSelect: () => void;
    danger?: boolean;
}

interface MenuProps {
    label: string;
    items: MenuItem[];
    align?: 'start' | 'end';
    size?: 'sm' | 'md';
}

// Shows a small dropdown menu of actions.
// TR: Küçük bir eylem açılır menüsü gösterir.
export function Menu({ label, items, align = 'end', size = 'sm' }: MenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        // Closes the menu when the user clicks outside it.
        // TR: Kullanıcı menünün dışına tıklayınca menüyü kapatır.
        function onPointerDown(event: PointerEvent) {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        }

        // Closes the menu when Escape is pressed.
        // TR: Escape tuşuna basılınca menüyü kapatır.
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setOpen(false);
        }
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    if (items.length === 0) return null;

    return (
        <div ref={ref} className="relative">
            <IconButton
                label={label}
                size={size}
                aria-haspopup="menu"
                aria-expanded={open}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation();
                    setOpen((value) => !value);
                }}
            >
                <DotsThreeIcon size={18} weight="bold" />
            </IconButton>
            {open && (
                <div
                    role="menu"
                    className={`absolute top-full z-30 mt-1 min-w-44 motion-safe:animate-rise rounded-lg border border-line bg-surface p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.3)] ${
                        align === 'end' ? 'right-0' : 'left-0'
                    }`}
                >
                    {items.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            role="menuitem"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                                event.stopPropagation();
                                setOpen(false);
                                item.onSelect();
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-sunken ${
                                item.danger ? 'text-danger' : 'text-ink'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
