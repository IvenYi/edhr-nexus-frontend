import { Box, Typography } from '@mui/material';

interface FormManagementPlaceholderPageProps {
  title: string;
}

export default function FormManagementPlaceholderPage({ title }: FormManagementPlaceholderPageProps) {
  return (
    <Box sx={{ minHeight: 320, height: '100%', display: 'grid', placeItems: 'center' }}>
      <Box sx={{ width: 'min(520px, 100%)', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" sx={{ color: '#303133', fontWeight: 600 }}>{title}</Typography>
        <Typography variant="body2" sx={{ mt: 1, color: '#909399' }}>该入口已纳入记录/表单管理导航，页面能力将按既定开发顺序逐步补齐。</Typography>
      </Box>
    </Box>
  );
}
