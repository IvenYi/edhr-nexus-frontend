import {
  ArticleOutlined,
  ArrowBackIosNewRounded,
  DesignServices,
  DragIndicator,
  ExpandLess,
  FormatAlignCenterRounded,
  FormatAlignLeftRounded,
  FormatAlignRightRounded,
  FormatBoldRounded,
  FormatItalicRounded,
  FormatUnderlinedRounded,
  PlaylistAdd,
  RestartAlt,
  Search,
  TuneRounded,
  UnfoldLessRounded,
  UnfoldMoreRounded,
  UploadFile,
  ViewColumnRounded,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Popover,
  Select,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Fragment,
  type DragEvent as ReactDragEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  confirmFormTemplateAnalysisCandidates,
  createBatchRecordTemplate,
  createFormTemplate,
  createFormTemplateVersion,
  createTemplateModelingCategory,
  deleteBatchRecordTemplate,
  deleteFormTemplate,
  deleteFormTemplateVersion,
  deleteTemplateModelingCategory,
  getBatchRecordTemplates,
  getFormTemplateAnalysisDraft,
  getFormTemplateOnlyOfficeConfig,
  getFormTemplates,
  getTemplateModelingCategories,
  importFormTemplateSourceFile,
  reparseFormTemplateSourceFile,
  reorderTemplateModelingCategories,
  saveFormTemplateDesign,
  type OnlyOfficeEditorConfig,
  type TemplateAnalysisBlock,
  type TemplateAnalysisCandidate,
  type TemplateAnalysisDraft,
  type TemplateCanvasDesign,
  type TemplateCanvasLayer,
  type TemplateCanvasPage,
  type TemplateCanvasSource,
  type TemplateCandidateDecisionItem,
  type TemplateCategoryRecord,
  type TemplateImportResponse,
  type TemplateInteractiveField,
  type TemplateModelDesign,
  type TemplateModelingPageKey,
  type TemplateModelingPayload,
  type TemplateModelingRecord,
  type TemplateVersionRecord,
  updateBatchRecordTemplate,
  updateFormTemplate,
  updateTemplateModelingCategory,
} from '@/api/template-modeling';
import { getAuditLogs, type AuditLogItem } from '@/api/audit';
import type { PageResult } from '@/types/common';

const TEMPLATE_CATEGORY_ALL = 'ALL';
const TEMPLATE_CATEGORY_UNCATEGORIZED = 'UNCATEGORIZED';
const TEMPLATE_STATUS_OPTIONS = [
  { value: 'ALL', label: '全部' },
  { value: 'ACTIVE', label: '启用' },
  { value: 'DISABLED', label: '禁用' },
] as const;
const TEMPLATE_FORM_STATUS_OPTIONS = TEMPLATE_STATUS_OPTIONS.filter((option) => option.value !== 'ALL');

type TemplateColumnId = 'name' | 'code' | 'currentVersion' | 'version' | 'categoryName' | 'effectiveFrom' | 'effectiveTo' | 'description' | 'status' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt' | 'actions';
type ConfigurableTemplateColumnId = Exclude<TemplateColumnId, 'actions'>;
type TemplateColumnSettingsTarget = 'main' | 'version';
type SnackbarSeverity = 'success' | 'error' | 'info';

interface TemplateColumn {
  id: TemplateColumnId;
  label: string;
  defaultWidth: number;
  minWidth: number;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface TemplateColumnSettings {
  version: number;
  order: ConfigurableTemplateColumnId[];
  hidden: ConfigurableTemplateColumnId[];
}

type TemplateColumnWidths = Partial<Record<TemplateColumnId, number>>;
type TemplateCanvasTarget = { type: 'layer' | 'field'; pageId: string; id: string };
type OnlyOfficeEditorStatus = 'idle' | 'loading' | 'ready' | 'dirty' | 'saved' | 'error';
interface OnlyOfficeEditorState {
  status: OnlyOfficeEditorStatus;
  message?: string;
}

const onlyOfficeDocumentState = (dirty?: boolean): OnlyOfficeEditorState => (
  dirty ? { status: 'dirty' } : { status: 'saved' }
);

interface TemplateDesignerSnapshot {
  fieldCandidates: TemplateImportResponse['fieldCandidates'];
  analysisDraft: TemplateAnalysisDraft | null;
  candidateDecisions: Record<string, TemplateCandidateDecisionItem>;
  selectedAnalysisCandidateId: string | null;
  templateModelDesign: TemplateModelDesign;
  templateCanvasDesign: TemplateCanvasDesign;
  activeCanvasPageId: string | null;
  selectedCanvasTarget: TemplateCanvasTarget | null;
  fieldPreviewValues: Record<string, string>;
}
type TemplateCanvasToolPayload =
  | { kind: 'text' }
  | { kind: 'field' }
  | { kind: 'candidate'; candidate: TemplateImportResponse['fieldCandidates'][number] };

interface TemplatePageConfig {
  title: string;
  entityType: 'FORM_TEMPLATE' | 'DHR_TEMPLATE';
  queryKey: string;
  categoryQueryKey: string;
  auditQueryKey: string;
  createTitle: string;
  editTitle: string;
  createAction: (body: TemplateModelingPayload) => Promise<{ data: { data: TemplateModelingRecord } }>;
  updateAction: (id: string | number, body: TemplateModelingPayload) => Promise<{ data: { data: TemplateModelingRecord } }>;
  deleteAction: (id: string | number) => Promise<unknown>;
  listAction: (params: Record<string, unknown>) => Promise<{ data: { data: PageResult<TemplateModelingRecord> } }>;
}

const TEMPLATE_MODELING_PAGE_CONFIGS: Record<TemplateModelingPageKey, TemplatePageConfig> = {
  formTemplates: {
    title: '表单模板',
    entityType: 'FORM_TEMPLATE',
    queryKey: 'template-modeling-form-templates',
    categoryQueryKey: 'template-modeling-form-template-categories',
    auditQueryKey: 'template-modeling-form-template-audit',
    createTitle: '新增表单模板',
    editTitle: '编辑表单模板',
    createAction: createFormTemplate,
    updateAction: updateFormTemplate,
    deleteAction: deleteFormTemplate,
    listAction: getFormTemplates,
  },
  batchRecordTemplates: {
    title: '批记录模板',
    entityType: 'DHR_TEMPLATE',
    queryKey: 'template-modeling-batch-record-templates',
    categoryQueryKey: 'template-modeling-batch-record-template-categories',
    auditQueryKey: 'template-modeling-batch-record-template-audit',
    createTitle: '新增批记录模板',
    editTitle: '编辑批记录模板',
    createAction: createBatchRecordTemplate,
    updateAction: updateBatchRecordTemplate,
    deleteAction: deleteBatchRecordTemplate,
    listAction: getBatchRecordTemplates,
  },
};

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;
const TABLE_DATA_ROW_HEIGHT = 40;
const TEMPLATE_COLUMN_WIDTH_STORAGE_PREFIX = 'template-modeling-column-widths:';
const TEMPLATE_COLUMN_SETTINGS_STORAGE_PREFIX = 'template-modeling-column-settings:';
const TEMPLATE_VERSION_COLUMN_WIDTH_STORAGE_PREFIX = 'template-modeling-version-column-widths:';
const TEMPLATE_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX = 'template-modeling-version-column-settings:';
const TEMPLATE_COLUMN_SETTINGS_VERSION = 1;
const TEMPLATE_FIELD_COLUMN_MIN_WIDTH = 80;
const TEMPLATE_ACTION_COLUMN_WIDTH = 100;
const TEMPLATE_VERSION_FIELD_IDS: Array<keyof TemplateModelingPayload> = ['version', 'versionDescription', 'effectiveFrom', 'effectiveTo', 'status'];
const QUERY_BUTTON_SX = { height: 40, width: 80, minWidth: 80 };
const TEMPLATE_CANVAS_MAX_VISUAL_WIDTH = 1600;
const TEMPLATE_EXCEL_CANVAS_MIN_VISUAL_WIDTH = 1180;
const appContentDrawerSx = {
  top: 0,
  bottom: 0,
  zIndex: (theme: { zIndex: { drawer: number } }) => theme.zIndex.drawer + 2,
  '& .MuiBackdrop-root': {
    top: 0,
  },
};
const appContentDrawerPaperSx = {
  ...appContentDrawerSx,
  top: 0,
  bottom: 0,
  height: '100vh',
  transform: 'none !important',
};
const onlyOfficeDialogSx = {
  zIndex: (theme: { zIndex: { modal: number } }) => theme.zIndex.modal + 20,
};

const formTemplateColumns: TemplateColumn[] = [
  { id: 'name', label: '表单名称', defaultWidth: 180, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'code', label: '表单编码', defaultWidth: 140, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'currentVersion', label: '当前版本', defaultWidth: 120, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'categoryName', label: '模板分类', defaultWidth: 140, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'effectiveFrom', label: '生效时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'effectiveTo', label: '失效时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'description', label: '模板描述', defaultWidth: 220, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'status', label: '状态', defaultWidth: 100, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdBy', label: '创建人', defaultWidth: 120, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdAt', label: '创建时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'updatedBy', label: '更新人', defaultWidth: 120, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'updatedAt', label: '更新时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'actions', label: '操作', defaultWidth: TEMPLATE_ACTION_COLUMN_WIDTH, minWidth: TEMPLATE_ACTION_COLUMN_WIDTH, align: 'center' },
];

const batchTemplateColumns: TemplateColumn[] = [
  { id: 'name', label: '模板名称', defaultWidth: 180, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'code', label: '模板编码', defaultWidth: 140, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'categoryName', label: '模板分类', defaultWidth: 140, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'description', label: '模板描述', defaultWidth: 220, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'status', label: '状态', defaultWidth: 100, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdBy', label: '创建人', defaultWidth: 120, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdAt', label: '创建时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'updatedBy', label: '更新人', defaultWidth: 120, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'updatedAt', label: '更新时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'actions', label: '操作', defaultWidth: TEMPLATE_ACTION_COLUMN_WIDTH, minWidth: TEMPLATE_ACTION_COLUMN_WIDTH, align: 'center' },
];

const templateVersionColumns: TemplateColumn[] = [
  { id: 'version', label: '表单模板版本号', defaultWidth: 140, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'status', label: '版本状态', defaultWidth: 100, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'effectiveFrom', label: '生效日期', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'effectiveTo', label: '失效日期', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'description', label: '版本说明', defaultWidth: 220, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdBy', label: '创建人', defaultWidth: 120, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'createdAt', label: '创建时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'updatedBy', label: '更新人', defaultWidth: 120, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'updatedAt', label: '更新时间', defaultWidth: 160, minWidth: TEMPLATE_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  { id: 'actions', label: '操作', defaultWidth: TEMPLATE_ACTION_COLUMN_WIDTH, minWidth: TEMPLATE_ACTION_COLUMN_WIDTH, align: 'center' },
];

const auditFieldLabelMap: Record<string, string> = {
  code: '模板编码',
  name: '模板名称',
  templateCode: '模板编码',
  templateName: '模板名称',
  templateCategory: '模板分类',
  currentVersion: '当前版本',
  version: '版本号',
  effectiveFrom: '生效时间',
  effectiveTo: '失效时间',
  sourceFileName: '源文件名称',
  sourceFileType: '源文件类型',
  importStatus: '导入状态',
  categoryName: '分类名称',
  templateType: '模板类型',
  templateCount: '模板数量',
  description: '模板描述',
  status: '状态',
  sortOrder: '排序',
  createdBy: '创建人',
  createdAt: '创建时间',
  updatedBy: '更新人',
  updatedAt: '更新时间',
};

interface TemplateFormState {
  code: string;
  name: string;
  categoryName: string;
  description: string;
  versionDescription: string;
  version: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: string;
}

interface TemplateCategoryOption extends TemplateCategoryRecord {
  value: string;
  label: string;
  system: boolean;
}

interface TemplateAuditRecord {
  id: string;
  operatorName: string;
  actionLabel: string;
  operatedAt?: string;
  beforeFields: AuditFieldRow[];
  afterFields: AuditFieldRow[];
}

interface AuditFieldRow {
  label: string;
  value: string;
}

function emptyForm(categoryName = ''): TemplateFormState {
  return { code: '', name: '', categoryName, description: '', versionDescription: '', version: 'V1.0', effectiveFrom: defaultEffectiveFromValue(), effectiveTo: '', status: 'ACTIVE' };
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getStatusLabel(value?: string | null) {
  if (value === 'ACTIVE') return '启用';
  if (value === 'DISABLED') return '禁用';
  if (value === 'DRAFT') return '草稿';
  return value || '-';
}

function statusColor(value?: string | null) {
  if (value === 'ACTIVE') return { color: '#1f8f4d', bgcolor: '#f0f9eb', borderColor: '#b7eb8f' };
  if (value === 'DISABLED') return { color: '#c45656', bgcolor: '#fef0f0', borderColor: '#fab6b6' };
  return { color: '#606266', bgcolor: '#f5f7fa', borderColor: '#dcdfe6' };
}

function renderStatusBadge(value?: string | null) {
  const color = statusColor(value);
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: 1, height: 24, borderRadius: 1, border: '1px solid', fontSize: 12, ...color }}>
      {getStatusLabel(value)}
    </Box>
  );
}

function normalizeJson(value?: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getAuditActionLabel(action?: string) {
  if (action === 'CREATE') return '创建';
  if (action === 'UPDATE') return '更新';
  if (action === 'DELETE') return '删除';
  return action || '-';
}

function getAuditFieldLabel(field: string) {
  return auditFieldLabelMap[field] ?? field;
}

function formatAuditValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (field === 'status') return getStatusLabel(String(value));
  if (field === 'createdAt' || field === 'updatedAt' || field === 'effectiveFrom' || field === 'effectiveTo') return formatDateTime(String(value));
  if (Array.isArray(value)) return value.map((item) => formatAuditValue(field, item)).join('、');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function toAuditRows(content?: unknown) {
  return Object.entries(normalizeJson(content)).map(([field, value]) => ({
    field,
    label: getAuditFieldLabel(field),
    value: formatAuditValue(field, value),
  }));
}

function toAuditFields(content?: unknown): AuditFieldRow[] {
  return toAuditRows(content).map(({ label, value }) => ({ label, value }));
}

function getAuditRecords(events: AuditLogItem[] | undefined): TemplateAuditRecord[] {
  return (events ?? []).map((event) => ({
    id: String(event.id),
    operatorName: event.operatorDisplayName || event.operatorAccount || '-',
    actionLabel: event.actionLabel || getAuditActionLabel(event.action),
    operatedAt: event.operationTime || event.createdAt,
    beforeFields: toAuditFields(event.contentBefore),
    afterFields: toAuditFields(event.contentAfter),
  }));
}

function DetailSection({ title, children, sx, contentSx }: { title: string; children: ReactNode; sx?: object; contentSx?: object }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: '4px', overflow: 'hidden', ...sx }}>
      <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e4e7ed', bgcolor: '#f8fafc' }}>
        <Typography sx={{ fontWeight: 600, color: '#303133' }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 1.5, ...contentSx }}>{children}</Box>
    </Box>
  );
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.5 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: '#303133', wordBreak: 'break-word' }}>{children || '-'}</Typography>
    </Box>
  );
}

function AuditFieldBlock({ title, fields }: { title: string; fields: AuditFieldRow[] }) {
  return (
    <Box sx={{ border: '1px solid #e4e7ed', borderRadius: '4px', bgcolor: '#f8fafc', p: 1 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: '#606266', fontWeight: 600 }}>{title}</Typography>
      <Stack spacing={0.75}>
        {fields.length === 0 ? (
          <Typography variant="caption" sx={{ color: '#909399' }}>无</Typography>
        ) : fields.map((field) => (
          <Box key={field.label} sx={{ display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr)', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#606266' }}>{field.label}</Typography>
            <Typography variant="caption" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{field.value}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function isConcreteCategory(categoryId: string) {
  return categoryId !== TEMPLATE_CATEGORY_ALL && categoryId !== TEMPLATE_CATEGORY_UNCATEGORIZED;
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.includes(' ') ? value.replace(' ', 'T').slice(0, 16) : value.slice(0, 16);
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultEffectiveFromValue() {
  const today = new Date();
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T00:00`;
}

function parseEffectiveDate(value: string) {
  if (!value) return null;
  const date = new Date(value.includes(' ') ? value.replace(' ', 'T') : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateEffectiveDateRange(effectiveFrom: string, effectiveTo: string) {
  const start = parseEffectiveDate(effectiveFrom);
  const end = parseEffectiveDate(effectiveTo);
  return !start || !end || end.getTime() >= start.getTime();
}

function parseFieldCandidates(version?: TemplateVersionRecord | null): TemplateImportResponse['fieldCandidates'] {
  if (!version?.modelDesignJson) return [];
  try {
    const parsed = JSON.parse(version.modelDesignJson) as { fields?: TemplateImportResponse['fieldCandidates'] };
    return Array.isArray(parsed.fields) ? parsed.fields : [];
  } catch {
    return [];
  }
}

function resolveDesignerVersion(row: TemplateModelingRecord, version?: TemplateVersionRecord | null) {
  return version
    ?? row.currentVersion
    ?? row.versions?.find((candidate) => String(candidate.id) === String(row.currentVersionId))
    ?? (row.versions?.length === 1 ? row.versions[0] : null);
}

function getDesignerVersionId(record?: TemplateModelingRecord | null) {
  if (!record) return null;
  const version = resolveDesignerVersion(record, record.currentVersion);
  return version?.id ?? record.currentVersionId ?? null;
}

function emptyTemplateCanvasPage(): TemplateCanvasPage {
  return {
    id: 'page-1',
    pageNumber: 1,
    width: 595,
    height: 842,
    orientation: 'portrait',
    deskewApplied: false,
    background: null,
    layers: [],
  };
}

function emptyTemplateModelDesign(): TemplateModelDesign {
  return { schemaVersion: '1.0', fields: [] };
}

function emptyTemplateCanvasDesign(): TemplateCanvasDesign {
  return {
    schemaVersion: '1.0',
    strategy: '图层锚定+格式复刻',
    orientation: 'portrait',
    pages: [emptyTemplateCanvasPage()],
    interactiveFields: [],
    fieldBindings: [],
  };
}

function filePreviewPath(fileId: string | number) {
  return `/api/v1/files/${fileId}/preview`;
}

function getCanvasBackgroundFileId(page: TemplateCanvasPage) {
  const fileId = page.background?.fileId;
  return fileId === null || fileId === undefined || fileId === '' ? '' : String(fileId);
}

function getCanvasLayerFileId(layer: TemplateCanvasLayer) {
  const fileId = layer.type === 'image' ? layer.fileId : null;
  return fileId === null || fileId === undefined || fileId === '' ? '' : String(fileId);
}

function resolveCanvasBackgroundSrc(page: TemplateCanvasPage, backgroundObjectUrls: Record<string, string>) {
  const objectUrl = backgroundObjectUrls[getCanvasBackgroundFileId(page)] || '';
  const fallbackUrl = page.background?.url || '';
  return objectUrl || fallbackUrl;
}

async function fetchAuthenticatedTemplateFileBlob(fileUrl: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(fileUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    let message = '表单模板背景获取失败';
    try {
      const responseText = await response.text();
      if (responseText) {
        const parsed = JSON.parse(responseText) as { message?: string; detail?: string; error?: string };
        message = parsed.message || parsed.detail || parsed.error || responseText;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }
    throw new Error(message);
  }
  return response.blob();
}

function normalizeInteractiveField(field: Partial<TemplateInteractiveField>, index: number): TemplateInteractiveField {
  const code = field.code || `field_${index + 1}`;
  const normalizedType = field.type || typeForComponent(field.component || field.binding?.component);
  const normalizedComponent = field.component || field.binding?.component || componentForTemplateFieldType(normalizedType);
  return {
    id: field.id || code,
    code,
    name: field.name || code,
    type: normalizedType,
    required: Boolean(field.required),
    pageId: field.pageId || 'page-1',
    x: Number.isFinite(field.x ?? NaN) ? Number(field.x) : 96,
    y: Number.isFinite(field.y ?? NaN) ? Number(field.y) : 128 + index * 42,
    width: Number.isFinite(field.width ?? NaN) ? Number(field.width) : 160,
    height: Number.isFinite(field.height ?? NaN) ? Number(field.height) : 28,
    fontFamily: field.fontFamily || 'default',
    fontSize: Number.isFinite(field.fontSize ?? NaN) ? Number(field.fontSize) : 12,
    textAlign: field.textAlign || 'left',
    component: normalizedComponent,
    fillable: field.fillable ?? field.binding?.fillable ?? true,
    draggable: field.draggable ?? true,
    resizable: field.resizable ?? true,
    anchor: field.anchor,
    validation: field.validation,
    dataBinding: field.dataBinding,
    binding: field.binding ? { ...field.binding, component: field.binding.component || normalizedComponent } : { fillable: true, component: normalizedComponent },
    sourceText: field.sourceText,
    keyText: field.keyText,
    valueText: field.valueText,
    semanticRole: field.semanticRole,
    pairing: field.pairing,
    sourceCandidateId: field.sourceCandidateId,
  };
}

function parseTemplateModelDesign(version?: TemplateVersionRecord | null): TemplateModelDesign {
  if (!version?.modelDesignJson) return emptyTemplateModelDesign();
  try {
    const parsed = JSON.parse(version.modelDesignJson) as Partial<TemplateModelDesign>;
    const fields = Array.isArray(parsed.fields) ? parsed.fields.map((field, index) => normalizeInteractiveField(field, index)) : [];
    return { schemaVersion: parsed.schemaVersion || '1.0', source: parsed.source, analysisDraft: parsed.analysisDraft, analysis: parsed.analysis, fields };
  } catch {
    return emptyTemplateModelDesign();
  }
}

function parseTemplateCanvasDesign(version?: TemplateVersionRecord | null): TemplateCanvasDesign {
  if (!version?.canvasDesignJson) return emptyTemplateCanvasDesign();
  try {
    const parsed = JSON.parse(version.canvasDesignJson) as Partial<TemplateCanvasDesign>;
    const pages = Array.isArray(parsed.pages) && parsed.pages.length > 0 ? parsed.pages : [emptyTemplateCanvasPage()];
    const interactiveFields = Array.isArray(parsed.interactiveFields)
      ? parsed.interactiveFields.map((field, index) => normalizeInteractiveField(field, index))
      : parseTemplateModelDesign(version).fields;
    return {
      schemaVersion: parsed.schemaVersion || '1.0',
      strategy: parsed.strategy || '图层锚定+格式复刻',
      coordinateSystem: parsed.coordinateSystem,
      editorCapabilities: parsed.editorCapabilities,
      orientation: parsed.orientation || pages[0]?.orientation || 'portrait',
      source: parsed.source,
      pages,
      interactiveFields,
      fieldBindings: Array.isArray(parsed.fieldBindings) ? parsed.fieldBindings : [],
      fillRuntime: parsed.fillRuntime,
    };
  } catch {
    return emptyTemplateCanvasDesign();
  }
}

function syncTemplateCanvasFieldBindings(canvasDesign: TemplateCanvasDesign, fallbackFields: TemplateInteractiveField[]): TemplateCanvasDesign {
  const interactiveFields = canvasDesign.interactiveFields.length > 0 ? canvasDesign.interactiveFields : fallbackFields;
  const existingBindingsByFieldId = new Map((canvasDesign.fieldBindings ?? [])
    .map((binding) => [String(binding.fieldId ?? ''), binding] as const)
    .filter(([fieldId]) => Boolean(fieldId)));
  const fieldBindings = interactiveFields.map((field) => {
    const existingBinding = existingBindingsByFieldId.get(field.id) ?? {};
    return {
      ...existingBinding,
      fieldId: field.id,
      fieldCode: field.code,
      pageId: field.pageId,
      valuePath: field.dataBinding?.valuePath ?? `fields.${field.code}`,
      submissionPath: field.dataBinding?.submissionPath ?? `submission.fields.${field.code}`,
    };
  });
  return { ...canvasDesign, interactiveFields, fieldBindings };
}

function coordinatePercent(value: number | undefined, total: number | undefined) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || !total) return '0%';
  return `${Math.max(0, (Number(value) / Number(total)) * 100)}%`;
}

function dimensionPercent(value: number | undefined, total: number | undefined) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || !total) return '1%';
  return `${Math.max(1, (Number(value) / Number(total)) * 100)}%`;
}

function isExcelCanvasPage(source?: TemplateCanvasSource | null) {
  const fileType = String(source?.fileType ?? '').toLowerCase();
  return ['xls', 'xlsx'].includes(fileType);
}

function resolveTemplateCanvasPageWidth(canvasPage: TemplateCanvasPage, source?: TemplateCanvasSource | null) {
  const fallbackWidth = canvasPage.orientation === 'landscape' ? 980 : 760;
  const coordinateWidth = Number(canvasPage.width || 0);
  const minimumWidth = isExcelCanvasPage(source) ? TEMPLATE_EXCEL_CANVAS_MIN_VISUAL_WIDTH : fallbackWidth;
  if (!Number.isFinite(coordinateWidth) || coordinateWidth <= minimumWidth) return minimumWidth;
  return Math.min(coordinateWidth, TEMPLATE_CANVAS_MAX_VISUAL_WIDTH);
}

function clampCanvasPosition(value: number, size: number | undefined, total: number | undefined) {
  const max = Math.max(0, Number(total || 0) - Number(size || 0));
  return Math.min(Math.max(0, value), max);
}

function createCanvasElementId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function resolveUniqueTemplateFieldCode(baseCode: string, existingCodes: Set<string>) {
  const candidateCode = baseCode.trim() || 'field';
  if (!existingCodes.has(candidateCode)) return candidateCode;
  let suffix = 2;
  while (existingCodes.has(`${candidateCode}_${suffix}`)) suffix += 1;
  return `${candidateCode}_${suffix}`;
}

function parseCanvasNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCanvasDimension(value: string) {
  const parsed = parseCanvasNumber(value);
  return parsed === null ? null : Math.max(1, parsed);
}

function componentForTemplateFieldType(type?: string) {
  if (type === 'datetime') return 'DateTimePicker';
  if (type === 'number') return 'NumberInput';
  if (type === 'signature') return 'SignaturePad';
  if (type === 'textarea') return 'TextArea';
  return 'TextInput';
}

function typeForComponent(component?: string) {
  if (component === 'DateTimePicker') return 'datetime';
  if (component === 'NumberInput') return 'number';
  if (component === 'SignaturePad') return 'signature';
  if (component === 'TextArea') return 'textarea';
  return 'text';
}

function renderTemplateInteractiveFieldControl(field: TemplateInteractiveField, previewValue: string, onPreviewValueChange: (value: string) => void) {
  const component = field.component || field.binding?.component || componentForTemplateFieldType(field.type);
  const label = field.name || field.code;
  const inputSx = {
    width: '100%',
    height: '100%',
    '& .MuiInputBase-root': { height: '100%', minHeight: 0, fontSize: 12, bgcolor: '#fff' },
    '& .MuiInputBase-input': { p: '2px 6px', boxSizing: 'border-box' },
    '& textarea.MuiInputBase-input': { p: '4px 6px' },
  };
  const stopPreviewPointer = (event: ReactPointerEvent) => event.stopPropagation();
  const sharedSx = {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    fontSize: 12,
    lineHeight: 1.2,
  };
  if (component === 'SignaturePad') {
    return (
      <Box
        data-form-template-field-control
        data-form-template-field-signature-pad
        onPointerDown={stopPreviewPointer}
        onClick={(event) => event.stopPropagation()}
        sx={{ ...sharedSx, alignItems: 'flex-end', px: 0.75, pb: 0.35, bgcolor: '#fff', color: '#606266' }}
      >
        <Box
          role="button"
          tabIndex={0}
          onClick={() => onPreviewValueChange(previewValue ? '' : label)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onPreviewValueChange(previewValue ? '' : label);
          }}
          sx={{ width: '100%', borderBottom: '1px solid #909399', fontStyle: 'italic', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', cursor: 'text' }}
        >
          {previewValue || label}
        </Box>
      </Box>
    );
  }
  if (component === 'TextArea') {
    return (
      <TextField
        data-form-template-field-control
        data-form-template-field-textarea
        value={previewValue}
        placeholder={label}
        onChange={(event) => onPreviewValueChange(event.target.value)}
        onPointerDown={stopPreviewPointer}
        onClick={(event) => event.stopPropagation()}
        multiline
        minRows={1}
        variant="outlined"
        sx={inputSx}
      />
    );
  }
  if (component === 'DateTimePicker') {
    return (
      <TextField
        data-form-template-field-control
        data-form-template-field-datetime
        value={previewValue}
        placeholder={label}
        onChange={(event) => onPreviewValueChange(event.target.value)}
        onPointerDown={stopPreviewPointer}
        onClick={(event) => event.stopPropagation()}
        type="datetime-local"
        variant="outlined"
        sx={inputSx}
      />
    );
  }
  if (component === 'NumberInput') {
    return (
      <TextField
        data-form-template-field-control
        data-form-template-field-number
        value={previewValue}
        placeholder={label}
        onChange={(event) => onPreviewValueChange(event.target.value)}
        onPointerDown={stopPreviewPointer}
        onClick={(event) => event.stopPropagation()}
        type="number"
        variant="outlined"
        sx={inputSx}
      />
    );
  }
  return (
    <TextField
      data-form-template-field-control
      data-form-template-field-text
      value={previewValue}
      placeholder={label}
      onChange={(event) => onPreviewValueChange(event.target.value)}
      onPointerDown={stopPreviewPointer}
      onClick={(event) => event.stopPropagation()}
      variant="outlined"
      sx={inputSx}
    />
  );
}

const analysisCandidateToFieldCandidate = (candidate: TemplateAnalysisCandidate): TemplateImportResponse['fieldCandidates'][number] => ({
  id: candidate.id,
  code: candidate.fieldCode,
  name: candidate.fieldName,
  type: typeForComponent(candidate.suggestedComponent),
  required: candidate.required ?? false,
  status: candidate.status,
  suggestedAction: candidate.suggestedAction,
  suggestedComponent: candidate.suggestedComponent,
  pageId: candidate.pageId,
  valueAnchor: candidate.valueAnchor,
  sourceText: candidate.sourceText,
  keyText: candidate.keyText,
  valueText: candidate.valueText,
  semanticRole: candidate.semanticRole,
  pairing: candidate.pairing,
  reason: candidate.reason,
  confidence: candidate.confidence,
});

const candidateDecisionToFieldCandidate = (candidate: TemplateAnalysisCandidate, decision?: TemplateCandidateDecisionItem): TemplateImportResponse['fieldCandidates'][number] => ({
  ...analysisCandidateToFieldCandidate(candidate),
  code: decision?.fieldCode ?? candidate.fieldCode,
  name: decision?.fieldName ?? candidate.fieldName,
  type: typeForComponent(decision?.component ?? candidate.suggestedComponent),
  required: decision?.required ?? candidate.required ?? false,
  suggestedAction: decision?.action ?? candidate.suggestedAction,
  suggestedComponent: decision?.component ?? candidate.suggestedComponent,
});

const candidateDecisionToStaticTextLayer = (candidate: TemplateAnalysisCandidate, decision?: TemplateCandidateDecisionItem): TemplateCanvasLayer => {
  const anchor = candidate.valueAnchor ?? { x: 96, y: 144, width: 180, height: 28 };
  const text = candidate.sourceText || decision?.fieldName || candidate.fieldName;
  return {
    id: `static-candidate-${candidate.id}`,
    type: 'text',
    text,
    x: anchor.x,
    y: anchor.y,
    width: Math.max(anchor.width, 48),
    height: Math.max(anchor.height, 20),
    fontSize: 12,
    textAlign: 'left',
    selectable: true,
    draggable: true,
    zIndex: 3,
    sourceCandidateId: candidate.id,
    sourceType: 'analysis-candidate',
    confidence: candidate.confidence,
  };
};

function analysisDraftFromImport(result: TemplateImportResponse): TemplateAnalysisDraft | null {
  if (result.analysisDraft) return result.analysisDraft;
  const parsedCanvas = result.canvasDesign ?? parseTemplateCanvasDesign(result.version);
  const parsedModel = result.modelDesign ?? parseTemplateModelDesign(result.version);
  const analysisId = String(parsedModel.analysisDraft?.analysisId ?? '');
  if (!analysisId && result.fieldCandidates.length === 0) return null;
  return {
    schemaVersion: '1.0',
    analysisId,
    source: parsedCanvas.source ?? parsedModel.source,
    pages: parsedCanvas.pages.map((pageItem) => ({
      id: pageItem.id,
      pageNumber: pageItem.pageNumber,
      width: pageItem.width,
      height: pageItem.height,
      orientation: pageItem.orientation || (pageItem.width >= pageItem.height ? 'landscape' : 'portrait'),
      background: pageItem.background,
      layerSummary: pageItem.layerSummary,
    })),
    blocks: [],
    candidates: result.fieldCandidates.map((candidate, index) => ({
      id: candidate.id || candidate.code || `candidate-${index + 1}`,
      status: candidate.status || 'pending',
      suggestedAction: candidate.suggestedAction || 'component',
      suggestedComponent: candidate.suggestedComponent || componentForTemplateFieldType(candidate.type),
      fieldCode: candidate.code,
      fieldName: candidate.name,
      required: candidate.required,
      pageId: candidate.pageId || parsedCanvas.pages[0]?.id || 'page-1',
      valueAnchor: candidate.valueAnchor || { x: 96, y: 128 + index * 36, width: 168, height: 30 },
      sourceText: candidate.sourceText || candidate.name,
      keyText: candidate.keyText || candidate.name,
      valueText: candidate.valueText || '',
      semanticRole: candidate.semanticRole || (candidate.suggestedAction === 'staticText' ? 'staticText' : 'keyValue'),
      pairing: candidate.pairing,
      reason: candidate.reason || '解析生成的字段候选',
      confidence: candidate.confidence ?? 0.7,
    })),
  };
}

function getPendingAnalysisDraftId(modelDesign: TemplateModelDesign) {
  const draft = modelDesign.analysisDraft;
  if (!draft?.analysisId || draft.status === 'CONFIRMED') return '';
  return String(draft.analysisId);
}

function layerBorderStyle(style?: string) {
  if (!style || style === 'none') return 'none';
  return style === 'dashed' ? '1px dashed' : '1px solid';
}

function layerBorder(border?: string, color = '#dcdfe6') {
  const style = layerBorderStyle(border);
  return style === 'none' ? 'none' : `${style} ${color}`;
}

function layerAlignItems(verticalAlign?: string) {
  if (verticalAlign === 'top') return 'flex-start';
  if (verticalAlign === 'middle' || verticalAlign === 'center') return 'center';
  return 'flex-end';
}

function shapeBorderRadius(shapeType?: string) {
  if (shapeType === 'ELLIPSE') return '50%';
  if (shapeType?.includes('ROUND')) return 8;
  return 0;
}

function renderTemplateCanvasLayer(
  layer: TemplateCanvasLayer,
  canvasPage: TemplateCanvasPage,
  assetObjectUrls: Record<string, string>,
  selected: boolean,
  onSelect: () => void,
  onPointerDown: (event: ReactPointerEvent) => void,
) {
  const selectable = layer.selectable !== false;
  const draggable = layer.draggable !== false;
  const baseSx = {
    position: 'absolute',
    left: coordinatePercent(layer.x, canvasPage.width),
    top: coordinatePercent(layer.y, canvasPage.height),
    width: dimensionPercent(layer.width, canvasPage.width),
    height: dimensionPercent(layer.height, canvasPage.height),
    pointerEvents: selectable ? 'auto' : 'none',
    boxSizing: 'border-box',
    cursor: draggable ? 'move' : 'default',
    zIndex: layer.zIndex ?? 1,
    ...(selected ? { outline: '2px solid #409eff', outlineOffset: 1, boxShadow: '0 0 0 2px rgba(64, 158, 255, 0.16)' } : {}),
  };
  const eventProps = {
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      onSelect();
    },
    onPointerDown: (event: ReactPointerEvent) => {
      event.stopPropagation();
      onSelect();
      if (draggable) onPointerDown(event);
    },
  };
  if (layer.type === 'table') {
    const rows = Math.max(1, layer.rows || 1);
    const columns = Math.max(1, layer.columns || 1);
    const showGrid = layer.showGrid !== false;
    return (
      <Box
        key={layer.id}
        data-form-template-table-layer
        data-form-template-selected-layer={selected ? true : undefined}
        {...eventProps}
        sx={{
          ...baseSx,
          border: `${layer.borderWidth || 1}px ${layer.borderStyle || 'solid'} ${layer.borderColor || '#dcdfe6'}`,
          bgcolor: 'transparent',
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(1, layer.columns || 1)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${Math.max(1, layer.rows || 1)}, minmax(0, 1fr))`,
          overflow: 'hidden',
        }}
      >
        {showGrid && Array.from({ length: rows * columns }).map((_, index) => (
          <Box
            key={index}
            data-form-template-table-grid-cell
            sx={{
              borderRight: (index + 1) % columns === 0 ? 'none' : `1px solid ${layer.borderColor || '#dcdfe6'}`,
              borderBottom: index >= columns * (rows - 1) ? 'none' : `1px solid ${layer.borderColor || '#dcdfe6'}`,
              boxSizing: 'border-box',
              minWidth: 0,
              minHeight: 0,
            }}
          />
        ))}
      </Box>
    );
  }
  if (layer.type === 'cell') {
    return (
      <Box
        key={layer.id}
        data-form-template-cell-layer
        data-form-template-selected-layer={selected ? true : undefined}
        {...eventProps}
        sx={{
          ...baseSx,
          display: 'flex',
          alignItems: layerAlignItems(layer.verticalAlign),
          justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start',
          px: 0.5,
          color: '#303133',
          bgcolor: layer.backgroundColor && layer.backgroundColor !== 'transparent' ? layer.backgroundColor : 'transparent',
          fontFamily: layer.fontFamily || 'inherit',
          fontSize: layer.fontSize || 12,
          fontWeight: layer.fontWeight || 'normal',
          fontStyle: layer.fontStyle || 'normal',
          textAlign: layer.textAlign || 'left',
          lineHeight: 1.2,
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          borderTop: layerBorder(layer.borderTop, layer.borderColor),
          borderRight: layerBorder(layer.borderRight, layer.borderColor),
          borderBottom: layerBorder(layer.borderBottom, layer.borderColor),
          borderLeft: layerBorder(layer.borderLeft, layer.borderColor),
        }}
      >
        {layer.text}
      </Box>
    );
  }
  if (layer.type === 'line') {
    const isVerticalLine = Number(layer.height || 0) > Number(layer.width || 0);
    return (
      <Box
        key={layer.id}
        data-form-template-line-layer
        data-form-template-selected-layer={selected ? true : undefined}
        {...eventProps}
        sx={{
          ...baseSx,
          borderTop: isVerticalLine ? 'none' : `${layer.borderWidth || 1}px ${layer.borderStyle || 'solid'} ${layer.borderColor || '#303133'}`,
          borderLeft: isVerticalLine ? `${layer.borderWidth || 1}px ${layer.borderStyle || 'solid'} ${layer.borderColor || '#303133'}` : 'none',
          bgcolor: 'transparent',
        }}
      />
    );
  }
  if (layer.type === 'shape') {
    return (
      <Box
        key={layer.id}
        data-form-template-shape-layer
        data-form-template-selected-layer={selected ? true : undefined}
        {...eventProps}
        sx={{
          ...baseSx,
          bgcolor: layer.backgroundColor && layer.backgroundColor !== 'transparent' ? layer.backgroundColor : 'transparent',
          border: `${layer.borderWidth || 1}px ${layer.borderStyle || 'solid'} ${layer.borderColor || '#dcdfe6'}`,
          borderRadius: shapeBorderRadius(layer.shapeType),
        }}
      />
    );
  }
  if (layer.type === 'image') {
    const imageFileId = getCanvasLayerFileId(layer);
    const imageSrc = (imageFileId && assetObjectUrls[imageFileId]) || layer.url || '';
    return (
      <Box
        key={layer.id}
        component="img"
        alt={layer.text || '导入图片'}
        src={imageSrc}
        data-form-template-image-layer
        data-form-template-selected-layer={selected ? true : undefined}
        {...eventProps}
        sx={{
          ...baseSx,
          display: 'block',
          objectFit: layer.objectFit || 'fill',
          opacity: layer.opacity ?? 1,
          transform: `rotate(${layer.rotation || 0}deg)`,
          transformOrigin: 'center center',
          border: selected ? 'none' : `${layer.borderWidth || 0}px ${layer.borderStyle || 'solid'} ${layer.borderColor || 'transparent'}`,
          userSelect: 'none',
        }}
      />
    );
  }
  return (
    <Box
      key={layer.id}
      data-form-template-text-layer
      data-form-template-static-candidate-layer={layer.sourceCandidateId ? true : undefined}
      data-form-template-selected-layer={selected ? true : undefined}
      {...eventProps}
      sx={{
        ...baseSx,
        color: '#303133',
        fontFamily: layer.fontFamily || 'inherit',
        fontSize: layer.fontSize || 12,
        fontWeight: layer.fontWeight || 'normal',
        fontStyle: layer.fontStyle || 'normal',
        textAlign: layer.textAlign || 'left',
        lineHeight: 1.3,
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
      }}
    >
      {layer.text}
    </Box>
  );
}

const fieldSx = {
  '& .MuiInputBase-root': { height: 40 },
  '& .MuiInputBase-input': { boxSizing: 'border-box' },
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
  height: TABLE_DATA_ROW_HEIGHT,
  lineHeight: '20px',
  py: 0,
  borderBottom: 'none',
  boxShadow: 'inset 0 -1px 0 #ebeef5',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const emptyTableBodyCellSx = {
  height: '100%',
  py: 0,
  borderBottom: '1px solid #ebeef5',
  color: '#909399',
};

const emptyTableRowSx = { height: '100%' };

function getCurrentUserPreferenceStorageKey(prefix: string, pageKey: string) {
  if (typeof window === 'undefined') return `${prefix}${pageKey}:anonymous`;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null') as { id?: string | number; username?: string; displayName?: string } | null;
    return `${prefix}${pageKey}:${user?.id ?? user?.username ?? user?.displayName ?? 'anonymous'}`;
  } catch {
    return `${prefix}${pageKey}:anonymous`;
  }
}

function isConfigurableColumn(column: TemplateColumn): column is TemplateColumn & { id: ConfigurableTemplateColumnId } {
  return column.id !== 'actions';
}

function normalizeColumnSettings(columns: TemplateColumn[], raw?: Partial<TemplateColumnSettings> | null): TemplateColumnSettings {
  const defaults = columns.filter(isConfigurableColumn).map((column) => column.id);
  if (!raw || raw.version !== TEMPLATE_COLUMN_SETTINGS_VERSION) {
    return { version: TEMPLATE_COLUMN_SETTINGS_VERSION, order: defaults, hidden: [] };
  }
  const seen = new Set<ConfigurableTemplateColumnId>();
  const order = [
    ...(raw.order ?? []).filter((id): id is ConfigurableTemplateColumnId => defaults.includes(id) && !seen.has(id) && (seen.add(id), true)),
    ...defaults.filter((id) => !seen.has(id)),
  ];
  const hidden = (raw.hidden ?? []).filter((id): id is ConfigurableTemplateColumnId => defaults.includes(id) && order.includes(id));
  return { version: TEMPLATE_COLUMN_SETTINGS_VERSION, order, hidden: hidden.length >= order.length ? hidden.slice(1) : hidden };
}

function pickTemplatePayload(input: TemplateModelingPayload, fieldIds: Array<keyof TemplateModelingPayload>) {
  return fieldIds.reduce<TemplateModelingPayload>((payload, fieldId) => {
    if (fieldId in input) {
      return { ...payload, [fieldId]: input[fieldId] };
    }
    return payload;
  }, {} as TemplateModelingPayload);
}

function loadColumnSettings(storageKey: string, columns: TemplateColumn[]): TemplateColumnSettings {
  if (typeof window === 'undefined') return normalizeColumnSettings(columns);
  try {
    return normalizeColumnSettings(columns, JSON.parse(localStorage.getItem(storageKey) || 'null'));
  } catch {
    return normalizeColumnSettings(columns);
  }
}

function loadColumnWidths(storageKey: string): TemplateColumnWidths {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function getColumnSettingsItems(columns: TemplateColumn[], settings: TemplateColumnSettings) {
  const byId = new Map(columns.filter(isConfigurableColumn).map((column) => [column.id, column]));
  return settings.order.map((id) => byId.get(id)).filter((column): column is TemplateColumn & { id: ConfigurableTemplateColumnId } => Boolean(column));
}

function getVisibleColumns(columns: TemplateColumn[], settings: TemplateColumnSettings): TemplateColumn[] {
  const actionColumn = columns.find((column) => column.id === 'actions');
  const visibleDataColumns = getColumnSettingsItems(columns, settings).filter((column) => !settings.hidden.includes(column.id));
  return [...visibleDataColumns, actionColumn].filter((column): column is TemplateColumn => Boolean(column));
}

function resolveColumnWidths(widths: TemplateColumnWidths, containerWidth: number, visibleColumns: TemplateColumn[]) {
  const result: Record<TemplateColumnId, number> = {} as Record<TemplateColumnId, number>;
  let total = 0;
  visibleColumns.forEach((column) => {
    const width = column.resizable ? Math.max(column.minWidth, widths[column.id] ?? column.defaultWidth) : Math.max(column.minWidth, column.defaultWidth);
    result[column.id] = width;
    total += width;
  });
  if (containerWidth > total) {
    const flexibleColumns = visibleColumns.filter((column) => column.resizable);
    const extra = flexibleColumns.length ? Math.floor((containerWidth - total) / flexibleColumns.length) : 0;
    flexibleColumns.forEach((column) => {
      result[column.id] += extra;
    });
  }
  return result;
}

export default function TemplateModelingPage({ pageKey }: { pageKey: TemplateModelingPageKey }) {
  const config = TEMPLATE_MODELING_PAGE_CONFIGS[pageKey];
  const allColumns = pageKey === 'formTemplates' ? formTemplateColumns : batchTemplateColumns;
  const queryClient = useQueryClient();
  const [nameKeyword, setNameKeyword] = useState('');
  const [codeKeyword, setCodeKeyword] = useState('');
  const [status, setStatus] = useState('ALL');
  const [categoryId, setCategoryId] = useState(TEMPLATE_CATEGORY_ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [tableContainerWidth, setTableContainerWidth] = useState(0);
  const columnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(TEMPLATE_COLUMN_WIDTH_STORAGE_PREFIX, pageKey), [pageKey]);
  const columnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(TEMPLATE_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);
  const templateVersionColumnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(TEMPLATE_VERSION_COLUMN_WIDTH_STORAGE_PREFIX, pageKey), [pageKey]);
  const templateVersionColumnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(TEMPLATE_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);
  const [columnWidths, setColumnWidths] = useState<TemplateColumnWidths>(() => loadColumnWidths(columnWidthStorageKey));
  const [columnSettings, setColumnSettings] = useState<TemplateColumnSettings>(() => loadColumnSettings(columnSettingsStorageKey, allColumns));
  const [templateVersionColumnWidths, setTemplateVersionColumnWidths] = useState<TemplateColumnWidths>(() => loadColumnWidths(templateVersionColumnWidthStorageKey));
  const [templateVersionColumnSettings, setTemplateVersionColumnSettings] = useState<TemplateColumnSettings>(() => loadColumnSettings(templateVersionColumnSettingsStorageKey, templateVersionColumns));
  const [columnSettingsAnchorEl, setColumnSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [columnSettingsTab, setColumnSettingsTab] = useState<TemplateColumnSettingsTarget>('main');
  const [draggingColumnId, setDraggingColumnId] = useState<ConfigurableTemplateColumnId | null>(null);
  const columnSettingDragSourceRef = useRef<ConfigurableTemplateColumnId | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TemplateModelingRecord | null>(null);
  const [creatingVersionFrom, setCreatingVersionFrom] = useState<TemplateModelingRecord | null>(null);
  const [form, setForm] = useState<TemplateFormState>(() => emptyForm());
  const effectiveFromInputRef = useRef<HTMLInputElement | null>(null);
  const effectiveToInputRef = useRef<HTMLInputElement | null>(null);
  const templateSourceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; target: TemplateCategoryRecord | null; name: string }>({ open: false, target: null, name: '' });
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<TemplateCategoryRecord | null>(null);
  const [deleteRowTarget, setDeleteRowTarget] = useState<TemplateModelingRecord | null>(null);
  const [deleteVersionTarget, setDeleteVersionTarget] = useState<{ row: TemplateModelingRecord; version: TemplateVersionRecord } | null>(null);
  const [drawerRow, setDrawerRow] = useState<TemplateModelingRecord | null>(null);
  const [drawerVersionRow, setDrawerVersionRow] = useState<TemplateVersionRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState(0);
  const [designerRecord, setDesignerRecord] = useState<TemplateModelingRecord | null>(null);
  const [pageThumbnailsOpen, setPageThumbnailsOpen] = useState(true);
  const [pageThumbnailWidth, setPageThumbnailWidth] = useState(150);
  const [activeCanvasPageId, setActiveCanvasPageId] = useState<string | null>(null);
  const [fieldCandidates, setFieldCandidates] = useState<TemplateImportResponse['fieldCandidates']>([]);
  const [analysisDraft, setAnalysisDraft] = useState<TemplateAnalysisDraft | null>(null);
  const [candidateDecisions, setCandidateDecisions] = useState<Record<string, TemplateCandidateDecisionItem>>({});
  const [selectedAnalysisCandidateId, setSelectedAnalysisCandidateId] = useState<string | null>(null);
  const [templateModelDesign, setTemplateModelDesign] = useState<TemplateModelDesign>(() => emptyTemplateModelDesign());
  const [templateCanvasDesign, setTemplateCanvasDesign] = useState<TemplateCanvasDesign>(() => emptyTemplateCanvasDesign());
  const [fieldPreviewValues, setFieldPreviewValues] = useState<Record<string, string>>({});
  const [selectedCanvasTarget, setSelectedCanvasTarget] = useState<TemplateCanvasTarget | null>(null);
  const [templateImportRevision, setTemplateImportRevision] = useState(0);
  const [backgroundObjectUrls, setBackgroundObjectUrls] = useState<Record<string, string>>({});
  const templateImportSequenceRef = useRef(0);
  const templateImportSnapshotRef = useRef<{ sequence: number; snapshot: TemplateDesignerSnapshot } | null>(null);
  const analysisDraftRestoreSequenceRef = useRef(0);
  const [onlyOfficeDialog, setOnlyOfficeDialog] = useState<{ open: boolean; config: OnlyOfficeEditorConfig | null }>({ open: false, config: null });
  const [onlyOfficeEditorState, setOnlyOfficeEditorState] = useState<OnlyOfficeEditorState>({ status: 'idle' });
  const onlyOfficeContainerRef = useRef<HTMLDivElement | null>(null);
  const onlyOfficeEditorRef = useRef<{ destroyEditor?: () => void } | null>(null);
  const [draggingCategoryId, setDraggingCategoryId] = useState('');
  const [expandedTemplateGroups, setExpandedTemplateGroups] = useState<Set<string>>(() => new Set());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({ open: false, message: '', severity: 'success' });

  const categoryQuery = useQuery({
    queryKey: [config.categoryQueryKey],
    queryFn: async () => {
      const res = await getTemplateModelingCategories(pageKey);
      return res.data.data.map((category) => ({
        ...category,
        system: category.id === TEMPLATE_CATEGORY_ALL || category.id === TEMPLATE_CATEGORY_UNCATEGORIZED,
      }));
    },
  });

  const categories = categoryQuery.data ?? [];

  const listQuery = useQuery({
    queryKey: [config.queryKey, page, pageSize, nameKeyword, codeKeyword, status, categoryId],
    queryFn: async () => {
      const res = await config.listAction({
        page,
        size: pageSize,
        name: nameKeyword.trim() || undefined,
        code: codeKeyword.trim() || undefined,
        status: status === 'ALL' ? undefined : status,
        categoryName: categoryId === TEMPLATE_CATEGORY_UNCATEGORIZED ? TEMPLATE_CATEGORY_UNCATEGORIZED : isConcreteCategory(categoryId) ? categoryId : undefined,
      });
      return res.data.data;
    },
  });

  const auditQuery = useQuery({
    queryKey: [config.auditQueryKey, drawerVersionRow ? 'FORM_TEMPLATE_VERSION' : config.entityType, drawerVersionRow?.id ?? drawerRow?.id],
    enabled: drawerRow !== null,
    queryFn: async () => {
      const res = await getAuditLogs({ entityType: drawerVersionRow ? 'FORM_TEMPLATE_VERSION' : config.entityType, entityId: drawerVersionRow?.id ?? drawerRow?.id, page: 1, size: 50 });
      return (res.data.data as PageResult<AuditLogItem>).content ?? [];
    },
  });

  const rows = listQuery.data?.content ?? [];
  const isTableEmptyState = listQuery.isLoading || listQuery.isError || rows.length === 0;
  const columnSettingsItems = useMemo(() => getColumnSettingsItems(allColumns, columnSettings), [allColumns, columnSettings]);
  const visibleColumns = useMemo(() => getVisibleColumns(allColumns, columnSettings), [allColumns, columnSettings]);
  const visibleConfigurableColumnCount = columnSettings.order.length - columnSettings.hidden.length;
  const resolvedColumnWidths = useMemo(() => resolveColumnWidths(columnWidths, tableContainerWidth, visibleColumns), [columnWidths, tableContainerWidth, visibleColumns]);
  const totalTableWidth = visibleColumns.reduce((sum, column) => sum + resolvedColumnWidths[column.id], 0);
  const templateVersionColumnSettingsItems = useMemo(() => getColumnSettingsItems(templateVersionColumns, templateVersionColumnSettings), [templateVersionColumnSettings]);
  const visibleTemplateVersionColumns = useMemo(() => getVisibleColumns(templateVersionColumns, templateVersionColumnSettings), [templateVersionColumnSettings]);
  const visibleTemplateVersionConfigurableColumnCount = templateVersionColumnSettings.order.length - templateVersionColumnSettings.hidden.length;
  const activeColumnSettings = columnSettingsTab === 'version' ? templateVersionColumnSettings : columnSettings;
  const activeColumnSettingsItems = columnSettingsTab === 'version' ? templateVersionColumnSettingsItems : columnSettingsItems;
  const activeVisibleConfigurableColumnCount = columnSettingsTab === 'version' ? visibleTemplateVersionConfigurableColumnCount : visibleConfigurableColumnCount;
  const setActiveColumnSettings = columnSettingsTab === 'version' ? setTemplateVersionColumnSettings : setColumnSettings;
  const resolvedTemplateVersionColumnWidths = useMemo(() => resolveColumnWidths(templateVersionColumnWidths, totalTableWidth, visibleTemplateVersionColumns), [templateVersionColumnWidths, totalTableWidth, visibleTemplateVersionColumns]);
  const totalTemplateVersionTableWidth = visibleTemplateVersionColumns.reduce((sum, column) => sum + resolvedTemplateVersionColumnWidths[column.id], 0);
  const effectiveMainTableWidth = Math.max(totalTableWidth, pageKey === 'formTemplates' ? totalTemplateVersionTableWidth : totalTableWidth);
  const mainTableSpacerWidth = Math.max(0, effectiveMainTableWidth - totalTableWidth);
  const hasMainTableSpacer = mainTableSpacerWidth > 0;
  const mainTableColSpan = visibleColumns.length + (hasMainTableSpacer ? 1 : 0);
  const pageCount = Math.max(1, listQuery.data?.totalPages ?? Math.ceil((listQuery.data?.totalElements ?? 0) / pageSize));
  const totalElements = listQuery.data?.totalElements ?? 0;
  const templateCanvasPages = templateCanvasDesign.pages.length > 0 ? templateCanvasDesign.pages : [emptyTemplateCanvasPage()];
  const activeCanvasPage = templateCanvasPages.find((pageItem) => pageItem.id === activeCanvasPageId) ?? templateCanvasPages[0] ?? emptyTemplateCanvasPage();
  const interactiveFields = templateCanvasDesign.interactiveFields.length > 0 ? templateCanvasDesign.interactiveFields : templateModelDesign.fields;
  const shouldLeftAlignCanvasPages = isExcelCanvasPage(templateCanvasDesign.source)
    || templateCanvasPages.some((canvasPage) => resolveTemplateCanvasPageWidth(canvasPage, templateCanvasDesign.source) > TEMPLATE_CANVAS_MAX_VISUAL_WIDTH);
  const canvasAssetFileIds = useMemo(
    () => Array.from(new Set(templateCanvasPages.flatMap((pageItem) => [
      getCanvasBackgroundFileId(pageItem),
      ...(pageItem.layers ?? []).map(getCanvasLayerFileId),
    ]).filter(Boolean))),
    [templateCanvasPages],
  );
  const canvasRenderKey = `${designerRecord?.id || 'template'}-${designerRecord?.currentVersion?.id || designerRecord?.currentVersionId || 'version'}-${templateImportRevision}`;
  const selectedCanvasPage = selectedCanvasTarget ? templateCanvasPages.find((pageItem) => pageItem.id === selectedCanvasTarget.pageId) ?? null : null;
  const selectedCanvasLayer = selectedCanvasTarget?.type === 'layer' ? selectedCanvasPage?.layers?.find((layer) => layer.id === selectedCanvasTarget.id) ?? null : null;
  const selectedInteractiveField = selectedCanvasTarget?.type === 'field' ? interactiveFields.find((field) => field.pageId === selectedCanvasTarget.pageId && field.id === selectedCanvasTarget.id) ?? null : null;
  const allCandidatesDecided = Boolean(analysisDraft?.candidates?.length) && Boolean(analysisDraft?.candidates.every((candidate) => candidateDecisions[candidate.id]));
  const templateCategoryOptions = useMemo<TemplateCategoryOption[]>(() => {
    const virtualCounts = new Map(categories
      .filter((category) => category.id === TEMPLATE_CATEGORY_ALL || category.id === TEMPLATE_CATEGORY_UNCATEGORIZED)
      .map((category) => [String(category.id), Number(category.count || 0)]));
    const concreteCategories = categories
      .filter((category) => category.name)
      .filter((category) => category.id !== TEMPLATE_CATEGORY_ALL && category.id !== TEMPLATE_CATEGORY_UNCATEGORIZED)
      .map((category) => ({
        ...category,
        value: category.name,
        label: category.name,
        count: Number(category.count || 0),
        system: false,
      }));
    return [
      { id: TEMPLATE_CATEGORY_ALL, value: TEMPLATE_CATEGORY_ALL, label: '全部', name: '全部', count: virtualCounts.get(TEMPLATE_CATEGORY_ALL) ?? totalElements, system: true },
      { id: TEMPLATE_CATEGORY_UNCATEGORIZED, value: TEMPLATE_CATEGORY_UNCATEGORIZED, label: '未分类', name: '未分类', count: virtualCounts.get(TEMPLATE_CATEGORY_UNCATEGORIZED) ?? 0, system: true },
      ...concreteCategories,
    ];
  }, [categories, totalElements]);

  const categoryOptions = useMemo(
    () => templateCategoryOptions.filter((category) => !category.system).map((category) => category.name),
    [templateCategoryOptions],
  );

  useEffect(() => {
    setColumnWidths(loadColumnWidths(columnWidthStorageKey));
    setTemplateVersionColumnWidths(loadColumnWidths(templateVersionColumnWidthStorageKey));
    setColumnSettings(loadColumnSettings(columnSettingsStorageKey, allColumns));
    setTemplateVersionColumnSettings(loadColumnSettings(templateVersionColumnSettingsStorageKey, templateVersionColumns));
  }, [allColumns, columnSettingsStorageKey, columnWidthStorageKey, templateVersionColumnSettingsStorageKey, templateVersionColumnWidthStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(columnWidthStorageKey, JSON.stringify(columnWidths));
  }, [columnWidthStorageKey, columnWidths]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(templateVersionColumnWidthStorageKey, JSON.stringify(templateVersionColumnWidths));
  }, [templateVersionColumnWidthStorageKey, templateVersionColumnWidths]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(columnSettingsStorageKey, JSON.stringify(columnSettings));
  }, [columnSettingsStorageKey, columnSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(templateVersionColumnSettingsStorageKey, JSON.stringify(templateVersionColumnSettings));
  }, [templateVersionColumnSettingsStorageKey, templateVersionColumnSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let cancelled = false;
    const nextUrls: Record<string, string> = {};
    Promise.all(canvasAssetFileIds.map(async (fileId) => {
      try {
        const blob = await fetchAuthenticatedTemplateFileBlob(filePreviewPath(fileId));
        if (!cancelled) nextUrls[fileId] = URL.createObjectURL(blob);
      } catch (error) {
        if (!cancelled) {
          setSnackbar({ open: true, message: error instanceof Error ? error.message : '表单模板背景获取失败', severity: 'error' });
        }
      }
    })).then(() => {
      if (!cancelled) {
        setBackgroundObjectUrls((current) => {
          Object.values(current).forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
          return nextUrls;
        });
      } else {
        Object.values(nextUrls).forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [canvasAssetFileIds.join('|'), templateImportRevision]);

  useEffect(() => () => {
    Object.values(backgroundObjectUrls).forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
  }, [backgroundObjectUrls]);

  useEffect(() => {
    setColumnSettingsTab('main');
    setExpandedTemplateGroups(new Set());
  }, [pageKey]);

  useEffect(() => {
    if (!templateCanvasPages.some((pageItem) => pageItem.id === activeCanvasPageId)) {
      setActiveCanvasPageId(templateCanvasPages[0]?.id ?? null);
    }
  }, [activeCanvasPageId, templateCanvasPages]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return undefined;
    const updateWidth = () => setTableContainerWidth(container.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onlyOfficeDialog.open || !onlyOfficeDialog.config || !onlyOfficeContainerRef.current) {
      setOnlyOfficeEditorState({ status: 'idle' });
      return undefined;
    }
    setOnlyOfficeEditorState({ status: 'loading' });
    const scriptId = 'onlyoffice-docs-api-script';
    const scriptSrc = `${onlyOfficeDialog.config.documentServerUrl.replace(/\/$/, '')}/web-apps/apps/api/documents/api.js`;
    const loadScript = () => new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existing) {
        if ((window as typeof window & { DocsAPI?: unknown }).DocsAPI) resolve();
        else existing.addEventListener('load', () => resolve(), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('OnlyOffice 编辑器脚本加载失败'));
      document.body.appendChild(script);
    });
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !onlyOfficeContainerRef.current || !onlyOfficeDialog.config) return;
        const docsApi = (window as typeof window & { DocsAPI?: { DocEditor: new (id: string, config: OnlyOfficeEditorConfig) => { destroyEditor?: () => void } } }).DocsAPI;
        if (!docsApi?.DocEditor) throw new Error('OnlyOffice 编辑器不可用');
        onlyOfficeContainerRef.current.innerHTML = '';
        const holder = document.createElement('div');
        holder.id = 'onlyoffice-form-template-editor';
        holder.style.width = '100%';
        holder.style.height = '100%';
        onlyOfficeContainerRef.current.appendChild(holder);
        const editorConfig: OnlyOfficeEditorConfig & { events: Record<string, (event?: { data?: boolean }) => void> } = {
          ...onlyOfficeDialog.config,
          events: {
            onAppReady: () => setOnlyOfficeEditorState({ status: 'ready' }),
            onDocumentStateChange: (event) => setOnlyOfficeEditorState(onlyOfficeDocumentState(event?.data)),
          },
        };
        onlyOfficeEditorRef.current = new docsApi.DocEditor(holder.id, editorConfig);
      })
      .catch((error: unknown) => {
        setOnlyOfficeEditorState({ status: 'error', message: error instanceof Error ? error.message : 'OnlyOffice 编辑器加载失败' });
        setSnackbar({ open: true, message: error instanceof Error ? error.message : 'OnlyOffice 编辑器加载失败', severity: 'error' });
      });
    return () => {
      cancelled = true;
      onlyOfficeEditorRef.current?.destroyEditor?.();
      onlyOfficeEditorRef.current = null;
      setOnlyOfficeEditorState({ status: 'idle' });
    };
  }, [onlyOfficeDialog.open, onlyOfficeDialog.config]);

  const saveMutation = useMutation({
    mutationFn: async ({ designAfterSave }: { designAfterSave: boolean }) => {
      const effectiveFrom = form.effectiveFrom || effectiveFromInputRef.current?.value || '';
      const effectiveTo = form.effectiveTo || effectiveToInputRef.current?.value || '';
      const payload: TemplateModelingPayload = {
        code: form.code.trim(),
        name: form.name.trim(),
        categoryName: form.categoryName.trim() || null,
        description: form.description.trim() || null,
        versionDescription: pageKey === 'formTemplates' ? form.versionDescription.trim() || null : undefined,
        version: pageKey === 'formTemplates' ? form.version.trim() : undefined,
        effectiveFrom: pageKey === 'formTemplates' ? effectiveFrom || null : undefined,
        effectiveTo: pageKey === 'formTemplates' ? effectiveTo || null : undefined,
        status: form.status,
      };
      if (creatingVersionFrom) {
        const versionResponse = await createFormTemplateVersion(creatingVersionFrom.id, pickTemplatePayload(payload, TEMPLATE_VERSION_FIELD_IDS));
        return { response: null, versionResponse, designAfterSave, versionParent: creatingVersionFrom };
      }
      const response = editingRow ? await config.updateAction(editingRow.id, payload) : await config.createAction(payload);
      return { response, versionResponse: null, designAfterSave, versionParent: null };
    },
    onSuccess: async ({ response, versionResponse, designAfterSave, versionParent }) => {
      const saved = response?.data.data;
      const savedVersion = versionResponse?.data.data;
      setSnackbar({ open: true, message: creatingVersionFrom ? '子版本新增成功' : editingRow ? '保存成功' : '新增成功', severity: 'success' });
      setDialogOpen(false);
      setEditingRow(null);
      setCreatingVersionFrom(null);
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.categoryQueryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
      if (designAfterSave && pageKey === 'formTemplates' && savedVersion && versionParent) {
        openDesigner({ ...versionParent, currentVersionId: savedVersion.id, currentVersion: savedVersion }, savedVersion);
      } else if (designAfterSave && pageKey === 'formTemplates' && saved) {
        openDesigner(saved);
      }
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '保存失败', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (row: TemplateModelingRecord) => config.deleteAction(row.id),
    onSuccess: async () => {
      setDeleteRowTarget(null);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.categoryQueryKey] });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '删除失败', severity: 'error' }),
  });

  const deleteVersionMutation = useMutation({
    mutationFn: (target: { row: TemplateModelingRecord; version: TemplateVersionRecord }) => deleteFormTemplateVersion(target.row.id, target.version.id),
    onSuccess: async () => {
      setDeleteVersionTarget(null);
      setSnackbar({ open: true, message: '版本删除成功', severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.categoryQueryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '版本删除失败', severity: 'error' }),
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const name = categoryDialog.name.trim();
      if (categoryDialog.target) return updateTemplateModelingCategory(pageKey, categoryDialog.target.id, { name });
      return createTemplateModelingCategory(pageKey, { name });
    },
    onSuccess: async () => {
      setCategoryDialog({ open: false, target: null, name: '' });
      setSnackbar({ open: true, message: '分类保存成功', severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: [config.categoryQueryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '分类保存失败', severity: 'error' }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (target: TemplateCategoryRecord) => deleteTemplateModelingCategory(pageKey, target.id),
    onSuccess: async () => {
      setDeleteCategoryTarget(null);
      setSnackbar({ open: true, message: '分类删除成功', severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: [config.categoryQueryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '分类删除失败', severity: 'error' }),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: (ids: Array<string | number>) => reorderTemplateModelingCategories(pageKey, ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [config.categoryQueryKey] });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '分类排序失败', severity: 'error' }),
  });

  const clearTemplateDesignerCanvas = () => {
    setSelectedCanvasTarget(null);
    setActiveCanvasPageId(null);
    setFieldCandidates([]);
    setAnalysisDraft(null);
    setCandidateDecisions({});
    setSelectedAnalysisCandidateId(null);
    setTemplateModelDesign(emptyTemplateModelDesign());
    setTemplateCanvasDesign(emptyTemplateCanvasDesign());
    setFieldPreviewValues({});
    setTemplateImportRevision((current) => current + 1);
    setBackgroundObjectUrls((current) => {
      Object.values(current).forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      return {};
    });
  };

  const captureTemplateDesignerSnapshot = (): TemplateDesignerSnapshot => ({
    fieldCandidates,
    analysisDraft,
    candidateDecisions,
    selectedAnalysisCandidateId,
    templateModelDesign,
    templateCanvasDesign,
    activeCanvasPageId,
    selectedCanvasTarget,
    fieldPreviewValues,
  });

  const restoreTemplateDesignerSnapshot = (importSequence: number) => {
    const snapshotState = templateImportSnapshotRef.current;
    if (!snapshotState || snapshotState.sequence !== importSequence) return;
    const { snapshot } = snapshotState;
    setFieldCandidates(snapshot.fieldCandidates);
    setAnalysisDraft(snapshot.analysisDraft);
    setCandidateDecisions(snapshot.candidateDecisions);
    setSelectedAnalysisCandidateId(snapshot.selectedAnalysisCandidateId);
    setTemplateModelDesign(snapshot.templateModelDesign);
    setTemplateCanvasDesign(snapshot.templateCanvasDesign);
    setActiveCanvasPageId(snapshot.activeCanvasPageId);
    setSelectedCanvasTarget(snapshot.selectedCanvasTarget);
    setFieldPreviewValues(snapshot.fieldPreviewValues);
    setTemplateImportRevision((current) => current + 1);
    templateImportSnapshotRef.current = null;
  };

  const beginTemplateSourceImport = () => {
    templateImportSequenceRef.current += 1;
    templateImportSnapshotRef.current = { sequence: templateImportSequenceRef.current, snapshot: captureTemplateDesignerSnapshot() };
    clearTemplateDesignerCanvas();
    return templateImportSequenceRef.current;
  };

  const applyTemplateImportResult = (result: TemplateImportResponse) => {
    const nextAnalysisDraft = analysisDraftFromImport(result);
    const nextModelDesign = result.modelDesign ?? parseTemplateModelDesign(result.version);
    const nextCanvasDesign = result.canvasDesign ?? parseTemplateCanvasDesign(result.version);
    setFieldCandidates(result.fieldCandidates);
    setAnalysisDraft(nextAnalysisDraft);
    setCandidateDecisions({});
    setSelectedAnalysisCandidateId(nextAnalysisDraft?.candidates?.[0]?.id ?? null);
    setTemplateModelDesign(nextModelDesign);
    setTemplateCanvasDesign(nextCanvasDesign);
    setFieldPreviewValues({});
    setActiveCanvasPageId(nextCanvasDesign.pages[0]?.id ?? null);
    setTemplateImportRevision((current) => current + 1);
    setDesignerRecord((current) => current ? { ...current, currentVersionId: result.version.id, currentVersion: result.version } : current);
  };

  const formatTemplateImportSuccessMessage = (result: TemplateImportResponse) => {
    const pageCount = result.canvasDesign?.pages?.length ?? result.analysisDraft?.pages?.length ?? 0;
    const candidateCount = result.fieldCandidates?.length ?? result.analysisDraft?.candidates?.length ?? 0;
    const prefix = '源文件已导入：';
    const pageText = pageCount > 0 ? `${pageCount} 页` : '画布已更新';
    return `${prefix}${pageText}，生成 ${candidateCount} 个字段候选`;
  };

  const importMutation = useMutation({
    onMutate: beginTemplateSourceImport,
    mutationFn: async (file: File) => {
      const versionId = getDesignerVersionId(designerRecord);
      if (!designerRecord || !versionId) throw new Error('当前模板没有可设计版本');
      return importFormTemplateSourceFile(designerRecord.id, versionId, file);
    },
    onSuccess: async (response, _file, importSequence) => {
      if (importSequence !== templateImportSequenceRef.current) return;
      templateImportSnapshotRef.current = null;
      const result = response.data.data;
      applyTemplateImportResult(result);
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
      setSnackbar({ open: true, message: formatTemplateImportSuccessMessage(result), severity: 'success' });
    },
    onError: (error: unknown, _file, importSequence) => {
      if (importSequence !== templateImportSequenceRef.current) return;
      restoreTemplateDesignerSnapshot(importSequence);
      setSnackbar({ open: true, message: error instanceof Error ? error.message : '导入失败', severity: 'error' });
    },
  });

  const reparseSourceMutation = useMutation({
    onMutate: beginTemplateSourceImport,
    mutationFn: async () => {
      const versionId = getDesignerVersionId(designerRecord);
      if (!designerRecord || !versionId) throw new Error('当前模板没有可同步的源文件版本');
      return reparseFormTemplateSourceFile(designerRecord.id, versionId);
    },
    onSuccess: async (response, _variables, importSequence) => {
      if (importSequence !== templateImportSequenceRef.current) return;
      templateImportSnapshotRef.current = null;
      applyTemplateImportResult(response.data.data);
      setOnlyOfficeDialog({ open: false, config: null });
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
      setSnackbar({ open: true, message: '源文档已重新解析并同步到画布', severity: 'success' });
    },
    onError: (error: unknown, _variables, importSequence) => {
      if (importSequence !== templateImportSequenceRef.current) return;
      restoreTemplateDesignerSnapshot(importSequence);
      setSnackbar({ open: true, message: error instanceof Error ? error.message : '重新解析失败', severity: 'error' });
    },
  });

  const confirmCandidatesMutation = useMutation({
    mutationFn: async () => {
      const versionId = getDesignerVersionId(designerRecord);
      if (!designerRecord || !versionId || !analysisDraft?.analysisId) throw new Error('当前模板没有可确认的解析草稿');
      if (!allCandidatesDecided) throw new Error('请逐项确认候选，或点击按推荐批量选择后再保存');
      return confirmFormTemplateAnalysisCandidates(designerRecord.id, versionId, analysisDraft.analysisId, Object.values(candidateDecisions));
    },
    onSuccess: async (response) => {
      const version = response.data.data;
      setDesignerRecord((current) => current ? { ...current, currentVersionId: version.id, currentVersion: version } : current);
      setTemplateModelDesign(parseTemplateModelDesign(version));
      setTemplateCanvasDesign(parseTemplateCanvasDesign(version));
      setFieldPreviewValues({});
      setFieldCandidates([]);
      setAnalysisDraft(null);
      setCandidateDecisions({});
      setSelectedAnalysisCandidateId(null);
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
      setSnackbar({ open: true, message: '候选确认已保存', severity: 'success' });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '候选确认失败', severity: 'error' }),
  });

  const onlyOfficeConfigMutation = useMutation({
    mutationFn: async () => {
      const versionId = getDesignerVersionId(designerRecord);
      if (!designerRecord || !versionId) throw new Error('当前模板没有可预览源文件的版本');
      return getFormTemplateOnlyOfficeConfig(designerRecord.id, versionId);
    },
    onSuccess: (response) => {
      setOnlyOfficeEditorState({ status: 'loading' });
      setOnlyOfficeDialog({ open: true, config: response.data.data });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : 'OnlyOffice 文档服务未配置', severity: 'error' }),
  });

  const canSyncOnlyOfficeToCanvas = ['ready', 'saved'].includes(onlyOfficeEditorState.status);
  const onlyOfficeSyncDisabledReason = !designerRecord?.currentVersion?.sourceFileId
    ? '当前版本没有源文件'
    : !canSyncOnlyOfficeToCanvas
      ? onlyOfficeEditorState.status === 'dirty' ? '请先在 OnlyOffice 中保存源文档' : '请等待 OnlyOffice 编辑器加载完成'
      : '';
  const onlyOfficeSyncDisabled = reparseSourceMutation.isPending || Boolean(onlyOfficeSyncDisabledReason);

  const saveDesignMutation = useMutation({
    mutationFn: async () => {
      const versionId = getDesignerVersionId(designerRecord);
      if (!designerRecord || !versionId) throw new Error('当前模板没有可设计版本');
      const currentVersion = resolveDesignerVersion(designerRecord, designerRecord.currentVersion);
      const syncedCanvasDesign = syncTemplateCanvasFieldBindings(templateCanvasDesign, templateModelDesign.fields);
      return saveFormTemplateDesign(designerRecord.id, versionId, {
        modelDesignJson: JSON.stringify(templateModelDesign, null, 2),
        canvasDesignJson: JSON.stringify(syncedCanvasDesign, null, 2),
        workflowDesignJson: currentVersion?.workflowDesignJson || JSON.stringify({ nodes: [], edges: [] }, null, 2),
      });
    },
    onSuccess: async (response) => {
      const version = response.data.data;
      setDesignerRecord((current) => current ? { ...current, currentVersionId: version.id, currentVersion: version } : current);
      setTemplateModelDesign(parseTemplateModelDesign(version));
      setTemplateCanvasDesign(parseTemplateCanvasDesign(version));
      setFieldPreviewValues({});
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
      setSnackbar({ open: true, message: '设计已保存', severity: 'success' });
    },
    onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '设计保存失败', severity: 'error' }),
  });

  const openTemplateSourceFilePicker = () => {
    if (importMutation.isPending) return;
    templateSourceFileInputRef.current?.click();
  };

  const restorePendingAnalysisDraft = async (row: TemplateModelingRecord, version: TemplateVersionRecord | null | undefined, modelDesign: TemplateModelDesign) => {
    const analysisId = getPendingAnalysisDraftId(modelDesign);
    const versionId = version?.id;
    if (!analysisId || !versionId) return;
    analysisDraftRestoreSequenceRef.current += 1;
    const restoreSequence = analysisDraftRestoreSequenceRef.current;
    try {
      const response = await getFormTemplateAnalysisDraft(row.id, versionId, analysisId);
      if (restoreSequence !== analysisDraftRestoreSequenceRef.current) return;
      const draft = response.data.data;
      setAnalysisDraft(draft);
      setFieldCandidates(draft.candidates.map((candidate) => ({
        id: candidate.id,
        code: candidate.fieldCode,
        name: candidate.fieldName,
        type: typeForComponent(candidate.suggestedComponent),
        required: Boolean(candidate.required),
        status: candidate.status,
        suggestedAction: candidate.suggestedAction,
        suggestedComponent: candidate.suggestedComponent,
        pageId: candidate.pageId,
        valueAnchor: candidate.valueAnchor,
        sourceText: candidate.sourceText,
        keyText: candidate.keyText,
        valueText: candidate.valueText,
        semanticRole: candidate.semanticRole,
        pairing: candidate.pairing,
        reason: candidate.reason,
        confidence: candidate.confidence,
      })));
      setCandidateDecisions({});
      setSelectedAnalysisCandidateId(draft.candidates[0]?.id ?? null);
    } catch (error) {
      if (restoreSequence !== analysisDraftRestoreSequenceRef.current) return;
      setSnackbar({ open: true, message: error instanceof Error ? error.message : '解析草稿恢复失败', severity: 'error' });
    }
  };

  const openCreateDialog = () => {
    const selectedCategory = templateCategoryOptions.find((category) => category.value === categoryId);
    const selectedName = selectedCategory && !selectedCategory.system ? selectedCategory.name : '';
    setEditingRow(null);
    setCreatingVersionFrom(null);
    setForm(emptyForm(selectedName));
    setDialogOpen(true);
  };

  const openEditDialog = (row: TemplateModelingRecord) => {
    setEditingRow(row);
    setCreatingVersionFrom(null);
    setForm({
      code: row.code ?? '',
      name: row.name ?? '',
      categoryName: row.categoryName ?? '',
      description: row.description ?? '',
      versionDescription: row.currentVersion?.description ?? '',
      version: row.currentVersion?.version ?? 'V1.0',
      effectiveFrom: toDateTimeLocalValue(row.currentVersion?.effectiveFrom),
      effectiveTo: toDateTimeLocalValue(row.currentVersion?.effectiveTo),
      status: row.status ?? 'ACTIVE',
    });
    setDialogOpen(true);
  };

  const openCreateTemplateVersionDialog = (row: TemplateModelingRecord) => {
    setEditingRow(null);
    setCreatingVersionFrom(row);
    setForm({
      code: row.code ?? '',
      name: row.name ?? '',
      categoryName: row.categoryName ?? '',
      description: row.description ?? '',
      versionDescription: '',
      version: '',
      effectiveFrom: defaultEffectiveFromValue(),
      effectiveTo: '',
      status: 'ACTIVE',
    });
    setDialogOpen(true);
  };

  const openDesigner = (row: TemplateModelingRecord, version: TemplateVersionRecord | null | undefined = row.currentVersion) => {
    if (pageKey !== 'formTemplates') return;
    const currentVersion = resolveDesignerVersion(row, version);
    const parsedModelDesign = parseTemplateModelDesign(currentVersion);
    const parsedCanvasDesign = parseTemplateCanvasDesign(currentVersion);
    analysisDraftRestoreSequenceRef.current += 1;
    setDesignerRecord({ ...row, currentVersionId: currentVersion?.id ?? row.currentVersionId, currentVersion });
    setSelectedCanvasTarget(null);
    setAnalysisDraft(null);
    setCandidateDecisions({});
    setSelectedAnalysisCandidateId(null);
    setFieldCandidates(parseFieldCandidates(currentVersion));
    setTemplateModelDesign(parsedModelDesign);
    setTemplateCanvasDesign(parsedCanvasDesign);
    setFieldPreviewValues({});
    setActiveCanvasPageId(parsedCanvasDesign.pages[0]?.id ?? null);
    setTemplateImportRevision((current) => current + 1);
    void restorePendingAnalysisDraft(row, currentVersion, parsedModelDesign);
  };

  const handleTemplateSourceFileSelected = (file: File) => {
    setSnackbar({ open: true, message: `正在导入并解析 ${file.name}，请稍候`, severity: 'info' });
    importMutation.mutate(file);
  };

  const updateCanvasLayer = (pageId: string, layerId: string, patch: Partial<TemplateCanvasLayer>) => {
    setTemplateCanvasDesign((current) => ({
      ...current,
      pages: current.pages.map((pageItem) => pageItem.id === pageId ? {
        ...pageItem,
        layers: (pageItem.layers ?? []).map((layer) => layer.id === layerId ? { ...layer, ...patch } : layer),
      } : pageItem),
    }));
  };

  const deleteCanvasLayer = (pageId: string, layerId: string) => {
    setTemplateCanvasDesign((current) => ({
      ...current,
      pages: current.pages.map((pageItem) => pageItem.id === pageId ? {
        ...pageItem,
        layers: (pageItem.layers ?? []).filter((layer) => layer.id !== layerId),
      } : pageItem),
    }));
    setSelectedCanvasTarget((current) => current?.type === 'layer' && current.pageId === pageId && current.id === layerId ? null : current);
  };

  const moveCanvasLayer = (pageId: string, layerId: string, nextX: number, nextY: number) => {
    setTemplateCanvasDesign((current) => ({
      ...current,
      pages: current.pages.map((pageItem) => pageItem.id === pageId ? {
        ...pageItem,
        layers: (pageItem.layers ?? []).map((layer) => layer.id === layerId ? {
          ...layer,
          x: clampCanvasPosition(nextX, layer.width, pageItem.width),
          y: clampCanvasPosition(nextY, layer.height, pageItem.height),
        } : layer),
      } : pageItem),
    }));
  };

  const updateInteractiveField = (fieldId: string, patch: Partial<TemplateInteractiveField>) => {
    setTemplateCanvasDesign((current) => {
      const sourceFields = current.interactiveFields.length > 0 ? current.interactiveFields : templateModelDesign.fields;
      return {
        ...current,
        interactiveFields: sourceFields.map((field) => field.id === fieldId ? { ...field, ...patch } : field),
      };
    });
    setTemplateModelDesign((current) => ({
      ...current,
      fields: current.fields.map((field) => field.id === fieldId ? { ...field, ...patch } : field),
    }));
  };

  const updateFieldPreviewValue = (field: TemplateInteractiveField, value: string) => {
    const key = field.code || field.id;
    setFieldPreviewValues((current) => ({ ...current, [key]: value }));
  };

  const deleteInteractiveField = (fieldId: string) => {
    setTemplateCanvasDesign((current) => {
      const sourceFields = current.interactiveFields.length > 0 ? current.interactiveFields : templateModelDesign.fields;
      return {
        ...current,
        interactiveFields: sourceFields.filter((field) => field.id !== fieldId),
      };
    });
    setTemplateModelDesign((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== fieldId),
    }));
    setSelectedCanvasTarget((current) => current?.type === 'field' && current.id === fieldId ? null : current);
  };

  const moveInteractiveField = (fieldId: string, nextX: number, nextY: number) => {
    const field = interactiveFields.find((candidate) => candidate.id === fieldId);
    const pageItem = templateCanvasPages.find((candidate) => candidate.id === field?.pageId);
    if (!field || !pageItem) return;
    updateInteractiveField(fieldId, {
      x: clampCanvasPosition(nextX, field.width, pageItem.width),
      y: clampCanvasPosition(nextY, field.height, pageItem.height),
    });
  };

  const addCanvasTextLayer = (pageItem = activeCanvasPage, point = { x: 96, y: 96 }) => {
    const layer: TemplateCanvasLayer = {
      id: createCanvasElementId('text-layer'),
      type: 'text',
      text: '文本',
      x: clampCanvasPosition(point.x, 160, pageItem.width),
      y: clampCanvasPosition(point.y, 32, pageItem.height),
      width: 160,
      height: 32,
      fontSize: 14,
      selectable: true,
      draggable: true,
      zIndex: (pageItem.layers?.length ?? 0) + 2,
    };
    setTemplateCanvasDesign((current) => ({
      ...current,
      pages: (current.pages.length > 0 ? current.pages : [pageItem]).map((candidate) => candidate.id === pageItem.id ? {
        ...candidate,
        layers: [...(candidate.layers ?? []), layer],
      } : candidate),
    }));
    setSelectedCanvasTarget({ type: 'layer', pageId: pageItem.id, id: layer.id });
  };

  const resolveCandidateCanvasPlacement = (candidate?: TemplateImportResponse['fieldCandidates'][number], pageItem = activeCanvasPage, point?: { x: number; y: number }) => {
    const resolvedPage = point ? pageItem : templateCanvasPages.find((item) => item.id === candidate?.pageId) ?? pageItem;
    const resolvedPoint = point ?? { x: candidate?.valueAnchor?.x ?? 96, y: candidate?.valueAnchor?.y ?? 144 };
    return {
      resolvedPage,
      resolvedPoint,
      width: candidate?.valueAnchor?.width ?? 168,
      height: candidate?.valueAnchor?.height ?? 30,
    };
  };

  const addFieldCandidateToCanvas = (candidate?: TemplateImportResponse['fieldCandidates'][number], pageItem = activeCanvasPage, point?: { x: number; y: number }, replaceSameCandidate = false) => {
    const { resolvedPage, resolvedPoint, width, height } = resolveCandidateCanvasPlacement(candidate, pageItem, point);
    const sourceFields = templateModelDesign.fields.filter((field) => !replaceSameCandidate || field.sourceCandidateId !== candidate?.id);
    const sourceInteractiveFields = interactiveFields.filter((field) => !replaceSameCandidate || field.sourceCandidateId !== candidate?.id);
    const existingFieldCodes = new Set([...sourceFields, ...sourceInteractiveFields].map((field) => field.code));
    const baseCode = candidate?.code || `field_${interactiveFields.length + 1}`;
    const code = resolveUniqueTemplateFieldCode(baseCode, existingFieldCodes);
    const component = candidate?.suggestedComponent || componentForTemplateFieldType(candidate?.type);
    const fieldType = candidate?.type || typeForComponent(component);
    const field: TemplateInteractiveField = {
      id: createCanvasElementId('field'),
      code,
      name: candidate?.name || `字段${interactiveFields.length + 1}`,
      type: fieldType,
      required: candidate?.required ?? false,
      pageId: resolvedPage.id,
      x: clampCanvasPosition(resolvedPoint.x, width, resolvedPage.width),
      y: clampCanvasPosition(resolvedPoint.y, height, resolvedPage.height),
      width,
      height,
      fontSize: 12,
      textAlign: 'left',
      component,
      fillable: true,
      draggable: true,
      resizable: true,
      anchor: { pageId: resolvedPage.id, source: candidate ? 'field-candidate' : 'manual-tool', unit: 'source-point' },
      validation: { required: candidate?.required ?? false, rules: [] },
      dataBinding: { valuePath: `fields.${code}`, submissionPath: `submission.fields.${code}` },
      binding: { fillable: true, component },
      sourceText: candidate?.sourceText,
      keyText: candidate?.keyText,
      valueText: candidate?.valueText,
      semanticRole: candidate?.semanticRole,
      pairing: candidate?.pairing,
      sourceCandidateId: candidate?.id,
    };
    setTemplateCanvasDesign((current) => {
      const sourceFields = current.interactiveFields.length > 0 ? current.interactiveFields : templateModelDesign.fields;
      const nextSourceFields = sourceFields.filter((field) => !replaceSameCandidate || field.sourceCandidateId !== candidate?.id);
      return {
        ...current,
        interactiveFields: [...nextSourceFields, field],
      };
    });
    setTemplateModelDesign((current) => ({
      ...current,
      fields: [...current.fields.filter((field) => !replaceSameCandidate || field.sourceCandidateId !== candidate?.id), field],
    }));
    setActiveCanvasPageId(resolvedPage.id);
    setSelectedCanvasTarget({ type: 'field', pageId: resolvedPage.id, id: field.id });
  };

  const removeCandidatePreviewArtifacts = (candidate: TemplateAnalysisCandidate) => {
    setTemplateCanvasDesign((current) => ({
      ...current,
      pages: current.pages.map((pageItem) => ({
        ...pageItem,
        layers: (pageItem.layers ?? []).filter((layer) => layer.sourceCandidateId !== candidate.id),
      })),
      interactiveFields: (current.interactiveFields.length > 0 ? current.interactiveFields : templateModelDesign.fields)
        .filter((field) => field.sourceCandidateId !== candidate.id),
    }));
    setTemplateModelDesign((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.sourceCandidateId !== candidate.id),
    }));
    setSelectedCanvasTarget((current) => {
      if (current?.type === 'layer' && current.id === `static-candidate-${candidate.id}`) return null;
      if (current?.type === 'field' && [...templateModelDesign.fields, ...interactiveFields].some((field) => field.id === current.id && field.sourceCandidateId === candidate.id)) return null;
      return current;
    });
  };

  const candidateDecisionFromPatch = (
    candidate: TemplateAnalysisCandidate,
    action: TemplateCandidateDecisionItem['action'],
    currentDecision?: TemplateCandidateDecisionItem,
    patch: Partial<TemplateCandidateDecisionItem> = {},
  ): TemplateCandidateDecisionItem => ({
    candidateId: candidate.id,
    action,
    fieldCode: patch.fieldCode ?? currentDecision?.fieldCode ?? candidate.fieldCode,
    fieldName: patch.fieldName ?? currentDecision?.fieldName ?? candidate.fieldName,
    component: patch.component ?? currentDecision?.component ?? candidate.suggestedComponent ?? 'TextInput',
    required: patch.required ?? currentDecision?.required ?? candidate.required ?? false,
  });

  const applyCandidateDecisionToCanvas = (candidate: TemplateAnalysisCandidate, action: TemplateCandidateDecisionItem['action']) => {
    const nextDecision = candidateDecisionFromPatch(candidate, action, candidateDecisions[candidate.id]);
    updateCandidateDecision(candidate, action);
    const resolvedPage = templateCanvasPages.find((item) => item.id === candidate.pageId) ?? activeCanvasPage;
    removeCandidatePreviewArtifacts(candidate);
    if (action === 'component') {
      addFieldCandidateToCanvas(candidateDecisionToFieldCandidate(candidate, nextDecision), resolvedPage, undefined, true);
      return;
    }
    if (action !== 'staticText') return;
    const staticLayer = candidateDecisionToStaticTextLayer(candidate, nextDecision);
    const nextLayer: TemplateCanvasLayer = {
      ...staticLayer,
      x: clampCanvasPosition(staticLayer.x, staticLayer.width, resolvedPage.width),
      y: clampCanvasPosition(staticLayer.y, staticLayer.height, resolvedPage.height),
    };
    setTemplateCanvasDesign((current) => {
      const pages = current.pages.length > 0 ? current.pages : [resolvedPage];
      return {
        ...current,
        pages: pages.map((pageItem) => pageItem.id === resolvedPage.id ? {
          ...pageItem,
          layers: [
            ...(pageItem.layers ?? []).filter((layer) => layer.sourceCandidateId !== candidate.id),
            nextLayer,
          ],
        } : {
          ...pageItem,
          layers: (pageItem.layers ?? []).filter((layer) => layer.sourceCandidateId !== candidate.id),
        }),
      };
    });
    setActiveCanvasPageId(resolvedPage.id);
    setSelectedCanvasTarget({ type: 'layer', pageId: resolvedPage.id, id: nextLayer.id });
  };

  const addInteractiveFieldToCanvas = () => {
    addFieldCandidateToCanvas();
  };

  const syncCandidateComponentPreview = (candidate: TemplateAnalysisCandidate, nextDecision: TemplateCandidateDecisionItem) => {
    if (nextDecision.action !== 'component') return;
    const component = nextDecision.component ?? candidate.suggestedComponent ?? 'TextInput';
    const fieldType = typeForComponent(component);
    const patch: Partial<TemplateInteractiveField> = {
      code: nextDecision.fieldCode || candidate.fieldCode,
      name: nextDecision.fieldName || candidate.fieldName,
      type: fieldType,
      required: nextDecision.required ?? candidate.required ?? false,
      component,
      validation: { required: nextDecision.required ?? candidate.required ?? false, rules: [] },
      dataBinding: { valuePath: `fields.${nextDecision.fieldCode || candidate.fieldCode}`, submissionPath: `submission.fields.${nextDecision.fieldCode || candidate.fieldCode}` },
      binding: { fillable: true, component },
    };
    setTemplateCanvasDesign((current) => ({
      ...current,
      interactiveFields: (current.interactiveFields.length > 0 ? current.interactiveFields : templateModelDesign.fields)
        .map((field) => field.sourceCandidateId === candidate.id ? { ...field, ...patch } : field),
    }));
    setTemplateModelDesign((current) => ({
      ...current,
      fields: current.fields.map((field) => field.sourceCandidateId === candidate.id ? { ...field, ...patch } : field),
    }));
  };

  const updateCandidateDecision = (candidate: TemplateAnalysisCandidate, action: TemplateCandidateDecisionItem['action'], patch: Partial<TemplateCandidateDecisionItem> = {}) => {
    setCandidateDecisions((current) => {
      const nextDecision = candidateDecisionFromPatch(candidate, action, current[candidate.id], patch);
      syncCandidateComponentPreview(candidate, nextDecision);
      return {
        ...current,
        [candidate.id]: nextDecision,
      };
    });
  };

  const recommendedDecisionForCandidate = (candidate: TemplateAnalysisCandidate): TemplateCandidateDecisionItem => ({
    candidateId: candidate.id,
    action: candidate.suggestedAction === 'staticText' ? 'staticText' : candidate.suggestedAction === 'ignore' ? 'ignore' : 'component',
    fieldCode: candidate.fieldCode,
    fieldName: candidate.fieldName,
    component: candidate.suggestedComponent || 'TextInput',
    required: candidate.required ?? false,
  });

  const applySuggestedCandidateDecisions = () => {
    if (!analysisDraft) return;
    setCandidateDecisions(Object.fromEntries(analysisDraft.candidates.map((candidate) => [candidate.id, recommendedDecisionForCandidate(candidate)])));
  };

  const candidateSourceBlock = (candidate: TemplateAnalysisCandidate): TemplateAnalysisBlock | null => {
    if (!analysisDraft?.blocks?.length || !candidate.labelBlockId) return null;
    return analysisDraft.blocks.find((block) => block.id === candidate.labelBlockId) ?? null;
  };

  const candidatePageLabel = (candidate: TemplateAnalysisCandidate) => {
    const pageItem = analysisDraft?.pages.find((item) => item.id === candidate.pageId);
    return pageItem ? `第 ${pageItem.pageNumber} 页` : candidate.pageId;
  };

  const candidateCoordinateLabel = (candidate: TemplateAnalysisCandidate) => {
    const anchor = candidate.valueAnchor;
    if (!anchor) return '坐标未识别';
    return `x ${Math.round(anchor.x)}, y ${Math.round(anchor.y)}, w ${Math.round(anchor.width)}, h ${Math.round(anchor.height)}`;
  };

  const handleCanvasToolDragStart = (event: ReactDragEvent, payload: TemplateCanvasToolPayload) => {
    const serializedPayload = JSON.stringify(payload);
    event.dataTransfer.setData('application/json', serializedPayload);
    event.dataTransfer.setData('text/plain', serializedPayload);
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasPageDrop = (dropEvent: ReactDragEvent, canvasPage: TemplateCanvasPage) => {
    dropEvent.preventDefault();
    const rawPayload = dropEvent.dataTransfer.getData('application/json') || dropEvent.dataTransfer.getData('text/plain');
    if (!rawPayload) return;
    let payload: TemplateCanvasToolPayload;
    try {
      payload = JSON.parse(rawPayload) as TemplateCanvasToolPayload;
    } catch {
      return;
    }
    const pageRect = dropEvent.currentTarget.getBoundingClientRect();
    if (!pageRect.width || !pageRect.height) return;
    const dropPoint = {
      x: Math.max(0, dropEvent.clientX - pageRect.left),
      y: Math.max(0, dropEvent.clientY - pageRect.top),
    };
    const dropX = (dropPoint.x / pageRect.width) * canvasPage.width;
    const dropY = (dropPoint.y / pageRect.height) * canvasPage.height;
    setActiveCanvasPageId(canvasPage.id);
    if (payload.kind === 'text') addCanvasTextLayer(canvasPage, { x: dropX, y: dropY });
    if (payload.kind === 'field') addFieldCandidateToCanvas(undefined, canvasPage, { x: dropX, y: dropY });
    if (payload.kind === 'candidate') addFieldCandidateToCanvas(payload.candidate, canvasPage, { x: dropX, y: dropY });
  };

  const beginCanvasTargetDrag = (event: ReactPointerEvent, target: TemplateCanvasTarget, pageItem: TemplateCanvasPage) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLayer = target.type === 'layer' ? pageItem.layers?.find((layer) => layer.id === target.id) : null;
    const startField = target.type === 'field' ? interactiveFields.find((field) => field.id === target.id) : null;
    const startTargetX = target.type === 'layer' ? startLayer?.x : startField?.x;
    const startTargetY = target.type === 'layer' ? startLayer?.y : startField?.y;
    const pageRect = (event.currentTarget.closest('[data-form-template-canvas-page]') as HTMLElement | null)?.getBoundingClientRect();
    if (!pageRect?.width || !pageRect.height || startTargetX === undefined || startTargetY === undefined) return;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / pageRect.width) * pageItem.width;
      const deltaY = ((moveEvent.clientY - startY) / pageRect.height) * pageItem.height;
      if (target.type === 'layer') moveCanvasLayer(target.pageId, target.id, startTargetX + deltaX, startTargetY + deltaY);
      else moveInteractiveField(target.id, startTargetX + deltaX, startTargetY + deltaY);
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleSubmit = (designAfterSave = false) => {
    if (!creatingVersionFrom && !form.name.trim()) {
      setSnackbar({ open: true, message: '请输入模板名称', severity: 'error' });
      return;
    }
    if (!creatingVersionFrom && !form.code.trim()) {
      setSnackbar({ open: true, message: '请输入模板编码', severity: 'error' });
      return;
    }
    if (pageKey === 'formTemplates' && !form.version.trim()) {
      setSnackbar({ open: true, message: '请输入模板版本', severity: 'error' });
      return;
    }
    const effectiveFrom = form.effectiveFrom || effectiveFromInputRef.current?.value || '';
    const effectiveTo = form.effectiveTo || effectiveToInputRef.current?.value || '';
    if (pageKey === 'formTemplates' && !validateEffectiveDateRange(effectiveFrom, effectiveTo)) {
      setSnackbar({ open: true, message: '失效时间不能早于生效时间', severity: 'error' });
      return;
    }
    saveMutation.mutate({ designAfterSave });
  };

  const selectTemplateCategory = (category: string) => {
    setCategoryId(category);
    setPage(1);
  };

  const openCreateTemplateCategoryDialog = () => {
    setCategoryDialog({ open: true, target: null, name: '' });
  };

  const openEditTemplateCategoryDialog = (category: TemplateCategoryRecord) => {
    setCategoryDialog({ open: true, target: category, name: category.name });
  };

  const requestDeleteTemplateCategory = (category: TemplateCategoryRecord) => {
    setDeleteCategoryTarget(category);
  };

  const handleTemplateCategoryDragStart = (event: ReactDragEvent, category: TemplateCategoryOption) => {
    if (category.system) return;
    const categoryIdValue = String(category.id);
    event.dataTransfer.setData('text/plain', categoryIdValue);
    setDraggingCategoryId(categoryIdValue);
  };

  const handleTemplateCategoryDrop = (event: ReactDragEvent, targetCategory: TemplateCategoryOption) => {
    event.preventDefault();
    if (targetCategory.system) {
      setDraggingCategoryId('');
      return;
    }
    const activeCategoryId = draggingCategoryId || event.dataTransfer.getData('text/plain');
    const targetCategoryId = String(targetCategory.id);
    if (!activeCategoryId || activeCategoryId === targetCategoryId) {
      setDraggingCategoryId('');
      return;
    }
    const currentIds = templateCategoryOptions
      .filter((category) => !category.system)
      .map((category) => String(category.id));
    const activeIndex = currentIds.indexOf(activeCategoryId);
    const targetIndex = currentIds.indexOf(targetCategoryId);
    if (activeIndex < 0 || targetIndex < 0) {
      setDraggingCategoryId('');
      return;
    }
    const nextIds = [...currentIds];
    const [activeId] = nextIds.splice(activeIndex, 1);
    nextIds.splice(targetIndex, 0, activeId);
    setDraggingCategoryId('');
    reorderCategoryMutation.mutate(nextIds);
  };

  const getTemplateVersionRows = (row: TemplateModelingRecord) => (row.versions?.length ? row.versions : row.currentVersion ? [row.currentVersion] : []);

  const openTemplateDrawer = (row: TemplateModelingRecord) => {
    setDrawerRow(row);
    setDrawerVersionRow(null);
    setDrawerTab(0);
  };

  const openTemplateVersionDrawer = (row: TemplateModelingRecord, version: TemplateVersionRecord) => {
    setDrawerRow(row);
    setDrawerVersionRow(version);
    setDrawerTab(0);
  };

  const expandTemplateGroup = (templateId: string | number) => {
    const groupKey = String(templateId);
    setExpandedTemplateGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const expandAllTemplateGroups = () => {
    setExpandedTemplateGroups(new Set(rows.map((row) => String(row.id))));
  };

  const collapseAllTemplateGroups = () => {
    setExpandedTemplateGroups(new Set());
  };

  const renderTemplateCategoryPanel = () => (
    <Box data-template-category-panel sx={{ height: '100%', minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: '0 0 auto', minHeight: 48, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e4e7ed' }}>
        <Typography sx={{ fontWeight: 600, color: '#303133' }}>模板分类</Typography>
        <Tooltip title="新增分类" arrow>
          <IconButton size="small" color="primary" aria-label="新增分类" onClick={openCreateTemplateCategoryDialog}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Stack spacing={0.5} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
        {templateCategoryOptions.map((category) => {
          const selected = categoryId === category.value;
          return (
            <Box
              key={category.value}
              role="button"
              tabIndex={0}
              draggable={!category.system}
              onDragStart={(event) => handleTemplateCategoryDragStart(event, category)}
              onDragOver={(event) => {
                if (!category.system) event.preventDefault();
              }}
              onDrop={(event) => handleTemplateCategoryDrop(event, category)}
              onDragEnd={() => setDraggingCategoryId('')}
              onClick={() => selectTemplateCategory(category.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') selectTemplateCategory(category.value);
              }}
              sx={{ minHeight: 40, px: 1.25, display: 'grid', gridTemplateColumns: category.system ? 'minmax(0, 1fr) auto' : '24px minmax(0, 1fr) auto auto auto', alignItems: 'center', gap: 0.5, borderRadius: 1, cursor: category.system ? 'pointer' : 'grab', color: selected ? '#1890ff' : '#303133', bgcolor: selected ? '#e8f4ff' : 'transparent', opacity: draggingCategoryId === String(category.id) ? 0.55 : 1, '&:hover': { bgcolor: selected ? '#e8f4ff' : '#f5f7fa' } }}
            >
              {!category.system ? <DragIndicator data-template-category-drag-handle fontSize="small" sx={{ color: '#a8abb2' }} /> : null}
              <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selected ? 600 : 400 }}>{category.label}</Typography>
              <Typography variant="caption" sx={{ color: selected ? '#1890ff' : '#909399' }}>{category.count}</Typography>
              {!category.system ? (
                <>
                  <Tooltip title="编辑分类" arrow>
                    <IconButton
                      size="small"
                      aria-label="编辑分类"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditTemplateCategoryDialog(category);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除分类" arrow>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="删除分类"
                      onClick={(event) => {
                        event.stopPropagation();
                        requestDeleteTemplateCategory(category);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );

  const getColumnWidth = (column: TemplateColumn) => resolvedColumnWidths[column.id] ?? column.defaultWidth;

  const beginColumnResize = (event: MouseEvent, columnId: TemplateColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    const column = visibleColumns.find((item) => item.id === columnId);
    if (!column || column.resizable === false) return;
    const startX = event.clientX;
    const startWidth = getColumnWidth(column);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const nextWidth = Math.max(column.minWidth, startWidth + moveEvent.clientX - startX);
      setColumnWidths((current) => ({ ...current, [columnId]: nextWidth }));
    };
    const handleMouseUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const getTemplateVersionColumnWidth = (column: TemplateColumn) => resolvedTemplateVersionColumnWidths[column.id] ?? column.defaultWidth;

  const beginTemplateVersionColumnResize = (event: MouseEvent, columnId: TemplateColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    const column = visibleTemplateVersionColumns.find((item) => item.id === columnId);
    if (!column || column.resizable === false) return;
    const startX = event.clientX;
    const startWidth = getTemplateVersionColumnWidth(column);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const nextWidth = Math.max(column.minWidth, startWidth + moveEvent.clientX - startX);
      setTemplateVersionColumnWidths((current) => ({ ...current, [columnId]: nextWidth }));
    };
    const handleMouseUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const beginPageThumbnailResize = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = pageThumbnailWidth;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      setPageThumbnailWidth(Math.max(150, startWidth + moveEvent.clientX - startX));
    };
    const handleMouseUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleColumnSettingDragStart = (event: ReactDragEvent, columnId: ConfigurableTemplateColumnId) => {
    columnSettingDragSourceRef.current = columnId;
    setDraggingColumnId(columnId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnId);
  };

  const handleColumnSettingDragOver = (event: ReactDragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const moveColumnSetting = (sourceId: ConfigurableTemplateColumnId | null, targetId: ConfigurableTemplateColumnId) => {
    if (!sourceId || sourceId === targetId) return;
    setActiveColumnSettings((current) => {
      const nextOrder = current.order.filter((id) => id !== sourceId);
      const targetIndex = nextOrder.indexOf(targetId);
      nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, sourceId);
      return { ...current, order: nextOrder };
    });
  };

  const handleColumnSettingDrop = (event: ReactDragEvent, targetId: ConfigurableTemplateColumnId) => {
    event.preventDefault();
    moveColumnSetting(columnSettingDragSourceRef.current, targetId);
  };

  const handleColumnSettingDragEnd = () => {
    columnSettingDragSourceRef.current = null;
    setDraggingColumnId(null);
  };

  const beginColumnSettingPointerDrag = (event: ReactPointerEvent, columnId: ConfigurableTemplateColumnId) => {
    if (event.button !== 0) return;
    columnSettingDragSourceRef.current = columnId;
    setDraggingColumnId(columnId);
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const targetRow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('[data-template-column-settings-row]') as HTMLElement | null;
      const targetId = targetRow?.dataset.columnId as ConfigurableTemplateColumnId | undefined;
      if (targetId) moveColumnSetting(columnSettingDragSourceRef.current, targetId);
    };
    const handlePointerUp = () => {
      document.body.style.userSelect = previousUserSelect;
      columnSettingDragSourceRef.current = null;
      setDraggingColumnId(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const toggleColumnVisibility = (columnId: ConfigurableTemplateColumnId) => {
    setActiveColumnSettings((current) => {
      const hidden = current.hidden.includes(columnId)
        ? current.hidden.filter((id) => id !== columnId)
        : [...current.hidden, columnId];
      if (hidden.length >= current.order.length) return current;
      return { ...current, hidden };
    });
  };

  const renderMainTableActionSpacerCell = (layer: 'head' | 'body') => (
    hasMainTableSpacer ? (
      <TableCell
        data-template-main-action-spacer
        aria-hidden="true"
        sx={{
          width: mainTableSpacerWidth,
          minWidth: mainTableSpacerWidth,
          maxWidth: mainTableSpacerWidth,
          p: 0,
          bgcolor: layer === 'head' ? '#f5f7fa' : '#fff',
          ...(layer === 'head' ? { position: 'sticky', top: 0, zIndex: 5 } : {}),
        }}
      />
    ) : null
  );

  function getStickyActionColumnSx(column: TemplateColumn, layer: 'head' | 'body') {
    if (column.id !== 'actions') return {};
    return {
      position: 'sticky',
      right: 0,
      width: TEMPLATE_ACTION_COLUMN_WIDTH,
      minWidth: TEMPLATE_ACTION_COLUMN_WIDTH,
      maxWidth: TEMPLATE_ACTION_COLUMN_WIDTH,
      zIndex: layer === 'head' ? 10 : 6,
      bgcolor: layer === 'head' ? '#f5f7fa' : '#fff',
      backgroundClip: 'padding-box',
      boxShadow: '-6px 0 8px -8px rgba(0,0,0,.35)',
    };
  }

  const renderTemplateVersionActions = (row: TemplateModelingRecord, version: TemplateVersionRecord, canDeleteVersion: boolean) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      <Tooltip title="设计" arrow>
        <IconButton size="small" aria-label="设计" onClick={(event) => { event.stopPropagation(); openDesigner(row, version); }}>
          <DesignServices fontSize="small" />
        </IconButton>
      </Tooltip>
      {canDeleteVersion ? (
        <Tooltip title="删除" arrow>
          <IconButton size="small" color="error" aria-label="删除" onClick={(event) => { event.stopPropagation(); setDeleteVersionTarget({ row, version }); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );

  const renderTemplateGroupCell = (row: TemplateModelingRecord, column: TemplateColumn): string => {
    const columnId = column.id;
    if (columnId === 'name') return row.name || '-';
    if (columnId === 'code') return row.code || '-';
    if (columnId === 'currentVersion') return row.currentVersion?.version || '-';
    if (columnId === 'categoryName') return row.categoryName || '-';
    if (columnId === 'effectiveFrom') return formatDateTime(row.currentVersion?.effectiveFrom);
    if (columnId === 'effectiveTo') return formatDateTime(row.currentVersion?.effectiveTo);
    if (columnId === 'description') return row.description || '-';
    if (columnId === 'status') return getStatusLabel(row.status);
    if (columnId === 'createdAt' || columnId === 'updatedAt') return formatDateTime(row[columnId]);
    if (columnId === 'createdBy' || columnId === 'updatedBy') return row[columnId] || '-';
    return '-';
  };

  const renderTemplateVersionTable = (row: TemplateModelingRecord) => {
    const versions = getTemplateVersionRows(row);
    return (
      <TableRow key={`${row.id}:versions`} sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
        <TableCell colSpan={mainTableColSpan} sx={{ p: 0, bgcolor: '#fafcff' }}>
          <TableContainer sx={{ width: '100%', bgcolor: '#fff', overflow: 'visible' }}>
            <Table stickyHeader size="small" aria-label="表单模板版本列表" sx={{ tableLayout: 'fixed', width: totalTemplateVersionTableWidth, minWidth: totalTemplateVersionTableWidth }}>
              <colgroup>
                {visibleTemplateVersionColumns.map((column) => <col key={`${row.id}:${column.id}`} style={{ width: getTemplateVersionColumnWidth(column) }} />)}
              </colgroup>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                  {visibleTemplateVersionColumns.map((column) => (
                    <TableCell key={column.id} align={column.align} sx={{ width: getTemplateVersionColumnWidth(column), minWidth: column.minWidth, position: 'sticky', top: 0, zIndex: 5, userSelect: 'none', ...(column.resizable ? { pr: 2 } : {}), ...getStickyActionColumnSx(column, 'head') }}>
                      {column.label}
                      {column.resizable ? (
                        <Box
                          data-template-version-column-resizer
                          onMouseDown={(event) => beginTemplateVersionColumnResize(event, column.id)}
                          sx={{ position: 'absolute', top: 0, right: 0, zIndex: 3, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none', '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 18, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }}
                        />
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.length === 0 ? (
                  <TableRow sx={{ '& .MuiTableCell-root': tableBodyCellSx }}>
                    <TableCell colSpan={visibleTemplateVersionColumns.length} align="center" sx={{ color: '#909399' }}>暂无版本</TableCell>
                  </TableRow>
                ) : versions.map((versionRow) => (
                  <TableRow key={`${row.id}:${versionRow.id}`} hover onClick={() => openTemplateVersionDrawer(row, versionRow)} sx={{ cursor: 'pointer', '& .MuiTableCell-root': tableBodyCellSx }}>
                    {visibleTemplateVersionColumns.map((column) => {
                      const commonSx = {
                        width: getTemplateVersionColumnWidth(column),
                        minWidth: column.minWidth,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        ...getStickyActionColumnSx(column, 'body'),
                      };
                      const versionDescription = versionRow.description || '-';
                      return (
                        <TableCell key={column.id} align={column.align} sx={commonSx}>
                          {column.id === 'version' ? versionRow.version || '-' : column.id === 'status' ? (
                            renderStatusBadge(versionRow.status)
                          ) : column.id === 'effectiveFrom' ? formatDateTime(versionRow.effectiveFrom) : column.id === 'effectiveTo' ? formatDateTime(versionRow.effectiveTo) : column.id === 'description' ? versionDescription : column.id === 'createdBy' ? versionRow.createdBy || '-' : column.id === 'createdAt' ? formatDateTime(versionRow.createdAt) : column.id === 'updatedBy' ? versionRow.updatedBy || '-' : column.id === 'updatedAt' ? formatDateTime(versionRow.updatedAt) : column.id === 'actions' ? (
                            renderTemplateVersionActions(row, versionRow, versions.length > 1)
                          ) : ''}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TableCell>
      </TableRow>
    );
  };

  const renderTemplateTableRow = (row: TemplateModelingRecord) => {
    if (pageKey !== 'formTemplates') {
      return (
        <TableRow key={row.id} hover onClick={() => openTemplateDrawer(row)} sx={{ cursor: 'pointer' }}>
          {visibleColumns.map((column) => {
            const commonSx = {
              width: getColumnWidth(column),
              minWidth: column.minWidth,
              ...tableBodyCellSx,
              ...getStickyActionColumnSx(column, 'body'),
            };
            return (
              <Fragment key={column.id}>
                {column.id === 'actions' ? renderMainTableActionSpacerCell('body') : null}
                <TableCell align={column.align} data-template-main-action-column={column.id === 'actions' ? 'true' : undefined} sx={commonSx}>
                  {renderCell(row, column)}
                </TableCell>
              </Fragment>
            );
          })}
        </TableRow>
      );
    }

    const isExpanded = expandedTemplateGroups.has(String(row.id));
    return (
      <Fragment key={row.id}>
        <TableRow key={row.id} hover onClick={() => openTemplateDrawer(row)} sx={{ cursor: 'pointer' }}>
          {visibleColumns.map((column, index) => {
            const commonSx = {
              width: getColumnWidth(column),
              minWidth: column.minWidth,
              ...tableBodyCellSx,
              ...getStickyActionColumnSx(column, 'body'),
            };
            return (
              <Fragment key={column.id}>
                {column.id === 'actions' ? renderMainTableActionSpacerCell('body') : null}
                <TableCell align={column.align} data-template-main-action-column={column.id === 'actions' ? 'true' : undefined} sx={commonSx} title={column.id === 'actions' ? undefined : renderTemplateGroupCell(row, column)}>
                  {column.id === 'actions' ? renderCell(row, column) : index === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          expandTemplateGroup(row.id);
                        }}
                        sx={{ width: 24, height: 24, color: '#606266' }}
                      >
                        {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                      <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {renderTemplateGroupCell(row, column)}
                      </Typography>
                    </Box>
                  ) : column.id === 'status' ? (
                    renderStatusBadge(row.status)
                  ) : (
                    renderTemplateGroupCell(row, column)
                  )}
                </TableCell>
              </Fragment>
            );
          })}
        </TableRow>
        {isExpanded ? renderTemplateVersionTable(row) : null}
      </Fragment>
    );
  };

  const renderAddTemplateVersionAction = (row: TemplateModelingRecord) => (
    <Tooltip title="新增子版本" arrow>
      <IconButton size="small" aria-label="新增子版本" onClick={(event) => { event.stopPropagation(); openCreateTemplateVersionDialog(row); }}>
        <PlaylistAdd fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const canDeleteTemplateFromMainRow = (row: TemplateModelingRecord) => pageKey !== 'formTemplates' || getTemplateVersionRows(row).length <= 1;

  const renderCell = (row: TemplateModelingRecord, column: TemplateColumn): ReactNode => {
    const columnId = column.id;
    if (columnId === 'status') {
      return renderStatusBadge(row.status);
    }
    if (columnId === 'createdAt' || columnId === 'updatedAt') return formatDateTime(row[columnId]);
    if (columnId === 'currentVersion') return row.currentVersion?.version || '-';
    if (columnId === 'effectiveFrom') return formatDateTime(row.currentVersion?.effectiveFrom);
    if (columnId === 'effectiveTo') return formatDateTime(row.currentVersion?.effectiveTo);
    if (columnId === 'categoryName') return row.categoryName || '-';
    if (columnId === 'description') return row.description || '-';
    if (columnId === 'actions') {
      return (
        <Stack direction="row" spacing={0.5} justifyContent="center" onClick={(event) => event.stopPropagation()}>
          {pageKey === 'formTemplates' ? renderAddTemplateVersionAction(row) : null}
          <Tooltip title="编辑" arrow>
            <IconButton size="small" aria-label="编辑" onClick={() => openEditDialog(row)}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          {canDeleteTemplateFromMainRow(row) ? (
            <Tooltip title="删除" arrow>
              <IconButton size="small" color="error" aria-label="删除" onClick={() => setDeleteRowTarget(row)}><DeleteIcon fontSize="small" /></IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      );
    }
    if (columnId === 'name' || columnId === 'code' || columnId === 'createdBy' || columnId === 'updatedBy') return row[columnId] || '-';
    return '-';
  };

  const renderTemplateRightPanel = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1.5, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, p: 2, maxWidth: '100%', minWidth: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            label={pageKey === 'formTemplates' ? '表单名称' : '模板名称'}
            placeholder="请输入"
            value={nameKeyword}
            onChange={(event) => setNameKeyword(event.target.value)}
            sx={fieldSx}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
          <TextField
            size="small"
            label={pageKey === 'formTemplates' ? '表单编码' : '模板编码'}
            placeholder="请输入"
            value={codeKeyword}
            onChange={(event) => setCodeKeyword(event.target.value)}
            sx={fieldSx}
          />
          <TextField
            size="small"
            select
            label="状态"
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
            sx={fieldSx}
          >
            {TEMPLATE_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ gridColumn: { xs: '1', md: '3' } }}>
            <Button size="small" sx={QUERY_BUTTON_SX} variant="outlined" startIcon={<RestartAlt />} onClick={() => { setNameKeyword(''); setCodeKeyword(''); setStatus('ALL'); setPage(1); }}>重置</Button>
            <Button size="small" sx={QUERY_BUTTON_SX} variant="contained" startIcon={<Search />} onClick={() => setPage(1)}>查询</Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="字段设置" arrow>
              <IconButton
                data-template-column-settings-trigger
                size="small"
                aria-label="字段设置"
                onClick={(event) => setColumnSettingsAnchorEl(event.currentTarget)}
                sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}
              >
                <Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ViewColumnRounded sx={{ fontSize: 21 }} />
                  <TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} />
                </Box>
              </IconButton>
            </Tooltip>
            {pageKey === 'formTemplates' ? (
              <>
                <Tooltip title="全部展开" arrow>
                  <IconButton size="small" aria-label="全部展开" onClick={expandAllTemplateGroups} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}>
                    <UnfoldMoreRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="全部收起" arrow>
                  <IconButton size="small" aria-label="全部收起" onClick={collapseAllTemplateGroups} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}>
                    <UnfoldLessRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : null}
          </Stack>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>新增</Button>
        </Stack>

        <Popover
          open={Boolean(columnSettingsAnchorEl)}
          anchorEl={columnSettingsAnchorEl}
          onClose={() => setColumnSettingsAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { mt: 1, width: 220, border: '1px solid #e4e7ed', borderRadius: 1, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } }}
        >
          <Stack data-template-column-settings-panel spacing={0.5} sx={{ p: 1.5 }}>
            {pageKey === 'formTemplates' ? (
              <Tabs value={columnSettingsTab} onChange={(_, value: TemplateColumnSettingsTarget) => setColumnSettingsTab(value)} aria-label={`${config.title}字段设置切换`} sx={{ minHeight: 32, mb: 0.5, '& .MuiTab-root': { minHeight: 32, py: 0, fontSize: 13 } }}>
                <Tab label="主表" value="main" />
                <Tab label="子表" value="version" />
              </Tabs>
            ) : null}
            {activeColumnSettingsItems.map((column) => {
              const checked = !activeColumnSettings.hidden.includes(column.id);
              const disabled = checked && activeVisibleConfigurableColumnCount <= 1;
              return (
                <Box
                  key={column.id}
                  data-template-column-settings-row
                  data-column-id={column.id}
                  draggable
                  onDragStart={(event) => handleColumnSettingDragStart(event, column.id)}
                  onDragOver={handleColumnSettingDragOver}
                  onDrop={(event) => handleColumnSettingDrop(event, column.id)}
                  onDragEnd={handleColumnSettingDragEnd}
                  onPointerDown={(event) => beginColumnSettingPointerDrag(event, column.id)}
                  sx={{ display: 'grid', gridTemplateColumns: '24px 34px minmax(0, 1fr)', alignItems: 'center', minHeight: 40, borderRadius: 1, cursor: 'move', touchAction: 'none', color: checked ? '#1890ff' : '#a8abb2', opacity: draggingColumnId === column.id ? 0.55 : 1, '&:hover': { bgcolor: '#f5f7fa' } }}
                >
                  <DragIndicator fontSize="small" sx={{ color: '#909399' }} />
                  <input
                    aria-label={`${column.label}字段显隐`}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleColumnVisibility(column.id)}
                    onClick={(event) => event.stopPropagation()}
                    style={{ width: 16, height: 16 }}
                  />
                  <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{column.label}</Typography>
                </Box>
              );
            })}
          </Stack>
        </Popover>

        <Box sx={{ position: 'relative', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0 }}>
          <TableContainer ref={tableContainerRef} sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', minHeight: 0, overflow: 'auto' }}>
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: effectiveMainTableWidth, minWidth: effectiveMainTableWidth, height: isTableEmptyState ? '100%' : 'auto' }}>
              <colgroup>
                {visibleColumns.map((column) => (
                  column.id === 'actions' ? (
                    <Fragment key={column.id}>
                      {hasMainTableSpacer ? <col data-template-main-action-spacer style={{ width: mainTableSpacerWidth }} /> : null}
                      <col style={{ width: getColumnWidth(column) }} />
                    </Fragment>
                  ) : <col key={column.id} style={{ width: getColumnWidth(column) }} />
                ))}
              </colgroup>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                  {visibleColumns.map((column) => (
                    <Fragment key={column.id}>
                      {column.id === 'actions' ? renderMainTableActionSpacerCell('head') : null}
                      <TableCell align={column.align} data-template-main-action-column={column.id === 'actions' ? 'true' : undefined} sx={{ width: getColumnWidth(column), minWidth: column.minWidth, position: 'sticky', top: 0, zIndex: 5, userSelect: 'none', ...(column.resizable ? { pr: 2 } : {}), ...getStickyActionColumnSx(column, 'head') }}>
                        {column.label}
                        {column.resizable ? (
                          <Box
                            data-template-column-resizer
                            onMouseDown={(event) => beginColumnResize(event, column.id)}
                            sx={{ position: 'absolute', top: 0, right: 0, zIndex: 3, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none', '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 18, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }}
                          />
                        ) : null}
                      </TableCell>
                    </Fragment>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody sx={{ height: isTableEmptyState ? '100%' : 'auto' }}>
                {listQuery.isLoading ? (
                  <TableRow sx={emptyTableRowSx}><TableCell colSpan={mainTableColSpan} align="center" sx={emptyTableBodyCellSx}><CircularProgress size={24} /></TableCell></TableRow>
                ) : listQuery.isError ? (
                  <TableRow sx={emptyTableRowSx}><TableCell colSpan={mainTableColSpan} align="center" sx={emptyTableBodyCellSx}>加载失败</TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow sx={emptyTableRowSx}><TableCell colSpan={mainTableColSpan} align="center" sx={emptyTableBodyCellSx}>暂无数据</TableCell></TableRow>
                ) : rows.map((row) => renderTemplateTableRow(row))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ minHeight: 56, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography sx={{ color: '#909399' }}>共 {listQuery.data?.totalElements ?? 0} 条数据</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Pagination page={page} count={pageCount} color="primary" size="small" onChange={(_, value) => setPage(value)} />
            <FormControl size="small" sx={{ minWidth: 116 }}>
              <Select
                value={pageSize}
                onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
                sx={{ height: 32, fontSize: 14 }}
              >
                {PAGE_SIZE_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option} 条/页</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const auditEvents = auditQuery.data ?? [];
  const auditRecords = getAuditRecords(auditEvents);
  const drawerBaseDetailRows: Array<[string, ReactNode]> = drawerVersionRow ? [
    ['模板名称', drawerRow?.name],
    ['模板编码', drawerRow?.code],
    ['版本号', drawerVersionRow.version],
    ['版本状态', renderStatusBadge(drawerVersionRow.status)],
    ['生效时间', formatDateTime(drawerVersionRow.effectiveFrom)],
    ['失效时间', formatDateTime(drawerVersionRow.effectiveTo)],
    ['源文件名称', drawerVersionRow.sourceFileName],
    ['源文件类型', drawerVersionRow.sourceFileType],
    ['导入状态', drawerVersionRow.importStatus],
  ] : [
    ['模板名称', drawerRow?.name],
    ['模板编码', drawerRow?.code],
    ['当前版本', drawerRow?.currentVersion?.version],
    ['模板分类', drawerRow?.categoryName],
    ['生效时间', formatDateTime(drawerRow?.currentVersion?.effectiveFrom)],
    ['失效时间', formatDateTime(drawerRow?.currentVersion?.effectiveTo)],
    ['状态', renderStatusBadge(drawerRow?.status)],
    ['模板描述', drawerRow?.description],
  ];
  const drawerSystemDetailRows: Array<[string, ReactNode]> = drawerVersionRow ? [
    ['创建人', drawerVersionRow.createdBy],
    ['创建时间', formatDateTime(drawerVersionRow.createdAt)],
    ['更新人', drawerVersionRow.updatedBy || drawerVersionRow.createdBy],
    ['更新时间', formatDateTime(drawerVersionRow.updatedAt || drawerVersionRow.createdAt)],
  ] : [
    ['创建人', drawerRow?.createdBy],
    ['创建时间', formatDateTime(drawerRow?.createdAt)],
    ['更新人', drawerRow?.updatedBy || drawerRow?.createdBy],
    ['更新时间', formatDateTime(drawerRow?.updatedAt || drawerRow?.createdAt)],
  ];
  const closeDetailDrawer = () => {
    setDrawerRow(null);
    setDrawerVersionRow(null);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 150px)', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '260px minmax(0, 1fr)' }, gap: 1.5, minHeight: 0, overflow: 'hidden' }}>
      {renderTemplateCategoryPanel()}
      {renderTemplateRightPanel()}

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setCreatingVersionFrom(null); }} fullWidth maxWidth="sm">
        <DialogTitle>{creatingVersionFrom ? '新增子版本' : editingRow ? config.editTitle : config.createTitle}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            {creatingVersionFrom ? null : (
              <DetailSection title="基础信息">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField required fullWidth size="small" label={pageKey === 'formTemplates' ? '表单名称' : '模板名称'} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} sx={fieldSx} />
                  <TextField required fullWidth size="small" label={pageKey === 'formTemplates' ? '表单编码' : '模板编码'} value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} sx={fieldSx} />
                  <Autocomplete
                    freeSolo
                    options={categoryOptions}
                    value={form.categoryName}
                    noOptionsText="暂无数据"
                    onInputChange={(_, value) => setForm((current) => ({ ...current, categoryName: value }))}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" label="模板分类" sx={fieldSx} />}
                  />
                  <TextField fullWidth size="small" select label="状态" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} sx={fieldSx}>
                    {TEMPLATE_FORM_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </TextField>
                  <TextField fullWidth size="small" label={pageKey === 'formTemplates' ? '表单描述' : '模板描述'} multiline minRows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }} />
                </Box>
              </DetailSection>
            )}
            {pageKey === 'formTemplates' ? (
              <DetailSection title="版本信息">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField required fullWidth size="small" label="版本" value={form.version} onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))} sx={fieldSx} />
                  <TextField fullWidth size="small" label="生效时间" type="datetime-local" value={form.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} inputRef={effectiveFromInputRef} InputLabelProps={{ shrink: true }} sx={fieldSx} />
                  <TextField fullWidth size="small" label="失效时间" type="datetime-local" value={form.effectiveTo} onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))} inputRef={effectiveToInputRef} InputLabelProps={{ shrink: true }} sx={fieldSx} />
                  <TextField fullWidth size="small" label="版本说明" multiline minRows={3} value={form.versionDescription} onChange={(event) => setForm((current) => ({ ...current, versionDescription: event.target.value }))} sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }} />
                </Box>
              </DetailSection>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setCreatingVersionFrom(null); }}>取消</Button>
          <Button variant="contained" disabled={saveMutation.isPending} onClick={() => handleSubmit(false)}>保存</Button>
          {pageKey === 'formTemplates' ? <Button variant="contained" disabled={saveMutation.isPending} onClick={() => handleSubmit(true)}>保存并设计</Button> : null}
        </DialogActions>
      </Dialog>

      <Dialog open={categoryDialog.open} onClose={() => setCategoryDialog({ open: false, target: null, name: '' })} fullWidth maxWidth="xs">
        <DialogTitle>{categoryDialog.target ? '编辑分类' : '新增分类'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField fullWidth autoFocus label="分类名称" value={categoryDialog.name} onChange={(event) => setCategoryDialog((current) => ({ ...current, name: event.target.value }))} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog({ open: false, target: null, name: '' })}>取消</Button>
          <Button variant="contained" disabled={!categoryDialog.name.trim() || saveCategoryMutation.isPending} onClick={() => saveCategoryMutation.mutate()}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteCategoryTarget !== null} onClose={() => setDeleteCategoryTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>删除分类</DialogTitle>
        <DialogContent>确认删除分类“{deleteCategoryTarget?.name}”吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCategoryTarget(null)}>取消</Button>
          <Button color="error" variant="contained" disabled={!deleteCategoryTarget || deleteCategoryMutation.isPending} onClick={() => deleteCategoryTarget && deleteCategoryMutation.mutate(deleteCategoryTarget)}>删除</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteRowTarget !== null} onClose={() => setDeleteRowTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>删除模板</DialogTitle>
        <DialogContent>确认删除模板“{deleteRowTarget?.name}”吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRowTarget(null)}>取消</Button>
          <Button color="error" variant="contained" disabled={!deleteRowTarget || deleteMutation.isPending} onClick={() => deleteRowTarget && deleteMutation.mutate(deleteRowTarget)}>删除</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteVersionTarget !== null} onClose={() => setDeleteVersionTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>删除版本</DialogTitle>
        <DialogContent>确认删除版本“{deleteVersionTarget?.version.version}”吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVersionTarget(null)}>取消</Button>
          <Button color="error" variant="contained" disabled={!deleteVersionTarget || deleteVersionMutation.isPending} onClick={() => deleteVersionTarget && deleteVersionMutation.mutate(deleteVersionTarget)}>删除</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={drawerRow !== null}
        onClose={closeDetailDrawer}
        sx={appContentDrawerSx}
        slotProps={{ backdrop: { sx: appContentDrawerSx } }}
        PaperProps={{ sx: appContentDrawerPaperSx }}
      >
        <Box sx={{ width: { xs: '100vw', sm: 560 }, p: 2, bgcolor: '#f7f9fc', minHeight: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>信息查看</Typography>
            <IconButton size="small" onClick={closeDetailDrawer} aria-label="关闭详情"><CloseIcon /></IconButton>
          </Stack>
          {!drawerRow ? null : (
            <>
              <Box sx={{ mt: 1, borderBottom: '1px solid #e4e7ed' }}>
                <Tabs value={drawerTab} onChange={(_, value: number) => setDrawerTab(value)} aria-label={`${config.title}详情切换`}>
                  <Tab label="数据信息" />
                  <Tab label="数据审计" />
                </Tabs>
              </Box>
              {drawerTab === 0 ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <DetailSection title="基本信息">
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                      {drawerBaseDetailRows.map(([label, value]) => (
                        <DetailField key={label} label={label}>{value || '-'}</DetailField>
                      ))}
                    </Box>
                  </DetailSection>
                  <DetailSection title="系统信息">
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                      {drawerSystemDetailRows.map(([label, value]) => (
                        <DetailField key={label} label={label}>{value || '-'}</DetailField>
                      ))}
                    </Box>
                  </DetailSection>
                </Stack>
              ) : null}
              {drawerTab === 1 ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <DetailSection title="审计记录">
                    <Stack spacing={1}>
                      {auditQuery.isLoading ? (
                        <Box sx={{ px: 1.5, py: 3, textAlign: 'center', color: '#909399', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: '4px' }}>
                          <Typography variant="body2">审计记录加载中</Typography>
                        </Box>
                      ) : auditQuery.isError ? (
                        <Box sx={{ px: 1.5, py: 3, textAlign: 'center', color: '#f56c6c', bgcolor: '#fff', border: '1px solid #fbc4c4', borderRadius: '4px' }}>
                          <Typography variant="body2">审计记录加载失败</Typography>
                        </Box>
                      ) : auditRecords.length === 0 ? (
                        <Box sx={{ px: 1.5, py: 3, textAlign: 'center', color: '#909399', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: '4px' }}>
                          <Typography variant="body2">暂无审计记录</Typography>
                        </Box>
                      ) : auditRecords.map((record) => (
                        <Accordion key={record.id} data-audit-accordion-row={record.id} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', bgcolor: '#fff', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />} sx={{ minHeight: 44, px: 1.5, '&.Mui-expanded': { minHeight: 44 }, '& .MuiAccordionSummary-content': { m: 0, minWidth: 0 }, '& .MuiAccordionSummary-content.Mui-expanded': { m: 0 } }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.35fr', columnGap: 1, width: '100%', minWidth: 0, alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.operatorName}</Typography>
                              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.actionLabel}</Typography>
                              <Typography variant="body2" sx={{ color: '#606266', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDateTime(record.operatedAt)}</Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                              <AuditFieldBlock title="变更前" fields={record.beforeFields} />
                              <AuditFieldBlock title="变更后" fields={record.afterFields} />
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </DetailSection>
                </Stack>
              ) : null}
            </>
          )}
        </Box>
      </Drawer>

      {designerRecord ? (
        <Box
          data-form-template-designer
          data-form-template-designer-fullscreen
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: (theme) => theme.zIndex.modal + 10,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            bgcolor: '#f2f3f5',
            color: '#303133',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack data-form-template-top-toolbar direction="row" alignItems="center" sx={{ height: 50, minHeight: 50, px: 1, bgcolor: '#fff', borderBottom: '1px solid #e4e7ed', gap: 1, overflow: 'hidden' }}>
            <Button size="small" variant="text" startIcon={<ArrowBackIosNewRounded fontSize="small" />} onClick={() => { setDesignerRecord(null); setSelectedCanvasTarget(null); setFieldPreviewValues({}); }} sx={{ color: '#303133', minWidth: 100, px: 1, '& .MuiButton-startIcon': { mr: 0.5 } }}>
              返回列表页
            </Button>
            <Box data-form-template-title-divider sx={{ width: '1px', height: 20, bgcolor: '#dcdfe6', mx: 0.5 }} />
            <Typography data-form-template-toolbar-title variant="caption" sx={{ color: '#606266', minWidth: 126, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {designerRecord.name || '-'}：{designerRecord.currentVersion?.version || '-'}
            </Typography>
            <Stack data-form-template-file-import-actions direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-end', overflow: 'hidden' }}>
              <Box data-form-template-file-import-divider sx={{ width: '1px', height: 20, bgcolor: '#dcdfe6', mx: 0.25 }} />
              <Button
                size="small"
                variant="text"
                startIcon={importMutation.isPending ? <CircularProgress color="inherit" size={14} /> : <UploadFile fontSize="small" />}
                disabled={importMutation.isPending}
                onClick={openTemplateSourceFilePicker}
                sx={{ color: '#606266', minWidth: 84 }}
              >
                {importMutation.isPending ? '导入中...' : '文件导入'}
              </Button>
              <input
                ref={templateSourceFileInputRef}
                hidden
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleTemplateSourceFileSelected(file);
                  event.target.value = '';
                }}
              />
              <Button
                data-form-template-onlyoffice-entry
                size="small"
                variant="text"
                disabled={onlyOfficeConfigMutation.isPending || !designerRecord.currentVersion?.sourceFileId}
                onClick={() => onlyOfficeConfigMutation.mutate()}
                sx={{ color: '#606266', minWidth: 96 }}
              >
                原文编辑/预览
              </Button>
              <Box data-form-template-file-import-end-divider sx={{ width: '1px', height: 20, bgcolor: '#dcdfe6', mx: 0.25 }} />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 232, justifyContent: 'flex-end' }}>
              <Stack data-form-template-collaborator-avatars direction="row" alignItems="center" sx={{ minWidth: 58 }}>
                {['管', '质', '审'].map((name, index) => (
                  <Box key={name} sx={{ width: 24, height: 24, ml: index === 0 ? 0 : -1.75, zIndex: 10 - index, borderRadius: '50%', bgcolor: ['#303133', '#e6a23c', '#409eff'][index], color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxSizing: 'border-box' }}>{name}</Box>
                ))}
              </Stack>
              <Box data-form-template-collaborator-divider sx={{ width: '1px', height: 20, bgcolor: '#dcdfe6', mx: 0.25 }} />
              <IconButton size="small" aria-label="添加协作者"><AddIcon fontSize="small" /></IconButton>
              <Button size="small" variant="contained" disabled={saveDesignMutation.isPending} onClick={() => saveDesignMutation.mutate()} sx={{ minWidth: 74, height: 30 }}>
                保存设计
              </Button>
              <IconButton size="small" aria-label="更多保存选项"><ExpandMoreIcon fontSize="small" /></IconButton>
            </Stack>
          </Stack>

          <Box data-form-template-metadata-bar sx={{ height: 40, minHeight: 40, px: 1.5, bgcolor: '#fff', borderBottom: '1px solid #e4e7ed', display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <Stack data-form-template-toolbar-controls direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', overflow: 'hidden' }}>
              <Select size="small" value="默认字体" sx={{ height: 28, width: 92, fontSize: 12 }}>
                <MenuItem value="默认字体">默认字体</MenuItem>
              </Select>
              <Select size="small" value="12" sx={{ height: 28, width: 58, fontSize: 12 }}>
                <MenuItem value="12">12</MenuItem>
              </Select>
              <IconButton size="small" aria-label="加粗"><FormatBoldRounded fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="斜体"><FormatItalicRounded fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="下划线"><FormatUnderlinedRounded fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="左对齐"><FormatAlignLeftRounded fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="居中"><FormatAlignCenterRounded fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="右对齐"><FormatAlignRightRounded fontSize="small" /></IconButton>
              <Box data-form-template-toolbar-divider sx={{ width: '1px', height: 24, bgcolor: '#dcdfe6', mx: 0.75 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: '#c0c4cc', ml: 'auto', whiteSpace: 'nowrap' }}>13:00:37 已触发自动保存</Typography>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
            <Stack data-form-template-tool-rail sx={{ width: 50, minWidth: 50, bgcolor: '#fff', borderRight: '1px solid #e4e7ed', alignItems: 'center', py: 1, gap: 1 }}>
              <Tooltip title="页面" arrow placement="right"><IconButton data-form-template-page-thumbnail-opener size="small" onClick={() => setPageThumbnailsOpen(true)} sx={{ width: 50, height: 50, borderRadius: 0, bgcolor: pageThumbnailsOpen ? '#ecf5ff' : 'transparent', color: pageThumbnailsOpen ? '#1677ff' : '#606266', '&:hover': { bgcolor: '#ecf5ff' } }}><ArticleOutlined fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="文字" arrow placement="right"><IconButton data-form-template-add-text-tool size="small" onClick={() => addCanvasTextLayer()} draggable onDragStart={(event) => handleCanvasToolDragStart(event, { kind: 'text' })} sx={{ width: 50, height: 50, borderRadius: 0 }}><Typography sx={{ width: 50, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Aa</Typography></IconButton></Tooltip>
              <Tooltip title="字段" arrow placement="right"><IconButton data-form-template-add-field-tool size="small" onClick={addInteractiveFieldToCanvas} draggable onDragStart={(event) => handleCanvasToolDragStart(event, { kind: 'field' })} sx={{ width: 50, height: 50, borderRadius: 0 }}><TuneRounded fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="流程" arrow placement="right"><IconButton size="small" sx={{ width: 50, height: 50, borderRadius: 0 }}><PlaylistAdd fontSize="small" /></IconButton></Tooltip>
            </Stack>

            {pageThumbnailsOpen ? (
            <Box data-form-template-page-thumbnails sx={{ position: 'relative', width: pageThumbnailWidth, minWidth: pageThumbnailWidth, bgcolor: '#fff', borderRight: '1px solid #dcdfe6', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, height: 34, minHeight: 34, borderBottom: '1px solid #ebeef5' }}>
                <Typography variant="caption" sx={{ color: '#303133' }}>分页缩略图</Typography>
                <IconButton size="small" aria-label="关闭缩略图" onClick={() => setPageThumbnailsOpen(false)}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
              </Stack>
              <Stack spacing={1.25} sx={{ p: 1, overflow: 'auto', minHeight: 0, alignItems: 'center' }}>
                {templateCanvasPages.map((canvasPage) => {
                  const backgroundSrc = resolveCanvasBackgroundSrc(canvasPage, backgroundObjectUrls);
                  return (
                    <Box data-form-template-page-thumbnail-card key={canvasPage.id} onClick={() => setActiveCanvasPageId(canvasPage.id)} sx={{ width: 'clamp(96px, calc(100% - 54px), 220px)', minHeight: 86, bgcolor: activeCanvasPage.id === canvasPage.id ? '#ecf5ff' : '#d9d9d9', border: activeCanvasPage.id === canvasPage.id ? '1px solid #409eff' : '1px solid transparent', borderRadius: '2px', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, boxSizing: 'border-box', cursor: 'pointer' }}>
                      <Box data-form-template-page-thumbnail-preview sx={{ width: '72%', aspectRatio: `${canvasPage.width || 70} / ${canvasPage.height || 54}`, flexShrink: 0, bgcolor: '#fff', border: '1px solid #ebeef5', boxSizing: 'border-box', overflow: 'hidden' }}>
                        {backgroundSrc ? <Box component="img" alt={`第 ${canvasPage.pageNumber} 页`} src={backgroundSrc} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#303133', lineHeight: 1 }}>第 {canvasPage.pageNumber} 页</Typography>
                    </Box>
                  );
                })}
              </Stack>
              <Box
                data-form-template-page-thumbnail-resizer
                onMouseDown={beginPageThumbnailResize}
                sx={{ position: 'absolute', top: 0, right: 0, zIndex: 4, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none', '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 32, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }}
              />
            </Box>
            ) : null}

            <Box data-form-template-editor-canvas sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto', bgcolor: '#f2f3f5', p: 3.5 }}>
              <Stack spacing={3} sx={{ minWidth: 720, alignItems: shouldLeftAlignCanvasPages ? 'flex-start' : 'center' }}>
                {templateCanvasPages.map((canvasPage) => {
                  const pageFields = interactiveFields.filter((field) => field.pageId === canvasPage.id);
                  const pageLayers = canvasPage.layers ?? [];
                  const backgroundSrc = resolveCanvasBackgroundSrc(canvasPage, backgroundObjectUrls);
                  const pageVisualWidth = resolveTemplateCanvasPageWidth(canvasPage, templateCanvasDesign.source);
                  return (
                    <Box
                      data-form-template-editor-page
                      data-form-template-canvas-page
                      key={`${canvasRenderKey}-${canvasPage.id}`}
                      onClick={() => setSelectedCanvasTarget(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleCanvasPageDrop(event, canvasPage)}
                      sx={{
                        position: 'relative',
                        width: pageVisualWidth,
                        maxWidth: 'none',
                        minWidth: pageVisualWidth,
                        aspectRatio: `${canvasPage.width || 595} / ${canvasPage.height || 842}`,
                        bgcolor: '#fff',
                        border: '1px solid #d8dce5',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <Box data-form-template-background-layer sx={{ position: 'absolute', inset: 0, bgcolor: '#fff' }}>
                        {backgroundSrc ? <Box component="img" alt={`第 ${canvasPage.pageNumber} 页背景`} src={backgroundSrc} sx={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} /> : null}
                      </Box>
                      {pageLayers.map((layer: TemplateCanvasLayer) => {
                        const selected = selectedCanvasTarget?.type === 'layer' && selectedCanvasTarget.pageId === canvasPage.id && selectedCanvasTarget.id === layer.id;
                        const target = { type: 'layer' as const, pageId: canvasPage.id, id: layer.id };
                        return renderTemplateCanvasLayer(
                          layer,
                          canvasPage,
                          backgroundObjectUrls,
                          selected,
                          () => setSelectedCanvasTarget(target),
                          (event) => beginCanvasTargetDrag(event, target, canvasPage),
                        );
                      })}
                      {pageFields.map((field: TemplateInteractiveField) => (
                        <Tooltip key={field.id} title={`${field.name || field.code}${field.required ? ' · 必填' : ''}`} arrow>
                          <Box
                            data-form-template-field-overlay
                            data-form-template-selected-layer={selectedCanvasTarget?.type === 'field' && selectedCanvasTarget.pageId === canvasPage.id && selectedCanvasTarget.id === field.id ? true : undefined}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedCanvasTarget({ type: 'field', pageId: canvasPage.id, id: field.id });
                            }}
                            onPointerDown={(event) => {
                              event.stopPropagation();
                              setSelectedCanvasTarget({ type: 'field', pageId: canvasPage.id, id: field.id });
                              beginCanvasTargetDrag(event, { type: 'field', pageId: canvasPage.id, id: field.id }, canvasPage);
                            }}
                            sx={{
                              position: 'absolute',
                              left: coordinatePercent(field.x, canvasPage.width),
                              top: coordinatePercent(field.y, canvasPage.height),
                              width: dimensionPercent(field.width, canvasPage.width),
                              height: dimensionPercent(field.height, canvasPage.height),
                              minWidth: 42,
                              minHeight: 22,
                              border: '1px solid #409eff',
                              bgcolor: 'rgba(64, 158, 255, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              p: 0.25,
                              boxSizing: 'border-box',
                              cursor: 'move',
                              overflow: 'hidden',
                              outline: selectedCanvasTarget?.type === 'field' && selectedCanvasTarget.pageId === canvasPage.id && selectedCanvasTarget.id === field.id ? '2px solid #1677ff' : 'none',
                              outlineOffset: 1,
                              '&:hover': { boxShadow: '0 0 0 2px rgba(64, 158, 255, 0.18)' },
                            }}
                          >
                            {renderTemplateInteractiveFieldControl(
                              field,
                              fieldPreviewValues[field.code] ?? fieldPreviewValues[field.id] ?? '',
                              (value) => updateFieldPreviewValue(field, value),
                            )}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        </Box>
      ) : null}

      <Dialog open={onlyOfficeDialog.open} onClose={() => setOnlyOfficeDialog({ open: false, config: null })} fullScreen sx={onlyOfficeDialogSx}>
        <Box sx={{ height: 48, px: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e4e7ed', bgcolor: '#fff' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, flex: 1 }}>原文编辑/预览</Typography>
          <Tooltip title={onlyOfficeSyncDisabledReason || ''} arrow>
            <span>
              <Button
                data-form-template-onlyoffice-reparse
                size="small"
                variant="contained"
                startIcon={reparseSourceMutation.isPending ? <CircularProgress color="inherit" size={14} /> : <RestartAlt fontSize="small" />}
                disabled={onlyOfficeSyncDisabled}
                onClick={() => reparseSourceMutation.mutate()}
                sx={{ mr: 1, height: 30, minWidth: 108 }}
              >
                同步到画布
              </Button>
            </span>
          </Tooltip>
          <IconButton aria-label="关闭原文预览" onClick={() => setOnlyOfficeDialog({ open: false, config: null })}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box ref={onlyOfficeContainerRef} data-form-template-onlyoffice-frame sx={{ flex: 1, minHeight: 0, height: 'calc(100vh - 48px)', bgcolor: '#fff' }} />
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
