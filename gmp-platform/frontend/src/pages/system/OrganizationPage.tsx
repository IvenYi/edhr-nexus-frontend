import { type MouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
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
  Tooltip,
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
  LockReset,
  PersonRemove,
  RestartAlt,
  Search,
} from '@mui/icons-material';
import {
  createDepartment,
  createUser,
  deleteDepartment,
  getDepartmentTree,
  getRoles,
  removeUserFromOrganization,
  resetUserPassword,
  updateDepartment,
  updateUser,
} from '@/api/identity';
import { getAuditLogs } from '@/api/audit';
import StatusBadge from '@/components/StatusBadge';
import type { PageResult } from '@/types/common';
import { AUDIT_ACTION_MAP, USER_STATUS_MAP } from '@/utils/constants';

interface OrgUser {
  id: string;
  username: string;
  displayName: string;
  status: string;
  phone?: string;
  email?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
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
  updatedBy?: string;
  updatedAt?: string;
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

interface AuditEvent {
  id: string | number;
  entityType?: string;
  entityId?: string | number;
  action?: string;
  contentBefore?: unknown;
  contentAfter?: unknown;
  detail?: string;
  operatorName?: string;
  createdAt?: string;
  reason?: string;
}

interface UserAuditRecord {
  id: string;
  operatorName: string;
  actionLabel: string;
  operatedAt?: string;
  beforeContent: string;
  afterContent: string;
}

type PersonnelColumnId =
  | 'select'
  | 'displayName'
  | 'username'
  | 'phone'
  | 'status'
  | 'departmentName'
  | 'roleName'
  | 'createdBy'
  | 'createdAt'
  | 'actions';

interface PersonnelColumn {
  id: PersonnelColumnId;
  label: string;
  defaultWidth: number;
  minWidth: number;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
}

type PersonnelColumnWidths = Partial<Record<PersonnelColumnId, number>>;

const PAGE_SIZE = 20;
const PERSONNEL_COLUMN_WIDTH_STORAGE_PREFIX = 'organization-personnel-column-widths:';
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

const tableHeaderCellSx = {
  height: 48,
  py: 0,
  color: '#606266',
  fontWeight: 600,
  bgcolor: '#f5f7fa',
  borderBottom: '1px solid #e4e7ed',
};

const tableBodyCellSx = {
  height: 48,
  py: 0,
  borderBottom: '1px solid #ebeef5',
};

const appContentDrawerSx = {
  top: 0,
  bottom: 0,
  zIndex: 1300,
};

const appContentDrawerPaperSx = {
  ...appContentDrawerSx,
  height: 'auto',
};

const organizationWorkspaceHeight = { xs: 'auto', lg: 'calc(100vh - 150px)' };
const PERSONNEL_FIELD_COLUMN_MIN_WIDTH = 60;

const dateFieldSx = {
  userSelect: 'none',
  '& input': {
    userSelect: 'none',
    cursor: 'pointer',
  },
};

const personnelColumns: PersonnelColumn[] = [
  { id: 'select', label: '', defaultWidth: 50, minWidth: 50, resizable: false, align: 'center' },
  { id: 'displayName', label: '姓名', defaultWidth: 140, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'username', label: '账号', defaultWidth: 140, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'phone', label: '手机号', defaultWidth: 132, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'departmentName', label: '所属架构', defaultWidth: 160, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'roleName', label: '岗位角色', defaultWidth: 150, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'status', label: '状态', defaultWidth: 96, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdBy', label: '创建人', defaultWidth: 120, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdAt', label: '创建时间', defaultWidth: 120, minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'actions', label: '操作', defaultWidth: 150, minWidth: 150, resizable: false },
];

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
    updatedBy: user.updatedBy,
    updatedAt: user.updatedAt,
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

function formatDateTime(value?: string): string {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 16);
}

function includesText(value: string | undefined, keyword: string): boolean {
  if (!keyword.trim()) return true;
  return (value ?? '').toLowerCase().includes(keyword.trim().toLowerCase());
}

function getUserStatusMeta(status: string) {
  return USER_STATUS_MAP[status as keyof typeof USER_STATUS_MAP] ?? { label: status, color: 'default' as const };
}

function getAuditActionLabel(action?: string): string {
  if (!action) return '操作';
  return AUDIT_ACTION_MAP[action as keyof typeof AUDIT_ACTION_MAP]?.label || action;
}

function getOperatorName(value?: string): string {
  return value?.trim() || '系统记录';
}

function getUserRoleSummary(user: PersonnelRow, roleNameById: Map<string, string>): string {
  if (user.roleIds.length === 0) return '-';
  return user.roleIds.map((roleId) => roleNameById.get(roleId) || roleId).join('、');
}

function getUserSnapshot(user: PersonnelRow, roleNameById: Map<string, string>): string {
  const statusMeta = getUserStatusMeta(user.status);
  return [
    `账号：${user.username || '-'}`,
    `姓名：${user.displayName || '-'}`,
    `所属组织：${user.departmentName || '-'}`,
    `岗位角色：${getUserRoleSummary(user, roleNameById)}`,
    `状态：${statusMeta.label}`,
  ].join('；');
}

function normalizeAuditValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function formatAuditContent(value: unknown): string {
  const normalized = normalizeAuditValue(value);
  if (normalized === undefined || normalized === null || normalized === '') return '-';
  if (typeof normalized === 'string') return normalized;

  try {
    return JSON.stringify(normalized, null, 2);
  } catch {
    return String(normalized);
  }
}

function isAuditEventForUser(item: AuditEvent, user: PersonnelRow): boolean {
  const entityType = String(item.entityType ?? '').toLowerCase();
  const entityId = String(item.entityId ?? '');
  const userId = String(user.id);
  const payload = [
    item.contentBefore,
    item.contentAfter,
    item.detail,
    item.reason,
  ].map((value) => (typeof value === 'string' ? value : JSON.stringify(value ?? '')))
    .join(' ')
    .toLowerCase();

  const isUserEntity = entityType.includes('user') || entityType.includes('account');
  return (
    (isUserEntity && entityId === userId) ||
    payload.includes(userId.toLowerCase()) ||
    payload.includes(user.username.toLowerCase())
  );
}

function getUserAuditRecords(
  selectedUser: PersonnelRow | null,
  auditEvents: AuditEvent[],
  roleNameById: Map<string, string>,
): UserAuditRecord[] {
  if (!selectedUser) return [];

  const realRecords = auditEvents
    .filter((item) => isAuditEventForUser(item, selectedUser))
    .map((item) => ({
      id: String(item.id),
      operatorName: getOperatorName(item.operatorName),
      actionLabel: getAuditActionLabel(item.action),
      operatedAt: item.createdAt,
      beforeContent: formatAuditContent(item.contentBefore),
      afterContent: formatAuditContent(item.contentAfter ?? item.detail ?? item.reason),
    }));

  if (realRecords.length > 0) return realRecords;

  const snapshot = getUserSnapshot(selectedUser, roleNameById);
  const fallbackRecords: UserAuditRecord[] = [];

  if (selectedUser.updatedAt) {
    fallbackRecords.push({
      id: `updated-${selectedUser.id}`,
      operatorName: getOperatorName(selectedUser.updatedBy),
      actionLabel: '更新',
      operatedAt: selectedUser.updatedAt,
      beforeContent: '系统未提供变更前快照',
      afterContent: snapshot,
    });
  }

  if (selectedUser.createdAt) {
    fallbackRecords.push({
      id: `created-${selectedUser.id}`,
      operatorName: getOperatorName(selectedUser.createdBy),
      actionLabel: '创建',
      operatedAt: selectedUser.createdAt,
      beforeContent: '-',
      afterContent: snapshot,
    });
  }

  if (fallbackRecords.length > 0) return fallbackRecords;

  return [{
    id: `snapshot-${selectedUser.id}`,
    operatorName: '系统记录',
    actionLabel: '当前快照',
    operatedAt: undefined,
    beforeContent: '-',
    afterContent: snapshot,
  }];
}

function getUpdatedByValue(user: PersonnelRow, auditRecords: UserAuditRecord[]): string {
  if (user.updatedBy) return user.updatedBy;
  const updateRecord = auditRecords.find((record) => record.actionLabel !== '创建');
  return updateRecord?.operatorName || '-';
}

function getPersonnelColumnWidthStorageKey(): string {
  if (typeof window === 'undefined') return `${PERSONNEL_COLUMN_WIDTH_STORAGE_PREFIX}anonymous`;

  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null') as {
      id?: string | number;
      username?: string;
      displayName?: string;
    } | null;
    const userKey = user?.id ?? user?.username ?? user?.displayName ?? 'anonymous';
    return `${PERSONNEL_COLUMN_WIDTH_STORAGE_PREFIX}${String(userKey)}`;
  } catch {
    return `${PERSONNEL_COLUMN_WIDTH_STORAGE_PREFIX}anonymous`;
  }
}

function loadPersonnelColumnWidths(storageKey: string): PersonnelColumnWidths {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return personnelColumns.reduce<PersonnelColumnWidths>((result, column) => {
      if (!column.resizable) return result;

      const width = Number(parsed[column.id]);
      if (Number.isFinite(width)) {
        result[column.id] = Math.max(column.minWidth, width);
      }
      return result;
    }, {});
  } catch {
    return {};
  }
}

function resolvePersonnelColumnWidths(
  columnWidths: PersonnelColumnWidths,
  tableContainerWidth: number,
): Record<PersonnelColumnId, number> {
  const resolved = personnelColumns.reduce<Record<PersonnelColumnId, number>>((result, column) => {
    const persistedWidth = column.resizable ? columnWidths[column.id] : undefined;
    result[column.id] = Math.max(column.minWidth, persistedWidth ?? column.defaultWidth);
    return result;
  }, {} as Record<PersonnelColumnId, number>);

  const baseTotalWidth = personnelColumns.reduce((sum, column) => sum + resolved[column.id], 0);
  const availableWidth = Math.floor(tableContainerWidth);
  if (!Number.isFinite(availableWidth) || availableWidth <= baseTotalWidth) {
    return resolved;
  }

  const flexibleColumns = personnelColumns.filter((column) => column.resizable);
  const flexibleWeight = flexibleColumns.reduce((sum, column) => sum + column.defaultWidth, 0);
  if (flexibleWeight <= 0) return resolved;

  const spareWidth = availableWidth - baseTotalWidth;
  let assignedSpareWidth = 0;
  flexibleColumns.forEach((column, index) => {
    const extraWidth = index === flexibleColumns.length - 1
      ? spareWidth - assignedSpareWidth
      : Math.floor((spareWidth * column.defaultWidth) / flexibleWeight);
    assignedSpareWidth += extraWidth;
    resolved[column.id] += extraWidth;
  });

  return resolved;
}

function openDatePickerWithoutSelection(event: MouseEvent<HTMLDivElement>) {
  event.preventDefault();

  const input = event.currentTarget.querySelector<HTMLInputElement>('input[type="date"]');
  if (!input) return;

  if (typeof input.showPicker === 'function') {
    input.focus({ preventScroll: true });
    try {
      input.showPicker();
    } catch {
      // Some browsers reject showPicker unless the event is considered a trusted user gesture.
    }
    return;
  }

  input.focus({ preventScroll: true });
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
      <Typography component="div" variant="body2" sx={{ wordBreak: 'break-word' }}>{children || '-'}</Typography>
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
  const [removeUserConfirm, setRemoveUserConfirm] = useState<{ id: string; username: string } | null>(null);
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
  const [columnWidthStorageKey] = useState(getPersonnelColumnWidthStorageKey);
  const [columnWidths, setColumnWidths] = useState<PersonnelColumnWidths>(() =>
    loadPersonnelColumnWidths(columnWidthStorageKey),
  );
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [tableContainerWidth, setTableContainerWidth] = useState(0);

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

  const { data: auditLogData } = useQuery({
    queryKey: ['organization-user-audit-logs', selectedUser?.id],
    enabled: userDrawerOpen && Boolean(selectedUser),
    queryFn: async () => {
      const res = await getAuditLogs({
        page: 1,
        size: 200,
        sort: 'createdAt',
        order: 'desc',
        entityType: 'USER_ACCOUNT',
        entityId: selectedUser?.id,
      });
      return res.data.data as PageResult<AuditEvent>;
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
  const auditLogItems = auditLogData?.content ?? [];
  const userAuditRecords = useMemo(
    () => getUserAuditRecords(selectedUser, auditLogItems, roleNameById),
    [selectedUser, auditLogItems, roleNameById],
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
  const resolvedColumnWidths = useMemo(
    () => resolvePersonnelColumnWidths(columnWidths, tableContainerWidth),
    [columnWidths, tableContainerWidth],
  );
  const totalTableWidth = useMemo(
    () => personnelColumns.reduce((sum, column) => sum + resolvedColumnWidths[column.id], 0),
    [resolvedColumnWidths],
  );
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

  useEffect(() => {
    localStorage.setItem(columnWidthStorageKey, JSON.stringify(columnWidths));
  }, [columnWidthStorageKey, columnWidths]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return undefined;

    const updateTableContainerWidth = () => {
      setTableContainerWidth(container.clientWidth);
    };

    updateTableContainerWidth();

    const observer = new ResizeObserver(updateTableContainerWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

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

  const removeUserMutation = useMutation({
    mutationFn: async () => {
      if (!removeUserConfirm) throw new Error('missing user');
      await removeUserFromOrganization(removeUserConfirm.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRemoveUserConfirm(null);
      setSelectedUser(null);
      setUserDrawerOpen(false);
      setSnackbar({ open: true, message: '用户已移出组织', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: '移出失败', severity: 'error' }),
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

  const updateCreatedFrom = (value: string) => {
    setFilters((current) => ({
      ...current,
      createdFrom: value,
      createdTo: current.createdTo && value && current.createdTo < value ? value : current.createdTo,
    }));
  };

  const updateCreatedTo = (value: string) => {
    setFilters((current) => ({
      ...current,
      createdTo: current.createdFrom && value && value < current.createdFrom ? current.createdFrom : value,
    }));
  };

  const getColumnWidth = (column: PersonnelColumn) => resolvedColumnWidths[column.id];

  const beginColumnResize = (event: MouseEvent<HTMLDivElement>, columnId: PersonnelColumnId) => {
    const column = personnelColumns.find((item) => item.id === columnId);
    if (!column?.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = getColumnWidth(column);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const resizeColumn = (moveEvent: globalThis.MouseEvent) => {
      const nextWidth = Math.max(column.minWidth, startWidth + moveEvent.clientX - startX);
      setColumnWidths((current) => ({ ...current, [columnId]: nextWidth }));
    };

    const stopResize = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('mousemove', resizeColumn);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', resizeColumn);
    window.addEventListener('mouseup', stopResize);
  };

  const renderPersonnelCell = (row: PersonnelRow, column: PersonnelColumn) => {
    const cellSx = {
      ...tableBodyCellSx,
      width: getColumnWidth(column),
      minWidth: column.minWidth,
    };

    if (column.id === 'select') {
      return (
        <TableCell key={column.id} padding="checkbox" align={column.align} sx={cellSx}>
          <Checkbox size="small" onClick={(event) => event.stopPropagation()} />
        </TableCell>
      );
    }

    if (column.id === 'displayName') {
      return <TableCell key={column.id} sx={cellSx}>{row.displayName}</TableCell>;
    }

    if (column.id === 'username') {
      return <TableCell key={column.id} sx={cellSx}>{row.username}</TableCell>;
    }

    if (column.id === 'phone') {
      return <TableCell key={column.id} sx={cellSx}>{row.phone || '-'}</TableCell>;
    }

    if (column.id === 'status') {
      return (
        <TableCell key={column.id} sx={cellSx}>
          <StatusBadge
            label={getUserStatusMeta(row.status).label}
            color={getUserStatusMeta(row.status).color}
          />
        </TableCell>
      );
    }

    if (column.id === 'departmentName') {
      return <TableCell key={column.id} sx={cellSx}>{row.departmentName}</TableCell>;
    }

    if (column.id === 'roleName') {
      const roleSummary = getUserRoleSummary(row, roleNameById);
      return (
        <TableCell key={column.id} sx={cellSx} title={roleSummary}>
          <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {roleSummary}
          </Typography>
        </TableCell>
      );
    }

    if (column.id === 'createdBy') {
      return <TableCell key={column.id} sx={cellSx}>{row.createdBy || '-'}</TableCell>;
    }

    if (column.id === 'createdAt') {
      return <TableCell key={column.id} sx={cellSx}>{formatDate(row.createdAt)}</TableCell>;
    }

    return (
      <TableCell key={column.id} sx={cellSx}>
        <Stack
          direction="row"
          spacing={0.25}
          onClick={(event) => event.stopPropagation()}
          sx={{ alignItems: 'center' }}
        >
          <Tooltip title="编辑" arrow>
            <IconButton size="small" aria-label="编辑" onClick={() => openEditUserDialog(row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="重置密码" arrow>
            <IconButton
              size="small"
              aria-label="重置密码"
              onClick={() => {
                setResetDialog({ id: row.id, username: row.username });
                setNewPassword('');
              }}
            >
              <LockReset fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="移出" arrow>
            <IconButton
              size="small"
              aria-label="移出"
              onClick={() => setRemoveUserConfirm({ id: row.id, username: row.username })}
            >
              <PersonRemove fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    );
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
            pl: 1,
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
            <Box
              sx={{
                width: depth >= 2 ? 5 : 30,
                mr: depth >= 2 ? 0 : 0.5,
                flex: depth >= 2 ? '0 0 5px' : '0 0 30px',
              }}
            />
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
          <Box
            data-organization-tree-branch
            sx={{
              position: 'relative',
              ml: 0,
              pl: '30px',
            }}
          >
            <Box
              data-organization-tree-guide
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '23px',
                transform: 'translateX(-50%)',
                width: '1px',
                bgcolor: '#dcdfe6',
              }}
            />
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '266px minmax(0, 1fr)' },
          alignItems: 'stretch',
          gap: '20px',
          minHeight: organizationWorkspaceHeight,
          height: organizationWorkspaceHeight,
        }}
      >
        <Box
          sx={{
            bgcolor: '#fff',
            border: '1px solid #e4e7ed',
            borderRadius: '5px',
            overflow: 'hidden',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
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
            <Box sx={{ px: 2, py: 5, textAlign: 'center', color: '#909399', flex: 1 }}>
              <Typography sx={{ mb: 2 }}>暂无组织架构</Typography>
              <Typography sx={{ mb: 2.5, fontSize: 13, lineHeight: 1.6 }}>
                创建公司主体后，可在公司节点下新增部门，再在部门下新增班组。
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => openCreateDialog(null)}>
                新增公司主体
              </Button>
            </Box>
          ) : (
            <List disablePadding sx={{ p: '10px', flex: 1, minHeight: 0, overflow: 'auto' }}>
              {departments.map((department) => renderNode(department, 0))}
            </List>
          )}
        </Box>

        <Box sx={{ minWidth: 0, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
                  onInput={(event) => updateCreatedFrom((event.target as HTMLInputElement).value)}
                  onChange={(event) => updateCreatedFrom(event.target.value)}
                  onMouseDown={openDatePickerWithoutSelection}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: filters.createdTo || undefined }}
                  fullWidth
                  sx={dateFieldSx}
                />
                <Typography sx={{ color: '#909399' }}>-</Typography>
                <TextField
                  type="date"
                  value={filters.createdTo}
                  onInput={(event) => updateCreatedTo((event.target as HTMLInputElement).value)}
                  onChange={(event) => updateCreatedTo(event.target.value)}
                  onMouseDown={openDatePickerWithoutSelection}
                  inputProps={{ min: filters.createdFrom || undefined }}
                  fullWidth
                  sx={dateFieldSx}
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
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                minHeight: 48,
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
                  新增
                </Button>
              </Stack>
            </Box>

            <TableContainer ref={tableContainerRef} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: totalTableWidth, minWidth: totalTableWidth }}>
                <colgroup>
                  {personnelColumns.map((column) => (
                    <col key={column.id} style={{ width: getColumnWidth(column) }} />
                  ))}
                </colgroup>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                    {personnelColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        padding={column.id === 'select' ? 'checkbox' : 'normal'}
                        align={column.align}
                        sx={{
                          width: getColumnWidth(column),
                          minWidth: column.minWidth,
                          position: 'relative',
                          userSelect: 'none',
                          pr: column.resizable ? 2 : undefined,
                        }}
                      >
                        {column.id === 'select' ? <Checkbox size="small" /> : column.label}
                        {column.resizable ? (
                          <Box
                            data-column-resizer
                            onMouseDown={(event) => beginColumnResize(event, column.id)}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              zIndex: 3,
                              width: 8,
                              height: '100%',
                              cursor: 'col-resize',
                              userSelect: 'none',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                right: 0,
                                transform: 'translateY(-50%)',
                                width: '1px',
                                height: 18,
                                bgcolor: '#dcdfe6',
                                borderRadius: '1px',
                                transition: 'background-color 120ms ease',
                              },
                              '&:hover': {
                                bgcolor: '#d1e9ff',
                              },
                              '&:hover::after': {
                                bgcolor: '#1890ff',
                              },
                            }}
                          />
                        ) : null}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={personnelColumns.length} align="center" sx={{ py: 7, color: '#909399' }}>
                        {selected ? '暂无人员' : '请选择左侧组织节点'}
                      </TableCell>
                    </TableRow>
                  ) : pagedRows.map((row) => (
                    <TableRow
                      key={`${row.departmentName}-${row.id}`}
                      hover
                      onClick={() => openUserDetailDrawer(row)}
                      sx={{ cursor: 'pointer', '& .MuiTableCell-root': tableBodyCellSx }}
                    >
                      {personnelColumns.map((column) => renderPersonnelCell(row, column))}
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
                borderTop: 'none',
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

      <Drawer anchor="right"
        open={userDrawerOpen}
        onClose={closeUserDetailDrawer}
        sx={appContentDrawerSx}
        slotProps={{ backdrop: { sx: appContentDrawerSx } }}
        PaperProps={{ sx: appContentDrawerPaperSx }}
      >
        <Box sx={{ width: { xs: '100vw', sm: 560 }, p: 2, bgcolor: '#f7f9fc', minHeight: '100%' }}>
          <Stack direction="row" justifyContent="flex-end">
            <IconButton size="small" onClick={closeUserDetailDrawer} aria-label="关闭详情">
              <Close />
            </IconButton>
          </Stack>

          {!selectedUser ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              请选择一名用户查看详情。
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
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
                  <DetailField label="创建人">{selectedUser.createdBy || '系统记录'}</DetailField>
                  <DetailField label="创建时间">{formatDateTime(selectedUser.createdAt)}</DetailField>
                  <DetailField label="更新人">{getUpdatedByValue(selectedUser, userAuditRecords)}</DetailField>
                  <DetailField label="更新时间">{formatDateTime(selectedUser.updatedAt)}</DetailField>
                </Box>
              </DetailSection>

              <DetailSection title="审计记录">
                <TableContainer sx={{ maxHeight: 320, overflowX: 'hidden' }}>
                  <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                        <TableCell sx={{ width: 72 }}>操作人</TableCell>
                        <TableCell sx={{ width: 72 }}>操作动作</TableCell>
                        <TableCell sx={{ width: 108 }}>操作时间</TableCell>
                        <TableCell sx={{ width: '24%' }}>变更前内容</TableCell>
                        <TableCell sx={{ width: '24%' }}>变更后内容</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userAuditRecords.map((record) => (
                        <TableRow key={record.id} sx={{ '& .MuiTableCell-root': tableBodyCellSx }}>
                          <TableCell>{record.operatorName}</TableCell>
                          <TableCell>{record.actionLabel}</TableCell>
                          <TableCell>{formatDateTime(record.operatedAt)}</TableCell>
                          <TableCell>
                            <Typography component="pre" variant="caption" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {record.beforeContent}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography component="pre" variant="caption" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {record.afterContent}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                label="岗位角色"
                value={userForm.roleIds[0] ?? ''}
                onChange={(event) => setUserForm({
                  ...userForm,
                  roleIds: event.target.value ? [String(event.target.value)] : [],
                })}
              >
                <MenuItem value="">未选择</MenuItem>
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

      <Dialog open={removeUserConfirm !== null} onClose={() => setRemoveUserConfirm(null)}>
        <DialogTitle>确认移出人员</DialogTitle>
        <DialogContent>
          确定要将用户 {removeUserConfirm?.username} 移出当前组织架构吗？用户信息、账号和角色会保留，所属组织将变为未分配。
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveUserConfirm(null)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => removeUserMutation.mutate()}
            disabled={removeUserMutation.isPending}
          >
            移出
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
