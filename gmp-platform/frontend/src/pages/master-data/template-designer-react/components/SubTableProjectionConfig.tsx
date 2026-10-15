import { useState } from 'react';
import { Box, Button, Collapse, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { ModelField } from '../types/model';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import { acceptsProjectionAttribute, useProjectionCatalog } from '../utils/projectionConfiguration';
import StatisticsProjectionConfig from './StatisticsProjectionConfig';
import ProjectionRemoveButton from './ProjectionRemoveButton';

export default function SubTableProjectionConfig({ field, showIdentity = true }: { field: ModelField; showIdentity?: boolean }) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog } = useProjectionCatalog();
  const [traceOpen, setTraceOpen] = useState(false);
  if (!document) return null;
  const columns = (field.typeConfig.columns as ModelField[] | undefined) ?? [];
  const bindings = document.model.projection?.bindings ?? [];
  const traces = bindings.filter(binding => binding.tableId === field.id && binding.modelId === 'formTrace');
  const traceModel = catalog?.models.find(model => model.id === 'formTrace');
  return <Stack spacing={2}>
    {showIdentity && <Typography fontWeight={600}>{field.name} · 子表</Typography>}
    <StatisticsProjectionConfig tableId={field.id} />
    <Box sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      <Typography variant="body2" fontWeight={600}>按子表内容追溯（可选）</Typography>
      <Typography variant="caption" color="text.secondary">统计和追溯分别配置。需要按某列查到表单和具体行时，为它关联追溯项。</Typography>
      <Button size="small" sx={{ display: 'block', px: 0 }} onClick={() => setTraceOpen(!traceOpen)}>{traceOpen ? '收起列的追溯设置' : `配置列的追溯信息${traces.length ? ' · 已配置' : ''}`}</Button>
      <Collapse in={traceOpen} unmountOnExit><Stack spacing={1.5} sx={{ mt: 1 }}>
        {columns.filter(column => traceModel?.attributes.some(attribute => acceptsProjectionAttribute(column, attribute))).map(column => {
          const assignments = traces.flatMap(binding => Object.entries(binding.sources).filter(([, id]) => id === column.id).map(([id]) => ({ binding, id })));
          return <Box key={column.id}>
            <Typography variant="body2" fontWeight={500}>{column.name}</Typography>
            {assignments.map(({ binding, id }) => <Stack key={`${binding.id}/${id}`} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption">{traceModel?.attributes.find(attribute => attribute.id === id)?.name ?? '追溯项已失效'}</Typography>
              <ProjectionRemoveButton label={`移除${traceModel?.attributes.find(attribute => attribute.id === id)?.name ?? '失效追溯项'}关联`} onClick={() => { const sources = { ...binding.sources }; delete sources[id];
                setBindings(Object.keys(sources).length ? bindings.map(item => item.id === binding.id ? { ...item, sources } : item) : bindings.filter(item => item.id !== binding.id), catalog?.version); }} />
            </Stack>)}
            <TextField select fullWidth size="small" label="关联追溯项（可选）" value="" sx={{ mt: 1 }} onChange={event => {
              if (!event.target.value) return;
              setBindings([...bindings, { id: crypto.randomUUID(), modelId: 'formTrace', enabled: true, tableId: field.id, sources: { [event.target.value]: column.id } }], catalog?.version);
            }}><MenuItem value="">选择这列记录的信息</MenuItem>
              {traceModel?.attributes.filter(attribute => acceptsProjectionAttribute(column, attribute) && !assignments.some(item => item.id === attribute.id))
                .map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name}</MenuItem>)}
            </TextField>
          </Box>;
        })}
      </Stack></Collapse>
    </Box>
  </Stack>;
}
