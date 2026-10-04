import { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, Collapse, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { ModelField, ProjectionBinding } from '../types/model';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import { acceptsProjectionAttribute, projectionConfigurationIssues, projectionSourceSummary, useProjectionCatalog } from '../utils/projectionConfiguration';
import ProjectionSourceEditor from './ProjectionSourceEditor';

export default function SubTableProjectionConfig({ field }: { field: ModelField }) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog, isPending, isError, refetch } = useProjectionCatalog();
  const [traceOpen, setTraceOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => { setTraceOpen(false); setStatisticsOpen(false); setEditingId(null); }, [field.id]);
  if (!document) return null;
  const columns = (field.typeConfig.columns as ModelField[] | undefined) ?? [];
  const bindings = document.model.projection?.bindings ?? [];
  const inTable = bindings.filter(binding => binding.tableId === field.id);
  const traces = inTable.filter(binding => binding.modelId === 'formTrace');
  const statistical = inTable.filter(binding => binding.modelId !== 'formTrace');
  const traceModel = catalog?.models.find(model => model.id === 'formTrace');
  const update = (next: ProjectionBinding[]) => setBindings(next, catalog?.version);
  const change = (id: string, patch: Partial<ProjectionBinding>) => update(bindings.map(binding => binding.id === id ? { ...binding, ...patch } : binding));
  const addTrace = (column: ModelField, attributeId: string) => {
    if (!attributeId) return;
    const existing = traces.find(binding => !binding.sources[attributeId] && !Object.values(binding.sources).includes(column.id));
    if (existing) change(existing.id, { sources: { ...existing.sources, [attributeId]: column.id } });
    else {
      const binding = { id: crypto.randomUUID(), modelId: 'formTrace', enabled: false, tableId: field.id,
        rowKeyFieldId: inTable.find(item => item.rowKeyFieldId)?.rowKeyFieldId, sources: { [attributeId]: column.id } };
      update([...bindings, { ...binding, enabled: projectionConfigurationIssues(document.model, binding, traceModel).length === 0 }]);
    }
  };
  return <Stack spacing={2}>
    <Box><Typography fontWeight={600}>{field.name} · 子表</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>选择列的含义，配置对每一行生效，无需逐行建立记录组。</Typography></Box>
    {isPending && <Typography variant="body2" color="text.secondary">正在加载可用查找项与业务用途…</Typography>}
    {isError && <Alert severity="error" action={<Button size="small" onClick={() => void refetch()}>重试</Button>}>用途目录加载失败</Alert>}
    <Box sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      <FormControlLabel sx={{ m: 0 }} control={<Checkbox size="small" checked={traceOpen || traces.length > 0}
        onChange={(_, checked) => { setTraceOpen(checked); if (!checked) update(bindings.filter(binding => !traces.some(item => item.id === binding.id))); }} />}
        label={<Typography variant="body2" fontWeight={600}>用于查找与追溯</Typography>} />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 4 }}>按这些列的值查到来源表单和具体行。</Typography>
      <Collapse in={traceOpen || traces.length > 0}><Stack spacing={1.5} sx={{ mt: 1.5 }}>
        {columns.filter(column => traceModel?.attributes.some(attribute => acceptsProjectionAttribute(column, attribute))).map(column => {
          const assignments = traces.flatMap(binding => Object.entries(binding.sources).filter(([, id]) => id === column.id).map(([id]) => ({ binding, id })));
          return <Box key={column.id} sx={{ borderBottom: '1px solid #e4e7ed', pb: 1.5 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>{column.name}</Typography>
            {assignments.map(({ binding, id }) => <Stack key={`${binding.id}/${id}`} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption">{traceModel?.attributes.find(attribute => attribute.id === id)?.name.replace(/（.*?）/g, '') ?? '查找项已失效'}</Typography>
              <Button size="small" onClick={() => { const sources = { ...binding.sources }; delete sources[id]; update(Object.keys(sources).length ? bindings.map(item => item.id === binding.id ? { ...item, sources } : item) : bindings.filter(item => item.id !== binding.id)); }}>移除</Button>
            </Stack>)}
            <TextField select fullWidth size="small" label="关联查找项" value="" onChange={event => addTrace(column, event.target.value)}>
              <MenuItem value="">不配置或选择查询含义</MenuItem>
              {traceModel?.attributes.filter(attribute => acceptsProjectionAttribute(column, attribute) && !assignments.some(item => item.id === attribute.id))
                .map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name.replace(/（.*?）/g, '')}</MenuItem>)}
            </TextField>
          </Box>;
        })}
        {traces.map(binding => traceModel && <Box key={binding.id}>
          <Button size="small" sx={{ px: 0 }} onClick={() => setEditingId(editingId === binding.id ? null : binding.id)}>{binding.enabled ? '调整查找配置 · 已启用' : '完善并启用查找配置'}</Button>
          <Collapse in={editingId === binding.id} unmountOnExit><ProjectionSourceEditor binding={binding} definition={traceModel} onChange={patch => change(binding.id, patch)} onRemove={() => update(bindings.filter(item => item.id !== binding.id))} /></Collapse>
        </Box>)}
      </Stack></Collapse>
    </Box>
    <Box sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      <FormControlLabel sx={{ m: 0 }} control={<Checkbox size="small" checked={statisticsOpen || statistical.length > 0}
        onChange={(_, checked) => { setStatisticsOpen(checked); if (!checked) update(bindings.filter(binding => !statistical.some(item => item.id === binding.id))); }} />}
        label={<Typography variant="body2" fontWeight={600}>用于业务统计</Typography>} />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 4 }}>每行形成明细，进入预设报表。</Typography>
      <Collapse in={statisticsOpen || statistical.length > 0}><Stack spacing={1.5} sx={{ mt: 1.5 }}>
        {statistical.map(binding => {
          const definition = catalog?.models.find(model => model.id === binding.modelId);
          return definition ? <Box key={binding.id} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>{definition.name} · {binding.enabled ? '已启用' : '配置草稿'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{projectionSourceSummary(document.model, binding)}</Typography>
            <Button size="small" sx={{ display: 'block', px: 0 }} onClick={() => setEditingId(editingId === binding.id ? null : binding.id)}>{editingId === binding.id ? '收起来源' : '选择 / 调整来源列'}</Button>
            <Collapse in={editingId === binding.id} unmountOnExit><ProjectionSourceEditor binding={binding} definition={definition} onChange={patch => change(binding.id, patch)} onRemove={() => update(bindings.filter(item => item.id !== binding.id))} /></Collapse>
          </Box> : <Alert key={binding.id} severity="warning">用途目录失效，请核对配置。</Alert>;
        })}
        <TextField select fullWidth size="small" label="添加预设业务用途" value="" onChange={event => {
          if (!event.target.value) return;
          const id = crypto.randomUUID(); update([...bindings, { id, modelId: event.target.value, enabled: false, tableId: field.id,
            rowKeyFieldId: inTable.find(binding => binding.rowKeyFieldId)?.rowKeyFieldId, sources: {} }]); setEditingId(id);
        }}>
          <MenuItem value="">请选择</MenuItem>{catalog?.models.filter(model => model.id !== 'formTrace').map(model => <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>)}
        </TextField>
      </Stack></Collapse>
    </Box>
    <Typography variant="caption" color="text.secondary">配置后点顶部“保存”；全表总览可集中核对和预览。</Typography>
  </Stack>;
}
