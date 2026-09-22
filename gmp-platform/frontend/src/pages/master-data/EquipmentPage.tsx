import { readRecordLocation } from '@/utils/recordLocation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Autocomplete, Box, Button, CircularProgress, DialogActions, DialogContent,
  DialogTitle, IconButton, MenuItem, Pagination, Popover, Snackbar, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, DragIndicator, Edit, Search, TuneRounded, ViewColumnRounded } from '@mui/icons-material';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import FormDialogFieldGrid from '@/components/FormDialogFieldGrid';
import ConfirmDialog from '@/components/ConfirmDialog';
import TableStateCell from '@/components/TableStateCell';
import { ListTableShell } from '@/components/ListTableShell';
import { listTableHeaderCellSx, listTableStickyEdgeSx } from '@/components/listTableStyles';
import StatusBadge from '@/components/StatusBadge';
import {
  createEquipment, createEquipmentCategory, createEquipmentType, deleteEquipment,
  deleteEquipmentCategory, deleteEquipmentType, getAllEquipmentTypes, getEquipment,
  getEquipmentCategories, getEquipmentTypes, updateEquipment, updateEquipmentCategory,
  updateEquipmentType, type EquipmentCategoryRecord, type EquipmentRecord, type EquipmentTypeRecord,
} from '@/api/master-data';
import type { PageResult } from '@/types/common';

type EquipmentRow = EquipmentRecord | EquipmentTypeRecord;
const emptyForm = { code: '', name: '', description: '', categoryId: '', equipmentTypeId: '', brand: '', model: '', serialNumber: '', purchaseDate: '', status: 'ACTIVE' };
const panelSx = { bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' };
const tableHeaderCellSx = listTableHeaderCellSx;
type EquipmentColumn = { id: string; label: string; width: number };
type ColumnPreferences = { order: string[]; hidden: string[]; widths: Record<string, number> };
export const equipmentSystemColumns: EquipmentColumn[] = [
  { id: 'createdBy', label: '创建人', width: 140 },
  { id: 'createdAt', label: '创建时间', width: 160 },
  { id: 'updatedBy', label: '更新人', width: 140 },
  { id: 'updatedAt', label: '更新时间', width: 160 },
];

export function formatEquipmentDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function equipmentPurchaseDateError(value: string, today = formatEquipmentDateTime(new Date().toISOString()).slice(0, 10)) {
  return value > today ? '采购时间不能晚于今天' : '';
}

export function normalizeEquipmentColumns(columns: EquipmentColumn[], raw?: Partial<ColumnPreferences> | null): ColumnPreferences {
  const ids = columns.filter((column) => column.id !== 'actions').map((column) => column.id);
  const order = [...new Set(Array.isArray(raw?.order) ? raw.order.filter((id) => ids.includes(id)) : [])];
  ids.forEach((id, index) => {
    if (order.includes(id)) return;
    const nextId = ids.slice(index + 1).find((candidate) => order.includes(candidate));
    order.splice(nextId ? order.indexOf(nextId) : order.length, 0, id);
  });
  const hidden = [...new Set(Array.isArray(raw?.hidden) ? raw.hidden.filter((id) => ids.includes(id)) : [])];
  const widths = Object.fromEntries(ids.flatMap((id) => {
    const width = raw?.widths?.[id];
    return typeof width === 'number' && Number.isFinite(width) ? [[id, Math.max(80, width)]] : [];
  }));
  return { order, hidden: hidden.length === ids.length ? hidden.slice(1) : hidden, widths };
}

export function resolveEquipmentColumnWidths(columns: EquipmentColumn[], widths: Record<string, number>, containerWidth: number) {
  const resolved = Object.fromEntries(columns.map((column) => [column.id, column.id === 'actions' ? 96 : Math.max(80, widths[column.id] ?? column.width)]));
  const flexible = columns.filter((column) => column.id !== 'actions');
  const extra = Math.max(0, containerWidth - Object.values(resolved).reduce((sum, width) => sum + width, 0));
  flexible.forEach((column) => { resolved[column.id] += extra / flexible.length; });
  return resolved;
}

function columnStorageKey(pageKey: string) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return `equipment-modeling-columns:${pageKey}:${user?.id ?? user?.username ?? 'anonymous'}`;
  } catch { return `equipment-modeling-columns:${pageKey}:anonymous`; }
}

export function equipmentEditorForm(row: EquipmentRow, isTypes: boolean) {
  const type = row as EquipmentTypeRecord;
  const equipment = row as EquipmentRecord;
  return {
    ...emptyForm, code: row.code, name: row.name, description: row.description ?? '',
    ...(isTypes ? { categoryId: type.categoryId ?? '' } : {
      equipmentTypeId: equipment.equipmentTypeId ?? '', brand: equipment.brand ?? '', model: equipment.model ?? '',
      serialNumber: equipment.serialNumber ?? '', purchaseDate: equipment.purchaseDate ?? '', status: equipment.status,
    }),
  };
}

export default function EquipmentPage({ pageKey = 'equipment' }: { pageKey?: 'types' | 'equipment' }) {
  const isTypes = pageKey === 'types';
  const recordLabel = isTypes ? '设备类型' : '设备';
  const allColumns = useMemo<EquipmentColumn[]>(() => [
    { id: 'name', label: `${isTypes ? '设备类型' : '设备'}名称`, width: 220 },
    { id: 'code', label: `${isTypes ? '设备类型' : '设备'}编码`, width: 180 },
    { id: 'categoryName', label: '设备分类', width: 150 },
    ...(!isTypes ? [
      { id: 'equipmentTypeName', label: '设备类型', width: 180 },
      { id: 'brand', label: '设备品牌', width: 160 },
      { id: 'model', label: '型号', width: 160 },
      { id: 'serialNumber', label: '序列号', width: 180 },
      { id: 'purchaseDate', label: '采购时间', width: 160 },
      { id: 'status', label: '状态', width: 100 },
    ] : []),
    ...equipmentSystemColumns,
    { id: 'actions', label: '操作', width: 96 },
  ], [isTypes]);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState(() => readRecordLocation().keyword);
  const [search, setSearch] = useState(() => readRecordLocation().keyword);
  const [categoryId, setCategoryId] = useState('');
  const [equipmentTypeId, setEquipmentTypeId] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const today = formatEquipmentDateTime(new Date().toISOString()).slice(0, 10);
  const purchaseDateError = isTypes ? '' : equipmentPurchaseDateError(form.purchaseDate, today);
  const [categoryDialog, setCategoryDialog] = useState<{ id: string | null; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; category: boolean } | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const storageKey = useMemo(() => columnStorageKey(pageKey), [pageKey]);
  const [columnPreferences, setColumnPreferences] = useState(() => {
    try { return normalizeEquipmentColumns(allColumns, JSON.parse(localStorage.getItem(storageKey) || 'null')); }
    catch { return normalizeEquipmentColumns(allColumns); }
  });
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLButtonElement | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const resizeStart = useRef<{ id: string; x: number; width: number; widths: Record<string, number> } | null>(null);
  const columns = [...columnPreferences.order.filter((id) => !columnPreferences.hidden.includes(id)).map((id) => allColumns.find((column) => column.id === id)!), allColumns[allColumns.length - 1]];
  const columnWidths = resolveEquipmentColumnWidths(columns, columnPreferences.widths, containerWidth);
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columnPreferences));
  }, [storageKey, columnPreferences]);
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;
    const update = () => setContainerWidth(container.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  const notifyError = (error: unknown) => setSnackbar({ message: error instanceof Error ? error.message : '操作失败，请重试', severity: 'error' });

  const categoriesQuery = useQuery({
    queryKey: ['equipment-categories'], enabled: isTypes,
    queryFn: async () => (await getEquipmentCategories()).data.data as EquipmentCategoryRecord[],
  });
  const typesQuery = useQuery({ queryKey: ['equipment-type-options'], queryFn: getAllEquipmentTypes, enabled: !isTypes });
  const listQuery = useQuery({
    queryKey: ['equipment-modeling', pageKey, page, size, search, categoryId, equipmentTypeId],
    queryFn: async () => {
      const params = { page, size, keyword: search, ...(isTypes ? { categoryId: categoryId || undefined } : { equipmentTypeId: equipmentTypeId || undefined }) };
      return (await (isTypes ? getEquipmentTypes(params) : getEquipment(params))).data.data as PageResult<EquipmentRow>;
    },
  });
  const categories = categoriesQuery.data ?? [];
  const typeOptions = typesQuery.data ?? [];
  const data = listQuery.data;
  useEffect(() => {
    if (data && page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages));
  }, [data, page]);

  const invalidate = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['equipment-modeling'] }),
    queryClient.invalidateQueries({ queryKey: ['equipment-categories'] }),
    queryClient.invalidateQueries({ queryKey: ['equipment-type-options'] }),
  ]);
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!isTypes) {
        const error = equipmentPurchaseDateError(form.purchaseDate);
        if (error) throw new Error(error);
      }
      const body = isTypes
        ? { code: form.code.trim(), name: form.name.trim(), categoryId: form.categoryId, description: form.description.trim() || null }
        : { code: form.code.trim(), name: form.name.trim(), equipmentTypeId: form.equipmentTypeId, brand: form.brand.trim(), model: form.model.trim(), serialNumber: form.serialNumber.trim(), purchaseDate: form.purchaseDate || null, status: form.status, description: form.description.trim() || null };
      return isTypes
        ? editingId ? updateEquipmentType(editingId, body) : createEquipmentType(body)
        : editingId ? updateEquipment(editingId, body) : createEquipment(body);
    },
    onSuccess: async () => { await invalidate(); setOpen(false); setSnackbar({ message: '保存成功', severity: 'success' }); },
    onError: notifyError,
  });
  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!categoryDialog) return;
      const body = { name: categoryDialog.name.trim() };
      return categoryDialog.id ? updateEquipmentCategory(categoryDialog.id, body) : createEquipmentCategory(body);
    },
    onSuccess: async () => { await invalidate(); setCategoryDialog(null); setSnackbar({ message: '分类已保存', severity: 'success' }); },
    onError: notifyError,
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      return deleteTarget.category ? deleteEquipmentCategory(deleteTarget.id) : isTypes ? deleteEquipmentType(deleteTarget.id) : deleteEquipment(deleteTarget.id);
    },
    onSuccess: async () => {
      if (deleteTarget?.category && categoryId === deleteTarget.id) { setCategoryId(''); setPage(1); }
      await invalidate(); setDeleteTarget(null); setSnackbar({ message: '删除成功', severity: 'success' });
    },
    onError: notifyError,
  });
  const openEditor = (row?: EquipmentRow) => {
    setEditingId(row?.id ?? null);
    setForm(row ? equipmentEditorForm(row, isTypes) : { ...emptyForm, categoryId: categories.some((item) => item.id === categoryId) ? categoryId : '', equipmentTypeId });
    setOpen(true);
  };
  const validParent = isTypes ? categories.some((item) => item.id === form.categoryId) : typeOptions.some((item) => item.id === form.equipmentTypeId);

  return (
    <>
      <Box data-equipment-modeling-page={pageKey} sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'grid', gridTemplateColumns: isTypes ? { xs: '1fr', lg: '260px minmax(0, 1fr)' } : 'minmax(0, 1fr)', gap: 1.5 }}>
        {isTypes && <Box data-equipment-category-panel sx={{ ...panelSx, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
            <Typography fontWeight={600}>设备分类</Typography>
            <Tooltip title="新增分类"><IconButton size="small" color="primary" aria-label="新增分类" onClick={() => setCategoryDialog({ id: null, name: '' })}><Add fontSize="small" /></IconButton></Tooltip>
          </Stack>
          <Stack spacing={0.5} sx={{ p: 1, overflow: 'auto' }}>
            {categoriesQuery.isLoading && <CircularProgress size={24} sx={{ m: 2 }} />}
            {categoriesQuery.isError && <Alert severity="error" action={<Button onClick={() => categoriesQuery.refetch()}>重试</Button>}>分类加载失败</Alert>}
            {[{ id: '', name: '全部', system: true, count: undefined }, { id: 'uncategorized', name: '未分类', system: true, count: undefined }, ...categories].map((category) => (
              <Stack key={category.id} direction="row" alignItems="center" sx={{ borderRadius: 1, bgcolor: categoryId === category.id ? '#e8f4ff' : 'transparent', '&:hover': { bgcolor: '#f5f7fa' } }}>
                <Button onClick={() => { setCategoryId(category.id); setPage(1); }} aria-pressed={categoryId === category.id} sx={{ flex: 1, minWidth: 0, minHeight: 40, px: 1.25, justifyContent: 'space-between', color: categoryId === category.id ? '#1890ff' : '#303133' }}>
                  <Typography component="span" noWrap fontWeight={categoryId === category.id ? 600 : 400}>{category.name}</Typography>
                  <Typography component="span" variant="caption" sx={{ ml: 1 }}>{category.count}</Typography>
                </Button>
                {!category.system && <>
                  <Tooltip title="编辑分类"><IconButton size="small" aria-label={`编辑分类 ${category.name}`} onClick={() => setCategoryDialog({ id: category.id, name: category.name })}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="删除分类"><IconButton size="small" color="error" aria-label={`删除分类 ${category.name}`} onClick={() => setDeleteTarget({ id: category.id, name: category.name, category: true })}><Delete fontSize="small" /></IconButton></Tooltip>
                </>}
              </Stack>
            ))}
          </Stack>
        </Box>}
        <Stack spacing={1.5} sx={{ minHeight: 0, minWidth: 0 }}>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); setSearch(keyword.trim()); setPage(1); }} sx={{ ...panelSx, p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center', '& .MuiInputBase-root': { height: 40 } }}>
              {!isTypes && <Autocomplete size="small" options={typeOptions} value={typeOptions.find((item) => item.id === equipmentTypeId) ?? null} isOptionEqualToValue={(option, value) => option.id === value.id} getOptionLabel={(option) => `${option.name} (${option.code})`} loading={typesQuery.isLoading} onChange={(_, value) => { setEquipmentTypeId(value?.id ?? ''); setPage(1); }} renderInput={(params) => <TextField {...params} label="设备类型" placeholder="全部" />} />}
              <TextField size="small" label="名称或编码" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ gridColumn: { md: 3 } }}>
                <Button variant="outlined" sx={{ minWidth: 80, height: 40 }} onClick={() => { setKeyword(''); setSearch(''); setEquipmentTypeId(''); setPage(1); }}>重置</Button>
                <Button type="submit" variant="contained" sx={{ minWidth: 80, height: 40 }} startIcon={<Search />}>查询</Button>
              </Stack>
            </Box>
            {!isTypes && typesQuery.isError && <Alert sx={{ mt: 1 }} severity="error" action={<Button onClick={() => typesQuery.refetch()}>重试</Button>}>设备类型加载失败</Alert>}
          </Box>
          <Box sx={{ ...panelSx, display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
              <Tooltip title="字段设置" arrow>
                <IconButton size="small" aria-label="字段设置" onClick={(event) => setSettingsAnchor(event.currentTarget)} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}>
                  <Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ViewColumnRounded sx={{ fontSize: 21 }} />
                    <TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} />
                  </Box>
                </IconButton>
              </Tooltip>
              <Button size="small" variant="contained" startIcon={<Add />} onClick={() => openEditor()}>新增{recordLabel}</Button>
            </Stack>
            <Popover open={Boolean(settingsAnchor)} anchorEl={settingsAnchor} onClose={() => setSettingsAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }} PaperProps={{ sx: { mt: 1, width: 220, border: '1px solid #e4e7ed', borderRadius: 1, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } }}>
              <Stack spacing={0.5} sx={{ p: 1.5 }}>
                {columnPreferences.order.map((id) => {
                  const column = allColumns.find((item) => item.id === id)!;
                  const checked = !columnPreferences.hidden.includes(id);
                  return <Box key={id} data-equipment-column-setting={id} draggable
                    onDragStart={(event) => { setDraggingColumnId(id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', id); }}
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggingColumnId && draggingColumnId !== id) setColumnPreferences((current) => {
                        const order = current.order.filter((item) => item !== draggingColumnId);
                        order.splice(current.order.indexOf(id), 0, draggingColumnId);
                        return { ...current, order };
                      });
                      setDraggingColumnId(null);
                    }} onDragEnd={() => setDraggingColumnId(null)}
                    sx={{ display: 'grid', gridTemplateColumns: '24px 34px minmax(0, 1fr)', alignItems: 'center', minHeight: 40, borderRadius: 1, cursor: 'move', color: checked ? '#1890ff' : '#a8abb2', opacity: draggingColumnId === id ? 0.55 : 1, '&:hover': { bgcolor: '#f5f7fa' } }}>
                    <DragIndicator fontSize="small" sx={{ color: '#909399' }} />
                    <input type="checkbox" aria-label={`${column.label}字段显隐`} checked={checked} disabled={checked && columns.length <= 2} onChange={() => setColumnPreferences((current) => ({ ...current, hidden: checked ? [...current.hidden, id] : current.hidden.filter((item) => item !== id) }))} style={{ width: 16, height: 16 }} />
                    <Typography noWrap fontWeight={600}>{column.label}</Typography>
                  </Box>;
                })}
                <Button size="small" onClick={() => setColumnPreferences(normalizeEquipmentColumns(allColumns))}>恢复默认</Button>
              </Stack>
            </Popover>
            <ListTableShell ref={tableContainerRef} sx={{ flex: 1, minHeight: 180, containerType: 'inline-size', overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: columns.reduce((sum, col) => sum + columnWidths[col.id], 0), height: !data?.content.length ? '100%' : 'auto' }}>
                <colgroup>{columns.map((column) => <col key={column.id} style={{ width: columnWidths[column.id] }} />)}</colgroup>
                <TableHead><TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>{columns.map((column) => <TableCell key={column.id} data-equipment-column={column.id} align={column.id === 'actions' ? 'center' : 'left'} sx={{ position: 'sticky', userSelect: 'none', ...(column.id === 'actions' ? { right: 0, zIndex: 3, width: columnWidths[column.id], minWidth: columnWidths[column.id], maxWidth: columnWidths[column.id], ...listTableStickyEdgeSx } : { pr: 2 }) }}>
                  <Box component="span" title={column.label} sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{column.label}</Box>
                  {column.id !== 'actions' && <Box aria-label={`调整${column.label}列宽`} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); resizeStart.current = { id: column.id, x: event.clientX, width: columnWidths[column.id], widths: { ...columnPreferences.widths, ...columnWidths } }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { const start = resizeStart.current; if (start?.id === column.id) setColumnPreferences((current) => ({ ...current, widths: { ...start.widths, [column.id]: Math.max(80, start.width + event.clientX - start.x) } })); }} onPointerUp={() => { resizeStart.current = null; }} onPointerCancel={() => { resizeStart.current = null; }} onLostPointerCapture={() => { resizeStart.current = null; }} sx={{ position: 'absolute', top: 0, right: 0, width: 8, height: '100%', cursor: 'col-resize', touchAction: 'none', '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 18, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }} />}
                </TableCell>)}</TableRow></TableHead>
                <TableBody>
                  {listQuery.isLoading ? <TableRow><TableStateCell colSpan={columns.length} align="center"><CircularProgress size={24} /></TableStateCell></TableRow>
                    : listQuery.isError ? <TableRow><TableStateCell colSpan={columns.length} align="center">加载失败 <Button onClick={() => listQuery.refetch()}>重试</Button></TableStateCell></TableRow>
                      : !data?.content.length ? <TableRow><TableStateCell colSpan={columns.length} align="center">暂无数据</TableStateCell></TableRow>
                        : data.content.map((row) => <TableRow data-record-id={row.id} key={row.id} hover sx={{ '& .MuiTableCell-root': { height: 40, py: 0, lineHeight: '20px', borderBottom: '1px solid #ebeef5' }, '&:hover .MuiTableCell-root': { bgcolor: '#f5f7fa' } }}>{columns.map((column) => <TableCell key={column.id} align={column.id === 'actions' ? 'center' : 'left'} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...(column.id === 'actions' ? { position: 'sticky', right: 0, width: columnWidths[column.id], minWidth: columnWidths[column.id], maxWidth: columnWidths[column.id], bgcolor: '#fff', zIndex: 1, ...listTableStickyEdgeSx } : {}) }}>
                          {column.id === 'actions' ? <>
                            <Tooltip title="编辑"><IconButton size="small" aria-label={`编辑 ${row.name}`} onClick={() => openEditor(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="删除"><IconButton size="small" color="error" aria-label={`删除 ${row.name}`} onClick={() => setDeleteTarget({ id: row.id, name: row.name, category: false })}><Delete fontSize="small" /></IconButton></Tooltip>
                          </> : column.id === 'status' && 'status' in row ? <StatusBadge label={row.status === 'ACTIVE' ? '启用' : row.status === 'INACTIVE' ? '停用' : row.status} color={row.status === 'ACTIVE' ? 'success' : 'default'} />
                            : column.id === 'createdAt' || column.id === 'updatedAt' ? formatEquipmentDateTime(row[column.id])
                              : (row as unknown as Record<string, string | null>)[column.id] || (column.id === 'categoryName' ? '未分类' : '-')}
                        </TableCell>)}</TableRow>)}
                </TableBody>
              </Table>
            </ListTableShell>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap gap={1} sx={{ minHeight: 56, px: 2, borderTop: '1px solid #e4e7ed', flexShrink: 0 }}>
              <Typography variant="body2" sx={{ color: '#909399' }}>共 {data?.totalElements ?? 0} 条数据</Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Pagination size="small" color="primary" count={Math.max(1, data?.totalPages ?? 1)} page={page} onChange={(_, value) => setPage(value)} />
                <TextField select size="small" sx={{ minWidth: 116, '& .MuiInputBase-root': { height: 32 } }} value={size} onChange={(event) => { setSize(Number(event.target.value)); setPage(1); }} inputProps={{ 'aria-label': '每页条数' }}>{[20, 50, 100, 200].map((value) => <MenuItem key={value} value={value}>{value} 条/页</MenuItem>)}</TextField>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
      <FormDialog open={open} onClose={() => { if (!saveMutation.isPending) setOpen(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '编辑' : '新增'}{recordLabel}</DialogTitle>
        <DialogContent dividers>
          <FormDialogSection title="基本信息">
          <FormDialogFieldGrid>
          <TextField size="small" required label={`${recordLabel}名称`} fullWidth value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <TextField size="small" required label={`${recordLabel}编码`} fullWidth value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          {isTypes ? <>
            <TextField size="small" select required label="设备分类" fullWidth value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} helperText={!form.categoryId && editingId ? '请选择设备分类后保存' : undefined}>
              {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
            </TextField>
            {categoriesQuery.isError && <Alert severity="error" action={<Button onClick={() => categoriesQuery.refetch()}>重试</Button>}>分类加载失败</Alert>}
          </> : <>
            <Autocomplete size="small" options={typeOptions} value={typeOptions.find((item) => item.id === form.equipmentTypeId) ?? null} isOptionEqualToValue={(option, value) => option.id === value.id} getOptionLabel={(option) => `${option.name} (${option.code})`} loading={typesQuery.isLoading} onChange={(_, value) => setForm({ ...form, equipmentTypeId: value?.id ?? '' })} noOptionsText="暂无设备类型，请先在设备类型页面新增" renderInput={(params) => <TextField {...params} required label="设备类型" />} />
            {typesQuery.isError && <Alert severity="error" action={<Button onClick={() => typesQuery.refetch()}>重试</Button>}>设备类型加载失败</Alert>}
            <TextField size="small" label="设备品牌" fullWidth value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} inputProps={{ maxLength: 128 }} />
            <TextField size="small" label="型号" fullWidth value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
            <TextField size="small" label="序列号" fullWidth value={form.serialNumber} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} />
            <TextField size="small" type="date" label="采购时间" fullWidth value={form.purchaseDate} onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })} InputLabelProps={{ shrink: true }} inputProps={{ max: today }} error={!!purchaseDateError} helperText={purchaseDateError} />
            <TextField size="small" select label="状态" fullWidth value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><MenuItem value="ACTIVE">启用</MenuItem><MenuItem value="INACTIVE">停用</MenuItem></TextField>
          </>}
          <TextField size="small" label="描述" fullWidth multiline minRows={3} value={form.description} inputProps={{ maxLength: 512 }} onChange={(event) => setForm({ ...form, description: event.target.value })} sx={{ gridColumn: { sm: '1 / -1' } }} />
          </FormDialogFieldGrid>
          </FormDialogSection>
        </DialogContent>
        <DialogActions><Button disabled={saveMutation.isPending} onClick={() => setOpen(false)}>取消</Button><Button variant="contained" disabled={!form.code.trim() || !form.name.trim() || !validParent || !!purchaseDateError || saveMutation.isPending} onClick={() => saveMutation.mutate()}>{saveMutation.isPending ? '保存中…' : '保存'}</Button></DialogActions>
      </FormDialog>
      <FormDialog open={categoryDialog !== null} onClose={() => { if (!saveCategoryMutation.isPending) setCategoryDialog(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>{categoryDialog?.id ? '编辑' : '新增'}设备分类</DialogTitle>
        <DialogContent dividers><FormDialogSection title="基本信息"><TextField size="small" autoFocus required fullWidth label="设备分类名称" value={categoryDialog?.name ?? ''} onChange={(event) => setCategoryDialog((current) => current ? { ...current, name: event.target.value } : null)} /></FormDialogSection></DialogContent>
        <DialogActions><Button disabled={saveCategoryMutation.isPending} onClick={() => setCategoryDialog(null)}>取消</Button><Button variant="contained" disabled={!categoryDialog?.name.trim() || saveCategoryMutation.isPending} onClick={() => saveCategoryMutation.mutate()}>保存</Button></DialogActions>
      </FormDialog>
      <ConfirmDialog deletionTarget={deleteTarget && { type: deleteTarget.category ? 'equipment_category' : isTypes ? 'equipment_type' : 'equipment', id: deleteTarget.id }} open={deleteTarget !== null} title="确认删除" message={`确定要删除${deleteTarget?.category ? '分类' : recordLabel}“${deleteTarget?.name ?? ''}”吗？`} destructive confirmText="删除" loading={deleteMutation.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate()} />
      <Snackbar open={snackbar !== null} autoHideDuration={4000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}><Alert severity={snackbar?.severity ?? 'success'} onClose={() => setSnackbar(null)}>{snackbar?.message}</Alert></Snackbar>
    </>
  );
}
