import { Skeleton } from '@/components/ui/Skeleton';

// Shows a placeholder stats page while the stats load.
// TR: İstatistikler yüklenirken yer tutucu bir istatistik sayfası gösterir.
export function StatsSkeleton() {
    return (
        <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-56 rounded-xl" />
                <Skeleton className="h-56 rounded-xl" />
            </div>
        </div>
    );
}
