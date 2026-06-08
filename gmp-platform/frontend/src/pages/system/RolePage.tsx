import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, Tune } from '@mui/icons-material';
import {
  createRole,
  deleteRole,
  getPermissions,
  getRolePermissions,
  getRoles,
  updateRole,
  updateRolePermissions,
} from '@/api/identity';
import type { PageResult } from '@/types/common';

interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
}

interface Permission {
  id: number;
  code: string;
  name: string;
  type: 'PAGE' | 'BUTTON' | string;
  parentCode?: string | null;
  sortOrder?: number;
}

function buildPermissionTree(permissions: Permission[]): Permission[] {
  const byParent = new Map<string, Permission[]>();
  permissions.forEach((permission) => {
    const key = permission.parentCode ?? '__root__';
    byParent.set(key, [...(byParent.get(key) ?? []), permission]);
  });
  const sortNodes = (items: Permission[]) =>
    items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'zh-Hans-CN'));

  const roots = sortNodes(byParent.get('__root__') ?? []);
  return roots;
}

export default function RolePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['roles', page],
    queryFn: async () => {
      const res = await getRoles({ page, size: 10 });
      return res.data.data as PageResult<Role>;
    },
  });

  const { data: permissionData } = useQuery({
    queryKey: ['permissions-all'],
    queryFn: async () => {
      const res = await getPermissions({ page: 1, size: 500, sort: 'sortOrder', order: 'asc' });
      const body = res.data.data as PageResult<Permission>;
      return body.content ?? [];
    },
  });

  const permissions = permissionData ?? [];
  const rootPermissions = useMemo(() => buildPermissionTree(permissions), [permissions]);
  const childrenByCode = useMemo(() => {
    const map = new Map<string, Permission[]>();
    permissions.forEach((permission) => {
      if (!permission.parentCode) return;
      map.set(permission.parentCode, [...(map.get(permission.parentCode) ?? []), permission]);
    });
    for (const [key, value] of map) {
      map.set(key, value.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    }
    return map;
  }, [permissions]);

  const collectDescendantIds = (permission: Permission): number[] => [
    permission.id,
    ...(childrenByCode.get(permission.code) ?? []).flatMap((child) => collectDescendantIds(child)),
  ];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const roleResponse = editingId
        ? await updateRole(editingId, form)
        : await createRole(form);
      const role = roleResponse.data.data as Role;
      await updateRolePermissions(role.id, { permissionIds: [...selectedPermissionIds] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setOpen(false);
      setEditingId(null);
      setForm({ code: '', name: '', description: '' });
      setSelectedPermissionIds(new Set());
      setSnackbar({ open: true, message: '保存成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '保存失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteConfirm(null);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '删除失败', severity: 'error' }),
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setForm({ code: '', name: '', description: '' });
    setSelectedPermissionIds(new Set());
    setOpen(true);
  };

  const openEditDialog = async (item: Role) => {
    setEditingId(item.id);
    setForm({ code: item.code, name: item.name, description: item.description || '' });
    setOpen(true);
    setPermissionsLoading(true);
    try {
      const res = await getRolePermissions(item.id);
      setSelectedPermissionIds(new Set(res.data.data as number[]));
    } finally {
      setPermissionsLoading(false);
    }
  };

  const togglePermission = (permission: Permission) => {
    const ids = collectDescendantIds(permission);
    setSelectedPermissionIds((current) => {
      const next = new Set(current);
      const shouldSelect = !ids.every((id) => next.has(id));
      ids.forEach((id) => {
        if (shouldSelect) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const renderPermission = (permission: Permission, depth = 0) => {
    const childNodes = childrenByCode.get(permission.code) ?? [];
    const descendantIds = collectDescendantIds(permission);
    const checkedCount = descendantIds.filter((id) => selectedPermissionIds.has(id)).length;
    const checked = checkedCount === descendantIds.length;
    const indeterminate = checkedCount > 0 && !checked;

    return (
      <Box key={permission.id}>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: depth * 2, minHeight: 34 }}>
          <Checkbox
            size="small"
            checked={checked}
            indeterminate={indeterminate}
            onChange={() => togglePermission(permission)}
          />
          <Typography variant="body2" sx={{ flex: 1 }}>{permission.name}</Typography>
          <Chip label={permission.type === 'PAGE' ? '菜单' : '按钮'} size="small" variant="outlined" />
        </Box>
        {childNodes.map((child) => renderPermission(child, depth + 1))}
      </Box>
    );
  };

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">岗位角色</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>新增岗位</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>编码</TableCell>
              <TableCell>岗位名称</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={4} align="center">加载失败</TableCell></TableRow>
            ) : content.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">暂无数据</TableCell></TableRow>
            ) : content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEditDialog(item)}><Edit /></IconButton>
                  <IconButton size="small" onClick={() => openEditDialog(item)}><Tune /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteConfirm(item.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? '编辑岗位角色' : '新增岗位角色'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' }, gap: 2, mt: 1 }}>
            <Box>
              <TextField label="岗位编码" fullWidth margin="normal" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <TextField label="岗位名称" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="描述" fullWidth margin="normal" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Box>
            <Box sx={{ border: '1px solid #e4e7ed', borderRadius: '5px', p: 1.5, maxHeight: 420, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>可见菜单与操作</Typography>
              {permissionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
              ) : rootPermissions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无权限数据</Box>
              ) : (
                rootPermissions.map((permission) => renderPermission(permission))
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={!form.code || !form.name || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>确定要删除该岗位角色吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>取消</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>删除</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
