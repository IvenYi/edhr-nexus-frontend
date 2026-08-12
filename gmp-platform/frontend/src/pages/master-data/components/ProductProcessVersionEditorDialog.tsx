import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Background, MarkerType, ReactFlow, ReactFlowProvider, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, ArrowDownward, ArrowUpward, ChevronRight, Close, DeleteOutline, ExpandMore, FolderOutlined, Search, VisibilityOutlined } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  getProductModelOptions,
  type ProductModelDhrDirectoryOption,
  type ProductModelDocumentOption,
  type ProductModelOptions,
  type ProductModelRouteOption,
  type ProductModelTemplateOption,
  type ProductProcessOperation,
  type ProductProcessVersion,
  type ProductProcessVersionPayload,
} from '@/api/product-modeling';
import { getProcessRouteGraph, type RouteGraphResponse, type RouteNodeRecord } from '@/api/master-data';
import { getFilePreviewBlob } from '@/api/files';
import { getFormTemplateVersion, type TemplateModelingRecord, type TemplateVersionRecord } from '@/api/template-modeling';
import { parseReactTemplateDesignerDocument } from '../template-designer-react/utils/document';
import { FormCanvasPreview } from '../DhrTemplateWorkspaceDialog';

export type ProductProcessVersionDialogMode = 'create' | 'edit' | 'copy';

interface VersionForm {
  version: string;
  productionMode: string;
  productionForm: string;
  routeVersionId: string;
  dhrTemplateVersionId: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
}

interface OperationDraft {
  routeNodeKey: string;
  operationName: string;
  operationCode?: string | null;
  sortOrder: number;
  forms: Array<{ dhrTemplateItemId?: string | null; formTemplateVersionId: string; required: boolean; sortOrder: number }>;
  documents: Array<{ documentVersionId: string; sortOrder: number; pageStart?: number | null; pageEnd?: number | null }>;
}

export interface ProductProcessVersionEditorDialogProps {
  open: boolean;
  productId: string;
  productName: string;
  productCode: string;
  loadOptions?: (dhrTemplateVersionId?: string) => Promise<ProductModelOptions>;
  mode: ProductProcessVersionDialogMode;
  target?: ProductProcessVersion;
  versions: ProductProcessVersion[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductProcessVersionPayload) => void;
}

const PRODUCTION_MODE_OPTIONS = ['量产', '返工', '翻新'];
const PRODUCTION_FORM_OPTIONS = ['批次', 'SN', '批次转SN'];

function toInputDateTime(value?: string | null) {
  return value ? value.replace(' ', 'T').slice(0, 16) : '';
}

function nextVersionLabel(versions: ProductProcessVersion[]) {
  const labels = new Set(versions.map((item) => item.version.trim().toUpperCase()));
  let sequence = versions.length + 1;
  while (labels.has(`V${sequence}.0`)) sequence += 1;
  return `V${sequence}.0`;
}

function toOptionalPage(value: string) {
  return value === '' ? null : Number(value);
}

export function isPdfDocument(option?: Pick<ProductModelDocumentOption, 'fileName' | 'fileMimeType'> | null) {
  if (!option) return false;
  return option.fileMimeType?.toLocaleLowerCase() === 'application/pdf'
    || option.fileName?.toLocaleLowerCase().endsWith('.pdf') === true;
}

function toVersionForm(mode: ProductProcessVersionDialogMode, target: ProductProcessVersion | undefined, versions: ProductProcessVersion[]): VersionForm {
  if (target) {
    return {
      version: mode === 'copy' ? nextVersionLabel(versions) : target.version,
      productionMode: target.productionMode,
      productionForm: target.productionForm,
      routeVersionId: target.routeVersionId,
      dhrTemplateVersionId: target.dhrTemplateVersionId,
      description: target.description || '',
      effectiveFrom: mode === 'copy' ? '' : toInputDateTime(target.effectiveFrom),
      effectiveTo: mode === 'copy' ? '' : toInputDateTime(target.effectiveTo),
    };
  }
  return {
    version: versions.length === 0 ? 'V1.0' : nextVersionLabel(versions),
    productionMode: '',
    productionForm: '',
    routeVersionId: '',
    dhrTemplateVersionId: '',
    description: '',
    effectiveFrom: '',
    effectiveTo: '',
  };
}

function toOperationDrafts(nodes: RouteNodeRecord[], configured: ProductProcessOperation[] = []): OperationDraft[] {
  const configuredByNode = new Map(configured.map((item) => [item.routeNodeKey, item]));
  return nodes
    .filter((node) => !node.nodeType || node.nodeType === 'OPERATION')
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((node, index) => {
      const configuredOperation = configuredByNode.get(node.nodeKey);
      return {
        routeNodeKey: node.nodeKey,
        operationName: node.operationName || node.nodeKey,
        operationCode: node.operationCode,
        sortOrder: configuredOperation?.sortOrder ?? node.sortOrder ?? index + 1,
        forms: (configuredOperation?.forms ?? []).map((form) => ({
          dhrTemplateItemId: form.dhrTemplateItemId,
          formTemplateVersionId: form.formTemplateVersionId,
          required: form.required ?? true,
          sortOrder: form.sortOrder ?? 0,
        })),
        documents: (configuredOperation?.documents ?? []).map((document) => ({
          documentVersionId: document.documentVersionId,
          sortOrder: document.sortOrder ?? 0,
          pageStart: document.pageStart ?? null,
          pageEnd: document.pageEnd ?? null,
        })),
      };
    });
}

function toPayload(form: VersionForm, drafts: OperationDraft[]): ProductProcessVersionPayload {
  return {
    version: form.version.trim(),
    productionMode: form.productionMode.trim(),
    productionForm: form.productionForm.trim(),
    routeVersionId: form.routeVersionId,
    dhrTemplateVersionId: form.dhrTemplateVersionId,
    description: form.description.trim() || null,
    effectiveFrom: form.effectiveFrom || null,
    effectiveTo: form.effectiveTo || null,
    operationBindings: drafts.map((draft) => ({
      routeNodeKey: draft.routeNodeKey,
      sortOrder: draft.sortOrder,
      forms: draft.forms.map((formBinding, index) => ({ ...formBinding, sortOrder: index + 1 })),
      documents: draft.documents.map((documentBinding, index) => ({ ...documentBinding, sortOrder: index + 1 })),
    })),
  };
}

function optionText(option?: ProductModelRouteOption | ProductModelTemplateOption | null) {
  if (!option) return '-';
  if ('routeName' in option) return [option.versionCode, option.routeName, option.version].filter(Boolean).join(' / ');
  return [option.code, option.name, option.version].filter(Boolean).join(' / ');
}

export interface RdoVersionChoice {
  id: string;
  parentId: string;
  parentName: string;
  version?: string | null;
  versionCode?: string | null;
  status?: string | null;
  categoryName?: string | null;
}

interface RdoVersionParentGroup {
  key: string;
  id: string;
  name: string;
  versions: RdoVersionChoice[];
}

interface RdoVersionCategoryGroup {
  key: string;
  name: string;
  parents: RdoVersionParentGroup[];
}

function formatRdoVersionChoice(choice: RdoVersionChoice) {
  return [choice.parentName || '-', choice.version || '-'].join(' / ');
}

function RdoVersionTreeSelect({
  label,
  required = false,
  options,
  value,
  onChange,
  emptyText = '暂无可引用版本',
}: {
  label: string;
  required?: boolean;
  options: RdoVersionChoice[];
  value: string;
  onChange: (id: string) => void;
  emptyText?: string;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const showCategories = options.some((option) => Boolean(option.categoryName?.trim()));
  const groups = useMemo<RdoVersionCategoryGroup[]>(() => {
    const categories = new Map<string, { name: string; parents: Map<string, RdoVersionParentGroup> }>();
    options.forEach((option) => {
      const categoryName = showCategories ? option.categoryName?.trim() || '未分类' : '';
      const categoryKey = `category:${categoryName}`;
      if (!categories.has(categoryKey)) categories.set(categoryKey, { name: categoryName, parents: new Map() });
      const category = categories.get(categoryKey)!;
      const parentKey = `parent:${categoryKey}:${option.parentId}`;
      if (!category.parents.has(parentKey)) {
        category.parents.set(parentKey, { key: parentKey, id: option.parentId, name: option.parentName, versions: [] });
      }
      category.parents.get(parentKey)!.versions.push(option);
    });
    return [...categories.entries()].map(([key, category]) => ({
      key,
      name: category.name,
      parents: [...category.parents.values()],
    }));
  }, [options, showCategories]);
  const parentKeys = useMemo(() => groups.flatMap((group) => group.parents.map((parent) => parent.key)), [groups]);
  const categoryKeys = useMemo(() => groups.map((group) => group.key), [groups]);
  const selected = options.find((option) => option.id === value) ?? null;
  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  const visibleGroups = useMemo(() => groups.map((group) => ({
    ...group,
    parents: group.parents.map((parent) => ({
      ...parent,
      versions: parent.versions.filter((option) => !normalizedSearch || [group.name, option.parentName, option.version, option.versionCode].filter(Boolean).join(' ').toLocaleLowerCase().includes(normalizedSearch)),
    })).filter((parent) => parent.versions.length > 0),
  })).filter((group) => group.parents.length > 0), [groups, normalizedSearch]);

  const closePicker = () => {
    setAnchorEl(null);
    setSearchText('');
  };
  const openPicker = (element: HTMLElement) => {
    setAnchorEl(element);
    setSearchText('');
    setExpandedKeys(new Set([...categoryKeys, ...parentKeys]));
  };
  const toggleExpanded = (key: string) => setExpandedKeys((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const selectVersion = (option: RdoVersionChoice) => {
    onChange(option.id);
    closePicker();
  };

  return <>
    <TextField
      required={required}
      size="small"
      fullWidth
      label={label}
      value={selected ? formatRdoVersionChoice(selected) : ''}
      placeholder="选择版本"
      onClick={(event) => openPicker(event.currentTarget)}
      onFocus={(event) => { if (!anchorEl) openPicker(event.currentTarget); }}
      InputProps={{
        readOnly: true,
        endAdornment: <InputAdornment position="end"><ExpandMore fontSize="small" sx={{ color: '#606266' }} /></InputAdornment>,
      }}
      sx={{ '& .MuiInputBase-input': { cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis' } }}
    />
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
      style={{ zIndex: 1500 }}
    >
      <ClickAwayListener mouseEvent="onMouseDown" onClickAway={closePicker}>
        <Paper sx={{ width: 460, maxWidth: 'calc(100vw - 32px)', maxHeight: 480, overflow: 'hidden', border: '1px solid #dfe5ed', boxShadow: '0 8px 24px rgba(32, 56, 85, .16)' }}>
      <Box sx={{ p: 1, borderBottom: '1px solid #e8ecf1' }}>
        <TextField
          autoFocus
          size="small"
          fullWidth
          value={searchText}
          placeholder={showCategories ? '搜索分类、父名称、版本号或版本编码' : '搜索父名称、版本号或版本编码'}
          onChange={(event) => setSearchText(event.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ maxHeight: 408, overflow: 'auto', py: 0.5 }}>
        {visibleGroups.length === 0 ? <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: '#909399' }}>{normalizedSearch ? '未找到匹配的版本' : emptyText}</Typography> : visibleGroups.map((group) => {
          const categoryExpanded = normalizedSearch.length > 0 || expandedKeys.has(group.key);
          return <Box key={group.key}>
            {showCategories ? <Box component="button" type="button" onClick={() => toggleExpanded(group.key)} sx={{ width: '100%', minHeight: 36, px: 1.25, border: 0, bgcolor: '#f7f9fc', color: '#303133', display: 'flex', alignItems: 'center', gap: 0.75, textAlign: 'left', cursor: 'pointer', font: 'inherit', '&:hover': { bgcolor: '#eef4fb' } }}>
              {categoryExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}<FolderOutlined fontSize="small" sx={{ color: '#7b8794' }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{group.name}</Typography><Typography variant="caption" sx={{ ml: 'auto', color: '#909399' }}>{group.parents.length}</Typography>
            </Box> : null}
            {categoryExpanded ? group.parents.map((parent) => {
              const parentExpanded = normalizedSearch.length > 0 || expandedKeys.has(parent.key);
              return <Box key={parent.key}>
                <Box component="button" type="button" onClick={() => toggleExpanded(parent.key)} sx={{ width: '100%', minHeight: 38, pl: showCategories ? 3.5 : 1.25, pr: 1.25, border: 0, bgcolor: 'transparent', color: '#303133', display: 'flex', alignItems: 'center', gap: 0.75, textAlign: 'left', cursor: 'pointer', font: 'inherit', '&:hover': { bgcolor: '#f5f8fc' } }}>
                  {parentExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}<Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{parent.name}</Typography><Typography variant="caption" sx={{ ml: 'auto', color: '#909399' }}>{parent.versions.length} 个版本</Typography>
                </Box>
                {parentExpanded ? parent.versions.map((option) => {
                  return <Box component="button" type="button" key={option.id} onClick={() => selectVersion(option)} sx={{ width: '100%', minHeight: 38, pl: showCategories ? 7.25 : 5, pr: 1.25, border: 0, bgcolor: option.id === value ? '#e8f4ff' : 'transparent', color: '#303133', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left', cursor: 'pointer', font: 'inherit', '&:hover': { bgcolor: '#f0f7ff' } }}>
                    <Typography variant="body2" sx={{ fontWeight: option.id === value ? 600 : 400 }}>{option.version || '-'}</Typography>{option.versionCode ? <Typography variant="caption" noWrap sx={{ color: '#909399' }}>版本编码：{option.versionCode}</Typography> : null}
                  </Box>;
                }) : null}
              </Box>;
            }) : null}
          </Box>;
        })}
      </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  </>;
}

export function RdoVersionMultiSelect({
  label,
  options,
  selectedIds,
  onConfirm,
  emptyText,
  onPreview,
  previewOpen = false,
}: {
  label: string;
  options: RdoVersionChoice[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
  emptyText: string;
  onPreview?: (choice: RdoVersionChoice) => void;
  previewOpen?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const showCategories = options.some((option) => Boolean(option.categoryName?.trim()));
  const groups = useMemo<RdoVersionCategoryGroup[]>(() => {
    const categories = new Map<string, { name: string; parents: Map<string, RdoVersionParentGroup> }>();
    options.forEach((option) => {
      const categoryName = showCategories ? option.categoryName?.trim() || '未分类' : '';
      const categoryKey = `category:${categoryName}`;
      if (!categories.has(categoryKey)) categories.set(categoryKey, { name: categoryName, parents: new Map() });
      const category = categories.get(categoryKey)!;
      const parentKey = `parent:${categoryKey}:${option.parentId}`;
      if (!category.parents.has(parentKey)) category.parents.set(parentKey, { key: parentKey, id: option.parentId, name: option.parentName, versions: [] });
      category.parents.get(parentKey)!.versions.push(option);
    });
    return [...categories.entries()].map(([key, category]) => ({ key, name: category.name, parents: [...category.parents.values()] }));
  }, [options, showCategories]);
  const categoryKeys = useMemo(() => groups.map((group) => group.key), [groups]);
  const parentKeys = useMemo(() => groups.flatMap((group) => group.parents.map((parent) => parent.key)), [groups]);
  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  const visibleGroups = useMemo(() => groups.map((group) => ({
    ...group,
    parents: group.parents.map((parent) => ({
      ...parent,
      versions: parent.versions.filter((option) => !normalizedSearch || [group.name, option.parentName, option.version, option.versionCode].filter(Boolean).join(' ').toLocaleLowerCase().includes(normalizedSearch)),
    })).filter((parent) => parent.versions.length > 0),
  })).filter((group) => group.parents.length > 0), [groups, normalizedSearch]);

  const openPicker = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSearchText('');
    setPendingIds(new Set());
    setExpandedKeys(new Set([...categoryKeys, ...parentKeys]));
  };
  const closePicker = () => {
    setAnchorEl(null);
    setSearchText('');
  };
  const toggle = (id: string) => setPendingIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleExpanded = (key: string) => setExpandedKeys((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const confirm = () => {
    onConfirm([...pendingIds]);
    closePicker();
  };

  return <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
    <Button variant="outlined" size="small" startIcon={<Add fontSize="small" />} onClick={openPicker} sx={{ alignSelf: 'flex-start', borderColor: '#c7d3df', color: '#1677c8' }}>{label}</Button>
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
      style={{ zIndex: previewOpen ? 1200 : 1400 }}
    >
        <Paper sx={{ width: 520, maxWidth: 'calc(100vw - 32px)', maxHeight: 560, overflow: 'hidden', border: '1px solid #dfe5ed', boxShadow: '0 8px 24px rgba(32, 56, 85, .16)' }}>
      <Box sx={{ px: 1.25, py: 1, borderBottom: '1px solid #e8ecf1' }}>
        <TextField autoFocus size="small" fullWidth value={searchText} placeholder={showCategories ? '搜索分类、父名称、版本号或版本编码' : '搜索父名称、版本号或版本编码'} onChange={(event) => setSearchText(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
      </Box>
      <Box sx={{ maxHeight: 430, overflow: 'auto', py: 0.5 }}>
        {visibleGroups.length === 0 ? <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: '#909399' }}>{normalizedSearch ? '未找到匹配的版本' : emptyText}</Typography> : visibleGroups.map((group) => {
          const categoryExpanded = normalizedSearch.length > 0 || expandedKeys.has(group.key);
          return <Box key={group.key}>
            {showCategories ? <Box component="button" type="button" onClick={() => toggleExpanded(group.key)} sx={{ width: '100%', minHeight: 36, px: 1.25, border: 0, bgcolor: '#f7f9fc', color: '#303133', display: 'flex', alignItems: 'center', gap: 0.75, textAlign: 'left', cursor: 'pointer', font: 'inherit', '&:hover': { bgcolor: '#eef4fb' } }}>
              {categoryExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}<FolderOutlined fontSize="small" sx={{ color: '#7b8794' }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{group.name}</Typography>
            </Box> : null}
            {categoryExpanded ? group.parents.map((parent) => {
              const parentExpanded = normalizedSearch.length > 0 || expandedKeys.has(parent.key);
              return <Box key={parent.key}>
                <Box component="button" type="button" onClick={() => toggleExpanded(parent.key)} sx={{ width: '100%', minHeight: 38, pl: showCategories ? 3.5 : 1.25, pr: 1.25, border: 0, bgcolor: 'transparent', color: '#303133', display: 'flex', alignItems: 'center', gap: 0.75, textAlign: 'left', cursor: 'pointer', font: 'inherit', '&:hover': { bgcolor: '#f5f8fc' } }}>
                  {parentExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}<Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{parent.name}</Typography><Typography variant="caption" sx={{ ml: 'auto', color: '#909399' }}>{parent.versions.length} 个版本</Typography>
                </Box>
                {parentExpanded ? parent.versions.map((option) => {
                  const alreadySelected = selectedIds.includes(option.id);
                  const checked = alreadySelected || pendingIds.has(option.id);
                  return <Box key={option.id} component="label" sx={{ width: '100%', minHeight: 40, pl: showCategories ? 7.25 : 5, pr: 1.25, bgcolor: checked ? '#e8f4ff' : 'transparent', display: 'flex', alignItems: 'center', gap: 0.5, cursor: alreadySelected ? 'default' : 'pointer', opacity: alreadySelected ? 0.7 : 1, '&:hover': { bgcolor: alreadySelected ? '#e8f4ff' : '#f0f7ff' } }}>
                  <input type="checkbox" checked={checked} disabled={alreadySelected} onChange={() => toggle(option.id)} style={{ accentColor: '#1677c8' }} />
                  <Typography variant="body2" sx={{ fontWeight: checked ? 600 : 400 }}>{option.version || '-'}</Typography>
                  {option.versionCode ? <Typography variant="caption" noWrap sx={{ color: '#909399' }}>编码：{option.versionCode}</Typography> : null}
                  {onPreview ? <Tooltip title="预览" arrow><IconButton size="small" aria-label={`预览 ${option.parentName} ${option.version || ''}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onPreview(option); }} sx={{ ml: 'auto', color: '#5b7188' }}><VisibilityOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip> : null}
                </Box>;
                }) : null}
              </Box>;
            }) : null}
          </Box>;
        })}
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.25, py: 1, borderTop: '1px solid #e8ecf1' }}>
        <Typography variant="caption" sx={{ color: '#606266' }}>待添加 {pendingIds.size} 个版本</Typography>
        <Stack direction="row" spacing={1}><Button size="small" onClick={closePicker}>取消</Button><Button size="small" variant="contained" onClick={confirm}>添加</Button></Stack>
      </Stack>
        </Paper>
    </Popper>
  </Box>;
}

export interface DhrDirectoryFormSelection {
  dhrTemplateItemId: string;
  formTemplateVersionId: string;
}

export function DhrDirectoryFormPicker({
  options,
  directories,
  selectedIds,
  onConfirm,
  emptyText,
  onPreview,
  previewOpen = false,
}: {
  options: ProductModelTemplateOption[];
  directories: ProductModelDhrDirectoryOption[];
  selectedIds: string[];
  onConfirm: (selections: DhrDirectoryFormSelection[]) => void;
  emptyText: string;
  onPreview?: (option: ProductModelTemplateOption) => void;
  previewOpen?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pendingSelections, setPendingSelections] = useState<Map<string, DhrDirectoryFormSelection>>(new Map());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const directoryOptions = directories ?? [];
  const selectedItemIds = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedDirectoryByVersion = useMemo(() => {
    const result = new Map<string, string>();
    options.forEach((option) => {
      if (option.dhrTemplateItemId && selectedItemIds.has(option.dhrTemplateItemId) && !result.has(option.id)) {
        result.set(option.id, option.directoryName || '其他目录');
      }
    });
    return result;
  }, [options, selectedItemIds]);
  const directoriesByParent = useMemo(() => {
    const result = new Map<string, ProductModelDhrDirectoryOption[]>();
    directoryOptions.forEach((directory) => {
      const key = directory.parentId || '__root__';
      const siblings = result.get(key) ?? [];
      siblings.push(directory);
      result.set(key, siblings);
    });
    result.forEach((siblings) => siblings.sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.name.localeCompare(right.name)));
    return result;
  }, [directoryOptions]);
  const optionsByDirectory = useMemo(() => {
    const result = new Map<string, ProductModelTemplateOption[]>();
    options.forEach((option) => {
      if (!option.directoryId) return;
      const entries = result.get(option.directoryId) ?? [];
      entries.push(option);
      result.set(option.directoryId, entries);
    });
    return result;
  }, [options]);
  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  const matchingDirectoryIds = useMemo(() => {
    if (!normalizedSearch) return new Set(directoryOptions.map((directory) => directory.id));
    const directoryById = new Map(directoryOptions.map((directory) => [directory.id, directory]));
    const matches = new Set<string>();
    const includeAncestors = (directoryId: string) => {
      let current = directoryById.get(directoryId);
      while (current) {
        matches.add(current.id);
        current = current.parentId ? directoryById.get(current.parentId) : undefined;
      }
    };
    directoryOptions.forEach((directory) => {
      if (directory.name.toLocaleLowerCase().includes(normalizedSearch)) includeAncestors(directory.id);
    });
    options.forEach((option) => {
      const text = [option.directoryName, option.code, option.name, option.version, option.versionCode].filter(Boolean).join(' ').toLocaleLowerCase();
      if (text.includes(normalizedSearch) && option.directoryId) includeAncestors(option.directoryId);
    });
    return matches;
  }, [directoryOptions, normalizedSearch, options]);
  const openPicker = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSearchText('');
    setPendingSelections(new Map());
    setExpandedIds(new Set(directoryOptions.map((directory) => directory.id)));
  };
  const closePicker = () => {
    setAnchorEl(null);
    setSearchText('');
  };
  const toggleExpanded = (id: string) => setExpandedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const togglePending = (option: ProductModelTemplateOption) => setPendingSelections((current) => {
    const next = new Map(current);
    if (next.has(option.id)) next.delete(option.id);
    else if (option.dhrTemplateItemId) next.set(option.id, { dhrTemplateItemId: option.dhrTemplateItemId, formTemplateVersionId: option.id });
    return next;
  });
  const renderDirectory = (directory: ProductModelDhrDirectoryOption, depth: number): ReactNode => {
    if (!matchingDirectoryIds.has(directory.id)) return null;
    const children = directoriesByParent.get(directory.id) ?? [];
    const forms = optionsByDirectory.get(directory.id) ?? [];
    const expanded = normalizedSearch.length > 0 || expandedIds.has(directory.id);
    return <Box key={directory.id}>
      <Box component="button" type="button" onClick={() => toggleExpanded(directory.id)} sx={{ width: '100%', minHeight: 38, pl: 1.25 + depth * 2.25, pr: 1.25, border: 0, bgcolor: 'transparent', color: '#303133', display: 'flex', alignItems: 'center', gap: 0.75, textAlign: 'left', cursor: 'pointer', font: 'inherit', '&:hover': { bgcolor: '#f5f8fc' } }}>
        {expanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}<FolderOutlined fontSize="small" sx={{ color: '#d39b2a' }} /><Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{directory.name}</Typography>
      </Box>
      {expanded ? <Box>
        {children.map((child) => renderDirectory(child, depth + 1))}
        {forms.map((option) => {
          const id = option.dhrTemplateItemId || option.id;
          const selectedDirectoryName = selectedDirectoryByVersion.get(option.id);
          const alreadySelected = Boolean(selectedDirectoryName);
          const pendingSelection = pendingSelections.get(option.id);
          const pendingElsewhere = Boolean(pendingSelection && pendingSelection.dhrTemplateItemId !== id);
          const checked = alreadySelected || Boolean(pendingSelection);
          const disabled = alreadySelected || pendingElsewhere;
          const hint = alreadySelected
            ? selectedItemIds.has(id) ? '已引用' : `已在 ${selectedDirectoryName} 目录引用`
            : pendingElsewhere ? '同版本已勾选' : '';
          return <Box key={id} role="checkbox" aria-checked={checked} onClick={() => { if (!disabled) togglePending(option); }} sx={{ width: '100%', minHeight: 42, pl: 5.25 + depth * 2.25, pr: 1, bgcolor: checked ? '#e8f4ff' : 'transparent', display: 'flex', alignItems: 'center', gap: 0.5, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.62 : 1, '&:hover': { bgcolor: disabled ? (checked ? '#e8f4ff' : 'transparent') : '#f0f7ff' } }}>
            <Checkbox size="small" checked={checked} disabled={disabled} onClick={(event) => { event.stopPropagation(); if (!disabled) togglePending(option); }} onChange={() => undefined} sx={{ p: 0.5, mr: 0.25 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.75} alignItems="baseline" sx={{ minWidth: 0 }}><Typography variant="body2" noWrap sx={{ minWidth: 0, fontWeight: checked ? 600 : 400 }}>{option.name}</Typography><Typography variant="caption" noWrap sx={{ color: '#909399' }}>{option.version || '-'}</Typography></Stack>
              {hint ? <Typography variant="caption" noWrap sx={{ display: 'block', color: '#909399' }}>{hint}</Typography> : null}
            </Box>
            {option.code ? <Typography variant="caption" noWrap sx={{ color: '#909399' }}>编码：{option.code}</Typography> : null}
            {onPreview ? <Tooltip title="预览表单" arrow><IconButton size="small" aria-label={`预览表单 ${option.name}`} onClick={(event) => { event.stopPropagation(); onPreview(option); }} sx={{ flex: '0 0 auto', color: '#5b7188' }}><VisibilityOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip> : null}
          </Box>;
        })}
      </Box> : null}
    </Box>;
  };
  const rootDirectories = directoriesByParent.get('__root__') ?? [];

  return <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
    <Button variant="outlined" size="small" startIcon={<Add fontSize="small" />} onClick={openPicker} sx={{ alignSelf: 'flex-start', borderColor: '#c7d3df', color: '#1677c8' }}>添加表单</Button>
    <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start" modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]} style={{ zIndex: previewOpen ? 1200 : 1400 }}>
        <Paper sx={{ width: 600, maxWidth: 'calc(100vw - 32px)', maxHeight: 600, overflow: 'hidden', border: '1px solid #dfe5ed', boxShadow: '0 8px 24px rgba(32, 56, 85, .16)' }}>
      <Box sx={{ px: 1.25, py: 1, borderBottom: '1px solid #e8ecf1' }}><TextField autoFocus size="small" fullWidth value={searchText} placeholder="搜索目录、表单名称、版本号或版本编码" onChange={(event) => setSearchText(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} /><Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: '#606266' }}>同一表单版本在当前工序只能引用一次；它出现在多个目录时会同步勾选。</Typography></Box>
      <Box sx={{ maxHeight: 456, overflow: 'auto', py: 0.5 }}>
        {rootDirectories.length === 0 ? <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: '#909399' }}>{emptyText}</Typography> : rootDirectories.map((directory) => renderDirectory(directory, 0))}
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.25, py: 1, borderTop: '1px solid #e8ecf1' }}><Typography variant="caption" sx={{ color: '#606266' }}>待添加 {pendingSelections.size} 个表单版本</Typography><Stack direction="row" spacing={1}><Button size="small" onClick={closePicker}>取消</Button><Button size="small" variant="contained" onClick={() => { onConfirm([...pendingSelections.values()]); closePicker(); }}>添加</Button></Stack></Stack>
        </Paper>
    </Popper>
  </Box>;
}

function RouteGraph({ graph, selectedNodeKey, onSelectNode }: {
  graph?: RouteGraphResponse;
  selectedNodeKey?: string;
  onSelectNode?: (nodeKey: string) => void;
}) {
  const nodes = useMemo<Node[]>(() => (graph?.nodes ?? []).map((node, index) => ({
    id: node.nodeKey,
    position: {
      x: node.positionX ?? 56 + (index % 3) * 180,
      y: node.positionY ?? 50 + Math.floor(index / 3) * 105,
    },
    data: { label: node.operationName || node.nodeKey },
    style: {
      width: 138,
      minHeight: 42,
      borderRadius: 4,
      border: selectedNodeKey === node.nodeKey ? '2px solid #1677c8' : '1px solid #b8c6d5',
      background: selectedNodeKey === node.nodeKey ? '#e8f4ff' : '#fff',
      boxShadow: selectedNodeKey === node.nodeKey ? '0 0 0 3px rgba(22,119,200,.1)' : 'none',
      color: '#303133',
      fontSize: 13,
      padding: 9,
      textAlign: 'center' as const,
    },
  })), [graph?.nodes, selectedNodeKey]);
  const edges = useMemo<Edge[]>(() => (graph?.relations ?? []).map((relation, index) => ({
    id: String(relation.id ?? `${relation.sourceNodeKey}-${relation.targetNodeKey}-${index}`),
    source: relation.sourceNodeKey,
    target: relation.targetNodeKey,
    label: relation.label || undefined,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8a97a6' },
    style: { stroke: '#8a97a6', strokeWidth: 1.5 },
  })), [graph?.relations]);

  if (!graph) return <Box sx={{ height: '100%', minHeight: { xs: 240, lg: 0 }, display: 'grid', placeItems: 'center', color: '#909399' }}><CircularProgress size={24} /></Box>;
  if (nodes.length === 0) return <Box sx={{ height: '100%', minHeight: { xs: 240, lg: 0 }, display: 'grid', placeItems: 'center', color: '#909399' }}>当前工艺路线暂无节点</Box>;
  return <Box sx={{ height: '100%', minHeight: { xs: 240, lg: 0 }, minWidth: 0, bgcolor: '#fafcff', backgroundImage: 'linear-gradient(#f0f3f7 1px, transparent 1px), linear-gradient(90deg, #f0f3f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={Boolean(onSelectNode)}
        panOnDrag
        zoomOnDoubleClick={false}
        onNodeClick={(_, node) => onSelectNode?.(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e6ebf0" gap={20} size={1} />
      </ReactFlow>
    </ReactFlowProvider>
  </Box>;
}

export function ReferenceBindingList<T extends { id: string }>({
  label,
  options,
  value,
  getOptionLabel,
  getOptionId,
  toChoice,
  onAdd,
  onRemove,
  onMove,
  renderDetails,
  onPreview,
  previewOpen = false,
  addControl,
  emptyText,
  emptySelectionText,
  addLabel = '添加引用',
}: {
  label: string;
  options: T[];
  value: T[];
  getOptionLabel: (option: T) => string;
  getOptionId: (option: T) => string;
  toChoice: (option: T) => RdoVersionChoice;
  onAdd: (ids: string[]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  renderDetails?: (option: T, index: number) => ReactNode;
  onPreview?: (option: T) => void;
  previewOpen?: boolean;
  addControl?: ReactNode;
  emptyText: string;
  emptySelectionText?: string;
  addLabel?: string;
}) {
  const selectedIds = value.map(getOptionId);
  return <Stack spacing={1}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 30 }}>
      <Typography variant="body2" sx={{ color: '#303133', fontWeight: 600 }}>{label}</Typography>
      {addControl ?? <RdoVersionMultiSelect label={addLabel} options={options.map(toChoice)} selectedIds={selectedIds} onConfirm={onAdd} emptyText={emptyText} previewOpen={previewOpen} onPreview={onPreview ? (choice) => {
        const option = options.find((item) => getOptionId(item) === choice.id);
        if (option) onPreview(option);
      } : undefined} />}
    </Stack>
    {value.length === 0 ? <Box sx={{ border: '1px dashed #cfd8e3', borderRadius: 1, px: 1.25, py: 2, textAlign: 'center', bgcolor: '#fbfcfe' }}><Typography variant="caption" sx={{ color: '#909399' }}>{emptySelectionText ?? emptyText}</Typography></Box> : value.map((option, index) => <Box key={getOptionId(option)} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, px: 1.25, py: 1, bgcolor: '#fff' }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography variant="caption" sx={{ width: 24, pt: 0.5, color: '#909399' }}>{String(index + 1).padStart(2, '0')}</Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" noWrap title={getOptionLabel(option)} sx={{ color: '#303133', fontWeight: 500 }}>{getOptionLabel(option)}</Typography>{renderDetails?.(option, index)}</Box>
        <Stack direction="row" spacing={0}>
          {onPreview ? <Tooltip title="预览" arrow><IconButton size="small" aria-label={`预览引用 ${getOptionLabel(option)}`} onClick={() => onPreview(option)}><VisibilityOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip> : null}
          <Tooltip title="上移" arrow><span><IconButton size="small" aria-label="上移引用" onClick={() => onMove(getOptionId(option), -1)} disabled={index === 0}><ArrowUpward sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
          <Tooltip title="下移" arrow><span><IconButton size="small" aria-label="下移引用" onClick={() => onMove(getOptionId(option), 1)} disabled={index === value.length - 1}><ArrowDownward sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
          <Tooltip title="移除引用" arrow><IconButton size="small" aria-label="移除引用" onClick={() => onRemove(getOptionId(option))}><DeleteOutline sx={{ fontSize: 17 }} /></IconButton></Tooltip>
        </Stack>
      </Stack>
    </Box>)}
  </Stack>;
}

export function FormTemplatePreviewDialog({ option, onClose }: { option: ProductModelTemplateOption | null; onClose: () => void }) {
  const previewQuery = useQuery({
    queryKey: ['product-process-form-preview', option?.templateId, option?.id],
    enabled: Boolean(option?.templateId && option?.id),
    queryFn: async () => (await getFormTemplateVersion(option!.templateId, option!.id)).data.data,
  });
  const previewDocument = useMemo(() => {
    if (!option || !previewQuery.data) return null;
    const row: TemplateModelingRecord = { id: option.templateId, code: option.code, name: option.name, type: 'FORM_TEMPLATE' };
    return parseReactTemplateDesignerDocument(row, previewQuery.data as TemplateVersionRecord);
  }, [option, previewQuery.data]);
  return <AppDialog open={Boolean(option)} onClose={onClose} fullWidth maxWidth="lg">
    <DialogTitle sx={{ pr: 6 }}>
      <Typography component="div" variant="h6" noWrap>{option ? `${option.name} / ${option.version || '-'}` : '表单预览'}</Typography>
      {option?.code ? <Typography variant="caption" sx={{ color: '#909399' }}>表单编码：{option.code}</Typography> : null}
    </DialogTitle>
    <DialogContent dividers sx={{ height: 'min(72vh, 760px)', minHeight: 420, p: 0, display: 'flex', flexDirection: 'column', bgcolor: '#eef3f8' }}>
      {previewQuery.isLoading ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box> : previewQuery.isError ? <Typography variant="body2" sx={{ p: 3, color: '#c62828' }}>无法加载该表单版本</Typography> : previewDocument ? <FormCanvasPreview document={previewDocument} /> : <Typography variant="body2" sx={{ p: 3, color: '#909399' }}>该表单暂无可预览的设计内容</Typography>}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.25 }}><Button onClick={onClose}>关闭</Button></DialogActions>
  </AppDialog>;
}

type DocumentPreviewTarget = Pick<ProductModelDocumentOption, 'fileId' | 'fileName' | 'fileMimeType'> & { title?: string | null; version?: string | null };

function documentPreviewKind(option: DocumentPreviewTarget): 'image' | 'video' | 'document' {
  const mimeType = option.fileMimeType?.toLocaleLowerCase() || '';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

export function DocumentPreviewDialog({ option, onClose }: { option: DocumentPreviewTarget | null; onClose: () => void }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl = '';
    if (!option?.fileId) {
      setPreviewUrl('');
      setLoading(false);
      setError('');
      return undefined;
    }
    setLoading(true);
    setError('');
    getFilePreviewBlob(option.fileId)
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => setError('文件预览加载失败'))
      .finally(() => setLoading(false));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [option?.fileId]);

  const previewKind = option ? documentPreviewKind(option) : 'document';
  const title = option ? [option.title, option.version].filter(Boolean).join(' / ') : '文档预览';
  return <AppDialog open={Boolean(option)} onClose={onClose} fullWidth maxWidth="lg">
    <DialogTitle sx={{ pr: 6 }}>{title || '文档预览'}</DialogTitle>
    <DialogContent dividers sx={{ minHeight: 520, display: 'grid', placeItems: 'center', bgcolor: '#f5f7fa' }}>
      {loading ? <CircularProgress size={28} /> : error ? <Typography variant="body2" sx={{ color: '#c62828' }}>{error}</Typography> : !option?.fileId ? <Typography variant="body2" sx={{ color: '#909399' }}>暂无可预览文件</Typography> : previewUrl && previewKind === 'image' ? <Box component="img" src={previewUrl} alt={title || '文档预览'} sx={{ maxWidth: '100%', maxHeight: 600, objectFit: 'contain' }} /> : previewUrl && previewKind === 'video' ? <Box component="video" src={previewUrl} controls sx={{ maxWidth: '100%', maxHeight: 600 }} /> : previewUrl ? <Box component="iframe" title={title || '文档预览'} src={previewUrl} sx={{ border: 0, width: '100%', height: 580, bgcolor: '#fff' }} /> : null}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.25 }}><Button onClick={onClose}>关闭</Button></DialogActions>
  </AppDialog>;
}

export default function ProductProcessVersionEditorDialog({
  open,
  productId,
  productName,
  productCode,
  loadOptions,
  mode,
  target,
  versions,
  saving = false,
  onClose,
  onSubmit,
}: ProductProcessVersionEditorDialogProps) {
  const [form, setForm] = useState<VersionForm>(() => toVersionForm(mode, target, versions));
  const [drafts, setDrafts] = useState<OperationDraft[]>([]);
  const [selectedNodeKey, setSelectedNodeKey] = useState('');
  const [activeReferenceTab, setActiveReferenceTab] = useState<'forms' | 'documents'>('forms');
  const [validationError, setValidationError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<ProductModelTemplateOption | null>(null);
  const [previewDocument, setPreviewDocument] = useState<ProductModelDocumentOption | null>(null);
  const initializedRoute = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(toVersionForm(mode, target, versions));
    setDrafts([]);
    setSelectedNodeKey('');
    setActiveReferenceTab('forms');
    setValidationError('');
    setDirty(false);
    setDiscardConfirmOpen(false);
    setPreviewForm(null);
    setPreviewDocument(null);
    initializedRoute.current = null;
  }, [open, mode, target?.id]);

  const optionsQuery = useQuery({
    queryKey: ['product-modeling-options', productId, form.dhrTemplateVersionId],
    enabled: open && Boolean(productId),
    queryFn: async () => loadOptions
      ? loadOptions(form.dhrTemplateVersionId || undefined)
      : (await getProductModelOptions(productId, form.dhrTemplateVersionId || undefined)).data.data,
    placeholderData: (previous) => previous,
  });
  const options = optionsQuery.data;
  const selectedRoute = options?.routes.find((route) => route.id === form.routeVersionId) ?? null;
  const routeChoices = useMemo<RdoVersionChoice[]>(() => (options?.routes ?? []).map((route) => ({
    id: route.id,
    parentId: route.routeId,
    parentName: route.routeName,
    version: route.version,
    versionCode: route.versionCode,
    status: route.status,
  })), [options?.routes]);
  const dhrTemplateChoices = useMemo<RdoVersionChoice[]>(() => (options?.dhrTemplates ?? []).map((template) => ({
    id: template.id,
    parentId: template.templateId,
    parentName: template.name,
    version: template.version,
    versionCode: template.versionCode,
    status: template.status,
    categoryName: template.categoryName,
  })), [options?.dhrTemplates]);
  const routeGraphQuery = useQuery({
    queryKey: ['product-process-editor-route-graph', selectedRoute?.routeId, selectedRoute?.id],
    enabled: open && Boolean(selectedRoute),
    queryFn: async () => (await getProcessRouteGraph(selectedRoute!.routeId, selectedRoute!.id)).data.data,
  });

  useEffect(() => {
    const graph = routeGraphQuery.data;
    if (!open || !graph || !form.routeVersionId) return;
    if (initializedRoute.current === form.routeVersionId) return;
    const sourceOperations = target?.routeVersionId === form.routeVersionId ? target.operations : [];
    const nextDrafts = toOperationDrafts(graph.nodes, sourceOperations);
    setDrafts(nextDrafts);
    setSelectedNodeKey(nextDrafts[0]?.routeNodeKey ?? '');
    initializedRoute.current = form.routeVersionId;
  }, [open, form.routeVersionId, routeGraphQuery.data, target]);

  const selectedNode = drafts.find((draft) => draft.routeNodeKey === selectedNodeKey) ?? null;
  const formOptions = options?.formTemplates ?? [];
  const documentOptions = options?.documents ?? [];
  const formOptionsById = useMemo(() => new Map(formOptions.map((option) => [option.dhrTemplateItemId || option.id, option])), [formOptions]);
  const documentOptionsById = useMemo(() => new Map((options?.documents ?? []).map((option) => [option.id, option])), [options?.documents]);
  const selectedForms = selectedNode?.forms.map((binding) => formOptionsById.get(binding.dhrTemplateItemId || binding.formTemplateVersionId)).filter((item): item is ProductModelTemplateOption => Boolean(item)) ?? [];
  const selectedDocuments = selectedNode?.documents.map((binding) => {
    const option = documentOptionsById.get(binding.documentVersionId);
    return option ? { ...option, pageStart: binding.pageStart ?? null, pageEnd: binding.pageEnd ?? null } : null;
  }).filter((item): item is ProductModelDocumentOption & { pageStart: number | null; pageEnd: number | null } => Boolean(item)) ?? [];
  const title = mode === 'create' ? '新建制程配置版本' : mode === 'copy' ? '复制制程配置版本' : '编辑制程配置版本';
  const canSubmit = Boolean(form.version.trim() && form.productionMode && form.productionForm && form.routeVersionId && form.dhrTemplateVersionId);

  const set = <K extends keyof VersionForm>(key: K, value: VersionForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setValidationError('');
    setDirty(true);
  };
  const updateSelectedNode = (update: (draft: OperationDraft) => OperationDraft) => {
    if (!selectedNode) return;
    setDrafts((current) => current.map((draft) => draft.routeNodeKey === selectedNode.routeNodeKey ? update(draft) : draft));
    setDirty(true);
  };
  const reorder = <T,>(items: T[], currentIndex: number, direction: -1 | 1) => {
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
    const result = [...items];
    [result[currentIndex], result[nextIndex]] = [result[nextIndex], result[currentIndex]];
    return result;
  };
  const addForms = (selections: DhrDirectoryFormSelection[]) => updateSelectedNode((draft) => {
    const existing = new Set(draft.forms.map((item) => item.formTemplateVersionId));
    const additions = selections.filter((selection) => !existing.has(selection.formTemplateVersionId));
    return { ...draft, forms: [...draft.forms, ...additions.map((selection) => ({ dhrTemplateItemId: selection.dhrTemplateItemId, formTemplateVersionId: selection.formTemplateVersionId, required: true, sortOrder: 0 }))] };
  });
  const addDocuments = (ids: string[]) => updateSelectedNode((draft) => {
    const existing = new Set(draft.documents.map((item) => item.documentVersionId));
    return { ...draft, documents: [...draft.documents, ...ids.filter((id) => !existing.has(id)).map((id) => ({ documentVersionId: id, sortOrder: 0, pageStart: null, pageEnd: null }))] };
  });
  const handleRouteChange = (routeId: string) => {
    initializedRoute.current = null;
    setDrafts([]);
    setSelectedNodeKey('');
    set('routeVersionId', routeId);
  };
  const handleDhrChange = (dhrTemplateVersionId: string) => {
    setDrafts((current) => current.map((draft) => ({ ...draft, forms: [] })));
    set('dhrTemplateVersionId', dhrTemplateVersionId);
  };
  const requestClose = () => {
    if (dirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    onClose();
  };
  const submit = () => {
    const normalizedVersion = form.version.trim();
    const duplicate = versions.some((version) => version.id !== target?.id && version.version.trim().toUpperCase() === normalizedVersion.toUpperCase());
    if (duplicate) {
      setValidationError(`版本号「${normalizedVersion}」已存在，请修改后保存。`);
      return;
    }
    if (form.effectiveFrom && form.effectiveTo && form.effectiveTo <= form.effectiveFrom) {
      setValidationError('失效时间必须晚于生效时间。');
      return;
    }
    const invalidPageRange = drafts.flatMap((draft) => draft.documents.map((document) => ({ operationName: draft.operationName, ...document }))).find((document) => {
      if (!isPdfDocument(documentOptionsById.get(document.documentVersionId))) return false;
      const hasStart = document.pageStart !== null && document.pageStart !== undefined;
      const hasEnd = document.pageEnd !== null && document.pageEnd !== undefined;
      return (hasStart !== hasEnd) || (hasStart && (!Number.isInteger(document.pageStart) || !Number.isInteger(document.pageEnd) || document.pageStart! < 1 || document.pageEnd! < document.pageStart!));
    });
    if (invalidPageRange) {
      setValidationError(`工序「${invalidPageRange.operationName}」的 PDF 文档页码范围需同时填写，且结束页不能早于起始页。`);
      return;
    }
    onSubmit(toPayload(form, drafts));
  };

  return <>
    <AppDialog hideCloseButton open={open} onClose={saving ? undefined : requestClose} fullScreen PaperProps={{ sx: { borderRadius: 0, bgcolor: '#f6f8f9' } }}>
    <DialogTitle sx={{ px: 2, py: 1.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', minHeight: 32 }}>
        <Typography component="span" variant="h6">{title}</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography component="span" variant="body2" sx={{ color: '#909399', fontWeight: 400 }}>{productName} / {productCode}</Typography>
          <Tooltip title="关闭" arrow><span><IconButton size="small" aria-label="关闭" onClick={requestClose} disabled={saving} sx={{ width: 32, height: 32, color: '#606266', '&:hover': { bgcolor: '#f2f3f5', color: '#303133' } }}><Close fontSize="small" /></IconButton></span></Tooltip>
        </Stack>
      </Box>
    </DialogTitle>
    <DialogContent dividers sx={{ p: 0, minHeight: 0, overflow: { xs: 'auto', lg: 'hidden' }, display: 'flex', flexDirection: 'column' }}>
      {optionsQuery.isLoading && !options ? <Box sx={{ flex: 1, minHeight: 420, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box> : !options ? <Box sx={{ flex: 1, minHeight: 280, display: 'grid', placeItems: 'center', color: '#c62828' }}>制程配置选项加载失败</Box> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '330px minmax(0, 1fr)' }, flex: { xs: '0 0 auto', lg: 1 }, minHeight: { xs: 'auto', lg: 0 } }}>
        <Stack spacing={1.5} sx={{ p: 2, borderRight: { lg: '1px solid #e4e7ed' }, borderBottom: { xs: '1px solid #e4e7ed', lg: 0 }, bgcolor: '#fff' }}>
          <TextField required size="small" label="制程版本" value={form.version} onChange={(event) => set('version', event.target.value)} />
          <TextField select required size="small" label="生产模式" value={form.productionMode} onChange={(event) => set('productionMode', event.target.value)}>
            {PRODUCTION_MODE_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
          <TextField select required size="small" label="生产方式" value={form.productionForm} onChange={(event) => set('productionForm', event.target.value)}>
            {PRODUCTION_FORM_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
          <RdoVersionTreeSelect label="工艺路线版本" required options={routeChoices} value={form.routeVersionId} onChange={handleRouteChange} emptyText="暂无可引用工艺路线版本" />
          <RdoVersionTreeSelect label="批记录模板版本" required options={dhrTemplateChoices} value={form.dhrTemplateVersionId} onChange={handleDhrChange} emptyText="暂无可引用批记录模板版本" />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
            <TextField size="small" label="生效时间" type="datetime-local" value={form.effectiveFrom} onChange={(event) => set('effectiveFrom', event.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField size="small" label="失效时间" type="datetime-local" value={form.effectiveTo} onChange={(event) => set('effectiveTo', event.target.value)} InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField size="small" label="备注" value={form.description} onChange={(event) => set('description', event.target.value)} multiline minRows={3} />
        </Stack>
        <Box sx={{ minWidth: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', bgcolor: '#fcfdff' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e4e7ed', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ color: '#303133' }}>路线工序配置</Typography>
            <Typography variant="caption" sx={{ color: '#909399' }}>{selectedRoute ? `${selectedRoute.routeName} / ${selectedRoute.version}` : '选择工艺路线后加载路线图'}</Typography>
            {form.dhrTemplateVersionId ? <Chip size="small" label={`批记录：${optionText(options.dhrTemplates.find((option) => option.id === form.dhrTemplateVersionId))}`} sx={{ ml: { sm: 'auto' }, bgcolor: '#eef6ff', color: '#1677c8' }} /> : null}
          </Box>
          {!form.routeVersionId ? <Box sx={{ minHeight: { xs: 300, lg: 0 }, display: 'grid', placeItems: 'center', color: '#909399' }}>请先选择工艺路线版本</Box> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(440px, 1fr) minmax(380px, 430px)' }, gridTemplateRows: { xs: 'minmax(240px, 34vh) minmax(360px, 1fr)', lg: 'minmax(0, 1fr)' }, minHeight: 0, overflow: { xs: 'visible', lg: 'hidden' } }}>
            <Box sx={{ minWidth: 0, minHeight: 0, borderRight: { lg: '1px solid #e4e7ed' }, borderBottom: { xs: '1px solid #e4e7ed', lg: 0 } }}>
              <RouteGraph graph={routeGraphQuery.data} selectedNodeKey={selectedNodeKey} onSelectNode={(nodeKey) => { if (drafts.some((draft) => draft.routeNodeKey === nodeKey)) setSelectedNodeKey(nodeKey); }} />
            </Box>
            <Box sx={{ minWidth: 0, minHeight: { xs: 360, lg: 0 }, p: 1.5, bgcolor: '#fff', display: 'flex', flexDirection: 'column', overflow: { xs: 'visible', lg: 'hidden' } }}>
              {!selectedNode ? <Typography variant="body2" sx={{ color: '#909399', textAlign: 'center', py: 5 }}>请选择工艺路线中的工序节点</Typography> : <Stack spacing={1.25} sx={{ minHeight: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="baseline" sx={{ minHeight: 28, px: 0.25 }}><Typography variant="caption" sx={{ color: '#909399' }}>当前工序</Typography><Typography variant="body2" sx={{ color: '#303133', fontWeight: 600 }}>{selectedNode.operationName}</Typography>{selectedNode.operationCode ? <Typography variant="caption" sx={{ color: '#909399' }}>/ {selectedNode.operationCode}</Typography> : null}</Stack>
                <Tabs value={activeReferenceTab} onChange={(_, value: 'forms' | 'documents') => setActiveReferenceTab(value)} variant="fullWidth" sx={{ minHeight: 36, borderBottom: '1px solid #e4e7ed', '& .MuiTab-root': { minHeight: 36, minWidth: 0, px: 1, fontSize: 13 } }}>
                  <Tab value="forms" label={`DHR 目录表单 (${selectedForms.length})`} />
                  <Tab value="documents" label={`文档 (${selectedDocuments.length})`} />
                </Tabs>
                <Box sx={{ minHeight: 0, flex: 1, overflow: { xs: 'visible', lg: 'auto' }, pr: { lg: 0.5 } }}>
                {activeReferenceTab === 'forms' ? (!form.dhrTemplateVersionId ? <Typography variant="body2" sx={{ color: '#909399', pt: 1.5 }}>选择批记录模板版本后，才可引用该目录中的表单。</Typography> : <ReferenceBindingList
                  label="DHR 目录表单"
                  options={formOptions}
                  value={selectedForms}
                  getOptionId={(option) => option.dhrTemplateItemId || option.id}
                  toChoice={(option) => ({ id: option.dhrTemplateItemId || option.id, parentId: `${option.templateId}:${option.directoryName || ''}`, parentName: [option.directoryName, option.name].filter(Boolean).join(' / '), version: option.version, versionCode: option.versionCode, categoryName: option.categoryName })}
                  getOptionLabel={(option) => [option.name, option.version].filter(Boolean).join(' / ')}
                  emptyText="该批记录模板中暂无可引用表单"
                  emptySelectionText="当前工序尚未引用 DHR 目录表单"
                  addControl={<DhrDirectoryFormPicker
                    options={formOptions}
                    directories={options.dhrDirectories}
                    selectedIds={selectedForms.map((option) => option.dhrTemplateItemId || option.id)}
                    onConfirm={addForms}
                    emptyText="该批记录模板中暂无可引用表单"
                    onPreview={setPreviewForm}
                    previewOpen={Boolean(previewForm)}
                  />}
                  onAdd={() => undefined}
                  onPreview={setPreviewForm}
                  onRemove={(id) => updateSelectedNode((draft) => ({ ...draft, forms: draft.forms.filter((item) => (item.dhrTemplateItemId || item.formTemplateVersionId) !== id) }))}
                  onMove={(id, direction) => updateSelectedNode((draft) => {
                    const index = draft.forms.findIndex((item) => (item.dhrTemplateItemId || item.formTemplateVersionId) === id);
                    return { ...draft, forms: reorder(draft.forms, index, direction) };
                  })}
                  renderDetails={(option) => {
                    const binding = selectedNode.forms.find((item) => (item.dhrTemplateItemId || item.formTemplateVersionId) === (option.dhrTemplateItemId || option.id));
                    return <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      {option.code ? <Typography variant="caption" sx={{ color: '#909399' }}>表单编码：{option.code}</Typography> : null}
                      {binding ? <Stack component="label" direction="row" spacing={0.25} alignItems="center" sx={{ cursor: 'pointer' }}><Checkbox size="small" checked={binding.required} onChange={(event) => updateSelectedNode((draft) => ({ ...draft, forms: draft.forms.map((item) => (item.dhrTemplateItemId || item.formTemplateVersionId) === (option.dhrTemplateItemId || option.id) ? { ...item, required: event.target.checked } : item) }))} sx={{ p: 0.25 }} /><Typography variant="caption" sx={{ color: '#606266' }}>工序结束前完成</Typography></Stack> : null}
                    </Stack>;
                  }}
                />) : <ReferenceBindingList
                  label="文档"
                  addLabel="添加文档"
                  options={documentOptions.map((option) => ({ ...option, pageStart: null, pageEnd: null }))}
                  value={selectedDocuments}
                  getOptionId={(option) => option.id}
                  toChoice={(option) => ({ id: option.id, parentId: option.documentId, parentName: option.title || '-', version: option.version, versionCode: option.code, categoryName: option.documentCategoryName })}
                  getOptionLabel={(option) => [option.title, option.version].filter(Boolean).join(' / ')}
                  emptyText="暂无可引用文档版本"
                  emptySelectionText="当前工序尚未引用文档"
                  onAdd={addDocuments}
                  onPreview={setPreviewDocument}
                  previewOpen={Boolean(previewDocument)}
                  onRemove={(id) => updateSelectedNode((draft) => ({ ...draft, documents: draft.documents.filter((item) => item.documentVersionId !== id) }))}
                  onMove={(id, direction) => updateSelectedNode((draft) => {
                    const index = draft.documents.findIndex((item) => item.documentVersionId === id);
                    return { ...draft, documents: reorder(draft.documents, index, direction) };
                  })}
                  renderDetails={(option) => isPdfDocument(option) ? <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                    <TextField size="small" type="number" label="展示起始页" value={option.pageStart ?? ''} onChange={(event) => updateSelectedNode((draft) => ({ ...draft, documents: draft.documents.map((item) => item.documentVersionId === option.id ? { ...item, pageStart: toOptionalPage(event.target.value) } : item) }))} inputProps={{ min: 1, step: 1 }} sx={{ width: { xs: '100%', sm: 150 } }} />
                    <TextField size="small" type="number" label="展示结束页" value={option.pageEnd ?? ''} onChange={(event) => updateSelectedNode((draft) => ({ ...draft, documents: draft.documents.map((item) => item.documentVersionId === option.id ? { ...item, pageEnd: toOptionalPage(event.target.value) } : item) }))} inputProps={{ min: 1, step: 1 }} sx={{ width: { xs: '100%', sm: 150 } }} />
                  </Stack> : null}
                />}
                </Box>
              </Stack>}
            </Box>
          </Box>}
        </Box>
      </Box>}
      {validationError ? <Typography variant="body2" sx={{ px: 2, py: 1.25, color: '#d93025', borderTop: '1px solid #f7d5d0', bgcolor: '#fff7f5' }}>{validationError}</Typography> : null}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button onClick={requestClose} disabled={saving}>取消</Button>
      <Button variant="contained" disabled={!canSubmit || saving} onClick={submit}>{saving ? '保存中...' : '保存'}</Button>
    </DialogActions>
    </AppDialog>
    <ConfirmDialog open={discardConfirmOpen} title="放弃本次修改" message="当前制程版本配置尚未保存，确定放弃本次修改吗？" confirmText="放弃修改" onCancel={() => setDiscardConfirmOpen(false)} onConfirm={() => { setDiscardConfirmOpen(false); onClose(); }} />
    <FormTemplatePreviewDialog option={previewForm} onClose={() => setPreviewForm(null)} />
    <DocumentPreviewDialog option={previewDocument} onClose={() => setPreviewDocument(null)} />
  </>;
}
