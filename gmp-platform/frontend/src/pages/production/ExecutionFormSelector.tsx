import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Drawer, FormControlLabel, IconButton, List, ListItemButton, Popover, Radio, RadioGroup, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { AddRounded, ArrowBackRounded, ArrowForwardRounded, CheckRounded, CloseRounded, ExpandMoreRounded, LockOutlined, MoreHorizRounded, SearchRounded } from '@mui/icons-material';
import { getExecutionTemplates, type ExecutionEditors, type ExecutionForm, type ExecutionFormCopies, type ExecutionTemplate, type ExecutionWork } from '@/api/production-execution';

export function formSource(form: ExecutionForm) { return form.sourceType === 'CUSTOM' ? 'custom' : form.workId ? 'work' : 'configured'; }
export function selectableForms(forms: ExecutionForm[]) { return forms; }
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
  editors: ExecutionEditors | null; onSelect: (id: string, instanceId?: string) => void; onAttach: (versionId: string, required: boolean) => void;
}
export default function ExecutionFormSelector(props: Props) {
  const { open, container, onClose, forms, copies, selectedId, busy, canAttach, operationStatus, works, workStates, editors, onSelect, onAttach } = props;
  const [category, setCategory] = useState('configured');
  const [keyword, setKeyword] = useState('');
  const [adding, setAdding] = useState(false);
  const [templates, setTemplates] = useState<ExecutionTemplate[]>([]);
  const [selected, setSelected] = useState<ExecutionTemplate | null>(null);
  const [required, setRequired] = useState('');
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
    else setPeople(null);
  }, [open]);
  useEffect(() => {
    if (!adding || !open) return;
    let cancelled = false;
    setLoading(true); setError('');
    const timer = window.setTimeout(() => {
      void getExecutionTemplates(keyword).then(result => { if (!cancelled) setTemplates(result); })
        .catch(() => { if (!cancelled) { setTemplates([]); setError('模板加载失败，请重新搜索或稍后重试'); } })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [adding, open, keyword]);
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
        <span className="execution-form-selector-meta"><span title={`版本：${form.version || '—'}`}>版本 {form.version || '—'}</span><span>共 {group?.instanceIds.length ?? 0} 份</span></span>
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
    <Box className="execution-form-selector-search"><SearchRounded fontSize="small" /><TextField size="small" placeholder={adding ? '搜索已发布模板名称或编码' : category === 'work' ? '搜索作业或表单名称、编码' : '搜索表单名称或编码'} value={keyword} onChange={event => setKeyword(event.target.value)} inputProps={{ 'aria-label': '搜索表单' }} /></Box>
    {adding ? <>
      <Typography className="execution-form-selector-hint">选择已发布版本，挂载至当前工序。最多显示 100 个搜索结果。</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <List className="execution-template-candidates">
        {loading ? <Typography className="execution-form-selector-hint">正在加载模板…</Typography> : templates.map(template => <ListItemButton component="button" key={template.versionId} selected={selected?.versionId === template.versionId} onClick={() => setSelected(template)}>
          <strong>{template.name}</strong><span>{template.code} · {template.version}</span>
        </ListItemButton>)}
        {!loading && !templates.length && !error && <Typography className="execution-form-selector-hint">未找到已发布的表单模板</Typography>}
      </List>
      <Box className="execution-form-attach-footer">
        <Typography>是否必填</Typography>
        <RadioGroup row value={required} onChange={event => setRequired(event.target.value)} aria-label="是否必填">
          <FormControlLabel value="true" control={<Radio size="small" />} label="必填" /><FormControlLabel value="false" control={<Radio size="small" />} label="选填" />
        </RadioGroup>
        <Typography className="execution-form-selector-hint">{selected ? `${selected.name} · ${selected.version}` : '尚未选择模板版本'}</Typography>
        <Button variant="contained" disabled={busy || !canAttach || !selected || !required} onClick={() => { if (selected) onAttach(selected.versionId, required === 'true'); }}>添加到当前工序</Button>
      </Box>
    </> : <>
      {category === 'custom' && <Box className="execution-custom-form-add"><Button size="small" startIcon={<AddRounded />} disabled={busy || !canAttach} onClick={() => { setSelected(null); setRequired(''); setKeyword(''); setAdding(true); }}>新增表单</Button>{!canAttach && <span>工序开工后可新增</span>}</Box>}
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
        {!(category === 'work' ? workGroups.length : filtered.length) && <Typography className="execution-form-selector-hint">{keyword ? '未找到匹配的表单或作业' : category === 'work' ? '当前工序暂无作业挂载表单' : category === 'custom' ? '尚未添加自定义表单' : '当前工序未配置独立表单'}</Typography>}
      </Box>
    </>}
    <Popover open={Boolean(people)} anchorEl={people?.anchor} onClose={() => setPeople(null)} container={container} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Box className="execution-form-editors"><strong>正在填写</strong>{editors === null ? <p>在线信息暂不可用</p> : Object.values(editors[people?.id ?? ''] ?? {}).length ? Object.values(editors[people?.id ?? ''] ?? {}).map(user => <p key={user.userId}><span>{user.name}</span><span>第 {[...user.sequences].sort((a, b) => a - b).join('、')} 份</span></p>) : <p>暂无正在填写的人员</p>}</Box>
    </Popover>
  </Drawer>;
}
