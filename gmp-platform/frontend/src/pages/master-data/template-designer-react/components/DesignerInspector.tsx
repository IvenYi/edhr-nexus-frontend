import { Box, Checkbox, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import PropertyFormRenderer from './PropertyFormRenderer';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

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

function readText(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function readNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function FieldConfigSection({
  title,
  marker,
  children,
}: {
  title: string;
  marker: string;
  children: React.ReactNode;
}) {
  return (
    <Stack data-inspector-section={marker} sx={sectionSx}>
      <Typography sx={sectionTitleSx}>{title}</Typography>
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
  const updateCurrentPage = useTemplateDesignerStore((state) => state.updateCurrentPage);
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());

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
  const displayMode = readText(bindings.displayMode, 'text');

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
      <FieldConfigSection title="基础信息" marker="basic">
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
        </Stack>
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
    </Stack>
  );
}
