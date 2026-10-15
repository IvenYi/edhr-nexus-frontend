import { useEffect, useRef, useState } from 'react';
import { Box, Button, Collapse, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Add from '@mui/icons-material/Add';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
import type { ProjectionBinding } from '../types/model';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import { projectionBindingLabel, projectionConfigurationIssues, projectionDetailName, projectionSourceRoles, useProjectionCatalog } from '../utils/projectionConfiguration';
import ProjectionSourceEditor from './ProjectionSourceEditor';
import ProjectionRemoveButton from './ProjectionRemoveButton';

/** One configuration describes a whole row or one business assembled from main fields. */
export default function StatisticsProjectionConfig({ tableId, selectedFieldId }: { tableId?: string; selectedFieldId?: string }) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog } = useProjectionCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingAnother, setAddingAnother] = useState(false);
  const [collapsedModels, setCollapsedModels] = useState<string[]>([]);
  const addedRecord = useRef<HTMLDivElement | null>(null);
  const pendingScroll = useRef(false);
  useEffect(() => {
    if (pendingScroll.current && addedRecord.current) {
      addedRecord.current.scrollIntoView({ block: 'nearest' });
      pendingScroll.current = false;
    }
  }, [editingId]);
  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const items = bindings.filter(binding => binding.modelId !== 'formTrace' && (binding.tableId ?? '') === (tableId ?? ''));
  const update = (next: ProjectionBinding[]) => setBindings(next, catalog?.version);
  const modelIds = [...new Set(items.map(binding => binding.modelId))];
  const add = (modelId: string) => {
    const id = crypto.randomUUID();
    pendingScroll.current = true;
    update([...bindings, { id, modelId, enabled: false, ...(tableId ? { tableId } : {}), sources: {} }]);
    setCollapsedModels(current => current.filter(id => id !== modelId));
    setEditingId(id); setAddingAnother(false);
  };
  return <Stack spacing={1.5}>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="body2" fontWeight={600}>{tableId ? '业务统计' : '业务统计 · 主表'}</Typography>
      <Tooltip title={`${tableId ? '为整张子表选择用途，再对应各列。每行形成一条明细。' : '这里配置主表的一笔业务，不代表当前字段已参与统计。选择用途后，配齐描述同一笔业务的字段。'}最终完成后进入正式报表。`}>
        <IconButton size="small" aria-label="业务统计配置说明"><InfoOutlined fontSize="small" /></IconButton>
      </Tooltip>
    </Stack>
    {!tableId && <Typography variant="caption" color="text.secondary">把描述同一笔业务的字段对应起来。</Typography>}
    {modelIds.map(modelId => <Stack spacing={1} key={modelId}>
      {!tableId && <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Button size="small" color="inherit" aria-expanded={!collapsedModels.includes(modelId)}
          startIcon={collapsedModels.includes(modelId) ? <ChevronRight /> : <ExpandMore />}
          sx={{ flex: 1, justifyContent: 'flex-start', px: 0, minWidth: 0, fontWeight: 600 }}
          onClick={() => setCollapsedModels(current => current.includes(modelId) ? current.filter(id => id !== modelId) : [...current, modelId])}>
          {catalog?.models.find(model => model.id === modelId)?.name ?? '已失效用途'}
        </Button>
        <Tooltip title={`添加${projectionDetailName(modelId)}`}><IconButton size="small" color="primary" aria-label={`添加${projectionDetailName(modelId)}`} onClick={() => add(modelId)}><Add fontSize="small" /></IconButton></Tooltip>
      </Stack>}
    <Collapse in={!!tableId || !collapsedModels.includes(modelId)} unmountOnExit><Stack spacing={1}>
    {items.filter(binding => binding.modelId === modelId).map(binding => {
      const definition = catalog?.models.find(model => model.id === binding.modelId);
      const complete = projectionConfigurationIssues(document.model, binding, definition).length === 0;
      const label = projectionBindingLabel(document.model, binding, definition);
      const roles = projectionSourceRoles(document.model, binding, definition);
      const selectedRoles = Object.entries(binding.sources).filter(([, id]) => id === selectedFieldId)
        .map(([id]) => definition?.attributes.find(attribute => attribute.id === id)?.name.replace(/（.*?）/g, '') ?? '已失效角色');
      return <Box key={binding.id} ref={editingId === binding.id ? addedRecord : undefined} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Button size="small" color="inherit" aria-expanded={editingId === binding.id} disabled={!definition} sx={{ flex: 1, justifyContent: 'flex-start', px: 0, textAlign: 'left', minWidth: 0 }} onClick={() => setEditingId(editingId === binding.id ? null : binding.id)}>{editingId === binding.id ? '▾ ' : '› '}{label}</Button>
          <ProjectionRemoveButton label={`移除${label}配置`} onClick={() => update(bindings.filter(item => item.id !== binding.id))} />
        </Stack>
        <Typography variant="caption" color={complete ? 'text.secondary' : 'warning.main'}>{complete ? '已配齐' : '待补齐'}</Typography>
        {!tableId && selectedRoles.length > 0 && <Typography variant="caption" display="block" color="primary.main">当前字段作为{selectedRoles.join('、')}</Typography>}
        {editingId !== binding.id && (roles.length ? roles.map(role => <Typography key={role.id} variant="caption" display="block" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{role.role}：{role.field}</Typography>)
          : <Typography variant="caption" display="block" color="text.secondary">尚未选择来源字段</Typography>)}
        {definition && <>
          <Collapse in={editingId === binding.id} unmountOnExit><ProjectionSourceEditor binding={binding} definition={definition}
            onChange={patch => update(bindings.map(item => item.id === binding.id ? { ...item, ...patch } : item))} /></Collapse></>}
      </Box>;
    })}
    </Stack></Collapse>
    </Stack>)}
    {items.length > 0 && <Button size="small" color="inherit" aria-expanded={addingAnother} startIcon={addingAnother ? <ExpandMore /> : <ChevronRight />} sx={{ alignSelf: 'flex-start', justifyContent: 'flex-start', px: 0, minWidth: 0, color: 'text.secondary' }} onClick={() => setAddingAnother(!addingAnother)}>其他统计用途</Button>}
    {(!items.length || addingAnother) && <TextField select size="small" fullWidth label={tableId ? (items.length ? '添加其他统计用途' : '这张子表统计什么') : '主表统计什么'} value="" onChange={event => {
      if (!event.target.value) return;
      const existing = tableId ? items.find(binding => binding.modelId === event.target.value) : undefined;
      if (existing) { setEditingId(existing.id); return; }
      add(event.target.value);
    }}>
      <MenuItem value="">请选择预设业务</MenuItem>{catalog?.models.filter(model => model.id !== 'formTrace' && !modelIds.includes(model.id)).map(model => <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>)}
    </TextField>}
    <Typography variant="caption" color="text.secondary">配置后统一点击顶部“保存”。</Typography>
  </Stack>;
}
