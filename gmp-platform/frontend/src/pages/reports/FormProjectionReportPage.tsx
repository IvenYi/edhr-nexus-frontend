import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Collapse, DialogContent, DialogTitle, Drawer, IconButton, MenuItem, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { Close, ExpandLess, ExpandMore, InfoOutlined, Search, TuneRounded, ViewColumnRounded } from '@mui/icons-material';
import client from '@/api/client';
import AppDialog from '@/components/AppDialog';
import FormDialogSection from '@/components/FormDialogSection';
import TableStateCell from '@/components/TableStateCell';
import { ListTableShell, resolveListColumnWidths } from '@/components/ListTableShell';
import ListColumnSettingsPopover, { getCurrentUserPreferenceStorageKey, loadListColumnSettings, reorderListColumns } from '@/components/ListColumnSettingsPopover';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import { listColumnResizeHandleSx, listTableBodyCellSx, listTableHeaderCellSx } from '@/components/listTableStyles';
import { formListFieldSx, formListQueryGridSx, formListQueryPanelSx, FormListPagination } from '@/pages/form-management/formManagementListStyles';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import type { ModelField } from '@/pages/master-data/template-designer-react/types/model';
import { useAuthStore } from '@/stores/authStore';
import { useFormLookupItems } from '@/api/formLookupCatalog';

const base = '/reports/form-projections';
const models = [['formTrace', '表单追溯'], ['production', '报工记录'], ['scrap', '报废记录'], ['consumption', '消耗记录']];
const legacyAttributes = [['materialLotText', '物料批号'], ['serialNumberText', '序列号'], ['equipmentText', '设备编号'], ['teamText', '责任班组'], ['documentNumberText', '单据号'], ['category', '分类'], ['reason', '原因'], ['unit', '单位']];
const legacyAttributeNames: Record<string, string> = Object.fromEntries([...legacyAttributes, ['material', '物料'], ['quantity', '数量'], ['goodQuantity', '良品数量'], ['ngQuantity', '不良品数量']]);
interface Hit { rowKey: string; tableId?: string; bindingId: string; attributes: Record<string, unknown>; sources: Record<string, string> }
interface RecordRow extends Hit { id: string; batchId: string; instanceNo: string; objectNo: string; operationName: string; revision: number; hits?: Hit[]; lookupItems?: Record<string, { name: string }>; createdBy?: string; createdAt?: string; updatedBy?: string; updatedAt?: string }
interface Result { total: number; records: RecordRow[]; totals: Record<string, unknown>[]; totalsTruncated: boolean }
interface Source { form: { name: string; version: string; versionId: string; model: string; canvas: string; fields: ModelField[] }; values: Record<string, unknown> }
interface Column { id: string; label: string; width: number }
const detailColumns: Column[] = [['instanceNo', '来源表单'], ['objectNo', '生产对象'], ['operationName', '工序'], ['location', '命中位置'], ['values', '取值'], ['createdBy', '创建人'], ['createdAt', '创建时间'], ['updatedBy', '更新人'], ['updatedAt', '更新时间']].map(([id, label]) => ({ id, label, width: id === 'values' ? 360 : 180 }));
const totalColumns: Column[] = [['objectNo', '生产对象'], ['operationName', '工序'], ['materialName', '物料'], ['materialLot', '物料批号'], ['unit', '单位'], ['quantity', '数量'], ['goodQuantity', '良品'], ['ngQuantity', '不良'], ['recordCount', '明细数']].map(([id, label]) => ({ id, label, width: ['objectNo', 'operationName', 'materialName'].includes(id) ? 180 : 120 }));
const display = (value: unknown): string => value == null ? '—' : typeof value === 'object' ? String((value as { name?: string }).name ?? '') : String(value);
const panel = { border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', minHeight: 0, overflow: 'hidden' };
const hitsOf = (row: RecordRow): Hit[] => row.hits?.length ? row.hits : [row];
const sourceName = (key: string, definitions?: RecordRow['lookupItems']) => definitions?.[key]?.name ?? legacyAttributeNames[key] ?? '追溯项';
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <FormDialogSection title={title}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>{children}</Box></FormDialogSection>;
}
function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.5 }}>{label}</Typography><Typography variant="body2" sx={{ color: '#303133', overflowWrap: 'anywhere' }}>{children}</Typography></Box>;
}

function ProjectionTable({ columns, rows, preference, loading, failed, onSource, footer, description }: { columns: Column[]; rows: Record<string, unknown>[]; preference: string; loading: boolean; failed: boolean; onSource?: (index: number) => void; footer?: ReactNode; description?: string }) {
  const storageKey = useMemo(() => getCurrentUserPreferenceStorageKey(`projection-${preference}-columns-`), [preference]);
  const [settings, setSettings] = useState(() => loadListColumnSettings(storageKey, columns, 1));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(columns, `projection-${preference}-widths-`);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Optional preferences. */ } }, [settings, storageKey]);
  const visible = settings.order.filter(id => !settings.hidden.includes(id)).map(id => columns.find(column => column.id === id)!).filter(Boolean);
  const layout = visible.map(column => ({ id: column.id, width: getColumnWidth(column) }));
  const stateText = loading ? '加载中…' : failed ? '数据读取失败，请重新查询' : !rows.length ? '暂无数据' : '';
  return <Box sx={{ ...panel, display: 'flex', flexDirection: 'column', flex: 1 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 48, flexShrink: 0, px: 2, borderBottom: '1px solid #e4e7ed' }}>
      <Tooltip title="字段设置"><IconButton aria-label="字段设置" onClick={event => setAnchor(event.currentTarget)} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1 }}><ViewColumnRounded fontSize="small" /><TuneRounded sx={{ position: 'absolute', fontSize: 12, right: 4, bottom: 4, bgcolor: '#fff' }} /></IconButton></Tooltip>
      {description && <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0, mx: 1.5, display: { xs: 'none', md: 'block' } }} noWrap title={description}>{description}</Typography>}
      <Tooltip title={description || (onSource ? '只显示最终完成并成功生成的记录；点击查看来源快照。' : '按生产对象、工序、用途、物料批号及单位分组合计，不代表批次最终产出。')}><IconButton aria-label="统计口径说明"><InfoOutlined fontSize="small" /></IconButton></Tooltip>
    </Stack>
    <ListTableShell minTableWidth={layout.reduce((sum, column) => sum + column.width, 0)} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      {tableWidth => {
        const widths = resolveListColumnWidths(layout, tableWidth, visible[0]?.id ?? '');
        return <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: tableWidth, height: stateText ? '100%' : 'auto' }}>
          <colgroup>{layout.map(column => <col key={column.id} style={{ width: widths[column.id] }} />)}</colgroup>
          <TableHead><TableRow>{visible.map(column => <TableCell key={column.id} sx={{ ...listTableHeaderCellSx, width: widths[column.id], position: 'sticky' }}>{column.label}<Box aria-label={`调整${column.label}列宽`} sx={listColumnResizeHandleSx} {...getResizeHandleProps(column)} /></TableCell>)}</TableRow></TableHead>
          <TableBody sx={{ height: stateText ? '100%' : 'auto' }}>{stateText ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={layout.length} sx={{ height: '100%', color: '#909399' }}>{stateText}</TableStateCell></TableRow> : rows.map((row, index) => <TableRow key={String(row.id ?? index)} hover onClick={onSource ? () => onSource(index) : undefined} tabIndex={onSource ? 0 : undefined} onKeyDown={event => { if (onSource && event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) { event.preventDefault(); onSource(index); } }} sx={{ cursor: onSource ? 'pointer' : undefined }}>{visible.map(column => <TableCell key={column.id} title={display(row[column.id])} sx={{ ...listTableBodyCellSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{display(row[column.id])}</TableCell>)}</TableRow>)}</TableBody>
        </Table>;
      }}
    </ListTableShell>
    {footer}
    <ListColumnSettingsPopover anchorEl={anchor} columns={columns} settings={settings} onClose={() => setAnchor(null)} onToggle={id => setSettings(current => ({ ...current, hidden: current.hidden.includes(id) ? current.hidden.filter(item => item !== id) : [...current.hidden, id] }))} onReorder={(from, to) => setSettings(current => reorderListColumns(columns, current, from, to))} />
  </Box>;
}

export default function FormProjectionReportPage() {
  const lookupItems = useFormLookupItems();
  const canRetry = useAuthStore(state => state.hasPermission('system.edit'));
  const canDhr = useAuthStore(state => state.hasPermission('dhr.instances.view'));
  const [modelId, setModelId] = useState('formTrace');
  const attributes = modelId === 'formTrace' ? [
    ...legacyAttributes.map(([id, name]) => [id, lookupItems.data?.find(item => item.id === id)?.name ?? name]),
    ...(lookupItems.data ?? []).filter(item => !legacyAttributes.some(([id]) => id === item.id)).map(item => [item.id, item.name]),
  ] : legacyAttributes;
  const [filter, setFilter] = useState('materialLotText');
  const [value, setValue] = useState('');
  const [secondFilter, setSecondFilter] = useState('teamText');
  const [secondValue, setSecondValue] = useState('');
  const [objectNo, setObjectNo] = useState('');
  const [operationName, setOperationName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [queryRevision, setQueryRevision] = useState(0);
  const [view, setView] = useState(0);
  const [request, setRequest] = useState({ modelId: 'formTrace', filters: {} as Record<string, string>, objectNo: '', operationName: '', page: 0, size: 20 });
  const [selected, setSelected] = useState<RecordRow | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState('');
  const [retryReason, setRetryReason] = useState('');
  const [dhrs, setDhrs] = useState<{ id: string; dhrNo: string; status: string }[] | null>(null);
  const data = useQuery({ queryKey: ['form-projection-report', request, queryRevision], queryFn: async () => (await client.post(`${base}/query`, { ...request, objectNo: request.objectNo || undefined, operationName: request.operationName || undefined })).data.data as Result });
  const status = useQuery({ queryKey: ['form-projection-status'], queryFn: async () => (await client.get(`${base}/status`)).data.data as { id: string; status: string; instanceNo: string; errorMessage?: string }[], refetchInterval: 5000 });
  const source = useQuery({ queryKey: ['form-projection-source', selected?.batchId], queryFn: async () => (await client.get(`${base}/${selected!.batchId}/source`)).data.data as Source, enabled: Boolean(selected) });
  const document = useMemo(() => {
    if (!source.data) return null;
    const form = source.data.form;
    const result = parseReactTemplateDesignerDocument({ id: form.versionId, name: form.name }, { id: form.versionId, version: form.version, modelDesignJson: form.model, canvasDesignJson: form.canvas });
    result.model.fields = form.fields;
    return result;
  }, [source.data]);
  const sourceAttributeName = (key: string) => sourceName(key, selected?.lookupItems);
  const search = () => {
    const filters: Record<string, string> = {};
    if (value.trim()) filters[filter] = value.trim();
    if (secondValue.trim()) filters[secondFilter] = secondValue.trim();
    setError(''); setRequest({ ...request, modelId, filters, objectNo, operationName, page: 0 });
    setQueryRevision(current => current + 1);
    void status.refetch();
  };
  const reset = (model = modelId) => {
    setValue(''); setSecondValue(''); setObjectNo(''); setOperationName(''); setError('');
    if (model !== 'formTrace') {
      if (!legacyAttributes.some(([id]) => id === filter)) setFilter('materialLotText');
      if (!legacyAttributes.some(([id]) => id === secondFilter)) setSecondFilter('teamText');
    }
    setRequest({ ...request, modelId: model, filters: {}, objectNo: '', operationName: '', page: 0 });
    setQueryRevision(current => current + 1);
  };
  const actions = <Stack direction="row" spacing={1} justifyContent="flex-end"><Button variant="outlined" sx={{ width: 80, height: 40, flexShrink: 0 }} onClick={() => reset()}>重置</Button><Button variant="contained" type="submit" startIcon={<Search />} sx={{ width: 80, height: 40, px: 1, flexShrink: 0, whiteSpace: 'nowrap' }}>查询</Button><Button sx={{ width: 80, height: 40, flexShrink: 0, whiteSpace: 'nowrap' }} endIcon={expanded ? <ExpandLess /> : <ExpandMore />} onClick={() => setExpanded(!expanded)}>{expanded ? '收起' : '展开'}</Button></Stack>;
  const detailRows = (data.data?.records ?? []).map(row => ({ ...row, location: hitsOf(row).map((hit, index) => `命中${index + 1}：${hit.rowKey === 'form' ? '普通字段组' : hit.rowKey}`).join('；'), values: hitsOf(row).map(hit => Object.entries(hit.attributes).map(([key, item]) => `${sourceName(key, row.lookupItems)}：${display(item)}`).join('；')).join(' / ') }));
  return <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 1.5 }}>
    <Box component="form" onSubmit={event => { event.preventDefault(); search(); }} sx={formListQueryPanelSx}>
      <Box sx={formListQueryGridSx}>
        <TextField select size="small" label="查询条件" value={filter} onChange={event => { setFilter(event.target.value); if (secondFilter === event.target.value) { setSecondFilter(attributes.find(([id]) => id !== event.target.value)![0]); setSecondValue(''); } }} sx={formListFieldSx}>{attributes.map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}</TextField>
        <TextField size="small" label="精确匹配值" value={value} onChange={event => setValue(event.target.value)} sx={formListFieldSx} />
        {expanded ? <TextField size="small" label="生产对象编号" value={objectNo} onChange={event => setObjectNo(event.target.value)} sx={formListFieldSx} /> : actions}
        <Collapse in={expanded} unmountOnExit sx={{ gridColumn: '1 / -1' }}><Box sx={{ ...formListQueryGridSx, pt: 1.5, borderTop: '1px solid #ebeef5' }}>
          <TextField select size="small" label="同条明细中的条件" value={secondFilter} onChange={event => setSecondFilter(event.target.value)} sx={formListFieldSx}>{attributes.filter(([id]) => id !== filter).map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}</TextField>
          <TextField size="small" label="第二个匹配值" value={secondValue} onChange={event => setSecondValue(event.target.value)} sx={formListFieldSx} />
          <TextField size="small" label="工序名称" value={operationName} onChange={event => setOperationName(event.target.value)} sx={formListFieldSx} />
        </Box></Collapse>
        {expanded && <Box sx={{ gridColumn: '1 / -1' }}>{actions}</Box>}
      </Box>
    </Box>
    {lookupItems.isError && <Alert severity="error" action={<Button onClick={() => void lookupItems.refetch()}>重试</Button>}>追溯项目录读取失败，新增条件暂不可用。</Alert>}
    {(data.isError || status.isError || error) && <Alert severity="error">{error || '报表或处理状态读取失败，请检查权限后重试。'}</Alert>}
    {Boolean(status.data?.length) && <Alert severity="warning">有 {status.data!.length} 个投影待处理或失败（最多显示100个），当前合计可能不完整。
      {status.data!.map(item => <Stack key={item.id} direction="row" alignItems="center"><Typography variant="body2">{item.instanceNo} · {item.status === 'PENDING' ? '待处理' : item.errorMessage}</Typography>{item.status === 'FAILED' && canRetry && <Button size="small" onClick={async () => {
        try { await client.post(`${base}/${item.id}/retry`, { reason: retryReason }); setError(''); void status.refetch(); void data.refetch(); } catch (reason) { setError(reason instanceof Error ? reason.message : '重试失败'); }
      }}>重试</Button>}</Stack>)}
      {canRetry && status.data!.some(item => item.status === 'FAILED') && <TextField size="small" label="重试原因" value={retryReason} onChange={event => setRetryReason(event.target.value)} />}
    </Alert>}
    <Box sx={{ ...panel, flexShrink: 0 }}><Tabs value={modelId} onChange={(_, id: string) => { setModelId(id); setView(0); reset(id); }} variant="scrollable">{models.map(([id, name]) => <Tab key={id} value={id} label={name} />)}</Tabs></Box>
    {modelId !== 'formTrace' && <Tabs value={view} onChange={(_, next: number) => setView(next)}><Tab label="来源明细" /><Tab label="按工序／用途合计" /></Tabs>}
    {view === 1 && data.data?.totalsTruncated && <Alert severity="warning">分组超过200个，请缩小查询范围；当前仅显示前200组。</Alert>}
    {view === 0 ? <ProjectionTable key="detail" preference="detail" description={modelId === 'formTrace' ? '仅查询最终完成并成功处理的记录；新增追溯项不会自动覆盖旧记录。' : undefined} columns={detailColumns} rows={detailRows} loading={data.isFetching} failed={data.isError} onSource={index => { setSelected(data.data!.records[index]); setDetailTab(0); setDhrs(null); setError(''); }} footer={<FormListPagination totalElements={data.data?.total ?? 0} totalPages={Math.ceil((data.data?.total ?? 0) / request.size)} page={request.page} pageSize={request.size} onPageChange={page => setRequest({ ...request, page })} onPageSizeChange={size => setRequest({ ...request, size, page: 0 })} />} />
      : <ProjectionTable key="total" preference="total" columns={totalColumns} rows={data.data?.totals ?? []} loading={data.isFetching} failed={data.isError} footer={<Typography variant="body2" color="text.secondary" sx={{ p: 2, borderTop: '1px solid #e4e7ed' }}>共 {data.data?.totals.length ?? 0} 组（最多200组，请使用查询条件缩小范围）</Typography>} />}
    <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)} sx={{ zIndex: theme => theme.zIndex.drawer + 3 }} PaperProps={{ sx: { width: { xs: '100vw', sm: 560 }, height: '100vh' } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}><Typography variant="subtitle1">{selected?.instanceNo}</Typography><Tooltip title="关闭" placement="left"><IconButton aria-label="关闭来源详情" onClick={() => setSelected(null)}><Close /></IconButton></Tooltip></Stack>
      <Tabs value={detailTab} onChange={(_, next: number) => setDetailTab(next)}><Tab label="数据信息" /><Tab label="数据审计" /></Tabs>
      <Stack spacing={2} sx={{ p: 2, bgcolor: '#f7f9fc', flex: 1, minHeight: 0, overflow: 'auto', '& > *': { flexShrink: 0 }, '& > .MuiBox-root': { bgcolor: '#fff' } }}>
        {detailTab === 0 ? <>
          <Alert severity="info">结果来自最终完成时的冻结快照。DHR 查询展示当前真实归属，不替代冻结 DHR 版本。</Alert>
          <DetailSection title="生产来源"><DetailField label="生产对象">{selected?.objectNo}</DetailField><DetailField label="工序">{selected?.operationName}</DetailField></DetailSection>
          {selected && hitsOf(selected).map((hit, index) => <DetailSection key={`${hit.bindingId}/${hit.rowKey}`} title={`命中 ${index + 1} · ${hit.rowKey === 'form' ? '普通字段组' : `明细 ${hit.rowKey}`}`}>{Object.entries(hit.attributes).map(([key, item]) => <DetailField key={key} label={sourceAttributeName(key)}>{display(item)}</DetailField>)}</DetailSection>)}
          <Button variant="outlined" disabled={!document} onClick={() => setPreviewOpen(true)}>预览来源表单</Button>
          {canDhr && <Button onClick={async () => { try { setDhrs((await client.get(`${base}/${selected?.batchId}/dhr`)).data.data); } catch (reason) { setError(reason instanceof Error ? reason.message : 'DHR查询失败'); } }}>查看实际关联 DHR</Button>}
          {dhrs && <Typography variant="body2">{dhrs.length ? dhrs.map(dhr => `${dhr.dhrNo} · ${dhr.status}`).join('；') : '该来源没有实际关联的DHR。'}</Typography>}
        </> : <>
          <Typography variant="body2">来源修订：{selected?.revision}；历史值读取同一冻结快照。</Typography>
          <DetailSection title="系统信息">{['createdBy', 'createdAt', 'updatedBy', 'updatedAt'].map(key => <DetailField key={key} label={detailColumns.find(column => column.id === key)?.label ?? key}>{display(selected?.[key as keyof RecordRow])}</DetailField>)}</DetailSection>
          {selected && hitsOf(selected).map((hit, index) => <Accordion key={`${hit.bindingId}/${hit.rowKey}`} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}><AccordionSummary expandIcon={<ExpandMore fontSize="small" />}><Typography variant="body2">命中 {index + 1} 的字段来源</Typography></AccordionSummary><AccordionDetails><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>{Object.entries(hit.sources).map(([key, fieldId]) => {
            const fields = hit.tableId ? source.data?.form.fields.find(field => field.id === hit.tableId)?.typeConfig.columns as ModelField[] | undefined : source.data?.form.fields;
            return <DetailField key={key} label={sourceAttributeName(key)}>{fields?.find(field => field.id === fieldId)?.name ?? '来源字段'} · {hit.rowKey === 'form' ? '普通字段组' : `明细 ${hit.rowKey}`}</DetailField>;
          })}</Box></AccordionDetails></Accordion>)}
        </>}
        {error && <Alert severity="error">{error}</Alert>}{source.isError && <Alert severity="error">来源快照读取失败</Alert>}
      </Stack>
    </Drawer>
    <AppDialog open={previewOpen && Boolean(selected)} onClose={() => setPreviewOpen(false)} fullScreen><DialogTitle>来源表单 · {selected?.instanceNo} · 修订 {selected?.revision}</DialogTitle><DialogContent dividers sx={{ bgcolor: '#f7f9fc' }}>{document && source.data && <FormCanvasPreview document={document} fullPage runtime={{ values: source.data.values, disabled: true, onChange: () => {} }} />}</DialogContent></AppDialog>
  </Box>;
}
