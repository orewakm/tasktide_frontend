import { Suspense } from 'react';
import { BoardScreen } from '@/components/board/BoardScreen';
import { BoardSkeleton } from '@/components/board/BoardSkeleton';

// The board id comes from the URL. With cacheComponents on, reading params has to happen
// inside <Suspense>, so the skeleton shows while it resolves.
// TR: Pano id'si URL'den gelir. cacheComponents açıkken params okuma işlemi <Suspense>
// TR: içinde yapılmalıdır; böylece çözülürken iskelet görünür.
export default function BoardPage({ params }: PageProps<'/boards/[id]'>) {
    return (
        <Suspense fallback={<BoardSkeleton />}>
            {params.then(({ id }) => (
                <BoardScreen boardId={id} />
            ))}
        </Suspense>
    );
}
