import type { ReactNode } from 'react';
import { Box } from '@mui/material';

export default function FormDialogFieldGrid({ children }: { children: ReactNode }) {
  return <Box sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
    gap: 1.5,
    '& > *': { minWidth: 0 },
    '& > :last-child:nth-child(odd)': { gridColumn: { sm: '1 / -1' } },
  }}>{children}</Box>;
}
