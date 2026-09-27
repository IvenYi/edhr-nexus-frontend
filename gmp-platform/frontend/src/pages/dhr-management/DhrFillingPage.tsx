import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { PlayCircleOutline, PreviewOutlined, RestartAlt, Search } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import FormDialogFieldGrid from '@/components/FormDialogFieldGrid';
import StatusBadge from '@/components/StatusBadge';
import WorkflowActionButtons from '@/components/workflow/WorkflowActionButtons';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useAuthStore } from '@/stores/authStore';
import { actDhrFilling, createDhrSupplement, dhrReferences, getDhrFilling, listDhrFilling } from '@/api/dhr-workbenches';
import type { DhrDisplayStatus, DhrEvidenceRecord, DhrInstanceSummary } from '@/api/dhr-instances';
import { uploadExecutionFile, type ExecutionButton, type ExecutionCommand, type ExecutionForm, type ExecutionValues } from '@/api/production-execution';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { formListFieldSx, formListQueryGridSx, formListQueryPanelSx } from '@/pages/form-management/formManagementListStyles';
import DhrDetailDrawer from './DhrDetailDrawer';
import DhrWorklistTable from './DhrWorklistTable';
import DhrActionDialog from './DhrActionDialog';
import { dhrObjectTypeLabel, dhrStatusFilters, dhrStatusMeta } from './dhrListPresentation';
import { DhrInstancePanel, DhrWorkspaceNavigation, workspaceBodySx, workspacePanelSx } from './DhrWorkspaceNavigation';
import { archiveNavigation, type DhrNavigationNode, type DhrNavigationView, type DhrSource } from './dhrSourceNavigation';

const columns = [
  { id: 'dhrNo', label: 'DHR 编号', width: 220 }, { id: 'objectNo', label: '生产对象', width: 210 },
  { id: 'workOrderNo', label: '工单编号', width: 160 }, { id: 'productCode', label: '产品编码', width: 160 },
  { id: 'productName', label: '产品名称', width: 200 }, { id: 'dhrTemplateName', label: 'DHR 模板', width: 190 },
  { id: 'status', label: 'DHR 状态', width: 112 }, { id: 'createdAt', label: '建立时间', width: 170 },
] as const;
type SelectedAction = ExecutionButton & { signatureTarget?: ExecutionCommand['signatureTarget'] };
function origin(form: ExecutionForm) { return (form as ExecutionForm & { dhrItemId?: string }).dhrItemId ? 'DIRECTORY' : form.workId ? 'WORK' : 'CUSTOM'; }
function errorText(error: unknown) { return error instanceof Error ? error.message : '操作失败，请重试'; }
function FillingWorkspace({ dhr, onClose }: { dhr: DhrInstanceSummary; onClose: () => void }) {
  const client = useQueryClient(), { showMessage } = useSnackbar();
  const mayAct = useAuthStore(s => s.hasPermission('dhr.filling.act'));
  const mayAdd = useAuthStore(s => s.hasPermission('dhr.filling.supplement'));
  const query = useQuery({ queryKey: ['dhr-filling', dhr.id], queryFn: () => getDhrFilling(dhr.id), staleTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: false, refetchOnReconnect: false });
  const view = query.data;
  const [source, setSource] = useState<DhrSource>('DIRECTORY'), [formKey, setFormKey] = useState(''), [copyId, setCopyId] = useState('');
  const [values, setValues] = useState<ExecutionValues>({}), [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [action, setAction] = useState<SelectedAction | null>(null);
  const [instancesOpen, setInstancesOpen] = useState(false), [adding, setAdding] = useState(false);
  const [navigationView, setNavigationView] = useState<DhrNavigationView>('SOURCE'), [archiveKey, setArchiveKey] = useState('');
  const [reason, setReason] = useState(''), [occurredAt, setOccurredAt] = useState('');
  const allEntries = useMemo(() => view?.snapshot.operations.flatMap(op => op.forms.map(form => ({ op, form, key: `${op.id}/${form.id}` }))) ?? [], [view]);
  const entries = useMemo(() => allEntries.filter(e => origin(e.form) === source), [allEntries, source]);
  // Unsaved execution copies are navigation targets, not new archived evidence.
  const navigationRecords = useMemo<DhrEvidenceRecord[]>(() => allEntries.flatMap(({ op, form }) => (view?.availability[op.id]?.formCopies?.[form.id]?.instanceIds ?? []).map(id => {
    const current = view?.state.operations[op.id]?.forms[id];
    const ref = view?.archiveLayout?.recordRefs?.find(r => r.operationId === op.id && r.formId === form.id && r.copyId === id);
    return { id: ref?.id ?? `execution:${op.id}/${id}`, copyId: id, operationId: op.id, operationName: op.name, formId: form.id,
      instanceNo: current?.instanceNo ?? '', status: current?.status ?? '', originKind: origin(form), snapshot: { dhrItemId: (form as ExecutionForm & { dhrItemId?: string }).dhrItemId, workId: form.workId, workNodeId: form.workNodeId, name: form.name },
      templateId: form.versionId, templateVersionId: form.versionId, templateCode: null, templateName: form.name, templateVersion: form.version,
      updatedBy: null, updatedAt: '', fieldValues: current?.values ?? {} };
  })), [allEntries, view]);
  const archiveNodes = useMemo(() => archiveNavigation(view?.directorySnapshot.directories ?? [], navigationRecords, view?.archiveLayout?.overlayDirectories, view?.archiveLayout?.placements), [view, navigationRecords]);
  const entryForNode = (node?: DhrNavigationNode) => {
    const first = navigationRecords.find(r => r.id === node?.recordIds[0]);
    return first ? allEntries.find(e => e.op.id === first.operationId && e.form.id === first.formId)
      : allEntries.find(e => node?.key === `base-item-${(e.form as ExecutionForm & { dhrItemId?: string }).dhrItemId}`);
  };
  const archiveNode = archiveNodes.find(n => n.key === archiveKey && !n.folder) ?? archiveNodes.find(n => !n.folder);
  const navigation = useMemo(() => {
    if (source !== 'DIRECTORY') return entries.map(e => ({ key: e.key, name: e.form.name, depth: 0, entry: e }));
    const nodes: Array<{ key: string; name: string; depth: number; entry?: typeof entries[number] }> = [];
    const seen = new Set<string>(), placed = new Set<string>();
    const directories = view?.directorySnapshot.directories ?? [];
    const visit = (parent: string, depth: number) => directories.filter(d => String(d.parentId ?? '') === parent).forEach(d => {
      if (seen.has(String(d.id))) return;
      seen.add(String(d.id));
      nodes.push({ key: `dir-${d.id}`, name: d.name, depth });
      d.items.forEach(item => entries.filter(e => String((e.form as ExecutionForm & { dhrItemId?: string }).dhrItemId) === String(item.id)).forEach(e => {
        placed.add(e.key); nodes.push({ key: e.key, name: item.displayName || e.form.name, depth: depth + 1, entry: e });
      }));
      visit(String(d.id), depth + 1);
    });
    visit('', 0);
    entries.filter(e => !placed.has(e.key)).forEach(e => nodes.push({ key: e.key, name: e.form.name, depth: 0, entry: e }));
    return nodes;
  }, [entries, source, view?.directorySnapshot]);
  const navigationNodes = navigation.map(node => {
    const entry = node.entry;
    const ids = entry ? view?.availability[entry.op.id]?.formCopies?.[entry.form.id]?.instanceIds ?? [] : [];
    const completed = entry ? ids.filter(id => view?.state.operations[entry.op.id]?.forms[id]?.status === 'COMPLETED').length : 0;
    return { key: node.key, label: node.name, depth: node.depth, folder: !entry, recordIds: ids,
      secondary: entry ? `${entry.op.name} · ${ids.length ? `已完成 ${completed}/${ids.length}` : '尚无实例'}` : undefined };
  });
  const entry = navigationView === 'ARCHIVE' ? entryForNode(archiveNode) : entries.find(e => e.key === formKey) ?? entries[0];
  const group = entry ? view?.availability[entry.op.id]?.formCopies?.[entry.form.id] : undefined;
  const visibleCopyIds = navigationView === 'ARCHIVE' ? (archiveNode?.recordIds ?? []).map(id => navigationRecords.find(r => r.id === id)?.copyId).filter((id): id is string => Boolean(id)) : group?.instanceIds ?? [];
  const selectedCopy = visibleCopyIds.includes(copyId) ? copyId : visibleCopyIds[0] ?? '';
  const previewRecord = navigationRecords.find(r => r.operationId === entry?.op.id && r.formId === entry?.form.id && r.copyId === selectedCopy);
  const previewTitle = (navigationView === 'ARCHIVE' && view?.archiveLayout?.placements.find(p => p.recordId === previewRecord?.id)?.displayName) || entry?.form.name;
  const current = entry ? view?.state.operations[entry.op.id]?.forms[selectedCopy] : undefined;
  const controls = group?.instances[selectedCopy];
  const canAct = Boolean(mayAct && controls?.canAct && !query.isFetching && !query.isError);
  const terminatedReason = view?.objectStatus === 'EARLY_TERMINATED'
    ? `${dhr.objectType === 'SN' ? '生产对象' : '批次'}已提前结束，DHR 已终止，仅可查阅已保存记录。${dhr.terminationReason ? `原因：${dhr.terminationReason}。` : ''}`
    : view?.orderStatus === 'EARLY_TERMINATED' && !controls?.canAct
      ? '所属工单已提前结束，当前表单仅可查阅。'
      : '';
  const terminationProvenance = view?.objectStatus === 'EARLY_TERMINATED'
    ? `${dhr.terminatedBy ? `原操作人：${dhr.terminatedBy}。` : '原操作人：历史记录未留存。'}${dhr.terminationSnapshotAvailable
      ? '此处显示当前保存的执行记录；终止时冻结证据请到 DHR 列表详情查看。'
      : '此历史记录缺少终止时证据快照；当前保存的执行记录不能据此还原终止时现场。'}`
    : '';
  useEffect(() => { setValues(current?.values ?? {}); setDirty(false); }, [entry?.key, selectedCopy, view?.revision]);
  useEffect(() => { const warn = (e: BeforeUnloadEvent) => { if (dirty || busyRef.current) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  const document = useMemo(() => {
    if (!entry) return null;
    try {
      const f = entry.form;
      const parsed = parseReactTemplateDesignerDocument({ id: f.versionId, name: f.name }, { id: f.versionId, version: f.version, modelDesignJson: f.model, canvasDesignJson: f.canvas });
      parsed.model.fields = f.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
      return parsed;
    } catch { return null; }
  }, [entry?.form]);
  const guarded = (fn: () => void) => { if (busyRef.current) return; if (dirty) setPending(() => fn); else fn(); };
  const selectNode = (node: DhrNavigationNode, showInstances: boolean) => {
    const selectedKey = navigationView === 'ARCHIVE' ? archiveNode?.key : entry?.key;
    if (node.key === selectedKey) { if (showInstances) setInstancesOpen(open => !open); return; }
    guarded(() => { if (navigationView === 'ARCHIVE') setArchiveKey(node.key); else setFormKey(node.key); setCopyId(''); if (showInstances) setInstancesOpen(true); });
  };
  const changeView = (next: DhrNavigationView) => {
    if (busyRef.current) return;
    const record = navigationRecords.find(r => r.operationId === entry?.op.id && r.formId === entry?.form.id && r.copyId === selectedCopy);
    const target = archiveNodes.find(n => record ? n.recordIds.includes(record.id) : entryForNode(n)?.key === entry?.key);
    const change = () => {
      if (entry) {
        setFormKey(entry.key); setSource(origin(entry.form)); setCopyId(selectedCopy);
        setArchiveKey(target?.key ?? '');
      }
      setNavigationView(next);
    };
    // Changing only the projection must not discard unsaved values.
    if (next === 'SOURCE' || target) change(); else guarded(change);
  };
  const update = async (result: NonNullable<typeof view>) => {
    client.setQueryData(['dhr-filling', dhr.id], result); setDirty(false);
    await client.invalidateQueries({ queryKey: ['dhr-instances'] });
  };
  const run = async (button: SelectedAction, credentials?: { account: string; password: string; opinion: string }) => {
    if (!entry || !view || busyRef.current) return;
    busyRef.current = true; setBusy(true);
    try {
      await update(await actDhrFilling(dhr.id, { action: button.action, revision: view.revision, operationId: entry.op.id, formId: entry.form.id, instanceId: selectedCopy, values, signatureTarget: button.signatureTarget, ...credentials }));
      setAction(null); showMessage('表单操作已保存', 'success');
    } catch (e) { showMessage(errorText(e), 'error'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const add = async () => {
    if (!entry || !view || busyRef.current) return;
    busyRef.current = true; setBusy(true);
    try {
      const result = await createDhrSupplement(dhr.id, { revision: view.revision, operationId: entry.op.id, formId: entry.form.id, reason, occurredAt });
      await update(result); setSource(origin(entry.form)); setFormKey(entry.key); setNavigationView('SOURCE'); setCopyId(result.createdCopyId); setAdding(false); showMessage('已创建补录实例，原生产状态保持不变', 'success');
    } catch (e) { showMessage(errorText(e), 'error'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return <>
    <AppDialog open fullScreen onClose={() => guarded(onClose)}>
      <DialogTitle><Typography variant="h6">{dhr.dhrNo} · 填报</Typography><Typography variant="caption" component="div" color="text.secondary">{dhr.objectNo} · {dhr.productName} · 当前生产记录</Typography></DialogTitle>
      <DialogContent dividers sx={{ ...workspaceBodySx, p: 1.5, bgcolor: '#f3f5f8' }}>
        {!view ? <Box sx={{ m: 'auto', p: 3 }}>{query.isError ? <><Typography color="error">{errorText(query.error)}</Typography><Button onClick={() => query.refetch()}>重新加载</Button></> : '加载中…'}</Box> : <>
          <DhrWorkspaceNavigation view={navigationView} onViewChange={changeView} source={source} onSourceChange={s => guarded(() => { setSource(s); setFormKey(''); setCopyId(''); setInstancesOpen(false); })}
            selectedKey={navigationView === 'ARCHIVE' ? archiveNode?.key ?? '' : entry?.key ?? ''} nodes={navigationView === 'ARCHIVE' ? archiveNodes : navigationNodes}
            instancesOpen={instancesOpen} onSelect={node => selectNode(node, false)} onInstances={node => selectNode(node, true)} />
          <DhrInstancePanel open={instancesOpen} title={navigationView === 'ARCHIVE' ? archiveNode?.label ?? '表单' : entry?.form.name ?? '表单'} selectedId={selectedCopy} onClose={() => setInstancesOpen(false)}
            onSelect={id => { if (id !== selectedCopy) guarded(() => setCopyId(id)); }}
            items={visibleCopyIds.map((id, index) => { const instance = entry && view.state.operations[entry.op.id]?.forms[id]; return { id, label: instance?.instanceNo || `第 ${index + 1} 份（待生成实例号）`, secondary: instance?.status === 'COMPLETED' ? '已完成' : '填报中' }; })} />
          <Box sx={{ ...workspacePanelSx, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minHeight: 56, px: 2, borderBottom: '1px solid #e4e7ed' }}><Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" noWrap>{previewTitle || '请选择表单'}</Typography><Typography variant="caption" color="text.secondary">{current?.instanceNo || (selectedCopy ? '首次保存后生成实例号' : '尚未到达填报节点')} · {controls?.nodeName || ''}</Typography></Box>
              {mayAdd && view.objectStatus === 'COMPLETED' && view.dhrSummaryStatus !== 'PENDING_REVIEW' && group?.instanceIds.length ? <Button size="small" onClick={() => guarded(() => { setReason(''); setOccurredAt(''); setAdding(true); })}>追加补录</Button> : null}
            </Stack>
            {terminatedReason ? <Alert severity="warning">{terminatedReason}{terminationProvenance && <Typography variant="body2" sx={{ mt: 0.5 }}>{terminationProvenance}</Typography>}</Alert> : current?.status === 'COMPLETED' ? <Alert severity="info">本实例已完成，内容只读。需要更正已有内容时请使用表单变更流程。</Alert> : null}
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2, bgcolor: '#f6f8f9' }}>{document ? <FormCanvasPreview document={document} fullPage fieldPermissions={controls?.permissions} runtime={{ values, disabled: busy || !canAct, signaturePermissions: controls?.signaturePermissions, signaturesInvalidated: dirty, onSignatureRequest: target => setAction({ action: 'SIGN_FIELD', label: '签署字段', requiresSignature: true, signatureTarget: target }), onChange: (id, value) => { setValues(v => ({ ...v, [id]: value })); setDirty(true); }, references: (id, word, referenceValues) => entry ? dhrReferences(dhr.id, entry.op.id, entry.form.id, id, word, referenceValues) : Promise.resolve([]), upload: async file => { if (busyRef.current) throw new Error('请等待当前操作完成'); busyRef.current = true; setBusy(true); try { return await uploadExecutionFile(dhr.productionObjectId, file); } finally { busyRef.current = false; setBusy(false); } } }} /> : <Typography color="text.secondary">暂无可显示的表单画布</Typography>}</Box>
          </Box>
        </>}
      </DialogContent>
      <DialogActions><Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>{dirty ? '有未保存的修改' : terminatedReason ? '只读查阅 · 生产已提前结束' : '按表单节点权限填报'}</Typography><Button disabled={busy} onClick={() => guarded(onClose)}>关闭</Button><WorkflowActionButtons buttons={controls?.buttons.filter(b => ['SAVE', 'SUBMIT', 'APPROVE', 'RETURN'].includes(b.action))} canAct={canAct} busy={busy} onAction={b => b.requiresSignature || b.requireOpinion || b.action === 'RETURN' ? setAction({ ...b, requireOpinion: b.requireOpinion || b.action === 'RETURN' }) : void run(b)} /></DialogActions>
    </AppDialog>
    <DhrActionDialog button={action} busy={busy} onCancel={() => setAction(null)} onConfirm={credentials => { if (action) void run(action, credentials); }} />
    <ConfirmDialog open={Boolean(pending)} title="当前表单尚未保存" message="继续将丢失当前未保存的修改。" destructive initialFocus="cancel" confirmText="放弃修改并继续" onCancel={() => setPending(null)} onConfirm={() => { const next = pending; setPending(null); setDirty(false); next?.(); }} />
    <FormDialog open={adding} onClose={busy ? undefined : () => setAdding(false)} fullWidth maxWidth="sm"><DialogTitle>追加补录</DialogTitle><DialogContent dividers><FormDialogSection title="记录说明"><FormDialogFieldGrid><TextField size="small" label="表单" value={entry?.form.name ?? ''} disabled /><TextField size="small" label="实际发生时间" type="datetime-local" InputLabelProps={{ shrink: true }} value={occurredAt} onChange={e => setOccurredAt(e.target.value)} disabled={busy} required /><TextField size="small" label="补录原因" multiline minRows={3} value={reason} onChange={e => setReason(e.target.value)} disabled={busy} required sx={{ gridColumn: '1 / -1' }} /></FormDialogFieldGrid></FormDialogSection><Typography variant="caption" color="text.secondary">创建新实例，不覆盖已完成记录；系统记录实际录入人和录入时间。</Typography></DialogContent><DialogActions><Button disabled={busy} onClick={() => setAdding(false)}>取消</Button><Button variant="contained" disabled={busy || !reason.trim() || !occurredAt} onClick={() => void add()}>{busy ? '创建中…' : '创建并填写'}</Button></DialogActions></FormDialog>
  </>;
}

export default function DhrFillingPage() {
  const [draft, setDraft] = useState(''), [draftStatus, setDraftStatus] = useState<DhrDisplayStatus | ''>('FILLING'), [keyword, setKeyword] = useState(''), [status, setStatus] = useState<DhrDisplayStatus | ''>('FILLING');
  const [page, setPage] = useState(0), [size, setSize] = useState(20), [selected, setSelected] = useState<DhrInstanceSummary | null>(null);
  const [detailRow, setDetailRow] = useState<DhrInstanceSummary | null>(null);
  const query = useQuery({ queryKey: ['dhr-instances', 'filling', keyword, status, page, size], queryFn: () => listDhrFilling({ keyword, displayStatus: status, page, size }), staleTime: 0 });
  const search = () => { setPage(0); setKeyword(draft.trim()); setStatus(draftStatus); if (keyword === draft.trim() && status === draftStatus && page === 0) void query.refetch(); };
  return <Box sx={{ height: 'calc(100vh - 142px)', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Box component="form" onSubmit={e => { e.preventDefault(); search(); }} sx={formListQueryPanelSx}><Box sx={formListQueryGridSx}><TextField size="small" label="关键词" placeholder="DHR 编号、批次/SN、工单或产品" value={draft} onChange={e => setDraft(e.target.value)} sx={formListFieldSx} /><TextField select size="small" label="DHR 状态" value={draftStatus} onChange={e => setDraftStatus(e.target.value as DhrDisplayStatus | '')} sx={formListFieldSx}><MenuItem value="">全部</MenuItem>{dhrStatusFilters.map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</TextField><Stack direction="row" spacing={1.5} justifyContent="flex-end"><Button size="small" variant="outlined" startIcon={<RestartAlt />} sx={{ height: 40, minWidth: 80 }} onClick={() => { setDraft(''); setDraftStatus('FILLING'); setKeyword(''); setStatus('FILLING'); setPage(0); if (!keyword && status === 'FILLING' && page === 0) void query.refetch(); }}>重置</Button><Button size="small" variant="contained" startIcon={<Search />} sx={{ height: 40, minWidth: 80 }} type="submit">查询</Button></Stack></Box></Box>
    <DhrWorklistTable onRowClick={setDetailRow} storageKey="dhr-filling-columns" columns={columns} rows={query.data?.content ?? []} loading={query.isLoading} error={query.isError ? errorText(query.error) : undefined} page={page} size={size} total={query.data?.totalElements ?? 0} pages={query.data?.totalPages ?? 0} onPage={setPage} onSize={s => { setSize(s); setPage(0); }} cell={(row, id) => {
      if (id === 'status') { const state = dhrStatusMeta(row.displayStatus); return <StatusBadge label={state.label} color={state.color} />; }
      if (id === 'objectNo') return <Typography variant="body2" noWrap title={`${row.objectNo} · ${dhrObjectTypeLabel[row.objectType]}`}>{row.objectNo} <Typography component="span" variant="caption" color="text.secondary">· {dhrObjectTypeLabel[row.objectType]}</Typography></Typography>;
      return <Typography variant="body2" noWrap title={String(row[id as keyof DhrInstanceSummary] ?? '')}>{row[id as keyof DhrInstanceSummary] || '—'}</Typography>;
    }} action={row => <Tooltip title={row.displayStatus === 'TERMINATED' ? '查看已终止 DHR' : '打开 DHR 填报'}><IconButton size="small" aria-label={`${row.displayStatus === 'TERMINATED' ? '查看已终止 DHR' : '打开 DHR 填报'} ${row.dhrNo}`} onClick={() => setSelected(row)}>{row.displayStatus === 'TERMINATED' ? <PreviewOutlined fontSize="small" /> : <PlayCircleOutline fontSize="small" />}</IconButton></Tooltip>} />
    {detailRow && <DhrDetailDrawer key={detailRow.id} source="filling" id={detailRow.id} dhrNo={detailRow.dhrNo} onClose={() => setDetailRow(null)} />}
    {selected && <FillingWorkspace dhr={selected} onClose={() => setSelected(null)} />}
  </Box>;
}
