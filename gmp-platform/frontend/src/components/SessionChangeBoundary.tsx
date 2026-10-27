import { type ReactNode, useSyncExternalStore } from 'react';
import { Alert, Box, Button, Card, Typography } from '@mui/material';
import { hasSessionChanged, returnToLogin, subscribeSessionChange } from '@/utils/sessionPolicy';

export default function SessionChangeBoundary({ children }: { children: ReactNode }) {
  const changed = useSyncExternalStore(subscribeSessionChange, hasSessionChanged, () => false);
  if (!changed) return <>{children}</>;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'background.default' }}>
      <Card component="section" aria-labelledby="session-change-title" sx={{ width: 480, maxWidth: '100%', p: { xs: 3, sm: 4 } }}>
        <Typography id="session-change-title" variant="h5" component="h1" gutterBottom>登录状态已变化</Typography>
        <Alert severity="warning" sx={{ my: 2 }}>登录账号已在其他标签变化，请重新登录。</Alert>
        <Typography color="text.secondary" sx={{ mb: 3 }}>当前页面已停止操作。请重新登录后打开记录，未提交的内容不会自动提交。</Typography>
        <Button variant="contained" fullWidth autoFocus onClick={returnToLogin}>返回登录页</Button>
      </Card>
    </Box>
  );
}
