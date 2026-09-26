import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AddRounded,
  ArticleOutlined,
  ChevronRightRounded,
  CloseRounded,
  DeleteOutlineRounded,
  DownloadRounded,
  DragIndicatorRounded,
  EditOutlined,
  ExpandMoreRounded,
  FactCheckOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  HistoryRounded,
  PostAddRounded,
  PreviewOutlined,
  RefreshRounded,
  RestartAltRounded,
  SearchRounded,
  TuneRounded,
  ViewColumnRounded,
  ViewListOutlined,
  AttachFileRounded,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
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
  getDhrSummaryAudit,
  downloadDhrArchive,
  downloadDhrAttachment,
  listDhrSummaryInstances,
  saveDhrSummaryDraft,
  submitDhrSummary,
  uploadDhrAttachment,
  verifyDhrAttachment,
  unlinkDhrAttachment,
  type DhrAttachment,
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
import ConfirmDialog from '@/components/ConfirmDialog';
import AppDialog from '@/components/AppDialog';
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
import { reorganizeDhr } from '@/api/dhr-workbenches';
import DhrActionDialog from './DhrActionDialog';
import { orderedSummaryChildren, placeSummaryRecord } from './summaryPlacementOrder';
import { groupSummarySources, placeSummarySourceGroup, summarySourceKey, type SummarySourceGroup } from './summarySourceGroups';

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

export function EvidenceCanvas({ record, emptyMessage }: { record: DhrEvidenceRecord | null; emptyMessage: string }) {
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

export function SummaryWorkspace({ dhr, onClose }: { dhr: DhrInstanceSummary; onClose: () => void }) {
  const snackbar = useSnackbar();
  const canEdit = useAuthStore((state) => state.hasPermission('dhr.summaries.edit'));
  const canSubmit = useAuthStore((state) => state.hasPermission('dhr.summaries.submit'));
  const canReorganize = useAuthStore((state) => state.hasPermission('dhr.summaries.reorganize'));
  const canExport = useAuthStore((state) => state.hasPermission('dhr.summaries.export'));
  const [reorganizing, setReorganizing] = useState(false);
  const reorganizeButton = useMemo(() => reorganizing ? { action: 'REORGANIZE', label: '重新整理', requireOpinion: true } : null, [reorganizing]);
  const client = useQueryClient();
  const [isWriting, setIsWriting] = useState(false);
  const writeInFlight = useRef(false);
  const query = useQuery({ queryKey: ['dhr-summary-workspace', dhr.id], queryFn: () => getDhrSummaryWorkspace(dhr.id), staleTime: 0, refetchOnMount: 'always', refetchOnReconnect: !isWriting });
  const summaryStatus = query.data?.dhr.summaryStatus ?? dhr.summaryStatus;
  const readOnly = summaryStatus === 'PENDING_REVIEW' || summaryStatus === 'FORMALIZED';
  const editable = !readOnly && canEdit;
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const versionQuery = useQuery({
    queryKey: ['dhr-summary-version', dhr.id, selectedVersionId],
    queryFn: () => getDhrSummaryVersion(dhr.id, selectedVersionId),
    enabled: readOnly && Boolean(selectedVersionId),
    // Evidence is immutable, but its current impact and review outcome are not cached as immutable.
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const workspace = useMemo<DhrSummaryWorkspace | undefined>(() => {
    if (!readOnly) return query.data;
    if (!query.data || !versionQuery.data) return undefined;
    const frozen = versionQuery.data;
    return {
      dhr: { ...frozen.dhr, directorySnapshot: frozen.version.baseDirectory },
      candidates: frozen.version.candidates,
      attachments: frozen.version.attachments,
      draft: { id: frozen.version.id, revision: 0, overlayDirectories: frozen.version.overlayDirectories, placements: frozen.placements },
      versions: query.data.versions,
      sourceScopeHash: query.data.sourceScopeHash,
    };
  }, [query.data, readOnly, versionQuery.data]);
  const [overlay, setOverlay] = useState<DhrSummaryDirectoryOverlay[]>([]);
  const [placements, setPlacements] = useState<DhrSummaryPlacement[]>([]);
  const [revision, setRevision] = useState<number | undefined>();
  const [draftId, setDraftId] = useState<string | undefined>();
  const [selectedNode, setSelectedNode] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [instancePanel, setInstancePanel] = useState<{ key: string; label: string; directoryKey: string; recordIds: string[] } | null>(null);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [directoryNameError, setDirectoryNameError] = useState(false);
  const [directoryParentKey, setDirectoryParentKey] = useState('');
  const directoryNameInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<DhrEvidenceRecord | null>(null);
  const [candidateDrawerOpen, setCandidateDrawerOpen] = useState(false);
  const [candidateOrigin, setCandidateOrigin] = useState<'WORK' | 'CUSTOM'>('WORK');
  const [expandedSourceKeys, setExpandedSourceKeys] = useState<string[]>([]);
  const [dragOverNode, setDragOverNode] = useState('');
  const [draggingRecordId, setDraggingRecordId] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [renamingRecords, setRenamingRecords] = useState<string[]>([]);
  const [renamedTitle, setRenamedTitle] = useState('');
  const [nameError, setNameError] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [collapsedNodeKeys, setCollapsedNodeKeys] = useState<string[]>([]);
  const [initializedKey, setInitializedKey] = useState<string>();
  const [confirmReload, setConfirmReload] = useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [qualityReviewed, setQualityReviewed] = useState(false);
  const [signaturesReviewed, setSignaturesReviewed] = useState(false);
  const [scopeReviewed, setScopeReviewed] = useState(false);
  const [checkNote, setCheckNote] = useState('');
  const [auditPage, setAuditPage] = useState(0);
  const auditQuery = useQuery({ queryKey: ['dhr-summary-audit', dhr.id, auditPage], queryFn: () => getDhrSummaryAudit(dhr.id, auditPage), enabled: auditDialogOpen });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentKind, setAttachmentKind] = useState<DhrAttachment['sourceKind']>('EXTERNAL_REPORT');
  const [attachmentPurpose, setAttachmentPurpose] = useState('');
  const [originalRecordedAt, setOriginalRecordedAt] = useState('');
  const [custodyLocation, setCustodyLocation] = useState('');
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [unlinkingAttachmentId, setUnlinkingAttachmentId] = useState('');
  const [unlinkReason, setUnlinkReason] = useState('');

  useEffect(() => {
    if (!readOnly || selectedVersionId || !query.data?.versions.length) return;
    setSelectedVersionId(query.data.versions[0].id);
  }, [query.data?.versions, readOnly, selectedVersionId]);

  const workspaceKey = readOnly ? `version-${versionQuery.data?.version.id}` : `draft-${dhr.id}`;
  useEffect(() => {
    if (!workspace || (!readOnly && query.isFetching) || initializedKey === workspaceKey) return;
    setOverlay(workspace.draft?.overlayDirectories ?? []);
    setPlacements(workspace.draft?.placements ?? []);
    setRevision(workspace.draft?.revision);
    setDraftId(workspace.draft?.id);
    setSelectedNode(workspace.dhr.directorySnapshot.directories[0]?.id ? `base-dir-${workspace.dhr.directorySnapshot.directories[0].id}` : 'source-work');
    setSelectedRecordId('');
    setInstancePanel(null);
    setInitializedKey(workspaceKey);
  }, [workspace, workspaceKey, initializedKey, readOnly, query.isFetching]);

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
    options.push({ key: 'source-work', label: '作业来源（默认）' }, { key: 'source-custom', label: '自定义来源（默认）' }, { key: 'source-directory', label: '未匹配目录的表单' });
    return options;
  }, [baseDirectories, basePathById, overlay]);
  const targetLabelByKey = useMemo(() => new Map(targetOptions.map((target) => [target.key, target.label] as const)), [targetOptions]);
  const legacyVersion = readOnly && versionQuery.data?.version.evidenceModelVersion === 1;
  const defaultPlacements = useMemo<DhrSummaryPlacement[]>(() => (workspace?.candidates ?? []).map((record) => ({
    recordId: record.id,
    targetNodeKey: record.originKind === 'DIRECTORY'
      ? (baseDirectories.some((directory) => directory.items.some((item) => String(item.id) === String(record.snapshot.dhrItemId ?? '')))
        ? `base-item-${String(record.snapshot.dhrItemId)}` : 'source-directory')
      : record.originKind === 'WORK' ? 'source-work' : 'source-custom',
  })), [baseDirectories, workspace?.candidates]);
  const directPlacements = useMemo(() => defaultPlacements.filter((placement) => candidateById.get(placement.recordId)?.originKind === 'DIRECTORY'), [candidateById, defaultPlacements]);
  const effectivePlacements = useMemo(() => legacyVersion ? placements : [
    ...defaultPlacements.filter((placement) => !placements.some((override) => override.recordId === placement.recordId)),
    ...placements,
  ], [defaultPlacements, legacyVersion, placements]);
  const placementByRecordId = useMemo(() => new Map(effectivePlacements.map((placement) => [placement.recordId, placement.targetNodeKey] as const)), [effectivePlacements]);
  const recordsByTarget = useMemo(() => {
    const groups = new Map<string, DhrEvidenceRecord[]>();
    effectivePlacements.forEach((placement) => {
      const record = candidateById.get(placement.recordId);
      if (record) groups.set(placement.targetNodeKey, [...(groups.get(placement.targetNodeKey) ?? []), record]);
    });
    return groups;
  }, [candidateById, effectivePlacements]);
  const adjustedRecordIds = useMemo(() => new Set(placements.filter((placement) => placement.targetNodeKey !== defaultPlacements.find((entry) => entry.recordId === placement.recordId)?.targetNodeKey).map((placement) => placement.recordId)), [defaultPlacements, placements]);
  const sourceGroups = useMemo(() => groupSummarySources(workspace?.candidates ?? []), [workspace?.candidates]);
  const sourceGroupsByKey = useMemo(() => new Map(sourceGroups.map((group) => [group.key, group] as const)), [sourceGroups]);
  const candidateGroups = useMemo(() => ({
    WORK: sourceGroups.filter((group) => group.originKind === 'WORK'),
    CUSTOM: sourceGroups.filter((group) => group.originKind === 'CUSTOM'),
  }), [sourceGroups]);
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
  const incompleteCount = (workspace?.candidates ?? []).filter((record) => record.status !== 'COMPLETED').length;
  const actualRecordCount = workspace?.candidates.length ?? 0;
  const placementNameByRecordId = useMemo(() => new Map(placements.filter((placement) => placement.displayName).map((placement) => [placement.recordId, placement.displayName!] as const)), [placements]);
  const activeVersion = query.data?.versions.find((version) => version.id === selectedVersionId);

  useEffect(() => {
    if (selectedRecordId && !selectedRecords.some((record) => record.id === selectedRecordId)) setSelectedRecordId('');
  }, [selectedRecordId, selectedRecords]);

  const persistDraft = async () => {
    const saved = await saveDhrSummaryDraft(dhr.id, { draftId, revision, expectedScopeHash: workspace?.sourceScopeHash ?? '', overlayDirectories: overlay, placements });
    // Saving succeeded even if the following submission fails.
    setRevision(saved.revision);
    setDraftId(saved.id);
    client.setQueryData<DhrSummaryWorkspace>(['dhr-summary-workspace', dhr.id], (current) => current ? {
      ...current,
      dhr: { ...current.dhr, summaryStatus: 'DRAFT' },
      draft: { ...saved, overlayDirectories: overlay, placements },
    } : current);
    return saved;
  };
  const write = async <T,>(action: () => Promise<T>): Promise<T> => {
    if (writeInFlight.current) throw new Error('正在保存或提交，请稍候');
    writeInFlight.current = true;
    setIsWriting(true);
    try {
      await client.cancelQueries({ queryKey: ['dhr-summary-workspace', dhr.id] });
      return await action();
    } finally {
      writeInFlight.current = false;
      setIsWriting(false);
    }
  };
  const refreshAfterError = (error: Error, fallback: string) => {
    snackbar.showMessage(error.message || fallback, 'error');
    // Reconcile a possibly successful server write whose response was lost; keep local edits.
    void client.invalidateQueries({ queryKey: ['dhr-summary-workspace', dhr.id] });
    void client.invalidateQueries({ queryKey: ['dhr-instances'] });
  };
  const saveMutation = useMutation({
    mutationFn: () => write(persistDraft),
    onSuccess: () => {
      snackbar.showMessage('汇总草稿已保存', 'success');
      client.invalidateQueries({ queryKey: ['dhr-instances'] });
    },
    onError: (error: Error) => refreshAfterError(error, '保存汇总草稿失败'),
  });
  const submitMutation = useMutation({
    mutationFn: () => write(async () => {
      if (!qualityReviewed || !signaturesReviewed || !scopeReviewed || !checkNote.trim()) throw new Error('请完成提交前人工核查');
      const manualReview = { qualityAndExceptionsReviewed: true as const, sourceSignaturesReviewed: true as const,
        completeScopeReviewed: true as const, note: checkNote.trim() };
      if (!canEdit) {
        if (revision === undefined || !draftId) throw new Error('当前没有可提交的汇总草稿');
        return submitDhrSummary(dhr.id, revision, draftId, manualReview);
      }
      const saved = await persistDraft();
      return submitDhrSummary(dhr.id, saved.revision, saved.id, manualReview);
    }),
    onSuccess: (result) => {
      setCheckDialogOpen(false);
      snackbar.showMessage(result.status === 'PENDING_REVIEW' ? `汇总 V${result.versionNo} 已冻结，等待审核` : `汇总 V${result.versionNo} 已正式化`, 'success');
      client.invalidateQueries({ queryKey: ['dhr-instances'] });
      client.invalidateQueries({ queryKey: ['dhr-summary-workspace', dhr.id] });
      onClose();
    },
    onError: (error: Error) => refreshAfterError(error, '提交 DHR 汇总失败'),
  });
  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportArchive = async (scope: 'FULL' | 'SELECTED', recordIds = scope === 'SELECTED' ? selectedRecords.map((record) => record.id) : [], attachmentIds: string[] = []) => {
    if (!selectedVersionId || exportBusy) return;
    setExportBusy(true);
    try {
      const blob = await downloadDhrArchive(dhr.id, selectedVersionId, scope, recordIds, attachmentIds);
      saveBlob(blob, `${dhr.dhrNo}-V${activeVersion?.versionNo ?? ''}-${scope === 'FULL' ? '完整DHR' : '选定范围'}.zip`);
      snackbar.showMessage(scope === 'FULL' ? '完整版本 ZIP 已导出' : '选定范围 ZIP 已导出（非完整 DHR）', 'success');
    } catch (error) { snackbar.showMessage(error instanceof Error ? error.message : '导出失败', 'error'); }
    finally { setExportBusy(false); }
  };
  const uploadAttachment = async () => {
    if (!attachmentFile || !attachmentPurpose.trim() || attachmentBusy) return;
    setAttachmentBusy(true);
    try {
      await uploadDhrAttachment(dhr.id, { file: attachmentFile, sourceKind: attachmentKind,
        purpose: attachmentPurpose.trim(), originalRecordedAt: originalRecordedAt || undefined,
        custodyLocation: custodyLocation.trim() || undefined });
      setAttachmentFile(null);
      setAttachmentPurpose('');
      setOriginalRecordedAt('');
      setCustodyLocation('');
      await query.refetch();
      snackbar.showMessage('附件已关联，请核对内容后点击“确认核验”', 'success');
    } catch (error) { snackbar.showMessage(error instanceof Error ? error.message : '上传附件失败', 'error'); }
    finally { setAttachmentBusy(false); }
  };
  const verifyAttachment = async (attachmentId: string) => {
    setAttachmentBusy(true);
    try { await verifyDhrAttachment(dhr.id, attachmentId); await query.refetch(); snackbar.showMessage('附件已核验', 'success'); }
    catch (error) { snackbar.showMessage(error instanceof Error ? error.message : '附件核验失败', 'error'); }
    finally { setAttachmentBusy(false); }
  };
  const unlinkAttachment = async () => {
    if (!unlinkingAttachmentId || !unlinkReason.trim()) return;
    setAttachmentBusy(true);
    try {
      await unlinkDhrAttachment(dhr.id, unlinkingAttachmentId, unlinkReason.trim());
      setUnlinkingAttachmentId(''); setUnlinkReason(''); await query.refetch();
      snackbar.showMessage('附件关联已解除，历史记录与文件保留', 'success');
    } catch (error) { snackbar.showMessage(error instanceof Error ? error.message : '解除附件关联失败', 'error'); }
    finally { setAttachmentBusy(false); }
  };
  const getAttachment = async (attachment: DhrAttachment) => {
    try { saveBlob(await downloadDhrAttachment(dhr.id, attachment.id, readOnly ? selectedVersionId : undefined), attachment.name); }
    catch (error) { snackbar.showMessage(error instanceof Error ? error.message : '下载附件失败', 'error'); }
  };
  const openDirectoryCreator = (parentKey: string) => {
    if (!editable || writeInFlight.current) return;
    setDirectoryParentKey(parentKey);
    setNewDirectoryName('');
    setDirectoryNameError(false);
  };
  const addDirectory = () => {
    const name = newDirectoryName.trim();
    if (!editable || writeInFlight.current || !directoryParentKey) return;
    if (!name) {
      setDirectoryNameError(true);
      directoryNameInputRef.current?.focus();
      return;
    }
    const key = `summary-dir-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setOverlay((current) => [...current, { key, parentKey: directoryParentKey === '__root__' ? null : directoryParentKey, name, sortOrder: current.length + 1 }]);
    setCollapsedNodeKeys((current) => current.filter((item) => item !== directoryParentKey));
    setSelectedNode(key);
    setNewDirectoryName('');
    setDirectoryNameError(false);
    setDirectoryParentKey('');
  };
  const removeDirectory = () => {
    if (!editable || writeInFlight.current || !pendingRemoval) return;
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
    const removed = overlay.find((node) => node.key === pendingRemoval);
    if (!removed) { setPendingRemoval(null); return; }
    const siblings = overlay.filter((node) => node.parentKey === removed.parentKey).sort((a, b) => a.sortOrder - b.sortOrder);
    const nextSibling = siblings.slice(siblings.findIndex((node) => node.key === pendingRemoval) + 1)
      .find((node) => !descendants.has(node.key));
    setOverlay((current) => current.filter((node) => !descendants.has(node.key)));
    setPlacements((current) => {
      const restored: DhrSummaryPlacement[] = current.filter((placement) => descendants.has(placement.targetNodeKey))
        .map((placement) => ({ recordId: placement.recordId,
          targetNodeKey: candidateById.get(placement.recordId)?.originKind === 'DIRECTORY' ? 'source-directory'
            : candidateById.get(placement.recordId)?.originKind === 'WORK' ? 'source-work' : 'source-custom',
          ...(placement.displayName ? { displayName: placement.displayName } : {}) }));
      const remaining = [...current.filter((placement) => !descendants.has(placement.targetNodeKey)), ...restored];
      const displaced = remaining.filter((placement) => placement.beforeNodeKey === pendingRemoval)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      if (!displaced.length) return remaining;
      const nextAnchor = nextSibling?.key;
      const firstFollowing = remaining
        .filter((placement) => placement.targetNodeKey === removed.parentKey && placement.beforeNodeKey === nextAnchor)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))[0];
      return displaced.reduce((result, placement) => placeSummaryRecord(result, placement.recordId, placement.targetNodeKey,
        firstFollowing ? `record-${firstFollowing.recordId}` : nextAnchor), remaining);
    });
    setSelectedNode(baseDirectories[0]?.id ? `base-dir-${baseDirectories[0].id}` : 'source-work');
    setPendingRemoval(null);
  };
  const assignSource = (group: SummarySourceGroup, targetNodeKey: string, beforeKey?: string) => {
    if (!editable || writeInFlight.current) return;
    const target = targetNodeKey || (group.originKind === 'WORK' ? 'source-work' : 'source-custom');
    if (!targetLabelByKey.has(target)) return;
    if (target.startsWith('source-') && target !== (group.originKind === 'WORK' ? 'source-work' : 'source-custom')) return;
    setPlacements((current) => placeSummarySourceGroup(current, group, target, beforeKey));
    if (targetNodeKey) {
      const ancestors = new Set<string>();
      let key = targetNodeKey;
      while (key) {
        ancestors.add(key);
        if (key.startsWith('base-dir-')) {
          const parentId = baseDirectoryById.get(key.slice(9))?.parentId;
          key = parentId == null ? '' : `base-dir-${parentId}`;
        } else {
          key = overlay.find((directory) => directory.key === key)?.parentKey ?? '';
        }
      }
      setCollapsedNodeKeys((current) => current.filter((item) => !ancestors.has(item)));
      setSelectedNode(targetNodeKey);
      setSelectedRecordId(group.records[0]?.id ?? '');
    } else if (group.records.some((record) => record.id === selectedRecordId)) {
      setSelectedRecordId('');
    }
  };
  const dropSource = (event: ReactDragEvent, targetNodeKey: string, beforeKey?: string) => {
    const group = sourceGroupsByKey.get(event.dataTransfer.getData('application/x-edhr-dhr-source'));
    if (!group) return;
    // A left-hand run or an individual instance moves only the records the user dragged.
    const payload = event.dataTransfer.getData('application/x-edhr-dhr-records');
    let records = group.records;
    if (payload) {
      try {
        const ids: unknown = JSON.parse(payload);
        if (!Array.isArray(ids) || !ids.length || ids.some((id) => typeof id !== 'string' || !group.records.some((record) => record.id === id))) return;
        records = ids.map((id) => group.records.find((record) => record.id === id)!);
        if (new Set(ids).size !== ids.length) return;
      } catch { return; }
    }
    assignSource({ ...group, records }, targetNodeKey, beforeKey);
  };
  const directoryDropHandlers = (targetNodeKey: string, parentKey?: string, afterKey?: string | null) => ({
    onDragOver: (event: ReactDragEvent) => {
      // Browsers do not expose drag data during dragover; the source is limited to eligible cards below.
      if (!editable || isWriting || !event.dataTransfer.types.includes('application/x-edhr-dhr-source')) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      event.stopPropagation();
      const ratio = (event.clientY - event.currentTarget.getBoundingClientRect().top) / event.currentTarget.getBoundingClientRect().height;
      setDragOverNode(parentKey && ratio < 0.25 ? `before:${parentKey}:${targetNodeKey}`
        : parentKey && ratio > 0.75 ? `before:${parentKey}:${afterKey ?? 'end'}` : `into:${targetNodeKey}`);
    },
    onDragLeave: (event: ReactDragEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOverNode('');
    },
    onDrop: (event: ReactDragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOverNode('');
      setDraggingRecordId('');
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientY - rect.top) / rect.height;
      if (parentKey && ratio < 0.25) dropSource(event, parentKey, targetNodeKey);
      else if (parentKey && ratio > 0.75) dropSource(event, parentKey, afterKey ?? undefined);
      else dropSource(event, targetNodeKey);
    },
  });
  const insertionDropHandlers = (targetNodeKey: string, beforeKey?: string, afterKey?: string | null, prefix = '') => ({
    onDragOver: (event: ReactDragEvent) => {
      if (!editable || isWriting || !event.dataTransfer.types.includes('application/x-edhr-dhr-source')) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      const rect = event.currentTarget.getBoundingClientRect();
      const key = afterKey !== undefined && event.clientY - rect.top >= rect.height / 2 ? afterKey ?? undefined : beforeKey;
      setDragOverNode(`${prefix}before:${targetNodeKey}:${key ?? 'end'}`);
    },
    onDrop: (event: ReactDragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOverNode('');
      setDraggingRecordId('');
      const rect = event.currentTarget.getBoundingClientRect();
      const key = afterKey !== undefined && event.clientY - rect.top >= rect.height / 2 ? afterKey ?? undefined : beforeKey;
      dropSource(event, targetNodeKey, key);
    },
  });
  const insertionSlot = (parentKey: string, beforeKey?: string, prefix = '') => {
    if (!editable) return null;
    const key = `${prefix}before:${parentKey}:${beforeKey ?? 'end'}`;
    return <Box key={key} data-summary-insertion-active={dragOverNode === key || undefined} aria-label={`${prefix ? '实例面板：' : ''}${beforeKey ? `插入到 ${beforeKey} 之前` : `插入到 ${parentKey} 末尾`}`}
      {...insertionDropHandlers(parentKey, beforeKey, undefined, prefix)}
      sx={{ height: 10, mx: 1.5, borderRadius: 1, position: 'relative',
        bgcolor: dragOverNode === key ? '#e8f4ff' : draggingRecordId ? '#fafcff' : 'transparent',
        '&::after': { content: '""', display: dragOverNode === key ? 'block' : 'none', position: 'absolute', top: '50%', left: 0, right: 0, height: 2, bgcolor: '#1890ff' } }} />;
  };
  const startSourceDrag = (event: ReactDragEvent, groupKey: string, records?: DhrEvidenceRecord[]) => {
    event.stopPropagation();
    event.dataTransfer.setData('application/x-edhr-dhr-source', groupKey);
    if (records) event.dataTransfer.setData('application/x-edhr-dhr-records', JSON.stringify(records.map((record) => record.id)));
    event.dataTransfer.effectAllowed = 'move';
    setDraggingRecordId(groupKey);
  };
  const endRecordDrag = () => { setDraggingRecordId(''); setDragOverNode(''); };
  const placementLabel = (recordId: string) => {
    const target = placementByRecordId.get(recordId);
    if (!target) return '默认来源位置';
    if (target.startsWith('base-item-')) return itemLabelById.get(target.slice(10)) || '目录表单';
    return targetLabelByKey.get(target) || '已归入目录';
  };
  const treeButtonSx = (selected: boolean) => ({
    minWidth: 0,
    minHeight: 36,
    px: 0,
    justifyContent: 'flex-start',
    textAlign: 'left',
    textTransform: 'none' as const,
    fontWeight: 400,
    color: selected ? '#1677c8' : '#303133',
    '&:hover': { bgcolor: 'transparent' },
  });
  const treeRowSx = (selected: boolean, depth: number) => ({
    display: 'grid',
    gridTemplateColumns: '24px minmax(0, 1fr) 80px',
    alignItems: 'center',
    minHeight: 36,
    pl: `${8 + depth * 20}px`,
    pr: 0.5,
    bgcolor: selected ? '#e8f4ff' : 'transparent',
    '&:hover': { bgcolor: selected ? '#e8f4ff' : '#f5f7fa' },
    '&:hover .summary-tree-action, &:focus-within .summary-tree-action': { opacity: 1 },
  });
  const treeActionSx = { width: 25, height: 25, opacity: 0, transition: 'opacity .12s' };
  const selectDirectory = (key: string) => { setSelectedNode(key); setSelectedRecordId(''); setInstancePanel(null); };
  const selectRecord = (record: DhrEvidenceRecord, directoryKey: string) => {
    setSelectedNode(directoryKey);
    setSelectedRecordId(record.id);
  };
  const openRename = (records: DhrEvidenceRecord[]) => {
    if (!editable || isWriting) return;
    setRenamingRecords(records.map((record) => record.id));
    setRenamedTitle(placementNameByRecordId.get(records[0].id) ?? getRecordTitle(records[0]));
    setNameError(false);
  };
  const saveRename = () => {
    const name = renamedTitle.trim();
    if (!name || name.length > 120) { setNameError(true); return; }
    const ids = new Set(renamingRecords);
    setPlacements((current) => [
      ...current.map((placement) => ids.has(placement.recordId) ? { ...placement, displayName: name } : placement),
      ...directPlacements.filter((placement) => ids.has(placement.recordId) && !current.some((existing) => existing.recordId === placement.recordId))
        .map((placement) => ({ ...placement, displayName: name })),
    ]);
    setRenamingRecords([]);
  };
  const toggleDirectory = (key: string) => setCollapsedNodeKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const showInstancePanel = (records: DhrEvidenceRecord[], label: string, key: string, directoryKey: string) => {
    setInstancePanel({ key, label, directoryKey, recordIds: records.map((record) => record.id) });
    if (records[0]) selectRecord(records[0], directoryKey);
  };
  const selectFormRow = (records: DhrEvidenceRecord[], label: string, key: string, directoryKey: string) => {
    if (instancePanel) showInstancePanel(records, label, key, directoryKey);
    else if (records[0]) selectRecord(records[0], directoryKey);
    else selectDirectory(directoryKey);
  };
  const formRowActions = (records: DhrEvidenceRecord[], label: string, key: string, directoryKey: string, remove?: () => void) => {
    // A run's first record can change after sorting/removal; compare live membership, not its old first ID.
    const expanded = instancePanel?.directoryKey === directoryKey && ((key.startsWith('base-item-') && instancePanel.key === key)
      || (records.length > 0 && records.length === panelRecords.length && records.every((record) => panelRecords.some((entry) => entry.id === record.id))));
    return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      {editable && records.length > 0 && <Tooltip title="重命名汇总文档"><IconButton className="summary-tree-action" size="small" disabled={isWriting} aria-label={`重命名汇总 ${label}`} onClick={() => openRename(records)} sx={treeActionSx}><EditOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
      {editable && remove && <Tooltip title="恢复默认来源位置"><IconButton className="summary-tree-action" size="small" disabled={isWriting} aria-label={`恢复默认位置 ${label}`} onClick={remove} sx={treeActionSx}><RestartAltRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
      <Tooltip title={`实例列表（${records.length} 份）`}><IconButton className="summary-tree-action" size="small" aria-label={`实例列表 ${label}`} aria-expanded={expanded} onClick={() => expanded ? setInstancePanel(null) : showInstancePanel(records, label, key, directoryKey)} sx={{ ...treeActionSx, color: expanded ? 'primary.main' : 'text.secondary' }}><ViewListOutlined sx={{ fontSize: 18 }} /></IconButton></Tooltip>
    </Box>
    );
  };
  const renderRecordNode = (record: DhrEvidenceRecord, directoryKey: string, afterKey?: string | null): ReactNode => (
    <Box key={`record-${record.id}`}
      {...(record.originKind === 'DIRECTORY' ? {} : insertionDropHandlers(directoryKey, `record-${record.id}`, afterKey ?? null, 'instance:'))}
      sx={{ ...treeRowSx(selectedRecordId === record.id, 0), gridTemplateColumns: 'minmax(0, 1fr)', p: 1, mx: 1, borderRadius: 1 }}>
      <Button fullWidth aria-label={`查看实例 ${record.instanceNo}`} onClick={() => selectRecord(record, directoryKey)}
        draggable={editable && !isWriting && record.originKind !== 'DIRECTORY'}
        onDragStart={(event) => startSourceDrag(event, summarySourceKey(record), [record])} onDragEnd={endRecordDrag}
        startIcon={<ArticleOutlined sx={{ fontSize: 16, color: '#6c7a89' }} />}
        sx={{ ...treeButtonSx(selectedRecordId === record.id), minHeight: 42 }}>
        <Box minWidth={0} flex={1} textAlign="left"><Typography variant="body2" noWrap>{placementNameByRecordId.get(record.id) ?? getRecordTitle(record)}</Typography><Typography variant="caption" color="text.secondary" display="block" noWrap>{record.instanceNo} · {evidenceStatus(record).label}</Typography></Box>
      </Button>
      <Stack direction="row" justifyContent="flex-end">{editable && <Tooltip title="重命名汇总文档"><IconButton className="summary-tree-action" size="small" disabled={isWriting} aria-label={`重命名实例 ${record.instanceNo}`} onClick={() => openRename([record])} sx={treeActionSx}><EditOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip>}{editable && adjustedRecordIds.has(record.id) && record.originKind !== 'DIRECTORY' && <Tooltip title="恢复默认来源位置"><IconButton className="summary-tree-action" size="small" disabled={isWriting} aria-label={`恢复默认位置 ${record.instanceNo}`} onClick={() => assignSource({ key: summarySourceKey(record), originKind: record.originKind as 'WORK' | 'CUSTOM', records: [record] }, '')} sx={treeActionSx}><RestartAltRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>}</Stack>
    </Box>
  );
  const renderOptionalSourceNode = (group: SummarySourceGroup, records: DhrEvidenceRecord[], parentKey: string, depth: number, afterKey?: string | null): ReactNode => {
    const first = records[0];
    const expandedKey = `source:${group.key}:${parentKey}:${first.id}`;
    return <Box key={`source-${first.id}`}>
      <Box {...insertionDropHandlers(parentKey, `record-${first.id}`, afterKey ?? null)} sx={treeRowSx(records.some((record) => record.id === selectedRecordId), depth)}>
        <Box />
        <Button fullWidth data-summary-record={first.id} aria-label={`来源表单 ${getRecordTitle(first)} ${records.length} 份`} onClick={() => selectFormRow(records, getRecordTitle(first), expandedKey, parentKey)}
          draggable={editable && !isWriting}
          onDragStart={(event) => startSourceDrag(event, group.key, records)} onDragEnd={endRecordDrag}
          startIcon={<ArticleOutlined sx={{ fontSize: 16, color: '#6c7a89' }} />}
          sx={treeButtonSx(records.some((record) => record.id === selectedRecordId))}>
          <Typography variant="body2" noWrap sx={{ flex: 1, textAlign: 'left' }}>{placementNameByRecordId.get(first.id) ?? getRecordTitle(first)}</Typography>
        </Button>
        {formRowActions(records, getRecordTitle(first), expandedKey, parentKey, records.some((record) => adjustedRecordIds.has(record.id)) ? () => assignSource({ ...group, records }, '') : undefined)}
      </Box>
    </Box>;
  };
  const renderDirectoryChildren = (parentKey: string, depth: number): ReactNode => {
    const base = parentKey.startsWith('base-dir-') ? baseDirectoryById.get(parentKey.slice(9)) : undefined;
    const childDirectories = [...(baseChildren.get(base ? String(base.id) : '') ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const items = [...(base?.items ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const overlayDirectories = [...(overlayChildren.get(parentKey) ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const staticKeys = [...childDirectories.map((directory) => `base-dir-${directory.id}`), ...items.map((item) => `base-item-${item.id}`), ...overlayDirectories.map((node) => node.key)];
    const children = orderedSummaryChildren(parentKey, staticKeys, effectivePlacements);
    return <>{children.map((key, index) => {
      const before = insertionSlot(parentKey, key);
      if (key.startsWith('record-')) {
        const record = candidateById.get(key.slice(7));
        if (!record) return null;
        const group = sourceGroupsByKey.get(summarySourceKey(record));
        if (!group) return null;
        // Collapse adjacent runs only: grouping must never reorder or hide placements.
        const previousKey = children[index - 1];
        const previous = previousKey?.startsWith('record-') ? candidateById.get(previousKey.slice(7)) : undefined;
        if (previous && summarySourceKey(previous) === group.key) return null;
        const run: DhrEvidenceRecord[] = [record];
        for (let next = index + 1; next < children.length; next++) {
          const adjacent = children[next].startsWith('record-') ? candidateById.get(children[next].slice(7)) : undefined;
          if (!adjacent || summarySourceKey(adjacent) !== group.key) break;
          run.push(adjacent);
        }
        return <Box key={key}>{before}{renderOptionalSourceNode(group, run, parentKey, depth, children[index + run.length] ?? null)}</Box>;
      }
      if (key.startsWith('base-item-')) {
        const item = items.find((entry) => `base-item-${entry.id}` === key);
        if (!item) return null;
        const records = recordsByTarget.get(key) ?? [];
        const itemName = item.displayName || item.formName || '未命名表单';
        return <Box key={key}>{before}<Box {...insertionDropHandlers(parentKey, key, children[index + 1] ?? null)} sx={treeRowSx(records.some((record) => record.id === selectedRecordId), depth)}>
          <Box />
          <Button fullWidth aria-label={`目录表单 ${item.displayName || item.formName}`} startIcon={<ArticleOutlined sx={{ fontSize: 16, color: '#6c7a89' }} />} onClick={() => selectFormRow(records, itemName, key, parentKey)} sx={treeButtonSx(records.some((record) => record.id === selectedRecordId))}>
            <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>{placementNameByRecordId.get(records[0]?.id) ?? itemName}</Typography>
          </Button>
          {formRowActions(records, itemName, key, parentKey)}
        </Box></Box>;
      }
      const baseDirectory = childDirectories.find((directory) => `base-dir-${directory.id}` === key);
      const overlayDirectory = overlayDirectories.find((directory) => directory.key === key);
      const name = baseDirectory?.name ?? overlayDirectory?.name;
      if (!name) return null;
      const expanded = !collapsedNodeKeys.includes(key);
      const hasChildren = Boolean(baseDirectory?.items.length || (baseChildren.get(String(baseDirectory?.id)) ?? []).length || (overlayChildren.get(key) ?? []).length || placements.some((placement) => placement.targetNodeKey === key));
      return <Box key={key}>{before}<Box {...directoryDropHandlers(key, parentKey, children[index + 1] ?? null)} sx={{ ...treeRowSx(selectedNode === key && !selectedRecordId, depth), outline: dragOverNode === `into:${key}` ? '2px dashed #1890ff' : 'none', bgcolor: dragOverNode === `into:${key}` ? '#f0f8ff' : selectedNode === key && !selectedRecordId ? '#e8f4ff' : 'transparent' }}>
        <Box>{hasChildren && <IconButton size="small" aria-label={`${expanded ? '收起' : '展开'}目录 ${name}`} onClick={() => toggleDirectory(key)} sx={{ width: 24, height: 24 }}>{expanded ? <ExpandMoreRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}</IconButton>}</Box>
        <Button fullWidth startIcon={expanded && hasChildren ? <FolderOpenOutlined sx={{ fontSize: 17, color: '#d9a441' }} /> : <FolderOutlined sx={{ fontSize: 17, color: '#d9a441' }} />} onClick={() => selectDirectory(key)} sx={treeButtonSx(selectedNode === key && !selectedRecordId)}><Typography variant="body2" noWrap>{name}</Typography></Button>
        {editable && <Stack direction="row" justifyContent="flex-end" spacing={0}>
          <Tooltip title="新增子目录"><IconButton className="summary-tree-action" size="small" disabled={isWriting} aria-label={`新增子目录 ${name}`} onClick={() => openDirectoryCreator(key)} sx={treeActionSx}><PostAddRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          {overlayDirectory && <Tooltip title="删除汇总目录"><IconButton className="summary-tree-action" size="small" disabled={isWriting} aria-label={`删除目录 ${name}`} onClick={() => setPendingRemoval(key)} sx={{ ...treeActionSx, color: 'error.main' }}><DeleteOutlineRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
        </Stack>}
      </Box><Collapse in={expanded} timeout={160} unmountOnExit>{renderDirectoryChildren(key, depth + 1)}</Collapse></Box>;
    })}{insertionSlot(parentKey)}</>;
  };
  const renderBaseNodes = (): ReactNode => [...(baseChildren.get(null) ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((directory) => {
    const key = `base-dir-${directory.id}`;
    const expanded = !collapsedNodeKeys.includes(key);
    return <Box key={key}><Box {...directoryDropHandlers(key)} sx={{ ...treeRowSx(selectedNode === key && !selectedRecordId, 0), outline: dragOverNode === `into:${key}` ? '2px dashed #1890ff' : 'none' }}>
      <IconButton size="small" aria-label={`${expanded ? '收起' : '展开'}目录 ${directory.name}`} onClick={() => toggleDirectory(key)} sx={{ width: 24, height: 24 }}>{expanded ? <ExpandMoreRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}</IconButton>
      <Button fullWidth startIcon={expanded ? <FolderOpenOutlined sx={{ fontSize: 17, color: '#d9a441' }} /> : <FolderOutlined sx={{ fontSize: 17, color: '#d9a441' }} />} onClick={() => selectDirectory(key)} sx={treeButtonSx(selectedNode === key && !selectedRecordId)}><Typography variant="body2" noWrap>{directory.name}</Typography></Button>
      {editable && <Stack direction="row" justifyContent="flex-end"><Tooltip title="新增子目录"><IconButton className="summary-tree-action" size="small" disabled={isWriting} aria-label={`新增子目录 ${directory.name}`} onClick={() => openDirectoryCreator(key)} sx={treeActionSx}><PostAddRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip></Stack>}
    </Box><Collapse in={expanded} timeout={160} unmountOnExit>{renderDirectoryChildren(key, 1)}</Collapse></Box>;
  });
  const renderSourceNode = (key: 'source-work' | 'source-custom' | 'source-directory', label: string): ReactNode => {
    const records = recordsByTarget.get(key) ?? [];
    if (!records.length) return null;
    const selected = selectedNode === key && !selectedRecordId;
    const groups = key === 'source-directory' ? [] : groupSummarySources(records);
    return <Box key={key}>
      <Box {...directoryDropHandlers(key)} sx={treeRowSx(selected, 0)}>
        <Box><FolderOutlined sx={{ fontSize: 18, color: '#d9a441' }} /></Box>
        <Button fullWidth onClick={() => selectDirectory(key)} sx={treeButtonSx(selected)}>{label}（{records.length}）</Button>
        <Box />
      </Box>
      {groups.map((group) => renderOptionalSourceNode(group, group.records, key, 1))}
      {key === 'source-directory' && records.map((record) => renderRecordNode(record, key))}
    </Box>;
  };
  const isLoading = query.isLoading || (!readOnly && initializedKey !== workspaceKey && query.isFetching)
    || (readOnly && (versionQuery.isLoading || (!selectedVersionId && query.isFetching)));
  const isError = query.isError || (readOnly && versionQuery.isError);
  const remoteDraftChanged = !readOnly && initializedKey === workspaceKey && !isWriting && !query.isFetching
    && (query.data?.draft?.revision !== revision || query.data?.draft?.id !== draftId);
  const panelDirectory = instancePanel?.directoryKey.startsWith('base-dir-') ? baseDirectoryById.get(instancePanel.directoryKey.slice(9)) : undefined;
  const panelChildKeys = instancePanel ? orderedSummaryChildren(instancePanel.directoryKey, [
    ...(baseChildren.get(panelDirectory ? String(panelDirectory.id) : '') ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((node) => `base-dir-${node.id}`),
    ...(panelDirectory?.items ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((item) => `base-item-${item.id}`),
    ...(overlayChildren.get(instancePanel.directoryKey) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder).map((node) => node.key),
  ], effectivePlacements) : [];
  const panelRecords = instancePanel ? (instancePanel.key.startsWith('base-item-')
    ? recordsByTarget.get(instancePanel.key) ?? []
    : panelChildKeys.filter((key) => key.startsWith('record-') && instancePanel.recordIds.includes(key.slice(7)))
      .map((key) => candidateById.get(key.slice(7))).filter((record): record is DhrEvidenceRecord => Boolean(record))) : [];

  return <Dialog open fullScreen onClose={() => { if (!writeInFlight.current) onClose(); }} PaperProps={{ sx: { bgcolor: '#f3f5f8' } }}>
    <DialogTitle sx={{ px: 2.5, py: 1.25, bgcolor: '#fff', borderBottom: '1px solid #e4e7ed' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box minWidth={0}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h6">{readOnly ? `DHR 汇总详情 V${activeVersion?.versionNo ?? ''}` : 'DHR 汇总'}</Typography>
            <Chip size="small" label={dhr.dhrNo} />
            {readOnly && <StatusBadge label={summaryLabels[summaryStatus]} color={summaryStatus === 'FORMALIZED' ? 'success' : 'warning'} />}
          </Stack>
          <Typography variant="caption" color="text.secondary">{dhr.objectNo} · {dhr.productCode || '未填写产品编码'} / {dhr.productName || '未填写产品名称'}</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {summaryStatus === 'FORMALIZED' && canReorganize && <Button disabled={isWriting || !query.data?.versions.length} onClick={() => setReorganizing(true)}>重新整理</Button>}
          {readOnly && <TextField select size="small" label="冻结版本" value={selectedVersionId} onChange={(event) => { setSelectedVersionId(event.target.value); setSelectedAttachmentIds([]); }} sx={{ minWidth: 164, ...fieldSx }}>
            {(query.data?.versions ?? []).map((version) => <MenuItem key={version.id} value={version.id}>V{version.versionNo} · {version.reviewOutcome === 'APPROVED' ? '已通过' : version.reviewOutcome === 'RETURNED' ? '已退回' : summaryLabels[version.status]}</MenuItem>)}
          </TextField>}
          <Button startIcon={<AttachFileRounded />} onClick={() => setAttachmentDialogOpen(true)} disabled={!workspace}>附件 {workspace?.attachments.length ?? 0}</Button>
          <Tooltip title="查看 DHR 层数据审计"><IconButton aria-label="DHR 数据审计" onClick={() => { setAuditPage(0); setAuditDialogOpen(true); }}><HistoryRounded /></IconButton></Tooltip>
          {readOnly && canExport && !legacyVersion && <Button startIcon={<DownloadRounded />} disabled={!selectedVersionId || exportBusy} onClick={() => void exportArchive('FULL')}>导出完整 ZIP</Button>}
          {readOnly && canExport && !legacyVersion && <Button disabled={!selectedVersionId || !selectedRecords.length || exportBusy} onClick={() => void exportArchive('SELECTED')}>导出当前目录</Button>}
          {editable && <Button variant="outlined" onClick={() => saveMutation.mutate()} disabled={!workspace || isLoading || isWriting || attachmentBusy || remoteDraftChanged}>保存草稿</Button>}
          {!readOnly && canSubmit && <Button variant="contained" onClick={() => setCheckDialogOpen(true)} disabled={!workspace || isLoading || isWriting || attachmentBusy || remoteDraftChanged || (!canEdit && revision === undefined)}>提交汇总</Button>}
          <IconButton onClick={onClose} disabled={isWriting} aria-label="关闭"><CloseRounded /></IconButton>
        </Stack>
      </Stack>
    </DialogTitle>
    <DialogContent sx={{ p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {remoteDraftChanged && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => setConfirmReload(true)}>重新载入</Button>}>草稿已在其他操作中更新。本地编辑已保留，请核对后重新载入最新草稿。</Alert>}
      {readOnly && Boolean(versionQuery.data?.evidenceChanges?.length) && <Alert severity="warning">本版本有 {versionQuery.data?.evidenceChanges?.length} 项冻结证据与当前来源不一致。原冻结内容与审批历史保持不变。{summaryStatus === 'PENDING_REVIEW' ? '请由审批人核对后退回整理。' : '需要纳入变化时，请通过“重新整理”形成新版本。'}{versionQuery.data?.evidenceChanges?.map(change => <Typography variant="caption" component="div" key={change.recordId ?? `attachment-${change.attachmentId}`}>{change.instanceNo || (change.attachmentId ? `附件 ${change.attachmentId}` : '证据')}：{change.message}</Typography>)}</Alert>}
      {isLoading ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : isError || !workspace ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><Stack spacing={1.5} alignItems="center"><Typography color="text.secondary">DHR 汇总工作区加载失败</Typography><Button startIcon={<RefreshRounded />} onClick={() => { query.refetch(); if (readOnly && selectedVersionId) versionQuery.refetch(); }}>重新加载</Button></Stack></Box> : <>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, flex: '0 0 auto' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, minHeight: 34 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">汇总概览</Typography>
            <Button size="small" aria-label={overviewExpanded ? '收起汇总概览' : '展开汇总概览'} onClick={() => setOverviewExpanded((value) => !value)} endIcon={overviewExpanded ? <ExpandMoreRounded sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMoreRounded />} sx={{ minHeight: 30, textTransform: 'none' }}>{overviewExpanded ? '收起' : '展开'}</Button>
          </Stack>
          <Collapse in={overviewExpanded} timeout={180}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1, px: 1.5, pb: 1.25 }}>
              {[
                { label: '表单实例', value: actualRecordCount, note: '生产对象关联的实际记录', color: '#1677c8' },
                { label: '已完成', value: actualRecordCount - incompleteCount, note: '不代表检验结论合格', color: '#20a365' },
                { label: '待核查状态', value: incompleteCount, note: '未完成记录仍保留在证据中', color: '#c57b14' },
                { label: '附件证据', value: workspace.attachments.length, note: `${workspace.attachments.filter((attachment) => attachment.verificationStatus !== 'VERIFIED').length} 份待核验`, color: '#596577' },
              ].map((stat) => <Box key={stat.label} sx={{ border: '1px solid #e6eaf0', borderRadius: 1, px: 1.5, py: 0.75, minWidth: 0, borderLeft: `3px solid ${stat.color}` }}><Stack direction="row" alignItems="baseline" spacing={0.75}><Typography variant="h6" sx={{ color: stat.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.25 }}>{stat.value}</Typography><Typography variant="body2" fontWeight={600} noWrap>{stat.label}</Typography></Stack><Typography variant="caption" color="text.secondary" noWrap display="block">{stat.note}</Typography></Box>)}
            </Box>
          </Collapse>
        </Box>
        <Box sx={{ minHeight: 0, flex: 1, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: `220px ${instancePanel ? '240px' : '0px'} minmax(0, 1fr) 0px 64px`, lg: `280px ${instancePanel ? '240px' : '0px'} minmax(0, 1fr) ${candidateDrawerOpen ? '360px' : '0px'} 72px` }, gridTemplateRows: { xs: 'minmax(180px, 32%) minmax(0, 1fr)', md: 'minmax(0, 1fr)' }, rowGap: { xs: 1, md: 0 }, position: 'relative', transition: 'grid-template-columns 240ms cubic-bezier(0.2, 0, 0, 1)', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
          <Box data-summary-directory sx={{ minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1, minHeight: 62, borderBottom: '1px solid #e4e7ed' }}>
              <Typography fontWeight={600}>汇总目录</Typography>
              {editable && <Tooltip title="新增根目录"><span><IconButton size="small" aria-label="新增根目录" disabled={isWriting} onClick={() => openDirectoryCreator('__root__')}><AddRounded fontSize="small" /></IconButton></span></Tooltip>}
            </Stack>
            <Box sx={{ flex: 1, overflow: 'auto', py: 0.75 }}>{renderBaseNodes()}{renderDirectoryChildren('', 0)}{renderSourceNode('source-directory', '未匹配目录表单')}{renderSourceNode('source-work', '作业表单')}{renderSourceNode('source-custom', '自定义表单')}{!baseDirectories.length && !actualRecordCount && !overlay.length && <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 4, textAlign: 'center' }}>尚无可展示的来源记录。</Typography>}</Box>
          </Box>
          <Box data-summary-instances sx={{ gridColumn: { md: 2 }, display: instancePanel ? 'flex' : 'none', flexDirection: 'column', ml: { md: 1 }, minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', position: { xs: 'absolute', md: 'relative' }, top: { xs: 0, md: 'auto' }, bottom: { xs: 0, md: 'auto' }, left: { xs: 0, md: 'auto' }, width: { xs: 'min(280px, calc(100% - 64px))', md: 'auto' }, zIndex: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, minHeight: 62, borderBottom: '1px solid #e4e7ed' }}><Box minWidth={0}><Typography fontWeight={600}>表单实例（{panelRecords.length}）</Typography><Typography variant="caption" color="text.secondary" noWrap display="block">{placementNameByRecordId.get(panelRecords[0]?.id) ?? instancePanel?.label}</Typography></Box><IconButton size="small" aria-label="收起实例列表" onClick={() => setInstancePanel(null)}><CloseRounded fontSize="small" /></IconButton></Stack>
            <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>{instancePanel && panelRecords.map((record) => {
              const nextKey = panelChildKeys[panelChildKeys.indexOf(`record-${record.id}`) + 1];
              return <Box key={record.id}>{record.originKind !== 'DIRECTORY' && insertionSlot(instancePanel.directoryKey, `record-${record.id}`, 'instance:')}{renderRecordNode(record, instancePanel.directoryKey, nextKey ?? null)}{record === panelRecords[panelRecords.length - 1] && record.originKind !== 'DIRECTORY' && insertionSlot(instancePanel.directoryKey, nextKey, 'instance:')}</Box>;
            })}{!panelRecords.length && <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>暂无表单实例</Typography>}</Box>
          </Box>
          <Box data-summary-preview sx={{ gridColumn: { md: 3 }, ml: { xs: 0, md: 1.5 }, minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ px: 2, py: 1, minHeight: 62, borderBottom: '1px solid #e4e7ed', flex: '0 0 auto' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                {selectedRecord ? <Box minWidth={0} flex="1 1 260px">
                  <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
                    <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }} title={placementNameByRecordId.get(selectedRecord.id) ?? getRecordTitle(selectedRecord)}>{placementNameByRecordId.get(selectedRecord.id) ?? getRecordTitle(selectedRecord)}</Typography>
                    <Box sx={{ flexShrink: 0, display: 'flex' }}><StatusBadge label={evidenceStatus(selectedRecord).label} color={evidenceStatus(selectedRecord).color} /></Box>
                    <Tooltip title="全屏查看表单"><IconButton size="small" aria-label="全屏查看表单" onClick={() => setPreview(selectedRecord)} sx={{ flexShrink: 0, color: '#606266', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}><PreviewOutlined fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">{selectedRecord.instanceNo} · 副本 {selectedRecord.copyId} · {originLabels[selectedRecord.originKind]} · {placementLabel(selectedRecord.id)}</Typography>
                </Box> : <Box minWidth={0} flex="1 1 260px"><Typography fontWeight={600}>目录内容</Typography><Typography variant="caption" color="text.secondary">{selectedNodeLabel}</Typography></Box>}
              </Stack>
            </Box>
            <EvidenceCanvas record={selectedRecord} emptyMessage="当前目录尚无实际表单实例。" />
          </Box>
          <Box sx={{ gridColumn: { lg: 4 }, ml: { xs: 0, lg: candidateDrawerOpen ? 1.5 : 0 }, minHeight: 0, minWidth: 0, bgcolor: '#fff', border: candidateDrawerOpen ? '1px solid #e4e7ed' : 0, borderRadius: 1, overflow: 'hidden', position: { xs: 'absolute', lg: 'relative' }, right: { xs: 64, lg: 'auto' }, top: { xs: 0, lg: 'auto' }, bottom: { xs: 0, lg: 'auto' }, width: { xs: candidateDrawerOpen ? 'min(360px, calc(100% - 64px))' : 0, lg: 'auto' }, zIndex: 2, transition: 'margin-left 240ms ease, width 240ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
          <Box aria-hidden={!candidateDrawerOpen} sx={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', opacity: candidateDrawerOpen ? 1 : 0, visibility: candidateDrawerOpen ? 'visible' : 'hidden', pointerEvents: candidateDrawerOpen ? 'auto' : 'none', transition: 'opacity 180ms ease, visibility 180ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #e4e7ed' }}><Box minWidth={0}><Typography fontWeight={700}>{originLabels[candidateOrigin]}</Typography><Typography variant="caption" color="text.secondary">{readOnly ? '本版本的来源记录' : '全部实际实例已自动关联；可按需要调整展示位置'}</Typography></Box><IconButton size="small" aria-label="收起来源表单" onClick={() => setCandidateDrawerOpen(false)}><CloseRounded fontSize="small" /></IconButton></Stack>
            <Stack spacing={1} sx={{ p: 1.25, overflow: 'auto' }}>{candidateGroups[candidateOrigin].map((group) => {
              const first = group.records[0];
              const defaultTarget = group.originKind === 'WORK' ? 'source-work' : 'source-custom';
              const targets = group.records.map((record) => placementByRecordId.get(record.id) ?? '');
              const adjustedCount = group.records.filter((record) => adjustedRecordIds.has(record.id)).length;
              const currentTarget = targets.every((target) => target === targets[0]) ? (targets[0] === defaultTarget ? '' : targets[0]) : '__PARTIAL__';
              const completedCount = group.records.filter((record) => record.status === 'COMPLETED').length;
              const expanded = expandedSourceKeys.includes(group.key);
              return <Box key={group.key} data-source-key={group.key}
                sx={{ p: 1.25, border: '1px solid #ebeef5', borderRadius: 1, bgcolor: adjustedCount ? '#f6ffed' : '#fff' }}>
                <Stack data-source-drag direction="row" justifyContent="space-between" gap={1} alignItems="flex-start"
                  draggable={editable && !isWriting} onDragStart={(event) => startSourceDrag(event, group.key)} onDragEnd={endRecordDrag}
                  sx={{ cursor: editable ? 'grab' : 'default', '&:active': { cursor: editable ? 'grabbing' : 'default' } }}>
                  <Stack direction="row" alignItems="flex-start" minWidth={0} gap={0.5}>{editable && <DragIndicatorRounded fontSize="small" sx={{ mt: 0.25, color: '#909399' }} />}<Box minWidth={0}><Typography fontWeight={600} noWrap title={getRecordTitle(first)}>{getRecordTitle(first)}</Typography><Typography variant="caption" color="text.secondary" display="block" noWrap title={`${first.operationName || '生产执行'} · ${first.formId}`}>{group.originKind === 'WORK' ? `作业节点 ${first.snapshot.workNodeId || first.formId}` : `自定义创建项 ${first.formId}`} · {group.records.length} 份实例</Typography></Box></Stack>

                </Stack>
                <Stack direction="row" justifyContent="space-between" gap={1} sx={{ mt: 0.75 }}>
                  <Typography variant="caption" color="text.secondary">已完成 {completedCount}/{group.records.length}</Typography>
                  <Typography variant="caption" color={adjustedCount ? 'primary.main' : 'text.secondary'}>{adjustedCount ? `已调整展示位置 ${adjustedCount}/${group.records.length}` : '默认来源位置'}</Typography>
                </Stack>
                {completedCount < group.records.length && <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>存在未完成实例；证据保留，提交是否阻断由核查规则决定。</Typography>}
                {editable ? <TextField select size="small" fullWidth label={group.records.length > 1 ? '整组展示位置' : '展示位置'} value={currentTarget} disabled={isWriting} onChange={(event) => assignSource(group, event.target.value)} sx={{ mt: 1, ...fieldSx }}><MenuItem value="">默认来源位置</MenuItem>{currentTarget === '__PARTIAL__' && <MenuItem value="__PARTIAL__" disabled>实例展示位置不同</MenuItem>}{targetOptions.filter((target) => !target.key.startsWith('source-')).map((target) => <MenuItem key={target.key} value={target.key}>{target.label}</MenuItem>)}</TextField> : <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>{currentTarget === '__PARTIAL__' ? '展开查看各实例展示位置' : currentTarget ? `展示于：${placementLabel(first.id)}` : legacyVersion ? '未纳入此历史汇总版本' : '默认来源位置'}</Typography>}
                <Button size="small" aria-label={`${expanded ? '收起' : '展开'}实例 ${getRecordTitle(first)}`} aria-expanded={expanded} startIcon={<ViewListOutlined />} endIcon={expanded ? <ExpandMoreRounded /> : <ChevronRightRounded />} onClick={() => setExpandedSourceKeys((current) => expanded ? current.filter((key) => key !== group.key) : [...current, group.key])} sx={{ mt: 1 }}>查看实例（{group.records.length}）</Button>
                <Collapse in={expanded} timeout={160} unmountOnExit><Box sx={{ mt: 1, borderTop: '1px solid #ebeef5' }}>{group.records.map((record) => {
                  const target = placementByRecordId.get(record.id) ?? '';
                  const displayTarget = target === defaultTarget ? '' : target;
                  return <Box key={record.id} data-source-instance={record.id} sx={{ py: 1, '& + &': { borderTop: '1px solid #ebeef5' } }}>
                    <Stack data-instance-drag direction="row" alignItems="center" justifyContent="space-between" gap={0.5}
                      draggable={editable && !isWriting} onDragStart={(event) => startSourceDrag(event, group.key, [record])} onDragEnd={endRecordDrag}
                      sx={{ cursor: editable ? 'grab' : 'default' }}>
                      {editable && <DragIndicatorRounded sx={{ fontSize: 16, color: '#909399' }} />}
                      <Box minWidth={0} flex={1}><Typography variant="caption" noWrap display="block" title={record.instanceNo}>{record.instanceNo}</Typography><Typography variant="caption" color="text.secondary" noWrap display="block">{evidenceStatus(record).label} · {record.copyId}</Typography></Box>
                      <Tooltip title="查看实例"><IconButton size="small" aria-label={`预览实例 ${record.instanceNo}`} onClick={() => setPreview(record)}><PreviewOutlined fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                    {editable ? <TextField select size="small" fullWidth label="本份展示位置" value={displayTarget} disabled={isWriting} SelectProps={{ inputProps: { 'aria-label': `实例展示位置 ${record.instanceNo}` } }}
                      onChange={(event) => assignSource({ ...group, records: [record] }, event.target.value)} sx={{ mt: 0.75, ...fieldSx }}>
                      <MenuItem value="">默认来源位置</MenuItem>{targetOptions.filter((option) => !option.key.startsWith('source-')).map((option) => <MenuItem key={option.key} value={option.key}>{option.label}</MenuItem>)}
                    </TextField> : <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{target ? `展示于：${placementLabel(record.id)}` : legacyVersion ? '未纳入此历史汇总版本' : '默认来源位置'}</Typography>}
                  </Box>;
                })}</Box></Collapse>
              </Box>;
            })}{!candidateGroups[candidateOrigin].length && <Box sx={{ py: 8, textAlign: 'center', color: '#909399' }}><Typography>暂无{originLabels[candidateOrigin]}</Typography></Box>}</Stack>
          </Box>
          </Box>
          <Stack data-summary-source-rail spacing={0.5} alignItems="center" sx={{ gridColumn: { md: 5 }, ml: { xs: 0, md: 1 }, p: 0.5, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, width: { xs: 60, md: 'auto' }, position: { xs: 'absolute', md: 'relative' }, right: { xs: 0, md: 'auto' }, top: { xs: '36%', md: 'auto' }, zIndex: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ py: 0.5, writingMode: { xs: 'vertical-rl', md: 'horizontal-tb' } }}>来源</Typography>
            {(['WORK', 'CUSTOM'] as const).map((origin) => {
              const active = candidateDrawerOpen && candidateOrigin === origin;
              return <Tooltip key={origin} title={`打开${originLabels[origin]}来源`} placement="left"><Button aria-label={origin === 'WORK' ? '打开作业表单来源' : '打开自定义表单来源'} aria-pressed={active} onClick={() => { setCandidateOrigin(origin); setCandidateDrawerOpen(!active); }} sx={{ minWidth: 0, width: '100%', py: 0.9, px: 0.25, display: 'flex', flexDirection: 'column', gap: 0.15, borderRadius: 1, textTransform: 'none', color: active ? '#1677c8' : '#606b78', bgcolor: active ? '#e8f4ff' : 'transparent', '&:hover': { bgcolor: '#e8f4ff' } }}>
                {origin === 'WORK' ? <FactCheckOutlined sx={{ fontSize: 21 }} /> : <ArticleOutlined sx={{ fontSize: 21 }} />}
                <Typography variant="caption" fontWeight={active ? 700 : 500} lineHeight={1.2}>{origin === 'WORK' ? '作业' : '自定义'}</Typography>
                <Typography variant="caption" lineHeight={1.2} sx={{ fontVariantNumeric: 'tabular-nums' }}>{candidateGroups[origin].length}</Typography>
              </Button></Tooltip>;
            })}
          </Stack>
        </Box>
      </>}
    </DialogContent>
    <AppDialog open={checkDialogOpen} onClose={() => setCheckDialogOpen(false)} variant="form" fullWidth maxWidth="sm">
      <DialogTitle>提交前核查</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 1.5 }}>系统已自动归集关联记录并检查必需项、补录与附件核验；表单字段中的质量结论和异常处置不能仅凭“已完成”自动判定。本确认将连同操作者、时间和说明写入冻结版本。</Alert>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="flex-start"><Checkbox checked={qualityReviewed} onChange={(event) => setQualityReviewed(event.target.checked)} inputProps={{ 'aria-label': '确认质量结论与异常处置已核查' }} /><Typography variant="body2" sx={{ pt: 1 }}>我已核对适用的质量结论、异常及处置依据；存在未解决事项时不提交。</Typography></Stack>
          <Stack direction="row" alignItems="flex-start"><Checkbox checked={signaturesReviewed} onChange={(event) => setSignaturesReviewed(event.target.checked)} inputProps={{ 'aria-label': '确认源表单签署已核查' }} /><Typography variant="body2" sx={{ pt: 1 }}>我已核对适用的源表单审批与签署记录。</Typography></Stack>
          <Stack direction="row" alignItems="flex-start"><Checkbox checked={scopeReviewed} onChange={(event) => setScopeReviewed(event.target.checked)} inputProps={{ 'aria-label': '确认完整证据范围已核查' }} /><Typography variant="body2" sx={{ pt: 1 }}>我已核对本次完整证据范围，理解汇总定稿不等于产品放行。</Typography></Stack>
          <TextField multiline minRows={2} fullWidth required label="核查说明" value={checkNote} onChange={(event) => setCheckNote(event.target.value)} inputProps={{ maxLength: 500 }} helperText="记录结论依据或异常处置引用，不超过 500 字" />
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={() => setCheckDialogOpen(false)}>取消</Button><Button variant="contained" disabled={!qualityReviewed || !signaturesReviewed || !scopeReviewed || !checkNote.trim() || isWriting} onClick={() => submitMutation.mutate()}>确认并提交</Button></DialogActions>
    </AppDialog>
    <AppDialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} variant="form" fullWidth maxWidth="md">
      <DialogTitle>DHR 数据审计 · {dhr.dhrNo}</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 320 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>目录整理、附件关联、汇总提交、审批及导出事件；生产表单的填报与签署记录需到来源实例查看。</Typography>
        {auditQuery.isLoading ? <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress size={24} /></Box>
          : auditQuery.isError ? <Alert severity="error">审计记录加载失败，请重试。</Alert>
            : !auditQuery.data?.events.length ? <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无 DHR 层审计记录</Typography>
              : <Stack spacing={1}>{auditQuery.data.events.map((event) => <Box key={event.id} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}><Typography variant="body2" fontWeight={600}>{event.functionName || event.action}</Typography><Typography variant="caption" color="text.secondary">{event.at.replace('T', ' ')}</Typography></Stack>
                <Typography variant="caption" color="text.secondary">{event.operator || '系统'} · {event.entityType}{event.reason ? ` · 原因：${event.reason}` : ''}</Typography>
                {(event.before || event.after) && <Box component="details" sx={{ mt: 1 }}><Box component="summary" sx={{ cursor: 'pointer', fontSize: 12, color: 'primary.main' }}>查看前后证据</Box>
                  <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12, maxHeight: 240, overflow: 'auto', bgcolor: '#f7f9fc', p: 1 }}>{event.before ? `变更前：${event.before}\n` : ''}{event.after ? `变更后：${event.after}` : ''}</Box>
                </Box>}
              </Box>)}</Stack>}
      </DialogContent>
      <DialogActions><Typography variant="caption" sx={{ mr: 'auto', pl: 1 }} color="text.secondary">共 {auditQuery.data?.total ?? 0} 条</Typography><Button disabled={auditPage === 0 || auditQuery.isFetching} onClick={() => setAuditPage((value) => value - 1)}>上一页</Button><Button disabled={auditQuery.isFetching || (auditPage + 1) * 50 >= (auditQuery.data?.total ?? 0)} onClick={() => setAuditPage((value) => value + 1)}>下一页</Button><Button onClick={() => setAuditDialogOpen(false)}>关闭</Button></DialogActions>
    </AppDialog>
    <AppDialog open={attachmentDialogOpen} onClose={() => setAttachmentDialogOpen(false)} variant="form" fullWidth maxWidth="sm">
      <DialogTitle>附件证据</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>附件与生产对象自动关联。上传后需核对原件内容；解除当前关联不会删除历史文件。</Typography>
        <Stack spacing={1.25}>
          {(workspace?.attachments ?? []).map((attachment) => <Box key={attachment.id} sx={{ p: 1.25, border: '1px solid #e4e7ed', borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              {readOnly && canExport && !legacyVersion && <Checkbox size="small" checked={selectedAttachmentIds.includes(attachment.id)} onChange={(event) => setSelectedAttachmentIds((ids) => event.target.checked ? [...ids, attachment.id] : ids.filter((id) => id !== attachment.id))} inputProps={{ 'aria-label': `选择导出附件 ${attachment.name}` }} />}
              <Box minWidth={0}><Typography fontWeight={600} noWrap title={attachment.name}>{attachment.name}</Typography><Typography variant="caption" color="text.secondary">{attachment.sourceKind} · {attachment.purpose} · {Math.ceil(attachment.size / 1024)} KB</Typography></Box>
              <StatusBadge label={attachment.verificationStatus === 'VERIFIED' ? '已核验' : '待核验'} color={attachment.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} />
            </Stack>
            {attachment.sourceKind === 'PAPER_SCAN' && <Typography variant="caption" color="text.secondary" display="block">原记录形成：{attachment.originalRecordedAt || '—'} · 原件保管：{attachment.custodyLocation || '—'}</Typography>}
            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
              <Button size="small" startIcon={<DownloadRounded />} onClick={() => void getAttachment(attachment)}>下载原件</Button>
              {editable && attachment.verificationStatus !== 'VERIFIED' && <Button size="small" disabled={attachmentBusy} onClick={() => void verifyAttachment(attachment.id)}>确认核验</Button>}
              {editable && <Button size="small" color="error" disabled={attachmentBusy} onClick={() => setUnlinkingAttachmentId(attachment.id)}>解除关联</Button>}
            </Stack>
          </Box>)}
          {!workspace?.attachments.length && <Typography variant="body2" color="text.secondary">暂无附件证据</Typography>}
        </Stack>
        {editable && <Stack spacing={1.25} sx={{ mt: 2, pt: 2, borderTop: '1px solid #e4e7ed' }}>
          <Typography fontWeight={600}>关联新附件</Typography>
          <Stack direction="row" spacing={1} alignItems="center"><Button component="label" variant="outlined" size="small">选择 PDF / PNG / JPEG<input hidden type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)} /></Button><Typography variant="body2" noWrap>{attachmentFile?.name || '尚未选择文件（不超过 25 MB）'}</Typography></Stack>
          <TextField select size="small" label="来源类型" value={attachmentKind} onChange={(event) => setAttachmentKind(event.target.value as DhrAttachment['sourceKind'])}><MenuItem value="EXTERNAL_REPORT">委外报告</MenuItem><MenuItem value="CERTIFICATE">外部证书</MenuItem><MenuItem value="PAPER_SCAN">纸质原件扫描</MenuItem><MenuItem value="OTHER">其他</MenuItem></TextField>
          <TextField size="small" label="来源与用途" value={attachmentPurpose} onChange={(event) => setAttachmentPurpose(event.target.value)} inputProps={{ maxLength: 500 }} required />
          {attachmentKind === 'PAPER_SCAN' && <><TextField size="small" type="datetime-local" label="原记录形成时间" InputLabelProps={{ shrink: true }} value={originalRecordedAt} onChange={(event) => setOriginalRecordedAt(event.target.value)} required /><TextField size="small" label="纸质原件保管位置" value={custodyLocation} onChange={(event) => setCustodyLocation(event.target.value)} required /></>}
          <Box><Button variant="contained" disabled={!attachmentFile || !attachmentPurpose.trim() || attachmentBusy || (attachmentKind === 'PAPER_SCAN' && (!originalRecordedAt || !custodyLocation.trim()))} onClick={() => void uploadAttachment()}>上传并关联</Button></Box>
        </Stack>}
      </DialogContent>
      <DialogActions>{readOnly && canExport && !legacyVersion && <Button disabled={!selectedAttachmentIds.length || exportBusy} onClick={() => void exportArchive('SELECTED', [], selectedAttachmentIds)}>导出已选附件 ZIP</Button>}<Button onClick={() => setAttachmentDialogOpen(false)}>关闭</Button></DialogActions>
    </AppDialog>
    <AppDialog open={Boolean(unlinkingAttachmentId)} onClose={() => setUnlinkingAttachmentId('')} variant="form" fullWidth maxWidth="xs">
      <DialogTitle>解除附件关联</DialogTitle>
      <DialogContent dividers><TextField autoFocus fullWidth multiline minRows={2} label="解除原因" value={unlinkReason} onChange={(event) => setUnlinkReason(event.target.value)} inputProps={{ maxLength: 500 }} /></DialogContent>
      <DialogActions><Button onClick={() => setUnlinkingAttachmentId('')}>取消</Button><Button color="error" disabled={!unlinkReason.trim() || attachmentBusy} onClick={() => void unlinkAttachment()}>确认解除</Button></DialogActions>
    </AppDialog>
    <AppDialog open={Boolean(directoryParentKey)} onClose={() => setDirectoryParentKey('')} variant="form" fullWidth maxWidth="xs">
      <DialogTitle>新增汇总目录</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>上级目录：{directoryParentKey === '__root__' ? 'DHR 根目录' : targetLabelByKey.get(directoryParentKey) ?? '生产记录'}</Typography>
        <TextField autoFocus inputRef={directoryNameInputRef} size="small" fullWidth label="目录名称" disabled={isWriting} error={directoryNameError} helperText={directoryNameError ? '请填写目录名称' : ' '} value={newDirectoryName} onChange={(event) => { setNewDirectoryName(event.target.value); if (event.target.value.trim()) setDirectoryNameError(false); }} onKeyDown={(event) => { if (event.key === 'Enter') addDirectory(); }} sx={fieldSx} />
      </DialogContent>
      <DialogActions><Button onClick={() => setDirectoryParentKey('')}>取消</Button><Button variant="contained" disabled={isWriting} onClick={addDirectory}>确定</Button></DialogActions>
    </AppDialog>
    <AppDialog open={renamingRecords.length > 0} onClose={() => setRenamingRecords([])} variant="form" fullWidth maxWidth="xs">
      <DialogTitle>重命名汇总文档</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>只修改本次汇总目录中的显示名称，不修改原始表单或实例内容。</Typography>
        <TextField autoFocus size="small" fullWidth label="文档名称" value={renamedTitle} error={nameError} helperText={nameError ? '请填写不超过 120 字的名称' : renamingRecords.length > 1 ? `将应用于当前相邻的 ${renamingRecords.length} 份实例` : ' '} disabled={isWriting} onChange={(event) => { setRenamedTitle(event.target.value); if (event.target.value.trim()) setNameError(false); }} onKeyDown={(event) => { if (event.key === 'Enter') saveRename(); }} sx={fieldSx} />
      </DialogContent>
      <DialogActions><Button onClick={() => setRenamingRecords([])}>取消</Button><Button variant="contained" disabled={isWriting} onClick={saveRename}>确定</Button></DialogActions>
    </AppDialog>
    <Dialog open={Boolean(pendingRemoval)} onClose={() => setPendingRemoval(null)}>
      <DialogTitle>删除汇总目录？</DialogTitle>
      <DialogContent><Typography color="text.secondary">该目录及其下级自定义目录会从草稿移除；其中的表单会恢复默认来源位置，仍属于 DHR 证据。冻结基础目录不会改变。</Typography></DialogContent>
      <DialogActions><Button onClick={() => setPendingRemoval(null)}>取消</Button><Button color="error" variant="contained" disabled={isWriting} onClick={removeDirectory}>删除目录</Button></DialogActions>
    </Dialog>
    <ConfirmDialog open={confirmReload} onCancel={() => setConfirmReload(false)}
      title="重新载入最新草稿？" message="当前未保存的目录和展示位置调整将被替换为服务器上的最新草稿。"
      cancelText="保留本地编辑" confirmText="确认重新载入" initialFocus="cancel" onConfirm={async () => {
        setConfirmReload(false);
        const result = await query.refetch();
        if (result.isSuccess) setInitializedKey(undefined);
      }} />
    <EvidencePreview record={preview} onClose={() => setPreview(null)} />
    <DhrActionDialog button={reorganizeButton} busy={isWriting} onCancel={() => setReorganizing(false)} onConfirm={async ({ opinion }) => {
      if (writeInFlight.current || !query.data?.versions[0]) return;
      writeInFlight.current = true; setIsWriting(true);
      try {
        const result = await reorganizeDhr(dhr.id, query.data.versions[0].id, opinion);
        client.setQueryData(['dhr-summary-workspace', dhr.id], result);
        setInitializedKey(undefined); setReorganizing(false);
        await client.invalidateQueries({ queryKey: ['dhr-instances'] });
        snackbar.showMessage('已建立新的整理草稿，原汇总和审核历史保留', 'success');
      } catch (error) { snackbar.showMessage(error instanceof Error ? error.message : '重新整理失败', 'error'); }
      finally { writeInFlight.current = false; setIsWriting(false); }
    }} />
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
