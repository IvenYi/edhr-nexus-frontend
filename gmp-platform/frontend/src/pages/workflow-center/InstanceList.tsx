import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, CircularProgress, IconButton, InputAdornment, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import Clear from '@mui/icons-material/Clear';
import { ListTableShell } from '@/components/ListTableShell';
import TableStateCell from '@/components/TableStateCell';
import DetailDrawer from '@/components/DetailDrawer';
import StatusBadge from '@/components/StatusBadge';
import { listWorkflowOperations } from '@/api/workflow-operations';
import { INSTANCE_STATUS_MAP } from '@/utils/constants';
import WorkflowInstancePanel from './WorkflowInstancePanel';

export default function InstanceList({ intervention = false }: { intervention?: boolean }) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const size = [10, 20, 50].includes(Number(params.get('size'))) ? Number(params.get('size')) : 20;
  const keyword = params.get('keyword') || '';
  const status = params.get('status') || '';
  const [input, setInput] = useState(keyword);
  const [statusInput, setStatusInput] = useState(status);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
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
      <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid #e4e7ed' }}><Typography variant="body2" color="text.secondary">{intervention ? '查看当前任务并重新分配处理人' : '查看流程进度与只读处理记录'}</Typography></Box>
      <ListTableShell minTableWidth={980} sx={{ flex: 1, minHeight: 200 }}>{tableWidth => <Table stickyHeader sx={{ tableLayout: 'fixed', width: tableWidth }}>
        <TableHead><TableRow><TableCell sx={{ width: '22%' }}>流程名称</TableCell><TableCell sx={{ width: '22%' }}>业务编号</TableCell><TableCell sx={{ width: 100 }}>状态</TableCell><TableCell sx={{ width: 120 }}>发起人</TableCell><TableCell sx={{ width: 180 }}>开始时间</TableCell><TableCell sx={{ width: 180 }}>结束时间</TableCell></TableRow></TableHead>
        <TableBody>{query.isLoading ? <TableRow><TableStateCell colSpan={6}><CircularProgress size={24} /></TableStateCell></TableRow>
          : query.isError ? <TableRow><TableStateCell colSpan={6}>加载失败 <Button onClick={() => void query.refetch()}>重试</Button></TableStateCell></TableRow>
          : !query.data?.content.length ? <TableRow><TableStateCell colSpan={6}>暂无数据</TableStateCell></TableRow>
          : query.data.content.map(item => { const state = INSTANCE_STATUS_MAP[item.status as keyof typeof INSTANCE_STATUS_MAP]; return <TableRow key={item.id} hover tabIndex={0} onClick={() => open(item.id)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(item.id); } }} sx={{ cursor: 'pointer', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 } }}>
            <TableCell title={item.templateName} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.templateName || '未命名流程'}</TableCell><TableCell title={item.businessKey} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.businessKey || item.id}</TableCell>
            <TableCell><StatusBadge label={state?.label || '已撤回'} color={state?.color || 'default'} /></TableCell><TableCell>{item.startUserName}</TableCell><TableCell>{item.startTime?.replace('T', ' ').slice(0, 19)}</TableCell><TableCell>{item.endTime?.replace('T', ' ').slice(0, 19) || '-'}</TableCell>
          </TableRow>; })}</TableBody>
      </Table>}</ListTableShell>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 56, px: 2, borderTop: '1px solid #e4e7ed' }}>
        <Typography variant="body2" color="text.secondary">共 {query.data?.totalElements ?? 0} 条数据</Typography>
        <Stack direction="row" spacing={1} alignItems="center"><Pagination size="small" page={page} count={Math.max(1, query.data?.totalPages ?? 1)} onChange={(_, next) => commit({ page: String(next) })}
          getItemAriaLabel={(type, number) => type === 'page' ? `第${number}页` : ({ first: '第一页', last: '最后一页', previous: '上一页', next: '下一页', 'start-ellipsis': '更多页码', 'end-ellipsis': '更多页码' }[type])} />
          <TextField select size="small" value={size} inputProps={{ 'aria-label': '每页条数' }} onChange={event => commit({ size: event.target.value, page: '1' })}>{[10, 20, 50].map(value => <MenuItem key={value} value={value}>{value} 条／页</MenuItem>)}</TextField>
        </Stack>
      </Stack>
    </Paper>
    <DetailDrawer open={Boolean(selected)} label={intervention ? '流程干预详情' : '流程日志详情'} onClose={() => setSelected(null)} tab={tab} onTabChange={setTab}>
      {selected && <WorkflowInstancePanel key={selected} id={selected} audit={tab === 1} intervention={intervention} />}
    </DetailDrawer>
  </Box>;
}
