import { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, Collapse, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField, ProjectionBinding } from '../types/model';
import { acceptsProjectionAttribute, projectionConfigurationIssues, projectionSourceSummary, useProjectionCatalog } from '../utils/projectionConfiguration';
import ProjectionSourceEditor from './ProjectionSourceEditor';

export default function FieldProjectionConfig({ field, tableId, showIdentity = true }: { field: ModelField; tableId?: string; showIdentity?: boolean }) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog, isPending, isError, refetch } = useProjectionCatalog();
  const [traceOpen, setTraceOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [modelId, setModelId] = useState('');
  const [attributeId, setAttributeId] = useState('');
  const [targetId, setTargetId] = useState('__new');
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => { setTraceOpen(false); setStatisticsOpen(false); setModelId(''); setAttributeId(''); setTargetId('__new'); setEditingId(null); }, [field.id, tableId]);
  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const inRegion = bindings.filter(binding => (binding.tableId ?? '') === (tableId ?? ''));
  const assignments = inRegion.filter(binding => Object.values(binding.sources).includes(field.id));
  const traces = assignments.filter(binding => binding.modelId === 'formTrace');
  const statistical = assignments.filter(binding => binding.modelId !== 'formTrace');
  const traceModel = catalog?.models.find(model => model.id === 'formTrace');
  const models = catalog?.models.filter(model => model.id !== 'formTrace' && model.attributes.some(attribute => acceptsProjectionAttribute(field, attribute))) ?? [];
  const model = models.find(item => item.id === modelId);
  const available = model?.attributes.filter(attribute => acceptsProjectionAttribute(field, attribute)) ?? [];
  const candidates = inRegion.filter(binding => binding.modelId === modelId && !binding.sources[attributeId] && !Object.values(binding.sources).includes(field.id));
  const update = (next: ProjectionBinding[]) => setBindings(next, catalog?.version);
  const change = (id: string, patch: Partial<ProjectionBinding>) => update(bindings.map(binding => binding.id === id ? { ...binding, ...patch } : binding));
  const removeFieldFrom = (items: ProjectionBinding[]) => update(bindings.flatMap(binding => {
    if (!items.some(item => item.id === binding.id)) return [binding];
    const sources = Object.fromEntries(Object.entries(binding.sources).filter(([, id]) => id !== field.id));
    return Object.keys(sources).length ? [{ ...binding, sources }] : [];
  }));
  const assignTrace = (queryId: string) => {
    if (!queryId || traces.some(binding => binding.sources[queryId] === field.id)) return;
    const existing = inRegion.find(binding => binding.modelId === 'formTrace' && !binding.sources[queryId] && !Object.values(binding.sources).includes(field.id));
    if (existing) change(existing.id, { sources: { ...existing.sources, [queryId]: field.id } });
    else {
      const binding = { id: crypto.randomUUID(), modelId: 'formTrace', enabled: false, ...(tableId ? { tableId, rowKeyFieldId: inRegion.find(item => item.rowKeyFieldId)?.rowKeyFieldId } : {}), sources: { [queryId]: field.id } };
      update([...bindings, { ...binding, enabled: projectionConfigurationIssues(document.model, binding, traceModel).length === 0 }]);
    }
  };
  const addStatistics = () => {
    if (!model || !attributeId) return;
    const existing = candidates.find(binding => binding.id === targetId);
    const id = existing?.id ?? crypto.randomUUID();
    if (existing) change(id, { sources: { ...existing.sources, [attributeId]: field.id } });
    else update([...bindings, { id, modelId, enabled: false, ...(tableId ? { tableId, rowKeyFieldId: inRegion.find(binding => binding.rowKeyFieldId)?.rowKeyFieldId } : {}), sources: { [attributeId]: field.id } }]);
    setEditingId(id); setModelId(''); setAttributeId(''); setTargetId('__new');
  };
  return <Stack spacing={2}>
    <Box>
      {showIdentity && <Typography fontWeight={600}>{field.name}</Typography>}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>按需要选择用途，填报方式保持原样。{tableId ? '同一列对各行生效。' : ''}</Typography>
    </Box>
    {isPending && <Typography variant="body2" color="text.secondary">正在加载可用追溯项与业务用途…</Typography>}
    {isError && <Alert severity="error" action={<Button size="small" onClick={() => void refetch()}>重试</Button>}>用途目录加载失败</Alert>}
    {traceModel && (traces.length > 0 || traceModel.attributes.some(attribute => acceptsProjectionAttribute(field, attribute))) && <Box sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      <FormControlLabel sx={{ m: 0 }} control={<Checkbox size="small" checked={traceOpen || traces.length > 0}
        onChange={(_, checked) => { setTraceOpen(checked); if (!checked) removeFieldFrom(traces); }} />} label={<Typography fontWeight={600} variant="body2">用于查找与追溯</Typography>} />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 4 }}>按字段值找到原表单和命中位置，不计入数量统计。</Typography>
      <Collapse in={traceOpen || traces.length > 0}><Stack spacing={1} sx={{ mt: 1.5 }}>
        {traces.flatMap(binding => Object.entries(binding.sources).filter(([, id]) => id === field.id).map(([id]) =>
          <Stack key={`${binding.id}/${id}`} direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">{traceModel.attributes.find(attribute => attribute.id === id)?.name ?? '追溯项已失效'}{!binding.enabled ? '（未启用）' : ''}</Typography>
            <Button size="small" onClick={() => { const sources = { ...binding.sources }; delete sources[id]; update(Object.keys(sources).length ? bindings.map(item => item.id === binding.id ? { ...item, sources } : item) : bindings.filter(item => item.id !== binding.id)); }}>移除</Button>
          </Stack>))}
        <TextField select fullWidth size="small" label="选择追溯项" value="" onChange={event => assignTrace(event.target.value)}>
          <MenuItem value="">请选择字段的查询含义</MenuItem>
          {traceModel.attributes.filter(attribute => acceptsProjectionAttribute(field, attribute) && !traces.some(binding => binding.sources[attribute.id] === field.id))
            .map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name}</MenuItem>)}
        </TextField>
        {tableId && traces.some(binding => !binding.rowKeyFieldId) && <Alert severity="info">当前版本的子表行定位尚未配置，请在整子表用途中补齐后启用。</Alert>}
      </Stack></Collapse>
    </Box>}
    {(models.length > 0 || statistical.length > 0) && <Box sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      <FormControlLabel sx={{ m: 0 }} control={<Checkbox size="small" checked={statisticsOpen || statistical.length > 0}
        onChange={(_, checked) => { setStatisticsOpen(checked); if (!checked) removeFieldFrom(statistical); }} />} label={<Typography fontWeight={600} variant="body2">用于业务统计</Typography>} />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 4 }}>选择预设用途，最终完成后进入对应报表。</Typography>
      <Collapse in={statisticsOpen || statistical.length > 0}><Stack spacing={1.5} sx={{ mt: 1.5 }}>
        {statistical.map(binding => {
          const definition = catalog?.models.find(item => item.id === binding.modelId);
          if (!definition) return <Alert key={binding.id} severity="warning">用途目录失效，请核对配置。</Alert>;
          return <Box key={binding.id} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>{definition.name} · {binding.enabled ? '已启用' : '配置草稿'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{projectionSourceSummary(document.model, binding)}</Typography>
            <Button size="small" sx={{ display: 'block', px: 0 }} onClick={() => setEditingId(editingId === binding.id ? null : binding.id)}>{editingId === binding.id ? '收起来源' : '补齐 / 调整来源'}</Button>
            <Collapse in={editingId === binding.id} unmountOnExit><ProjectionSourceEditor binding={binding} definition={definition} onChange={patch => change(binding.id, patch)} onRemove={() => update(bindings.filter(item => item.id !== binding.id))} /></Collapse>
          </Box>;
        })}
        <TextField select size="small" fullWidth label="添加业务用途" value={modelId} onChange={event => { setModelId(event.target.value); setAttributeId(''); setTargetId('__new'); }}>
          <MenuItem value="">请选择</MenuItem>{models.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
        </TextField>
        {model && <>
          <TextField select size="small" fullWidth label="这个字段代表" value={attributeId} onChange={event => { setAttributeId(event.target.value); setTargetId('__new'); }}>
            <MenuItem value="">请选择</MenuItem>{available.map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name.replace(/（.*?）/g, '')}</MenuItem>)}
          </TextField>
          {!!attributeId && candidates.length > 0 && <TextField select size="small" fullWidth label={tableId ? '补充哪项子表用途' : '补充哪笔业务'} value={targetId} onChange={event => setTargetId(event.target.value)}>
            <MenuItem value="__new">另配一笔{model.name}</MenuItem>{candidates.map(binding => <MenuItem key={binding.id} value={binding.id}>{projectionSourceSummary(document.model, binding)}</MenuItem>)}
          </TextField>}
          <Button size="small" variant="outlined" disabled={!attributeId || statistical.some(binding => binding.modelId === modelId && binding.sources[attributeId] === field.id)} onClick={addStatistics}>使用此字段，再补齐来源</Button>
        </>}
      </Stack></Collapse>
    </Box>}
    <Typography variant="caption" color="text.secondary">配置后点顶部“保存”；历史实例继续使用各自的快照。</Typography>
  </Stack>;
}
