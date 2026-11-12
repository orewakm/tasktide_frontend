import { WavesIcon } from '@phosphor-icons/react/ssr';

// The TaskTide mark: a wave icon in an accent tile, plus the wordmark.
// Uses the SSR icon build so it also works in Server Components.
// TR: TaskTide işareti: vurgu renginde bir kutu içinde dalga ikonu ve yazı.
// TR: SSR ikon sürümünü kullanır, böylece Server Component'lerde de çalışır.
export function Logo({ withText = true }: { withText?: boolean }) {
    return (
        <span className="inline-flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-on-accent">
                <WavesIcon size={17} weight="bold" />
            </span>
            {withText && <span className="text-[15px] font-semibold tracking-tight">TaskTide</span>}
        </span>
    );
}
