import { useEffect, useState } from 'react';
import { Box, Button, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import client from '@/api/client';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField, ProjectionBinding } from '../types/model';

interface Catalog {
  version: string;
  models: { id: string; name: string; attributes: { id: string; name: string; type: string }[] }[];
}

function accepts(field: ModelField, type: string) {
  if (type === 'number') return field.type === 'number';
  if (type === 'reference') return field.type === 'reference' && field.typeConfig.sourceType === 'material';
  return field.type === 'text' || field.type === 'singleSelect';
}

export default function FieldProjectionConfig({ field, tableId }: { field: ModelField; tableId?: string }) {
  const document = useTemplateDesignerStore((state) => state.document);
  const setProjectionBindings = useTemplateDesignerStore((state) => state.setProjectionBindings);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [targetId, setTargetId] = useState('__new');
  const [newModelId, setNewModelId] = useState('formTrace');
  const [attributeId, setAttributeId] = useState('');
  const [newRowKey, setNewRowKey] = useState('');

  useEffect(() => {
    void client.get('/master-data/template-modeling/projection-catalog')
      .then((response) => setCatalog(response.data.data as Catalog))
      .catch(() => setError('用途目录加载失败，请刷新页面后重试'));
  }, []);
  useEffect(() => {
    setTargetId('__new');
    setAttributeId('');
    setNewRowKey('');
    setError('');
  }, [field.id, tableId]);

  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const records = bindings.map((binding, index) => ({ binding, index }))
    .filter(({ binding }) => (binding.tableId ?? '') === (tableId ?? ''));
  const selected = records.find(({ binding }) => binding.id === targetId)?.binding;
  const availableModels = catalog?.models.filter((model) => model.attributes.some((attribute) => accepts(field, attribute.type))) ?? [];
  const effectiveNewModelId = availableModels.some((model) => model.id === newModelId) ? newModelId : availableModels[0]?.id ?? '';
  const model = catalog?.models.find((item) => item.id === (selected?.modelId ?? effectiveNewModelId));
  const alreadyMapped = selected && Object.values(selected.sources).includes(field.id);
  const attributes = model?.attributes.filter((attribute) => accepts(field, attribute.type)
    && !selected?.sources[attribute.id] && !alreadyMapped) ?? [];
  const effectiveAttributeId = attributes.some((attribute) => attribute.id === attributeId) ? attributeId : '';
  const columns = tableId
    ? (document.model.fields.find((item) => item.id === tableId)?.typeConfig.columns as ModelField[] | undefined) ?? []
    : [];
  const rowKeyOptions = columns.filter((item) => item.status !== 'disabled' && accepts(item, 'text'));
  const assignments = records.flatMap(({ binding, index }) => Object.entries(binding.sources)
    .filter(([, sourceId]) => sourceId === field.id)
    .map(([attribute]) => ({ binding, index, attribute })));

  const recordName = (binding: ProjectionBinding, index: number) =>
    `${catalog?.models.find((item) => item.id === binding.modelId)?.name ?? binding.modelId} · 记录 ${index + 1}`;
  const recordFields = (binding: ProjectionBinding) => {
    const fields = tableId ? columns : document.model.fields;
    return [...new Set(Object.values(binding.sources).map((id) => fields.find((item) => item.id === id)?.name ?? id))].join('、');
  };
  const selectedRecordName = (id: unknown) => {
    if (id === '__new') return '新建一条用途记录';
    const record = records.find(({ binding }) => binding.id === id);
    return record ? recordName(record.binding, record.index) : '';
  };
  const update = (next: ProjectionBinding[]) => setProjectionBindings(next, catalog?.version);
  const changeRecord = (id: string, patch: Partial<ProjectionBinding>) =>
    update(bindings.map((binding) => binding.id === id ? { ...binding, ...patch } : binding));
  const removeAssignment = (record: ProjectionBinding, attribute: string) => {
    const sources = { ...record.sources };
    delete sources[attribute];
    update(Object.keys(sources).length === 0
      ? bindings.filter((binding) => binding.id !== record.id)
      : bindings.map((binding) => binding.id === record.id ? { ...binding, sources } : binding));
  };
  const addAssignment = () => {
    if (!effectiveAttributeId || !model) return;
    if (selected) {
      if (alreadyMapped || selected.sources[effectiveAttributeId]) return;
      changeRecord(selected.id, { sources: { ...selected.sources, [effectiveAttributeId]: field.id } });
    } else {
      if (tableId && !newRowKey) {
        setError('明细记录须先选择稳定的记录键字段');
        return;
      }
      update([...bindings, {
        id: crypto.randomUUID(), modelId: model.id, enabled: false,
        ...(tableId ? { tableId, rowKeyFieldId: newRowKey } : {}),
        sources: { [effectiveAttributeId]: field.id },
      }]);
    }
    setAttributeId('');
    setError('');
  };

  return <Stack spacing={1.25}>
    <Typography sx={{ fontSize: 12, color: '#606266', lineHeight: 1.5 }}>
      当前字段「{field.name}」可作为一条用途记录中的某项信息。其他字段选择同一记录，就会一起形成报表明细。
    </Typography>
    {assignments.length === 0 && <Typography sx={{ fontSize: 12, color: '#909399' }}>此字段尚未用于追溯或统计。</Typography>}
    {assignments.map(({ binding, index, attribute }) => <Box key={`${binding.id}/${attribute}`} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 1 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{recordName(binding, index)}</Typography>
      <Typography sx={{ fontSize: 12, color: '#606266', mt: 0.5 }}>
        此字段代表：{catalog?.models.find((item) => item.id === binding.modelId)?.attributes.find((item) => item.id === attribute)?.name ?? attribute}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#909399', mt: 0.5, overflowWrap: 'anywhere' }}>
        本记录来源：{recordFields(binding)}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <FormControlLabel sx={{ m: 0 }} label={<Typography sx={{ fontSize: 12 }}>整条记录{binding.enabled ? '已启用' : '未启用'}</Typography>}
          control={<Switch size="small" checked={binding.enabled} onChange={(_, enabled) => changeRecord(binding.id, { enabled })} />} />
        <Button size="small" color="error" onClick={() => removeAssignment(binding, attribute)}>移除此关联</Button>
      </Stack>
    </Box>)}
    <Typography sx={{ fontSize: 13, fontWeight: 600, pt: 0.5 }}>添加字段用途</Typography>
    <TextField select fullWidth size="small" label="加入哪条记录" value={selected ? targetId : '__new'}
      SelectProps={{ renderValue: selectedRecordName }}
      onChange={(event) => { setTargetId(event.target.value); setAttributeId(''); setError(''); }}>
      <MenuItem value="__new">新建一条用途记录</MenuItem>
      {records.map(({ binding, index }) => <MenuItem key={binding.id} value={binding.id} sx={{ display: 'block' }}>
        <Typography sx={{ fontSize: 13 }}>{recordName(binding, index)}</Typography>
        <Typography sx={{ fontSize: 12, color: '#909399', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }} noWrap>
          {recordFields(binding)}
        </Typography>
      </MenuItem>)}
    </TextField>
    {!selected && <TextField select fullWidth size="small" label="用途" value={effectiveNewModelId}
      onChange={(event) => { setNewModelId(event.target.value); setAttributeId(''); }}>
      {availableModels.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
    </TextField>}
    <TextField select fullWidth size="small" label="此字段代表" value={effectiveAttributeId}
      disabled={!catalog || attributes.length === 0} onChange={(event) => setAttributeId(event.target.value)}>
      <MenuItem value="">请选择</MenuItem>
      {attributes.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
    </TextField>
    {tableId && <TextField select fullWidth size="small" label="明细记录键" value={selected?.rowKeyFieldId ?? newRowKey}
      onChange={(event) => selected ? changeRecord(selected.id, { rowKeyFieldId: event.target.value }) : setNewRowKey(event.target.value)}>
      <MenuItem value="">请选择每行唯一的字段</MenuItem>
      {rowKeyOptions.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
    </TextField>}
    {alreadyMapped && <Typography sx={{ fontSize: 12, color: '#909399' }}>此字段已在所选记录中使用；如需改含义，请先移除上方关联。</Typography>}
    {error && <Typography role="alert" sx={{ fontSize: 12, color: 'error.main' }}>{error}</Typography>}
    <Button variant="outlined" size="small" disabled={!effectiveAttributeId || field.status === 'disabled'} onClick={addAssignment}>添加对应关系</Button>
    <Typography sx={{ fontSize: 12, color: '#909399', lineHeight: 1.5 }}>
      新记录先停用。补齐该记录的来源后启用，再点页面顶部“保存”；启用但未补全的记录会阻止生产使用。右上角全表入口也可整表编辑、核对和模拟预览。
    </Typography>
  </Stack>;
}
