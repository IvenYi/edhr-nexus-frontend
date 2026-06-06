import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, Snackbar, Alert, CircularProgress, Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getFormTemplates, createFormTemplate, updateFormTemplate, deleteFormTemplate } from '@/api/form-templates';
import { WORKFLOW_STATUS_MAP } from '@/utils/constants';
import type { PageResult } from '@/types/common';

interface FormTemplate {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
  description: string;
}

export default function FormTemplatePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: '', name: '', type: '', description: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['form-templates', page],
    queryFn: async () => {
      const res = await getFormTemplates({ page, size: 10 });
      return res.data.data as PageResult<FormTemplate>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: typeof form) =>
      editingId ? updateFormTemplate(editingId, body) : createFormTemplate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
      setOpen(false); setEditingId(null); setForm({ code: '', name: '', type: '', description: '' });
      setSnackbar({ open: true, message: editingId ? '更新成功' : '创建成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '操作失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFormTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
  });

  const handleEdit = (item: FormTemplate) => {
    setEditingId(item.id);
    setForm({ code: item.code, name: item.name, type: item.type, description: item.description || '' });
    setOpen(true);
  };

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">表单模板</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingId(null); setForm({ code: '', name: '', type: '', description: '' }); setOpen(true); }}>新增模板</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>编码</TableCell><TableCell>名称</TableCell><TableCell>类型</TableCell><TableCell>状态</TableCell><TableCell>描述</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            : isError ? <TableRow><TableCell colSpan={7} align="center">加载失败</TableCell></TableRow>
            : content.length === 0 ? <TableRow><TableCell colSpan={7} align="center">暂无数据</TableCell></TableRow>
            : content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell><TableCell>{item.code}</TableCell><TableCell>{item.name}</TableCell><TableCell>{item.type}</TableCell>
                <TableCell>
                  <Chip size="small" label={WORKFLOW_STATUS_MAP[item.status as keyof typeof WORKFLOW_STATUS_MAP]?.label || item.status}
                    color={WORKFLOW_STATUS_MAP[item.status as keyof typeof WORKFLOW_STATUS_MAP]?.color || 'default'} />
                </TableCell>
                <TableCell>{item.description}</TableCell>
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
        <DialogTitle>{editingId ? '编辑表单模板' : '新增表单模板'}</DialogTitle>
        <DialogContent>
          <TextField label="编码" fullWidth margin="normal" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <TextField label="名称" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="类型" fullWidth margin="normal" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <TextField label="描述" fullWidth margin="normal" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={!form.code || !form.name || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle><DialogContent>确定要删除该表单模板吗？</DialogContent>
        <DialogActions><Button onClick={() => setDeleteConfirm(null)}>取消</Button><Button color="error" variant="contained" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }}>删除</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
