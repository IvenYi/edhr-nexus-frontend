import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import type { EdhrActionMeta, EdhrPageMeta } from '../types';
import { getDisplayActionsForPage } from '../utils/actionPolicy';
import PermissionButton from './PermissionButton';

interface EdhrToolbarProps {
  page: EdhrPageMeta;
  actions: EdhrActionMeta[];
  total: number;
  loading?: boolean;
  onAction: (action: EdhrActionMeta) => void;
}

const typeLabels: Record<EdhrPageMeta['type'], string> = {
  master: '主数据',
  list: '清单',
  report: '报表',
  transaction: '事务',
  execution: '执行',
  approval: '审批',
  dashboard: '看板',
};

const toolbarActionCodes = new Set([
  'query',
  'reset',
  'create',
  'add',
  'import',
  'export',
  'download',
  'batch_download',
  'print',
  'configure',
  'create_dataset',
  'create_report',
]);

export default function EdhrToolbar({ page, actions, total, loading = false, onAction }: EdhrToolbarProps) {
  const displayActions = actions.length > 0 ? actions : getDisplayActionsForPage(page);
  const toolbarActions = displayActions.filter((action) => toolbarActionCodes.has(action.code)).slice(0, 8);
  const statusSummary = Array.from(new Set([...page.baseStatuses, ...page.businessStatuses])).slice(0, 4);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#fff' }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', lg: 'center' }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#303133' }}>
              {page.title}
            </Typography>
            <Chip size="small" label={typeLabels[page.type]} color="primary" variant="outlined" />
            <Chip size="small" label={page.module} />
            <Chip size="small" label={page.group} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              共 {total} 条记录
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="caption" color="text.secondary">
              状态
            </Typography>
            {statusSummary.length === 0 ? (
              <Chip size="small" label="默认状态" variant="outlined" />
            ) : (
              statusSummary.map((status) => (
                <Chip size="small" label={status} variant="outlined" key={status} />
              ))
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', lg: 'flex-end' }} flexWrap="wrap" useFlexGap>
          {toolbarActions.map((action) => (
            <PermissionButton
              key={action.id}
              action={action}
              disabled={loading}
              onClick={() => onAction(action)}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
