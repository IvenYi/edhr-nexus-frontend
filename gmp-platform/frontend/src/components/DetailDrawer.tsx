import type { ReactNode } from 'react';
import { Box, Drawer, IconButton, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import Close from '@mui/icons-material/Close';

/** Shared shell for list-row information and audit details. */
export default function DetailDrawer({ open, onClose, label, tab, onTabChange, children, footer }: {
  open: boolean; onClose: () => void; label: string; tab: number;
  onTabChange: (tab: number) => void; children: ReactNode; footer?: ReactNode;
}) {
  return <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: theme => theme.zIndex.drawer + 3 }}
    PaperProps={{ role: 'dialog', 'aria-label': label, sx: { width: { xs: '100vw', sm: 560 }, maxWidth: '100vw', height: '100vh', bgcolor: '#f7f9fc', overflow: 'hidden' } }}>
    <Box sx={{ px: 2, pt: 2, flexShrink: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>信息查看</Typography>
        <Tooltip title="关闭" placement="left"><IconButton size="small" aria-label={`关闭${label}`} onClick={onClose}><Close /></IconButton></Tooltip>
      </Stack>
      <Tabs value={tab} onChange={(_, next: number) => onTabChange(next)} aria-label={`${label}切换`} sx={{ borderBottom: '1px solid #e4e7ed' }}>
        <Tab label="数据信息" /><Tab label="数据审计" />
      </Tabs>
    </Box>
    <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'auto', '& > *': { flexShrink: 0 }, '& > .MuiBox-root': { bgcolor: '#fff' } }}>
      {children}
    </Stack>
    {footer && <Box sx={{ flexShrink: 0 }}>{footer}</Box>}
  </Drawer>;
}
