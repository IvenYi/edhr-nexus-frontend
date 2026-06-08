import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
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
import { Add, Delete, Edit, RestartAlt } from '@mui/icons-material';
import {
  createUser,
  deleteUser,
  getDepartmentTree,
  getRoles,
  getUsers,
  resetUserPassword,
  updateUser,
} from '@/api/identity';
import { USER_STATUS_MAP } from '@/utils/constants';
import StatusBadge from '@/components/StatusBadge';
import type { PageResult } from '@/types/common';

interface User {
  id: number;
  username: string;
  displayName?: string;
  name?: string;
  email?: string;
  phone?: string;
  status: string;
  roleIds?: number[];
  departmentIds?: number[];
  primaryDepartmentId?: number | null;
}

interface Role {
  id: number;
  code: string;
  name: string;
}

interface DepartmentNode {
  id: number;
  code: string;
  name: string;
  children?: DepartmentNode[];
}

interface DepartmentOption {
  id: number;
  label: string;
}

interface UserForm {
  username: string;
  displayName: string;
  email: string;
  phone: string;
  status: string;
  password: string;
  roleIds: number[];
  primaryDepartmentId: number | '';
}

const emptyForm: UserForm = {
  username: '',
  displayName: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
  password: '',
  roleIds: [],
  primaryDepartmentId: '',
};

function flattenDepartments(nodes: DepartmentNode[], depth = 0): DepartmentOption[] {
  return nodes.flatMap((node) => [
    { id: node.id, label: `${'　'.repeat(depth)}${node.code} - ${node.name}` },
    ...flattenDepartments(node.children ?? [], depth + 1),
  ]);
}

export default function UserPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [resetDialog, setResetDialog] = useState<{ id: number; username: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const res = await getUsers({ page, size: 10 });
      return res.data.data as PageResult<User>;
    },
  });

  const { data: roleData } = useQuery({
    queryKey: ['roles-all'],
    queryFn: async () => {
      const res = await getRoles({ page: 1, size: 200 });
      const body = res.data.data as PageResult<Role>;
      return body.content ?? [];
    },
  });

  const { data: departmentData } = useQuery({
    queryKey: ['departments-tree'],
    queryFn: async () => {
      const res = await getDepartmentTree();
      return res.data.data as DepartmentNode[];
    },
  });

  const roles = roleData ?? [];
  const roleNameById = useMemo(() => new Map(roles.map((role) => [role.id, role.name])), [roles]);
  const departmentOptions = useMemo(() => flattenDepartments(departmentData ?? []), [departmentData]);
  const departmentNameById = useMemo(() => new Map(departmentOptions.map((item) => [item.id, item.label.trim()])), [departmentOptions]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const primaryDepartmentId = form.primaryDepartmentId === '' ? null : Number(form.primaryDepartmentId);
      const body = {
        username: form.username,
        displayName: form.displayName,
        email: form.email,
        phone: form.phone,
        status: form.status,
        password: form.password || undefined,
        roleIds: form.roleIds,
        departmentIds: primaryDepartmentId ? [primaryDepartmentId] : [],
        primaryDepartmentId,
      };
      return editingId ? updateUser(editingId, body) : createUser(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setSnackbar({ open: true, message: '保存成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '保存失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      setDeleteConfirm(null);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '删除失败', severity: 'error' }),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!resetDialog) throw new Error('missing user');
      await resetUserPassword(resetDialog.id, { password: newPassword });
    },
    onSuccess: () => {
      setResetDialog(null);
      setNewPassword('');
      setSnackbar({ open: true, message: '密码已重置', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '重置失败', severity: 'error' }),
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditDialog = (item: User) => {
    setEditingId(item.id);
    setForm({
      username: item.username,
      displayName: item.displayName || item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      status: item.status || 'ACTIVE',
      password: '',
      roleIds: item.roleIds ?? [],
      primaryDepartmentId: item.primaryDepartmentId ?? '',
    });
    setOpen(true);
  };

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">用户管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>新增用户</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用户名</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>所属组织</TableCell>
              <TableCell>岗位角色</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={6} align="center">加载失败</TableCell></TableRow>
            ) : content.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">暂无数据</TableCell></TableRow>
            ) : content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.username}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{item.displayName || item.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.email || item.phone}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{item.primaryDepartmentId ? departmentNameById.get(item.primaryDepartmentId) : '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(item.roleIds ?? []).length === 0 ? '-' : item.roleIds!.map((roleId) => (
                      <Chip key={roleId} label={roleNameById.get(roleId) || roleId} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={USER_STATUS_MAP[item.status as keyof typeof USER_STATUS_MAP]?.label || item.status}
                    color={USER_STATUS_MAP[item.status as keyof typeof USER_STATUS_MAP]?.color || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEditDialog(item)}><Edit /></IconButton>
                  <IconButton size="small" onClick={() => { setResetDialog({ id: item.id, username: item.username }); setNewPassword(''); }}><RestartAlt /></IconButton>
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
        <DialogTitle>{editingId ? '编辑用户' : '新增用户'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField label="用户名" fullWidth value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <TextField label="姓名" fullWidth value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            {!editingId && (
              <TextField label="初始密码" type="password" fullWidth value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            )}
            <TextField label="邮箱" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="手机号" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select label="状态" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(USER_STATUS_MAP).map(([value, meta]) => (
                  <MenuItem key={value} value={value}>{meta.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>所属组织</InputLabel>
              <Select
                label="所属组织"
                value={form.primaryDepartmentId}
                onChange={(e) => setForm({ ...form, primaryDepartmentId: e.target.value as number | '' })}
              >
                <MenuItem value="">未分配</MenuItem>
                {departmentOptions.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>岗位角色</InputLabel>
              <Select
                multiple
                label="岗位角色"
                value={form.roleIds}
                input={<OutlinedInput label="岗位角色" />}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, roleIds: typeof value === 'string' ? value.split(',').map(Number) : value as number[] });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((roleId) => <Chip key={roleId} label={roleNameById.get(roleId) || roleId} size="small" />)}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={!form.username || !form.displayName || saveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetDialog !== null} onClose={() => setResetDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>重置密码</DialogTitle>
        <DialogContent>
          <TextField
            label="新密码"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(null)}>取消</Button>
          <Button variant="contained" onClick={() => resetMutation.mutate()} disabled={!newPassword || resetMutation.isPending}>确认</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>确定要删除该用户吗？</DialogContent>
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
