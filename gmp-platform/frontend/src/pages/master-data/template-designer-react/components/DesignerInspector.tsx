import { Autocomplete, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import PropertyFormRenderer from './PropertyFormRenderer';
import { getComponentDefinition } from '../registry/componentRegistry';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';
import FieldTypeIcon from './FieldTypeIcon';
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

function FieldMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ fontSize: 12, color: '#909399' }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, color: '#303133' }}>{value || '-'}</Typography>
    </Stack>
  );
}

export default function DesignerInspector() {
  const document = useTemplateDesignerStore((state) => state.document);
  const bindFieldToNode = useTemplateDesignerStore((state) => state.bindFieldToNode);
  const updateNodeBindings = useTemplateDesignerStore((state) => state.updateNodeBindings);
  const updateNodeStyle = useTemplateDesignerStore((state) => state.updateNodeStyle);
  const updateCurrentPage = useTemplateDesignerStore((state) => state.updateCurrentPage);
  const getAvailableFieldsForCurrentVersion = useTemplateDesignerStore((state) => state.getAvailableFieldsForCurrentVersion);
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());

  const fields = document?.model.fields ?? [];
  const selectedField = fields.find((field) => field.id === selectedNode?.bindings?.fieldId) ?? null;
  const componentDefinition = selectedNode ? getComponentDefinition(selectedNode.type) : null;
  const selectedFieldType = selectedField ? getFieldTypeDefinition(selectedField.type) : null;
  const availableFields = selectedNode ? getAvailableFieldsForCurrentVersion(selectedNode.id) : [];
  const bindableFields = selectedField && !availableFields.some((field) => field.id === selectedField.id)
    ? [selectedField, ...availableFields]
    : availableFields;
  const widgetConfigSchema = (componentDefinition?.propSchema ?? [])
    .filter((item) => !WIDGET_CONFIG_EXCLUDED_KEYS.has(item.key));

  return (
    <Paper sx={{ p: 2, overflow: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>属性配置</Typography>
        {selectedNode ? (
          <>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fafbfc' }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>字段信息</Typography>
                <FieldMetaItem label="字段名称" value={selectedField?.name ?? '-'} />
                <FieldMetaItem label="字段编码" value={selectedField?.code ?? '-'} />
                <Stack spacing={0.5}>
                  <Typography sx={{ fontSize: 12, color: '#909399' }}>字段类型</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {selectedFieldType ? <FieldTypeIcon iconKey={selectedFieldType.iconKey} sx={{ fontSize: 16 }} /> : null}
                    <Typography sx={{ fontSize: 13, color: '#303133' }}>{selectedFieldType?.label ?? '-'}</Typography>
                  </Stack>
                </Stack>
                <FieldMetaItem label="字段状态" value={selectedField?.status === 'disabled' ? '停用' : selectedField ? '启用' : '-'} />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>绑定关系</Typography>
                <Autocomplete
                  size="small"
                  options={bindableFields}
                  getOptionLabel={(option) => `${option.name || '未命名字段'} (${option.code || '-'})`}
                  value={selectedField}
                  onChange={(_, option) => bindFieldToNode(selectedNode.id, option?.id ?? '')}
                  renderOption={(props, option) => {
                    const definition = getFieldTypeDefinition(option.type);

                    return (
                      <li {...props}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                          <FieldTypeIcon iconKey={definition.iconKey} sx={{ fontSize: 17 }} />
                          <Stack sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, color: '#303133' }} noWrap>
                              {option.name || '未命名字段'}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#909399' }}>
                              {definition.label} / {option.code || '-'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </li>
                    );
                  }}
                  renderInput={(params) => <TextField {...params} label="切换绑定字段" />}
                />
                <Button variant="outlined" onClick={() => bindFieldToNode(selectedNode.id, '')}>
                  解绑字段
                </Button>
              </Stack>
            </Paper>

            <Divider />
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
    </Paper>
  );
}
