import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert, Autocomplete, Box, Button, CircularProgress, Collapse, DialogActions, DialogContent, DialogTitle, Drawer,
  IconButton, InputAdornment, MenuItem, Stack, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import { Close, ExpandMore, InfoOutlined, PlayCircleOutline, PreviewOutlined, RestartAlt, Search, SwapHoriz } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import { listColumnResizeHandleSx } from '@/components/listTableStyles';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import { useSnackbar } from '@/components/SnackbarProvider';
import { getAuditLogs, type AuditLogItem } from '@/api/audit';
import {
  getFormWorklistDetail, listFormWorklist, type FormWorklistDetail, type FormWorklistIdentity,
  type FormWorklistQuery, type FormWorklistRow, type FormWorklistView,
} from '@/api/form-instance-records';
import {
  executeProduction, getExecutionReferences, getExecutionTransferTargets, uploadExecutionFile,
  type ExecutionButton, type ExecutionTransferTarget, type ExecutionValues,
} from '@/api/production-execution';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { toProductionAuditFields, type ProductionAuditField } from '@/utils/productionAudit';
import type { PageResult } from '@/types/common';
import {
  formListAdvancedGridSx,
  formListFieldSx,
  formListFilterActionsSx,
  formListQueryGridSx,
  formListQueryPanelSx,
  formTableBodyCellSx,
  formTableHeaderCellSx,
  FormListPagination,
} from './formManagementListStyles';

type ReviewView = Extract<FormWorklistView, 'REVIEW_PENDING' | 'REVIEW_DONE'>;
type ReviewColumnId = 'instanceNo' | 'template' | 'productionObject' | 'workOrder' | 'operation' | 'node' | 'result' | 'time' | 'status' | 'actions';
const REVIEW_COLUMNS: ReadonlyArray<{ id: ReviewColumnId; label: string; width: number; minWidth: number }> = [
  { id: 'instanceNo', label: '表单实例号', width: 170, minWidth: 150 },
  { id: 'template', label: '表单模板', width: 190, minWidth: 160 },
  { id: 'productionObject', label: '生产对象', width: 180, minWidth: 150 },
  { id: 'workOrder', label: '工单', width: 150, minWidth: 130 },
  { id: 'operation', label: '工序', width: 130, minWidth: 110 },
  { id: 'node', label: '审批节点', width: 130, minWidth: 110 },
  { id: 'result', label: '审批结果', width: 110, minWidth: 96 },
  { id: 'time', label: '到达时间', width: 170, minWidth: 150 },
  { id: 'status', label: '记录状态', width: 110, minWidth: 96 },
  { id: 'actions', label: '操作', width: 128, minWidth: 128 },
];
type FilterDraft = {
  keyword: string; templateName: string; productionObjectNo: string; workOrderNo: string;
  productionObjectType: string; nodeName: string; reviewResult: string; reviewedFrom: string; reviewedTo: string;
};

const headerCellSx = formTableHeaderCellSx;
const bodyCellSx = formTableBodyCellSx;
const fieldSx = formListFieldSx;
const actionHeadSx = { position: 'sticky' as const, right: 0, zIndex: 4, width: 128, minWidth: 128, maxWidth: 128, textAlign: 'center' as const, bgcolor: '#f5f7fa', backgroundClip: 'padding-box', borderLeft: '1px solid #e4e7ed', boxShadow: '-6px 0 8px -8px rgba(0, 0, 0, 0.35)' };
const actionBodySx = { position: 'sticky' as const, right: 0, zIndex: 2, width: 128, minWidth: 128, maxWidth: 128, textAlign: 'center' as const, bgcolor: '#fff', backgroundClip: 'padding-box', borderLeft: '1px solid #e4e7ed', boxShadow: '-6px 0 8px -8px rgba(0, 0, 0, 0.2)' };
const drawerRootSx = { top: 0, bottom: 0, zIndex: (theme: { zIndex: { drawer: number } }) => theme.zIndex.drawer + 2, '& .MuiBackdrop-root': { top: 0 } };
const drawerBackdropSx = { top: 0 };
const drawerPaperSx = { width: { xs: '100vw', sm: 560 }, top: 0, bottom: 0, height: '100vh', transform: 'none !important' };

const views: Array<{ id: ReviewView; label: string; helper: string }> = [
  { id: 'REVIEW_PENDING', label: '我的待办', helper: '当前到达本人、仍可处理的表单审批任务' },
  { id: 'REVIEW_DONE', label: '我的已办', helper: '本人已经成功审批或退回的表单记录' },
];

function formatDateTime(value?: string | null) { return value ? value.replace('T', ' ').slice(0, 19) : '-'; }
function errorText(error: unknown) { return (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error)?.message || '操作失败，请重试'; }
function typeLabel(type?: string | null) { return type === 'SN' ? 'SN' : type === 'BATCH' ? '批次' : type || '-'; }
function reviewResultLabel(action?: string | null) { return action === 'APPROVE' ? '已通过' : action === 'RETURN' ? '已退回' : '-'; }
function statusBadge(status?: string | null) {
  const meta = status === 'COMPLETED' ? { label: '已完成', color: 'success' as const } : { label: '进行中', color: 'info' as const };
  return <StatusBadge {...meta} />;
}
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}><Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e4e7ed', bgcolor: '#f8fafc' }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#303133' }}>{title}</Typography></Box><Box sx={{ p: 1.5 }}>{children}</Box></Box>;
}
function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.35 }}>{label}</Typography><Typography component="div" variant="body2" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value === null || value === undefined || value === '' ? '-' : value}</Typography></Box>;
}
function AuditFieldBlock({ title, fields }: { title: string; fields: ProductionAuditField[] }) {
  return <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#f8fafc', p: 1 }}><Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: '#606266', fontWeight: 600 }}>{title}</Typography><Stack spacing={0.75}>{fields.length === 0 ? <Typography variant="caption" sx={{ color: '#909399' }}>无</Typography> : fields.map((field) => <Box key={field.key} sx={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: 1 }}><Typography variant="caption" sx={{ color: '#606266' }}>{field.label}</Typography><Typography variant="caption" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{field.value}</Typography></Box>)}</Stack></Box>;
}
async function loadProductionAuditLogs(productionObjectId: string, operationId?: string): Promise<AuditLogItem[]> {
  const pageSize = 200;
  const firstResponse = await getAuditLogs({ entityType: 'PRODUCTION_EXECUTION', entityId: productionObjectId, page: 1, size: pageSize });
  const firstPage = (firstResponse.data.data as PageResult<AuditLogItem>) || { content: [], totalPages: 0 };
  const pages = [firstPage];
  for (let page = 2; page <= (firstPage.totalPages ?? 0); page += 1) {
    const response = await getAuditLogs({ entityType: 'PRODUCTION_EXECUTION', entityId: productionObjectId, page, size: pageSize });
    pages.push((response.data.data as PageResult<AuditLogItem>) || { content: [], totalPages: 0 });
  }
  return pages.flatMap((page) => page.content ?? []).filter((item) => {
    if (!operationId) return true;
    const summary = item.dataSummary?.trim();
    if (!summary) return false;
    const separator = summary.lastIndexOf(' · ');
    return (separator >= 0 ? summary.slice(separator + 3).trim() : summary) === operationId;
  });
}
function toPreviewDocument(detail: FormWorklistDetail) {
  const parsed = parseReactTemplateDesignerDocument({ id: detail.templateId, name: detail.templateName || '表单' }, { id: detail.templateVersionId, version: detail.templateVersion || '', modelDesignJson: detail.snapshot.model, canvasDesignJson: detail.snapshot.canvas });
  parsed.model.fields = detail.snapshot.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
  return parsed;
}
function toWorklistIdentity(row: FormWorklistRow): FormWorklistIdentity {
  return { productionObjectId: row.productionObjectId, operationId: row.operationId, formId: row.formId, copyId: row.copyId };
}
function emptyFilters(): FilterDraft { return { keyword: '', templateName: '', productionObjectNo: '', workOrderNo: '', productionObjectType: '', nodeName: '', reviewResult: '', reviewedFrom: '', reviewedTo: '' }; }
function toQuery(filters: FilterDraft, view: ReviewView, page: number, size: number): FormWorklistQuery {
  const query: FormWorklistQuery = { page, size };
  for (const [key, value] of Object.entries(filters)) if (value.trim()) {
    if (key === 'productionObjectType') query.productionObjectType = value as 'BATCH' | 'SN';
    else if (key === 'reviewResult' && view === 'REVIEW_DONE') query.reviewResult = value as 'APPROVE' | 'RETURN';
    else if ((key === 'reviewedFrom' || key === 'reviewedTo') && view === 'REVIEW_DONE') query[key] = value;
    else if (!['reviewResult', 'reviewedFrom', 'reviewedTo'].includes(key)) (query as Record<string, unknown>)[key] = value.trim();
  }
  return query;
}

function ReviewTaskDialog({ view, identity, readOnly, onClose, onChanged }: { view: ReviewView; identity: FormWorklistIdentity | null; readOnly: boolean; onClose: () => void; onChanged: () => void }) {
  const { showMessage } = useSnackbar();
  const detailQuery = useQuery({ queryKey: ['form-review-task', view, identity], queryFn: () => getFormWorklistDetail(view, identity!), enabled: Boolean(identity), retry: false });
  const detail = detailQuery.data as FormWorklistDetail | undefined;
  const document = useMemo(() => detail ? toPreviewDocument(detail) : null, [detail]);
  const [values, setValues] = useState<ExecutionValues>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const [signing, setSigning] = useState<ExecutionButton | null>(null);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [opinion, setOpinion] = useState('');
  useEffect(() => { if (detail) { setValues(detail.fieldValues ?? {}); setDirty(false); setError(''); } }, [identity, detail?.revision]);
  const close = () => { if (busy) return; if (dirty && !readOnly && view === 'REVIEW_PENDING') setConfirmClose(true); else onClose(); };
  const upload = async (file: File) => {
    if (!identity || busy || readOnly) throw new Error('当前无法上传');
    setBusy(true); setDirty(true);
    try { return await uploadExecutionFile(identity.productionObjectId, file); }
    finally { setBusy(false); }
  };
  const references = (fieldId: string, keyword: string) => identity
    ? getExecutionReferences(identity.productionObjectId, identity.operationId, identity.formId, fieldId, keyword)
    : Promise.resolve([]);
  const runAction = async (button: ExecutionButton, signature?: { account: string; password: string; opinion: string }) => {
    if (!identity || !detail || busy) return;
    setBusy(true); setError('');
    try {
      await executeProduction(identity.productionObjectId, { action: button.action, revision: detail.revision, operationId: identity.operationId, formId: identity.formId, instanceId: identity.copyId, values, ...signature });
      setSigning(null); setAccount(''); setPassword(''); setOpinion('');
      showMessage(`${button.label}成功`, 'success'); onChanged(); onClose();
    } catch (reason) { setError(errorText(reason)); setPassword(''); }
    finally { setBusy(false); }
  };
  const chooseAction = (button: ExecutionButton) => {
    if (button.requiresSignature || button.requireOpinion || button.action === 'RETURN') { setSigning(button); setAccount(''); setPassword(''); setOpinion(''); }
    else void runAction(button);
  };
  const actionable = !readOnly && view === 'REVIEW_PENDING' && detail?.controls?.canAct;
  return <>
    <AppDialog open={Boolean(identity)} onClose={close} fullWidth maxWidth="xl" aria-labelledby="form-review-dialog-title" PaperProps={{ sx: { width: 'min(1280px, calc(100vw - 64px))', height: 'min(88vh, 920px)', maxHeight: 'calc(100vh - 48px)', bgcolor: '#fff', borderRadius: 1.5, overflow: 'hidden' } }}>
      <DialogTitle id="form-review-dialog-title" sx={{ minHeight: 64, px: 2.5, py: 1.25, borderBottom: '1px solid #e4e7ed' }}><Typography sx={{ fontSize: 18, fontWeight: 600 }} noWrap>{detail?.templateName || (readOnly ? '查看表单审批' : '处理表单审批')}</Typography><Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.25, color: '#909399' }}>{detail?.instanceNo || '未保存'}{detail?.productionObjectNo ? ` · ${detail.productionObjectNo} · ${detail.operationName}` : ''}</Typography></DialogTitle>
      <DialogContent sx={{ p: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {detailQuery.isFetching ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box> : detailQuery.isError ? <Alert severity="error" sx={{ m: 2 }}>{errorText(detailQuery.error)}</Alert> : detail ? <>
          <Box component="section" aria-label="当前审批信息" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', lg: 'repeat(4,minmax(0,1fr))' }, gap: 2, px: 2.5, py: 1.75, bgcolor: '#fafbfc', borderBottom: '1px solid #e4e7ed' }}><DetailField label="表单实例号" value={detail.instanceNo || '未保存'} /><DetailField label="生产对象" value={`${detail.productionObjectNo || '-'}（${typeLabel(detail.productionObjectType)}）`} /><DetailField label="工单 / 工序" value={`${detail.workOrderNo || '-'} / ${detail.operationName || '-'}`} /><DetailField label="当前审批节点" value={detail.nodeName} /></Box>
          {detail.transferReason ? <Alert severity="info" sx={{ mx: 2.5, mt: 1.5 }}>该任务由 {detail.transferFrom || '其他处理人'} 于 {formatDateTime(detail.transferredAt)} 转办：{detail.transferReason}</Alert> : null}
          {error ? <Alert severity="error" sx={{ mx: 2.5, mt: 1.5 }}>{error}</Alert> : null}
          <Box component="section" aria-label="表单审批内容" sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1.5, md: 2.5 }, bgcolor: '#fff' }}>{document ? <FormCanvasPreview key={`${identity?.operationId}/${identity?.copyId}/${detail.revision}`} document={document} fullPage fieldPermissions={detail.controls?.permissions} runtime={{ values, upload, references, disabled: busy || !actionable, onChange: (id, value) => { setValues((current) => ({ ...current, [id]: value })); setDirty(true); } }} /> : null}</Box>
        </> : null}
      </DialogContent>
      <DialogActions sx={{ minHeight: 64, px: 2.5, py: 1, borderTop: '1px solid #e4e7ed', bgcolor: '#fff' }}><Typography variant="caption" sx={{ mr: 'auto', color: dirty ? '#e6a23c' : '#909399' }}>{dirty ? '有未提交修改' : view === 'REVIEW_DONE' ? `处理结果：${reviewResultLabel(detail?.handledAction)}` : detail?.controls?.nodeName ? `当前节点：${detail.controls.nodeName}` : ''}</Typography><Button onClick={close} disabled={busy}>关闭</Button>{actionable ? detail?.controls.buttons.filter((button) => ['APPROVE', 'RETURN'].includes(button.action)).map((button) => <Button key={button.action} variant={button.action === 'RETURN' ? 'outlined' : 'contained'} color={button.action === 'RETURN' ? 'error' : 'primary'} disabled={busy} onClick={() => chooseAction(button)}>{button.label}{button.requiresSignature ? '并签署' : ''}</Button>) : null}</DialogActions>
    </AppDialog>
    <ConfirmDialog open={confirmClose} title="当前审批内容尚未提交" message="关闭后将放弃本次页面修改，审批任务仍保留在我的待办。" confirmText="放弃修改并关闭" cancelText="继续处理" destructive initialFocus="cancel" onCancel={() => setConfirmClose(false)} onConfirm={() => { setConfirmClose(false); onClose(); }} />
    <AppDialog open={Boolean(signing)} onClose={busy ? undefined : () => setSigning(null)} maxWidth="xs" fullWidth><DialogTitle>{signing?.label}{signing?.requiresSignature ? ' · 账户签署' : ''}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>{signing?.requiresSignature ? <><TextField label="当前操作人账户" value={account} autoComplete="username" onChange={(event) => setAccount(event.target.value)} disabled={busy} /><TextField label="账户密码" value={password} autoComplete="current-password" type="password" onChange={(event) => setPassword(event.target.value)} disabled={busy} /></> : null}<TextField label="处理意见" required={signing?.requireOpinion} value={opinion} onChange={(event) => setOpinion(event.target.value)} multiline minRows={3} disabled={busy} />{error ? <Alert severity="error">{error}</Alert> : null}</Stack></DialogContent><DialogActions><Button disabled={busy} onClick={() => setSigning(null)}>取消</Button><Button variant="contained" disabled={busy || Boolean(signing?.requiresSignature && (!account || !password)) || Boolean(signing?.requireOpinion && !opinion.trim())} onClick={() => { if (signing) void runAction(signing, { account, password, opinion }); }}>{busy ? '正在处理…' : '确认'}</Button></DialogActions></AppDialog>
  </>;
}

export default function FormReviewPage() {
  const { showMessage } = useSnackbar();
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(REVIEW_COLUMNS, 'form-review-column-widths:v1:');
  const [view, setView] = useState<ReviewView>('REVIEW_PENDING');
  const [draft, setDraft] = useState<FilterDraft>(emptyFilters);
  const [filters, setFilters] = useState<FilterDraft>(emptyFilters);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [identity, setIdentity] = useState<FormWorklistIdentity | null>(null);
  const [taskReadOnly, setTaskReadOnly] = useState(true);
  const [detailIdentity, setDetailIdentity] = useState<FormWorklistIdentity | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [transferIdentity, setTransferIdentity] = useState<FormWorklistRow | null>(null);
  const [transferKeyword, setTransferKeyword] = useState('');
  const [transferTarget, setTransferTarget] = useState<ExecutionTransferTarget | null>(null);
  const [transferReason, setTransferReason] = useState('');
  const [transferBusy, setTransferBusy] = useState(false);
  const [transferError, setTransferError] = useState('');
  const queryParams = useMemo(() => toQuery(filters, view, page, size), [filters, view, page, size]);
  const query = useQuery({ queryKey: ['form-review-worklist', view, queryParams], queryFn: () => listFormWorklist(view, queryParams), retry: false, refetchOnMount: 'always' });
  const detailQuery = useQuery({ queryKey: ['form-review-detail', view, detailIdentity], queryFn: () => getFormWorklistDetail(view, detailIdentity!), enabled: Boolean(detailIdentity), retry: false });
  const auditQuery = useQuery({ queryKey: ['form-review-audit', detailIdentity], queryFn: () => loadProductionAuditLogs(detailIdentity!.productionObjectId, detailIdentity!.operationId), enabled: Boolean(detailIdentity && detailTab === 1), retry: false });
  const transferTargetsQuery = useQuery({
    queryKey: ['form-review-transfer-targets', transferIdentity, transferKeyword],
    queryFn: () => getExecutionTransferTargets(transferIdentity!.productionObjectId, transferIdentity!.operationId, transferIdentity!.formId, transferIdentity!.copyId, transferKeyword),
    enabled: Boolean(transferIdentity), retry: false,
  });
  const activeView = views.find((item) => item.id === view)!;
  const visibleColumns = useMemo(() => REVIEW_COLUMNS.filter((column) => column.id !== 'result' || view === 'REVIEW_DONE'), [view]);
  const tableWidth = visibleColumns.reduce((total, column) => total + getColumnWidth(column), 0);
  const rows = query.data?.content ?? [];
  const apply = () => { setFilters(draft); setPage(0); };
  const reset = () => { const next = emptyFilters(); setDraft(next); setFilters(next); setPage(0); };
  const openDetail = (row: FormWorklistRow) => { setDetailIdentity(toWorklistIdentity(row)); setDetailTab(0); };
  const openTask = (row: FormWorklistRow, readOnly: boolean) => { setTaskReadOnly(readOnly); setIdentity(toWorklistIdentity(row)); };
  const openTransfer = (row: FormWorklistRow) => { setTransferIdentity(row); setTransferKeyword(''); setTransferTarget(null); setTransferReason(''); setTransferError(''); };
  const closeTransfer = () => { if (!transferBusy) setTransferIdentity(null); };
  const submitTransfer = async () => {
    if (!transferIdentity || !transferTarget || !transferReason.trim() || transferBusy) return;
    setTransferBusy(true); setTransferError('');
    try {
      await executeProduction(transferIdentity.productionObjectId, { action: 'TRANSFER', revision: transferIdentity.revision, operationId: transferIdentity.operationId, formId: transferIdentity.formId, instanceId: transferIdentity.copyId, targetUserId: transferTarget.id, reason: transferReason.trim() });
      showMessage(`已转办给${transferTarget.name}`, 'success'); setTransferIdentity(null); setDetailIdentity(null); await query.refetch();
    } catch (reason) { setTransferError(errorText(reason)); }
    finally { setTransferBusy(false); }
  };
  const renderField = (key: keyof FilterDraft, label: string, placeholder: string) => <TextField size="small" label={label} placeholder={placeholder} value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} sx={fieldSx} />;
  const filterActions = <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ ...formListFilterActionsSx, gridColumn: expanded ? '1 / -1' : { xs: '1 / -1', md: 'auto' } }}>
    <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={reset} sx={{ height: 40, width: 80, minWidth: 80 }}>重置</Button>
    <Button size="small" variant="contained" startIcon={<Search />} onClick={apply} sx={{ height: 40, width: 80, minWidth: 80 }}>查询</Button>
    <Button size="small" variant="text" endIcon={<ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} sx={{ height: 40, minWidth: 72, px: 1, color: '#1890ff', '&:hover': { bgcolor: '#f5faff' } }}>{expanded ? '收起' : '展开'}</Button>
  </Stack>;
  const detail = detailQuery.data as FormWorklistDetail | undefined;
  return <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box component="section" aria-label="表单审批查询" sx={formListQueryPanelSx}>
        <Box sx={formListQueryGridSx}>
          <TextField size="small" label="关键词" placeholder="实例号、模板、工单或生产对象" value={draft.keyword} onChange={(event) => setDraft((current) => ({ ...current, keyword: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') apply(); }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={fieldSx} />
          {renderField('templateName', '表单模板', '请输入表单模板名称')}
          {expanded ? renderField('productionObjectNo', '生产对象', '请输入批次号或 SN') : filterActions}
          <Collapse in={expanded} timeout={180} unmountOnExit sx={{ gridColumn: '1 / -1' }}><Box sx={formListAdvancedGridSx}>{renderField('workOrderNo', '工单', '请输入工单号')}<TextField select size="small" label="生产对象类型" value={draft.productionObjectType} onChange={(event) => setDraft((current) => ({ ...current, productionObjectType: event.target.value }))} sx={fieldSx}><MenuItem value="">全部</MenuItem><MenuItem value="BATCH">批次</MenuItem><MenuItem value="SN">SN</MenuItem></TextField>{renderField('nodeName', '审批节点', '请输入审批节点名称')}{view === 'REVIEW_DONE' ? <><TextField select size="small" label="审批结果" value={draft.reviewResult} onChange={(event) => setDraft((current) => ({ ...current, reviewResult: event.target.value }))} sx={fieldSx}><MenuItem value="">全部</MenuItem><MenuItem value="APPROVE">已通过</MenuItem><MenuItem value="RETURN">已退回</MenuItem></TextField><TextField type="datetime-local" size="small" label="审批时间起" value={draft.reviewedFrom} onChange={(event) => setDraft((current) => ({ ...current, reviewedFrom: event.target.value }))} InputLabelProps={{ shrink: true }} sx={fieldSx} /><TextField type="datetime-local" size="small" label="审批时间止" value={draft.reviewedTo} onChange={(event) => setDraft((current) => ({ ...current, reviewedTo: event.target.value }))} InputLabelProps={{ shrink: true }} sx={fieldSx} /></> : null}</Box></Collapse>
          {expanded ? filterActions : null}
        </Box>
      </Box>
    <Box sx={{ flex: 1, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', borderBottom: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}><Tabs value={view} onChange={(_, next: ReviewView) => { setView(next); setPage(0); setIdentity(null); setDetailIdentity(null); }} aria-label="表单审批视图"><Tab value="REVIEW_PENDING" label="我的待办" /><Tab value="REVIEW_DONE" label="我的已办" /></Tabs><Tooltip title={activeView.helper} arrow><IconButton size="small" aria-label="当前视图说明" sx={{ color: '#909399' }}><InfoOutlined fontSize="small" /></IconButton></Tooltip></Box>
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', containerType: 'inline-size' }}><Table stickyHeader size="small" sx={{ minWidth: tableWidth, tableLayout: 'fixed', height: query.isFetching || query.isError || rows.length === 0 ? '100%' : 'auto' }}><colgroup>{visibleColumns.map((column) => <col key={column.id} style={{ width: getColumnWidth(column) }} />)}</colgroup><TableHead><TableRow sx={{ '& .MuiTableCell-root': headerCellSx }}>{visibleColumns.map((column) => {
        const width = getColumnWidth(column);
        const label = column.id === 'time' && view === 'REVIEW_DONE' ? '审批时间' : column.label;
        return <TableCell key={column.id} align={column.id === 'actions' ? 'center' : undefined} sx={{ ...headerCellSx, position: 'relative', width, minWidth: width, maxWidth: width, ...(column.id === 'actions' ? actionHeadSx : {}) }}>{label}{column.id !== 'actions' ? <Box aria-hidden="true" data-column-resize-handle={column.id} sx={listColumnResizeHandleSx} {...getResizeHandleProps(column)} /> : null}</TableCell>;
      })}</TableRow></TableHead><TableBody>
        {query.isFetching ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#909399' }}>正在加载审批任务…</TableStateCell></TableRow> : query.isError ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#c62828' }}>表单审批列表加载失败：{errorText(query.error)}</TableStateCell></TableRow> : rows.length === 0 ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#909399' }}>{view === 'REVIEW_PENDING' ? '暂无待处理的表单审批任务' : '暂无已办表单审批记录'}</TableStateCell></TableRow> : rows.map((row) => <TableRow key={`${row.productionObjectId}/${row.operationId}/${row.copyId}`} hover tabIndex={0} aria-label={`查看${row.templateName || '表单'}审批详情`} onClick={() => openDetail(row)} onKeyDown={(event) => { if (event.key === 'Enter') openDetail(row); }} sx={{ cursor: 'pointer', '& .MuiTableCell-root': bodyCellSx }}><TableCell title={row.instanceNo || '未保存'}>{row.instanceNo || '未保存'}</TableCell><TableCell title={`${row.templateName || '-'} · ${row.templateVersion || '-'}`}>{row.templateName || '-'} <Typography component="span" variant="caption" color="text.secondary">· {row.templateVersion || '-'}</Typography></TableCell><TableCell title={row.productionObjectNo || '-'}>{row.productionObjectNo || '-'} <Typography component="span" variant="caption" color="text.secondary">· {typeLabel(row.productionObjectType)}</Typography></TableCell><TableCell title={row.workOrderNo || '-'}>{row.workOrderNo || '-'}</TableCell><TableCell title={row.operationName}>{row.operationName}</TableCell><TableCell title={row.nodeName || '-'}>{row.nodeName || '-'}</TableCell>{view === 'REVIEW_DONE' ? <TableCell>{reviewResultLabel(row.handledAction)}</TableCell> : null}<TableCell>{formatDateTime(view === 'REVIEW_DONE' ? row.handledAt : row.arrivedAt)}</TableCell><TableCell>{statusBadge(row.recordStatus)}</TableCell><TableCell sx={actionBodySx} onClick={(event) => event.stopPropagation()}><Stack direction="row" spacing={0} justifyContent="center">{view === 'REVIEW_PENDING' ? <><Tooltip title="处理" arrow><IconButton color="primary" size="small" aria-label="处理审批" onClick={() => openTask(row, false)}><PlayCircleOutline fontSize="small" /></IconButton></Tooltip>{row.canTransfer ? <Tooltip title={row.transferLabel || '转办'} arrow><IconButton color={row.transferStyle === 'DANGER' ? 'error' : row.transferStyle === 'PRIMARY' ? 'primary' : 'default'} size="small" aria-label={row.transferLabel || '转办审批'} onClick={() => openTransfer(row)}><SwapHoriz fontSize="small" /></IconButton></Tooltip> : null}</> : null}<Tooltip title="查看" arrow><IconButton size="small" aria-label="查看审批" onClick={() => openTask(row, true)}><PreviewOutlined fontSize="small" /></IconButton></Tooltip></Stack></TableCell></TableRow>)}
      </TableBody></Table></TableContainer>
      <FormListPagination totalElements={query.data?.totalElements ?? 0} totalPages={query.data?.totalPages ?? 0} page={page} pageSize={size} onPageChange={setPage} onPageSizeChange={(value) => { setSize(value); setPage(0); }} />
    </Box>
    <Drawer anchor="right" open={Boolean(detailIdentity)} onClose={() => setDetailIdentity(null)} sx={drawerRootSx} slotProps={{ backdrop: { sx: drawerBackdropSx } }} PaperProps={{ sx: drawerPaperSx }}>
      <Box sx={{ minHeight: '100%', overflow: 'auto', bgcolor: '#f7f9fc', p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>信息查看</Typography>
          <IconButton size="small" aria-label="关闭信息查看" onClick={() => setDetailIdentity(null)}><Close fontSize="small" /></IconButton>
        </Stack>
        {detailQuery.isFetching ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box> : detailQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>{errorText(detailQuery.error)}</Typography> : detail ? <>
          <Box sx={{ borderBottom: '1px solid #e4e7ed' }}>
            <Tabs value={detailTab} onChange={(_, value) => setDetailTab(value)} aria-label="表单审批详情切换">
              <Tab label="数据信息" />
              <Tab label="数据审计" />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2 }}>
            {detailTab === 0 ? <Stack spacing={1.5}><DetailSection title="表单信息"><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 2 }}><DetailField label="表单实例号" value={detail.instanceNo || '未保存'} /><DetailField label="表单模板" value={`${detail.templateName || '-'} · ${detail.templateVersion || '-'}`} /><DetailField label="审批节点" value={detail.nodeName} /><DetailField label="审批结果" value={view === 'REVIEW_DONE' ? reviewResultLabel(detail.handledAction) : '待处理'} /><DetailField label="记录状态" value={statusBadge(detail.recordStatus)} /><DetailField label="处理时间" value={formatDateTime(detail.handledAt)} />{detail.transferReason ? <><DetailField label="转办来源" value={`${detail.transferFrom || '-'} · ${formatDateTime(detail.transferredAt)}`} /><DetailField label="转办原因" value={detail.transferReason} /></> : null}</Box></DetailSection><DetailSection title="生产来源"><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 2 }}><DetailField label="生产对象" value={`${detail.productionObjectNo || '-'}（${typeLabel(detail.productionObjectType)}）`} /><DetailField label="工单" value={detail.workOrderNo} /><DetailField label="工序" value={detail.operationName} /></Box></DetailSection><DetailSection title="本人处理记录"><Stack spacing={1}>{detail.myEvents.length === 0 ? <Typography variant="body2" color="text.secondary">暂无本人处理记录</Typography> : detail.myEvents.map((event, index) => <Box key={`${event.at}/${event.nodeId}/${index}`} sx={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 1, py: 0.75, borderBottom: index === detail.myEvents.length - 1 ? 0 : '1px solid #ebeef5' }}><Typography variant="body2">{reviewResultLabel(event.actionCode)}</Typography><Typography variant="body2" color="text.secondary">{event.nodeName}</Typography><Typography variant="caption" color="text.secondary">{formatDateTime(event.at)}</Typography></Box>)}</Stack></DetailSection></Stack> : auditQuery.isFetching ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box> : auditQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>审计记录加载失败</Typography> : <Stack spacing={1}>{(auditQuery.data ?? []).length === 0 ? <Typography variant="body2" color="text.secondary">暂无审计记录</Typography> : (auditQuery.data ?? []).map((item) => <DetailSection key={item.id} title={`${item.actionLabel || item.action || '-'} · ${formatDateTime(item.operationTime || item.createdAt)}`}><Stack spacing={1}><DetailField label="操作人" value={item.operatorDisplayName || item.operatorAccount || item.operatorId} />{item.reason ? <DetailField label="原因" value={item.reason} /> : null}<DetailField label="摘要" value={item.dataSummary} /><AuditFieldBlock title="变更前" fields={toProductionAuditFields(item.contentBefore, { objectStatus: '生产对象状态' })} /><AuditFieldBlock title="变更后" fields={toProductionAuditFields(item.contentAfter, { objectStatus: '生产对象状态' })} /></Stack></DetailSection>)}</Stack>}
          </Box>
        </> : null}
      </Box>
    </Drawer>
    <ReviewTaskDialog view={view} identity={identity} readOnly={taskReadOnly} onClose={() => setIdentity(null)} onChanged={() => { void query.refetch(); setDetailIdentity(null); }} />
    <AppDialog
      open={Boolean(transferIdentity)}
      onClose={closeTransfer}
      maxWidth="sm"
      fullWidth
      aria-labelledby="form-review-transfer-title"
      PaperProps={{ sx: { width: 'min(640px, calc(100vw - 32px))', maxHeight: 'min(720px, calc(100vh - 48px))', borderRadius: 1.5, overflow: 'hidden', bgcolor: '#fff' } }}
    >
      <DialogTitle id="form-review-transfer-title" sx={{ minHeight: 64, px: 2.5, py: 1.25, borderBottom: '1px solid #e4e7ed' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }} noWrap>转办表单审批</Typography>
        <Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.25, color: '#909399' }}>
          {transferIdentity?.templateName || '-'} · {transferIdentity?.instanceNo || '未保存'} · {transferIdentity?.nodeName || '-'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 2.5, py: 2.5, bgcolor: '#fff' }}>
        <Stack spacing={2}>
          <Box sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e4e7ed', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#303133' }}>当前审批任务</Typography>
            <Typography variant="caption" color="text.secondary">仅可转办给当前审批节点授权范围内的其他启用用户</Typography>
          </Box>
          <Autocomplete
            openOnFocus
            options={transferTargetsQuery.data ?? []}
            value={transferTarget}
            loading={transferTargetsQuery.isFetching}
            filterOptions={(options) => options}
            getOptionLabel={(option) => `${option.name}（${option.username}）`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') {
                setTransferKeyword(value);
                setTransferTarget(null);
              }
            }}
            onChange={(_, value) => setTransferTarget(value)}
            disabled={transferBusy}
            loadingText="正在加载可转办用户…"
            noOptionsText={transferTargetsQuery.isError ? '候选用户加载失败，请稍后重试' : transferKeyword.trim() ? '没有找到匹配的可转办用户' : '当前授权范围内没有其他可转办用户'}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start !important', gap: 0.25 }}>
                <Typography variant="body2" sx={{ color: '#303133' }}>{option.name}</Typography>
                <Typography variant="caption" sx={{ color: '#909399' }}>{option.username}</Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="转办给"
                required
                placeholder="输入姓名或账号查询"
                error={transferTargetsQuery.isError}
                helperText={transferTargetsQuery.isError ? '请检查网络或稍后重试' : '审批节点配置的部门/角色会先解析为具体用户，转办时选择一名用户'}
              />
            )}
          />
          {transferTargetsQuery.isSuccess && transferTargetsQuery.data.length === 0 ? <Alert severity="warning" variant="outlined">{transferKeyword.trim() ? '没有找到匹配的可转办用户，请尝试其他姓名或账号。' : '当前审批主体范围内没有可转办的其他用户。请检查审批节点的用户、部门或角色成员是否已启用；不能转办给当前处理人。'}</Alert> : null}
          <TextField label="转办原因" required value={transferReason} onChange={(event) => setTransferReason(event.target.value)} multiline minRows={3} inputProps={{ maxLength: 500 }} helperText={`${transferReason.length}/500`} disabled={transferBusy} />
          <Alert severity="info">转办不会推进审批流程，也不会修改表单内容；受让人处理后，流程才会继续。</Alert>
          {transferError ? <Alert severity="error">{transferError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ minHeight: 64, px: 2.5, py: 1, borderTop: '1px solid #e4e7ed', bgcolor: '#fff' }}>
        <Button onClick={closeTransfer} disabled={transferBusy}>取消</Button>
        <Button variant="contained" onClick={() => void submitTransfer()} disabled={transferBusy || !transferTarget || !transferReason.trim()}>{transferBusy ? '正在转办…' : '确认转办'}</Button>
      </DialogActions>
    </AppDialog>
  </Box>;
}
