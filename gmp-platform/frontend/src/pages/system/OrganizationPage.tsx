import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  Apartment,
  Business,
  Close,
  Edit,
  ExpandLess,
  ExpandMore,
  Groups,
  RestartAlt,
  Search,
} from '@mui/icons-material';
import {
  createDepartment,
  createUser,
  deleteDepartment,
  deleteUser,
  getDepartmentTree,
  getRoles,
  resetUserPassword,
  updateDepartment,
  updateUser,
} from '@/api/identity';
import StatusBadge from '@/components/StatusBadge';
import type { PageResult } from '@/types/common';
import { USER_STATUS_MAP } from '@/utils/constants';

interface OrgUser {
  id: string;
  username: string;
  displayName: string;
  status: string;
  phone?: string;
  email?: string;
  createdBy?: string;
  createdAt?: string;
  roleIds?: string[];
  departmentIds?: string[];
  primaryDepartmentId?: string | null;
}

interface DepartmentNode {
  id: string;
  tenantId?: string;
  parentId?: string | null;
  code: string;
  name: string;
  sortOrder?: number;
  users?: OrgUser[];
  children?: DepartmentNode[];
}

interface FlatDepartment {
  node: DepartmentNode;
  depth: number;
}

interface PersonnelRow {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  phone?: string;
  status: string;
  departmentName: string;
  createdBy?: string;
  createdAt?: string;
  roleIds: string[];
  departmentIds: string[];
  primaryDepartmentId?: string | null;
}

interface Role {
  id: string | number;
  code: string;
  name: string;
}

interface UserForm {
  username: string;
  displayName: string;
  email: string;
  phone: string;
  status: string;
  password: string;
  roleIds: string[];
  primaryDepartmentId: string;
}

const PAGE_SIZE = 20;
const emptyUserForm: UserForm = {
  username: '',
  displayName: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
  password: '',
  roleIds: [],
  primaryDepartmentId: '',
};

const userFieldSx = {
  '& .MuiInputBase-root': {
    height: 40,
  },
  '& .MuiInputBase-input': {
    boxSizing: 'border-box',
  },
};

const userSelectSx = {
  ...userFieldSx,
  '& .MuiSelect-select': {
    minHeight: '20px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
};

function flattenDepartments(nodes: DepartmentNode[], depth = 0): FlatDepartment[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...flattenDepartments(node.children ?? [], depth + 1),
  ]);
}

function getLevelLabel(depth: number): string {
  if (depth === 0) return '公司主体';
  if (depth === 1) return '部门';
  return '班组';
}

function getChildLabel(depth: number): string | null {
  if (depth === 0) return '新增部门';
  if (depth === 1) return '新增班组';
  return null;
}

function countUsers(node: DepartmentNode): number {
  return (node.users?.length ?? 0) + (node.children ?? []).reduce((sum, child) => sum + countUsers(child), 0);
}

function getDeleteBlockReason(node: DepartmentNode | undefined): string {
  if (!node) return '';

  const hasChildOrganizations = (node.children?.length ?? 0) > 0;
  const hasUsers = countUsers(node) > 0;

  if (hasChildOrganizations && hasUsers) return '该组织下存在子组织或用户，无法删除';
  if (hasChildOrganizations) return '该组织下存在子组织，无法删除';
  if (hasUsers) return '该组织下存在用户，无法删除';
  return '';
}

function collectPersonnel(node: DepartmentNode | undefined, includeChildren: boolean): PersonnelRow[] {
  if (!node) return [];

  const rows = (node.users ?? []).map((user) => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    phone: user.phone,
    status: user.status,
    departmentName: node.name,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    roleIds: user.roleIds ?? [],
    departmentIds: user.departmentIds ?? [],
    primaryDepartmentId: user.primaryDepartmentId,
  }));

  if (!includeChildren) return rows;

  return [
    ...rows,
    ...(node.children ?? []).flatMap((child) => collectPersonnel(child, true)),
  ];
}

function formatDate(value?: string): string {
  if (!value) return '-';
  return value.length > 10 ? value.slice(0, 10) : value;
}

function includesText(value: string | undefined, keyword: string): boolean {
  if (!keyword.trim()) return true;
  return (value ?? '').toLowerCase().includes(keyword.trim().toLowerCase());
}

function getUserStatusMeta(status: string) {
  return USER_STATUS_MAP[status as keyof typeof USER_STATUS_MAP] ?? { label: status, color: 'default' as const };
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ p: 1.5, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Box>
  );
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ minHeight: 54 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{children || '-'}</Typography>
    </Box>
  );
}

export default function OrganizationPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm);
  const [resetDialog, setResetDialog] = useState<{ id: string; username: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<{ id: string; username: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<PersonnelRow | null>(null);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    username: '',
    phone: '',
    status: 'ALL',
    createdFrom: '',
    createdTo: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['departments-tree'],
    queryFn: async () => {
      const res = await getDepartmentTree();
      return res.data.data as DepartmentNode[];
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

  const departments = data ?? [];
  const flatDepartments = useMemo(() => flattenDepartments(departments), [departments]);
  const departmentOptions = useMemo(
    () => flatDepartments.map((item) => ({
      id: item.node.id,
      label: `${'　'.repeat(item.depth)}${item.node.name}`,
    })),
    [flatDepartments],
  );
  const roles = roleData ?? [];
  const roleNameById = useMemo(
    () => new Map(roles.map((role) => [String(role.id), role.name])),
    [roles],
  );
  const selected = flatDepartments.find((item) => item.node.id === selectedId) ?? flatDepartments[0];
  const allRows = useMemo(
    () => collectPersonnel(selected?.node, true),
    [selected],
  );
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const createdDate = row.createdAt?.slice(0, 10) ?? '';
      const matchesCreatedFrom = !filters.createdFrom || (createdDate && createdDate >= filters.createdFrom);
      const matchesCreatedTo = !filters.createdTo || (createdDate && createdDate <= filters.createdTo);

      return (
        includesText(row.displayName, filters.name) &&
        includesText(row.username, filters.username) &&
        includesText(row.phone, filters.phone) &&
        (filters.status === 'ALL' || row.status === filters.status) &&
        matchesCreatedFrom &&
        matchesCreatedTo
      );
    });
  }, [allRows, filters]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dialogParent = parentId !== null
    ? flatDepartments.find((item) => item.node.id === parentId)
    : undefined;
  const editingDepartment = editingId
    ? flatDepartments.find((item) => item.node.id === editingId)?.node
    : undefined;
  const deleteBlockReason = getDeleteBlockReason(editingDepartment);
  const dialogTitle = editingId
    ? '编辑组织节点'
    : parentId === null
      ? '新增公司主体'
      : dialogParent?.depth === 0
        ? '新增部门'
        : dialogParent?.depth === 1
          ? '新增班组'
          : '新增组织节点';

  useEffect(() => {
    if (flatDepartments.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => {
      if (current && flatDepartments.some((item) => item.node.id === current)) return current;
      return flatDepartments[0].node.id;
    });
    setExpanded((current) => {
      if (current.size > 0) return current;
      return new Set(flatDepartments.map((item) => item.node.id));
    });
  }, [flatDepartments]);

  useEffect(() => {
    setPage(1);
  }, [filters, selectedId]);

  const saveMutation = useMutation({
    mutationFn: (body: { name: string; parentId?: string | null }) =>
      editingId ? updateDepartment(editingId, body) : createDepartment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      setDialogOpen(false);
      setEditingId(null);
      setForm({ name: '' });
      setSnackbar({ open: true, message: editingId ? '更新成功' : '创建成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '操作失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      setDeleteConfirm(null);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '删除失败', severity: 'error' }),
  });

  const saveUserMutation = useMutation({
    mutationFn: () => {
      const primaryDepartmentId = userForm.primaryDepartmentId || selected?.node.id || '';
      const body = {
        username: userForm.username,
        displayName: userForm.displayName,
        email: userForm.email,
        phone: userForm.phone,
        status: userForm.status,
        password: userForm.password || undefined,
        roleIds: userForm.roleIds,
        departmentIds: primaryDepartmentId ? [primaryDepartmentId] : [],
        primaryDepartmentId: primaryDepartmentId || null,
      };
      return editingUserId ? updateUser(editingUserId, body) : createUser(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUserDialogOpen(false);
      setEditingUserId(null);
      setUserForm(emptyUserForm);
      setSnackbar({ open: true, message: '用户保存成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '用户保存失败', severity: 'error' }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!resetDialog) throw new Error('missing user');
      await resetUserPassword(resetDialog.id, { password: newPassword });
    },
    onSuccess: () => {
      setResetDialog(null);
      setNewPassword('');
      setSnackbar({ open: true, message: '密码已重置', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '密码重置失败', severity: 'error' }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!deleteUserConfirm) throw new Error('missing user');
      await deleteUser(deleteUserConfirm.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUserConfirm(null);
      setSnackbar({ open: true, message: '用户删除成功', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '用户删除失败', severity: 'error' }),
  });

  const toggleExpand = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreateDialog = (pid: string | null) => {
    setEditingId(null);
    setParentId(pid);
    setForm({ name: '' });
    if (pid !== null) {
      setExpanded((current) => new Set(current).add(pid));
    }
    setDialogOpen(true);
  };

  const openEditDialog = (item: DepartmentNode) => {
    setEditingId(item.id);
    setParentId(item.parentId ?? null);
    setForm({ name: item.name });
    setDialogOpen(true);
  };

  const openDeleteConfirmFromEditDialog = () => {
    if (!editingId) return;
    setDialogOpen(false);
    setDeleteConfirm(editingId);
  };

  const openCreateUserDialog = () => {
    if (!selected) {
      setSnackbar({ open: true, message: '请先选择组织节点', severity: 'error' });
      return;
    }
    setEditingUserId(null);
    setUserForm({ ...emptyUserForm, primaryDepartmentId: selected.node.id });
    setUserDialogOpen(true);
  };

  const openEditUserDialog = (row: PersonnelRow) => {
    setEditingUserId(row.id);
    setUserForm({
      username: row.username,
      displayName: row.displayName,
      email: row.email ?? '',
      phone: row.phone ?? '',
      status: row.status || 'ACTIVE',
      password: '',
      roleIds: row.roleIds,
      primaryDepartmentId: row.primaryDepartmentId ?? row.departmentIds[0] ?? selected?.node.id ?? '',
    });
    setUserDialogOpen(true);
  };

  const openUserDetailDrawer = (row: PersonnelRow) => {
    setSelectedUser(row);
    setUserDrawerOpen(true);
  };

  const closeUserDetailDrawer = () => {
    setUserDrawerOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      username: '',
      phone: '',
      status: 'ALL',
      createdFrom: '',
      createdTo: '',
    });
  };

  const renderNode = (node: DepartmentNode, depth: number) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isSelected = selected?.node.id === node.id;
    const childLabel = getChildLabel(depth);
    const nodeIcon = depth === 0
      ? <Business fontSize="small" />
      : depth === 1
        ? <Apartment fontSize="small" />
        : <Groups fontSize="small" />;

    return (
      <Box key={node.id}>
        <ListItemButton
          selected={isSelected}
          onClick={() => setSelectedId(node.id)}
          sx={{
            minHeight: 44,
            mb: '5px',
            pl: 1 + depth * 2,
            pr: 0.75,
            borderRadius: '5px',
            color: '#303133',
            '&.Mui-selected': {
              bgcolor: '#e8f4ff',
              color: '#1890ff',
            },
            '&.Mui-selected:hover': {
              bgcolor: '#e8f4ff',
            },
          }}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                toggleExpand(node.id);
              }}
              sx={{ mr: 0.5, color: 'inherit' }}
            >
              {expanded.has(node.id) ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          ) : (
            <Box sx={{ width: 34, mr: 0.5, flex: '0 0 34px' }} />
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'inherit' }}>
            {nodeIcon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              title={node.name}
              sx={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {node.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: isSelected ? '#1890ff' : '#909399' }}>
              {getLevelLabel(depth)} · {countUsers(node)} 人
            </Typography>
          </Box>
          {childLabel ? (
            <IconButton
              size="small"
              title={childLabel}
              onClick={(event) => {
                event.stopPropagation();
                openCreateDialog(node.id);
              }}
              sx={{ color: isSelected ? '#1890ff' : '#909399' }}
            >
              <Add fontSize="small" />
            </IconButton>
          ) : null}
          <IconButton
            size="small"
            title="编辑组织"
            onClick={(event) => {
              event.stopPropagation();
              openEditDialog(node);
            }}
            sx={{ color: isSelected ? '#1890ff' : '#909399' }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </ListItemButton>
        {expanded.has(node.id) && hasChildren && (
          <Box>{node.children!.map((child) => renderNode(child, depth + 1))}</Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '266px minmax(0, 1fr)' },
          gap: '20px',
          minHeight: { lg: 'calc(100vh - 190px)' },
        }}
      >
        <Box
          sx={{
            bgcolor: '#fff',
            border: '1px solid #e4e7ed',
            borderRadius: '5px',
            overflow: 'hidden',
            minHeight: 520,
          }}
        >
          <Box
            sx={{
              height: 56,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e4e7ed',
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#303133' }}>组织架构</Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={24} /></Box>
          ) : isError ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#909399' }}>加载失败</Box>
          ) : departments.length === 0 ? (
            <Box sx={{ px: 2, py: 5, textAlign: 'center', color: '#909399' }}>
              <Typography sx={{ mb: 2 }}>暂无组织架构</Typography>
              <Typography sx={{ mb: 2.5, fontSize: 13, lineHeight: 1.6 }}>
                创建公司主体后，可在公司节点下新增部门，再在部门下新增班组。
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => openCreateDialog(null)}>
                新增公司主体
              </Button>
            </Box>
          ) : (
            <List disablePadding sx={{ p: '10px' }}>
              {departments.map((department) => renderNode(department, 0))}
            </List>
          )}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e4e7ed',
              borderRadius: '5px',
              p: '20px',
              mb: '20px',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: '16px 20px',
                alignItems: 'center',
              }}
            >
              <TextField
                label="姓名"
                placeholder="请输入"
                value={filters.name}
                onChange={(event) => setFilters({ ...filters, name: event.target.value })}
              />
              <TextField
                label="账号"
                placeholder="请输入"
                value={filters.username}
                onChange={(event) => setFilters({ ...filters, username: event.target.value })}
              />
              <TextField
                select
                label="状态"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              >
                <MenuItem value="ALL">全部</MenuItem>
                {Object.entries(USER_STATUS_MAP).map(([value, meta]) => (
                  <MenuItem key={value} value={value}>{meta.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="手机号"
                placeholder="请输入"
                value={filters.phone}
                onChange={(event) => setFilters({ ...filters, phone: event.target.value })}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="创建时间"
                  type="date"
                  value={filters.createdFrom}
                  onChange={(event) => setFilters({ ...filters, createdFrom: event.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <Typography sx={{ color: '#909399' }}>-</Typography>
                <TextField
                  type="date"
                  value={filters.createdTo}
                  onChange={(event) => setFilters({ ...filters, createdTo: event.target.value })}
                  fullWidth
                />
              </Stack>
              <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>
                  重置
                </Button>
                <Button variant="contained" startIcon={<Search />} onClick={() => setPage(1)}>
                  查询
                </Button>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e4e7ed',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                minHeight: 58,
                px: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 2,
                borderBottom: '1px solid #e4e7ed',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={openCreateUserDialog}
                  disabled={!selected}
                >
                  添加
                </Button>
              </Stack>
            </Box>

            <TableContainer sx={{ maxHeight: 560 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                    <TableCell>姓名</TableCell>
                    <TableCell>账号</TableCell>
                    <TableCell>手机号</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>所属部门</TableCell>
                    <TableCell>创建人</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 7, color: '#909399' }}>
                        {selected ? '暂无人员' : '请选择左侧组织节点'}
                      </TableCell>
                    </TableRow>
                  ) : pagedRows.map((row) => (
                    <TableRow
                      key={`${row.departmentName}-${row.id}`}
                      hover
                      onClick={() => openUserDetailDrawer(row)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox size="small" onClick={(event) => event.stopPropagation()} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#1890ff', fontWeight: 500 }}>{row.displayName}</Typography>
                      </TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>{row.phone || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={getUserStatusMeta(row.status).label}
                          color={getUserStatusMeta(row.status).color}
                        />
                      </TableCell>
                      <TableCell>{row.departmentName}</TableCell>
                      <TableCell>{row.createdBy || '-'}</TableCell>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button size="small" variant="text" onClick={() => openEditUserDialog(row)}>
                            编辑
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              setResetDialog({ id: row.id, username: row.username });
                              setNewPassword('');
                            }}
                          >
                            重置密码
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            onClick={() => setDeleteUserConfirm({ id: row.id, username: row.username })}
                          >
                            删除
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                minHeight: 56,
                px: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                borderTop: '1px solid #ebeef5',
              }}
            >
              <Typography sx={{ color: '#909399' }}>共 {filteredRows.length} 条数据</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Pagination
                  page={Math.min(page, pageCount)}
                  count={pageCount}
                  color="primary"
                  size="small"
                  onChange={(_, value) => setPage(value)}
                />
                <TextField
                  select
                  value={PAGE_SIZE}
                  sx={{ width: 110 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" sx={{ mr: 0 }}>每页</InputAdornment>,
                  }}
                >
                  <MenuItem value={PAGE_SIZE}>{PAGE_SIZE}</MenuItem>
                </TextField>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>

      <Drawer anchor="right" open={userDrawerOpen} onClose={closeUserDetailDrawer}>
        <Box sx={{ width: { xs: '100vw', sm: 560 }, p: 2, bgcolor: '#f7f9fc', minHeight: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>用户详情</Typography>
              {selectedUser ? (
                <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={selectedUser.displayName} color="primary" variant="outlined" />
                  <Chip size="small" label={selectedUser.username} />
                </Stack>
              ) : null}
            </Box>
            <IconButton size="small" onClick={closeUserDetailDrawer} aria-label="关闭详情">
              <Close />
            </IconButton>
          </Stack>

          {!selectedUser ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              请选择一名用户查看详情。
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button size="small" variant="contained" onClick={() => openEditUserDialog(selectedUser)}>
                  编辑
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setResetDialog({ id: selectedUser.id, username: selectedUser.username });
                    setNewPassword('');
                  }}
                >
                  重置密码
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteUserConfirm({ id: selectedUser.id, username: selectedUser.username })}
                >
                  删除
                </Button>
              </Stack>

              <DetailSection title="基本信息">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  <DetailField label="姓名">{selectedUser.displayName}</DetailField>
                  <DetailField label="账号">{selectedUser.username}</DetailField>
                  <DetailField label="手机号">{selectedUser.phone || '-'}</DetailField>
                  <DetailField label="邮箱">{selectedUser.email || '-'}</DetailField>
                  <DetailField label="状态">
                    <StatusBadge
                      label={getUserStatusMeta(selectedUser.status).label}
                      color={getUserStatusMeta(selectedUser.status).color}
                    />
                  </DetailField>
                </Box>
              </DetailSection>

              <DetailSection title="组织与角色">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  <DetailField label="所属部门">{selectedUser.departmentName}</DetailField>
                  <DetailField label="岗位角色">
                    {selectedUser.roleIds.length > 0
                      ? selectedUser.roleIds.map((roleId) => roleNameById.get(roleId) || roleId).join('、')
                      : '-'}
                  </DetailField>
                </Box>
              </DetailSection>

              <DetailSection title="系统信息">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  <DetailField label="创建人">{selectedUser.createdBy || '-'}</DetailField>
                  <DetailField label="创建时间">{formatDate(selectedUser.createdAt)}</DetailField>
                </Box>
              </DetailSection>
            </Stack>
          )}
        </Box>
      </Drawer>

      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingUserId ? '编辑用户' : '新增用户'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
            <TextField
              label="账号"
              required
              value={userForm.username}
              onChange={(event) => setUserForm({ ...userForm, username: event.target.value })}
              fullWidth
              size="small"
              sx={userFieldSx}
            />
            <TextField
              label="姓名"
              value={userForm.displayName}
              onChange={(event) => setUserForm({ ...userForm, displayName: event.target.value })}
              fullWidth
              required
              size="small"
              sx={userFieldSx}
            />
            {!editingUserId && (
              <TextField
                label="初始密码"
                type="password"
                placeholder="不填则使用默认密码"
                value={userForm.password}
                onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                fullWidth
                size="small"
                sx={userFieldSx}
              />
            )}
            <TextField
              label="邮箱"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              fullWidth
              size="small"
              sx={userFieldSx}
            />
            <TextField
              label="手机号"
              value={userForm.phone}
              onChange={(event) => setUserForm({ ...userForm, phone: event.target.value })}
              fullWidth
              size="small"
              sx={userFieldSx}
            />
            <TextField
              select
              label="状态"
              value={userForm.status}
              onChange={(event) => setUserForm({ ...userForm, status: event.target.value })}
              fullWidth
              size="small"
              sx={userFieldSx}
              SelectProps={{
                renderValue: (value) => {
                  const meta = getUserStatusMeta(String(value));
                  return <StatusBadge label={meta.label} color={meta.color} />;
                },
              }}
            >
              {Object.entries(USER_STATUS_MAP).map(([value, meta]) => (
                <MenuItem key={value} value={value}>
                  <StatusBadge label={meta.label} color={meta.color} />
                </MenuItem>
              ))}
            </TextField>
            <FormControl fullWidth required size="small" sx={userSelectSx}>
              <InputLabel required>所属组织</InputLabel>
              <Select
                label="所属组织"
                value={userForm.primaryDepartmentId}
                onChange={(event) => setUserForm({ ...userForm, primaryDepartmentId: String(event.target.value) })}
              >
                <MenuItem value="">未分配</MenuItem>
                {departmentOptions.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required size="small" sx={userSelectSx}>
              <InputLabel required>岗位角色</InputLabel>
              <Select
                multiple
                label="岗位角色"
                value={userForm.roleIds}
                input={<OutlinedInput size="small" label="岗位角色" />}
                onChange={(event) => {
                  const value = event.target.value;
                  setUserForm({
                    ...userForm,
                    roleIds: typeof value === 'string'
                      ? value.split(',').filter(Boolean)
                      : (value as string[]).map(String),
                  });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((roleId) => (
                      <Chip key={roleId} label={roleNameById.get(roleId) || roleId} size="small" />
                    ))}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={String(role.id)} value={String(role.id)}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => saveUserMutation.mutate()}
            disabled={
              !userForm.username ||
              !userForm.displayName ||
              !userForm.primaryDepartmentId ||
              userForm.roleIds.length === 0 ||
              saveUserMutation.isPending
            }
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetDialog !== null} onClose={() => setResetDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>重置密码</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1, mb: 1.5, color: '#606266' }}>
            用户：{resetDialog?.username}
          </Typography>
          <TextField
            label="新密码"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(null)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => resetPasswordMutation.mutate()}
            disabled={!newPassword || resetPasswordMutation.isPending}
          >
            确认
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteUserConfirm !== null} onClose={() => setDeleteUserConfirm(null)}>
        <DialogTitle>确认删除用户</DialogTitle>
        <DialogContent>确定要删除用户 {deleteUserConfirm?.username} 吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserConfirm(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteUserMutation.mutate()}
            disabled={deleteUserMutation.isPending}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {!editingId && (
            <Box
              sx={{
                mt: 1,
                mb: 1,
                p: 1.5,
                border: '1px solid #e4e7ed',
                borderRadius: '5px',
                bgcolor: '#f6f8f9',
              }}
            >
              <Typography sx={{ fontSize: 13, color: '#606266' }}>
                新增层级：{dialogTitle.replace('新增', '')}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: '#606266' }}>
                上级组织：{dialogParent?.node.name ?? '无（公司主体）'}
              </Typography>
            </Box>
          )}
          <TextField label="名称" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Box>
            {editingId && (
              <Box component="span" title={deleteBlockReason || '删除组织节点'}>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={openDeleteConfirmFromEditDialog}
                  disabled={Boolean(deleteBlockReason)}
                >
                  删除
                </Button>
              </Box>
            )}
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button
              variant="contained"
              onClick={() => saveMutation.mutate({ name: form.name, parentId })}
              disabled={!form.name || saveMutation.isPending}
            >
              保存
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>确定要删除该组织节点吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
