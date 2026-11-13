import { Suspense } from 'react';
import { BoardStatsScreen } from '@/components/stats/BoardStatsScreen';
import { StatsSkeleton } from '@/components/stats/StatsSkeleton';

// Shows the stats of the board whose id is in the URL.
// TR: URL'deki kimliğe ait panonun istatistiklerini gösterir.
export default function BoardStatsPage({ params }: PageProps<'/boards/[id]/stats'>) {
    return (
        <Suspense
            fallback={
                <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                    <StatsSkeleton />
                </main>
            }
        >
            {params.then(({ id }) => (
                <BoardStatsScreen boardId={id} />
            ))}
        </Suspense>
    );
}
