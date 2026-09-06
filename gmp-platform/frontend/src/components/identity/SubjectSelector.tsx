import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Apartment,
  Close,
  ExpandLess,
  ExpandMore,
  Group,
  Person,
  Search,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Tooltip,
} from '@mui/material';
import AppDialog from '@/components/AppDialog';
import { getDepartmentTree, getRoles, getUsers } from '@/api/identity';
import type { PageResult } from '@/types/common';

export type SubjectType = 'USER' | 'DEPARTMENT' | 'ROLE' | 'LEGACY';
export type DepartmentScope = 'SELF_AND_CHILDREN' | 'SELF_ONLY';
export type SubjectRef = {
  type: SubjectType;
  id: string;
  nameSnapshot: string;
  departmentScope?: DepartmentScope;
};

type UserOption = { id: string; name: string; username?: string };
type RoleOption = { id: string; name: string; code?: string };
type DepartmentOption = { id: string; name: string; path: string[] };
type DepartmentNode = { id: string | number; name: string; children?: DepartmentNode[] };

const CANDIDATE_PAGE_SIZE = 50;

function CandidateLoadingState({ count = 5 }: { count?: number }) {
  return <Stack spacing={0.75} sx={{ p: 0.75 }}>{Array.from({ length: count }, (_, index) => <Skeleton key={index} variant="rounded" height={44} animation="wave" />)}</Stack>;
}

const toId = (value: string | number) => String(value);

function flattenDepartments(nodes: DepartmentNode[], parentPath: string[] = []): DepartmentOption[] {
  return nodes.flatMap((node) => {
    const path = [...parentPath, node.name];
    return [
      { id: toId(node.id), name: node.name, path },
      ...flattenDepartments(node.children ?? [], path),
    ];
  });
}

async function fetchUsers(): Promise<(UserOption & { departmentIds: string[] })[]> {
  const result: (UserOption & { departmentIds: string[] })[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await getUsers({ page, size: 200, sort: 'createdAt', order: 'desc' });
    const body = response.data.data as PageResult<Record<string, unknown>>;
    result.push(...(body.content ?? []).filter((item) => String(item.username ?? '').toLowerCase() !== 'admin' && String(item.displayName ?? item.name ?? '').trim() !== '系统管理员').map((item) => ({
    id: toId(item.id as string | number),
    name: String(item.displayName || item.name || item.username || item.id),
    username: item.username ? String(item.username) : undefined,
    departmentIds: (Array.isArray(item.departmentIds) ? item.departmentIds : []).map((id) => String(id)),
    })));
    totalPages = Math.max(body.totalPages ?? 1, 1);
    page += 1;
  } while (page <= totalPages);
  return result;
}

async function fetchRoles(): Promise<RoleOption[]> {
  const result: RoleOption[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await getRoles({ page, size: 200, sort: 'createdAt', order: 'desc' });
    const body = response.data.data as PageResult<Record<string, unknown>>;
    result.push(...(body.content ?? []).filter((item) => String(item.code ?? '').toUpperCase() !== 'ADMIN' && String(item.name ?? '').trim() !== '系统管理员').map((item) => ({
    id: toId(item.id as string | number),
    name: String(item.name || item.code || item.id),
    code: item.code ? String(item.code) : undefined,
    })));
    totalPages = Math.max(body.totalPages ?? 1, 1);
    page += 1;
  } while (page <= totalPages);
  return result;
}

async function fetchDepartments(): Promise<{ tree: DepartmentNode[]; options: DepartmentOption[] }> {
  const response = await getDepartmentTree();
  const tree = (response.data.data ?? []) as DepartmentNode[];
  return { tree, options: flattenDepartments(tree) };
}

function DepartmentTree({
  nodes,
  selectedId,
  checked,
  onSelect,
  onToggle,
  level = 0,
  forceExpanded = false,
}: {
  nodes: DepartmentNode[];
  selectedId: string | null;
  checked: Set<string>;
  onSelect: (id: string) => void;
  onToggle?: (id: string) => void;
  level?: number;
  forceExpanded?: boolean;
}) {
  return (
    <Stack spacing={0.25}>
      {nodes.map((node) => <DepartmentTreeNode key={node.id} node={node} selectedId={selectedId} checked={checked} onSelect={onSelect} onToggle={onToggle} level={level} forceExpanded={forceExpanded} />)}
    </Stack>
  );
}

function DepartmentTreeNode({
  node,
  selectedId,
  checked,
  onSelect,
  onToggle,
  level,
  forceExpanded,
}: {
  node: DepartmentNode;
  selectedId: string | null;
  checked: Set<string>;
  onSelect: (id: string) => void;
  onToggle?: (id: string) => void;
  level: number;
  forceExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = Boolean(node.children?.length);
  const id = String(node.id);
  const isExpanded = forceExpanded || expanded;
  return (
    <Box>
      <ListItemButton selected={selectedId === id} title={node.name} onClick={() => onToggle ? onToggle(id) : onSelect(id)} sx={{ minHeight: 36, pl: 0.5, borderRadius: 0.75, minWidth: 0, overflow: 'hidden', '&.Mui-selected': { bgcolor: '#eaf3ff', color: '#1677ff' }, '&.Mui-selected:hover': { bgcolor: '#eaf3ff' } }}>
        {hasChildren ? <IconButton size="small" aria-label={isExpanded ? '收起部门' : '展开部门'} onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); setExpanded((current) => !current); }} sx={{ p: 0.25, mr: 0.25, color: '#909399' }}>{isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}</IconButton> : <Box sx={{ width: 28, flexShrink: 0 }} />}
        {onToggle ? <Checkbox size="small" checked={checked.has(`DEPARTMENT:${id}`)} onClick={(event) => { event.stopPropagation(); onToggle(id); }} /> : null}
        <ListItemText primary={node.name} sx={{ minWidth: 0 }} primaryTypographyProps={{ noWrap: true, sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
      </ListItemButton>
      {hasChildren && isExpanded ? <Box sx={{ pl: 1.5 }}><DepartmentTree nodes={node.children ?? []} selectedId={selectedId} checked={checked} onSelect={onSelect} onToggle={onToggle} level={level + 1} forceExpanded={forceExpanded} /></Box> : null}
    </Box>
  );
}

function filterDepartmentTree(nodes: DepartmentNode[], keyword: string, parentPath: string[] = []): DepartmentNode[] {
  if (!keyword.trim()) return nodes;
  const normalized = keyword.trim().toLowerCase();
  return nodes.reduce<DepartmentNode[]>((result, node) => {
    const path = [...parentPath, node.name];
    const children = filterDepartmentTree(node.children ?? [], keyword, path);
    if (path.join('/').toLowerCase().includes(normalized) || children.length) {
      result.push({ ...node, children });
    }
    return result;
  }, []);
}

function getDepartmentDescendantIds(nodes: DepartmentNode[], id: string): string[] {
  for (const node of nodes) {
    if (String(node.id) === id) {
      const ids: string[] = [String(node.id)];
      const collect = (children: DepartmentNode[]) => children.forEach((child) => {
        ids.push(String(child.id));
        collect(child.children ?? []);
      });
      collect(node.children ?? []);
      return ids;
    }
    const nested = getDepartmentDescendantIds(node.children ?? [], id);
    if (nested.length) return nested;
  }
  return [];
}

function subjectKey(subject: SubjectRef) {
  return `${subject.type}:${subject.id}`;
}

export function parseSubjectRefs(value?: string | null): SubjectRef[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SubjectRef =>
      item && ['USER', 'DEPARTMENT', 'ROLE', 'LEGACY'].includes(item.type) && item.id,
    );
  } catch {
    return [{ type: 'LEGACY', id: `legacy:${value.trim()}`, nameSnapshot: value.trim() }];
  }
}

export function serializeSubjectRefs(value: SubjectRef[]) {
  return JSON.stringify(value.map(({ type, id, nameSnapshot, departmentScope }) => ({
    type,
    id,
    nameSnapshot,
    ...(type === 'DEPARTMENT' ? { departmentScope: departmentScope ?? 'SELF_AND_CHILDREN' } : {}),
  })));
}

export function SubjectSelector({
  value,
  onChange,
  disabled = false,
  label = '选择主体',
  placeholder = '请选择用户、部门或角色',
}: {
  value: SubjectRef[];
  onChange: (value: SubjectRef[]) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SubjectType>('USER');
  const [search, setSearch] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SubjectRef[]>(value);
  const [candidatePage, setCandidatePage] = useState(1);
  const users = useQuery({ queryKey: ['subject-selector', 'users'], queryFn: fetchUsers, enabled: open });
  const roles = useQuery({ queryKey: ['subject-selector', 'roles'], queryFn: fetchRoles, enabled: open });
  const departments = useQuery({ queryKey: ['subject-selector', 'departments'], queryFn: fetchDepartments, enabled: open });

  const departmentData = departments.data;
  useEffect(() => {
    if (!selectedDepartmentId && departmentData?.tree?.[0]) setSelectedDepartmentId(String(departmentData.tree[0].id));
  }, [departmentData?.tree, selectedDepartmentId]);
  useEffect(() => {
    setCandidatePage(1);
  }, [tab, search, selectedDepartmentId]);
  const filteredDepartmentTree = useMemo(
    () => filterDepartmentTree(departmentData?.tree ?? [], search),
    [departmentData?.tree, search],
  );
  const options = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (tab === 'USER') {
      const selectedDepartments = selectedDepartmentId && departmentData?.tree
        ? getDepartmentDescendantIds(departmentData.tree, selectedDepartmentId)
        : [];
      return (users.data ?? []).filter((item) => (!selectedDepartments.length || item.departmentIds.some((id) => selectedDepartments.includes(id))) && (!keyword || `${item.name}${item.username ?? ''}`.toLowerCase().includes(keyword)));
    }
    if (tab === 'ROLE') return (roles.data ?? []).filter((item) => !keyword || `${item.name}${item.code ?? ''}`.toLowerCase().includes(keyword));
    return (departmentData?.options ?? []).filter((item) => !keyword || item.path.join('/').toLowerCase().includes(keyword));
  }, [departmentData?.options, departmentData?.tree, roles.data, search, selectedDepartmentId, tab, users.data]);
  const candidatePageCount = Math.max(Math.ceil(options.length / CANDIDATE_PAGE_SIZE), 1);
  const currentCandidatePage = Math.min(candidatePage, candidatePageCount);
  const visibleOptions = useMemo(
    () => options.slice((currentCandidatePage - 1) * CANDIDATE_PAGE_SIZE, currentCandidatePage * CANDIDATE_PAGE_SIZE),
    [currentCandidatePage, options],
  );

  const openDialog = () => {
    setDraft(value);
    setSearch('');
    if (!selectedDepartmentId && departmentData?.tree?.[0]) setSelectedDepartmentId(String(departmentData.tree[0].id));
    setOpen(true);
  };
  const toggle = (option: UserOption | RoleOption | DepartmentOption) => {
    const subject: SubjectRef = {
      type: tab,
      id: option.id,
      nameSnapshot: option.name,
      ...(tab === 'DEPARTMENT' ? { departmentScope: 'SELF_AND_CHILDREN' } : {}),
    };
    setDraft((current) => current.some((item) => subjectKey(item) === subjectKey(subject))
      ? current.filter((item) => subjectKey(item) !== subjectKey(subject))
      : [...current, subject]);
  };
  const selected = new Set(draft.map(subjectKey));
  const toggleDepartment = (id: string) => toggle({ id, name: departmentData?.options.find((item) => item.id === id)?.name ?? id, path: [] });

  return (
    <>
      <Box>
        <Button variant="outlined" size="small" fullWidth disabled={disabled} onClick={openDialog} sx={{ justifyContent: 'flex-start', textTransform: 'none', minHeight: 40 }}>
          {value.length ? `已选择 ${value.length} 个主体` : placeholder}
        </Button>
        {value.length ? (
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.75 }}>
            {value.map((subject) => (
              <Chip key={subjectKey(subject)} size="small" label={`${subject.nameSnapshot}${subject.type === 'DEPARTMENT' ? (subject.departmentScope === 'SELF_ONLY' ? '（本部门）' : '（含下级）') : subject.type === 'LEGACY' ? '（历史配置）' : ''}`} onDelete={disabled ? undefined : () => onChange(value.filter((item) => subjectKey(item) !== subjectKey(subject)))} />
            ))}
          </Stack>
        ) : null}
        <Typography variant="caption" color="text.secondary">{label}可选择用户、部门或角色</Typography>
      </Box>
      <AppDialog open={open} onClose={() => setOpen(false)} maxWidth={false} PaperProps={{ sx: { width: 'min(1180px, calc(100vw - 48px))', height: 'min(720px, calc(100vh - 72px))', maxHeight: 'calc(100vh - 72px)', borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', '@media (max-width: 760px)': { width: 'calc(100vw - 24px)', height: 'calc(100vh - 24px)', maxHeight: 'calc(100vh - 24px)' } } }}>
        <DialogTitle sx={{ px: 3, py: 2.25, borderBottom: '1px solid #e5e7eb', color: '#303133', fontSize: 18, lineHeight: 1.3, fontWeight: 600 }}>{label}</DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden', flex: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 460px', height: '100%', minHeight: 0, width: '100%', '@media (max-width: 1024px)': { gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 40%)' }, '@media (max-width: 760px)': { gridTemplateColumns: '1fr', gridTemplateRows: 'minmax(420px, 1fr) auto', overflow: 'auto' } }}>
            <Box sx={{ minWidth: 0, minHeight: 0, p: 2.5, pr: 1.75, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <Tabs value={tab} onChange={(_, next) => { setTab(next); setSearch(''); }} sx={{ minHeight: 44, borderBottom: '1px solid #e8ebef', '& .MuiTab-root': { minHeight: 44, px: 2, color: '#606266', textTransform: 'none', fontWeight: 600 }, '& .Mui-selected': { color: '#1677ff' }, '& .MuiTabs-indicator': { height: 2, borderRadius: 2 } }}>
                <Tab value="USER" icon={<Person fontSize="small" />} iconPosition="start" label="用户" />
                <Tab value="DEPARTMENT" icon={<Apartment fontSize="small" />} iconPosition="start" label="部门" />
                <Tab value="ROLE" icon={<Group fontSize="small" />} iconPosition="start" label="角色" />
              </Tabs>
              <TextField size="small" fullWidth value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === 'USER' ? '搜索姓名或账号' : tab === 'DEPARTMENT' ? '搜索部门' : '搜索角色'} sx={{ mt: 2, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 0.75 } }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#909399' }} /></InputAdornment> }} />
              {tab === 'USER' ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(224px, 0.72fr) minmax(0, 1.28fr)', border: '1px solid #e4e7ed', borderRadius: 0.75, mt: 1.5, flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: '#fff', '@media (max-width: 900px)': { gridTemplateColumns: 'minmax(204px, 0.72fr) minmax(0, 1.28fr)' }, '@media (max-width: 560px)': { gridTemplateColumns: '1fr', gridTemplateRows: 'minmax(160px, 0.7fr) minmax(240px, 1.3fr)' } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden', borderRight: '1px solid #e4e7ed', bgcolor: '#f8fafc', '@media (max-width: 560px)': { borderRight: 0, borderBottom: '1px solid #e4e7ed' } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.25, py: 1, minHeight: 40, borderBottom: '1px solid #e4e7ed' }}>
                      <Typography variant="caption" sx={{ color: '#606266', fontWeight: 600 }}>组织架构</Typography>
                      <Typography variant="caption" sx={{ color: '#909399' }}>{departmentData?.options.length ?? 0} 个部门</Typography>
                    </Stack>
                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
                      {departments.isLoading ? <CandidateLoadingState count={4} /> : departments.isError ? <Alert severity="error" sx={{ m: 1, fontSize: 12, py: 0.5 }}>组织架构加载失败</Alert> : departmentData?.tree?.length ? <DepartmentTree nodes={departmentData.tree} selectedId={selectedDepartmentId} checked={selected} onSelect={setSelectedDepartmentId} /> : <Typography color="text.secondary" variant="body2" sx={{ p: 1 }}>暂无组织架构</Typography>}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.25, py: 1, minHeight: 40, borderBottom: '1px solid #e4e7ed' }}>
                      <Typography variant="caption" sx={{ color: '#606266', fontWeight: 600 }}>{selectedDepartmentId ? '部门成员' : '全部用户'}</Typography>
                      <Typography variant="caption" sx={{ color: '#909399' }}>{options.length} 人</Typography>
                    </Stack>
                    <List dense sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 0.75 }}>
                      {users.isLoading ? <CandidateLoadingState /> : users.isError ? <Alert severity="error" sx={{ m: 1, fontSize: 12, py: 0.5 }}>用户列表加载失败</Alert> : visibleOptions.length ? visibleOptions.map((option) => {
                        const checked = selected.has(`USER:${option.id}`);
                        return <ListItemButton key={option.id} selected={checked} onClick={() => toggle(option)} sx={{ minHeight: 40, borderRadius: 0.75, mb: 0.25, px: 0.75, transition: 'background-color 140ms ease', '&:hover': { bgcolor: '#f3f7fc' }, '&.Mui-selected': { bgcolor: '#eaf3ff' }, '&.Mui-selected:hover': { bgcolor: '#eaf3ff' } }}><Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple /><ListItemText primary={(option as UserOption).username ? `${option.name} · ${(option as UserOption).username}` : option.name} primaryTypographyProps={{ noWrap: true, sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }} /></ListItemButton>;
                      }) : <Typography color="text.secondary" variant="body2" sx={{ p: 2, textAlign: 'center' }}>{search.trim() ? '暂无匹配用户' : '该部门暂无成员'}</Typography>}
                    </List>
                    {candidatePageCount > 1 ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5, borderTop: '1px solid #f0f2f5' }}><Pagination size="small" page={currentCandidatePage} count={candidatePageCount} onChange={(_, page) => setCandidatePage(page)} /></Box> : null}
                  </Box>
                </Box>
              ) : null}
              {tab === 'DEPARTMENT' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', border: '1px solid #e4e7ed', borderRadius: 0.75, mt: 1.5, flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: '#f8fafc' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.25, py: 1, minHeight: 40, borderBottom: '1px solid #e4e7ed', bgcolor: '#fff' }}><Typography variant="caption" sx={{ color: '#606266', fontWeight: 600 }}>选择部门</Typography><Typography variant="caption" sx={{ color: '#909399' }}>{options.length} 个部门</Typography></Stack>
                  <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>{departments.isLoading ? <CandidateLoadingState count={6} /> : departments.isError ? <Alert severity="error" sx={{ fontSize: 12, py: 0.5 }}>部门列表加载失败</Alert> : filteredDepartmentTree.length ? <DepartmentTree nodes={filteredDepartmentTree} selectedId={selectedDepartmentId} checked={selected} onSelect={setSelectedDepartmentId} onToggle={toggleDepartment} forceExpanded={Boolean(search.trim())} /> : <Typography color="text.secondary" variant="body2" sx={{ p: 2, textAlign: 'center' }}>{search.trim() ? '暂无匹配部门' : '暂无组织架构'}</Typography>}</Box>
                </Box>
              ) : null}
              {tab === 'ROLE' ? <Box sx={{ display: 'flex', flexDirection: 'column', border: '1px solid #e4e7ed', borderRadius: 0.75, mt: 1.5, flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: '#fff' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.25, py: 1, minHeight: 40, borderBottom: '1px solid #e4e7ed' }}><Typography variant="caption" sx={{ color: '#606266', fontWeight: 600 }}>选择角色</Typography><Typography variant="caption" sx={{ color: '#909399' }}>{options.length} 个角色</Typography></Stack>
                <List dense sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 0.75 }}>{roles.isLoading ? <CandidateLoadingState /> : roles.isError ? <Alert severity="error" sx={{ m: 1, fontSize: 12, py: 0.5 }}>角色列表加载失败</Alert> : visibleOptions.length ? visibleOptions.map((option) => {
                  const checked = selected.has(`ROLE:${option.id}`);
                  return <ListItemButton key={option.id} selected={checked} onClick={() => toggle(option)} sx={{ minHeight: 40, borderRadius: 0.75, mb: 0.25, px: 0.75, transition: 'background-color 140ms ease', '&:hover': { bgcolor: '#f3f7fc' }, '&.Mui-selected': { bgcolor: '#eaf3ff' }, '&.Mui-selected:hover': { bgcolor: '#eaf3ff' } }}><Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple /><ListItemText primary={(option as RoleOption).code ? `${option.name} · ${(option as RoleOption).code}` : option.name} primaryTypographyProps={{ noWrap: true, sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }} /></ListItemButton>;
                }) : <Typography color="text.secondary" variant="body2" sx={{ p: 2, textAlign: 'center' }}>{search.trim() ? '暂无匹配角色' : '暂无角色'}</Typography>}</List>
                {candidatePageCount > 1 ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5, borderTop: '1px solid #f0f2f5' }}><Pagination size="small" page={currentCandidatePage} count={candidatePageCount} onChange={(_, page) => setCandidatePage(page)} /></Box> : null}
              </Box> : null}
            </Box>
            <Box sx={{ borderLeft: '1px solid #e4e7ed', bgcolor: '#f8fafc', p: 2.25, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, '@media (max-width: 760px)': { borderLeft: 0, borderTop: '1px solid #e4e7ed', minHeight: 260 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25, minHeight: 32 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#303133' }}>已选择 {draft.length}</Typography>
                <Button size="small" color="inherit" disabled={!draft.length} onClick={() => setDraft([])} sx={{ minWidth: 0, px: 0.5, color: '#909399', fontWeight: 500, '&:hover': { color: '#d4380d', bgcolor: 'transparent' } }}>清空</Button>
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.25 }}>
                {(['USER', 'DEPARTMENT', 'ROLE', 'LEGACY'] as SubjectType[]).map((type) => {
                  const items = draft.filter((item) => item.type === type);
                  if (!items.length) return null;
                  return (
                    <Box key={type} sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.75, fontWeight: 600 }}>
                        {type === 'USER' ? '用户' : type === 'DEPARTMENT' ? '部门' : type === 'ROLE' ? '角色' : '历史配置'}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: type === 'DEPARTMENT' ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: 0.75, '@media (max-width: 1024px)': { gridTemplateColumns: type === 'DEPARTMENT' ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))' }, '@media (max-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }, '@media (max-width: 460px)': { gridTemplateColumns: '1fr' } }}>
                        {items.map((item) => (
                          <Box key={subjectKey(item)} title={item.nameSnapshot} sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 0.75, px: 0.75, py: 0.625, minWidth: 0, minHeight: type === 'DEPARTMENT' ? 66 : 36, display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'border-color 140ms ease, background-color 140ms ease', '&:hover': { borderColor: '#b9c8d8' } }}>
                            <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
                              <Typography variant="body2" noWrap sx={{ color: '#303133', minWidth: 0, flex: 1, fontSize: 12 }}>{item.nameSnapshot}</Typography>
                              <Tooltip title="移除" arrow>
                                <IconButton size="small" aria-label={`移除${item.nameSnapshot}`} onClick={() => setDraft((current) => current.filter((entry) => subjectKey(entry) !== subjectKey(item)))} sx={{ flexShrink: 0, width: 24, height: 24, color: '#909399', '&:hover': { color: '#d4380d', bgcolor: '#fff1f0' } }}>
                                  <Close sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            {type === 'DEPARTMENT' ? (
                              <ToggleButtonGroup size="small" exclusive fullWidth value={item.departmentScope ?? 'SELF_AND_CHILDREN'} onChange={(_, next) => next && setDraft((current) => current.map((entry) => subjectKey(entry) === subjectKey(item) ? { ...entry, departmentScope: next } : entry))} sx={{ mt: 0.5, '& .MuiToggleButton-root': { flex: 1, minWidth: 0, py: 0.2, px: 0, borderColor: '#e4e7ed', color: '#606266', textTransform: 'none', fontSize: 10, lineHeight: 1.4, whiteSpace: 'nowrap' }, '& .Mui-selected': { bgcolor: '#eef5ff !important', color: '#1677ff !important' } }}>
                                <ToggleButton value="SELF_AND_CHILDREN">含下级</ToggleButton>
                                <ToggleButton value="SELF_ONLY">仅本部门</ToggleButton>
                              </ToggleButtonGroup>
                            ) : null}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
                {!draft.length ? <Box sx={{ height: '100%', minHeight: 180, display: 'grid', placeItems: 'center', textAlign: 'center', px: 3 }}><Typography variant="body2" color="text.secondary">从左侧勾选用户、部门或角色</Typography></Box> : null}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#606266' }}>取消</Button>
          <Button variant="contained" onClick={() => { onChange(draft); setOpen(false); }} sx={{ minWidth: 84, boxShadow: 'none' }}>确定</Button>
        </DialogActions>
      </AppDialog>
    </>
  );
}
