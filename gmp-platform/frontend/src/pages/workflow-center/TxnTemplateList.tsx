import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Add } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Pagination,
} from '@mui/material';
import client from '@/api/client';
import { WORKFLOW_STATUS_MAP } from '@/utils/constants';
import type { PageResult } from '@/types/common';

export default function TxnTemplateList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['txn-templates', page],
    queryFn: async () => {
      const res = await client.get('/workflow/transaction-templates', { params: { page, size: 10 } });
      return res.data.data as PageResult<{ id: number; name: string; status: string; description: string; createdAt: string }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description: string }) =>
      client.post('/workflow/transaction-templates', { ...body, type: 'TRANSACTION' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['txn-templates'] }); setOpen(false); },
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">事务流程模板</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>创建模板</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell><TableCell>名称</TableCell><TableCell>描述</TableCell>
              <TableCell>状态</TableCell><TableCell>创建时间</TableCell><TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6}>加载中...</TableCell></TableRow> :
              data?.content?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.id}</TableCell><TableCell>{t.name}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell><Chip size="small" label={WORKFLOW_STATUS_MAP[t.status as keyof typeof WORKFLOW_STATUS_MAP]?.label || t.status} color={WORKFLOW_STATUS_MAP[t.status as keyof typeof WORKFLOW_STATUS_MAP]?.color || 'default'} /></TableCell>
                  <TableCell>{t.createdAt}</TableCell>
                  <TableCell><Button size="small" onClick={() => navigate(`/workflow/txn-templates/${t.id}`)}>编辑</Button></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建事务流程模板</DialogTitle>
        <DialogContent>
          <TextField label="模板名称" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="描述" fullWidth margin="normal" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>取消</Button><Button variant="contained" onClick={() => createMutation.mutate(form)}>创建</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
