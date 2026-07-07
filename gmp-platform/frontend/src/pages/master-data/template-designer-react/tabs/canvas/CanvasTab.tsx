import { Box, Paper, Typography } from '@mui/material';
import DesignerInspector from '../../components/DesignerInspector';
import DesignerSidebar from '../../components/DesignerSidebar';
import CanvasDropZone from '../../components/canvas/CanvasDropZone';
import CanvasNodeRenderer from '../../components/canvas/CanvasNodeRenderer';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

export default function CanvasTab() {
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr) 320px' },
        gap: 2,
        height: '100%',
      }}
    >
      <DesignerSidebar />
      <Paper sx={{ p: 2, minHeight: 0, overflow: 'auto' }}>
        <Typography sx={{ mb: 1.5, fontSize: 13, color: '#606266' }}>字段组件</Typography>
        <CanvasDropZone parentId={null} />
        <CanvasNodeRenderer nodes={currentPage?.nodes ?? []} />
      </Paper>
      <DesignerInspector />
    </Box>
  );
}
