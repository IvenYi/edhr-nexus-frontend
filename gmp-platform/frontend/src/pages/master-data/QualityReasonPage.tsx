import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem, Pagination, Snackbar, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Delete, EditOutlined, ExpandMore, RestartAlt, Search, TuneRounded, ViewColumnRounded } from '@mui/icons-material';
import { deleteQualityReason, getQualityReasons, saveQualityReason, type QualityReasonPayload, type QualityReasonRecord, type QualityReasonType } from '@/api/qualityReasons';
import { getAuditLogs } from '@/api/audit';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import FormDialogFieldGrid from '@/components/FormDialogFieldGrid';
import DetailDrawer from '@/components/DetailDrawer';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import { ListTableShell } from '@/components/ListTableShell';
import { listColumnResizeHandleSx, listTableBodyCellSx, listTableHeaderCellSx, listTablePrimaryTextSx, listTableStickyActionSx } from '@/components/listTableStyles';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import ListColumnSettingsPopover, { getCurrentUserPreferenceStorageKey, loadListColumnSettings, reorderListColumns } from '@/components/ListColumnSettingsPopover';
import { useAuthStore } from '@/stores/authStore';
import { FormListPagination } from '@/pages/form-management/formManagementListStyles';

const COLUMNS = [
  { id: 'name', label: '原因名称', width: 220, minWidth: 160 },
  { id: 'code', label: '原因编码', width: 180, minWidth: 128 },
  { id: 'description', label: '描述', width: 260, minWidth: 160 },
  { id: 'sortOrder', label: '排序', width: 100, minWidth: 80 },
  { id: 'status', label: '状态', width: 100, minWidth: 96 },
  { id: 'actions', label: '操作', width: 96, minWidth: 96 },
] as const;
const EMPTY_FORM: QualityReasonPayload = { code: '', name: '', description: '', status: 'ACTIVE', sortOrder: 0 };
const EMPTY_FILTERS = { keyword: '', status: 'ALL' };
const statusLabel = (value: unknown) => value === 'ACTIVE' ? '启用' : value === 'INACTIVE' ? '停用' : String(value ?? '-');
const dateLabel = (value?: string) => value ? value.replace('T', ' ').slice(0, 19) : '-';
const errorLabel = (error: unknown) => error instanceof Error ? error.message : '操作失败，请稍后重试';
const AUDIT_LABELS: Record<string, string> = { code: '原因编码', name: '原因名称', description: '描述', status: '状态', sortOrder: '排序' };

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ display: 'block', color: '#909399', mb: 0.5 }}>{label}</Typography><Box sx={{ fontSize: 14, color: '#303133', overflowWrap: 'anywhere' }}>{children ?? '-'}</Box></Box>;
}
function AuditSnapshot({ title, value }: { title: string; value: unknown }) {
  let content: Record<string, unknown> = {};
  try { content = typeof value === 'string' ? JSON.parse(value) : value && typeof value === 'object' ? value as Record<string, unknown> : {}; } catch { /* Legacy unavailable snapshot. */ }
  return <Box sx={{ p: 1, bgcolor: '#f8fafc', border: '1px solid #e4e7ed', borderRadius: 1 }}><Typography variant="caption" fontWeight={600}>{title}</Typography><Stack spacing={0.75} sx={{ mt: 1 }}>
    {Object.keys(content).length === 0 ? <Typography variant="caption" color="text.secondary">无</Typography> : Object.entries(AUDIT_LABELS).filter(([key]) => key in content).map(([key, label]) => <Box key={key} sx={{ display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr)', gap: 1 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>{key === 'status' ? statusLabel(content[key]) : content[key] == null || content[key] === '' ? '-' : String(content[key])}</Typography></Box>)}
  </Stack></Box>;
}

export default function QualityReasonPage({ type }: { type: QualityReasonType }) {
  const title = type === 'DEFECT' ? '不良原因' : '报废原因';
  const permission = `master-data.${type === 'DEFECT' ? 'defect' : 'scrap'}-reasons`;
  const allowed = useAuthStore(state => state.hasPermission(permission));
  const client = useQueryClient();
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(COLUMNS, `quality-reasons-${type}-columns:v1:`);
  const [filters, setFilters] = useState(EMPTY_FILTERS), [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1), [size, setSize] = useState(20);
  const [open, setOpen] = useState(false), [editing, setEditing] = useState<QualityReasonRecord | null>(null);
  const [form, setForm] = useState<QualityReasonPayload>(EMPTY_FORM);
  const [selected, setSelected] = useState<QualityReasonRecord | null>(null), [tab, setTab] = useState(0);
  const [auditPage, setAuditPage] = useState(0), [auditSize, setAuditSize] = useState(20);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const contentColumns = useMemo(() => COLUMNS.filter(column => column.id !== 'actions'), []);
  const storageKey = useMemo(() => getCurrentUserPreferenceStorageKey(`quality-reasons-${type}-columns-`), [type]);
  const [settings, setSettings] = useState(() => loadListColumnSettings(storageKey, contentColumns, 1));
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Optional preferences. */ } }, [settings, storageKey]);
  const visibleColumns = settings.order.filter(id => !settings.hidden.includes(id)).map(id => contentColumns.find(col => col.id === id)!).filter(Boolean);
  const tableColumns = [...visibleColumns, COLUMNS[COLUMNS.length - 1]];
  const [deleting, setDeleting] = useState<QualityReasonRecord | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const list = useQuery({ placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === type ? previous : undefined, queryKey: ['quality-reasons', type, applied, page, size], queryFn: () => getQualityReasons(type, { keyword: applied.keyword.trim() || undefined, status: applied.status === 'ALL' ? undefined : applied.status, page, size }), enabled: allowed });
  const rows = list.data?.content ?? [];
  const totalPages = Math.max(1, list.data?.totalPages ?? page);
  useEffect(() => { if (!list.isSuccess || list.isPlaceholderData || list.isFetching) return; if (page > totalPages) setPage(totalPages); }, [page, totalPages, list.isSuccess, list.isPlaceholderData, list.isFetching]);
  const audit = useQuery({ placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === type && previousQuery?.queryKey[2] === selected?.id ? previous : undefined, queryKey: ['quality-reason-audit', type, selected?.id, auditPage, auditSize], queryFn: async () => (await getAuditLogs({ entityType: `${type}_REASON`, entityId: selected?.id, page: auditPage + 1, size: auditSize })).data.data, enabled: allowed && Boolean(selected) && tab === 1 });
  const save = useMutation({ mutationFn: () => saveQualityReason(type, editing?.id, form), onSuccess: (saved) => { client.invalidateQueries({ queryKey: ['quality-reasons', type] }); client.invalidateQueries({ queryKey: ['quality-reason-audit', type, saved.id] }); setSelected(current => current?.id === saved.id ? saved : current); setOpen(false); setSnackbar({ message: `${title}${editing ? '编辑' : '新增'}成功`, severity: 'success' }); }, onError: error => setSnackbar({ message: errorLabel(error), severity: 'error' }) });
  const remove = useMutation({ mutationFn: () => deleteQualityReason(type, deleting!.id), onSuccess: () => { client.invalidateQueries({ queryKey: ['quality-reasons', type] }); if (selected?.id === deleting?.id) setSelected(null); setDeleting(null); setSnackbar({ message: '删除成功', severity: 'success' }); }, onError: error => setSnackbar({ message: errorLabel(error), severity: 'error' }) });
  const edit = (row?: QualityReasonRecord) => { setEditing(row ?? null); setForm(row ? { code: row.code, name: row.name, description: row.description || '', status: row.status, sortOrder: row.sortOrder } : EMPTY_FORM); setOpen(true); };
  const search = () => { setApplied(filters); setPage(1); };
  if (!allowed) return <Alert severity="warning">无权访问{title}，请联系管理员授权。</Alert>;
  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Box component="section" sx={{ p: 2, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, flexShrink: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 1fr) minmax(160px, 220px) auto auto' }, gap: 1.5, alignItems: 'center' }}>
        <TextField size="small" label="原因名称/编码" placeholder="请输入" value={filters.keyword} onChange={e => setFilters({ ...filters, keyword: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') search(); }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        <TextField select size="small" label="状态" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><MenuItem value="ALL">全部</MenuItem><MenuItem value="ACTIVE">启用</MenuItem><MenuItem value="INACTIVE">停用</MenuItem></TextField>
        <Button variant="outlined" startIcon={<RestartAlt />} sx={{ height: 40 }} onClick={() => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1); }}>重置</Button><Button variant="contained" startIcon={<Search />} sx={{ height: 40 }} onClick={search}>查询</Button>
      </Box>
    </Box>
    <Box component="section" sx={{ flex: 1, minHeight: { xs: 400, lg: 0 }, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e4e7ed', flexShrink: 0 }}><Tooltip title="字段设置"><IconButton aria-label="字段设置" sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1 }} onClick={event => setAnchor(event.currentTarget)}><ViewColumnRounded fontSize="small" /><TuneRounded sx={{ position: 'absolute', fontSize: 12, right: 4, bottom: 4, bgcolor: '#fff' }} /></IconButton></Tooltip><Button variant="contained" startIcon={<Add />} onClick={() => edit()}>新增{title}</Button></Box>
      <ListTableShell sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}><Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: tableColumns.reduce((sum, col) => sum + getColumnWidth(col), 0), height: rows.length ? 'auto' : '100%' }}>
        <colgroup>{tableColumns.map(col => <col key={col.id} style={{ width: getColumnWidth(col) }} />)}</colgroup>
        <TableHead><TableRow>{tableColumns.map(col => <TableCell key={col.id} align={col.id === 'actions' ? 'center' : undefined} sx={{ ...listTableHeaderCellSx, width: getColumnWidth(col), ...(col.id === 'actions' ? listTableStickyActionSx(96, 'head') : {}) }}>{col.label}{col.id !== 'actions' && <Box aria-label={`调整${col.label}列宽`} sx={listColumnResizeHandleSx} {...getResizeHandleProps(col)} />}</TableCell>)}</TableRow></TableHead>
        <TableBody>{list.isLoading ? <TableRow><TableStateCell colSpan={tableColumns.length} align="center"><CircularProgress size={24} /></TableStateCell></TableRow> : list.isError ? <TableRow><TableStateCell colSpan={tableColumns.length} align="center"><Stack alignItems="center" spacing={1}><Typography color="text.secondary">加载失败，请重试</Typography><Button size="small" onClick={() => list.refetch()}>重新加载</Button></Stack></TableStateCell></TableRow> : rows.length === 0 ? <TableRow><TableStateCell colSpan={tableColumns.length} align="center">暂无数据</TableStateCell></TableRow> : rows.map(row => <TableRow key={row.id} hover tabIndex={0} onClick={() => { setSelected(row); setTab(0); setAuditPage(0); }} onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setSelected(row); setTab(0); setAuditPage(0); } }} sx={{ cursor: 'pointer', '& .MuiTableCell-root': listTableBodyCellSx }}>
          {visibleColumns.map(col => <TableCell key={col.id} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.id === 'status' ? <StatusBadge label={statusLabel(row.status)} color={row.status === 'ACTIVE' ? 'success' : 'default'} /> : col.id === 'name' ? <Typography sx={listTablePrimaryTextSx}>{row.name}</Typography> : <Tooltip title={String(row[col.id] ?? '')}><span>{row[col.id] ?? '-'}</span></Tooltip>}</TableCell>)}<TableCell align="center" sx={listTableStickyActionSx(96, 'body')} onClick={e => e.stopPropagation()}><Tooltip title="编辑"><IconButton size="small" aria-label={`编辑${title} ${row.name}`} onClick={() => edit(row)}><EditOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="删除"><IconButton size="small" color="error" aria-label={`删除${title} ${row.name}`} onClick={() => setDeleting(row)}><Delete fontSize="small" /></IconButton></Tooltip></TableCell>
        </TableRow>)}</TableBody>
      </Table></ListTableShell>
      <Box sx={{ minHeight: 56, px: 2, borderTop: '1px solid #e4e7ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0 }}><Typography variant="body2" color="text.secondary">共 {list.data?.totalElements ?? 0} 条数据</Typography><Stack direction="row" alignItems="center" spacing={1.5}><Pagination size="small" color="primary" count={totalPages} page={page} onChange={(_, value) => setPage(value)} /><TextField select size="small" value={size} onChange={e => { setSize(Number(e.target.value)); setPage(1); }} inputProps={{ 'aria-label': '每页条数' }} sx={{ minWidth: 116, '& .MuiInputBase-root': { height: 32 } }}>{[20, 50, 100, 200].map(value => <MenuItem key={value} value={value}>{value} 条/页</MenuItem>)}</TextField></Stack></Box>
    </Box>
    <ListColumnSettingsPopover anchorEl={anchor} columns={contentColumns} settings={settings} onClose={() => setAnchor(null)} onToggle={id => setSettings(current => ({ ...current, hidden: current.hidden.includes(id) ? current.hidden.filter(item => item !== id) : [...current.hidden, id] }))} onReorder={(from, to) => setSettings(current => reorderListColumns(contentColumns, current, from, to))} />
    <FormDialog open={open} onClose={save.isPending ? undefined : () => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{editing ? '编辑' : '新增'}{title}</DialogTitle><DialogContent dividers><FormDialogSection title="基本信息"><FormDialogFieldGrid hasTrailingFullRow>
      <TextField required size="small" label="原因编码" value={form.code} inputProps={{ maxLength: 64 }} onChange={e => setForm({ ...form, code: e.target.value })} /><TextField required size="small" label="原因名称" value={form.name} inputProps={{ maxLength: 128 }} onChange={e => setForm({ ...form, name: e.target.value })} /><TextField select size="small" label="状态" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as QualityReasonPayload['status'] })}><MenuItem value="ACTIVE">启用</MenuItem><MenuItem value="INACTIVE">停用</MenuItem></TextField><TextField size="small" label="排序" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} /><TextField size="small" label="描述" multiline rows={3} value={form.description} inputProps={{ maxLength: 512 }} onChange={e => setForm({ ...form, description: e.target.value })} sx={{ gridColumn: '1 / -1' }} />
    </FormDialogFieldGrid></FormDialogSection></DialogContent><DialogActions><Button disabled={save.isPending} onClick={() => setOpen(false)}>取消</Button><Button variant="contained" disabled={save.isPending || !form.code.trim() || !form.name.trim() || !Number.isInteger(form.sortOrder)} onClick={() => save.mutate()}>{save.isPending ? '保存中...' : '保存'}</Button></DialogActions></FormDialog>
    <ConfirmDialog open={Boolean(deleting)} title={`删除${title}`} message={`确定删除“${deleting?.name || ''}”吗？已被使用的原因不能删除，可改为停用。`} destructive confirmText="删除" loading={remove.isPending} onCancel={() => setDeleting(null)} onConfirm={() => remove.mutate()} />
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} label={`${title}详情`} tab={tab} onTabChange={setTab} footer={tab === 1 && <FormListPagination dataReady={audit.isSuccess && !audit.isFetching && !audit.isPlaceholderData} totalElements={audit.data?.totalElements ?? 0} totalPages={audit.data?.totalPages ?? 0} page={auditPage} pageSize={auditSize} onPageChange={setAuditPage} onPageSizeChange={value => { setAuditSize(value); setAuditPage(0); }} />}>{tab === 0 ? <><FormDialogSection title="基本信息"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: 1.5 }}><DetailField label="原因名称">{selected?.name}</DetailField><DetailField label="原因编码">{selected?.code}</DetailField><DetailField label="状态"><StatusBadge label={statusLabel(selected?.status)} color={selected?.status === 'ACTIVE' ? 'success' : 'default'} /></DetailField><DetailField label="排序">{selected?.sortOrder}</DetailField><Box sx={{ gridColumn: '1 / -1' }}><DetailField label="描述">{selected?.description || '-'}</DetailField></Box></Box></FormDialogSection><FormDialogSection title="时间信息"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}><DetailField label="创建时间">{dateLabel(selected?.createdAt)}</DetailField><DetailField label="更新时间">{dateLabel(selected?.updatedAt)}</DetailField></Box></FormDialogSection></> : audit.isLoading ? <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box> : audit.isError ? <Alert severity="error" action={<Button onClick={() => audit.refetch()}>重试</Button>}>审计记录读取失败</Alert> : (audit.data?.content ?? []).length === 0 ? <Typography color="text.secondary">暂无审计记录</Typography> : (audit.data?.content ?? []).map((event: import('@/api/audit').AuditLogItem) => <Accordion key={event.id} disableGutters sx={{ border: '1px solid #e4e7ed', '&:before': { display: 'none' }, boxShadow: 'none' }}><AccordionSummary expandIcon={<ExpandMore />}><Box><Typography variant="body2" fontWeight={600}>{event.functionName || event.actionLabel || '修改'}</Typography><Typography variant="caption" color="text.secondary">{event.operatorDisplayName || event.operatorAccount || '-'} · {dateLabel(event.createdAt)}</Typography></Box></AccordionSummary><AccordionDetails><Stack spacing={1}><AuditSnapshot title="变更前" value={event.contentBefore} /><AuditSnapshot title="变更后" value={event.contentAfter} /></Stack></AccordionDetails></Accordion>)}</DetailDrawer>
    <Snackbar open={Boolean(snackbar)} autoHideDuration={4000} onClose={() => setSnackbar(null)}><Alert severity={snackbar?.severity ?? 'success'} onClose={() => setSnackbar(null)}>{snackbar?.message}</Alert></Snackbar>
  </Box>;
}
