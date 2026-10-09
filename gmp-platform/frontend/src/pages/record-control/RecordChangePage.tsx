import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
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
  const [activeRequestNoticeOpen, setActiveRequestNoticeOpen] = useState(false);

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
    if (!number.trim()) { setError('请输入表单实例编号'); return; }
    if (mode === 'CHANGE' && modified && !window.confirm('当前拟变更内容尚未提交，重新查询将丢弃修改。确定继续吗？')) return;
    setLoading(true); setError(''); setRequestId(null); setMode('READ'); setActiveRequestNoticeOpen(false);
    try {
      const found = await findRecordByNumber(number.trim());
      setRecord(found); setValues(structuredClone(found.fieldValues));
      setActiveRequestNoticeOpen(Boolean(found.active_request_id && found.active_request_no));
    } catch (cause) {
      setRecord(null); setActiveRequestNoticeOpen(false); setError(cause instanceof Error ? cause.message : '查询失败');
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

  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: { xs: 'visible', lg: 'hidden' } }}>
    {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>{error}</Alert>}
    {requestId && <Alert severity="success" sx={{ mb: 1.5 }} action={<Button onClick={() => navigate(`/records/requests/${requestId}`)}>查看申请</Button>}>
      申请已提交，原表单仍保持已完成状态，等待审批。
    </Alert>}
    <Snackbar open={!requestId && activeRequestNoticeOpen && Boolean(record?.active_request_id && record.active_request_no)}
      autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={(_, reason) => { if (reason !== 'clickaway') setActiveRequestNoticeOpen(false); }}
      sx={{ top: { xs: '72px !important', md: '132px !important' }, maxWidth: 'min(760px, calc(100vw - 32px))' }}>
      <Alert severity="warning" variant="standard" onClose={() => setActiveRequestNoticeOpen(false)}
        sx={{ width: '100%', border: '1px solid', borderColor: 'warning.light', boxShadow: 4 }}>
        该表单存在正在进行中的{record?.active_request_type === 'OBSOLETE' ? '作废' : '变更'}申请，申请编号：
        <Button size="small" variant="text" aria-label={`查看申请 ${record?.active_request_no ?? ''}`}
          sx={{ minWidth: 0, p: 0, mx: 0.5, verticalAlign: 'baseline' }}
          onClick={() => { if (record?.active_request_id) navigate(`/records/requests/${record.active_request_id}`); }}>{record?.active_request_no}</Button>
        。请先完成当前申请后再发起新申请。
      </Alert>
    </Snackbar>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1, minHeight: 0, overflow: { xs: 'visible', lg: 'hidden' } }}>
      <Paper variant="outlined" sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0, minHeight: 0, p: 2.5, alignSelf: 'stretch', overflowY: { xs: 'visible', lg: 'auto' } }}>
        <Typography fontWeight={600} sx={{ mb: 2 }}>查询表单</Typography>
        <Stack direction="row" spacing={1.5}>
          <TextField size="small" fullWidth label="表单实例编号" value={number} onChange={(event) => setNumber(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') void search(); }} />
          <Button variant="contained" disabled={loading} onClick={() => void search()}>查询</Button>
        </Stack>
        {record && <Box sx={{ mt: 2.5 }}>
          <Divider sx={{ mb: 2 }} />
          <Info label="表单名称" value={record.template_name} />
          <Info label="表单编码" value={record.template_code} />
          <Info label="表单实例编号" value={record.instance_no} />
          <Info label="模板版本" value={`V${record.version_number}`} />
          <Info label="当前修订" value={record.revision_no ? `Rev.${record.revision_no}` : '无'} />
          <Info label="创建人" value={record.created_by || '未知'} />
          <Info label="创建时间" value={displayDateTime(record.created_at)} />
          <Info label="更新人" value={record.updated_by || '未知'} />
          <Info label="更新时间" value={displayDateTime(record.updated_at)} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr)', columnGap: 1.5, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">表单状态</Typography>
            <Chip size="small" sx={{ justifySelf: 'start' }}
              label={record.status === 'COMPLETED' ? '已完成' : record.status === 'OBSOLETE' ? '已作废' : record.status} />
          </Box>
          {!eligible && !record.active_request_id && <Alert severity="info" sx={{ mt: 2 }}>仅已完成且有有效修订的表单可以发起申请。</Alert>}
        </Box>}
      </Paper>
      <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, minHeight: 0, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {loading && !record ? <CircularProgress /> : record && document && runtime
            ? <>{Object.keys(record.fieldValues).length === 0 && record.snapshot.fields.length > 0 &&
                <Alert severity="warning" sx={{ mb: 2, flexShrink: 0 }}>当前实例没有已保存的字段值；下方内容不能作为原始填报记录{mode === 'CHANGE' ? '，新填写的内容仅是未提交的变更草稿' : ''}。请先核对生产执行中的保存记录。</Alert>}
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
                <FormCanvasPreview document={document} runtime={runtime} />
              </Box></>
            : <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>
              <Typography color="text.secondary">请先输入表单实例编号并查询</Typography>
            </Box>}
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 1.5, flexShrink: 0, borderTop: '1px solid #e4e7ed', bgcolor: '#fff' }}>
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
  return <Box sx={{ display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr)', columnGap: 1.5, mb: 1.5, alignItems: 'start' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
  </Box>;
}

function displayDateTime(value: string | null): string {
  return value ? value.replace('T', ' ').slice(0, 19) : '未知';
}
