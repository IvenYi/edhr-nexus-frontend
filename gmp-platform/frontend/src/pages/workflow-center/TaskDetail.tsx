import { useParams } from 'react-router-dom';
import { Alert, Autocomplete, Box, Typography, Button, TextField, Card, CardContent, Stack, Divider, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Cancel, Forward, Send } from '@mui/icons-material';
import { useSnackbar } from '@/components/SnackbarProvider';
import PageHeader from '@/components/PageHeader';
import FormDialog from '@/components/FormDialog';
import client from '@/api/client';
import type { ApiResponse } from '@/types/common';

type TransferTarget = { id: string; name: string; username: string };

export default function TaskDetail() {
  const { id } = useParams();
  const [opinion, setOpinion] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<TransferTarget | null>(null);
  const [transferInput, setTransferInput] = useState('');
  const [transferKeyword, setTransferKeyword] = useState('');
  const [transferTargets, setTransferTargets] = useState<TransferTarget[]>([]);
  const [transferReason, setTransferReason] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferAttempt, setTransferAttempt] = useState(0);
  const [transferredTo, setTransferredTo] = useState('');
  const transferRequest = useRef<AbortController | null>(null);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    setTransferOpen(false);
    setTransferredTo('');
    setLoading(null);
    return () => transferRequest.current?.abort();
  }, [id]);

  useEffect(() => {
    if (!transferOpen || !id) return;
    const controller = new AbortController();
    setTransferLoading(true);
    setTransferError('');
    void client.get<ApiResponse<TransferTarget[]>>(`/workflow/tasks/${id}/transfer-targets`, {
      params: { keyword: transferKeyword }, signal: controller.signal,
    }).then((response) => {
      if (!controller.signal.aborted) setTransferTargets(response.data.data);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setTransferTargets([]);
        setTransferTarget(null);
        setTransferError(error instanceof Error ? error.message : '可转办人员加载失败，请重试');
      }
    }).finally(() => { if (!controller.signal.aborted) setTransferLoading(false); });
    return () => controller.abort();
  }, [id, transferOpen, transferKeyword, transferAttempt]);

  const openTransfer = () => {
    setTransferTarget(null);
    setTransferInput('');
    setTransferKeyword('');
    setTransferTargets([]);
    setTransferReason('');
    setTransferError('');
    setTransferOpen(true);
  };

  const submitTransfer = async () => {
    if (!id || !transferTarget || !transferReason.trim() || loading !== null) return;
    setLoading('transfer');
    setTransferError('');
    const controller = new AbortController();
    transferRequest.current = controller;
    try {
      await client.post(`/workflow/tasks/${id}/transfer`, {
        newAssigneeId: transferTarget.id, reason: transferReason.trim(),
      }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setTransferredTo(transferTarget.name);
      setTransferOpen(false);
      showMessage('转办成功', 'success');
    } catch (error: unknown) {
      if (!controller.signal.aborted) setTransferError(error instanceof Error ? error.message : '转办失败，请重试');
    } finally { if (!controller.signal.aborted) setLoading(null); }
  };

  const handleAction = async (action: string, label: string) => {
    setLoading(action);
    try {
      await client.post(`/workflow/tasks/${id}/${action}`, { opinion, password });
      showMessage(`${label}成功`, 'success');
    } catch {
      showMessage(`${label}失败`, 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title={`任务处理`}
        subtitle={`任务编号: #${id}`}
        breadcrumbs={[
          { label: '首页', path: '/' },
          { label: '流程实例', path: '/workflow/instances' },
          { label: `任务 #${id}` },
        ]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>任务详情</Typography>
          <Typography variant="body2" color="text.secondary">
            展示关联表单、字段权限、审批人等信息。
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>处理操作</Typography>
          {transferredTo && <Alert severity="success" sx={{ mb: 2 }}>任务已转办给{transferredTo}，由受让人继续处理。</Alert>}
          <TextField label="审批意见" fullWidth multiline rows={3} sx={{ mb: 2 }}
            value={opinion} onChange={(e) => setOpinion(e.target.value)} />
          <TextField label="签名密码" type="password" fullWidth sx={{ mb: 3 }}
            value={password} onChange={(e) => setPassword(e.target.value)} />

          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleAction('approve', '审批通过')}
              disabled={loading !== null || Boolean(transferredTo)}
            >
              {loading === 'approve' ? '处理中...' : '审批通过'}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleAction('reject', '审批退回')}
              disabled={loading !== null || Boolean(transferredTo)}
            >
              {loading === 'reject' ? '处理中...' : '审批退回'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Forward />}
              onClick={openTransfer}
              disabled={loading !== null || Boolean(transferredTo)}
            >
              {loading === 'transfer' ? '处理中...' : '转办'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Send />}
              onClick={() => handleAction('submit', '提交')}
              disabled={loading !== null || Boolean(transferredTo)}
            >
              {loading === 'submit' ? '处理中...' : '提交'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <FormDialog open={transferOpen} fullWidth maxWidth="sm" aria-labelledby="task-transfer-title"
        hideCloseButton={loading === 'transfer'} onClose={() => { if (loading !== 'transfer') setTransferOpen(false); }}>
        <DialogTitle id="task-transfer-title">转办任务</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">选择本租户的其他可用用户承担当前任务。转办不会推进流程，原审批候选来源会保留。</Typography>
            {transferError && <Alert severity="error" action={<Button color="inherit" size="small" disabled={loading !== null || transferLoading} onClick={() => setTransferAttempt((value) => value + 1)}>重新加载人员</Button>}>{transferError}</Alert>}
            <Autocomplete options={transferTargets} value={transferTarget} inputValue={transferInput}
              loading={transferLoading} disabled={loading !== null} filterOptions={(options) => options}
              getOptionLabel={(option) => `${option.name}（${option.username}）`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => setTransferTarget(value)}
              onInputChange={(_, value, reason) => {
                if (reason !== 'reset' || value) setTransferInput(value);
                if (reason === 'input' || reason === 'clear') { setTransferKeyword(value); setTransferTarget(null); }
              }}
              loadingText="正在加载可转办人员…"
              noOptionsText={transferError ? '人员加载失败，请重试' : transferKeyword.trim() ? '没有找到匹配的可转办人员' : '本租户暂无其他可转办人员'}
              renderInput={(params) => <TextField {...params} label="转办给" required helperText="按姓名或账号搜索；仅可选择本租户已启用且未锁定的其他用户" />} />
            <TextField label="转办原因" required multiline minRows={3} value={transferReason}
              disabled={loading !== null} inputProps={{ maxLength: 500 }}
              onChange={(event) => setTransferReason(event.target.value)} helperText={`${transferReason.length}/500`} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={loading !== null} onClick={() => setTransferOpen(false)}>取消</Button>
          <Button variant="contained" disabled={loading !== null || transferLoading || !transferTarget || !transferReason.trim()}
            onClick={() => { void submitTransfer(); }}>{loading === 'transfer' ? '正在转办…' : '确认转办'}</Button>
        </DialogActions>
      </FormDialog>
    </Box>
  );
}
