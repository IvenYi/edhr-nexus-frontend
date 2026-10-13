import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Collapse, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { ExpandLess, ExpandMore, InfoOutlined, Search, TuneRounded, ViewColumnRounded, VisibilityOutlined } from '@mui/icons-material';
import DetailDrawer from '@/components/DetailDrawer';
import StatusBadge from '@/components/StatusBadge';
import client from '@/api/client';
import FormDialogSection from '@/components/FormDialogSection';
import TableStateCell from '@/components/TableStateCell';
import { ListTableShell, resolveListColumnWidths } from '@/components/ListTableShell';
import ListColumnSettingsPopover, { getCurrentUserPreferenceStorageKey, loadListColumnSettings, reorderListColumns } from '@/components/ListColumnSettingsPopover';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import { listColumnResizeHandleSx, listTableBodyCellSx, listTableHeaderCellSx, listTableStickyActionSx } from '@/components/listTableStyles';
import { formListFieldSx, formListQueryGridSx, formListQueryPanelSx, FormListPagination } from '@/pages/form-management/formManagementListStyles';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import type { ModelField } from '@/pages/master-data/template-designer-react/types/model';
import { useAuthStore } from '@/stores/authStore';
import { useFormLookupItems } from '@/api/formLookupCatalog';
import { businessAttributeNames, businessFilters, businessRecordColumns, businessRecordValues, isReportDateFilter, reportAttributeValue } from './projectionReportColumns';
import { sourceHighlight } from './projectionSourceHighlight';
import type { PROJECTION_REPORT_PAGES } from '@/utils/menuManagement';

const base = '/reports/form-projections';
const legacyAttributes = [['materialLotText', '物料批号'], ['serialNumberText', '序列号'], ['equipmentText', '设备编号'], ['teamText', '责任班组'], ['documentNumberText', '单据号'], ['category', '分类'], ['reason', '原因'], ['unit', '单位']];
const legacyAttributeNames: Record<string, string> = { ...Object.fromEntries([...legacyAttributes, ['material', '物料'], ['quantity', '数量'], ['goodQuantity', '良品数量'], ['ngQuantity', '不良品数量']]), ...businessAttributeNames };
interface Hit { rowKey: string; rowIndex?: number; tableId?: string; bindingId: string; attributes: Record<string, unknown>; sources: Record<string, string>; details?: { fieldId: string; name: string; value: unknown }[] }
interface RecordRow extends Hit { id: string; instanceId: string; batchId?: string; context?: Record<string, unknown>; status?: string; savedStage?: string; instanceNo: string; objectNo: string; operationName: string; revision: number; hits?: Hit[]; lookupItems?: Record<string, { name: string }>; createdBy?: string; createdAt?: string; updatedBy?: string; updatedAt?: string }
interface Result { total: number; records: RecordRow[]; totals: Record<string, unknown>[]; totalsTruncated: boolean }
interface Source { form: { name: string; version: string; versionId: string; model: string; canvas: string; fields: ModelField[] }; values: Record<string, unknown> }
interface Column { id: string; label: string; width: number }
const detailColumns: Column[] = [['instanceNo', '来源表单'], ['objectNo', '所属生产对象'], ['operationName', '工序'], ['statusLabel', '表单状态'], ['relation', '关联说明'], ['location', '命中位置'], ['values', '取值'], ['createdBy', '创建人'], ['createdAt', '创建时间'], ['updatedBy', '更新人'], ['updatedAt', '更新时间']].map(([id, label]) => ({ id, label, width: id === 'values' ? 360 : 180 }));
const display = (value: unknown): string => value == null ? '—' : Array.isArray(value) ? value.map(display).join('、') : typeof value === 'object' ? String((value as { name?: string }).name ?? '') : String(value);
const panel = { border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', minHeight: 0, overflow: 'hidden' };
const hitsOf = (row: RecordRow): Hit[] => row.hits?.length ? row.hits : [row];
const sourceName = (key: string, definitions?: RecordRow['lookupItems']) => definitions?.[key]?.name ?? legacyAttributeNames[key] ?? '追溯项';
const locationName = (hit: Hit) => hit.tableId ? (hit.rowIndex != null ? `子表第 ${hit.rowIndex + 1} 行` : '子表明细') : '主表字段';
const statusName = (status?: string, savedStage?: string) => ({ APPROVAL: '审批中', FILLING_AND_APPROVAL: '填报／审批中', FILLING: '填报中', COMPLETED: '已完成' }[savedStage ?? ''] ?? { DRAFT: '草稿', ACTIVE: '填报中', PENDING_REVIEW: '审批中', COMPLETED: '已完成' }[status ?? ''] ?? status ?? '已完成');
const unitName = (code: unknown, label: unknown) => !code ? '单位未填写' : label && label !== code ? `${label}（${code}）` : String(code);
const visibleAttributes = (hit: Hit) => Object.entries(hit.attributes).filter(([key]) => !['unitLabel', 'unitId', 'reasonLabel', 'reasonId', 'categoryLabel', 'categoryId', 'reporterLabel', 'reporterId'].includes(key)).map(([key, value]) => [key, key === 'unit' ? unitName(value, hit.attributes.unitLabel) : reportAttributeValue(hit.attributes, key)] as const);
function ProductionObjectInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const options = useQuery({ queryKey: ['projection-production-object-options', value], queryFn: async () =>
    (await client.get(`${base}/production-object-options`, { params: { keyword: value } })).data.data as { id: string; code: string; name: string; type: string }[] });
  return <Autocomplete freeSolo options={options.data ?? []} inputValue={value} loading={options.isFetching}
    getOptionLabel={option => typeof option === 'string' ? option : option.code}
    onInputChange={(_, text) => onChange(text)} onChange={(_, option) => onChange(typeof option === 'string' ? option : option?.code ?? '')}
    renderOption={(props, option) => <li {...props} key={option.id}>{option.code} · {option.type === 'SN' ? 'SN' : '批次'}</li>}
    renderInput={params => <TextField {...params} size="small" label={label} sx={formListFieldSx} error={options.isError} helperText={options.isError ? '候选读取失败，可输入完整编号查询' : undefined} />} />;
}
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <FormDialogSection title={title}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>{children}</Box></FormDialogSection>;
}
function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.5 }}>{label}</Typography><Typography component="div" variant="body2" sx={{ color: '#303133', overflowWrap: 'anywhere' }}>{children}</Typography></Box>;
}
const stageBadge = (label: string) => <StatusBadge label={label} color={label === '已完成' ? 'success' : label === '草稿' ? 'default' : 'warning'} />;

function ProjectionTable({ columns, rows, preference, loading, failed, onSource, footer, description }: { columns: Column[]; rows: Record<string, unknown>[]; preference: string; loading: boolean; failed: boolean; onSource?: (index: number) => void; footer?: ReactNode; description?: string }) {
  const storageKey = useMemo(() => getCurrentUserPreferenceStorageKey(`projection-${preference}-columns-`), [preference]);
  const [settings, setSettings] = useState(() => loadListColumnSettings(storageKey, columns, 1));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(columns, `projection-${preference}-widths-`);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Optional preferences. */ } }, [settings, storageKey]);
  const visible = settings.order.filter(id => !settings.hidden.includes(id)).map(id => columns.find(column => column.id === id)!).filter(Boolean);
  const layout = [...visible.map(column => ({ id: column.id, width: getColumnWidth(column) })), ...(onSource ? [{ id: 'actions', width: 100 }] : [])];
  const stateText = loading ? '加载中…' : failed ? '数据读取失败，请重新查询' : !rows.length ? '暂无数据' : '';
  return <Box sx={{ ...panel, display: 'flex', flexDirection: 'column', flex: 1 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 48, flexShrink: 0, px: 2, borderBottom: '1px solid #e4e7ed' }}>
      <Tooltip title="字段设置"><IconButton aria-label="字段设置" onClick={event => setAnchor(event.currentTarget)} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1 }}><ViewColumnRounded fontSize="small" /><TuneRounded sx={{ position: 'absolute', fontSize: 12, right: 4, bottom: 4, bgcolor: '#fff' }} /></IconButton></Tooltip>
      {description && <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0, mx: 1.5, display: { xs: 'none', md: 'block' } }} noWrap title={description}>{description}</Typography>}
      <Tooltip title={description || (onSource ? '只显示最终完成并成功生成的记录；点击查看来源快照。' : '按生产对象、工序、用途、物料批号及单位分组合计，不代表批次最终产出。')}><IconButton aria-label="统计口径说明"><InfoOutlined fontSize="small" /></IconButton></Tooltip>
    </Stack>
    <ListTableShell minTableWidth={layout.reduce((sum, column) => sum + column.width, 0)} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      {tableWidth => {
        const widths = resolveListColumnWidths(layout, tableWidth, visible[0]?.id ?? '', ['actions']);
        return <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: tableWidth, height: stateText ? '100%' : 'auto' }}>
          <colgroup>{layout.map(column => <col key={column.id} style={{ width: widths[column.id] }} />)}</colgroup>
          <TableHead><TableRow>{visible.map(column => <TableCell key={column.id} sx={{ ...listTableHeaderCellSx, width: widths[column.id], position: 'sticky' }}>{column.label}<Box aria-label={`调整${column.label}列宽`} sx={listColumnResizeHandleSx} {...getResizeHandleProps(column)} /></TableCell>)}{onSource && <TableCell align="center" sx={{ ...listTableHeaderCellSx, ...listTableStickyActionSx(100, 'head') }}>操作</TableCell>}</TableRow></TableHead>
          <TableBody sx={{ height: stateText ? '100%' : 'auto' }}>{stateText ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={layout.length} sx={{ height: '100%', color: '#909399' }}>{stateText}</TableStateCell></TableRow> : rows.map((row, index) => <TableRow key={String(row.id ?? index)} hover onClick={onSource ? () => onSource(index) : undefined} tabIndex={onSource ? 0 : undefined} onKeyDown={event => { if (onSource && event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) { event.preventDefault(); onSource(index); } }} sx={{ cursor: onSource ? 'pointer' : undefined }}>{visible.map(column => <TableCell key={column.id} title={display(row[column.id])} sx={{ ...listTableBodyCellSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{column.id === 'statusLabel' ? stageBadge(display(row[column.id])) : display(row[column.id])}</TableCell>)}{onSource && <TableCell align="center" sx={{ ...listTableBodyCellSx, ...listTableStickyActionSx(100, 'body') }}><Tooltip title="查看来源表单"><IconButton size="small" aria-label="查看来源表单" onClick={event => { event.stopPropagation(); onSource(index); }}><VisibilityOutlined fontSize="small" /></IconButton></Tooltip></TableCell>}</TableRow>)}</TableBody>
        </Table>;
      }}
    </ListTableShell>
    {footer}
    <ListColumnSettingsPopover anchorEl={anchor} columns={columns} settings={settings} onClose={() => setAnchor(null)} onToggle={id => setSettings(current => ({ ...current, hidden: current.hidden.includes(id) ? current.hidden.filter(item => item !== id) : [...current.hidden, id] }))} onReorder={(from, to) => setSettings(current => reorderListColumns(columns, current, from, to))} />
  </Box>;
}

export default function FormProjectionReportPage({ modelId }: { modelId: typeof PROJECTION_REPORT_PAGES[number]['modelId'] }) {
  const lookupItems = useFormLookupItems();
  const canRetry = useAuthStore(state => state.hasPermission('system.edit'));
  const canDhr = useAuthStore(state => state.hasPermission('dhr.instances.view'));
  const attributes = modelId === 'formTrace' ? (lookupItems.data ?? []).map(item => [item.id, item.name]) : businessFilters(modelId);
  const primaryFilter = modelId === 'formTrace' ? 'materialLotText' : 'workOrderNo';
  const [value, setValue] = useState('');
  const [conditions, setConditions] = useState<{ id: string; itemId: string; value: string }[]>([]);
  const [objectNo, setObjectNo] = useState('');
  const [operationName, setOperationName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [queryRevision, setQueryRevision] = useState(0);
  const [request, setRequest] = useState({ modelId, filters: {} as Record<string, string>, objectNo: '', operationName: '', page: 0, size: 20 });
  const [selected, setSelected] = useState<RecordRow | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const [sourceLocated, setSourceLocated] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [retryReason, setRetryReason] = useState('');
  const [dhrs, setDhrs] = useState<{ id: string; dhrNo: string; status: string }[] | null>(null);
  const data = useQuery({ queryKey: ['form-projection-report', request, queryRevision], queryFn: async () => (await client.post(`${base}/query`, { ...request, objectNo: request.objectNo || undefined, operationName: request.operationName || undefined })).data.data as Result });
  const status = useQuery({ queryKey: ['form-projection-status'], queryFn: async () => (await client.get(`${base}/status`)).data.data as { id: string; status: string; instanceNo: string; errorMessage?: string }[], refetchInterval: 5000 });
  const sourcePath = selected?.batchId ? `${base}/${selected.batchId}` : `${base}/instances/${selected?.instanceId}`;
  const source = useQuery({ queryKey: ['form-projection-source', sourcePath], queryFn: async () => (await client.get(`${sourcePath}/source`)).data.data as Source, enabled: Boolean(selected) });
  const document = useMemo(() => {
    if (!source.data) return null;
    const form = source.data.form;
    const result = parseReactTemplateDesignerDocument({ id: form.versionId, name: form.name }, { id: form.versionId, version: form.version, modelDesignJson: form.model, canvasDesignJson: form.canvas });
    result.model.fields = form.fields;
    return result;
  }, [source.data]);
  const highlight = useMemo(() => sourceHighlight(selected ? hitsOf(selected) : [], source.data?.values ?? {}, document?.model.projection?.bindings), [selected, source.data, document]);
  useEffect(() => {
    setSourceLocated(null);
    if (!selected || detailTab !== 0 || !document) return;
    const frame = requestAnimationFrame(() => {
      const target = previewRef.current?.querySelector('[data-form-preview-highlighted="true"]');
      setSourceLocated(Boolean(target));
      target?.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected, document, detailTab]);
  const sourceAttributeName = (key: string) => sourceName(key, selected?.lookupItems);
  const search = () => {
    const filters: Record<string, string> = {};
    if (value.trim()) filters[primaryFilter] = value.trim();
    for (const condition of conditions) {
      if (!condition.itemId && condition.value.trim()) { setError('请为新增条件选择查询项'); return; }
      if (condition.itemId && condition.value.trim()) filters[condition.itemId] = condition.value.trim();
    }
    setError(''); setRequest({ ...request, modelId, filters, objectNo, operationName, page: 0 });
    setQueryRevision(current => current + 1);
    void status.refetch();
  };
  const reset = (model = modelId) => {
    setValue(''); setConditions([]); setObjectNo(''); setOperationName(''); setError('');
    setRequest({ ...request, modelId: model, filters: {}, objectNo: '', operationName: '', page: 0 });
    setQueryRevision(current => current + 1);
  };
  const actions = <Stack direction="row" spacing={1} justifyContent="flex-end"><Button variant="outlined" sx={{ width: 80, height: 40, flexShrink: 0 }} onClick={() => reset()}>重置</Button><Button variant="contained" type="submit" startIcon={<Search />} sx={{ width: 80, height: 40, px: 1, flexShrink: 0, whiteSpace: 'nowrap' }}>查询</Button><Button sx={{ width: 80, height: 40, flexShrink: 0, whiteSpace: 'nowrap' }} endIcon={expanded ? <ExpandLess /> : <ExpandMore />} onClick={() => setExpanded(!expanded)}>{expanded ? '收起' : '展开'}</Button></Stack>;
  const detailRows = (data.data?.records ?? []).map(row => ({ ...row, statusLabel: statusName(row.status, row.savedStage),
    relation: request.filters.lookup_production_batch && request.filters.lookup_production_batch !== row.objectNo ? '内容提及其他对象' : '所属对象的记录',
    location: [...new Set(hitsOf(row).map(locationName))].join('；'), values: hitsOf(row).map(hit => visibleAttributes(hit).map(([key, item]) => `${sourceName(key, row.lookupItems)}：${display(item)}`).join('；')).join(' / ') }));
  return <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 1.5 }}>
    <Box component="form" onSubmit={event => { event.preventDefault(); search(); }} sx={formListQueryPanelSx}>
      <Box sx={formListQueryGridSx}>
        <ProductionObjectInput label="所属生产批次/SN" value={objectNo} onChange={setObjectNo} />
        <TextField size="small" label={modelId === 'formTrace' ? '物料批号' : '工单编号'} value={value} onChange={event => setValue(event.target.value)} sx={formListFieldSx} />
        {expanded ? <TextField size="small" label="工序名称" value={operationName} onChange={event => setOperationName(event.target.value)} sx={formListFieldSx} /> : actions}
        <Collapse in={expanded} unmountOnExit sx={{ gridColumn: '1 / -1' }}><Box sx={{ ...formListQueryGridSx, pt: 1.5, borderTop: '1px solid #ebeef5' }}>
          {conditions.map(condition => <Box key={condition.id} sx={{ gridColumn: '1 / -1', ...formListQueryGridSx }}>
            <TextField select size="small" label={modelId === 'formTrace' ? '追溯项' : '筛选信息'} value={condition.itemId} sx={formListFieldSx}
              onChange={event => setConditions(conditions.map(item => item.id === condition.id ? { ...item, itemId: event.target.value, value: '' } : item))}>
              <MenuItem value="">请选择</MenuItem>{attributes.filter(([id]) => id !== primaryFilter && !conditions.some(item => item.id !== condition.id && item.itemId === id)).map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
            </TextField>
            {condition.itemId === 'lookup_production_batch' ? <ProductionObjectInput label="记录中的生产批次/SN" value={condition.value}
              onChange={text => setConditions(conditions.map(item => item.id === condition.id ? { ...item, value: text } : item))} />
              : <TextField size="small" type={isReportDateFilter(condition.itemId) ? 'date' : 'text'} InputLabelProps={isReportDateFilter(condition.itemId) ? { shrink: true } : undefined}
                label={isReportDateFilter(condition.itemId) ? attributes.find(([id]) => id === condition.itemId)?.[1] : '精确匹配值'} value={condition.value} sx={formListFieldSx} disabled={!condition.itemId}
                onChange={event => setConditions(conditions.map(item => item.id === condition.id ? { ...item, value: event.target.value } : item))} />}
            <Button sx={{ justifySelf: 'start' }} onClick={() => setConditions(conditions.filter(item => item.id !== condition.id))}>移除条件</Button>
          </Box>)}
          <Button sx={{ justifySelf: 'start' }} disabled={conditions.length >= attributes.length - 1} onClick={() => setConditions([...conditions, { id: crypto.randomUUID(), itemId: '', value: '' }])}>添加查询条件</Button>
          <Typography variant="caption" color="text.secondary" sx={{ gridColumn: '1 / -1' }}>{modelId === 'formTrace' ? '条件同时满足；子表条件须命中同一行。所属对象由生产执行确定，内容中的编号不改变DHR归属。' : '条件同时筛选同一笔业务记录。名称或编号精确匹配，日期范围包含首尾两天。'}</Typography>
        </Box></Collapse>
        {expanded && <Box sx={{ gridColumn: '1 / -1' }}>{actions}</Box>}
      </Box>
    </Box>
    {lookupItems.isError && <Alert severity="error" action={<Button onClick={() => void lookupItems.refetch()}>重试</Button>}>追溯项目录读取失败，新增条件暂不可用。</Alert>}
    {(data.isError || status.isError || error) && <Alert severity="error">{error || '报表或处理状态读取失败，请检查权限后重试。'}</Alert>}
    {modelId !== 'formTrace' && Boolean(status.data?.length) && <Alert severity="warning">有 {status.data!.length} 份表单的报表记录待生成或生成失败（最多显示100份），当前记录可能不完整。
      {status.data!.map(item => <Stack key={item.id} direction="row" alignItems="center"><Typography variant="body2">{item.instanceNo} · {item.status === 'PENDING' ? '待处理' : item.errorMessage}</Typography>{item.status === 'FAILED' && canRetry && <Button size="small" onClick={async () => {
        try { await client.post(`${base}/${item.id}/retry`, { reason: retryReason }); setError(''); void status.refetch(); void data.refetch(); } catch (reason) { setError(reason instanceof Error ? reason.message : '重试失败'); }
      }}>重试</Button>}</Stack>)}
      {canRetry && status.data!.some(item => item.status === 'FAILED') && <TextField size="small" label="重试原因" value={retryReason} onChange={event => setRetryReason(event.target.value)} />}
    </Alert>}
    <ProjectionTable key={`detail-${modelId}`} preference={`detail-${modelId}`} description={modelId === 'formTrace' ? '查询已保存内容，包含草稿、填报中、审批中和已完成；未保存输入不可查。' : '一行是一笔业务记录，不合并多次填报；点击查看来源表单。'} columns={modelId === 'formTrace' ? detailColumns : businessRecordColumns(modelId)} rows={modelId === 'formTrace' ? detailRows : detailRows.map(businessRecordValues)} loading={data.isFetching} failed={data.isError} onSource={index => { setSelected(data.data!.records[index]); setDetailTab(0); setDhrs(null); setError(''); }} footer={<FormListPagination totalElements={data.data?.total ?? 0} totalPages={Math.ceil((data.data?.total ?? 0) / request.size)} page={request.page} pageSize={request.size} onPageChange={page => setRequest({ ...request, page })} onPageSizeChange={size => setRequest({ ...request, size, page: 0 })} />} />
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} label="来源详情" tab={detailTab} onTabChange={setDetailTab} width={1040}>
        {detailTab === 0 ? <>
          <DetailSection title="生产来源"><DetailField label="来源表单">{selected?.instanceNo}</DetailField><DetailField label="所属生产批次/SN">{selected?.objectNo}</DetailField><DetailField label="工序">{selected?.operationName}</DetailField><DetailField label="表单状态">{stageBadge(statusName(selected?.status, selected?.savedStage))}</DetailField></DetailSection>
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderBottom: '1px solid #e4e7ed' }}><Typography variant="subtitle2">{source.data?.form.name ?? '来源表单'}{sourceLocated && ` · ${[...(highlight.hasMainFields ? ['主表字段'] : []), ...highlight.rows.map(row => `子表第 ${row.rowIndex + 1} 行`)].join('；')}`}</Typography><Tooltip title={selected?.batchId ? '读取最终完成时的表单快照，蓝色突出本笔业务的来源。' : '读取最近保存的内容，蓝色突出命中字段或子表行；内容编号不改变实际生产归属。'}><IconButton size="small" aria-label="来源说明"><InfoOutlined fontSize="small" /></IconButton></Tooltip></Stack>
            {source.isLoading && <Typography sx={{ p: 3 }} color="text.secondary">来源表单加载中…</Typography>}
            {sourceLocated === false && <Alert severity="info">当前来源版式中无法定位命中位置，可展开下方取值核对原记录。</Alert>}
            <Box ref={previewRef} sx={{ display: 'flex', minHeight: 0, height: '65vh', overflow: 'hidden' }}>{document && source.data && <FormCanvasPreview key={selected?.id} document={document} fullPage interaction={{ isFieldHighlighted: highlight.isFieldHighlighted }} runtime={{ values: source.data.values, disabled: true, onChange: () => {} }} />}</Box>
          </Box>
          {selected && <Accordion disableGutters elevation={0} sx={{ '&::before': { display: 'none' } }}><AccordionSummary expandIcon={<ExpandMore fontSize="small" />}><Typography variant="body2">{selected.batchId ? '本笔业务取值' : '命中内容'}</Typography></AccordionSummary><AccordionDetails>{hitsOf(selected).map((hit, index) => <DetailSection key={`${hit.bindingId}/${hit.rowKey}/${index}`} title={`${selected.batchId ? '业务记录' : `命中 ${index + 1}`} · ${locationName(hit)}`}>
            {visibleAttributes(hit).map(([key, item]) => <DetailField key={key} label={sourceAttributeName(key)}>{display(item)}</DetailField>)}
            {hit.details?.map(detail => <DetailField key={detail.fieldId} label={detail.name}>{Array.isArray(detail.value) ? detail.value.map(display).join('、') : display(detail.value)}</DetailField>)}
          </DetailSection>)}</AccordionDetails></Accordion>}
          {canDhr && <Button onClick={async () => { try { setDhrs((await client.get(`${sourcePath}/dhr`)).data.data); } catch (reason) { setError(reason instanceof Error ? reason.message : 'DHR查询失败'); } }}>查看实际关联 DHR</Button>}
          {dhrs && <Typography variant="body2">{dhrs.length ? dhrs.map(dhr => `${dhr.dhrNo} · ${dhr.status}`).join('；') : '该来源没有实际关联的DHR。'}</Typography>}
        </> : <>
          <Typography variant="body2">来源表单：{selected?.instanceNo}；{selected?.batchId ? `来源修订：${selected.revision}；统计读取最终完成时的值。` : '追溯读取最近一次成功保存的值，模板配置使用实例创建时的快照。'}</Typography>
          <DetailSection title="系统信息">{['createdBy', 'createdAt', 'updatedBy', 'updatedAt'].map(key => <DetailField key={key} label={detailColumns.find(column => column.id === key)?.label ?? key}>{display(selected?.[key as keyof RecordRow])}</DetailField>)}</DetailSection>
          {selected && hitsOf(selected).map((hit, index) => <Accordion key={`${hit.bindingId}/${hit.rowKey}/${index}`} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}><AccordionSummary expandIcon={<ExpandMore fontSize="small" />}><Typography variant="body2">命中 {index + 1} 的字段来源</Typography></AccordionSummary><AccordionDetails><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>{Object.entries(hit.sources).map(([key, fieldId]) => {
            const fields = hit.tableId ? source.data?.form.fields.find(field => field.id === hit.tableId)?.typeConfig.columns as ModelField[] | undefined : source.data?.form.fields;
            return <DetailField key={key} label={sourceAttributeName(key)}>{fields?.find(field => field.id === fieldId)?.name ?? '来源字段'} · {locationName(hit)}</DetailField>;
          })}</Box></AccordionDetails></Accordion>)}
        </>}
        {error && <Alert severity="error">{error}</Alert>}{source.isError && <Alert severity="error">来源快照读取失败</Alert>}
    </DetailDrawer>
  </Box>;
}
