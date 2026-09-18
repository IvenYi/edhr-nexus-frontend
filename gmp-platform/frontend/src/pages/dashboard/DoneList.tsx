import { useAuthStore } from '@/stores/authStore';
import DashboardTaskList from './DashboardTaskList';

export default function DoneList() {
  const assigneeId = useAuthStore((state) => state.user?.id);
  return <DashboardTaskList key={assigneeId} kind="done" assigneeId={assigneeId} />;
}
