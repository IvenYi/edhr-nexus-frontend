import { useAuthStore } from '@/stores/authStore';
import DashboardTaskList from './DashboardTaskList';

export default function TodoList() {
  const assigneeId = useAuthStore((state) => state.user?.id);
  return <DashboardTaskList key={assigneeId} kind="todo" assigneeId={assigneeId} />;
}
