import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    body: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong px-6 py-10 sm:px-10">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">{icon}</span>
            <div className="flex max-w-[48ch] flex-col gap-1">
                <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                <p className="text-sm leading-relaxed text-muted">{body}</p>
            </div>
            {action}
        </div>
    );
}
