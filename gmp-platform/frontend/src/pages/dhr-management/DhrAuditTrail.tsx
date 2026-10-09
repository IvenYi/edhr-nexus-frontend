import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { getDhrSummaryAudit } from '@/api/dhr-instances';
import { getDhrFillingAudit, getDhrReviewAudit } from '@/api/dhr-workbenches';
import { dhrAuditActionLabel, dhrAuditEntityLabels, dhrAuditFields, dhrDateTime } from './dhrAuditPresentation';

export type DhrDetailSource = 'list' | 'filling' | 'summary' | 'review';

function Snapshot({ title, snapshot }: { title: string; snapshot: string | null }) {
  const fields = dhrAuditFields(snapshot);
  return <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#f8fafc', p: 1, minWidth: 0 }}>
    <Typography variant="caption" sx={{ fontWeight: 600 }}>{title}</Typography>
    <Stack spacing={1} sx={{ mt: 1 }}>{fields.length ? fields.map(field => <Box key={field.key}>
      <Typography variant="caption" color="text.secondary" display="block">{field.label}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{field.value}</Typography>
    </Box>) : <Typography variant="body2" color="text.secondary">无</Typography>}</Stack>
  </Box>;
}

export default function DhrAuditTrail({ source, id }: { source: DhrDetailSource; id: string }) {
  const [page, setPage] = useState(0);
  const query = useQuery({ queryKey: ['dhr-detail-audit', source, id, page],
    queryFn: () => source === 'review' ? getDhrReviewAudit(id, page) : source === 'filling' ? getDhrFillingAudit(id, page) : getDhrSummaryAudit(id, page),
    staleTime: 0, refetchOnMount: 'always' });
  return <Stack spacing={1.5}>
    <Typography variant="caption" color="text.secondary">{source === 'review'
      ? '当前审批版本的提交、审批及导出记录；不包含其他汇总版本。'
      : 'DHR 生命周期、目录整理、附件关联、汇总提交、审批及导出记录。'}生产表单的填报与签署日志请到来源实例查看。</Typography>
    {query.isFetching ? <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={24} aria-label="加载数据审计" /></Box>
      : query.isError ? <Alert severity="error" action={<Button color="inherit" onClick={() => void query.refetch()}>重试</Button>}>数据审计加载失败，请重试。</Alert>
        : !query.data?.events.length ? <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>暂无审计记录</Typography>
          : query.data.events.map(event => <Accordion key={event.id} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', '&::before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ px: 1.5, '& .MuiAccordionSummary-content': { minWidth: 0 } }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 0.5, width: '100%', pr: 1 }}>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{dhrAuditActionLabel(event)}</Typography>
                <Typography variant="caption" color="text.secondary">{dhrDateTime(event.at)}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ gridColumn: '1 / -1' }}>{event.operator || '系统'} · {dhrAuditEntityLabels[event.entityType] || 'DHR 记录'}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: 1.5 }}>
              {event.reason && <Typography variant="body2" sx={{ mb: 1, overflowWrap: 'anywhere' }}>原因 / 意见：{event.reason}</Typography>}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}><Snapshot title="变更前" snapshot={event.before} /><Snapshot title="变更后" snapshot={event.after} /></Box>
            </AccordionDetails>
          </Accordion>)}
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
      <Typography variant="caption" color="text.secondary">共 {query.data?.total ?? 0} 条 · 第 {page + 1} 页</Typography>
      <Stack direction="row"><Button disabled={page === 0 || query.isFetching} onClick={() => setPage(p => p - 1)}>上一页</Button><Button disabled={!query.data || query.isError || query.isFetching || (page + 1) * 50 >= query.data.total} onClick={() => setPage(p => p + 1)}>下一页</Button></Stack>
    </Stack>
  </Stack>;
}
