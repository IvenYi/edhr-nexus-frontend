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
  const [isAdding, setIsAdding] = useState(false);
  const [editingBindingId, setEditingBindingId] = useState<string | null>(null);
  const [showLookupGrouping, setShowLookupGrouping] = useState(false);
  const [targetId, setTargetId] = useState('__new');
  const [newModelId, setNewModelId] = useState('');
  const [attributeId, setAttributeId] = useState('');
  const [newRowKey, setNewRowKey] = useState('');

  useEffect(() => {
    void client.get('/master-data/template-modeling/projection-catalog')
      .then((response) => setCatalog(response.data.data as Catalog))
      .catch(() => setError('用途目录加载失败，请刷新页面后重试'));
  }, []);
  useEffect(() => {
    setIsAdding(false);
    setEditingBindingId(null);
    setShowLookupGrouping(false);
    setTargetId('__new');
    setNewModelId('');
    setAttributeId('');
    setNewRowKey('');
    setError('');
  }, [field.id, tableId]);

  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const records = bindings.filter((binding) => (binding.tableId ?? '') === (tableId ?? ''));
  const availableModels = catalog?.models.filter((model) => model.attributes.some((attribute) => accepts(field, attribute.type))) ?? [];
  const model = availableModels.find((item) => item.id === newModelId);
  const attributes = model?.attributes.filter((attribute) => accepts(field, attribute.type)) ?? [];
  const effectiveAttributeId = attributes.some((attribute) => attribute.id === attributeId) ? attributeId : '';
  const compatibleRecords = records.filter((binding) => binding.modelId === newModelId
    && !!effectiveAttributeId && !binding.sources[effectiveAttributeId]
    && !Object.values(binding.sources).includes(field.id));
  const alreadyUsedForSameRole = records.some((binding) => binding.modelId === newModelId
    && !!effectiveAttributeId && binding.sources[effectiveAttributeId] === field.id);
  const selected = compatibleRecords.find((binding) => binding.id === targetId);
  const columns = tableId
    ? (document.model.fields.find((item) => item.id === tableId)?.typeConfig.columns as ModelField[] | undefined) ?? []
    : [];
  const rowKeyOptions = columns.filter((item) => item.status !== 'disabled' && accepts(item, 'text'));
  const assignments = records.flatMap((binding) => Object.entries(binding.sources)
    .filter(([, sourceId]) => sourceId === field.id)
    .map(([attribute]) => ({ binding, attribute })));

  const recordName = (binding: ProjectionBinding) => catalog?.models.find((item) => item.id === binding.modelId)?.name ?? binding.modelId;
  const recordFields = (binding: ProjectionBinding) => {
    const fields = tableId ? columns : document.model.fields;
    return [...new Set(Object.values(binding.sources).map((id) => fields.find((item) => item.id === id)?.name ?? id))].join('、');
  };
  const selectedRecordName = (id: unknown) => {
    const binding = compatibleRecords.find((item) => item.id === id);
    return binding ? recordFields(binding) : '新的一条明细';
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
    setIsAdding(false);
    setNewModelId('');
    setTargetId('__new');
    setAttributeId('');
    setNewRowKey('');
    setShowLookupGrouping(false);
    setError('');
  };

  return <Stack spacing={1.25}>
    {assignments.length === 0 && <Typography sx={{ fontSize: 12, color: '#909399' }}>当前字段尚未用于查找或正式统计；普通填报不需要配置。</Typography>}
    {assignments.map(({ binding, attribute }) => <Box key={`${binding.id}/${attribute}`} sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 1 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{recordName(binding)} · {catalog?.models.find((item) => item.id === binding.modelId)?.attributes.find((item) => item.id === attribute)?.name ?? attribute}</Typography>
      <Typography sx={{ fontSize: 12, color: '#909399', mt: 0.5, overflowWrap: 'anywhere' }}>
        同条字段：{recordFields(binding)} · {binding.enabled ? '已启用' : '未启用'}
      </Typography>
      <Button size="small" sx={{ px: 0, mt: 0.5 }} onClick={() => setEditingBindingId(editingBindingId === binding.id ? null : binding.id)}>
        {editingBindingId === binding.id ? '收起管理' : '管理这条明细'}
      </Button>
      {editingBindingId === binding.id && <Stack direction="row" alignItems="center" justifyContent="space-between">
        <FormControlLabel sx={{ m: 0 }} label={<Typography sx={{ fontSize: 12 }}>整条记录启用</Typography>}
          control={<Switch size="small" checked={binding.enabled} onChange={(_, enabled) => changeRecord(binding.id, { enabled })} />} />
        <Button size="small" color="error" onClick={() => removeAssignment(binding, attribute)}>移除此关联</Button>
      </Stack>}
    </Box>)}
    {!isAdding ? <Button variant="outlined" size="small" onClick={() => setIsAdding(true)}>为此字段添加用途</Button> : <Stack spacing={1.25} sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>先选要得到什么结果</Typography>
      {availableModels.find((item) => item.id === 'formTrace') && <Box>
        <Typography sx={{ fontSize: 12, color: '#909399', mb: 0.5 }}>查找来源 · 不计入数量统计</Typography>
        <Button fullWidth size="small" variant={newModelId === 'formTrace' ? 'contained' : 'outlined'} onClick={() => { setNewModelId('formTrace'); setAttributeId(''); setTargetId('__new'); setShowLookupGrouping(false); }}>按字段内容查找表单</Button>
      </Box>}
      {availableModels.some((item) => item.id !== 'formTrace') && <Box>
        <Typography sx={{ fontSize: 12, color: '#909399', mb: 0.5 }}>形成正式业务明细 · 最终完成后入报表</Typography>
        <Stack spacing={0.75}>{availableModels.filter((item) => item.id !== 'formTrace').map((item) =>
          <Button key={item.id} fullWidth size="small" variant={newModelId === item.id ? 'contained' : 'outlined'} onClick={() => { setNewModelId(item.id); setAttributeId(''); setTargetId('__new'); setShowLookupGrouping(false); }}>{item.name}</Button>)}</Stack>
      </Box>}
      {model && <TextField select fullWidth size="small" label="这个字段代表" value={effectiveAttributeId}
        onChange={(event) => { setAttributeId(event.target.value); setTargetId('__new'); }}>
        <MenuItem value="">请选择</MenuItem>
        {attributes.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
      </TextField>}
      {model?.id === 'formTrace' && !!effectiveAttributeId && compatibleRecords.length > 0 && !showLookupGrouping &&
        <Button size="small" sx={{ alignSelf: 'flex-start', px: 0 }} onClick={() => setShowLookupGrouping(true)}>与已有查找条件组成同一条（可选）</Button>}
      {!!effectiveAttributeId && model && compatibleRecords.length > 0 && (model.id !== 'formTrace' || showLookupGrouping) && <>
        <Typography sx={{ fontSize: 12, color: '#606266' }}>哪些字段描述同一条明细？新的一条会形成另一笔；选择已有明细则只补充它的信息。</Typography>
        <TextField select fullWidth size="small" label="明细归属" value={selected ? targetId : '__new'} SelectProps={{ renderValue: selectedRecordName }}
          onChange={(event) => { setTargetId(event.target.value); setError(''); }}>
          <MenuItem value="__new">新的一条明细</MenuItem>
          {compatibleRecords.map((binding) => <MenuItem key={binding.id} value={binding.id} sx={{ display: 'block' }}>
            <Typography sx={{ fontSize: 13 }}>加入已有明细</Typography>
            <Typography sx={{ fontSize: 12, color: '#909399', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }} noWrap>{recordFields(binding)}</Typography>
          </MenuItem>)}
        </TextField>
      </>}
      {!!effectiveAttributeId && model?.id !== 'formTrace' && compatibleRecords.length === 0 && <Typography sx={{ fontSize: 12, color: '#606266' }}>没有可补充的同用途明细，将新建一条。</Typography>}
      {alreadyUsedForSameRole && model?.id !== 'formTrace' && <Typography sx={{ fontSize: 12, color: '#b26a00' }}>这个字段已作为同一用途的“{attributes.find((item) => item.id === effectiveAttributeId)?.name}”使用。再建一条可能重复计入，请先核对来源。</Typography>}
      {tableId && !!effectiveAttributeId && !selected && <TextField select fullWidth size="small" label="每行记录键" value={newRowKey}
        onChange={(event) => setNewRowKey(event.target.value)}>
        <MenuItem value="">请选择每行唯一的字段</MenuItem>
        {rowKeyOptions.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
      </TextField>}
      {error && <Typography role="alert" sx={{ fontSize: 12, color: 'error.main' }}>{error}</Typography>}
      <Stack direction="row" spacing={1}>
        <Button variant="contained" size="small" disabled={!effectiveAttributeId || field.status === 'disabled'} onClick={addAssignment}>添加</Button>
        <Button size="small" onClick={() => { setIsAdding(false); setError(''); }}>取消</Button>
      </Stack>
      <Typography sx={{ fontSize: 12, color: '#909399', lineHeight: 1.5 }}>新明细先停用，补齐来源后再启用并保存；启用但未补全会阻止生产使用。</Typography>
    </Stack>}
  </Stack>;
}
