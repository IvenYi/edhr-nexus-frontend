import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Close, ExpandMore, InfoOutlined, PlayCircleOutline, PreviewOutlined, RestartAlt, Search } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import TableStateCell from '@/components/TableStateCell';
import StatusBadge from '@/components/StatusBadge';
import { listColumnResizeHandleSx } from '@/components/listTableStyles';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import { useSnackbar } from '@/components/SnackbarProvider';
import { getAuditLogs, type AuditLogItem } from '@/api/audit';
import {
  getFormWorklistDetail,
  listFormWorklist,
  type FormWorklistDetail,
  type FormWorklistIdentity,
  type FormWorklistQuery,
  type FormWorklistRow,
  type FormWorklistView,
} from '@/api/form-instance-records';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { toProductionAuditFields, type ProductionAuditField } from '@/utils/productionAudit';
import {
  executeProduction,
  getExecutionReferences,
  uploadExecutionFile,
  type ExecutionButton,
  type ExecutionValues,
} from '@/api/production-execution';
import type { PageResult } from '@/types/common';
import {
  formListAdvancedGridSx,
  formListFieldSx,
  formListFilterActionsSx,
  formListQueryGridSx,
  formListQueryPanelSx,
  formTableBodyCellSx,
  formTableHeaderCellSx,
  FormListPagination,
} from './formManagementListStyles';

const headerCellSx = formTableHeaderCellSx;
const bodyCellSx = formTableBodyCellSx;
const fieldSx = formListFieldSx;
const actionHeadSx = { position: 'sticky' as const, right: 0, zIndex: 4, width: 96, minWidth: 96, maxWidth: 96, textAlign: 'center' as const, bgcolor: '#f5f7fa', backgroundClip: 'padding-box', borderLeft: '1px solid #e4e7ed', boxShadow: '-6px 0 8px -8px rgba(0, 0, 0, 0.35)' };
const actionBodySx = { position: 'sticky' as const, right: 0, zIndex: 2, width: 96, minWidth: 96, maxWidth: 96, textAlign: 'center' as const, bgcolor: '#fff', backgroundClip: 'padding-box', borderLeft: '1px solid #e4e7ed', boxShadow: '-6px 0 8px -8px rgba(0, 0, 0, 0.2)' };
const drawerRootSx = { top: 0, bottom: 0, zIndex: (theme: { zIndex: { drawer: number } }) => theme.zIndex.drawer + 2 };
const drawerPaperSx = { width: { xs: '100vw', sm: 560 }, top: 0, bottom: 0, height: '100vh', transform: 'none !important' };

type FillingView = Extract<FormWorklistView, 'FILLABLE' | 'CREATED' | 'FILLED'>;
type FillingColumnId = 'instanceNo' | 'template' | 'creationType' | 'productionObject' | 'workOrder' | 'operation' | 'status' | 'node' | 'updatedAt' | 'actions';
const FILLING_COLUMNS: ReadonlyArray<{ id: FillingColumnId; label: string; width: number; minWidth: number }> = [
  { id: 'instanceNo', label: '表单实例号', width: 170, minWidth: 150 },
  { id: 'template', label: '表单模板', width: 210, minWidth: 170 },
  { id: 'creationType', label: '创建类型', width: 110, minWidth: 96 },
  { id: 'productionObject', label: '生产对象', width: 180, minWidth: 150 },
  { id: 'workOrder', label: '工单', width: 160, minWidth: 140 },
  { id: 'operation', label: '工序', width: 150, minWidth: 120 },
  { id: 'status', label: '填报状态', width: 120, minWidth: 96 },
  { id: 'node', label: '当前节点', width: 130, minWidth: 110 },
  { id: 'updatedAt', label: '更新时间', width: 170, minWidth: 150 },
  { id: 'actions', label: '操作', width: 96, minWidth: 96 },
];
const PENDING_INSTANCE_LABEL = '待生成';
const INSTANCE_NUMBER_TIP = '表单实例号在首次保存成功后生成；“待生成”表示填报任务已经到达，但尚未形成表单实例。';
interface FilterDraft { keyword: string; instanceNo: string; templateName: string; productionObjectNo: string; workOrderNo: string; productionObjectType: string; recordStatus: string; saved: string }

const views: Array<{ id: FillingView; label: string; helper: string }> = [
  { id: 'FILLABLE', label: '我的填报', helper: '当前到达本人、可以继续处理的填写记录' },
  { id: 'CREATED', label: '我的创建', helper: '本人在生产执行中主动添加的自定义表单或新增份' },
  { id: 'FILLED', label: '我的已填', helper: '本人成功提交过的填写记录' },
];

function formatDateTime(value?: string | null) { return value ? value.replace('T', ' ').slice(0, 19) : '-'; }
function errorText(error: unknown) { return (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error)?.message || '操作失败，请重试'; }
function typeLabel(type?: string | null) { return type === 'SN' ? 'SN' : type === 'BATCH' ? '批次' : type || '-'; }
function creationTypeLabel(type?: FormWorklistRow['creationType']) { return type === 'CUSTOM_FORM' ? '自定义表单' : type === 'ADDED_COPY' ? '新增份' : '-'; }
function statusBadge(status?: string | null) {
  const meta: Record<string, { label: string; color: 'success' | 'info' | 'default' }> = {
    ACTIVE: { label: '进行中', color: 'info' }, COMPLETED: { label: '已完成', color: 'success' },
  };
  const item = meta[status || ''] || { label: status || '-', color: 'default' as const };
  return <StatusBadge label={item.label} color={item.color} />;
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
    <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e4e7ed', bgcolor: '#f8fafc' }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#303133' }}>{title}</Typography></Box>
    <Box sx={{ p: 1.5 }}>{children}</Box>
  </Box>;
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ color: '#909399', display: 'block', mb: 0.35 }}>{label}</Typography><Typography component="div" variant="body2" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value === null || value === undefined || value === '' ? '-' : value}</Typography></Box>;
}

function PreviewSummaryField({ label, value }: { label: string; value: ReactNode }) {
  return <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: '#909399', flexShrink: 0, lineHeight: 1.4 }}>{label}</Typography>
    <Typography variant="body2" noWrap sx={{ minWidth: 0, color: '#303133', fontWeight: 500, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', fontVariantNumeric: 'tabular-nums' }}>{value === null || value === undefined || value === '' ? '-' : value}</Typography>
  </Stack>;
}

function AuditFieldBlock({ title, fields }: { title: string; fields: ProductionAuditField[] }) {
  return <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#f8fafc', p: 1, minWidth: 0 }}><Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: '#606266', fontWeight: 600 }}>{title}</Typography><Stack spacing={0.75}>{fields.length === 0 ? <Typography variant="caption" sx={{ color: '#909399' }}>无</Typography> : fields.map((field) => <Box key={field.key} sx={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: 1 }}><Typography variant="caption" sx={{ color: '#606266' }}>{field.label}</Typography><Typography variant="caption" sx={{ color: '#303133', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{field.value}</Typography></Box>)}</Stack></Box>;
}

async function loadProductionAuditLogs(productionObjectId: string, operationId?: string): Promise<AuditLogItem[]> {
  const pageSize = 200;
  const firstResponse = await getAuditLogs({ entityType: 'PRODUCTION_EXECUTION', entityId: productionObjectId, page: 1, size: pageSize });
  const firstPage = (firstResponse.data.data as PageResult<AuditLogItem>) || { content: [], totalPages: 0 };
  const pages = [firstPage];
  for (let page = 2; page <= (firstPage.totalPages ?? 0); page += 1) {
    const response = await getAuditLogs({ entityType: 'PRODUCTION_EXECUTION', entityId: productionObjectId, page, size: pageSize });
    pages.push((response.data.data as PageResult<AuditLogItem>) || { content: [], totalPages: 0 });
  }
  const content = pages.flatMap((page) => page.content ?? []);
  if (!operationId) return content;
  return content.filter((item) => {
    const summary = item.dataSummary?.trim();
    if (!summary) return false;
    const separatorIndex = summary.lastIndexOf(' · ');
    const summaryOperationId = separatorIndex >= 0 ? summary.slice(separatorIndex + 3).trim() : summary;
    return summaryOperationId === operationId;
  });
}

function emptyFilters(): FilterDraft {
  return { keyword: '', instanceNo: '', templateName: '', productionObjectNo: '', workOrderNo: '', productionObjectType: '', recordStatus: '', saved: '' };
}

function toQuery(filters: FilterDraft, page: number, size: number): FormWorklistQuery {
  const query: FormWorklistQuery = { page, size };
  for (const [key, value] of Object.entries(filters)) if (value.trim()) {
    if (key === 'productionObjectType') query.productionObjectType = value as 'BATCH' | 'SN';
    else if (key === 'recordStatus') query.recordStatus = [value as 'ACTIVE' | 'COMPLETED'];
    else if (key === 'saved') query.saved = value === 'true';
    else (query as Record<string, unknown>)[key] = value.trim();
  }
  return query;
}

function toPreviewDocument(detail: FormWorklistDetail) {
  const parsed = parseReactTemplateDesignerDocument({ id: detail.templateId, name: detail.templateName || '表单' }, { id: detail.templateVersionId, version: detail.templateVersion || '', modelDesignJson: detail.snapshot.model, canvasDesignJson: detail.snapshot.canvas });
  parsed.model.fields = detail.snapshot.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
  return parsed;
}

function FormWorklistPreviewDialog({ view, identity, onClose }: { view: FillingView; identity: FormWorklistIdentity | null; onClose: () => void }) {
  const detailQuery = useQuery({ queryKey: ['form-worklist-preview', view, identity], queryFn: () => getFormWorklistDetail(view, identity!), enabled: Boolean(identity), retry: false });
  const detail = detailQuery.data as FormWorklistDetail | undefined;
  const document = useMemo(() => detail ? toPreviewDocument(detail) : null, [detail]);
  const [basicInfoExpanded, setBasicInfoExpanded] = useState(true);
  useEffect(() => { setBasicInfoExpanded(true); }, [identity]);
  return <AppDialog open={Boolean(identity)} onClose={onClose} fullWidth maxWidth="xl" aria-labelledby="form-worklist-preview-title" PaperProps={{ sx: { width: 'min(1280px, calc(100vw - 64px))', height: 'min(88vh, 920px)', maxHeight: 'calc(100vh - 48px)', bgcolor: '#fff', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 18px 52px rgba(48, 65, 86, 0.18)' } }}>
    <DialogTitle id="form-worklist-preview-title" sx={{ minHeight: 64, px: 2.5, py: 1.25, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e4e7ed', bgcolor: '#fff' }}>
      <Box sx={{ minWidth: 0 }}><Typography sx={{ color: '#303133', fontSize: 18, lineHeight: 1.35, letterSpacing: '-0.01em', fontWeight: 600 }} noWrap>{detail?.templateName || '表单预览'}</Typography><Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.25, color: '#909399', fontVariantNumeric: 'tabular-nums' }}>{detail?.instanceNo || PENDING_INSTANCE_LABEL}{detail?.productionObjectNo ? ` · ${detail.productionObjectNo}` : ''}</Typography></Box>
    </DialogTitle>
    <DialogContent sx={{ minHeight: 0, p: 0, display: 'flex', flexDirection: 'column', bgcolor: '#fff', overflow: 'hidden' }}>
      {detailQuery.isFetching ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box> : detailQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>表单预览加载失败</Typography> : detail ? <>
        <Accordion expanded={basicInfoExpanded} onChange={(_, expanded) => setBasicInfoExpanded(expanded)} disableGutters elevation={0} sx={{ flex: '0 0 auto', borderBottom: '1px solid #e4e7ed', borderRadius: 0, bgcolor: '#fff', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ minHeight: 52, px: { xs: 1.5, md: 2.5 }, bgcolor: '#fff', transition: 'background-color 160ms ease', '&:hover': { bgcolor: '#fafcff' }, '&.Mui-focusVisible': { bgcolor: '#f5faff', boxShadow: 'inset 0 0 0 2px rgba(24, 144, 255, 0.24)' }, '&.Mui-expanded': { minHeight: 52 }, '& .MuiAccordionSummary-content': { my: 0, minWidth: 0 } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: '#303133', fontWeight: 600, flexShrink: 0 }}>基本信息</Typography>
              {!basicInfoExpanded && detail ? <Box sx={{ minWidth: 0, flex: 1, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) minmax(0, 1fr)', lg: 'minmax(0, 0.9fr) minmax(0, 1fr) minmax(0, 1.25fr) auto' }, columnGap: { sm: 2, lg: 3 }, alignItems: 'center', overflow: 'hidden' }}>
                <PreviewSummaryField label="实例号" value={detail.instanceNo || PENDING_INSTANCE_LABEL} />
                <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0, pl: 2, borderLeft: '1px solid #ebeef5' }}><PreviewSummaryField label="模板" value={`${detail.templateName || '-'} · ${detail.templateVersion || '-'}`} /></Box>
                <Box sx={{ display: { xs: 'none', lg: 'block' }, minWidth: 0, pl: 2, borderLeft: '1px solid #ebeef5' }}><PreviewSummaryField label="生产对象" value={detail.productionObjectNo ? `${detail.productionObjectNo}（${typeLabel(detail.productionObjectType)}）` : '-'} /></Box>
                <Box sx={{ display: { xs: 'none', lg: 'block' }, pl: 2, borderLeft: '1px solid #ebeef5' }}>{statusBadge(detail.recordStatus)}</Box>
              </Box> : null}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: '#fff' }}>
            <Box component="section" aria-label="表单基本信息" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, columnGap: { xs: 1.5, md: 3 }, rowGap: { xs: 1.5, md: 2 }, px: { xs: 1.5, md: 2.5 }, pt: { xs: 1.5, md: 2 }, pb: { xs: 2, md: 2.5 }, bgcolor: '#fafbfc', borderTop: '1px solid #ebeef5' }}>
              <DetailField label="表单实例号" value={detail.instanceNo || PENDING_INSTANCE_LABEL} />
              <DetailField label="表单模板" value={`${detail.templateName || '-'} · ${detail.templateVersion || '-'}`} />
              <DetailField label="生产对象" value={`${detail.productionObjectNo || '-'}（${typeLabel(detail.productionObjectType)}）`} />
              <DetailField label="工单" value={detail.workOrderNo} />
              <DetailField label="工序" value={detail.operationName} />
              <DetailField label="填报状态" value={statusBadge(detail.recordStatus)} />
              <DetailField label="当前节点" value={detail.nodeName} />
              <DetailField label="创建时间" value={formatDateTime(detail.createdAt)} />
              <DetailField label="更新时间" value={formatDateTime(detail.updatedAt)} />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Box component="section" aria-label="表单内容预览" sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1.5, md: 2.5 }, bgcolor: '#fff' }}>{document ? <FormCanvasPreview document={document} fullPage runtime={{ values: detail.fieldValues ?? {}, disabled: true, onChange: () => {} }} /> : null}</Box>
      </> : null}
    </DialogContent>
    <DialogActions sx={{ minHeight: 56, px: 2.5, py: 1, bgcolor: '#fff', borderTop: '1px solid #e4e7ed' }}><Button onClick={onClose}>关闭</Button></DialogActions>
  </AppDialog>;
}

function FormWorklistFillDialog({ identity, onClose, onChanged }: { identity: FormWorklistIdentity | null; onClose: () => void; onChanged: () => void }) {
  const { showMessage } = useSnackbar();
  const detailQuery = useQuery({ queryKey: ['form-worklist-fill', identity], queryFn: () => getFormWorklistDetail('FILLABLE', identity!), enabled: Boolean(identity), retry: false });
  const detail = detailQuery.data as FormWorklistDetail | undefined;
  const document = useMemo(() => detail ? toPreviewDocument(detail) : null, [detail]);
  const [values, setValues] = useState<ExecutionValues>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [signing, setSigning] = useState<ExecutionButton | null>(null);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [opinion, setOpinion] = useState('');

  useEffect(() => {
    if (!detail) return;
    setValues(detail.fieldValues ?? {});
    setDirty(false);
  }, [identity, detail?.revision]);

  const close = () => {
    if (busy) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };
  const upload = async (file: File) => {
    if (!identity || busy) throw new Error('当前无法上传');
    setBusy(true);
    setDirty(true);
    try { return await uploadExecutionFile(identity.productionObjectId, file); }
    finally { setBusy(false); }
  };
  const references = (fieldId: string, keyword: string) => identity
    ? getExecutionReferences(identity.productionObjectId, identity.operationId, identity.formId, fieldId, keyword)
    : Promise.resolve([]);
  const runAction = async (button: ExecutionButton, signature?: { account: string; password: string; opinion: string }) => {
    if (!identity || !detail || busy) return;
    setBusy(true);
    try {
      await executeProduction(identity.productionObjectId, {
        action: button.action,
        revision: detail.revision,
        operationId: identity.operationId,
        formId: identity.formId,
        instanceId: identity.copyId,
        values,
        ...signature,
      });
      setSigning(null);
      setAccount('');
      setPassword('');
      setOpinion('');
      onChanged();
      if (button.action === 'SAVE') {
        await detailQuery.refetch();
        showMessage('草稿已保存', 'success');
      } else {
        showMessage(`${button.label || '表单'}成功`, 'success');
        onClose();
      }
    } catch (error) {
      showMessage(errorText(error), 'error');
    } finally {
      setBusy(false);
    }
  };
  const requestAction = (button: ExecutionButton) => {
    if (button.requiresSignature || button.requireOpinion) {
      setSigning(button);
      setAccount('');
      setPassword('');
      setOpinion('');
    } else void runAction(button);
  };
  const actionButtons = detail?.controls?.buttons.filter((button) => button.action === 'SAVE' || button.action === 'SUBMIT') ?? [];

  return <>
    <AppDialog open={Boolean(identity)} onClose={close} fullWidth maxWidth="xl" aria-labelledby="form-worklist-fill-title" PaperProps={{ sx: { width: 'min(1280px, calc(100vw - 64px))', height: 'min(90vh, 940px)', maxHeight: 'calc(100vh - 40px)', bgcolor: '#fff', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 18px 52px rgba(48, 65, 86, 0.18)' } }}>
      <DialogTitle id="form-worklist-fill-title" sx={{ minHeight: 64, px: 2.5, py: 1.25, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e4e7ed', bgcolor: '#fff' }}>
        <Box sx={{ minWidth: 0 }}><Typography sx={{ color: '#303133', fontSize: 18, lineHeight: 1.35, fontWeight: 600 }} noWrap>{detail?.templateName || '表单填报'}</Typography><Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.25, color: '#909399', fontVariantNumeric: 'tabular-nums' }}>{detail?.instanceNo || PENDING_INSTANCE_LABEL}{detail?.productionObjectNo ? ` · ${detail.productionObjectNo}` : ''}{detail?.operationName ? ` · ${detail.operationName}` : ''}</Typography></Box>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 0, p: 0, display: 'flex', flexDirection: 'column', bgcolor: '#fff', overflow: 'hidden' }}>
        {detailQuery.isFetching && !detail ? <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box> : detailQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>表单填报加载失败</Typography> : detail ? <>
          <Box component="section" aria-label="当前填报信息" sx={{ flex: '0 0 auto', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.25, md: 2 }, px: { xs: 1.5, md: 2.5 }, py: 1.5, bgcolor: '#fafbfc', borderBottom: '1px solid #e4e7ed' }}>
            <DetailField label="表单实例号" value={detail.instanceNo || PENDING_INSTANCE_LABEL} />
            <DetailField label="生产对象" value={`${detail.productionObjectNo || '-'}（${typeLabel(detail.productionObjectType)}）`} />
            <DetailField label="工单 / 工序" value={`${detail.workOrderNo || '-'} / ${detail.operationName || '-'}`} />
            <DetailField label="当前节点" value={detail.nodeName || '-'} />
          </Box>
          {!detail.controls?.canAct ? <Alert severity="warning" sx={{ mx: 2.5, mt: 2 }}>当前任务已不可处理，请关闭弹窗并刷新列表。</Alert> : null}
          <Box component="section" aria-label="表单填报内容" sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1.5, md: 2.5 }, bgcolor: '#fff' }}>{document ? <FormCanvasPreview key={`${identity?.operationId}/${identity?.copyId}/${detail.revision}`} document={document} fullPage fieldPermissions={detail.controls?.permissions} runtime={{ values, upload, references, disabled: busy || !detail.controls?.canAct, onChange: (id, value) => { setValues((current) => ({ ...current, [id]: value })); setDirty(true); } }} /> : null}</Box>
        </> : null}
      </DialogContent>
      <DialogActions sx={{ minHeight: 64, px: 2.5, py: 1, bgcolor: '#fff', borderTop: '1px solid #e4e7ed', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: dirty ? '#d97706' : '#909399' }}>{busy ? '正在处理…' : dirty ? '有尚未保存的修改' : detail?.saved ? '已保存草稿' : '尚未保存'}</Typography>
        <Stack direction="row" spacing={1}><Button onClick={close} disabled={busy}>关闭</Button>{actionButtons.map((button) => <Button key={button.action} variant={button.action === 'SAVE' ? 'outlined' : 'contained'} disabled={busy || !detail?.controls?.canAct} onClick={() => requestAction(button)}>{button.action === 'SAVE' ? '保存' : button.label || '提交'}{button.requiresSignature ? '并签署' : ''}</Button>)}</Stack>
      </DialogActions>
    </AppDialog>
    <ConfirmDialog initialFocus="cancel" destructive open={confirmClose} title="当前表单尚未保存" message="关闭后将丢失本次未保存的修改。" confirmText="放弃修改并关闭" cancelText="继续填写" onCancel={() => setConfirmClose(false)} onConfirm={() => { setConfirmClose(false); setDirty(false); onClose(); }} />
    <AppDialog open={Boolean(signing)} onClose={busy ? undefined : () => setSigning(null)} maxWidth="xs" fullWidth>
      <DialogTitle>{signing?.label}{signing?.requiresSignature ? ' · 账户签署' : ''}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>{signing?.requiresSignature ? <><TextField label="当前操作人账户" value={account} autoComplete="username" onChange={(event) => setAccount(event.target.value)} disabled={busy} /><TextField label="账户密码" value={password} autoComplete="current-password" type="password" onChange={(event) => setPassword(event.target.value)} disabled={busy} /></> : null}<TextField label="操作意见" required={signing?.requireOpinion} value={opinion} onChange={(event) => setOpinion(event.target.value)} multiline minRows={2} disabled={busy} /></Stack></DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setSigning(null)}>取消</Button><Button variant="contained" disabled={busy || (signing?.requiresSignature && (!account || !password)) || (signing?.requireOpinion && !opinion.trim())} onClick={() => { if (signing) void runAction(signing, { account, password, opinion }); }}>{busy ? '正在处理…' : '确认'}</Button></DialogActions>
    </AppDialog>
  </>;
}

function FormWorklistDetailDrawer({ view, identity, onClose, onOpenExecution, onOpenPreview }: { view: FillingView; identity: FormWorklistIdentity | null; onClose: () => void; onOpenExecution: (row: FormWorklistRow) => void; onOpenPreview: () => void }) {
  const detailQuery = useQuery({ queryKey: ['form-worklist-detail', view, identity], queryFn: () => getFormWorklistDetail(view, identity!), enabled: Boolean(identity), retry: false });
  const detail = detailQuery.data as FormWorklistDetail | undefined;
  const [detailTab, setDetailTab] = useState(0);
  useEffect(() => { setDetailTab(0); }, [identity]);
  const productionObjectId = detail?.productionObjectId;
  const operationId = detail?.operationId;
  const auditQuery = useQuery({
    queryKey: ['form-worklist-audit', identity, productionObjectId, operationId],
    enabled: Boolean(identity && productionObjectId && detailTab === 1),
    queryFn: () => loadProductionAuditLogs(productionObjectId!, operationId),
  });
  const openExecution = () => { if (detail) onOpenExecution(detail); };
  return <Drawer anchor="right" open={Boolean(identity)} onClose={onClose} sx={drawerRootSx} slotProps={{ backdrop: { sx: { top: 0 } } }} PaperProps={{ sx: drawerPaperSx }}>
    <Box sx={{ minHeight: '100%', overflow: 'auto', bgcolor: '#f7f9fc', p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#303133' }}>填报记录</Typography><IconButton size="small" onClick={onClose} aria-label="关闭详情"><Close fontSize="small" /></IconButton></Stack>
      {detailQuery.isFetching ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box> : detailQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>填报记录加载失败</Typography> : detail ? <>
        <Box sx={{ borderBottom: '1px solid #e4e7ed' }}><Tabs value={detailTab} onChange={(_, value: number) => setDetailTab(value)} aria-label="填报记录详情切换"><Tab label="数据信息" /><Tab label="数据审计" /></Tabs></Box>
        {detailTab === 0 ? <Stack spacing={2} sx={{ mt: 2 }}>
          <DetailSection title="表单信息"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
            <DetailField label="表单实例号" value={detail.instanceNo || PENDING_INSTANCE_LABEL} /><DetailField label="表单模板" value={detail.templateName} />
            <DetailField label="表单编码" value={detail.templateCode} /><DetailField label="模板版本" value={detail.templateVersion} />
            <DetailField label="填报状态" value={statusBadge(detail.recordStatus)} />
            {view === 'CREATED' ? <DetailField label="创建类型" value={creationTypeLabel(detail.creationType)} /> : null}
            <DetailField label="当前节点" value={detail.nodeName} /><DetailField label="到达时间" value={formatDateTime(detail.arrivedAt)} />
          </Box></DetailSection>
          <DetailSection title="生产来源"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
            <DetailField label="生产对象" value={`${detail.productionObjectNo || '-'}（${typeLabel(detail.productionObjectType)}）`} /><DetailField label="工单" value={detail.workOrderNo} />
            <DetailField label="工序" value={detail.operationName} /><DetailField label="表单来源" value="生产执行" />
          </Box></DetailSection>
          {view === 'FILLABLE' ? <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="contained" startIcon={<PlayCircleOutline />} disabled={!detail.controls?.canAct} onClick={openExecution}>{detail.controls?.canAct ? '进入填报' : '当前不可处理'}</Button></Box> : null}
          <DetailSection title="表单内容"><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between"><Typography variant="body2" sx={{ color: '#606266' }}>完整表单在宽屏预览中查看，便于核对表格和字段内容。</Typography><Button variant="outlined" startIcon={<PreviewOutlined />} onClick={onOpenPreview} sx={{ flexShrink: 0 }}>查看完整表单</Button></Stack></DetailSection>
          <DetailSection title="本人处理记录">{detail.myEvents?.length ? <Stack spacing={1}>{detail.myEvents.map((event, index) => <Accordion key={`${event.at}-${index}`} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}><AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ minHeight: 44, px: 1.5, '&.Mui-expanded': { minHeight: 44 }, '& .MuiAccordionSummary-content': { my: 0 } }}><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', columnGap: 1, width: '100%', minWidth: 0 }}><Typography variant="body2" noWrap>{event.actionCode}</Typography><Typography variant="body2" noWrap>{event.nodeName}</Typography><Typography variant="body2" noWrap sx={{ color: '#606266' }}>{formatDateTime(event.at)}</Typography></Box></AccordionSummary><AccordionDetails sx={{ pt: 0, pb: 1.5 }}><Typography variant="caption" color="text.secondary">操作人：{event.operator || '-'}</Typography></AccordionDetails></Accordion>)}</Stack> : <Typography variant="body2" sx={{ color: '#909399' }}>暂无处理记录</Typography>}</DetailSection>
        </Stack> : <Stack spacing={1} sx={{ mt: 2 }}>
          {auditQuery.isFetching ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box> : auditQuery.isError ? <Typography sx={{ py: 8, textAlign: 'center', color: '#c62828' }}>数据审计加载失败</Typography> : auditQuery.data?.length ? auditQuery.data.map((item) => <Accordion key={item.id} disableGutters elevation={0} sx={{ border: '1px solid #e4e7ed', borderRadius: '4px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { m: 0 } }}><AccordionSummary expandIcon={<ExpandMore fontSize="small" />} sx={{ minHeight: 44, px: 1.5, '&.Mui-expanded': { minHeight: 44 }, '& .MuiAccordionSummary-content': { my: 0 }, '& .MuiAccordionSummary-content.Mui-expanded': { my: 0 } }}><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', columnGap: 1, width: '100%', minWidth: 0 }}><Typography variant="body2" noWrap>{item.operatorDisplayName || item.operatorAccount || '-'}</Typography><Typography variant="body2" noWrap>{item.actionLabel || item.action || '-'}</Typography><Typography variant="body2" noWrap sx={{ color: '#606266' }}>{formatDateTime(item.operationTime || item.createdAt)}</Typography></Box></AccordionSummary><AccordionDetails sx={{ pt: 0, pb: 1.5 }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}><AuditFieldBlock title="变更前" fields={toProductionAuditFields(item.contentBefore, { objectStatus: '生产对象状态' })} /><AuditFieldBlock title="变更后" fields={toProductionAuditFields(item.contentAfter, { objectStatus: '生产对象状态' })} /></Box></AccordionDetails></Accordion>) : <Typography sx={{ py: 8, textAlign: 'center', color: '#909399' }}>暂无审计记录</Typography>}
        </Stack>}
      </> : null}
    </Box>
  </Drawer>;
}

export default function FormFillingPage() {
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(FILLING_COLUMNS, 'form-filling-column-widths:v1:');
  const [view, setView] = useState<FillingView>('FILLABLE');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [draft, setDraft] = useState<FilterDraft>(emptyFilters);
  const [filters, setFilters] = useState<FilterDraft>(emptyFilters);
  const [identity, setIdentity] = useState<FormWorklistIdentity | null>(null);
  const [previewIdentity, setPreviewIdentity] = useState<FormWorklistIdentity | null>(null);
  const [fillIdentity, setFillIdentity] = useState<FormWorklistIdentity | null>(null);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const query = useQuery({ queryKey: ['form-filling-worklist', view, page, pageSize, filters], queryFn: () => listFormWorklist(view, toQuery(filters, page, pageSize)), refetchOnMount: 'always' });
  const rows = query.data?.content ?? [];
  const activeView = views.find((item) => item.id === view)!;
  const visibleColumns = useMemo(() => FILLING_COLUMNS.filter((column) => column.id !== 'creationType' || view === 'CREATED'), [view]);
  const tableWidth = visibleColumns.reduce((total, column) => total + getColumnWidth(column), 0);
  const submitSearch = () => { setPage(0); setFilters({ ...draft, keyword: draft.keyword.trim(), instanceNo: draft.instanceNo.trim(), templateName: draft.templateName.trim(), productionObjectNo: draft.productionObjectNo.trim(), workOrderNo: draft.workOrderNo.trim() }); };
  const resetSearch = () => { const empty = emptyFilters(); setDraft(empty); setFilters(empty); setPage(0); };
  const updateDraft = (key: keyof FilterDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const openFill = (row: FormWorklistRow) => setFillIdentity({ productionObjectId: row.productionObjectId, operationId: row.operationId, formId: row.formId, copyId: row.copyId });
  const openDetail = (row: FormWorklistRow) => setIdentity({ productionObjectId: row.productionObjectId, operationId: row.operationId, formId: row.formId, copyId: row.copyId });
  const openPreview = (row: FormWorklistRow) => setPreviewIdentity({ productionObjectId: row.productionObjectId, operationId: row.operationId, formId: row.formId, copyId: row.copyId });
  const filterActions = <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ ...formListFilterActionsSx, gridColumn: advancedFiltersOpen ? '1 / -1' : { xs: '1 / -1', md: 'auto' } }}>
    <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={resetSearch} sx={{ height: 40, width: 80, minWidth: 80 }}>重置</Button>
    <Button size="small" variant="contained" startIcon={<Search />} onClick={submitSearch} sx={{ height: 40, width: 80, minWidth: 80 }}>查询</Button>
    <Button size="small" variant="text" endIcon={<ExpandMore sx={{ transform: advancedFiltersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />} onClick={() => setAdvancedFiltersOpen((open) => !open)} aria-expanded={advancedFiltersOpen} sx={{ height: 40, minWidth: 72, px: 1, color: '#1890ff', '&:hover': { bgcolor: '#f5faff' } }}>{advancedFiltersOpen ? '收起' : '展开'}</Button>
  </Stack>;
  return <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
    <Box sx={formListQueryPanelSx}>
      <Box sx={formListQueryGridSx}>
        <TextField size="small" label="关键词" placeholder="实例号、模板、工单或生产对象" value={draft.keyword} onChange={(event) => updateDraft('keyword', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={fieldSx} />
        <TextField size="small" label="表单模板" placeholder="请输入表单模板名称" value={draft.templateName} onChange={(event) => updateDraft('templateName', event.target.value)} sx={fieldSx} />
        {advancedFiltersOpen ? <TextField size="small" label="表单实例号" placeholder="请输入实例号" value={draft.instanceNo} onChange={(event) => updateDraft('instanceNo', event.target.value)} sx={fieldSx} /> : filterActions}
        <Collapse in={advancedFiltersOpen} timeout={180} unmountOnExit sx={{ gridColumn: '1 / -1' }}>
          <Box sx={formListAdvancedGridSx}>
            <TextField size="small" label="生产对象" placeholder="请输入批次号或SN" value={draft.productionObjectNo} onChange={(event) => updateDraft('productionObjectNo', event.target.value)} sx={fieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
            <TextField size="small" label="工单" placeholder="请输入工单号" value={draft.workOrderNo} onChange={(event) => updateDraft('workOrderNo', event.target.value)} sx={fieldSx} />
            <TextField select size="small" label="生产对象类型" value={draft.productionObjectType} onChange={(event) => updateDraft('productionObjectType', event.target.value)} sx={fieldSx}><MenuItem value="">全部</MenuItem><MenuItem value="BATCH">批次</MenuItem><MenuItem value="SN">SN</MenuItem></TextField>
            <TextField select size="small" label="填报状态" value={draft.recordStatus} onChange={(event) => updateDraft('recordStatus', event.target.value)} sx={fieldSx}><MenuItem value="">全部</MenuItem><MenuItem value="ACTIVE">进行中</MenuItem><MenuItem value="COMPLETED">已完成</MenuItem></TextField>
            <TextField select size="small" label="实例生成状态" value={draft.saved} onChange={(event) => updateDraft('saved', event.target.value)} sx={fieldSx}><MenuItem value="">全部</MenuItem><MenuItem value="true">已生成</MenuItem><MenuItem value="false">待生成</MenuItem></TextField>
          </Box>
        </Collapse>
        {advancedFiltersOpen ? filterActions : null}
      </Box>
    </Box>
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', borderBottom: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}><Tabs value={view} onChange={(_, next: FillingView) => { setView(next); setPage(0); setIdentity(null); setPreviewIdentity(null); setFillIdentity(null); }} aria-label="表单填报视图"><Tab value="FILLABLE" label="我的填报" /><Tab value="CREATED" label="我的创建" /><Tab value="FILLED" label="我的已填" /></Tabs><Tooltip title={activeView.helper} arrow><IconButton size="small" aria-label="当前视图说明" sx={{ color: '#909399' }}><InfoOutlined fontSize="small" /></IconButton></Tooltip></Box>
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', containerType: 'inline-size' }}><Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: tableWidth, height: query.isLoading || query.isError || rows.length === 0 ? '100%' : 'auto' }}>
        <colgroup>{visibleColumns.map((column) => <col key={column.id} style={{ width: getColumnWidth(column) }} />)}</colgroup>
        <TableHead><TableRow sx={{ '& .MuiTableCell-root': headerCellSx }}>{visibleColumns.map((column) => {
          const width = getColumnWidth(column);
          return <TableCell key={column.id} align={column.id === 'actions' ? 'center' : undefined} sx={{ ...headerCellSx, position: 'relative', width, minWidth: width, maxWidth: width, ...(column.id === 'actions' ? actionHeadSx : {}) }}>{column.id === 'instanceNo' ? <Stack direction="row" spacing={0.25} alignItems="center"><Typography component="span" variant="inherit">{column.label}</Typography><Tooltip title={INSTANCE_NUMBER_TIP} arrow><IconButton size="small" aria-label="表单实例号说明" sx={{ p: 0.25, color: '#909399', '&:hover': { color: '#606266', bgcolor: '#ebeef5' } }}><InfoOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip></Stack> : column.label}{column.id !== 'actions' ? <Box aria-hidden="true" data-column-resize-handle={column.id} sx={listColumnResizeHandleSx} {...getResizeHandleProps(column)} /> : null}</TableCell>;
        })}</TableRow></TableHead>
        <TableBody>{query.isLoading ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#909399' }}>加载中...</TableStateCell></TableRow> : query.isError ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#c62828' }}>表单填报列表加载失败</TableStateCell></TableRow> : rows.length === 0 ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={visibleColumns.length} sx={{ height: '100%', color: '#909399' }}>暂无数据</TableStateCell></TableRow> : rows.map((row) => <TableRow key={`${row.productionObjectId}-${row.operationId}-${row.formId}-${row.copyId}`} hover tabIndex={0} onClick={() => openDetail(row)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetail(row); } }} sx={{ cursor: 'pointer', '& > .MuiTableCell-root': bodyCellSx }} aria-label={`查看${row.templateName || '表单'}填报记录`}>
          <TableCell>{row.instanceNo || <Typography component="span" variant="body2" sx={{ color: '#909399' }}>{PENDING_INSTANCE_LABEL}</Typography>}</TableCell>
          <TableCell title={`${row.templateName || '-'} · ${row.templateVersion || '-'}`}>{row.templateName || '-'} <Typography component="span" variant="caption" sx={{ color: '#909399' }}>· {row.templateVersion || '-'}</Typography></TableCell>
          {view === 'CREATED' ? <TableCell>{creationTypeLabel(row.creationType)}</TableCell> : null}
          <TableCell title={row.productionObjectNo || ''}>{row.productionObjectNo || '-'} <Typography component="span" variant="caption" sx={{ color: '#909399' }}>· {typeLabel(row.productionObjectType)}</Typography></TableCell>
          <TableCell>{row.workOrderNo || '-'}</TableCell><TableCell>{row.operationName || '-'}</TableCell><TableCell>{statusBadge(row.recordStatus)}</TableCell>
          <TableCell title={row.nodeName || ''}>{row.nodeName || '-'}</TableCell>
          <TableCell>{formatDateTime(row.updatedAt)}</TableCell>
          <TableCell sx={actionBodySx} onClick={(event) => event.stopPropagation()}><Stack direction="row" alignItems="center" justifyContent="center"><Tooltip title={view === 'FILLABLE' ? '进入填报' : '预览表单'} arrow>{view === 'FILLABLE' ? <IconButton size="small" color="primary" aria-label="进入填报" onClick={() => openFill(row)}><PlayCircleOutline fontSize="small" /></IconButton> : <IconButton size="small" aria-label="预览表单" onClick={() => openPreview(row)}><PreviewOutlined fontSize="small" /></IconButton>}</Tooltip>{view === 'FILLABLE' ? <Tooltip title="预览表单" arrow><IconButton size="small" aria-label="预览表单" onClick={() => openPreview(row)}><PreviewOutlined fontSize="small" /></IconButton></Tooltip> : null}</Stack></TableCell>
        </TableRow>)}</TableBody>
      </Table></TableContainer>
      <FormListPagination totalElements={query.data?.totalElements ?? 0} totalPages={query.data?.totalPages ?? 0} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(value) => { setPageSize(value); setPage(0); }} />
    </Box>
    <FormWorklistDetailDrawer view={view} identity={identity} onClose={() => setIdentity(null)} onOpenExecution={(row) => { setIdentity(null); openFill(row); }} onOpenPreview={() => { setIdentity(null); setPreviewIdentity(identity); }} />
    <FormWorklistPreviewDialog view={view} identity={previewIdentity} onClose={() => setPreviewIdentity(null)} />
    <FormWorklistFillDialog identity={fillIdentity} onClose={() => setFillIdentity(null)} onChanged={() => { void query.refetch(); }} />
  </Box>;
}
