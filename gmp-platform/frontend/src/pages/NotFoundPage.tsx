import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ErrorOutline } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <ErrorOutline sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h4" gutterBottom>404</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        页面未找到
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        返回首页
      </Button>
    </Box>
  );
}
