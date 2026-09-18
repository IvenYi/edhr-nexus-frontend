import { readRecordLocation } from '@/utils/recordLocation';
import TableStateCell from '@/components/TableStateCell';
import { listColumnResizeHandleSx, listTableHeaderCellSx } from '@/components/listTableStyles';
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Cancel, Close, ContentCopyOutlined, DescriptionOutlined, ExpandMore, InfoOutlined, PlayCircleOutline, RestartAlt, Search, StopCircleOutlined, TuneRounded, ViewColumnRounded } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';
import StatusBadge from '@/components/StatusBadge';
import { getAuditLogs, type AuditLogItem } from '@/api/audit';
import { cancelProductionObject, endProductionObject, listBatches, type BatchRecord } from '@/api/work-orders';
import type { PageResult } from '@/types/common';
import { toProductionAuditFields, type ProductionAuditField } from '@/utils/productionAudit';
import ListColumnSettingsPopover, {
  getCurrentUserPreferenceStorageKey,
  loadListColumnSettings,
  reorderListColumns,
  type ListColumnOption,
  type ListColumnSettings,
} from '@/components/ListColumnSettingsPopover';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;
const BATCH_COLUMN_SETTINGS_VERSION = 1;
const BATCH_COLUMN_SETTINGS_PREFIX = 'production-batch-columns:';
const BATCH_COLUMN_WIDTHS_PREFIX = 'production-batch-column-widths:';
const BATCH_ACTION_COLUMN_WIDTH = 128;
type BatchColumnId = 'batchNo' | 'workOrderNo' | 'product' | 'processVersion' | 'targetQuantity' | 'goodQuantity' | 'ngQuantity' | 'scrapQuantity' | 'plannedStartAt' | 'plannedEndAt' | 'status';
type BatchColumn = ListColumnOption<BatchColumnId> & { width: number; minWidth: number };
type BatchColumnWidths = Partial<Record<BatchColumnId, number>>;
const BATCH_COLUMNS: BatchColumn[] = [
  { id: 'batchNo', label: '批次号', width: 180, minWidth: 150 },
  { id: 'workOrderNo', label: '工单号', width: 170, minWidth: 140 },
  { id: 'product', label: '产品', width: 190, minWidth: 160 },
  { id: 'processVersion', label: '制程版本', width: 150, minWidth: 120 },
  { id: 'targetQuantity', label: '目标数量', width: 110, minWidth: 96 },
  { id: 'goodQuantity', label: '良品', width: 100, minWidth: 88 },
  { id: 'ngQuantity', label: 'NG', width: 100, minWidth: 88 },
  { id: 'scrapQuantity', label: '报废', width: 100, minWidth: 88 },
  { id: 'plannedStartAt', label: '计划开始', width: 160, minWidth: 148 },
  { id: 'plannedEndAt', label: '计划结束', width: 160, minWidth: 148 },
  { id: 'status', label: '状态', width: 110, minWidth: 96, fixed: true },
];
const statusLabels: Record<string, string> = {
  CREATED: '已创建',
  IN_PROGRESS: '生产中',
  COMPLETED: '已完成',
  EARLY_TERMINATED: '提前结束',
  CANCELLED: '已取消',
};
const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  CREATED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  EARLY_TERMINATED: 'error',
  CANCELLED: 'error',
};
const tableHeaderCellSx = listTableHeaderCellSx;
const tableRowSx = {
  '& > .MuiTableCell-root': {
    height: 40,
    py: 0.5,
    borderBottom: '1px solid #ebeef5',
  },
};
function getStatusColumnSx(width: number, layer: 'head' | 'body') {
  return {
    position: 'sticky' as const,
    right: BATCH_ACTION_COLUMN_WIDTH,
    zIndex: layer === 'head' ? 10 : 2,
    width,
    minWidth: width,
    maxWidth: width,
    top: layer === 'head' ? 0 : undefined,
    bgcolor: layer === 'head' ? '#f5f7fa' : '#fff',
    backgroundClip: 'padding-box',
    boxShadow: '-6px 0 8px -8px rgba(0, 0, 0, 0.35)',
    textAlign: layer === 'head' ? 'center' as const : undefined,
    whiteSpace: 'nowrap',
  };
}
function getOperationColumnSx(layer: 'head' | 'body') {
  return {
    position: 'sticky' as const,
    right: 0,
    zIndex: layer === 'head' ? 10 : 2,
    width: BATCH_ACTION_COLUMN_WIDTH,
    minWidth: BATCH_ACTION_COLUMN_WIDTH,
    maxWidth: BATCH_ACTION_COLUMN_WIDTH,
    top: layer === 'head' ? 0 : undefined,
    bgcolor: layer === 'head' ? '#f5f7fa' : '#fff',
    backgroundClip: 'padding-box',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap',
  };
}
const drawerRootSx = {
  top: 0,
  bottom: 0,
  zIndex: (theme: { zIndex: { drawer: number } }) => theme.zIndex.drawer + 2,
  '& .MuiBackdrop-root': { top: 0 },
};
const drawerPaperSx = {
  ...drawerRootSx,
  width: { xs: '100vw', sm: 560 },
  top: 0,
  bottom: 0,
  height: '100vh',
  transform: 'none !important',
};
function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 16);
}

function loadColumnWidths(storageKey: string): BatchColumnWidths {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return typeof parsed === 'object' && parsed ? parsed as BatchColumnWidths : {};
  } catch {
    return {};
  }
}

function statusBadge(status: string) {
  return <StatusBadge label={statusLabels[status] || status || '-'} color={statusColors[status] || 'default'} />;
}

function auditActionLabel(item: AuditLogItem): string {
  if (item.action === 'CREATE') return '新增';
  return '修改';
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
    <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e4e7ed', bgcolor: '#f8fafc' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#303133' }}>{title}</Typography>
    </Box>
    <Box sx={{ p: 1.5 }}>{children}</Box>
  </Box>;
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.35 }}>{label}</Typography>
    <Typography component="div" variant="body2" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value === null || value === undefined || value === '' ? '-' : value}</Typography>
  </Box>;
}

function AuditFieldBlock({ title, fields }: { title: string; fields: ProductionAuditField[] }) {
  return <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#f8fafc', p: 1, minWidth: 0 }}>
    <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: '#606266', fontWeight: 600 }}>{title}</Typography>
    <Stack spacing={0.75}>{fields.length === 0 ? <Typography variant="caption" sx={{ color: '#909399' }}>无</Typography> : fields.map((field) => <Box key={field.key} sx={{ display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr)', gap: 1 }}><Typography variant="caption" sx={{ color: '#606266' }}>{field.label}</Typography><Typography variant="caption" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{field.value}</Typography></Box>)}</Stack>
  </Box>;
}

function BatchDetailDrawer({ detail, tab, onTabChange, auditRows, auditLoading, auditError, onClose }: {
  detail: BatchRecord | null;
  tab: number;
  onTabChange: (value: number) => void;
  auditRows: AuditLogItem[];
  auditLoading: boolean;
  auditError: boolean;
  onClose: () => void;
}) {
  return <Drawer anchor="right" open={detail !== null} onClose={onClose} sx={drawerRootSx} slotProps={{ backdrop: { sx: drawerRootSx } }} PaperProps={{ sx: drawerPaperSx }}>
    <Box sx={{ minHeight: '100%', overflow: 'auto', bgcolor: '#f7f9fc', p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>信息查看</Typography><IconButton size="small" onClick={onClose} aria-label="关闭详情"><Close fontSize="small" /></IconButton></Stack>
      {detail && <>
        <Box sx={{ borderBottom: '1px solid #e4e7ed' }}><Tabs value={tab} onChange={(_, value: number) => onTabChange(value)} aria-label="批次详情切换"><Tab label="数据信息" /><Tab label="数据审计" /></Tabs></Box>
        {tab === 0 ? <Stack spacing={2} sx={{ mt: 2 }}>
          <DetailSection title="基础信息"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
            <DetailField label="批次号" value={detail.objectNo} /><DetailField label="工单号" value={detail.workOrderNo} />
            <DetailField label="订单编号" value={detail.orderNumber} /><DetailField label="产品" value={detail.productName ? `${detail.productName}（${detail.productCode}）` : detail.productCode} />
            <DetailField label="制程版本" value={detail.processVersion} /><DetailField label="状态" value={statusBadge(detail.status)} />
            {detail.terminationReason && <><DetailField label="结束原因" value={detail.terminationReason} /><DetailField label="结束时间" value={formatDateTime(detail.terminationAt)} /></>}
          </Box></DetailSection>
          <DetailSection title="数量与计划"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
            <DetailField label="目标数量" value={detail.targetQuantity} /><DetailField label="良品" value={detail.goodQuantity} />
            <DetailField label="NG" value={detail.ngQuantity} /><DetailField label="报废" value={detail.scrapQuantity} />
            <DetailField label="计划开始时间" value={formatDateTime(detail.plannedStartAt)} /><DetailField label="计划结束时间" value={formatDateTime(detail.plannedEndAt)} />
          </Box></DetailSection>
          <DetailSection title="备注"><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: detail.remark ? '#303133' : '#909399' }}>{detail.remark || '暂无备注'}</Typography></DetailSection>
        </Stack> : <Stack spacing={1} sx={{ mt: 2 }}>
          {auditLoading ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box> : auditError ? <Box sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>数据审计加载失败</Box> : auditRows.length === 0 ? <Box sx={{ py: 8, textAlign: 'center', color: '#909399' }}>暂无数据审计记录</Box> : auditRows.map((item) => <Accordion key={item.id} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}>
            <AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ minHeight: 44, px: 1.5, '&.Mui-expanded': { minHeight: 44 }, '& .MuiAccordionSummary-content': { my: 0, minWidth: 0 }, '& .MuiAccordionSummary-content.Mui-expanded': { my: 0 } }}><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.25fr', columnGap: 1, width: '100%', minWidth: 0 }}><Typography variant="body2" noWrap>{item.operatorDisplayName || item.operatorAccount || '-'}</Typography><Typography variant="body2" noWrap>{auditActionLabel(item)}</Typography><Typography variant="body2" noWrap sx={{ color: '#606266' }}>{formatDateTime(item.operationTime || item.createdAt)}</Typography></Box></AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1.5 }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}><AuditFieldBlock title="变更前" fields={toProductionAuditFields(item.contentBefore, { objectNo: '批次号' })} /><AuditFieldBlock title="变更后" fields={toProductionAuditFields(item.contentAfter, { objectNo: '批次号' })} /></Box></AccordionDetails>
          </Accordion>)}
        </Stack>}
      </>}
    </Box>
  </Drawer>;
}

export default function BatchManagementPage() {
  const columnResizeRef = useRef<{ id: BatchColumnId; startX: number; startWidth: number } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(PAGE_SIZE_OPTIONS[0]);
  const columnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(BATCH_COLUMN_SETTINGS_PREFIX), []);
  const columnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(BATCH_COLUMN_WIDTHS_PREFIX), []);
  const [columnSettingsAnchor, setColumnSettingsAnchor] = useState<HTMLElement | null>(null);
  const [columnSettings, setColumnSettings] = useState<ListColumnSettings<BatchColumnId>>(() => loadListColumnSettings(columnSettingsStorageKey, BATCH_COLUMNS, BATCH_COLUMN_SETTINGS_VERSION));
  const [columnWidths, setColumnWidths] = useState<BatchColumnWidths>(() => loadColumnWidths(columnWidthStorageKey));
  const [keyword, setKeyword] = useState(() => readRecordLocation().keyword);
  const [submittedKeyword, setSubmittedKeyword] = useState(() => readRecordLocation().keyword);
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState<BatchRecord | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<BatchRecord | null>(null);
  const [endTarget, setEndTarget] = useState<BatchRecord | null>(null);
  const [endReason, setEndReason] = useState('');
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();

  const batches = useQuery({
    queryKey: ['production-batches', page, pageSize, submittedKeyword, status],
    queryFn: async () => (await listBatches({ page, size: pageSize, keyword: submittedKeyword, status })).data.data as PageResult<BatchRecord>,
  });
  useEffect(() => {
    const totalPages = batches.data?.totalPages ?? 0;
    const lastPage = Math.max(totalPages, 1);
    if (page > lastPage) setPage(lastPage);
  }, [batches.data?.totalPages, page]);
  const audit = useQuery({
    queryKey: ['production-batch-audit', detail?.id],
    enabled: Boolean(detail && detailTab === 1),
    queryFn: async () => {
      const response = await getAuditLogs({ entityType: 'PRODUCTION_OBJECT', entityId: detail!.id, page: 1, size: 100 });
      return ((response.data.data as PageResult<AuditLogItem>).content ?? []);
    },
  });
  const rows = batches.data?.content ?? [];
  const showBatchTableState = batches.isLoading || batches.isError || rows.length === 0;
  const auditRows = useMemo(() => audit.data ?? [], [audit.data]);
  const visibleColumns = useMemo(() => columnSettings.order
    .map((id) => BATCH_COLUMNS.find((column) => column.id === id))
    .filter((column): column is BatchColumn => Boolean(column))
    .filter((column) => !columnSettings.hidden.includes(column.id)), [columnSettings]);
  const resolvedColumnWidths = useMemo(() => Object.fromEntries(BATCH_COLUMNS.map((column) => [column.id, Math.max(column.minWidth, columnWidths[column.id] ?? column.width)])) as Record<BatchColumnId, number>, [columnWidths]);
  const mainTableWidth = visibleColumns.reduce((total, column) => total + resolvedColumnWidths[column.id], BATCH_ACTION_COLUMN_WIDTH);

  useEffect(() => { localStorage.setItem(columnSettingsStorageKey, JSON.stringify(columnSettings)); }, [columnSettings, columnSettingsStorageKey]);
  useEffect(() => { localStorage.setItem(columnWidthStorageKey, JSON.stringify(columnWidths)); }, [columnWidthStorageKey, columnWidths]);

  const toggleColumnVisibility = (columnId: BatchColumnId) => setColumnSettings((current) => {
    const isVisible = !current.hidden.includes(columnId);
    const visibleCount = current.order.length - current.hidden.length;
    if (isVisible && visibleCount <= 1) return current;
    return { ...current, hidden: isVisible ? [...current.hidden, columnId] : current.hidden.filter((id) => id !== columnId) };
  });
  const reorderColumns = (sourceId: BatchColumnId, targetId: BatchColumnId) => setColumnSettings((current) => reorderListColumns(BATCH_COLUMNS, current, sourceId, targetId));
  const beginColumnResize = (event: ReactPointerEvent<HTMLDivElement>, column: BatchColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    columnResizeRef.current = { id: column, startX: event.clientX, startWidth: resolvedColumnWidths[column] };
    const onMove = (moveEvent: PointerEvent) => {
      const resize = columnResizeRef.current;
      if (!resize) return;
      const definition = BATCH_COLUMNS.find((item) => item.id === resize.id);
      if (!definition) return;
      setColumnWidths((current) => ({ ...current, [resize.id]: Math.max(definition.minWidth, resize.startWidth + moveEvent.clientX - resize.startX) }));
    };
    const onUp = () => {
      columnResizeRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelProductionObject(id),
    onSuccess: () => { showMessage('批次已取消'); setCancelTarget(null); void queryClient.invalidateQueries({ queryKey: ['production-batches'] }); },
    onError: () => showMessage('批次取消失败，请稍后重试', 'error'),
  });
  const endMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => endProductionObject(id, reason),
    onSuccess: () => { showMessage('批次已提前结束'); setEndTarget(null); setEndReason(''); void queryClient.invalidateQueries({ queryKey: ['production-batches'] }); },
    onError: () => showMessage('批次提前结束失败，请检查状态和结束原因', 'error'),
  });

  const notifyUnavailable = (label: string) => showMessage(`${label}将在生产执行模块上线后提供`, 'info');

  const submitSearch = () => {
    setPage(1);
    setSubmittedKeyword(keyword.trim());
  };
  const renderBatchCell = (row: BatchRecord, column: BatchColumn) => {
    const width = resolvedColumnWidths[column.id];
    const commonSx = { width, minWidth: width, maxWidth: width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const };
    switch (column.id) {
      case 'batchNo': return <TableCell sx={commonSx}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}><Typography variant="body2" noWrap title={row.objectNo} sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}>{row.objectNo}</Typography><Tooltip title="复制批次号" arrow><IconButton size="small" aria-label="复制批次号" sx={{ flexShrink: 0 }} onKeyDown={(event) => event.stopPropagation()} onClick={async (event) => { event.stopPropagation(); try { await navigator.clipboard.writeText(row.objectNo); showMessage('批次号已复制'); } catch { showMessage('复制失败，请重试', 'error'); } }}><ContentCopyOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip></Box></TableCell>;
      case 'workOrderNo': return <TableCell sx={commonSx} title={row.workOrderNo}>{row.workOrderNo}</TableCell>;
      case 'product': return <TableCell sx={commonSx} title={`${row.productName}（${row.productCode}）`}><Typography variant="body2" noWrap>{row.productName}</Typography><Typography variant="caption" display="block" color="text.secondary" noWrap>{row.productCode}</Typography></TableCell>;
      case 'processVersion': return <TableCell sx={commonSx}>{row.processVersion || '-'}</TableCell>;
      case 'targetQuantity': return <TableCell sx={commonSx}>{row.targetQuantity}</TableCell>;
      case 'goodQuantity': return <TableCell sx={commonSx}>{row.goodQuantity}</TableCell>;
      case 'ngQuantity': return <TableCell sx={commonSx}>{row.ngQuantity}</TableCell>;
      case 'scrapQuantity': return <TableCell sx={commonSx}>{row.scrapQuantity}</TableCell>;
      case 'plannedStartAt': return <TableCell sx={commonSx}>{formatDateTime(row.plannedStartAt)}</TableCell>;
      case 'plannedEndAt': return <TableCell sx={commonSx}>{formatDateTime(row.plannedEndAt)}</TableCell>;
      case 'status': return <TableCell sx={{ ...commonSx, ...getStatusColumnSx(width, 'body') }}>{statusBadge(row.status)}</TableCell>;
      default: return null;
    }
  };

  return (
    <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label="批次号/工单号/产品"
            placeholder="请输入"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }}
            sx={{ '& .MuiInputBase-root': { height: 40 }, '& .MuiInputBase-input': { boxSizing: 'border-box' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
          <TextField select fullWidth size="small" label="状态" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} sx={{ '& .MuiInputBase-root': { height: 40 } }}>
            <MenuItem value="">全部</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
            <Button size="small" sx={{ height: 40, width: 80, minWidth: 80 }} variant="outlined" startIcon={<RestartAlt />} onClick={() => { setKeyword(''); setSubmittedKeyword(''); setStatus(''); setPage(1); }}>重置</Button>
            <Button size="small" sx={{ height: 40, width: 80, minWidth: 80 }} variant="contained" startIcon={<Search />} onClick={submitSearch}>查询</Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
        <Box sx={{ flex: '0 0 auto', px: 2, py: 0.75, minHeight: 48, borderBottom: '1px solid #ebeef5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title="字段设置" arrow><IconButton size="small" aria-label="字段设置" onClick={(event) => setColumnSettingsAnchor(event.currentTarget)} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}><Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ViewColumnRounded sx={{ fontSize: 21 }} /><TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} /></Box></IconButton></Tooltip>
          <Tooltip title="批次由工单生产对象拆分生成" arrow><InfoOutlined sx={{ color: '#909399', fontSize: 20 }} /></Tooltip>
        </Box>
        <ListColumnSettingsPopover anchorEl={columnSettingsAnchor} columns={BATCH_COLUMNS} settings={columnSettings} onClose={() => setColumnSettingsAnchor(null)} onToggle={toggleColumnVisibility} onReorder={reorderColumns} />
        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Table stickyHeader size="small" sx={{ minWidth: mainTableWidth, width: '100%', tableLayout: 'fixed', height: showBatchTableState ? '100%' : 'auto' }}>
            <colgroup>{visibleColumns.map((column) => <col key={column.id} style={{ width: resolvedColumnWidths[column.id] }} />)}<col style={{ width: BATCH_ACTION_COLUMN_WIDTH }} /></colgroup>
            <TableHead sx={{ height: 48 }}><TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>{visibleColumns.map((column) => <TableCell key={column.id} sx={{ ...tableHeaderCellSx, width: resolvedColumnWidths[column.id], minWidth: resolvedColumnWidths[column.id], maxWidth: resolvedColumnWidths[column.id], ...(column.id === 'status' ? getStatusColumnSx(resolvedColumnWidths[column.id], 'head') : {}), top: 0, zIndex: column.id === 'status' ? 10 : 5, position: 'sticky' }}><Box sx={{ position: 'relative', pr: 1 }}>{column.label}<Box aria-label={`调整${column.label}列宽`} onPointerDown={(event) => beginColumnResize(event, column.id)} sx={{ ...listColumnResizeHandleSx, right: -8 }} /></Box></TableCell>)}<TableCell align="center" sx={{ ...tableHeaderCellSx, ...getOperationColumnSx('head') }}>操作</TableCell></TableRow></TableHead>
            <TableBody>
              {batches.isLoading && <TableRow><TableStateCell colSpan={visibleColumns.length + 1} align="center"><CircularProgress size={24} /></TableStateCell></TableRow>}
              {batches.isError && <TableRow><TableStateCell colSpan={visibleColumns.length + 1} align="center" sx={{ color: '#c62828' }}>批次数据加载失败：{batches.error instanceof Error ? batches.error.message : '请稍后重试'}</TableStateCell></TableRow>}
              {!batches.isLoading && !batches.isError && rows.length === 0 && <TableRow><TableStateCell colSpan={visibleColumns.length + 1} align="center" sx={{ color: '#909399' }}>暂无批次数据</TableStateCell></TableRow>}
              {!batches.isLoading && !batches.isError && rows.map((row) => <TableRow data-record-id={row.id} key={row.id} hover tabIndex={0} onClick={() => { setDetail(row); setDetailTab(0); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { setDetail(row); setDetailTab(0); } }} sx={{ ...tableRowSx, cursor: 'pointer' }}>
                {visibleColumns.map((column) => <Fragment key={column.id}>{renderBatchCell(row, column)}</Fragment>)}
                <TableCell align="center" onClick={(event) => event.stopPropagation()} sx={getOperationColumnSx('body')}>
                  {['IN_PROGRESS', 'COMPLETED', 'EARLY_TERMINATED'].includes(row.status) ? <Tooltip title="DHR" arrow><IconButton size="small" aria-label="查看DHR" onClick={() => notifyUnavailable('DHR 查看')}><DescriptionOutlined fontSize="small" /></IconButton></Tooltip> : <Tooltip title="DHR（开工后可用）" arrow><span><IconButton size="small" disabled aria-label="DHR 暂不可用"><DescriptionOutlined fontSize="small" /></IconButton></span></Tooltip>}
                  {['IN_PROGRESS', 'COMPLETED', 'EARLY_TERMINATED'].includes(row.status) ? <Tooltip title="执行详情" arrow><IconButton size="small" aria-label="执行详情" onClick={() => notifyUnavailable('执行详情')}><PlayCircleOutline fontSize="small" /></IconButton></Tooltip> : <Tooltip title="执行详情（开工后可用）" arrow><span><IconButton size="small" disabled aria-label="执行详情暂不可用"><PlayCircleOutline fontSize="small" /></IconButton></span></Tooltip>}
                  {row.status === 'IN_PROGRESS' ? <Tooltip title="结束" arrow><IconButton size="small" aria-label="提前结束批次" color="warning" onClick={() => { setEndTarget(row); setEndReason(''); }}><StopCircleOutlined fontSize="small" /></IconButton></Tooltip> : row.status === 'CREATED' ? <Tooltip title="取消" arrow><IconButton size="small" aria-label="取消批次" color="error" onClick={() => setCancelTarget(row)}><Cancel fontSize="small" /></IconButton></Tooltip> : <Tooltip title="结束（仅进行中的批次可用）" arrow><span><IconButton size="small" disabled aria-label="结束暂不可用"><StopCircleOutlined fontSize="small" /></IconButton></span></Tooltip>}
                </TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ flex: '0 0 auto', minHeight: 56, px: 2, borderTop: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#606266', whiteSpace: 'nowrap' }}>共 {batches.data?.totalElements ?? 0} 条数据</Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ marginLeft: 'auto' }}>
            <Pagination size="small" count={Math.max(batches.data?.totalPages ?? 0, 1)} page={Math.min(page, Math.max(batches.data?.totalPages ?? 0, 1))} onChange={(_, value) => setPage(value)} />
            <TextField select size="small" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]); setPage(1); }} sx={{ width: 112 }} inputProps={{ 'aria-label': '每页条数' }}>{PAGE_SIZE_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option} 条/页</MenuItem>)}</TextField>
          </Stack>
        </Box>
      </Box>

      <BatchDetailDrawer detail={detail} tab={detailTab} onTabChange={setDetailTab} auditRows={auditRows} auditLoading={audit.isLoading} auditError={audit.isError} onClose={() => setDetail(null)} />
      <ConfirmDialog open={cancelTarget !== null} title="取消批次" message={cancelTarget ? `确定取消批次「${cancelTarget.objectNo}」吗？取消后不能再开工。` : ''} confirmText="取消批次" destructive loading={cancelMutation.isPending} onCancel={() => setCancelTarget(null)} onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)} />
      <AppDialog open={endTarget !== null} onClose={() => { setEndTarget(null); setEndReason(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>提前结束批次</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#606266', mb: 1.5 }}>批次「{endTarget?.objectNo ?? '-'}」将进入“提前结束”，生产执行和后续 DHR 推进将停止。</Typography>
          <TextField autoFocus fullWidth required multiline minRows={3} label="结束原因" placeholder="请输入提前结束原因" value={endReason} onChange={(event) => setEndReason(event.target.value)} error={endReason.length > 0 && !endReason.trim()} helperText="结束原因必填" />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}><Button onClick={() => { setEndTarget(null); setEndReason(''); }}>取消</Button><Button variant="contained" color="warning" disabled={!endReason.trim() || endMutation.isPending} onClick={() => endTarget && endMutation.mutate({ id: endTarget.id, reason: endReason.trim() })}>{endMutation.isPending ? '提交中...' : '确认结束'}</Button></DialogActions>
      </AppDialog>
    </Box>
  );
}
