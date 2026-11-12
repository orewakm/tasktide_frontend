import { Suspense } from 'react';
import { TasksScreen } from '@/components/tasks/TasksScreen';

// The filters are read from the URL with useSearchParams, which has to happen inside <Suspense>.
// TR: Filtreler URL'den useSearchParams ile okunur; bu da <Suspense> içinde olmalıdır.
export default function TasksPage() {
    return (
        <Suspense>
            <TasksScreen />
        </Suspense>
    );
}
