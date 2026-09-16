import { useEffect, useRef, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, DialogActions,
  DialogContent, DialogTitle, IconButton, Pagination, Stack, Tab, Tabs, Tooltip, Typography,
} from '@mui/material';
import { ArrowOutward, ContentCopyOutlined, ExpandMore, LinkOutlined, LockOutlined, Refresh } from '@mui/icons-material';
import AppDialog from './AppDialog';
import { DELETION_BLOCKED_EVENT, type DeletionImpact } from '@/api/deletionProtection';
import { useSnackbar } from './SnackbarProvider';
import { checkDeletion } from '@/api/deletionCheck';

const statusLabels: Record<string, string> = {
  ACTIVE: '生效', INACTIVE: '失效', DRAFT: '草稿', PUBLISHED: '已发布', CREATED: '已创建',
  IN_PROGRESS: '进行中', COMPLETED: '已完成', CANCELLED: '已取消', TERMINATED: '已终止',
  SAVED: '已保存', SUBMITTED: '已提交', APPROVED: '已批准',
};

const referenceTypes = { BUSINESS: '业务关联', RETAINED: '保留记录', ORPHAN: '异常关联' } as const;
type ReferenceType = keyof typeof referenceTypes;

function ReferenceGroup({ group, expanded }: { group: DeletionImpact['groups'][number]; expanded: boolean }) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [group.records]);
  const { showMessage } = useSnackbar();
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); showMessage('编号已复制', 'success'); }
    catch { showMessage('复制失败，请手动选择编号复制', 'error'); }
  };
  return (
    <Accordion defaultExpanded={expanded} disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px !important', '&:before': { display: 'none' }, overflow: 'hidden' }}>
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 44, bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <LinkOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography fontWeight={600}>{group.label}</Typography>
          <Chip label={`${group.count} 条`} size="small" sx={{ height: 22, bgcolor: 'white', border: 1, borderColor: 'divider' }} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ px: 2, py: 1, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">{group.module}</Typography>
            {group.path && <Button component="a" href={group.path} target="_blank" rel="noopener noreferrer" size="small" endIcon={<ArrowOutward sx={{ fontSize: '14px !important' }} />} sx={{ flexShrink: 0 }}>查看模块</Button>}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{group.guidance}</Typography>
        </Box>
        {group.records.slice((page - 1) * 3, page * 3).map((record) => (
          <Box key={record.id} sx={{ px: 2, py: 1, '& + &': { borderTop: 1, borderColor: 'divider' } }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
              <Typography sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{record.name}</Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                <Chip label={group.dataType === 'ORPHAN' ? '异常遗留' : group.dataType === 'RETAINED' ? '生产留存' : '业务数据'} size="small" variant="outlined" sx={{ height: 22, fontSize: 12 }} />
                {record.status && <Chip label={statusLabels[record.status] || record.status} size="small" variant="outlined" sx={{ height: 22, fontSize: 12 }} />}
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere', userSelect: 'text' }}>{record.code ? `业务编号：${record.code}` : ''}{record.version ? ` · ${record.version}` : ''}</Typography>
              {record.code && <Tooltip title="复制业务编号"><IconButton aria-label={`复制${record.code}`} size="small" onClick={() => copy(record.code)}><ContentCopyOutlined sx={{ fontSize: 14 }} /></IconButton></Tooltip>}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>位置：{record.location || record.context || group.label}</Typography>
            {record.path ? <Button component="a" href={record.path} target="_blank" rel="noopener noreferrer" size="small" endIcon={<ArrowOutward />} sx={{ mt: 0.5 }}>{group.dataType === 'RETAINED' ? '查看记录' : '定位数据'}</Button>
              : <Typography variant="caption" color="text.secondary">{record.navigationHint || '该记录暂无直接定位页面，请联系管理员核对上述位置。'}</Typography>}
          </Box>
        ))}
        {group.records.length > 3 && <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">共 {group.count} 条关联</Typography>
          <Pagination count={Math.ceil(group.records.length / 3)} page={page} onChange={(_, value) => setPage(value)} size="small" getItemAriaLabel={(type, value) => type === 'page' ? `第 ${value} 页` : type === 'previous' ? '上一页' : '下一页'} />
        </Stack>}
      </AccordionDetails>
    </Accordion>
  );
}

export default function DeletionProtectionDialog() {
  const [impact, setImpact] = useState<DeletionImpact | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [referenceType, setReferenceType] = useState<ReferenceType>('BUSINESS');
  const refreshRequest = useRef<AbortController | null>(null);
  useEffect(() => {
    const listener = (event: Event) => {
      refreshRequest.current?.abort();
      setRefreshing(false); setRefreshError('');
      setReferenceType('BUSINESS');
      setImpact((event as CustomEvent<DeletionImpact>).detail);
    };
    window.addEventListener(DELETION_BLOCKED_EVENT, listener);
    return () => { refreshRequest.current?.abort(); window.removeEventListener(DELETION_BLOCKED_EVENT, listener); };
  }, []);
  const close = () => { refreshRequest.current?.abort(); setImpact(null); };
  const refresh = async () => {
    if (!impact) return;
    refreshRequest.current?.abort();
    const request = new AbortController();
    refreshRequest.current = request;
    setRefreshing(true); setRefreshError('');
    try {
      const result = await checkDeletion({ type: impact.targetType, id: impact.targetId }, request.signal);
      if (request.signal.aborted) return;
      if (result.allowed) setImpact({ ...impact, groups: [] });
      else if (result.impact) setImpact(result.impact);
      else setRefreshError('未能确认关联状态，请重试');
    } catch (error) {
      if (!request.signal.aborted) setRefreshError(error instanceof Error ? error.message : '刷新关联失败，请重试');
    } finally {
      if (!request.signal.aborted) setRefreshing(false);
    }
  };
  const counts = (Object.keys(referenceTypes) as ReferenceType[]).map((type) => ({
    type, count: impact?.groups.filter((group) => (group.dataType || 'BUSINESS') === type).reduce((sum, group) => sum + group.count, 0) || 0,
  }));
  const activeGroups = impact?.groups.filter((group) => (group.dataType || 'BUSINESS') === referenceType) || [];
  return (
    <AppDialog open={impact !== null} onClose={close} fullWidth maxWidth="sm" aria-labelledby="deletion-protection-title">
      <DialogTitle id="deletion-protection-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6 }}>
        <Box sx={{ display: 'flex', p: 1, borderRadius: '50%', bgcolor: '#fff7e6', color: '#ad6800' }}><LockOutlined fontSize="small" /></Box>
        {impact?.groups.length === 0 ? '关联已解除' : '暂不能删除'}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#fbfcfe', px: 3, py: 2 }}>
        {impact && <>
          <Alert severity={impact.groups.length ? 'warning' : 'success'} icon={false} sx={{ mb: 1.5 }}>
            {impact.groups.length ? `${counts.filter((entry) => entry.count > 0).map((entry) => `${referenceTypes[entry.type]} ${entry.count} 条`).join('，')}。当前暂不能删除。`
              : '已重新检查，目前没有阻断关联。关闭此弹窗后可重新点击删除，系统仍会执行最终校验。'}
          </Alert>
          {refreshError && <Alert severity="error" sx={{ mb: 2 }}>{refreshError}</Alert>}
          {impact.groups.length > 0 && <>
            <Tabs value={referenceType} onChange={(_, value: ReferenceType) => setReferenceType(value)} variant="fullWidth" aria-label="关联数据类型" sx={{ mb: 1.5, minHeight: 40, borderBottom: 1, borderColor: 'divider' }}>
              {counts.map(({ type, count }) => <Tab key={type} value={type} label={`${referenceTypes[type]} ${count}`} sx={{ minHeight: 40, px: 1 }} />)}
            </Tabs>
            <Stack spacing={1.5}>{activeGroups.map((group, index) => <ReferenceGroup key={`${impact.targetId}:${group.key}`} group={group} expanded={index === 0} />)}</Stack>
            {activeGroups.length === 0 && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无{referenceTypes[referenceType]}。其他分类中的阻断原因仍需处理。</Typography>}
          </>}
        </>}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">处理后点击“刷新关联”，无需刷新页面。</Typography>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => void refresh()} disabled={refreshing || !impact?.targetId}>{refreshing ? '刷新中…' : '刷新关联'}</Button>
          <Button variant="contained" onClick={close} autoFocus>关闭</Button>
        </Stack>
      </DialogActions>
    </AppDialog>
  );
}
