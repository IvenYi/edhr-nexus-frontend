import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Add, Close, EditOutlined, ExpandMore, Search, TuneRounded, ViewColumnRounded } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, Stack, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import FormDialogFieldGrid from '@/components/FormDialogFieldGrid';
import TableStateCell from '@/components/TableStateCell';
import { ListTableShell, resolveListColumnWidths } from '@/components/ListTableShell';
import ListColumnSettingsPopover, { getCurrentUserPreferenceStorageKey, loadListColumnSettings, reorderListColumns } from '@/components/ListColumnSettingsPopover';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import { listColumnResizeHandleSx, listTableBodyCellSx, listTableHeaderCellSx, listTableStickyActionSx } from '@/components/listTableStyles';
import { formListFieldSx, formListQueryGridSx, formListQueryPanelSx, FormListPagination } from '@/pages/form-management/formManagementListStyles';
import { formLookupCatalogKey, saveFormLookupItem, useFormLookupItems, type FormLookupItem } from '@/api/formLookupCatalog';
import { useAuthStore } from '@/stores/authStore';
import { getAuditLogs, type AuditLogItem } from '@/api/audit';
import type { PageResult } from '@/types/common';

const columns = [
  { id: 'name', label: '追溯项名称', width: 200 }, { id: 'description', label: '描述', width: 320 },
  { id: 'type', label: '查询方式', width: 180 }, { id: 'builtin', label: '来源', width: 100 },
  { id: 'createdBy', label: '创建人', width: 140 }, { id: 'createdAt', label: '创建时间', width: 180 },
  { id: 'updatedBy', label: '更新人', width: 140 }, { id: 'updatedAt', label: '更新时间', width: 180 },
];
const panel = { border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', minHeight: 0, overflow: 'hidden' };
const valueOf = (item: FormLookupItem, key: string) => key === 'type' ? '文本精确匹配' : key === 'builtin' ? item.builtin ? '内置' : '自定义' : key.endsWith('At') ? String(item[key as keyof FormLookupItem] ?? '—').replace('T', ' ').slice(0, 19) : String(item[key as keyof FormLookupItem] ?? '—');
const auditDisplay = (value: unknown) => {
  try {
    const item = typeof value === 'string' ? JSON.parse(value) : value;
    return item && typeof item === 'object' ? `${item.name ?? '—'} · ${item.description || '无说明'}` : '无';
  } catch { return '记录不可读取'; }
};
function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.5 }}>{label}</Typography><Typography variant="body2" sx={{ color: '#303133', overflowWrap: 'anywhere' }}>{children}</Typography></Box>;
}

export default function FormLookupItemsPage() {
  const canEdit = useAuthStore(state => state.hasPermission('system.edit'));
  const catalog = useFormLookupItems();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<FormLookupItem>();
  const [selected, setSelected] = useState<FormLookupItem>();
  const [detailTab, setDetailTab] = useState(0);
  const [auditPage, setAuditPage] = useState(0);
  const [auditSize, setAuditSize] = useState(20);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const storageKey = useMemo(() => getCurrentUserPreferenceStorageKey('form-lookup-items-columns-'), []);
  const [settings, setSettings] = useState(() => loadListColumnSettings(storageKey, columns, 1));
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(columns, 'form-lookup-items-widths-');
  const audit = useQuery({
    queryKey: ['form-lookup-item-audit', selected?.id, auditPage, auditSize],
    enabled: canEdit && Boolean(selected) && detailTab === 1,
    queryFn: async () => {
      const response = await getAuditLogs({ entityType: 'FORM_LOOKUP_ITEM', entityId: selected?.id, page: auditPage + 1, size: auditSize, sort: 'createdAt', order: 'desc' });
      return response.data.data as PageResult<AuditLogItem>;
    },
  });
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Optional preferences. */ } }, [settings, storageKey]);
  const save = useMutation({ mutationFn: () => saveFormLookupItem({ name, description }, editing), onSuccess: async () => {
    setOpened(false); setSelected(undefined);
    await Promise.all([queryClient.invalidateQueries({ queryKey: formLookupCatalogKey }), queryClient.invalidateQueries({ queryKey: ['form-projection-catalog'] })]);
  } });
  const edit = (item?: FormLookupItem) => { setEditing(item); setName(item?.name ?? ''); setDescription(item?.description ?? ''); save.reset(); setOpened(true); };
  const openDetail = (item: FormLookupItem) => { setSelected(item); setDetailTab(0); setAuditPage(0); };
  const rows = (catalog.data ?? []).filter(item => `${item.name} ${item.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const visible = settings.order.filter(id => !settings.hidden.includes(id)).map(id => columns.find(column => column.id === id)!).filter(Boolean);
  const layout = [...visible.map(column => ({ id: column.id, width: getColumnWidth(column) })), { id: 'actions', width: 64 }];
  const stateText = catalog.isPending ? '加载中…' : catalog.isError ? '目录读取失败，请重试' : rows.length ? '' : '暂无数据';
  if (!canEdit) return <Alert severity="error">当前账号没有追溯项管理权限。</Alert>;
  return <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Box component="form" onSubmit={event => { event.preventDefault(); setQuery(keyword); setPage(0); void catalog.refetch(); }} sx={formListQueryPanelSx}>
      <Box sx={formListQueryGridSx}>
        <TextField size="small" label="名称或描述" value={keyword} onChange={event => setKeyword(event.target.value)} sx={formListFieldSx} />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ gridColumn: { xs: '1 / -1', md: '3 / 4' } }}><Button variant="outlined" sx={{ height: 40, width: 80, flexShrink: 0 }} onClick={() => { setKeyword(''); setQuery(''); setPage(0); void catalog.refetch(); }}>重置</Button><Button type="submit" variant="contained" startIcon={<Search />} sx={{ height: 40, width: 80, px: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>查询</Button></Stack>
      </Box>
    </Box>
    {catalog.isError && <Alert severity="error" action={<Button onClick={() => void catalog.refetch()}>重试</Button>}>追溯项目录读取失败</Alert>}
    <Box sx={{ ...panel, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, height: 48, flexShrink: 0, borderBottom: '1px solid #e4e7ed' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Tooltip title="字段设置"><IconButton aria-label="字段设置" sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1 }} onClick={event => setAnchor(event.currentTarget)}><ViewColumnRounded fontSize="small" /><TuneRounded sx={{ position: 'absolute', fontSize: 12, right: 4, bottom: 4, bgcolor: '#fff' }} /></IconButton></Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>新增项自动供表单设计和追溯查询选择；旧记录保留原有配置。</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add />} onClick={() => edit()}>新增追溯项</Button>
      </Stack>
      <ListTableShell minTableWidth={layout.reduce((sum, item) => sum + item.width, 0)} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{tableWidth => {
        const widths = resolveListColumnWidths(layout, tableWidth, visible[0]?.id ?? '', ['actions']);
        return <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: tableWidth, height: stateText ? '100%' : 'auto' }}>
          <colgroup>{layout.map(column => <col key={column.id} style={{ width: widths[column.id] }} />)}</colgroup>
          <TableHead><TableRow>{visible.map(column => <TableCell key={column.id} sx={{ ...listTableHeaderCellSx, position: 'sticky' }}>{column.label}<Box aria-label={`调整${column.label}列宽`} sx={listColumnResizeHandleSx} {...getResizeHandleProps(column)} /></TableCell>)}<TableCell align="center" sx={{ ...listTableHeaderCellSx, ...listTableStickyActionSx(64, 'head') }}>操作</TableCell></TableRow></TableHead>
          <TableBody sx={{ height: stateText ? '100%' : 'auto' }}>{stateText ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={layout.length} sx={{ height: '100%' }}>{stateText}</TableStateCell></TableRow> : rows.slice(page * size, (page + 1) * size).map(item => <TableRow key={item.id} hover onClick={() => openDetail(item)} tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) { event.preventDefault(); openDetail(item); } }} sx={{ cursor: 'pointer' }}>
            {visible.map(column => <TableCell key={column.id} title={valueOf(item, column.id)} sx={{ ...listTableBodyCellSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{valueOf(item, column.id)}</TableCell>)}
            <TableCell align="center" sx={{ ...listTableBodyCellSx, ...listTableStickyActionSx(64, 'body') }}><Tooltip title="编辑显示信息"><IconButton size="small" aria-label={`编辑${item.name}`} onClick={event => { event.stopPropagation(); edit(item); }}><EditOutlined fontSize="small" /></IconButton></Tooltip></TableCell>
          </TableRow>)}</TableBody>
        </Table>;
      }}</ListTableShell>
      <FormListPagination totalElements={rows.length} totalPages={Math.ceil(rows.length / size)} page={page} pageSize={size} onPageChange={setPage} onPageSizeChange={next => { setSize(next); setPage(0); }} />
    </Box>
    <ListColumnSettingsPopover anchorEl={anchor} columns={columns} settings={settings} onClose={() => setAnchor(null)} onToggle={id => setSettings(current => ({ ...current, hidden: current.hidden.includes(id) ? current.hidden.filter(item => item !== id) : [...current.hidden, id] }))} onReorder={(from, to) => setSettings(current => reorderListColumns(columns, current, from, to))} />
    <FormDialog open={opened} onClose={() => { if (!save.isPending) setOpened(false); }} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: (event: FormEvent) => { event.preventDefault(); if (!save.isPending) save.mutate(); } }}>
        <DialogTitle>{editing ? '编辑追溯项显示信息' : '新增追溯项'}</DialogTitle>
        <DialogContent dividers>
          <FormDialogSection title="基本信息"><FormDialogFieldGrid hasTrailingFullRow>
            <TextField required autoFocus fullWidth size="small" label="追溯项名称" value={name} inputProps={{ maxLength: 80 }} onChange={event => setName(event.target.value)} placeholder="例如：灭菌锅次" />
            <TextField fullWidth size="small" label="描述" value={description} multiline minRows={2} inputProps={{ maxLength: 512 }} onChange={event => setDescription(event.target.value)} placeholder="说明业务含义与填写示例" sx={{ gridColumn: { sm: '1 / -1' } }} />
          </FormDialogFieldGrid></FormDialogSection>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>文本精确匹配，可关联文本字段或单选列。业务含义不同请新建追溯项，编辑显示信息不会改变已有绑定。</Typography>
          {save.isError && <Alert severity="error" sx={{ mt: 1.5 }}>{save.error instanceof Error ? save.error.message : '保存失败，请重试'}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpened(false)} disabled={save.isPending}>取消</Button><Button type="submit" variant="contained" disabled={save.isPending || !name.trim()}>保存</Button></DialogActions>
    </FormDialog>
    <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(undefined)} sx={{ zIndex: theme => theme.zIndex.drawer + 3 }} PaperProps={{ sx: { width: { xs: '100vw', sm: 560 }, height: '100vh' } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}><Typography variant="subtitle1">{selected?.name}</Typography><Tooltip title="关闭" placement="left"><IconButton aria-label="关闭详情" onClick={() => setSelected(undefined)}><Close /></IconButton></Tooltip></Stack>
      <Tabs value={detailTab} onChange={(_, value: number) => setDetailTab(value)} aria-label="追溯项详情切换" sx={{ px: 2, borderBottom: '1px solid #e4e7ed' }}><Tab label="数据信息" /><Tab label="数据审计" /></Tabs>
      {detailTab === 0 ? <Stack spacing={2} sx={{ p: 2, bgcolor: '#f7f9fc', flex: 1, minHeight: 0, overflow: 'auto', '& > *': { flexShrink: 0 }, '& > .MuiBox-root': { bgcolor: '#fff' } }}>{selected && <>
        <FormDialogSection title="基本信息"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>{columns.slice(0, 4).map(column => <Box key={column.id} sx={column.id === 'description' ? { gridColumn: '1 / -1' } : undefined}><DetailField label={column.label}>{valueOf(selected, column.id)}</DetailField></Box>)}</Box></FormDialogSection>
        <FormDialogSection title="系统信息"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>{columns.slice(4).map(column => <DetailField key={column.id} label={column.label}>{valueOf(selected, column.id)}</DetailField>)}</Box></FormDialogSection>
      </>}<Typography variant="caption" color="text.secondary">此项只提供查找含义，不建立实体关系或统计模型。</Typography></Stack> : <>
        <Stack spacing={2} sx={{ p: 2, bgcolor: '#f7f9fc', flex: 1, minHeight: 0, overflow: 'auto', '& > *': { flexShrink: 0 }, '& > .MuiBox-root': { bgcolor: '#fff' } }}><FormDialogSection title="审计记录"><Stack spacing={1}>
          {audit.isPending ? <Typography>加载中…</Typography> : audit.isError ? <Alert severity="error" action={<Button onClick={() => void audit.refetch()}>重试</Button>}>审计读取失败</Alert> : !audit.data?.content.length ? <Typography color="text.secondary">暂无审计记录</Typography> : audit.data.content.map(record => <Accordion key={record.id} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}>
            <AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ minHeight: 44, px: 1.5, '&.Mui-expanded': { minHeight: 44 }, '& .MuiAccordionSummary-content': { m: 0, minWidth: 0 }, '& .MuiAccordionSummary-content.Mui-expanded': { m: 0 } }}><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.35fr', gap: 1, width: '100%', minWidth: 0 }}>{[record.operatorDisplayName || record.operatorAccount || '—', record.functionName || record.actionLabel, (record.operationTime || record.createdAt)?.replace('T', ' ').slice(0, 19)].map((text, index) => <Typography key={index} variant="body2" noWrap title={text}>{text}</Typography>)}</Box></AccordionSummary>
            <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>{[['变更前', record.contentBefore], ['变更后', record.contentAfter]].map(([title, value]) => <Box key={String(title)} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#f8fafc', p: 1 }}><Typography variant="caption" sx={{ color: '#606266', fontWeight: 600 }}>{String(title)}</Typography><Typography variant="body2" sx={{ mt: 0.75, overflowWrap: 'anywhere' }}>{auditDisplay(value)}</Typography></Box>)}</Box></AccordionDetails>
          </Accordion>)}
        </Stack></FormDialogSection>
        </Stack>
        <FormListPagination totalElements={audit.data?.totalElements ?? 0} totalPages={audit.data?.totalPages ?? 0} page={auditPage} pageSize={auditSize} onPageChange={setAuditPage} onPageSizeChange={next => { setAuditSize(next); setAuditPage(0); }} />
      </>}
    </Drawer>
  </Box>;
}
