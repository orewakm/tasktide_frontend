import { Suspense } from 'react';
import { TasksScreen } from '@/components/tasks/TasksScreen';

// Shows the task list page.
// TR: Görev listesi sayfasını gösterir.
export default function TasksPage() {
    return (
        <Suspense>
            <TasksScreen />
        </Suspense>
    );
}
