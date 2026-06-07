import {
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { EdhrActionMeta, EdhrPageMeta, EdhrRecord } from '../../types';
import PermissionButton from '../PermissionButton';

interface ApprovalPanelProps {
  page: EdhrPageMeta;
  records: EdhrRecord[];
  actions: EdhrActionMeta[];
  onAction: (action: EdhrActionMeta, record: EdhrRecord) => void;
}

export default function ApprovalPanel({ page, records, actions, onAction }: ApprovalPanelProps) {
  const approveAction = actions.find((action) => action.code === 'approve');
  const rejectAction = actions.find((action) => action.code === 'reject');
  const queue = records.filter((record) => !record.status.includes('完成') && !record.status.includes('驳回')).slice(0, 4);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#fff' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>审批队列</Typography>
        <Chip size="small" label={`${queue.length} 待处理`} color="warning" variant="outlined" />
        <Typography variant="caption" color="text.secondary">
          {page.title} 支持通过或驳回，操作后进入审计与状态历史。
        </Typography>
      </Stack>
      <List dense disablePadding>
        {queue.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>暂无待审批记录</Typography>
        ) : (
          queue.map((record) => (
            <ListItem
              key={record.id}
              sx={{ px: 0, borderTop: '1px solid #eef0f3' }}
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  {approveAction ? <PermissionButton compact action={approveAction} onClick={() => onAction(approveAction, record)} /> : null}
                  {rejectAction ? <PermissionButton compact action={rejectAction} onClick={() => onAction(rejectAction, record)} /> : null}
                </Stack>
              }
            >
              <ListItemText
                primary={record.id}
                secondary={`${record.status} · ${record.updatedBy} · ${formatDateTime(record.updatedAt)}`}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}
