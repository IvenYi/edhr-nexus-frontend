import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Stack, Tab, Table, TableBody, TableCell,
  TableHead, TableRow, Tabs, Tooltip, Typography } from '@mui/material';
import { RateReviewOutlined, VisibilityOutlined } from '@mui/icons-material';
import { ListTableShell } from '@/components/ListTableShell';
import { listTableBodyCellSx, listTableHeaderCellSx, listTableStickyActionSx } from '@/components/listTableStyles';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import { getRequestsForMyWorkflowTasks, listMyWorkflowTasks,
  type RecordControlRequest, type RecordControlWorkflowTask } from '@/api/record-control';

const headerCellSx = listTableHeaderCellSx;
const ACTION_WIDTH = 96;
const actionHeaderCellSx = { ...headerCellSx, ...listTableStickyActionSx(ACTION_WIDTH, 'head'), textAlign: 'center' as const };
const actionBodyCellSx = { ...listTableStickyActionSx(ACTION_WIDTH, 'body'), textAlign: 'center' as const };

export default function RecordApprovalPage() {
  const navigate = useNavigate();
  const [scope, setScope] = useState<'todo' | 'done'>('todo');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Array<{ task: RecordControlWorkflowTask; request: RecordControlRequest }>>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setBusy(true); setError('');
    listMyWorkflowTasks(scope, page, 50).then(async (result) => {
      const tasks = result.content;
      const requests = await getRequestsForMyWorkflowTasks([...new Set(tasks.map((task) => task.instanceId))]);
      if (!active) return;
      const byInstance = new Map(requests.map((request) => [request.workflow_instance_id, request]));
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setRows(tasks.flatMap((task) => {
        const request = byInstance.get(task.instanceId);
        return request ? [{ task, request }] : [];
      }));
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '审批任务加载失败'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [scope, page]);

  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, overflow: 'hidden' }}>
      <Tabs value={scope} onChange={(_, value: 'todo' | 'done') => { setScope(value); setPage(0); }} sx={{ px: 2, borderBottom: '1px solid #ebeef5', flexShrink: 0 }}>
        <Tab value="todo" label="待办任务" /><Tab value="done" label="已办任务" />
      </Tabs>
      <ListTableShell sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}><Table stickyHeader size="small" sx={{ minWidth: 1540 }}><TableHead><TableRow>
        {['任务编号', '申请编号', '申请类型', '表单实例编号', '表单名称', '表单编码', '申请人', '任务时间', '状态', '操作'].map((column) =>
          <TableCell key={column} sx={column === '操作' ? actionHeaderCellSx : headerCellSx}>{column}</TableCell>)}
      </TableRow></TableHead><TableBody>
        {busy ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={10} sx={{ height: '100%', color: '#909399' }}>加载中...</TableStateCell></TableRow>
          : error ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={10} sx={{ height: '100%', color: '#c62828' }}>{error}</TableStateCell></TableRow>
            : rows.map(({ task, request }) => <TableRow hover key={task.id} sx={{ '& > .MuiTableCell-root': { ...listTableBodyCellSx, whiteSpace: 'nowrap' } }}>
          <TableCell>{task.id}</TableCell><TableCell>{request.request_no}</TableCell>
          <TableCell>{request.request_type === 'CHANGE' ? '表单变更' : '表单作废'}</TableCell>
          <TableCell>{request.instance_no}</TableCell>
          <TableCell>{request.template_name || '—'}</TableCell>
          <TableCell>{request.template_code || '—'}</TableCell>
          <TableCell>{request.applicant_name || request.applicant_id}</TableCell>
          <TableCell>{(scope === 'done' ? task.completedAt : task.createdAt)?.replace('T', ' ').slice(0, 19) || '—'}</TableCell>
          <TableCell><StatusBadge label={scope === 'todo' ? '待处理' : '已处理'} color={scope === 'todo' ? 'warning' : 'success'} /></TableCell>
          <TableCell align="center" sx={actionBodyCellSx}>
            <Tooltip title="查看申请" arrow><IconButton size="small" aria-label="查看申请" onClick={() => navigate(`/records/requests/${request.id}`)}><VisibilityOutlined fontSize="small" /></IconButton></Tooltip>
            {scope === 'todo' && <Tooltip title="审批处理" arrow><IconButton size="small" aria-label="审批处理" onClick={() => navigate(`/records/approvals/${task.id}/${request.id}`)}><RateReviewOutlined fontSize="small" /></IconButton></Tooltip>}
          </TableCell>
        </TableRow>)}
        {!busy && !error && !rows.length && <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={10} sx={{ height: '100%', color: '#909399' }}>暂无关联的{scope === 'todo' ? '待办' : '已办'}任务</TableStateCell></TableRow>}
      </TableBody></Table></ListTableShell>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ px: 2, py: 1.25, borderTop: '1px solid #ebeef5', flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary">共 {totalElements} 条数据</Typography>
        <Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2" color="text.secondary">第 {page + 1} 页</Typography>
        <Button size="small" disabled={page <= 0 || busy} onClick={() => setPage((current) => current - 1)}>上一页</Button>
        <Button size="small" disabled={page + 1 >= totalPages || busy} onClick={() => setPage((current) => current + 1)}>下一页</Button>
        </Stack>
      </Stack>
    </Box>
  </Box>;
}
