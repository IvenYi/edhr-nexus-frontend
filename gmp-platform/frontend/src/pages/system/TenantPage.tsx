import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getTenants, createTenant, updateTenant, deleteTenant } from '@/api/identity';
import StatusBadge from '@/components/StatusBadge';
import type { PageResult } from '@/types/common';

interface Tenant {
  id: number;
  code: string;
  name: string;
  status: string;
}

const STATUS_MAP: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  ACTIVE: { label: '正常', color: 'success' },
  DISABLED: { label: '已禁用', color: 'error' },
};

export default function TenantPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: '', name: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants', page],
    queryFn: async () => {
      const res = await getTenants({ page, size: 10 });
      return res.data.data as PageResult<Tenant>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: typeof form) =>
      editingId ? updateTenant(editingId, body) : createTenant(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setOpen(false); setEditingId(null); setForm({ code: '', name: '' });
      setSnackbar({ open: true, message: editingId ? '更新成功' : '创建成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '操作失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
  });

  const handleEdit = (item: Tenant) => {
    setEditingId(item.id);
    setForm({ code: item.code, name: item.name });
    setOpen(true);
  };

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">租户设置</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingId(null); setForm({ code: '', name: '' }); setOpen(true); }}>新增租户</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>编码</TableCell><TableCell>名称</TableCell><TableCell>状态</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            : isError ? <TableRow><TableCell colSpan={5} align="center">加载失败</TableCell></TableRow>
            : content.length === 0 ? <TableRow><TableCell colSpan={5} align="center">暂无数据</TableCell></TableRow>
            : content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell><TableCell>{item.code}</TableCell><TableCell>{item.name}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={STATUS_MAP[item.status]?.label || item.status}
                    color={STATUS_MAP[item.status]?.color || 'default'}
                  />
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
        <DialogTitle>{editingId ? '编辑租户' : '新增租户'}</DialogTitle>
        <DialogContent>
          <TextField label="编码" fullWidth margin="normal" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <TextField label="名称" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={!form.code || !form.name || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle><DialogContent>确定要删除该租户吗？</DialogContent>
        <DialogActions><Button onClick={() => setDeleteConfirm(null)}>取消</Button><Button color="error" variant="contained" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }}>删除</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
