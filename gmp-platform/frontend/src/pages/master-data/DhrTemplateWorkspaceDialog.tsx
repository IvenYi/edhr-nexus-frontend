import {
  AddRounded,
  ArticleOutlined,
  ChevronRightRounded,
  CloseRounded,
  ContentCopyRounded,
  DeleteOutlineRounded,
  DriveFileRenameOutlineRounded,
  ExpandMoreRounded,
  FolderOpenOutlined,
  FolderOutlined,
  NoteAddOutlined,
  PostAddRounded,
  PublishRounded,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type MouseEvent, type ReactElement } from 'react';
import {
  createDhrDirectory,
  createDhrEvidenceItem,
  createDhrTemplateVersion,
  deleteDhrDirectory,
  deleteDhrEvidenceItem,
  getDhrFormTemplateOptions,
  getDhrTemplateComposition,
  getDhrTemplateWorkspace,
  publishDhrTemplateVersion,
  updateDhrDirectory,
  updateDhrEvidenceItem,
  type DhrDirectoryRecord,
  type DhrFormTemplateOption,
  type DhrTemplateVersionRecord,
  type TemplateModelingRecord,
} from '@/api/template-modeling';

interface DirectoryNode extends DhrDirectoryRecord {
  children: DirectoryNode[];
}

interface DirectoryDialogState {
  mode: 'create' | 'edit';
  parentId?: string | null;
  target?: DhrDirectoryRecord;
}

const headerCellSx = {
  height: 44,
  py: 0,
  bgcolor: '#f5f7fa',
  color: '#606266',
  fontWeight: 600,
  borderBottom: '1px solid #e4e7ed',
};

const bodyCellSx = {
  height: 40,
  py: 0,
  borderBottom: 'none',
  boxShadow: 'inset 0 -1px 0 #ebeef5',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

function versionStatusLabel(status?: string) {
  if (status === 'ACTIVE') return '启用';
  if (status === 'DISABLED') return '停用';
  return '草稿';
}

function versionStatusSx(status?: string) {
  if (status === 'ACTIVE') return { color: '#1f8f4d', bgcolor: '#f0f9eb', borderColor: '#b7eb8f' };
  if (status === 'DISABLED') return { color: '#909399', bgcolor: '#f5f7fa', borderColor: '#dcdfe6' };
  return { color: '#b88230', bgcolor: '#fdf6ec', borderColor: '#f3d19e' };
}

function VersionStatus({ status }: { status?: string }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', height: 22, px: 0.75, border: '1px solid', borderRadius: '4px', fontSize: 12, ...versionStatusSx(status) }}>
      {versionStatusLabel(status)}
    </Box>
  );
}

function buildDirectoryTree(directories: DhrDirectoryRecord[]) {
  const nodes = new Map<string, DirectoryNode>();
  directories.forEach((directory) => nodes.set(directory.id, { ...directory, children: [] }));
  const roots: DirectoryNode[] = [];
  nodes.forEach((node) => {
    const parent = node.parentId ? nodes.get(node.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  const sortNodes = (items: DirectoryNode[]) => {
    items.sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
    items.forEach((item) => sortNodes(item.children));
  };
  sortNodes(roots);
  return roots;
}

function DirectoryTree({
  nodes,
  selectedId,
  editable,
  onSelect,
  onAddChild,
  onRename,
  onDelete,
}: {
  nodes: DirectoryNode[];
  selectedId?: string | null;
  editable: boolean;
  onSelect: (directory: DhrDirectoryRecord) => void;
  onAddChild: (directory: DhrDirectoryRecord) => void;
  onRename: (directory: DhrDirectoryRecord) => void;
  onDelete: (directory: DhrDirectoryRecord) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedIds(new Set(nodes.filter((node) => node.children.length > 0).map((node) => node.id)));
  }, [nodes]);

  const renderNode = (node: DirectoryNode, depth: number): ReactElement => {
    const hasChildren = node.children.length > 0;
    const expanded = expandedIds.has(node.id);
    const selected = selectedId === node.id;
    const toggle = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setExpandedIds((current) => {
        const next = new Set(current);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    };
    const stopAnd = (callback: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      callback();
    };
    return (
      <Box key={node.id}>
        <Box
          role="treeitem"
          aria-selected={selected}
          onClick={() => onSelect(node)}
          sx={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) auto', alignItems: 'center', minHeight: 36, pl: `${8 + depth * 20}px`, pr: 0.5, cursor: 'pointer', bgcolor: selected ? '#e8f4ff' : 'transparent', color: selected ? '#1890ff' : '#303133', '&:hover': { bgcolor: selected ? '#e8f4ff' : '#f5f7fa' }, '&:hover .dhr-directory-actions': { opacity: 1 } }}
        >
          {hasChildren ? (
            <IconButton size="small" aria-label={expanded ? '收起目录' : '展开目录'} onClick={toggle} sx={{ width: 24, height: 24, color: '#606266' }}>
              {expanded ? <ExpandMoreRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}
            </IconButton>
          ) : <Box />}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
            {hasChildren && expanded ? <FolderOpenOutlined sx={{ fontSize: 17, color: '#d9a441' }} /> : <FolderOutlined sx={{ fontSize: 17, color: '#d9a441' }} />}
            <Typography sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{node.name}</Typography>
          </Stack>
          {editable ? (
            <Stack className="dhr-directory-actions" direction="row" spacing={0} sx={{ opacity: 0, transition: 'opacity .12s' }}>
              <Tooltip title="新增子目录" arrow><IconButton size="small" onClick={stopAnd(() => onAddChild(node))} sx={{ width: 25, height: 25 }}><PostAddRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>
              <Tooltip title="重命名" arrow><IconButton size="small" onClick={stopAnd(() => onRename(node))} sx={{ width: 25, height: 25 }}><DriveFileRenameOutlineRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>
              <Tooltip title="删除" arrow><IconButton size="small" color="error" onClick={stopAnd(() => onDelete(node))} sx={{ width: 25, height: 25 }}><DeleteOutlineRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>
            </Stack>
          ) : <Box />}
        </Box>
        {hasChildren && expanded ? node.children.map((child) => renderNode(child, depth + 1)) : null}
      </Box>
    );
  };

  return <Box role="tree" sx={{ py: 0.5 }}>{nodes.map((node) => renderNode(node, 0))}</Box>;
}

export default function DhrTemplateWorkspaceDialog({
  open,
  template,
  onClose,
}: {
  open: boolean;
  template: TemplateModelingRecord | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const templateId = template?.id;
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [selectedDirectoryId, setSelectedDirectoryId] = useState<string | null>(null);
  const [directoryDialog, setDirectoryDialog] = useState<DirectoryDialogState | null>(null);
  const [directoryName, setDirectoryName] = useState('');
  const [deleteDirectoryTarget, setDeleteDirectoryTarget] = useState<DhrDirectoryRecord | null>(null);
  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false);
  const [selectedFormOption, setSelectedFormOption] = useState<DhrFormTemplateOption | null>(null);
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [deleteEvidenceId, setDeleteEvidenceId] = useState<string | null>(null);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const workspaceQuery = useQuery({
    queryKey: ['dhr-template-workspace', templateId],
    enabled: open && Boolean(templateId),
    queryFn: async () => (await getDhrTemplateWorkspace(templateId!)).data.data,
  });
  const formOptionsQuery = useQuery({
    queryKey: ['dhr-template-form-options', templateId],
    enabled: open && Boolean(templateId),
    queryFn: async () => (await getDhrFormTemplateOptions(templateId!)).data.data,
  });
  const compositionQuery = useQuery({
    queryKey: ['dhr-template-composition', templateId, selectedVersionId],
    enabled: open && Boolean(templateId) && Boolean(selectedVersionId),
    queryFn: async () => (await getDhrTemplateComposition(templateId!, selectedVersionId!)).data.data,
  });

  const versions = workspaceQuery.data?.versions ?? [];
  const selectedVersion = versions.find((version) => version.id === selectedVersionId) ?? compositionQuery.data?.version ?? null;
  const directories = compositionQuery.data?.directories ?? [];
  const selectedDirectory = directories.find((directory) => directory.id === selectedDirectoryId) ?? null;
  const selectedEvidence = selectedDirectory ? (compositionQuery.data?.items ?? []).filter((item) => item.directoryId === selectedDirectory.id) : [];
  const directoryTree = useMemo(() => buildDirectoryTree(directories), [directories]);
  const editable = selectedVersion?.status === 'DRAFT';

  const invalidateWorkspace = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dhr-template-workspace', templateId] });
    await queryClient.invalidateQueries({ queryKey: ['dhr-template-composition', templateId] });
    await queryClient.invalidateQueries({ queryKey: ['template-modeling-batch-record-templates'] });
  };

  useEffect(() => {
    if (!open) return;
    if (!selectedVersionId || !versions.some((version) => version.id === selectedVersionId)) {
      setSelectedVersionId(versions[0]?.id ?? null);
    }
  }, [open, selectedVersionId, versions]);

  useEffect(() => {
    if (!selectedDirectoryId || !directories.some((directory) => directory.id === selectedDirectoryId)) {
      setSelectedDirectoryId(directories[0]?.id ?? null);
    }
  }, [directories, selectedDirectoryId]);

  useEffect(() => {
    if (!open) {
      setSelectedVersionId(null);
      setSelectedDirectoryId(null);
      setDirectoryDialog(null);
      setAddEvidenceOpen(false);
      setPublishConfirm(false);
    }
  }, [open]);

  const reportError = (error: unknown, fallback: string) => {
    setSnackbar({ open: true, message: error instanceof Error ? error.message : fallback, severity: 'error' });
  };

  const createVersionMutation = useMutation({
    mutationFn: () => createDhrTemplateVersion(templateId!, selectedVersionId),
    onSuccess: async (response) => {
      await invalidateWorkspace();
      setSelectedVersionId(response.data.data.id);
      setSelectedDirectoryId(null);
      setSnackbar({ open: true, message: '已创建草稿版本', severity: 'success' });
    },
    onError: (error) => reportError(error, '创建版本失败'),
  });
  const saveDirectoryMutation = useMutation({
    mutationFn: () => {
      if (!templateId || !selectedVersionId || !directoryDialog) throw new Error('目录上下文缺失');
      const body = { name: directoryName.trim(), parentId: directoryDialog.mode === 'create' ? directoryDialog.parentId ?? null : directoryDialog.target?.parentId ?? null };
      return directoryDialog.mode === 'create'
        ? createDhrDirectory(templateId, selectedVersionId, body)
        : updateDhrDirectory(templateId, selectedVersionId, directoryDialog.target!.id, body);
    },
    onSuccess: async (response) => {
      setSelectedDirectoryId(response.data.data.id);
      setDirectoryDialog(null);
      await invalidateWorkspace();
      setSnackbar({ open: true, message: '目录已保存', severity: 'success' });
    },
    onError: (error) => reportError(error, '保存目录失败'),
  });
  const deleteDirectoryMutation = useMutation({
    mutationFn: () => deleteDhrDirectory(templateId!, selectedVersionId!, deleteDirectoryTarget!.id),
    onSuccess: async () => {
      setDeleteDirectoryTarget(null);
      await invalidateWorkspace();
      setSnackbar({ open: true, message: '目录已删除', severity: 'success' });
    },
    onError: (error) => reportError(error, '删除目录失败'),
  });
  const addEvidenceMutation = useMutation({
    mutationFn: () => createDhrEvidenceItem(templateId!, selectedVersionId!, selectedDirectoryId!, { formTemplateVersionId: selectedFormOption!.versionId, isRequired: evidenceRequired }),
    onSuccess: async () => {
      setAddEvidenceOpen(false);
      setSelectedFormOption(null);
      setEvidenceRequired(true);
      await invalidateWorkspace();
      setSnackbar({ open: true, message: '表单证据已引用', severity: 'success' });
    },
    onError: (error) => reportError(error, '引用表单失败'),
  });
  const updateEvidenceMutation = useMutation({
    mutationFn: (input: { itemId: string; isRequired: boolean }) => updateDhrEvidenceItem(templateId!, selectedVersionId!, input.itemId, { isRequired: input.isRequired }),
    onSuccess: async () => {
      await invalidateWorkspace();
    },
    onError: (error) => reportError(error, '更新证据要求失败'),
  });
  const deleteEvidenceMutation = useMutation({
    mutationFn: () => deleteDhrEvidenceItem(templateId!, selectedVersionId!, deleteEvidenceId!),
    onSuccess: async () => {
      setDeleteEvidenceId(null);
      await invalidateWorkspace();
      setSnackbar({ open: true, message: '表单证据已移除', severity: 'success' });
    },
    onError: (error) => reportError(error, '移除表单证据失败'),
  });
  const publishMutation = useMutation({
    mutationFn: () => publishDhrTemplateVersion(templateId!, selectedVersionId!),
    onSuccess: async () => {
      setPublishConfirm(false);
      await invalidateWorkspace();
      setSnackbar({ open: true, message: '版本已启用并冻结目录快照', severity: 'success' });
    },
    onError: (error) => reportError(error, '启用版本失败'),
  });

  const openCreateDirectory = (parentId?: string | null) => {
    setDirectoryName('');
    setDirectoryDialog({ mode: 'create', parentId: parentId ?? null });
  };
  const openEditDirectory = (directory: DhrDirectoryRecord) => {
    setDirectoryName(directory.name);
    setDirectoryDialog({ mode: 'edit', target: directory });
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen PaperProps={{ sx: { borderRadius: 0, bgcolor: '#f6f8f9' } }}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ minHeight: 56, px: 2, bgcolor: '#fff', borderBottom: '1px solid #e4e7ed', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Stack spacing={0.15} sx={{ minWidth: 220, mr: 'auto' }}>
            <Typography sx={{ color: '#303133', fontSize: 16, fontWeight: 600 }}>批记录模板设计 · {template?.name ?? '-'}</Typography>
            <Typography variant="caption" sx={{ color: '#909399' }}>{template?.code ?? '-'}</Typography>
          </Stack>
          {workspaceQuery.isLoading ? <CircularProgress size={18} /> : null}
          {versions.length > 0 ? (
            <TextField select size="small" label="模板版本" value={selectedVersionId ?? ''} onChange={(event) => { setSelectedVersionId(event.target.value); setSelectedDirectoryId(null); }} sx={{ width: 170, '& .MuiInputBase-root': { height: 36 } }}>
              {versions.map((version) => <MenuItem key={version.id} value={version.id}>{version.version} · {versionStatusLabel(version.status)}</MenuItem>)}
            </TextField>
          ) : null}
          {selectedVersion ? <VersionStatus status={selectedVersion.status} /> : null}
          <Button size="small" variant="outlined" startIcon={<ContentCopyRounded />} onClick={() => createVersionMutation.mutate()} disabled={createVersionMutation.isPending}>新建版本</Button>
          <Button size="small" variant="contained" startIcon={<PublishRounded />} onClick={() => setPublishConfirm(true)} disabled={!editable || publishMutation.isPending}>启用版本</Button>
          <Tooltip title="关闭" arrow><IconButton aria-label="关闭" onClick={onClose} sx={{ width: 36, height: 36 }}><CloseRounded /></IconButton></Tooltip>
        </Box>

        <Box sx={{ p: 1.5, flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', gap: 1.5 }}>
          <Box sx={{ minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 48, px: 1.5, borderBottom: '1px solid #e4e7ed' }}>
              <Typography sx={{ fontWeight: 600, color: '#303133' }}>DHR 目录</Typography>
              <Tooltip title="新增根目录" arrow><span><IconButton size="small" aria-label="新增根目录" onClick={() => openCreateDirectory()} disabled={!editable}><AddRounded fontSize="small" /></IconButton></span></Tooltip>
            </Stack>
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {compositionQuery.isLoading ? <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}><CircularProgress size={24} /></Box> : directoryTree.length ? (
                <DirectoryTree nodes={directoryTree} selectedId={selectedDirectoryId} editable={editable} onSelect={(directory) => setSelectedDirectoryId(directory.id)} onAddChild={(directory) => openCreateDirectory(directory.id)} onRename={openEditDirectory} onDelete={setDeleteDirectoryTarget} />
              ) : <Box sx={{ p: 2, color: '#909399', fontSize: 13 }}>暂无目录</Box>}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <FolderOpenOutlined sx={{ color: '#d9a441', fontSize: 20 }} />
                <Typography sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{selectedDirectory?.name ?? '请选择目录'}</Typography>
              </Stack>
              <Button size="small" variant="contained" startIcon={<NoteAddOutlined />} disabled={!editable || !selectedDirectory} onClick={() => setAddEvidenceOpen(true)}>引用表单</Button>
            </Stack>
            <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 720, tableLayout: 'fixed' }}>
                <colgroup><col style={{ width: '33%' }} /><col style={{ width: '22%' }} /><col style={{ width: 110 }} /><col style={{ width: 110 }} /><col style={{ width: 90 }} /></colgroup>
                <TableHead><TableRow sx={{ '& .MuiTableCell-root': headerCellSx }}><TableCell>表单名称</TableCell><TableCell>表单编码</TableCell><TableCell>表单版本</TableCell><TableCell align="center">必填证据</TableCell><TableCell align="center">操作</TableCell></TableRow></TableHead>
                <TableBody>
                  {!selectedDirectory ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#909399' }}>请选择左侧目录</TableCell></TableRow> : selectedEvidence.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#909399' }}>暂无表单证据</TableCell></TableRow> : selectedEvidence.map((item) => (
                    <TableRow key={item.id} hover sx={{ '& .MuiTableCell-root': bodyCellSx }}>
                      <TableCell title={item.formName}>{item.formName}</TableCell><TableCell title={item.formCode}>{item.formCode}</TableCell><TableCell>{item.formVersion}</TableCell>
                      <TableCell align="center"><Switch size="small" checked={item.isRequired} disabled={!editable || updateEvidenceMutation.isPending} onChange={(_, checked) => updateEvidenceMutation.mutate({ itemId: item.id, isRequired: checked })} /></TableCell>
                      <TableCell align="center"><Tooltip title="移除" arrow><span><IconButton size="small" color="error" aria-label="移除" disabled={!editable} onClick={() => setDeleteEvidenceId(item.id)}><DeleteOutlineRounded fontSize="small" /></IconButton></span></Tooltip></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      <Dialog open={Boolean(directoryDialog)} onClose={() => setDirectoryDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>{directoryDialog?.mode === 'edit' ? '重命名目录' : '新增目录'}</DialogTitle>
        <DialogContent dividers><TextField autoFocus fullWidth required size="small" label="目录名称" value={directoryName} onChange={(event) => setDirectoryName(event.target.value)} sx={{ mt: 0.5, '& .MuiInputBase-root': { height: 40 } }} /></DialogContent>
        <DialogActions><Button onClick={() => setDirectoryDialog(null)}>取消</Button><Button variant="contained" disabled={!directoryName.trim() || saveDirectoryMutation.isPending} onClick={() => saveDirectoryMutation.mutate()}>保存</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteDirectoryTarget)} onClose={() => setDeleteDirectoryTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>删除目录</DialogTitle><DialogContent dividers><Typography>确认删除“{deleteDirectoryTarget?.name}”？</Typography></DialogContent>
        <DialogActions><Button onClick={() => setDeleteDirectoryTarget(null)}>取消</Button><Button color="error" variant="contained" disabled={deleteDirectoryMutation.isPending} onClick={() => deleteDirectoryMutation.mutate()}>删除</Button></DialogActions>
      </Dialog>

      <Dialog open={addEvidenceOpen} onClose={() => setAddEvidenceOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>引用表单</DialogTitle>
        <DialogContent dividers><Stack spacing={1.5} sx={{ pt: 0.5 }}><Autocomplete options={formOptionsQuery.data ?? []} value={selectedFormOption} onChange={(_, value) => setSelectedFormOption(value)} getOptionLabel={(option) => `${option.name} · ${option.version}`} renderOption={(props, option) => <Box component="li" {...props} key={option.versionId}><Stack spacing={0.25}><Typography>{option.name} · {option.version}</Typography><Typography variant="caption" sx={{ color: '#909399' }}>{option.code}</Typography></Stack></Box>} renderInput={(params) => <TextField {...params} size="small" label="表单模板" placeholder="请选择" />} />
          <Stack direction="row" spacing={1} alignItems="center"><Switch checked={evidenceRequired} onChange={(_, checked) => setEvidenceRequired(checked)} /><Typography variant="body2">作为必填证据</Typography></Stack></Stack></DialogContent>
        <DialogActions><Button onClick={() => setAddEvidenceOpen(false)}>取消</Button><Button variant="contained" disabled={!selectedFormOption || addEvidenceMutation.isPending} onClick={() => addEvidenceMutation.mutate()}>引用</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteEvidenceId)} onClose={() => setDeleteEvidenceId(null)} fullWidth maxWidth="xs">
        <DialogTitle>移除表单证据</DialogTitle><DialogContent dividers><Typography>确认移除该表单证据？</Typography></DialogContent>
        <DialogActions><Button onClick={() => setDeleteEvidenceId(null)}>取消</Button><Button color="error" variant="contained" disabled={deleteEvidenceMutation.isPending} onClick={() => deleteEvidenceMutation.mutate()}>移除</Button></DialogActions>
      </Dialog>

      <Dialog open={publishConfirm} onClose={() => setPublishConfirm(false)} fullWidth maxWidth="xs">
        <DialogTitle>启用模板版本</DialogTitle><DialogContent dividers><Typography>启用后将冻结目录与表单证据快照，后续修改需要创建新版本。</Typography></DialogContent>
        <DialogActions><Button onClick={() => setPublishConfirm(false)}>取消</Button><Button variant="contained" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate()}>启用</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}><Alert severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>{snackbar.message}</Alert></Snackbar>
    </Dialog>
  );
}
