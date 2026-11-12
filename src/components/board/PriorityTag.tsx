import { CellSignalHighIcon, CellSignalLowIcon, CellSignalMediumIcon } from '@phosphor-icons/react';
import { useLanguage } from '@/i18n/useLanguage';
import type { Priority } from '@/interfaces';

// className colors the icon and text; pill is the tinted background on cards.
// TR: className ikon ve yazıyı renklendirir; pill kartlardaki renkli arka plandır.
const STYLES: Record<Priority, { icon: typeof CellSignalLowIcon; className: string; pill: string }> = {
    low: { icon: CellSignalLowIcon, className: 'text-muted', pill: 'bg-sunken' },
    medium: { icon: CellSignalMediumIcon, className: 'text-warn', pill: 'bg-warn/12' },
    high: { icon: CellSignalHighIcon, className: 'text-danger', pill: 'bg-danger/10' },
};

export function PriorityTag({ priority }: { priority: Priority }) {
    const { t } = useLanguage();
    const { icon: Icon, className, pill } = STYLES[priority];

    return (
        <span
            className={`inline-flex h-5 items-center gap-1 rounded-full pr-2 pl-1.5 text-[11px] font-semibold ${className} ${pill}`}
        >
            <Icon size={13} weight="bold" />
            {t.card.priorities[priority]}
        </span>
    );
}

export { STYLES as PRIORITY_STYLES };
