import { useState, type ReactNode } from 'react';
import { ArticleOutlined, ChevronRightRounded, ExpandMoreRounded, CloseRounded, FolderOutlined, ViewListOutlined } from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, Stack, Tab, Tabs, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery } from '@mui/material';
import type { DhrNavigationNode, DhrNavigationView, DhrSource } from './dhrSourceNavigation';

export const workspacePanelSx = { minWidth: 0, minHeight: 0, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' } as const;
export const workspaceBodySx = { display: 'flex', flex: 1, minHeight: 0, minWidth: 0, gap: 1, position: 'relative', overflow: 'hidden' } as const;
const contentEntranceSx = { animation: 'dhr-content-enter 200ms ease-out', '@keyframes dhr-content-enter': { from: { opacity: 0, transform: 'translateX(-6px)' }, to: { opacity: 1, transform: 'translateX(0)' } }, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;

export function DhrSidePanel({ open, children, overlay = false }: { open: boolean; children: ReactNode; overlay?: boolean }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return <Collapse in={open} orientation="horizontal" timeout={reduceMotion ? 0 : 200} mountOnEnter unmountOnExit
    sx={{ flexShrink: 0, minHeight: 0, mr: open ? 0 : -1, transition: reduceMotion ? 'none' : 'width 200ms ease, margin-right 200ms ease', '& .MuiCollapse-wrapper, & .MuiCollapse-wrapperInner': { height: '100%' }, ...(overlay ? { '@media (max-width: 900px)': { position: 'absolute', left: 228, top: 0, bottom: 0, zIndex: 3, boxShadow: open ? '4px 0 16px #00000012' : 'none', maxWidth: 'calc(100% - 228px)' } } : {}) }}>
    {children}
  </Collapse>;
}

export function DhrSourceTabs({ value, onChange }: { value: DhrSource; onChange: (source: DhrSource) => void }) {
  return <Tabs aria-label="表单来源分类" value={value} onChange={(_, source: DhrSource) => onChange(source)} variant="fullWidth" sx={{ minHeight: 44, borderBottom: '1px solid #e4e7ed', '& .MuiTab-root': { minWidth: 0, minHeight: 44, px: 0.5, fontSize: 13 } }}>
    <Tab value="DIRECTORY" label="批记录模板" /><Tab value="WORK" label="作业表单" /><Tab value="CUSTOM" label="自定义表单" />
  </Tabs>;
}

export function DhrWorkspaceNavigation({ source, onSourceChange, nodes, selectedKey, onSelect, onInstances, instancesOpen = false, action, footer, children, contentKey = 'browse', view = 'SOURCE', onViewChange }: {
  source: DhrSource; onSourceChange: (source: DhrSource) => void; nodes: DhrNavigationNode[];
  selectedKey: string; onSelect: (node: DhrNavigationNode) => void; onInstances: (node: DhrNavigationNode) => void;
  instancesOpen?: boolean; action?: ReactNode; footer?: ReactNode; children?: ReactNode; contentKey?: string;
  view?: DhrNavigationView; onViewChange?: (view: DhrNavigationView) => void;
}) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hiddenBelow: number[] = [];
  const visibility = nodes.map(node => {
    while (hiddenBelow.length && node.depth <= hiddenBelow[hiddenBelow.length - 1]) hiddenBelow.pop();
    const visible = !hiddenBelow.length;
    if (node.folder && collapsed.includes(node.key)) hiddenBelow.push(node.depth);
    return visible;
  });
  return <Box data-dhr-navigation sx={{ ...workspacePanelSx, width: { xs: 220, lg: 280 }, flexShrink: 0 }}>
    <Stack data-dhr-navigation-heading direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, minHeight: 40, flexShrink: 0 }}><Typography fontWeight={600}>DHR 导航</Typography>{action}</Stack>
    <Box key={contentKey} sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, ...contentEntranceSx }}>{children || <>
    {onViewChange && <ToggleButtonGroup exclusive fullWidth size="small" aria-label="DHR导航视图" value={view} onChange={(_, value: DhrNavigationView | null) => { if (value) onViewChange(value); }} sx={{ width: 'auto', m: 1, mt: 0.5, p: 0.375, bgcolor: '#f1f3f6', borderRadius: 1, '& .MuiToggleButton-root': { border: 0, borderRadius: '4px !important', py: 0.5, color: 'text.secondary', '&.Mui-selected': { bgcolor: '#fff', color: 'primary.main', boxShadow: '0 1px 3px #00000012' }, '&.Mui-selected:hover': { bgcolor: '#fff' } } }}><ToggleButton value="ARCHIVE">档案目录</ToggleButton><ToggleButton value="SOURCE">按来源</ToggleButton></ToggleButtonGroup>}
    {view === 'SOURCE' && <DhrSourceTabs value={source} onChange={onSourceChange} />}
    <Box sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>{nodes.map((node, index) => <Collapse key={node.key} in={visibility[index]} timeout={reduceMotion ? 0 : 160} unmountOnExit>{node.folder
      ? <><Stack direction="row" gap={0.5} alignItems="center" sx={{ minHeight: 40, pl: `${6 + node.depth * 18}px`, pr: 1 }}><IconButton size="small" sx={{ width: 24, height: 24, flexShrink: 0 }} aria-label={`${collapsed.includes(node.key) ? '展开' : '收起'}目录 ${node.label}`} aria-expanded={!collapsed.includes(node.key)} onClick={() => setCollapsed(keys => keys.includes(node.key) ? keys.filter(key => key !== node.key) : [...keys, node.key])}>{collapsed.includes(node.key) ? <ChevronRightRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}</IconButton><FolderOutlined sx={{ fontSize: 18, color: '#d9a441', flexShrink: 0 }} /><Typography variant="body2" noWrap title={node.label}>{node.label}</Typography></Stack>{node.emptyMessage && <Collapse in={!collapsed.includes(node.key)} timeout={reduceMotion ? 0 : 160}><Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 7, py: 1 }}>{node.emptyMessage}</Typography></Collapse>}</>
      : <Box key={node.key} data-dhr-form-row={node.key} sx={{ display: 'flex', alignItems: 'center', minHeight: 44, pl: `${(view === 'ARCHIVE' || source === 'DIRECTORY' ? 38 : 12) + node.depth * 18}px`, pr: 0.5, bgcolor: selectedKey === node.key ? '#e8f4ff' : 'transparent', '&:hover': { bgcolor: selectedKey === node.key ? '#e8f4ff' : '#f5f7fa' }, '& .dhr-instance-action': { opacity: 0 }, '&:hover .dhr-instance-action, &:focus-within .dhr-instance-action': { opacity: 1 }, '@media (hover: none)': { '& .dhr-instance-action': { opacity: 1 } } }}>
        <Button onClick={() => onSelect(node)} aria-label={`查看表单 ${node.label}`} sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', gap: 1, px: 0, py: 0.75, color: selectedKey === node.key ? 'primary.main' : 'text.primary', '&:hover': { bgcolor: 'transparent' } }}><ArticleOutlined sx={{ fontSize: 18, color: '#6c7a89', flexShrink: 0 }} /><Box minWidth={0} textAlign="left"><Typography variant="body2" noWrap title={node.label}>{node.label}</Typography>{node.secondary && <Typography variant="caption" color="text.secondary" display="block" noWrap title={node.secondary}>{node.secondary}</Typography>}</Box></Button>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, mx: 0.5 }}>{node.recordIds.length} 份</Typography>
        <Tooltip title={`实例列表（${node.recordIds.length} 份）`}><IconButton className="dhr-instance-action" size="small" aria-label={`实例列表 ${node.label}`} aria-expanded={instancesOpen && selectedKey === node.key} color={instancesOpen && selectedKey === node.key ? 'primary' : 'default'} onClick={() => onInstances(node)} sx={{ width: 28, height: 28, '&&[aria-expanded="true"]': { opacity: 1 } }}><ViewListOutlined sx={{ fontSize: 18 }} /></IconButton></Tooltip>
      </Box>}</Collapse>)}{!nodes.length && <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>暂无此来源表单</Typography>}</Box>
    </>}</Box>
    {footer && <Box data-dhr-navigation-footer sx={{ flexShrink: 0, borderTop: '1px solid #e4e7ed', p: 1 }}>{footer}</Box>}
  </Box>;
}

export function DhrInstancePanel({ open, title, items, selectedId, onSelect, onClose }: {
  open: boolean;
  title: string; items: Array<{ id: string; label: string; secondary?: string }>; selectedId: string;
  onSelect: (id: string) => void; onClose: () => void;
}) {
  return <DhrSidePanel open={open} overlay><Box data-dhr-instances sx={{ ...workspacePanelSx, width: 236, height: '100%' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, minHeight: 56, borderBottom: '1px solid #e4e7ed' }}><Box minWidth={0}><Typography fontWeight={600}>表单实例 · {items.length} 份</Typography><Typography variant="caption" noWrap display="block" color="text.secondary" title={title}>{title}</Typography></Box><IconButton size="small" aria-label="收起实例列表" onClick={onClose}><CloseRounded fontSize="small" /></IconButton></Stack>
    <Stack spacing={0.5} sx={{ p: 1, overflow: 'auto' }}>{items.map(item => <Button key={item.id} aria-label={`查看实例 ${item.label}`} onClick={() => onSelect(item.id)} sx={{ px: 1, py: 1, justifyContent: 'flex-start', textAlign: 'left', bgcolor: selectedId === item.id ? '#e8f4ff' : 'transparent', color: selectedId === item.id ? 'primary.main' : 'text.primary' }}><Box minWidth={0}><Typography variant="body2" noWrap title={item.label}>{item.label}</Typography><Typography variant="caption" color="text.secondary" display="block" sx={{ overflowWrap: 'anywhere' }}>{item.secondary}</Typography></Box></Button>)}{!items.length && <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>尚无实际实例</Typography>}</Stack>
  </Box></DhrSidePanel>;
}
