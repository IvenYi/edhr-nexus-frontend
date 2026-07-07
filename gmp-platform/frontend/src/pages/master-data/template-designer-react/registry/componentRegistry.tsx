import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type {
  CanvasNode,
  DesignerComponentDefinition,
  DesignerRendererProps,
  ModelField,
  PropertySchemaItem,
} from '../types';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

const FIELD_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'label', label: '显示名称', editor: 'text', defaultValue: '' },
  { key: 'placeholder', label: '占位文案', editor: 'text', defaultValue: '' },
  { key: 'width', label: '宽度', editor: 'number', defaultValue: 240 },
];

const CONTAINER_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'title', label: '标题', editor: 'text', defaultValue: '' },
];

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseFieldOptions(field?: ModelField | null) {
  if (!field?.optionsText?.trim()) return [];
  return field.optionsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [rawLabel, rawValue] = line.split(':');
      const resolvedLabel = rawLabel?.trim() || `选项${index + 1}`;
      const resolvedValue = rawValue?.trim() || resolvedLabel;
      return {
        key: `${field.id}:${index}`,
        label: resolvedLabel,
        value: resolvedValue || `option_${index + 1}`,
      };
    });
}

function useBoundField(node: CanvasNode) {
  const document = useTemplateDesignerStore((state) => state.document);
  return document?.model.fields.find((field) => field.id === node.bindings?.fieldId) ?? null;
}

function BasicRenderer({ node, selected, onSelect }: DesignerRendererProps) {
  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: selected ? '2px solid #1976d2' : '1px solid #d0d7e2',
        bgcolor: '#fff',
        cursor: 'pointer',
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#303133' }}>
        {String(node.props.label || node.props.title || node.type)}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#909399' }}>{node.type}</Typography>
    </Box>
  );
}

function FieldPreviewRenderer({ node, selected, onSelect }: DesignerRendererProps) {
  const field = useBoundField(node);
  const options = parseFieldOptions(field);
  const label = String(field?.name || node.props.label || node.type);
  const placeholder = String(field?.placeholder || node.props.placeholder || '');
  const commonSx = {
    p: 1.5,
    borderRadius: 1,
    border: selected ? '2px solid #1976d2' : '1px solid #d0d7e2',
    bgcolor: '#fff',
    cursor: 'pointer',
  };

  const renderControl = () => {
    switch (node.type) {
      case 'textarea':
        return <TextField fullWidth size="small" label={label} placeholder={placeholder} multiline minRows={3} />;
      case 'inputnumber':
      case 'inputdouble':
        return <TextField fullWidth size="small" type="number" label={label} placeholder={placeholder} />;
      case 'select':
        return (
          <TextField select fullWidth size="small" label={label} value="">
            {options.map((option) => (
              <MenuItem key={option.key} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        );
      case 'radio':
        return (
          <Stack spacing={0.5}>
            <Typography sx={{ fontSize: 13, color: '#606266' }}>{label}</Typography>
            <RadioGroup row>
              {options.map((option) => (
                <FormControlLabel key={option.key} value={option.value} control={<Radio size="small" />} label={option.label} />
              ))}
            </RadioGroup>
          </Stack>
        );
      case 'checkbox':
        return (
          <Stack spacing={0.5}>
            <Typography sx={{ fontSize: 13, color: '#606266' }}>{label}</Typography>
            <Stack direction="row" spacing={1}>
              {options.map((option) => (
                <FormControlLabel key={option.key} control={<Checkbox size="small" />} label={option.label} />
              ))}
            </Stack>
          </Stack>
        );
      case 'switch':
        return <FormControlLabel control={<Switch size="small" />} label={label} />;
      case 'readonlycmp':
        return <Typography sx={{ fontSize: 13, color: '#303133' }}>{label}</Typography>;
      default:
        return <TextField fullWidth size="small" label={label} placeholder={placeholder} />;
    }
  };

  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      sx={commonSx}
    >
      {renderControl()}
      {field ? (
        <Typography sx={{ mt: 1, fontSize: 11, color: '#909399' }}>
          绑定字段: {field.code || field.id}
        </Typography>
      ) : null}
    </Box>
  );
}

function ContainerRenderer({ node, selected, onSelect }: DesignerRendererProps) {
  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: selected ? '2px solid #1976d2' : '1px dashed #c0c7d1',
        bgcolor: '#fcfcfd',
        cursor: 'pointer',
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#303133' }}>
        {String(node.props.title || node.props.label || node.type)}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#909399' }}>{node.type}</Typography>
    </Box>
  );
}

function createFieldComponentDefinition(type: string, label: string): DesignerComponentDefinition {
  return {
    type,
    label,
    category: 'field',
    propSchema: FIELD_PROP_SCHEMA,
    createDefaultNode: () => ({
      id: createId(type),
      type,
      parentId: null,
      children: [],
      props: {
        label,
        placeholder: '',
        width: 240,
      },
      style: {},
      bindings: {},
    }),
    renderDesigner: FieldPreviewRenderer,
  };
}

function createContainerDefinition(type: string, label: string): DesignerComponentDefinition {
  return {
    type,
    label,
    category: type === 'sub-table' ? 'container' : 'layout',
    propSchema: CONTAINER_PROP_SCHEMA,
    createDefaultNode: () => ({
      id: createId(type),
      type,
      parentId: null,
      children: [],
      props: {
        title: label,
      },
      style: {},
      bindings: {},
    }),
    renderDesigner: ContainerRenderer,
  };
}

export const componentRegistry: DesignerComponentDefinition[] = [
  createFieldComponentDefinition('input', '输入框'),
  createFieldComponentDefinition('textarea', '文本域'),
  createFieldComponentDefinition('inputnumber', '整数框'),
  createFieldComponentDefinition('inputdouble', '小数框'),
  createFieldComponentDefinition('radio', '单选框'),
  createFieldComponentDefinition('checkbox', '复选框'),
  createFieldComponentDefinition('select', '下拉框'),
  createFieldComponentDefinition('switch', '开关'),
  createFieldComponentDefinition('datepicker', '日期'),
  createFieldComponentDefinition('datetimepicker', '日期时间'),
  createFieldComponentDefinition('timepicker', '时间'),
  createFieldComponentDefinition('userpicker', '人员选择'),
  createFieldComponentDefinition('department', '部门选择'),
  createFieldComponentDefinition('readonlycmp', '只读文本'),
  createContainerDefinition('form', '表单容器'),
  createContainerDefinition('grid', '栅格'),
  createContainerDefinition('grid-col', '栅格列'),
  createContainerDefinition('layout-container', '布局容器'),
  createContainerDefinition('left-right-columns', '左右布局'),
  createContainerDefinition('tabs', '标签页'),
  createContainerDefinition('divider', '分割线'),
  createContainerDefinition('sub-table', '子表'),
  createContainerDefinition('button-container', '按钮容器'),
  createContainerDefinition('bottom-button-container', '底部按钮容器'),
];

export function getComponentDefinition(type: string) {
  return componentRegistry.find((component) => component.type === type) ?? componentRegistry[0];
}
