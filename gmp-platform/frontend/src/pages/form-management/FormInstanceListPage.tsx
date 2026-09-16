import { Fragment, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Popover,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Close,
  DragIndicator,
  ExpandMore,
  RestartAlt,
  Search,
  ViewColumnRounded,
} from '@mui/icons-material';
import TableStateCell from '@/components/TableStateCell';
import StatusBadge from '@/components/StatusBadge';
import { useSnackbar } from '@/components/SnackbarProvider';
import { getAuditLogs, type AuditLogItem } from '@/api/audit';
import {
  getGlobalFormInstance,
  listGlobalFormInstances,
  type GlobalFormInstanceDetail,
  type GlobalFormInstanceQuery,
  type GlobalFormInstanceSummary,
} from '@/api/form-instance-records';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { toProductionAuditFields, type ProductionAuditField } from '@/utils/productionAudit';
import type { PageResult } from '@/types/common';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];
const STORAGE_KEY_PREFIX = 'form-management-list-columns-';

type ColumnId = 'instanceNo' | 'template' | 'source' | 'workOrder' | 'operation' | 'status' | 'createdAt' | 'updatedAt';
interface ListColumn { id: ColumnId; label: string; width: number; minWidth: number }
interface ColumnSettings { order: ColumnId[]; hidden: ColumnId[]; widths: Partial<Record<ColumnId, number>> }

const columns: ListColumn[] = [
  { id: 'instanceNo', label: '实例编号', width: 180, minWidth: 150 },
  { id: 'template', label: '表单模板', width: 220, minWidth: 180 },
  { id: 'source', label: '生产对象', width: 190, minWidth: 160 },
  { id: 'workOrder', label: '工单', width: 170, minWidth: 140 },
  { id: 'operation', label: '工序', width: 150, minWidth: 120 },
  { id: 'status', label: '状态', width: 100, minWidth: 90 },
  { id: 'createdAt', label: '创建时间', width: 165, minWidth: 148 },
  { id: 'updatedAt', label: '更新时间', width: 165, minWidth: 148 },
];

const headerCellSx = { bgcolor: '#f5f7fa', color: '#606266', fontWeight: 600, whiteSpace: 'nowrap', height: 48, py: 0, borderBottom: '1px solid #e4e7ed' };
const bodyCellSx = { height: 40, py: 0.5, borderBottom: '1px solid #ebeef5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const fieldSx = { '& .MuiInputBase-root': { height: 40 }, '& .MuiInputBase-input': { boxSizing: 'border-box' } };
const drawerRootSx = { top: 0, bottom: 0, zIndex: (theme: { zIndex: { drawer: number } }) => theme.zIndex.drawer + 2, '& .MuiBackdrop-root': { top: 0 } };
const drawerPaperSx = { width: { xs: '100vw', sm: 560 }, top: 0, bottom: 0, height: '100vh', transform: 'none !important' };

function formatDateTime(value?: string | null) { return value ? value.replace('T', ' ').slice(0, 19) : '-'; }
function typeLabel(type?: string | null) { return type === 'SN' ? 'SN' : type === 'BATCH' ? '批次' : type || '-'; }
function statusBadge(status?: string | null) {
  const meta: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
    ACTIVE: { label: '进行中', color: 'info' }, COMPLETED: { label: '已完成', color: 'success' },
  };
  const item = meta[status || ''] || { label: status || '-', color: 'default' as const };
  return <StatusBadge label={item.label} color={item.color} />;
}

function getCurrentUserPreferenceStorageKey(prefix: string) {
  if (typeof window === 'undefined') return `${prefix}anonymous`;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null') as { id?: string | number; username?: string; displayName?: string } | null;
    return `${prefix}${user?.id ?? user?.username ?? user?.displayName ?? 'anonymous'}`;
  } catch {
    return `${prefix}anonymous`;
  }
}

function readSettings(storageKey: string): ColumnSettings {
  const order = columns.map((column) => column.id);
  if (typeof window === 'undefined') return { order, hidden: [], widths: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || 'null') as Partial<ColumnSettings> | null;
    const known = new Set(order);
    const nextOrder = [...(raw?.order || []).filter((id): id is ColumnId => known.has(id)), ...order.filter((id) => !(raw?.order || []).includes(id))];
    const normalizedOrder = [...new Set(nextOrder)];
    const hidden = (raw?.hidden || []).filter((id): id is ColumnId => known.has(id)).filter((id) => normalizedOrder.includes(id));
    const safeHidden = hidden.length >= normalizedOrder.length ? hidden.slice(0, Math.max(0, normalizedOrder.length - 1)) : hidden;
    const widths = Object.fromEntries(Object.entries(raw?.widths || {}).filter(([id, value]) => known.has(id as ColumnId) && typeof value === 'number' && Number.isFinite(value) && value > 0)) as Partial<Record<ColumnId, number>>;
    return { order: normalizedOrder, hidden: safeHidden, widths };
  } catch { return { order, hidden: [], widths: {} }; }
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
    <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e4e7ed', bgcolor: '#f8fafc' }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#303133' }}>{title}</Typography></Box>
    <Box sx={{ p: 1.5 }}>{children}</Box>
  </Box>;
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.35 }}>{label}</Typography><Typography component="div" variant="body2" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value === null || value === undefined || value === '' ? '-' : value}</Typography></Box>;
}

function AuditFieldBlock({ title, fields }: { title: string; fields: ProductionAuditField[] }) {
  return <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#f8fafc', p: 1, minWidth: 0 }}><Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: '#606266', fontWeight: 600 }}>{title}</Typography><Stack spacing={0.75}>{fields.length === 0 ? <Typography variant="caption" sx={{ color: '#909399' }}>无</Typography> : fields.map((field) => <Box key={field.key} sx={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: 1 }}><Typography variant="caption" sx={{ color: '#606266' }}>{field.label}</Typography><Typography variant="caption" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{field.value}</Typography></Box>)}</Stack></Box>;
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
  const content = pages.flatMap((page) => page.content ?? []);
  if (!operationId) return content;
  return content.filter((item) => {
    const summary = item.dataSummary?.trim();
    if (!summary) return false;
    const separatorIndex = summary.lastIndexOf(' · ');
    const summaryOperationId = separatorIndex >= 0 ? summary.slice(separatorIndex + 3).trim() : summary;
    return summaryOperationId === operationId;
  });
}

function FormInstanceDetailDrawer({ recordId, tab, onTabChange, onClose }: { recordId: string | null; tab: number; onTabChange: (value: number) => void; onClose: () => void }) {
  const detailQuery = useQuery({ queryKey: ['global-form-instance-detail', recordId], queryFn: () => getGlobalFormInstance(recordId!), enabled: Boolean(recordId), retry: false });
  const productionObjectId = detailQuery.data?.source.productionObjectId;
  const operationId = detailQuery.data?.source.operationId;
  const auditQuery = useQuery({
    queryKey: ['form-instance-audit', recordId, productionObjectId, operationId], enabled: Boolean(recordId && productionObjectId && tab === 1),
    queryFn: () => loadProductionAuditLogs(productionObjectId!, operationId),
  });
  const detail = detailQuery.data;
  const document = useMemo(() => {
    if (!detail) return null;
    const snapshot = detail.snapshot;
    const parsed = parseReactTemplateDesignerDocument({ id: detail.templateId, name: snapshot.name }, { id: detail.templateVersionId, version: snapshot.version, modelDesignJson: snapshot.model, canvasDesignJson: snapshot.canvas });
    parsed.model.fields = snapshot.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
    return parsed;
  }, [detail]);
  return <Drawer anchor="right" open={Boolean(recordId)} onClose={onClose} sx={drawerRootSx} slotProps={{ backdrop: { sx: drawerRootSx } }} PaperProps={{ sx: drawerPaperSx }}>
    <Box sx={{ minHeight: '100%', overflow: 'auto', bgcolor: '#f7f9fc', p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>信息查看</Typography><IconButton size="small" onClick={onClose} aria-label="关闭详情"><Close fontSize="small" /></IconButton></Stack>
      {detailQuery.isFetching ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box> : detailQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>表单记录加载失败</Typography> : detail ? <>
        <Box sx={{ borderBottom: '1px solid #e4e7ed' }}><Tabs value={tab} onChange={(_, value: number) => onTabChange(value)} aria-label="表单实例详情切换"><Tab label="数据信息" /><Tab label="数据审计" /></Tabs></Box>
        {tab === 0 ? <Stack spacing={2} sx={{ mt: 2 }}>
          <DetailSection title="表单信息"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
            <DetailField label="实例编号" value={detail.instanceNo} /><DetailField label="模板名称" value={detail.templateName} />
            <DetailField label="模板编码" value={detail.templateCode} /><DetailField label="模板版本" value={detail.templateVersion} />
            <DetailField label="记录状态" value={statusBadge(detail.recordStatus)} /><DetailField label="历史记录" value={detail.legacy ? '是' : '否'} />
            <DetailField label="创建人" value={detail.createdByName || '-'} /><DetailField label="创建时间" value={formatDateTime(detail.createdAt)} />
            <DetailField label="更新人" value={detail.updatedByName || '-'} /><DetailField label="更新时间" value={formatDateTime(detail.updatedAt)} />
          </Box></DetailSection>
          <DetailSection title="生产来源"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
            <DetailField label="生产对象" value={`${detail.source.productionObjectNo || '-'}（${typeLabel(detail.source.productionObjectType)}）`} /><DetailField label="工单" value={detail.source.workOrderNo || '-'} />
            <DetailField label="工序" value={detail.source.operationName || '-'} /><DetailField label="表单来源" value="生产执行" />
          </Box></DetailSection>
          {document ? <DetailSection title="表单内容"><FormCanvasPreview document={document} runtime={{ values: detail.fieldValues, disabled: true, onChange: () => {} }} /></DetailSection> : <DetailSection title="表单数据"><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(detail.fieldValues, null, 2)}</Typography></DetailSection>}
        </Stack> : <Stack spacing={1} sx={{ mt: 2 }}>
          {auditQuery.isFetching ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box> : auditQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>数据审计加载失败</Typography> : auditQuery.data?.length ? auditQuery.data.map((item) => <Accordion key={item.id} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}><AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ minHeight: 44, px: 1.5, '&.Mui-expanded': { minHeight: 44 }, '& .MuiAccordionSummary-content': { my: 0 }, '& .MuiAccordionSummary-content.Mui-expanded': { my: 0 } }}><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', columnGap: 1, width: '100%', minWidth: 0 }}><Typography variant="body2" noWrap>{item.operatorDisplayName || item.operatorAccount || '-'}</Typography><Typography variant="body2" noWrap>{item.actionLabel || item.action || '-'}</Typography><Typography variant="body2" noWrap sx={{ color: '#606266' }}>{formatDateTime(item.operationTime || item.createdAt)}</Typography></Box></AccordionSummary><AccordionDetails sx={{ pt: 0, pb: 1.5 }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}><AuditFieldBlock title="变更前" fields={toProductionAuditFields(item.contentBefore, { objectStatus: '生产对象状态' })} /><AuditFieldBlock title="变更后" fields={toProductionAuditFields(item.contentAfter, { objectStatus: '生产对象状态' })} /></Box></AccordionDetails></Accordion>) : <Typography sx={{ py: 8, textAlign: 'center', color: '#909399' }}>暂无审计记录</Typography>}
        </Stack>}
      </> : null}
    </Box>
  </Drawer>;
}

export default function FormInstanceListPage() {
  const { showMessage } = useSnackbar();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [draft, setDraft] = useState({ instanceNo: '', templateCode: '', templateName: '', productionObjectNo: '', productionObjectType: '', workOrderNo: '', recordStatus: '', keyword: '', createdFrom: '', createdTo: '' });
  const [filters, setFilters] = useState(draft);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState<HTMLButtonElement | null>(null);
  const storageKey = useMemo(() => getCurrentUserPreferenceStorageKey(STORAGE_KEY_PREFIX), []);
  const [settings, setSettings] = useState<ColumnSettings>(() => readSettings(storageKey));
  const [dragging, setDragging] = useState<ColumnId | null>(null);
  const resizeRef = useRef<{ id: ColumnId; startX: number; startWidth: number } | null>(null);
  const query = useQuery({
    queryKey: ['form-management-global-list', page, pageSize, filters],
    queryFn: async () => {
      const queryParams: GlobalFormInstanceQuery = { page, size: pageSize, ...filters, productionObjectType: (filters.productionObjectType || undefined) as 'BATCH' | 'SN' | undefined, recordStatus: filters.recordStatus ? [filters.recordStatus as 'ACTIVE' | 'COMPLETED'] : undefined };
      Object.keys(queryParams).forEach((key) => { const typedKey = key as keyof GlobalFormInstanceQuery; if (queryParams[typedKey] === '') delete queryParams[typedKey]; });
      return listGlobalFormInstances(queryParams);
    },
  });
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* preferences are optional */ } }, [settings, storageKey]);
  useEffect(() => { if (query.isError) showMessage(query.error instanceof Error ? query.error.message : '表单列表加载失败', 'error'); }, [query.isError, query.error, showMessage]);
  const rows = query.data?.content ?? [];
  const visibleColumns = useMemo(() => settings.order.flatMap((id) => {
    const column = columns.find((item) => item.id === id);
    return column && !settings.hidden.includes(id) ? [column] : [];
  }), [settings]);
  const columnWidth = (column: ListColumn) => Math.max(column.minWidth, settings.widths[column.id] ?? column.width);
  const openDetail = (id: string) => { setRecordId(id); setDetailTab(0); };
  const submitSearch = () => { setPage(0); setFilters({ ...draft, instanceNo: draft.instanceNo.trim(), templateCode: draft.templateCode.trim(), templateName: draft.templateName.trim(), productionObjectNo: draft.productionObjectNo.trim(), workOrderNo: draft.workOrderNo.trim(), keyword: draft.keyword.trim() }); };
  const resetSearch = () => { const empty = { instanceNo: '', templateCode: '', templateName: '', productionObjectNo: '', productionObjectType: '', workOrderNo: '', recordStatus: '', keyword: '', createdFrom: '', createdTo: '' }; setDraft(empty); setFilters(empty); setPage(0); };
  const toggleColumn = (id: ColumnId) => setSettings((current) => ({ ...current, hidden: current.hidden.includes(id) ? current.hidden.filter((item) => item !== id) : current.hidden.length >= current.order.length - 1 ? current.hidden : [...current.hidden, id] }));
  const moveColumn = (from: ColumnId, to: ColumnId) => setSettings((current) => { const order = [...current.order]; const fromIndex = order.indexOf(from); const toIndex = order.indexOf(to); if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return current; order.splice(fromIndex, 1); order.splice(toIndex, 0, from); return { ...current, order }; });
  const beginColumnResize = (event: ReactPointerEvent<HTMLDivElement>, column: ListColumn) => {
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = { id: column.id, startX: event.clientX, startWidth: columnWidth(column) };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const renderCell = (row: GlobalFormInstanceSummary, column: ListColumn) => {
    switch (column.id) {
      case 'instanceNo': return <TableCell key={column.id} sx={bodyCellSx}><Typography component="button" type="button" onClick={() => openDetail(row.formInstanceId)} sx={{ p: 0, border: 0, bgcolor: 'transparent', font: 'inherit', color: '#1890ff', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{row.instanceNo}</Typography></TableCell>;
      case 'template': return <TableCell key={column.id} sx={bodyCellSx} title={`${row.templateName || '-'} · ${row.templateVersion || '-'}`}>{row.templateName || '-'} <Typography component="span" variant="caption" sx={{ color: '#909399' }}>· {row.templateVersion || '-'}</Typography></TableCell>;
      case 'source': return <TableCell key={column.id} sx={bodyCellSx} title={row.source.productionObjectNo || ''}>{row.source.productionObjectNo || '-'} <Typography component="span" variant="caption" sx={{ color: '#909399' }}>· {typeLabel(row.source.productionObjectType)}</Typography></TableCell>;
      case 'workOrder': return <TableCell key={column.id} sx={bodyCellSx}>{row.source.workOrderNo || '-'}</TableCell>;
      case 'operation': return <TableCell key={column.id} sx={bodyCellSx}>{row.source.operationName || '-'}</TableCell>;
      case 'status': return <TableCell key={column.id} sx={bodyCellSx}>{statusBadge(row.recordStatus)}</TableCell>;
      case 'createdAt': return <TableCell key={column.id} sx={bodyCellSx}>{formatDateTime(row.createdAt)}</TableCell>;
      case 'updatedAt': return <TableCell key={column.id} sx={bodyCellSx}>{formatDateTime(row.updatedAt)}</TableCell>;
    }
  };
  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
    <Box sx={{ flex: '0 0 auto', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', p: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center' }}>
        <TextField size="small" label="实例编号" placeholder="请输入实例编号" value={draft.instanceNo} onChange={(event) => setDraft({ ...draft, instanceNo: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} sx={fieldSx} />
        <TextField size="small" label="模板名称" placeholder="请输入模板名称" value={draft.templateName} onChange={(event) => setDraft({ ...draft, templateName: event.target.value })} sx={fieldSx} />
        <TextField size="small" label="模板编码" placeholder="请输入模板编码" value={draft.templateCode} onChange={(event) => setDraft({ ...draft, templateCode: event.target.value })} sx={fieldSx} />
        <TextField size="small" label="生产对象号" placeholder="请输入批次号或SN" value={draft.productionObjectNo} onChange={(event) => setDraft({ ...draft, productionObjectNo: event.target.value })} sx={fieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        <TextField size="small" label="工单号" placeholder="请输入工单号" value={draft.workOrderNo} onChange={(event) => setDraft({ ...draft, workOrderNo: event.target.value })} sx={fieldSx} />
        <TextField select size="small" label="生产对象类型" value={draft.productionObjectType} onChange={(event) => setDraft({ ...draft, productionObjectType: event.target.value })} sx={fieldSx}><MenuItem value="">全部</MenuItem><MenuItem value="BATCH">批次</MenuItem><MenuItem value="SN">SN</MenuItem></TextField>
        <TextField select size="small" label="记录状态" value={draft.recordStatus} onChange={(event) => setDraft({ ...draft, recordStatus: event.target.value })} sx={fieldSx}><MenuItem value="">全部</MenuItem><MenuItem value="ACTIVE">进行中</MenuItem><MenuItem value="COMPLETED">已完成</MenuItem></TextField>
        <TextField size="small" type="datetime-local" label="创建时间起" value={draft.createdFrom} onChange={(event) => setDraft({ ...draft, createdFrom: event.target.value })} sx={fieldSx} InputLabelProps={{ shrink: true }} />
        <TextField size="small" type="datetime-local" label="创建时间止" value={draft.createdTo} onChange={(event) => setDraft({ ...draft, createdTo: event.target.value })} sx={fieldSx} InputLabelProps={{ shrink: true }} />
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end"><Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={resetSearch} sx={{ height: 40, width: 80, minWidth: 80 }}>重置</Button><Button size="small" variant="contained" startIcon={<Search />} onClick={submitSearch} sx={{ height: 40, width: 80, minWidth: 80 }}>查询</Button></Stack>
      </Box>
    </Box>
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', minHeight: 48, px: 2, borderBottom: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: '#606266' }}>表单记录</Typography>
        <Tooltip title="字段设置"><IconButton size="small" aria-label="字段设置" onClick={(event) => setSettingsOpen(event.currentTarget)} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1 }}><ViewColumnRounded fontSize="small" /></IconButton></Tooltip>
      </Box>
      <Popover open={Boolean(settingsOpen)} anchorEl={settingsOpen} onClose={() => setSettingsOpen(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} PaperProps={{ sx: { mt: 1, width: 240, border: '1px solid #e4e7ed', borderRadius: 1 } }}>
        <Stack spacing={0.5} sx={{ p: 1.5 }}>{settings.order.map((id) => { const column = columns.find((item) => item.id === id)!; const checked = !settings.hidden.includes(id); return <Box key={id} draggable onDragStart={() => setDragging(id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragging) moveColumn(dragging, id); setDragging(null); }} onDragEnd={() => setDragging(null)} sx={{ display: 'grid', gridTemplateColumns: '24px 30px minmax(0, 1fr)', alignItems: 'center', minHeight: 36, cursor: 'move', '&:hover': { bgcolor: '#f5f7fa' } }}><DragIndicator fontSize="small" sx={{ color: '#909399' }} /><input type="checkbox" aria-label={`${column.label}字段显隐`} checked={checked} disabled={checked && settings.hidden.length >= settings.order.length - 1} onChange={() => toggleColumn(id)} onClick={(event) => event.stopPropagation()} /><Typography variant="body2" noWrap>{column.label}</Typography></Box>; })}</Stack>
      </Popover>
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}><Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: visibleColumns.reduce((total, column) => total + columnWidth(column), 0), height: query.isLoading || query.isError || rows.length === 0 ? '100%' : 'auto' }}>
        <colgroup>{visibleColumns.map((column) => <col key={column.id} style={{ width: columnWidth(column) }} />)}</colgroup>
        <TableHead><TableRow sx={{ '& .MuiTableCell-root': headerCellSx }}>{visibleColumns.map((column) => <TableCell key={column.id} sx={{ width: columnWidth(column), minWidth: column.minWidth, position: 'sticky', top: 0, zIndex: 2, userSelect: 'none' }}>{column.label}<Box aria-label={`调整${column.label}列宽`} onPointerDown={(event) => beginColumnResize(event, column)} onPointerMove={(event) => { const start = resizeRef.current; if (start?.id === column.id) setSettings((current) => ({ ...current, widths: { ...current.widths, [column.id]: Math.max(column.minWidth, start.startWidth + event.clientX - start.startX) } })); }} onPointerUp={() => { resizeRef.current = null; }} onPointerCancel={() => { resizeRef.current = null; }} onLostPointerCapture={() => { resizeRef.current = null; }} sx={{ position: 'absolute', top: 0, right: -3, width: 8, height: '100%', cursor: 'col-resize', zIndex: 3, touchAction: 'none', '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 18, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }} /></TableCell>)}</TableRow></TableHead>
        <TableBody>{query.isLoading ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#909399' }}>加载中...</TableStateCell></TableRow> : query.isError ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#c62828' }}>{query.error instanceof Error ? query.error.message : '表单列表加载失败'}</TableStateCell></TableRow> : rows.length === 0 ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#909399' }}>暂无数据</TableStateCell></TableRow> : rows.map((row) => <TableRow key={row.formInstanceId} hover tabIndex={0} onClick={() => openDetail(row.formInstanceId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetail(row.formInstanceId); } }} sx={{ cursor: 'pointer', '& > .MuiTableCell-root': bodyCellSx }} aria-label={`查看表单实例 ${row.instanceNo}`}>{visibleColumns.map((column) => <Fragment key={column.id}>{renderCell(row, column)}</Fragment>)}</TableRow>)}</TableBody>
      </Table></TableContainer>
      <Box sx={{ flex: '0 0 auto', minHeight: 56, px: 2, borderTop: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><Typography variant="body2" sx={{ color: '#606266', whiteSpace: 'nowrap' }}>共 {query.data?.totalElements ?? 0} 条数据</Typography><Stack direction="row" spacing={1.5} alignItems="center">{(query.data?.totalPages ?? 0) > 1 && <Pagination size="small" page={page + 1} count={query.data?.totalPages ?? 0} onChange={(_, value) => setPage(value - 1)} />}<FormControl size="small" sx={{ minWidth: 104 }}><Select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} inputProps={{ 'aria-label': '每页条数' }}>{PAGE_SIZE_OPTIONS.map((size) => <MenuItem key={size} value={size}>{size} 条/页</MenuItem>)}</Select></FormControl></Stack></Box>
    </Box>
    <FormInstanceDetailDrawer recordId={recordId} tab={detailTab} onTabChange={setDetailTab} onClose={() => setRecordId(null)} />
  </Box>;
}
