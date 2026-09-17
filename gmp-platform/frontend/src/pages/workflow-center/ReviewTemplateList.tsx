import { useEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AccountTreeOutlined, Add, Delete, DragIndicator, Edit, RestartAlt, Search, TuneRounded, ViewColumnRounded } from '@mui/icons-material';
import {
  Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment,
  Pagination, Popover, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppDialog from '@/components/AppDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import { useAuthStore } from '@/stores/authStore';
import { useSnackbar } from '@/components/SnackbarProvider';
import { createTemplate, deleteTemplate, listTemplates, updateTemplate } from '@/api/workflow-templates';
import type { PageResult } from '@/types/common';

type Category = 'CHANGE' | 'OBSOLETE';
type Template = {
  id: number;
  name: string;
  code?: string | null;
  businessType?: Category | null;
  status: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  currentVersionNumber?: number | null;
  draftVersionNumber?: number | null;
  versionCount?: number | null;
};
type ConfigurableTemplateColumnId = 'name' | 'code' | 'status' | 'updatedAt';
type TemplateColumn = {
  id: ConfigurableTemplateColumnId;
  label: string;
  defaultWidth: number;
  minWidth: number;
};
type TemplateColumnSettings = {
  version: number;
  order: ConfigurableTemplateColumnId[];
  hidden: ConfigurableTemplateColumnId[];
};
type TemplateColumnWidths = Partial<Record<ConfigurableTemplateColumnId, number>>;

const categories: Array<{ value: Category; label: string }> = [
  { value: 'CHANGE', label: '表单变更' },
  { value: 'OBSOLETE', label: '表单作废' },
];
const REVIEW_TEMPLATE_COLUMN_SETTINGS_VERSION = 1;
const REVIEW_TEMPLATE_COLUMN_SETTINGS_STORAGE_PREFIX = 'review-template-list-column-settings:';
const REVIEW_TEMPLATE_COLUMN_WIDTH_STORAGE_PREFIX = 'review-template-list-column-widths:';
const REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH = 128;
const PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;
const REVIEW_TEMPLATE_COLUMNS: TemplateColumn[] = [
  { id: 'name', label: '模板名称', defaultWidth: 260, minWidth: 160 },
  { id: 'code', label: '编码', defaultWidth: 180, minWidth: 120 },
  { id: 'status', label: '状态', defaultWidth: 120, minWidth: 100 },
  { id: 'updatedAt', label: '更新时间', defaultWidth: 180, minWidth: 160 },
];
const tableHeaderCellSx = {
  bgcolor: '#f5f7fa', color: '#606266', fontWeight: 600, height: 48, py: 0,
  borderBottom: '1px solid #e4e7ed', whiteSpace: 'nowrap',
};
const tableRowSx = {
  '& > .MuiTableCell-root': { height: 40, py: 0.5, borderBottom: '1px solid #ebeef5' },
};
const toolbarIconSx = {
  width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff',
  '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' },
};
const emptyTableRowSx = { height: '100%' };
const emptyTableCellSx = { height: '100%', py: 0, color: '#909399', verticalAlign: 'middle' };

function DialogSection({ children }: { children: React.ReactNode }) {
  return <Box sx={{ border: '1px solid #ebeef5', borderRadius: 1, overflow: 'hidden' }}>
    <Box sx={{ px: 1.5, py: 1, bgcolor: '#f5f7fa', borderBottom: '1px solid #ebeef5' }}><Typography variant="subtitle2" fontWeight={700}>基本信息</Typography></Box>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>;
}

function getOperationColumnSx(layer: 'head' | 'body') {
  return {
    position: 'sticky' as const,
    right: 0,
    zIndex: layer === 'head' ? 10 : 6,
    width: REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH,
    minWidth: REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH,
    maxWidth: REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH,
    bgcolor: layer === 'head' ? '#f5f7fa' : '#fff',
    backgroundClip: 'padding-box',
    boxShadow: '-6px 0 8px -8px rgba(0, 0, 0, 0.35)',
    whiteSpace: 'nowrap',
  };
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

function normalizeColumnSettings(raw?: Partial<TemplateColumnSettings> | null): TemplateColumnSettings {
  const defaults = REVIEW_TEMPLATE_COLUMNS.map((column) => column.id);
  if (!raw || raw.version !== REVIEW_TEMPLATE_COLUMN_SETTINGS_VERSION) {
    return { version: REVIEW_TEMPLATE_COLUMN_SETTINGS_VERSION, order: defaults, hidden: [] };
  }
  const seen = new Set<ConfigurableTemplateColumnId>();
  const order = [
    ...(raw.order ?? []).filter((id): id is ConfigurableTemplateColumnId => defaults.includes(id) && !seen.has(id) && (seen.add(id), true)),
    ...defaults.filter((id) => !seen.has(id)),
  ];
  const hidden = (raw.hidden ?? []).filter((id): id is ConfigurableTemplateColumnId => order.includes(id));
  return {
    version: REVIEW_TEMPLATE_COLUMN_SETTINGS_VERSION,
    order,
    hidden: hidden.length >= order.length ? hidden.slice(1) : hidden,
  };
}

function loadColumnSettings(storageKey: string) {
  if (typeof window === 'undefined') return normalizeColumnSettings();
  try {
    return normalizeColumnSettings(JSON.parse(localStorage.getItem(storageKey) || 'null'));
  } catch {
    return normalizeColumnSettings();
  }
}

function loadColumnWidths(storageKey: string): TemplateColumnWidths {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return typeof parsed === 'object' && parsed ? parsed as TemplateColumnWidths : {};
  } catch {
    return {};
  }
}

function getColumnSettingsItems(settings: TemplateColumnSettings) {
  const columnsById = new Map(REVIEW_TEMPLATE_COLUMNS.map((column) => [column.id, column]));
  return settings.order.map((id) => columnsById.get(id)).filter((column): column is TemplateColumn => Boolean(column));
}

function getVisibleColumns(settings: TemplateColumnSettings) {
  return getColumnSettingsItems(settings).filter((column) => !settings.hidden.includes(column.id));
}

function resolveColumnWidths(widths: TemplateColumnWidths, containerWidth: number, columns: TemplateColumn[]) {
  const resolved = {} as Record<ConfigurableTemplateColumnId, number>;
  let totalWidth = REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH;
  columns.forEach((column) => {
    const width = Math.max(column.minWidth, widths[column.id] ?? column.defaultWidth);
    resolved[column.id] = width;
    totalWidth += width;
  });
  if (containerWidth > totalWidth && columns.length > 0) {
    const extraWidth = Math.floor((containerWidth - totalWidth) / columns.length);
    columns.forEach((column) => { resolved[column.id] += extraWidth; });
  }
  return resolved;
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.replace('T', ' ').slice(0, 16)
    : date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

export default function ReviewTemplateList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showMessage } = useSnackbar();
  const canAccess = useAuthStore((state) => state.hasPermission('workflow.review-templates'));
  const canEdit = useAuthStore((state) => state.hasPermission('workflow.template.edit'));
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const columnDragSourceRef = useRef<ConfigurableTemplateColumnId | null>(null);
  const [tableContainerWidth, setTableContainerWidth] = useState(0);
  const [category, setCategory] = useState<Category>('CHANGE');
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [propertyTarget, setPropertyTarget] = useState<Template | null>(null);
  const [columnAnchor, setColumnAnchor] = useState<HTMLElement | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<ConfigurableTemplateColumnId | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [propertyForm, setPropertyForm] = useState({ name: '', code: '', description: '' });
  const columnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(REVIEW_TEMPLATE_COLUMN_SETTINGS_STORAGE_PREFIX), []);
  const columnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(REVIEW_TEMPLATE_COLUMN_WIDTH_STORAGE_PREFIX), []);
  const [columnSettings, setColumnSettings] = useState<TemplateColumnSettings>(() => loadColumnSettings(columnSettingsStorageKey));
  const [columnWidths, setColumnWidths] = useState<TemplateColumnWidths>(() => loadColumnWidths(columnWidthStorageKey));
  const selected = categories.find((item) => item.value === category)!;
  const query = useQuery({
    queryKey: ['review-templates', category, page, pageSize, submittedKeyword],
    queryFn: async () => (await listTemplates({ page, size: pageSize, businessType: category, keyword: submittedKeyword })).data.data as PageResult<Template>,
    enabled: canAccess,
    refetchOnMount: 'always',
  });
  useEffect(() => {
    const lastPage = Math.max(query.data?.totalPages ?? 0, 1);
    if (page > lastPage) setPage(lastPage);
  }, [page, query.data?.totalPages]);
  const columnSettingsItems = useMemo(() => getColumnSettingsItems(columnSettings), [columnSettings]);
  const visibleColumns = useMemo(() => getVisibleColumns(columnSettings), [columnSettings]);
  const visibleConfigurableColumnCount = columnSettings.order.length - columnSettings.hidden.length;
  const resolvedColumnWidths = useMemo(
    () => resolveColumnWidths(columnWidths, tableContainerWidth, visibleColumns),
    [columnWidths, tableContainerWidth, visibleColumns],
  );
  const tableWidth = REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH + visibleColumns.reduce((total, column) => total + resolvedColumnWidths[column.id], 0);
  const rows = query.data?.content ?? [];
  const isTableNonDataState = query.isLoading || query.isError || rows.length === 0;

  useEffect(() => {
    setColumnSettings(loadColumnSettings(columnSettingsStorageKey));
    setColumnWidths(loadColumnWidths(columnWidthStorageKey));
  }, [columnSettingsStorageKey, columnWidthStorageKey]);

  useEffect(() => {
    localStorage.setItem(columnSettingsStorageKey, JSON.stringify(columnSettings));
  }, [columnSettings, columnSettingsStorageKey]);

  useEffect(() => {
    localStorage.setItem(columnWidthStorageKey, JSON.stringify(columnWidths));
  }, [columnWidthStorageKey, columnWidths]);

  useEffect(() => {
    const element = tableContainerRef.current;
    if (!element) return undefined;
    const updateWidth = () => setTableContainerWidth(element.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const createMutation = useMutation({
    mutationFn: () => createTemplate({ ...form, businessType: category, type: 'RECORD_CONTROL' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-templates'] });
      setCreateOpen(false);
      setForm({ name: '', code: '', description: '' });
      showMessage('模板已创建', 'success');
    },
    onError: () => showMessage('模板创建失败，请稍后重试', 'error'),
  });
  const updateMutation = useMutation({
    mutationFn: () => propertyTarget ? updateTemplate(propertyTarget.id, { ...propertyForm, businessType: category, type: 'RECORD_CONTROL' }) : Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-templates'] });
      setPropertyTarget(null);
      showMessage('模板属性已保存', 'success');
    },
    onError: () => showMessage('模板属性保存失败，请稍后重试', 'error'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-templates'] });
      setDeleteId(null);
      showMessage('模板已删除', 'success');
    },
    onError: () => showMessage('模板删除失败，请稍后重试', 'error'),
  });

  const submitSearch = () => { setPage(1); setSubmittedKeyword(keyword.trim()); };
  const resetSearch = () => { setKeyword(''); setSubmittedKeyword(''); setPage(1); };
  const toggleColumnVisibility = (columnId: ConfigurableTemplateColumnId) => setColumnSettings((current) => {
    const isVisible = !current.hidden.includes(columnId);
    if (isVisible && visibleConfigurableColumnCount <= 1) return current;
    return {
      ...current,
      hidden: isVisible ? [...current.hidden, columnId] : current.hidden.filter((id) => id !== columnId),
    };
  });
  const reorderColumns = (sourceId: ConfigurableTemplateColumnId, targetId: ConfigurableTemplateColumnId) => setColumnSettings((current) => {
    if (sourceId === targetId) return current;
    const order = current.order.filter((id) => id !== sourceId);
    const targetIndex = order.indexOf(targetId);
    if (targetIndex < 0) return current;
    order.splice(targetIndex, 0, sourceId);
    return { ...current, order };
  });
  const handleColumnDragStart = (event: DragEvent<HTMLDivElement>, columnId: ConfigurableTemplateColumnId) => {
    columnDragSourceRef.current = columnId;
    setDraggingColumnId(columnId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnId);
  };
  const handleColumnDrop = (event: DragEvent<HTMLDivElement>, targetColumnId: ConfigurableTemplateColumnId) => {
    event.preventDefault();
    const sourceColumnId = columnDragSourceRef.current ?? event.dataTransfer.getData('text/plain') as ConfigurableTemplateColumnId;
    if (sourceColumnId && columnSettings.order.includes(sourceColumnId)) reorderColumns(sourceColumnId, targetColumnId);
    columnDragSourceRef.current = null;
    setDraggingColumnId(null);
  };
  const beginColumnResize = (event: ReactPointerEvent<HTMLDivElement>, column: TemplateColumn) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const storedStartWidth = Math.max(column.minWidth, columnWidths[column.id] ?? column.defaultWidth);
    const baseTableWidth = REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH + visibleColumns.reduce(
      (total, item) => total + Math.max(item.minWidth, columnWidths[item.id] ?? item.defaultWidth),
      0,
    );
    const widthMultiplier = tableContainerWidth > baseTableWidth && visibleColumns.length > 1
      ? visibleColumns.length / (visibleColumns.length - 1)
      : 1;
    const onMove = (moveEvent: PointerEvent) => {
      const width = Math.max(column.minWidth, storedStartWidth + (moveEvent.clientX - startX) * widthMultiplier);
      setColumnWidths((current) => ({ ...current, [column.id]: width }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const renderDataCell = (item: Template, column: TemplateColumn) => {
    if (column.id === 'name') return <Typography variant="body2" noWrap>{item.name}</Typography>;
    if (column.id === 'code') return <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace' }}>{item.code || '-'}</Typography>;
    if (column.id === 'status') {
      if (item.currentVersionNumber) return <StatusBadge label={`当前 V${item.currentVersionNumber}`} color="success" showDot={false} />;
      if (item.draftVersionNumber) return <StatusBadge label={`草稿 V${item.draftVersionNumber}`} color="warning" showDot={false} />;
      return <StatusBadge label="未发布" color="default" showDot={false} />;
    }
    return formatDateTime(item.updatedAt || item.createdAt);
  };

  if (!canAccess) {
    return <Box sx={{ p: 3, color: '#606266' }}>无权访问审批流程。</Box>;
  }

  return (
    <Box sx={{ minWidth: 0, height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '260px minmax(0, 1fr)' }, gap: 1.5, minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
        <Typography sx={{ px: 2, height: 48, display: 'flex', alignItems: 'center', fontWeight: 600, color: '#303133', borderBottom: '1px solid #e4e7ed' }}>流程分类</Typography>
        {categories.map((item) => {
          const isSelected = category === item.value;
          return <Box key={item.value} component="button" type="button" onClick={() => { setCategory(item.value); setPage(1); }} sx={{ display: 'block', width: '100%', minHeight: 40, px: 2, py: 1, textAlign: 'left', border: 0, borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent', bgcolor: isSelected ? '#e8f4ff' : '#fff', color: isSelected ? '#1890ff' : '#303133', cursor: 'pointer', '&:hover': { bgcolor: isSelected ? '#e8f4ff' : '#f5f7fa' } }}>
            <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>{item.label}</Typography>
          </Box>;
        })}
      </Box>

      <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
        <Box component="form" onSubmit={(event) => { event.preventDefault(); submitSearch(); }} sx={{ flex: '0 0 auto', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center', p: 2 }}>
            <TextField fullWidth size="small" label="模板名称/编码" placeholder="请输入" value={keyword} onChange={(event) => setKeyword(event.target.value)} sx={{ '& .MuiInputBase-root': { height: 40 }, '& .MuiInputBase-input': { boxSizing: 'border-box' } }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ gridColumn: { xs: '1', md: '3' } }}>
              <Button type="button" size="small" sx={{ height: 40, width: 80, minWidth: 80 }} variant="outlined" startIcon={<RestartAlt />} onClick={resetSearch}>重置</Button>
              <Button type="submit" size="small" sx={{ height: 40, width: 80, minWidth: 80 }} variant="contained" startIcon={<Search />}>查询</Button>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
          <Box sx={{ flex: '0 0 auto', px: 2, py: 0.75, minHeight: 48, borderBottom: '1px solid #ebeef5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Tooltip title="字段设置" arrow>
              <IconButton data-review-template-column-settings-trigger aria-label="字段设置" size="small" onClick={(event) => setColumnAnchor(event.currentTarget)} sx={toolbarIconSx}>
                <Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ViewColumnRounded sx={{ fontSize: 21 }} />
                  <TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} />
                </Box>
              </IconButton>
            </Tooltip>
            {canEdit ? <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setCreateOpen(true)}>新建</Button> : <Box />}
          </Box>

          <Popover open={Boolean(columnAnchor)} anchorEl={columnAnchor} onClose={() => setColumnAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }} PaperProps={{ sx: { mt: 1, width: 220, border: '1px solid #e4e7ed', borderRadius: 1, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } }}>
            <Stack data-review-template-column-settings-panel spacing={0.5} sx={{ p: 1.5 }}>
              {columnSettingsItems.map((column) => {
                const checked = !columnSettings.hidden.includes(column.id);
                const disabled = checked && visibleConfigurableColumnCount <= 1;
                return <Box key={column.id} data-review-template-column-settings-row data-column-id={column.id} draggable onDragStart={(event) => handleColumnDragStart(event, column.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleColumnDrop(event, column.id)} onDragEnd={() => { columnDragSourceRef.current = null; setDraggingColumnId(null); }} sx={{ display: 'grid', gridTemplateColumns: '24px 34px minmax(0, 1fr)', alignItems: 'center', minHeight: 40, borderRadius: 1, cursor: 'move', color: checked ? '#1890ff' : '#a8abb2', opacity: draggingColumnId === column.id ? 0.55 : 1, '&:hover': { bgcolor: '#f5f7fa' } }}>
                  <DragIndicator fontSize="small" sx={{ color: '#909399' }} />
                  <input aria-label={`${column.label}字段显隐`} type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleColumnVisibility(column.id)} onClick={(event) => event.stopPropagation()} style={{ width: 16, height: 16 }} />
                  <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{column.label}</Typography>
                </Box>;
              })}
            </Stack>
          </Popover>

          <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
            <TableContainer ref={tableContainerRef} sx={{ width: '100%', height: '100%', minHeight: 0, overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: tableWidth, minWidth: tableWidth, height: isTableNonDataState ? '100%' : 'auto' }}>
                <colgroup>
                  {visibleColumns.map((column) => <col key={column.id} style={{ width: resolvedColumnWidths[column.id] }} />)}
                  <col style={{ width: REVIEW_TEMPLATE_ACTION_COLUMN_WIDTH }} />
                </colgroup>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                    {visibleColumns.map((column) => <TableCell key={column.id} sx={{ width: resolvedColumnWidths[column.id], minWidth: column.minWidth, position: 'sticky', top: 0, zIndex: 2, pr: 2, userSelect: 'none' }}>
                      {column.label}
                      <Box aria-label={`调整${column.label}列宽`} onPointerDown={(event) => beginColumnResize(event, column)} sx={{ position: 'absolute', top: 0, right: -3, width: 8, height: '100%', cursor: 'col-resize', zIndex: 3, '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 18, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }} />
                    </TableCell>)}
                    <TableCell align="center" sx={getOperationColumnSx('head')}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ height: isTableNonDataState ? '100%' : 'auto' }}>
                  {query.isLoading ? <TableRow sx={emptyTableRowSx}><TableCell colSpan={visibleColumns.length + 1} align="center" sx={emptyTableCellSx}><CircularProgress size={24} /></TableCell></TableRow> : null}
                  {!query.isLoading && query.isError ? <TableRow sx={emptyTableRowSx}><TableCell colSpan={visibleColumns.length + 1} align="center" sx={emptyTableCellSx}><Stack alignItems="center" spacing={1}><Typography variant="body2">加载失败</Typography><Button size="small" onClick={() => query.refetch()}>重新加载</Button></Stack></TableCell></TableRow> : null}
                  {!query.isLoading && !query.isError && rows.length === 0 ? <TableRow sx={emptyTableRowSx}><TableCell colSpan={visibleColumns.length + 1} align="center" sx={emptyTableCellSx}>暂无数据</TableCell></TableRow> : null}
                  {!query.isLoading && !query.isError ? rows.map((item) => <TableRow key={item.id} hover sx={tableRowSx}>
                    {visibleColumns.map((column) => <TableCell key={column.id} title={column.id === 'status' ? undefined : String(column.id === 'updatedAt' ? formatDateTime(item.updatedAt || item.createdAt) : item[column.id] || '-')}>{renderDataCell(item, column)}</TableCell>)}
                    <TableCell align="center" sx={getOperationColumnSx('body')}>
                      <Tooltip title={canEdit ? "配置流程" : "查看流程"} arrow><IconButton size="small" aria-label={canEdit ? "配置流程" : "查看流程"} onClick={() => navigate(`/workflow/review-templates/${item.id}/configure`)}><AccountTreeOutlined fontSize="small" /></IconButton></Tooltip>
                      {canEdit ? <Tooltip title="编辑属性" arrow><IconButton size="small" aria-label="编辑属性" onClick={() => { setPropertyTarget(item); setPropertyForm({ name: item.name, code: item.code || '', description: item.description || '' }); }}><Edit fontSize="small" /></IconButton></Tooltip> : null}
                      {canEdit ? <Tooltip title="删除" arrow><IconButton size="small" aria-label="删除" color="error" onClick={() => setDeleteId(item.id)}><Delete fontSize="small" /></IconButton></Tooltip> : null}
                    </TableCell>
                  </TableRow>) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ flex: '0 0 auto', minHeight: 56, px: 2, borderTop: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#606266', whiteSpace: 'nowrap' }}>共 {query.data?.totalElements ?? 0} 条数据</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Pagination size="small" count={Math.max(query.data?.totalPages ?? 0, 1)} page={Math.min(page, Math.max(query.data?.totalPages ?? 0, 1))} onChange={(_, value) => setPage(value)} />
              <TextField select size="small" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]); setPage(1); }} SelectProps={{ native: true }} sx={{ width: 112 }} inputProps={{ 'aria-label': '每页条数' }}>{PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option} 条/页</option>)}</TextField>
            </Stack>
          </Box>
        </Box>
      </Box>

      <AppDialog open={canEdit && createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新建{selected.label}模板</DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <DialogSection><Stack spacing={1.5}>
            <TextField autoFocus label="模板名称" required fullWidth size="small" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <TextField label="模板编码" fullWidth size="small" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            <TextField label="说明" fullWidth size="small" multiline minRows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Stack></DialogSection>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}><Button onClick={() => setCreateOpen(false)}>取消</Button><Button variant="contained" disabled={!form.name.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>{createMutation.isPending ? '创建中...' : '创建'}</Button></DialogActions>
      </AppDialog>
      <AppDialog open={canEdit && propertyTarget !== null} onClose={() => setPropertyTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑模板属性</DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <DialogSection><Stack spacing={1.5}>
            <TextField autoFocus label="模板名称" required fullWidth size="small" value={propertyForm.name} onChange={(event) => setPropertyForm({ ...propertyForm, name: event.target.value })} />
            <TextField label="模板编码" fullWidth size="small" value={propertyForm.code} onChange={(event) => setPropertyForm({ ...propertyForm, code: event.target.value })} />
            <TextField label="说明" fullWidth size="small" multiline minRows={3} value={propertyForm.description} onChange={(event) => setPropertyForm({ ...propertyForm, description: event.target.value })} />
          </Stack></DialogSection>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}><Button onClick={() => setPropertyTarget(null)}>取消</Button><Button variant="contained" disabled={!propertyForm.name.trim() || updateMutation.isPending} onClick={() => updateMutation.mutate()}>{updateMutation.isPending ? '保存中...' : '保存'}</Button></DialogActions>
      </AppDialog>
      <ConfirmDialog open={canEdit && deleteId !== null} title="删除审批流程" message="删除后流程及其草稿版本将不可恢复，确认继续吗？" confirmText="删除" destructive loading={deleteMutation.isPending} onCancel={() => setDeleteId(null)} onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)} />
    </Box>
  );
}
