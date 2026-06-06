import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getNumberingRules, createNumberingRule, updateNumberingRule, deleteNumberingRule } from '@/api/numbering';
import type { PageResult } from '@/types/common';

interface NumberingRule {
  id: number;
  code: string;
  name: string;
  prefix: string;
  pattern: string;
  description: string;
}

export default function NumberingRulePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: '', name: '', prefix: '', pattern: '', description: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['numbering-rules', page],
    queryFn: async () => {
      const res = await getNumberingRules({ page, size: 10 });
      return res.data.data as PageResult<NumberingRule>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: typeof form) =>
      editingId ? updateNumberingRule(editingId, body) : createNumberingRule(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numbering-rules'] });
      setOpen(false); setEditingId(null); setForm({ code: '', name: '', prefix: '', pattern: '', description: '' });
      setSnackbar({ open: true, message: editingId ? '更新成功' : '创建成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '操作失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNumberingRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numbering-rules'] });
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
  });

  const handleEdit = (item: NumberingRule) => {
    setEditingId(item.id);
    setForm({ code: item.code, name: item.name, prefix: item.prefix, pattern: item.pattern, description: item.description || '' });
    setOpen(true);
  };

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">编码规则</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingId(null); setForm({ code: '', name: '', prefix: '', pattern: '', description: '' }); setOpen(true); }}>新增规则</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>编码</TableCell><TableCell>名称</TableCell><TableCell>前缀</TableCell><TableCell>格式</TableCell><TableCell>描述</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            : isError ? <TableRow><TableCell colSpan={7} align="center">加载失败</TableCell></TableRow>
            : content.length === 0 ? <TableRow><TableCell colSpan={7} align="center">暂无数据</TableCell></TableRow>
            : content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell><TableCell>{item.code}</TableCell><TableCell>{item.name}</TableCell>
                <TableCell>{item.prefix}</TableCell><TableCell>{item.pattern}</TableCell><TableCell>{item.description}</TableCell>
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
        <DialogTitle>{editingId ? '编辑编码规则' : '新增编码规则'}</DialogTitle>
        <DialogContent>
          <TextField label="编码" fullWidth margin="normal" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <TextField label="名称" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="前缀" fullWidth margin="normal" value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} />
          <TextField label="格式" fullWidth margin="normal" value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
          <TextField label="描述" fullWidth margin="normal" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={!form.code || !form.name || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle><DialogContent>确定要删除该编码规则吗？</DialogContent>
        <DialogActions><Button onClick={() => setDeleteConfirm(null)}>取消</Button><Button color="error" variant="contained" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }}>删除</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
