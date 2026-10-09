import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

export default function FormDialogSection({ title, children }: { title: string; children: ReactNode }) {
  return <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
    <Typography sx={{ px: 1.5, py: 1, bgcolor: '#f8fafc', borderBottom: '1px solid #e4e7ed', fontWeight: 600, color: '#303133' }}>{title}</Typography>
    <Box sx={{ p: 1.5 }}>{children}</Box>
  </Box>;
}
