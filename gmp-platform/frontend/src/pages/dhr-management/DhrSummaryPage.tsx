import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AddRounded, ArticleOutlined, CheckCircleOutlineRounded, CloseRounded, DeleteOutlineRounded,
  FolderOutlined, RefreshRounded, RestartAltRounded, SearchRounded, VisibilityOutlined,
} from '@mui/icons-material';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, MenuItem, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  getDhrSummaryVersion, getDhrSummaryWorkspace, listDhrSummaryInstances, saveDhrSummaryDraft, submitDhrSummary,
  type DhrEvidenceRecord, type DhrInstanceSummary, type DhrSummaryDirectoryOverlay,
  type DhrSummaryPlacement, type DhrSummaryWorkspace,
} from '@/api/dhr-instances';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useAuthStore } from '@/stores/authStore';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import { formTableBodyCellSx, formTableHeaderCellSx, FormListPagination } from '@/pages/form-management/formManagementListStyles';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';

const summaryLabels = {
  NOT_STARTED: '待汇总', DRAFT: '汇总中', PENDING_REVIEW: '待审核', FORMALIZED: '已正式化',
} as const;
const originLabels = { DIRECTORY: '目录表单', WORK: '作业表单', CUSTOM: '自定义表单' } as const;

function formatTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 16) : '—';
}

function EvidencePreview({ record, onClose }: { record: DhrEvidenceRecord | null; onClose: () => void }) {
  const fields = Array.isArray(record?.snapshot?.fields) ? record!.snapshot.fields as Array<Record<string, unknown>> : [];
  const values = record?.fieldValues ?? {};
  const previewDocument = useMemo(() => {
    if (!record?.snapshot.model || !record.snapshot.canvas) return null;
    try {
      const parsed = parseReactTemplateDesignerDocument(
        { id: record.templateId, name: record.templateName || record.snapshot.name || '表单' },
        { id: record.templateVersionId, version: record.templateVersion || record.snapshot.version || '', modelDesignJson: record.snapshot.model, canvasDesignJson: record.snapshot.canvas },
      );
      parsed.model.fields = fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index })) as typeof parsed.model.fields;
      return parsed;
    } catch {
      return null;
    }
  }, [fields, record]);
  return <Dialog open={Boolean(record)} onClose={onClose} fullScreen PaperProps={{ sx: { bgcolor: '#eef1f6' } }}>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box><Typography variant="h6">{record?.templateName || '表单实例'}</Typography><Typography variant="caption" color="text.secondary">{record?.instanceNo} · {record?.templateVersion}</Typography></Box>
      <IconButton onClick={onClose} aria-label="关闭"><CloseRounded /></IconButton>
    </DialogTitle>
    <DialogContent dividers sx={{ bgcolor: '#eef1f6', p: 0 }}>
      {previewDocument ? <FormCanvasPreview document={previewDocument} fullPage runtime={{ values, disabled: true, onChange: () => {} }} /> : <Box sx={{ m: 3, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, p: 3 }}>
        {fields.length ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}>
          {fields.map((field, index) => {
            const id = String(field.id ?? field.fieldId ?? index);
            const label = String(field.name ?? field.label ?? `字段 ${index + 1}`);
            const value = values[id];
            return <Box key={id} sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{value === undefined || value === null || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)}</Typography></Box>;
          })}
        </Box> : <Typography color="text.secondary">该实例没有可展示的字段定义。</Typography>}
      </Box>}
    </DialogContent>
  </Dialog>;
}

function SummaryWorkspace({ dhr, onClose }: { dhr: DhrInstanceSummary; onClose: () => void }) {
  const snackbar = useSnackbar();
  const canEdit = useAuthStore((state) => state.hasPermission('dhr.summaries.edit'));
  const canSubmit = useAuthStore((state) => state.hasPermission('dhr.summaries.submit'));
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['dhr-summary-workspace', dhr.id], queryFn: () => getDhrSummaryWorkspace(dhr.id) });
  const readOnly = dhr.summaryStatus === 'PENDING_REVIEW' || dhr.summaryStatus === 'FORMALIZED';
  const editable = !readOnly && canEdit;
  const latestVersionId = query.data?.versions[0]?.id;
  const versionQuery = useQuery({ queryKey: ['dhr-summary-version', dhr.id, latestVersionId], queryFn: () => getDhrSummaryVersion(dhr.id, latestVersionId!), enabled: readOnly && Boolean(latestVersionId) });
  const workspace = useMemo<DhrSummaryWorkspace | undefined>(() => {
    if (!readOnly) return query.data;
    if (!query.data || !versionQuery.data) return undefined;
    const frozen = versionQuery.data;
    return {
      dhr: { ...frozen.dhr, directorySnapshot: frozen.version.baseDirectory },
      candidates: frozen.version.candidates,
      draft: { id: frozen.version.id, revision: 0, overlayDirectories: frozen.version.overlayDirectories, placements: frozen.placements },
      versions: query.data.versions,
    };
  }, [query.data, readOnly, versionQuery.data]);
  const [overlay, setOverlay] = useState<DhrSummaryDirectoryOverlay[]>([]);
  const [placements, setPlacements] = useState<DhrSummaryPlacement[]>([]);
  const [revision, setRevision] = useState<number | undefined>();
  const [selectedNode, setSelectedNode] = useState('');
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [preview, setPreview] = useState<DhrEvidenceRecord | null>(null);

  useEffect(() => {
    if (!workspace) return;
    setOverlay(workspace.draft?.overlayDirectories ?? []);
    setPlacements(workspace.draft?.placements ?? []);
    setRevision(workspace.draft?.revision);
    setSelectedNode(`base-dir-${workspace.dhr.directorySnapshot.directories[0]?.id ?? ''}`);
  }, [workspace]);

  const baseDirectories = workspace?.dhr.directorySnapshot.directories ?? [];
  const candidateById = useMemo(() => new Map((workspace?.candidates ?? []).map((record) => [record.id, record])), [workspace?.candidates]);
  const directPlacements = useMemo(() => (workspace?.candidates ?? []).filter((record) => record.originKind === 'DIRECTORY' && record.status === 'COMPLETED').map((record) => ({ recordId: record.id, targetNodeKey: `base-item-${String(record.snapshot.dhrItemId ?? '')}` })), [workspace?.candidates]);
  const effectivePlacements = useMemo(() => [...directPlacements, ...placements.filter((placement) => candidateById.get(placement.recordId)?.originKind !== 'DIRECTORY')], [candidateById, directPlacements, placements]);
  const assigned = useMemo(() => new Set(effectivePlacements.map((placement) => placement.recordId)), [effectivePlacements]);
  const candidateGroups = useMemo(() => ({
    WORK: (workspace?.candidates ?? []).filter((record) => record.originKind === 'WORK'),
    CUSTOM: (workspace?.candidates ?? []).filter((record) => record.originKind === 'CUSTOM'),
  }), [workspace?.candidates]);
  const targetOptions = useMemo(() => [
    ...baseDirectories.map((directory) => ({ key: `base-dir-${directory.id}`, label: directory.name })),
    ...overlay.map((directory) => ({ key: directory.key, label: directory.name })),
  ], [baseDirectories, overlay]);
  const selectedRecords = effectivePlacements.filter((placement) => placement.targetNodeKey === selectedNode || (selectedNode.startsWith('base-dir-') && placement.targetNodeKey.startsWith('base-item-') && baseDirectories.find((directory) => `base-dir-${directory.id}` === selectedNode)?.items.some((item) => placement.targetNodeKey === `base-item-${item.id}`))).map((placement) => candidateById.get(placement.recordId)).filter((record): record is DhrEvidenceRecord => Boolean(record));

  const saveMutation = useMutation({
    mutationFn: () => saveDhrSummaryDraft(dhr.id, { revision, overlayDirectories: overlay, placements }),
    onSuccess: (saved) => { setRevision(saved.revision); snackbar.showMessage('汇总草稿已保存', 'success'); client.invalidateQueries({ queryKey: ['dhr-instances'] }); },
    onError: (error: Error) => snackbar.showMessage(error.message || '保存汇总草稿失败', 'error'),
  });
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!canEdit) {
        if (revision === undefined) throw new Error('当前没有可提交的汇总草稿');
        return submitDhrSummary(dhr.id, revision);
      }
      const saved = await saveDhrSummaryDraft(dhr.id, { revision, overlayDirectories: overlay, placements });
      return submitDhrSummary(dhr.id, saved.revision);
    },
    onSuccess: (result) => { snackbar.showMessage(result.status === 'PENDING_REVIEW' ? `汇总 V${result.versionNo} 已冻结，等待审核` : `汇总 V${result.versionNo} 已正式化`, 'success'); client.invalidateQueries({ queryKey: ['dhr-instances'] }); onClose(); },
    onError: (error: Error) => snackbar.showMessage(error.message || '提交 DHR 汇总失败', 'error'),
  });

  const addDirectory = () => {
    if (!editable) return;
    const name = newDirectoryName.trim();
    if (!name) return;
    const key = `summary-dir-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setOverlay((current) => [...current, { key, parentKey: selectedNode || null, name, sortOrder: current.length + 1 }]);
    setSelectedNode(key);
    setNewDirectoryName('');
  };
  const removeDirectory = (key: string) => {
    if (!editable) return;
    const descendants = new Set([key]);
    let changed = true;
    while (changed) { changed = false; overlay.forEach((node) => { if (node.parentKey && descendants.has(node.parentKey) && !descendants.has(node.key)) { descendants.add(node.key); changed = true; } }); }
    setOverlay((current) => current.filter((node) => !descendants.has(node.key)));
    setPlacements((current) => current.filter((placement) => !descendants.has(placement.targetNodeKey)));
    setSelectedNode(`base-dir-${baseDirectories[0]?.id ?? ''}`);
  };
  const assign = (recordId: string, targetNodeKey: string) => { if (editable) setPlacements((current) => [...current.filter((item) => item.recordId !== recordId), { recordId, targetNodeKey }]); };
  const unassign = (recordId: string) => { if (editable) setPlacements((current) => current.filter((item) => item.recordId !== recordId)); };
  const renderOverlayNodes = (parentKey: string, depth: number) => overlay
    .filter((node) => node.parentKey === parentKey)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((node) => <Box key={node.key}>
      <Stack direction="row" alignItems="center" sx={{ pl: depth * 2 }}>
        <Button fullWidth startIcon={<FolderOutlined />} onClick={() => setSelectedNode(node.key)} sx={{ justifyContent: 'flex-start', color: selectedNode === node.key ? '#1677c8' : '#606266', bgcolor: selectedNode === node.key ? '#e8f4ff' : 'transparent' }}>{node.name}</Button>
        {editable && <IconButton size="small" onClick={() => removeDirectory(node.key)}><DeleteOutlineRounded fontSize="small" /></IconButton>}
      </Stack>
      {renderOverlayNodes(node.key, depth + 1)}
    </Box>);

  return <Dialog open fullScreen onClose={onClose} PaperProps={{ sx: { bgcolor: '#f3f5f8' } }}>
    <DialogTitle sx={{ px: 2.5, py: 1.25, bgcolor: '#fff', borderBottom: '1px solid #e4e7ed' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box><Stack direction="row" spacing={1} alignItems="center"><Typography variant="h6">{readOnly ? `DHR 汇总详情 V${query.data?.versions[0]?.versionNo ?? ''}` : 'DHR 汇总'}</Typography><Chip size="small" label={dhr.dhrNo} />{readOnly && <StatusBadge label={summaryLabels[dhr.summaryStatus]} color={dhr.summaryStatus === 'FORMALIZED' ? 'success' : 'warning'} />}</Stack><Typography variant="caption" color="text.secondary">{dhr.objectNo} · {dhr.productCode} / {dhr.productName}</Typography></Box>
        <Stack direction="row" spacing={1}>{editable && <Button variant="outlined" onClick={() => saveMutation.mutate()} disabled={!workspace || saveMutation.isPending}>保存草稿</Button>}{!readOnly && canSubmit && <Button variant="contained" onClick={() => submitMutation.mutate()} disabled={!workspace || submitMutation.isPending || (!canEdit && revision === undefined)}>提交汇总</Button>}<IconButton onClick={onClose}><CloseRounded /></IconButton></Stack>
      </Stack>
    </DialogTitle>
    <DialogContent sx={{ p: 2, overflow: 'hidden' }}>
      {query.isLoading || versionQuery.isLoading ? <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : query.isError || versionQuery.isError || !workspace ? <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}><Button startIcon={<RefreshRounded />} onClick={() => { query.refetch(); if (readOnly) versionQuery.refetch(); }}>重新加载</Button></Box> : <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: '300px minmax(420px,1fr) 390px', gap: 1.5 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'auto' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e4e7ed' }}><Typography fontWeight={700}>汇总目录</Typography><Typography variant="caption" color="text.secondary">基础目录不可修改，可增加多级目录</Typography></Box>
          <Stack sx={{ p: 1 }} spacing={0.5}>
            {baseDirectories.map((directory) => <Box key={directory.id}>
              <Button fullWidth startIcon={<FolderOutlined />} onClick={() => setSelectedNode(`base-dir-${directory.id}`)} sx={{ justifyContent: 'flex-start', color: selectedNode === `base-dir-${directory.id}` ? '#1677c8' : '#303133', bgcolor: selectedNode === `base-dir-${directory.id}` ? '#e8f4ff' : 'transparent' }}>{directory.name}</Button>
              {renderOverlayNodes(`base-dir-${directory.id}`, 1)}
            </Box>)}
          </Stack>
          {editable && <><Divider /><Stack direction="row" spacing={1} sx={{ p: 1.5 }}><TextField size="small" fullWidth label="新增下级目录" value={newDirectoryName} onChange={(event) => setNewDirectoryName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addDirectory(); }} /><IconButton color="primary" onClick={addDirectory} disabled={!selectedNode || !newDirectoryName.trim()}><AddRounded /></IconButton></Stack></>}
        </Box>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'auto' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e4e7ed' }}><Typography fontWeight={700}>目录内容</Typography><Typography variant="caption" color="text.secondary">同一模板的多份实例分别展示，不合并副本</Typography></Box>
          <Stack sx={{ p: 1.5 }} spacing={1}>
            {selectedRecords.map((record) => <Stack key={record.id} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, border: '1px solid #ebeef5', borderRadius: 1 }}><ArticleOutlined color="primary" /><Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={600} noWrap>{record.templateName}</Typography><Typography variant="caption" color="text.secondary">{record.instanceNo} · 副本 {record.copyId} · {originLabels[record.originKind]}</Typography></Box><Tooltip title="查看实例"><IconButton onClick={() => setPreview(record)}><VisibilityOutlined /></IconButton></Tooltip>{editable && record.originKind !== 'DIRECTORY' && <Tooltip title="移出汇总"><IconButton onClick={() => unassign(record.id)}><DeleteOutlineRounded /></IconButton></Tooltip>}</Stack>)}
            {!selectedRecords.length && <Box sx={{ py: 8, textAlign: 'center', color: '#909399' }}><FolderOutlined sx={{ fontSize: 42, opacity: 0.5 }} /><Typography>当前目录暂无表单实例</Typography></Box>}
          </Stack>
        </Box>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'auto' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e4e7ed' }}><Typography fontWeight={700}>{readOnly ? '提交时的候选范围' : '候选表单'}</Typography><Typography variant="caption" color="text.secondary">{readOnly ? '冻结保留纳入与未纳入记录，便于追溯' : '选择需要纳入的作业表单和自定义表单；未选择即不纳入'}</Typography></Box>
          {(['WORK', 'CUSTOM'] as const).map((origin) => <Box key={origin}><Typography variant="subtitle2" sx={{ px: 1.5, pt: 1.5 }}>{originLabels[origin]} · {candidateGroups[origin].length}</Typography><Stack sx={{ p: 1.5 }} spacing={1}>{candidateGroups[origin].map((record) => {
            const current = effectivePlacements.find((placement) => placement.recordId === record.id)?.targetNodeKey ?? '';
            return <Box key={record.id} sx={{ p: 1.25, border: '1px solid #ebeef5', borderRadius: 1, bgcolor: assigned.has(record.id) ? '#f0f9eb' : '#fff' }}><Stack direction="row" justifyContent="space-between" gap={1}><Box sx={{ minWidth: 0 }}><Typography fontWeight={600} noWrap>{record.templateName}</Typography><Typography variant="caption" color="text.secondary">{record.instanceNo} · {record.operationName || '生产执行'}</Typography></Box><IconButton size="small" onClick={() => setPreview(record)}><VisibilityOutlined fontSize="small" /></IconButton></Stack><Stack direction="row" spacing={1} sx={{ mt: 1 }}><TextField select size="small" fullWidth value={current} label={record.status === 'COMPLETED' ? (current ? '已归入目录' : '未纳入') : '未完成，不可纳入'} disabled={!editable || record.status !== 'COMPLETED'} onChange={(event) => assign(record.id, event.target.value)}>{!current && <MenuItem value="">未纳入</MenuItem>}{targetOptions.map((target) => <MenuItem key={target.key} value={target.key}>{target.label}</MenuItem>)}</TextField>{current && <IconButton color="success" disabled><CheckCircleOutlineRounded /></IconButton>}</Stack></Box>;
          })}{!candidateGroups[origin].length && <Typography variant="body2" color="text.secondary">暂无记录</Typography>}</Stack></Box>)}
        </Box>
      </Box>}
    </DialogContent>
    <EvidencePreview record={preview} onClose={() => setPreview(null)} />
  </Dialog>;
}

export default function DhrSummaryPage() {
  const [draftKeyword, setDraftKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<'pending' | 'submitted'>('pending');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selected, setSelected] = useState<DhrInstanceSummary | null>(null);
  const query = useQuery({
    queryKey: ['dhr-instances', 'summary', keyword, tab, page, size],
    queryFn: () => listDhrSummaryInstances({ keyword, summaryStatus: tab === 'submitted' ? 'SUBMITTED_GROUP' : 'PENDING_GROUP', page, size }),
  });
  const rows = (query.data?.content ?? []).filter((row) => tab === 'pending' ? ['NOT_STARTED', 'DRAFT'].includes(row.summaryStatus) : ['PENDING_REVIEW', 'FORMALIZED'].includes(row.summaryStatus));
  const resetSearch = () => { setDraftKeyword(''); setKeyword(''); setPage(0); };
  const statusStickySx = { position: 'sticky', right: 96, zIndex: 2, bgcolor: '#fff', minWidth: 120 } as const;
  const actionStickySx = { position: 'sticky', right: 0, zIndex: 3, bgcolor: '#fff', width: 96, minWidth: 96, textAlign: 'center' } as const;
  return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#f5f7fa' }}>
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, p: 1.5 }}><Stack direction="row" spacing={1.5} alignItems="center"><TextField size="small" label="关键词" placeholder="DHR 编号、批次/SN、工单或产品" value={draftKeyword} onChange={(event) => setDraftKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { setKeyword(draftKeyword.trim()); setPage(0); } }} sx={{ flex: 1, maxWidth: 620 }} /><Button variant="outlined" startIcon={<RestartAltRounded />} onClick={resetSearch}>重置</Button><Button variant="contained" startIcon={<SearchRounded />} onClick={() => { setKeyword(draftKeyword.trim()); setPage(0); }}>查询</Button></Stack></Box>
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Tabs value={tab} onChange={(_, value) => { setTab(value); setPage(0); }} sx={{ px: 2, borderBottom: '1px solid #e4e7ed' }}><Tab value="pending" label="待汇总" /><Tab value="submitted" label="已提交" /></Tabs>
      <TableContainer sx={{ flex: 1 }}><Table stickyHeader size="small"><TableHead><TableRow><TableCell sx={formTableHeaderCellSx}>DHR 编号</TableCell><TableCell sx={formTableHeaderCellSx}>生产对象</TableCell><TableCell sx={formTableHeaderCellSx}>工单编号</TableCell><TableCell sx={formTableHeaderCellSx}>产品</TableCell><TableCell sx={formTableHeaderCellSx}>DHR 模板</TableCell><TableCell sx={{ ...formTableHeaderCellSx, ...statusStickySx, zIndex: 4, bgcolor: '#f5f7fa' }}>汇总状态</TableCell><TableCell sx={{ ...formTableHeaderCellSx, ...actionStickySx, zIndex: 5, bgcolor: '#f5f7fa' }}>操作</TableCell></TableRow></TableHead><TableBody>
        {query.isLoading || query.isError || !rows.length ? <TableRow><TableStateCell colSpan={7} sx={{ height: 420 }}><Stack alignItems="center" spacing={1.5}>{query.isLoading ? <CircularProgress size={28} /> : query.isError ? <><Typography fontWeight={700}>DHR 汇总列表加载失败</Typography><Button size="small" startIcon={<RefreshRounded />} onClick={() => query.refetch()}>重新加载</Button></> : <Typography color="text.secondary">暂无符合条件的 DHR</Typography>}</Stack></TableStateCell></TableRow> : rows.map((row) => <TableRow key={row.id} hover><TableCell sx={formTableBodyCellSx}>{row.dhrNo}</TableCell><TableCell sx={formTableBodyCellSx}>{row.objectNo} · {row.objectType === 'BATCH' ? '批次' : '序列号'}</TableCell><TableCell sx={formTableBodyCellSx}>{row.workOrderNo}</TableCell><TableCell sx={formTableBodyCellSx}>{[row.productCode, row.productName].filter(Boolean).join(' / ')}</TableCell><TableCell sx={formTableBodyCellSx}>{row.dhrTemplateName} · {row.dhrTemplateVersion}</TableCell><TableCell sx={{ ...formTableBodyCellSx, ...statusStickySx }}><StatusBadge label={summaryLabels[row.summaryStatus]} color={row.summaryStatus === 'FORMALIZED' ? 'success' : row.summaryStatus === 'PENDING_REVIEW' ? 'warning' : 'primary'} /></TableCell><TableCell sx={{ ...formTableBodyCellSx, ...actionStickySx }}><Tooltip title={tab === 'pending' ? '进入汇总' : '查看冻结版本'}><IconButton size="small" onClick={() => setSelected(row)}><VisibilityOutlined fontSize="small" /></IconButton></Tooltip></TableCell></TableRow>)}
      </TableBody></Table></TableContainer>
      <FormListPagination totalElements={query.data?.totalElements ?? 0} totalPages={query.data?.totalPages ?? 0} page={page} pageSize={size} onPageChange={setPage} onPageSizeChange={(next) => { setSize(next); setPage(0); }} />
    </Box>
    {selected && <SummaryWorkspace dhr={selected} onClose={() => setSelected(null)} />}
  </Box>;
}
