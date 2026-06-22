import {
  type DragEvent as ReactDragEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
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
import {
  Add,
  Close,
  Delete,
  DragIndicator,
  Edit,
  ExpandLess,
  ExpandMore,
  PlaylistAdd,
  RestartAlt,
  Search,
  TuneRounded,
  UnfoldLessRounded,
  UnfoldMoreRounded,
  ViewColumnRounded,
} from '@mui/icons-material';
import StatusBadge from '@/components/StatusBadge';
import {
  createMaterial,
  createProcessDocument,
  createProcessOperation,
  createProcessProductFamily,
  createProcessRoute,
  deleteMaterial,
  deleteProcessDocument,
  deleteProcessOperation,
  deleteProcessProductFamily,
  deleteProcessRoute,
  getMaterials,
  getProcessDocuments,
  getProcessOperations,
  getProcessProductFamilies,
  getProcessRoutes,
  getProducts,
  type MaterialRecord,
  updateMaterial,
  updateProcessDocument,
  updateProcessOperation,
  updateProcessProductFamily,
  updateProcessRoute,
  type ProcessModelingEntityType,
  type ProcessModelingPayload,
  type ProcessModelingQuery,
  type ProcessModelingRecord,
} from '@/api/master-data';
import { getAuditLogs, type AuditLogItem } from '@/api/audit';
import type { PageResult } from '@/types/common';

type ProcessModelingPageKey =
  | 'materials'
  | 'operations'
  | 'routes'
  | 'products'
  | 'productFamilies'
  | 'documents';

type ProcessColumnId =
  | 'name'
  | 'code'
  | 'specification'
  | 'materialTypeId'
  | 'materialPurpose'
  | 'effectiveVersionCount'
  | 'effectiveDate'
  | 'expiryDate'
  | 'productFamilyId'
  | 'unit'
  | 'version'
  | 'fileReference'
  | 'description'
  | 'defaultDurationMinutes'
  | 'sortOrder'
  | 'status'
  | 'createdBy'
  | 'createdAt'
  | 'updatedBy'
  | 'updatedAt'
  | 'actions';

type ConfigurableProcessColumnId = Exclude<ProcessColumnId, 'actions'>;
type ColumnSettingsTarget = 'main' | 'materialVersion';
type DeleteTargetScope = 'record' | 'material' | 'materialVersion';

interface ProcessColumn {
  id: ProcessColumnId;
  label: string;
  defaultWidth: number;
  minWidth: number;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
}

type ProcessColumnLabelOverrides = Partial<Record<ConfigurableProcessColumnId, string>>;
type MaterialDialogMode = 'createMaterial' | 'editMaterial' | 'createVersion' | 'editVersion';

interface ProcessColumnSettingsConfig {
  columns: ProcessColumn[];
}

interface ProcessColumnSettings {
  version: number;
  order: ConfigurableProcessColumnId[];
  hidden: ConfigurableProcessColumnId[];
}

type ProcessColumnWidths = Partial<Record<ProcessColumnId, number>>;

interface ProcessFormField {
  id: keyof ProcessModelingPayload;
  label: string;
  required?: boolean;
  multiline?: boolean;
  type?: 'number' | 'text';
}

interface ProcessModelingPageConfig {
  title: string;
  entityType: ProcessModelingEntityType;
  listQueryKey: string;
  auditQueryKey: string;
  columns: ProcessColumn[];
  formFields: ProcessFormField[];
  labels?: ProcessColumnLabelOverrides;
  readOnly?: boolean;
  derivedFrom?: string;
  list: (params: ProcessModelingQuery) => Promise<{ data: { data: PageResult<ProcessModelingRecord> } }>;
  create?: (body: ProcessModelingPayload) => Promise<{ data: { data: ProcessModelingRecord } }>;
  update?: (id: string | number, body: ProcessModelingPayload) => Promise<{ data: { data: ProcessModelingRecord } }>;
  remove?: (id: string | number) => Promise<unknown>;
}

interface ProcessFilters {
  keyword: string;
  materialName: string;
  materialCode: string;
  materialTypeName: string;
  status: string;
}

interface ProcessAuditRecord {
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

interface MaterialGroupRow {
  id: string;
  groupKey: string;
  materialGroupDisplayName: string;
  code: string;
  status: string;
  versionCount: number;
  effectiveVersionCount: number;
  latestVersion: MaterialRecord;
  versions: MaterialRecord[];
}

interface DrawerAuditTarget {
  entityIds: Array<string | number>;
}

type ProcessTableRow = ProcessModelingRecord | MaterialGroupRow;

const PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;
const TABLE_DATA_ROW_HEIGHT = 40;
const PROCESS_MODELING_COLUMN_WIDTH_STORAGE_PREFIX = 'process-modeling-column-widths:';
const PROCESS_MODELING_COLUMN_SETTINGS_STORAGE_PREFIX = 'process-modeling-column-settings:';
const PROCESS_MODELING_MATERIAL_VERSION_COLUMN_WIDTH_STORAGE_PREFIX = 'process-modeling-material-version-column-widths:';
const PROCESS_MODELING_MATERIAL_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX = 'process-modeling-material-version-column-settings:';
const PROCESS_MODELING_COLUMN_SETTINGS_VERSION = 1;
const PROCESS_FIELD_COLUMN_MIN_WIDTH = 80;
const PROCESS_ACTION_COLUMN_WIDTH = 112;
const QUERY_BUTTON_SX = { height: 40, width: 80, minWidth: 80 };
const MATERIAL_BASE_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['name', 'code', 'specification', 'materialTypeId', 'unit', 'materialPurpose'];
const MATERIAL_VERSION_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['version', 'effectiveDate', 'expiryDate', 'description'];
const PROCESS_SYSTEM_COLUMNS: Record<'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt', ProcessColumn> = {
  createdBy: { id: 'createdBy', label: '创建人', defaultWidth: 140, minWidth: PROCESS_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  createdAt: { id: 'createdAt', label: '创建时间', defaultWidth: 160, minWidth: PROCESS_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  updatedBy: { id: 'updatedBy', label: '更新人', defaultWidth: 140, minWidth: PROCESS_FIELD_COLUMN_MIN_WIDTH, resizable: true },
  updatedAt: { id: 'updatedAt', label: '更新时间', defaultWidth: 160, minWidth: PROCESS_FIELD_COLUMN_MIN_WIDTH, resizable: true },
};

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
};

const emptyTableBodyCellSx = {
  height: '100%',
  py: 0,
  borderBottom: '1px solid #ebeef5',
  color: '#909399',
};

const emptyTableRowSx = { height: '100%' };

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

const statusOptions = [
  { value: 'ALL', label: '全部' },
  { value: 'ACTIVE', label: '启用' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'DISABLED', label: '禁用' },
  { value: 'OBSOLETE', label: '作废' },
] as const;
const materialRuntimeStatusOptions = [
  { value: 'ALL', label: '全部' },
  { value: 'ACTIVE', label: '启用' },
  { value: 'PENDING', label: '待生效' },
  { value: 'DISABLED', label: '禁用' },
] as const;

const STANDARD_MATERIAL_TYPE_OPTIONS = ['原材料', '半成品', '产成品', '辅材', '包材'].map((name) => ({ id: name, name }));
const MATERIAL_PURPOSE_OPTIONS = ['试验物料', '生产物料'].map((name) => ({ id: name, name }));

const MATERIAL_VERSION_COLUMNS: ProcessColumn[] = (['version', 'status', 'effectiveDate', 'expiryDate', 'description', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions'] as const).map((id) => ({
  id,
  label: id === 'version' ? '物料版本号' : id === 'status' ? '版本状态' : id === 'effectiveDate' ? '生效日期' : id === 'expiryDate' ? '失效日期' : id === 'description' ? '版本说明' : id === 'createdBy' ? '创建人' : id === 'createdAt' ? '创建时间' : id === 'updatedBy' ? '更新人' : id === 'updatedAt' ? '更新时间' : '操作',
  defaultWidth: id === 'actions' ? PROCESS_ACTION_COLUMN_WIDTH : defaultWidthForColumn(id),
  minWidth: id === 'actions' ? PROCESS_ACTION_COLUMN_WIDTH : PROCESS_FIELD_COLUMN_MIN_WIDTH,
  resizable: id !== 'actions',
  align: id === 'actions' ? 'center' : 'left',
}));
const materialVersionColumnSettingsConfig: ProcessColumnSettingsConfig = { columns: MATERIAL_VERSION_COLUMNS };

const processColumnLabels: Record<ConfigurableProcessColumnId, string> = {
  name: '名称',
  code: '编码',
  specification: '规格型号',
  materialTypeId: '物料类型',
  materialPurpose: '物料用途',
  effectiveVersionCount: '生效版本数量',
  effectiveDate: '生效日期',
  expiryDate: '失效日期',
  productFamilyId: '产品簇',
  unit: '单位',
  version: '版本',
  fileReference: '文件引用',
  description: '描述',
  defaultDurationMinutes: '标准时长',
  sortOrder: '排序',
  status: '状态',
  createdBy: '创建人',
  createdAt: '创建时间',
  updatedBy: '更新人',
  updatedAt: '更新时间',
};

const processAuditFieldLabels: Record<string, string> = {
  id: 'ID',
  code: '编码',
  name: '名称',
  title: '名称',
  description: '描述',
  specification: '规格型号',
  materialTypeId: '物料类型',
  materialPurpose: '物料用途',
  effectiveVersionCount: '生效版本数量',
  effectiveDate: '生效日期',
  expiryDate: '失效日期',
  productFamilyId: '产品簇',
  familyId: '产品簇',
  unit: '单位',
  version: '版本',
  fileReference: '文件引用',
  defaultDurationMinutes: '标准时长',
  sortOrder: '排序',
  status: '状态',
  remark: '备注',
  createdBy: '创建人',
  createdAt: '创建时间',
  updatedBy: '更新人',
  updatedAt: '更新时间',
};

const actionLabelMap: Record<string, string> = {
  CREATE: '新增',
  UPDATE: '编辑',
  DELETE: '删除',
};

const PROCESS_MODELING_PAGE_CONFIGS: Record<ProcessModelingPageKey, ProcessModelingPageConfig> = {
  materials: {
    title: '物料管理',
    entityType: 'MATERIAL',
    listQueryKey: 'process-modeling-materials',
    auditQueryKey: 'process-modeling-material-audit',
    list: getMaterials,
    create: createMaterial,
    update: updateMaterial,
    remove: deleteMaterial,
    labels: { name: '物料名称', code: '物料料号', version: '版本数量' },
    columns: baseColumns(['name', 'code', 'specification', 'materialTypeId', 'unit', 'version', 'effectiveVersionCount', 'materialPurpose', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'], { labels: { name: '物料名称', code: '物料料号', version: '版本数量' } }),
    formFields: [
      { id: 'name', label: '物料名称', required: true },
      { id: 'code', label: '物料料号', required: true },
      { id: 'specification', label: '规格型号' },
      { id: 'materialTypeId', label: '物料类型' },
      { id: 'unit', label: '单位' },
      { id: 'version', label: '版本', required: true },
      { id: 'materialPurpose', label: '物料用途' },
      { id: 'effectiveDate', label: '生效日期' },
      { id: 'expiryDate', label: '失效日期' },
      { id: 'description', label: '版本说明', multiline: true },
    ],
  },
  operations: {
    title: '工序管理',
    entityType: 'OPERATION',
    listQueryKey: 'process-modeling-operations',
    auditQueryKey: 'process-modeling-operation-audit',
    list: getProcessOperations,
    create: createProcessOperation,
    update: updateProcessOperation,
    remove: deleteProcessOperation,
    columns: baseColumns(['name', 'code', 'description', 'defaultDurationMinutes', 'sortOrder', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']),
    formFields: [
      { id: 'name', label: '名称', required: true },
      { id: 'defaultDurationMinutes', label: '标准时长(分钟)', type: 'number' },
      { id: 'sortOrder', label: '排序', type: 'number' },
      { id: 'description', label: '描述', multiline: true },
      { id: 'status', label: '状态' },
    ],
  },
  routes: {
    title: '工艺路线',
    entityType: 'ROUTE',
    listQueryKey: 'process-modeling-routes',
    auditQueryKey: 'process-modeling-route-audit',
    list: getProcessRoutes,
    create: createProcessRoute,
    update: updateProcessRoute,
    remove: deleteProcessRoute,
    columns: baseColumns(['name', 'code', 'productFamilyId', 'description', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']),
    formFields: [
      { id: 'name', label: '名称', required: true },
      { id: 'productFamilyId', label: '产品簇' },
      { id: 'description', label: '描述', multiline: true },
      { id: 'status', label: '状态' },
    ],
  },
  products: {
    title: '产品管理',
    entityType: 'MATERIAL',
    listQueryKey: 'process-modeling-products',
    auditQueryKey: 'process-modeling-product-audit',
    list: getProducts,
    readOnly: true,
    derivedFrom: '由物料类型为半成品或产成品的物料自动派生',
    columns: baseColumns(['name', 'code', 'specification', 'materialTypeId', 'unit', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'], { actions: false }),
    formFields: [],
  },
  productFamilies: {
    title: '产品簇',
    entityType: 'PRODUCT_FAMILY',
    listQueryKey: 'process-modeling-product-families',
    auditQueryKey: 'process-modeling-product-family-audit',
    list: getProcessProductFamilies,
    create: createProcessProductFamily,
    update: updateProcessProductFamily,
    remove: deleteProcessProductFamily,
    columns: baseColumns(['name', 'code', 'description', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']),
    formFields: [
      { id: 'name', label: '名称', required: true },
      { id: 'description', label: '描述', multiline: true },
      { id: 'status', label: '状态' },
    ],
  },
  documents: {
    title: '文档管理',
    entityType: 'PROCESS_DOCUMENT',
    listQueryKey: 'process-modeling-documents',
    auditQueryKey: 'process-modeling-document-audit',
    list: getProcessDocuments,
    create: createProcessDocument,
    update: updateProcessDocument,
    remove: deleteProcessDocument,
    columns: baseColumns(['name', 'code', 'version', 'fileReference', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']),
    formFields: [
      { id: 'name', label: '名称', required: true },
      { id: 'version', label: '版本' },
      { id: 'fileReference', label: '文件引用' },
      { id: 'description', label: '描述', multiline: true },
      { id: 'status', label: '状态' },
    ],
  },
};

function baseColumns(ids: ConfigurableProcessColumnId[], options?: { actions?: boolean; labels?: ProcessColumnLabelOverrides }): ProcessColumn[] {
  const dataColumns = ids.map((id) => PROCESS_SYSTEM_COLUMNS[id as keyof typeof PROCESS_SYSTEM_COLUMNS] ?? ({
    id,
    label: options?.labels?.[id] ?? processColumnLabels[id],
    defaultWidth: defaultWidthForColumn(id),
    minWidth: PROCESS_FIELD_COLUMN_MIN_WIDTH,
    resizable: true,
  }));
  if (options?.actions === false) return dataColumns;
  return [...dataColumns, { id: 'actions', label: '操作', defaultWidth: PROCESS_ACTION_COLUMN_WIDTH, minWidth: PROCESS_ACTION_COLUMN_WIDTH, align: 'center' }];
}

function defaultWidthForColumn(id: ProcessColumnId) {
  if (id === 'description' || id === 'fileReference') return 220;
  if (id === 'createdAt' || id === 'updatedAt') return 160;
  if (id === 'effectiveVersionCount') return 130;
  if (id === 'materialPurpose') return 120;
  if (id === 'effectiveDate' || id === 'expiryDate') return 150;
  if (id === 'status') return 100;
  return 140;
}

function getDisplayName(row: ProcessModelingRecord) {
  return (row.name || row.title || '').trim() || '-';
}

function isMaterialGroupRow(row: ProcessTableRow): row is MaterialGroupRow {
  return 'versions' in row && 'materialGroupDisplayName' in row;
}

function getMaterialVersion(row: ProcessModelingRecord) {
  return 'version' in row && row.version ? row.version : 'V1.0';
}

function compareMaterialVersionDesc(a: MaterialRecord, b: MaterialRecord) {
  return getMaterialVersion(b).localeCompare(getMaterialVersion(a), 'zh-Hans-CN', { numeric: true, sensitivity: 'base' });
}

function isEffectiveMaterialVersion(row: MaterialRecord) {
  const now = Date.now();
  const effectiveDate = row.effectiveDate ? Date.parse(row.effectiveDate) : Number.NaN;
  const expiryDate = row.expiryDate ? Date.parse(row.expiryDate) : Number.NaN;
  return (Number.isNaN(effectiveDate) || effectiveDate <= now) && (Number.isNaN(expiryDate) || expiryDate > now);
}

function getMaterialVersionRuntimeStatus(row: MaterialRecord) {
  const now = Date.now();
  const effectiveDate = row.effectiveDate ? Date.parse(row.effectiveDate) : Number.NaN;
  const expiryDate = row.expiryDate ? Date.parse(row.expiryDate) : Number.NaN;
  if (!Number.isNaN(effectiveDate) && effectiveDate > now) return 'PENDING';
  if (!Number.isNaN(expiryDate) && expiryDate <= now) return 'EXPIRED';
  return 'ACTIVE';
}

function getMaterialGroupRuntimeStatus(versions: MaterialRecord[]) {
  const statuses = versions.map(getMaterialVersionRuntimeStatus);
  if (statuses.includes('ACTIVE')) return 'ACTIVE';
  if (statuses.every((status) => status === 'EXPIRED')) return 'DISABLED';
  if (statuses.includes('PENDING')) return 'PENDING';
  return 'DISABLED';
}

function isExpiryBeforeEffective(effectiveDate?: string | null, expiryDate?: string | null) {
  if (!effectiveDate || !expiryDate) return false;
  const effectiveTime = Date.parse(effectiveDate);
  const expiryTime = Date.parse(expiryDate);
  return !Number.isNaN(effectiveTime) && !Number.isNaN(expiryTime) && expiryTime < effectiveTime;
}

function pickMaterialPayload(input: ProcessModelingPayload, fieldIds: Array<keyof ProcessModelingPayload>) {
  return fieldIds.reduce<ProcessModelingPayload>((payload, fieldId) => {
    if (fieldId in input) {
      return { ...payload, [fieldId]: input[fieldId] };
    }
    return payload;
  }, {} as ProcessModelingPayload);
}

function getMaterialGroupRows(rows: ProcessModelingRecord[]): MaterialGroupRow[] {
  return rows.map((row) => {
    const materialVersions = ('versions' in row && Array.isArray(row.versions) ? row.versions : [row]) as MaterialRecord[];
    const sortedVersions = [...materialVersions].sort(compareMaterialVersionDesc);
    const latestVersion = sortedVersions[0];
    const groupKey = `${row.code || latestVersion.code || row.id}::${getDisplayName(row)}`;
    const materialGroupDisplayName = getDisplayName(latestVersion);
    const versionCount = 'versionCount' in row && typeof row.versionCount === 'number' ? row.versionCount : sortedVersions.length;
    const effectiveVersionCount = 'effectiveVersionCount' in row && typeof row.effectiveVersionCount === 'number'
      ? row.effectiveVersionCount
      : sortedVersions.filter(isEffectiveMaterialVersion).length;
    return {
      id: `process-modeling-material-groups:${groupKey}`,
      groupKey,
      materialGroupDisplayName,
      code: latestVersion.code,
      status: getMaterialGroupRuntimeStatus(sortedVersions),
      versionCount,
      effectiveVersionCount,
      latestVersion,
      versions: sortedVersions,
    };
  });
}

function getRecordId(row: ProcessModelingRecord) {
  return String(row.id);
}

function getAuditEntityIds(entityIds: Array<string | number>) {
  return Array.from(new Set(entityIds
    .map((entityId) => String(entityId ?? '').trim())
    .filter((auditEntityId) => auditEntityId && !auditEntityId.startsWith('process-modeling-material-groups:'))));
}

function getStatusLabel(status?: string) {
  if (!status) return '-';
  return {
    ACTIVE: '启用',
    PENDING: '待生效',
    EXPIRED: '已失效',
    DRAFT: '草稿',
    DISABLED: '禁用',
    OBSOLETE: '作废',
  }[status] ?? status;
}

function getStatusColor(status?: string) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'DISABLED' || status === 'OBSOLETE' || status === 'EXPIRED') return 'error';
  if (status === 'DRAFT' || status === 'PENDING') return 'warning';
  return 'default';
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTimeInput(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getTodayDateTimeInput() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return formatDateTimeInput(date.toISOString());
}

function getApiErrorMessage(error: unknown, fallback = '操作失败') {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

function getCurrentUserPreferenceStorageKey(prefix: string, pageKey: string) {
  if (typeof window === 'undefined') return `${prefix}${pageKey}:anonymous`;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null') as { id?: string | number; username?: string } | null;
    return `${prefix}${pageKey}:${user?.id ?? user?.username ?? 'anonymous'}`;
  } catch {
    return `${prefix}${pageKey}:anonymous`;
  }
}

function isConfigurableColumn(column: ProcessColumn): column is ProcessColumn & { id: ConfigurableProcessColumnId } {
  return column.id !== 'actions';
}

function isReadOnlyPage(config: ProcessModelingPageConfig) {
  return Boolean(config.readOnly);
}

function normalizeColumnSettings(config: ProcessColumnSettingsConfig, raw?: Partial<ProcessColumnSettings> | null): ProcessColumnSettings {
  const defaults = config.columns.filter(isConfigurableColumn).map((column) => column.id);
  if (!raw || raw.version !== PROCESS_MODELING_COLUMN_SETTINGS_VERSION) {
    return { version: PROCESS_MODELING_COLUMN_SETTINGS_VERSION, order: defaults, hidden: [] };
  }
  const seen = new Set<ConfigurableProcessColumnId>();
  const order = [
    ...(raw.order ?? []).filter((id): id is ConfigurableProcessColumnId => defaults.includes(id) && !seen.has(id) && (seen.add(id), true)),
    ...defaults.filter((id) => !seen.has(id)),
  ];
  const hidden = (raw.hidden ?? []).filter((id): id is ConfigurableProcessColumnId => defaults.includes(id) && order.includes(id));
  return { version: PROCESS_MODELING_COLUMN_SETTINGS_VERSION, order, hidden: hidden.length >= order.length ? hidden.slice(1) : hidden };
}

function loadColumnSettings(storageKey: string, config: ProcessColumnSettingsConfig): ProcessColumnSettings {
  if (typeof window === 'undefined') return normalizeColumnSettings(config);
  try {
    return normalizeColumnSettings(config, JSON.parse(localStorage.getItem(storageKey) || 'null'));
  } catch {
    return normalizeColumnSettings(config);
  }
}

function loadColumnWidths(storageKey: string): ProcessColumnWidths {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function getColumnSettingsItems(config: ProcessColumnSettingsConfig, settings: ProcessColumnSettings) {
  const byId = new Map(config.columns.filter(isConfigurableColumn).map((column) => [column.id, column]));
  return settings.order.map((id) => byId.get(id)).filter((column): column is ProcessColumn & { id: ConfigurableProcessColumnId } => Boolean(column));
}

function getVisibleColumns(config: ProcessColumnSettingsConfig, settings: ProcessColumnSettings): ProcessColumn[] {
  const actionColumn = config.columns.find((column) => column.id === 'actions');
  const visibleDataColumns = getColumnSettingsItems(config, settings).filter((column) => !settings.hidden.includes(column.id));
  return [...visibleDataColumns, actionColumn].filter((column): column is ProcessColumn => Boolean(column));
}

function resolveColumnWidths(widths: ProcessColumnWidths, containerWidth: number, visibleColumns: ProcessColumn[]) {
  const result: Record<ProcessColumnId, number> = {} as Record<ProcessColumnId, number>;
  let total = 0;
  visibleColumns.forEach((column) => {
    const width = Math.max(column.minWidth, widths[column.id] ?? column.defaultWidth);
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

function getAuditRecords(events: AuditLogItem[] | undefined): ProcessAuditRecord[] {
  return (events ?? []).map((event) => ({
    id: String(event.id),
    operatorName: event.operatorDisplayName || event.operatorAccount || '-',
    actionLabel: event.actionLabel || actionLabelMap[(event.action ?? '').toUpperCase()] || event.action || '-',
    operatedAt: event.operationTime || event.createdAt,
    beforeFields: toAuditFields(event.contentBefore),
    afterFields: toAuditFields(event.contentAfter),
  }));
}

function toAuditFields(input: unknown): AuditFieldRow[] {
  const value = typeof input === 'string' ? safeJsonParse(input) : input;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([field]) => field !== 'id' && field !== 'displayName')
    .map(([field, fieldValue]) => ({
      label: processAuditFieldLabels[field] ?? field,
      value: formatAuditValue(fieldValue),
    }));
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatAuditValue(value: unknown): string {
  if (value == null || value === '') return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: '4px', overflow: 'hidden' }}>
      <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e4e7ed', bgcolor: '#f8fafc' }}>
        <Typography sx={{ fontWeight: 600, color: '#303133' }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 1.5 }}>{children}</Box>
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

const emptyFilters: ProcessFilters = { keyword: '', materialName: '', materialCode: '', materialTypeName: '', status: 'ALL' };
const emptyForm: ProcessModelingPayload = { name: '', status: 'ACTIVE' };

export default function ProcessModelingPage({ pageKey }: { pageKey: ProcessModelingPageKey }) {
  const config = PROCESS_MODELING_PAGE_CONFIGS[pageKey];
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState<ProcessFilters>(emptyFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ProcessModelingRecord | null>(null);
  const [creatingMaterialVersionFrom, setCreatingMaterialVersionFrom] = useState<MaterialRecord | null>(null);
  const [materialDialogMode, setMaterialDialogMode] = useState<MaterialDialogMode | null>(null);
  const [form, setForm] = useState<ProcessModelingPayload>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ row: ProcessModelingRecord; scope: DeleteTargetScope } | null>(null);
  const [selectedRow, setSelectedRow] = useState<ProcessModelingRecord | null>(null);
  const [drawerAuditTarget, setDrawerAuditTarget] = useState<DrawerAuditTarget | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [expandedMaterialGroups, setExpandedMaterialGroups] = useState<Set<string>>(() => new Set());
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [tableContainerWidth, setTableContainerWidth] = useState(0);
  const [tableScrollbarWidth, setTableScrollbarWidth] = useState(0);
  const columnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_COLUMN_WIDTH_STORAGE_PREFIX, pageKey), [pageKey]);
  const materialVersionColumnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_MATERIAL_VERSION_COLUMN_WIDTH_STORAGE_PREFIX, pageKey), [pageKey]);
  const columnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);
  const materialVersionColumnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_MATERIAL_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);
  const [columnWidths, setColumnWidths] = useState<ProcessColumnWidths>(() => loadColumnWidths(columnWidthStorageKey));
  const [materialVersionColumnWidths, setMaterialVersionColumnWidths] = useState<ProcessColumnWidths>(() => loadColumnWidths(materialVersionColumnWidthStorageKey));
  const [columnSettings, setColumnSettings] = useState<ProcessColumnSettings>(() => loadColumnSettings(columnSettingsStorageKey, config));
  const [materialVersionColumnSettings, setMaterialVersionColumnSettings] = useState<ProcessColumnSettings>(() => loadColumnSettings(materialVersionColumnSettingsStorageKey, materialVersionColumnSettingsConfig));
  const [columnSettingsAnchorEl, setColumnSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [columnSettingsTab, setColumnSettingsTab] = useState<ColumnSettingsTarget>('main');
  const [draggingColumnId, setDraggingColumnId] = useState<ConfigurableProcessColumnId | null>(null);
  const columnSettingDragSourceRef = useRef<ConfigurableProcessColumnId | null>(null);
  useEffect(() => {
    setColumnWidths(loadColumnWidths(columnWidthStorageKey));
    setMaterialVersionColumnWidths(loadColumnWidths(materialVersionColumnWidthStorageKey));
    setColumnSettings(loadColumnSettings(columnSettingsStorageKey, config));
    setMaterialVersionColumnSettings(loadColumnSettings(materialVersionColumnSettingsStorageKey, materialVersionColumnSettingsConfig));
  }, [columnSettingsStorageKey, columnWidthStorageKey, materialVersionColumnSettingsStorageKey, materialVersionColumnWidthStorageKey, config]);

  const materialTypeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    STANDARD_MATERIAL_TYPE_OPTIONS.forEach((item) => map.set(item.id, item.name));
    return map;
  }, []);

  const materialTypeMapValue = (value: unknown) => {
    if (value == null || value === '') return undefined;
    return materialTypeNameMap.get(String(value));
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [config.listQueryKey, page, rowsPerPage, filters],
    queryFn: async () => {
      const res = await config.list({
        page,
        size: rowsPerPage,
        sort: 'createdAt',
        order: 'desc',
        keyword: pageKey === 'materials' ? undefined : filters.keyword.trim() || undefined,
        materialName: pageKey === 'materials' ? filters.materialName.trim() || undefined : undefined,
        materialCode: pageKey === 'materials' ? filters.materialCode.trim() || undefined : undefined,
        materialTypeName: pageKey === 'materials' ? filters.materialTypeName || undefined : undefined,
        status: filters.status === 'ALL' ? undefined : filters.status,
      });
      return res.data.data;
    },
  });

  const selectedAuditEntityIds = useMemo(() => getAuditEntityIds(drawerAuditTarget?.entityIds ?? []), [drawerAuditTarget]);
  const selectedAuditEntityKey = selectedAuditEntityIds.join(',');
  const { data: auditData, isLoading: isAuditLoading, isError: isAuditError } = useQuery({
    queryKey: [config.auditQueryKey, selectedAuditEntityKey],
    enabled: selectedAuditEntityIds.length > 0,
    queryFn: async () => {
      const responses = await Promise.all(selectedAuditEntityIds.map((entityId) => getAuditLogs({
          page: 1,
          size: 100,
          sort: 'createdAt',
          order: 'desc',
          entityType: config.entityType,
          entityId,
        })));
      return responses
        .flatMap((res) => (res.data.data as PageResult<AuditLogItem>).content ?? [])
        .sort((left, right) => Date.parse(right.createdAt ?? right.operationTime ?? '') - Date.parse(left.createdAt ?? left.operationTime ?? ''));
    },
  });

  const auditRecords = useMemo(() => getAuditRecords(auditData), [auditData]);
  const rows = data?.content ?? [];
  const materialGroupRows = useMemo(() => (pageKey === 'materials' ? getMaterialGroupRows(rows) : []), [pageKey, rows]);
  const displayRows = pageKey === 'materials' ? materialGroupRows : rows;
  const pageCount = Math.max(1, data?.totalPages ?? 1);
  const totalElements = data?.totalElements ?? 0;
  const displayTotalElements = pageKey === 'materials' ? materialGroupRows.length : totalElements;
  const isTableEmptyState = isLoading || isError || displayRows.length === 0;
  const columnSettingsItems = useMemo(() => getColumnSettingsItems(config, columnSettings), [columnSettings, config]);
  const visibleColumns = useMemo(() => getVisibleColumns(config, columnSettings), [columnSettings, config]);
  const visibleConfigurableColumnCount = columnSettings.order.length - columnSettings.hidden.length;
  const resolvedColumnWidths = useMemo(() => resolveColumnWidths(columnWidths, tableContainerWidth, visibleColumns), [columnWidths, tableContainerWidth, visibleColumns]);
  const totalTableWidth = visibleColumns.reduce((sum, column) => sum + resolvedColumnWidths[column.id], 0);
  const materialVersionColumns = MATERIAL_VERSION_COLUMNS;
  const materialVersionColumnSettingsItems = useMemo(() => getColumnSettingsItems(materialVersionColumnSettingsConfig, materialVersionColumnSettings), [materialVersionColumnSettings]);
  const visibleMaterialVersionColumns = useMemo(() => getVisibleColumns(materialVersionColumnSettingsConfig, materialVersionColumnSettings), [materialVersionColumnSettings]);
  const visibleMaterialVersionConfigurableColumnCount = materialVersionColumnSettings.order.length - materialVersionColumnSettings.hidden.length;
  const activeColumnSettings = columnSettingsTab === 'materialVersion' ? materialVersionColumnSettings : columnSettings;
  const activeColumnSettingsItems = columnSettingsTab === 'materialVersion' ? materialVersionColumnSettingsItems : columnSettingsItems;
  const activeVisibleConfigurableColumnCount = columnSettingsTab === 'materialVersion' ? visibleMaterialVersionConfigurableColumnCount : visibleConfigurableColumnCount;
  const setActiveColumnSettings = columnSettingsTab === 'materialVersion' ? setMaterialVersionColumnSettings : setColumnSettings;
  const resolvedMaterialVersionColumnWidths = useMemo(() => resolveColumnWidths(materialVersionColumnWidths, totalTableWidth, visibleMaterialVersionColumns), [materialVersionColumnWidths, totalTableWidth, visibleMaterialVersionColumns]);
  const totalMaterialVersionTableWidth = visibleMaterialVersionColumns.reduce((sum, column) => sum + resolvedMaterialVersionColumnWidths[column.id], 0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(columnWidthStorageKey, JSON.stringify(columnWidths));
  }, [columnWidthStorageKey, columnWidths]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(materialVersionColumnWidthStorageKey, JSON.stringify(materialVersionColumnWidths));
  }, [materialVersionColumnWidthStorageKey, materialVersionColumnWidths]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(columnSettingsStorageKey, JSON.stringify(columnSettings));
  }, [columnSettingsStorageKey, columnSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(materialVersionColumnSettingsStorageKey, JSON.stringify(materialVersionColumnSettings));
  }, [materialVersionColumnSettingsStorageKey, materialVersionColumnSettings]);

  useEffect(() => {
    if (pageKey !== 'materials') setColumnSettingsTab('main');
  }, [pageKey]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return undefined;
    const updateWidth = () => {
      setTableContainerWidth(container.clientWidth);
      setTableScrollbarWidth(Math.max(0, container.offsetWidth - container.clientWidth));
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar((current) => ({ ...current, open: false }));

  const handleSnackbarClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    closeSnackbar();
  };

  const createMutation = useMutation({
    mutationFn: (body: ProcessModelingPayload) => {
      if (!config.create) throw new Error(`${config.title}不支持新增`);
      return config.create(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.listQueryKey] });
      setDialogOpen(false);
      setForm(emptyForm);
      setCreatingMaterialVersionFrom(null);
      setMaterialDialogMode(null);
      showSnackbar(`${config.title}保存成功`, 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, `${config.title}保存失败`), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (body: ProcessModelingPayload) => {
      if (!config.update) throw new Error(`${config.title}不支持编辑`);
      return config.update(editingRow?.id ?? '', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.listQueryKey] });
      queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
      setDialogOpen(false);
      setEditingRow(null);
      setCreatingMaterialVersionFrom(null);
      setMaterialDialogMode(null);
      setForm(emptyForm);
      showSnackbar(`${config.title}保存成功`, 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, `${config.title}保存失败`), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (row: ProcessModelingRecord) => {
      if (!config.remove) throw new Error(`${config.title}不支持删除`);
      return config.remove(row.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.listQueryKey] });
      setDeleteTarget(null);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
    onError: (error) => setSnackbar({ open: true, message: getApiErrorMessage(error, '删除失败'), severity: 'error' }),
  });

  const openDeleteDialog = (row: ProcessModelingRecord, scope: DeleteTargetScope = pageKey === 'materials' ? 'materialVersion' : 'record') => {
    setDeleteTarget({ row, scope });
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const renderMaterialFilters = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center' }}>
      <TextField
        size="small"
        label="物料名称"
        placeholder="请输入"
        value={filters.materialName}
        onChange={(event) => setFilters((current) => ({ ...current, materialName: event.target.value }))}
        sx={fieldSx}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
      />
      <TextField
        size="small"
        label="物料料号"
        placeholder="请输入"
        value={filters.materialCode}
        onChange={(event) => setFilters((current) => ({ ...current, materialCode: event.target.value }))}
        sx={fieldSx}
      />
      <TextField
        select
        size="small"
        label="物料类型"
        value={filters.materialTypeName}
        onChange={(event) => setFilters((current) => ({ ...current, materialTypeName: event.target.value }))}
        sx={fieldSx}
      >
        <MenuItem value="">全部</MenuItem>
        {STANDARD_MATERIAL_TYPE_OPTIONS.map((option) => <MenuItem key={option.id} value={option.name}>{option.name}</MenuItem>)}
      </TextField>
      <TextField
        select
        size="small"
        label="状态"
        value={filters.status}
        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        sx={fieldSx}
      >
        {materialRuntimeStatusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
      </TextField>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ gridColumn: { xs: '1', md: '3' } }}>
        <Button size="small" sx={QUERY_BUTTON_SX} variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>重置</Button>
        <Button size="small" sx={QUERY_BUTTON_SX} variant="contained" startIcon={<Search />} onClick={() => setPage(1)}>查询</Button>
      </Stack>
    </Box>
  );

  const expandMaterialGroup = (groupKey: string) => {
    setExpandedMaterialGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const expandAllMaterialGroups = () => {
    setExpandedMaterialGroups(new Set(materialGroupRows.map((row) => row.groupKey)));
  };

  const collapseAllMaterialGroups = () => {
    setExpandedMaterialGroups(new Set());
  };

  const openCreateDialog = () => {
    if (isReadOnlyPage(config)) return;
    setEditingRow(null);
    setCreatingMaterialVersionFrom(null);
    setMaterialDialogMode(pageKey === 'materials' ? 'createMaterial' : null);
    setForm({
      ...emptyForm,
      status: pageKey === 'materials' ? undefined : pageKey === 'routes' || pageKey === 'documents' ? 'DRAFT' : 'ACTIVE',
      version: pageKey === 'materials' ? 'V1.0' : undefined,
      materialPurpose: pageKey === 'materials' ? '生产物料' : undefined,
      effectiveDate: pageKey === 'materials' ? getTodayDateTimeInput() : undefined,
    });
    setDialogOpen(true);
  };

  const openCreateMaterialVersionDialog = (row: MaterialRecord) => {
    if (isReadOnlyPage(config)) return;
    setEditingRow(null);
    setCreatingMaterialVersionFrom(row);
    setMaterialDialogMode('createVersion');
    const materialTypeValue = row.materialTypeId ?? '';
    setForm({
      name: getDisplayName(row) === '-' ? '' : getDisplayName(row),
      code: row.code ?? '',
      specification: row.specification ?? '',
      materialTypeId: materialTypeValue,
      materialTypeName: row.materialTypeName ?? (materialTypeMapValue(materialTypeValue) || ''),
      unit: row.unit ?? '',
      materialPurpose: row.materialPurpose ?? '生产物料',
      version: '',
      effectiveDate: getTodayDateTimeInput(),
      expiryDate: null,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (row: ProcessModelingRecord, materialMode?: Extract<MaterialDialogMode, 'editMaterial' | 'editVersion'>) => {
    if (isReadOnlyPage(config)) return;
    const materialTypeValue = 'materialTypeId' in row ? row.materialTypeId ?? '' : '';
    setEditingRow(row);
    setCreatingMaterialVersionFrom(null);
    setMaterialDialogMode(materialMode ?? (pageKey === 'materials' ? 'editMaterial' : null));
    setForm({
      name: getDisplayName(row) === '-' ? '' : getDisplayName(row),
      code: row.code ?? '',
      description: row.description ?? '',
      status: row.status ?? 'ACTIVE',
      specification: 'specification' in row ? row.specification ?? '' : '',
      materialTypeId: materialTypeValue,
      materialTypeName: 'materialTypeName' in row ? row.materialTypeName ?? (materialTypeMapValue(materialTypeValue) || '') : (materialTypeMapValue(materialTypeValue) || ''),
      productFamilyId: 'productFamilyId' in row ? row.productFamilyId ?? '' : 'familyId' in row ? row.familyId ?? '' : '',
      unit: 'unit' in row ? row.unit ?? '' : '',
      version: 'version' in row ? row.version ?? '' : '',
      materialPurpose: 'materialPurpose' in row ? row.materialPurpose ?? '生产物料' : undefined,
      effectiveDate: 'effectiveDate' in row ? formatDateTimeInput(row.effectiveDate) : undefined,
      expiryDate: 'expiryDate' in row ? formatDateTimeInput(row.expiryDate) : undefined,
      fileReference: 'fileReference' in row ? row.fileReference ?? '' : '',
      defaultDurationMinutes: 'defaultDurationMinutes' in row ? row.defaultDurationMinutes ?? null : null,
      sortOrder: 'sortOrder' in row ? row.sortOrder ?? null : null,
    });
    setDialogOpen(true);
  };

  const openDetailDrawer = (row: ProcessModelingRecord, entityIds: Array<string | number> = [row.id]) => {
    setSelectedRow(row);
    setDrawerAuditTarget({ entityIds });
    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const openMaterialGroupDrawer = (group: MaterialGroupRow) => {
    openDetailDrawer({ ...group.latestVersion, status: group.status }, group.versions.map((version) => version.id));
  };

  const openMaterialVersionDrawer = (row: MaterialRecord) => {
    openDetailDrawer(row, [row.id]);
  };

  const deleteTargetName = deleteTarget ? getDisplayName(deleteTarget.row) : '';
  const deleteTargetVersion = deleteTarget?.scope === 'materialVersion' ? getMaterialVersion(deleteTarget.row) : '';
  const deleteDialogTitle = pageKey === 'materials'
    ? deleteTarget?.scope === 'materialVersion'
      ? '确认删除物料版本'
      : '确认删除物料'
    : `确认删除${config.title}`;
  const deleteDialogMessage = pageKey === 'materials'
    ? deleteTarget?.scope === 'materialVersion'
      ? `确定要删除物料 ${deleteTargetName} 的版本 ${deleteTargetVersion} 吗？删除后该物料版本将无法恢复。`
      : `确定要删除物料 ${deleteTargetName} 吗？删除后该物料将无法恢复。`
    : `确定要删除${config.title} ${deleteTargetName} 吗？删除后该数据将无法恢复。`;

  const submitForm = () => {
    if (isReadOnlyPage(config)) {
      setSnackbar({ open: true, message: `${config.title}仅支持查看`, severity: 'error' });
      return;
    }
    if (!form.name?.trim()) {
      setSnackbar({ open: true, message: '请填写名称', severity: 'error' });
      return;
    }
    if (pageKey === 'materials' && !form.code?.trim()) {
      setSnackbar({ open: true, message: '请填写物料料号', severity: 'error' });
      return;
    }
    if (pageKey === 'materials' && !form.version?.trim()) {
      setSnackbar({ open: true, message: '请填写版本', severity: 'error' });
      return;
    }
    if (pageKey === 'materials' && isExpiryBeforeEffective(form.effectiveDate, form.expiryDate)) {
      setSnackbar({ open: true, message: '失效时间不能早于生效时间', severity: 'error' });
      return;
    }
    const payload = pageKey === 'materials' ? normalizeMaterialPayload(form) : normalizePayload(form);
    if (editingRow) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const normalizePayload = (input: ProcessModelingPayload): ProcessModelingPayload => ({
    ...input,
    code: input.code?.trim() || undefined,
    name: input.name?.trim() ?? '',
    description: input.description?.trim() || undefined,
    status: pageKey === 'materials' ? undefined : input.status || undefined,
    specification: input.specification?.trim() || undefined,
    unit: input.unit?.trim() || undefined,
    version: input.version?.trim() || undefined,
    materialPurpose: input.materialPurpose?.trim() || undefined,
    effectiveDate: input.effectiveDate || null,
    expiryDate: input.expiryDate || null,
    fileReference: input.fileReference?.trim() || undefined,
    materialTypeId: typeof input.materialTypeId === 'number' ? input.materialTypeId : null,
    materialTypeName: typeof input.materialTypeName === 'string' && input.materialTypeName.trim() ? input.materialTypeName.trim() : undefined,
    productFamilyId: input.productFamilyId === '' ? null : input.productFamilyId,
    defaultDurationMinutes: input.defaultDurationMinutes === null || input.defaultDurationMinutes === undefined ? null : Number(input.defaultDurationMinutes),
    sortOrder: input.sortOrder === null || input.sortOrder === undefined ? null : Number(input.sortOrder),
  });

  const normalizeMaterialPayload = (input: ProcessModelingPayload): ProcessModelingPayload => {
    const normalized = normalizePayload(input);
    if (materialDialogMode === 'editMaterial') {
      return {
        ...pickMaterialPayload(normalized, MATERIAL_BASE_FIELD_IDS),
        materialTypeName: normalized.materialTypeName,
      };
    }
    if (materialDialogMode === 'editVersion') {
      return pickMaterialPayload(normalized, MATERIAL_VERSION_FIELD_IDS);
    }
    return normalized;
  };

  const getColumnWidth = (column: ProcessColumn) => resolvedColumnWidths[column.id] ?? column.defaultWidth;
  const getMaterialVersionColumnWidth = (column: ProcessColumn) => resolvedMaterialVersionColumnWidths[column.id] ?? column.defaultWidth;

  const beginColumnResize = (event: MouseEvent, columnId: ProcessColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    const column = visibleColumns.find((item) => item.id === columnId);
    if (!column) return;
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

  const beginMaterialVersionColumnResize = (event: MouseEvent, columnId: ProcessColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    const column = materialVersionColumns.find((item) => item.id === columnId);
    if (!column || column.resizable === false) return;
    const startX = event.clientX;
    const startWidth = getMaterialVersionColumnWidth(column);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const nextWidth = Math.max(column.minWidth, startWidth + moveEvent.clientX - startX);
      setMaterialVersionColumnWidths((current) => ({ ...current, [columnId]: nextWidth }));
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

  const handleColumnSettingDragStart = (event: ReactDragEvent, columnId: ConfigurableProcessColumnId) => {
    columnSettingDragSourceRef.current = columnId;
    setDraggingColumnId(columnId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnId);
  };

  const handleColumnSettingDragOver = (event: ReactDragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleColumnSettingDrop = (event: ReactDragEvent, targetId: ConfigurableProcessColumnId) => {
    event.preventDefault();
    moveColumnSetting(columnSettingDragSourceRef.current, targetId);
  };

  const handleColumnSettingDragEnd = () => {
    columnSettingDragSourceRef.current = null;
    setDraggingColumnId(null);
  };

  const beginColumnSettingPointerDrag = (event: ReactPointerEvent, columnId: ConfigurableProcessColumnId) => {
    if (event.button !== 0) return;
    columnSettingDragSourceRef.current = columnId;
    setDraggingColumnId(columnId);
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const targetRow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('[data-process-column-settings-row]') as HTMLElement | null;
      const targetId = targetRow?.dataset.columnId as ConfigurableProcessColumnId | undefined;
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

  const moveColumnSetting = (sourceId: ConfigurableProcessColumnId | null, targetId: ConfigurableProcessColumnId) => {
    if (!sourceId || sourceId === targetId) return;
    setActiveColumnSettings((current) => {
      const nextOrder = current.order.filter((id) => id !== sourceId);
      const targetIndex = nextOrder.indexOf(targetId);
      nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, sourceId);
      return { ...current, order: nextOrder };
    });
  };

  const toggleColumnVisibility = (columnId: ConfigurableProcessColumnId) => {
    setActiveColumnSettings((current) => {
      const hidden = current.hidden.includes(columnId)
        ? current.hidden.filter((id) => id !== columnId)
        : [...current.hidden, columnId];
      if (hidden.length >= current.order.length) return current;
      return { ...current, hidden };
    });
  };

  const handleMaterialDateChange = (fieldId: 'effectiveDate' | 'expiryDate', value: string | null) => {
    setForm((current) => {
      if (fieldId === 'effectiveDate') {
        return {
          ...current,
          effectiveDate: value,
          expiryDate: isExpiryBeforeEffective(value, current.expiryDate) ? null : current.expiryDate,
        };
      }
      return { ...current, expiryDate: value };
    });
  };

  const renderFormField = (field: ProcessFormField) => {
    const gridColumn = field.multiline ? '1 / -1' : undefined;
    if (field.id === 'status') {
      return (
        <TextField
          key={field.id}
          select
          label={field.label}
          value={form.status ?? ''}
          onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
          size="small"
          fullWidth
          sx={fieldSx}
          style={gridColumn ? { gridColumn } : undefined}
        >
          {statusOptions.filter((option) => option.value !== 'ALL').map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
        </TextField>
      );
    }
    if (field.id === 'materialTypeId') {
      return (
        <TextField
          key={field.id}
          select
          label={field.label}
          value={typeof form.materialTypeName === 'string' ? form.materialTypeName : ''}
          onChange={(event) => setForm((current) => ({ ...current, materialTypeName: event.target.value === '' ? undefined : String(event.target.value), materialTypeId: null }))}
          size="small"
          fullWidth
          required={field.required}
          sx={fieldSx}
          style={gridColumn ? { gridColumn } : undefined}
        >
          <MenuItem value="">未选择</MenuItem>
          {STANDARD_MATERIAL_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.id} value={option.name}>{option.name}</MenuItem>
          ))}
        </TextField>
      );
    }
    if (field.id === 'materialPurpose') {
      return (
        <TextField
          key={field.id}
          select
          label={field.label}
          value={typeof form.materialPurpose === 'string' ? form.materialPurpose : '生产物料'}
          onChange={(event) => setForm((current) => ({ ...current, materialPurpose: event.target.value }))}
          size="small"
          fullWidth
          required={field.required}
          sx={fieldSx}
          style={gridColumn ? { gridColumn } : undefined}
        >
          {MATERIAL_PURPOSE_OPTIONS.map((option) => (
            <MenuItem key={option.id} value={option.name}>{option.name}</MenuItem>
          ))}
        </TextField>
      );
    }
    if (field.id === 'effectiveDate' || field.id === 'expiryDate') {
      const dateFieldId: 'effectiveDate' | 'expiryDate' = field.id;
      return (
        <TextField
          key={dateFieldId}
          label={field.label}
          value={(form[dateFieldId] ?? '') as string}
          onChange={(event) => handleMaterialDateChange(dateFieldId, event.target.value || null)}
          type="datetime-local"
          size="small"
          fullWidth
          required={field.required}
          sx={fieldSx}
          inputProps={dateFieldId === 'expiryDate' && form.effectiveDate ? { min: form.effectiveDate } : undefined}
          InputLabelProps={{ shrink: true }}
          style={gridColumn ? { gridColumn } : undefined}
        />
      );
    }
    if (field.id === 'code') {
      return (
        <TextField
          key={field.id}
          label={field.label}
          value={form.code ?? ''}
          onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
          size="small"
          fullWidth
          required={field.required}
          sx={fieldSx}
          style={gridColumn ? { gridColumn } : undefined}
        />
      );
    }
    return (
      <TextField
        key={field.id}
        label={field.label}
        value={(form[field.id] ?? '') as string | number}
        onChange={(event) => {
          const value = field.type === 'number' ? (event.target.value === '' ? null : Number(event.target.value)) : event.target.value;
          setForm((current) => ({ ...current, [field.id]: value }));
        }}
        type={field.type ?? 'text'}
        size="small"
        fullWidth
        required={field.required}
        multiline={field.multiline}
        rows={field.multiline ? 3 : undefined}
        sx={field.multiline ? undefined : fieldSx}
        style={gridColumn ? { gridColumn } : undefined}
      />
    );
  };

  const renderMaterialFormSection = (title: string, fieldIds: Array<keyof ProcessModelingPayload>) => {
    const fields = config.formFields.filter((field) => fieldIds.includes(field.id));
    return (
      <DetailSection title={title}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {fields.map(renderFormField)}
        </Box>
      </DetailSection>
    );
  };
  const shouldRenderMaterialBaseSection = materialDialogMode === 'createMaterial' || materialDialogMode === 'editMaterial';
  const shouldRenderMaterialVersionSection = materialDialogMode === 'createMaterial' || materialDialogMode === 'createVersion' || materialDialogMode === 'editVersion';

  const renderCell = (row: ProcessModelingRecord, column: ProcessColumn) => {
    const commonSx = {
      width: getColumnWidth(column),
      minWidth: column.minWidth,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      ...getStickyActionColumnSx(column, 'body'),
    };
    if (column.id === 'actions') {
      if (isReadOnlyPage(config)) return null;
      return (
        <TableCell key={column.id} align="center" sx={commonSx}>
          {renderRowActions(row)}
        </TableCell>
      );
    }
    return (
      <TableCell key={column.id} align={column.align} sx={commonSx} title={getColumnDisplayValue(row, column.id)}>
        {column.id === 'status' ? (
          <StatusBadge label={getStatusLabel(pageKey === 'materials' ? getMaterialVersionRuntimeStatus(row as MaterialRecord) : row.status)} color={getStatusColor(pageKey === 'materials' ? getMaterialVersionRuntimeStatus(row as MaterialRecord) : row.status)} />
        ) : getColumnDisplayValue(row, column.id)}
      </TableCell>
    );
  };

  const renderEditAction = (row: ProcessModelingRecord, label = '编辑', materialMode?: Extract<MaterialDialogMode, 'editMaterial' | 'editVersion'>) => (
    <Tooltip title={label} arrow>
      <IconButton size="small" aria-label={label} onClick={(event) => { event.stopPropagation(); openEditDialog(row, materialMode); }}>
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderDeleteAction = (row: ProcessModelingRecord, scope?: DeleteTargetScope) => (
    <Tooltip title="删除" arrow>
      <IconButton size="small" aria-label="删除" color="error" onClick={(event) => { event.stopPropagation(); openDeleteDialog(row, scope); }}>
        <Delete fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderAddMaterialVersionAction = (group: MaterialGroupRow) => (
    <Tooltip title="新增子版本" arrow>
      <IconButton title="新增子版本" size="small" aria-label="新增子版本" onClick={(event) => { event.stopPropagation(); openCreateMaterialVersionDialog(group.latestVersion); }}>
        <PlaylistAdd fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderRowActions = (row: ProcessModelingRecord) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {renderEditAction(row)}
      {renderDeleteAction(row)}
    </Stack>
  );

  const renderSingleVersionMaterialGroupActions = (group: MaterialGroupRow) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {renderAddMaterialVersionAction(group)}
      {renderEditAction(group.latestVersion, '编辑', 'editMaterial')}
      {renderDeleteAction(group.latestVersion, 'material')}
    </Stack>
  );

  const renderMultiVersionMaterialGroupActions = (group: MaterialGroupRow) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {renderAddMaterialVersionAction(group)}
      {renderEditAction(group.latestVersion, '编辑', 'editMaterial')}
    </Stack>
  );

  const renderMaterialVersionActions = (row: MaterialRecord, canDelete: boolean) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      <Tooltip title="编辑" arrow>
        <IconButton size="small" aria-label="编辑" onClick={(event) => { event.stopPropagation(); openEditDialog(row, 'editVersion'); }}>
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>
      {canDelete ? renderDeleteAction(row) : null}
    </Stack>
  );

  const renderMaterialGroupCell = (group: MaterialGroupRow, column: ProcessColumn) => {
    const latest = group.latestVersion;
    if (column.id === 'name') return group.materialGroupDisplayName;
    if (column.id === 'code') return group.code;
    if (column.id === 'version') return String(group.versionCount);
    if (column.id === 'effectiveVersionCount') return String(group.effectiveVersionCount);
    return getColumnDisplayValue(latest, column.id);
  };

  const renderMaterialVersionTable = (group: MaterialGroupRow) => {
    return (
      <TableRow key={`${group.id}:versions`} sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
        <TableCell colSpan={visibleColumns.length} sx={{ p: 0, bgcolor: '#fafcff' }}>
          <TableContainer sx={{ width: '100%', bgcolor: '#fff', overflow: 'visible' }}>
            <Table stickyHeader size="small" aria-label="物料版本列表" sx={{ tableLayout: 'fixed', width: totalMaterialVersionTableWidth, minWidth: totalMaterialVersionTableWidth }}>
              <colgroup>
                {visibleMaterialVersionColumns.map((column) => <col key={`${group.id}:${column.id}`} style={{ width: getMaterialVersionColumnWidth(column) }} />)}
              </colgroup>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                  {visibleMaterialVersionColumns.map((column) => (
                      <TableCell key={column.id} align={column.align} sx={{ width: getMaterialVersionColumnWidth(column), minWidth: column.minWidth, position: 'sticky', top: 0, zIndex: 5, userSelect: 'none', ...(column.resizable ? { pr: 2 } : {}), ...getStickyActionColumnSx(column, 'head') }}>
                        {column.label}
                        {column.resizable ? (
                          <Box
                            data-process-material-version-column-resizer
                            onMouseDown={(event) => beginMaterialVersionColumnResize(event, column.id)}
                            sx={{ position: 'absolute', top: 0, right: 0, zIndex: 3, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none', '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 18, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }}
                          />
                        ) : null}
                      </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {group.versions.map((versionRow) => (
                  <TableRow key={`${group.groupKey}:${getMaterialVersion(versionRow)}`} hover onClick={() => openMaterialVersionDrawer(versionRow)} sx={{ cursor: 'pointer', '& .MuiTableCell-root': tableBodyCellSx }}>
                    {visibleMaterialVersionColumns.map((column) => {
                      const commonSx = {
                        width: getMaterialVersionColumnWidth(column),
                        minWidth: column.minWidth,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        ...getStickyActionColumnSx(column, 'body'),
                      };
                      return (
                        <TableCell key={column.id} align={column.align} sx={commonSx} title={column.id === 'description' ? versionRow.description || '-' : undefined}>
                          {column.id === 'version' ? getMaterialVersion(versionRow) : column.id === 'status' ? (
                            <StatusBadge label={getStatusLabel(getMaterialVersionRuntimeStatus(versionRow))} color={getStatusColor(getMaterialVersionRuntimeStatus(versionRow))} />
                          ) : column.id === 'effectiveDate' ? formatDateTime(versionRow.effectiveDate) : column.id === 'expiryDate' ? formatDateTime(versionRow.expiryDate) : column.id === 'description' ? versionRow.description || '-' : column.id === 'createdBy' ? versionRow.createdBy || '-' : column.id === 'createdAt' ? formatDateTime(versionRow.createdAt) : column.id === 'updatedBy' ? versionRow.updatedBy || '-' : column.id === 'updatedAt' ? formatDateTime(versionRow.updatedAt) : column.id === 'actions' ? (
                            renderMaterialVersionActions(versionRow, group.versions.length > 1)
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

  const renderTableRow = (row: ProcessTableRow) => {
    if (isMaterialGroupRow(row)) {
      const isExpanded = expandedMaterialGroups.has(row.groupKey);
      return (
        <>
          <TableRow key={row.id} hover onClick={() => openMaterialGroupDrawer(row)} sx={{ cursor: 'pointer', '& .MuiTableCell-root': tableBodyCellSx }}>
            {visibleColumns.map((column, index) => {
              const commonSx = {
                width: getColumnWidth(column),
                minWidth: column.minWidth,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                ...getStickyActionColumnSx(column, 'body'),
              };
              return (
                <TableCell key={column.id} align={column.align} sx={commonSx} title={String(renderMaterialGroupCell(row, column))}>
                  {column.id === 'actions' ? (row.versions.length > 1 ? renderMultiVersionMaterialGroupActions(row) : renderSingleVersionMaterialGroupActions(row)) : index === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          expandMaterialGroup(row.groupKey);
                        }}
                        sx={{ width: 24, height: 24, color: '#606266' }}
                      >
                        {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      </IconButton>
                      <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {renderMaterialGroupCell(row, column)}
                      </Typography>
                    </Box>
                  ) : column.id === 'version' ? (
                    <Typography sx={{ color: '#606266' }}>{renderMaterialGroupCell(row, column)}</Typography>
                  ) : column.id === 'status' ? (
                    <StatusBadge label={getStatusLabel(row.status)} color={getStatusColor(row.status)} />
                  ) : (
                    renderMaterialGroupCell(row, column)
                  )}
                </TableCell>
              );
            })}
          </TableRow>
          {isExpanded ? renderMaterialVersionTable(row) : null}
        </>
      );
    }

    return (
      <TableRow key={getRecordId(row)} hover onClick={() => openDetailDrawer(row)} sx={{ cursor: 'pointer', '& .MuiTableCell-root': tableBodyCellSx }}>
        {visibleColumns.map((column) => renderCell(row, column))}
      </TableRow>
    );
  };

  function getColumnDisplayValue(row: ProcessModelingRecord, columnId: ProcessColumnId) {
    if (columnId === 'name') return getDisplayName(row);
    if (columnId === 'status') return getStatusLabel(pageKey === 'materials' ? getMaterialVersionRuntimeStatus(row as MaterialRecord) : row.status);
    if (columnId === 'createdAt' || columnId === 'updatedAt') return formatDateTime(row[columnId]);
    if (columnId === 'effectiveDate' || columnId === 'expiryDate') return 'effectiveDate' in row || 'expiryDate' in row ? formatDateTime(row[columnId as 'effectiveDate' | 'expiryDate']) : '-';
    if (columnId === 'version') return 'version' in row ? row.version || '-' : '-';
    if (columnId === 'code') return row.code || '-';
    if (columnId === 'materialTypeId') {
      const value = 'materialTypeId' in row ? row.materialTypeId : undefined;
      if (value == null || value === '') return '-';
      if ('materialTypeName' in row && row.materialTypeName) return row.materialTypeName;
      return materialTypeNameMap.get(String(value)) ?? String(value);
    }
    if (columnId === 'productFamilyId') {
      const value = 'productFamilyId' in row ? row.productFamilyId : 'familyId' in row ? row.familyId : undefined;
      return value == null || value === '' ? '-' : String(value);
    }
    if (columnId in row) {
      const value = row[columnId as keyof ProcessModelingRecord];
      return value == null || value === '' ? '-' : String(value);
    }
    return '-';
  }

  function getStickyActionColumnSx(column: ProcessColumn, layer: 'head' | 'body') {
    if (column.id !== 'actions') return {};
    return {
      position: 'sticky',
      right: 0,
      zIndex: layer === 'head' ? 8 : 4,
      bgcolor: layer === 'head' ? '#f5f7fa' : '#fff',
    };
  }

  const filterFields = pageKey === 'materials' ? renderMaterialFilters() : (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(180px, 240px) minmax(160px, 200px) 1fr' }, gap: 1.5, alignItems: 'center' }}>
      <TextField
        size="small"
        label="名称/编码"
        placeholder="请输入"
        value={filters.keyword}
        onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
        sx={fieldSx}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
      />
      <TextField
        select
        size="small"
        label="状态"
        value={filters.status}
        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        sx={fieldSx}
      >
        {statusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
      </TextField>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
        <Button size="small" sx={QUERY_BUTTON_SX} variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>重置</Button>
        <Button size="small" sx={QUERY_BUTTON_SX} variant="contained" startIcon={<Search />} onClick={() => setPage(1)}>查询</Button>
      </Stack>
    </Box>
  );

  return (
      <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, p: 2, maxWidth: '100%', minWidth: 0 }}>
        {filterFields}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="字段设置" arrow>
              <IconButton
                data-process-column-settings-trigger
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
            {pageKey === 'materials' ? (
              <>
                <Tooltip title="全部展开" arrow>
                  <IconButton size="small" aria-label="全部展开" onClick={expandAllMaterialGroups} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}>
                    <UnfoldMoreRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="全部收起" arrow>
                  <IconButton size="small" aria-label="全部收起" onClick={collapseAllMaterialGroups} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}>
                    <UnfoldLessRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : null}
          </Stack>
          {isReadOnlyPage(config) ? (
            <Typography variant="body2" sx={{ color: '#606266' }}>{config.derivedFrom}</Typography>
          ) : (
            <Button size="small" variant="contained" startIcon={<Add />} onClick={openCreateDialog}>新增</Button>
          )}
        </Stack>

        <Popover
          open={Boolean(columnSettingsAnchorEl)}
          anchorEl={columnSettingsAnchorEl}
          onClose={() => setColumnSettingsAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { mt: 1, width: 220, border: '1px solid #e4e7ed', borderRadius: 1, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } }}
        >
          <Stack data-process-column-settings-panel spacing={0.5} sx={{ p: 1.5 }}>
            {pageKey === 'materials' ? (
              <Tabs value={columnSettingsTab} onChange={(_, value: ColumnSettingsTarget) => setColumnSettingsTab(value)} aria-label="物料字段设置切换" sx={{ minHeight: 32, mb: 0.5, '& .MuiTab-root': { minHeight: 32, py: 0, fontSize: 13 } }}>
                <Tab label="主表" value="main" />
                <Tab label="子表" value="materialVersion" />
              </Tabs>
            ) : null}
            {activeColumnSettingsItems.map((column) => {
              const checked = !activeColumnSettings.hidden.includes(column.id);
              const disabled = checked && activeVisibleConfigurableColumnCount <= 1;
              return (
                <Box
                  key={column.id}
                  data-process-column-settings-row
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
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: totalTableWidth, minWidth: totalTableWidth, height: isTableEmptyState ? '100%' : 'auto' }}>
              <colgroup>
                {visibleColumns.map((column) => <col key={column.id} style={{ width: getColumnWidth(column) }} />)}
              </colgroup>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id} align={column.align} sx={{ width: getColumnWidth(column), minWidth: column.minWidth, position: 'sticky', top: 0, zIndex: 5, userSelect: 'none', ...(column.resizable ? { pr: 2 } : {}), ...getStickyActionColumnSx(column, 'head') }}>
                      {column.label}
                      {column.resizable ? (
                        <Box
                          data-process-column-resizer
                          onMouseDown={(event) => beginColumnResize(event, column.id)}
                          sx={{ position: 'absolute', top: 0, right: 0, zIndex: 3, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none', '&::after': { content: '""', position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '1px', height: 18, bgcolor: '#dcdfe6' }, '&:hover': { bgcolor: '#d1e9ff' }, '&:hover::after': { bgcolor: '#1890ff' } }}
                        />
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody sx={{ height: isTableEmptyState ? '100%' : 'auto' }}>
                {isLoading ? (
                  <TableRow sx={emptyTableRowSx}><TableCell colSpan={visibleColumns.length} align="center" sx={emptyTableBodyCellSx}><CircularProgress size={24} /></TableCell></TableRow>
                ) : isError ? (
                  <TableRow sx={emptyTableRowSx}><TableCell colSpan={visibleColumns.length} align="center" sx={emptyTableBodyCellSx}>加载失败</TableCell></TableRow>
                ) : displayRows.length === 0 ? (
                  <TableRow sx={emptyTableRowSx}><TableCell colSpan={visibleColumns.length} align="center" sx={emptyTableBodyCellSx}>暂无数据</TableCell></TableRow>
                ) : displayRows.map((row) => renderTableRow(row))}
              </TableBody>
            </Table>
          </TableContainer>
          {visibleColumns.some((column) => column.id === 'actions') ? (
            <Box data-process-action-column-shadow sx={{ position: 'absolute', top: 0, bottom: 0, right: tableScrollbarWidth, width: PROCESS_ACTION_COLUMN_WIDTH, boxShadow: '-6px 0 8px -8px rgba(0,0,0,.35)', pointerEvents: 'none', zIndex: 7 }} />
          ) : null}
        </Box>

        <Box sx={{ minHeight: 56, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography sx={{ color: '#909399' }}>共 {displayTotalElements} 条数据</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Pagination page={page} count={pageCount} color="primary" size="small" onChange={(_, value) => setPage(value)} />
            <FormControl size="small" sx={{ minWidth: 116 }}>
              <Select
                value={rowsPerPage}
                onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(1); }}
                sx={{ height: 32, fontSize: 14 }}
              >
                {PAGE_SIZE_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option} 条/页</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={appContentDrawerSx} slotProps={{ backdrop: { sx: appContentDrawerSx } }} PaperProps={{ sx: appContentDrawerPaperSx }}>
        <Box sx={{ width: { xs: '100vw', sm: 560 }, p: 2, bgcolor: '#f7f9fc', minHeight: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>信息查看</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)} aria-label="关闭详情"><Close /></IconButton>
          </Stack>
          {!selectedRow ? null : (
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
                      <DetailField label="名称">{getDisplayName(selectedRow)}</DetailField>
                      <DetailField label={pageKey === 'materials' ? '物料料号' : '系统编码'}>{selectedRow.code || '-'}</DetailField>
                      {pageKey === 'materials' ? (
                        <>
                          <DetailField label="规格型号">{'specification' in selectedRow ? selectedRow.specification || '-' : '-'}</DetailField>
                          <DetailField label="物料类型">{'materialTypeName' in selectedRow ? selectedRow.materialTypeName || materialTypeMapValue(selectedRow.materialTypeId) || '-' : '-'}</DetailField>
                          <DetailField label="单位">{'unit' in selectedRow ? selectedRow.unit || '-' : '-'}</DetailField>
                          <DetailField label="版本">{'version' in selectedRow ? selectedRow.version || '-' : '-'}</DetailField>
                          <DetailField label="物料用途">{'materialPurpose' in selectedRow ? selectedRow.materialPurpose || '-' : '-'}</DetailField>
                          <DetailField label="生效日期">{'effectiveDate' in selectedRow ? formatDateTime(selectedRow.effectiveDate) : '-'}</DetailField>
                          <DetailField label="失效日期">{'expiryDate' in selectedRow ? formatDateTime(selectedRow.expiryDate) : '-'}</DetailField>
                        </>
                      ) : null}
                      <DetailField label="状态">{getStatusLabel(selectedRow.status)}</DetailField>
                      <DetailField label="描述">{selectedRow.description || '-'}</DetailField>
                    </Box>
                  </DetailSection>
                  <DetailSection title="系统信息">
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                      <DetailField label="创建人">{selectedRow.createdBy || '-'}</DetailField>
                      <DetailField label="创建时间">{formatDateTime(selectedRow.createdAt)}</DetailField>
                      <DetailField label="更新人">{selectedRow.updatedBy || selectedRow.createdBy || '-'}</DetailField>
                      <DetailField label="更新时间">{formatDateTime(selectedRow.updatedAt || selectedRow.createdAt)}</DetailField>
                    </Box>
                  </DetailSection>
                </Stack>
              ) : null}
              {drawerTab === 1 ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <DetailSection title="审计记录">
                    <Stack spacing={1}>
                      {isAuditLoading ? (
                        <Box sx={{ px: 1.5, py: 3, textAlign: 'center', color: '#909399', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: '4px' }}>
                          <Typography variant="body2">审计记录加载中</Typography>
                        </Box>
                      ) : isAuditError ? (
                        <Box sx={{ px: 1.5, py: 3, textAlign: 'center', color: '#f56c6c', bgcolor: '#fff', border: '1px solid #fbc4c4', borderRadius: '4px' }}>
                          <Typography variant="body2">审计记录加载失败</Typography>
                        </Box>
                      ) : auditRecords.length === 0 ? (
                        <Box sx={{ px: 1.5, py: 3, textAlign: 'center', color: '#909399', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: '4px' }}>
                          <Typography variant="body2">暂无审计记录</Typography>
                        </Box>
                      ) : auditRecords.map((record) => (
                        <Accordion key={record.id} data-audit-accordion-row={record.id} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', bgcolor: '#fff', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}>
                          <AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ minHeight: 44, px: 1.5, '&.Mui-expanded': { minHeight: 44 }, '& .MuiAccordionSummary-content': { m: 0, minWidth: 0 }, '& .MuiAccordionSummary-content.Mui-expanded': { m: 0 } }}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRow ? `编辑${config.title}` : creatingMaterialVersionFrom ? '新增子版本' : `新增${config.title}`}</DialogTitle>
        <DialogContent dividers>
          {pageKey === 'materials' ? (
            <Stack spacing={1.5} sx={{ pt: 0.5 }}>
              {shouldRenderMaterialBaseSection ? renderMaterialFormSection('物料基础信息', MATERIAL_BASE_FIELD_IDS) : null}
              {shouldRenderMaterialVersionSection ? renderMaterialFormSection('物料版本信息', MATERIAL_VERSION_FIELD_IDS) : null}
            </Stack>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, pt: 0.5 }}>
              {config.formFields.map(renderFormField)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={submitForm} disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{deleteDialogTitle}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            {deleteDialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.row)}
            disabled={deleteMutation.isPending}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
