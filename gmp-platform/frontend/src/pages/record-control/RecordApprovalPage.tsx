import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';
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

  return <Box>
    <PageHeader title="变更审批" subtitle="仅显示当前登录人可处理及本人已处理的表单变更、作废任务"
      breadcrumbs={[{ label: '记录' }, { label: '变更管理' }, { label: '变更审批' }]} />
    <Alert severity="info" sx={{ mb: 2 }}>审批动作由公共流程运行时负责；当前页面只展示与本人任务关联的申请，处理入口将在公共流程终态和签名接口完成对接后启用。</Alert>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Paper variant="outlined">
      <Tabs value={scope} onChange={(_, value: 'todo' | 'done') => { setScope(value); setPage(1); }} sx={{ px: 2 }}>
        <Tab value="todo" label="待办任务" /><Tab value="done" label="已办任务" />
      </Tabs>
      <TableContainer><Table size="small"><TableHead><TableRow>
        {['任务编号', '申请编号', '申请类型', '表单流水号', '申请人', '任务时间', '状态', '操作'].map((column) =>
          <TableCell key={column} sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>{column}</TableCell>)}
      </TableRow></TableHead><TableBody>
        {rows.map(({ task, request }) => <TableRow hover key={task.id}>
          <TableCell>{task.id}</TableCell><TableCell>{request.request_no}</TableCell>
          <TableCell>{request.request_type === 'CHANGE' ? '表单变更' : '表单作废'}</TableCell>
          <TableCell>{request.instance_no}</TableCell>
          <TableCell>{request.applicant_name || request.applicant_id}</TableCell>
          <TableCell>{(scope === 'done' ? task.completedAt : task.createdAt)?.replace('T', ' ') || '—'}</TableCell>
          <TableCell>{scope === 'todo' ? '待处理' : '已处理'}</TableCell>
          <TableCell><Button size="small" onClick={() => navigate(`/records/requests/${request.id}`)}>查看申请</Button></TableCell>
        </TableRow>)}
        {!busy && !rows.length && <TableRow><TableCell colSpan={8} sx={{ py: 6 }} align="center">
          <Typography color="text.secondary">暂无关联的{scope === 'todo' ? '待办' : '已办'}任务</Typography>
        </TableCell></TableRow>}
      </TableBody></Table></TableContainer>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1} sx={{ p: 1.5 }}>
        {busy && <CircularProgress size={18} />}
        <Typography variant="body2" color="text.secondary">第 {page} 页</Typography>
        <Button size="small" disabled={page <= 1 || busy} onClick={() => setPage((current) => current - 1)}>上一页</Button>
        <Button size="small" disabled={taskCount < 50 || busy} onClick={() => setPage((current) => current + 1)}>下一页</Button>
      </Stack>
    </Paper>
  </Box>;
}
