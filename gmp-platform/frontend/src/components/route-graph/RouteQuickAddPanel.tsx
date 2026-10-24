import { useState } from 'react';
import { Add, Close, Search } from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, IconButton, InputAdornment, ListItemButton, MenuItem, Popover, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import type { OperationRecord } from '@/api/master-data';
import type { FlowDirection } from '@/components/flow-designer/FlowDesigner';
import type { RouteFlowNode } from './routeGraph';

export default function RouteQuickAddPanel({ anchorEl, node, direction, operations, existingNodes, loading, failed, onRetry, onAdd, onConnect, onClose }: {
  anchorEl: HTMLElement;
  node: RouteFlowNode;
  direction: FlowDirection;
  operations: OperationRecord[];
  existingNodes: RouteFlowNode[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
  onAdd: (operation: OperationRecord) => void;
  onConnect: (node: RouteFlowNode) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState('add');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const before = node.data.nodeType === 'END' || direction === 'top';
  const categories = [...new Set(operations.map((operation) => operation.operationCategory?.trim() || '未分类'))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const matches = (name: string, code?: string | null) => `${name} ${code ?? ''}`.toLowerCase().includes(keyword.trim().toLowerCase());
  const filtered = operations.filter((operation) => (!category || (operation.operationCategory?.trim() || '未分类') === category) && matches(operation.name || operation.code || '', operation.code));
  const existing = existingNodes.filter((item) => matches(item.data.label, item.data.operationCode));
  const candidateKey = (item: RouteFlowNode) => JSON.stringify([item.data.label, item.data.operationCode, item.data.nodeType, item.data.reworkBadges, item.data.occurrenceBadge]);
  const duplicateCounts = new Map<string, number>();
  existingNodes.forEach((item) => { const key = candidateKey(item); duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1); });
  return <Popover open anchorEl={anchorEl} onClose={onClose} marginThreshold={16}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    PaperProps={{ role: 'dialog', 'aria-labelledby': 'route-quick-add-title', sx: { width: 420, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)', display: 'flex', flexDirection: 'column' } }}>
    <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ px: 2, pt: 1.5, pb: 1 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography id="route-quick-add-title" fontWeight={600}>快速添加工序</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>在「{node.data.label}」{before ? '之前' : '之后'}连接工序</Typography>
      </Box>
      <IconButton size="small" aria-label="关闭快速添加" onClick={onClose}><Close fontSize="small" /></IconButton>
    </Stack>
    <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tab value="add" label="添加新工序" /><Tab value="connect" label="连接已有节点" />
    </Tabs>
    <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
      {tab === 'add' ? <TextField select size="small" label="工序分类" value={category} onChange={(event) => setCategory(event.target.value)} sx={{ width: 130, flexShrink: 0 }}>
        <MenuItem value="">全部分类</MenuItem>
        {categories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField> : null}
      <TextField autoFocus fullWidth size="small" label={tab === 'add' ? '搜索工序名称或编码' : '搜索已有节点'} value={keyword} onChange={(event) => setKeyword(event.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, endAdornment: keyword ? <InputAdornment position="end"><IconButton size="small" aria-label="清空工序搜索" onClick={() => setKeyword('')}><Close fontSize="small" /></IconButton></InputAdornment> : undefined }} />
    </Stack>
    <Box sx={{ overflowY: 'auto', minHeight: 100, maxHeight: 320, px: 1, pb: 1 }}>
      {tab === 'add' && loading ? <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 2 }}><CircularProgress size={18} /><Typography variant="body2">工序加载中</Typography></Stack>
        : tab === 'add' && failed ? <Box sx={{ p: 2 }}><Typography variant="body2">工序加载失败</Typography><Button onClick={onRetry}>重试</Button></Box>
        : (tab === 'add' ? filtered : existing).length === 0 ? <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>{keyword || category ? '没有匹配项，请调整搜索或分类' : tab === 'add' ? '暂无可添加工序，已使用工序可在“连接已有节点”中选择' : '暂无可连接节点'}</Typography>
        : tab === 'add' ? filtered.map((operation) => <ListItemButton component="button" key={operation.id} onClick={() => onAdd(operation)} sx={{ width: '100%', textAlign: 'left', gap: 1, borderRadius: 1, py: 1.25 }}>
          <Add fontSize="small" color="primary" />
          <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{operation.name || operation.code}</Typography><Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{operation.code || '无编码'}</Typography></Box>
          <Chip size="small" label={operation.operationCategory?.trim() || '未分类'} sx={{ maxWidth: 100 }} />
        </ListItemButton>) : existing.map((item) => <ListItemButton component="button" key={item.id} data-route-connect-node-id={item.id} data-route-connect-node-type={item.data.nodeType} onClick={() => onConnect(item)} sx={{ width: '100%', textAlign: 'left', gap: 1, borderRadius: 1, py: 1.25 }}>
          <Add fontSize="small" color="primary" /><Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{item.data.label}</Typography><Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{item.data.operationCode}</Typography>
            {(duplicateCounts.get(candidateKey(item)) ?? 0) > 1 ? <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>节点标识：{item.id}</Typography> : null}
          </Box>
          {item.data.nodeType === 'OPERATION' || item.data.nodeType === 'REWORK' ? <Chip size="small" variant="outlined" color={item.data.nodeType === 'REWORK' ? 'error' : 'default'} label={item.data.nodeType === 'REWORK' ? ['返工工序', ...(item.data.reworkBadges ?? [])].join(' · ') : '生产工序'} sx={{ flexShrink: 0 }} /> : null}
          {item.data.occurrenceBadge ? <Chip size="small" variant="outlined" label={item.data.occurrenceBadge} sx={{ flexShrink: 0 }} /> : null}
        </ListItemButton>)}
    </Box>
    <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>自动添加连线，保留已有连线；可使用撤销恢复。</Typography>
  </Popover>;
}
