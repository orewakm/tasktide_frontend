import { WavesIcon } from '@phosphor-icons/react/ssr';

// Shows the TaskTide logo, with or without the name.
// TR: TaskTide logosunu, adıyla ya da adı olmadan gösterir.
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
