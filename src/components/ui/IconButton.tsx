import type { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    // Read out by screen readers and shown as a tooltip, since the button has no text.
    label: string;
    size?: 'sm' | 'md';
}

export function IconButton({ label, size = 'md', className = '', type = 'button', ...props }: IconButtonProps) {
    return (
        <button
            type={type}
            aria-label={label}
            title={label}
            {...props}
            className={`inline-flex shrink-0 items-center justify-center rounded-lg text-muted transition-[background-color,color,transform] duration-150 hover:bg-sunken hover:text-ink active:scale-[0.94] disabled:pointer-events-none disabled:opacity-50 ${
                size === 'sm' ? 'size-7' : 'size-9'
            } ${className}`}
        />
    );
}
