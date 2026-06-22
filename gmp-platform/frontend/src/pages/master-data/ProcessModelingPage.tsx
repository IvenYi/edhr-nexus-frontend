import {
  Fragment,
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
  Background,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type OnNodeDrag,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
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
  CenterFocusStrongRounded,
  Close,
  Delete,
  DragIndicator,
  Edit,
  ExpandLess,
  ExpandMore,
  MouseOutlined,
  PanToolOutlined,
  PlaylistAdd,
  RemoveRounded,
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
  createProcessOperationCategory,
  createProcessOperation,
  createProcessProductFamily,
  createProcessRoute,
  createProcessRouteVersion,
  deleteMaterial,
  deleteProcessDocument,
  deleteProcessOperationCategory,
  deleteProcessOperation,
  deleteProcessProductFamily,
  deleteProcessRoute,
  getMaterials,
  getProcessDocuments,
  getProcessOperationCategories,
  getProcessOperations,
  getProcessProductFamilies,
  getProcessRouteGraph,
  getProcessRoutes,
  getProducts,
  type MaterialRecord,
  type OperationCategoryRecord,
  type OperationRecord,
  updateMaterial,
  updateProcessOperationCategory,
  updateProcessDocument,
  updateProcessOperation,
  updateProcessProductFamily,
  updateProcessRoute,
  type ProcessModelingEntityType,
  type ProcessModelingPayload,
  type ProcessModelingQuery,
  type ProcessModelingRecord,
  type RouteGraphPayload,
  type RouteGraphResponse,
  type RouteNodeRecord,
  type RouteRecord,
  type RouteRelationRecord,
  type RouteVersionRecord,
  reorderProcessOperationCategories,
  saveProcessRouteGraph,
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
  | 'versionDescription'
  | 'versionCount'
  | 'commonAsset'
  | 'fileReference'
  | 'description'
  | 'operationCategory'
  | 'generalDescription'
  | 'defaultOperationType'
  | 'defaultDurationMinutes'
  | 'sortOrder'
  | 'status'
  | 'createdBy'
  | 'createdAt'
  | 'updatedBy'
  | 'updatedAt'
  | 'actions';

type ConfigurableProcessColumnId = Exclude<ProcessColumnId, 'actions'>;
type ColumnSettingsTarget = 'main' | 'materialVersion' | 'routeVersion';
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
  operationName: string;
  operationCode: string;
  materialName: string;
  materialCode: string;
  materialTypeName: string;
  operationCategory: string;
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

interface OperationCategoryDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  category?: OperationCategoryRecord;
  name: string;
}

interface RouteFlowNodeData extends Record<string, unknown> {
  label: string;
  operationId?: string | number | null;
  operationCode?: string | null;
  operationName?: string | null;
  nodeType?: string | null;
  virtual?: boolean;
  sourceConnected?: boolean;
  targetConnected?: boolean;
}

interface RouteFlowEdgeData extends Record<string, unknown> {
  relationType: string;
  label: string;
  ruleExpression?: string | null;
}

type RouteFlowNode = Node<RouteFlowNodeData>;
type RouteFlowEdge = Edge<RouteFlowEdgeData>;
type RouteDesignerInteractionMode = 'pan' | 'select';

interface RouteCanvasDropPreview {
  left: number;
  top: number;
  zoom: number;
  label: string;
}

type ProcessTableRow = ProcessModelingRecord | MaterialGroupRow;

const PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;
const TABLE_DATA_ROW_HEIGHT = 40;
const PROCESS_MODELING_COLUMN_WIDTH_STORAGE_PREFIX = 'process-modeling-column-widths:';
const PROCESS_MODELING_COLUMN_SETTINGS_STORAGE_PREFIX = 'process-modeling-column-settings:';
const PROCESS_MODELING_MATERIAL_VERSION_COLUMN_WIDTH_STORAGE_PREFIX = 'process-modeling-material-version-column-widths:';
const PROCESS_MODELING_MATERIAL_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX = 'process-modeling-material-version-column-settings:';
const PROCESS_MODELING_ROUTE_VERSION_COLUMN_WIDTH_STORAGE_PREFIX = 'process-modeling-route-version-column-widths:';
const PROCESS_MODELING_ROUTE_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX = 'process-modeling-route-version-column-settings:';
const PROCESS_MODELING_COLUMN_SETTINGS_VERSION = 1;
const PROCESS_FIELD_COLUMN_MIN_WIDTH = 80;
const PROCESS_ACTION_COLUMN_WIDTH = 112;
const OPERATION_CATEGORY_ALL = 'ALL';
const OPERATION_CATEGORY_UNCATEGORIZED = 'UNCATEGORIZED';
const QUERY_BUTTON_SX = { height: 40, width: 80, minWidth: 80 };
const ROUTE_DESIGNER_LIBRARY_DEFAULT_WIDTH = 360;
const ROUTE_DESIGNER_LIBRARY_MIN_WIDTH = 240;
const ROUTE_DESIGNER_LIBRARY_MAX_WIDTH = 460;
const ROUTE_START_NODE_KEY = '__route_start__';
const ROUTE_END_NODE_KEY = '__route_end__';
const ROUTE_VIRTUAL_NODE_LABELS = {
  START: '开始',
  END: '结束',
} as const;
const ROUTE_DESIGNER_ALIGNMENT_THRESHOLD = 8;
const ROUTE_DESIGNER_OPERATION_NODE_WIDTH = 128;
const ROUTE_DESIGNER_OPERATION_NODE_HEIGHT = 38;
const ROUTE_DESIGNER_EDGE_MARKER_SIZE = 14;
const ROUTE_DESIGNER_CONNECTED_COLOR = '#1890ff';
const routeDesignerNodeTypes = {
  routeDesigner: RouteDesignerNode,
};
const ROUTE_DESIGNER_HANDLE_STYLE = {
  width: 10,
  height: 10,
  background: '#1f2937',
  border: '2px solid #fff',
  boxShadow: '0 1px 4px rgba(31, 41, 55, 0.28)',
} as const;
const ROUTE_DESIGNER_CONNECTED_HANDLE_STYLE = {
  ...ROUTE_DESIGNER_HANDLE_STYLE,
  background: ROUTE_DESIGNER_CONNECTED_COLOR,
  boxShadow: '0 1px 4px rgba(24, 144, 255, 0.32)',
} as const;
const ROUTE_DESIGNER_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: ROUTE_DESIGNER_EDGE_MARKER_SIZE,
  height: ROUTE_DESIGNER_EDGE_MARKER_SIZE,
  color: ROUTE_DESIGNER_CONNECTED_COLOR,
} as const;
const ROUTE_DESIGNER_CONNECTED_EDGE_STYLE = {
  stroke: ROUTE_DESIGNER_CONNECTED_COLOR,
  strokeWidth: 2,
} as const;
const MATERIAL_BASE_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['name', 'code', 'specification', 'materialTypeId', 'unit', 'materialPurpose'];
const MATERIAL_VERSION_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['version', 'effectiveDate', 'expiryDate', 'description'];
const ROUTE_BASE_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['name', 'description'];
const ROUTE_VERSION_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['version', 'effectiveDate', 'expiryDate', 'versionDescription'];
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

function RouteDesignerNode({ data, selected, isConnectable }: NodeProps<RouteFlowNode>) {
  const isStartNode = data.nodeType === 'START';
  const isEndNode = data.nodeType === 'END';
  const isVirtualNode = isStartNode || isEndNode || data.virtual;
  const nodeLabel = data.label || '';

  return (
    <Box
      data-process-route-node
      data-process-route-node-type={data.nodeType ?? 'OPERATION'}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        width: isVirtualNode ? '100%' : 'auto',
        height: isVirtualNode ? '100%' : 'auto',
        minWidth: isVirtualNode ? undefined : ROUTE_DESIGNER_OPERATION_NODE_WIDTH,
        minHeight: isVirtualNode ? undefined : ROUTE_DESIGNER_OPERATION_NODE_HEIGHT,
        px: isVirtualNode ? 1 : 1.5,
        py: isVirtualNode ? 0 : 1,
        borderRadius: isVirtualNode ? 'inherit' : 1,
        border: isVirtualNode ? 'none' : selected ? '1px solid #1890ff' : '1px solid #dcdfe6',
        bgcolor: isVirtualNode ? 'transparent' : '#fff',
        color: 'inherit',
        boxShadow: !isVirtualNode && selected ? '0 0 0 2px rgba(24, 144, 255, 0.12)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {data.nodeType !== 'START' ? (
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={data.targetConnected ? ROUTE_DESIGNER_CONNECTED_HANDLE_STYLE : ROUTE_DESIGNER_HANDLE_STYLE} />
      ) : null}
      <Typography variant="body2" sx={{ color: 'inherit', fontWeight: isVirtualNode ? 600 : 500, lineHeight: 1.2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {nodeLabel}
      </Typography>
      {data.nodeType !== 'END' ? (
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={data.sourceConnected ? ROUTE_DESIGNER_CONNECTED_HANDLE_STYLE : ROUTE_DESIGNER_HANDLE_STYLE} />
      ) : null}
    </Box>
  );
}

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
  { value: 'DISABLED', label: '禁用' },
] as const;
const PROCESS_OPERATION_STATUS_OPTIONS = [
  { value: 'ALL', label: '全部' },
  { value: 'ACTIVE', label: '启用' },
  { value: 'DISABLED', label: '禁用' },
] as const;
const materialRuntimeStatusOptions = [
  { value: 'ALL', label: '全部' },
  { value: 'ACTIVE', label: '启用' },
  { value: 'PENDING', label: '待生效' },
  { value: 'DISABLED', label: '禁用' },
] as const;

const STANDARD_MATERIAL_TYPE_OPTIONS = ['原材料', '半成品', '产成品', '辅材', '包材'].map((name) => ({ id: name, name }));
const MATERIAL_PURPOSE_OPTIONS = ['试验物料', '生产物料'].map((name) => ({ id: name, name }));
const PROCESS_OPERATION_TYPES = ['普通工序', '关键工序', '特殊过程', '检验工序', '外协工序'] as const;
const DEFAULT_ROUTE_RELATION_TYPE = 'SEQUENTIAL';
const ROUTE_RELATION_LABELS: Record<string, string> = {
  SEQUENTIAL: '串行',
  PARALLEL: '并行',
  OPTIONAL: '可选分支',
  REWORK: '返工回流',
  JUMP: '跳转规则',
  ALTERNATIVE: '替代工序',
};

const MATERIAL_VERSION_COLUMNS: ProcessColumn[] = (['version', 'status', 'effectiveDate', 'expiryDate', 'description', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions'] as const).map((id) => ({
  id,
  label: id === 'version' ? '物料版本号' : id === 'status' ? '版本状态' : id === 'effectiveDate' ? '生效日期' : id === 'expiryDate' ? '失效日期' : id === 'description' ? '版本说明' : id === 'createdBy' ? '创建人' : id === 'createdAt' ? '创建时间' : id === 'updatedBy' ? '更新人' : id === 'updatedAt' ? '更新时间' : '操作',
  defaultWidth: id === 'actions' ? PROCESS_ACTION_COLUMN_WIDTH : defaultWidthForColumn(id),
  minWidth: id === 'actions' ? PROCESS_ACTION_COLUMN_WIDTH : PROCESS_FIELD_COLUMN_MIN_WIDTH,
  resizable: id !== 'actions',
  align: id === 'actions' ? 'center' : 'left',
}));
const materialVersionColumnSettingsConfig: ProcessColumnSettingsConfig = { columns: MATERIAL_VERSION_COLUMNS };
const ROUTE_VERSION_COLUMNS: ProcessColumn[] = (['version', 'status', 'effectiveDate', 'expiryDate', 'description', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions'] as const).map((id) => ({
  id,
  label: id === 'version' ? '工艺路线版本号' : id === 'status' ? '版本状态' : id === 'effectiveDate' ? '生效日期' : id === 'expiryDate' ? '失效日期' : id === 'description' ? '版本说明' : id === 'createdBy' ? '创建人' : id === 'createdAt' ? '创建时间' : id === 'updatedBy' ? '更新人' : id === 'updatedAt' ? '更新时间' : '操作',
  defaultWidth: id === 'actions' ? PROCESS_ACTION_COLUMN_WIDTH : defaultWidthForColumn(id),
  minWidth: id === 'actions' ? PROCESS_ACTION_COLUMN_WIDTH : PROCESS_FIELD_COLUMN_MIN_WIDTH,
  resizable: id !== 'actions',
  align: id === 'actions' ? 'center' : 'left',
}));
const routeVersionColumnSettingsConfig: ProcessColumnSettingsConfig = { columns: ROUTE_VERSION_COLUMNS };

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
  versionDescription: '版本说明',
  versionCount: '版本数量',
  commonAsset: '通用资产',
  fileReference: '文件引用',
  description: '描述',
  operationCategory: '工序分类',
  generalDescription: '工序通用描述',
  defaultOperationType: '默认工序类型',
  defaultDurationMinutes: '标准工时',
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
  versionDescription: '版本说明',
  versionCount: '版本数量',
  commonAsset: '通用资产',
  latestVersion: '当前版本',
  latestVersionStatus: '版本状态',
  fileReference: '文件引用',
  operationCategory: '工序分类',
  generalDescription: '工序通用描述',
  defaultOperationType: '默认工序类型',
  defaultDurationMinutes: '标准工时',
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
    labels: { name: '工序名称', code: '工序编码' },
    columns: baseColumns(['name', 'code', 'operationCategory', 'defaultOperationType', 'defaultDurationMinutes', 'generalDescription', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'], { labels: { name: '工序名称', code: '工序编码' } }),
    formFields: [
      { id: 'name', label: '工序名称', required: true },
      { id: 'code', label: '工序编码', required: true },
      { id: 'operationCategory', label: '工序分类' },
      { id: 'defaultOperationType', label: '默认工序类型' },
      { id: 'defaultDurationMinutes', label: '标准工时', type: 'number' },
      { id: 'status', label: '状态' },
      { id: 'generalDescription', label: '工序通用描述', multiline: true },
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
    labels: { name: '工艺路线模板名称', version: '版本数量' },
    columns: baseColumns(['name', 'version', 'description', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'], { labels: { name: '工艺路线模板名称', version: '版本数量' } }),
    formFields: [
      { id: 'name', label: '工艺路线模板名称', required: true },
      { id: 'version', label: '版本', required: true },
      { id: 'effectiveDate', label: '生效时间' },
      { id: 'expiryDate', label: '失效时间' },
      { id: 'description', label: '描述', multiline: true },
      { id: 'versionDescription', label: '版本说明', multiline: true },
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
  if (id === 'description' || id === 'generalDescription' || id === 'fileReference') return 220;
  if (id === 'createdAt' || id === 'updatedAt') return 160;
  if (id === 'effectiveVersionCount') return 130;
  if (id === 'versionCount') return 110;
  if (id === 'commonAsset') return 110;
  if (id === 'materialPurpose') return 120;
  if (id === 'effectiveDate' || id === 'expiryDate') return 150;
  if (id === 'operationCategory' || id === 'defaultOperationType') return 140;
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
    DRAFT: '禁用',
    DISABLED: '禁用',
    OBSOLETE: '禁用',
  }[status] ?? status;
}

function getStatusColor(status?: string) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'DISABLED' || status === 'OBSOLETE' || status === 'EXPIRED' || status === 'DRAFT') return 'error';
  if (status === 'PENDING') return 'warning';
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

function getRouteRelationLabel(type?: string | null) {
  return type ? ROUTE_RELATION_LABELS[type] ?? type : '串行';
}

function createRouteFlowNode(operation: OperationRecord, position: { x: number; y: number }): RouteFlowNode {
  const operationName = getDisplayName(operation);
  return {
    id: `operation-${operation.id}-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    type: 'routeDesigner',
    position,
    data: {
      label: operationName,
      operationId: operation.id,
      operationCode: operation.code,
      operationName,
      nodeType: 'OPERATION',
    },
  };
}

function getRouteBoundaryNodeType(nodeKey?: string | null, nodeType?: string | null): keyof typeof ROUTE_VIRTUAL_NODE_LABELS | null {
  const normalizedType = nodeType?.trim().toUpperCase();
  if (normalizedType === 'START' || nodeKey === ROUTE_START_NODE_KEY) return 'START';
  if (normalizedType === 'END' || nodeKey === ROUTE_END_NODE_KEY) return 'END';
  return null;
}

function getRouteEdgePresentation() {
  return {
    markerEnd: ROUTE_DESIGNER_EDGE_MARKER,
    style: ROUTE_DESIGNER_CONNECTED_EDGE_STYLE,
  };
}

function getRouteVirtualNodeStyle(nodeType: keyof typeof ROUTE_VIRTUAL_NODE_LABELS) {
  return {
    width: 92,
    height: 36,
    borderRadius: 18,
    border: nodeType === 'START' ? '1px solid #67c23a' : '1px solid #f56c6c',
    background: nodeType === 'START' ? '#f0f9eb' : '#fef0f0',
    color: nodeType === 'START' ? '#529b2e' : '#c45656',
    fontWeight: 600,
  };
}

function getRouteNodeNumericValue(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function getRouteNodeSize(node: RouteFlowNode) {
  const renderedNode = node as RouteFlowNode & { measured?: { width?: number; height?: number }; width?: number; height?: number };
  const fallbackWidth = node.data.virtual ? 92 : ROUTE_DESIGNER_OPERATION_NODE_WIDTH;
  const fallbackHeight = node.data.virtual ? 36 : ROUTE_DESIGNER_OPERATION_NODE_HEIGHT;
  return {
    width: getRouteNodeNumericValue(renderedNode.width ?? renderedNode.measured?.width ?? node.style?.width, fallbackWidth),
    height: getRouteNodeNumericValue(renderedNode.height ?? renderedNode.measured?.height ?? node.style?.height, fallbackHeight),
  };
}

function snapRouteAxis(position: number, draggedOffsets: number[], peerPosition: number, peerOffsets: number[]) {
  let nextPosition = position;
  let bestDistance = ROUTE_DESIGNER_ALIGNMENT_THRESHOLD + 1;
  draggedOffsets.forEach((draggedOffset) => {
    peerOffsets.forEach((peerOffset) => {
      const delta = peerPosition + peerOffset - (position + draggedOffset);
      const distance = Math.abs(delta);
      if (distance <= ROUTE_DESIGNER_ALIGNMENT_THRESHOLD && distance < bestDistance) {
        bestDistance = distance;
        nextPosition = position + delta;
      }
    });
  });
  return nextPosition;
}

function snapRouteNodeToPeers(node: RouteFlowNode, nodes: RouteFlowNode[]) {
  const nodeSize = getRouteNodeSize(node);
  const nodeXOffsets = [0, nodeSize.width / 2, nodeSize.width];
  const nodeYOffsets = [0, nodeSize.height / 2, nodeSize.height];
  return nodes.reduce((position, peer) => {
    if (peer.id === node.id) return position;
    const peerSize = getRouteNodeSize(peer);
    return {
      x: snapRouteAxis(position.x, nodeXOffsets, peer.position.x, [0, peerSize.width / 2, peerSize.width]),
      y: snapRouteAxis(position.y, nodeYOffsets, peer.position.y, [0, peerSize.height / 2, peerSize.height]),
    };
  }, node.position);
}

function createRouteVirtualNode(nodeType: keyof typeof ROUTE_VIRTUAL_NODE_LABELS, position?: { x: number; y: number }): RouteFlowNode {
  const isStart = nodeType === 'START';
  const label = ROUTE_VIRTUAL_NODE_LABELS[nodeType];
  const data: RouteFlowNodeData = isStart ? {
    label,
    operationId: null,
    operationCode: null,
    operationName: label,
    nodeType: 'START',
    virtual: true,
  } : {
    label,
    operationId: null,
    operationCode: null,
    operationName: label,
    nodeType: 'END',
    virtual: true,
  };
  return {
    id: isStart ? ROUTE_START_NODE_KEY : ROUTE_END_NODE_KEY,
    type: 'routeDesigner',
    position: position ?? { x: 360, y: isStart ? 40 : 520 },
    data,
    draggable: true,
    selectable: true,
    deletable: false,
    style: getRouteVirtualNodeStyle(nodeType),
  };
}

function normalizeRouteBoundaryNode(node: RouteFlowNode): RouteFlowNode {
  const nodeType = getRouteBoundaryNodeType(node.id, node.data.nodeType);
  if (!nodeType) return node;
  const label = ROUTE_VIRTUAL_NODE_LABELS[nodeType];
  return {
    ...node,
    id: nodeType === 'START' ? ROUTE_START_NODE_KEY : ROUTE_END_NODE_KEY,
    type: 'routeDesigner',
    data: {
      ...node.data,
      label,
      operationId: null,
      operationCode: null,
      operationName: label,
      nodeType,
      virtual: true,
    },
    draggable: true,
    selectable: true,
    deletable: false,
    style: getRouteVirtualNodeStyle(nodeType),
  };
}

function ensureRouteBoundaryNodes(nodes: RouteFlowNode[]): RouteFlowNode[] {
  const normalizedNodes = nodes.map(normalizeRouteBoundaryNode);
  const hasStart = normalizedNodes.some((node) => getRouteBoundaryNodeType(node.id, node.data.nodeType) === 'START');
  const hasEnd = normalizedNodes.some((node) => getRouteBoundaryNodeType(node.id, node.data.nodeType) === 'END');
  return [
    ...(hasStart ? [] : [createRouteVirtualNode('START')]),
    ...normalizedNodes,
    ...(hasEnd ? [] : [createRouteVirtualNode('END')]),
  ];
}

function fromRouteGraphResponse(graph?: RouteGraphResponse | null): { nodes: RouteFlowNode[]; edges: RouteFlowEdge[] } {
  const nodes = ensureRouteBoundaryNodes((graph?.nodes ?? []).map<RouteFlowNode>((node, index) => {
    const boundaryNodeType = getRouteBoundaryNodeType(node.nodeKey, node.nodeType);
    return {
      id: node.nodeKey,
      type: 'routeDesigner',
      position: {
        x: node.positionX ?? (boundaryNodeType ? 360 : 80 + index * 180),
        y: node.positionY ?? (boundaryNodeType === 'START' ? 40 : boundaryNodeType === 'END' ? 520 : 120),
      },
      data: {
        label: boundaryNodeType ? ROUTE_VIRTUAL_NODE_LABELS[boundaryNodeType] : node.operationName || node.operationCode || node.nodeKey,
        operationId: boundaryNodeType ? null : node.operationId ?? null,
        operationCode: boundaryNodeType ? null : node.operationCode ?? null,
        operationName: boundaryNodeType ? ROUTE_VIRTUAL_NODE_LABELS[boundaryNodeType] : node.operationName ?? null,
        nodeType: boundaryNodeType ?? node.nodeType ?? 'OPERATION',
        virtual: Boolean(boundaryNodeType),
      },
    };
  }));
  const edges = (graph?.relations ?? []).map<RouteFlowEdge>((relation, index) => {
    const label = relation.label || getRouteRelationLabel(relation.relationType);
    const edgePresentation = getRouteEdgePresentation();
    return {
      id: `${relation.sourceNodeKey}-${relation.targetNodeKey}-${index}`,
      source: relation.sourceNodeKey,
      target: relation.targetNodeKey,
      type: 'smoothstep',
      ...edgePresentation,
      data: {
        relationType: relation.relationType || 'SEQUENTIAL',
        label,
        ruleExpression: relation.ruleExpression ?? null,
      },
    };
  });
  return { nodes, edges };
}

function toRouteGraphPayload(nodes: RouteFlowNode[], edges: RouteFlowEdge[]): RouteGraphPayload {
  const graphNodes = ensureRouteBoundaryNodes(nodes);
  return {
    nodes: graphNodes.map<RouteNodeRecord>((node, index) => ({
      nodeKey: node.id,
      operationId: node.data.virtual ? null : node.data.operationId ?? null,
      operationCode: node.data.virtual ? null : node.data.operationCode ?? null,
      operationName: node.data.operationName ?? node.data.label,
      nodeType: node.data.nodeType === 'START' ? 'START' : node.data.nodeType === 'END' ? 'END' : 'OPERATION',
      positionX: Math.round(node.position.x),
      positionY: Math.round(node.position.y),
      sortOrder: index + 1,
    })),
    relations: edges
      .filter((edge) => edge.source && edge.target)
      .map<RouteRelationRecord>((edge, index) => {
        const relationType = edge.data?.relationType || 'SEQUENTIAL';
        return {
          sourceNodeKey: edge.source,
          targetNodeKey: edge.target,
          relationType,
          label: edge.data?.label || getRouteRelationLabel(relationType),
          ruleExpression: edge.data?.ruleExpression ?? null,
          priority: index + 1,
        };
      }),
  };
}

function getApiErrorMessage(error: unknown, fallback = '操作失败') {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const responseMessage = response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      if (responseMessage.includes('工序编码已存在')) return '工序编码已存在，请更换后重试';
      return responseMessage;
    }
  }
  if (error instanceof Error && error.message) {
    if (error.message.includes('工序编码已存在')) return '工序编码已存在，请更换后重试';
    return error.message;
  }
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      if (message.includes('工序编码已存在')) return '工序编码已存在，请更换后重试';
      return message;
    }
  }
  return fallback;
}

function isVirtualOperationCategory(value?: string | number | null) {
  const normalized = String(value ?? '');
  return normalized === OPERATION_CATEGORY_ALL || normalized === OPERATION_CATEGORY_UNCATEGORIZED;
}

function isConcreteOperationCategory(value?: string | null) {
  return Boolean(value && !isVirtualOperationCategory(value));
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
      value: formatAuditValue(field, fieldValue),
    }));
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatAuditValue(field: string, value: unknown): string {
  if (value == null || value === '') return '-';
  if (field === 'status' || field === 'latestVersionStatus') return getStatusLabel(String(value));
  if (field === 'createdAt' || field === 'updatedAt' || field === 'effectiveDate' || field === 'expiryDate') return formatDateTime(String(value));
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
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

const emptyFilters: ProcessFilters = {
  keyword: '',
  operationName: '',
  operationCode: '',
  materialName: '',
  materialCode: '',
  materialTypeName: '',
  operationCategory: OPERATION_CATEGORY_ALL,
  status: 'ALL',
};
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
  const [operationCategoryDialog, setOperationCategoryDialog] = useState<OperationCategoryDialogState>({ open: false, mode: 'create', name: '' });
  const [deleteOperationCategoryTarget, setDeleteOperationCategoryTarget] = useState<OperationCategoryRecord | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [expandedMaterialGroups, setExpandedMaterialGroups] = useState<Set<string>>(() => new Set());
  const [expandedRouteGroups, setExpandedRouteGroups] = useState<Set<string>>(() => new Set());
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [tableContainerWidth, setTableContainerWidth] = useState(0);
  const [tableScrollbarWidth, setTableScrollbarWidth] = useState(0);
  const columnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_COLUMN_WIDTH_STORAGE_PREFIX, pageKey), [pageKey]);
  const materialVersionColumnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_MATERIAL_VERSION_COLUMN_WIDTH_STORAGE_PREFIX, pageKey), [pageKey]);
  const routeVersionColumnWidthStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_ROUTE_VERSION_COLUMN_WIDTH_STORAGE_PREFIX, pageKey), [pageKey]);
  const columnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);
  const materialVersionColumnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_MATERIAL_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);
  const routeVersionColumnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_ROUTE_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);
  const [columnWidths, setColumnWidths] = useState<ProcessColumnWidths>(() => loadColumnWidths(columnWidthStorageKey));
  const [materialVersionColumnWidths, setMaterialVersionColumnWidths] = useState<ProcessColumnWidths>(() => loadColumnWidths(materialVersionColumnWidthStorageKey));
  const [routeVersionColumnWidths, setRouteVersionColumnWidths] = useState<ProcessColumnWidths>(() => loadColumnWidths(routeVersionColumnWidthStorageKey));
  const [columnSettings, setColumnSettings] = useState<ProcessColumnSettings>(() => loadColumnSettings(columnSettingsStorageKey, config));
  const [materialVersionColumnSettings, setMaterialVersionColumnSettings] = useState<ProcessColumnSettings>(() => loadColumnSettings(materialVersionColumnSettingsStorageKey, materialVersionColumnSettingsConfig));
  const [routeVersionColumnSettings, setRouteVersionColumnSettings] = useState<ProcessColumnSettings>(() => loadColumnSettings(routeVersionColumnSettingsStorageKey, routeVersionColumnSettingsConfig));
  const [columnSettingsAnchorEl, setColumnSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [columnSettingsTab, setColumnSettingsTab] = useState<ColumnSettingsTarget>('main');
  const [draggingColumnId, setDraggingColumnId] = useState<ConfigurableProcessColumnId | null>(null);
  const [draggingOperationCategoryId, setDraggingOperationCategoryId] = useState<string>('');
  const columnSettingDragSourceRef = useRef<ConfigurableProcessColumnId | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | number | null>(null);
  const [selectedRouteVersionId, setSelectedRouteVersionId] = useState<string | number | null>(null);
  const [newRouteVersion, setNewRouteVersion] = useState('');
  const [routeOperationLibraryKeyword, setRouteOperationLibraryKeyword] = useState('');
  const [routeOperationLibraryCategory, setRouteOperationLibraryCategory] = useState(OPERATION_CATEGORY_ALL);
  const [routeDesignerLibraryWidth, setRouteDesignerLibraryWidth] = useState(ROUTE_DESIGNER_LIBRARY_DEFAULT_WIDTH);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<RouteFlowNode, RouteFlowEdge> | null>(null);
  const [routeDesignerInteractionMode, setRouteDesignerInteractionMode] = useState<RouteDesignerInteractionMode>('pan');
  const [routeDesignerZoomPercent, setRouteDesignerZoomPercent] = useState(100);
  const [routeDesignerZoomInput, setRouteDesignerZoomInput] = useState('100');
  const [routeDraggingOperation, setRouteDraggingOperation] = useState<OperationRecord | null>(null);
  const [routeCanvasDropPreview, setRouteCanvasDropPreview] = useState<RouteCanvasDropPreview | null>(null);
  const [routeNodes, setRouteNodes, onRouteNodesChange] = useNodesState<RouteFlowNode>([]);
  const [routeEdges, setRouteEdges, onRouteEdgesChange] = useEdgesState<RouteFlowEdge>([]);

  useEffect(() => {
    setColumnWidths(loadColumnWidths(columnWidthStorageKey));
    setMaterialVersionColumnWidths(loadColumnWidths(materialVersionColumnWidthStorageKey));
    setRouteVersionColumnWidths(loadColumnWidths(routeVersionColumnWidthStorageKey));
    setColumnSettings(loadColumnSettings(columnSettingsStorageKey, config));
    setMaterialVersionColumnSettings(loadColumnSettings(materialVersionColumnSettingsStorageKey, materialVersionColumnSettingsConfig));
    setRouteVersionColumnSettings(loadColumnSettings(routeVersionColumnSettingsStorageKey, routeVersionColumnSettingsConfig));
  }, [columnSettingsStorageKey, columnWidthStorageKey, materialVersionColumnSettingsStorageKey, materialVersionColumnWidthStorageKey, routeVersionColumnSettingsStorageKey, routeVersionColumnWidthStorageKey, config]);

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
        operationName: pageKey === 'operations' ? filters.operationName.trim() || undefined : undefined,
        operationCode: pageKey === 'operations' ? filters.operationCode.trim() || undefined : undefined,
        materialName: pageKey === 'materials' ? filters.materialName.trim() || undefined : undefined,
        materialCode: pageKey === 'materials' ? filters.materialCode.trim() || undefined : undefined,
        materialTypeName: pageKey === 'materials' ? filters.materialTypeName || undefined : undefined,
        operationCategory: pageKey === 'operations' && filters.operationCategory !== OPERATION_CATEGORY_ALL ? filters.operationCategory : undefined,
        status: filters.status === 'ALL' ? undefined : filters.status,
      });
      return res.data.data;
    },
  });

  const operationCategoriesQuery = useQuery({
    queryKey: ['process-modeling-operation-categories'],
    enabled: pageKey === 'operations',
    queryFn: async () => {
      const res = await getProcessOperationCategories();
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
  const routeRecords = useMemo(() => (pageKey === 'routes' ? rows as RouteRecord[] : []), [pageKey, rows]);
  const displayRows = pageKey === 'materials' ? materialGroupRows : pageKey === 'routes' ? routeRecords : rows;
  const pageCount = Math.max(1, data?.totalPages ?? 1);
  const totalElements = data?.totalElements ?? 0;
  const displayTotalElements = pageKey === 'materials' ? materialGroupRows.length : totalElements;
  const operationCategories = operationCategoriesQuery.data ?? [];
  const operationCategoryOptions = useMemo(() => {
    const virtualCounts = new Map(operationCategories
      .filter((category) => isVirtualOperationCategory(category.id))
      .map((category) => [String(category.id), Number(category.count || 0)]));
    const concreteCategories = operationCategories
      .filter((category): category is OperationCategoryRecord => Boolean(category?.name))
      .filter((category) => !isVirtualOperationCategory(category.id))
      .map((category) => {
        return {
          id: category.id,
          value: category.name,
          label: category.name,
          name: category.name,
          count: Number(category.count || 0),
          sortOrder: category.sortOrder,
          system: false,
        };
      });
    return [
      { id: OPERATION_CATEGORY_ALL, value: OPERATION_CATEGORY_ALL, label: '全部', name: '全部', count: virtualCounts.get(OPERATION_CATEGORY_ALL) ?? totalElements, system: true },
      { id: OPERATION_CATEGORY_UNCATEGORIZED, value: OPERATION_CATEGORY_UNCATEGORIZED, label: '未分类', name: '未分类', count: virtualCounts.get(OPERATION_CATEGORY_UNCATEGORIZED) ?? 0, system: true },
      ...concreteCategories,
    ];
  }, [operationCategories, totalElements]);
  const operationCategorySelectOptions = useMemo(() => operationCategoryOptions.filter((category) => !category.system), [operationCategoryOptions]);
  const availableStatusOptions = pageKey === 'operations' ? PROCESS_OPERATION_STATUS_OPTIONS : statusOptions;
  const selectedRoute = useMemo(
    () => routeRecords.find((route) => String(route.id) === String(selectedRouteId)) ?? null,
    [routeRecords, selectedRouteId],
  );
  const selectedRouteVersions = selectedRoute?.versions ?? [];
  const selectedRouteVersion = useMemo(
    () => selectedRouteVersions.find((version) => String(version.id) === String(selectedRouteVersionId)) ?? selectedRouteVersions[0] ?? null,
    [selectedRouteVersionId, selectedRouteVersions],
  );
  const routeOperationLibraryQuery = useQuery({
    queryKey: ['route-operation-library'],
    enabled: pageKey === 'routes',
    queryFn: async () => {
      const res = await getProcessOperations({ page: 1, size: 200, status: 'ACTIVE', sort: 'createdAt', order: 'desc' });
      return res.data.data.content ?? [];
    },
  });
  const routeOperations = routeOperationLibraryQuery.data ?? [];
  const routeOperationLibraryCategoryOptions = useMemo(() => {
    const categories = Array.from(new Set(routeOperations
      .map((operation) => operation.operationCategory?.trim())
      .filter((category): category is string => Boolean(category))))
      .sort((left, right) => left.localeCompare(right, 'zh-CN'));
    return [
      { value: OPERATION_CATEGORY_ALL, label: '全部分类' },
      { value: OPERATION_CATEGORY_UNCATEGORIZED, label: '未分类' },
      ...categories.map((category) => ({ value: category, label: category })),
    ];
  }, [routeOperations]);
  const usedRouteOperationIds = useMemo(() => {
    return new Set(routeNodes
      .filter((node) => !node.data.virtual && node.data.operationId != null)
      .map((node) => String(node.data.operationId)));
  }, [routeNodes]);
  const filteredRouteOperations = useMemo(() => {
    const keyword = routeOperationLibraryKeyword.trim().toLowerCase();
    return routeOperations.filter((operation) => {
      const isUnusedOperation = !usedRouteOperationIds.has(String(operation.id));
      const category = operation.operationCategory?.trim() || '';
      const matchesCategory = routeOperationLibraryCategory === OPERATION_CATEGORY_ALL
        || (routeOperationLibraryCategory === OPERATION_CATEGORY_UNCATEGORIZED ? !category : category === routeOperationLibraryCategory);
      const matchesKeyword = !keyword
        || getDisplayName(operation).toLowerCase().includes(keyword)
        || (operation.code || '').toLowerCase().includes(keyword);
      return isUnusedOperation && matchesCategory && matchesKeyword;
    });
  }, [routeOperationLibraryCategory, routeOperationLibraryKeyword, routeOperations, usedRouteOperationIds]);
  const routeNodesWithConnectionState = useMemo<RouteFlowNode[]>(() => {
    const connectedSourceNodeIds = new Set<string>();
    const connectedTargetNodeIds = new Set<string>();
    routeEdges.forEach((edge) => {
      if (edge.source) {
        connectedSourceNodeIds.add(edge.source);
      }
      if (edge.target) {
        connectedTargetNodeIds.add(edge.target);
      }
    });
    return routeNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        sourceConnected: connectedSourceNodeIds.has(node.id),
        targetConnected: connectedTargetNodeIds.has(node.id),
      },
    }));
  }, [routeEdges, routeNodes]);
  const routeGraphQuery = useQuery({
    queryKey: ['process-route-graph', selectedRouteId, selectedRouteVersionId],
    enabled: pageKey === 'routes' && dialogOpen && editingRow !== null && selectedRouteId !== null && selectedRouteVersionId !== null,
    queryFn: async () => {
      const res = await getProcessRouteGraph(selectedRouteId as string | number, selectedRouteVersionId as string | number);
      return res.data.data;
    },
  });
  const isTableEmptyState = isLoading || isError || displayRows.length === 0;
  const columnSettingsItems = useMemo(() => getColumnSettingsItems(config, columnSettings), [columnSettings, config]);
  const visibleColumns = useMemo(() => getVisibleColumns(config, columnSettings), [columnSettings, config]);
  const visibleConfigurableColumnCount = columnSettings.order.length - columnSettings.hidden.length;
  const resolvedColumnWidths = useMemo(() => resolveColumnWidths(columnWidths, tableContainerWidth, visibleColumns), [columnWidths, tableContainerWidth, visibleColumns]);
  const totalTableWidth = visibleColumns.reduce((sum, column) => sum + resolvedColumnWidths[column.id], 0);
  const materialVersionColumns = MATERIAL_VERSION_COLUMNS;
  const routeVersionColumns = ROUTE_VERSION_COLUMNS;
  const materialVersionColumnSettingsItems = useMemo(() => getColumnSettingsItems(materialVersionColumnSettingsConfig, materialVersionColumnSettings), [materialVersionColumnSettings]);
  const visibleMaterialVersionColumns = useMemo(() => getVisibleColumns(materialVersionColumnSettingsConfig, materialVersionColumnSettings), [materialVersionColumnSettings]);
  const visibleMaterialVersionConfigurableColumnCount = materialVersionColumnSettings.order.length - materialVersionColumnSettings.hidden.length;
  const routeVersionColumnSettingsItems = useMemo(() => getColumnSettingsItems(routeVersionColumnSettingsConfig, routeVersionColumnSettings), [routeVersionColumnSettings]);
  const visibleRouteVersionColumns = useMemo(() => getVisibleColumns(routeVersionColumnSettingsConfig, routeVersionColumnSettings), [routeVersionColumnSettings]);
  const visibleRouteVersionConfigurableColumnCount = routeVersionColumnSettings.order.length - routeVersionColumnSettings.hidden.length;
  const activeColumnSettings = columnSettingsTab === 'materialVersion' ? materialVersionColumnSettings : columnSettingsTab === 'routeVersion' ? routeVersionColumnSettings : columnSettings;
  const activeColumnSettingsItems = columnSettingsTab === 'materialVersion' ? materialVersionColumnSettingsItems : columnSettingsTab === 'routeVersion' ? routeVersionColumnSettingsItems : columnSettingsItems;
  const activeVisibleConfigurableColumnCount = columnSettingsTab === 'materialVersion' ? visibleMaterialVersionConfigurableColumnCount : columnSettingsTab === 'routeVersion' ? visibleRouteVersionConfigurableColumnCount : visibleConfigurableColumnCount;
  const setActiveColumnSettings = columnSettingsTab === 'materialVersion' ? setMaterialVersionColumnSettings : columnSettingsTab === 'routeVersion' ? setRouteVersionColumnSettings : setColumnSettings;
  const resolvedMaterialVersionColumnWidths = useMemo(() => resolveColumnWidths(materialVersionColumnWidths, totalTableWidth, visibleMaterialVersionColumns), [materialVersionColumnWidths, totalTableWidth, visibleMaterialVersionColumns]);
  const totalMaterialVersionTableWidth = visibleMaterialVersionColumns.reduce((sum, column) => sum + resolvedMaterialVersionColumnWidths[column.id], 0);
  const resolvedRouteVersionColumnWidths = useMemo(() => resolveColumnWidths(routeVersionColumnWidths, totalTableWidth, visibleRouteVersionColumns), [routeVersionColumnWidths, totalTableWidth, visibleRouteVersionColumns]);
  const totalRouteVersionTableWidth = visibleRouteVersionColumns.reduce((sum, column) => sum + resolvedRouteVersionColumnWidths[column.id], 0);

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
    localStorage.setItem(routeVersionColumnWidthStorageKey, JSON.stringify(routeVersionColumnWidths));
  }, [routeVersionColumnWidthStorageKey, routeVersionColumnWidths]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(columnSettingsStorageKey, JSON.stringify(columnSettings));
  }, [columnSettingsStorageKey, columnSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(materialVersionColumnSettingsStorageKey, JSON.stringify(materialVersionColumnSettings));
  }, [materialVersionColumnSettingsStorageKey, materialVersionColumnSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(routeVersionColumnSettingsStorageKey, JSON.stringify(routeVersionColumnSettings));
  }, [routeVersionColumnSettingsStorageKey, routeVersionColumnSettings]);

  useEffect(() => {
    setColumnSettingsTab('main');
  }, [pageKey]);

  useEffect(() => {
    if (pageKey !== 'routes') return;
    if (!dialogOpen) {
      setRouteNodes([]);
      setRouteEdges([]);
      return;
    }
    if (!editingRow) {
      setRouteNodes((current) => ensureRouteBoundaryNodes(current));
      return;
    }
    if (!selectedRouteVersionId) {
      setRouteNodes(ensureRouteBoundaryNodes([]));
      setRouteEdges([]);
      return;
    }
    if (!routeGraphQuery.data) return;
    const graph = fromRouteGraphResponse(routeGraphQuery.data);
    setRouteNodes(graph.nodes);
    setRouteEdges(graph.edges);
  }, [dialogOpen, editingRow, pageKey, routeGraphQuery.data, selectedRouteVersionId, setRouteEdges, setRouteNodes]);

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

  const resolveDeleteRowId = async (row: ProcessModelingRecord) => {
    if (pageKey === 'routes' && row.code) {
      const res = await getProcessRoutes({ page: 1, size: 1, keyword: row.code });
      const latestRoute = res.data.data.content.find((route) => route.code === row.code);
      return latestRoute?.id ?? row.id;
    }
    return row.id;
  };

  const invalidateOperationCategoryData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [config.listQueryKey] }),
      queryClient.invalidateQueries({ queryKey: ['process-modeling-operation-categories'] }),
    ]);
  };

  const resetDialogState = () => {
    setDialogOpen(false);
    setEditingRow(null);
    setCreatingMaterialVersionFrom(null);
    setMaterialDialogMode(null);
    setForm(emptyForm);
    if (pageKey === 'routes') {
      setSelectedRouteId(null);
      setSelectedRouteVersionId(null);
      setNewRouteVersion('');
      setRouteOperationLibraryKeyword('');
      setRouteOperationLibraryCategory(OPERATION_CATEGORY_ALL);
      setRouteNodes(ensureRouteBoundaryNodes([]));
      setRouteEdges([]);
    }
  };

  const createMutation = useMutation({
    mutationFn: (body: ProcessModelingPayload) => {
      if (!config.create) throw new Error(`${config.title}不支持新增`);
      return config.create(body);
    },
    onSuccess: async (response) => {
      if (pageKey === 'routes') {
        const saved = response.data.data as RouteRecord;
        const versionId = saved.latestVersionId ?? saved.versions?.[0]?.id ?? null;
        if (versionId && (routeNodes.length > 0 || routeEdges.length > 0)) {
          try {
            await saveRouteGraphMutation.mutateAsync({ routeId: saved.id, versionId, silent: true });
          } catch (error) {
            showSnackbar(getApiErrorMessage(error, '工艺路线图保存失败'), 'error');
            return;
          }
        }
      }
      await queryClient.invalidateQueries({ queryKey: [config.listQueryKey] });
      if (pageKey === 'operations') await queryClient.invalidateQueries({ queryKey: ['process-modeling-operation-categories'] });
      resetDialogState();
      showSnackbar(`${config.title}保存成功`, 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, `${config.title}保存失败`), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (body: ProcessModelingPayload) => {
      if (!config.update) throw new Error(`${config.title}不支持编辑`);
      return config.update(editingRow?.id ?? '', body);
    },
    onSuccess: async () => {
      if (pageKey === 'routes' && selectedRouteId && selectedRouteVersionId) {
        try {
          await saveRouteGraphMutation.mutateAsync({ routeId: selectedRouteId, versionId: selectedRouteVersionId, silent: true });
        } catch (error) {
          showSnackbar(getApiErrorMessage(error, '工艺路线图保存失败'), 'error');
          return;
        }
      }
      await queryClient.invalidateQueries({ queryKey: [config.listQueryKey] });
      await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
      if (pageKey === 'operations') await queryClient.invalidateQueries({ queryKey: ['process-modeling-operation-categories'] });
      resetDialogState();
      showSnackbar(`${config.title}保存成功`, 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, `${config.title}保存失败`), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (row: ProcessModelingRecord) => {
      if (!config.remove) throw new Error(`${config.title}不支持删除`);
      return config.remove(await resolveDeleteRowId(row));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.listQueryKey] });
      if (pageKey === 'operations') queryClient.invalidateQueries({ queryKey: ['process-modeling-operation-categories'] });
      setDeleteTarget(null);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
    },
    onError: (error) => setSnackbar({ open: true, message: getApiErrorMessage(error, '删除失败'), severity: 'error' }),
  });

  const saveOperationCategoryMutation = useMutation({
    mutationFn: () => {
      const name = operationCategoryDialog.name.trim();
      if (!name) throw new Error('工序分类名称不能为空');
      return operationCategoryDialog.mode === 'edit' && operationCategoryDialog.category
        ? updateProcessOperationCategory(operationCategoryDialog.category.id, { name })
        : createProcessOperationCategory({ name });
    },
    onSuccess: async (response) => {
      const saved = response.data.data;
      if (operationCategoryDialog.mode === 'edit' && operationCategoryDialog.category && filters.operationCategory === operationCategoryDialog.category.name) {
        setFilters((current) => ({ ...current, operationCategory: saved.name }));
      } else if (operationCategoryDialog.mode === 'create') {
        setFilters((current) => ({ ...current, operationCategory: saved.name }));
        setPage(1);
      }
      setOperationCategoryDialog({ open: false, mode: 'create', name: '' });
      await invalidateOperationCategoryData();
      showSnackbar('工序分类已保存', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '工序分类保存失败'), 'error'),
  });

  const deleteOperationCategoryMutation = useMutation({
    mutationFn: (category: OperationCategoryRecord) => deleteProcessOperationCategory(category.id),
    onSuccess: async (_response, category) => {
      if (filters.operationCategory === category.name) {
        setFilters((current) => ({ ...current, operationCategory: OPERATION_CATEGORY_ALL }));
        setPage(1);
      }
      setDeleteOperationCategoryTarget(null);
      await invalidateOperationCategoryData();
      showSnackbar('工序分类已删除', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '工序分类删除失败'), 'error'),
  });

  const reorderOperationCategoryMutation = useMutation({
    mutationFn: (ids: Array<string | number>) => reorderProcessOperationCategories(ids),
    onSuccess: async () => {
      await invalidateOperationCategoryData();
      showSnackbar('工序分类排序已保存', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '工序分类排序失败'), 'error'),
  });

  const createRouteVersionMutation = useMutation({
    mutationFn: () => {
      if (!selectedRouteId) throw new Error('请先选择工艺路线模板');
      const version = newRouteVersion.trim();
      if (!version) throw new Error('请填写版本号');
      return createProcessRouteVersion(selectedRouteId, {
        name: selectedRoute?.name || selectedRoute?.title || '工艺路线',
        version,
        status: 'ACTIVE',
      });
    },
    onSuccess: async (response) => {
      const saved = response.data.data;
      setNewRouteVersion('');
      setSelectedRouteVersionId(saved.id);
      await queryClient.invalidateQueries({ queryKey: [config.listQueryKey] });
      showSnackbar('工艺路线版本已新增', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '工艺路线版本新增失败'), 'error'),
  });

  const saveRouteGraphMutation = useMutation({
    mutationFn: (target?: { routeId?: string | number | null; versionId?: string | number | null; silent?: boolean }) => {
      const routeId = target?.routeId ?? selectedRouteId;
      const versionId = target?.versionId ?? selectedRouteVersionId;
      if (!routeId || !versionId) throw new Error('请先选择工艺路线模板和版本');
      return saveProcessRouteGraph(routeId, versionId, toRouteGraphPayload(routeNodes, routeEdges));
    },
    onSuccess: async (_response, target) => {
      await queryClient.invalidateQueries({ queryKey: ['process-route-graph', selectedRouteId, selectedRouteVersionId] });
      if (!target?.silent) showSnackbar('工艺路线图已保存', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '工艺路线图保存失败'), 'error'),
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

  const renderOperationFilters = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center' }}>
      <TextField
        size="small"
        label="工序名称"
        placeholder="请输入"
        value={filters.operationName}
        onChange={(event) => setFilters((current) => ({ ...current, operationName: event.target.value }))}
        sx={fieldSx}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
      />
      <TextField
        size="small"
        label="工序编码"
        placeholder="请输入"
        value={filters.operationCode}
        onChange={(event) => setFilters((current) => ({ ...current, operationCode: event.target.value }))}
        sx={fieldSx}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
      />
      <TextField
        select
        size="small"
        label="工序分类"
        value={filters.operationCategory}
        onChange={(event) => setFilters((current) => ({ ...current, operationCategory: event.target.value }))}
        sx={fieldSx}
      >
        {operationCategoryOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
      </TextField>
      <TextField
        select
        size="small"
        label="状态"
        value={filters.status}
        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        sx={fieldSx}
      >
        {PROCESS_OPERATION_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
      </TextField>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ gridColumn: { xs: '1', md: '3' } }}>
        <Button size="small" sx={QUERY_BUTTON_SX} variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>重置</Button>
        <Button size="small" sx={QUERY_BUTTON_SX} variant="contained" startIcon={<Search />} onClick={() => setPage(1)}>查询</Button>
      </Stack>
    </Box>
  );

  const selectOperationCategory = (category: string) => {
    setFilters((current) => ({ ...current, operationCategory: category }));
    setPage(1);
  };

  const openCreateOperationCategoryDialog = () => {
    setOperationCategoryDialog({ open: true, mode: 'create', name: '' });
  };

  const openEditOperationCategoryDialog = (category: OperationCategoryRecord) => {
    setOperationCategoryDialog({ open: true, mode: 'edit', category, name: category.name });
  };

  const requestDeleteOperationCategory = (category: OperationCategoryRecord) => {
    setDeleteOperationCategoryTarget(category);
  };

  const handleOperationCategoryDragStart = (event: ReactDragEvent, category: OperationCategoryRecord) => {
    if (category.system) return;
    const categoryId = String(category.id);
    event.dataTransfer.setData('text/plain', categoryId);
    setDraggingOperationCategoryId(categoryId);
  };

  const handleOperationCategoryDrop = (event: ReactDragEvent, targetCategory: OperationCategoryRecord) => {
    event.preventDefault();
    if (targetCategory.system) {
      setDraggingOperationCategoryId('');
      return;
    }
    const activeCategoryId = draggingOperationCategoryId || event.dataTransfer.getData('text/plain');
    const targetCategoryId = String(targetCategory.id);
    if (!activeCategoryId || activeCategoryId === targetCategoryId) {
      setDraggingOperationCategoryId('');
      return;
    }
    const currentIds = operationCategoryOptions
      .filter((category) => !category.system)
      .map((category) => String(category.id));
    const activeIndex = currentIds.indexOf(activeCategoryId);
    const targetIndex = currentIds.indexOf(targetCategoryId);
    if (activeIndex < 0 || targetIndex < 0) {
      setDraggingOperationCategoryId('');
      return;
    }
    const nextIds = [...currentIds];
    const [activeId] = nextIds.splice(activeIndex, 1);
    nextIds.splice(targetIndex, 0, activeId);
    setDraggingOperationCategoryId('');
    reorderOperationCategoryMutation.mutate(nextIds);
  };

  const renderOperationCategoryPanel = () => (
    <Box data-process-operation-category-panel sx={{ height: '100%', minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: '0 0 auto', minHeight: 48, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e4e7ed' }}>
        <Typography sx={{ fontWeight: 600, color: '#303133' }}>工序分类</Typography>
        <Tooltip title="新增分类" arrow>
          <IconButton size="small" color="primary" aria-label="新增分类" onClick={openCreateOperationCategoryDialog}>
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Stack spacing={0.5} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
        {operationCategoryOptions.map((category) => {
          const selected = filters.operationCategory === category.value;
          return (
            <Box
              key={category.value}
              role="button"
              tabIndex={0}
              draggable={!category.system}
              onDragStart={(event) => handleOperationCategoryDragStart(event, category as OperationCategoryRecord)}
              onDragOver={(event) => {
                if (!category.system) event.preventDefault();
              }}
              onDrop={(event) => handleOperationCategoryDrop(event, category as OperationCategoryRecord)}
              onDragEnd={() => setDraggingOperationCategoryId('')}
              onClick={() => selectOperationCategory(category.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') selectOperationCategory(category.value);
              }}
              sx={{ minHeight: 40, px: 1.25, display: 'grid', gridTemplateColumns: category.system ? 'minmax(0, 1fr) auto' : '24px minmax(0, 1fr) auto auto auto', alignItems: 'center', gap: 0.5, borderRadius: 1, cursor: category.system ? 'pointer' : 'grab', color: selected ? '#1890ff' : '#303133', bgcolor: selected ? '#e8f4ff' : 'transparent', opacity: draggingOperationCategoryId === String(category.id) ? 0.55 : 1, '&:hover': { bgcolor: selected ? '#e8f4ff' : '#f5f7fa' } }}
            >
              {!category.system ? <DragIndicator data-process-operation-category-drag-handle fontSize="small" sx={{ color: '#a8abb2' }} /> : null}
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
                        openEditOperationCategoryDialog(category as OperationCategoryRecord);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除分类" arrow>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="删除分类"
                      onClick={(event) => {
                        event.stopPropagation();
                        requestDeleteOperationCategory(category as OperationCategoryRecord);
                      }}
                    >
                      <Delete fontSize="small" />
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

  const expandRouteGroup = (routeId: string | number) => {
    const groupKey = String(routeId);
    setExpandedRouteGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const expandAllRouteGroups = () => {
    setExpandedRouteGroups(new Set(routeRecords.map((row) => String(row.id))));
  };

  const collapseAllRouteGroups = () => {
    setExpandedRouteGroups(new Set());
  };

  const handleRouteOperationDragStart = (event: ReactDragEvent, operation: OperationRecord) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/process-operation', JSON.stringify(operation));
    setRouteDraggingOperation(operation);
    setRouteCanvasDropPreview(null);
  };

  const handleRouteOperationDragEnd = () => {
    setRouteDraggingOperation(null);
    setRouteCanvasDropPreview(null);
  };

  const getRouteCanvasDropPosition = (event: ReactDragEvent) => {
    if (!reactFlowInstance) return null;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    return {
      x: position.x - ROUTE_DESIGNER_OPERATION_NODE_WIDTH / 2,
      y: position.y - ROUTE_DESIGNER_OPERATION_NODE_HEIGHT / 2,
    };
  };

  const updateRouteCanvasDropPreview = (event: ReactDragEvent, operation = routeDraggingOperation) => {
    if (!reactFlowInstance || !operation) {
      setRouteCanvasDropPreview(null);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const zoom = reactFlowInstance.getZoom();
    setRouteCanvasDropPreview({
      left: event.clientX - bounds.left - (ROUTE_DESIGNER_OPERATION_NODE_WIDTH * zoom) / 2,
      top: event.clientY - bounds.top - (ROUTE_DESIGNER_OPERATION_NODE_HEIGHT * zoom) / 2,
      zoom,
      label: getDisplayName(operation),
    });
  };

  const handleRouteCanvasDragOver = (event: ReactDragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    updateRouteCanvasDropPreview(event);
  };

  const handleRouteCanvasDragLeave = (event: ReactDragEvent) => {
    const relatedTarget = event.relatedTarget as globalThis.Node | null;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setRouteCanvasDropPreview(null);
    }
  };

  const handleRouteCanvasDrop = (event: ReactDragEvent) => {
    event.preventDefault();
    const clearDragState = () => {
      setRouteDraggingOperation(null);
      setRouteCanvasDropPreview(null);
    };
    const raw = event.dataTransfer.getData('application/process-operation');
    const operation = raw ? JSON.parse(raw) as OperationRecord : routeDraggingOperation;
    if (!operation) {
      clearDragState();
      return;
    }
    const position = getRouteCanvasDropPosition(event);
    if (!position) {
      clearDragState();
      return;
    }
    setRouteNodes((current) => [...current, createRouteFlowNode(operation, position)]);
    clearDragState();
  };

  const handleRouteConnect = (connection: Connection) => {
    const label = getRouteRelationLabel(DEFAULT_ROUTE_RELATION_TYPE);
    const edgePresentation = getRouteEdgePresentation();
    const edge: RouteFlowEdge = {
      ...connection,
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source ?? '',
      target: connection.target ?? '',
      type: 'smoothstep',
      ...edgePresentation,
      data: {
        relationType: DEFAULT_ROUTE_RELATION_TYPE,
        label,
      },
    };
    setRouteEdges((current) => addEdge(edge, current));
  };

  const handleRouteNodeDrag: OnNodeDrag<RouteFlowNode> = (_event, node) => {
    setRouteNodes((current) => {
      const currentNode = current.find((item) => item.id === node.id);
      if (!currentNode) return current;
      const draggedNode = { ...currentNode, position: node.position };
      const nextPosition = snapRouteNodeToPeers(draggedNode, current);
      if (nextPosition.x === currentNode.position.x && nextPosition.y === currentNode.position.y) return current;
      return current.map((item) => (item.id === node.id ? { ...item, position: nextPosition } : item));
    });
  };

  const syncRouteDesignerZoom = (instance = reactFlowInstance) => {
    if (!instance) return;
    const nextPercent = Math.round(instance.getZoom() * 100);
    setRouteDesignerZoomPercent(nextPercent);
    setRouteDesignerZoomInput(String(nextPercent));
  };

  const zoomRouteDesignerIn = () => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomIn();
    window.setTimeout(() => syncRouteDesignerZoom(), 0);
  };

  const zoomRouteDesignerOut = () => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomOut();
    window.setTimeout(() => syncRouteDesignerZoom(), 0);
  };

  const fitRouteDesignerView = () => {
    if (!reactFlowInstance) return;
    reactFlowInstance.fitView();
    window.setTimeout(() => syncRouteDesignerZoom(), 0);
  };

  const applyRouteDesignerZoomInput = () => {
    if (!reactFlowInstance) return;
    const rawPercent = Number(routeDesignerZoomInput);
    if (!Number.isFinite(rawPercent)) {
      setRouteDesignerZoomInput(String(routeDesignerZoomPercent));
      return;
    }
    const nextPercent = Math.min(400, Math.max(10, Math.round(rawPercent)));
    setRouteDesignerZoomPercent(nextPercent);
    setRouteDesignerZoomInput(String(nextPercent));
    void reactFlowInstance.zoomTo(nextPercent / 100).then(() => syncRouteDesignerZoom());
  };

  const openCreateDialog = () => {
    if (isReadOnlyPage(config)) return;
    setEditingRow(null);
    setCreatingMaterialVersionFrom(null);
    setMaterialDialogMode(pageKey === 'materials' ? 'createMaterial' : null);
    if (pageKey === 'routes') {
      setSelectedRouteId(null);
      setSelectedRouteVersionId(null);
      setNewRouteVersion('');
      setRouteOperationLibraryKeyword('');
      setRouteOperationLibraryCategory(OPERATION_CATEGORY_ALL);
      setRouteNodes([]);
      setRouteEdges([]);
    }
    setForm({
      ...emptyForm,
      status: pageKey === 'materials' ? undefined : 'ACTIVE',
      version: pageKey === 'routes' ? 'V1.0' : pageKey === 'materials' ? 'V1.0' : undefined,
      versionDescription: pageKey === 'routes' ? '' : undefined,
      materialPurpose: pageKey === 'materials' ? '生产物料' : undefined,
      effectiveDate: pageKey === 'materials' || pageKey === 'routes' ? getTodayDateTimeInput() : undefined,
      defaultOperationType: pageKey === 'operations' ? '普通工序' : undefined,
      operationCategory: pageKey === 'operations' && isConcreteOperationCategory(filters.operationCategory) ? filters.operationCategory : undefined,
    });
    setDialogOpen(true);
  };

  const openEditRouteDialog = (route: RouteRecord, versionId?: string | number | null) => {
    if (isReadOnlyPage(config)) return;
    const selectedVersion = route.versions?.find((version) => String(version.id) === String(versionId ?? route.latestVersionId)) ?? route.versions?.[0] ?? null;
    setEditingRow(route);
    setCreatingMaterialVersionFrom(null);
    setMaterialDialogMode(null);
    setSelectedRouteId(route.id);
    setSelectedRouteVersionId(versionId ?? route.latestVersionId ?? route.versions?.[0]?.id ?? null);
    setNewRouteVersion('');
    setRouteOperationLibraryKeyword('');
    setRouteOperationLibraryCategory(OPERATION_CATEGORY_ALL);
    setRouteNodes([]);
    setRouteEdges([]);
    setForm({
      ...emptyForm,
      name: getDisplayName(route) === '-' ? '' : getDisplayName(route),
      description: route.description ?? '',
      status: route.status && route.status !== 'DRAFT' && route.status !== 'OBSOLETE' ? route.status : 'DISABLED',
      version: selectedVersion?.version ?? route.latestVersion ?? '',
      effectiveDate: formatDateTimeInput(selectedVersion?.effectiveDate ?? undefined),
      expiryDate: formatDateTimeInput(selectedVersion?.expiryDate ?? undefined),
      versionDescription: selectedVersion?.versionDescription ?? selectedVersion?.description ?? '',
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
    if (pageKey === 'routes') {
      openEditRouteDialog(row as RouteRecord);
      return;
    }
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
      commonAsset: 'commonAsset' in row ? row.commonAsset ?? true : undefined,
      materialPurpose: 'materialPurpose' in row ? row.materialPurpose ?? '生产物料' : undefined,
      effectiveDate: 'effectiveDate' in row ? formatDateTimeInput(row.effectiveDate) : undefined,
      expiryDate: 'expiryDate' in row ? formatDateTimeInput(row.expiryDate) : undefined,
      fileReference: 'fileReference' in row ? row.fileReference ?? '' : '',
      operationCategory: 'operationCategory' in row ? row.operationCategory ?? '' : '',
      generalDescription: 'generalDescription' in row ? row.generalDescription ?? '' : '',
      defaultOperationType: 'defaultOperationType' in row ? row.defaultOperationType ?? '普通工序' : pageKey === 'operations' ? '普通工序' : undefined,
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
    if (pageKey === 'operations' && !form.code?.trim()) {
      setSnackbar({ open: true, message: '请填写工序编码', severity: 'error' });
      return;
    }
    if (pageKey === 'materials' && !form.version?.trim()) {
      setSnackbar({ open: true, message: '请填写版本', severity: 'error' });
      return;
    }
    if (pageKey === 'routes' && !editingRow && !form.version?.trim()) {
      setSnackbar({ open: true, message: '请填写初始版本', severity: 'error' });
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
    versionDescription: input.versionDescription?.trim() || undefined,
    materialPurpose: input.materialPurpose?.trim() || undefined,
    commonAsset: input.commonAsset,
    effectiveDate: input.effectiveDate || null,
    expiryDate: input.expiryDate || null,
    fileReference: input.fileReference?.trim() || undefined,
    operationCategory: input.operationCategory?.trim() || undefined,
    generalDescription: input.generalDescription?.trim() || undefined,
    defaultOperationType: input.defaultOperationType?.trim() || (pageKey === 'operations' ? '普通工序' : undefined),
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
  const getRouteVersionColumnWidth = (column: ProcessColumn) => resolvedRouteVersionColumnWidths[column.id] ?? column.defaultWidth;

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

  const beginRouteVersionColumnResize = (event: MouseEvent, columnId: ProcessColumnId) => {
    event.preventDefault();
    event.stopPropagation();
    const column = routeVersionColumns.find((item) => item.id === columnId);
    if (!column || column.resizable === false) return;
    const startX = event.clientX;
    const startWidth = getRouteVersionColumnWidth(column);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const nextWidth = Math.max(column.minWidth, startWidth + moveEvent.clientX - startX);
      setRouteVersionColumnWidths((current) => ({ ...current, [columnId]: nextWidth }));
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

  const beginRouteDesignerLibraryResize = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = routeDesignerLibraryWidth;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const nextWidth = Math.min(
        ROUTE_DESIGNER_LIBRARY_MAX_WIDTH,
        Math.max(ROUTE_DESIGNER_LIBRARY_MIN_WIDTH, startWidth + moveEvent.clientX - startX),
      );
      setRouteDesignerLibraryWidth(nextWidth);
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
          {availableStatusOptions.filter((option) => option.value !== 'ALL').map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
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
    if (field.id === 'commonAsset') {
      return (
        <TextField
          key={field.id}
          select
          label={field.label}
          value={form.commonAsset === false ? 'false' : 'true'}
          onChange={(event) => setForm((current) => ({ ...current, commonAsset: event.target.value === 'true' }))}
          size="small"
          fullWidth
          required={field.required}
          sx={fieldSx}
          style={gridColumn ? { gridColumn } : undefined}
        >
          <MenuItem value="true">是</MenuItem>
          <MenuItem value="false">否</MenuItem>
        </TextField>
      );
    }
    if (field.id === 'operationCategory') {
      const selectedCategory = operationCategorySelectOptions.find((option) => option.name === form.operationCategory) ?? null;
      return (
        <Autocomplete
          key={field.id}
          options={operationCategorySelectOptions}
          value={selectedCategory}
          onChange={(_event, value) => setForm((current) => ({ ...current, operationCategory: value?.name ?? undefined }))}
          getOptionLabel={(option) => option.label}
          noOptionsText="暂无数据"
          size="small"
          fullWidth
          style={gridColumn ? { gridColumn } : undefined}
          renderInput={(params) => (
            <TextField
              {...params}
              label={field.label}
              required={field.required}
              sx={fieldSx}
            />
          )}
        />
      );
    }
    if (field.id === 'defaultOperationType') {
      return (
        <TextField
          key={field.id}
          select
          label={field.label}
          value={typeof form.defaultOperationType === 'string' ? form.defaultOperationType : '普通工序'}
          onChange={(event) => setForm((current) => ({ ...current, defaultOperationType: event.target.value }))}
          size="small"
          fullWidth
          required={field.required}
          sx={fieldSx}
          style={gridColumn ? { gridColumn } : undefined}
        >
          {PROCESS_OPERATION_TYPES.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
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
  const renderRouteFormSection = (title: string, fieldIds: Array<keyof ProcessModelingPayload>, extra?: ReactNode, sectionSx?: object, contentSx?: object) => {
    const fields = config.formFields.filter((field) => fieldIds.includes(field.id));
    return (
      <DetailSection title={title} sx={sectionSx} contentSx={contentSx}>
        <Stack spacing={1.5} sx={extra ? { height: '100%', minHeight: 0 } : undefined}>
          {fields.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
              {fields.map(renderFormField)}
            </Box>
          ) : null}
          {extra}
        </Stack>
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
      <IconButton size="small" aria-label="新增子版本" onClick={(event) => { event.stopPropagation(); openCreateMaterialVersionDialog(group.latestVersion); }}>
        <PlaylistAdd fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderAddRouteVersionAction = (route: RouteRecord) => (
    <Tooltip title="新增版本" arrow>
      <IconButton size="small" aria-label="新增版本" onClick={(event) => { event.stopPropagation(); openEditRouteDialog(route); }}>
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

  const renderSingleVersionRouteActions = (route: RouteRecord) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {renderAddRouteVersionAction(route)}
      {renderEditAction(route)}
      {renderDeleteAction(route)}
    </Stack>
  );

  const renderMultiVersionRouteActions = (route: RouteRecord) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {renderAddRouteVersionAction(route)}
      {renderEditAction(route)}
    </Stack>
  );

  const renderRouteVersionActions = (route: RouteRecord, version: RouteVersionRecord) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      <Tooltip title="编辑" arrow>
        <IconButton size="small" aria-label="编辑" onClick={(event) => { event.stopPropagation(); openEditRouteDialog(route, version.id); }}>
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>
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

  const getRouteVersionCount = (route: RouteRecord) => route.versionCount ?? route.versions?.length ?? 0;

  const renderRouteGroupCell = (route: RouteRecord, column: ProcessColumn) => {
    if (column.id === 'name') return getDisplayName(route);
    if (column.id === 'version') return String(getRouteVersionCount(route));
    return getColumnDisplayValue(route, column.id);
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

  const renderRouteVersionTable = (route: RouteRecord) => {
    const versions = route.versions ?? [];
    return (
      <TableRow key={`${route.id}:versions`} sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
        <TableCell colSpan={visibleColumns.length} sx={{ p: 0, bgcolor: '#fafcff' }}>
          <TableContainer sx={{ width: '100%', bgcolor: '#fff', overflow: 'visible' }}>
            <Table stickyHeader size="small" aria-label="工艺路线版本列表" sx={{ tableLayout: 'fixed', width: totalRouteVersionTableWidth, minWidth: totalRouteVersionTableWidth }}>
              <colgroup>
                {visibleRouteVersionColumns.map((column) => <col key={`${route.id}:${column.id}`} style={{ width: getRouteVersionColumnWidth(column) }} />)}
              </colgroup>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                  {visibleRouteVersionColumns.map((column) => (
                    <TableCell key={column.id} align={column.align} sx={{ width: getRouteVersionColumnWidth(column), minWidth: column.minWidth, position: 'sticky', top: 0, zIndex: 5, userSelect: 'none', ...(column.resizable ? { pr: 2 } : {}), ...getStickyActionColumnSx(column, 'head') }}>
                      {column.label}
                      {column.resizable ? (
                        <Box
                          data-process-route-version-column-resizer
                          onMouseDown={(event) => beginRouteVersionColumnResize(event, column.id)}
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
                    <TableCell colSpan={visibleRouteVersionColumns.length} align="center" sx={{ color: '#909399' }}>暂无版本</TableCell>
                  </TableRow>
                ) : versions.map((versionRow) => (
                  <TableRow key={`${route.id}:${versionRow.id}`} hover sx={{ '& .MuiTableCell-root': tableBodyCellSx }}>
                    {visibleRouteVersionColumns.map((column) => {
                      const commonSx = {
                        width: getRouteVersionColumnWidth(column),
                        minWidth: column.minWidth,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        ...getStickyActionColumnSx(column, 'body'),
                      };
                      return (
                        <TableCell key={column.id} align={column.align} sx={commonSx}>
                          {column.id === 'version' ? versionRow.version || '-' : column.id === 'status' ? (
                            <StatusBadge label={getStatusLabel(versionRow.versionStatus)} color={getStatusColor(versionRow.versionStatus)} />
                          ) : column.id === 'effectiveDate' ? formatDateTime(versionRow.effectiveDate ?? undefined) : column.id === 'expiryDate' ? formatDateTime(versionRow.expiryDate ?? undefined) : column.id === 'description' ? versionRow.versionDescription || versionRow.description || '-' : column.id === 'createdBy' ? versionRow.createdBy || '-' : column.id === 'createdAt' ? formatDateTime(versionRow.createdAt) : column.id === 'updatedBy' ? versionRow.updatedBy || '-' : column.id === 'updatedAt' ? formatDateTime(versionRow.updatedAt) : column.id === 'actions' ? (
                            renderRouteVersionActions(route, versionRow)
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

  const renderRouteCanvasToolbar = () => {
    const toolbarButtonSx = { width: 26, height: 26, color: '#303133', borderRadius: 1, '&:hover': { bgcolor: '#edf2ff', color: '#4c6fff' } };
    const routeInteractionButtonSx = (active: boolean) => ({
      ...toolbarButtonSx,
      color: active ? '#1890ff' : '#303133',
      bgcolor: active ? '#e8f4ff' : 'transparent',
      '&:hover': { bgcolor: active ? '#d1e9ff' : '#edf2ff', color: '#1890ff' },
    });
    return (
      <Stack
        data-process-route-canvas-toolbar
        direction="row"
        spacing={0.5}
        alignItems="center"
        onMouseDown={(event) => event.stopPropagation()}
        sx={{ position: 'absolute', top: 10, right: 10, zIndex: 8, height: 38, px: 0.75, borderRadius: 1.5, bgcolor: 'rgba(255, 255, 255, .92)', border: '1px solid #e4e7ed', boxShadow: '0 8px 24px rgba(15, 23, 42, .12)', backdropFilter: 'blur(8px)' }}
      >
        <Tooltip title="框选" arrow>
          <IconButton
            data-process-route-interaction-select
            size="small"
            aria-label="框选模式"
            sx={routeInteractionButtonSx(routeDesignerInteractionMode === 'select')}
            onClick={() => setRouteDesignerInteractionMode('select')}
          >
            <MouseOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="拖动画布" arrow>
          <IconButton
            data-process-route-interaction-pan
            size="small"
            aria-label="拖动画布模式"
            sx={routeInteractionButtonSx(routeDesignerInteractionMode === 'pan')}
            onClick={() => setRouteDesignerInteractionMode('pan')}
          >
            <PanToolOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="放大" arrow>
          <IconButton size="small" sx={toolbarButtonSx} onClick={zoomRouteDesignerIn}>
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
        <TextField
          type="number"
          size="small"
          value={routeDesignerZoomInput}
          onChange={(event) => setRouteDesignerZoomInput(event.target.value)}
          onBlur={applyRouteDesignerZoomInput}
          onKeyDown={(event) => {
            if (event.key === 'Enter') applyRouteDesignerZoomInput();
          }}
          inputProps={{ 'data-process-route-zoom-input': true, min: 10, max: 400, style: { textAlign: 'center', padding: '6px 0 6px 8px' } }}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          sx={{ width: 74, '& .MuiOutlinedInput-root': { height: 30, bgcolor: '#fff', borderRadius: 1.25, fontSize: 13 }, '& input[type=number]': { MozAppearance: 'textfield' }, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', m: 0 } }}
        />
        <Tooltip title="缩小" arrow>
          <IconButton size="small" sx={toolbarButtonSx} onClick={zoomRouteDesignerOut}>
            <RemoveRounded fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box data-process-route-toolbar-divider sx={{ width: '1px', height: 20, bgcolor: '#dcdfe6', mx: 0.5 }} />
        <Tooltip title="适配画布" arrow>
          <IconButton size="small" sx={toolbarButtonSx} onClick={fitRouteDesignerView}>
            <CenterFocusStrongRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  const renderRouteCanvasDropPreview = () => {
    if (!routeCanvasDropPreview) return null;
    return (
      <Box
        data-process-route-drop-preview
        sx={{
          position: 'absolute',
          left: routeCanvasDropPreview.left,
          top: routeCanvasDropPreview.top,
          zIndex: 6,
          width: ROUTE_DESIGNER_OPERATION_NODE_WIDTH,
          minHeight: ROUTE_DESIGNER_OPERATION_NODE_HEIGHT,
          px: 1.5,
          py: 1,
          boxSizing: 'border-box',
          borderRadius: 1,
          border: '1px dashed #1890ff',
          bgcolor: 'rgba(24, 144, 255, 0.08)',
          color: '#1890ff',
          boxShadow: '0 8px 20px rgba(24, 144, 255, 0.18)',
          pointerEvents: 'none',
          transform: `scale(${routeCanvasDropPreview.zoom})`,
          transformOrigin: 'top left',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {routeCanvasDropPreview.label}
        </Typography>
      </Box>
    );
  };

  const renderRouteDesignerPanel = () => (
    <Box data-process-route-designer-panel sx={{ flex: 1, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {editingRow ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: '0 0 auto', minHeight: 44, px: 1.5, borderBottom: '1px solid #e4e7ed', flexWrap: 'wrap', rowGap: 1 }}>
          <TextField
            select
            size="small"
            label="版本"
            value={selectedRouteVersion?.id ?? ''}
            onChange={(event) => setSelectedRouteVersionId(event.target.value)}
            sx={{ width: 130, ...fieldSx }}
          >
            {selectedRouteVersions.map((version) => <MenuItem key={version.id} value={version.id}>{version.version}</MenuItem>)}
          </TextField>
          <TextField
            size="small"
            label="新增版本"
            placeholder="如 V1.1"
            value={newRouteVersion}
            onChange={(event) => setNewRouteVersion(event.target.value)}
            sx={{ width: 120, ...fieldSx }}
          />
          <Button size="small" variant="outlined" startIcon={<PlaylistAdd />} onClick={() => createRouteVersionMutation.mutate()} disabled={createRouteVersionMutation.isPending || !selectedRouteId}>新增版本</Button>
        </Stack>
      ) : null}
      <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: `${routeDesignerLibraryWidth}px 8px minmax(0, 1fr)` }, gridTemplateRows: { xs: 'auto minmax(360px, 1fr)', lg: 'minmax(0, 1fr)' } }}>
        <Box sx={{ borderBottom: { xs: '1px solid #e4e7ed', lg: 'none' }, p: 1.25, minHeight: 0, maxHeight: { xs: 260, lg: 'none' }, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(auto-fit, minmax(158px, 1fr))' }, gap: 1, mb: 1 }}>
            <TextField
              select
              size="small"
              label="工序分类"
              value={routeOperationLibraryCategory}
              onChange={(event) => setRouteOperationLibraryCategory(event.target.value)}
              sx={fieldSx}
            >
              {routeOperationLibraryCategoryOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField
              size="small"
              placeholder="搜索工序名称/编码"
              value={routeOperationLibraryKeyword}
              onChange={(event) => setRouteOperationLibraryKeyword(event.target.value)}
              sx={fieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.5, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(auto-fit, minmax(158px, 1fr))' }, gap: 1, alignContent: 'start' }}>
            {routeOperationLibraryQuery.isLoading ? (
              <Typography variant="body2" sx={{ color: '#909399' }}>工序加载中</Typography>
            ) : routeOperations.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#909399' }}>暂无可用工序</Typography>
            ) : filteredRouteOperations.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#909399' }}>没有匹配的工序</Typography>
            ) : filteredRouteOperations.map((operation) => (
              <Box
                key={operation.id}
                draggable
                onDragStart={(event) => handleRouteOperationDragStart(event, operation)}
                onDragEnd={handleRouteOperationDragEnd}
                sx={{ p: 1, border: '1px solid #e4e7ed', borderRadius: 1, cursor: 'grab', bgcolor: '#fff', '&:hover': { borderColor: '#1890ff', bgcolor: '#f5fbff' } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#303133', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getDisplayName(operation)}</Typography>
                <Typography variant="caption" sx={{ color: '#909399', display: 'block' }}>{operation.code || '-'}</Typography>
                <Typography variant="caption" sx={{ color: '#909399', display: 'block' }}>{operation.operationCategory || '未分类'}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          data-process-route-library-resizer
          onMouseDown={beginRouteDesignerLibraryResize}
          sx={{ display: { xs: 'none', lg: 'block' }, width: 8, cursor: 'col-resize', bgcolor: '#f5f7fa', borderLeft: '1px solid #e4e7ed', borderRight: '1px solid #e4e7ed', userSelect: 'none', '&:hover': { bgcolor: '#d1e9ff', borderColor: '#1890ff' } }}
        />
        <Box onDragOver={handleRouteCanvasDragOver} onDragLeave={handleRouteCanvasDragLeave} onDrop={handleRouteCanvasDrop} sx={{ minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          {routeGraphQuery.isLoading ? (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#909399' }}>路线图加载中</Box>
          ) : null}
          <ReactFlowProvider>
            <ReactFlow
              nodes={routeNodesWithConnectionState}
              edges={routeEdges}
              nodeTypes={routeDesignerNodeTypes}
              onNodesChange={onRouteNodesChange}
              onEdgesChange={onRouteEdgesChange}
              onConnect={handleRouteConnect}
              onNodeDrag={handleRouteNodeDrag}
              onNodeDragStop={handleRouteNodeDrag}
              onInit={(instance) => {
                setReactFlowInstance(instance);
                syncRouteDesignerZoom(instance);
              }}
              onMoveEnd={(_, viewport) => {
                const nextPercent = Math.round(viewport.zoom * 100);
                setRouteDesignerZoomPercent(nextPercent);
                setRouteDesignerZoomInput(String(nextPercent));
              }}
              proOptions={{ hideAttribution: true }}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              panOnDrag={routeDesignerInteractionMode === 'pan'}
              selectionOnDrag={routeDesignerInteractionMode === 'select'}
              multiSelectionKeyCode={['Meta', 'Shift']}
            >
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
          {renderRouteCanvasDropPreview()}
          {renderRouteCanvasToolbar()}
        </Box>
      </Box>
    </Box>
  );

  const renderRouteDialogContent = () => {
    return (
      <Box sx={{ flex: 1, minHeight: 0, height: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' }, gridTemplateRows: { xs: 'auto minmax(420px, 1fr)', lg: 'minmax(0, 1fr)' }, gap: 1.5, pt: 0.5, overflow: 'hidden' }}>
        <Stack data-process-route-dialog-side-panel spacing={1.5} sx={{ minHeight: 0, overflow: 'auto', pr: { xs: 0, lg: 0.5 } }}>
          {renderRouteFormSection('基础信息', ROUTE_BASE_FIELD_IDS)}
          {editingRow ? null : renderRouteFormSection('版本信息', ROUTE_VERSION_FIELD_IDS)}
        </Stack>
        <Box data-process-route-dialog-config-panel sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {renderRouteFormSection('工艺路线配置', [], renderRouteDesignerPanel(), { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }, { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' })}
        </Box>
      </Box>
    );
  };

  const renderTableRow = (row: ProcessTableRow) => {
    if (isMaterialGroupRow(row)) {
      const isExpanded = expandedMaterialGroups.has(row.groupKey);
      return (
        <Fragment key={row.groupKey}>
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
        </Fragment>
      );
    }

    if (pageKey === 'routes') {
      const route = row as RouteRecord;
      const isExpanded = expandedRouteGroups.has(String(route.id));
      const versions = route.versions ?? [];
      return (
        <Fragment key={route.id}>
          <TableRow key={route.id} hover onClick={() => openDetailDrawer(route)} sx={{ cursor: 'pointer', '& .MuiTableCell-root': tableBodyCellSx }}>
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
                <TableCell key={column.id} align={column.align} sx={commonSx} title={String(renderRouteGroupCell(route, column))}>
                  {column.id === 'actions' ? (versions.length > 1 ? renderMultiVersionRouteActions(route) : renderSingleVersionRouteActions(route)) : index === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          expandRouteGroup(route.id);
                        }}
                        sx={{ width: 24, height: 24, color: '#606266' }}
                      >
                        {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      </IconButton>
                      <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {renderRouteGroupCell(route, column)}
                      </Typography>
                    </Box>
                  ) : column.id === 'version' ? (
                    <Typography sx={{ color: '#606266' }}>{renderRouteGroupCell(route, column)}</Typography>
                  ) : column.id === 'status' ? (
                    <StatusBadge label={getStatusLabel(route.status)} color={getStatusColor(route.status)} />
                  ) : (
                    renderRouteGroupCell(route, column)
                  )}
                </TableCell>
              );
            })}
          </TableRow>
          {isExpanded ? renderRouteVersionTable(route) : null}
        </Fragment>
      );
    }

    return (
      <TableRow
        key={getRecordId(row)}
        hover
        onClick={() => openDetailDrawer(row)}
        sx={{ cursor: 'pointer', '& .MuiTableCell-root': tableBodyCellSx }}
      >
        {visibleColumns.map((column) => renderCell(row, column))}
      </TableRow>
    );
  };

  function getColumnDisplayValue(row: ProcessModelingRecord, columnId: ProcessColumnId) {
    if (columnId === 'name') return getDisplayName(row);
    if (columnId === 'status') return getStatusLabel(pageKey === 'materials' ? getMaterialVersionRuntimeStatus(row as MaterialRecord) : row.status);
    if (columnId === 'createdAt' || columnId === 'updatedAt') return formatDateTime(row[columnId]);
    if (columnId === 'effectiveDate' || columnId === 'expiryDate') return 'effectiveDate' in row || 'expiryDate' in row ? formatDateTime(row[columnId as 'effectiveDate' | 'expiryDate']) : '-';
    if (pageKey === 'routes' && columnId === 'version') return 'versionCount' in row && row.versionCount != null ? String(row.versionCount) : 'versions' in row && Array.isArray(row.versions) ? String(row.versions.length) : '0';
    if (pageKey === 'routes' && columnId === 'versionCount') return 'versionCount' in row && row.versionCount != null ? String(row.versionCount) : 'versions' in row && Array.isArray(row.versions) ? String(row.versions.length) : '0';
    if (pageKey === 'routes' && columnId === 'commonAsset') return 'commonAsset' in row && row.commonAsset === false ? '否' : '是';
    if (pageKey === 'operations' && columnId === 'defaultDurationMinutes') return 'defaultDurationMinutes' in row && row.defaultDurationMinutes != null ? `${row.defaultDurationMinutes} 分钟` : '-';
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

  const filterFields = pageKey === 'materials' ? renderMaterialFilters() : pageKey === 'operations' ? renderOperationFilters() : (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center' }}>
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
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ gridColumn: { xs: '1', md: '3' } }}>
        <Button size="small" sx={QUERY_BUTTON_SX} variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>重置</Button>
        <Button size="small" sx={QUERY_BUTTON_SX} variant="contained" startIcon={<Search />} onClick={() => setPage(1)}>查询</Button>
      </Stack>
    </Box>
  );

  return (
    <>
      <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, display: pageKey === 'operations' ? 'grid' : 'flex', gridTemplateColumns: pageKey === 'operations' ? { xs: '1fr', lg: '260px minmax(0, 1fr)' } : undefined, flexDirection: pageKey === 'operations' ? undefined : 'column', gap: 1.5, minHeight: 0, overflow: 'hidden' }}>
        {pageKey === 'operations' ? renderOperationCategoryPanel() : null}
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1.5, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
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
            {pageKey === 'materials' || pageKey === 'routes' ? (
              <>
                <Tooltip title="全部展开" arrow>
                  <IconButton size="small" aria-label="全部展开" onClick={pageKey === 'materials' ? expandAllMaterialGroups : expandAllRouteGroups} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}>
                    <UnfoldMoreRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="全部收起" arrow>
                  <IconButton size="small" aria-label="全部收起" onClick={pageKey === 'materials' ? collapseAllMaterialGroups : collapseAllRouteGroups} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}>
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
            {pageKey === 'materials' || pageKey === 'routes' ? (
              <Tabs value={columnSettingsTab} onChange={(_, value: ColumnSettingsTarget) => setColumnSettingsTab(value)} aria-label={`${config.title}字段设置切换`} sx={{ minHeight: 32, mb: 0.5, '& .MuiTab-root': { minHeight: 32, py: 0, fontSize: 13 } }}>
                <Tab label="主表" value="main" />
                {pageKey === 'materials' ? <Tab label="子表" value="materialVersion" /> : <Tab label="子表" value="routeVersion" />}
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
                      <DetailField label={pageKey === 'routes' ? '工艺路线模板名称' : '名称'}>{getDisplayName(selectedRow)}</DetailField>
                      {pageKey === 'routes' ? null : (
                        <DetailField label={pageKey === 'materials' ? '物料料号' : '系统编码'}>{selectedRow.code || '-'}</DetailField>
                      )}
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
                      {pageKey === 'operations' ? (
                        <>
                          <DetailField label="工序分类">{'operationCategory' in selectedRow ? selectedRow.operationCategory || '-' : '-'}</DetailField>
                          <DetailField label="默认工序类型">{'defaultOperationType' in selectedRow ? selectedRow.defaultOperationType || '-' : '-'}</DetailField>
                          <DetailField label="标准工时">{'defaultDurationMinutes' in selectedRow && selectedRow.defaultDurationMinutes != null ? `${selectedRow.defaultDurationMinutes} 分钟` : '-'}</DetailField>
                          <DetailField label="工序通用描述">{'generalDescription' in selectedRow ? selectedRow.generalDescription || '-' : '-'}</DetailField>
                        </>
                      ) : null}
                      {pageKey === 'routes' ? (
                        <>
                          <DetailField label="当前版本">{'latestVersion' in selectedRow ? selectedRow.latestVersion || '-' : '-'}</DetailField>
                          <DetailField label="版本数量">{'versionCount' in selectedRow ? selectedRow.versionCount ?? '-' : '-'}</DetailField>
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

      <Dialog
        open={dialogOpen}
        onClose={() => resetDialogState()}
        maxWidth={pageKey === 'routes' ? 'xl' : 'sm'}
        fullScreen={pageKey === 'routes'}
        fullWidth
        PaperProps={pageKey === 'routes' ? { sx: { width: '100vw', maxWidth: '100vw', height: '100vh', maxHeight: '100vh', m: 0, borderRadius: 0 } } : undefined}
      >
        <DialogTitle sx={pageKey === 'routes' ? { px: 2, py: 1.25 } : undefined}>
          {pageKey === 'routes' ? (
            <Box data-process-route-dialog-title-bar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#303133' }}>{editingRow ? `编辑${config.title}` : `新增${config.title}`}</Typography>
              <IconButton size="small" aria-label="关闭工艺路线弹窗" onClick={() => resetDialogState()} sx={{ width: 32, height: 32, color: '#606266', '&:hover': { bgcolor: '#f2f3f5', color: '#303133' } }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          ) : editingRow ? `编辑${config.title}` : creatingMaterialVersionFrom ? '新增子版本' : `新增${config.title}`}
        </DialogTitle>
        <DialogContent dividers sx={pageKey === 'routes' ? { minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } : undefined}>
          {pageKey === 'routes' ? renderRouteDialogContent() : pageKey === 'materials' ? (
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
          <Button onClick={() => resetDialogState()}>取消</Button>
          <Button variant="contained" onClick={submitForm} disabled={createMutation.isPending || updateMutation.isPending || saveRouteGraphMutation.isPending}>{createMutation.isPending || updateMutation.isPending || saveRouteGraphMutation.isPending ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={operationCategoryDialog.open} onClose={() => setOperationCategoryDialog({ open: false, mode: 'create', name: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>{operationCategoryDialog.mode === 'edit' ? '编辑分类' : '新增分类'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="工序分类名称"
            value={operationCategoryDialog.name}
            onChange={(event) => setOperationCategoryDialog((current) => ({ ...current, name: event.target.value }))}
            size="small"
            fullWidth
            required
            autoFocus
            sx={fieldSx}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOperationCategoryDialog({ open: false, mode: 'create', name: '' })}>取消</Button>
          <Button variant="contained" onClick={() => saveOperationCategoryMutation.mutate()} disabled={saveOperationCategoryMutation.isPending}>
            {saveOperationCategoryMutation.isPending ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOperationCategoryTarget !== null} onClose={() => setDeleteOperationCategoryTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>删除分类</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            确定要删除工序分类 {deleteOperationCategoryTarget?.name} 吗？删除后该分类将无法恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOperationCategoryTarget(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteOperationCategoryTarget && deleteOperationCategoryMutation.mutate(deleteOperationCategoryTarget)}
            disabled={deleteOperationCategoryMutation.isPending}
          >
            删除
          </Button>
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
    </>
  );
}
