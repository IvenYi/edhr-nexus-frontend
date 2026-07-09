import { Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { getComponentDefinition } from '../registry/componentRegistry';
import { componentRegistry } from '../registry/componentRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

export default function DesignerSidebar() {
  const insertNode = useTemplateDesignerStore((state) => state.insertNode);
  const addNodeFromField = useTemplateDesignerStore((state) => state.addNodeFromField);
  const document = useTemplateDesignerStore((state) => state.document);
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());

  const fieldComponents = componentRegistry.filter((component) => component.category === 'field');
  const layoutComponents = componentRegistry.filter((component) => component.category !== 'field');
  const modelFields = document?.model.fields ?? [];
  const selectedDefinition = selectedNode ? getComponentDefinition(selectedNode.type) : null;
  const selectedParentId = selectedDefinition && selectedDefinition.category !== 'field' ? selectedNode?.id ?? null : null;
  const insertTargetLabel = selectedParentId ? String(selectedNode?.props.title || selectedNode?.props.label || selectedNode?.type || '选中容器') : '根画布';

  return (
    <Paper sx={{ p: 2, overflow: 'auto' }}>
      <Typography sx={{ mb: 1.5, fontSize: 12, color: '#909399' }}>
        插入目标: {insertTargetLabel}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>基础字段</Typography>
      <Stack spacing={1}>
        {fieldComponents.map((component) => (
          <Button
            key={component.type}
            variant="outlined"
            onClick={() => insertNode(selectedParentId, component.createDefaultNode())}
          >
            {component.label}
          </Button>
        ))}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>字段映射</Typography>
      <Stack spacing={1}>
        {modelFields.length ? modelFields.map((field) => (
          <Button
            key={field.id}
            variant="text"
            sx={{ justifyContent: 'space-between' }}
            onClick={() => addNodeFromField(field.id, selectedParentId)}
          >
            {field.name || '未命名字段'}
          </Button>
        )) : (
          <Typography sx={{ fontSize: 12, color: '#909399' }}>请先在建模设计中创建字段。</Typography>
        )}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>布局组件</Typography>
      <Stack spacing={1}>
        {layoutComponents.map((component) => (
          <Button
            key={component.type}
            variant="outlined"
            onClick={() => insertNode(selectedParentId, component.createDefaultNode())}
          >
            {component.label}
          </Button>
        ))}
      </Stack>
    </Paper>
  );
}
