import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';
import type { EdhrActionMeta, EdhrPageMeta, EdhrRecord } from '../../types';
import PermissionButton from '../PermissionButton';

interface ExecutionPanelProps {
  page: EdhrPageMeta;
  records: EdhrRecord[];
  actions: EdhrActionMeta[];
  onAction: (action: EdhrActionMeta, record: EdhrRecord) => void;
}

const quickActionCodes = new Set(['process', 'finish', 'execution_detail', 'fill', 'inspect']);

export default function ExecutionPanel({ page, records, actions, onAction }: ExecutionPanelProps) {
  const currentRecord = records.find((record) => record.status.includes('处理') || record.status.includes('执行')) ?? records[0];
  const doneCount = records.filter((record) => record.status.includes('完成') || record.status.includes('放行')).length;
  const progress = records.length === 0 ? 0 : Math.round((doneCount / records.length) * 100);
  const quickActions = actions.filter((action) => quickActionCodes.has(action.code)).slice(0, 5);

  if (!currentRecord) return null;

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#fff' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
        <TextField
          size="small"
          label="扫码"
          placeholder="扫描批次、SN 或工序条码"
          InputProps={{ startAdornment: <QrCodeScanner fontSize="small" color="action" sx={{ mr: 1 }} /> }}
          sx={{ minWidth: { md: 260 } }}
        />
        <Box sx={{ minWidth: 220, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>当前工序</Typography>
            <Chip size="small" label={currentRecord.status} color="info" variant="outlined" />
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap>
            {page.title} · {currentRecord.id}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">执行进度</Typography>
            <Typography variant="caption" color="text.secondary">{progress}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {quickActions.map((action) => (
            <PermissionButton
              key={action.id}
              action={action}
              compact
              onClick={() => onAction(action, currentRecord)}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
