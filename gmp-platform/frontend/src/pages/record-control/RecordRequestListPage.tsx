import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';
import { listRecordControlRequests, type RecordControlRequest } from '@/api/record-control';

const STATUS: Record<string, { text: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
  IN_REVIEW: { text: '审批中', color: 'warning' }, APPROVED: { text: '审批通过', color: 'success' },
  RETURNED: { text: '已退回', color: 'error' }, WITHDRAWN: { text: '已撤回', color: 'default' },
};

export default function RecordRequestListPage({ scope }: { scope: 'mine' | 'all' }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecordControlRequest[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const title = scope === 'mine' ? '我的变更' : '变更记录';

  useEffect(() => {
    let active = true;
    setBusy(true); setError('');
    listRecordControlRequests(scope, page, 20).then((result) => {
      if (active) { setItems(result.content); setTotal(result.totalElements); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '申请列表加载失败'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [scope, page]);

  return <Box>
    <PageHeader title={title} subtitle={scope === 'mine' ? '仅显示当前登录人发起的申请' : '当前租户的表单变更与作废历史'}
      breadcrumbs={[{ label: '记录' }, { label: '变更管理' }, { label: title }]}
      actions={<Button variant="contained" onClick={() => navigate('/records/change')}>发起申请</Button>} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Paper variant="outlined">
      <TableContainer><Table size="small"><TableHead><TableRow>
        {['申请编号', '申请类型', '表单流水号', '申请人', '提交时间', '状态', '操作'].map((column) =>
          <TableCell key={column} sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>{column}</TableCell>)}
      </TableRow></TableHead><TableBody>
        {items.map((item) => <TableRow hover key={item.id}>
          <TableCell>{item.request_no}</TableCell>
          <TableCell>{item.request_type === 'CHANGE' ? '表单变更' : '表单作废'}</TableCell>
          <TableCell>{item.instance_no}</TableCell>
          <TableCell>{item.applicant_name || item.applicant_id}</TableCell>
          <TableCell>{item.submitted_at?.replace('T', ' ') || '—'}</TableCell>
          <TableCell><Chip size="small" color={STATUS[item.status]?.color || 'default'} label={STATUS[item.status]?.text || item.status} /></TableCell>
          <TableCell><Button size="small" onClick={() => navigate(`/records/requests/${item.id}`)}>查看详情</Button></TableCell>
        </TableRow>)}
        {!busy && !items.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>
          <Typography color="text.secondary">暂无申请记录</Typography>
        </TableCell></TableRow>}
      </TableBody></Table></TableContainer>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1} sx={{ p: 1.5 }}>
        {busy && <CircularProgress size={18} />}
        <Typography variant="body2" color="text.secondary">共 {total} 条 · 第 {page + 1} 页</Typography>
        <Button size="small" disabled={page === 0 || busy} onClick={() => setPage((current) => current - 1)}>上一页</Button>
        <Button size="small" disabled={(page + 1) * 20 >= total || busy} onClick={() => setPage((current) => current + 1)}>下一页</Button>
      </Stack>
    </Paper>
  </Box>;
}
