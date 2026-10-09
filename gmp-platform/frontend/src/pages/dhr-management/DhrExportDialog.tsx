import { useState } from 'react';
import { Alert, Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import AppDialog from '@/components/AppDialog';
import type { DhrAttachment, DhrEvidenceRecord } from '@/api/dhr-instances';
import type { DhrNavigationNode } from './dhrSourceNavigation';
import { exportSelectionNodes } from './dhrExportSelection';
import DhrExportTree from './DhrExportTree';

export default function DhrExportDialog({ versionNo, nodes, records, attachments, busy, onClose, onExport }: {
  versionNo: number; nodes: DhrNavigationNode[]; records: DhrEvidenceRecord[]; attachments: DhrAttachment[];
  busy: boolean; onClose: () => void; onExport: (scope: 'FULL' | 'SELECTED', recordIds: string[], attachmentIds: string[]) => void;
}) {
  const [scope, setScope] = useState<'FULL' | 'SELECTED'>('FULL');
  const [recordIds, setRecordIds] = useState<string[]>([]), [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const tree = exportSelectionNodes(nodes, records, keyword);
  const visibleIds = new Set(tree.flatMap(node => node.recordIds));
  const filteredRecords = records.filter(record => visibleIds.has(record.id));
  const filteredAttachments = attachments.filter(a => a.name.toLowerCase().includes(keyword.trim().toLowerCase()));
  const visibleCount = filteredRecords.length + filteredAttachments.length;
  const checkedCount = filteredRecords.filter(r => recordIds.includes(r.id)).length + filteredAttachments.filter(a => attachmentIds.includes(a.id)).length;
  const toggle = (ids: string[], id: string, checked: boolean) => checked ? [...new Set([...ids, id])] : ids.filter(value => value !== id);
  return <AppDialog open onClose={busy ? undefined : onClose} variant="form" fullWidth maxWidth="md">
    <DialogTitle>导出 DHR · 冻结版本 V{versionNo}</DialogTitle>
    <DialogContent dividers>
      <RadioGroup row value={scope} onChange={(_, value) => setScope(value as 'FULL' | 'SELECTED')}><FormControlLabel disabled={busy} value="FULL" control={<Radio />} label="完整 DHR" /><FormControlLabel disabled={busy} value="SELECTED" control={<Radio />} label="自定义范围" /></RadioGroup>
      <Alert severity="info" sx={{ mb: 1.5 }}>{scope === 'FULL' ? `包含本版本全部 ${records.length} 份表单和 ${attachments.length} 份汇总附件。` : '选定范围 ZIP 不是完整 DHR；选择不会改变原档案或审批范围。'} 总 PDF 按档案目录编排，单表 PDF 按来源分类。表单字段附件随表导出，附件原件不并入 PDF；冻结数据与清单保存在追溯资料中。</Alert>
      {scope === 'SELECTED' && <>
        <TextField size="small" fullWidth label="搜索目录、表单名称、实例号或附件" value={keyword} disabled={busy} onChange={event => setKeyword(event.target.value)} />
        <Stack direction="row" justifyContent="space-between" alignItems="center"><FormControlLabel label="全选当前筛选结果" control={<Checkbox disabled={busy || !visibleCount} checked={Boolean(visibleCount) && checkedCount === visibleCount} indeterminate={checkedCount > 0 && checkedCount < visibleCount} onChange={(_, checked) => {
          setRecordIds(ids => checked ? [...new Set([...ids, ...filteredRecords.map(r => r.id)])] : ids.filter(id => !filteredRecords.some(r => r.id === id)));
          setAttachmentIds(ids => checked ? [...new Set([...ids, ...filteredAttachments.map(a => a.id)])] : ids.filter(id => !filteredAttachments.some(a => a.id === id)));
        }} />} /><Typography variant="caption">已选 {recordIds.length} 份表单 / {attachmentIds.length} 份附件</Typography></Stack>
        <Box sx={{ maxHeight: '45vh', overflow: 'auto', border: '1px solid #e4e7ed', borderRadius: 1 }}>
          <DhrExportTree nodes={tree} records={records} selected={recordIds} onChange={setRecordIds} busy={busy} searching={Boolean(keyword.trim())} />
          <FormControlLabel sx={{ m: 0, pl: 3 }} label={`汇总附件（${filteredAttachments.length}）`} control={<Checkbox disabled={busy || !filteredAttachments.length} checked={Boolean(filteredAttachments.length) && filteredAttachments.every(a => attachmentIds.includes(a.id))} indeterminate={filteredAttachments.some(a => attachmentIds.includes(a.id)) && !filteredAttachments.every(a => attachmentIds.includes(a.id))} onChange={(_, checked) => setAttachmentIds(ids => checked ? [...new Set([...ids, ...filteredAttachments.map(a => a.id)])] : ids.filter(id => !filteredAttachments.some(a => a.id === id)))} />} />
          {filteredAttachments.map(attachment => <Stack key={attachment.id} direction="row" alignItems="center" sx={{ px: 1, py: 0.5 }}><Checkbox disabled={busy} checked={attachmentIds.includes(attachment.id)} inputProps={{ 'aria-label': `选择附件 ${attachment.name}` }} onChange={(_, checked) => setAttachmentIds(ids => toggle(ids, attachment.id, checked))} /><Box><Typography variant="body2">{attachment.name}</Typography><Typography variant="caption" color="text.secondary">附件 · {attachment.purpose}</Typography></Box></Stack>)}
          {!visibleCount && <Typography sx={{ p: 3 }} color="text.secondary">没有匹配的记录</Typography>}
        </Box>
      </>}
    </DialogContent>
    <DialogActions><Button disabled={busy} onClick={onClose}>取消</Button><Button variant="contained" disabled={busy || (scope === 'SELECTED' && !recordIds.length && !attachmentIds.length)} onClick={() => onExport(scope, scope === 'FULL' ? [] : recordIds, scope === 'FULL' ? [] : attachmentIds)}>{busy ? '正在导出…' : '导出 ZIP'}</Button></DialogActions>
  </AppDialog>;
}
