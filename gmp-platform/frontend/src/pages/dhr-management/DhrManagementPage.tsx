import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';
import ViewColumnRounded from '@mui/icons-material/ViewColumnRounded';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import type { DhrEvidenceRecord, DhrInstanceSummary, DhrObjectType, DhrStatus } from '@/api/dhr-instances';
import { getDhrInstance, listDhrInstances } from '@/api/dhr-instances';
import { logout } from '@/api/auth';
import ListColumnSettingsPopover, {
  getCurrentUserPreferenceStorageKey,
  loadListColumnSettings,
  reorderListColumns,
  type ListColumnOption,
} from '@/components/ListColumnSettingsPopover';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import { listColumnResizeHandleSx } from '@/components/listTableStyles';
import {
  formListFieldSx,
  formListFilterActionsSx,
  formListQueryGridSx,
  formListQueryPanelSx,
  formTableBodyCellSx,
  formTableHeaderCellSx,
  FormListPagination,
} from '@/pages/form-management/formManagementListStyles';
import { clearAuthStorage } from '@/utils/sessionPolicy';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';

const COLUMN_SETTINGS_VERSION = 2;
const COLUMN_STORAGE_KEY_PREFIX = 'dhr-list-columns:';
const DHR_STATUS_COLUMN_WIDTH = 112;
const DHR_ACTION_COLUMN_WIDTH = 64;

const statusLabel: Record<DhrStatus, string> = { IN_PROGRESS: '收集中', COMPLETED: '已完成' };
const objectTypeLabel: Record<DhrObjectType, string> = { BATCH: '批次', SN: '序列号' };

const columns = [
  { id: 'dhrNo', label: 'DHR 编号' },
  { id: 'object', label: '生产对象' },
  { id: 'workOrderNo', label: '工单编号' },
  { id: 'productCode', label: '产品编码' },
  { id: 'productName', label: '产品名称' },
  { id: 'processVersion', label: '制程版本' },
  { id: 'route', label: '工艺路线' },
  { id: 'dhrTemplate', label: 'DHR 模板' },
  { id: 'createdAt', label: '建立时间' },
  { id: 'createdBy', label: '创建人' },
  { id: 'updatedAt', label: '更新时间' },
  { id: 'updatedBy', label: '更新人' },
] as const satisfies readonly ListColumnOption<string>[];

type ColumnId = typeof columns[number]['id'];

const DEFAULT_COLUMN_WIDTHS: Record<ColumnId, number> = {
  dhrNo: 220,
  object: 210,
  workOrderNo: 160,
  productCode: 160,
  productName: 200,
  processVersion: 150,
  route: 190,
  dhrTemplate: 200,
  createdAt: 160,
  createdBy: 140,
  updatedAt: 160,
  updatedBy: 140,
};

const headerCellSx = formTableHeaderCellSx;
const bodyCellSx = formTableBodyCellSx;
const fieldSx = formListFieldSx;

function formatTime(value?: string | null) {
  if (!value) return '—';
  return value.replace('T', ' ').slice(0, 16);
}

function DhrStatusBadge({ status }: { status: DhrStatus }) {
  return <StatusBadge label={statusLabel[status]} color={status === 'COMPLETED' ? 'success' : 'primary'} />;
}

function Meta({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ mt: 0.4, minHeight: 22, fontWeight: 600, overflowWrap: 'anywhere' }}>{value || '—'}</Typography>
    </Box>
  );
}

function DetailDialog({ selected, onClose }: { selected: DhrInstanceSummary | null; onClose: () => void }) {
  const query = useQuery({
    queryKey: ['dhr-instance-detail', selected?.id],
    queryFn: () => getDhrInstance(selected!.id),
    enabled: Boolean(selected),
  });
  const detail = query.data;
  const [source, setSource] = useState<'DIRECTORY' | 'WORK' | 'CUSTOM'>('DIRECTORY');
  const [nodeKey, setNodeKey] = useState('');
  const [recordId, setRecordId] = useState('');

  useEffect(() => {
    if (!detail) return;
    const firstDirectory = detail.directorySnapshot.directories[0];
    setSource('DIRECTORY');
    setNodeKey(firstDirectory ? `directory-${firstDirectory.id}` : '');
    setRecordId('');
  }, [detail]);

  const sourceRecords = useMemo(() => {
    if (!detail) return [];
    if (source === 'WORK') return detail.recordsByOrigin.work;
    if (source === 'CUSTOM') return detail.recordsByOrigin.custom;
    const directories = detail.directorySnapshot.directories;
    if (nodeKey.startsWith('item-')) {
      const itemId = nodeKey.slice(5);
      return directories.flatMap((directory) => directory.items).find((item) => String(item.id) === itemId)?.records ?? [];
    }
    if (nodeKey.startsWith('directory-')) {
      const directoryId = nodeKey.slice(10);
      return directories.find((directory) => String(directory.id) === directoryId)?.items.flatMap((item) => item.records) ?? [];
    }
    return detail.recordsByOrigin.directory;
  }, [detail, nodeKey, source]);
  useEffect(() => {
    if (!sourceRecords.some((record) => record.id === recordId)) setRecordId(sourceRecords[0]?.id ?? '');
  }, [recordId, sourceRecords]);
  const record = sourceRecords.find((item) => item.id === recordId) ?? null;
  const previewDocument = useMemo(() => {
    if (!record?.snapshot.model || !record.snapshot.canvas) return null;
    try {
      const parsed = parseReactTemplateDesignerDocument(
        { id: record.templateId, name: record.templateName || record.snapshot.name || '表单' },
        { id: record.templateVersionId, version: record.templateVersion || record.snapshot.version || '', modelDesignJson: record.snapshot.model, canvasDesignJson: record.snapshot.canvas },
      );
      const fields = Array.isArray(record.snapshot.fields) ? record.snapshot.fields : [];
      parsed.model.fields = fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index })) as typeof parsed.model.fields;
      return parsed;
    } catch { return null; }
  }, [record]);

  const sourceCount = detail ? {
    DIRECTORY: detail.recordsByOrigin.directory.length,
    WORK: detail.recordsByOrigin.work.length,
    CUSTOM: detail.recordsByOrigin.custom.length,
  } : { DIRECTORY: 0, WORK: 0, CUSTOM: 0 };

  return (
    <Dialog
      open={Boolean(selected)}
      onClose={onClose}
      fullScreen
      PaperProps={{ sx: { bgcolor: '#eef1f6' } }}
    >
      <Box sx={{ height: 64, px: 2.5, bgcolor: '#fff', borderBottom: '1px solid #dfe3eb', display: 'flex', alignItems: 'center' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" gap={2}>
          <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
            <ArticleOutlined color="primary" />
            <Typography variant="h6" noWrap>{selected?.dhrNo}</Typography>
            {selected && <Chip size="small" label={`${objectTypeLabel[selected.objectType]} · ${selected.objectNo}`} variant="outlined" />}
            {selected && <DhrStatusBadge status={selected.status} />}
          </Stack>
          <IconButton onClick={onClose} aria-label="关闭 DHR 详情"><CloseRounded /></IconButton>
        </Stack>
      </Box>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {query.isLoading ? <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : query.isError || !detail ? (
          <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}><Stack alignItems="center" spacing={1.5}><Typography fontWeight={700}>DHR 详情加载失败</Typography><Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => query.refetch()}>重新加载</Button></Stack></Box>
        ) : <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: '92px 300px minmax(0,1fr)' }}>
          <Tabs orientation="vertical" value={source} onChange={(_, value) => { setSource(value); setNodeKey(''); }} sx={{ bgcolor: '#fff', borderRight: '1px solid #dfe3eb', pt: 1.5, '& .MuiTab-root': { minWidth: 0, minHeight: 72, px: 1, fontSize: 13 } }}>
            <Tab value="DIRECTORY" icon={<FolderOutlined />} label={`目录 ${sourceCount.DIRECTORY}`} />
            <Tab value="WORK" icon={<FactCheckOutlined />} label={`作业 ${sourceCount.WORK}`} />
            <Tab value="CUSTOM" icon={<ArticleOutlined />} label={`自定义 ${sourceCount.CUSTOM}`} />
          </Tabs>
          <Box sx={{ bgcolor: '#fff', borderRight: '1px solid #dfe3eb', overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #ebeef5' }}><Typography fontWeight={700}>{source === 'DIRECTORY' ? detail.dhrTemplateName || 'DHR 目录' : source === 'WORK' ? '作业表单' : '自定义表单'}</Typography><Typography variant="caption" color="text.secondary">{source === 'DIRECTORY' ? `冻结版本 ${detail.dhrTemplateVersion || '—'}` : '生产执行形成的表单实例'}</Typography></Box>
            {source === 'DIRECTORY' ? <Stack spacing={0.5} sx={{ p: 1 }}>
              {detail.directorySnapshot.directories.map((directory) => <Box key={directory.id}>
                <Button fullWidth startIcon={<FolderOutlined />} onClick={() => setNodeKey(`directory-${directory.id}`)} sx={{ justifyContent: 'flex-start', color: nodeKey === `directory-${directory.id}` ? 'primary.main' : 'text.primary', bgcolor: nodeKey === `directory-${directory.id}` ? '#e8f4ff' : 'transparent' }}>{directory.name}</Button>
                {directory.items.map((item) => <Button key={item.id} fullWidth onClick={() => setNodeKey(`item-${item.id}`)} sx={{ pl: 5, justifyContent: 'space-between', color: nodeKey === `item-${item.id}` ? 'primary.main' : 'text.secondary', bgcolor: nodeKey === `item-${item.id}` ? '#f0f7ff' : 'transparent' }}><Typography variant="body2" noWrap>{item.displayName || item.formName}</Typography><Chip size="small" label={item.records.length} variant="outlined" /></Button>)}
              </Box>)}
            </Stack> : null}
            <Divider />
            <Stack spacing={0.75} sx={{ p: 1.25 }}>
              {sourceRecords.map((item) => <Button key={item.id} onClick={() => setRecordId(item.id)} sx={{ display: 'block', textAlign: 'left', px: 1.5, py: 1.25, color: 'text.primary', bgcolor: recordId === item.id ? '#e8f4ff' : '#fff', border: '1px solid', borderColor: recordId === item.id ? '#91caff' : '#ebeef5' }}><Typography variant="body2" fontWeight={650} noWrap>{item.templateName || '未命名表单'}</Typography><Typography variant="caption" color="text.secondary" display="block" noWrap>{item.instanceNo} · 副本 {item.copyId}</Typography></Button>)}
              {!sourceRecords.length && <Typography sx={{ py: 5, textAlign: 'center' }} color="text.secondary">暂无表单实例</Typography>}
            </Stack>
          </Box>
          <Box sx={{ minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#fff', borderBottom: '1px solid #dfe3eb' }}>
              {record ? <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}><Box minWidth={0}><Typography fontWeight={700} noWrap>{record.templateName}</Typography><Typography variant="caption" color="text.secondary">{record.instanceNo} · {record.templateVersion} · {record.operationName || '生产执行'} · {formatTime(record.updatedAt)}</Typography></Box><Chip size="small" label={record.status === 'COMPLETED' ? '已完成' : record.status} color={record.status === 'COMPLETED' ? 'success' : 'default'} /></Stack> : <Typography color="text.secondary">请选择一份表单实例</Typography>}
            </Box>
            {record ? previewDocument ? <FormCanvasPreview document={previewDocument} fullPage runtime={{ values: record.fieldValues, disabled: true, onChange: () => {} }} /> : <Box sx={{ m: 3, p: 3, bgcolor: '#fff', border: '1px solid #dfe3eb' }}><Typography fontWeight={700} sx={{ mb: 2 }}>表单数据</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 2 }}>{Object.entries(record.fieldValues).map(([key, value]) => <Meta key={key} label={key} value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')} />)}</Box></Box> : <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><Typography color="text.secondary">选择左侧实例查看真实表单内容</Typography></Box>}
          </Box>
        </Box>}
      </DialogContent>
    </Dialog>
  );
}

export default function DhrManagementPage() {
  const navigate = useNavigate();
  const [draftKeyword, setDraftKeyword] = useState('');
  const [draftObjectType, setDraftObjectType] = useState<DhrObjectType | ''>('');
  const [draftStatus, setDraftStatus] = useState<DhrStatus | ''>('');
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<DhrObjectType | ''>('');
  const [status, setStatus] = useState<DhrStatus | ''>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selected, setSelected] = useState<DhrInstanceSummary | null>(null);
  const [columnSettingsAnchor, setColumnSettingsAnchor] = useState<HTMLElement | null>(null);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const columnStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(COLUMN_STORAGE_KEY_PREFIX), []);
  const [columnSettings, setColumnSettings] = useState(() => loadListColumnSettings(columnStorageKey, columns, COLUMN_SETTINGS_VERSION));
  const columnWidthStorageKey = `${columnStorageKey}:widths:v1`;
  const [columnWidths, setColumnWidths] = useState<Record<ColumnId, number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(columnWidthStorageKey) || '{}') as Partial<Record<ColumnId, number>>;
      return columns.reduce((result, column) => {
        const storedWidth = stored[column.id];
        result[column.id] = typeof storedWidth === 'number' && Number.isFinite(storedWidth)
          ? Math.max(96, storedWidth)
          : DEFAULT_COLUMN_WIDTHS[column.id];
        return result;
      }, {} as Record<ColumnId, number>);
    } catch {
      return { ...DEFAULT_COLUMN_WIDTHS };
    }
  });
  const columnResizeRef = useRef<{ id: ColumnId; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    localStorage.setItem(columnStorageKey, JSON.stringify(columnSettings));
  }, [columnSettings, columnStorageKey]);
  useEffect(() => {
    localStorage.setItem(columnWidthStorageKey, JSON.stringify(columnWidths));
  }, [columnWidthStorageKey, columnWidths]);

  const query = useQuery({
    queryKey: ['dhr-instances', keyword, objectType, status, page, size],
    queryFn: () => listDhrInstances({ keyword, objectType, status, page, size }),
  });
  const queryErrorMessage = query.error instanceof Error ? query.error.message : '';
  const requiresReauthentication = queryErrorMessage === '无操作权限';

  const visibleColumns = useMemo(
    () => columnSettings.order.filter((id) => !columnSettings.hidden.includes(id)),
    [columnSettings],
  );
  const getColumnWidth = (columnId: ColumnId) => columnWidths[columnId] ?? DEFAULT_COLUMN_WIDTHS[columnId];
  const startColumnResize = (event: ReactPointerEvent<HTMLDivElement>, columnId: ColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    columnResizeRef.current = { id: columnId, startX: event.clientX, startWidth: getColumnWidth(columnId) };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const updateColumnResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = columnResizeRef.current;
    if (!resize) return;
    setColumnWidths((current) => ({
      ...current,
      [resize.id]: Math.max(96, resize.startWidth + event.clientX - resize.startX),
    }));
  };
  const stopColumnResize = () => { columnResizeRef.current = null; };
  const search = () => {
    setPage(0);
    setKeyword(draftKeyword.trim());
    setObjectType(draftObjectType);
    setStatus(draftStatus);
  };

  const reset = () => {
    setDraftKeyword('');
    setDraftObjectType('');
    setDraftStatus('');
    setKeyword('');
    setObjectType('');
    setStatus('');
    setPage(0);
  };

  const reauthenticate = async () => {
    try {
      await logout();
    } catch {
      // The current token remains usable for sign-out even when it lacks this page permission.
    }
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  const filterActions = (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="flex-end"
      sx={{ ...formListFilterActionsSx, gridColumn: advancedFiltersOpen ? '1 / -1' : { xs: '1 / -1', md: 'auto' } }}
    >
      <Button size="small" variant="outlined" startIcon={<RestartAltRounded />} onClick={reset} sx={{ height: 40, width: 80, minWidth: 80 }}>重置</Button>
      <Button size="small" variant="contained" startIcon={<SearchRounded />} onClick={search} sx={{ height: 40, width: 80, minWidth: 80 }}>查询</Button>
      <Button
        size="small"
        variant="text"
        endIcon={<ExpandMore sx={{ transform: advancedFiltersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />}
        onClick={() => setAdvancedFiltersOpen((open) => !open)}
        aria-expanded={advancedFiltersOpen}
        sx={{ height: 40, minWidth: 72, px: 1, color: '#1890ff', '&:hover': { bgcolor: '#f5faff' } }}
      >
        {advancedFiltersOpen ? '收起' : '展开'}
      </Button>
    </Stack>
  );

  const renderCell = (columnId: ColumnId, row: DhrInstanceSummary) => {
    const cellSx = { ...bodyCellSx };
    switch (columnId) {
      case 'dhrNo':
        return <TableCell key={columnId} sx={{ ...cellSx, color: '#303133', fontWeight: 600 }} title={row.dhrNo}>{row.dhrNo}</TableCell>;
      case 'object':
        return <TableCell key={columnId} sx={{ ...cellSx, fontWeight: 600 }} title={`${row.objectNo} · ${objectTypeLabel[row.objectType]}`}>{row.objectNo} <Typography component="span" variant="caption" sx={{ color: '#909399' }}>· {objectTypeLabel[row.objectType]}</Typography></TableCell>;
      case 'workOrderNo':
        return <TableCell key={columnId} sx={cellSx} title={row.workOrderNo}>{row.workOrderNo}</TableCell>;
      case 'productCode':
        return <TableCell key={columnId} sx={cellSx} title={row.productCode || '—'}>{row.productCode || '—'}</TableCell>;
      case 'productName':
        return <TableCell key={columnId} sx={cellSx} title={row.productName || '—'}>{row.productName || '—'}</TableCell>;
      case 'processVersion':
        return <TableCell key={columnId} sx={cellSx} title={row.processVersion || '—'}>{row.processVersion || '—'}</TableCell>;
      case 'route':
        return <TableCell key={columnId} sx={cellSx} title={`${row.routeName || '—'}${row.routeVersion ? ` · ${row.routeVersion}` : ''}`}>
          {row.routeName || '—'}{row.routeVersion && <Typography component="span" variant="caption" sx={{ color: '#909399' }}> · {row.routeVersion}</Typography>}
        </TableCell>;
      case 'dhrTemplate':
        return <TableCell key={columnId} sx={cellSx} title={`${row.dhrTemplateName || '未绑定模板'}${row.dhrTemplateVersion ? ` · ${row.dhrTemplateVersion}` : ''}`}>
          {row.dhrTemplateName || '未绑定模板'}{row.dhrTemplateVersion && <Typography component="span" variant="caption" sx={{ color: '#909399' }}> · {row.dhrTemplateVersion}</Typography>}
        </TableCell>;
      case 'createdAt':
        return <TableCell key={columnId} sx={{ ...cellSx, color: '#606266' }}>{formatTime(row.createdAt)}</TableCell>;
      case 'createdBy':
        return <TableCell key={columnId} sx={cellSx} title={row.createdBy || '—'}>{row.createdBy || '—'}</TableCell>;
      case 'updatedAt':
        return <TableCell key={columnId} sx={{ ...cellSx, color: '#606266' }}>{formatTime(row.updatedAt)}</TableCell>;
      case 'updatedBy':
        return <TableCell key={columnId} sx={cellSx} title={row.updatedBy || '—'}>{row.updatedBy || '—'}</TableCell>;
    }
  };

  const configuredTableWidth = visibleColumns.reduce((total, id) => total + getColumnWidth(id), 0);
  const tableWidth = configuredTableWidth + DHR_STATUS_COLUMN_WIDTH + DHR_ACTION_COLUMN_WIDTH;
  const stickyStatusCellSx = {
    ...bodyCellSx,
    position: 'sticky',
    right: DHR_ACTION_COLUMN_WIDTH,
    zIndex: 1,
    bgcolor: '#fff',
    boxShadow: '-4px 0 8px rgba(31, 35, 41, 0.06)',
  };
  const stickyActionCellSx = {
    ...bodyCellSx,
    position: 'sticky',
    right: 0,
    zIndex: 1,
    bgcolor: '#fff',
    width: DHR_ACTION_COLUMN_WIDTH,
    minWidth: DHR_ACTION_COLUMN_WIDTH,
    maxWidth: DHR_ACTION_COLUMN_WIDTH,
  };

  return (
    <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden', bgcolor: 'background.default' }}>
      <Box sx={formListQueryPanelSx}>
        <Box sx={formListQueryGridSx}>
          <TextField
            size="small"
            label="关键词"
            placeholder="DHR 编号、批次/SN、工单或产品"
            value={draftKeyword}
            onChange={(event) => setDraftKeyword(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') search(); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }}
            sx={fieldSx}
          />
          <TextField select size="small" label="DHR 状态" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value as DhrStatus | '')} sx={fieldSx}>
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="IN_PROGRESS">收集中</MenuItem>
            <MenuItem value="COMPLETED">已完成</MenuItem>
          </TextField>
          {advancedFiltersOpen ? (
            <TextField select size="small" label="生产对象类型" value={draftObjectType} onChange={(event) => setDraftObjectType(event.target.value as DhrObjectType | '')} sx={fieldSx}>
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="BATCH">批次</MenuItem>
              <MenuItem value="SN">序列号</MenuItem>
            </TextField>
          ) : filterActions}
          {advancedFiltersOpen ? filterActions : null}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
        <Box sx={{ flex: '0 0 auto', minHeight: 48, px: 2, borderBottom: '1px solid #ebeef5', display: 'flex', alignItems: 'center' }}>
          <Tooltip title="字段设置" arrow>
            <IconButton
              size="small"
              aria-label="字段设置"
              onClick={(event) => setColumnSettingsAnchor(event.currentTarget)}
              sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1 }}
            >
              <Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ViewColumnRounded sx={{ fontSize: 21 }} />
                <TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} />
              </Box>
            </IconButton>
          </Tooltip>
        </Box>

        <ListColumnSettingsPopover
          anchorEl={columnSettingsAnchor}
          columns={columns}
          settings={columnSettings}
          onClose={() => setColumnSettingsAnchor(null)}
          onToggle={(columnId) => setColumnSettings((current) => ({
            ...current,
            hidden: current.hidden.includes(columnId) ? current.hidden.filter((id) => id !== columnId) : [...current.hidden, columnId],
          }))}
          onReorder={(sourceId, targetId) => setColumnSettings((current) => reorderListColumns(columns, current, sourceId, targetId))}
        />

        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', containerType: 'inline-size' }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              tableLayout: 'fixed',
              width: tableWidth,
              minWidth: tableWidth,
              height: query.isLoading || query.isError || query.data?.content.length === 0 ? '100%' : 'auto',
            }}
          >
            <colgroup>
              {visibleColumns.map((columnId) => <col key={columnId} style={{ width: getColumnWidth(columnId) }} />)}
              <col style={{ width: DHR_STATUS_COLUMN_WIDTH }} />
              <col style={{ width: DHR_ACTION_COLUMN_WIDTH }} />
            </colgroup>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': headerCellSx }}>
                {visibleColumns.map((columnId) => (
                  <TableCell
                    key={columnId}
                    align="left"
                    sx={{
                      width: getColumnWidth(columnId),
                      minWidth: getColumnWidth(columnId),
                    }}
                  >
                    <Box sx={{ position: 'relative', pr: 1 }}>
                      {columns.find((column) => column.id === columnId)?.label}
                      <Box
                        aria-label={`调整${columns.find((column) => column.id === columnId)?.label ?? ''}列宽`}
                        onPointerDown={(event) => startColumnResize(event, columnId)}
                        onPointerMove={updateColumnResize}
                        onPointerUp={stopColumnResize}
                        onPointerCancel={stopColumnResize}
                        onLostPointerCapture={stopColumnResize}
                        sx={listColumnResizeHandleSx}
                      />
                    </Box>
                  </TableCell>
                ))}
                <TableCell
                  align="center"
                  sx={{
                    width: DHR_STATUS_COLUMN_WIDTH,
                    minWidth: DHR_STATUS_COLUMN_WIDTH,
                    position: 'sticky',
                    right: DHR_ACTION_COLUMN_WIDTH,
                    zIndex: 3,
                    bgcolor: '#f5f7fa',
                    boxShadow: '-4px 0 8px rgba(31, 35, 41, 0.06)',
                  }}
                >
                  状态
                </TableCell>
                <TableCell align="center" sx={{ width: DHR_ACTION_COLUMN_WIDTH, minWidth: DHR_ACTION_COLUMN_WIDTH, maxWidth: DHR_ACTION_COLUMN_WIDTH, position: 'sticky', right: 0, zIndex: 3, bgcolor: '#f5f7fa' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.isLoading && (
                <TableRow sx={{ height: '100%' }}>
                  <TableStateCell colSpan={visibleColumns.length + 2} sx={{ height: '100%', color: '#909399' }}>
                    <Skeleton width={72} />
                  </TableStateCell>
                </TableRow>
              )}

              {query.isError && (
                <TableRow>
                  <TableStateCell colSpan={visibleColumns.length + 2} sx={{ height: '100%', color: '#c62828' }}>
                    <Stack alignItems="center" spacing={1.25}>
                      <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, bgcolor: '#fff2f0', color: 'error.main', borderRadius: '50%' }}>
                        <RefreshRounded />
                      </Box>
                      <Typography fontWeight={700}>DHR 列表加载失败</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {requiresReauthentication
                          ? '当前会话没有 DHR 查看权限。若管理员刚调整过权限，请重新登录后再试。'
                          : queryErrorMessage || '请检查服务状态后重新加载。'}
                      </Typography>
                      <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => query.refetch()}>重新加载</Button>
                        {requiresReauthentication && <Button variant="contained" onClick={() => void reauthenticate()}>重新登录</Button>}
                      </Stack>
                    </Stack>
                  </TableStateCell>
                </TableRow>
              )}

              {!query.isLoading && !query.isError && query.data?.content.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  tabIndex={0}
                  role="button"
                  aria-label={`查看 ${row.dhrNo} 详情`}
                  onClick={() => setSelected(row)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelected(row);
                    }
                  }}
                  sx={{ cursor: 'pointer', '&:hover .MuiTableCell-root': { bgcolor: '#f5f9ff' }, '&:focus-visible': { outline: '2px solid #1890ff', outlineOffset: -2 }, '& > .MuiTableCell-root': bodyCellSx }}
                >
                  {visibleColumns.map((columnId) => renderCell(columnId, row))}
                  <TableCell align="center" sx={stickyStatusCellSx}><DhrStatusBadge status={row.status} /></TableCell>
                  <TableCell align="center" sx={stickyActionCellSx}>
                    <Tooltip title="查看 DHR 详情" arrow>
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label={`查看 ${row.dhrNo} 详情`}
                        onClick={(event) => { event.stopPropagation(); setSelected(row); }}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {!query.isLoading && !query.isError && query.data?.content.length === 0 && (
                <TableRow>
                  <TableStateCell colSpan={visibleColumns.length + 2} sx={{ height: '100%', color: '#909399' }}>暂无数据</TableStateCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <FormListPagination
          totalElements={query.data?.totalElements ?? 0}
          totalPages={query.data?.totalPages ?? 0}
          page={page}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={(value) => { setSize(value); setPage(0); }}
        />
      </Box>

      <DetailDialog selected={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
