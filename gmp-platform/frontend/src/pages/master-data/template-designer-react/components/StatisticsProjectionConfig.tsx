import { useState } from 'react';
import { Box, Button, Collapse, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import type { ProjectionBinding } from '../types/model';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import { projectionConfigurationIssues, projectionSourceSummary, useProjectionCatalog } from '../utils/projectionConfiguration';
import ProjectionSourceEditor from './ProjectionSourceEditor';
import ProjectionRemoveButton from './ProjectionRemoveButton';

/** One configuration describes a whole row or one business assembled from main fields. */
export default function StatisticsProjectionConfig({ tableId }: { tableId?: string }) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog } = useProjectionCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const items = bindings.filter(binding => binding.modelId !== 'formTrace' && (binding.tableId ?? '') === (tableId ?? ''));
  const update = (next: ProjectionBinding[]) => setBindings(next, catalog?.version);
  return <Stack spacing={1.5}>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="body2" fontWeight={600}>{tableId ? '业务统计' : '主表的业务统计'}</Typography>
      <Tooltip title={`${tableId ? '为整张子表选择用途，再对应各列。每行形成一条明细。' : '这里配置主表的一笔业务，不代表当前字段已参与统计。选择用途后，配齐描述同一笔业务的字段。'}最终完成后进入正式报表。`}>
        <IconButton size="small" aria-label="业务统计配置说明"><InfoOutlined fontSize="small" /></IconButton>
      </Tooltip>
    </Stack>
    {items.map((binding, index) => {
      const definition = catalog?.models.find(model => model.id === binding.modelId);
      const complete = projectionConfigurationIssues(document.model, binding, definition).length === 0;
      return <Box key={binding.id} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={600}>{definition?.name ?? '业务用途已失效'}{!tableId && items.length > 1 ? ` · 第 ${index + 1} 笔` : ''} · {complete ? '已配齐' : '待补齐'}</Typography>
          <ProjectionRemoveButton label={`移除${definition?.name ?? '失效用途'}${!tableId && items.length > 1 ? ` · 第 ${index + 1} 笔` : ''}配置`} onClick={() => update(bindings.filter(item => item.id !== binding.id))} />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{projectionSourceSummary(document.model, binding)}</Typography>
        {definition && <><Button size="small" sx={{ display: 'block', px: 0 }} onClick={() => setEditingId(editingId === binding.id ? null : binding.id)}>{editingId === binding.id ? '收起' : '配置来源'}</Button>
          <Collapse in={editingId === binding.id} unmountOnExit><ProjectionSourceEditor binding={binding} definition={definition}
            onChange={patch => update(bindings.map(item => item.id === binding.id ? { ...item, ...patch } : item))} /></Collapse></>}
      </Box>;
    })}
    <TextField select size="small" fullWidth label={items.length ? '再添加一项业务' : '这张表要统计什么'} value="" onChange={event => {
      if (!event.target.value) return;
      const existing = tableId ? items.find(binding => binding.modelId === event.target.value) : undefined;
      if (existing) { setEditingId(existing.id); return; }
      const id = crypto.randomUUID();
      update([...bindings, { id, modelId: event.target.value, enabled: false, ...(tableId ? { tableId } : {}), sources: {} }]);
      setEditingId(id);
    }}>
      <MenuItem value="">请选择预设业务</MenuItem>{catalog?.models.filter(model => model.id !== 'formTrace').map(model => <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>)}
    </TextField>
    <Typography variant="caption" color="text.secondary">配置后统一点击顶部“保存”。</Typography>
  </Stack>;
}
