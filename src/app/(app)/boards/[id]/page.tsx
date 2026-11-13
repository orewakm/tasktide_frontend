import { Suspense } from 'react';
import { BoardScreen } from '@/components/board/BoardScreen';
import { BoardSkeleton } from '@/components/board/BoardSkeleton';

// Shows the board whose id is in the URL.
// TR: URL'deki kimliğe ait panoyu gösterir.
export default function BoardPage({ params }: PageProps<'/boards/[id]'>) {
    return (
        <Suspense fallback={<BoardSkeleton />}>
            {params.then(({ id }) => (
                <BoardScreen boardId={id} />
            ))}
        </Suspense>
    );
}
