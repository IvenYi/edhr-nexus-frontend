import { Autocomplete, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import PropertyFormRenderer from './PropertyFormRenderer';
import { getComponentDefinition } from '../registry/componentRegistry';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

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
  const selectedNodeId = useTemplateDesignerStore((state) => state.selectedNodeId);
  const bindFieldToNode = useTemplateDesignerStore((state) => state.bindFieldToNode);
  const updateNodeProps = useTemplateDesignerStore((state) => state.updateNodeProps);
  const updateNodeStyle = useTemplateDesignerStore((state) => state.updateNodeStyle);
  const updateCurrentPage = useTemplateDesignerStore((state) => state.updateCurrentPage);
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());

  const fields = document?.model.fields ?? [];
  const selectedField = fields.find((field) => field.id === selectedNode?.bindings?.fieldId) ?? null;
  const componentDefinition = selectedNode ? getComponentDefinition(selectedNode.type) : null;
  const selectedFieldType = selectedField ? getFieldTypeDefinition(selectedField.type) : null;
  const bindableFields = selectedNode
    ? fields.filter((field) => getFieldTypeDefinition(field.type).compatibleComponents.includes(selectedNode.type))
    : [];

  return (
    <Paper sx={{ p: 2, overflow: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>属性配置</Typography>
        {selectedNode ? (
          <>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fafbfc' }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>字段属性</Typography>
                <FieldMetaItem label="字段类型" value={selectedFieldType?.label ?? '-'} />
                <FieldMetaItem label="字段名称" value={selectedField?.name ?? '-'} />
                <FieldMetaItem label="字段编码" value={selectedField?.code ?? '-'} />
              </Stack>
            </Paper>
            <Autocomplete
              size="small"
              options={bindableFields}
              getOptionLabel={(option) => `${option.name || '未命名字段'} (${option.code || '-'})`}
              value={selectedField}
              onChange={(_, option) => bindFieldToNode(selectedNode.id, option?.id ?? '')}
              renderInput={(params) => <TextField {...params} label="绑定字段" />}
            />
            <Divider />
            <PropertyFormRenderer
              title="组件配置"
              schema={componentDefinition?.propSchema ?? []}
              value={selectedNode.props}
              onChange={(patch) => updateNodeProps(selectedNode.id, patch)}
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
