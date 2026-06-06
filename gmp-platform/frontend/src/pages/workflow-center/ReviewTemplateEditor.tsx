import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

/** Review workflow template editor with ReactFlow canvas. */
export default function ReviewTemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/workflow/review-templates')}>
          返回
        </Button>
        <Typography variant="h5">审核流程画布 - 模板 {id}</Typography>
      </Box>
      <Box sx={{
        height: 'calc(100vh - 200px)',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        bgcolor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography color="text.secondary">
          流程画布区域（ReactFlow 拖拽节点 + 属性配置面板）
        </Typography>
      </Box>
    </Box>
  );
}
