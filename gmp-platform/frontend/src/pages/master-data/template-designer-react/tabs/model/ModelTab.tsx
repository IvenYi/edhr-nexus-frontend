import { type DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Pagination,
  Popover,
  Select,
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
import DesignServicesOutlined from '@mui/icons-material/DesignServicesOutlined';
import DragIndicator from '@mui/icons-material/DragIndicator';
import EditOutlined from '@mui/icons-material/EditOutlined';
import RestartAlt from '@mui/icons-material/RestartAlt';
import Search from '@mui/icons-material/Search';
import TuneRounded from '@mui/icons-material/TuneRounded';
import ToggleOffOutlined from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnOutlined from '@mui/icons-material/ToggleOnOutlined';
import ViewColumnRounded from '@mui/icons-material/ViewColumnRounded';
import FieldTypeIcon from '../../components/FieldTypeIcon';
import type { FieldType, ModelField } from '../../types';
import { fieldRegistry, getFieldTypeDefinition } from '../../registry/fieldRegistry';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

interface FieldReportRow {
  id: string;
  fieldValues: Record<string, string>;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

interface FieldReportColumn {
  key: string;
  label: string;
  width: number;
  getValue: (row: FieldReportRow) => string;
}

const reportRows: FieldReportRow[] = [];
const REPORT_PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;
const REPORT_TABLE_DATA_ROW_HEIGHT = 40;
const REPORT_QUERY_BUTTON_SX = { height: 40, width: 80, minWidth: 80 };
const reportAuditColumns: FieldReportColumn[] = [
  { key: 'createdBy', label: '创建人', width: 140, getValue: (row) => row.createdBy },
  { key: 'createdAt', label: '创建时间', width: 180, getValue: (row) => row.createdAt },
  { key: 'updatedBy', label: '更新人', width: 140, getValue: (row) => row.updatedBy },
  { key: 'updatedAt', label: '更新时间', width: 180, getValue: (row) => row.updatedAt },
];

const compactTextFieldSx = {
  '& .MuiInputBase-root': {
    height: 34,
    fontSize: 13,
    bgcolor: '#fff',
    alignItems: 'center',
  },
  '& .MuiOutlinedInput-input': {
    padding: '7px 12px 6px',
    lineHeight: '20px',
  },
  '& .MuiInputLabel-root': {
    fontSize: 13,
    px: 0.5,
    bgcolor: '#fff',
    zIndex: 1,
    transform: 'translate(14px, 8px) scale(1)',
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -7px) scale(0.75)',
  },
};

const fieldCardGridSx = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  display: 'grid',
  gridTemplateColumns: '1fr',
  alignContent: 'start',
  gap: 1.25,
};

const fieldEmptyStateSx = {
  flex: 1,
  minHeight: 240,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const fieldCountFooterSx = {
  flex: '0 0 auto',
  minHeight: 32,
  mx: -1.5,
  mb: -1.5,
  pb: 0.75,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  borderTop: '1px solid #e4e7ed',
  bgcolor: '#fff',
  boxSizing: 'border-box',
  textAlign: 'center',
};

const fieldCountFooterTextSx = {
  mt: 0,
  fontSize: 12,
  color: '#8b95a1',
};

const fieldFilterGridSx = {
  display: 'grid',
  gridTemplateColumns: 'minmax(150px, 1fr) 112px 92px',
  gap: 1,
  alignItems: 'center',
  '& .field-filter-search': {
    minWidth: 0,
  },
  '@container (max-width: 360px)': {
    gridTemplateColumns: '1fr 1fr',
    '& .field-filter-search': {
      gridColumn: '1 / -1',
    },
  },
};

const reportFieldSx = {
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
  height: REPORT_TABLE_DATA_ROW_HEIGHT,
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

const fieldCardSx = {
  position: 'relative',
  p: 1.25,
  minHeight: 96,
  borderRadius: 1,
  borderColor: '#dfe4ec',
  bgcolor: '#fff',
  cursor: 'pointer',
  transition: 'border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
  '& .field-card-actions': {
    position: 'absolute',
    right: 8,
    bottom: 8,
    borderRadius: 1,
    bgcolor: '#fff',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translateY(4px)',
    transition: 'opacity 120ms ease, transform 120ms ease',
  },
  '&:hover': {
    borderColor: '#b9c4d3',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
  },
  '&:hover .field-card-actions': {
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'translateY(0)',
  },
};

function getStatusLabel(status: ModelField['status']) {
  return status === 'enabled' ? '启用' : '停用';
}

function createLocalId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeFieldCodeBase(input: string, fallback: string) {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

function createUniqueFieldCode(fields: ModelField[], name: string, type: FieldType) {
  const base = normalizeFieldCodeBase(name, type);
  const usedCodes = new Set(fields.map((field) => field.code));
  if (!usedCodes.has(base)) return base;

  let index = 2;
  while (usedCodes.has(`${base}_${index}`)) {
    index += 1;
  }
  return `${base}_${index}`;
}

function createSubTableField(type: FieldType, name: string, sortOrder: number, fields: ModelField[]): ModelField {
  const definition = getFieldTypeDefinition(type);
  return {
    ...definition.defaultField(name, sortOrder),
    id: createLocalId('sub-field'),
    code: createUniqueFieldCode(fields, name, definition.type),
  };
}

function normalizeSubTableField(input: unknown, index: number): ModelField | null {
  if (typeof input === 'string') {
    return createSubTableField('text', input.trim() || `子字段${index + 1}`, index + 1, []);
  }
  if (!input || typeof input !== 'object') return null;

  const source = input as Partial<ModelField> & Record<string, unknown>;
  const type = typeof source.type === 'string' ? source.type as FieldType : 'text';
  const definition = getFieldTypeDefinition(type);
  const name = typeof source.name === 'string' && source.name.trim()
    ? source.name.trim()
    : typeof source.label === 'string' && source.label.trim()
      ? source.label.trim()
      : definition.label;
  const fallbackField = definition.defaultField(name, index + 1);

  return {
    ...fallbackField,
    id: typeof source.id === 'string' && source.id ? source.id : `sub-field-${index + 1}`,
    code: typeof source.code === 'string' && source.code ? source.code : `sub_field_${index + 1}`,
    name,
    groupId: typeof source.groupId === 'string' ? source.groupId : 'default-group',
    sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : index + 1,
    status: source.status === 'disabled' ? 'disabled' : 'enabled',
    description: typeof source.description === 'string' ? source.description : '',
    typeConfig: typeof source.typeConfig === 'object' && source.typeConfig
      ? { ...fallbackField.typeConfig, ...source.typeConfig }
      : { ...fallbackField.typeConfig },
  };
}

function getSubTableFields(field: ModelField): ModelField[] {
  const columns = field.typeConfig.columns;
  return typeof columns === 'string'
    ? columns.split(/[\n,，]/).map((column, index) => normalizeSubTableField(column, index)).filter((column): column is ModelField => Boolean(column))
    : Array.isArray(columns)
      ? columns.map((column, index) => normalizeSubTableField(column, index)).filter((column): column is ModelField => Boolean(column))
      : [];
}

interface ModelTabProps {
  subTableDesignFieldId?: string | null;
  onSubTableDesignFieldIdChange?: (fieldId: string | null) => void;
  onFieldConfirmPersist?: () => Promise<void>;
  saving?: boolean;
}

export default function ModelTab({
  subTableDesignFieldId = null,
  onSubTableDesignFieldIdChange,
  onFieldConfirmPersist,
  saving = false,
}: ModelTabProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldDescription, setNewFieldDescription] = useState('');
  const [fieldReportColumnSettingsAnchorEl, setFieldReportColumnSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [hiddenReportColumnKeys, setHiddenReportColumnKeys] = useState<string[]>([]);
  const [reportColumnOrder, setReportColumnOrder] = useState<string[]>([]);
  const [draggingReportColumnKey, setDraggingReportColumnKey] = useState<string | null>(null);
  const [reportKeyword, setReportKeyword] = useState('');
  const [reportOccurredAt, setReportOccurredAt] = useState('');
  const [reportOperator, setReportOperator] = useState('');
  const [reportPage, setReportPage] = useState(1);
  const [reportRowsPerPage, setReportRowsPerPage] = useState<number>(20);

  const document = useTemplateDesignerStore((state) => state.document);
  const selectedFieldId = useTemplateDesignerStore((state) => state.selectedFieldId);
  const setSelectedFieldId = useTemplateDesignerStore((state) => state.setSelectedFieldId);
  const addField = useTemplateDesignerStore((state) => state.addField);
  const updateField = useTemplateDesignerStore((state) => state.updateField);
  const setFieldStatus = useTemplateDesignerStore((state) => state.setFieldStatus);
  const getUsedFieldIdsForCurrentVersion = useTemplateDesignerStore((state) => state.getUsedFieldIdsForCurrentVersion);

  const fields = document?.model.fields ?? [];
  const usedFieldIds = new Set(getUsedFieldIdsForCurrentVersion());
  const activeSubTableDesignField = fields.find((field) => field.id === subTableDesignFieldId && field.type === 'subTable') ?? null;
  const subTableFields = useMemo(() => activeSubTableDesignField ? getSubTableFields(activeSubTableDesignField) : [], [activeSubTableDesignField]);
  const currentFields = activeSubTableDesignField ? subTableFields : fields;
  const currentUsedFieldIds = activeSubTableDesignField ? new Set<string>() : usedFieldIds;
  const currentFieldRegistry = useMemo(
    () => activeSubTableDesignField ? fieldRegistry.filter((fieldType) => fieldType.type !== 'subTable') : fieldRegistry,
    [activeSubTableDesignField],
  );
  const reportColumns = useMemo<FieldReportColumn[]>(() => {
    const modelColumns = currentFields.map((field) => field)
        .sort((first, second) => first.sortOrder - second.sortOrder)
        .map((field) => ({
          key: `field:${field.id}`,
          label: field.name || field.code || '未命名字段',
          width: 180,
          getValue: (row: FieldReportRow) => row.fieldValues[field.id] ?? '',
        }));

    return [...modelColumns, ...reportAuditColumns];
  }, [currentFields]);
  const orderedReportColumns = useMemo(() => {
    const columnMap = new Map(reportColumns.map((column) => [column.key, column]));
    const orderedKeys = reportColumnOrder.filter((columnKey) => columnMap.has(columnKey));
    const orderedKeySet = new Set(orderedKeys);
    const remainingColumns = reportColumns.filter((column) => !orderedKeySet.has(column.key));
    return [...orderedKeys.map((columnKey) => columnMap.get(columnKey) as FieldReportColumn), ...remainingColumns];
  }, [reportColumnOrder, reportColumns]);
  const visibleReportColumns = useMemo(
    () => orderedReportColumns.filter((column) => !hiddenReportColumnKeys.includes(column.key)),
    [hiddenReportColumnKeys, orderedReportColumns],
  );
  const reportTableMinWidth = Math.max(960, visibleReportColumns.reduce((total, column) => total + column.width, 0));
  const filteredFields = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return [...currentFields]
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .filter((field) => {
        const matchesKeyword = !normalizedKeyword
          || field.name.toLowerCase().includes(normalizedKeyword)
          || field.code.toLowerCase().includes(normalizedKeyword);
        const matchesType = !typeFilter || field.type === typeFilter;
        const matchesStatus = !statusFilter || field.status === statusFilter;
        return matchesKeyword && matchesType && matchesStatus;
      });
  }, [currentFields, keyword, statusFilter, typeFilter]);

  const selectedField = currentFields.find((field) => field.id === selectedFieldId) ?? filteredFields[0] ?? null;
  const reportPageCount = Math.max(1, Math.ceil(reportRows.length / reportRowsPerPage));
  const pagedReportRows = reportRows.slice((reportPage - 1) * reportRowsPerPage, reportPage * reportRowsPerPage);

  useEffect(() => {
    const availableColumnKeys = new Set(reportColumns.map((column) => column.key));
    setHiddenReportColumnKeys((current) => current.filter((columnId) => availableColumnKeys.has(columnId)));
    setReportColumnOrder((current) => {
      const currentKeys = current.filter((columnId) => availableColumnKeys.has(columnId));
      const currentKeySet = new Set(currentKeys);
      const nextKeys = [
        ...currentKeys,
        ...reportColumns.map((column) => column.key).filter((columnId) => !currentKeySet.has(columnId)),
      ];
      if (nextKeys.length === current.length && nextKeys.every((columnId, index) => columnId === current[index])) return current;
      return nextKeys;
    });
  }, [reportColumns]);

  useEffect(() => {
    setKeyword('');
    setTypeFilter('');
    setStatusFilter('');
    setHiddenReportColumnKeys([]);
    setReportColumnOrder([]);
    setFieldReportColumnSettingsAnchorEl(null);
    setReportPage(1);
  }, [activeSubTableDesignField?.id]);

  useEffect(() => {
    if (!isSidebarResizing) return undefined;

    const handleMouseMove = (event: MouseEvent) => {
      const containerLeft = containerRef.current?.getBoundingClientRect().left ?? 0;
      setSidebarWidth(Math.min(450, Math.max(300, event.clientX - containerLeft)));
    };
    const handleMouseUp = () => setIsSidebarResizing(false);
    const previousCursor = globalThis.document.body.style.cursor;
    const previousUserSelect = globalThis.document.body.style.userSelect;

    globalThis.document.body.style.cursor = 'col-resize';
    globalThis.document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      globalThis.document.body.style.cursor = previousCursor;
      globalThis.document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSidebarResizing]);

  const openCreateFieldDialog = () => {
    setEditingFieldId(null);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldDescription('');
    setCreateDialogOpen(true);
  };

  const openEditFieldDialog = (field: ModelField) => {
    setEditingFieldId(field.id);
    setNewFieldName(field.name);
    setNewFieldType(activeSubTableDesignField && field.type === 'subTable' ? 'text' : field.type);
    setNewFieldDescription(field.description ?? '');
    setCreateDialogOpen(true);
  };

  const updateSubTableFields = (nextFields: ModelField[]) => {
    if (!activeSubTableDesignField) return;
    updateField(activeSubTableDesignField.id, {
      typeConfig: {
        ...activeSubTableDesignField.typeConfig,
        columns: nextFields,
      },
    });
  };

  const setCurrentFieldStatus = (fieldId: string, status: ModelField['status']) => {
    if (activeSubTableDesignField) {
      updateSubTableFields(currentFields.map((field) => (field.id === fieldId ? { ...field, status } : field)));
      return;
    }
    setFieldStatus(fieldId, status);
  };

  const handleSaveField = async () => {
    const name = newFieldName.trim();
    if (!name) return;

    const effectiveFieldType: FieldType = activeSubTableDesignField && newFieldType === 'subTable' ? 'text' : newFieldType;
    const shouldPersistCreatedField = !editingFieldId && Boolean(onFieldConfirmPersist);

    if (editingFieldId) {
      if (activeSubTableDesignField) {
        updateSubTableFields(currentFields.map((field) => {
          if (field.id !== editingFieldId) return field;
          const definition = getFieldTypeDefinition(effectiveFieldType);
          const typeChanged = effectiveFieldType !== field.type;
          return {
            ...field,
            name,
            type: definition.type,
            description: newFieldDescription,
            typeConfig: typeChanged ? { ...definition.defaultField(name, field.sortOrder).typeConfig } : field.typeConfig,
          };
        }));
      } else {
        updateField(editingFieldId, {
          name,
          type: effectiveFieldType,
          description: newFieldDescription,
        });
      }
      setSelectedFieldId(editingFieldId);
    } else {
      if (activeSubTableDesignField) {
        const field = {
          ...createSubTableField(effectiveFieldType, name, currentFields.length + 1, currentFields),
          description: newFieldDescription.trim(),
        };
        updateSubTableFields([...currentFields, field]);
        setSelectedFieldId(field.id);
      } else {
        const field = addField(effectiveFieldType, name);
        if (newFieldDescription.trim()) {
          updateField(field.id, { description: newFieldDescription.trim() });
        }
        setSelectedFieldId(field.id);
      }
    }

    setEditingFieldId(null);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldDescription('');
    setCreateDialogOpen(false);

    if (shouldPersistCreatedField && onFieldConfirmPersist) {
      try {
        await onFieldConfirmPersist();
      } catch {
        // The parent mutation already surfaces the save error through the page snackbar.
      }
    }
  };

  const openSubTableDesignView = (field: ModelField) => {
    onSubTableDesignFieldIdChange?.(field.id);
    setSelectedFieldId(null);
    setReportPage(1);
    setHiddenReportColumnKeys([]);
    setReportColumnOrder([]);
    setFieldReportColumnSettingsAnchorEl(null);
  };

  const moveReportColumnSetting = (sourceColumnId: string | null, targetColumnId: string) => {
    if (!sourceColumnId || sourceColumnId === targetColumnId) return;
    const availableColumnKeys = reportColumns.map((column) => column.key);
    setReportColumnOrder((current) => {
      const currentKeys = current.filter((columnId) => availableColumnKeys.includes(columnId));
      const currentKeySet = new Set(currentKeys);
      const normalizedKeys = [
        ...currentKeys,
        ...availableColumnKeys.filter((columnId) => !currentKeySet.has(columnId)),
      ];
      const sourceIndex = normalizedKeys.indexOf(sourceColumnId);
      const targetIndex = normalizedKeys.indexOf(targetColumnId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const nextKeys = [...normalizedKeys];
      const [movedKey] = nextKeys.splice(sourceIndex, 1);
      nextKeys.splice(targetIndex, 0, movedKey);
      return nextKeys;
    });
  };

  const handleReportColumnSettingDragStart = (event: DragEvent<HTMLDivElement>, columnId: string) => {
    setDraggingReportColumnKey(columnId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnId);
  };

  const handleReportColumnSettingDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleReportColumnSettingDrop = (event: DragEvent<HTMLDivElement>, targetColumnId: string) => {
    event.preventDefault();
    const sourceColumnId = draggingReportColumnKey ?? event.dataTransfer.getData('text/plain');
    moveReportColumnSetting(sourceColumnId, targetColumnId);
    setDraggingReportColumnKey(null);
  };

  const handleReportColumnSettingDragEnd = () => {
    setDraggingReportColumnKey(null);
  };

  const toggleReportColumnVisibility = (columnId: string) => {
    setHiddenReportColumnKeys((current) => {
      if (current.includes(columnId)) {
        return current.filter((hiddenColumnId) => hiddenColumnId !== columnId);
      }
      if (reportColumns.length - current.length <= 1) return current;
      return [...current, columnId];
    });
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1.5, md: 0 },
        height: '100%',
        minWidth: 0,
      }}
    >
      <Paper
        data-field-management-panel="true"
        elevation={0}
        sx={{ width: { xs: '100%', md: sidebarWidth }, flex: '0 0 auto', p: 1.5, overflow: 'hidden', border: '1px solid #e4e7ed', borderRadius: 1, boxShadow: 'none', bgcolor: '#fff', containerType: 'inline-size', display: 'flex', flexDirection: 'column' }}
      >
        <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>字段管理</Typography>
            <Button
              size="small"
              variant="contained"
              onClick={openCreateFieldDialog}
              sx={{
                height: 30,
                minWidth: 72,
                px: 1.5,
                fontSize: 12,
                boxShadow: 'none',
              }}
            >
              新增字段
            </Button>
          </Stack>

          <Divider />

          <Box sx={fieldFilterGridSx}>
            <TextField
              className="field-filter-search"
              size="small"
              label="搜索字段"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              sx={compactTextFieldSx}
              fullWidth
            />
            <TextField
              select
              size="small"
              label="类型筛选"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              sx={compactTextFieldSx}
              fullWidth
            >
              <MenuItem value="">全部</MenuItem>
              {currentFieldRegistry.map((fieldType) => (
                <MenuItem key={fieldType.type} value={fieldType.type}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <FieldTypeIcon iconKey={fieldType.iconKey} sx={{ fontSize: 16 }} />
                    <Typography sx={{ fontSize: 13 }}>{fieldType.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="状态筛选"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={compactTextFieldSx}
              fullWidth
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="enabled">启用</MenuItem>
              <MenuItem value="disabled">停用</MenuItem>
            </TextField>
          </Box>

          <Box sx={filteredFields.length ? fieldCardGridSx : fieldEmptyStateSx}>
            {filteredFields.map((field) => {
              const definition = getFieldTypeDefinition(field.type);
              const used = currentUsedFieldIds.has(field.id);
              const selected = field.id === selectedField?.id;

              return (
                <Paper
                  key={field.id}
                  variant="outlined"
                  onClick={() => setSelectedFieldId(field.id)}
                  sx={{
                    ...fieldCardSx,
                    borderColor: selected ? '#1976d2' : '#e5e7eb',
                    bgcolor: selected ? '#f5f9ff' : '#fff',
                  }}
                >
                  <Stack spacing={0.75} sx={{ height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography sx={{ fontSize: 15, lineHeight: 1.35, fontWeight: 700, color: '#20242a', minWidth: 0 }} noWrap>
                        {field.name || '未命名字段'}
                      </Typography>
                      <Stack
                        data-field-status-corner="true"
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ height: 24, flex: '0 0 auto' }}
                      >
                        <Box
                          data-field-status-dot="true"
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: field.status === 'enabled' ? '#22c55e' : '#ef4444',
                            flex: '0 0 auto',
                          }}
                        />
                        <Typography sx={{ fontSize: 12, color: field.status === 'enabled' ? '#16a34a' : '#ef4444' }}>
                          {getStatusLabel(field.status)}
                        </Typography>
                      </Stack>
                      <Stack
                        className="field-card-actions"
                        direction="row"
                        spacing={0.25}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {!activeSubTableDesignField && field.type === 'subTable' ? (
                          <Tooltip title="设计子表" arrow>
                            <IconButton
                              data-sub-table-design-action="true"
                              size="small"
                              aria-label="设计子表"
                              color="primary"
                              onClick={() => openSubTableDesignView(field)}
                              sx={{ width: 24, height: 24 }}
                            >
                              <DesignServicesOutlined sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                        <Tooltip title={field.status === 'enabled' ? '停用' : '启用'} arrow>
                          <IconButton
                            size="small"
                            aria-label={field.status === 'enabled' ? '停用' : '启用'}
                            color={field.status === 'enabled' ? 'warning' : 'success'}
                            onClick={() => setCurrentFieldStatus(field.id, field.status === 'enabled' ? 'disabled' : 'enabled')}
                            sx={{ width: 24, height: 24 }}
                          >
                            {field.status === 'enabled' ? <ToggleOffOutlined sx={{ fontSize: 16 }} /> : <ToggleOnOutlined sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="编辑" arrow>
                          <IconButton
                            size="small"
                            aria-label="编辑字段"
                            onClick={() => openEditFieldDialog(field)}
                            sx={{ width: 24, height: 24 }}
                          >
                            <EditOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                    <Stack spacing={0.25}>
                      <Typography sx={{ fontSize: 13, color: '#7b8491' }}>字段编码: {field.code || '-'}</Typography>
                      <Stack data-field-type-badge="true" direction="row" spacing={0.5} alignItems="center">
                        <FieldTypeIcon iconKey={definition.iconKey} sx={{ fontSize: 15 }} />
                        <Typography sx={{ fontSize: 13, color: '#7b8491' }}>
                          {definition.label} / {used ? '当前版本已使用' : '当前版本未使用'}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 12, color: '#9aa3af' }} noWrap>
                        {field.description || '暂无说明'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
            {!filteredFields.length ? (
              <Typography sx={{ fontSize: 13, color: '#909399' }}>暂无字段</Typography>
            ) : null}
          </Box>
          <Box data-field-count-footer="true" sx={fieldCountFooterSx}>
            <Typography sx={fieldCountFooterTextSx}>共 {currentFields.length} 个字段</Typography>
          </Box>
        </Stack>
      </Paper>

      <Box
        data-model-sidebar-resize="true"
        onMouseDown={(event) => {
          event.preventDefault();
          setIsSidebarResizing(true);
        }}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 4,
          flex: '0 0 4px',
          mr: 1.25,
          cursor: 'col-resize',
          borderRadius: 1,
          '&:hover': { bgcolor: '#d9e2ef' },
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1.5, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        <Box
          data-field-report-query-panel="true"
          sx={{ flex: '0 0 auto', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, p: 2, maxWidth: '100%', minWidth: 0 }}
        >
          {activeSubTableDesignField ? <Box data-sub-table-design-view="true" sx={{ display: 'none' }} /> : null}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              label="字段名称"
              placeholder="请输入"
              value={reportKeyword}
              onChange={(event) => setReportKeyword(event.target.value)}
              sx={reportFieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
            <TextField
              size="small"
              label="发生时间"
              placeholder="请输入"
              value={reportOccurredAt}
              onChange={(event) => setReportOccurredAt(event.target.value)}
              sx={reportFieldSx}
            />
            <TextField
              size="small"
              label="操作人"
              placeholder="请输入"
              value={reportOperator}
              onChange={(event) => setReportOperator(event.target.value)}
              sx={reportFieldSx}
            />
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ gridColumn: { xs: '1', md: '3' } }}>
              <Button
                size="small"
                sx={REPORT_QUERY_BUTTON_SX}
                variant="outlined"
                startIcon={<RestartAlt />}
                onClick={() => {
                  setReportKeyword('');
                  setReportOccurredAt('');
                  setReportOperator('');
                  setReportPage(1);
                }}
              >
                重置
              </Button>
              <Button size="small" sx={REPORT_QUERY_BUTTON_SX} variant="contained" startIcon={<Search />} onClick={() => setReportPage(1)}>
                查询
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box
          data-field-report-table-panel="true"
          data-field-report-audit-detail-labels="操作日志 / 变更记录 / 审计日志"
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="字段设置" arrow>
                <IconButton
                  data-field-report-column-settings="true"
                  size="small"
                  aria-label="字段设置"
                  onClick={(event) => setFieldReportColumnSettingsAnchorEl(event.currentTarget)}
                  sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, color: '#606266', bgcolor: '#fff', '&:hover': { color: '#1890ff', bgcolor: '#e8f4ff' } }}
                >
                  <Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ViewColumnRounded sx={{ fontSize: 21 }} />
                    <TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} />
                  </Box>
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Popover
            open={Boolean(fieldReportColumnSettingsAnchorEl)}
            anchorEl={fieldReportColumnSettingsAnchorEl}
            onClose={() => setFieldReportColumnSettingsAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { mt: 1, width: 220, border: '1px solid #e4e7ed', borderRadius: 1, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } }}
          >
            <Stack data-field-report-column-settings-panel spacing={0.5} sx={{ p: 1.5 }}>
              {orderedReportColumns.map((column) => {
                const checked = !hiddenReportColumnKeys.includes(column.key);
                const disabled = checked && visibleReportColumns.length <= 1;
                return (
                  <Box
                    key={column.key}
                    data-field-report-column-settings-row
                    data-column-id={column.key}
                    draggable
                    onDragStart={(event) => handleReportColumnSettingDragStart(event, column.key)}
                    onDragOver={handleReportColumnSettingDragOver}
                    onDrop={(event) => handleReportColumnSettingDrop(event, column.key)}
                    onDragEnd={handleReportColumnSettingDragEnd}
                    sx={{ display: 'grid', gridTemplateColumns: '24px 34px minmax(0, 1fr)', alignItems: 'center', minHeight: 40, borderRadius: 1, cursor: 'move', color: checked ? '#1890ff' : '#a8abb2', opacity: draggingReportColumnKey === column.key ? 0.55 : 1, '&:hover': { bgcolor: '#f5f7fa' } }}
                  >
                    <DragIndicator fontSize="small" sx={{ color: '#909399' }} />
                    <input
                      aria-label={`${column.label}字段显隐`}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleReportColumnVisibility(column.key)}
                      onClick={(event) => event.stopPropagation()}
                      style={{ width: 16, height: 16 }}
                    />
                    <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {column.label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Popover>

          <Box sx={{ position: 'relative', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0 }}>
            <TableContainer sx={{ width: '100%', maxWidth: '100%', minWidth: 0, height: '100%', minHeight: 0, overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%', minWidth: reportTableMinWidth, height: reportRows.length ? 'auto' : '100%' }}>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>
                    {visibleReportColumns.map((column) => (
                      <TableCell key={column.key} sx={{ width: column.width }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ height: reportRows.length ? 'auto' : '100%' }}>
                  {pagedReportRows.length ? (
                    pagedReportRows.map((row) => (
                      <TableRow hover key={row.id}>
                        {visibleReportColumns.map((column) => (
                          <TableCell key={column.key} sx={tableBodyCellSx}>
                            {column.getValue(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow sx={emptyTableRowSx}>
                      <TableCell colSpan={visibleReportColumns.length} align="center" sx={emptyTableBodyCellSx}>
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ minHeight: 56, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography sx={{ color: '#909399' }}>共 {reportRows.length} 条数据</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Pagination page={reportPage} count={reportPageCount} color="primary" size="small" onChange={(_, value) => setReportPage(value)} />
              <FormControl size="small" sx={{ minWidth: 116 }}>
                <Select
                  value={reportRowsPerPage}
                  onChange={(event) => {
                    setReportRowsPerPage(Number(event.target.value));
                    setReportPage(1);
                  }}
                  sx={{ height: 32, fontSize: 14 }}
                >
                  {REPORT_PAGE_SIZE_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option} 条/页</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        data-field-create-dialog="true"
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>{editingFieldId ? '编辑字段' : '新增字段'}</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', pb: 1 }}>
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            <TextField
              autoFocus
              size="small"
              label="字段名称"
              value={newFieldName}
              onChange={(event) => setNewFieldName(event.target.value)}
              sx={compactTextFieldSx}
              fullWidth
            />
            <TextField
              select
              size="small"
              label="字段类型"
              value={newFieldType}
              onChange={(event) => setNewFieldType(event.target.value as FieldType)}
              sx={compactTextFieldSx}
              fullWidth
            >
              {currentFieldRegistry.map((fieldType) => (
                <MenuItem key={fieldType.type} value={fieldType.type}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <FieldTypeIcon iconKey={fieldType.iconKey} sx={{ fontSize: 16 }} />
                    <Typography sx={{ fontSize: 13 }}>{fieldType.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="字段说明"
              value={newFieldDescription}
              onChange={(event) => setNewFieldDescription(event.target.value)}
              sx={compactTextFieldSx}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pt: 0.5, pb: 1.5 }}>
          <Button size="small" onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button size="small" variant="contained" disabled={!newFieldName.trim() || saving} onClick={() => void handleSaveField()}>
            {editingFieldId ? '保存修改' : '确认新增'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
