import AddOutlined from '@mui/icons-material/AddOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import {
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
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
  const fieldTypeConfig = field ? field.typeConfig : {};
  const options = fieldTypeConfig.options;
  if (Array.isArray(options)) {
    return options
      .filter((option) => option && typeof option === 'object')
      .map((option, index) => {
        const typedOption = option as { id?: string; label?: string; value?: string; status?: string };
        return {
          key: typedOption.id || `${field?.id ?? 'field'}:${index}`,
          label: typedOption.label || `选项${index + 1}`,
          value: typedOption.value || typedOption.label || `option_${index + 1}`,
        };
      });
  }

  if (typeof options !== 'string' || !options.trim()) return [];
  return options
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [rawLabel, rawValue] = line.split(':');
      const resolvedLabel = rawLabel?.trim() || `选项${index + 1}`;
      const resolvedValue = rawValue?.trim() || resolvedLabel;
      return {
        key: `${field?.id ?? 'field'}:${index}`,
        label: resolvedLabel,
        value: resolvedValue || `option_${index + 1}`,
      };
    });
}

function useBoundField(node: CanvasNode) {
  const document = useTemplateDesignerStore((state) => state.document);
  if (node.bindings?.subTableField) return node.bindings.subTableField;
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

function FieldPreviewRenderer({
  node,
  selected,
  onSelect,
  onCellMouseDown,
  onCellContextMenu,
  renderMode = 'normal',
}: DesignerRendererProps) {
  const field = useBoundField(node);
  const isCellMode = renderMode === 'cell';
  const options = parseFieldOptions(field);
  const widgetConfig = node.bindings?.widgetConfig ?? {};
  const readConfig = (key: string, fallback: unknown = '') => widgetConfig[key] ?? node.props[key] ?? fallback;
  const label = String(node.bindings?.displayLabel || field?.name || node.props.label || node.type);
  const placeholder = String(node.bindings?.placeholder || node.props.placeholder || '');
  const format = String(readConfig('format'));
  const controlLabel = isCellMode ? undefined : label;
  const inputPlaceholder = isCellMode ? (placeholder || label) : placeholder;
  const datePlaceholder = isCellMode
    ? placeholder || (node.type === 'timepicker' ? '请选择时间' : node.type === 'datetimepicker' ? '请选择日期时间' : '请选择日期')
    : format || placeholder;
  const emptySymbol = String(readConfig('emptySymbol'));
  const prefix = String(readConfig('prefix'));
  const suffix = String(readConfig('suffix'));
  const defaultValue = String(node.bindings?.defaultValue ?? '');
  const displayMode = String(node.bindings?.displayMode ?? 'text');
  const isWrapDisplay = Boolean(node.bindings?.autoWrap);
  const minLength = Number(readConfig('minLength', 0)) || undefined;
  const disabled = Boolean(node.bindings?.readonly) || Boolean(node.props.disabled) || node.props.viewState === 'disabled';
  const readonly = Boolean(node.bindings?.readonly) || node.props.viewState === 'readonly';
  const controlReadonly = isCellMode || readonly;
  const hidden = Boolean(node.bindings?.hidden);
  const optionLayout = String(readConfig('optionLayout', 'row'));
  const commonSx = {
    p: 1.5,
    borderRadius: 1,
    border: selected ? '2px solid #1976d2' : '1px solid #d0d7e2',
    bgcolor: '#fff',
    cursor: 'pointer',
    ...resolveNodeLayout(node),
  };
  const emptyOption = { key: 'empty', label: emptySymbol || '未配置选项', value: '' };
  const textInputProps = {
    readOnly: true,
    startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
    endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
  };
  const wrapTextFieldProps = isWrapDisplay
    ? {
        multiline: true,
        minRows: 1,
        maxRows: isCellMode ? 2 : 4,
        sx: {
          '& .MuiInputBase-root.MuiInputBase-multiline': {
            alignItems: isCellMode ? 'stretch' : 'flex-start',
            ...(isCellMode
              ? {
                  minHeight: 0,
                  p: '2px 6px',
                  overflow: 'hidden',
                }
              : {}),
          },
          '& .MuiInputBase-inputMultiline': {
            boxSizing: 'border-box',
            lineHeight: isCellMode ? '16px' : '20px',
            overflow: isCellMode ? 'hidden' : 'auto',
            whiteSpace: 'pre-wrap',
            ...(isCellMode
              ? {
                  height: '100% !important',
                  minHeight: '0 !important',
                  padding: '0 !important',
                  resize: 'none',
                }
              : {}),
          },
        },
      }
    : {};

  const renderCellDateTimePicker = () => (
    <TextField
      data-canvas-cell-datetime-picker="true"
      fullWidth
      size="small"
      placeholder={datePlaceholder}
      disabled={disabled}
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            <CalendarMonthOutlined sx={{ fontSize: 18, color: '#909399' }} />
          </InputAdornment>
        ),
      }}
      inputProps={{ tabIndex: -1 }}
    />
  );

  const renderCellSignatureButton = () => (
    <Box
      component="button"
      type="button"
      data-canvas-cell-signature-button="true"
      tabIndex={-1}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 24,
        border: '1px dashed #a8abb2',
        borderRadius: 0.75,
        bgcolor: '#fff',
        color: '#606266',
        fontSize: 13,
        fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      点击签名
    </Box>
  );

  const renderCellUploadButton = () => (
    <Box
      component="button"
      type="button"
      data-canvas-cell-upload-button="true"
      tabIndex={-1}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 24,
        border: '1px solid #dcdfe6',
        borderRadius: 0.75,
        bgcolor: '#fff',
        color: '#606266',
        fontSize: 13,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        cursor: 'pointer',
      }}
    >
      <AddOutlined sx={{ fontSize: 18 }} />
      点击上传
    </Box>
  );

  const renderCellSelect = () => (
    <TextField
      data-canvas-cell-select="true"
      select
      fullWidth
      size="small"
      value=""
      disabled={disabled}
      InputProps={{ readOnly: true }}
      inputProps={{ tabIndex: -1 }}
      SelectProps={{
        displayEmpty: true,
        renderValue: () => inputPlaceholder || '请选择',
      }}
    >
      {[{ key: 'placeholder', label: inputPlaceholder || '请选择', value: '' }, ...(options.length ? options : [emptyOption])].map((option) => (
        <MenuItem key={option.key} value={option.value}>{option.label}</MenuItem>
      ))}
    </TextField>
  );

  const renderControl = () => {
    if (hidden) {
      return <Typography sx={{ fontSize: 13, color: '#909399' }}>{label} 已隐藏</Typography>;
    }

    if (isCellMode && field?.type === 'datetime') {
      return renderCellDateTimePicker();
    }
    if (isCellMode && field?.type === 'signature') {
      return renderCellSignatureButton();
    }
    if (isCellMode && (field?.type === 'attachment' || field?.type === 'image')) {
      return renderCellUploadButton();
    }
    if (isCellMode && ['singleSelect', 'multiSelect', 'reference'].includes(field?.type ?? '')) {
      return renderCellSelect();
    }

    switch (node.type) {
      case 'textarea':
        return (
          <TextField
            fullWidth
            size="small"
            label={controlLabel}
            placeholder={inputPlaceholder}
            value={defaultValue}
            multiline
            minRows={Number(node.props.rows ?? 3)}
            disabled={disabled}
            InputProps={textInputProps}
            inputProps={{ minLength, maxLength: Number(readConfig('maxLength', 500)), tabIndex: isCellMode ? -1 : undefined }}
          />
        );
      case 'inputnumber':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={controlLabel}
            placeholder={inputPlaceholder}
            value={defaultValue}
            disabled={disabled}
            InputProps={textInputProps}
            inputProps={{
              min: Number(readConfig('min', 0)),
              max: Number(readConfig('max', 999999)),
              step: Number(readConfig('step', 1)),
              tabIndex: isCellMode ? -1 : undefined,
            }}
          />
        );
      case 'inputdouble':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={controlLabel}
            placeholder={inputPlaceholder}
            value={defaultValue}
            disabled={disabled}
            InputProps={textInputProps}
            inputProps={{
              min: Number(readConfig('min', 0)),
              max: Number(readConfig('max', 999999)),
              step: Number(readConfig('step', 0.01)),
              tabIndex: isCellMode ? -1 : undefined,
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
            label={controlLabel}
            placeholder={datePlaceholder}
            disabled={disabled}
            InputProps={{ readOnly: true }}
            inputProps={{ tabIndex: isCellMode ? -1 : undefined }}
          />
        );
      case 'select':
        return (
          <TextField select fullWidth size="small" label={controlLabel} value="" disabled={disabled} InputProps={{ readOnly: controlReadonly }} inputProps={{ tabIndex: isCellMode ? -1 : undefined }}>
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
            label={controlLabel}
            placeholder={inputPlaceholder}
            value={defaultValue}
            disabled={disabled}
            InputProps={textInputProps}
            inputProps={{ minLength, maxLength: Number(readConfig('maxLength', 200)) || undefined, tabIndex: isCellMode ? -1 : undefined }}
            {...wrapTextFieldProps}
          />
        );
    }
  };

  if (isCellMode) {
    return (
      <Box
        data-canvas-cell-field-component="true"
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          onCellMouseDown?.(event);
          onSelect();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onContextMenu={(event) => {
          event.stopPropagation();
          onCellContextMenu?.(event);
        }}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'stretch',
          cursor: 'pointer',
          outline: selected ? '2px solid #1976d2' : 'none',
          outlineOffset: -2,
          borderRadius: 0.75,
          '& .MuiFormControl-root': { height: '100%' },
          '& .MuiInputBase-root': { height: '100%', bgcolor: '#fff', pointerEvents: 'none' },
          '& .MuiInputBase-input': { py: 0.75, caretColor: 'transparent' },
          '& [data-canvas-cell-signature-button="true"], & [data-canvas-cell-upload-button="true"]': {
            pointerEvents: 'none',
          },
          '& .MuiFormControlLabel-root, & .MuiRadio-root, & .MuiCheckbox-root, & .MuiSwitch-root': {
            pointerEvents: 'none',
          },
        }}
      >
        {renderControl()}
      </Box>
    );
  }

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
          精度: {String(readConfig('precision', 2))}
        </Typography>
      ) : null}
      {node.bindings?.helpText ? (
        <Typography sx={{ mt: 0.5, fontSize: 11, color: '#909399' }}>
          {String(node.bindings.helpText)}
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

function ContainerRenderer({
  node,
  selected,
  onSelect,
  onCellMouseDown,
  onCellContextMenu,
  onOpenConfig,
  renderMode,
}: DesignerRendererProps) {
  const field = useBoundField(node);

  if (node.type === 'sub-table' && renderMode === 'cell') {
    const subTableLabel = String(field?.name || field?.code || node.props.title || '子表');

    return (
      <Box
        data-canvas-sub-table-frame="true"
        onContextMenu={(event) => {
          event.stopPropagation();
          onCellContextMenu?.(event);
        }}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 24,
          border: selected ? '2px dashed #7c3aed' : '1px dashed #7c3aed',
          bgcolor: 'transparent',
          cursor: 'pointer',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        <Box
          data-canvas-sub-table-connector="true"
          sx={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            width: 18,
            borderTop: '1px dashed #8b5cf6',
            opacity: 1,
            pointerEvents: 'none',
            transform: 'translateY(-50%)',
          }}
        />
        <Box
          data-canvas-sub-table-hover-label="true"
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onOpenConfig?.();
          }}
          sx={{
            position: 'absolute',
            left: 'calc(100% + 18px)',
            top: '50%',
            px: 0.75,
            height: 22,
            lineHeight: '22px',
            borderRadius: 0.5,
            bgcolor: '#8b5cf6',
            color: '#fff',
            fontSize: 12,
            opacity: 1,
            pointerEvents: 'auto',
            transform: 'translateY(-50%)',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subTableLabel}
        </Box>
      </Box>
    );
  }

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
