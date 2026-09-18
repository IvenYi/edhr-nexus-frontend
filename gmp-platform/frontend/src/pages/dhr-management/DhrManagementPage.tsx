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
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
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
import type { DhrDirectoryItem, DhrInstanceSummary, DhrObjectType, DhrStatus } from '@/api/dhr-instances';
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

function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ px: 2.5, py: 1.75 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        {description && <Typography variant="caption" color="text.secondary">{description}</Typography>}
      </Box>
      {action}
    </Stack>
  );
}

function EvidenceItem({ item }: { item: DhrDirectoryItem }) {
  const title = item.displayName || item.formName || '未命名表单';
  return (
    <Box sx={{ py: 1.75, '& + &': { borderTop: '1px solid', borderColor: 'divider' } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={1.25}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography fontWeight={650} noWrap>{title}</Typography>
            {item.required && <Chip label="必填" size="small" color="warning" variant="outlined" />}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {item.formName || title}{item.formVersion ? ` · ${item.formVersion}` : ''}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={item.records.length ? `${item.records.length} 份记录` : '尚无记录'}
          color={item.records.length ? 'primary' : 'default'}
          variant="outlined"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        />
      </Stack>
      {item.records.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1.25 }}>
          {item.records.map((record) => (
            <Box key={record.id} sx={{ px: 1.5, py: 1.2, bgcolor: '#f7f9fc', border: '1px solid #ebeef5', borderRadius: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={0.5}>
                <Typography variant="body2" fontWeight={600}>{record.instanceNo}</Typography>
                <Typography variant="caption" color="text.secondary">{formatTime(record.updatedAt)}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {record.operationName || record.operationId} · {record.updatedBy || '系统'} · 副本 {record.copyId}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function DetailDrawer({ selected, onClose }: { selected: DhrInstanceSummary | null; onClose: () => void }) {
  const query = useQuery({
    queryKey: ['dhr-instance-detail', selected?.id],
    queryFn: () => getDhrInstance(selected!.id),
    enabled: Boolean(selected),
  });
  const detail = query.data;

  return (
    <Drawer
      anchor="right"
      open={Boolean(selected)}
      onClose={onClose}
      sx={{ zIndex: 1800, '& .MuiDrawer-paper': { zIndex: 1800 } }}
      PaperProps={{ sx: { width: { xs: '100%', md: 680 }, bgcolor: '#f6f8f9' } }}
    >
      <Box sx={{ position: 'sticky', top: 0, zIndex: 2, px: { xs: 2, sm: 3 }, py: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 0.5 }}>
              <ArticleOutlined color="primary" />
              <Typography variant="h6" noWrap>{selected?.dhrNo}</Typography>
              {selected && <DhrStatusBadge status={selected.status} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">DHR 只读详情 · 展示开工时冻结的执行上下文与已关联记录</Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="关闭详情"><CloseRounded /></IconButton>
        </Stack>
      </Box>

      {query.isLoading && (
        <Stack spacing={2} sx={{ p: 3 }}>
          {[220, 360].map((height) => <Skeleton key={height} variant="rounded" height={height} />)}
        </Stack>
      )}

      {query.isError && (
        <Box sx={{ m: 3, p: 4, textAlign: 'center', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography fontWeight={700}>详情加载失败</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>请检查服务状态后重试。</Typography>
          <Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => query.refetch()}>重新加载</Button>
        </Box>
      )}

      {detail && (
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            <SectionHeader title="冻结上下文" description="以下信息随生产对象首次开工固定，用于后续追溯。" />
            <Divider />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5, p: 2.5 }}>
              <Meta label="生产对象" value={`${objectTypeLabel[detail.objectType]} · ${detail.objectNo}`} />
              <Meta label="工单" value={detail.workOrderNo} />
              <Meta label="产品" value={[detail.productCode, detail.productName].filter(Boolean).join(' · ')} />
              <Meta label="制程版本" value={detail.processVersion} />
              <Meta label="工艺路线" value={`${detail.routeName || '—'}${detail.routeVersion ? ` · ${detail.routeVersion}` : ''}`} />
              <Meta label="DHR 模板" value={`${detail.dhrTemplateName || '—'}${detail.dhrTemplateVersion ? ` · ${detail.dhrTemplateVersion}` : ''}`} />
            </Box>
          </Box>

          <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            <SectionHeader
              title="记录目录"
              description="按冻结模板目录自动汇集受控表单证据。"
              action={(
                <Stack direction="row" gap={0.75} sx={{ flexShrink: 0 }}>
                  <Chip size="small" label={`${detail.evidenceSummary.suppliedItemCount}/${detail.evidenceSummary.itemCount} 项`} variant="outlined" />
                  <Chip size="small" label={`${detail.evidenceSummary.recordCount} 份记录`} color="primary" variant="outlined" />
                </Stack>
              )}
            />
            <Divider />
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {detail.directorySnapshot.directories.map((directory) => (
                <Box key={directory.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                  <Stack direction="row" alignItems="center" gap={1.1} sx={{ px: 2, py: 1.35, bgcolor: '#f7f9fc' }}>
                    <FolderOutlined sx={{ fontSize: 19, color: 'primary.main' }} />
                    <Typography fontWeight={700}>{directory.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{directory.items.length} 项</Typography>
                  </Stack>
                  <Divider />
                  <Box sx={{ px: 2 }}>{directory.items.map((item) => <EvidenceItem key={item.id} item={item} />)}</Box>
                </Box>
              ))}

              {detail.directorySnapshot.directories.length === 0 && (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <FactCheckOutlined sx={{ fontSize: 36, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>该 DHR 模板没有目录项</Typography>
                </Box>
              )}

              {detail.evidenceSummary.unmappedRecordCount > 0 && (
                <Box sx={{ display: 'flex', gap: 1, p: 1.5, bgcolor: '#fff8e1', border: '1px solid #ffe0a3', borderRadius: 1 }}>
                  <InfoOutlined sx={{ color: '#ed8b00', fontSize: 20, mt: 0.1 }} />
                  <Typography variant="body2" color="text.secondary">
                    另有 {detail.evidenceSummary.unmappedRecordCount} 份自定义或未绑定目录的表单记录，未计入目录完成度。
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      )}
    </Drawer>
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
        return <TableCell key={columnId} sx={{ ...cellSx, color: '#1890ff', fontWeight: 600 }} title={row.dhrNo}>{row.dhrNo}</TableCell>;
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

      <DetailDrawer selected={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
