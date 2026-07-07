import { Autocomplete, Paper, Stack, TextField, Typography } from '@mui/material';
import PropertyFormRenderer from './PropertyFormRenderer';
import { getComponentDefinition } from '../registry/componentRegistry';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

export default function DesignerInspector() {
  const document = useTemplateDesignerStore((state) => state.document);
  const selectedNodeId = useTemplateDesignerStore((state) => state.selectedNodeId);
  const bindFieldToNode = useTemplateDesignerStore((state) => state.bindFieldToNode);
  const updateNodeProps = useTemplateDesignerStore((state) => state.updateNodeProps);
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());

  const fields = document?.model.fields ?? [];
  const selectedField = fields.find((field) => field.id === selectedNode?.bindings?.fieldId) ?? null;
  const componentDefinition = selectedNode ? getComponentDefinition(selectedNode.type) : null;
  const bindableFields = selectedNode
    ? fields.filter((field) => getFieldTypeDefinition(field.type).compatibleComponents.includes(selectedNode.type))
    : [];

  return (
    <Paper sx={{ p: 2, overflow: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>属性配置</Typography>
        {selectedNode ? (
          <>
            <Autocomplete
              size="small"
              options={bindableFields}
              getOptionLabel={(option) => `${option.name || '未命名字段'} (${option.code || '-'})`}
              value={selectedField}
              onChange={(_, option) => bindFieldToNode(selectedNode.id, option?.id ?? '')}
              renderInput={(params) => <TextField {...params} label="绑定字段" />}
            />
            <PropertyFormRenderer
              schema={componentDefinition?.propSchema ?? []}
              value={selectedNode.props}
              onChange={(patch) => updateNodeProps(selectedNode.id, patch)}
            />
          </>
        ) : (
          <Typography color="text.secondary">请先从画布中选择一个组件。</Typography>
        )}
      </Stack>
    </Paper>
  );
}
