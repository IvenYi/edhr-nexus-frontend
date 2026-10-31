import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Collapse, FormControl, MenuItem, Pagination, Select, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { ExpandMore, RestartAlt, Search } from '@mui/icons-material';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import {
  listRecordControlRequests,
  type RecordControlRequest,
  type RecordControlRequestQuery,
} from '@/api/record-control';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];
const EMPTY_FILTERS: RecordControlRequestQuery = {
  requestNo: '', requestType: '', instanceNo: '', templateName: '', templateCode: '', applicant: '',
  submittedFrom: '', submittedTo: '', status: '',
};
const STATUS: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
  IN_REVIEW: { label: '审批中', color: 'warning' }, APPROVED: { label: '审批通过', color: 'success' },
  RETURNED: { label: '已退回', color: 'error' }, WITHDRAWN: { label: '已撤回', color: 'default' },
};
const fieldSx = { '& .MuiInputBase-root': { height: 40, bgcolor: '#fff' } };
const headerCellSx = { bgcolor: '#f5f7fa', color: '#606266', fontWeight: 600, whiteSpace: 'nowrap' };
const bodyCellSx = { height: 48, color: '#606266', whiteSpace: 'nowrap' };
const actionHeaderCellSx = {
  ...headerCellSx,
  position: 'sticky' as const,
  right: 0,
  zIndex: 4,
  width: 128,
  minWidth: 128,
  maxWidth: 128,
  textAlign: 'center' as const,
  borderLeft: '1px solid #ebeef5',
  boxShadow: '-6px 0 10px rgba(31, 45, 61, 0.06)',
};
const actionBodyCellSx = {
  position: 'sticky' as const,
  right: 0,
  zIndex: 2,
  width: 128,
  minWidth: 128,
  maxWidth: 128,
  bgcolor: '#fff',
  textAlign: 'center' as const,
  borderLeft: '1px solid #ebeef5',
  boxShadow: '-6px 0 10px rgba(31, 45, 61, 0.06)',
};

const compactQuery = (query: RecordControlRequestQuery): RecordControlRequestQuery =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value !== '')) as RecordControlRequestQuery;

const formatTime = (value?: string | null) => value ? value.replace('T', ' ').slice(0, 19) : '—';

export default function RecordRequestListPage({ scope }: { scope: 'mine' | 'all' }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecordControlRequest[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<RecordControlRequestQuery>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<RecordControlRequestQuery>(EMPTY_FILTERS);

  useEffect(() => {
    let active = true;
    setBusy(true);
    setError('');
    listRecordControlRequests(scope, page, pageSize, compactQuery(filters)).then((result) => {
      if (!active) return;
      setItems(result.content);
      setTotal(result.totalElements);
      setTotalPages(result.totalPages);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : '申请列表加载失败');
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [filters, page, pageSize, scope]);

  const updateDraft = (key: keyof RecordControlRequestQuery, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const query = () => { setPage(0); setFilters({ ...draft }); };
  const reset = () => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setPage(0); };

  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
    <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', p: 2, flexShrink: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
        <TextField size="small" label="申请编号" value={draft.requestNo} onChange={(event) => updateDraft('requestNo', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') query(); }} sx={fieldSx} />
        <TextField select size="small" label="申请类型" value={draft.requestType} onChange={(event) => updateDraft('requestType', event.target.value)} sx={fieldSx}>
          <MenuItem value="">全部</MenuItem><MenuItem value="CHANGE">表单变更</MenuItem><MenuItem value="OBSOLETE">表单作废</MenuItem>
        </TextField>
        <TextField size="small" label="表单实例编号" value={draft.instanceNo} onChange={(event) => updateDraft('instanceNo', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') query(); }} sx={fieldSx} />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<RestartAlt />} onClick={reset} sx={{ height: 40 }}>重置</Button>
          <Button variant="contained" startIcon={<Search />} onClick={query} sx={{ height: 40 }}>查询</Button>
          <Button endIcon={<ExpandMore sx={{ transform: advancedFiltersOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />} onClick={() => setAdvancedFiltersOpen((open) => !open)} sx={{ height: 40 }}>{advancedFiltersOpen ? '收起' : '展开'}</Button>
        </Stack>
      </Box>
      <Collapse in={advancedFiltersOpen}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5, mt: 1.5 }}>
          <TextField size="small" label="表单名称" value={draft.templateName} onChange={(event) => updateDraft('templateName', event.target.value)} sx={fieldSx} />
          <TextField size="small" label="表单编码" value={draft.templateCode} onChange={(event) => updateDraft('templateCode', event.target.value)} sx={fieldSx} />
          <TextField size="small" label="申请人" value={draft.applicant} onChange={(event) => updateDraft('applicant', event.target.value)} sx={fieldSx} />
          <TextField select size="small" label="状态" value={draft.status} onChange={(event) => updateDraft('status', event.target.value)} sx={fieldSx}>
            <MenuItem value="">全部</MenuItem><MenuItem value="IN_REVIEW">审批中</MenuItem><MenuItem value="APPROVED">审批通过</MenuItem><MenuItem value="RETURNED">已退回</MenuItem><MenuItem value="WITHDRAWN">已撤回</MenuItem>
          </TextField>
          <TextField size="small" label="申请时间起" type="datetime-local" value={draft.submittedFrom} onChange={(event) => updateDraft('submittedFrom', event.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          <TextField size="small" label="申请时间止" type="datetime-local" value={draft.submittedTo} onChange={(event) => updateDraft('submittedTo', event.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
        </Box>
      </Collapse>
    </Box>

    <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, overflow: 'hidden' }}>
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table stickyHeader size="small" sx={{ minWidth: 1480 }}>
          <TableHead><TableRow>{['申请编号', '申请类型', '表单实例编号', '表单名称', '表单编码', '申请人', '申请时间', '状态', '操作'].map((column) => <TableCell key={column} sx={column === '操作' ? actionHeaderCellSx : headerCellSx}>{column}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {busy ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={9} sx={{ height: '100%', color: '#909399' }}>加载中...</TableStateCell></TableRow>
              : error ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={9} sx={{ height: '100%', color: '#c62828' }}>{error}</TableStateCell></TableRow>
                : !items.length ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={9} sx={{ height: '100%', color: '#909399' }}>暂无数据</TableStateCell></TableRow>
                  : items.map((item) => <TableRow hover key={item.id} sx={{ '& > .MuiTableCell-root': bodyCellSx }}>
                    <TableCell>{item.request_no}</TableCell>
                    <TableCell>{item.request_type === 'CHANGE' ? '表单变更' : '表单作废'}</TableCell>
                    <TableCell>{item.instance_no}</TableCell>
                    <TableCell>{item.template_name || '—'}</TableCell>
                    <TableCell>{item.template_code || '—'}</TableCell>
                    <TableCell>{item.applicant_name || item.applicant_id}</TableCell>
                    <TableCell>{formatTime(item.submitted_at)}</TableCell>
                    <TableCell><StatusBadge label={STATUS[item.status]?.label || item.status} color={STATUS[item.status]?.color || 'default'} /></TableCell>
                    <TableCell sx={actionBodyCellSx}><Button size="small" onClick={() => navigate(`/records/requests/${item.id}`)}>查看详情</Button></TableCell>
                  </TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25, borderTop: '1px solid #ebeef5', flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary">共 {total} 条数据</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Pagination page={page + 1} count={Math.max(totalPages, 1)} onChange={(_, nextPage) => setPage(nextPage - 1)} disabled={busy} size="small" color="primary" />
          <FormControl size="small"><Select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} sx={{ height: 36 }}>{PAGE_SIZE_OPTIONS.map((size) => <MenuItem key={size} value={size}>{size} 条/页</MenuItem>)}</Select></FormControl>
        </Stack>
      </Stack>
    </Box>
  </Box>;
}
