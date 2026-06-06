import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, CircularProgress, List, ListItem,
  ListItemText, Collapse, Chip,
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/api/identity';

interface Department {
  id: number;
  code: string;
  name: string;
  parentId?: number;
  children?: Department[];
}

function flattenDepts(depts: Department[], depth = 0): { node: Department; depth: number }[] {
  const result: { node: Department; depth: number }[] = [];
  for (const d of depts) {
    result.push({ node: d, depth });
    if (d.children) result.push(...flattenDepts(d.children, depth + 1));
  }
  return result;
}

export default function OrganizationPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: '', name: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['departments-tree'],
    queryFn: async () => {
      const res = await getDepartments({});
      const body = res.data.data as { content: Department[] } | Department[];
      return Array.isArray(body) ? body : body.content ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: { code: string; name: string; parentId?: number | null }) =>
      editingId ? updateDepartment(editingId, body) : createDepartment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      setDialogOpen(false); setEditingId(null); setForm({ code: '', name: '' });
      setSnackbar({ open: true, message: editingId ? '更新成功' : '创建成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '操作失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
  });

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const handleAddChild = (pid: number) => {
    setEditingId(null);
    setParentId(pid);
    setForm({ code: '', name: '' });
    setDialogOpen(true);
  };

  const handleEdit = (item: Department) => {
    setEditingId(item.id);
    setParentId(item.parentId ?? null);
    setForm({ code: item.code, name: item.name });
    setDialogOpen(true);
  };

  const depts = data ?? [];
  const flatDepts = flattenDepts(depts);

  const renderNode = (node: Department, depth: number) => {
    const hasChildren = node.children && node.children.length > 0;
    return (
      <Box key={node.id}>
        <ListItem
          sx={{ pl: 2 + depth * 4, bgcolor: depth === 0 ? 'primary.light' : 'transparent', borderRadius: 1, mb: 0.5 }}
          secondaryAction={
            <Box>
              <Button size="small" variant="outlined" sx={{ mr: 0.5 }} onClick={() => handleAddChild(node.id)}>
                新增子级
              </Button>
              <IconButton size="small" onClick={() => handleEdit(node)}><Edit /></IconButton>
              <IconButton size="small" color="error" onClick={() => setDeleteConfirm(node.id)}><Delete /></IconButton>
            </Box>
          }
        >
          {hasChildren && (
            <IconButton size="small" sx={{ mr: 1 }} onClick={() => toggleExpand(node.id)}>
              {expanded.has(node.id) ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 32 }} />}
          <ListItemText primary={`${node.code} - ${node.name}`} />
        </ListItem>
        {hasChildren && (
          <Collapse in={expanded.has(node.id)}>
            {node.children!.map((c) => renderNode(c, depth + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">组织管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingId(null); setParentId(null); setForm({ code: '', name: '' }); setDialogOpen(true); }}>
          新增顶级组织
        </Button>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : isError ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>加载失败</Box>
      ) : depts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无数据</Box>
      ) : (
        <List>{depts.map((d) => renderNode(d, 0))}</List>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '编辑组织' : '新增组织'}</DialogTitle>
        <DialogContent>
          <TextField label="编码" fullWidth margin="normal" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <TextField label="名称" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate({ ...form, parentId })}
            disabled={!form.code || !form.name || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>确定要删除该组织吗？子级组织也将被删除。</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>取消</Button>
          <Button color="error" variant="contained" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }}>删除</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
