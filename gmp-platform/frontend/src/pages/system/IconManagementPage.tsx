import { type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
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
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Delete,
  DragIndicator,
  Edit,
  Folder,
  ImageOutlined,
  InfoOutlined,
  Search,
  UploadFile,
} from '@mui/icons-material';
import {
  batchDeleteIcons,
  createIconGroup,
  deleteIcon,
  deleteIconGroup,
  getIconPage,
  getIconGroups,
  reorderIconGroups,
  reorderIcons,
  updateIcon,
  updateIconGroup,
  uploadIcon,
  type IconAsset,
  type IconGroup,
} from '@/api/system';
import { renderBuiltinIcon } from '@/utils/builtinIcons';
import { getIconAssetPreviewUrl } from '@/utils/iconAssets';

const COLORS = {
  primary: '#1890ff',
  primaryLight: '#e8f4ff',
  textPrimary: '#303133',
  textSecondary: '#606266',
  textDisabled: '#909399',
  divider: '#e4e7ed',
  pageBg: '#f6f8f9',
};

const fieldSx = {
  '& .MuiInputBase-root': { height: 40 },
};

const toolbarButtonSx = {
  height: 40,
  minWidth: 100,
  whiteSpace: 'nowrap',
  '& .MuiButton-startIcon': { mr: 0.75 },
};

const ICON_PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;
const ICON_PREVIEW_SIZE = 42;
const USER_UPLOAD_TAG = '用户上传';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

function toId(value: string | number | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

function normalizeTags(tags: IconAsset['tags']): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function isBuiltinIcon(icon: IconAsset) {
  return icon.source === 'BUILTIN';
}

function getIconDisplayTags(icon: IconAsset) {
  const tags = normalizeTags(icon.tags);
  if (tags.length > 0) return tags;
  return isBuiltinIcon(icon) ? [] : [USER_UPLOAD_TAG];
}

function isBuiltinGroup(group: IconGroup) {
  return Boolean(group.builtin);
}

function IconPreview({ icon, builtinIcon }: { icon: IconAsset; builtinIcon: ReactNode }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const previewSrc = isBuiltinIcon(icon) ? '' : getIconAssetPreviewUrl(icon);

  useEffect(() => {
    setLoadFailed(false);
    return undefined;
  }, [previewSrc]);

  if (builtinIcon) return <>{builtinIcon}</>;
  if (previewSrc && !loadFailed) {
    return (
      <Box
        component="img"
        src={previewSrc}
        alt={icon.name}
        onError={() => setLoadFailed(true)}
        sx={{
          width: ICON_PREVIEW_SIZE,
          height: ICON_PREVIEW_SIZE,
          maxWidth: ICON_PREVIEW_SIZE,
          maxHeight: ICON_PREVIEW_SIZE,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    );
  }
  return <ImageOutlined sx={{ color: COLORS.textDisabled, fontSize: ICON_PREVIEW_SIZE }} />;
}

interface GroupDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  group?: IconGroup;
  name: string;
}

interface DeleteGroupConfirmState {
  open: boolean;
  group?: IconGroup;
}

export default function IconManagementPage() {
  const queryClient = useQueryClient();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const pointerDraggedGroupIdRef = useRef('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [keyword, setKeyword] = useState('');
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
  const [draggedGroupId, setDraggedGroupId] = useState<string>('');
  const [draggedIconId, setDraggedIconId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [groupDialog, setGroupDialog] = useState<GroupDialogState>({ open: false, mode: 'create', name: '' });
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<DeleteGroupConfirmState>({ open: false });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const groupsQuery = useQuery({
    queryKey: ['system', 'icon-groups'],
    queryFn: getIconGroups,
  });
  const iconsQuery = useQuery({
    queryKey: ['system', 'icons', selectedGroupId, keyword, page, pageSize],
    queryFn: () => getIconPage({ groupId: selectedGroupId, keyword: keyword.trim(), page, size: pageSize }),
  });

  const groups = groupsQuery.data ?? [];
  const orderedGroups = useMemo(() => [...groups].sort((group, nextGroup) => {
    if (isBuiltinGroup(group)) return -1;
    if (isBuiltinGroup(nextGroup)) return 1;
    return (group.sortOrder ?? 0) - (nextGroup.sortOrder ?? 0);
  }), [groups]);
  const builtinGroupId = toId(orderedGroups.find(isBuiltinGroup)?.id);
  const iconsPage = iconsQuery.data;
  const icons = iconsPage?.content ?? [];
  const visibleIcons = useMemo(() => {
    if (selectedGroupId === 'ALL') return icons;
    if (selectedGroupId === builtinGroupId) return icons.filter(isBuiltinIcon);
    return icons.filter((icon) => !isBuiltinIcon(icon));
  }, [builtinGroupId, icons, selectedGroupId]);
  const selectedCount = selectedIconIds.size;
  const selectedHasBuiltinIcon = visibleIcons.some((icon) => selectedIconIds.has(toId(icon.id)) && isBuiltinIcon(icon));
  const batchDeleteDisabled = selectedCount === 0 || selectedHasBuiltinIcon;

  useEffect(() => {
    const visibleIconIds = new Set(visibleIcons.map((icon) => toId(icon.id)));
    setSelectedIconIds((current) => {
      const next = new Set(Array.from(current).filter((iconId) => visibleIconIds.has(iconId)));
      return next.size === current.size ? current : next;
    });
  }, [visibleIcons]);

  useEffect(() => {
    setPage(1);
    setSelectedIconIds(new Set());
  }, [keyword, pageSize, selectedGroupId]);

  useEffect(() => {
    const clearPointerDrag = () => {
      pointerDraggedGroupIdRef.current = '';
      setDraggedGroupId('');
    };
    window.addEventListener('pointerup', clearPointerDrag);
    return () => window.removeEventListener('pointerup', clearPointerDrag);
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const invalidateIconData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['system', 'icon-groups'] }),
      queryClient.invalidateQueries({ queryKey: ['system', 'icons'] }),
    ]);
  };

  const groupSaveMutation = useMutation({
    mutationFn: () => {
      const name = groupDialog.name.trim();
      if (!name) throw new Error('分组名称不能为空');
      return groupDialog.mode === 'edit' && groupDialog.group
        ? updateIconGroup(groupDialog.group.id, { name })
        : createIconGroup({ name });
    },
    onSuccess: async () => {
      setGroupDialog({ open: false, mode: 'create', name: '' });
      await invalidateIconData();
      showSnackbar('分组已保存', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '分组保存失败'), 'error'),
  });

  const groupDeleteMutation = useMutation({
    mutationFn: ({ group, cascade }: { group: IconGroup; cascade: boolean }) => deleteIconGroup(group.id, { cascade }),
    onSuccess: async () => {
      setDeleteGroupConfirm({ open: false });
      setSelectedGroupId('ALL');
      await invalidateIconData();
      showSnackbar('分组已删除', 'success');
    },
    onError: (error, variables) => {
      const message = getApiErrorMessage(error, '分组删除失败');
      if (!variables.cascade && message.includes('分组下存在图标')) {
        setDeleteGroupConfirm({ open: true, group: variables.group });
        return;
      }
      showSnackbar(message, 'error');
    },
  });

  const getCustomUploadGroupId = () => {
    if (selectedGroupId === 'ALL') return undefined;
    if (selectedGroupId === builtinGroupId) {
      throw new Error('系统内置图标分组不能放入自定义图标');
    }
    return selectedGroupId;
  };

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const groupId = getCustomUploadGroupId();
      return Promise.all(files.map((file) => uploadIcon({ file, groupId })));
    },
    onSuccess: async (uploadedIcons) => {
      await invalidateIconData();
      showSnackbar(`图标上传成功，共 ${uploadedIcons.length} 个`, 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '图标上传失败'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIcon,
    onSuccess: async () => {
      await invalidateIconData();
      showSnackbar('图标已删除', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '图标删除失败'), 'error'),
  });

  const batchDeleteMutation = useMutation({
    mutationFn: () => batchDeleteIcons(Array.from(selectedIconIds)),
    onSuccess: async () => {
      setSelectedIconIds(new Set());
      await invalidateIconData();
      showSnackbar('批量删除成功', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '批量删除失败'), 'error'),
  });

  const moveIconMutation = useMutation({
    mutationFn: ({ icon, groupId }: { icon: IconAsset; groupId: string }) => updateIcon(icon.id, { groupId: groupId === 'ALL' ? null : groupId }),
    onSuccess: async () => {
      await invalidateIconData();
      showSnackbar('图标分组已更新', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '图标移动失败'), 'error'),
  });

  const groupOrderMutation = useMutation({
    mutationFn: reorderIconGroups,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system', 'icon-groups'] }),
    onError: (error) => showSnackbar(getApiErrorMessage(error, '分组排序失败'), 'error'),
  });

  const iconOrderMutation = useMutation({
    mutationFn: reorderIcons,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system', 'icons'] }),
    onError: (error) => showSnackbar(getApiErrorMessage(error, '图标排序失败'), 'error'),
  });

  const openCreateGroupDialog = () => setGroupDialog({ open: true, mode: 'create', name: '' });
  const openEditGroupDialog = (group: IconGroup) => setGroupDialog({ open: true, mode: 'edit', group, name: group.name });
  const requestDeleteGroup = (group: IconGroup) => {
    if ((group.iconCount ?? 0) > 0) {
      setDeleteGroupConfirm({ open: true, group });
      return;
    }
    groupDeleteMutation.mutate({ group, cascade: false });
  };
  const confirmCascadeDeleteGroup = () => {
    if (!deleteGroupConfirm.group) return;
    groupDeleteMutation.mutate({ group: deleteGroupConfirm.group, cascade: true });
  };
  const openUploadDialog = () => {
    if (selectedGroupId === builtinGroupId) {
      showSnackbar('系统内置图标分组不能放入自定义图标', 'error');
      return;
    }
    setUploadDialogOpen(true);
  };
  const confirmUploadDialog = () => {
    setUploadDialogOpen(false);
    uploadInputRef.current?.click();
  };

  const handleUploadChange = (files: FileList | null) => {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0) return;
    uploadMutation.mutate(nextFiles);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  const toggleIcon = (iconId: string) => {
    setSelectedIconIds((current) => {
      const next = new Set(current);
      if (next.has(iconId)) next.delete(iconId);
      else next.add(iconId);
      return next;
    });
  };

  const reorderGroupsByTarget = (activeGroupId: string, targetGroupId: string) => {
    if (!activeGroupId || activeGroupId === targetGroupId || targetGroupId === 'ALL') return false;
    const currentIds = orderedGroups.filter((group) => !isBuiltinGroup(group)).map((group) => toId(group.id));
    const draggedIndex = currentIds.indexOf(activeGroupId);
    const targetIndex = currentIds.indexOf(targetGroupId);
    if (draggedIndex < 0 || targetIndex < 0) return false;
    const nextIds = [...currentIds];
    const [dragged] = nextIds.splice(draggedIndex, 1);
    nextIds.splice(targetIndex, 0, dragged);
    groupOrderMutation.mutate(nextIds);
    return true;
  };

  const startGroupPointerDrag = (event: ReactPointerEvent<HTMLElement>, groupId: string, builtinGroup: boolean) => {
    if (event.button !== 0 || builtinGroup) return;
    pointerDraggedGroupIdRef.current = groupId;
    setDraggedGroupId(groupId);
  };

  const handleGroupPointerUp = (targetGroupId: string) => {
    const activeGroupId = pointerDraggedGroupIdRef.current || draggedGroupId;
    reorderGroupsByTarget(activeGroupId, targetGroupId);
    pointerDraggedGroupIdRef.current = '';
    setDraggedGroupId('');
  };

  const handleGroupDrop = (event: ReactDragEvent<HTMLElement>, targetGroupId: string) => {
    event.preventDefault();
    const transferredId = event.dataTransfer.getData('text/plain');
    const activeIconId = draggedIconId || transferredId;
    if (activeIconId && icons.some((item) => toId(item.id) === activeIconId)) {
      const icon = icons.find((item) => toId(item.id) === activeIconId);
      if (icon && isBuiltinIcon(icon)) {
        showSnackbar('系统内置图标不能移动', 'error');
        setDraggedIconId('');
        return;
      }
      if (targetGroupId === builtinGroupId) {
        showSnackbar('系统内置图标分组不能放入自定义图标', 'error');
        setDraggedIconId('');
        return;
      }
      if (icon) moveIconMutation.mutate({ icon, groupId: targetGroupId });
      setDraggedIconId('');
      return;
    }

    const activeGroupId = draggedGroupId || transferredId;
    reorderGroupsByTarget(activeGroupId, targetGroupId);
    setDraggedGroupId('');
    pointerDraggedGroupIdRef.current = '';
  };

  const handleIconDrop = (event: ReactDragEvent<HTMLElement>, targetIconId: string) => {
    event.preventDefault();
    if (!draggedIconId || draggedIconId === targetIconId) return;
    if (selectedGroupId === 'ALL' || selectedGroupId === builtinGroupId) {
      setDraggedIconId('');
      return;
    }
    const sortableIcons = visibleIcons.filter((icon) => !isBuiltinIcon(icon));
    const currentIds = sortableIcons.map((icon) => toId(icon.id));
    const draggedIndex = currentIds.indexOf(draggedIconId);
    const targetIndex = currentIds.indexOf(targetIconId);
    if (draggedIndex < 0 || targetIndex < 0) return;
    const nextIds = [...currentIds];
    const [dragged] = nextIds.splice(draggedIndex, 1);
    nextIds.splice(targetIndex, 0, dragged);
    iconOrderMutation.mutate({ groupId: selectedGroupId, iconIds: nextIds });
    setDraggedIconId('');
  };

  const renderIconState = () => {
    if (iconsQuery.isLoading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: 260 }} spacing={1}>
          <CircularProgress size={28} />
          <Typography sx={{ color: COLORS.textDisabled, fontSize: 14 }}>图标加载中</Typography>
        </Stack>
      );
    }

    if (iconsQuery.isError) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: 260, p: 2 }}>
          <Alert severity="error" sx={{ width: '100%', maxWidth: 520 }}>图标加载失败，请刷新后重试</Alert>
        </Stack>
      );
    }

    if (visibleIcons.length === 0) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: 260, color: COLORS.textDisabled }} spacing={1} data-empty-state="empty">
          <ImageOutlined sx={{ fontSize: 42 }} />
          <Typography sx={{ fontSize: 14 }}>暂无图标素材</Typography>
        </Stack>
      );
    }

    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(154px, 1fr))',
          gap: 1.5,
          alignContent: 'start',
        }}
      >
        {visibleIcons.map((icon) => {
          const iconId = toId(icon.id);
          const selected = selectedIconIds.has(iconId);
          const builtin = isBuiltinIcon(icon);
          const builtinIcon = builtin ? renderBuiltinIcon(icon.builtinKey, { sx: { color: COLORS.textSecondary, fontSize: ICON_PREVIEW_SIZE } }) : null;
          const tags = getIconDisplayTags(icon);
          return (
            <Box
              key={iconId}
              draggable={!builtin}
              onDragStart={(event) => {
                if (builtin) return;
                event.dataTransfer.setData('text/plain', iconId);
                setDraggedIconId(iconId);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleIconDrop(event, iconId)}
              sx={{
                border: `1px solid ${selected ? COLORS.primary : COLORS.divider}`,
                borderRadius: 1,
                bgcolor: '#fff',
                minHeight: 154,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'box-shadow 160ms ease, border-color 160ms ease, transform 160ms ease',
                '&:hover': {
                  borderColor: selected ? COLORS.primary : '#b8c7d9',
                  boxShadow: '0 8px 18px rgba(15, 35, 55, 0.14)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 34, px: 0.5, borderBottom: `1px solid ${COLORS.divider}` }}>
                <Checkbox size="small" checked={selected} onChange={() => toggleIcon(iconId)} inputProps={{ 'aria-label': `选择${icon.name}` }} />
                <Stack direction="row" spacing={0.25}>
                  <Tooltip title={builtin ? '系统内置图标不能移动' : '拖拽排序或移动到分组'} arrow>
                    <span>
                    <IconButton size="small" disabled={builtin} sx={{ cursor: builtin ? 'default' : 'grab' }}>
                      <DragIndicator fontSize="small" />
                    </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={builtin ? '系统内置图标不能删除' : '删除图标'} arrow>
                    <span>
                      <IconButton size="small" color="error" disabled={builtin} onClick={() => deleteMutation.mutate(icon.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
              <Stack alignItems="center" justifyContent="center" sx={{ height: 76, bgcolor: COLORS.pageBg }}>
                <IconPreview icon={icon} builtinIcon={builtinIcon} />
              </Stack>
              <Stack spacing={0.75} sx={{ p: 1.25, minWidth: 0 }}>
                <Typography title={icon.name} sx={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {icon.name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ minHeight: 22, overflow: 'hidden' }}>
                  {tags.slice(0, 2).map((tag) => <Chip key={tag} size="small" label={tag} sx={{ height: 20, fontSize: 12 }} />)}
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box
      data-system-icon-management-page
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '260px minmax(0, 1fr)' },
        gridTemplateRows: { xs: '260px minmax(0, 1fr)', lg: 'minmax(0, 1fr)' },
        gap: 2,
        height: 'calc(100vh - 142px)',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 48, px: 2, borderBottom: `1px solid ${COLORS.divider}` }}>
          <Typography sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>图标分组</Typography>
          <Tooltip title="新增分组" arrow>
            <IconButton size="small" color="primary" onClick={openCreateGroupDialog} aria-label="新增分组">
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack spacing={0.5} sx={{ p: 1, flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Button
            draggable={false}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleGroupDrop(event, 'ALL')}
            startIcon={<Folder />}
            onClick={() => setSelectedGroupId('ALL')}
            sx={{
              justifyContent: 'flex-start',
              height: 40,
              color: selectedGroupId === 'ALL' ? COLORS.primary : COLORS.textPrimary,
              bgcolor: selectedGroupId === 'ALL' ? COLORS.primaryLight : 'transparent',
            }}
          >
            全部图标
          </Button>
          {groupsQuery.isLoading && <CircularProgress size={22} sx={{ alignSelf: 'center', mt: 2 }} />}
          {groupsQuery.isError && <Alert severity="error">分组加载失败</Alert>}
          {orderedGroups.map((group) => {
            const groupId = toId(group.id);
            const selected = selectedGroupId === groupId;
            const builtinGroup = isBuiltinGroup(group);
            return (
              <Box
                key={groupId}
                draggable={!builtinGroup}
                onDragStart={(event) => {
                  if (builtinGroup) return;
                  event.dataTransfer.setData('text/plain', groupId);
                  setDraggedGroupId(groupId);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleGroupDrop(event, groupId)}
                onPointerDown={(event) => startGroupPointerDrag(event, groupId, builtinGroup)}
                onPointerUp={() => handleGroupPointerUp(groupId)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 40,
                  px: 1,
                  borderRadius: 1,
                  color: selected ? COLORS.primary : COLORS.textPrimary,
                  bgcolor: selected ? COLORS.primaryLight : 'transparent',
                  '&:hover': { bgcolor: COLORS.primaryLight },
                }}
              >
                <DragIndicator sx={{ mr: 0.5, color: COLORS.textDisabled, fontSize: 18, cursor: builtinGroup ? 'default' : 'grab', opacity: builtinGroup ? 0.35 : 1 }} />
                <Button
                  draggable={false}
                  startIcon={<Folder />}
                  onClick={() => setSelectedGroupId(groupId)}
                  sx={{ justifyContent: 'flex-start', flex: 1, minWidth: 0, px: 0.5, color: 'inherit' }}
                >
                  <Typography component="span" noWrap sx={{ fontSize: 14 }}>{group.name}</Typography>
                </Button>
                <Typography sx={{ color: COLORS.textDisabled, fontSize: 12, mr: 0.5 }}>{group.iconCount ?? 0}</Typography>
                {!builtinGroup && (
                  <>
                    <Tooltip title="重命名" arrow><IconButton size="small" onClick={() => openEditGroupDialog(group)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="删除分组" arrow><IconButton size="small" color="error" onClick={() => requestDeleteGroup(group)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ p: 2, borderBottom: `1px solid ${COLORS.divider}`, flexShrink: 0 }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
            <TextField
              size="small"
              placeholder="关键词搜索"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              sx={{ ...fieldSx, width: { xs: '100%', sm: 200 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ minWidth: 0, color: COLORS.textSecondary, fontSize: 13 }}
            >
              <InfoOutlined sx={{ color: COLORS.textDisabled, fontSize: 18, flexShrink: 0 }} />
              <Typography sx={{ color: 'inherit', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>
                可拖拽图标到左侧分组移动，或在网格内拖拽排序。
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexShrink: 0, flexWrap: 'nowrap' }}>
            <input ref={uploadInputRef} hidden type="file" multiple accept="image/svg+xml,image/png,image/jpeg,image/gif,image/webp" onChange={(event) => handleUploadChange(event.target.files)} />
            <Tooltip title="上传图标" arrow><Button variant="contained" startIcon={<UploadFile />} onClick={openUploadDialog} sx={toolbarButtonSx}>上传图标</Button></Tooltip>
            <Tooltip title={selectedHasBuiltinIcon ? '系统内置图标不能删除' : selectedCount === 0 ? '请先选择图标' : '批量删除'} arrow>
              <span>
                <Button color="error" variant="outlined" startIcon={<Delete />} disabled={batchDeleteDisabled} onClick={() => batchDeleteMutation.mutate()} sx={toolbarButtonSx}>
                  批量删除{selectedCount > 0 ? `(${selectedCount})` : ''}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
        {renderIconState()}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ minHeight: 48, px: 2, borderTop: `1px solid ${COLORS.divider}`, flexShrink: 0 }}
        >
          <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
            共 {iconsPage?.totalElements ?? 0} 条数据
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
            <Pagination
              count={Math.max(iconsPage?.totalPages ?? 1, 1)}
              page={Math.min(page, Math.max(iconsPage?.totalPages ?? 1, 1))}
              onChange={(_, nextPage) => setPage(nextPage)}
              size="small"
              color="primary"
            />
            <TextField
              select
              size="small"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              sx={{ ...fieldSx, width: 110 }}
              InputProps={{
                startAdornment: <InputAdornment position="start" sx={{ mr: 0 }}>每页</InputAdornment>,
              }}
            >
              {ICON_PAGE_SIZE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </Box>

      <Dialog open={groupDialog.open} onClose={() => setGroupDialog((current) => ({ ...current, open: false }))} fullWidth maxWidth="xs">
        <DialogTitle>{groupDialog.mode === 'edit' ? '重命名分组' : '新增分组'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label="分组名称"
            fullWidth
            value={groupDialog.name}
            onChange={(event) => setGroupDialog((current) => ({ ...current, name: event.target.value }))}
            sx={fieldSx}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupDialog((current) => ({ ...current, open: false }))}>取消</Button>
          <Button variant="contained" onClick={() => groupSaveMutation.mutate()} disabled={groupSaveMutation.isPending}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>上传图标说明</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography sx={{ color: COLORS.textPrimary, fontSize: 14 }}>请上传图标素材文件。</Typography>
            <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>支持 .svg、.png、.jpg、.jpeg、.gif、.webp 格式。</Typography>
            <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>单个文件大小不超过 2MB，建议优先使用透明背景 SVG 或 PNG。</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={confirmUploadDialog}>选择文件</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteGroupConfirm.open} onClose={() => setDeleteGroupConfirm({ open: false })} fullWidth maxWidth="xs">
        <DialogTitle>删除图标分组</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <Alert severity="warning">
              当前分组下已有 {deleteGroupConfirm.group?.iconCount ?? 0} 个图标，删除后会将当前分类以及分类下所有图标全部删除。
            </Alert>
            <Typography sx={{ color: COLORS.textPrimary, fontSize: 14 }}>
              确认删除分组“{deleteGroupConfirm.group?.name ?? ''}”以及该分组下所有图标吗？
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGroupConfirm({ open: false })}>取消</Button>
          <Button color="error" variant="contained" onClick={confirmCascadeDeleteGroup} disabled={groupDeleteMutation.isPending}>确认删除</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
