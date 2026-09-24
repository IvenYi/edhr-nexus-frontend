import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { ArticleOutlined, FolderOutlined, PreviewOutlined, RestartAlt, Search } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import StatusBadge from '@/components/StatusBadge';
import { useSnackbar } from '@/components/SnackbarProvider';
import WorkflowActionButtons from '@/components/workflow/WorkflowActionButtons';
import { useAuthStore } from '@/stores/authStore';
import { actDhrReview, getDhrReviewTask, listDhrReviewTasks, type DhrReviewTask } from '@/api/dhr-workbenches';
import type { ExecutionButton } from '@/api/production-execution';
import { formListFieldSx, formListQueryGridSx, formListQueryPanelSx } from '@/pages/form-management/formManagementListStyles';
import DhrWorklistTable from './DhrWorklistTable';
import DhrActionDialog from './DhrActionDialog';
import { EvidenceCanvas } from './DhrSummaryPage';
import { orderedSummaryChildren } from './summaryPlacementOrder';

const columns = [
  { id: 'dhrNo', label: 'DHR 编号', width: 220 }, { id: 'objectNo', label: '生产对象', width: 150 },
  { id: 'workOrderNo', label: '工单编号', width: 160 }, { id: 'productName', label: '产品名称', width: 180 },
  { id: 'versionNo', label: '汇总版本', width: 110 }, { id: 'nodeName', label: '审批节点', width: 150 },
  { id: 'submittedBy', label: '提交人', width: 120 }, { id: 'submittedAt', label: '提交时间', width: 180 },
  { id: 'completedAt', label: '处理时间', width: 180 }, { id: 'status', label: '处理状态', width: 110 },
] as const;
const labels: Record<string, string> = { PENDING: '待审批', PROCESSING: '待审批', COMPLETED: '已通过', REJECTED: '已退回' };
function errorText(error: unknown) { return error instanceof Error ? error.message : '操作失败，请重试'; }

function ReviewDialog({ task, onClose }: { task: DhrReviewTask; onClose: () => void }) {
  const client = useQueryClient();
  const { showMessage } = useSnackbar();
  const canAct = useAuthStore(s => s.hasPermission('dhr.reviews.act'));
  const query = useQuery({ queryKey: ['dhr-review', task.id], queryFn: () => getDhrReviewTask(task.id), staleTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: false });
  const [nodeKey, setNodeKey] = useState(''), [recordId, setRecordId] = useState('');
  const [button, setButton] = useState<ExecutionButton | null>(null), [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const detail = query.data;
  const directoryNodes = useMemo(() => {
    if (!detail) return [];
    const nodes = [
      ...detail.version.baseDirectory.directories.flatMap(d => [
        { key: `base-dir-${d.id}`, name: d.name, parent: d.parentId ? `base-dir-${d.parentId}` : '', kind: 'directory', rank: 0, order: d.sortOrder ?? 0 },
        ...d.items.map(i => ({ key: `base-item-${i.id}`, name: i.displayName || i.formName || '表单', parent: `base-dir-${d.id}`, kind: 'item', rank: 1, order: i.sortOrder ?? 0 })),
      ]),
      ...detail.version.overlayDirectories.map(d => ({ key: d.key, name: d.name, parent: d.parentKey ?? '', kind: 'directory', rank: 2, order: d.sortOrder })),
    ];
    const byKey = new Map(nodes.map(n => [n.key, n]));
    const candidates = new Map(detail.version.candidates.map(r => [r.id, r]));
    const placements = new Map(detail.placements.map(p => [p.recordId, p]));
    const ordered: Array<{ key: string; name: string; parent: string; depth: number; kind: string; recordId?: string }> = [];
    const visited = new Set<string>();
    const visit = (parent: string, depth: number) => {
      const staticKeys = nodes.filter(n => n.parent === parent).sort((a, b) => a.rank - b.rank || a.order - b.order).map(n => n.key);
      orderedSummaryChildren(parent, staticKeys, detail.placements).forEach(key => {
        if (visited.has(key)) return;
        visited.add(key);
        if (key.startsWith('record-')) {
          const recordId = key.slice(7);
          const record = candidates.get(recordId);
          if (record) ordered.push({ key, parent, depth, kind: 'record', recordId, name: placements.get(recordId)?.displayName || record.templateName || record.instanceNo });
        } else {
          const node = byKey.get(key);
          if (node) { ordered.push({ ...node, depth }); visit(key, depth + 1); }
        }
      });
    };
    visit('', 0);
    return ordered;
  }, [detail]);
  const activeNode = nodeKey || directoryNodes.find(n => n.recordId)?.parent || directoryNodes[0]?.key || '';
  const records = directoryNodes.filter(n => n.parent === activeNode && n.recordId);
  const activeRecordId = records.find(n => n.recordId === recordId)?.recordId ?? records[0]?.recordId;
  const record = detail?.version.candidates.find(r => r.id === activeRecordId) ?? null;
  const archivedName = record ? detail?.placements.find(p => p.recordId === record.id)?.displayName : undefined;
  const affected = detail?.evidenceChanges.length ?? 0;
  const approve = async (credentials: { account: string; password: string; opinion: string }) => {
    if (!button || !detail || busyRef.current) return;
    busyRef.current = true; setBusy(true);
    try {
      await actDhrReview(task.id, { ...credentials, action: button.action, expectedSnapshotHash: detail.task.snapshotHash });
      client.removeQueries({ queryKey: ['dhr-review', task.id] });
      await client.invalidateQueries({ queryKey: ['dhr-instances'] });
      await client.invalidateQueries({ queryKey: ['dhr-review-tasks'] });
      showMessage(button.action === 'RETURN' ? '已退回整理，原汇总版本及审批历史保留' : '审批操作已保存', 'success');
      setButton(null); onClose();
    } catch (e) { showMessage(errorText(e), 'error'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return <>
    <AppDialog open fullScreen onClose={busy ? undefined : onClose}>
      <DialogTitle>{task.dhrNo} · 汇总 V{task.versionNo}<Typography variant="caption" component="div" color="text.secondary">{task.objectNo} · {task.nodeName} · 查看本次提交的冻结证据</Typography></DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
        {!detail ? <Box sx={{ m: 'auto', p: 3 }}>{query.isError ? <><Typography color="error">{errorText(query.error)}</Typography><Button onClick={() => query.refetch()}>重新加载</Button></> : '加载中…'}</Box> : <>
          <Box sx={{ width: { xs: 210, md: 300 }, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e4e7ed', p: 1 }}>
            <Typography variant="subtitle2" sx={{ p: 1 }}>汇总目录</Typography>
            {directoryNodes.map(n => <Button key={n.key} fullWidth variant="text" data-review-record={n.recordId} onClick={() => { setNodeKey(n.recordId ? n.parent : n.key); setRecordId(n.recordId || ''); }} sx={{ justifyContent: 'flex-start', minHeight: n.recordId ? 46 : 36, pl: 1 + n.depth * 2, color: n.recordId === record?.id || (!n.recordId && n.key === activeNode) ? 'primary.main' : 'text.primary', bgcolor: n.recordId === record?.id ? '#e8f4ff' : 'transparent', textTransform: 'none' }}>
              {n.kind === 'directory' ? <FolderOutlined fontSize="small" sx={{ mr: 1 }} /> : <ArticleOutlined fontSize="small" sx={{ mr: 1 }} />}
              <Box minWidth={0} textAlign="left"><Typography variant="body2" noWrap>{n.name}</Typography>{n.recordId && <Typography variant="caption" color="text.secondary" display="block" noWrap>{detail.version.candidates.find(r => r.id === n.recordId)?.instanceNo}</Typography>}</Box>
            </Button>)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: '#f6f8f9' }}>
            {affected > 0 && <Alert severity="warning">{affected} 份已纳入表单发生变化，本次冻结内容保持不变。请核对后退回整理，不能批准过时证据。{detail.evidenceChanges.map(c => <Typography key={c.recordId} variant="caption" component="div">{c.instanceNo}：{c.message}</Typography>)}</Alert>}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, bgcolor: '#fff', borderBottom: '1px solid #e4e7ed', minHeight: 48 }}><Typography variant="body2" noWrap>{record ? `${archivedName || record.templateName} · ${record.instanceNo}` : '请选择目录中的表单'}</Typography></Stack>
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}><EvidenceCanvas record={record} emptyMessage="此目录没有直接归入的表单，请选择下级目录" /></Box>
          </Box>
        </>}
      </DialogContent>
      <DialogActions><Typography variant="caption" color="text.secondary" sx={{ mr: 'auto', pl: 1 }}>{detail?.task.opinion || '审批通过不等同于产品放行'}</Typography><WorkflowActionButtons buttons={detail?.buttons.filter(b => !(affected && b.action === 'APPROVE'))} busy={busy} canAct={canAct && detail?.canAct && !query.isFetching && !query.isError} onAction={b => setButton({ ...b, requireOpinion: b.action === 'RETURN' || b.requireOpinion })} /></DialogActions>
    </AppDialog>
    <DhrActionDialog button={button} busy={busy} initialOpinion={button?.action === 'RETURN' && affected ? `已纳入表单发生变化：${detail?.evidenceChanges.map(c => c.instanceNo).join('、')}。请重新整理并提交新汇总版本。` : ''} onCancel={() => setButton(null)} onConfirm={approve} />
  </>;
}

export default function DhrReviewPage() {
  const [draft, setDraft] = useState(''), [keyword, setKeyword] = useState(''), [view, setView] = useState('PENDING');
  const [page, setPage] = useState(0), [size, setSize] = useState(20), [selected, setSelected] = useState<DhrReviewTask | null>(null);
  const query = useQuery({ queryKey: ['dhr-review-tasks', view, keyword, page, size], queryFn: () => listDhrReviewTasks({ view, keyword, page, size }) });
  const search = () => { setPage(0); setKeyword(draft.trim()); if (keyword === draft.trim() && page === 0) void query.refetch(); };
  return <Box sx={{ height: 'calc(100vh - 142px)', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Box component="form" onSubmit={e => { e.preventDefault(); search(); }} sx={formListQueryPanelSx}><Box sx={formListQueryGridSx}><TextField size="small" label="关键词" placeholder="DHR 编号、批次/SN、工单、产品或提交人" value={draft} onChange={e => setDraft(e.target.value)} sx={{ ...formListFieldSx, gridColumn: { md: 'span 2' } }} /><Stack direction="row" spacing={1.5} justifyContent="flex-end"><Button size="small" variant="outlined" startIcon={<RestartAlt />} sx={{ height: 40, minWidth: 80 }} onClick={() => { setDraft(''); setKeyword(''); setPage(0); if (!keyword && page === 0) void query.refetch(); }}>重置</Button><Button size="small" variant="contained" startIcon={<Search />} type="submit" sx={{ height: 40, minWidth: 80 }}>查询</Button></Stack></Box></Box>
    <DhrWorklistTable storageKey="dhr-review-columns" columns={columns} rows={query.data?.content ?? []} loading={query.isLoading} error={query.isError ? errorText(query.error) : undefined} page={page} size={size} total={query.data?.totalElements ?? 0} pages={query.data?.totalPages ?? 0} onPage={setPage} onSize={s => { setSize(s); setPage(0); }} toolbar={<Tabs value={view} onChange={(_, v) => { setView(v); setPage(0); }} aria-label="DHR审批视图"><Tab value="PENDING" label="我的待审" /><Tab value="DONE" label="我的已审" /></Tabs>} helpText={view === 'PENDING' ? '当前可由本人处理的 DHR 汇总审批任务' : '本人已经处理的 DHR 汇总审批任务'} cell={(row, id) => id === 'status' ? <StatusBadge label={labels[row.status] || row.status} color={row.status === 'COMPLETED' ? 'success' : row.status === 'REJECTED' ? 'warning' : 'primary'} /> : id === 'versionNo' ? `V${row.versionNo}` : <Typography variant="body2" noWrap title={String(row[id as keyof DhrReviewTask] || '')}>{row[id as keyof DhrReviewTask] || '—'}</Typography>} action={row => <Tooltip title="查看并审批"><IconButton size="small" aria-label={`查看并审批 ${row.dhrNo}`} onClick={() => setSelected(row)}><PreviewOutlined fontSize="small" /></IconButton></Tooltip>} />
    {selected && <ReviewDialog task={selected} onClose={() => setSelected(null)} />}
  </Box>;
}
