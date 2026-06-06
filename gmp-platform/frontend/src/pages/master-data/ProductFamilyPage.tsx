import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, CircularProgress, Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import client from '@/api/client';
import type { PageResult } from '@/types/common';

interface Item {
  id: number;
  code: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Item>>({code: "", name: "", description: ""});
  const [editing, setEditing] = useState<Item | null>(null);

  const apiBase = '/master-data/product-families';

  const { data, isLoading, error } = useQuery({
    queryKey: ['master-data-product-families', page],
    queryFn: async () => {
      const res = await client.get(apiBase, { params: { page, size: 20 } });
      return res.data.data as PageResult<Item>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Item>) => client.post(apiBase, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['master-data-product-families'] }); setOpen(false); setForm({code: "", name: "", description: ""}); setEditing(null); },
  });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Item>) => client.put(`${apiBase}/${editing?.id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['master-data-product-families'] }); setOpen(false); setForm({code: "", name: "", description: ""}); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.delete(`${apiBase}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['master-data-product-families'] }),
  });

  const handleSubmit = () => {
    const body = {code: form.code, name: form.name, description: form.description};
    if (editing) updateMutation.mutate(body);
    else createMutation.mutate(body);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">产品家族管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setForm({code: "", name: "", description: ""}); setOpen(true); }}>新增</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>编码</TableCell>
            <TableCell>名称</TableCell>
            <TableCell>描述</TableCell>
            <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : !data?.content?.length ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无数据</TableCell></TableRow>
            ) : (
              data.content.map((item) => (
                <TableRow key={item.id} hover>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.code || "-"}</TableCell>
                <TableCell>{item.name || "-"}</TableCell>
                <TableCell>{item.description || "-"}</TableCell>
                <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "-"}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setEditing(item); setForm(item); setOpen(true); }}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => { if (window.confirm('确定删除？')) deleteMutation.mutate(item.id); }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? '编辑' : '新增'}产品家族管理</DialogTitle>
        <DialogContent>
<TextField label="ID" fullWidth margin="dense" value={form.id || ""} disabled />
          <TextField label="编码" fullWidth margin="dense"
            value={form.code || ""} onChange={e => setForm(prev => ({...prev, code: e.target.value}))} />
          <TextField label="名称" fullWidth margin="dense"
            value={form.name || ""} onChange={e => setForm(prev => ({...prev, name: e.target.value}))} />
          <TextField label="描述" fullWidth margin="dense" multiline rows={3}
            value={form.description || ""} onChange={e => setForm(prev => ({...prev, description: e.target.value}))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
