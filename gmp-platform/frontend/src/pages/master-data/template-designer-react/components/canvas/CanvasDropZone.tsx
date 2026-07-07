import { Button, Stack, Typography } from '@mui/material';
import { getComponentDefinition } from '../../registry/componentRegistry';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

interface CanvasDropZoneProps {
  parentId: string | null;
}

export default function CanvasDropZone({ parentId }: CanvasDropZoneProps) {
  const insertNode = useTemplateDesignerStore((state) => state.insertNode);

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 13, color: '#606266' }}>字段组件</Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={() => insertNode(parentId, getComponentDefinition('input').createDefaultNode())}
      >
        点击插入输入框
      </Button>
    </Stack>
  );
}
