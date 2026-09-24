import { useEffect, useState } from 'react';
import { Button, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import FormDialogFieldGrid from '@/components/FormDialogFieldGrid';
import type { ExecutionButton } from '@/api/production-execution';

export default function DhrActionDialog({ button, busy, initialOpinion = '', onCancel, onConfirm }: {
  button: ExecutionButton | null; busy: boolean; initialOpinion?: string; onCancel: () => void;
  onConfirm: (credentials: { account: string; password: string; opinion: string }) => void;
}) {
  const [account, setAccount] = useState(''), [password, setPassword] = useState(''), [opinion, setOpinion] = useState('');
  const fieldSignature = button?.action === 'SIGN_FIELD';
  useEffect(() => { setAccount(''); setPassword(''); setOpinion(initialOpinion); }, [button, initialOpinion]);
  return <FormDialog open={Boolean(button)} onClose={busy ? undefined : onCancel} maxWidth="sm" fullWidth>
    <DialogTitle>{button?.label}{button?.requiresSignature && !fieldSignature ? ' · 账户签署' : ''}</DialogTitle>
    <DialogContent dividers><FormDialogSection title="操作确认"><FormDialogFieldGrid hasTrailingFullRow>
      {button?.requiresSignature && !fieldSignature && <TextField size="small" label="当前账号" autoComplete="username" value={account} disabled={busy} onChange={e => setAccount(e.target.value)} />}
      {button?.requiresSignature && <TextField size="small" label={fieldSignature ? '电子签名密码' : '账户密码'} autoComplete="current-password" type="password" value={password} disabled={busy} onChange={e => setPassword(e.target.value)} />}
      <TextField size="small" label="操作意见" required={button?.requireOpinion} multiline minRows={3} value={opinion} disabled={busy} onChange={e => setOpinion(e.target.value)} sx={{ gridColumn: '1 / -1' }} />
    </FormDialogFieldGrid></FormDialogSection></DialogContent>
    <DialogActions><Button disabled={busy} onClick={onCancel}>取消</Button><Button variant="contained" disabled={busy || Boolean(button?.requiresSignature && ((!fieldSignature && !account) || !password)) || Boolean(button?.requireOpinion && !opinion.trim())} onClick={() => onConfirm({ account, password, opinion })}>{busy ? '处理中…' : '确认'}</Button></DialogActions>
  </FormDialog>;
}
