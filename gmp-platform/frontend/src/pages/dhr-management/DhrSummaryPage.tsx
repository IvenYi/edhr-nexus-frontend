import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AddRounded,
  ArticleOutlined,
  ChevronRightRounded,
  CloseRounded,
  DeleteOutlineRounded,
  ExpandMoreRounded,
  FactCheckOutlined,
  FolderOutlined,
  LockOutlined,
  PreviewOutlined,
  RefreshRounded,
  RestartAltRounded,
  SearchRounded,
  TuneRounded,
  ViewColumnRounded,
  ViewListOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
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
  getDhrSummaryVersion,
  getDhrSummaryWorkspace,
  listDhrSummaryInstances,
  saveDhrSummaryDraft,
  submitDhrSummary,
  type DhrDirectory,
  type DhrEvidenceRecord,
  type DhrInstanceSummary,
  type DhrSummaryDirectoryOverlay,
  type DhrSummaryPlacement,
  type DhrSummaryWorkspace,
} from '@/api/dhr-instances';
import ListColumnSettingsPopover, {
  getCurrentUserPreferenceStorageKey,
  loadListColumnSettings,
  reorderListColumns,
  type ListColumnOption,
} from '@/components/ListColumnSettingsPopover';
import { listColumnResizeHandleSx, listTableStickyEdgeSx } from '@/components/listTableStyles';
import { useSnackbar } from '@/components/SnackbarProvider';
import StatusBadge from '@/components/StatusBadge';
import TableStateCell from '@/components/TableStateCell';
import { ListTableShell } from '@/components/ListTableShell';
import {
  formListFieldSx,
  formListFilterActionsSx,
  formListQueryGridSx,
  formListQueryPanelSx,
  formTableBodyCellSx,
  formTableHeaderCellSx,
  FormListPagination,
} from '@/pages/form-management/formManagementListStyles';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { useAuthStore } from '@/stores/authStore';

const SUMMARY_COLUMN_SETTINGS_VERSION = 1;
const SUMMARY_COLUMN_STORAGE_KEY_PREFIX = 'dhr-summary-list-columns:';
const SUMMARY_STATUS_COLUMN_WIDTH = 112;
const SUMMARY_ACTION_COLUMN_WIDTH = 64;

const summaryLabels = {
  NOT_STARTED: '待汇总',
  DRAFT: '汇总中',
  PENDING_REVIEW: '待审核',
  FORMALIZED: '已正式化',
} as const;
const originLabels = { DIRECTORY: '目录表单', WORK: '作业表单', CUSTOM: '自定义表单' } as const;

const summaryColumns = [
  { id: 'dhrNo', label: 'DHR 编号' },
  { id: 'object', label: '生产对象' },
  { id: 'workOrderNo', label: '工单编号' },
  { id: 'product', label: '产品' },
  { id: 'processVersion', label: '制程版本' },
  { id: 'dhrTemplate', label: 'DHR 模板' },
  { id: 'completedAt', label: '生产完成时间' },
] as const satisfies readonly ListColumnOption<string>[];

type SummaryColumnId = typeof summaryColumns[number]['id'];

const defaultSummaryColumnWidths: Record<SummaryColumnId, number> = {
  dhrNo: 220,
  object: 190,
  workOrderNo: 160,
  product: 220,
  processVersion: 150,
  dhrTemplate: 210,
  completedAt: 168,
};

const headerCellSx = formTableHeaderCellSx;
const bodyCellSx = formTableBodyCellSx;
const fieldSx = formListFieldSx;

function formatTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 16) : '—';
}

function getRecordTitle(record: DhrEvidenceRecord) {
  return record.templateName || record.snapshot.name || '未命名表单';
}

function evidenceStatus(record?: DhrEvidenceRecord | null) {
  if (!record) return { label: '未填报', color: 'default' as const };
  return record.status === 'COMPLETED'
    ? { label: '已完成', color: 'success' as const }
    : { label: '未完成', color: 'warning' as const };
}

function formDocument(record: DhrEvidenceRecord | null) {
  if (!record?.snapshot.model || !record.snapshot.canvas) return null;
  try {
    const document = parseReactTemplateDesignerDocument(
      { id: record.templateId, name: getRecordTitle(record) },
      {
        id: record.templateVersionId,
        version: record.templateVersion || record.snapshot.version || '',
        modelDesignJson: record.snapshot.model,
        canvasDesignJson: record.snapshot.canvas,
      },
    );
    const fields = Array.isArray(record.snapshot.fields) ? record.snapshot.fields : [];
    document.model.fields = fields.map((field, index) => ({
      ...field,
      typeConfig: field.typeConfig ?? {},
      status: field.status ?? 'enabled',
      sortOrder: field.sortOrder ?? index,
    })) as typeof document.model.fields;
    return document;
  } catch {
    return null;
  }
}

function EvidenceCanvas({ record, emptyMessage }: { record: DhrEvidenceRecord | null; emptyMessage: string }) {
  const document = useMemo(() => formDocument(record), [record]);
  const fields = Array.isArray(record?.snapshot.fields) ? record.snapshot.fields : [];

  if (!record) {
    return <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', p: 3, color: '#909399', textAlign: 'center' }}>
      <Box><FolderOutlined sx={{ fontSize: 42, opacity: 0.45, mb: 1 }} /><Typography>{emptyMessage}</Typography></Box>
    </Box>;
  }
  if (document) return <FormCanvasPreview document={document} fullPage runtime={{ values: record.fieldValues, disabled: true, onChange: () => {} }} />;

  return <Box sx={{ flex: 1, overflow: 'auto', m: 2, p: 3, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1 }}>
    {fields.length ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      {fields.map((field, index) => {
        const id = String(field.id ?? field.fieldId ?? index);
        const label = String(field.name ?? field.label ?? `字段 ${index + 1}`);
        const value = record.fieldValues[id];
        return <Box key={id} sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{value === undefined || value === null || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)}</Typography>
        </Box>;
      })}
    </Box> : <Typography color="text.secondary">该实例没有可展示的字段定义。</Typography>}
  </Box>;
}

function EvidencePreview({ record, onClose }: { record: DhrEvidenceRecord | null; onClose: () => void }) {
  return <Dialog open={Boolean(record)} onClose={onClose} fullScreen PaperProps={{ sx: { bgcolor: '#eef1f6' } }}>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box minWidth={0}><Typography variant="h6" noWrap>{record ? getRecordTitle(record) : '表单实例'}</Typography><Typography variant="caption" color="text.secondary">{record?.instanceNo} · {record?.templateVersion}</Typography></Box>
      <IconButton onClick={onClose} aria-label="关闭"><CloseRounded /></IconButton>
    </DialogTitle>
    <DialogContent dividers sx={{ bgcolor: '#eef1f6', p: 0, display: 'flex', minHeight: 0 }}><EvidenceCanvas record={record} emptyMessage="请选择一份表单实例。" /></DialogContent>
  </Dialog>;
}

function SummaryMetric({ label, value, hint, tone = 'default' }: { label: string; value: string; hint: string; tone?: 'default' | 'success' | 'warning' }) {
  const color = tone === 'success' ? '#18a058' : tone === 'warning' ? '#d48806' : '#303133';
  return <Box sx={{ minWidth: 0, flex: '1 1 150px', px: 1.5, py: 0.9, borderLeft: '3px solid', borderColor: tone === 'success' ? '#52c41a' : tone === 'warning' ? '#faad14' : '#91caff', bgcolor: '#fafcff', borderRadius: '0 4px 4px 0' }}>
    <Typography variant="caption" color="text.secondary" noWrap>{label}</Typography>
    <Typography sx={{ color, fontWeight: 700, lineHeight: 1.4 }} noWrap>{value}</Typography>
    <Typography variant="caption" sx={{ display: 'block', color: '#909399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hint}</Typography>
  </Box>;
}

function SummaryWorkspace({ dhr, onClose }: { dhr: DhrInstanceSummary; onClose: () => void }) {
  const snackbar = useSnackbar();
  const canEdit = useAuthStore((state) => state.hasPermission('dhr.summaries.edit'));
  const canSubmit = useAuthStore((state) => state.hasPermission('dhr.summaries.submit'));
  const client = useQueryClient();
  const readOnly = dhr.summaryStatus === 'PENDING_REVIEW' || dhr.summaryStatus === 'FORMALIZED';
  const editable = !readOnly && canEdit;
  const query = useQuery({ queryKey: ['dhr-summary-workspace', dhr.id], queryFn: () => getDhrSummaryWorkspace(dhr.id) });
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const versionQuery = useQuery({
    queryKey: ['dhr-summary-version', dhr.id, selectedVersionId],
    queryFn: () => getDhrSummaryVersion(dhr.id, selectedVersionId),
    enabled: readOnly && Boolean(selectedVersionId),
  });
  const workspace = useMemo<DhrSummaryWorkspace | undefined>(() => {
    if (!readOnly) return query.data;
    if (!query.data || !versionQuery.data) return undefined;
    const frozen = versionQuery.data;
    return {
      dhr: { ...frozen.dhr, directorySnapshot: frozen.version.baseDirectory },
      candidates: frozen.version.candidates,
      draft: { id: frozen.version.id, revision: 0, overlayDirectories: frozen.version.overlayDirectories, placements: frozen.placements },
      versions: query.data.versions,
    };
  }, [query.data, readOnly, versionQuery.data]);
  const [overlay, setOverlay] = useState<DhrSummaryDirectoryOverlay[]>([]);
  const [placements, setPlacements] = useState<DhrSummaryPlacement[]>([]);
  const [revision, setRevision] = useState<number | undefined>();
  const [selectedNode, setSelectedNode] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [preview, setPreview] = useState<DhrEvidenceRecord | null>(null);
  const [instancePanelOpen, setInstancePanelOpen] = useState(false);
  const [candidateDrawerOpen, setCandidateDrawerOpen] = useState(false);
  const [candidateOrigin, setCandidateOrigin] = useState<'WORK' | 'CUSTOM'>('WORK');
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [collapsedNodeKeys, setCollapsedNodeKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!readOnly || selectedVersionId || !query.data?.versions.length) return;
    setSelectedVersionId(query.data.versions[0].id);
  }, [query.data?.versions, readOnly, selectedVersionId]);

  const workspaceKey = readOnly ? versionQuery.data?.version.id : query.data?.dhr.id;
  useEffect(() => {
    if (!workspace) return;
    setOverlay(workspace.draft?.overlayDirectories ?? []);
    setPlacements(workspace.draft?.placements ?? []);
    setRevision(workspace.draft?.revision);
    setSelectedNode(`base-dir-${workspace.dhr.directorySnapshot.directories[0]?.id ?? ''}`);
    setSelectedRecordId('');
    setInstancePanelOpen(false);
  }, [workspace, workspaceKey]);

  const baseDirectories = workspace?.dhr.directorySnapshot.directories ?? [];
  const candidateById = useMemo(() => new Map((workspace?.candidates ?? []).map((record) => [record.id, record] as const)), [workspace?.candidates]);
  const baseDirectoryById = useMemo(() => new Map(baseDirectories.map((directory) => [String(directory.id), directory] as const)), [baseDirectories]);
  const baseChildren = useMemo(() => {
    const children = new Map<string | null, DhrDirectory[]>();
    baseDirectories.forEach((directory) => {
      const parentId = directory.parentId == null || !baseDirectoryById.has(String(directory.parentId)) ? null : String(directory.parentId);
      children.set(parentId, [...(children.get(parentId) ?? []), directory]);
    });
    return children;
  }, [baseDirectories, baseDirectoryById]);
  const overlayChildren = useMemo(() => {
    const children = new Map<string, DhrSummaryDirectoryOverlay[]>();
    overlay.forEach((directory) => children.set(directory.parentKey ?? '', [...(children.get(directory.parentKey ?? '') ?? []), directory]));
    return children;
  }, [overlay]);
  const basePathById = useMemo(() => {
    const paths = new Map<string, string[]>();
    const resolve = (id: string, visiting = new Set<string>()): string[] => {
      if (paths.has(id)) return paths.get(id)!;
      const directory = baseDirectoryById.get(id);
      if (!directory || visiting.has(id)) return [];
      const path = directory.parentId == null ? [directory.name] : [...resolve(String(directory.parentId), new Set(visiting).add(id)), directory.name];
      paths.set(id, path);
      return path;
    };
    baseDirectories.forEach((directory) => resolve(String(directory.id)));
    return paths;
  }, [baseDirectories, baseDirectoryById]);
  const targetOptions = useMemo(() => {
    const options: Array<{ key: string; label: string }> = baseDirectories.map((directory) => ({
      key: `base-dir-${directory.id}`,
      label: (basePathById.get(String(directory.id)) ?? [directory.name]).join(' / '),
    }));
    const labels = new Map(options.map((option) => [option.key, option.label] as const));
    const byKey = new Map(overlay.map((directory) => [directory.key, directory] as const));
    const resolveOverlay = (key: string, visiting = new Set<string>()): string => {
      if (labels.has(key)) return labels.get(key)!;
      const directory = byKey.get(key);
      if (!directory || visiting.has(key)) return directory?.name || '未命名目录';
      const parent = directory.parentKey
        ? directory.parentKey.startsWith('base-dir-')
          ? labels.get(directory.parentKey) || ''
          : resolveOverlay(directory.parentKey, new Set(visiting).add(key))
        : '';
      const label = parent ? `${parent} / ${directory.name}` : directory.name;
      labels.set(key, label);
      return label;
    };
    overlay.forEach((directory) => options.push({ key: directory.key, label: resolveOverlay(directory.key) }));
    return options;
  }, [baseDirectories, basePathById, overlay]);
  const targetLabelByKey = useMemo(() => new Map(targetOptions.map((target) => [target.key, target.label] as const)), [targetOptions]);
  const directPlacements = useMemo(() => (workspace?.candidates ?? [])
    .filter((record) => record.originKind === 'DIRECTORY' && record.status === 'COMPLETED')
    .map((record) => ({ recordId: record.id, targetNodeKey: `base-item-${String(record.snapshot.dhrItemId ?? '')}` })), [workspace?.candidates]);
  const effectivePlacements = useMemo(() => [
    ...directPlacements,
    ...placements.filter((placement) => candidateById.get(placement.recordId)?.originKind !== 'DIRECTORY'),
  ], [candidateById, directPlacements, placements]);
  const placementByRecordId = useMemo(() => new Map(effectivePlacements.map((placement) => [placement.recordId, placement.targetNodeKey] as const)), [effectivePlacements]);
  const assignedRecordIds = useMemo(() => new Set(effectivePlacements.map((placement) => placement.recordId)), [effectivePlacements]);
  const candidateGroups = useMemo(() => ({
    WORK: (workspace?.candidates ?? []).filter((record) => record.originKind === 'WORK'),
    CUSTOM: (workspace?.candidates ?? []).filter((record) => record.originKind === 'CUSTOM'),
  }), [workspace?.candidates]);
  const itemDirectoryById = useMemo(() => new Map<string, DhrDirectory>(baseDirectories.flatMap((directory) => directory.items.map((item) => [String(item.id), directory] as const))), [baseDirectories]);
  const itemLabelById = useMemo(() => new Map<string, string>(baseDirectories.flatMap((directory) => directory.items.map((item) => [
    String(item.id),
    `${(basePathById.get(String(directory.id)) ?? [directory.name]).join(' / ')} / ${item.displayName || item.formName || '表单'}`,
  ] as const))), [baseDirectories, basePathById]);

  const selectedNodeKeys = useMemo(() => {
    const keys = new Set<string>([selectedNode]);
    if (!selectedNode) return keys;
    const addBaseDescendants = (directoryId: string) => {
      (baseChildren.get(directoryId) ?? []).forEach((child) => {
        const key = `base-dir-${child.id}`;
        if (!keys.has(key)) { keys.add(key); addBaseDescendants(String(child.id)); }
      });
    };
    const addOverlayDescendants = (parentKey: string) => {
      (overlayChildren.get(parentKey) ?? []).forEach((child) => {
        if (!keys.has(child.key)) { keys.add(child.key); addOverlayDescendants(child.key); }
      });
    };
    if (selectedNode.startsWith('base-dir-')) {
      addBaseDescendants(selectedNode.slice(9));
      [...keys].filter((key) => key.startsWith('base-dir-')).forEach(addOverlayDescendants);
    } else {
      addOverlayDescendants(selectedNode);
    }
    return keys;
  }, [baseChildren, overlayChildren, selectedNode]);
  const selectedRecords = useMemo(() => effectivePlacements
    .filter((placement) => {
      if (placement.targetNodeKey.startsWith('base-item-')) {
        const directory = itemDirectoryById.get(placement.targetNodeKey.slice(10));
        return directory ? selectedNodeKeys.has(`base-dir-${directory.id}`) : false;
      }
      return selectedNodeKeys.has(placement.targetNodeKey);
    })
    .map((placement) => candidateById.get(placement.recordId))
    .filter((record): record is DhrEvidenceRecord => Boolean(record)), [candidateById, effectivePlacements, itemDirectoryById, selectedNodeKeys]);
  const selectedRecord = selectedRecords.find((record) => record.id === selectedRecordId) ?? selectedRecords[0] ?? null;
  const selectedNodeLabel = targetLabelByKey.get(selectedNode) ?? '未选择目录';
  const requiredItems = useMemo(() => baseDirectories.flatMap((directory) => directory.items).filter((item) => item.required), [baseDirectories]);
  const completedRequiredCount = useMemo(() => requiredItems.filter((item) => (workspace?.candidates ?? []).some((record) => record.originKind === 'DIRECTORY' && record.status === 'COMPLETED' && String(record.snapshot.dhrItemId ?? '') === String(item.id))).length, [requiredItems, workspace?.candidates]);
  const completedSelectableRecords = useMemo(() => [...candidateGroups.WORK, ...candidateGroups.CUSTOM].filter((record) => record.status === 'COMPLETED'), [candidateGroups]);
  const unassignedSelectableCount = completedSelectableRecords.filter((record) => !assignedRecordIds.has(record.id)).length;
  const activeVersion = query.data?.versions.find((version) => version.id === selectedVersionId);

  useEffect(() => {
    if (!selectedRecords.some((record) => record.id === selectedRecordId)) setSelectedRecordId(selectedRecords[0]?.id ?? '');
  }, [selectedRecordId, selectedRecords]);
  useEffect(() => { setInstancePanelOpen(false); }, [selectedNode]);

  const saveMutation = useMutation({
    mutationFn: () => saveDhrSummaryDraft(dhr.id, { revision, overlayDirectories: overlay, placements }),
    onSuccess: (saved) => {
      setRevision(saved.revision);
      snackbar.showMessage('汇总草稿已保存', 'success');
      client.invalidateQueries({ queryKey: ['dhr-instances'] });
    },
    onError: (error: Error) => snackbar.showMessage(error.message || '保存汇总草稿失败', 'error'),
  });
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!canEdit) {
        if (revision === undefined) throw new Error('当前没有可提交的汇总草稿');
        return submitDhrSummary(dhr.id, revision);
      }
      const saved = await saveDhrSummaryDraft(dhr.id, { revision, overlayDirectories: overlay, placements });
      return submitDhrSummary(dhr.id, saved.revision);
    },
    onSuccess: (result) => {
      snackbar.showMessage(result.status === 'PENDING_REVIEW' ? `汇总 V${result.versionNo} 已冻结，等待审核` : `汇总 V${result.versionNo} 已正式化`, 'success');
      client.invalidateQueries({ queryKey: ['dhr-instances'] });
      onClose();
    },
    onError: (error: Error) => snackbar.showMessage(error.message || '提交 DHR 汇总失败', 'error'),
  });
  const addDirectory = () => {
    const name = newDirectoryName.trim();
    if (!editable || !name || !selectedNode) return;
    const key = `summary-dir-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setOverlay((current) => [...current, { key, parentKey: selectedNode, name, sortOrder: current.length + 1 }]);
    setSelectedNode(key);
    setNewDirectoryName('');
  };
  const removeDirectory = () => {
    if (!editable || !pendingRemoval) return;
    const descendants = new Set([pendingRemoval]);
    let changed = true;
    while (changed) {
      changed = false;
      overlay.forEach((node) => {
        if (node.parentKey && descendants.has(node.parentKey) && !descendants.has(node.key)) {
          descendants.add(node.key);
          changed = true;
        }
      });
    }
    setOverlay((current) => current.filter((node) => !descendants.has(node.key)));
    setPlacements((current) => current.filter((placement) => !descendants.has(placement.targetNodeKey)));
    setSelectedNode(`base-dir-${baseDirectories[0]?.id ?? ''}`);
    setPendingRemoval(null);
  };
  const assign = (recordId: string, targetNodeKey: string) => {
    if (!editable) return;
    setPlacements((current) => targetNodeKey
      ? [...current.filter((item) => item.recordId !== recordId), { recordId, targetNodeKey }]
      : current.filter((item) => item.recordId !== recordId));
  };
  const placementLabel = (recordId: string) => {
    const target = placementByRecordId.get(recordId);
    if (!target) return '未纳入';
    if (target.startsWith('base-item-')) return itemLabelById.get(target.slice(10)) || '目录表单';
    return targetLabelByKey.get(target) || '已归入目录';
  };
  const treeButtonSx = (selected: boolean) => ({
    minHeight: 34,
    px: 0.75,
    justifyContent: 'flex-start',
    textAlign: 'left',
    color: selected ? '#1677c8' : '#303133',
    bgcolor: selected ? '#e8f4ff' : 'transparent',
    '&:hover': { bgcolor: selected ? '#dff0ff' : '#f5f7fa' },
  });
  const toggleDirectory = (key: string) => setCollapsedNodeKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const renderOverlayNodes = (parentKey: string, depth: number): ReactNode => (overlayChildren.get(parentKey) ?? [])
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((node) => {
      const hasChildren = (overlayChildren.get(node.key) ?? []).length > 0;
      const expanded = !collapsedNodeKeys.includes(node.key);
      return <Box key={node.key}>
        <Stack direction="row" alignItems="center" sx={{ pl: depth * 1.5, pr: 0.5 }}>
          <Box sx={{ width: 26, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>{hasChildren && <IconButton size="small" aria-label={`${expanded ? '收起' : '展开'}目录 ${node.name}`} onClick={() => toggleDirectory(node.key)}>{expanded ? <ExpandMoreRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}</IconButton>}</Box>
          <Button fullWidth startIcon={<FolderOutlined fontSize="small" />} onClick={() => setSelectedNode(node.key)} sx={treeButtonSx(selectedNode === node.key)}>{node.name}</Button>
          {editable && <Tooltip title="删除汇总目录"><IconButton size="small" aria-label={`删除目录 ${node.name}`} onClick={() => setPendingRemoval(node.key)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>}
        </Stack>
        <Collapse in={expanded} timeout={160} unmountOnExit>{renderOverlayNodes(node.key, depth + 1)}</Collapse>
      </Box>;
    });
  const renderBaseNodes = (parentId: string | null, depth: number): ReactNode => (baseChildren.get(parentId) ?? []).map((directory) => {
    const nodeKey = `base-dir-${directory.id}`;
    const hasChildren = (baseChildren.get(String(directory.id)) ?? []).length > 0 || (overlayChildren.get(nodeKey) ?? []).length > 0;
    const expanded = !collapsedNodeKeys.includes(nodeKey);
    return <Box key={directory.id}>
      <Stack direction="row" alignItems="center" sx={{ pl: depth * 1.5, pr: 0.5 }}>
        <Box sx={{ width: 26, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>{hasChildren && <IconButton size="small" aria-label={`${expanded ? '收起' : '展开'}目录 ${directory.name}`} onClick={() => toggleDirectory(nodeKey)}>{expanded ? <ExpandMoreRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}</IconButton>}</Box>
        <Button fullWidth startIcon={<LockOutlined fontSize="small" />} onClick={() => setSelectedNode(nodeKey)} sx={treeButtonSx(selectedNode === nodeKey)}>{directory.name}</Button>
      </Stack>
      <Collapse in={expanded} timeout={160} unmountOnExit><>{renderBaseNodes(String(directory.id), depth + 1)}{renderOverlayNodes(nodeKey, depth + 1)}</></Collapse>
    </Box>;
  });
  const isLoading = query.isLoading || (readOnly && (versionQuery.isLoading || !selectedVersionId));
  const isError = query.isError || (readOnly && versionQuery.isError);

  return <Dialog open fullScreen onClose={onClose} PaperProps={{ sx: { bgcolor: '#f3f5f8' } }}>
    <DialogTitle sx={{ px: 2.5, py: 1.25, bgcolor: '#fff', borderBottom: '1px solid #e4e7ed' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box minWidth={0}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h6">{readOnly ? `DHR 汇总详情 V${activeVersion?.versionNo ?? ''}` : 'DHR 汇总'}</Typography>
            <Chip size="small" label={dhr.dhrNo} />
            {readOnly && <StatusBadge label={summaryLabels[dhr.summaryStatus]} color={dhr.summaryStatus === 'FORMALIZED' ? 'success' : 'warning'} />}
          </Stack>
          <Typography variant="caption" color="text.secondary">{dhr.objectNo} · {dhr.productCode || '未填写产品编码'} / {dhr.productName || '未填写产品名称'}</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {readOnly && <TextField select size="small" label="冻结版本" value={selectedVersionId} onChange={(event) => setSelectedVersionId(event.target.value)} sx={{ minWidth: 164, ...fieldSx }}>
            {(query.data?.versions ?? []).map((version) => <MenuItem key={version.id} value={version.id}>V{version.versionNo} · {summaryLabels[version.status]}</MenuItem>)}
          </TextField>}
          {editable && <Button variant="outlined" onClick={() => saveMutation.mutate()} disabled={!workspace || saveMutation.isPending}>保存草稿</Button>}
          {!readOnly && canSubmit && <Button variant="contained" onClick={() => submitMutation.mutate()} disabled={!workspace || submitMutation.isPending || (!canEdit && revision === undefined)}>提交汇总</Button>}
          <IconButton onClick={onClose} aria-label="关闭"><CloseRounded /></IconButton>
        </Stack>
      </Stack>
    </DialogTitle>
    <DialogContent sx={{ p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {isLoading ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : isError || !workspace ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><Stack spacing={1.5} alignItems="center"><Typography color="text.secondary">DHR 汇总工作区加载失败</Typography><Button startIcon={<RefreshRounded />} onClick={() => { query.refetch(); if (readOnly && selectedVersionId) versionQuery.refetch(); }}>重新加载</Button></Stack></Box> : <>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: '0 0 auto' }}>
          <SummaryMetric label="必填目录已完成" value={`${completedRequiredCount}/${requiredItems.length}`} hint="提交时由服务端再次校验" tone={requiredItems.length > 0 && completedRequiredCount === requiredItems.length ? 'success' : 'warning'} />
          <SummaryMetric label="候选表单" value={`${workspace.candidates.length} 份`} hint="冻结范围保留全部候选实例" />
          <SummaryMetric label="已归入目录" value={`${assignedRecordIds.size} 份`} hint="目录表单自动归位，其他来源按选择归档" tone="success" />
          <SummaryMetric label="待归集" value={`${unassignedSelectableCount} 份`} hint="仅统计已完成的作业和自定义表单" tone={unassignedSelectableCount ? 'warning' : 'default'} />
        </Box>
        <Box sx={{ minHeight: 0, flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: candidateDrawerOpen ? '300px minmax(420px, 1fr) 360px' : '300px minmax(420px, 1fr) 64px' }, gap: 1.5 }}>
          <Box sx={{ minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e4e7ed' }}><Typography fontWeight={700}>汇总目录</Typography><Typography variant="caption" color="text.secondary">锁定目录来自生产启动快照；可在其下新建多级目录</Typography></Box>
            <Box sx={{ flex: 1, overflow: 'auto', py: 0.75 }}>{renderBaseNodes(null, 0)}{!baseDirectories.length && <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 4, textAlign: 'center' }}>该 DHR 没有冻结目录。</Typography>}</Box>
            {editable && <Box sx={{ borderTop: '1px solid #e4e7ed', p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" noWrap title={selectedNodeLabel}>将在「{selectedNodeLabel}」下新建目录</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}><TextField size="small" fullWidth label="目录名称" value={newDirectoryName} onChange={(event) => setNewDirectoryName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addDirectory(); }} sx={fieldSx} /><Button aria-label="新建目录" variant="outlined" sx={{ minWidth: 40, width: 40, px: 0 }} disabled={!selectedNode || !newDirectoryName.trim()} onClick={addDirectory}><AddRounded fontSize="small" /></Button></Stack>
            </Box>}
          </Box>
          <Box sx={{ minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid #e4e7ed', flex: '0 0 auto' }}>
              {selectedRecord ? <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                <Box minWidth={0}><Typography fontWeight={700} noWrap>{getRecordTitle(selectedRecord)}</Typography><Typography variant="caption" color="text.secondary" noWrap>{selectedRecord.instanceNo} · 副本 {selectedRecord.copyId} · {originLabels[selectedRecord.originKind]} · {placementLabel(selectedRecord.id)}</Typography></Box>
                <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}><StatusBadge label={evidenceStatus(selectedRecord).label} color={evidenceStatus(selectedRecord).color} />{selectedRecords.length > 1 && <Button size="small" startIcon={<ViewListOutlined fontSize="small" />} onClick={() => setInstancePanelOpen(true)}>表单清单（{selectedRecords.length}）</Button>}<Tooltip title="全屏查看表单"><IconButton size="small" aria-label="全屏查看表单" onClick={() => setPreview(selectedRecord)} sx={{ color: '#606266', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}><PreviewOutlined fontSize="small" /></IconButton></Tooltip></Stack>
              </Stack> : <Box><Typography fontWeight={700}>目录内容</Typography><Typography variant="caption" color="text.secondary">{selectedNodeLabel}</Typography></Box>}
            </Box>
            <EvidenceCanvas record={selectedRecord} emptyMessage="当前目录尚无已归集的表单实例。" />
            {instancePanelOpen && <Box sx={{ position: 'absolute', zIndex: 2, top: 0, right: 0, bottom: 0, width: 304, bgcolor: '#fff', borderLeft: '1px solid #dfe3eb', boxShadow: '-8px 0 20px rgba(31, 35, 41, 0.08)', display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 56, px: 1.5, borderBottom: '1px solid #ebeef5' }}><Box minWidth={0}><Typography fontWeight={600}>当前目录表单</Typography><Typography variant="caption" color="text.secondary">共 {selectedRecords.length} 份实例</Typography></Box><IconButton size="small" aria-label="收起表单清单" onClick={() => setInstancePanelOpen(false)}><CloseRounded fontSize="small" /></IconButton></Stack>
              <Stack spacing={0.5} sx={{ p: 1, overflow: 'auto' }}>{selectedRecords.map((record) => <Button key={record.id} fullWidth onClick={() => { setSelectedRecordId(record.id); setInstancePanelOpen(false); }} sx={{ minHeight: 48, px: 1, justifyContent: 'flex-start', color: selectedRecord?.id === record.id ? 'primary.main' : 'text.primary', bgcolor: selectedRecord?.id === record.id ? '#e8f4ff' : 'transparent', '&:hover': { bgcolor: '#f5f9ff' } }}><ArticleOutlined fontSize="small" /><Box sx={{ ml: 0.75, minWidth: 0, flex: 1, textAlign: 'left' }}><Typography variant="body2" noWrap>{getRecordTitle(record)}</Typography><Typography variant="caption" color="text.secondary" display="block" noWrap>{record.instanceNo} · 副本 {record.copyId}</Typography></Box><StatusBadge label={evidenceStatus(record).label} color={evidenceStatus(record).color} /></Button>)}</Stack>
            </Box>}
          </Box>
          {candidateDrawerOpen ? <Box sx={{ minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #e4e7ed' }}><Box minWidth={0}><Typography fontWeight={700}>{originLabels[candidateOrigin]}</Typography><Typography variant="caption" color="text.secondary">{readOnly ? '提交时冻结的候选范围' : '选择目录即纳入；未选择即不纳入'}</Typography></Box><IconButton size="small" aria-label="收起候选表单" onClick={() => setCandidateDrawerOpen(false)}><CloseRounded fontSize="small" /></IconButton></Stack>
            <Stack direction="row" spacing={0.5} sx={{ p: 1, borderBottom: '1px solid #ebeef5' }}>{(['WORK', 'CUSTOM'] as const).map((origin) => <Button key={origin} size="small" variant={candidateOrigin === origin ? 'contained' : 'text'} startIcon={origin === 'WORK' ? <FactCheckOutlined fontSize="small" /> : <ArticleOutlined fontSize="small" />} onClick={() => setCandidateOrigin(origin)} sx={{ minWidth: 0, flex: 1 }}>{origin === 'WORK' ? `作业 ${candidateGroups.WORK.length}` : `自定义 ${candidateGroups.CUSTOM.length}`}</Button>)}</Stack>
            <Stack spacing={1} sx={{ p: 1.25, overflow: 'auto' }}>{candidateGroups[candidateOrigin].map((record) => {
              const currentTarget = placementByRecordId.get(record.id) ?? '';
              const status = evidenceStatus(record);
              return <Box key={record.id} sx={{ p: 1.25, border: '1px solid #ebeef5', borderRadius: 1, bgcolor: currentTarget ? '#f6ffed' : '#fff' }}>
                <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start"><Box minWidth={0}><Typography fontWeight={600} noWrap>{getRecordTitle(record)}</Typography><Typography variant="caption" color="text.secondary" noWrap>{record.instanceNo} · {record.operationName || '生产执行'}</Typography></Box><Stack direction="row" alignItems="center" spacing={0.25}><StatusBadge label={status.label} color={status.color} /><Tooltip title="查看表单"><IconButton size="small" aria-label="查看表单" onClick={() => setPreview(record)} sx={{ color: '#606266', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}><PreviewOutlined fontSize="small" /></IconButton></Tooltip></Stack></Stack>
                {editable ? <TextField select size="small" fullWidth label={record.status === 'COMPLETED' ? (currentTarget ? '已归入目录' : '选择归入目录') : '未完成，不可纳入'} value={currentTarget} disabled={record.status !== 'COMPLETED'} onChange={(event) => assign(record.id, event.target.value)} sx={{ mt: 1, ...fieldSx }}><MenuItem value="">未纳入</MenuItem>{targetOptions.map((target) => <MenuItem key={target.key} value={target.key}>{target.label}</MenuItem>)}</TextField> : <Typography variant="caption" sx={{ display: 'block', mt: 1, color: currentTarget ? '#18a058' : '#909399' }}>{currentTarget ? `已归入：${placementLabel(record.id)}` : '未纳入本汇总版本'}</Typography>}
              </Box>;
            })}{!candidateGroups[candidateOrigin].length && <Box sx={{ py: 8, textAlign: 'center', color: '#909399' }}><Typography>暂无{originLabels[candidateOrigin]}</Typography></Box>}</Stack>
          </Box> : <Box sx={{ minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1, gap: 0.75 }}><Typography variant="caption" color="text.secondary" sx={{ writingMode: 'vertical-rl', letterSpacing: 2 }}>来源表单</Typography><Tooltip title={`作业表单 · ${candidateGroups.WORK.length} 份`} placement="left"><IconButton aria-label="打开作业表单来源" onClick={() => { setCandidateOrigin('WORK'); setCandidateDrawerOpen(true); }} sx={{ color: '#606266', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}><FactCheckOutlined /></IconButton></Tooltip><Tooltip title={`自定义表单 · ${candidateGroups.CUSTOM.length} 份`} placement="left"><IconButton aria-label="打开自定义表单来源" onClick={() => { setCandidateOrigin('CUSTOM'); setCandidateDrawerOpen(true); }} sx={{ color: '#606266', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}><ArticleOutlined /></IconButton></Tooltip></Box>}
        </Box>
      </>}
    </DialogContent>
    <Dialog open={Boolean(pendingRemoval)} onClose={() => setPendingRemoval(null)}>
      <DialogTitle>删除汇总目录？</DialogTitle>
      <DialogContent><Typography color="text.secondary">该目录及其下级汇总目录会从草稿移除；归入这些目录的表单将恢复为未纳入。冻结基础目录不会被修改。</Typography></DialogContent>
      <DialogActions><Button onClick={() => setPendingRemoval(null)}>取消</Button><Button color="error" variant="contained" onClick={removeDirectory}>删除目录</Button></DialogActions>
    </Dialog>
    <EvidencePreview record={preview} onClose={() => setPreview(null)} />
  </Dialog>;
}

export default function DhrSummaryPage() {
  const [draftKeyword, setDraftKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<'pending' | 'submitted'>('pending');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selected, setSelected] = useState<DhrInstanceSummary | null>(null);
  const [columnSettingsAnchor, setColumnSettingsAnchor] = useState<HTMLElement | null>(null);
  const columnStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(SUMMARY_COLUMN_STORAGE_KEY_PREFIX), []);
  const [columnSettings, setColumnSettings] = useState(() => loadListColumnSettings(columnStorageKey, summaryColumns, SUMMARY_COLUMN_SETTINGS_VERSION));
  const columnWidthStorageKey = `${columnStorageKey}:widths:v1`;
  const [columnWidths, setColumnWidths] = useState<Record<SummaryColumnId, number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(columnWidthStorageKey) || '{}') as Partial<Record<SummaryColumnId, number>>;
      return summaryColumns.reduce((result, column) => {
        result[column.id] = typeof stored[column.id] === 'number' && Number.isFinite(stored[column.id]) ? Math.max(96, stored[column.id]!) : defaultSummaryColumnWidths[column.id];
        return result;
      }, {} as Record<SummaryColumnId, number>);
    } catch {
      return { ...defaultSummaryColumnWidths };
    }
  });
  const columnResizeRef = useRef<{ id: SummaryColumnId; startX: number; startWidth: number } | null>(null);

  useEffect(() => { localStorage.setItem(columnStorageKey, JSON.stringify(columnSettings)); }, [columnSettings, columnStorageKey]);
  useEffect(() => { localStorage.setItem(columnWidthStorageKey, JSON.stringify(columnWidths)); }, [columnWidthStorageKey, columnWidths]);

  const query = useQuery({
    queryKey: ['dhr-instances', 'summary', keyword, tab, page, size],
    queryFn: () => listDhrSummaryInstances({ keyword, summaryStatus: tab === 'submitted' ? 'SUBMITTED_GROUP' : 'PENDING_GROUP', page, size }),
  });
  const rows = (query.data?.content ?? []).filter((row) => tab === 'pending'
    ? ['NOT_STARTED', 'DRAFT'].includes(row.summaryStatus)
    : ['PENDING_REVIEW', 'FORMALIZED'].includes(row.summaryStatus));
  const visibleColumns = useMemo(() => columnSettings.order.filter((id) => !columnSettings.hidden.includes(id)), [columnSettings]);
  const getColumnWidth = (columnId: SummaryColumnId) => columnWidths[columnId] ?? defaultSummaryColumnWidths[columnId];
  const tableWidth = visibleColumns.reduce((total, columnId) => total + getColumnWidth(columnId), 0) + SUMMARY_STATUS_COLUMN_WIDTH + SUMMARY_ACTION_COLUMN_WIDTH;
  const stickyStatusSx = {
    ...bodyCellSx,
    position: 'sticky' as const,
    right: SUMMARY_ACTION_COLUMN_WIDTH,
    zIndex: 2,
    width: SUMMARY_STATUS_COLUMN_WIDTH,
    minWidth: SUMMARY_STATUS_COLUMN_WIDTH,
    maxWidth: SUMMARY_STATUS_COLUMN_WIDTH,
    bgcolor: '#fff',
    ...listTableStickyEdgeSx,
  };
  const stickyActionSx = {
    ...bodyCellSx,
    position: 'sticky' as const,
    right: 0,
    zIndex: 3,
    width: SUMMARY_ACTION_COLUMN_WIDTH,
    minWidth: SUMMARY_ACTION_COLUMN_WIDTH,
    maxWidth: SUMMARY_ACTION_COLUMN_WIDTH,
    bgcolor: '#fff',
    textAlign: 'center' as const,
  };
  const startColumnResize = (event: ReactPointerEvent<HTMLDivElement>, columnId: SummaryColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    columnResizeRef.current = { id: columnId, startX: event.clientX, startWidth: getColumnWidth(columnId) };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const updateColumnResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = columnResizeRef.current;
    if (!resize) return;
    setColumnWidths((current) => ({ ...current, [resize.id]: Math.max(96, resize.startWidth + event.clientX - resize.startX) }));
  };
  const resetSearch = () => { setDraftKeyword(''); setKeyword(''); setPage(0); };
  const search = () => { setKeyword(draftKeyword.trim()); setPage(0); };
  const changeTab = (next: 'pending' | 'submitted') => { setTab(next); setPage(0); };
  const filterActions = <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={formListFilterActionsSx}>
    <Button size="small" variant="outlined" startIcon={<RestartAltRounded />} onClick={resetSearch} sx={{ height: 40, width: 80, minWidth: 80 }}>重置</Button>
    <Button size="small" variant="contained" startIcon={<SearchRounded />} onClick={search} sx={{ height: 40, width: 80, minWidth: 80 }}>查询</Button>
  </Stack>;
  const renderCell = (columnId: SummaryColumnId, row: DhrInstanceSummary) => {
    const sx = { ...bodyCellSx };
    switch (columnId) {
      case 'dhrNo': return <TableCell key={columnId} sx={sx} title={row.dhrNo}>{row.dhrNo}</TableCell>;
      case 'object': return <TableCell key={columnId} sx={sx} title={`${row.objectNo} · ${row.objectType === 'BATCH' ? '批次' : 'SN'}`}>{row.objectNo} <Typography component="span" variant="caption" sx={{ color: '#909399' }}>· {row.objectType === 'BATCH' ? '批次' : 'SN'}</Typography></TableCell>;
      case 'workOrderNo': return <TableCell key={columnId} sx={sx} title={row.workOrderNo}>{row.workOrderNo || '—'}</TableCell>;
      case 'product': return <TableCell key={columnId} sx={sx} title={[row.productCode, row.productName].filter(Boolean).join(' / ') || '—'}>{[row.productCode, row.productName].filter(Boolean).join(' / ') || '—'}</TableCell>;
      case 'processVersion': return <TableCell key={columnId} sx={sx} title={row.processVersion || '—'}>{row.processVersion || '—'}</TableCell>;
      case 'dhrTemplate': return <TableCell key={columnId} sx={sx} title={`${row.dhrTemplateName || '未绑定模板'}${row.dhrTemplateVersion ? ` · ${row.dhrTemplateVersion}` : ''}`}>{row.dhrTemplateName || '未绑定模板'}{row.dhrTemplateVersion && <Typography component="span" variant="caption" sx={{ color: '#909399' }}> · {row.dhrTemplateVersion}</Typography>}</TableCell>;
      case 'completedAt': return <TableCell key={columnId} sx={{ ...sx, color: '#606266' }}>{formatTime(row.completedAt)}</TableCell>;
    }
  };
  const emptyMessage = tab === 'pending'
    ? '暂无待汇总 DHR。生产完成后，尚未提交汇总的 DHR 会显示在此处。'
    : '暂无已提交的 DHR 汇总。';

  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden', bgcolor: 'background.default' }}>
    <Box component="section" aria-label="DHR 汇总查询" sx={formListQueryPanelSx}>
      <Box sx={formListQueryGridSx}>
        <TextField size="small" label="关键词" placeholder="DHR 编号、批次/SN、工单或产品" value={draftKeyword} onChange={(event) => setDraftKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') search(); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} sx={fieldSx} />
        <TextField select size="small" label="汇总状态" value={tab} onChange={(event) => changeTab(event.target.value as 'pending' | 'submitted')} sx={fieldSx}><MenuItem value="pending">待汇总 / 汇总中</MenuItem><MenuItem value="submitted">已提交</MenuItem></TextField>
        {filterActions}
      </Box>
    </Box>
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', minHeight: 48, px: 2, borderBottom: '1px solid #ebeef5', display: 'flex', alignItems: 'center' }}><Tooltip title="字段设置" arrow><IconButton size="small" aria-label="字段设置" onClick={(event) => setColumnSettingsAnchor(event.currentTarget)} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1 }}><Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ViewColumnRounded sx={{ fontSize: 21 }} /><TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} /></Box></IconButton></Tooltip></Box>
      <ListColumnSettingsPopover anchorEl={columnSettingsAnchor} columns={summaryColumns} settings={columnSettings} onClose={() => setColumnSettingsAnchor(null)} onToggle={(columnId) => setColumnSettings((current) => ({ ...current, hidden: current.hidden.includes(columnId) ? current.hidden.filter((id) => id !== columnId) : [...current.hidden, columnId] }))} onReorder={(sourceId, targetId) => setColumnSettings((current) => reorderListColumns(summaryColumns, current, sourceId, targetId))} />
      <ListTableShell sx={{ flex: 1, minHeight: 0, overflow: 'auto', containerType: 'inline-size' }}>
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: tableWidth, minWidth: tableWidth, height: query.isLoading || query.isError || rows.length === 0 ? '100%' : 'auto' }}>
          <colgroup>{visibleColumns.map((columnId) => <col key={columnId} style={{ width: getColumnWidth(columnId) }} />)}<col style={{ width: SUMMARY_STATUS_COLUMN_WIDTH }} /><col style={{ width: SUMMARY_ACTION_COLUMN_WIDTH }} /></colgroup>
          <TableHead><TableRow sx={{ '& .MuiTableCell-root': headerCellSx }}>{visibleColumns.map((columnId) => <TableCell key={columnId} sx={{ width: getColumnWidth(columnId), minWidth: getColumnWidth(columnId) }}><Box sx={{ position: 'relative', pr: 1 }}>{summaryColumns.find((column) => column.id === columnId)?.label}<Box aria-label={`调整${summaryColumns.find((column) => column.id === columnId)?.label ?? ''}列宽`} onPointerDown={(event) => startColumnResize(event, columnId)} onPointerMove={updateColumnResize} onPointerUp={() => { columnResizeRef.current = null; }} onPointerCancel={() => { columnResizeRef.current = null; }} onLostPointerCapture={() => { columnResizeRef.current = null; }} sx={listColumnResizeHandleSx} /></Box></TableCell>)}<TableCell align="center" sx={{ ...headerCellSx, position: 'sticky', right: SUMMARY_ACTION_COLUMN_WIDTH, zIndex: 4, width: SUMMARY_STATUS_COLUMN_WIDTH, minWidth: SUMMARY_STATUS_COLUMN_WIDTH, maxWidth: SUMMARY_STATUS_COLUMN_WIDTH, bgcolor: '#f5f7fa', ...listTableStickyEdgeSx }}>汇总状态</TableCell><TableCell align="center" sx={{ ...headerCellSx, position: 'sticky', right: 0, zIndex: 5, width: SUMMARY_ACTION_COLUMN_WIDTH, minWidth: SUMMARY_ACTION_COLUMN_WIDTH, maxWidth: SUMMARY_ACTION_COLUMN_WIDTH, bgcolor: '#f5f7fa' }}>操作</TableCell></TableRow></TableHead>
          <TableBody>{query.isLoading || query.isError || !rows.length ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length + 2} sx={{ height: '100%' }}><Stack alignItems="center" spacing={1.5}>{query.isLoading ? <CircularProgress size={28} /> : query.isError ? <><Typography fontWeight={700}>DHR 汇总列表加载失败</Typography><Button size="small" startIcon={<RefreshRounded />} onClick={() => query.refetch()}>重新加载</Button></> : <Typography color="text.secondary" sx={{ maxWidth: 360, textAlign: 'center' }}>{emptyMessage}</Typography>}</Stack></TableStateCell></TableRow> : rows.map((row) => <TableRow key={row.id} hover>{visibleColumns.map((columnId) => renderCell(columnId, row))}<TableCell sx={stickyStatusSx}><StatusBadge label={summaryLabels[row.summaryStatus]} color={row.summaryStatus === 'FORMALIZED' ? 'success' : row.summaryStatus === 'PENDING_REVIEW' ? 'warning' : 'primary'} /></TableCell><TableCell sx={stickyActionSx}><Tooltip title={tab === 'pending' ? '进入汇总' : '查看冻结版本'}><IconButton size="small" aria-label={tab === 'pending' ? `进入汇总 ${row.dhrNo}` : `查看冻结版本 ${row.dhrNo}`} onClick={() => setSelected(row)} sx={{ color: '#606266', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}><PreviewOutlined fontSize="small" /></IconButton></Tooltip></TableCell></TableRow>)}</TableBody>
        </Table>
      </ListTableShell>
      <FormListPagination totalElements={query.data?.totalElements ?? 0} totalPages={query.data?.totalPages ?? 0} page={page} pageSize={size} onPageChange={setPage} onPageSizeChange={(next) => { setSize(next); setPage(0); }} />
    </Box>
    {selected && <SummaryWorkspace dhr={selected} onClose={() => setSelected(null)} />}
  </Box>;
}
