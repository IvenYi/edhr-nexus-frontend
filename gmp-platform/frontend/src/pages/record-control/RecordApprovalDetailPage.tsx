import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert, Box, Button, Chip, CircularProgress, DialogActions, DialogContent, DialogTitle,
  Divider, Paper, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { ArrowBack, Cancel, CheckCircle, CompareArrows } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import ButtonSignatureCredentials from '@/components/workflow/ButtonSignatureCredentials';
import StatusBadge from '@/components/StatusBadge';
import { useSnackbar } from '@/components/SnackbarProvider';
import {
  completeRecordControlWorkflowTask,
  getRecordControlRequest,
  getRecordControlWorkflowTask,
  type RecordControlRequestDetail,
} from '@/api/record-control';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';

type Decision = 'approve' | 'reject';
type PreviewMode = 'source' | 'proposed';

function formatDateTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : '—';
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后重试';
}

function requestStatus(detail: RecordControlRequestDetail) {
  if (detail.status === 'IN_REVIEW') return { label: '审批中', color: 'warning' as const };
  if (detail.status === 'APPROVED') return { label: '已通过', color: 'success' as const };
  if (detail.status === 'RETURNED') return { label: '已退回', color: 'error' as const };
  return { label: '已撤回', color: 'default' as const };
}

function changeTypeLabel(value: string) {
  return ({
    FIELD_CHANGED: '值已修改', ROW_ADDED: '新增行', ROW_REMOVED: '删除行',
    FILE_ADDED: '新增附件', FILE_REMOVED: '移除附件', FILE_CHANGED: '附件已修改',
  } as Record<string, string>)[value] ?? '内容已变更';
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '空';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ display: 'block', mb: 0.35, color: '#909399' }}>{label}</Typography>
    <Typography component="div" variant="body2" sx={{ color: '#303133', wordBreak: 'break-word' }}>{value || '—'}</Typography>
  </Box>;
}

export default function RecordApprovalDetailPage() {
  const { taskId, requestId } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const [previewMode, setPreviewMode] = useState<PreviewMode>('source');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [highlightFieldId, setHighlightFieldId] = useState<string | null>(null);
  const [opinion, setOpinion] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
  }, []);

  const requestQuery = useQuery({
    queryKey: ['record-control-approval-request', requestId],
    queryFn: () => getRecordControlRequest(requestId!),
    enabled: Boolean(requestId),
    retry: false,
  });
  const taskQuery = useQuery({
    queryKey: ['record-control-approval-task', taskId],
    queryFn: () => getRecordControlWorkflowTask(taskId!),
    enabled: Boolean(taskId),
    retry: false,
  });
  const detail = requestQuery.data;
  const task = taskQuery.data;
  const document = useMemo(() => {
    if (!detail) return null;
    const form = detail.snapshot;
    const parsed = parseReactTemplateDesignerDocument({ id: detail.record_id, name: form.name }, {
      id: form.versionId, version: form.version, modelDesignJson: form.model, canvasDesignJson: form.canvas,
    });
    parsed.model.fields = form.fields.map((field, index) => ({
      ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index,
    }));
    return parsed;
  }, [detail]);
  const fieldNames = useMemo(() => new Map(document?.model.fields.map((field) => [field.id, field.name]) ?? []), [document]);
  const loading = requestQuery.isLoading || taskQuery.isLoading;
  const loadError = requestQuery.isError || taskQuery.isError;
  const instanceMismatch = Boolean(detail && task && detail.workflow_instance_id !== task.instanceId);
  const actionable = Boolean(task?.status === 'PENDING' && detail?.status === 'IN_REVIEW' && !instanceMismatch);
  const proposedAvailable = detail?.request_type === 'CHANGE' && Boolean(detail.proposedValues);
  const status = detail ? requestStatus(detail) : null;

  const closeDialog = () => {
    if (busy) return;
    setDecision(null); setOpinion(''); setAccount(''); setPassword(''); setActionError('');
  };

  const locateChangedField = (fieldId: string) => {
    if (!fieldId) return;
    setPreviewMode(proposedAvailable ? 'proposed' : 'source');
    setHighlightFieldId(fieldId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlightFieldId(null), 3000);

    const scrollToField = (attempt = 0) => {
      const fields = previewPanelRef.current?.querySelectorAll<HTMLElement>('[data-form-preview-field]');
      const target = fields ? Array.from(fields).find((element) => element.dataset.formPreviewField === fieldId) : undefined;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        return;
      }
      if (attempt < 5) setTimeout(() => scrollToField(attempt + 1), 60);
      else showMessage('未在当前表单版式中找到该字段，请根据字段名称核对。', 'warning');
    };
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToField()));
  };

  const confirmDecision = async () => {
    if (!decision || !taskId || busy) return;
    if (decision === 'reject' && !opinion.trim()) {
      setActionError('审批退回时必须填写退回原因');
      return;
    }
    if (!account.trim() || !password) {
      setActionError('请输入签署人用户名和签署密码');
      return;
    }
    setBusy(true); setActionError('');
    try {
      await completeRecordControlWorkflowTask(taskId, decision, {
        opinion: opinion.trim(), account: account.trim(), password,
      });
      showMessage(decision === 'approve' ? '审批通过成功' : '审批退回成功', 'success');
      navigate('/records/approvals', { replace: true });
    } catch (error) {
      setActionError(errorText(error));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Box sx={{ height: 'calc(100vh - 150px)', display: 'grid', placeItems: 'center' }}><Stack alignItems="center" spacing={1.5}><CircularProgress size={30} /><Typography variant="body2" color="text.secondary">正在加载审批详情…</Typography></Stack></Box>;
  if (loadError || !detail || !task) return <Alert severity="error" action={<Button color="inherit" onClick={() => navigate('/records/approvals')}>返回列表</Button>}>审批详情加载失败，请确认任务和申请仍然存在。</Alert>;

  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1, overflow: { xs: 'visible', lg: 'hidden' } }}>
    {instanceMismatch && <Alert severity="error">当前任务与申请的流程实例不一致，已禁止审批操作。</Alert>}
    <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' }, gap: 1, overflow: { xs: 'visible', lg: 'hidden' } }}>
      <Paper variant="outlined" sx={{ minHeight: 0, overflow: 'auto', borderColor: '#e4e7ed' }}>
        <Box sx={{ px: 1.5, py: 1.15, bgcolor: '#f8fafc', borderBottom: '1px solid #e4e7ed' }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, color: '#303133' }} noWrap title={detail.template_name || detail.snapshot.name}>{detail.template_name || detail.snapshot.name || '表单变更审批'}</Typography>
            {status && <StatusBadge label={status.label} color={status.color} />}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.4 }}>
            <Typography variant="caption" color="text.secondary" noWrap title={detail.request_no}>{detail.request_no}</Typography>
            <Chip size="small" variant="outlined" label={detail.request_type === 'CHANGE' ? '表单变更' : '表单作废'} sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontSize: 12 } }} />
          </Stack>
        </Box>
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 1.25 }}>
            <DetailField label="表单编码" value={detail.template_code || detail.snapshot.code} />
            <DetailField label="表单实例编号" value={detail.instance_no} />
            <DetailField label="来源修订" value={`Rev.${detail.source_revision_no}`} />
            <DetailField label="申请人" value={detail.applicant_name || detail.applicant_id} />
            <DetailField label="申请时间" value={formatDateTime(detail.submitted_at)} />
            <DetailField label="任务编号" value={task.id} />
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>{detail.request_type === 'CHANGE' ? '变更原因' : '作废原因'}</Typography>
          <Box sx={{ maxHeight: 80, overflow: 'auto', p: 1, borderRadius: 1, border: '1px solid #f3d19e', bgcolor: '#fdf6ec', color: '#7d5b20', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.55 }}>{detail.reason_text || '未填写'}</Box>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box><Typography variant="body2" fontWeight={600}>字段变更明细</Typography><Typography variant="caption" color="text.secondary">点击明细可定位到表单字段</Typography></Box>
            <Chip size="small" label={`${detail.diff?.length ?? 0} 项`} sx={{ height: 22 }} />
          </Stack>
          {detail.diff?.length ? <Stack spacing={0.75}>{detail.diff.map((item, index) => <Box component="button" type="button" onClick={() => locateChangedField(item.fieldId)} key={`${item.fieldPath}-${index}`} sx={{ width: '100%', p: 0, font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer', border: `1px solid ${highlightFieldId === item.fieldId ? '#409eff' : '#e4e7ed'}`, borderRadius: 1, overflow: 'hidden', bgcolor: '#fff', boxShadow: highlightFieldId === item.fieldId ? '0 0 0 2px rgba(64,158,255,.12)' : 'none', transition: 'border-color 160ms ease, box-shadow 160ms ease', '&:hover': { borderColor: '#79bbff', bgcolor: '#f8fbff' }, '&:focus-visible': { outline: '2px solid #409eff', outlineOffset: 2 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ px: 1, py: 0.55, bgcolor: '#f8fafc', borderBottom: '1px solid #ebeef5' }}>
              <Typography variant="body2" fontWeight={600} noWrap title={item.fieldPath}>{fieldNames.get(item.fieldId) || item.fieldPath || item.fieldId}</Typography>
              <Typography variant="caption" sx={{ color: '#e6a23c', flexShrink: 0 }}>{changeTypeLabel(item.changeType)}</Typography>
            </Stack>
            <Box sx={{ px: 1, py: 0.75, display: 'grid', gridTemplateColumns: '24px minmax(0,1fr) 18px 24px minmax(0,1fr)', gap: 0.4, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">原</Typography><Typography variant="body2" noWrap title={displayValue(item.before)} sx={{ color: '#606266' }}>{displayValue(item.before)}</Typography>
              <CompareArrows sx={{ fontSize: 16, color: '#a8abb2' }} />
              <Typography variant="caption" sx={{ color: '#67c23a' }}>新</Typography><Typography variant="body2" noWrap title={displayValue(item.after)} sx={{ color: '#529b2e', fontWeight: 500 }}>{displayValue(item.after)}</Typography>
            </Box>
          </Box>)}</Stack> : <Typography variant="body2" color="text.secondary">本申请没有可展示的字段差异。</Typography>}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ minWidth: 0, minHeight: { xs: 620, lg: 0 }, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: '#e4e7ed' }}>
        <Box sx={{ minHeight: 44, flexShrink: 0, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e4e7ed', bgcolor: '#fff' }}>
          <Tabs value={previewMode} onChange={(_, value: PreviewMode) => setPreviewMode(value)} sx={{ px: 1, minHeight: 44, '& .MuiTab-root': { minHeight: 44, py: 0.75 } }}>
            <Tab value="source" label={`原始内容 · Rev.${detail.source_revision_no}`} />
            {proposedAvailable && <Tab value="proposed" label="拟变更内容" />}
          </Tabs>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', mr: 2, display: { xs: 'none', md: 'block' } }}>表单区域内可独立滚动查看</Typography>
        </Box>
        <Box ref={previewPanelRef} component="section" aria-label={previewMode === 'source' ? '原始表单内容' : '拟变更表单内容'} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1.5, md: 2 }, bgcolor: '#eef3f8' }}>
          {document ? <FormCanvasPreview document={document} fullPage interaction={{ highlightFieldId }} runtime={{
            values: previewMode === 'proposed' ? (detail.proposedValues ?? detail.sourceValues) : detail.sourceValues,
            disabled: true,
            onChange: () => {},
          }} /> : <Alert severity="warning">无法解析当前表单快照。</Alert>}
        </Box>
      </Paper>
    </Box>

    <Paper variant="outlined" sx={{ flexShrink: 0, px: 1.5, py: 0.85, borderColor: '#e4e7ed' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1}>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>{actionable ? '请核对变更原因、差异和表单内容后再处理。' : '当前任务已不可处理，本页仅供查看。'}</Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ ml: { sm: 'auto' } }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/records/approvals')}>返回列表</Button>
          {actionable && <><Button color="error" variant="outlined" startIcon={<Cancel />} onClick={() => setDecision('reject')}>审批退回</Button><Button color="success" variant="contained" startIcon={<CheckCircle />} onClick={() => setDecision('approve')}>审批通过</Button></>}
        </Stack>
      </Stack>
    </Paper>

    <AppDialog open={Boolean(decision)} onClose={closeDialog} fullWidth maxWidth="sm" variant="form">
      <DialogTitle>{decision === 'approve' ? '确认审批通过' : '确认审批退回'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity={decision === 'approve' ? 'success' : 'warning'}>{decision === 'approve' ? `通过后，申请 ${detail.request_no} 将继续流转。` : `退回后，申请 ${detail.request_no} 将终止本次审批。`}</Alert>
          <TextField label={decision === 'reject' ? '退回原因' : '审批意见'} required={decision === 'reject'} value={opinion} onChange={(event) => { setOpinion(event.target.value); setActionError(''); }} multiline minRows={3} disabled={busy} />
          <ButtonSignatureCredentials account={account} password={password} disabled={busy}
            onAccountChange={(value) => { setAccount(value); setActionError(''); }}
            onPasswordChange={(value) => { setPassword(value); setActionError(''); }} />
          {actionError && <Alert severity="error">{actionError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions><Button disabled={busy} onClick={closeDialog}>取消</Button><Button variant="contained" color={decision === 'approve' ? 'success' : 'error'} disabled={busy || !account.trim() || !password || Boolean(decision === 'reject' && !opinion.trim())} onClick={() => void confirmDecision()}>{busy ? '正在处理…' : decision === 'approve' ? '签署并通过' : '签署并退回'}</Button></DialogActions>
    </AppDialog>
  </Box>;
}
