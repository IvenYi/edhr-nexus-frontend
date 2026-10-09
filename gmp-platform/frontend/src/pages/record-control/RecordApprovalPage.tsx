import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Typography } from '@mui/material';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import { getRequestsForMyWorkflowTasks, listMyWorkflowTasks,
  type RecordControlRequest, type RecordControlWorkflowTask } from '@/api/record-control';

export default function RecordApprovalPage() {
  const navigate = useNavigate();
  const [scope, setScope] = useState<'todo' | 'done'>('todo');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Array<{ task: RecordControlWorkflowTask; request: RecordControlRequest }>>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setBusy(true); setError('');
    listMyWorkflowTasks(scope, page, 50).then(async (tasks) => {
      const requests = await getRequestsForMyWorkflowTasks([...new Set(tasks.map((task) => task.instanceId))]);
      if (!active) return;
      const byInstance = new Map(requests.map((request) => [request.workflow_instance_id, request]));
      setTaskCount(tasks.length);
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
      <Tabs value={scope} onChange={(_, value: 'todo' | 'done') => { setScope(value); setPage(1); }} sx={{ px: 2, borderBottom: '1px solid #ebeef5', flexShrink: 0 }}>
        <Tab value="todo" label="待办任务" /><Tab value="done" label="已办任务" />
      </Tabs>
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}><Table stickyHeader size="small" sx={{ minWidth: 1540 }}><TableHead><TableRow>
        {['任务编号', '申请编号', '申请类型', '表单实例编号', '表单名称', '表单编码', '申请人', '任务时间', '状态', '操作'].map((column) =>
          <TableCell key={column} sx={{ fontWeight: 600, bgcolor: '#f5f7fa', color: '#606266', whiteSpace: 'nowrap' }}>{column}</TableCell>)}
      </TableRow></TableHead><TableBody>
        {busy ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={10} sx={{ height: '100%', color: '#909399' }}>加载中...</TableStateCell></TableRow>
          : error ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={10} sx={{ height: '100%', color: '#c62828' }}>{error}</TableStateCell></TableRow>
            : rows.map(({ task, request }) => <TableRow hover key={task.id} sx={{ '& > .MuiTableCell-root': { height: 48, color: '#606266', whiteSpace: 'nowrap' } }}>
          <TableCell>{task.id}</TableCell><TableCell>{request.request_no}</TableCell>
          <TableCell>{request.request_type === 'CHANGE' ? '表单变更' : '表单作废'}</TableCell>
          <TableCell>{request.instance_no}</TableCell>
          <TableCell>{request.template_name || '—'}</TableCell>
          <TableCell>{request.template_code || '—'}</TableCell>
          <TableCell>{request.applicant_name || request.applicant_id}</TableCell>
          <TableCell>{(scope === 'done' ? task.completedAt : task.createdAt)?.replace('T', ' ').slice(0, 19) || '—'}</TableCell>
          <TableCell><StatusBadge label={scope === 'todo' ? '待处理' : '已处理'} color={scope === 'todo' ? 'warning' : 'success'} /></TableCell>
          <TableCell><Button size="small" onClick={() => navigate(`/records/requests/${request.id}`)}>查看申请</Button></TableCell>
        </TableRow>)}
        {!busy && !error && !rows.length && <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={10} sx={{ height: '100%', color: '#909399' }}>暂无关联的{scope === 'todo' ? '待办' : '已办'}任务</TableStateCell></TableRow>}
      </TableBody></Table></TableContainer>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ px: 2, py: 1.25, borderTop: '1px solid #ebeef5', flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary">本页 {rows.length} 条数据</Typography>
        <Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2" color="text.secondary">第 {page} 页</Typography>
        <Button size="small" disabled={page <= 1 || busy} onClick={() => setPage((current) => current - 1)}>上一页</Button>
        <Button size="small" disabled={taskCount < 50 || busy} onClick={() => setPage((current) => current + 1)}>下一页</Button>
        </Stack>
      </Stack>
    </Box>
  </Box>;
}
