import { useState } from 'react';
import { Box, Checkbox, IconButton, Stack, Typography } from '@mui/material';
import { ChevronRightRounded, ExpandMoreRounded, FolderOutlined, DescriptionOutlined } from '@mui/icons-material';
import type { DhrEvidenceRecord } from '@/api/dhr-instances';
import type { exportSelectionNodes } from './dhrExportSelection';

export default function DhrExportTree({ nodes, records, selected, onChange, busy, searching }: {
  nodes: ReturnType<typeof exportSelectionNodes>; records: DhrEvidenceRecord[]; selected: string[];
  onChange: (ids: string[]) => void; busy: boolean; searching: boolean;
}) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const byId = new Map(records.map(record => [record.id, record]));
  const checkbox = (ids: string[], label: string) => <Checkbox disabled={busy || !ids.length} checked={Boolean(ids.length) && ids.every(id => selected.includes(id))} indeterminate={ids.some(id => selected.includes(id)) && !ids.every(id => selected.includes(id))} inputProps={{ 'aria-label': label }} onChange={(_, checked) => onChange(checked ? [...new Set([...selected, ...ids])] : selected.filter(id => !ids.includes(id)))} />;
  return <>{nodes.filter(node => searching || !node.ancestorKeys.some(key => collapsed.includes(key))).map(node => {
    const expandable = node.folder || node.recordIds.length > 1;
    const closed = !searching && collapsed.includes(node.key);
    const single = node.recordIds.length === 1 ? byId.get(node.recordIds[0]) : undefined;
    return <Box key={node.key}>
      <Stack direction="row" alignItems="center" sx={{ pl: 0.5 + node.depth * 2, pr: 1, py: 0.5, borderBottom: '1px solid #f0f2f5', minHeight: 44 }}>
        {expandable ? <IconButton size="small" disabled={busy} aria-label={`${closed ? '展开' : '收起'} ${node.label}`} onClick={() => setCollapsed(keys => keys.includes(node.key) ? keys.filter(key => key !== node.key) : [...keys, node.key])}>{closed ? <ChevronRightRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}</IconButton> : <Box sx={{ width: 28 }} />}
        {checkbox(node.recordIds, node.folder ? `选择目录 ${node.label}` : single ? `选择表单 ${single.instanceNo}` : `选择表单组 ${node.label}`)}
        {node.folder ? <FolderOutlined fontSize="small" sx={{ color: '#c99531', mr: 1 }} /> : <DescriptionOutlined fontSize="small" sx={{ color: '#82909d', mr: 1 }} />}
        <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2">{node.label}</Typography>{!node.folder && single && <Typography variant="caption" color="text.secondary">{single.instanceNo}</Typography>}</Box>
        <Typography variant="caption" color="text.secondary">{node.recordIds.length} 份</Typography>
      </Stack>
      {!node.folder && node.recordIds.length > 1 && !closed && node.recordIds.map(id => <Stack key={id} direction="row" alignItems="center" sx={{ pl: 6 + node.depth * 2, py: 0.25 }}>{checkbox([id], `选择表单 ${byId.get(id)!.instanceNo}`)}<Typography variant="body2">{byId.get(id)!.instanceNo}</Typography></Stack>)}
    </Box>;
  })}</>;
}
