import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UNSAFE_NavigationContext, useLocation } from 'react-router-dom';
import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, ClickAwayListener, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, InputAdornment, LinearProgress, List, ListItemButton, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { ArrowForwardRounded, CheckCircleRounded, CloseRounded, ExpandMoreRounded, FullscreenRounded, InfoOutlined, LockOutlined, MenuBookRounded, FactCheckRounded, HistoryRounded, PlayArrowRounded, QrCodeScannerRounded, RefreshRounded, SwapHorizRounded, ViewListOutlined, TableChartOutlined } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import FormDocumentPreview from '@/pages/master-data/template-designer-react/components/form-preview/FormDocumentPreview';
import type { FormRuntime, SignatureTarget } from '@/components/form-renderer/FormRuntimeField';
import { signatureContent } from '@/components/form-renderer/signatureContent';
import type { ModelField } from '@/pages/master-data/template-designer-react/types';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { executeProduction, getProductionExecution, getExecutionReferences, getExecutionTransferTargets, uploadExecutionFile, scanProduction, type ExecutionButton, type ExecutionCommand, type ExecutionTransferTarget, type ExecutionValues, type ExecutionView } from '@/api/production-execution';
import { getFilePagePreviewBlob } from '@/api/files';
import { getFormTemplates } from '@/api/template-modeling';
import './ProductionExecutionPage.css';
import { executionRouteLinks } from './executionRouteLinks';
import ExecutionQuickPanel, { type ExecutionPanelId } from './ExecutionQuickPanel';
import ExecutionOperationDrawer from './ExecutionOperationDrawer';
import ExecutionCopyDrawer from './ExecutionCopyDrawer';
import ExecutionProductDetails from './ExecutionProductDetails';
import ExecutionFormSelector from './ExecutionFormSelector';
import useExecutionPresence from './useExecutionPresence';
import { executionFormReceipt, executionHistoryGroups } from './executionHistory';
import WorkflowActionButtons from '@/components/workflow/WorkflowActionButtons';

const labels: Record<string, string> = { CREATED: '待开工', IN_PROGRESS: '进行中', IN_PROCESS: '进行中', COMPLETED: '已完成', PENDING: '待开工', ACTIVE: '待处理', RUNNING: '进行中', CANCELLED: '已取消', EARLY_TERMINATED: '已提前结束', CLOSED: '已关闭' };
const time = (value?: string) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—';
const errorText = (error: unknown) => (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error)?.message || '操作失败，请重试';
const panel = { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, minWidth: 0 };

export default function ProductionExecutionPage() {
  const navigation = useContext(UNSAFE_NavigationContext);
  const location = useLocation();
  const queryClient = useQueryClient();
  const [barcode, setBarcode] = useState('');
  const [view, setView] = useState<ExecutionView | null>(null);
  const [openingExecution, setOpeningExecution] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('autoScan') === '1' && Boolean(params.get('barcode')?.trim());
  });
  const [operationId, setOperationId] = useState('');
  const [formId, setFormId] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [incompleteNotice, setIncompleteNotice] = useState<string[] | null>(null);
  const [formCategory, setFormCategory] = useState<{ versionId: string; name: string } | null>(null);
  const [values, setValues] = useState<ExecutionValues>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [operationDrawerOpen, setOperationDrawerOpen] = useState(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [copyDrawerOpen, setCopyDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ExecutionPanelId | null>(null);
  const [navigationSection, setNavigationSection] = useState<ExecutionPanelId | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [historyType, setHistoryType] = useState('operation');
  const [layout, setLayout] = useState<'fields' | 'canvas'>('canvas');
  const [pendingSwitch, setPendingSwitch] = useState<(() => void) | null>(null);
  const [signing, setSigning] = useState<(ExecutionButton & { signatureTarget?: SignatureTarget }) | null>(null);
  const [transferButton, setTransferButton] = useState<ExecutionButton | null>(null);
  const [transferKeyword, setTransferKeyword] = useState('');
  const [transferTarget, setTransferTarget] = useState<ExecutionTransferTarget | null>(null);
  const [transferReason, setTransferReason] = useState('');
  const [transferTargets, setTransferTargets] = useState<ExecutionTransferTarget[]>([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const transferRequestRef = useRef(0);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const signaturePasswordError = Boolean(signing?.signatureTarget) && error === '电子签名密码错误';
  const signaturePasswordRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (signaturePasswordError && !busy) signaturePasswordRef.current?.focus();
  }, [signaturePasswordError, busy]);
  const [opinion, setOpinion] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [documentPage, setDocumentPage] = useState(1);
  const [documentPages, setDocumentPages] = useState(1);
  const [documentImage, setDocumentImage] = useState(false);
  const [documentZoom, setDocumentZoom] = useState(1);
  const documentBodyRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const busyRef = useRef(false);
  const initialBarcodeRef = useRef<string | null>(null);
  const initialTargetRef = useRef<{ operationId: string; formId: string; copyId: string } | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const focusScanAfterLoadRef = useRef(false);
  useEffect(() => {
    if (!busy && focusScanAfterLoadRef.current) {
      focusScanAfterLoadRef.current = false;
      scanRef.current?.focus();
    }
  }, [busy]);
  const rootRef = useRef<HTMLDivElement>(null);
  const conditionsRef = useRef<HTMLDetailsElement>(null);
  const closeConditions = () => { if (conditionsRef.current) conditionsRef.current.open = false; };
  const [quickRailContainer, setQuickRailContainer] = useState<HTMLDivElement | null>(null);
  useEffect(() => { if (activePanel) setNavigationSection(activePanel); }, [activePanel]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const resize = () => {
      const narrow = root.clientWidth < 690 || window.innerHeight < 560;
      const bottomSpacing = root.parentElement ? parseFloat(getComputedStyle(root.parentElement).paddingBottom) || 0 : 16;
      const pageTop = root.getBoundingClientRect().top + window.scrollY;
      const availableHeight = Math.max(420, window.innerHeight - pageTop - bottomSpacing);
      root.style.setProperty('--execution-height', narrow ? 'auto' : `${availableHeight}px`);
      root.dataset.narrow = String(narrow);
      root.dataset.compact = String(!narrow && availableHeight < 660);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    window.addEventListener('resize', resize);
    globalThis.document.addEventListener('fullscreenchange', resize);
    resize();
    return () => { observer.disconnect(); window.removeEventListener('resize', resize); globalThis.document.removeEventListener('fullscreenchange', resize); };
  }, []);

  const context = view?.snapshot.context;
  const operations = view?.snapshot.operations ?? [];
  const op = operations.find((item) => item.id === operationId);
  const opState = view?.state.operations[operationId];
  const available = view?.availability[operationId];
  const output = view?.operationOutputs?.[operationId];
  const forms = op?.forms ?? [];
  const form = forms.find((item) => item.id === formId);
  useEffect(() => {
    let cancelled = false;
    setFormCategory(null);
    if (form?.code && form.versionId && form.categoryName === undefined) {
      const versionId = form.versionId;
      void getFormTemplates({ code: form.code, page: 1, size: 100 }).then(response => {
        const template = response.data.data.content.find(item => item.versions?.some(version => String(version.id) === versionId));
        if (!cancelled && template) setFormCategory({ versionId, name: template.categoryName || '未分类' });
      }).catch(() => { /* Category lookup does not block production reporting. */ });
    }
    return () => { cancelled = true; };
  }, [form?.code, form?.versionId, form?.categoryName]);
  const copies = available?.formCopies?.[formId];
  const instanceIds = copies?.instanceIds ?? (opState?.forms[formId] ? [formId] : []);
  const selectedInstanceId = instanceIds.includes(instanceId) ? instanceId : instanceIds[0] ?? formId;
  const formState = opState?.forms[selectedInstanceId];
  const formReceipt = executionFormReceipt(view?.state.history ?? [], operationId, formId, selectedInstanceId, formState?.savedAt);
  const formStatus = copies?.status ?? formState?.status ?? 'PENDING';
  const formStatusLabel = formStatus === 'COMPLETED' ? '已完成'
    : formStatus === 'WAITING_OPERATION_START' ? '待工序开工'
      : formStatus === 'WAITING_WORK_NODE' ? '待作业流程到达'
        : formStatus === 'NOT_APPLICABLE' ? '不适用'
          : formStatus === 'PENDING' ? '未填报' : '进行中';
  const controls = copies?.instances[selectedInstanceId] ?? available?.forms[formId];
  const { editors, markEditing } = useExecutionPresence(context?.objectId, operationId, formId, selectedInstanceId, Boolean(controls?.canAct && !navigationSection && !activePanel), formDrawerOpen);
  const completed = operations.filter((item) => item.type !== 'REWORK' && view?.state.operations[item.id]?.status === 'COMPLETED').length;
  const total = operations.filter((item) => item.type !== 'REWORK').length;
  const completionPercent = !view?.historicalWithoutExecution && total > 0 ? Math.round(completed / total * 100) : null;
  const routeLinks = useMemo(() => view ? executionRouteLinks(view.snapshot) : new Map(), [view?.snapshot]);
  const operationNames = new Map(operations.map((item) => [item.id, item.name || item.code || item.id]));
  const document = op?.documents.find((item) => item.id === documentId);
  const historyGroups = useMemo(() => executionHistoryGroups(view?.state.history ?? [], operationId), [view?.state.history, operationId]);
  const historyGroup = historyGroups.find(group => group.id === historyType) ?? historyGroups[0];
  const selectedWork = op?.works.find(work => work.id === selectedWorkId) ?? op?.works[0];
  const formDocument = useMemo(() => {
    if (!form) return null;
    const parsed = parseReactTemplateDesignerDocument({ id: form.versionId, name: form.name }, {
      id: form.versionId, version: form.version, modelDesignJson: form.model, canvasDesignJson: form.canvas,
    });
    parsed.model.fields = form.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
    return parsed;
  }, [form]);
  const references = useCallback((fieldId: string, keyword: string, referenceValues: Record<string, unknown>) => context ? getExecutionReferences(context.objectId, operationId, formId, fieldId, keyword, referenceValues) : Promise.resolve([]), [context?.objectId, operationId, formId]);
  const upload = async (file: File) => {
    if (!context || busyRef.current) throw new Error('当前无法上传');
    busyRef.current = true; setBusy(true); setDirty(true);
    try { return await uploadExecutionFile(context.objectId, file); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const formRuntime: FormRuntime = { values, upload, references, disabled: busy || !controls?.canAct,
    signaturePermissions: controls?.signaturePermissions,
    signaturesInvalidated: Boolean(form && signatureContent(form.fields, values) !== signatureContent(form.fields, view?.state.operations[operationId]?.forms[selectedInstanceId]?.values ?? {})),
    onSignatureRequest: (target) => {
      const field = target.tableId ? (form?.fields.find(item => item.id === target.tableId)?.typeConfig.columns as ModelField[] | undefined)?.find(item => item.id === target.fieldId) : form?.fields.find(item => item.id === target.fieldId);
      setSigning({ action: 'SIGN_FIELD', label: `签署 · ${field?.name ?? '签名字段'}${target.rowIndex === undefined ? '' : ` · 第 ${target.rowIndex + 1} 行`}`, signatureTarget: target }); setPassword(''); setError('');
    }, onChange: (id, value) => {
    setValues((current) => ({ ...current, [id]: value })); setDirty(true); markEditing();
  } };

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || busyRef.current) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (!navigation?.navigator || (!dirty && !busy)) return;
    const navigator = navigation.navigator;
    const push = navigator.push; const replace = navigator.replace; const go = navigator.go;
    const intercept = (action: () => void) => { if (!busyRef.current) setPendingSwitch(() => action); };
    navigator.push = (...args) => intercept(() => push.apply(navigator, args));
    navigator.replace = (...args) => intercept(() => replace.apply(navigator, args));
    navigator.go = (...args) => intercept(() => go.apply(navigator, args));
    const currentIndex = window.history.state?.idx;
    let restoring = false;
    const pop = (event: PopStateEvent) => {
      if (restoring) { restoring = false; event.stopImmediatePropagation(); return; }
      const nextIndex = event.state?.idx;
      if (typeof currentIndex !== 'number' || typeof nextIndex !== 'number' || nextIndex === currentIndex) return;
      if (busyRef.current || !window.confirm('当前表单尚未保存，离开将丢弃修改。确定离开吗？')) {
        event.stopImmediatePropagation(); restoring = true; window.history.go(currentIndex - nextIndex);
      }
    };
    window.addEventListener('popstate', pop, true);
    return () => { navigator.push = push; navigator.replace = replace; navigator.go = go; window.removeEventListener('popstate', pop, true); };
  }, [navigation, dirty, busy]);
  useEffect(() => () => {
    requestRef.current++;
    busyRef.current = false;
    initialBarcodeRef.current = null;
  }, []);
  useEffect(() => { setDocumentPage(Number(document?.pageStart) || 1); setDocumentPages(1); setDocumentZoom(1); }, [context?.objectId, operationId, document?.id, document?.pageStart]);
  useEffect(() => { documentBodyRef.current?.scrollTo(0, 0); }, [document?.id, documentPage]);
  useEffect(() => {
    setDocumentUrl(''); setDocumentError('');
    if (!document?.fileId) return;
    let cancelled = false;
    let url = '';
    getFilePagePreviewBlob(document.fileId, documentPage).then((result) => {
      if (cancelled) return;
      setDocumentImage(result.data.type.startsWith('image/'));
      setDocumentPages(Number(result.headers['x-page-count']) || 1);
      url = URL.createObjectURL(result.data); setDocumentUrl(url);
    }).catch((reason) => { if (!cancelled) setDocumentError(errorText(reason)); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [document?.fileId, documentPage]);

  const chooseForm = (nextId: string, source = view, nextOperation = operationId, nextInstance?: string) => {
    const ids = source?.availability[nextOperation]?.formCopies?.[nextId]?.instanceIds ?? [nextId];
    const selected = nextInstance && ids.includes(nextInstance) ? nextInstance : ids.find(id => source?.state.operations[nextOperation]?.forms[id]?.status === 'ACTIVE') ?? ids[0] ?? nextId;
    setFormId(nextId); setInstanceId(selected); setValues(source?.state.operations[nextOperation]?.forms[selected]?.values ?? {}); setDirty(false);
  };

  useEffect(() => {
    if (!transferButton || !context || !formId || !selectedInstanceId) {
      setTransferTargets([]);
      setTransferLoading(false);
      return;
    }
    const request = ++transferRequestRef.current;
    setTransferLoading(true);
    setTransferError('');
    getExecutionTransferTargets(context.objectId, operationId, formId, selectedInstanceId, transferKeyword)
      .then((items) => { if (request === transferRequestRef.current) setTransferTargets(items); })
      .catch((reason) => { if (request === transferRequestRef.current) setTransferError(errorText(reason)); })
      .finally(() => { if (request === transferRequestRef.current) setTransferLoading(false); });
    return () => { transferRequestRef.current++; };
  }, [context?.objectId, formId, operationId, selectedInstanceId, transferButton, transferKeyword]);
  const chooseOperation = (id: string, source = view) => {
    setOperationId(id);
    const next = source?.snapshot.operations.find((item) => item.id === id);
    const active = next?.forms.find((item) => (source?.availability[id]?.formCopies?.[item.id]?.instanceIds ?? [item.id]).some(copyId => source?.state.operations[id]?.forms[copyId]?.status === 'ACTIVE'));
    chooseForm(active?.id ?? next?.forms[0]?.id ?? '', source, id);
    if (id !== operationId || source?.snapshot.context.objectId !== context?.objectId) {
      setDocumentId(next?.documents[0]?.id ?? ''); setActivePanel(null);
      setNavigationSection(null); setSelectedWorkId(next?.works[0]?.id ?? ''); setHistoryType('operation');
    }
  };
  const protect = (action: () => void) => { if (busyRef.current) return; if (dirty) setPendingSwitch(() => action); else action(); };
  const receive = (next: ExecutionView, reset = false) => {
    setView(next);
    const target = reset ? initialTargetRef.current : null;
    const targetedOperation = target && next.snapshot.operations.some((item) => item.id === target.operationId) ? target.operationId : '';
    const id = targetedOperation || (!reset && next.snapshot.operations.some((item) => item.id === operationId) ? operationId
      : next.snapshot.operations.find((item) => next.state.operations[item.id]?.status === 'IN_PROGRESS')?.id
      ?? next.snapshot.operations.find((item) => next.availability[item.id]?.canStart)?.id ?? next.snapshot.operations[0]?.id ?? '');
    chooseOperation(id, next);
    if (targetedOperation && target?.formId && next.snapshot.operations.find((item) => item.id === id)?.forms.some((item) => item.id === target.formId)) {
      chooseForm(target.formId, next, id, target.copyId);
      initialTargetRef.current = null;
    } else if (reset) {
      initialTargetRef.current = null;
    } else if (id === operationId && next.snapshot.operations.find((item) => item.id === id)?.forms.some((item) => item.id === formId))
      chooseForm(formId, next, id, selectedInstanceId);
  };
  const load = async (refresh = false, requestedBarcode?: string) => {
    const barcodeValue = (requestedBarcode ?? barcode).trim();
    if (busyRef.current || (!refresh && !barcodeValue)) { if (!barcodeValue) scanRef.current?.focus(); return; }
    busyRef.current = true; setBusy(true); setError(''); setNotice('');
    const request = ++requestRef.current;
    try {
      const next = refresh && context ? await getProductionExecution(context.objectId) : await scanProduction(barcodeValue);
      if (request !== requestRef.current) return;
      if (!refresh && next.objectStatus === 'CANCELLED') throw new Error('当前批次已取消');
      receive(next, !refresh); setBarcode(next.snapshot.context.objectNo); if (!refresh) setActivePanel(null);
    } catch (reason) {
      if (request !== requestRef.current) return;
      const message = errorText(reason);
      setError(message);
      if (!refresh && (message === '未找到该批次或 SN，请核对条码' || message === '当前批次已取消')) {
        setBarcode('');
        focusScanAfterLoadRef.current = true;
      }
      if (!refresh) { setView(null); setDirty(false); }
    } finally { if (request === requestRef.current) { busyRef.current = false; setBusy(false); setOpeningExecution(false); } }
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedBarcode = params.get('barcode')?.trim();
    if (!requestedBarcode) {
      initialBarcodeRef.current = null;
      initialTargetRef.current = null;
      return;
    }
    if (view || initialBarcodeRef.current === requestedBarcode) return;
    initialBarcodeRef.current = requestedBarcode;
    const operationId = params.get('operationId')?.trim();
    const formId = params.get('formId')?.trim();
    const copyId = params.get('copyId')?.trim();
    initialTargetRef.current = operationId && formId && copyId ? { operationId, formId, copyId } : null;
    setBarcode(requestedBarcode);
    if (params.get('autoScan') === '1') void load(false, requestedBarcode);
  }, [location.search, view]);
  const act = async (command: Omit<ExecutionCommand, 'revision' | 'operationId'>) => {
    if (!view || !context || busyRef.current) return false;
    busyRef.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const next = await executeProduction(context.objectId, { ...command, revision: view.revision, operationId });
      if (command.action === 'UPDATE_FORM_COPY_REMARK') setView(next);
      else receive(next);
      setSigning(null); setPassword(''); setOpinion('');
      if (command.action === 'TRANSFER') {
        setTransferButton(null); setTransferTarget(null); setTransferKeyword(''); setTransferReason(''); setTransferTargets([]); setTransferError('');
      }
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['form-management-global-list'] }),
        queryClient.invalidateQueries({ queryKey: ['form-filling-worklist'] }),
        queryClient.invalidateQueries({ queryKey: ['form-review-worklist'] }),
      ]);
      if (command.action === 'ATTACH_FORM' && next.attachedFormId) chooseForm(next.attachedFormId, next);
      if (command.action === 'ADD_FORM_COPY' && command.formId) {
        const ids = next.availability[operationId]?.formCopies?.[command.formId]?.instanceIds;
        chooseForm(command.formId, next, operationId, ids?.[ids.length - 1]);
      }
      setNotice(command.action === 'COMPLETE' ? next.objectStatus === 'COMPLETED' ? '全部工序已完成，当前生产对象已完工。可扫描下一个条码。' : '工序已完工，执行记录已保存。请选择下一道可执行工序。' : command.action === 'TRANSFER' ? '转办成功，执行记录已保存。' : '操作成功，执行记录已保存。');
      return true;
    } catch (reason) { setError(errorText(reason)); setPassword(''); return false; }
    finally { busyRef.current = false; setBusy(false); }
  };
  const formAction = (button: ExecutionButton) => {
    if (button.action === 'TRANSFER') {
      setTransferButton(button); setTransferKeyword(''); setTransferTarget(null); setTransferReason(''); setTransferError('');
      return;
    }
    if (button.requiresSignature || button.requireOpinion || button.action === 'RETURN') {
      setSigning(button); setPassword(''); setOpinion('');
    } else void act({ action: button.action, formId, instanceId: selectedInstanceId, values });
  };
  const finishOperation = () => {
    const warnings = available?.completionWarnings ?? [];
    if (warnings.length) setIncompleteNotice(warnings);
    else void act({ action: 'COMPLETE' });
  };


  const pending = opState?.status === 'PENDING';
  const objectEnded = Boolean(view && !['CREATED', 'IN_PROGRESS'].includes(view.objectStatus));
  const stageIssues = (pending ? available?.startIssues : available?.completionIssues) ?? [];
  const startConditionText = available?.canStart ? '前置工序与配置条件已满足' : opState?.status !== 'PENDING' ? '当前工序不处于待开工状态' : '请核对对象状态与当前操作权限';
  const completionConditionText = opState?.status === 'COMPLETED' ? '工序已完工' : available?.canComplete ? '表单与作业要求已满足，可申请工序完工' : '开工后完成本工序的表单与作业';
  const conditionSummary = view?.historicalWithoutExecution ? '缺少历史执行记录 · 只读查阅'
    : objectEnded ? '当前对象已结束 · 只读查阅'
    : opState?.status === 'COMPLETED' ? completionConditionText
    : stageIssues.length ? `${stageIssues[0]}${stageIssues.length > 1 ? `（共 ${stageIssues.length} 项未满足）` : ''}`
    : pending ? startConditionText : completionConditionText;
  const scanNext = () => protect(() => { setBarcode(''); scanRef.current?.focus(); });
  const scanInput = <Box component="form" aria-busy={busy} className={view ? 'execution-scan' : 'execution-scan execution-scan-welcome'} onSubmit={(event) => { event.preventDefault(); protect(() => void load()); }}>
    <TextField inputRef={scanRef} autoFocus fullWidth size="small" value={barcode} disabled={busy}
      onChange={(event) => setBarcode(event.target.value)} placeholder={view ? '扫描批次 / SN 条码' : '请扫描或输入批次号 / SN 条码'}
      inputProps={{ maxLength: 64, 'aria-label': '扫描批次号 / SN 条码' }}
      InputProps={{ startAdornment: <InputAdornment position="start"><QrCodeScannerRounded color="primary" /></InputAdornment>,
        endAdornment: <InputAdornment position="end"><kbd>Enter</kbd></InputAdornment> }} />
    <Button className="execution-scan-submit" type="submit" variant="contained" disabled={busy || !barcode.trim()} endIcon={busy ? <CircularProgress size={16} color="inherit" /> : !view ? <ArrowForwardRounded /> : undefined}>{busy ? '识别中' : view ? '识别' : '识别条码'}</Button>
  </Box>;
  const documentPreview = <Box ref={documentBodyRef} className="execution-document-body">
    {documentError ? <Alert severity="error">{documentError}</Alert>
      : documentUrl ? documentImage
        ? <Box component="img" alt={`工序 ESOP：${document?.name ?? 'SOP'}`} src={documentUrl} style={{ width: `${documentZoom * 100}%`, maxWidth: 'none' }} />
        : <Box component="iframe" title={document?.name ?? '工序文件'} src={documentUrl} />
      : <Box className="execution-document-empty"><InfoOutlined /><Typography variant="body2" color="text.secondary">{document?.fileId ? '正在加载文件…' : op?.documents.length ? '当前文件未配置可预览内容。' : '当前工序未配置 SOP 文件。'}</Typography></Box>}
  </Box>;
  const documentNavigation = <Stack direction="row" className="execution-document-pagination" alignItems="center" justifyContent="space-between">
    <Button size="small" disabled={!documentUrl || documentPage <= (Number(document?.pageStart) || 1)} onClick={() => setDocumentPage((page) => page - 1)}>上一页</Button>
    <Typography variant="caption" color="text.secondary">{documentUrl ? `第 ${documentPage} / ${Math.min(documentPages, Number(document?.pageEnd) || documentPages)} 页` : '—'}</Typography>
    <Button size="small" disabled={!documentUrl || documentPage >= Math.min(documentPages, Number(document?.pageEnd) || documentPages)} onClick={() => setDocumentPage((page) => page + 1)}>下一页</Button>
  </Stack>;

  const auxiliaryPanels = [
    { id: 'sop' as const, label: 'eSOP', title: '工序 eSOP', icon: <MenuBookRounded />, content: <Box className="execution-sop">
          <Box className="execution-document-toolbar">
            <TextField select size="small" value={documentZoom} disabled={!documentUrl || !documentImage} onChange={(event) => setDocumentZoom(Number(event.target.value))} SelectProps={{ native: true }} inputProps={{ 'aria-label': 'ESOP 缩放' }}>{[0.75, 1, 1.25, 1.5, 2].map((zoom) => <option key={zoom} value={zoom}>{zoom === 1 ? '适合宽度' : `${zoom * 100}%`}</option>)}</TextField>
          </Box>
          {document && <Typography variant="caption" className="execution-document-version" color="text.secondary">{document.name} · {document.code} · {document.version}</Typography>}
          {documentPreview}
          {documentNavigation}
        </Box> },
    { id: 'works' as const, label: '作业', title: '作业动作', icon: <FactCheckRounded />, content: <Stack spacing={1.5} className="execution-scroll-content">{selectedWork ? [selectedWork].map((work) => <Box key={work.id} sx={{ ...panel, p: 1.5 }}><Stack direction="row" justifyContent="space-between"><Typography fontWeight={600}>{work.name}</Typography><Chip size="small" label={labels[opState?.works[work.id]?.status ?? 'PENDING'] ?? '待执行'} /></Stack>
            {work.nodes.filter((node) => opState?.works[work.id]?.active?.includes(node.id)).map((node) => <Box key={node.id} sx={{ mt: 1.25 }}><Typography variant="body2">{node.data.label}</Typography><Typography variant="body2" color="text.secondary">{node.data.config?.confirmationInstruction || node.data.config?.message}</Typography>
              {node.data.kind === 'CONFIRMATION' ? <Button disabled={busy || opState?.status !== 'IN_PROGRESS' || view?.objectStatus !== 'IN_PROGRESS'} onClick={() => protect(() => void act({ action: 'CONFIRM', workId: work.id, nodeId: node.id }))}>确认完成</Button> : node.data.kind === 'FORM' ? <Button onClick={() => { const target = forms.find((item) => item.workId === work.id && item.workNodeId === node.id); if (target) protect(() => { chooseForm(target.id); setActivePanel(null); setNavigationSection(null); }); }}>填写表单</Button> : null}</Box>)}</Box>) : <Typography color="text.secondary">当前工序没有匹配到适用作业。</Typography>}</Stack> },
    { id: 'history' as const, label: '记录', title: historyGroup.label, icon: <HistoryRounded />, content: <Stack spacing={1.5} className="execution-scroll-content">{historyGroup.entries.length ? historyGroup.entries.map((entry, index) => <Box key={`${entry.at}-${index}`} sx={{ borderLeft: '2px solid #c7def3', pl: 1.5 }}><Typography variant="body2" fontWeight={600}>{entry.action} · {entry.operationName}</Typography><Typography variant="caption" color="text.secondary">{time(entry.at)} · {entry.operator}</Typography>{entry.detail && <Typography variant="body2">{entry.detail}</Typography>}</Box>) : <Typography color="text.secondary">当前工序暂无{historyGroup.label}。</Typography>}</Stack> },
  ];

  const navigationTitle = navigationSection === 'sop' ? '工序 eSOP' : navigationSection === 'works' ? '作业动作' : navigationSection === 'history' ? '工序记录' : '当前填报表单';
  const navigationItems = navigationSection === 'sop' ? (op?.documents ?? []).map(item => ({ id: item.id, name: item.name, detail: `${item.code} · ${item.version}` }))
    : navigationSection === 'works' ? (op?.works ?? []).map(item => ({ id: item.id, name: item.name, detail: `${item.version} · ${labels[opState?.works[item.id]?.status ?? 'PENDING'] ?? '待执行'}` }))
    : navigationSection === 'history' ? historyGroups.map(group => ({ id: group.id, name: group.label, detail: `${group.entries.length} 条记录` }))
    : forms.map(item => ({ id: item.id, name: item.name, detail: `${item.version} · ${opState?.forms[item.id]?.status === 'COMPLETED' ? '已完成' : opState?.forms[item.id]?.savedAt ? '已保存' : '待填报'}` }));
  const selectedNavigationId = navigationSection === 'sop' ? documentId : navigationSection === 'works' ? selectedWork?.id : navigationSection === 'history' ? historyGroup.id : formId;
  const selectNavigationItem = (id: string) => {
    if (navigationSection === 'sop') { setDocumentId(id); setActivePanel('sop'); }
    else if (navigationSection === 'works') { setSelectedWorkId(id); setActivePanel('works'); }
    else if (navigationSection === 'history') { setHistoryType(id); setActivePanel('history'); }
    else if (id === formId) setActivePanel(null);
    else protect(() => { chooseForm(id); setActivePanel(null); });
  };
  const navigationContent = <Box className="execution-navigation-content">
    <Box className={`execution-navigation-heading${!navigationSection && form && copies ? ' has-form-corner' : ''}`}><Typography component="h3">{navigationTitle}</Typography>{navigationSection && <Typography component="span">{navigationItems.length}</Typography>}</Box>
    {!navigationSection && form && copies && <Box component="span" className="execution-form-corner" data-required={copies.required}>{copies.required ? '必填' : '非必填'}</Box>}
    {!navigationSection && form ? <Box className="execution-current-form">
      <Box className="execution-current-form-heading">
        <Typography className="execution-current-form-name">{form.name}</Typography>
        <Button className="execution-form-switch-action" aria-label={`切换表单，当前${form.name}`} aria-haspopup="dialog" aria-expanded={formDrawerOpen} aria-controls="execution-form-drawer" disabled={busy} onClick={() => setFormDrawerOpen(true)}><SwapHorizRounded /><span>切换表单</span></Button>
      </Box>
      <Box component="dl" className="execution-order-summary execution-current-form-fields">
        <Box><Typography component="dt">表单编码</Typography><Typography component="dd">{form.code || '—'}</Typography></Box>
        <Box><Typography component="dt">表单版本</Typography><Typography component="dd">{form.version || '—'}</Typography></Box>
        <Box><Typography component="dt">表单实例号</Typography><Typography component="dd" className="execution-form-instance-number" title={formState?.instanceNo || '首次暂存或提交当前份后生成'}>{formState?.instanceNo || '未生成'}</Typography></Box>
        <Box className="execution-copy-summary"><Typography component="dt">表单份序</Typography><Box component="dd">
          <Button className="execution-copy-switch" title="切换份序" aria-label={`切换份序，当前第 ${Math.max(1, instanceIds.indexOf(selectedInstanceId) + 1)} 份，共 ${Math.max(1, instanceIds.length)} 份`} aria-haspopup="dialog" aria-expanded={copyDrawerOpen} aria-controls="execution-copy-drawer" disabled={busy} onClick={() => setCopyDrawerOpen(true)}>
            <span className="execution-copy-switch-value">第 {Math.max(1, instanceIds.indexOf(selectedInstanceId) + 1)} 份 / 共 {Math.max(1, instanceIds.length)} 份</span>
            <SwapHorizRounded />
          </Button>
        </Box></Box>
        <Box><Typography component="dt">表单状态</Typography><Typography component="dd" className="execution-form-status" data-status={formStatus}>{formStatusLabel}</Typography></Box>
        <Box><Typography component="dt">表单模板分类</Typography><Typography component="dd" title={form.categoryName === undefined ? '历史执行未保存分类，展示模板当前分类' : '执行快照中的表单模板分类'}>{form.categoryName !== undefined ? form.categoryName || '未分类' : formCategory?.versionId === form.versionId ? formCategory.name : '—'}</Typography></Box>
      </Box>
      {copies?.ended && <Typography className="execution-copy-status">已结束本阶段填报</Typography>}
    </Box> : navigationSection && <List className="execution-navigation-list" disablePadding aria-label={navigationTitle}>
      {navigationItems.map(item => <ListItemButton component="button" type="button" key={item.id} selected={item.id === selectedNavigationId} aria-current={item.id === selectedNavigationId ? 'true' : undefined} disabled={busy} onClick={() => selectNavigationItem(item.id)}><Typography component="span" className="execution-navigation-name">{item.name}</Typography><Typography component="span" className="execution-navigation-detail">{item.detail}</Typography></ListItemButton>)}
    </List>}
    {!navigationItems.length && <Typography className="execution-navigation-empty">{navigationSection === 'sop' ? '当前工序未配置 SOP' : navigationSection === 'works' ? '当前工序未配置作业动作' : '当前工序未配置生产表单'}</Typography>}
    {!navigationSection && !form && <Button size="small" disabled={busy} aria-haspopup="dialog" aria-expanded={formDrawerOpen} onClick={() => setFormDrawerOpen(true)}>选择或新增表单</Button>}
  </Box>;

  return <Box ref={rootRef} className="execution-page">
    <Box className="execution-toolbar">
      <Box className="execution-title"><Typography component="h1">生产工作台</Typography></Box>
      {view && scanInput}
      <Stack direction="row" className="execution-tools">
        {view && <Button variant="outlined" aria-label="刷新执行状态" disabled={busy} startIcon={<RefreshRounded fontSize="small" />} onClick={() => protect(() => void load(true))}>刷新</Button>}
        <Button variant="outlined" aria-label="全屏工作台" startIcon={<FullscreenRounded fontSize="small" />} onClick={() => void (globalThis.document.fullscreenElement ? globalThis.document.exitFullscreen() : rootRef.current?.requestFullscreen())}>全屏</Button>
      </Stack>
    </Box>
    <Box className="execution-notices" aria-live="polite">
      {view?.configurationError && <Alert severity="error">{view.configurationError}</Alert>}
      {view?.historicalWithoutExecution && <Alert severity="warning">此对象已有生产状态，但没有工序执行记录。当前仅展示已有关联信息，不能恢复或推断历史工序。</Alert>}
    </Box>
    {!view ? openingExecution ? <Box className="execution-empty-content" role="status" aria-label="正在加载生产工作台"><CircularProgress size={24} /><Typography color="text.secondary">正在加载生产工作台…</Typography></Box> : <Box className="execution-welcome">
      <Typography className="execution-eyebrow" color="primary">生产工作台</Typography>
      <Typography component="h2">扫描条码，开始作业</Typography>
      <Typography color="text.secondary">批次与 SN 自动识别，直接定位对应工单和当前工序。</Typography>
      <Box className="execution-welcome-input"><Typography component="label" variant="body2">批次号 / SN 条码</Typography>{scanInput}</Box>
      <Stack direction="row" justifyContent="space-between" className="execution-scan-help"><Typography variant="caption">支持扫码枪输入后回车</Typography><Typography variant="caption">扫码仅识别对象，开工需明确操作</Typography></Stack>
      <Box className="execution-guide">
        {[['01', '识别生产对象', '工单、产品与配置自动带出'], ['02', '进入可执行工序', '查看前置条件，再开始操作'], ['03', '按要求记录与完工', '专注填报，随时展开 SOP 与作业要求']].map(([number, title, detail]) => <Box key={number}><Typography className="execution-eyebrow">{number}</Typography><Typography fontWeight={600}>{title}</Typography><Typography variant="caption" color="text.secondary">{detail}</Typography></Box>)}
      </Box>
    </Box> : <Box className="execution-workspace">
      <Box className="execution-sidebar">
      <Box component="section" aria-label="当前生产对象" className="execution-identity">
        <Stack direction="row" alignItems="center" className="execution-identity-heading">
          <Stack direction="row" alignItems="center" className="execution-object-heading">
            <Box className="execution-object-label-row">
              <Typography className="execution-object-label">{context?.objectType === 'SN' ? 'SN 码' : '批次号'}</Typography>
              <Typography className="execution-status" data-status={view.objectStatus}>{labels[view.objectStatus] ?? view.objectStatus}</Typography>
            </Box>
            <Typography component="h2">{context?.objectNo}</Typography>
          </Stack>
          <Box component="dl" className="execution-order-summary">
            <Box><Typography component="dt">工单</Typography><Typography component="dd">{context?.workOrderNo || '—'}</Typography></Box>
            <Box className="execution-product-summary"><Typography component="dt">生产产品</Typography><Box component="dd"><ExecutionProductDetails key={view.snapshot.context.objectId} context={view.snapshot.context} container={() => rootRef.current} suspended={Boolean(busy || signing || pendingSwitch || operationDrawerOpen || formDrawerOpen || copyDrawerOpen || activePanel)} /></Box></Box>
            <Box><Typography component="dt">目标数量</Typography><Typography component="dd">{context?.targetQuantity != null ? `${context.targetQuantity} ${context.unit ?? ''}`.trim() : '—'}</Typography></Box>
            {([['产出数量', output?.outputQuantity], ['良品数量', output?.goodQuantity], ['报废数量', output?.scrapQuantity]] as const).map(([label, quantity]) => <Box key={label} title={`当前工序：${op?.name || op?.code || '暂无工序'} · ${output?.message || '暂无工序产出数据'}`}><Typography component="dt">{label}</Typography><Typography component="dd">{output?.status === 'READY' && quantity != null ? `${quantity} ${context?.unit ?? ''}`.trim() : '—'}</Typography></Box>)}
          </Box>
          <Box className="execution-object-progress" title="按已完成工序数占总工序数计算">
            <Box className="execution-progress-caption">
              <Typography>{context?.objectType === 'SN' ? 'SN 完成进度' : '批次完成进度'}</Typography>
              <Typography>{completionPercent == null ? '—' : `${completionPercent}%`}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={completionPercent ?? 0} aria-label={context?.objectType === 'SN' ? 'SN 完成进度' : '批次完成进度'} aria-valuetext={completionPercent == null ? '无执行进度' : `${completionPercent}%`} />
            <Typography className="execution-completed-operations">{view.historicalWithoutExecution ? '无执行记录' : <><span>已完成工序</span><span>{completed} / {total}</span></>}</Typography>
          </Box>
        </Stack>
        <Box ref={setQuickRailContainer} className="execution-sidebar-shortcuts" />
      </Box>

      </Box>
      <ExecutionQuickPanel active={activePanel} onChange={setActivePanel} section={navigationSection} onSectionChange={setNavigationSection} navigationContent={navigationContent} railContainer={quickRailContainer} suspended={Boolean(signing || pendingSwitch || operationDrawerOpen || formDrawerOpen || copyDrawerOpen || incompleteNotice)} context={`${context?.objectNo ?? ''} · ${op?.name ?? '未选择工序'}`} panels={auxiliaryPanels}>
        <Box component="section" aria-label="当前工序工作区" className="execution-workarea">
          <Stack direction="row" justifyContent="space-between" alignItems="center" className="execution-operation-heading"><Box>
            <Typography className="execution-eyebrow">{op ? `工序 ${String(operations.indexOf(op) + 1).padStart(2, '0')}` : '当前工序'}</Typography>
            <Typography component="h2">{op?.name ?? '暂无可执行工序'}</Typography>
          </Box>
          <ExecutionOperationDrawer open={operationDrawerOpen} onOpen={() => { setActivePanel(null); setOperationDrawerOpen(true); }} onClose={() => setOperationDrawerOpen(false)} disabled={busy || !operations.length}
            currentName={op?.name || op?.code || '暂无工序'} currentStatus={labels[opState?.status ?? ''] || '待开工'} currentStatusCode={opState?.status} container={() => rootRef.current}>
        <Box component="aside" aria-label="工序导航" className="execution-route">
          <Stack direction="row" justifyContent="space-between" className="execution-route-heading"><Typography variant="body2" fontWeight={600}>工序导航</Typography><Typography variant="caption" color="text.secondary">{operations.length} 道工序</Typography></Stack>
          <Typography className="execution-route-summary">{operations.filter((item) => view.availability[item.id]?.canStart).length} 道可开工 · {operations.filter((item) => view.state.operations[item.id]?.status === 'IN_PROGRESS').length} 道进行中</Typography>
          <List className="execution-operation-list">{operations.map((item) => {
            const status = view.state.operations[item.id]?.status; const ready = view.availability[item.id]?.canStart;
            const selected = operationId === item.id;
            const links = routeLinks.get(item.id);
            return <ListItemButton key={item.id} selected={selected} disabled={busy} aria-current={selected ? 'step' : undefined} onClick={() => { if (selected) setOperationDrawerOpen(false); else protect(() => { chooseOperation(item.id); setOperationDrawerOpen(false); }); }} className={`execution-operation ${status === 'COMPLETED' ? 'is-complete' : ''} ${ready ? 'is-ready' : ''} ${status === 'IN_PROGRESS' ? 'is-running' : ''}`}>
              <Box className="execution-operation-text">
                <Box className="execution-operation-title"><Typography variant="body2" fontWeight={600}>{item.name || item.code}</Typography>{selected && <span className="execution-viewing">查看中</span>}</Box>
                <Typography className="execution-operation-status">{status === 'COMPLETED' ? <CheckCircleRounded /> : status === 'IN_PROGRESS' || ready ? <PlayArrowRounded /> : <LockOutlined />}{view.historicalWithoutExecution ? '无执行记录' : status === 'IN_PROGRESS' ? labels[status] : ready ? '可开工' : status === 'PENDING' ? '未满足条件' : labels[status] ?? status}</Typography>
                {!!links?.before.length && <Typography className="execution-operation-dependency">{links.before.length > 1 ? '汇合前置' : '前置'}：{links.before.map((id: string) => operationNames.get(id)).join('、')}</Typography>}
                {links?.after.length > 1 && <Typography className="execution-operation-dependency">后续分支：{links.after.map((id: string) => operationNames.get(id)).join('、')}</Typography>}
              </Box>
            </ListItemButton>;
          })}</List>
          <Stack direction="row" spacing={0.75} className="execution-route-note"><InfoOutlined fontSize="small" /><Typography variant="caption">按路线关系查看工序；各分支是否可执行，以条件校验为准。</Typography></Stack>
        </Box>
          </ExecutionOperationDrawer>
          <Box className="execution-header-action">
            {view.objectStatus === 'COMPLETED' ? <Button size="small" variant="contained" disabled={busy} onClick={scanNext}>扫描下一个</Button>
              : pending ? <Button size="small" startIcon={<PlayArrowRounded />} variant="contained" disabled={busy || dirty || !available?.canStart} onClick={() => void act({ action: 'START' })}>工序开工</Button>
              : opState?.status === 'IN_PROGRESS' ? <Tooltip title={dirty ? '请先暂存当前表单，再进行工序完工' : ''}><span><Button size="small" startIcon={<CheckCircleRounded />} variant={available?.canComplete ? 'contained' : 'outlined'} disabled={busy || dirty || !available?.canComplete} onClick={finishOperation}>工序完工</Button></span></Tooltip> : null}
          </Box>
          </Stack>
          <ClickAwayListener onClickAway={closeConditions}>
          <Box component="details" ref={conditionsRef} key={operationId} className={`execution-conditions ${stageIssues.length && !objectEnded ? 'has-issues' : ''}`}>
            <Box component="summary" title={conditionSummary}><Typography variant="body2">开/完工作业条件：{conditionSummary}</Typography><Box component="span" className="execution-condition-actions"><Button size="small" startIcon={<RefreshRounded />} disabled={busy || dirty} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void load(true); }}>校验条件</Button><ExpandMoreRounded className="execution-condition-chevron" fontSize="small" /></Box></Box>
            <Box className="execution-condition-content">
              {opState?.startedAt && <Typography variant="caption" color="text.secondary">开工时间 {time(opState.startedAt)}</Typography>}
              <Typography variant="body2" fontWeight={600}>开工条件</Typography>
              <ConditionList issues={available?.startIssues ?? []} met={Boolean(available?.canStart)} emptyText={startConditionText} />
              <Typography variant="body2" fontWeight={600}>完工检查</Typography>
              <ConditionList issues={available?.completionIssues ?? []} met={Boolean(available?.canComplete || opState?.status === 'COMPLETED')} emptyText={completionConditionText} />
              {stageIssues.length > 0 && !pending && <Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => { closeConditions(); setActivePanel(forms.length ? null : 'works'); }}>处理未完成项</Button>}
            </Box>
          </Box>
          </ClickAwayListener>
          <>
            {form && formDocument ? <>
              <Box aria-label={`当前填报表单：${form.name}`} className={`execution-form-canvas ${layout === 'fields' ? 'is-fields' : ''}`}>
                {layout === 'canvas' ? <FormDocumentPreview key={`${operationId}/${selectedInstanceId}`} document={formDocument} fieldPermissions={controls?.permissions} runtime={formRuntime}
                  fallback={<FormCanvasPreview document={formDocument} layout="fields" fieldPermissions={controls?.permissions} runtime={formRuntime} />} />
                  : <FormCanvasPreview key={`${operationId}/${selectedInstanceId}`} document={formDocument} layout="fields" fieldPermissions={controls?.permissions} runtime={formRuntime} />}
              </Box>
              <Box role="region" aria-label="表单操作" className="execution-form-actions">
                <Box className="execution-form-footer-context">
                <Box role="group" aria-label="填报方式" className="execution-layout-switch" data-layout={layout}>
                  <Tooltip title="按字段填报" placement="top" arrow><button type="button" aria-label="按字段填报" aria-pressed={layout === 'fields'} onClick={() => setLayout('fields')}><ViewListOutlined /></button></Tooltip>
                  <Tooltip title="按表单填报" placement="top" arrow><button type="button" aria-label="按表单填报" aria-pressed={layout === 'canvas'} onClick={() => setLayout('canvas')}><TableChartOutlined /></button></Tooltip>
                </Box>
                {formReceipt && <Typography variant="caption" color="text.secondary">{formReceipt.label} {time(formReceipt.at)}</Typography>}
                {formStatus === 'WAITING_OPERATION_START' && <Typography variant="caption" color="text.secondary">计划预览，工序开工后可填报</Typography>}
                {formStatus === 'WAITING_WORK_NODE' && <Typography variant="caption" color="text.secondary">计划预览，作业流程到达后可填报</Typography>}
                </Box>
                <WorkflowActionButtons buttons={controls?.buttons} busy={busy} canAct={controls?.canAct} labelFor={(button) => button.action === 'SAVE' ? '暂存' : button.label} onAction={formAction} />
              </Box>
            </> : <Box className="execution-empty-content"><InfoOutlined color="disabled" /><Typography color="text.secondary">本工序未配置生产表单。请查看作业与完工条件。</Typography></Box>}
          </>
        </Box>
      </ExecutionQuickPanel>
    </Box>}
    <ExecutionFormSelector open={formDrawerOpen} onClose={() => setFormDrawerOpen(false)} container={() => rootRef.current} forms={forms}
      copies={available?.formCopies ?? {}} selectedId={formId} busy={busy} canAttach={Boolean(available?.canAttachForm)} operationStatus={opState?.status} workStates={opState?.works} editors={editors}
      onSelect={id => { setFormDrawerOpen(false); if (id !== formId) protect(() => { chooseForm(id); setActivePanel(null); }); }}
      onAttach={(templateVersionId, required) => { setFormDrawerOpen(false); protect(() => void act({ action: 'ATTACH_FORM', templateVersionId, required })); }} />
    <ExecutionCopyDrawer open={copyDrawerOpen} onClose={() => setCopyDrawerOpen(false)} container={() => rootRef.current}
      formName={form?.name ?? ''} instanceIds={instanceIds} forms={opState?.forms ?? {}} selectedId={selectedInstanceId}
      busy={busy} canAdd={Boolean(copies?.canAdd)} beforeAdd={open => protect(() => { chooseForm(formId, view, operationId, selectedInstanceId); open(); })}
      onSelect={id => { setCopyDrawerOpen(false); if (id !== selectedInstanceId) protect(() => chooseForm(formId, view, operationId, id)); }}
      onAdd={remark => act({ action: 'ADD_FORM_COPY', formId, remark })}
      canEditRemark={Boolean(copies?.canEditRemark)} onEditRemark={(instanceId, remark) => act({ action: 'UPDATE_FORM_COPY_REMARK', formId, instanceId, remark })}
      onCopyResult={success => success ? setNotice('表单实例号已复制') : setError('复制失败，请重试')} />
    <Snackbar open={Boolean(error) && !signing} autoHideDuration={4000} onClose={(_, reason) => { if (reason !== 'clickaway') setError(''); }} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}><Alert severity="error" onClose={() => setError('')} sx={{ maxWidth: 480 }}>{error}</Alert></Snackbar>
    <Snackbar open={Boolean(notice)} autoHideDuration={6000} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}><Alert severity="success" onClose={() => setNotice('')} sx={{ maxWidth: 480 }}>{notice}</Alert></Snackbar>
    <ConfirmDialog container={() => rootRef.current} initialFocus="cancel" open={Boolean(incompleteNotice)} title="存在未完成的非必填表单" message={`${incompleteNotice?.join('；') ?? ''}。继续后保留未完成数据，表单仍为进行中；补填入口将在后续提供。`} confirmText="已知晓，工序完工" cancelText="返回填写" onCancel={() => setIncompleteNotice(null)} onConfirm={() => { const next = incompleteNotice; setIncompleteNotice(null); if (next) void act({ action: 'COMPLETE', acknowledgeIncomplete: true }); }} />
    <ConfirmDialog container={() => rootRef.current} initialFocus="cancel" destructive open={Boolean(pendingSwitch)} title="当前表单尚未保存" message={`${context?.objectNo ?? ''} · ${op?.name ?? ''} · ${form?.name ?? '当前表单'}：切换会丢弃未保存内容。可以返回继续填写并保存，或放弃修改后切换。`} confirmText="放弃修改并切换" cancelText="返回表单" onCancel={() => { setPendingSwitch(null); setOperationDrawerOpen(false); }} onConfirm={() => { const next = pendingSwitch; setPendingSwitch(null); setDirty(false); next?.(); }} />
    <AppDialog open={Boolean(transferButton)} onClose={busy ? undefined : () => { setTransferButton(null); setTransferTarget(null); setTransferReason(''); setTransferKeyword(''); setTransferError(''); }} maxWidth="sm" fullWidth>
      <DialogTitle>转办审批</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">将当前审批节点转办给其他授权用户。转办不会推进流程，受让人处理后流程才会继续。</Typography>
        <Autocomplete options={transferTargets} value={transferTarget} loading={transferLoading} getOptionLabel={(option) => `${option.name}（${option.username}）`} isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, value) => setTransferTarget(value)} onInputChange={(_, value) => setTransferKeyword(value)} noOptionsText={transferError ? '候选用户加载失败' : transferKeyword.trim() ? '没有找到匹配的可转办用户' : '当前授权范围内没有其他可转办用户'}
          renderInput={(params) => <TextField {...params} label="转办给" required error={Boolean(transferError)} helperText={transferError || '仅可选择当前审批节点授权范围内的其他启用用户'} />} />
        <TextField label="转办原因" required value={transferReason} onChange={(event) => setTransferReason(event.target.value)} multiline minRows={3} inputProps={{ maxLength: 500 }} helperText={`${transferReason.length}/500`} disabled={busy} />
      </Stack></DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => { setTransferButton(null); setTransferTarget(null); setTransferReason(''); setTransferKeyword(''); setTransferError(''); }}>取消</Button><Button variant="contained" disabled={busy || transferLoading || !transferTarget || !transferReason.trim()} onClick={() => { if (transferTarget) void act({ action: 'TRANSFER', formId, instanceId: selectedInstanceId, targetUserId: transferTarget.id, reason: transferReason.trim() }); }}>{busy ? '正在转办…' : '确认转办'}</Button></DialogActions>
    </AppDialog>
    <AppDialog open={Boolean(signing)} onClose={busy ? undefined : () => { setSigning(null); setPassword(''); setError(''); }} maxWidth="xs" fullWidth><DialogTitle>{signing?.signatureTarget ? '签署签名' : signing?.label}{signing?.requiresSignature ? ' · 账户签署' : ''}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      {!signing?.signatureTarget && <Box sx={{ p: 1.5, bgcolor: '#f3f6fa', borderRadius: 1 }}><Typography variant="body2" fontWeight={600}>{context?.objectNo}</Typography><Typography variant="body2" color="text.secondary">{op?.name} · {form?.name} · 第 {instanceIds.indexOf(selectedInstanceId) + 1} 份</Typography><Typography variant="caption" color="text.secondary">本次操作：{signing?.label}</Typography></Box>}
      {signing?.signatureTarget ? <><Typography variant="body2" color="text.secondary">签名将保存当前内容并使用您已认证的签名图片。修改本份内容后需重新签名；表单仍需单独提交。</Typography><TextField autoFocus inputRef={signaturePasswordRef} label="电子签名密码" value={password} autoComplete="off" type="password" error={signaturePasswordError} helperText={signaturePasswordError ? error : undefined} onChange={(event) => { setPassword(event.target.value); if (signaturePasswordError) setError(''); }} disabled={busy} /></> : <>
        {signing?.requiresSignature && <><TextField label="当前操作人账户" value={account} autoComplete="username" onChange={(event) => setAccount(event.target.value)} disabled={busy} /><TextField label="账户密码" value={password} autoComplete="current-password" type="password" onChange={(event) => setPassword(event.target.value)} disabled={busy} /></>}
        <TextField label="操作意见" required={signing?.requireOpinion} value={opinion} onChange={(event) => setOpinion(event.target.value)} multiline minRows={2} disabled={busy} />
      </>}
      {error && !signaturePasswordError && <Alert severity="error">{error}</Alert>}</Stack></DialogContent><DialogActions><Button disabled={busy} onClick={() => { setSigning(null); setPassword(''); setError(''); }}>取消</Button><Button variant="contained" disabled={busy || (signing?.signatureTarget && !password) || (signing?.requiresSignature && (!account || !password)) || (signing?.requireOpinion && !opinion.trim())} onClick={() => { if (signing) void act({ action: signing.action, formId, instanceId: selectedInstanceId, values, ...(signing.signatureTarget ? { signatureTarget: signing.signatureTarget, password } : { account, password, opinion }) }); }}>{busy ? '正在处理…' : signing?.signatureTarget ? '确认签名' : '确认'}</Button></DialogActions></AppDialog>
  </Box>;
}
function ConditionList({ issues, emptyText, met = false }: { issues: string[]; emptyText: string; met?: boolean }) {
  return <Stack spacing={1.25}>{issues.length ? issues.map((issue) => <Stack key={issue} direction="row" spacing={1} alignItems="flex-start"><LockOutlined sx={{ fontSize: 17, mt: 0.2, color: 'warning.main' }} /><Typography variant="body2">{issue}</Typography></Stack>)
    : <Stack direction="row" spacing={1}>{met ? <CheckCircleRounded sx={{ fontSize: 18, color: 'success.main' }} /> : <InfoOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />}<Typography variant="body2" color="text.secondary">{emptyText}</Typography></Stack>}</Stack>;
}
