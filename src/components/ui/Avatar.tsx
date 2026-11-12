import { initials } from '@/lib/format';

interface AvatarProps {
    name: string;
    size?: 'xs' | 'sm' | 'md';
    online?: boolean;
    className?: string;
}

const SIZES = {
    xs: 'size-5 text-[9px]',
    sm: 'size-6 text-[10px]',
    md: 'size-8 text-xs',
};

export function Avatar({ name, size = 'sm', online, className = '' }: AvatarProps) {
    return (
        <span
            title={name}
            className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-accent/20 font-semibold tracking-tight text-ink ring-2 ring-surface ${SIZES[size]} ${className}`}
        >
            {initials(name)}
            {online && (
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-online ring-2 ring-surface" />
            )}
        </span>
    );
}
