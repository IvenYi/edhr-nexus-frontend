import { AddRounded, DownloadRounded } from '@mui/icons-material';
import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { DhrAttachment } from '@/api/dhr-instances';
import { workspacePanelSx } from './DhrWorkspaceNavigation';

export const attachmentKindLabels = { EXTERNAL_REPORT: '委外报告', CERTIFICATE: '外部证书', PAPER_SCAN: '纸质原件扫描', OTHER: '其他' };

export default function DhrAttachmentPanel({ attachments, editable, busy, onUpload, onDownload, onVerify, onUnlink, onBack }: {
  attachments: DhrAttachment[]; editable: boolean; busy: boolean; onUpload: () => void;
  onDownload: (attachment: DhrAttachment) => void; onVerify: (id: string) => void; onUnlink: (id: string) => void; onBack: () => void;
}) {
  return <Box data-dhr-attachments sx={{ ...workspacePanelSx, flex: 1 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ p: 1.5, borderBottom: '1px solid #e4e7ed' }}>
      <Box><Typography fontWeight={600}>附件证据 · {attachments.length} 份</Typography><Typography variant="caption" color="text.secondary">{editable ? '上传后须核验；解除关联不删除历史文件。' : '当前版本附件，只读查看。'}</Typography></Box>
      <Stack direction="row" spacing={1}><Button onClick={onBack}>返回表单</Button>{editable && <Button variant="contained" startIcon={<AddRounded />} disabled={busy} onClick={onUpload}>上传附件</Button>}</Stack>
    </Stack>
    <TableContainer sx={{ flex: 1 }}><Table size="small" stickyHeader aria-label="DHR附件列表" sx={{ minWidth: 640 }}>
      <TableHead><TableRow>{['附件名称 / 来源', '用途与原件信息', '上传信息', '核验状态', '操作'].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
      <TableBody>{attachments.map(attachment => <TableRow key={attachment.id} hover>
        <TableCell><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{attachment.name}</Typography><Typography variant="caption" color="text.secondary">{attachmentKindLabels[attachment.sourceKind]} · {Math.ceil(attachment.size / 1024)} KB</Typography></TableCell>
        <TableCell sx={{ maxWidth: 280, overflowWrap: 'anywhere' }}>{attachment.purpose}{attachment.sourceKind === 'PAPER_SCAN' && <Typography variant="caption" display="block" color="text.secondary">原记录：{attachment.originalRecordedAt || '—'}<br />保管：{attachment.custodyLocation || '—'}</Typography>}</TableCell>
        <TableCell><Typography variant="body2">{attachment.linkedBy || '—'}</Typography><Typography variant="caption" color="text.secondary">{attachment.linkedAt?.replace('T', ' ') || '—'}</Typography></TableCell>
        <TableCell><Typography variant="body2" color={attachment.verificationStatus === 'VERIFIED' ? 'success.main' : 'warning.main'}>{attachment.verificationStatus === 'VERIFIED' ? '已核验' : attachment.verificationStatus === 'REJECTED' ? '未通过' : '待核验'}</Typography></TableCell>
        <TableCell><Stack direction="row" flexWrap="wrap" gap={0.5}><Button size="small" startIcon={<DownloadRounded />} onClick={() => onDownload(attachment)}>下载原件</Button>{editable && attachment.verificationStatus !== 'VERIFIED' && <Button size="small" disabled={busy} onClick={() => onVerify(attachment.id)}>确认核验</Button>}{editable && <Button size="small" color="error" disabled={busy} onClick={() => onUnlink(attachment.id)}>解除关联</Button>}</Stack></TableCell>
      </TableRow>)}{!attachments.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>暂无附件证据{editable ? '，可上传委外报告、证书或纸质扫描件。' : '。'}</TableCell></TableRow>}</TableBody>
    </Table></TableContainer>
  </Box>;
}
