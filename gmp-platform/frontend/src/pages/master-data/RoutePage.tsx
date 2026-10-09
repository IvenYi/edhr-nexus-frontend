import TableStateCell from '@/components/TableStateCell';
import {
  useQuery,
  useMutation,
  useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import AppDialog from '@/components/AppDialog';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import FormDialogFieldGrid from '@/components/FormDialogFieldGrid';
import { ListTableShell } from '@/components/ListTableShell';
import { listTableStickyActionSx } from '@/components/listTableStyles';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '@/api/master-data';
import type { PageResult } from '@/types/common';

interface Route {
  id: number;
  code: string;
  name: string;
  description: string;
}

export default function RoutePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['routes', page],
    queryFn: async () => {
      const res = await getRoutes({ page, size: 10 });
      return res.data.data as PageResult<Route>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: typeof form) =>
      editingId ? updateRoute(editingId, body) : createRoute(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setOpen(false); setEditingId(null); setForm({ code: '', name: '', description: '' });
      setSnackbar({ open: true, message: editingId ? '更新成功' : '创建成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '操作失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
  });

  const handleEdit = (item: Route) => {
    setEditingId(item.id);
    setForm({ code: item.code, name: item.name, description: item.description || '' });
    setOpen(true);
  };
  const handleAdd = () => { setEditingId(null); setForm({ code: '', name: '', description: '' }); setOpen(true); };

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">工艺路线管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>新增路线</Button>
      </Box>
      <ListTableShell>
        <Table>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>编码</TableCell><TableCell>名称</TableCell><TableCell>描述</TableCell><TableCell align="center" sx={listTableStickyActionSx(96, 'head')}>操作</TableCell></TableRow></TableHead>
          <TableBody>
            {isLoading ? <TableRow><TableStateCell colSpan={5} align="center"><CircularProgress size={24} /></TableStateCell></TableRow>
            : isError ? <TableRow><TableStateCell colSpan={5} align="center">加载失败</TableStateCell></TableRow>
            : content.length === 0 ? <TableRow><TableStateCell colSpan={5} align="center">暂无数据</TableStateCell></TableRow>
            : content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell><TableCell>{item.code}</TableCell><TableCell>{item.name}</TableCell><TableCell>{item.description}</TableCell>
                <TableCell align="center" sx={listTableStickyActionSx(96, 'body')}>
                  <Tooltip title="编辑"><IconButton size="small" aria-label="编辑" onClick={() => handleEdit(item)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="删除"><IconButton size="small" color="error" aria-label="删除" onClick={() => setDeleteConfirm(item.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListTableShell>
      {data && data.totalPages > 1 && <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}><Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} /></Box>}
      <FormDialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '编辑路线' : '新增路线'}</DialogTitle>
        <DialogContent dividers><FormDialogSection title="基本信息"><FormDialogFieldGrid>
          <TextField size="small" label="编码" fullWidth value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <TextField size="small" label="名称" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField size="small" label="描述" fullWidth multiline rows={3} sx={{ gridColumn: '1 / -1' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormDialogFieldGrid></FormDialogSection>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={!form.code || !form.name || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </FormDialog>
      <AppDialog deletionTarget={deleteConfirm !== null ? { type: 'route', id: deleteConfirm } : null} open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle><DialogContent>确定要删除该工艺路线吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>取消</Button>
          <Button color="error" variant="contained" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }}>删除</Button>
        </DialogActions>
      </AppDialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
