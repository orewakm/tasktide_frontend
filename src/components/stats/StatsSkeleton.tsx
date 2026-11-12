import { Skeleton } from '@/components/ui/Skeleton';

// Placeholder with the same shape as a stats page: totals, the daily chart, two lists.
// TR: Bir istatistik sayfasıyla aynı şekle sahip yer tutucu: toplamlar, günlük grafik, iki liste.
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
