import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { EdhrActionMeta, EdhrPageMeta, EdhrRecord } from '../../types';
import PermissionButton from '../PermissionButton';

interface ReportPanelProps {
  page: EdhrPageMeta;
  records: EdhrRecord[];
  actions: EdhrActionMeta[];
  onAction: (action: EdhrActionMeta, record: EdhrRecord) => void;
}

export default function ReportPanel({ page, records, actions, onAction }: ReportPanelProps) {
  const exportAction = actions.find((action) => action.code === 'export' || action.code.endsWith('_export'));
  const downloadAction = actions.find((action) => action.code === 'download' || action.code.endsWith('_download'));
  const sampleRecord = records[0];
  const completeCount = records.filter((record) => record.status.includes('完成') || record.status.includes('启用')).length;
  const activeOperators = new Set(records.map((record) => record.updatedBy)).size;
  const completionRate = records.length === 0 ? 0 : Math.round((completeCount / records.length) * 100);
  const metrics = [
    { label: '记录数', value: records.length },
    { label: '完成率', value: `${completionRate}%` },
    { label: '操作人', value: activeOperators },
    { label: '页面类型', value: page.type },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#fff' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>指标摘要</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {metrics.map((metric) => (
              <Chip key={metric.label} size="small" label={`${metric.label}: ${metric.value}`} variant="outlined" />
            ))}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {exportAction && sampleRecord ? (
            <PermissionButton action={exportAction} onClick={() => onAction(exportAction, sampleRecord)} />
          ) : null}
          {downloadAction && sampleRecord ? (
            <PermissionButton action={downloadAction} onClick={() => onAction(downloadAction, sampleRecord)} />
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
