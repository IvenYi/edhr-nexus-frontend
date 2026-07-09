import { Chip } from '@mui/material';
import {
  WORKFLOW_STATUS_MAP, INSTANCE_STATUS_MAP, TASK_STATUS_MAP,
  USER_STATUS_MAP, AUDIT_ACTION_MAP,
} from '@/utils/constants';

type StatusMap = Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' }>;

const STATUS_MAPS: Record<string, StatusMap> = {
  workflow: WORKFLOW_STATUS_MAP,
  instance: INSTANCE_STATUS_MAP,
  task: TASK_STATUS_MAP,
  user: USER_STATUS_MAP,
  audit: AUDIT_ACTION_MAP,
};

interface StatusBadgeProps {
  status: string;
  type?: 'workflow' | 'instance' | 'task' | 'user' | 'audit';
}

export default function StatusBadge({ status, type = 'workflow' }: StatusBadgeProps) {
  const map = STATUS_MAPS[type] || WORKFLOW_STATUS_MAP;
  const config = map[status] || { label: status, color: 'default' as const };
  return <Chip size="small" label={config.label} color={config.color} />;
}
