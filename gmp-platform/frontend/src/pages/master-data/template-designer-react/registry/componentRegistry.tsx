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
import type { MouseEvent } from 'react';
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
  {
    key: 'emptySymbol',
    label: '空值占位符',
    editor: 'select',
    defaultValue: '',
    options: [
      { label: '跟随默认', value: '' },
      { label: '/', value: '/' },
      { label: '--', value: '--' },
      { label: '——', value: '——' },
      { label: 'NA', value: 'NA' },
      { label: 'N/A', value: 'N/A' },
    ],
  },
  { key: 'required', label: '必填', editor: 'switch', defaultValue: false },
  { key: 'disabled', label: '禁用', editor: 'switch', defaultValue: false },
  {
    key: 'viewState',
    label: '查看态渲染',
    editor: 'select',
    defaultValue: 'auto',
    options: [
      { label: '只读', value: 'readonly' },
      { label: '禁用', value: 'disabled' },
      { label: '跟随设计', value: 'auto' },
    ],
  },
  { key: 'prefix', label: '前缀', editor: 'text', defaultValue: '' },
  { key: 'suffix', label: '后缀', editor: 'text', defaultValue: '' },
];

const CONTAINER_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'title', label: '标题', editor: 'text', defaultValue: '' },
];

const FIELD_STYLE_SCHEMA: PropertySchemaItem[] = [
  { key: 'compWidth', label: '组件宽度', editor: 'number', defaultValue: 240 },
  { key: 'compHeight', label: '组件高度', editor: 'number', defaultValue: 0 },
];

const TEXT_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'maxLength', label: '最大长度', editor: 'number', defaultValue: 200 },
];

const TEXTAREA_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'maxLength', label: '最大长度', editor: 'number', defaultValue: 500 },
  { key: 'rows', label: '默认行数', editor: 'number', defaultValue: 3 },
];

const NUMBER_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'min', label: '最小值', editor: 'number', defaultValue: 0 },
  { key: 'max', label: '最大值', editor: 'number', defaultValue: 999999 },
  { key: 'step', label: '步长', editor: 'number', defaultValue: 1 },
];

const DOUBLE_PROP_SCHEMA: PropertySchemaItem[] = [
  ...NUMBER_PROP_SCHEMA,
  { key: 'precision', label: '小数精度', editor: 'number', defaultValue: 2 },
];

const OPTION_PROP_SCHEMA: PropertySchemaItem[] = [
  {
    key: 'optionLayout',
    label: '选项布局',
    editor: 'select',
    defaultValue: 'row',
    options: [
      { label: '横向', value: 'row' },
      { label: '纵向', value: 'column' },
    ],
  },
];

const DATE_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'format', label: '显示格式', editor: 'text', defaultValue: 'YYYY-MM-DD' },
];

const DATETIME_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'format', label: '显示格式', editor: 'text', defaultValue: 'YYYY-MM-DD HH:mm:ss' },
];

const TIME_PROP_SCHEMA: PropertySchemaItem[] = [
  { key: 'format', label: '显示格式', editor: 'text', defaultValue: 'HH:mm:ss' },
];

const CONTAINER_STYLE_SCHEMA: PropertySchemaItem[] = [
  { key: 'compWidth', label: '组件宽度', editor: 'number', defaultValue: 0 },
  { key: 'compHeight', label: '组件高度', editor: 'number', defaultValue: 0 },
];

const ABSOLUTE_NODE_STYLE_SCHEMA: PropertySchemaItem[] = [
  { key: 'compLeft', label: '左偏移', editor: 'number', defaultValue: 0 },
  { key: 'compTop', label: '上偏移', editor: 'number', defaultValue: 0 },
  { key: 'compWidth', label: '组件宽度', editor: 'number', defaultValue: 240 },
  { key: 'compHeight', label: '组件高度', editor: 'number', defaultValue: 40 },
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

function resolveNodeLayout(node: CanvasNode) {
  const compWidth = Number(node.style.compWidth ?? 0);
  const compHeight = Number(node.style.compHeight ?? 0);

  return {
    width: compWidth > 0 ? compWidth : '100%',
    minHeight: compHeight > 0 ? compHeight : undefined,
  };
}

function resolveStaticTextBoxStyle(node: CanvasNode): Record<string, string | number | undefined> {
  return {
    fontSize: typeof node.style.fontSize === 'number' ? `${node.style.fontSize}px` : (node.style.fontSize as string | undefined),
    fontWeight: node.style.fontWeight as string | undefined,
    fontStyle: node.style.fontStyle as string | undefined,
    textDecoration: node.style.textDecoration as string | undefined,
    color: String(node.style.color ?? '#1f2937'),
    textAlign: (node.style.textAlign as string | undefined) ?? 'left',
  };
}

function BasicRenderer({ node, selected, onSelect }: DesignerRendererProps) {
  return (
    <Box
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        onSelect();
      }}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: selected ? '2px solid #1976d2' : '1px solid #d0d7e2',
        bgcolor: '#fff',
        cursor: 'pointer',
        ...resolveNodeLayout(node),
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
  const emptySymbol = String(node.props.emptySymbol || '');
  const prefix = String(node.props.prefix || '');
  const suffix = String(node.props.suffix || '');
  const format = String(node.props.format || '');
  const disabled = Boolean(node.props.disabled) || node.props.viewState === 'disabled';
  const readonly = Boolean(node.props.readonly) || node.props.viewState === 'readonly';
  const optionLayout = String(node.props.optionLayout || 'row');
  const commonSx = {
    p: 1.5,
    borderRadius: 1,
    border: selected ? '2px solid #1976d2' : '1px solid #d0d7e2',
    bgcolor: '#fff',
    cursor: 'pointer',
    ...resolveNodeLayout(node),
  };

  const renderControl = () => {
    switch (node.type) {
      case 'textarea':
        return (
          <TextField
            fullWidth
            size="small"
            label={label}
            placeholder={placeholder}
            multiline
            minRows={Number(node.props.rows ?? 3)}
            disabled={disabled}
            InputProps={{ readOnly: readonly }}
            inputProps={{ maxLength: Number(node.props.maxLength ?? 500) }}
          />
        );
      case 'inputnumber':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            InputProps={{ readOnly: readonly }}
            inputProps={{
              min: Number(node.props.min ?? 0),
              max: Number(node.props.max ?? 999999),
              step: Number(node.props.step ?? 1),
            }}
          />
        );
      case 'inputdouble':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            InputProps={{ readOnly: readonly }}
            inputProps={{
              min: Number(node.props.min ?? 0),
              max: Number(node.props.max ?? 999999),
              step: Number(node.props.step ?? 0.01),
            }}
          />
        );
      case 'datepicker':
      case 'datetimepicker':
      case 'timepicker':
        return (
          <TextField
            fullWidth
            size="small"
            label={label}
            placeholder={format || placeholder}
            disabled={disabled}
            InputProps={{ readOnly: true }}
          />
        );
      case 'select':
        return (
          <TextField select fullWidth size="small" label={label} value="" disabled={disabled} InputProps={{ readOnly: readonly }}>
            {(options.length ? options : [{ key: 'empty', label: emptySymbol || '未配置选项', value: '' }]).map((option) => (
              <MenuItem key={option.key} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        );
      case 'radio':
        return (
          <Stack spacing={0.5}>
            <Typography sx={{ fontSize: 13, color: '#606266' }}>{label}</Typography>
            <RadioGroup row={optionLayout !== 'column'}>
              {(options.length ? options : [{ key: 'empty', label: emptySymbol || '未配置选项', value: '' }]).map((option) => (
                <FormControlLabel key={option.key} value={option.value} control={<Radio size="small" disabled={disabled} />} label={option.label} />
              ))}
            </RadioGroup>
          </Stack>
        );
      case 'checkbox':
        return (
          <Stack spacing={0.5}>
            <Typography sx={{ fontSize: 13, color: '#606266' }}>{label}</Typography>
            <Stack direction={optionLayout === 'column' ? 'column' : 'row'} spacing={1}>
              {(options.length ? options : [{ key: 'empty', label: emptySymbol || '未配置选项', value: '' }]).map((option) => (
                <FormControlLabel key={option.key} control={<Checkbox size="small" disabled={disabled} />} label={option.label} />
              ))}
            </Stack>
          </Stack>
        );
      case 'switch':
        return <FormControlLabel control={<Switch size="small" disabled={disabled} />} label={label} />;
      case 'readonlycmp':
        return <Typography sx={{ fontSize: 13, color: '#303133' }}>{label}</Typography>;
      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            InputProps={{ readOnly: readonly }}
            inputProps={{ maxLength: Number(node.props.maxLength ?? 200) || undefined }}
          />
        );
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
      {prefix || suffix ? (
        <Typography sx={{ mt: 1, fontSize: 11, color: '#909399' }}>
          {prefix ? `前缀: ${prefix}` : ''}
          {prefix && suffix ? ' / ' : ''}
          {suffix ? `后缀: ${suffix}` : ''}
        </Typography>
      ) : null}
      {format ? (
        <Typography sx={{ mt: 0.5, fontSize: 11, color: '#909399' }}>
          格式: {format}
        </Typography>
      ) : null}
      {node.type === 'inputdouble' ? (
        <Typography sx={{ mt: 0.5, fontSize: 11, color: '#909399' }}>
          精度: {String(node.props.precision ?? 2)}
        </Typography>
      ) : null}
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
        ...resolveNodeLayout(node),
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#303133' }}>
        {String(node.props.title || node.props.label || node.type)}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#909399' }}>{node.type}</Typography>
    </Box>
  );
}

function StaticTextRenderer({ node, selected, onSelect }: DesignerRendererProps) {
  const hasBorder = Boolean(node.props.hasBorder);
  const backgroundColor = String(node.props.backgroundColor ?? '');

  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      sx={{
        width: '100%',
        height: '100%',
        p: 1,
        borderRadius: 0.75,
        border: selected
          ? '2px solid #1976d2'
          : hasBorder
            ? '1px solid #d7dee8'
            : '1px solid transparent',
        bgcolor: backgroundColor || '#fff',
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        display: 'flex',
        alignItems: node.style.verticalAlign === 'bottom' ? 'flex-end' : node.style.verticalAlign === 'middle' ? 'center' : 'flex-start',
        justifyContent: node.style.textAlign === 'right' ? 'flex-end' : node.style.textAlign === 'center' ? 'center' : 'flex-start',
        ...resolveStaticTextBoxStyle(node),
      }}
    >
      {String(node.props.text ?? '')}
    </Box>
  );
}

function StaticImageRenderer({ node, selected, onSelect }: DesignerRendererProps) {
  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 0.75,
        border: selected ? '2px solid #1976d2' : '1px solid #d7dee8',
        bgcolor: '#fff',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <Box
        component="img"
        src={String(node.props.src ?? '')}
        alt={String(node.props.alt ?? '导入图片')}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          bgcolor: '#fff',
        }}
      />
    </Box>
  );
}

function createFieldComponentDefinition(
  type: string,
  label: string,
  extraPropSchema: PropertySchemaItem[] = [],
  extraProps: Record<string, unknown> = {},
): DesignerComponentDefinition {
  return {
    type,
    label,
    category: 'field',
    propSchema: [...FIELD_PROP_SCHEMA, ...extraPropSchema],
    styleSchema: FIELD_STYLE_SCHEMA,
    createDefaultNode: () => ({
      id: createId(type),
      type,
      parentId: null,
      children: [],
      props: {
        label,
        placeholder: '',
        emptySymbol: '',
        required: false,
        disabled: false,
        viewState: 'auto',
        prefix: '',
        suffix: '',
        ...extraProps,
      },
      style: {
        compWidth: 240,
        compHeight: 0,
      },
      bindings: {},
    }),
    renderDesigner: FieldPreviewRenderer,
  };
}

function createContainerDefinition(type: string, label: string): DesignerComponentDefinition {
  const createDefaultNode = () => {
    const node: CanvasNode = {
      id: createId(type),
      type,
      parentId: null,
      children: [],
      props: {
        title: label,
      },
      style: {},
      bindings: {},
    };

    if (type === 'tabs') {
      node.children = [
        {
          id: createId('tab-pane'),
          type: 'layout-container',
          parentId: node.id,
          children: [],
          props: { title: '标签页 1' },
          style: {},
          bindings: {},
        },
        {
          id: createId('tab-pane'),
          type: 'layout-container',
          parentId: node.id,
          children: [],
          props: { title: '标签页 2' },
          style: {},
          bindings: {},
        },
      ];
    }

    if (type === 'grid') {
      node.children = [
        {
          id: createId('grid-col'),
          type: 'grid-col',
          parentId: node.id,
          children: [],
          props: { title: '列 1' },
          style: {},
          bindings: {},
        },
        {
          id: createId('grid-col'),
          type: 'grid-col',
          parentId: node.id,
          children: [],
          props: { title: '列 2' },
          style: {},
          bindings: {},
        },
      ];
    }

    if (type === 'left-right-columns') {
      node.children = [
        {
          id: createId('layout-container'),
          type: 'layout-container',
          parentId: node.id,
          children: [],
          props: { title: '左列' },
          style: {},
          bindings: {},
        },
        {
          id: createId('layout-container'),
          type: 'layout-container',
          parentId: node.id,
          children: [],
          props: { title: '右列' },
          style: {},
          bindings: {},
        },
      ];
    }

    return node;
  };

  return {
    type,
    label,
    category: type === 'sub-table' ? 'container' : 'layout',
    propSchema: CONTAINER_PROP_SCHEMA,
    styleSchema: CONTAINER_STYLE_SCHEMA,
    createDefaultNode,
    renderDesigner: ContainerRenderer,
  };
}

export const componentRegistry: DesignerComponentDefinition[] = [
  createFieldComponentDefinition('input', '输入框', TEXT_PROP_SCHEMA, { maxLength: 200 }),
  createFieldComponentDefinition('textarea', '文本域', TEXTAREA_PROP_SCHEMA, { maxLength: 500, rows: 3 }),
  createFieldComponentDefinition('inputnumber', '整数框', NUMBER_PROP_SCHEMA, { min: 0, max: 999999, step: 1 }),
  createFieldComponentDefinition('inputdouble', '小数框', DOUBLE_PROP_SCHEMA, { min: 0, max: 999999, step: 0.01, precision: 2 }),
  createFieldComponentDefinition('radio', '单选框', OPTION_PROP_SCHEMA, { optionLayout: 'row' }),
  createFieldComponentDefinition('checkbox', '复选框', OPTION_PROP_SCHEMA, { optionLayout: 'row' }),
  createFieldComponentDefinition('select', '下拉框'),
  createFieldComponentDefinition('switch', '开关'),
  createFieldComponentDefinition('datepicker', '日期', DATE_PROP_SCHEMA, { format: 'YYYY-MM-DD' }),
  createFieldComponentDefinition('datetimepicker', '日期时间', DATETIME_PROP_SCHEMA, { format: 'YYYY-MM-DD HH:mm:ss' }),
  createFieldComponentDefinition('timepicker', '时间', TIME_PROP_SCHEMA, { format: 'HH:mm:ss' }),
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
  {
    type: 'static-text',
    label: '静态文本',
    category: 'layout',
    propSchema: [
      { key: 'text', label: '文本内容', editor: 'textarea', defaultValue: '' },
      { key: 'hasBorder', label: '显示边框', editor: 'switch', defaultValue: false },
      { key: 'backgroundColor', label: '背景色', editor: 'text', defaultValue: '' },
    ],
    styleSchema: ABSOLUTE_NODE_STYLE_SCHEMA,
    createDefaultNode: () => ({
      id: createId('static-text'),
      type: 'static-text',
      parentId: null,
      children: [],
      props: {
        text: '静态文本',
        hasBorder: false,
        backgroundColor: '',
      },
      style: {
        position: 'absolute',
        compLeft: 0,
        compTop: 0,
        compWidth: 240,
        compHeight: 40,
      },
      bindings: {},
    }),
    renderDesigner: StaticTextRenderer,
  },
  {
    type: 'static-image',
    label: '静态图片',
    category: 'layout',
    propSchema: [
      { key: 'src', label: '图片地址', editor: 'text', defaultValue: '' },
      { key: 'alt', label: '替代文本', editor: 'text', defaultValue: '导入图片' },
    ],
    styleSchema: ABSOLUTE_NODE_STYLE_SCHEMA,
    createDefaultNode: () => ({
      id: createId('static-image'),
      type: 'static-image',
      parentId: null,
      children: [],
      props: {
        src: '',
        alt: '导入图片',
      },
      style: {
        position: 'absolute',
        compLeft: 0,
        compTop: 0,
        compWidth: 240,
        compHeight: 160,
      },
      bindings: {},
    }),
    renderDesigner: StaticImageRenderer,
  },
];

export function getComponentDefinition(type: string) {
  return componentRegistry.find((component) => component.type === type) ?? componentRegistry[0];
}
