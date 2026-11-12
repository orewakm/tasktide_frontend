import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const VARIANTS: Record<Variant, string> = {
    primary:
        'bg-accent text-on-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] hover:bg-accent-hover',
    secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-sunken',
    ghost: 'text-muted hover:bg-sunken hover:text-ink',
    danger: 'bg-danger text-on-danger hover:bg-danger/90',
};

const SIZES: Record<Size, string> = {
    sm: 'h-8 gap-1.5 px-3 text-[13px]',
    md: 'h-10 gap-2 px-4 text-sm',
    lg: 'h-12 gap-2 px-5 text-[15px]',
};

// Also used to make a <Link> look like a button.
// TR: Bir <Link>'i buton gibi göstermek için de kullanılır.
export function buttonClass(variant: Variant = 'primary', size: Size = 'md'): string {
    return `inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]}`;
}

export function Button({
    variant = 'primary',
    size = 'md',
    type = 'button',
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button type={type} {...props} className={`${buttonClass(variant, size)} ${className}`} />
    );
}
