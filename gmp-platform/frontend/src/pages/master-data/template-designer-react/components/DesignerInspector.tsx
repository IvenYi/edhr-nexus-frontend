import { Divider, Stack, Typography } from '@mui/material';
import PropertyFormRenderer from './PropertyFormRenderer';
import { getComponentDefinition } from '../registry/componentRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { PropertySchemaItem } from '../types';

const FILL_RULE_SCHEMA: PropertySchemaItem[] = [
  { key: 'required', label: '必填', editor: 'switch', defaultValue: false },
  { key: 'readonly', label: '只读', editor: 'switch', defaultValue: false },
  { key: 'hidden', label: '隐藏', editor: 'switch', defaultValue: false },
  { key: 'defaultValue', label: '默认值', editor: 'text', defaultValue: '' },
];

const DISPLAY_RULE_SCHEMA: PropertySchemaItem[] = [
  { key: 'displayLabel', label: '显示名称覆盖', editor: 'text', defaultValue: '' },
  { key: 'placeholder', label: '占位文案', editor: 'text', defaultValue: '' },
  { key: 'helpText', label: '帮助说明', editor: 'textarea', defaultValue: '' },
];

const WIDGET_CONFIG_EXCLUDED_KEYS = new Set(['label', 'placeholder', 'required', 'disabled', 'viewState']);

export default function DesignerInspector() {
  const updateNodeBindings = useTemplateDesignerStore((state) => state.updateNodeBindings);
  const updateNodeStyle = useTemplateDesignerStore((state) => state.updateNodeStyle);
  const updateCurrentPage = useTemplateDesignerStore((state) => state.updateCurrentPage);
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());

  const componentDefinition = selectedNode ? getComponentDefinition(selectedNode.type) : null;
  const widgetConfigSchema = (componentDefinition?.propSchema ?? [])
    .filter((item) => !WIDGET_CONFIG_EXCLUDED_KEYS.has(item.key));

  return (
    <Stack spacing={2} sx={{ p: 2, overflow: 'auto', height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>属性配置</Typography>
      {selectedNode ? (
        <>
          <PropertyFormRenderer
            title="填写规则"
            schema={FILL_RULE_SCHEMA}
            value={(selectedNode.bindings ?? {}) as Record<string, unknown>}
            onChange={(patch) => updateNodeBindings(selectedNode.id, patch)}
          />
          <Divider />
          <PropertyFormRenderer
            title="展示规则"
            schema={DISPLAY_RULE_SCHEMA}
            value={(selectedNode.bindings ?? {}) as Record<string, unknown>}
            onChange={(patch) => updateNodeBindings(selectedNode.id, patch)}
          />
          <Divider />
          <PropertyFormRenderer
            title="控件规则"
            schema={widgetConfigSchema}
            value={selectedNode.bindings?.widgetConfig ?? selectedNode.props}
            onChange={(patch) => updateNodeBindings(selectedNode.id, {
              widgetConfig: {
                ...(selectedNode.bindings?.widgetConfig ?? {}),
                ...patch,
              },
            })}
          />
          <Divider />
          <PropertyFormRenderer
            title="样式配置"
            schema={componentDefinition?.styleSchema ?? []}
            value={selectedNode.style}
            onChange={(patch) => updateNodeStyle(selectedNode.id, patch)}
          />
        </>
      ) : (
        <PropertyFormRenderer
          title="页面属性"
          schema={[
            { key: 'name', label: '页面属性', editor: 'text', defaultValue: currentPage?.name ?? '' },
          ]}
          value={{ name: currentPage?.name ?? '' }}
          onChange={(patch) => updateCurrentPage({ name: String(patch.name ?? '') })}
        />
      )}
    </Stack>
  );
}
