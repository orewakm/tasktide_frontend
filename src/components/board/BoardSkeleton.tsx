import { Skeleton } from '@/components/ui/Skeleton';

// Shows a placeholder board while the board loads.
// TR: Pano yüklenirken yer tutucu bir pano gösterir.
export function BoardSkeleton() {
    return (
        <div className="flex h-[calc(100dvh-57px)] flex-col" aria-busy="true">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-44" />
                <Skeleton className="ml-auto h-8 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-3 overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
                {[3, 2, 1].map((count, i) => (
                    <div
                        key={i}
                        className="flex w-[18rem] shrink-0 flex-col gap-2 rounded-xl bg-sunken p-2 ring-1 ring-line/60 motion-safe:animate-pulse"
                    >
                        <div className="m-1.5 h-4 w-24 rounded bg-line" />
                        {Array.from({ length: count }, (_, j) => (
                            <div key={j} className="h-[4.5rem] rounded-lg border border-line bg-surface" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
