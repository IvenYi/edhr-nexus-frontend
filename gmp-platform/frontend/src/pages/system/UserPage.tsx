import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, Snackbar, Alert, CircularProgress, Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser } from '@/api/identity';
import { USER_STATUS_MAP } from '@/utils/constants';
import type { PageResult } from '@/types/common';

interface User {
  id: number;
  username: string;
  name: string;
  status: string;
}

export default function UserPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', name: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const res = await getUsers({ page, size: 10 });
      return res.data.data as PageResult<User>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: typeof form) =>
      editingId ? updateUser(editingId, body) : createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpen(false); setEditingId(null); setForm({ username: '', name: '' });
      setSnackbar({ open: true, message: editingId ? '更新成功' : '创建成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '操作失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
  });

  const handleEdit = (item: User) => {
    setEditingId(item.id); setForm({ username: item.username, name: item.name }); setOpen(true);
  };

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">用户管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingId(null); setForm({ username: '', name: '' }); setOpen(true); }}>新增用户</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>用户名</TableCell><TableCell>姓名</TableCell><TableCell>状态</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            : isError ? <TableRow><TableCell colSpan={5} align="center">加载失败</TableCell></TableRow>
            : content.length === 0 ? <TableRow><TableCell colSpan={5} align="center">暂无数据</TableCell></TableRow>
            : content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell><TableCell>{item.username}</TableCell><TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip size="small" label={USER_STATUS_MAP[item.status as keyof typeof USER_STATUS_MAP]?.label || item.status}
                    color={USER_STATUS_MAP[item.status as keyof typeof USER_STATUS_MAP]?.color || 'default'} />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(item)}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteConfirm(item.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPages > 1 && <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}><Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} /></Box>}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '编辑用户' : '新增用户'}</DialogTitle>
        <DialogContent>
          <TextField label="用户名" fullWidth margin="normal" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <TextField label="姓名" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={!form.username || !form.name || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle><DialogContent>确定要删除该用户吗？</DialogContent>
        <DialogActions><Button onClick={() => setDeleteConfirm(null)}>取消</Button><Button color="error" variant="contained" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }}>删除</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
