import { useEffect, useRef, useState } from 'react';
import { ArrowDropDownRounded, RefreshRounded, SearchRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Radio, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import AppDialog from '@/components/AppDialog';
import TableStateCell from '@/components/TableStateCell';
import { listTableHeaderCellSx } from '@/components/listTableStyles';
import { SubjectSelector, type PersonSelectorOption } from '@/components/identity/SubjectSelector';
import type { ModelField } from '@/pages/master-data/template-designer-react/types';
import type { FormRuntime } from './FormRuntimeField';
import { referenceConditions, referenceDependencyValues, type ReferenceValue } from './referenceConfig';
import { referenceDefaultSearchFields, referenceDisplayText, referenceFields } from './referencePresentation';

const pageSize = 20;

function queryIssue(field: ModelField, values: Record<string, unknown>) {
  for (const condition of referenceConditions(field)) {
    if (!condition.sourceField || !condition.targetFieldId) return '请完整配置引用字段的查询条件';
    const value = values[condition.targetFieldId];
    if (value == null || value === '') return '请先填写查询条件关联的字段';
  }
  return '';
}

export default function ReferencePickerDialog({ field, runtime, disabled, canvas }: { field: ModelField; runtime: FormRuntime; disabled: boolean; canvas: boolean }) {
  const [open, setOpen] = useState(false);
  const [draftKeyword, setDraftKeyword] = useState('');
  const [query, setQuery] = useState({ keyword: '', page: 0, retry: 0 });
  const [options, setOptions] = useState<ReferenceValue[]>([]);
  const [selected, setSelected] = useState<ReferenceValue | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const source = String(field.typeConfig.sourceType ?? 'dictionary');
  const columns = referenceFields(field.typeConfig);
  const dependencyValues = referenceDependencyValues(field, runtime.referenceValues ?? runtime.values);
  const dependencyKey = JSON.stringify(dependencyValues);
  const configKey = JSON.stringify(field.typeConfig);
  const current = runtime.values[field.id] as ReferenceValue | undefined;
  const label = referenceDisplayText(current, field.typeConfig);
  useEffect(() => {
    if (!open || !runtime.references) return;
    let active = true;
    setBusy(true); setError(''); setOptions([]);
    const issue = queryIssue(field, JSON.parse(dependencyKey));
    if (issue) { setError(issue); setBusy(false); return; }
    runtime.references(field.id, query.keyword, JSON.parse(dependencyKey), { page: query.page, size: pageSize }).then(items => {
      if (active) setOptions(items);
    }).catch(cause => { if (active) setError(cause?.response?.data?.message || cause?.message || '引用数据读取失败，请重试'); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [open, field.id, configKey, runtime.references, dependencyKey, query]);
  const search = (keyword: string) => { setSelected(null); setQuery({ keyword, page: 0, retry: query.retry + 1 }); };
  return <>
    <Button variant="outlined" fullWidth disabled={disabled} title={label} endIcon={<ArrowDropDownRounded />} onClick={() => {
      setSelected(current?.id ? current : null); setDraftKeyword(''); setQuery({ keyword: '', page: 0, retry: 0 }); setOpen(true);
    }} sx={{ justifyContent: 'space-between', textTransform: 'none', color: label ? 'text.primary' : 'text.secondary', borderColor: 'divider', minWidth: 0, ...(canvas ? { height: '100%', minHeight: 0, px: 0.75, py: 0, fontSize: 12 } : { minHeight: 40 }) }}>
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{label || `选择${field.name}`}</Box>
    </Button>
    <AppDialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>选择{field.name}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack component="form" direction="row" spacing={1} sx={{ p: 2 }} onSubmit={event => { event.preventDefault(); search(draftKeyword); }}>
          <TextField autoFocus fullWidth size="small" label="关键词" placeholder="输入搜索内容" value={draftKeyword} onChange={event => setDraftKeyword(event.target.value)} sx={{ flex: 1, minWidth: 0 }} />
          <Button variant="outlined" aria-label="重置" startIcon={<RefreshRounded />} sx={{ flexShrink: 0, minWidth: 88, whiteSpace: 'nowrap' }} onClick={() => { setDraftKeyword(''); search(''); }}>重置</Button>
          <Button variant="contained" aria-label="查询" type="submit" startIcon={<SearchRounded />} sx={{ flexShrink: 0, minWidth: 88, whiteSpace: 'nowrap' }}>查询</Button>
        </Stack>
        {error && <Alert severity="error" action={<Button onClick={() => setQuery({ ...query, retry: query.retry + 1 })}>重试</Button>} sx={{ mx: 2, mb: 1 }}>{error}</Alert>}
        <TableContainer sx={{ height: 360 }}><Table size="small" stickyHeader aria-label={`${field.name}候选记录`}>
          <TableHead><TableRow><TableCell sx={{ ...listTableHeaderCellSx, width: 48 }} />{columns.map(column => <TableCell key={column.value} sx={listTableHeaderCellSx}>{column.label}</TableCell>)}</TableRow></TableHead>
          <TableBody>{busy || !options.length ? <TableRow><TableStateCell colSpan={columns.length + 1} sx={{ height: 280 }}>{busy ? <CircularProgress size={24} aria-label="正在查询" /> : error ? '读取失败，请重试' : '暂无匹配记录'}</TableStateCell></TableRow> : options.slice(0, pageSize).map(item => <TableRow key={item.id} hover selected={selected?.id === item.id} onClick={() => setSelected(item)} sx={{ cursor: 'pointer', height: 40 }}>
            <TableCell padding="checkbox"><Radio size="small" checked={selected?.id === item.id} onChange={() => setSelected(item)} inputProps={{ 'aria-label': `选择${referenceDisplayText(item, field.typeConfig)}` }} /></TableCell>
            {columns.map(column => <TableCell key={column.value} title={String(item[column.value] ?? '')} sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(item[column.value] ?? '') || '—'}</TableCell>)}
          </TableRow>)}</TableBody>
        </Table></TableContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button size="small" disabled={busy || query.page === 0} onClick={() => setQuery({ ...query, page: query.page - 1 })}>上一页</Button>
          <Typography variant="body2">第 {query.page + 1} 页</Typography>
          <Button size="small" disabled={busy || options.length <= pageSize} onClick={() => setQuery({ ...query, page: query.page + 1 })}>下一页</Button>
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={() => { runtime.onChange(field.id, null); setOpen(false); }}>清空</Button><Box sx={{ flex: 1 }} /><Button onClick={() => setOpen(false)}>取消</Button><Button variant="contained" disabled={!selected || busy || !!error} onClick={() => { runtime.onChange(field.id, selected); setOpen(false); }}>确定</Button></DialogActions>
    </AppDialog>
  </>;
}

export function ReferencePersonSelector({ field, runtime, disabled, canvas = false }: { field: ModelField; runtime: FormRuntime; disabled: boolean; canvas?: boolean }) {
  const records = useRef(new Map<string, ReferenceValue>());
  const dependencyKey = JSON.stringify(referenceDependencyValues(field, runtime.referenceValues ?? runtime.values));
  const current = runtime.values[field.id] as ReferenceValue | undefined;
  const configKey = JSON.stringify(field.typeConfig);
  const loader = async (): Promise<PersonSelectorOption[]> => {
    if (!runtime.references) return [];
    const issue = queryIssue(field, JSON.parse(dependencyKey));
    if (issue) throw new Error(issue);
    const all = new Map<string, ReferenceValue>();
    for (let page = 0; ; page++) {
      const items = await runtime.references(field.id, '', JSON.parse(dependencyKey), { page, size: 100 });
      items.slice(0, 100).forEach(item => all.set(item.id, item));
      if (items.length <= 100) break;
    }
    records.current = all;
    const searchFields = Array.isArray(field.typeConfig.referenceSearchFields) && field.typeConfig.referenceSearchFields.length ? field.typeConfig.referenceSearchFields as string[] : referenceDefaultSearchFields('user');
    return [...all.values()].map(item => ({ id: item.id, name: String(item.displayName ?? item.name), username: String(item.username ?? item.code ?? ''), searchText: searchFields.map(key => String(item[key] ?? '')).join(' '), departmentIds: String(item.departmentIds ?? '').split(',').filter(Boolean) }));
  };
  return <SubjectSelector onlyUsers single compact={canvas} label={`选择${field.name}`} placeholder={`选择${field.name}`} disabled={disabled} userOptionsLoader={loader} userOptionsKey={`${field.id}:${configKey}:${dependencyKey}`} selectedLabel={referenceDisplayText(current, field.typeConfig)} value={current?.id ? [{ type: 'USER', id: current.id, nameSnapshot: current.name }] : []} onChange={items => {
    const item = items[0];
    runtime.onChange(field.id, item ? records.current.get(item.id) ?? (current?.id === item.id ? current : null) : null);
  }} />;
}
