import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { EdhrPageMeta, EdhrRecord } from '../../types';

interface DashboardPanelProps {
  page: EdhrPageMeta;
  records: EdhrRecord[];
}

export default function DashboardPanel({ page, records }: DashboardPanelProps) {
  const todoRecords = records.filter((record) => record.status.includes('待') || record.status.includes('草稿'));
  const doneRecords = records.filter((record) => record.status.includes('完成') || record.status.includes('启用'));
  const runningRecords = records.filter((record) => record.status.includes('处理') || record.status.includes('执行'));
  const trendGroups = [todoRecords.length, runningRecords.length, doneRecords.length];
  const maxTrendValue = Math.max(1, ...trendGroups);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#fff' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ minWidth: 180 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>KPI</Typography>
          <Stack direction="row" spacing={1}>
            <Metric label="总数" value={records.length} />
            <Metric label="完成" value={doneRecords.length} />
            <Metric label="运行" value={runningRecords.length} />
          </Stack>
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>待办</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>{todoRecords.length}</Typography>
          <Typography variant="caption" color="text.secondary">{page.title} 当前待处理记录</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>趋势</Typography>
          {['待办', '运行', '完成'].map((label, index) => (
            <Stack key={label} direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ width: 36 }}>{label}</Typography>
              <LinearProgress
                variant="determinate"
                value={(trendGroups[index] / maxTrendValue) * 100}
                sx={{ flex: 1, height: 7, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ width: 28, textAlign: 'right' }}>
                {trendGroups[index]}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ px: 1.25, py: 1, border: '1px solid #e4e7ed', borderRadius: 1, minWidth: 70 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
