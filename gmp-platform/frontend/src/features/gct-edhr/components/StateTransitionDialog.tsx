import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { EdhrActionExecuteInput, EdhrActionMeta, EdhrPageMeta, EdhrRecord } from '../types';
import { getActionLabel } from '../utils/actionPolicy';

interface StateTransitionDialogProps {
  page: EdhrPageMeta;
  record: EdhrRecord | null;
  action: EdhrActionMeta | null;
  open: boolean;
  executeAction: (recordId: string, actionCode: string, input?: EdhrActionExecuteInput) => Promise<unknown>;
  deleteRecord: (recordId: string, input?: EdhrActionExecuteInput) => Promise<unknown>;
  onClose: () => void;
  onDone?: (message: string) => void;
}

const transitionActionCodes = new Set([
  'process',
  'finish',
  'approve',
  'reject',
  'release',
  'withdraw',
  'transfer',
  'delete',
  'disable',
  'enable',
]);

export default function StateTransitionDialog({
  page,
  record,
  action,
  open,
  executeAction,
  deleteRecord,
  onClose,
  onDone,
}: StateTransitionDialogProps) {
  const [remark, setRemark] = useState('');
  const [extraValue, setExtraValue] = useState('');
  const [saving, setSaving] = useState(false);
  const actionCode = action?.code ?? '';
  const actionLabel = action ? getActionLabel(action.code, action) : '状态流转';
  const extraField = useMemo(() => getExtraField(actionCode), [actionCode]);

  useEffect(() => {
    if (!open) return;
    setRemark(defaultRemark(actionCode));
    setExtraValue('');
  }, [actionCode, open]);

  const handleConfirm = async () => {
    if (!record || !action) return;
    setSaving(true);
    try {
      const input: EdhrActionExecuteInput = {
        remark,
        operatorName: '前端演示用户',
        values: extraField ? { [extraField.name]: extraValue } : undefined,
      };
      if (action.code === 'delete') {
        await deleteRecord(record.id, input);
      } else {
        await executeAction(record.id, action.code, input);
      }
      onDone?.(`${actionLabel}已执行`);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isKnownTransition = transitionActionCodes.has(actionCode);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{actionLabel}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          {record ? (
            <Typography variant="body2" color="text.secondary">
              当前记录：{record.id}，状态：{record.status}
            </Typography>
          ) : null}
          {!isKnownTransition ? (
            <Alert severity="info">
              该动作将作为通用动作执行，并记录审计日志。
            </Alert>
          ) : (
            <Alert severity={actionCode === 'delete' || actionCode === 'reject' ? 'warning' : 'info'}>
              请确认本次{actionLabel}操作，提交后将写入状态历史和审计记录。
            </Alert>
          )}
          {extraField ? (
            <TextField
              fullWidth
              size="small"
              label={extraField.label}
              value={extraValue}
              onChange={(event) => setExtraValue(event.target.value)}
              required={extraField.required}
            />
          ) : null}
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="处理备注"
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            required={actionCode === 'reject' || actionCode === 'withdraw' || actionCode === 'delete'}
          />
          <Typography variant="caption" color="text.secondary">
            页面：{page.title} · 动作代码：{actionCode || '-'}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>取消</Button>
        <Button
          variant="contained"
          color={actionCode === 'delete' || actionCode === 'reject' ? 'error' : 'primary'}
          onClick={handleConfirm}
          disabled={saving || !record || !action}
        >
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function getExtraField(actionCode: string): { name: string; label: string; required: boolean } | null {
  if (actionCode === 'transfer') return { name: 'transferTo', label: '转交给', required: true };
  if (actionCode === 'reject') return { name: 'rejectReason', label: '驳回原因', required: true };
  if (actionCode === 'release') return { name: 'releaseConclusion', label: '放行结论', required: true };
  if (actionCode === 'process') return { name: 'processNote', label: '处理说明', required: false };
  if (actionCode === 'finish') return { name: 'finishSummary', label: '完成摘要', required: false };
  return null;
}

function defaultRemark(actionCode: string): string {
  if (actionCode === 'approve') return '审批通过';
  if (actionCode === 'reject') return '审批驳回';
  if (actionCode === 'release') return '符合放行条件';
  if (actionCode === 'withdraw') return '撤回重提';
  if (actionCode === 'delete') return '逻辑删除';
  return '';
}
