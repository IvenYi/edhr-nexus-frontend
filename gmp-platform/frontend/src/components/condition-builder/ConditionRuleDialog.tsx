import { useEffect, useState } from 'react';
import { DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import AppDialog from '@/components/AppDialog';
import { ConditionRuleBuilder, summarizeConditionExpression, type ConditionExpression, type ConditionRuleAdapter } from './ConditionRuleBuilder';

export function ConditionRuleDialog({
  open,
  value,
  adapter,
  branchName,
  readOnly = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  value: ConditionExpression | null | undefined;
  adapter: ConditionRuleAdapter;
  branchName?: string;
  readOnly?: boolean;
  onClose: () => void;
  onConfirm?: (value: ConditionExpression | null) => void;
}) {
  const [draft, setDraft] = useState<ConditionExpression | null>(value ?? null);
  useEffect(() => {
    if (open) setDraft(value ?? null);
  }, [open, value]);

  return <AppDialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="lg"
    PaperProps={{ sx: { minHeight: 'min(680px, 82vh)' } }}
  >
    <DialogTitle>{readOnly ? '查看条件规则' : '配置条件规则'}{branchName ? ` · ${branchName}` : ''}</DialogTitle>
    <DialogContent dividers sx={{ bgcolor: '#f8fafc', px: { xs: 2, md: 3 }, py: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        当前规则用于判断“{branchName || '该条件分支'}”是否命中。条件组支持“且/或”和嵌套分组；同一条件分支中的多条条件共同决定该分支是否满足。
      </Typography>
      <ConditionRuleBuilder
        value={draft}
        adapter={adapter}
        readOnly={readOnly}
        onChange={setDraft}
      />
      {readOnly && value ? <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        规则摘要：{summarizeConditionExpression(value, adapter)}
      </Typography> : null}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button onClick={onClose}>{readOnly ? '关闭' : '取消'}</Button>
      {!readOnly ? <Button variant="contained" onClick={() => { onConfirm?.(draft); onClose(); }}>确定</Button> : null}
    </DialogActions>
  </AppDialog>;
}
