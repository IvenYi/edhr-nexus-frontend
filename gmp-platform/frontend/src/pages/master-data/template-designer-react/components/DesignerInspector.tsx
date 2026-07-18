import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorOutlined from '@mui/icons-material/DragIndicatorOutlined';
import RemoveOutlined from '@mui/icons-material/RemoveOutlined';
import { Box, Checkbox, Divider, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import FieldTypeIcon from './FieldTypeIcon';
import PropertyFormRenderer from './PropertyFormRenderer';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { FieldTypeIconKey } from '../types';

type FillLimitKey = 'required' | 'readonly' | 'hidden';

const VALIDATION_TYPE_OPTIONS = [
  { label: '无', value: 'none' },
  { label: '手机号', value: 'phone' },
  { label: '邮箱', value: 'email' },
];

const DISPLAY_MODE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '超链接', value: 'link' },
  { label: '脱敏展示', value: 'mask' },
];

const MASK_MODE_OPTIONS = [
  { label: '从中间隐藏', value: 'middle' },
  { label: '从头隐藏', value: 'start' },
  { label: '从末尾隐藏', value: 'end' },
];

const LINK_TARGET_OPTIONS = [
  { label: '新标签页', value: 'blank' },
  { label: '当前页面', value: 'self' },
];

const NUMBER_KIND_OPTIONS = [
  { label: '整数', value: 'integer' },
  { label: '小数', value: 'decimal' },
];

const POSITIVE_RULE_OPTIONS = [
  { label: '不限', value: 'any' },
  { label: '仅正数', value: 'positive' },
  { label: '仅负数', value: 'negative' },
  { label: '非负数', value: 'nonNegative' },
  { label: '非正数', value: 'nonPositive' },
];

const NUMBER_DISPLAY_MODE_OPTIONS = [
  { label: '普通', value: 'normal' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousands' },
];

const DATE_DEFAULT_VALUE_OPTIONS = [
  { label: '空', value: 'empty' },
  { label: '当前时间', value: 'current' },
];

const DATE_TYPE_OPTIONS = [
  { label: '日期', value: 'date' },
  { label: '时间', value: 'time' },
  { label: '日期时间', value: 'datetime' },
];

const DATE_FORMAT_OPTIONS = [
  { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
  { label: 'YYYY-MM-DD HH:mm', value: 'YYYY-MM-DD HH:mm' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'HH:mm:ss', value: 'HH:mm:ss' },
];

const SIGNATURE_DISPLAY_OPTIONS = [
  { label: '仅签名', value: 'signatureOnly' },
  { label: '签名 + 日期', value: 'signatureDate' },
  { label: '签名 + 日期时间', value: 'signatureDateTime' },
];

const ATTACHMENT_DISPLAY_OPTIONS = [
  { label: '列表', value: 'list' },
  { label: '卡片', value: 'card' },
];

const ATTACHMENT_UPLOAD_MODE_OPTIONS = [
  { label: '单文件', value: 'single' },
  { label: '多文件', value: 'multiple' },
];

const ATTACHMENT_FORMAT_LIMIT_OPTIONS = [
  { label: '所有格式', value: 'all' },
  { label: '文档格式', value: 'document' },
];

const IMAGE_DISPLAY_OPTIONS = [
  { label: '缩略', value: 'thumbnail' },
  { label: '大图', value: 'large' },
];

const IMAGE_UPLOAD_STRATEGY_OPTIONS = [
  { label: '单图片', value: 'single' },
  { label: '多图片', value: 'multiple' },
];

const OPTION_SOURCE_OPTIONS = [
  { label: '手动输入', value: 'manual' },
  { label: '数据字典', value: 'dictionary' },
  { label: '接口数据', value: 'api' },
];

const REFERENCE_FUNCTION_DATA_OPTIONS = [
  { label: '人员', value: 'user' },
  { label: '部门', value: 'department' },
  { label: '物料', value: 'material' },
  { label: '设备', value: 'equipment' },
  { label: '产品', value: 'product' },
  { label: '供应商', value: 'supplier' },
  { label: '字典', value: 'dictionary' },
];

const REFERENCE_QUERY_OPERATOR_OPTIONS = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'ne' },
  { label: '包含', value: 'contains' },
  { label: '不包含', value: 'notContains' },
];

const REFERENCE_DISPLAY_OPTIONS = [
  { label: '链接文本', value: 'link' },
  { label: '纯文本', value: 'text' },
];

const SUB_TABLE_DIRECTION_OPTIONS = [
  { label: '按行填报', value: 'row' },
  { label: '按列填报', value: 'column' },
];

const SUB_TABLE_REPEAT_OPTIONS = [
  { label: '固定', value: 'fixed' },
  { label: '动态', value: 'dynamic' },
];

const SUB_TABLE_ADD_ENTRY_OPTIONS = [
  { label: '底部按钮', value: 'bottom' },
  { label: '右键菜单', value: 'contextMenu' },
  { label: '两者', value: 'both' },
];

const REFERENCE_QUERY_SOURCE_FIELDS: Record<string, Array<{ label: string; value: string }>> = {
  user: [
    { label: '账号', value: 'username' },
    { label: '姓名', value: 'displayName' },
    { label: '手机号', value: 'phone' },
    { label: '邮箱', value: 'email' },
  ],
  department: [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
    { label: '上级部门', value: 'parentName' },
  ],
  material: [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
    { label: '规格', value: 'specification' },
  ],
  equipment: [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
    { label: '型号', value: 'model' },
  ],
  product: [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
    { label: '规格', value: 'specification' },
  ],
  supplier: [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
    { label: '简称', value: 'shortName' },
  ],
  dictionary: [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
    { label: '值', value: 'value' },
  ],
};

const SINGLE_SELECT_SHAPE_OPTIONS = [
  { label: '下拉框', value: 'select' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
];

const OPTION_LAYOUT_OPTIONS = [
  { label: '纵向', value: 'vertical' },
  { label: '横向', value: 'horizontal' },
];

const SINGLE_SELECT_DISPLAY_OPTIONS = [
  { label: '同展现形态', value: 'sameAsShape' },
  { label: '纯文本', value: 'text' },
];

const MULTI_SELECT_DISPLAY_OPTIONS = [
  { label: '同展现形态', value: 'sameAsShape' },
  { label: '文本选项 + 逗号分割', value: 'commaText' },
];

const sectionSx = {
  gap: 1,
};

const sectionTitleSx = {
  fontSize: 14,
  lineHeight: '22px',
  fontWeight: 700,
  color: '#1f2329',
};

const rowSx = {
  minHeight: 32,
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
};

const verticalRowSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 0.5,
};

const labelSx = {
  width: 76,
  flex: '0 0 76px',
  fontSize: 13,
  lineHeight: '20px',
  color: '#4e5969',
};

const verticalLabelSx = {
  ...labelSx,
  width: 'auto',
  flex: 'none',
};

const compactFieldSx = {
  '& .MuiInputBase-root': {
    minHeight: 32,
    fontSize: 13,
    bgcolor: '#fff',
  },
  '& .MuiInputBase-input': {
    py: 0.75,
  },
};

const compactSelectSx = {
  ...compactFieldSx,
  '& .MuiSelect-select': {
    py: 0.75,
    fontSize: 13,
  },
};

const compactTextareaSx = {
  ...compactFieldSx,
  '& .MuiInputBase-root': {
    ...compactFieldSx['& .MuiInputBase-root'],
    alignItems: 'stretch',
    maxHeight: 80,
    overflow: 'visible',
    p: '3px 8px',
  },
  '& .MuiInputBase-inputMultiline': {
    boxSizing: 'border-box',
    width: '100%',
    py: 0.5,
    pr: 0.75,
    lineHeight: '20px',
    maxHeight: 72,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarGutter: 'stable',
    resize: 'none',
  },
};

const optionListEditorSx = {
  gap: 0.25,
};

const optionListHeaderSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  mb: 0.5,
};

const optionRowSx = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 18px',
  alignItems: 'center',
  gap: 0.75,
  '& [data-option-drag-handle="true"]': {
    opacity: 0,
  },
  '& [data-option-default-action="true"]': {
    opacity: 0,
  },
  '& [data-option-default-active="true"]': {
    opacity: 1,
  },
  '&:hover [data-option-drag-handle="true"]': {
    opacity: 1,
  },
  '&:hover [data-option-default-action="true"]': {
    opacity: 1,
  },
};

const optionChoiceSx = {
  display: 'grid',
  gridTemplateColumns: '12px minmax(0, 1fr) 10px',
  alignItems: 'center',
  gap: 0.5,
  minHeight: 28,
  px: 0.5,
  bgcolor: '#f7f8fa',
  borderRadius: 1,
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
};

const optionDragHandleSx = {
  fontSize: 14,
  color: '#86909c',
};

const optionInputSx = {
  ...compactFieldSx,
  '& .MuiInputBase-root': {
    ...compactFieldSx['& .MuiInputBase-root'],
    bgcolor: 'transparent',
    borderRadius: 0,
    minHeight: 28,
    px: 0,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
};

const optionIconButtonSx = {
  width: 28,
  height: 28,
  color: '#4e5969',
  '&:hover': {
    bgcolor: '#f2f3f5',
  },
};

const optionRowIconButtonSx = {
  ...optionIconButtonSx,
  width: 18,
  height: 18,
  p: 0,
};

const optionDefaultDotSx = {
  width: 10,
  height: 10,
  border: '1.5px solid #1677ff',
  borderRadius: '50%',
  bgcolor: 'transparent',
  p: 0,
  cursor: 'pointer',
  appearance: 'none',
  transition: 'opacity 120ms ease, background-color 120ms ease, box-shadow 120ms ease',
  '&:hover': {
    bgcolor: '#e8f3ff',
  },
  '&[data-option-default-active="true"]': {
    bgcolor: '#1677ff',
    boxShadow: 'inset 0 0 0 2px #fff',
  },
};

const fieldIdentitySummarySx = {
  display: 'grid',
  gridTemplateColumns: '92px minmax(0, 1fr)',
  alignItems: 'center',
  gap: 0.75,
  minHeight: 42,
  px: 1,
  py: 0.75,
  border: '1px solid #e5e6eb',
  borderRadius: 1,
  bgcolor: '#f7f8fa',
};

const fieldIdentityLabelSx = {
  fontSize: 12,
  lineHeight: '18px',
  color: '#86909c',
};

const fieldIdentityValueSx = {
  minWidth: 0,
  fontSize: 13,
  lineHeight: '20px',
  color: '#1f2329',
  fontWeight: 500,
};

function readText(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function readNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptionListText(value: unknown) {
  const text = readText(value);
  if (!text.trim()) return ['选项1', '选项2'];
  return text.split('\n');
}

function serializeOptionListRows(rows: string[]) {
  return rows.join('\n');
}

function readMultiDefaultValues(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => readText(item).trim()).filter(Boolean);
  const text = readText(value).trim();
  if (!text) return [];
  return text.split('\n').map((item) => item.trim()).filter(Boolean);
}

function readReferenceQueryConditions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const condition = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        sourceField: readText(condition.sourceField).trim(),
        operator: readText(condition.operator, 'eq').trim() || 'eq',
        targetFieldId: readText(condition.targetFieldId).trim(),
      };
    })
    .filter((condition) => condition.sourceField || condition.targetFieldId || condition.operator);
}

function createReferenceQueryCondition() {
  return {
    sourceField: '',
    operator: 'eq',
    targetFieldId: '',
  };
}

function FieldConfigSection({
  title,
  marker,
  children,
  action,
}: {
  title: string;
  marker: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Stack data-inspector-section={marker} sx={sectionSx}>
      <Stack
        data-field-config-section-title-row="true"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ minHeight: 24, gap: 1 }}
      >
        <Typography sx={sectionTitleSx}>{title}</Typography>
        {action}
      </Stack>
      {children}
    </Stack>
  );
}

function FieldConfigRow({
  label,
  children,
  layout = 'horizontal',
}: {
  label: string;
  children: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
}) {
  const isVertical = layout === 'vertical';

  return (
    <Box sx={isVertical ? verticalRowSx : rowSx}>
      <Typography sx={isVertical ? verticalLabelSx : labelSx}>{label}</Typography>
      <Box sx={isVertical ? { width: '100%', minWidth: 0 } : { flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

function FieldIdentitySummary({
  name,
  typeLabel,
  iconKey,
  typeCaption = '字段类型',
  showName = true,
}: {
  name: string;
  typeLabel: string;
  iconKey: FieldTypeIconKey;
  typeCaption?: string;
  showName?: boolean;
}) {
  return (
    <Box data-field-identity-summary="true" sx={fieldIdentitySummarySx}>
      <Box data-field-identity-type="true" sx={{ minWidth: 0 }}>
        <Typography sx={fieldIdentityLabelSx}>{typeCaption}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
          <FieldTypeIcon iconKey={iconKey} sx={{ fontSize: 16, color: '#1677ff', flex: '0 0 auto' }} />
          <Typography noWrap title={typeLabel} sx={fieldIdentityValueSx}>
            {typeLabel}
          </Typography>
        </Stack>
      </Box>
      {showName ? (
        <Box data-field-identity-name="true" sx={{ minWidth: 0 }}>
          <Typography sx={fieldIdentityLabelSx}>当前字段名称</Typography>
          <Typography noWrap title={name} sx={fieldIdentityValueSx}>
            {name}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

function CompactTextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      sx={compactFieldSx}
    />
  );
}

function CompactTextareaField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      fullWidth
      multiline
      minRows={1}
      maxRows={4}
      size="small"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      sx={compactTextareaSx}
    />
  );
}

function CompactDisabledField({ value, placeholder }: { value?: string; placeholder?: string }) {
  return (
    <TextField
      fullWidth
      disabled
      size="small"
      value={value ?? ''}
      placeholder={placeholder}
      sx={{
        ...compactFieldSx,
        '& .MuiInputBase-root.Mui-disabled': {
          bgcolor: '#f7f8fa',
          color: '#86909c',
        },
      }}
    />
  );
}

function CompactNumberField({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      value={value}
      inputProps={{ min, max }}
      onChange={(event) => {
        const nextValue = readNumber(event.target.value, min ?? 0);
        const minValue = min ?? nextValue;
        const maxValue = max ?? nextValue;
        onChange(Math.min(maxValue, Math.max(minValue, nextValue)));
      }}
      sx={compactFieldSx}
    />
  );
}

function CompactSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      SelectProps={{ displayEmpty: true }}
      sx={compactSelectSx}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function FillLimitCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Box
      component="label"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        minHeight: 28,
        cursor: 'pointer',
        color: '#1f2329',
        fontSize: 13,
      }}
    >
      <Checkbox
        size="small"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        sx={{ p: 0.25 }}
      />
      {label}
    </Box>
  );
}

export default function DesignerInspector() {
  const updateNodeBindings = useTemplateDesignerStore((state) => state.updateNodeBindings);
  const updateSelectedSubTableRegion = useTemplateDesignerStore((state) => state.updateSelectedSubTableRegion);
  const setSelectedSubTableHeaderVisible = useTemplateDesignerStore((state) => state.setSelectedSubTableHeaderVisible);
  const removeNode = useTemplateDesignerStore((state) => state.removeNode);
  const setSelectedNodeId = useTemplateDesignerStore((state) => state.setSelectedNodeId);
  const updateCurrentPage = useTemplateDesignerStore((state) => state.updateCurrentPage);
  const getFieldById = useTemplateDesignerStore((state) => state.getFieldById);
  const document = useTemplateDesignerStore((state) => state.document);
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());
  const selectedSubTableGroupNodeId = useTemplateDesignerStore((state) => state.selectedSubTableGroupNodeId);
  const [draggingOptionIndex, setDraggingOptionIndex] = useState<number | null>(null);
  const draggingOptionIndexRef = useRef<number | null>(null);

  if (!selectedNode) {
    return (
      <Stack spacing={2} sx={{ p: 2, overflow: 'auto' }}>
        <PropertyFormRenderer
          title="页面属性"
          schema={[
            { key: 'name', label: '页面属性', editor: 'text', defaultValue: currentPage?.name ?? '' },
          ]}
          value={{ name: currentPage?.name ?? '' }}
          onChange={(patch) => updateCurrentPage({ name: String(patch.name ?? '') })}
        />
      </Stack>
    );
  }

  const bindings = selectedNode.bindings ?? {};
  const widgetConfig = bindings.widgetConfig ?? {};
  const boundFieldId = selectedNode.bindings?.fieldId;
  const boundField = boundFieldId ? getFieldById(boundFieldId) ?? bindings.subTableField ?? null : null;
  const fieldType = boundField?.type ?? 'text';
  const fieldTypeDefinition = getFieldTypeDefinition(fieldType);
  const fieldDisplayName = boundField?.name || readText(selectedNode.props?.label, fieldTypeDefinition.label);
  const displayMode = readText(bindings.displayMode, 'text');
  const isSubTableGroupSelected = selectedNode.type === 'sub-table'
    && fieldType === 'subTable'
    && selectedSubTableGroupNodeId === selectedNode.id;

  const renderFieldIdentitySummary = () => (
    <FieldIdentitySummary
      name={fieldDisplayName}
      typeLabel={fieldTypeDefinition.label}
      iconKey={fieldTypeDefinition.iconKey}
    />
  );

  const renderSubTableGroupIdentitySummary = () => (
    <FieldIdentitySummary
      name=""
      typeCaption="类型"
      typeLabel={`子表（${fieldDisplayName}） > 分组`}
      iconKey={fieldTypeDefinition.iconKey}
      showName={false}
    />
  );

  const updateBinding = (patch: Record<string, unknown>) => {
    updateNodeBindings(selectedNode.id, patch);
  };

  const updateWidgetConfig = (patch: Record<string, unknown>) => {
    updateNodeBindings(selectedNode.id, {
      widgetConfig: {
        ...widgetConfig,
        ...patch,
      },
    });
  };

  const handleDeleteConfigTarget = () => {
    const region = bindings.subTableRegion;
    if (isSubTableGroupSelected && region) {
      const nextRecordTemplate = { ...region.recordTemplate };
      delete nextRecordTemplate.groupRange;
      updateSelectedSubTableRegion({ recordTemplate: nextRecordTemplate });
      setSelectedNodeId(selectedNode.id);
      return;
    }

    removeNode(selectedNode.id);
  };

  const renderDeleteConfigAction = () => (
    <Tooltip title="删除">
      <IconButton
        aria-label="删除"
        data-field-config-delete-action="true"
        size="small"
        onClick={handleDeleteConfigTarget}
        sx={{
          width: 22,
          height: 22,
          p: 0.25,
          flexShrink: 0,
          color: '#ef4444',
          '&:hover': {
            bgcolor: 'rgba(239, 68, 68, 0.08)',
          },
        }}
      >
        <DeleteIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );

  const handleFillLimitChange = (key: FillLimitKey, checked: boolean) => {
    if (!checked) {
      updateBinding({ [key]: false });
      return;
    }

    updateBinding({
      required: false,
      readonly: false,
      hidden: false,
      [key]: true,
    });
  };

  const renderFillLimitControls = (children?: React.ReactNode) => (
    <Stack spacing={0.5}>
      <FillLimitCheckbox
        label="必填"
        checked={Boolean(bindings.required)}
        onChange={(checked) => handleFillLimitChange('required', checked)}
      />
      <FillLimitCheckbox
        label="只读"
        checked={Boolean(bindings.readonly)}
        onChange={(checked) => handleFillLimitChange('readonly', checked)}
      />
      <FillLimitCheckbox
        label="隐藏"
        checked={Boolean(bindings.hidden)}
        onChange={(checked) => handleFillLimitChange('hidden', checked)}
      />
      {children}
    </Stack>
  );

  const renderConditionLimit = () => (
    <FillLimitCheckbox
      label="条件配置"
      checked={Boolean(widgetConfig.conditionConfig)}
      onChange={(checked) => updateWidgetConfig({ conditionConfig: checked })}
    />
  );

  const renderTextSections = () => (
    <>
      <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
        {renderFieldIdentitySummary()}
        <FieldConfigRow label="默认值" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.defaultValue)}
            placeholder="填报时默认带出"
            onChange={(value) => updateBinding({ defaultValue: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="提示文本" layout="vertical">
          <CompactTextField
            value={readText(bindings.placeholder)}
            placeholder="显示在输入框内"
            onChange={(value) => updateBinding({ placeholder: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="帮助提示" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.helpText)}
            placeholder="鼠标悬浮说明"
            onChange={(value) => updateBinding({ helpText: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="前缀文本" layout="vertical">
          <CompactTextField
            value={readText(widgetConfig.prefix)}
            onChange={(value) => updateWidgetConfig({ prefix: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="后缀文本" layout="vertical">
          <CompactTextField
            value={readText(widgetConfig.suffix)}
            onChange={(value) => updateWidgetConfig({ suffix: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="长度范围" layout="vertical">
          <Stack direction="row" spacing={1}>
            <CompactNumberField
              value={readNumber(widgetConfig.minLength, 0)}
              min={0}
              onChange={(value) => updateWidgetConfig({ minLength: value })}
            />
            <CompactNumberField
              value={readNumber(widgetConfig.maxLength, 200)}
              min={0}
              onChange={(value) => updateWidgetConfig({ maxLength: value })}
            />
          </Stack>
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="填写限制" marker="fill-limit">
        {renderFillLimitControls()}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="验证规则" marker="validation">
        <FieldConfigRow label="验证类型">
          <CompactSelect
            value={readText(bindings.validationType, 'none')}
            options={VALIDATION_TYPE_OPTIONS}
            onChange={(value) => updateBinding({ validationType: value })}
          />
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="查看效果" marker="display">
        <FieldConfigRow label="展示方式">
          <CompactSelect
            value={displayMode}
            options={DISPLAY_MODE_OPTIONS}
            onChange={(value) => updateBinding({ displayMode: value })}
          />
        </FieldConfigRow>
        <FillLimitCheckbox
          label="自动换行"
          checked={Boolean(bindings.autoWrap)}
          onChange={(checked) => updateBinding({ autoWrap: checked })}
        />

        {displayMode === 'mask' ? (
          <>
            <FieldConfigRow label="脱敏配置">
              <CompactSelect
                value={readText(bindings.maskMode, 'middle')}
                options={MASK_MODE_OPTIONS}
                onChange={(value) => updateBinding({ maskMode: value })}
              />
            </FieldConfigRow>
            <FieldConfigRow label="隐藏位数">
              <CompactNumberField
                value={readNumber(bindings.maskDigits, 3)}
                min={1}
                max={6}
                onChange={(value) => updateBinding({ maskDigits: value })}
              />
            </FieldConfigRow>
          </>
        ) : null}

        {displayMode === 'link' ? (
          <FieldConfigRow label="打开方式">
            <CompactSelect
              value={readText(bindings.linkTarget, 'blank')}
              options={LINK_TARGET_OPTIONS}
              onChange={(value) => updateBinding({ linkTarget: value })}
            />
          </FieldConfigRow>
        ) : null}
      </FieldConfigSection>
    </>
  );

  const renderNumberSections = () => {
    const numberKind = readText(widgetConfig.numberKind, 'decimal');
    const formulaAutoAssign = Boolean(widgetConfig.formulaAutoAssign);

    return (
      <>
      <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
        {renderFieldIdentitySummary()}
        <FieldConfigRow label="默认值" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.defaultValue)}
            placeholder="填报时默认带出"
            onChange={(value) => updateBinding({ defaultValue: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="提示文本" layout="vertical">
          <CompactTextField
            value={readText(bindings.placeholder)}
            placeholder="显示在输入框内"
            onChange={(value) => updateBinding({ placeholder: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="帮助提示" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.helpText)}
            placeholder="鼠标悬浮说明"
            onChange={(value) => updateBinding({ helpText: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="前缀" layout="vertical">
          <CompactTextField
            value={readText(widgetConfig.prefix)}
            onChange={(value) => updateWidgetConfig({ prefix: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="后缀" layout="vertical">
          <CompactTextField
            value={readText(widgetConfig.suffix)}
            onChange={(value) => updateWidgetConfig({ suffix: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="整数/小数">
          <CompactSelect
            value={numberKind}
            options={NUMBER_KIND_OPTIONS}
            onChange={(value) => updateWidgetConfig({ numberKind: value })}
          />
        </FieldConfigRow>
        {numberKind === 'decimal' ? (
          <FieldConfigRow label="精度">
            <CompactNumberField
              value={readNumber(widgetConfig.precision, 2)}
              min={0}
              max={8}
              onChange={(value) => updateWidgetConfig({ precision: value })}
            />
          </FieldConfigRow>
        ) : null}
        <FieldConfigRow label="最小值 / 最大值" layout="vertical">
          <Stack direction="row" spacing={1}>
            <CompactNumberField
              value={readNumber(widgetConfig.minValue, 0)}
              onChange={(value) => updateWidgetConfig({ minValue: value })}
            />
            <CompactNumberField
              value={readNumber(widgetConfig.maxValue, 0)}
              onChange={(value) => updateWidgetConfig({ maxValue: value })}
            />
          </Stack>
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="填写限制" marker="fill-limit">
        {renderFillLimitControls(
          <>
            <FillLimitCheckbox
              label="公式自动赋值"
              checked={formulaAutoAssign}
              onChange={(checked) => updateWidgetConfig({ formulaAutoAssign: checked })}
            />
            {formulaAutoAssign ? (
              <FieldConfigRow label="公式配置" layout="vertical">
                <CompactTextareaField
                  value={readText(widgetConfig.formulaConfig)}
                  placeholder="输入计算公式"
                  onChange={(value) => updateWidgetConfig({ formulaConfig: value })}
                />
              </FieldConfigRow>
            ) : null}
          </>,
        )}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="验证规则" marker="validation">
        <FieldConfigRow label="正负规则">
          <CompactSelect
            value={readText(widgetConfig.positiveRule, 'any')}
            options={POSITIVE_RULE_OPTIONS}
            onChange={(value) => updateWidgetConfig({ positiveRule: value })}
          />
        </FieldConfigRow>
        <FillLimitCheckbox
          label="区间校验"
          checked={Boolean(widgetConfig.rangeValidation)}
          onChange={(checked) => updateWidgetConfig({ rangeValidation: checked })}
        />
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="查看效果" marker="display">
        <FieldConfigRow label="展示方式">
          <CompactSelect
            value={readText(widgetConfig.numberDisplayMode, 'normal')}
            options={NUMBER_DISPLAY_MODE_OPTIONS}
            onChange={(value) => updateWidgetConfig({ numberDisplayMode: value })}
          />
        </FieldConfigRow>
      </FieldConfigSection>
      </>
    );
  };

  const renderDateTimeSections = () => (
    <>
      <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
        {renderFieldIdentitySummary()}
        <FieldConfigRow label="默认值">
          <CompactSelect
            value={readText(widgetConfig.dateDefaultValue, 'empty')}
            options={DATE_DEFAULT_VALUE_OPTIONS}
            onChange={(value) => updateWidgetConfig({ dateDefaultValue: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="提示文本" layout="vertical">
          <CompactTextField
            value={readText(bindings.placeholder)}
            placeholder="显示在选择器内"
            onChange={(value) => updateBinding({ placeholder: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="帮助提示" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.helpText)}
            placeholder="鼠标悬浮说明"
            onChange={(value) => updateBinding({ helpText: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="日期类型">
          <CompactSelect
            value={readText(widgetConfig.dateType, 'datetime')}
            options={DATE_TYPE_OPTIONS}
            onChange={(value) => updateWidgetConfig({ dateType: value })}
          />
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="填写限制" marker="fill-limit">
        {renderFillLimitControls()}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="验证规则" marker="validation">
        <FillLimitCheckbox
          label="时间先后校验"
          checked={Boolean(widgetConfig.timeOrderValidation)}
          onChange={(checked) => updateWidgetConfig({ timeOrderValidation: checked })}
        />
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="查看效果" marker="display">
        <FieldConfigRow label="日期格式" layout="vertical">
          <CompactSelect
            value={readText(widgetConfig.dateFormat, 'YYYY-MM-DD HH:mm:ss')}
            options={DATE_FORMAT_OPTIONS}
            onChange={(value) => updateWidgetConfig({ dateFormat: value })}
          />
        </FieldConfigRow>
        <FillLimitCheckbox
          label="过期置灰"
          checked={Boolean(widgetConfig.expiredMuted)}
          onChange={(checked) => updateWidgetConfig({ expiredMuted: checked })}
        />
      </FieldConfigSection>
    </>
  );

  const renderSignatureSections = () => (
    <>
      <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
        {renderFieldIdentitySummary()}
        <FieldConfigRow label="提示文本" layout="vertical">
          <CompactTextField
            value={readText(bindings.placeholder)}
            placeholder="显示在签名按钮内"
            onChange={(value) => updateBinding({ placeholder: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="帮助提示" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.helpText)}
            placeholder="鼠标悬浮说明"
            onChange={(value) => updateBinding({ helpText: value })}
          />
        </FieldConfigRow>
        <FillLimitCheckbox
          label="允许删除签名"
          checked={Boolean(widgetConfig.allowClear)}
          onChange={(checked) => updateWidgetConfig({ allowClear: checked })}
        />
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="填写限制" marker="fill-limit">
        {renderFillLimitControls()}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="验证规则" marker="validation">
        <FillLimitCheckbox
          label="只允许当前登录人签名"
          checked={Boolean(widgetConfig.currentUserValidation)}
          onChange={(checked) => updateWidgetConfig({ currentUserValidation: checked })}
        />
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="查看效果" marker="display">
        <FieldConfigRow label="展示方式">
          <CompactSelect
            value={readText(widgetConfig.signatureDisplayMode, 'signatureOnly')}
            options={SIGNATURE_DISPLAY_OPTIONS}
            onChange={(value) => updateWidgetConfig({ signatureDisplayMode: value })}
          />
        </FieldConfigRow>
      </FieldConfigSection>
    </>
  );

  const renderAttachmentSections = () => (
    <>
      <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
        {renderFieldIdentitySummary()}
        <FieldConfigRow label="帮助提示" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.helpText)}
            placeholder="鼠标悬浮说明"
            onChange={(value) => updateBinding({ helpText: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="上传策略">
          <CompactSelect
            value={readText(widgetConfig.uploadMode, 'single')}
            options={ATTACHMENT_UPLOAD_MODE_OPTIONS}
            onChange={(value) =>
              updateWidgetConfig({
                uploadMode: value,
                fileCount:
                  value === 'multiple'
                    ? Math.min(9, Math.max(2, readNumber(widgetConfig.fileCount, 2)))
                    : widgetConfig.fileCount,
              })
            }
          />
        </FieldConfigRow>
        <FieldConfigRow label="大小限制">
          <Stack direction="row" spacing={1} alignItems="center">
            <CompactNumberField
              value={readNumber(widgetConfig.fileSize, 30)}
              min={1}
              onChange={(value) => updateWidgetConfig({ fileSize: value })}
            />
            <Typography sx={{ fontSize: 13, lineHeight: '20px', color: '#4e5969', flex: 'none' }}>M</Typography>
          </Stack>
        </FieldConfigRow>
        {readText(widgetConfig.uploadMode, 'single') === 'multiple' ? (
          <FieldConfigRow label="数量限制">
            <CompactNumberField
              value={Math.min(9, Math.max(2, readNumber(widgetConfig.fileCount, 2)))}
              min={2}
              max={9}
              onChange={(value) => updateWidgetConfig({ fileCount: value })}
            />
          </FieldConfigRow>
        ) : null}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="填写限制" marker="fill-limit">
        {renderFillLimitControls()}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="验证规则" marker="validation">
        <FieldConfigRow label="格式限制">
          <CompactSelect
            value={readText(widgetConfig.attachmentFormatLimit, 'all')}
            options={ATTACHMENT_FORMAT_LIMIT_OPTIONS}
            onChange={(value) =>
              updateWidgetConfig({
                attachmentFormatLimit: value,
                previewable: value === 'document' ? Boolean(widgetConfig.previewable) : false,
              })
            }
          />
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="查看效果" marker="display">
        <FieldConfigRow label="展示方式">
          <CompactSelect
            value={readText(widgetConfig.attachmentDisplayMode, 'list')}
            options={ATTACHMENT_DISPLAY_OPTIONS}
            onChange={(value) => updateWidgetConfig({ attachmentDisplayMode: value })}
          />
        </FieldConfigRow>
        {readText(widgetConfig.attachmentFormatLimit, 'all') === 'document' ? (
          <FillLimitCheckbox
            label="预览"
            checked={Boolean(widgetConfig.previewable)}
            onChange={(checked) => updateWidgetConfig({ previewable: checked })}
          />
        ) : null}
        <FillLimitCheckbox
          label="下载"
          checked={Boolean(widgetConfig.downloadable)}
          onChange={(checked) => updateWidgetConfig({ downloadable: checked })}
        />
      </FieldConfigSection>
    </>
  );

  const renderImageSections = () => (
    <>
      <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
        {renderFieldIdentitySummary()}
        <FieldConfigRow label="帮助提示" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.helpText)}
            placeholder="鼠标悬浮说明"
            onChange={(value) => updateBinding({ helpText: value })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="上传策略">
          <CompactSelect
            value={readText(widgetConfig.imageUploadStrategy, 'single')}
            options={IMAGE_UPLOAD_STRATEGY_OPTIONS}
            onChange={(value) =>
              updateWidgetConfig({
                imageUploadStrategy: value,
                imageCount:
                  value === 'multiple'
                    ? Math.min(9, Math.max(2, readNumber(widgetConfig.imageCount, 2)))
                    : widgetConfig.imageCount,
              })
            }
          />
        </FieldConfigRow>
        <FieldConfigRow label="大小限制">
          <Stack direction="row" spacing={1} alignItems="center">
            <CompactNumberField
              value={readNumber(widgetConfig.imageSize, 20)}
              min={1}
              onChange={(value) => updateWidgetConfig({ imageSize: value })}
            />
            <Typography sx={{ fontSize: 13, lineHeight: '20px', color: '#4e5969', flex: 'none' }}>M</Typography>
          </Stack>
        </FieldConfigRow>
        {readText(widgetConfig.imageUploadStrategy, 'single') === 'multiple' ? (
          <FieldConfigRow label="数量限制">
            <CompactNumberField
              value={Math.min(9, Math.max(2, readNumber(widgetConfig.imageCount, 2)))}
              min={2}
              max={9}
              onChange={(value) => updateWidgetConfig({ imageCount: value })}
            />
          </FieldConfigRow>
        ) : null}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="填写限制" marker="fill-limit">
        {renderFillLimitControls()}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="查看效果" marker="display">
        <FieldConfigRow label="展示方式">
          <CompactSelect
            value={readText(widgetConfig.imageDisplayMode, 'thumbnail')}
            options={IMAGE_DISPLAY_OPTIONS}
            onChange={(value) => updateWidgetConfig({ imageDisplayMode: value })}
          />
        </FieldConfigRow>
        <FillLimitCheckbox
          label="放大预览"
          checked={Boolean(widgetConfig.zoomPreview)}
          onChange={(checked) => updateWidgetConfig({ zoomPreview: checked })}
        />
        <FillLimitCheckbox
          label="下载"
          checked={Boolean(widgetConfig.downloadable)}
          onChange={(checked) => updateWidgetConfig({ downloadable: checked })}
        />
      </FieldConfigSection>
    </>
  );

  const renderSingleSelectSections = () => {
    const singleSelectOptionShape = readText(widgetConfig.optionShape, 'select');
    const renderOptionListEditor = () => {
      const optionRows = parseOptionListText(widgetConfig.optionList);
      const updateOptionRows = (rows: string[]) => {
        updateWidgetConfig({ optionList: serializeOptionListRows(rows) });
      };
      const moveOptionRow = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= optionRows.length || toIndex >= optionRows.length) return;
        const nextRows = [...optionRows];
        const [movingRow] = nextRows.splice(fromIndex, 1);
        nextRows.splice(toIndex, 0, movingRow);
        updateOptionRows(nextRows);
      };
      const startOptionRowDrag = (index: number) => {
        draggingOptionIndexRef.current = index;
        setDraggingOptionIndex(index);
      };
      const stopOptionRowDrag = () => {
        draggingOptionIndexRef.current = null;
        setDraggingOptionIndex(null);
      };
      const moveDraggingOptionRow = (targetIndex: number) => {
        const sourceIndex = draggingOptionIndexRef.current;
        if (sourceIndex === null || sourceIndex === targetIndex) return;
        moveOptionRow(sourceIndex, targetIndex);
        draggingOptionIndexRef.current = targetIndex;
        setDraggingOptionIndex(targetIndex);
      };
      const handleOptionListMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        if (draggingOptionIndexRef.current === null) return;
        const targetRow = (event.target as HTMLElement).closest('[data-option-row-index]');
        const targetIndex = Number(targetRow?.getAttribute('data-option-row-index'));
        if (Number.isInteger(targetIndex)) moveDraggingOptionRow(targetIndex);
      };

      return (
        <>
          <Box data-option-list-header="true" sx={optionListHeaderSx}>
            <Typography sx={verticalLabelSx}>选项列表</Typography>
            <Tooltip title="新增选项" arrow>
              <IconButton
                data-option-list-add="true"
                size="small"
                aria-label="新增选项"
                sx={optionIconButtonSx}
                onClick={() => updateOptionRows([...optionRows, `选项${optionRows.length + 1}`])}
              >
                <AddOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Stack
            data-option-list-editor="true"
            onMouseMove={handleOptionListMouseMove}
            onMouseUp={stopOptionRowDrag}
            onMouseLeave={stopOptionRowDrag}
            sx={optionListEditorSx}
          >
            {optionRows.map((optionLabel, index) => {
              const isDefaultOption = readText(bindings.defaultValue) === optionLabel;
              return (
                <Box
                  key={`${index}-${optionRows.length}`}
                  data-option-row="true"
                  data-option-row-index={index}
                  onPointerEnter={() => {
                    moveDraggingOptionRow(index);
                  }}
                  onPointerUp={stopOptionRowDrag}
                  onMouseEnter={() => {
                    moveDraggingOptionRow(index);
                  }}
                  onMouseUp={stopOptionRowDrag}
                  sx={{ ...optionRowSx, opacity: draggingOptionIndex === index ? 0.65 : 1 }}
                >
                  <Box data-option-choice="true" sx={optionChoiceSx}>
                    <DragIndicatorOutlined
                      data-option-drag-handle="true"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        startOptionRowDrag(index);
                      }}
                      onPointerUp={stopOptionRowDrag}
                      onPointerCancel={stopOptionRowDrag}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        startOptionRowDrag(index);
                      }}
                      onMouseUp={stopOptionRowDrag}
                      sx={optionDragHandleSx}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      value={optionLabel}
                      placeholder={`选项${index + 1}`}
                      onChange={(event) => {
                        const nextRows = [...optionRows];
                        nextRows[index] = event.target.value;
                        updateOptionRows(nextRows);
                      }}
                      sx={optionInputSx}
                    />
                    <Tooltip title="设为默认值" arrow>
                      <Box
                        component="button"
                        data-option-default-dot="true"
                        data-option-default-action="true"
                        data-option-default-active={isDefaultOption ? 'true' : undefined}
                        data-option-default-active-marker="true"
                        aria-label="设为默认值"
                        sx={optionDefaultDotSx}
                        onClick={() => updateBinding({ defaultValue: optionLabel })}
                      />
                    </Tooltip>
                  </Box>
                  <Tooltip title="删除选项" arrow>
                    <span>
                      <IconButton
                        size="small"
                        aria-label="删除选项"
                        disabled={optionRows.length <= 1}
                        sx={optionRowIconButtonSx}
                        onClick={() => updateOptionRows(optionRows.filter((_, rowIndex) => rowIndex !== index))}
                      >
                        <RemoveOutlined sx={{ fontSize: 14 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              );
            })}
          </Stack>
        </>
      );
    };

    return (
      <>
        <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
          {renderFieldIdentitySummary()}
          <FieldConfigRow label="提示文本" layout="vertical">
            <CompactTextField
              value={readText(bindings.placeholder)}
              placeholder="显示在选择器内"
              onChange={(value) => updateBinding({ placeholder: value })}
            />
          </FieldConfigRow>
          <FieldConfigRow label="帮助提示" layout="vertical">
            <CompactTextareaField
              value={readText(bindings.helpText)}
              placeholder="鼠标悬浮说明"
              onChange={(value) => updateBinding({ helpText: value })}
            />
          </FieldConfigRow>
          <FieldConfigRow label="展现形态">
            <CompactSelect
              value={singleSelectOptionShape}
              options={SINGLE_SELECT_SHAPE_OPTIONS}
              onChange={(value) => updateWidgetConfig({ optionShape: value })}
            />
          </FieldConfigRow>
          {['radio', 'checkbox'].includes(singleSelectOptionShape) ? (
            <FieldConfigRow label="排序方式">
              <CompactSelect
                value={readText(widgetConfig.optionLayout, 'horizontal')}
                options={OPTION_LAYOUT_OPTIONS}
                onChange={(value) => updateWidgetConfig({ optionLayout: value })}
              />
            </FieldConfigRow>
          ) : null}
          <FieldConfigRow label="选项来源">
            <CompactSelect
              value={readText(widgetConfig.optionSource, 'manual')}
              options={OPTION_SOURCE_OPTIONS}
              onChange={(value) => updateWidgetConfig({ optionSource: value })}
            />
          </FieldConfigRow>
          {readText(widgetConfig.optionSource, 'manual') === 'manual' ? (
            renderOptionListEditor()
          ) : null}
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="填写限制" marker="fill-limit">
          {renderFillLimitControls()}
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="查看效果" marker="display">
          <FieldConfigRow label="显示样式">
            <CompactSelect
              value={readText(widgetConfig.singleSelectDisplayMode, 'sameAsShape')}
              options={SINGLE_SELECT_DISPLAY_OPTIONS}
              onChange={(value) => updateWidgetConfig({ singleSelectDisplayMode: value })}
            />
          </FieldConfigRow>
        </FieldConfigSection>
      </>
    );
  };

  const renderReferenceSections = () => {
    const rawReferenceSourceType = readText(widgetConfig.referenceSourceType, readText(boundField?.typeConfig?.sourceType, 'dictionary'));
    const referenceSourceType = REFERENCE_FUNCTION_DATA_OPTIONS.some((option) => option.value === rawReferenceSourceType)
      ? rawReferenceSourceType
      : 'dictionary';
    const referenceField = readText(widgetConfig.referenceField);
    const referenceDisplayMode = displayMode === 'link' ? 'link' : 'text';
    const referenceSourceFieldOptions = REFERENCE_QUERY_SOURCE_FIELDS[referenceSourceType] ?? REFERENCE_QUERY_SOURCE_FIELDS.dictionary;
    const referenceFieldOptions = [
      { label: '选择引用字段', value: '' },
      ...referenceSourceFieldOptions,
    ];
    const referenceSourceFieldSelectOptions = [
      { label: '引用表中的字段', value: '' },
      ...referenceSourceFieldOptions,
    ];
    const referenceTargetFieldOptions = (document?.model.fields ?? [])
      .filter((field) => field.status === 'enabled' && field.id !== boundFieldId)
      .map((field) => ({
        label: field.name || field.code || field.id,
        value: field.id,
      }));
    const referenceTargetFieldSelectOptions = referenceTargetFieldOptions.length
      ? [{ label: '当前表中的字段', value: '' }, ...referenceTargetFieldOptions]
      : [{ label: '暂无字段', value: '' }];
    const referenceConditions = readReferenceQueryConditions(widgetConfig.referenceQueryConditions);
    const editableConditions = referenceConditions.length ? referenceConditions : [createReferenceQueryCondition()];
    const normalizedReferenceField = referenceFieldOptions.some((option) => option.value === referenceField) ? referenceField : '';
    const updateReferenceConditions = (rows: Array<{ sourceField: string; operator: string; targetFieldId: string }>) => {
      updateWidgetConfig({ referenceQueryConditions: rows });
    };
    const updateReferenceCondition = (
      index: number,
      patch: Partial<{ sourceField: string; operator: string; targetFieldId: string }>,
    ) => {
      const nextRows = editableConditions.map((condition, conditionIndex) => (
        conditionIndex === index ? { ...condition, ...patch } : condition
      ));
      updateReferenceConditions(nextRows);
    };

    return (
      <>
        <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
          {renderFieldIdentitySummary()}
          <FieldConfigRow label="提示文本" layout="vertical">
            <CompactTextField
              value={readText(bindings.placeholder)}
              placeholder="显示在引用控件内"
              onChange={(value) => updateBinding({ placeholder: value })}
            />
          </FieldConfigRow>
          <FieldConfigRow label="帮助提示" layout="vertical">
            <CompactTextareaField
              value={readText(bindings.helpText)}
              placeholder="鼠标悬浮说明"
              onChange={(value) => updateBinding({ helpText: value })}
            />
          </FieldConfigRow>
          <FieldConfigRow label="需要引用的功能数据" layout="vertical">
            <Stack direction="row" spacing={1}>
              <CompactSelect
                value={referenceSourceType}
                options={REFERENCE_FUNCTION_DATA_OPTIONS}
                onChange={(value) =>
                  updateWidgetConfig({
                    referenceSourceType: value,
                    referenceField: '',
                    referenceQueryConditions: [createReferenceQueryCondition()],
                  })
                }
              />
              <CompactSelect
                value={normalizedReferenceField}
                options={referenceFieldOptions}
                onChange={(value) => updateWidgetConfig({ referenceField: value })}
              />
            </Stack>
          </FieldConfigRow>
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="查询条件" marker="reference-query">
          <Box sx={optionListHeaderSx}>
            <Typography sx={verticalLabelSx}>查找条件</Typography>
            <Tooltip title="新增条件" arrow>
              <IconButton
                size="small"
                aria-label="新增条件"
                sx={optionIconButtonSx}
                onClick={() => updateReferenceConditions([...editableConditions, createReferenceQueryCondition()])}
              >
                <AddOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Stack spacing={0.75}>
            {editableConditions.map((condition, index) => (
              <Box
                key={`${index}-${editableConditions.length}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 18px',
                  alignItems: 'center',
                  rowGap: 0.5,
                  gap: 0.75,
                }}
              >
                <CompactSelect
                  value={referenceSourceFieldOptions.some((option) => option.value === condition.sourceField) ? condition.sourceField : ''}
                  options={referenceSourceFieldSelectOptions}
                  onChange={(value) => updateReferenceCondition(index, { sourceField: value })}
                />
                <Tooltip title="删除条件" arrow>
                  <span>
                    <IconButton
                      size="small"
                      aria-label="删除条件"
                      disabled={editableConditions.length <= 1}
                      sx={optionRowIconButtonSx}
                      onClick={() => updateReferenceConditions(editableConditions.filter((_, conditionIndex) => conditionIndex !== index))}
                    >
                      <RemoveOutlined sx={{ fontSize: 14 }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Box sx={{ gridColumn: '1 / 3', minWidth: 0 }}>
                  <CompactSelect
                    value={condition.operator}
                    options={REFERENCE_QUERY_OPERATOR_OPTIONS}
                    onChange={(value) => updateReferenceCondition(index, { operator: value })}
                  />
                </Box>
                <Box sx={{ gridColumn: '1 / 3', minWidth: 0 }}>
                  <CompactSelect
                    value={referenceTargetFieldOptions.some((option) => option.value === condition.targetFieldId) ? condition.targetFieldId : ''}
                    options={referenceTargetFieldSelectOptions}
                    onChange={(value) => updateReferenceCondition(index, { targetFieldId: value })}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="填写限制" marker="fill-limit">
          {renderFillLimitControls()}
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="查看效果" marker="display">
          <FieldConfigRow label="显示样式">
            <CompactSelect
              value={referenceDisplayMode}
              options={REFERENCE_DISPLAY_OPTIONS}
              onChange={(value) => updateBinding({ displayMode: value })}
            />
          </FieldConfigRow>
        </FieldConfigSection>
      </>
    );
  };

  const renderMultiSelectSections = () => {
    const multiSelectOptionShape = readText(widgetConfig.optionShape, 'select');
    const optionRows = parseOptionListText(widgetConfig.optionList);
    const renderOptionListEditor = () => {
      const defaultValues = readMultiDefaultValues(bindings.defaultValue);
      const updateOptionRows = (rows: string[]) => {
        updateWidgetConfig({ optionList: serializeOptionListRows(rows) });
      };
      const toggleMultiSelectDefaultOption = (optionLabel: string) => {
        const nextValues = defaultValues.includes(optionLabel)
          ? defaultValues.filter((item) => item !== optionLabel)
          : [...defaultValues, optionLabel];
        updateBinding({ defaultValue: nextValues });
      };
      const moveOptionRow = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= optionRows.length || toIndex >= optionRows.length) return;
        const nextRows = [...optionRows];
        const [movingRow] = nextRows.splice(fromIndex, 1);
        nextRows.splice(toIndex, 0, movingRow);
        updateOptionRows(nextRows);
      };
      const startOptionRowDrag = (index: number) => {
        draggingOptionIndexRef.current = index;
        setDraggingOptionIndex(index);
      };
      const stopOptionRowDrag = () => {
        draggingOptionIndexRef.current = null;
        setDraggingOptionIndex(null);
      };
      const moveDraggingOptionRow = (targetIndex: number) => {
        const sourceIndex = draggingOptionIndexRef.current;
        if (sourceIndex === null || sourceIndex === targetIndex) return;
        moveOptionRow(sourceIndex, targetIndex);
        draggingOptionIndexRef.current = targetIndex;
        setDraggingOptionIndex(targetIndex);
      };
      const handleOptionListMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        if (draggingOptionIndexRef.current === null) return;
        const targetRow = (event.target as HTMLElement).closest('[data-option-row-index]');
        const targetIndex = Number(targetRow?.getAttribute('data-option-row-index'));
        if (Number.isInteger(targetIndex)) moveDraggingOptionRow(targetIndex);
      };

      return (
        <>
          <Box data-option-list-header="true" sx={optionListHeaderSx}>
            <Typography sx={verticalLabelSx}>选项列表</Typography>
            <Tooltip title="新增选项" arrow>
              <IconButton
                data-option-list-add="true"
                size="small"
                aria-label="新增选项"
                sx={optionIconButtonSx}
                onClick={() => updateOptionRows([...optionRows, `选项${optionRows.length + 1}`])}
              >
                <AddOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Stack
            data-option-list-editor="true"
            onMouseMove={handleOptionListMouseMove}
            onMouseUp={stopOptionRowDrag}
            onMouseLeave={stopOptionRowDrag}
            sx={optionListEditorSx}
          >
            {optionRows.map((optionLabel, index) => {
              const isDefaultOption = defaultValues.includes(optionLabel);
              return (
                <Box
                  key={`${index}-${optionRows.length}`}
                  data-option-row="true"
                  data-option-row-index={index}
                  onPointerEnter={() => {
                    moveDraggingOptionRow(index);
                  }}
                  onPointerUp={stopOptionRowDrag}
                  onMouseEnter={() => {
                    moveDraggingOptionRow(index);
                  }}
                  onMouseUp={stopOptionRowDrag}
                  sx={{ ...optionRowSx, opacity: draggingOptionIndex === index ? 0.65 : 1 }}
                >
                  <Box data-option-choice="true" sx={optionChoiceSx}>
                    <DragIndicatorOutlined
                      data-option-drag-handle="true"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        startOptionRowDrag(index);
                      }}
                      onPointerUp={stopOptionRowDrag}
                      onPointerCancel={stopOptionRowDrag}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        startOptionRowDrag(index);
                      }}
                      onMouseUp={stopOptionRowDrag}
                      sx={optionDragHandleSx}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      value={optionLabel}
                      placeholder={`选项${index + 1}`}
                      onChange={(event) => {
                        const nextRows = [...optionRows];
                        nextRows[index] = event.target.value;
                        updateOptionRows(nextRows);
                      }}
                      sx={optionInputSx}
                    />
                    <Tooltip title="设为默认值" arrow>
                      <Box
                        component="button"
                        data-option-default-dot="true"
                        data-option-default-action="true"
                        data-option-default-active={isDefaultOption ? 'true' : undefined}
                        data-option-default-active-marker="true"
                        aria-label="设为默认值"
                        sx={optionDefaultDotSx}
                        onClick={() => toggleMultiSelectDefaultOption(optionLabel)}
                      />
                    </Tooltip>
                  </Box>
                  <Tooltip title="删除选项" arrow>
                    <span>
                      <IconButton
                        size="small"
                        aria-label="删除选项"
                        disabled={optionRows.length <= 1}
                        sx={optionRowIconButtonSx}
                        onClick={() => updateOptionRows(optionRows.filter((_, rowIndex) => rowIndex !== index))}
                      >
                        <RemoveOutlined sx={{ fontSize: 14 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              );
            })}
          </Stack>
        </>
      );
    };

    return (
      <>
        <FieldConfigSection title="基础信息" marker="basic" action={renderDeleteConfigAction()}>
          {renderFieldIdentitySummary()}
          <FieldConfigRow label="提示文本" layout="vertical">
            <CompactTextField
              value={readText(bindings.placeholder)}
              placeholder="显示在选择器内"
              onChange={(value) => updateBinding({ placeholder: value })}
            />
          </FieldConfigRow>
          <FieldConfigRow label="帮助提示" layout="vertical">
            <CompactTextareaField
              value={readText(bindings.helpText)}
              placeholder="鼠标悬浮说明"
              onChange={(value) => updateBinding({ helpText: value })}
            />
          </FieldConfigRow>
          <FieldConfigRow label="展现形态">
            <CompactSelect
              value={multiSelectOptionShape}
              options={SINGLE_SELECT_SHAPE_OPTIONS}
              onChange={(value) => updateWidgetConfig({ optionShape: value })}
            />
          </FieldConfigRow>
          {['radio', 'checkbox'].includes(multiSelectOptionShape) ? (
            <FieldConfigRow label="排序方式">
              <CompactSelect
                value={readText(widgetConfig.optionLayout, 'horizontal')}
                options={OPTION_LAYOUT_OPTIONS}
                onChange={(value) => updateWidgetConfig({ optionLayout: value })}
              />
            </FieldConfigRow>
          ) : null}
          <FieldConfigRow label="选项来源">
            <CompactSelect
              value={readText(widgetConfig.optionSource, 'manual')}
              options={OPTION_SOURCE_OPTIONS}
              onChange={(value) => updateWidgetConfig({ optionSource: value })}
            />
          </FieldConfigRow>
          {readText(widgetConfig.optionSource, 'manual') === 'manual' ? (
            renderOptionListEditor()
          ) : null}
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="填写限制" marker="fill-limit">
          {renderFillLimitControls()}
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="验证规则" marker="validation">
          <FillLimitCheckbox
            label="选择数量校验"
            checked={Boolean(widgetConfig.selectCountValidation)}
            onChange={(checked) =>
              updateWidgetConfig(
                checked
                  ? { selectCountValidation: true, minSelectCount: 2, maxSelectCount: optionRows.length }
                  : { selectCountValidation: false },
              )
            }
          />
          {Boolean(widgetConfig.selectCountValidation) ? (
            <FieldConfigRow label="最小选择数 / 最大选择数" layout="vertical">
              <Stack direction="row" spacing={1}>
                <CompactNumberField
                  value={readNumber(widgetConfig.minSelectCount, 2)}
                  min={0}
                  onChange={(value) => updateWidgetConfig({ minSelectCount: value })}
                />
                <CompactNumberField
                  value={readNumber(widgetConfig.maxSelectCount, optionRows.length)}
                  min={0}
                  onChange={(value) => updateWidgetConfig({ maxSelectCount: value })}
                />
              </Stack>
            </FieldConfigRow>
          ) : null}
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="查看效果" marker="display">
          <FieldConfigRow label="显示样式">
            <CompactSelect
              value={readText(widgetConfig.multiSelectDisplayMode, 'sameAsShape')}
              options={MULTI_SELECT_DISPLAY_OPTIONS}
              onChange={(value) => updateWidgetConfig({ multiSelectDisplayMode: value })}
            />
          </FieldConfigRow>
        </FieldConfigSection>
      </>
    );
  };

  const renderSubTableGroupSections = () => {
    const region = bindings.subTableRegion;
    const groupRange = region?.recordTemplate.groupRange;
    if (!region || !groupRange) return null;

    const groupDirectionLabel = region.recordTemplate.direction === 'column' ? '按列填报' : '按行填报';
    const groupSpan = region.recordTemplate.direction === 'column'
      ? groupRange.r - groupRange.l + 1
      : groupRange.b - groupRange.t + 1;
    const repeatSummary = region.repeat.type === 'fixed'
      ? `${region.repeat.count} 组`
      : '动态新增';

    return (
      <>
        <FieldConfigSection title="分组配置" marker="sub-table-group" action={renderDeleteConfigAction()}>
          {renderSubTableGroupIdentitySummary()}
          <FieldConfigRow label="分组范围" layout="vertical">
            <CompactDisabledField value={`第 ${groupRange.t}-${groupRange.b} 行 / 第 ${groupRange.l}-${groupRange.r} 列`} />
          </FieldConfigRow>
          <FieldConfigRow label="分组方向">
            <CompactDisabledField value={groupDirectionLabel} />
          </FieldConfigRow>
          <FieldConfigRow label="重复数量">
            <CompactDisabledField value={repeatSummary} />
          </FieldConfigRow>
          <FieldConfigRow label="单组跨度">
            <CompactDisabledField value={`${groupSpan} ${region.recordTemplate.direction === 'column' ? '列' : '行'}`} />
          </FieldConfigRow>
        </FieldConfigSection>
      </>
    );
  };

  const renderSubTableRegionSections = () => {
    const region = bindings.subTableRegion;
    if (!region) return null;

    const updateRegion = updateSelectedSubTableRegion;
    const repeatType = region.repeat.type;

    return (
      <>
        <FieldConfigSection title="基础信息" marker="sub-table-basic" action={renderDeleteConfigAction()}>
          {renderFieldIdentitySummary()}
          <FieldConfigRow label="子表类型">
            <CompactSelect
              value={repeatType}
              options={SUB_TABLE_REPEAT_OPTIONS}
              onChange={(value) => {
                if (value === 'dynamic') {
                  updateRegion({
                    repeat: {
                      type: 'dynamic',
                      minCount: 0,
                      maxCount: 50,
                      addPosition: 'bottom',
                      allowRemove: true,
                      removeConfirm: true,
                    },
                    recordTemplate: {
                      ...region.recordTemplate,
                      direction: 'row',
                    },
                  });
                  return;
                }
                updateRegion({
                  repeat: {
                    type: 'fixed',
                    count: region.repeat.type === 'fixed' ? region.repeat.count : 1,
                    stride: region.repeat.type === 'fixed' ? region.repeat.stride : 1,
                  },
                });
              }}
            />
          </FieldConfigRow>
          <FillLimitCheckbox
            label="展示表头"
            checked={region.presentation.showHeader}
            onChange={(checked) => setSelectedSubTableHeaderVisible(checked)}
          />
        </FieldConfigSection>

        <Divider />

        <FieldConfigSection title="结构设置" marker="sub-table-structure">
          <FieldConfigRow label="填报方向">
            <CompactSelect
              value={region.recordTemplate.direction}
              options={SUB_TABLE_DIRECTION_OPTIONS}
              onChange={(value) => {
                const direction = value === 'column' ? 'column' : 'row';
                updateRegion({
                  recordTemplate: {
                    ...region.recordTemplate,
                    direction: repeatType === 'dynamic' ? 'row' : direction,
                  },
                });
              }}
            />
          </FieldConfigRow>
        </FieldConfigSection>

        {region.repeat.type === 'dynamic' ? (
          <>
            <Divider />

            <FieldConfigSection title="动态设置" marker="sub-table-dynamic">
              <FieldConfigRow label="最小数量">
                <CompactNumberField
                  value={region.repeat.minCount}
                  min={0}
                  onChange={(value) => updateRegion({
                    repeat: {
                      type: 'dynamic',
                      minCount: Math.max(0, value),
                      maxCount: region.repeat.type === 'dynamic' ? region.repeat.maxCount : 50,
                      addPosition: 'bottom',
                      allowRemove: region.repeat.type === 'dynamic' ? region.repeat.allowRemove : true,
                      removeConfirm: true,
                    },
                  })}
                />
              </FieldConfigRow>
              <FieldConfigRow label="最大数量">
                <CompactNumberField
                  value={region.repeat.maxCount ?? 50}
                  min={1}
                  onChange={(value) => updateRegion({
                    repeat: {
                      type: 'dynamic',
                      minCount: region.repeat.type === 'dynamic' ? region.repeat.minCount : 0,
                      maxCount: Math.max(1, value),
                      addPosition: 'bottom',
                      allowRemove: region.repeat.type === 'dynamic' ? region.repeat.allowRemove : true,
                      removeConfirm: true,
                    },
                  })}
                />
              </FieldConfigRow>
              <FillLimitCheckbox
                label="允许删除记录"
                checked={region.repeat.allowRemove}
                onChange={(checked) => updateRegion({
                  repeat: {
                    type: 'dynamic',
                    minCount: region.repeat.type === 'dynamic' ? region.repeat.minCount : 0,
                    maxCount: region.repeat.type === 'dynamic' ? region.repeat.maxCount : 50,
                    addPosition: 'bottom',
                    allowRemove: checked,
                    removeConfirm: true,
                  },
                })}
              />
              <FieldConfigRow label="新增入口">
                <CompactSelect
                  value={region.presentation.addEntry}
                  options={SUB_TABLE_ADD_ENTRY_OPTIONS}
                  onChange={(value) => {
                    const addEntry = value === 'contextMenu' || value === 'both' ? value : 'bottom';
                    updateRegion({
                      presentation: {
                        ...region.presentation,
                        addEntry,
                      },
                    });
                  }}
                />
              </FieldConfigRow>
            </FieldConfigSection>
          </>
        ) : null}
      </>
    );
  };

  const renderFieldSections = () => {
    if (selectedNode.type === 'sub-table' && fieldType === 'subTable') {
      if (selectedSubTableGroupNodeId === selectedNode.id) {
        return renderSubTableGroupSections();
      }
      return renderSubTableRegionSections();
    }

    switch (fieldType) {
      case 'number':
        return renderNumberSections();
      case 'datetime':
        return renderDateTimeSections();
      case 'signature':
        return renderSignatureSections();
      case 'attachment':
        return renderAttachmentSections();
      case 'image':
        return renderImageSections();
      case 'singleSelect':
        return renderSingleSelectSections();
      case 'reference':
        return renderReferenceSections();
      case 'multiSelect':
        return renderMultiSelectSections();
      default:
        return renderTextSections();
    }
  };

  return (
    <Stack
      spacing={1.75}
      sx={{
        p: 2,
        overflowY: 'auto',
        overflowX: 'hidden',
        bgcolor: '#fff',
        userSelect: 'none',
        '& .MuiInputBase-input': {
          userSelect: 'text',
        },
        '& input, & textarea': {
          userSelect: 'text',
        },
      }}
    >
      {renderFieldSections()}
    </Stack>
  );
}
