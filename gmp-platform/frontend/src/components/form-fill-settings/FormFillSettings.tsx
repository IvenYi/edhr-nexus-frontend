import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Autocomplete, Box, Button, IconButton, Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { AccountTreeOutlined, EditNoteOutlined, TuneOutlined, VisibilityOutlined } from '@mui/icons-material';
import client from '@/api/client';
import { getFormTemplateVersion, type TemplateVersionRecord } from '@/api/template-modeling';
import { WorkflowActionConfig, defaultWorkflowButtons } from '@/components/flow-designer/WorkflowActionConfig';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { EntryPermissionGroupEditor } from './EntryPermissionGroupEditor';
import { FormPermissionConfigDialog, processBuiltinEvents, processPermissionSubjects, pruneFieldPermissions, pruneEventBindings, templateFields } from './FormFieldPermissions';
import { directFillVersion, fillMode, type FormFillSettingsValue } from './types';
import { permissionSummary, signatureBindingSummary } from './permissionSummary';
import FormProcessPreviewDialog, { type ProcessOption as Process } from './FormProcessPreviewDialog';

export type FillForm = { id: string; templateId: string; name: string; code?: string | null };

export default function FormFillSettings({ value, form, editable, onChange }: {
  value: FormFillSettingsValue;
  form: FillForm | null;
  editable: boolean;
  onChange: (value: FormFillSettingsValue) => void;
}) {
  const mode = fillMode(value);
  const [tab, setTab] = useState('people');
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [previewProcess, setPreviewProcess] = useState<Process | null>(null);
  const [processOptionsOpen, setProcessOptionsOpen] = useState(false);
  const processInputRef = useRef<HTMLInputElement>(null);
  const previewActiveRef = useRef(false);
  const processes = useQuery({ queryKey: ['form-fill-process-options'], queryFn: async () =>
    (await client.get('/workflow/form-fill-settings/processes')).data.data as Process[] });
  const process = useQuery({ queryKey: ['form-fill-process', value.formProcessVersionId], enabled: mode === 'PROCESS' && Boolean(value.formProcessVersionId),
    queryFn: async () => (await client.get(`/workflow/form-fill-settings/processes/${value.formProcessVersionId}`)).data.data as Process });
  const version = useQuery({ queryKey: ['form-template-version', form?.templateId, form?.id], enabled: Boolean(form),
    queryFn: async () => (await getFormTemplateVersion(form!.templateId, form!.id)).data.data as TemplateVersionRecord });
  const direct = value.directFillConfig ?? {};
  const active = mode === 'DIRECT' ? direct : value;
  const graph = useMemo(() => mode === 'DIRECT' ? directFillVersion(direct) : process.data, [mode, value.directFillConfig, process.data]);
  const subjects = useMemo(() => processPermissionSubjects(graph), [graph]);
  const events = useMemo(() => processBuiltinEvents(graph), [graph]);
  const fields = useMemo(() => templateFields(version.data), [version.data]);
  const document = useMemo(() => form && version.data ? parseReactTemplateDesignerDocument({ id: form.templateId, name: form.name, code: form.code, type: 'FORM_TEMPLATE' }, version.data) : null, [form, version.data]);
  const options = processes.data ?? [];
  const selected = options.find(item => item.versionId === value.formProcessVersionId) ?? process.data ?? null;
  const bindingSummary = signatureBindingSummary(events, direct.eventBindings);
  const nodeActions = useMemo(() => {
    if (!graph?.nodesJson) return [];
    try {
      const nodes = JSON.parse(graph.nodesJson) as Array<{ id: string; data?: { kind?: string; label?: string; config?: typeof direct } }>;
      return nodes.filter(node => node.data?.kind === 'START' || node.data?.kind === 'APPROVAL').map((node) => {
        const config = node.data?.config;
        const buttons = config?.buttons?.length ? config.buttons : defaultWorkflowButtons(node.data?.kind as 'START' | 'APPROVAL');
        const visible = buttons.filter(button => button.visible !== false);
        const signatures = (config?.buttonEvents ?? []).filter(event => (event as { enabled?: boolean }).enabled !== false);
        const actionName = (action: string) => ({ SAVE: '保存', SUBMIT: '提交', APPROVE: '审批', RETURN: '退回', TRANSFER: '转办' }[action] ?? action);
        return { id: node.id, kind: node.data?.kind,
          text: `${visible.map(button => button.label).join('、') || '无可见按钮'} · ${signatures.length ? `${signatures.length} 项签署` : '无签署要求'}`,
          details: [
            ...buttons.map(button => `${button.label}：${actionName(button.action)}，${button.visible === false ? '隐藏' : '显示'}${button.requireOpinion || button.action === 'TRANSFER' ? '，意见/原因必填' : ''}`),
            ...signatures.map(event => {
              const fieldId = active.eventBindings?.[`${node.id}:${event.id}`]?.fieldId;
              return `${actionName(event.action)}前：账户密码签署${event.builtin === 'FILL_SIGN_FIELD' ? `；签名字段：${fieldId ? fields.find(field => field.id === fieldId)?.name || `字段 #${fieldId}` : '未绑定'}` : ''}`;
            }),
          ].join('\n') };
      });
    } catch { return []; }
  }, [graph, active.eventBindings, fields]);
  const permissionRows = <Stack spacing={0}>
    {subjects.map((subject, index) => {
      const summary = permissionSummary(subject, active.fieldPermissions, fields);
      const actions = nodeActions.find(node => subject.stage === '填报' ? node.kind === 'START' : node.id === subject.id.replace(/^approval:/, ''));
      const detail = `${subject.members}\n${summary.defaultLabel}\n${summary.exceptionLabel}：${summary.names.join('、') || '无'}${actions ? `\n${actions.details}` : ''}`;
      return <Tooltip key={subject.id} arrow title={<Box sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{detail}</Box>}>
        <Box tabIndex={0} aria-label={`${subject.label}：${detail}`} sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider', minWidth: 0, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={0.5} useFlexGap flexWrap="wrap">
            <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{index + 1}. {subject.label}</Typography>
            <Typography variant="caption">{summary.text}</Typography>
          </Stack>
          <Typography variant="caption" noWrap component="div" color="text.secondary">{subject.members}</Typography>
          {mode === 'PROCESS' && actions ? <Typography variant="caption" color="text.secondary" noWrap component="div">{actions.text}</Typography> : null}
        </Box>
      </Tooltip>;
    })}
  </Stack>;
  const fieldSettingsButton = <Button fullWidth size="small" variant="outlined" startIcon={<TuneOutlined />} onClick={() => setPermissionsOpen(true)}
    disabled={!form || version.isLoading || version.isError || (mode === 'PROCESS' && !process.data)}>
    {editable ? '字段权限设置' : '查看字段权限'}
  </Button>;
  const updateDirect = (patch: Partial<typeof direct>) => {
    const next = { ...direct, ...patch };
    if (patch.permissionGroupRules && next.fieldPermissions) {
      next.fieldPermissions = { ...next.fieldPermissions };
      for (const group of patch.permissionGroupRules) {
        const previous = direct.permissionGroupRules?.find(item => item.id === group.id);
        const key = `start:${group.id}`;
        if (previous && previous.defaultPermission !== group.defaultPermission && next.fieldPermissions[key]) {
          next.fieldPermissions[key] = { ...next.fieldPermissions[key], defaultPermission: group.defaultPermission ?? 'EDIT' };
        }
      }
    }
    const nextGraph = directFillVersion(next);
    if (version.isSuccess) {
      next.fieldPermissions = pruneFieldPermissions(next.fieldPermissions, processPermissionSubjects(nextGraph), fields);
      next.eventBindings = pruneEventBindings(next.eventBindings, processBuiltinEvents(nextGraph), fields);
    }
    onChange({ ...value, fillMode: 'DIRECT', directFillConfig: next });
  };
  return <Stack spacing={2} sx={{ minWidth: 0 }}>
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>填报方式</Typography>
      <ToggleButtonGroup exclusive fullWidth size="small" value={mode} disabled={!editable} aria-label="填报方式"
        onChange={(_, next) => { if (next && next !== mode) { onChange({ ...value, fillMode: next }); setTab('people'); } }}
        sx={{ '& .MuiToggleButton-root': { gap: 0.75, py: 1, textTransform: 'none', whiteSpace: 'nowrap' } }}>
        <ToggleButton value="DIRECT"><EditNoteOutlined fontSize="small" />直接填报</ToggleButton>
        <ToggleButton value="PROCESS"><AccountTreeOutlined fontSize="small" />按流程填报</ToggleButton>
      </ToggleButtonGroup>
    </Box>
    {mode === 'PROCESS' ? <>
      <Autocomplete size="small" disablePortal options={selected && !options.some(item => item.versionId === selected.versionId) ? [selected, ...options] : options}
        open={processOptionsOpen} onOpen={() => setProcessOptionsOpen(true)}
        onClose={(event, reason) => {
          if (previewActiveRef.current) return;
          const target = (event as unknown as { relatedTarget?: HTMLElement | null }).relatedTarget;
          if (reason === 'blur' && target?.closest('[data-process-preview]')) return;
          setProcessOptionsOpen(false);
        }}
        value={selected} loading={processes.isLoading || process.isLoading} disabled={!editable}
        getOptionLabel={item => `${item.name} · V${item.versionNumber}`} isOptionEqualToValue={(a, b) => a.versionId === b.versionId}
        onChange={(_, next) => onChange({ ...value, fillMode: 'PROCESS', formProcessVersionId: next?.versionId ?? '', formProcessName: next ? `${next.name} · V${next.versionNumber}` : '' })}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return <Box component="li" key={key} {...optionProps}>
            <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{option.name} · V{option.versionNumber}</Typography>
            <Tooltip title="预览流程">
              <IconButton size="small" data-process-preview aria-label={`预览流程 ${option.name} V${option.versionNumber}`}
                onMouseDown={event => event.preventDefault()}
                onKeyDown={event => event.stopPropagation()}
                onClick={event => { event.stopPropagation(); previewActiveRef.current = true; setPreviewProcess(option); }}>
                <VisibilityOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>;
        }}
        renderInput={params => <TextField {...params} inputRef={processInputRef} label="表单流程" required error={Boolean(process.isError || processes.isError)} />} />
      {process.isError || processes.isError ? <Alert severity="error">表单流程加载失败</Alert> : null}
      {process.data && processes.isSuccess && !options.some(item => item.versionId === value.formProcessVersionId) ? <Alert severity="info">当前绑定历史发布版本 V{process.data.versionNumber}</Alert> : null}
    </> : null}
      {mode === 'DIRECT' ? <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="fullWidth" sx={{ minHeight: 36, borderBottom: '1px solid', borderColor: 'divider', '& .MuiTab-root': { minHeight: 36, minWidth: 0, px: 0.5, whiteSpace: 'nowrap', fontSize: { xs: 12, sm: 14 } } }}>
        <Tab value="people" label="填报人员" />
        <Tab value="actions" label="按钮与签署" />
        <Tab value="fields" label="字段权限与绑定" />
      </Tabs> : <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>流程配置概要</Typography>
        {permissionRows}
      </Box>}
      {tab === 'people' && mode === 'DIRECT' ? <EntryPermissionGroupEditor config={direct} editable={editable} onChange={updateDirect} /> : null}
      {mode === 'DIRECT' && tab === 'fields' ? <>
        {bindingSummary.pending > 0 ? <Alert severity="warning">{bindingSummary.pending} 项签署尚未绑定签名字段</Alert> : null}
        {permissionRows}
      </> : null}
      {mode === 'PROCESS' && !process.data ? <Typography variant="body2" color="text.secondary">{process.isFetching ? '正在加载流程配置…' : '尚未选择可用流程'}</Typography> : null}
      {tab === 'actions' && mode === 'DIRECT' ? <WorkflowActionConfig kind="START" profile="DIRECT_FILL" buttons={direct.buttons} events={direct.buttonEvents} guardMode="BLOCK_ON_INVALID" editable={editable} onChange={updateDirect} /> : null}
    {mode === 'PROCESS' || tab === 'fields' ? fieldSettingsButton : null}
    {version.isError ? <Alert severity="error">表单字段加载失败</Alert> : null}
    <FormProcessPreviewDialog option={previewProcess} onClose={() => setPreviewProcess(null)} onExited={() => {
      requestAnimationFrame(() => {
        processInputRef.current?.focus();
        setProcessOptionsOpen(true);
        previewActiveRef.current = false;
      });
    }} />
    <FormPermissionConfigDialog open={permissionsOpen} subjects={subjects} fields={fields} document={document}
      permissions={active.fieldPermissions} events={events} eventBindings={active.eventBindings ?? {}} editable={editable} loading={version.isLoading}
      onClose={() => setPermissionsOpen(false)} onSave={(fieldPermissions, eventBindings) => {
        const validBindings = pruneEventBindings(eventBindings, events, fields);
        if (mode === 'DIRECT') onChange({ ...value, fillMode: mode, directFillConfig: { ...direct, fieldPermissions, eventBindings: validBindings } });
        else onChange({ ...value, fillMode: mode, fieldPermissions, eventBindings: validBindings });
        setPermissionsOpen(false);
      }} />
  </Stack>;
}
