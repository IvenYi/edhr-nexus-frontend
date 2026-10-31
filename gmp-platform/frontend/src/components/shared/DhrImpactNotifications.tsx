import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Notifications } from '@mui/icons-material';
import { Alert, Badge, Box, Button, CircularProgress, Divider, IconButton, Popover, Stack, Tooltip, Typography, type SxProps, type Theme } from '@mui/material';
import { listDhrImpactNotifications, readDhrImpactNotification } from '@/api/dhr-impact-notifications';

export default function DhrImpactNotifications({ sessionKey, iconButtonSx, badgeColor }: { sessionKey: string; iconButtonSx: SxProps<Theme>; badgeColor: string }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [page, setPage] = useState(0);
  const client = useQueryClient();
  const key = ['dhr-impact-notifications', sessionKey];
  const query = useQuery({ queryKey: [...key, page], queryFn: () => listDhrImpactNotifications(page), refetchInterval: 30000 });
  const read = useMutation({ mutationFn: readDhrImpactNotification, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  const close = () => { setAnchor(null); read.reset(); };
  return <>
    <Tooltip title="通知" arrow><IconButton sx={iconButtonSx} aria-label={`通知，${query.data?.unreadCount ?? 0} 条未读`} aria-haspopup="dialog" aria-expanded={Boolean(anchor)}
      onClick={event => { setAnchor(event.currentTarget); void query.refetch(); }}>
      <Badge badgeContent={query.data?.unreadCount ?? 0} max={99} sx={{ '& .MuiBadge-badge': { minWidth: 16, height: 16, fontSize: 10, bgcolor: badgeColor, color: '#fff' } }}><Notifications /></Badge>
    </IconButton></Tooltip>
    <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ role: 'dialog', 'aria-label': 'DHR 证据变更提醒', sx: { width: 380, maxWidth: 'calc(100vw - 24px)', maxHeight: 'min(560px, 80vh)', display: 'flex', flexDirection: 'column' } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5 }}><Typography fontWeight={600}>DHR 证据变更提醒</Typography><Button size="small" onClick={close}>关闭</Button></Stack>
      <Divider />
      <Box sx={{ overflow: 'auto', minHeight: 80 }} aria-live="polite">
        {query.isLoading ? <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} aria-label="正在加载提醒" /></Box>
          : query.isError ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => query.refetch()}>重试</Button>}>提醒加载失败，请重试</Alert>
          : !query.data?.content.length ? <Typography color="text.secondary" sx={{ p: 3 }}>暂无提醒</Typography>
          : query.data.content.map(item => <Box key={item.id} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: item.read ? undefined : 'action.hover' }}>
            <Typography variant="body2" fontWeight={item.read ? 400 : 600} sx={{ overflowWrap: 'anywhere' }}>{item.dhrNo} · V{item.versionNo}{!item.read && ' · 未读'}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>表单 {item.instanceNo} 的{item.action === 'OBSOLETE' ? '作废' : '变更'}已生效。请核对受影响版本，按 DHR 当前状态退回整理或发起修订，原冻结证据保留。</Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}><Typography variant="caption" color="text.secondary">{item.occurredAt?.replace('T', ' ').slice(0, 19)}</Typography>
              {!item.read && <Button size="small" disabled={read.isPending} aria-label={`标为已读 ${item.dhrNo} V${item.versionNo}`} onClick={() => read.mutate(item.id)}>标为已读</Button>}</Stack>
          </Box>)}
        {read.isError && <Alert severity="error">标记失败，请重试</Alert>}
      </Box>
      {Boolean(query.data?.total) && <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1 }}>
        <Button size="small" disabled={page === 0 || query.isFetching} onClick={() => setPage(value => value - 1)}>上一页</Button>
        <Typography variant="caption">第 {page + 1} 页 · 共 {query.data?.total} 条</Typography>
        <Button size="small" disabled={query.isFetching || !query.isSuccess || (page + 1) * 20 >= (query.data?.total ?? 0)} onClick={() => setPage(value => value + 1)}>下一页</Button>
      </Stack>}
    </Popover>
  </>;
}
