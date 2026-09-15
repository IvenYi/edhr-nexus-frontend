import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Drawer, FormControlLabel, IconButton, List, ListItemButton, Popover, Radio, RadioGroup, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { AddRounded, ArrowBackRounded, CloseRounded, MoreHorizRounded, SearchRounded } from '@mui/icons-material';
import { getExecutionTemplates, type ExecutionEditors, type ExecutionForm, type ExecutionFormCopies, type ExecutionTemplate } from '@/api/production-execution';

export function formSource(form: ExecutionForm) { return form.sourceType === 'CUSTOM' ? 'custom' : form.workId ? 'work' : 'configured'; }
export function selectableForms(forms: ExecutionForm[], copies: Record<string, ExecutionFormCopies>) {
  return forms.filter(form => !form.fulfilledBy && (!form.workId || (copies[form.id]?.instanceIds.length ?? 0) > 0));
}
const categories = [{ id: 'configured', label: '工序配置' }, { id: 'custom', label: '自定义' }, { id: 'work', label: '作业发起' }];
const statusLabel = (status?: string) => status === 'COMPLETED' ? '已完成' : status === 'IN_PROGRESS' ? '进行中' : '未填报';

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
  editors: ExecutionEditors | null; onSelect: (id: string) => void; onAttach: (versionId: string, required: boolean) => void;
}
export default function ExecutionFormSelector(props: Props) {
  const { open, container, onClose, forms, copies, selectedId, busy, canAttach, editors, onSelect, onAttach } = props;
  const [category, setCategory] = useState('configured');
  const [keyword, setKeyword] = useState('');
  const [adding, setAdding] = useState(false);
  const [templates, setTemplates] = useState<ExecutionTemplate[]>([]);
  const [selected, setSelected] = useState<ExecutionTemplate | null>(null);
  const [required, setRequired] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [people, setPeople] = useState<{ anchor: HTMLElement; id: string } | null>(null);
  const visible = selectableForms(forms, copies);
  useEffect(() => {
    if (people && !Object.keys(editors?.[people.id] ?? {}).length) setPeople(null);
  }, [editors, people]);
  useEffect(() => {
    if (open) { setCategory(formSource(forms.find(form => form.id === selectedId) ?? {} as ExecutionForm)); setAdding(false); setKeyword(''); }
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
  const filtered = visible.filter(form => formSource(form) === category && `${form.name} ${form.code}`.toLowerCase().includes(keyword.toLowerCase()));
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
    <Box className="execution-form-selector-search"><SearchRounded fontSize="small" /><TextField size="small" placeholder={adding ? '搜索已发布模板名称或编码' : '搜索表单名称或编码'} value={keyword} onChange={event => setKeyword(event.target.value)} inputProps={{ 'aria-label': '搜索表单' }} /></Box>
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
        {filtered.map(form => {
          const group = copies[form.id]; const active = form.id === selectedId; const users = editors ? Object.values(editors[form.id] ?? {}) : null;
          const status = group?.status ?? 'PENDING';
          return <Box key={form.id} role="listitem" className={`execution-form-selector-row${active ? ' is-selected' : ''}`}>
            <button type="button" className="execution-form-selector-target" disabled={busy} aria-current={active || undefined} onClick={() => onSelect(form.id)}>
              <span className="execution-form-selector-name">{form.name}</span>
              <span className="execution-form-selector-meta"><span>编码 {form.code || '—'}</span><span>版本 {form.version || '—'}</span></span>
              <span className="execution-form-selector-facts"><span className={group?.required ?? form.required ?? true ? 'is-required' : ''}>{group?.required ?? form.required ?? true ? '必填' : '选填'}</span><span>共 {Math.max(1, group?.instanceIds.length ?? 0)} 份</span><span className="execution-form-status" data-status={status}>{statusLabel(status)}</span></span>
            </button>
            <EditorAvatars users={users} onClick={event => setPeople({ anchor: event.currentTarget, id: form.id })} />
          </Box>;
        })}
        {!filtered.length && <Typography className="execution-form-selector-hint">{keyword ? '未找到匹配的表单' : category === 'work' ? '当前工序暂无作业挂载表单' : category === 'custom' ? '尚未添加自定义表单' : '当前工序未配置独立表单'}</Typography>}
      </Box>
    </>}
    <Popover open={Boolean(people)} anchorEl={people?.anchor} onClose={() => setPeople(null)} container={container} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Box className="execution-form-editors"><strong>正在填写</strong>{editors === null ? <p>在线信息暂不可用</p> : Object.values(editors[people?.id ?? ''] ?? {}).length ? Object.values(editors[people?.id ?? ''] ?? {}).map(user => <p key={user.userId}><span>{user.name}</span><span>第 {[...user.sequences].sort((a, b) => a - b).join('、')} 份</span></p>) : <p>暂无正在填写的人员</p>}</Box>
    </Popover>
  </Drawer>;
}
