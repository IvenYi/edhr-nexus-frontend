import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, DialogActions, DialogContent, DialogTitle, Drawer, FormControlLabel, IconButton, ListItemButton, Popover, Switch, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { AddRounded, ArrowBackRounded, ArrowForwardRounded, CheckRounded, ChevronRightRounded, CloseRounded, DescriptionOutlined, ExpandMoreRounded, LockOutlined, MoreHorizRounded, SearchRounded } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import { getExecutionTemplates, type ExecutionEditors, type ExecutionForm, type ExecutionFormCopies, type ExecutionTemplate, type ExecutionWork } from '@/api/production-execution';

export function formSource(form: ExecutionForm) { return form.sourceType === 'CUSTOM' ? 'custom' : form.workId ? 'work' : 'configured'; }
export function selectableForms(forms: ExecutionForm[]) { return forms; }
export function groupTemplates(templates: ExecutionTemplate[]) {
  const groups = new Map<string, { templateId: string; name: string; code: string; categoryName: string; versions: ExecutionTemplate[] }>();
  for (const template of templates) {
    const group = groups.get(template.templateId);
    if (group) group.versions.push(template);
    else groups.set(template.templateId, { templateId: template.templateId, name: template.name, code: template.code, categoryName: template.categoryName?.trim() || '', versions: [template] });
  }
  return [...groups.values()];
}
const categories = [{ id: 'configured', label: '工序配置' }, { id: 'custom', label: '自定义' }, { id: 'work', label: '作业发起' }];
const statusLabel = (status?: string) => status === 'COMPLETED' ? '已完成'
  : status === 'IN_PROGRESS' ? '进行中'
    : status === 'WAITING_OPERATION_START' ? '待工序开工'
      : status === 'WAITING_WORK_NODE' ? '待作业流程到达'
        : status === 'NOT_APPLICABLE' ? '不适用' : '未填报';
type WorkState = { status: string; active: string[] };

export function workFormStages(work: ExecutionWork): Record<string, number> {
  const nodes = new Map(work.nodes.map(node => [node.id, node]));
  const incoming = new Map(work.nodes.map(node => [node.id, 0]));
  const outgoing = new Map(work.nodes.map(node => [node.id, [] as string[]]));
  for (const edge of work.edges ?? []) {
    if (!nodes.has(edge.source) || !nodes.has(edge.target)) continue;
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }
  const stages = new Map(work.nodes.map(node => [node.id, node.data.kind === 'FORM' ? 1 : 0]));
  const queue = work.nodes.filter(node => incoming.get(node.id) === 0).map(node => node.id);
  for (let index = 0; index < queue.length; index++) {
    const source = queue[index];
    for (const target of outgoing.get(source) ?? []) {
      stages.set(target, Math.max(stages.get(target) ?? 0, (stages.get(source) ?? 0) + (nodes.get(target)?.data.kind === 'FORM' ? 1 : 0)));
      incoming.set(target, (incoming.get(target) ?? 0) - 1);
      if (incoming.get(target) === 0) queue.push(target);
    }
  }
  return Object.fromEntries(work.nodes.filter(node => node.data.kind === 'FORM').map(node => [node.id, stages.get(node.id) ?? 1]));
}

export function workFormGroups(works: ExecutionWork[], forms: ExecutionForm[], copies: Record<string, ExecutionFormCopies>, states: Record<string, WorkState> = {}, keyword = '') {
  const search = keyword.trim().toLowerCase();
  return works.map(work => {
    const stages = workFormStages(work);
    const allForms = forms.filter(form => formSource(form) === 'work' && form.workId === work.id)
      .sort((first, second) => (stages[first.workNodeId ?? ''] ?? 0) - (stages[second.workNodeId ?? ''] ?? 0));
    const state = states[work.id];
    const current = state?.status === 'RUNNING' ? allForms.find(form => state.active.includes(form.workNodeId ?? '')) : undefined;
    const instances = copies[current?.id ?? '']?.instances ?? {};
    const controls = Object.values(instances);
    const canFill = controls.some(control => control.canAct && control.nodeKind !== 'APPROVAL');
    const canApprove = controls.some(control => control.canAct && control.nodeKind === 'APPROVAL');
    const status = current ? canFill ? '可填报' : canApprove ? '待审批' : controls.some(control => control.nodeKind === 'APPROVAL') ? '审批中' : '仅查看'
      : state?.status === 'COMPLETED' ? '已完成' : state?.status === 'RUNNING' ? '待作业确认' : '待工序开工';
    const activeNode = work.nodes.find(node => state?.active.includes(node.id));
    const matchesWork = work.name.toLowerCase().includes(search);
    const matches = matchesWork ? allForms : allForms.filter(form => `${form.name} ${form.code}`.toLowerCase().includes(search));
    const instanceId = Object.keys(instances).find(id => instances[id].canAct && instances[id].nodeKind !== 'APPROVAL')
      ?? Object.keys(instances).find(id => instances[id].canAct);
    return { work, allForms, matches, current, instanceId, status, canAct: canFill || canApprove, stages,
      totalStages: Math.max(0, ...Object.values(stages)), searchExpanded: Boolean(search && !matchesWork),
      waitingLabel: state?.status === 'COMPLETED' ? '查看表单记录'
        : activeNode ? activeNode.data.label : '尚无当前表单' };
  }).filter(group => group.matches.length);
}

export function EditorAvatars({ users, onClick }: { users: ExecutionEditors[string][string][] | null; onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  if (!users?.length) return null;
  return <Tooltip title={`当前 ${users.length} 人填写中`} arrow placement="top">
    <button type="button" className="execution-form-editor-avatars" aria-label={`当前 ${users.length} 人填写中`} onClick={onClick}>
      {users.slice(0, 4).map(user => <Avatar key={user.userId} src={user.avatarUrl || undefined} alt={user.name}>{Array.from(user.name.trim())[0] || '人'}</Avatar>)}
      {users.length > 4 && <Avatar className="execution-form-editor-more"><MoreHorizRounded /></Avatar>}
    </button>
  </Tooltip>;
}

interface Props {
  open: boolean; container: () => HTMLElement | null; onClose: () => void; forms: ExecutionForm[];
  copies: Record<string, ExecutionFormCopies>; selectedId: string; busy: boolean; canAttach: boolean;
  operationStatus?: string; works: ExecutionWork[]; workStates?: Record<string, WorkState>;
  editors: ExecutionEditors | null; onSelect: (id: string, instanceId?: string) => void;
  onAttach: (versionId: string, scope: 'OPERATION' | 'BATCH', completionRequired: boolean, reason: string) => Promise<boolean>;
}
export default function ExecutionFormSelector(props: Props) {
  const { open, container, onClose, forms, copies, selectedId, busy, canAttach, operationStatus, works, workStates, editors, onSelect, onAttach } = props;
  const [category, setCategory] = useState('configured');
  const [keyword, setKeyword] = useState('');
  const [adding, setAdding] = useState(false);
  const [templates, setTemplates] = useState<ExecutionTemplate[]>([]);
  const [selected, setSelected] = useState<ExecutionTemplate | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templateKeyword, setTemplateKeyword] = useState('');
  const [pendingTemplate, setPendingTemplate] = useState<ExecutionTemplate | null>(null);
  const [templateCategory, setTemplateCategory] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [scope, setScope] = useState<'OPERATION' | 'BATCH'>('OPERATION');
  const [required, setRequired] = useState(true);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [people, setPeople] = useState<{ anchor: HTMLElement; id: string } | null>(null);
  const [expandedWorks, setExpandedWorks] = useState<string[]>([]);
  const visible = selectableForms(forms);
  useEffect(() => {
    if (people && !Object.keys(editors?.[people.id] ?? {}).length) setPeople(null);
  }, [editors, people]);
  useEffect(() => {
    if (open) {
      const selectedForm = forms.find(form => form.id === selectedId);
      setCategory(formSource(selectedForm ?? {} as ExecutionForm)); setAdding(false); setKeyword('');
      setExpandedWorks(selectedForm?.workId && !workStates?.[selectedForm.workId]?.active.includes(selectedForm.workNodeId ?? '') ? [selectedForm.workId] : []);
    }
    else { setPeople(null); setPickerOpen(false); }
  }, [open]);
  useEffect(() => {
    if (!pickerOpen || !open) return;
    let cancelled = false;
    setLoading(true); setError('');
    const timer = window.setTimeout(() => {
      void getExecutionTemplates('').then(result => { if (!cancelled) {
        setTemplates(result);
        setPendingTemplate(selected ? result.find(template => template.versionId === selected.versionId) ?? null : null);
      } })
        .catch(() => { if (!cancelled) { setTemplates([]); setError('模板加载失败，请关闭选择窗口后重试'); } })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
  }, [pickerOpen, open]);
  const templateGroups = groupTemplates(templates);
  const templateCategories = [...new Set(templateGroups.map(template => template.categoryName))];
  const matchingTemplates = templateGroups.filter(template => (templateCategory === null || template.categoryName === templateCategory)
    && `${template.name} ${template.code}`.toLowerCase().includes(templateKeyword.trim().toLowerCase()));
  const activeTemplate = templateGroups.find(template => template.templateId === activeTemplateId);
  const openTemplatePicker = () => { setPendingTemplate(selected); setActiveTemplateId(selected?.templateId ?? ''); setTemplateCategory(null); setTemplateKeyword(''); setTemplates([]); setLoading(true); setPickerOpen(true); };
  const search = keyword.trim().toLowerCase();
  const filtered = visible.filter(form => formSource(form) === category && `${form.name} ${form.code}`.toLowerCase().includes(search));
  const workGroups = workFormGroups(works, visible, copies, workStates, keyword);
  const toggleWork = (id: string) => setExpandedWorks(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  const renderForm = (form: ExecutionForm) => {
    const group = copies[form.id]; const active = form.id === selectedId; const users = editors ? Object.values(editors[form.id] ?? {}) : null;
    const arrived = Boolean(group?.instanceIds.length);
    const workCompleted = form.workId && workStates?.[form.workId]?.status === 'COMPLETED';
    const status = group?.status ?? (operationStatus !== 'IN_PROGRESS' ? 'WAITING_OPERATION_START' : workCompleted ? 'NOT_APPLICABLE' : form.workId ? 'WAITING_WORK_NODE' : 'PENDING');
    const required = group?.required ?? form.required ?? true;
    return <Box key={form.id} role="listitem" className={`execution-form-selector-row${active ? ' is-selected' : ''}${arrived ? '' : ' is-planned'}`}>
      <button type="button" className="execution-form-selector-target" disabled={busy} aria-current={active || undefined} onClick={() => onSelect(form.id)}>
        <span className="execution-form-selector-title-row"><span className="execution-form-selector-name" title={form.name}>{form.name}</span><span className="execution-form-status" data-status={status}>{statusLabel(status)}</span></span>
        <span className="execution-form-selector-code" title={`表单编码：${form.code || '—'}`}>{form.code || '编码未设置'}</span>
        <span className="execution-form-selector-meta"><span title={`版本：${form.version || '—'}`}>版本 {form.version || '—'}</span><span>共 {group?.instanceIds.length ?? 0} 份</span>{form.sourceType === 'CUSTOM' && <span className="execution-form-scope">{form.scope === 'BATCH' ? '批次 · 跨工序' : '当前工序'}</span>}</span>
        <span className="execution-form-corner" data-required={required}>{required ? '必填' : '选填'}</span>
      </button>
      {arrived && <EditorAvatars users={users} onClick={event => setPeople({ anchor: event.currentTarget, id: form.id })} />}
    </Box>;
  };
  return <Drawer anchor="left" open={open} onClose={busy ? undefined : onClose} container={container} className="execution-operation-drawer execution-form-drawer"
    PaperProps={{ role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'execution-form-drawer-title', id: 'execution-form-drawer' }}>
    <Box className="execution-form-selector-heading">
      {adding && <IconButton size="small" aria-label="返回表单列表" disabled={busy} onClick={() => { setAdding(false); setKeyword(''); }}><ArrowBackRounded fontSize="small" /></IconButton>}
      <Typography component="h2" id="execution-form-drawer-title">{adding ? '新增自定义表单' : '填报表单'}</Typography>
      <IconButton size="small" aria-label="关闭表单抽屉" disabled={busy} onClick={onClose}><CloseRounded fontSize="small" /></IconButton>
    </Box>
    {!adding && <Tabs value={category} onChange={(_, value) => { setCategory(value); setKeyword(''); }} variant="fullWidth" className="execution-form-source-tabs">
      {categories.map(item => <Tab key={item.id} value={item.id} label={`${item.label} ${visible.filter(form => formSource(form) === item.id).length}`} />)}
    </Tabs>}
    {!adding && <Box className="execution-form-selector-search"><SearchRounded fontSize="small" /><TextField size="small" placeholder="搜索表单名称或编码" value={keyword} onChange={event => setKeyword(event.target.value)} inputProps={{ 'aria-label': '搜索表单' }} /></Box>}
    {adding ? <>
      <Box className="execution-form-attach-footer">
        <Typography component="h3">表单模板</Typography>
        {selected ? <Box className="execution-selected-template">
          <DescriptionOutlined fontSize="small" />
          <Box><Typography title={selected.name}>{selected.name}</Typography><Typography title={`${selected.code} · ${selected.version}`}>{selected.code} · {selected.version}</Typography></Box>
          <Button size="small" disabled={busy} onClick={openTemplatePicker}>更换</Button>
          <Tooltip title="移除模板"><IconButton size="small" aria-label={`移除模板 ${selected.name}`} disabled={busy} onClick={() => setSelected(null)}><CloseRounded fontSize="small" /></IconButton></Tooltip>
        </Box> : <Button className="execution-template-picker-trigger" variant="outlined" fullWidth startIcon={<DescriptionOutlined fontSize="small" />} endIcon={<ChevronRightRounded fontSize="small" />} disabled={busy} onClick={openTemplatePicker}>选择表单模板</Button>}
        <Typography component="h3">添加至</Typography>
        <Box className="execution-attach-scopes" role="group" aria-label="表单归属">
          {(['OPERATION', 'BATCH'] as const).map(value => <button type="button" key={value} aria-pressed={scope === value} disabled={busy} onClick={() => setScope(value)}>
            <strong>{value === 'OPERATION' ? '当前工序' : '当前批次'}</strong><span>{value === 'OPERATION' ? '随当前工序填报' : '跨工序共享填报'}</span>
          </button>)}
        </Box>
        <FormControlLabel className="execution-attach-gate" label={`${scope === 'OPERATION' ? '工序' : '批次'}完工前必须完成`} labelPlacement="start" control={<Switch size="small" checked={required} disabled={busy} onChange={event => setRequired(event.target.checked)} />} />
        <Typography className="execution-attach-explanation">{required ? `未完成时阻止${scope === 'OPERATION' ? '当前工序' : '当前批次'}完工${scope === 'BATCH' ? '，各工序可正常流转' : ''}。` : '允许先完成生产；该表单仍需闭环，才能定稿和放行。'}</Typography>
        <TextField fullWidth size="small" label="添加原因" multiline minRows={2} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} inputProps={{ maxLength: 500 }} placeholder="说明本次补充记录的用途" />
        <Button fullWidth variant="contained" disableElevation disabled={busy || !canAttach || !selected || !reason.trim()} onClick={async () => { if (selected && await onAttach(selected.versionId, scope, required, reason.trim())) onClose(); }}>添加到{scope === 'OPERATION' ? '当前工序' : '当前批次'}</Button>
      </Box>
    </> : <>
      {category === 'custom' && <Box className="execution-copy-drawer-summary">
        <Box className="execution-copy-toolbar">
        <Box className="execution-copy-form-heading"><Typography component="h3">自定义表单</Typography>
          <Typography className="execution-copy-count">共 {visible.filter(form => formSource(form) === 'custom').length} 个</Typography></Box>
        <Button variant="contained" disableElevation size="small" startIcon={<AddRounded />} disabled={busy || !canAttach} onClick={() => { setSelected(null); setScope('OPERATION'); setRequired(true); setReason(''); setKeyword(''); setAdding(true); }}>新增表单</Button>
        </Box>
        {!canAttach && <Typography className="execution-custom-form-unavailable">当前阶段不可新增表单</Typography>}
      </Box>}
      <Box className="execution-form-selector-list" role="list" aria-label="当前工序表单">
        {category === 'work' ? workGroups.map(({ work, matches, allForms, current, instanceId, status, canAct, stages, totalStages, searchExpanded, waitingLabel }) => {
          const expanded = searchExpanded || expandedWorks.includes(work.id);
          const selected = allForms.some(form => form.id === selectedId);
          return <Box key={work.id} role="listitem" className={`execution-work-group${selected ? ' is-selected' : ''}`}>
            <Box className="execution-work-summary">
              <button type="button" className="execution-work-current" disabled={busy} aria-label={`${work.name}，${current?.name ?? waitingLabel}，${status}`} aria-current={current?.id === selectedId || undefined}
                onClick={() => current ? onSelect(current.id, instanceId) : toggleWork(work.id)}>
                <span className="execution-work-context"><span title={`${work.name} · V${work.version}`}>{work.name}</span><span>{current ? `第 ${stages[current.workNodeId ?? '']} / ${totalStages} 步` : `${allForms.length} 个表单`}</span></span>
                <span className="execution-work-focus"><strong title={current?.name ?? waitingLabel}>{current?.name ?? waitingLabel}</strong><span className="execution-work-state" data-actionable={canAct}>{status}</span></span>
              </button>
              {!searchExpanded && <Tooltip title={expanded ? '收起步骤' : `查看全部 ${allForms.length} 个表单`}>
                <IconButton size="small" className="execution-work-expand" aria-label={`${expanded ? '收起' : '展开'}${work.name}的全部表单`} aria-expanded={expanded} aria-controls={`work-forms-${work.id}`} disabled={busy} onClick={() => toggleWork(work.id)}><ExpandMoreRounded /></IconButton>
              </Tooltip>}
            </Box>
            {expanded && <Box id={`work-forms-${work.id}`} role="list" aria-label={`${work.name}的全部表单`} className="execution-work-steps">
              {matches.map(form => {
                const group = copies[form.id]; const isCurrent = current?.id === form.id; const completed = group?.status === 'COMPLETED';
                const label = isCurrent ? status : completed ? '已完成' : group?.status === 'NOT_APPLICABLE' ? '不适用' : '未到达';
                const users = editors ? Object.values(editors[form.id] ?? {}) : null;
                return <Box role="listitem" key={form.id} className={`execution-work-step${form.id === selectedId ? ' is-selected' : ''}`}>
                  <button type="button" disabled={busy} aria-current={form.id === selectedId || undefined} onClick={() => onSelect(form.id, isCurrent ? instanceId : undefined)} className="execution-work-step-target"
                    aria-label={`${isCurrent ? '打开' : '预览'}${form.name}，第 ${stages[form.workNodeId ?? '']} 步，${label}`}
                    title={`${form.code || '编码未设置'} · ${form.version || '—'} · ${group?.required ?? form.required ?? true ? '必填' : '选填'} · 共 ${group?.instanceIds.length ?? 0} 份`}>
                    <span className="execution-work-step-order">{completed ? <CheckRounded /> : isCurrent ? <ArrowForwardRounded /> : <LockOutlined />}<span>{stages[form.workNodeId ?? '']}</span></span>
                    <span className="execution-work-step-name" title={form.name}>{form.name}</span><span className="execution-work-state" data-actionable={isCurrent && canAct}>{label}</span>
                  </button>
                  <EditorAvatars users={users} onClick={event => setPeople({ anchor: event.currentTarget, id: form.id })} />
                </Box>;
              })}
            </Box>}
          </Box>;
        }) : filtered.map(form => renderForm(form))}
        {!(category === 'work' ? workGroups.length : filtered.length) && (category === 'custom' ? <Box className="execution-custom-form-empty" role="status">
          <Box className="execution-custom-form-empty-icon">{keyword ? <SearchRounded /> : <DescriptionOutlined />}</Box>
          <Typography component="h3">{keyword ? '未找到匹配的表单' : '暂无自定义表单'}</Typography>
          <Typography>{keyword ? '试试其他表单名称或编码' : '点击「新增表单」，从表单模板中选择，补充当前工序或批次的填报记录。'}</Typography>
        </Box> : <Typography className="execution-form-selector-hint" sx={category === 'work' ? { textAlign: 'center' } : undefined}>{keyword ? '未找到匹配的表单或作业' : category === 'work' ? '当前工序暂未查询到作业动作所产生的表单' : '当前工序未配置独立表单'}</Typography>)}
      </Box>
    </>}
    <AppDialog open={open && pickerOpen} onClose={() => setPickerOpen(false)} container={container} maxWidth="md" fullWidth className="execution-template-picker" aria-labelledby="execution-template-picker-title">
      <DialogTitle id="execution-template-picker-title">选择表单模板</DialogTitle>
      <DialogContent className="execution-template-picker-content">
        <Box className="execution-template-categories" component="nav" aria-label="表单分类">
          <Typography component="h3">表单分类</Typography>
          <button type="button" aria-pressed={templateCategory === null} onClick={() => setTemplateCategory(null)}><span>全部分类</span><span>{templateGroups.length}</span></button>
          {templateCategories.map(categoryName => <button type="button" key={categoryName} title={categoryName || '未分类'} aria-pressed={templateCategory === categoryName} onClick={() => setTemplateCategory(categoryName)}><span>{categoryName || '未分类'}</span><span>{templateGroups.filter(template => template.categoryName === categoryName).length}</span></button>)}
        </Box>
        <Box className="execution-template-results">
          <Box className="execution-template-search"><SearchRounded fontSize="small" /><TextField autoFocus fullWidth size="small" placeholder="搜索表单名称或编码" value={templateKeyword} onChange={event => setTemplateKeyword(event.target.value)} inputProps={{ 'aria-label': '搜索可选表单模板' }} /></Box>
          <Box className="execution-template-results-heading"><span>{templateCategory === null ? '全部表单' : templateCategory || '未分类'}</span><span>{matchingTemplates.length} 个表单</span></Box>
          {error && <Alert severity="error">{error}</Alert>}
          <Box className="execution-template-picker-list" role="list" aria-label="可选表单模板">
            {loading ? <Typography className="execution-template-picker-empty">正在加载模板…</Typography> : matchingTemplates.map(template => <Box role="listitem" key={template.templateId} className={`execution-template-option${activeTemplateId === template.templateId ? ' is-active' : ''}`}>
              <ListItemButton component="button" aria-label={`选择表单 ${template.name} ${template.code}`} aria-pressed={activeTemplateId === template.templateId} selected={activeTemplateId === template.templateId} onClick={() => {
                setActiveTemplateId(template.templateId);
                if (pendingTemplate?.templateId !== template.templateId) setPendingTemplate(template.versions[0]);
              }}>
                <DescriptionOutlined className="execution-template-option-icon" />
                <Box><Typography>{template.name}</Typography><Typography>{template.code} · {template.categoryName || '未分类'}</Typography></Box>
                <span className="execution-template-version-count">{template.versions.length} 个版本</span>
                <ChevronRightRounded className="execution-template-option-chevron" fontSize="small" />
              </ListItemButton>
              {activeTemplateId === template.templateId && <Box className="execution-template-versions" role="group" aria-label={`${template.name}的版本`}>
                <Typography>{pendingTemplate?.templateId === template.templateId ? '所选版本' : '请选择版本'}</Typography>
                <Box>{template.versions.map(version => <button type="button" key={version.versionId} aria-label={`选择版本 ${version.version}`} aria-pressed={pendingTemplate?.versionId === version.versionId} onClick={() => setPendingTemplate(version)}>{version.version}</button>)}</Box>
              </Box>}
            </Box>)}
            {!loading && !matchingTemplates.length && !error && <Typography className="execution-template-picker-empty">{templateKeyword ? '未找到匹配的表单模板' : '暂无表单模板'}</Typography>}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="execution-template-picker-actions"><Box className="execution-template-selection-summary" aria-live="polite"><Typography>{pendingTemplate ? <><span>已选</span> {pendingTemplate.name} <strong>{pendingTemplate.version}</strong></> : activeTemplate ? `${activeTemplate.name} · 请选择版本` : '选择表单及版本'}</Typography></Box><Button onClick={() => setPickerOpen(false)}>取消</Button><Button variant="contained" disabled={!pendingTemplate || loading || Boolean(error)} onClick={() => { setSelected(pendingTemplate); setKeyword(''); setPickerOpen(false); }}>确认选择</Button></DialogActions>
    </AppDialog>
    <Popover open={Boolean(people)} anchorEl={people?.anchor} onClose={() => setPeople(null)} container={container} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Box className="execution-form-editors"><strong>正在填写</strong>{editors === null ? <p>在线信息暂不可用</p> : Object.values(editors[people?.id ?? ''] ?? {}).length ? Object.values(editors[people?.id ?? ''] ?? {}).map(user => <p key={user.userId}><span>{user.name}</span><span>第 {[...user.sequences].sort((a, b) => a - b).join('、')} 份</span></p>) : <p>暂无正在填写的人员</p>}</Box>
    </Popover>
  </Drawer>;
}
