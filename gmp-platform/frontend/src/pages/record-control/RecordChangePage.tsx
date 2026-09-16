import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { uploadExecutionFile } from '@/api/production-execution';
import { listPublishedRecordControlWorkflowCandidates, type PublishedRecordControlWorkflowCandidate,
  type RecordControlBusinessType } from '@/api/record-control-workflow';
import { findRecordByNumber, getRecordControlReferences, submitRecordControlRequest,
  type RecordControlRecord } from '@/api/record-control';

type Mode = 'READ' | RecordControlBusinessType;

export default function RecordChangePage() {
  const navigate = useNavigate();
  const [number, setNumber] = useState('');
  const [record, setRecord] = useState<RecordControlRecord | null>(null);
  const [mode, setMode] = useState<Mode>('READ');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [candidates, setCandidates] = useState<PublishedRecordControlWorkflowCandidate[]>([]);
  const [workflowVersionId, setWorkflowVersionId] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');

  const document = useMemo(() => {
    if (!record) return null;
    const form = record.snapshot;
    const parsed = parseReactTemplateDesignerDocument({ id: record.id, name: form.name }, {
      id: form.versionId, version: form.version, modelDesignJson: form.model, canvasDesignJson: form.canvas,
    });
    parsed.model.fields = form.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {},
      status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
    return parsed;
  }, [record]);

  const eligible = record?.status === 'COMPLETED' && Boolean(record.current_revision_id) && !record.active_request_id;
  const modified = record && JSON.stringify(values) !== JSON.stringify(record.fieldValues);
  const selectedCandidate = candidates.find((item) => item.workflowVersionId === workflowVersionId);

  const search = useCallback(async () => {
    if (!number.trim()) { setError('请输入表单流水号'); return; }
    if (mode === 'CHANGE' && modified && !window.confirm('当前拟变更内容尚未提交，重新查询将丢弃修改。确定继续吗？')) return;
    setLoading(true); setError(''); setRequestId(null); setMode('READ');
    try {
      const found = await findRecordByNumber(number.trim());
      setRecord(found); setValues(structuredClone(found.fieldValues));
    } catch (cause) {
      setRecord(null); setError(cause instanceof Error ? cause.message : '查询失败');
    } finally { setLoading(false); }
  }, [number, mode, modified]);

  const chooseMode = async (next: RecordControlBusinessType) => {
    if (!record || !eligible) return;
    setMode(next); setValues(structuredClone(record.fieldValues)); setReason(''); setPassword('');
    setWorkflowVersionId(''); setCandidates([]); setError('');
    try { setCandidates(await listPublishedRecordControlWorkflowCandidates(next)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '可用审批流程加载失败'); }
  };

  const openConfirmation = () => {
    if (mode === 'CHANGE' && !modified) { setError('表单内容没有实际变化'); return; }
    setIdempotencyKey(crypto.randomUUID()); setDialog(true); setError('');
  };

  const confirm = async () => {
    if (!record?.current_revision_id || mode === 'READ' || !selectedCandidate) return;
    setLoading(true); setError('');
    try {
      const submitted = await submitRecordControlRequest({
        requestType: mode, instanceNo: record.instance_no, sourceRevisionId: record.current_revision_id,
        proposedValues: mode === 'CHANGE' ? values : undefined, reason: reason.trim(),
        workflowDefinitionId: selectedCandidate.workflowDefinitionId,
        workflowVersionId: selectedCandidate.workflowVersionId, account, password, idempotencyKey,
      });
      setRequestId(submitted.id); setDialog(false); setPassword(''); setMode('READ');
      const fresh = await findRecordByNumber(record.instance_no);
      setRecord(fresh); setValues(structuredClone(fresh.fieldValues));
    } catch (cause) { setError(cause instanceof Error ? cause.message : '申请提交失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (mode !== 'CHANGE' || !modified) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [mode, modified]);

  const runtime = record ? {
    values: mode === 'CHANGE' ? values : record.fieldValues,
    disabled: mode !== 'CHANGE' || loading,
    rowIdentity: true,
    onChange: (fieldId: string, value: unknown) => setValues((current) => ({ ...current, [fieldId]: value })),
    upload: (file: File) => uploadExecutionFile(record.object_id, file),
    references: (fieldId: string, keyword: string) => getRecordControlReferences(record.id, fieldId, keyword),
  } : undefined;

  return <Box sx={{ height: '100%', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
    <PageHeader title="记录变更" subtitle="按表单流水号查询，在同一入口申请表单变更或作废"
      breadcrumbs={[{ label: '记录' }, { label: '变更管理' }, { label: '记录变更' }]} />
    {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>{error}</Alert>}
    {requestId && <Alert severity="success" sx={{ mb: 1.5 }} action={<Button onClick={() => navigate(`/records/requests/${requestId}`)}>查看申请</Button>}>
      申请已提交，原表单仍保持已完成状态，等待审批。
    </Alert>}
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      <Paper variant="outlined" sx={{ width: { xs: '100%', md: 310 }, flexShrink: 0, p: 2, alignSelf: 'stretch' }}>
        <Typography fontWeight={600} sx={{ mb: 1.5 }}>查询表单</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" fullWidth label="表单流水号" value={number} onChange={(event) => setNumber(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') void search(); }} />
          <Button variant="contained" disabled={loading} onClick={() => void search()}>查询</Button>
        </Stack>
        {record && <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Info label="表单名称" value={record.template_name} />
          <Info label="表单编码" value={record.template_code} />
          <Info label="流水号" value={record.instance_no} />
          <Info label="模板版本" value={`V${record.version_number}`} />
          <Info label="当前修订" value={record.revision_no ? `Rev.${record.revision_no}` : '无'} />
          <Info label="创建人/时间" value={`${record.created_by || '未知'} · ${record.created_at || '未知'}`} />
          <Info label="更新人/时间" value={`${record.updated_by || '未知'} · ${record.updated_at || '未知'}`} />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Chip size="small" label={record.status === 'COMPLETED' ? '已完成' : record.status === 'OBSOLETE' ? '已作废' : record.status} />
            {record.active_request_no && <Chip size="small" color="warning" label={`${record.active_request_type === 'CHANGE' ? '变更' : '作废'}审批中`} />}
          </Stack>
          {record.active_request_no && <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/records/requests/${record.active_request_id}`)}>
            {record.active_request_no} · 查看申请
          </Button>}
          {!eligible && !record.active_request_id && <Alert severity="info" sx={{ mt: 2 }}>仅已完成且有有效修订的表单可以发起申请。</Alert>}
        </Box>}
      </Paper>
      <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e4e7ed' }}>
          <Box><Typography fontWeight={600}>{record?.snapshot.name || '表单内容'}</Typography>
            {record && <Typography variant="caption" color="text.secondary">模板版本 V{record.version_number} · 当前修订 Rev.{record.revision_no || '—'}</Typography>}</Box>
          {mode !== 'READ' && <Chip size="small" color="primary" label={mode === 'CHANGE' ? '拟变更 · 未提交' : '拟作废 · 原文只读'} />}
        </Stack>
        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 320, p: 2 }}>
          {loading && !record ? <CircularProgress /> : record && document && runtime
            ? <><Alert severity="info" sx={{ mb: 2 }}>原业务签名仅属于历史修订；申请人与审批人签名不会被显示为对新修订内容的重新签署。</Alert>
              <FormCanvasPreview document={document} runtime={runtime} /></>
            : <Typography color="text.secondary" textAlign="center" sx={{ mt: 12 }}>请先输入表单流水号并查询</Typography>}
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 1.5, borderTop: '1px solid #e4e7ed', bgcolor: '#fff' }}>
          {mode === 'READ' ? <>
            <Button disabled={!eligible || loading} onClick={() => void chooseMode('CHANGE')}>表单变更</Button>
            <Button color="error" disabled={!eligible || loading} onClick={() => void chooseMode('OBSOLETE')}>表单作废</Button>
          </> : <>
            <Button onClick={() => { setMode('READ'); setValues(structuredClone(record?.fieldValues ?? {})); }}>取消</Button>
            <Button variant="contained" disabled={loading || (mode === 'CHANGE' && !modified)} onClick={openConfirmation}>提交{mode === 'CHANGE' ? '变更' : '作废'}审批</Button>
          </>}
        </Stack>
      </Paper>
    </Stack>
    <Dialog open={dialog} onClose={loading ? undefined : () => setDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>确认提交{mode === 'CHANGE' ? '表单变更' : '表单作废'}申请</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField multiline minRows={3} fullWidth required label={mode === 'CHANGE' ? '变更原因' : '作废原因'} value={reason}
          onChange={(event) => setReason(event.target.value)} inputProps={{ maxLength: 2000 }} />
        <TextField select fullWidth required label="审批流程版本" value={workflowVersionId}
          onChange={(event) => setWorkflowVersionId(event.target.value)} helperText="必须显式选择匹配类型的已发布流程版本">
          {candidates.map((candidate) => <MenuItem key={candidate.workflowVersionId} value={candidate.workflowVersionId}>
            {candidate.templateName} · V{candidate.versionNumber}
          </MenuItem>)}
        </TextField>
        {!candidates.length && <Alert severity="warning">暂无可用审批流程。若账号无权读取候选流程，请联系公共流程负责人处理接口开放范围。</Alert>}
        <TextField fullWidth required label="签署账号" value={account} onChange={(event) => setAccount(event.target.value)} />
        <TextField fullWidth required type="password" label="签署密码" value={password} onChange={(event) => setPassword(event.target.value)} />
      </Stack></DialogContent>
      <DialogActions><Button disabled={loading} onClick={() => setDialog(false)}>取消</Button>
        <Button variant="contained" disabled={loading || !reason.trim() || !selectedCandidate || !account.trim() || !password}
          onClick={() => void confirm()}>{loading ? '提交中…' : '签署并确认提交'}</Button>
      </DialogActions>
    </Dialog>
  </Box>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <Stack direction="row" spacing={1} sx={{ mb: 1 }}><Typography variant="body2" color="text.secondary" sx={{ width: 78, flexShrink: 0 }}>{label}</Typography>
    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{value}</Typography></Stack>;
}
