import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Drawer, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import StatusBadge from '@/components/StatusBadge';
import { getDhrInstance, getDhrSummaryDetail, type DhrInstanceDetail } from '@/api/dhr-instances';
import { getDhrFillingDetail, getDhrReviewTask, type DhrReviewTask } from '@/api/dhr-workbenches';
import DhrAuditTrail, { type DhrDetailSource } from './DhrAuditTrail';
import { dhrDateTime } from './dhrAuditPresentation';
import { dhrObjectTypeLabel, dhrProductionStatusMeta, dhrStatusMeta } from './dhrListPresentation';

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
    <Typography variant="body2" sx={{ px: 1.5, py: 1, fontWeight: 600, color: '#303133', borderBottom: '1px solid #e4e7ed', bgcolor: '#f8fafc' }}>{title}</Typography>
    <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>{children}</Box>
  </Box>;
}
function DetailField({ label, value }: { label: string; value?: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" display="block" sx={{ mb: 0.35, color: '#909399' }}>{label}</Typography><Typography component="div" variant="body2" sx={{ color: '#303133', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{value === null || value === undefined || value === '' ? '—' : value}</Typography></Box>;
}

export default function DhrDetailDrawer({ source, id, dhrNo, onClose }: { source: DhrDetailSource; id: string; dhrNo: string; onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const query = useQuery<{ dhr: DhrInstanceDetail; task?: DhrReviewTask }>({
    queryKey: ['dhr-row-detail', source, id],
    queryFn: async () => source === 'review' ? getDhrReviewTask(id) : { dhr: await (source === 'filling' ? getDhrFillingDetail(id) : source === 'summary' ? getDhrSummaryDetail(id) : getDhrInstance(id)) },
    staleTime: 0, refetchOnMount: 'always',
  });
  const dhr = query.data?.dhr, task = query.data?.task;
  const status = dhr ? dhrStatusMeta(dhr.displayStatus) : null;
  const production = dhr ? dhrProductionStatusMeta(dhr.productionStatus) : null;
  const taskLabels: Record<string, string> = { PENDING: '待审批', PROCESSING: '待审批', COMPLETED: '已通过', REJECTED: '已退回', CANCELLED: '已取消' };
  return <Drawer anchor="right" open onClose={onClose} sx={{ top: 0, bottom: 0, zIndex: theme => theme.zIndex.drawer + 2, '& .MuiBackdrop-root': { top: 0 } }} slotProps={{ backdrop: { sx: { top: 0 } } }} PaperProps={{ role: 'dialog', 'aria-label': `DHR 详情 ${dhrNo}`, sx: { width: { xs: '100vw', sm: 560 }, maxWidth: '100vw', top: 0, bottom: 0, height: '100vh', transform: 'none !important' } }}>
    <Box sx={{ minHeight: '100%', overflow: 'auto', bgcolor: '#f7f9fc', p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>信息查看</Typography>
        <IconButton size="small" aria-label="关闭 DHR 详情" onClick={onClose}><CloseRounded fontSize="small" /></IconButton>
      </Stack>
      <Tabs value={tab} onChange={(_, next: number) => setTab(next)} aria-label="DHR 详情页签" sx={{ borderBottom: '1px solid #e4e7ed' }}><Tab label="数据信息" /><Tab label="数据审计" /></Tabs>
      <Box sx={{ mt: 2 }}>
      {tab === 1 ? <DhrAuditTrail source={source} id={id} /> : query.isFetching ? <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress size={24} aria-label="加载 DHR 详情" /></Box>
        : query.isError ? <Alert severity="error" action={<Button color="inherit" onClick={() => void query.refetch()}>重试</Button>}>DHR 详情加载失败，请重试。</Alert>
          : dhr && <Stack spacing={2}>
            <DetailSection title="DHR 信息">
              <DetailField label="DHR 编号" value={dhr.dhrNo} />
              <DetailField label="DHR 状态" value={status && <StatusBadge label={status.label} color={status.color} />} />
              <DetailField label="批记录模板" value={dhr.dhrTemplateName} /><DetailField label="模板版本" value={dhr.dhrTemplateVersion} />
              <DetailField label="汇总审批方式" value={dhr.dhrReviewMode === 'REQUIRED' ? '需要汇总审批' : '不另启汇总审批'} />
              <DetailField label="建立时间" value={dhrDateTime(dhr.createdAt)} />
              <DetailField label="生产完成时间" value={dhrDateTime(dhr.completedAt)} /><DetailField label="更新时间" value={dhrDateTime(dhr.updatedAt)} />
            </DetailSection>
            <DetailSection title="生产来源">
              <DetailField label="生产对象" value={`${dhr.objectNo} · ${dhrObjectTypeLabel[dhr.objectType]}`} /><DetailField label="生产状态" value={production && <StatusBadge label={production.label} color={production.color} />} />
              <DetailField label="工单编号" value={dhr.workOrderNo} /><DetailField label="产品名称" value={dhr.productName} />
              <DetailField label="产品编码" value={dhr.productCode} /><DetailField label="制程版本" value={dhr.processVersion} />
              <DetailField label="工艺路线" value={dhr.routeName} /><DetailField label="路线版本" value={dhr.routeVersion} />
            </DetailSection>
            {dhr.status === 'EARLY_TERMINATED' && <DetailSection title="终止信息"><DetailField label="终止原因" value={dhr.terminationReason} /><DetailField label="终止时间" value={dhrDateTime(dhr.terminationAt)} /><DetailField label="终止人" value={dhr.terminatedBy} /></DetailSection>}
            {task && <DetailSection title="当前审批任务">
              <DetailField label="汇总版本" value={`V${task.versionNo}`} /><DetailField label="审批节点" value={task.nodeName} />
              <DetailField label="处理状态" value={taskLabels[task.status] || '未知状态'} /><DetailField label="提交人" value={task.submittedBy} />
              <DetailField label="提交时间" value={dhrDateTime(task.submittedAt)} /><DetailField label="处理时间" value={dhrDateTime(task.completedAt)} />
              <DetailField label="审批意见" value={task.opinion} />
            </DetailSection>}
          </Stack>}
      </Box>
    </Box>
  </Drawer>;
}
