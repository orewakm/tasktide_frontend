'use client';

import { useLanguage } from '@/i18n/useLanguage';

export const STATS_RANGES = [7, 30, 90] as const;

interface RangePickerProps {
    value: number;
    onChange: (days: number) => void;
}

// The "7 / 30 / 90 days" switch above the stats.
// TR: İstatistiklerin üstündeki "7 / 30 / 90 gün" seçici.
export function RangePicker({ value, onChange }: RangePickerProps) {
    const { t } = useLanguage();

    return (
        <div
            role="radiogroup"
            aria-label={t.stats.range}
            className="inline-flex h-9 w-fit items-center rounded-lg border border-line bg-sunken p-0.5"
        >
            {STATS_RANGES.map((days) => {
                const selected = days === value;
                return (
                    <button
                        key={days}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(days)}
                        className={`h-full rounded-md px-3 text-[13px] font-medium transition-colors ${
                            selected ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                        }`}
                    >
                        {t.stats.lastDays(days)}
                    </button>
                );
            })}
        </div>
    );
}
