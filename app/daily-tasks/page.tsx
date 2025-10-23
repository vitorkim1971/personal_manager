import MainLayout from '@/components/layout/MainLayout';
import DailyTasks from '@/components/DailyTasks';

export default function DailyTasksPage() {
  return (
    <MainLayout title="매일할일">
      <DailyTasks />
    </MainLayout>
  );
}
