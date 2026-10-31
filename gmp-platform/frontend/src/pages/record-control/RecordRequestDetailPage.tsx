import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { ArrowBack, CompareArrows } from '@mui/icons-material';
import StatusBadge from '@/components/StatusBadge';
import { useSnackbar } from '@/components/SnackbarProvider';
import ConfirmDialog from '@/components/ConfirmDialog';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import {
  getRecordControlRequest,
  withdrawRecordControlRequest,
  listRecordRevisions,
  type RecordControlRequestDetail,
} from '@/api/record-control';

type PreviewMode = 'source' | 'proposed';

function formatDateTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : '—';
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '空';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

function requestStatus(detail: RecordControlRequestDetail) {
  if (detail.status === 'IN_REVIEW') return { label: '审批中', color: 'warning' as const };
  if (detail.status === 'APPROVED') return { label: '已通过', color: 'success' as const };
  if (detail.status === 'RETURNED') return { label: '已退回', color: 'error' as const };
  return { label: '已撤回', color: 'default' as const };
}

function eventStatusLabel(status: RecordControlRequestDetail['status']) {
  if (status === 'IN_REVIEW') return '已提交·审批中';
  if (status === 'APPROVED') return '审批通过';
  if (status === 'RETURNED') return '审批退回';
  return '已撤回';
}

function revisionStatusLabel(status: string) {
  if (status === 'EFFECTIVE') return '当前有效';
  if (status === 'SUPERSEDED') return '已替代';
  if (status === 'OBSOLETE') return '已作废';
  return status || '—';
}

function changeTypeLabel(value: string) {
  return ({
    FIELD_CHANGED: '值已修改', ROW_ADDED: '新增行', ROW_REMOVED: '删除行',
    FILE_ADDED: '新增附件', FILE_REMOVED: '移除附件', FILE_CHANGED: '附件已修改',
  } as Record<string, string>)[value] ?? '内容已变更';
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ display: 'block', mb: 0.25, color: '#909399' }}>{label}</Typography>
    <Typography component="div" variant="body2" title={typeof value === 'string' ? value : undefined} sx={{ color: '#303133', wordBreak: 'break-word' }}>{value || '—'}</Typography>
  </Box>;
}

export default function RecordRequestDetailPage() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawBusy, setWithdrawBusy] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const withdrawing = useRef(false);
  const reasonInput = useRef<HTMLInputElement>();
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const [previewMode, setPreviewMode] = useState<PreviewMode>('source');
  const [highlightFieldId, setHighlightFieldId] = useState<string | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
  }, []);

  const request = useQuery({
    queryKey: ['record-control-request', requestId],
    queryFn: () => getRecordControlRequest(requestId!),
    enabled: Boolean(requestId),
    retry: false,
  });
  const detail = request.data;
  const revisions = useQuery({
    queryKey: ['record-control-revisions', detail?.record_id],
    queryFn: () => listRecordRevisions(detail!.record_id),
    enabled: Boolean(detail?.record_id),
    retry: false,
  });
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
  const proposedAvailable = detail?.request_type === 'CHANGE' && Boolean(detail.proposedValues);

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

  if (request.isLoading) return <Box sx={{ height: 'calc(100vh - 150px)', display: 'grid', placeItems: 'center' }}><Stack alignItems="center" spacing={1.5}><CircularProgress size={30} /><Typography variant="body2" color="text.secondary">正在加载申请详情…</Typography></Stack></Box>;
  if (request.isError || !detail) return <Alert severity="error" action={<Button color="inherit" onClick={() => navigate(-1)}>返回</Button>}>申请详情加载失败，请稍后重试。</Alert>;

  const status = requestStatus(detail);
  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1, overflow: { xs: 'visible', lg: 'hidden' } }}>
    <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0,1fr)' }, gap: 1, overflow: { xs: 'visible', lg: 'hidden' } }}>
      <Paper variant="outlined" sx={{ minHeight: 0, overflow: 'auto', borderColor: '#e4e7ed' }}>
        <Box sx={{ px: 1.5, py: 1.15, bgcolor: '#f8fafc', borderBottom: '1px solid #e4e7ed' }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, color: '#303133' }} noWrap title={detail.template_name || detail.snapshot.name}>{detail.template_name || detail.snapshot.name || '申请详情'}</Typography>
            <StatusBadge label={status.label} color={status.color} />
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
            <DetailField label="完成时间" value={formatDateTime(detail.resolved_at)} />
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>{detail.request_type === 'CHANGE' ? '变更原因' : '作废原因'}</Typography>
          <Box sx={{ maxHeight: 80, overflow: 'auto', p: 1, borderRadius: 1, border: '1px solid #f3d19e', bgcolor: '#fdf6ec', color: '#7d5b20', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.55 }}>{detail.reason_text || '未填写'}</Box>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box><Typography variant="body2" fontWeight={600}>字段变更明细</Typography><Typography variant="caption" color="text.secondary">点击明细定位到表单字段</Typography></Box>
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

          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>申请处理轨迹</Typography>
          <Stack spacing={0.75}>{detail.statusHistory.map((event, index) => <Box key={event.eventId || index} sx={{ display: 'grid', gridTemplateColumns: '8px minmax(0,1fr)', gap: 0.75, alignItems: 'start' }}>
            <Box sx={{ width: 7, height: 7, mt: 0.65, borderRadius: '50%', bgcolor: event.status === 'APPROVED' ? '#67c23a' : event.status === 'RETURNED' ? '#f56c6c' : '#409eff' }} />
            <Box><Typography variant="caption" sx={{ display: 'block', color: '#303133', fontWeight: 500 }}>{eventStatusLabel(event.status)}</Typography><Typography variant="caption" color="text.secondary">{formatDateTime(event.occurredAt)}{event.operatorId ? ` · ${event.operatorId}` : ''}</Typography></Box>
          </Box>)}</Stack>

          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>表单修订记录</Typography>
          {revisions.isLoading ? <CircularProgress size={18} /> : revisions.isError ? <Typography variant="caption" color="error">修订记录加载失败</Typography> : <Stack spacing={0.6}>{revisions.data?.map((revision) => <Stack key={revision.id} direction="row" justifyContent="space-between" spacing={1}><Typography variant="caption" sx={{ color: '#303133' }}>Rev.{revision.revision_no} · {revisionStatusLabel(revision.status)}</Typography><Typography variant="caption" color="text.secondary">{formatDateTime(revision.created_at)}</Typography></Stack>)}</Stack>}

          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>审计关联</Typography>
          <Stack spacing={0.6}>
            <DetailField label="流程实例" value={detail.workflow_instance_id} />
            <DetailField label="申请人签名记录" value={detail.applicant_signature_id} />
            <DetailField label="审计关联号" value={detail.audit_correlation_id} />
          </Stack>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ minWidth: 0, minHeight: { xs: 620, lg: 0 }, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: '#e4e7ed' }}>
        <Box sx={{ minHeight: 44, flexShrink: 0, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e4e7ed', bgcolor: '#fff' }}>
          <Tabs value={previewMode} onChange={(_, value: PreviewMode) => setPreviewMode(value)} sx={{ px: 1, minHeight: 44, '& .MuiTab-root': { minHeight: 44, py: 0.75 } }}>
            <Tab value="source" label={`原始内容 · Rev.${detail.source_revision_no}`} />
            {proposedAvailable && <Tab value="proposed" label={detail.status === 'APPROVED' ? '变更内容 · 已生效' : '拟变更内容'} />}
          </Tabs>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', mr: 2, display: { xs: 'none', md: 'block' } }}>表单区域内可独立滚动查看</Typography>
        </Box>
        {detail.status === 'RETURNED' && <Alert severity="info" sx={{ m: 1, mb: 0 }}>本次申请已退回并终结，右侧内容仅供历史追溯。</Alert>}
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>原业务签名属于历史修订；申请与审批签名作为本次授权证据。</Typography>
        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          {detail.canWithdraw && <Button color="error" variant="outlined" onClick={() => { setWithdrawReason(''); setWithdrawError(''); setWithdrawOpen(true); }}>撤回申请</Button>}
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>返回列表</Button>
        </Stack>
      </Stack>
    </Paper>
    <ConfirmDialog open={withdrawOpen} title="撤回申请" confirmText="撤回申请" destructive initialFocus="cancel"
      message={`撤回申请 ${detail.request_no} 后，本轮全部待办将失效，原有效表单保持不变。仅本轮尚无批准或退回决定时允许撤回。`}
      loading={withdrawBusy} onCancel={() => { if (!withdrawBusy) setWithdrawOpen(false); }} onConfirm={() => {
        if (withdrawing.current) return;
        if (!withdrawReason.trim()) { setWithdrawError('请填写撤回原因'); reasonInput.current?.focus(); return; }
        withdrawing.current = true; setWithdrawBusy(true); setWithdrawError('');
        void withdrawRecordControlRequest(detail.id, withdrawReason.trim()).then(async () => {
          setWithdrawOpen(false); showMessage('申请已撤回', 'success'); await request.refetch();
        }).catch(error => setWithdrawError(error instanceof Error ? error.message : '撤回失败，请重试'))
          .finally(() => { withdrawing.current = false; setWithdrawBusy(false); });
      }}>
      <TextField inputRef={reasonInput} label="撤回原因" required multiline minRows={3} fullWidth size="small" sx={{ mt: 2 }}
        disabled={withdrawBusy} value={withdrawReason} onChange={event => { setWithdrawReason(event.target.value); setWithdrawError(''); }}
        inputProps={{ maxLength: 500 }} error={Boolean(withdrawError)} helperText={withdrawError || `${withdrawReason.length}/500`} />
    </ConfirmDialog>
  </Box>;
}
