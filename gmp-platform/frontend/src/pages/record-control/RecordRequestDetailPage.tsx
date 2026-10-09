import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { getRecordControlRequest, listRecordRevisions } from '@/api/record-control';

export default function RecordRequestDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const request = useQuery({ queryKey: ['record-control-request', requestId], queryFn: () => getRecordControlRequest(requestId!), enabled: Boolean(requestId) });
  const revisions = useQuery({ queryKey: ['record-control-revisions', request.data?.record_id],
    queryFn: () => listRecordRevisions(request.data!.record_id), enabled: Boolean(request.data?.record_id) });
  const detail = request.data;
  const document = useMemo(() => {
    if (!detail) return null;
    const form = detail.snapshot;
    const parsed = parseReactTemplateDesignerDocument({ id: detail.record_id, name: form.name }, {
      id: form.versionId, version: form.version, modelDesignJson: form.model, canvasDesignJson: form.canvas,
    });
    parsed.model.fields = form.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {},
      status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
    return parsed;
  }, [detail]);

  return <Box>
    <PageHeader title="申请详情" subtitle={detail ? `${detail.request_no} · ${detail.request_type === 'CHANGE' ? '表单变更' : '表单作废'}` : undefined}
      breadcrumbs={[{ label: '记录' }, { label: '变更管理' }, { label: '申请详情' }]}
      actions={<Button onClick={() => navigate(-1)}>返回</Button>} />
    {request.isLoading && <CircularProgress />}
    {request.isError && <Alert severity="error">申请详情加载失败，请稍后重试。</Alert>}
    {detail && <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box><Typography fontWeight={600}>{detail.request_no}</Typography>
            <Typography variant="body2" color="text.secondary">表单实例编号：{detail.instance_no} · 来源修订 Rev.{detail.source_revision_no}</Typography>
            <Typography variant="body2" color="text.secondary">申请人：{detail.applicant_name || detail.applicant_id} · {detail.submitted_at?.replace('T', ' ')}</Typography>
            <Typography variant="body2" color="text.secondary">申请人签名记录：{detail.applicant_signature_id}</Typography>
          </Box>
          <Chip label={detail.status === 'IN_REVIEW' ? '审批中' : detail.status === 'APPROVED' ? '审批通过' : detail.status === 'RETURNED' ? '已退回' : '已撤回'}
            color={detail.status === 'IN_REVIEW' ? 'warning' : detail.status === 'APPROVED' ? 'success' : detail.status === 'RETURNED' ? 'error' : 'default'} />
        </Stack>
        <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}><strong>{detail.request_type === 'CHANGE' ? '变更原因' : '作废原因'}：</strong>{detail.reason_text}</Typography>
        {detail.workflow_instance_id && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          流程实例：{detail.workflow_instance_id} · 审批轨迹待公共流程接口接通后展示
        </Typography>}
      </Paper>
      {detail.status === 'RETURNED' && <Alert severity="info">本次申请已终结且只读。如需再次变更或作废，请从当前有效修订重新发起新申请。</Alert>}
      <Alert severity="info">原表单业务签名仅属于历史修订。申请与审批签名是本次授权证据，不代表对新修订表单内容重新签署。</Alert>
      <Paper variant="outlined" sx={{ p: 2 }}><Typography fontWeight={600} sx={{ mb: 1 }}>申请状态历史</Typography>
        {detail.statusHistory.map((event, index) => <Typography key={event.eventId || index} variant="body2" sx={{ py: 0.5 }}>
          {event.status === 'IN_REVIEW' ? '已提交 · 审批中' : event.status === 'APPROVED' ? '审批通过' : event.status === 'RETURNED' ? '已退回' : '已撤回'}
          {' · '}{event.occurredAt?.replace('T', ' ') || '时间未知'}{event.operatorId ? ` · 操作人 ${event.operatorId}` : ''}
        </Typography>)}
      </Paper>
      {detail.diff?.length ? <Paper variant="outlined" sx={{ p: 2 }}><Typography fontWeight={600} sx={{ mb: 1 }}>字段差异</Typography>
        <Stack spacing={1}>{detail.diff.map((item) => <Box key={item.fieldPath} sx={{ p: 1, borderRadius: 1, bgcolor: '#fff8f2' }}>
          <Typography variant="body2" fontWeight={600}>变更位置：{item.fieldPath} · {item.changeType === 'ROW_ADDED' ? '新增行' : item.changeType === 'ROW_REMOVED' ? '删除行' : item.changeType === 'FILE_ADDED' ? '新增附件' : item.changeType === 'FILE_REMOVED' ? '移除附件' : '修改'}</Typography>
          <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>原值：{JSON.stringify(item.before)} → 拟变更：{JSON.stringify(item.after)}</Typography>
        </Box>)}</Stack>
      </Paper> : null}
      {document && <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, p: 2, maxHeight: 680, overflow: 'auto' }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>来源修订 Rev.{detail.source_revision_no}</Typography>
          <FormCanvasPreview document={document} runtime={{ values: detail.sourceValues, disabled: true, onChange: () => {} }} />
        </Paper>
        {detail.request_type === 'CHANGE' && detail.proposedValues && <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, p: 2, maxHeight: 680, overflow: 'auto' }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>拟变更内容{detail.status === 'APPROVED' ? ' · 已生效' : ''}</Typography>
          <FormCanvasPreview document={document} runtime={{ values: detail.proposedValues, disabled: true, onChange: () => {} }} />
        </Paper>}
      </Stack>}
      <Paper variant="outlined" sx={{ p: 2 }}><Typography fontWeight={600} sx={{ mb: 1 }}>表单修订历史</Typography>
        {revisions.isLoading && <CircularProgress size={20} />}
        {revisions.data?.map((revision) => <Typography key={revision.id} variant="body2" sx={{ py: 0.5 }}>
          Rev.{revision.revision_no} · {revision.status === 'EFFECTIVE' ? '当前有效' : revision.status === 'SUPERSEDED' ? '已替代' : '已作废'}
          {' · '}{revision.created_by || '创建人未知'} · {revision.created_at?.replace('T', ' ') || '创建时间未知'}
        </Typography>)}
      </Paper>
    </Stack>}
  </Box>;
}
