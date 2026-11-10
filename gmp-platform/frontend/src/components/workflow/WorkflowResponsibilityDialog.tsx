import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import PersonnelTargetSelect from '@/components/identity/PersonnelTargetSelect';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import ButtonSignatureCredentials from './ButtonSignatureCredentials';
import { useSnackbar } from '@/components/SnackbarProvider';
import { changeTaskResponsibility, getResponsibilityTargets, getTransferContext } from '@/api/workflow-operations';

type Target = { id: string; name: string; username: string };
export default function WorkflowResponsibilityDialog({ taskId, taskState, previousAssignee, businessDescription, reassign = false, onClose, onSuccess }: {
  taskId: string; taskState?: string; previousAssignee?: string; businessDescription?: string; reassign?: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const { showMessage } = useSnackbar();
  const cache = useQueryClient();
  const [target, setTarget] = useState<Target | null>(null);
  const [reason, setReason] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const reasonRef = useRef<HTMLInputElement>();
  const context = useQuery({ queryKey: ['workflow-transfer-context', taskId], queryFn: () => getTransferContext(taskId), enabled: !reassign, retry: false });
  const signatureRequired = reassign || context.data?.signatureRequired;
  const confirm = async () => {
    if (submitting.current) return;
    if (!target || !reason.trim()) { setError('请选择目标人员并填写原因'); reasonRef.current?.focus(); return; }
    if (signatureRequired && (!account.trim() || !password)) { setError('请输入签署人用户名和签署密码'); return; }
    submitting.current = true; setBusy(true); setError('');
    try {
      await changeTaskResponsibility(taskId, reassign, { targetUserId: target.id, reason: reason.trim(),
        expectedTaskState: reassign ? taskState! : context.data!.taskState, account: account.trim(), password });
      await cache.invalidateQueries({ predicate: query => /workflow|record-control|^form-|^dhr-/.test(String(query.queryKey[0])) });
      showMessage(reassign ? '重新分配成功' : '转办成功', 'success'); onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : '操作失败，请重试'); setPassword(''); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <FormDialog open fullWidth maxWidth="sm" onClose={() => { if (!busy) onClose(); }} hideCloseButton={busy} aria-labelledby="responsibility-title">
    <DialogTitle id="responsibility-title">{reassign ? '重新分配' : '转办任务'}</DialogTitle>
    <DialogContent dividers><FormDialogSection title="处理责任"><Stack spacing={1.5}>
      {businessDescription && <Typography variant="body2">{businessDescription}</Typography>}
      <Typography variant="body2" color="text.secondary">任务 {taskId}{previousAssignee ? ` · 原处理人：${previousAssignee}` : ''}</Typography>
      <Typography variant="caption" color="text.secondary">只更换当前处理人，流程节点和审批结果保持不变。</Typography>
      {!reassign && context.isError && <Alert severity="error" action={<Button onClick={() => void context.refetch()}>重试</Button>}>任务配置加载失败</Alert>}
      <PersonnelTargetSelect key={`${taskId}:${reassign}`} scope={['responsibility', taskId, reassign]}
        loadPage={(page, keyword, signal) => getResponsibilityTargets(taskId, reassign, keyword, page, signal)}
        value={target} onChange={person => { setTarget(person); setError(''); }} disabled={busy} />
      <TextField inputRef={reasonRef} label={reassign ? '重新分配原因' : '转办原因'} required multiline minRows={3} size="small" value={reason}
        disabled={busy} onChange={event => { setReason(event.target.value); setError(''); }} inputProps={{ maxLength: 500 }} helperText={`${reason.length}/500`} />
    </Stack></FormDialogSection>
      {signatureRequired && <FormDialogSection title="电子签名"><Stack spacing={1.5}><ButtonSignatureCredentials size="small" account={account} password={password}
        disabled={busy} onAccountChange={value => { setAccount(value); setError(''); }} onPasswordChange={value => { setPassword(value); setError(''); }} /></Stack></FormDialogSection>}
      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
    </DialogContent>
    <DialogActions><Button disabled={busy} onClick={onClose}>取消</Button><Button variant="contained" sx={{ minWidth: 128 }}
      disabled={busy || !target || !reason.trim() || (!reassign && !context.data) || (Boolean(signatureRequired) && (!account.trim() || !password))}
      onClick={() => void confirm()}>{busy ? '处理中…' : reassign ? '签署并重新分配' : signatureRequired ? '签署并转办' : '确认转办'}</Button></DialogActions>
  </FormDialog>;
}
