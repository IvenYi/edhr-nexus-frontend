import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, CircularProgress, IconButton, InputAdornment, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import Clear from '@mui/icons-material/Clear';
import ViewColumnRounded from '@mui/icons-material/ViewColumnRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';
import AssignmentIndOutlined from '@mui/icons-material/AssignmentIndOutlined';
import { ListTableShell, resolveListColumnWidths } from '@/components/ListTableShell';
import ListColumnSettingsPopover, { getCurrentUserPreferenceStorageKey, loadListColumnSettings, reorderListColumns, type ListColumnSettings } from '@/components/ListColumnSettingsPopover';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import { listColumnResizeHandleSx, listTableBodyCellSx, listTableHeaderCellSx, listTableStickyActionSx } from '@/components/listTableStyles';
import TableStateCell from '@/components/TableStateCell';
import DetailDrawer from '@/components/DetailDrawer';
import StatusBadge from '@/components/StatusBadge';
import { listWorkflowOperations, workflowBusinessTypeLabel, type WorkflowInstanceRow } from '@/api/workflow-operations';
import { useAuthStore } from '@/stores/authStore';
import { INSTANCE_STATUS_MAP } from '@/utils/constants';
import WorkflowInstancePanel from './WorkflowInstancePanel';
import WorkflowReassignmentEntry from './WorkflowReassignmentEntry';

const COLUMNS = [
  { id: 'businessType', label: '业务类型', width: 140, minWidth: 120 },
  { id: 'templateName', label: '流程名称', width: 200, minWidth: 160 },
  { id: 'businessKey', label: '业务编号', width: 200, minWidth: 160 },
  { id: 'status', label: '状态', width: 100, minWidth: 90 },
  { id: 'startUserName', label: '发起人', width: 120, minWidth: 100 },
  { id: 'startTime', label: '开始时间', width: 180, minWidth: 160 },
  { id: 'endTime', label: '结束时间', width: 180, minWidth: 160 },
] as const;
type ColumnId = typeof COLUMNS[number]['id'];
const ACTION_WIDTH = 64;

function cellValue(item: WorkflowInstanceRow, column: ColumnId) {
  if (column === 'businessType') return workflowBusinessTypeLabel(item.businessType);
  if (column === 'status') {
    const state = INSTANCE_STATUS_MAP[item.status as keyof typeof INSTANCE_STATUS_MAP];
    return <StatusBadge label={state?.label || '已撤回'} color={state?.color || 'default'} />;
  }
  if (column === 'startTime' || column === 'endTime') return item[column]?.replace('T', ' ').slice(0, 19) || '-';
  if (column === 'templateName') return item.templateName || '未命名流程';
  if (column === 'businessKey') return item.businessKey || item.id;
  return item.startUserName;
}

export default function InstanceList({ intervention = false }: { intervention?: boolean }) {
  const userId = useAuthStore(state => state.user?.id ?? 'anonymous');
  return <WorkflowInstanceList key={`${intervention ? 'intervention' : 'log'}:${userId}`} intervention={intervention} />;
}

function WorkflowInstanceList({ intervention }: { intervention: boolean }) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const size = [10, 20, 50].includes(Number(params.get('size'))) ? Number(params.get('size')) : 20;
  const keyword = params.get('keyword') || '';
  const status = params.get('status') || '';
  const [input, setInput] = useState(keyword);
  const [statusInput, setStatusInput] = useState(status);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [reassignmentId, setReassignmentId] = useState<string | null>(null);
  const canIntervene = useAuthStore(state => state.hasPermission('workflow.intervene'));
  const preferencePrefix = `workflow-${intervention ? 'interventions' : 'logs'}-list`;
  const columnKey = useMemo(() => getCurrentUserPreferenceStorageKey(`${preferencePrefix}-columns:`), [preferencePrefix]);
  const [columnSettings, setColumnSettings] = useState<ListColumnSettings<ColumnId>>(() => loadListColumnSettings(columnKey, COLUMNS, 2));
  const [columnAnchor, setColumnAnchor] = useState<HTMLElement | null>(null);
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(COLUMNS, `${preferencePrefix}-column-widths:`);
  useEffect(() => { localStorage.setItem(columnKey, JSON.stringify(columnSettings)); }, [columnKey, columnSettings]);
  const visibleColumns = columnSettings.order.filter(id => !columnSettings.hidden.includes(id)).map(id => COLUMNS.find(column => column.id === id)!);
  const tableColumns = [...visibleColumns.map(column => ({ id: column.id, width: getColumnWidth(column) })),
    ...(intervention ? [{ id: 'actions' as const, width: ACTION_WIDTH }] : [])];
  const minTableWidth = tableColumns.reduce((sum, column) => sum + column.width, 0);
  const toggleColumn = (id: ColumnId) => setColumnSettings(current => {
    const hidden = current.hidden.includes(id);
    if (!hidden && current.order.length - current.hidden.length <= 1) return current;
    return { ...current, hidden: hidden ? current.hidden.filter(value => value !== id) : [...current.hidden, id] };
  });
  const composing = useRef(false);
  useEffect(() => { setInput(keyword); setStatusInput(status); }, [keyword, status]);
  useEffect(() => { setSelected(null); }, [intervention]);
  const query = useQuery({ queryKey: ['workflow-operations', intervention, page, size, keyword, status], retry: false,
    queryFn: () => listWorkflowOperations({ page, size, keyword, status: intervention ? '' : status, runningOnly: intervention }) });
  const commit = (values: Record<string, string>) => { const next = new URLSearchParams(params); Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); setParams(next); };
  const open = (id: string) => { setSelected(id); setTab(0); };
  useEffect(() => { if (query.data && page > Math.max(1, query.data.totalPages)) { const next = new URLSearchParams(params); next.set('page', String(Math.max(1, query.data.totalPages))); setParams(next, { replace: true }); } }, [query.data, page, params, setParams]);
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', minHeight: 0 }}>
    <Paper variant="outlined" component="form" onSubmit={event => { event.preventDefault(); if (!composing.current) commit({ keyword: input.trim(), status: statusInput, page: '1' }); }} sx={{ p: 2, borderColor: '#e4e7ed' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(240px,1fr) minmax(180px,1fr) auto' }, gap: 1.5, alignItems: 'center' }}>
        <TextField label="流程名称／业务编号" size="small" value={input} onChange={event => setInput(event.target.value)}
          onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
          onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault(); }}
          InputProps={{ endAdornment: input && <InputAdornment position="end"><IconButton size="small" aria-label="清除查询条件" onClick={() => { setInput(''); commit({ keyword: '', page: '1' }); }}><Clear fontSize="small" /></IconButton></InputAdornment> }} />
        {!intervention ? <TextField select size="small" label="流程状态" value={statusInput} onChange={event => setStatusInput(event.target.value)}>
          <MenuItem value="">全部</MenuItem>{['RUNNING', 'COMPLETED', 'TERMINATED', 'WITHDRAWN'].map(value => <MenuItem key={value} value={value}>{INSTANCE_STATUS_MAP[value as keyof typeof INSTANCE_STATUS_MAP]?.label || '已撤回'}</MenuItem>)}
        </TextField> : <Typography variant="body2" color="text.secondary">仅显示运行中的流程</Typography>}
        <Stack direction="row" justifyContent="flex-end" spacing={1}><Button variant="outlined" sx={{ width: 80, height: 40 }} onClick={() => { setInput(''); setStatusInput(''); setParams({}); }}>重置</Button><Button type="submit" variant="contained" sx={{ width: 80, height: 40 }}>查询</Button></Stack>
      </Box>
    </Paper>
    <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: '#e4e7ed' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.25, borderBottom: '1px solid #e4e7ed' }}>
        <Tooltip title="字段设置" arrow><IconButton size="small" aria-label="字段设置" onClick={event => setColumnAnchor(event.currentTarget)}
          sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', color: '#606266' }}>
          <Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <ViewColumnRounded sx={{ fontSize: 21 }} /><TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} />
          </Box>
        </IconButton></Tooltip>
        <Typography variant="body2" color="text.secondary">{intervention ? '查看当前任务并重新分配处理人' : '查看流程进度与只读处理记录'}</Typography>
      </Stack>
      <ListTableShell minTableWidth={minTableWidth} sx={{ flex: 1, minHeight: 200 }}>{tableWidth => {
        const widths = resolveListColumnWidths(tableColumns, tableWidth, 'templateName', ['actions']);
        const colSpan = visibleColumns.length + (intervention ? 1 : 0);
        return <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: tableWidth }}>
        <colgroup>{visibleColumns.map(column => <col key={column.id} style={{ width: widths[column.id] }} />)}{intervention && <col style={{ width: ACTION_WIDTH }} />}</colgroup>
        <TableHead><TableRow>{visibleColumns.map(column => <TableCell key={column.id} sx={{ ...listTableHeaderCellSx, width: widths[column.id], pr: 2, userSelect: 'none' }}>
          {column.label}<Box aria-label={`调整${column.label}列宽`} sx={listColumnResizeHandleSx} {...getResizeHandleProps(column)} />
        </TableCell>)}{intervention && <TableCell align="center" sx={{ ...listTableHeaderCellSx, ...listTableStickyActionSx(ACTION_WIDTH, 'head') }}>操作</TableCell>}</TableRow></TableHead>
        <TableBody>{query.isLoading ? <TableRow><TableStateCell colSpan={colSpan}><CircularProgress size={24} /></TableStateCell></TableRow>
          : query.isError ? <TableRow><TableStateCell colSpan={colSpan}>加载失败 <Button onClick={() => void query.refetch()}>重试</Button></TableStateCell></TableRow>
          : !query.data?.content.length ? <TableRow><TableStateCell colSpan={colSpan}>暂无数据</TableStateCell></TableRow>
          : query.data.content.map(item => <TableRow key={item.id} hover tabIndex={0} onClick={() => open(item.id)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(item.id); } }} sx={{ cursor: 'pointer', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 } }}>
            {visibleColumns.map(column => <TableCell key={column.id} title={column.id === 'status' ? undefined : String(cellValue(item, column.id) ?? '')}
              sx={{ ...listTableBodyCellSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cellValue(item, column.id)}</TableCell>)}
            {intervention && <TableCell align="center" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}
              sx={{ ...listTableBodyCellSx, ...listTableStickyActionSx(ACTION_WIDTH, 'body') }}>
              {canIntervene && item.status === 'RUNNING' ? <Tooltip title="重新分配" arrow><IconButton size="small" aria-label="重新分配" onClick={() => setReassignmentId(item.id)}><AssignmentIndOutlined fontSize="small" /></IconButton></Tooltip> : '-'}
            </TableCell>}
          </TableRow>)}</TableBody>
      </Table>; }}</ListTableShell>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 56, px: 2, borderTop: '1px solid #e4e7ed' }}>
        <Typography variant="body2" color="text.secondary">共 {query.data?.totalElements ?? 0} 条数据</Typography>
        <Stack direction="row" spacing={1} alignItems="center"><Pagination size="small" page={page} count={Math.max(1, query.data?.totalPages ?? 1)} onChange={(_, next) => commit({ page: String(next) })}
          getItemAriaLabel={(type, number) => type === 'page' ? `第${number}页` : ({ first: '第一页', last: '最后一页', previous: '上一页', next: '下一页', 'start-ellipsis': '更多页码', 'end-ellipsis': '更多页码' }[type])} />
          <TextField select size="small" value={size} inputProps={{ 'aria-label': '每页条数' }} onChange={event => commit({ size: event.target.value, page: '1' })}>{[10, 20, 50].map(value => <MenuItem key={value} value={value}>{value} 条／页</MenuItem>)}</TextField>
        </Stack>
      </Stack>
    </Paper>
    <ListColumnSettingsPopover anchorEl={columnAnchor} columns={COLUMNS} settings={columnSettings} onClose={() => setColumnAnchor(null)}
      onToggle={toggleColumn} onReorder={(source, target) => setColumnSettings(current => reorderListColumns(COLUMNS, current, source, target))} />
    <DetailDrawer open={Boolean(selected)} label={intervention ? '流程干预详情' : '流程日志详情'} onClose={() => setSelected(null)} tab={tab} onTabChange={setTab}>
      {selected && <WorkflowInstancePanel key={selected} id={selected} audit={tab === 1} intervention={intervention} />}
    </DetailDrawer>
    {reassignmentId && <WorkflowReassignmentEntry key={reassignmentId} id={reassignmentId} onClose={() => setReassignmentId(null)}
      onSuccess={() => { setReassignmentId(null); void query.refetch(); }} />}
  </Box>;
}
