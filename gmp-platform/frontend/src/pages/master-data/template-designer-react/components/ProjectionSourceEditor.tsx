import { Alert, Button, Checkbox, ListItemText, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ProjectionBinding } from '../types/model';
import { acceptsProjectionAttribute, projectionConfigurationIssues, projectionRequiredAttributes, projectionSources, type ProjectionModel } from '../utils/projectionConfiguration';

export default function ProjectionSourceEditor({ binding, definition, onChange, onRemove }: {
  binding: ProjectionBinding; definition: ProjectionModel; onChange: (patch: Partial<ProjectionBinding>) => void; onRemove: () => void;
}) {
  const document = useTemplateDesignerStore(state => state.document);
  const [showOptional, setShowOptional] = useState(false);
  const [addedTraceId, setAddedTraceId] = useState('');
  if (!document) return null;
  const fields = projectionSources(document.model, binding);
  const required = projectionRequiredAttributes(binding.modelId);
  const issues = projectionConfigurationIssues(document.model, binding, definition);
  const isTrace = binding.modelId === 'formTrace';
  const attributes = definition.attributes.filter(attribute => isTrace ? binding.sources[attribute.id] || attribute.id === addedTraceId
    : showOptional || required.includes(attribute.id) || ['unit', 'materialLotText'].includes(attribute.id)
      || (binding.modelId === 'production' && ['goodQuantity', 'ngQuantity'].includes(attribute.id)) || binding.sources[attribute.id]);
  if (!isTrace) {
    const order = ['material', 'quantity', 'goodQuantity', 'ngQuantity', 'unit', 'materialLotText'];
    attributes.sort((left, right) => (order.indexOf(left.id) < 0 ? order.length : order.indexOf(left.id)) - (order.indexOf(right.id) < 0 ? order.length : order.indexOf(right.id)));
  }
  const missingAttributes = Object.keys(binding.sources).filter(id => !definition.attributes.some(attribute => attribute.id === id));
  const traceCandidates = definition.attributes.filter(attribute => !binding.sources[attribute.id]
    && fields.some(field => acceptsProjectionAttribute(field, attribute) && !Object.values(binding.sources).includes(field.id)));
  const selectSource = (attributeId: string, fieldId: string) => {
    const sources = { ...binding.sources };
    if (fieldId) sources[attributeId] = fieldId; else delete sources[attributeId];
    if (fieldId && addedTraceId === attributeId) setAddedTraceId('');
    const next = { ...binding, sources, rowKeyFieldId: undefined };
    onChange({ sources, rowKeyFieldId: undefined, enabled: projectionConfigurationIssues(document.model, next, definition).length === 0 });
  };
  return <Stack spacing={1.5}>
    <Typography variant="body2" color="text.secondary">{isTrace ? '关联字段记录的信息。填报仍按原方式录入，查询时在追溯页面输入要查的值。' : binding.tableId ? '配置一次列含义，每行分别形成业务明细。' : '选择描述同一笔业务的字段；另一笔业务单独配置。'}</Typography>
    {isTrace && traceCandidates.length > 0 && <TextField select fullWidth size="small" label="添加追溯项" value={addedTraceId} onChange={event => setAddedTraceId(event.target.value)}>
      <MenuItem value="">按需添加</MenuItem>
      {traceCandidates.map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name}</MenuItem>)}
    </TextField>}
    {missingAttributes.map(id => <Alert key={id} severity="warning" action={<Button size="small" onClick={() => selectSource(id, '')}>移除</Button>}>追溯项或业务信息已失效，原来源：{fields.find(field => field.id === binding.sources[id])?.name ?? '来源字段已失效'}</Alert>)}
    {attributes.map(attribute => <TextField key={attribute.id} select fullWidth size="small"
      label={`${binding.modelId === 'formTrace' ? attribute.name : attribute.name.replace(/（.*?）/g, '')}${required.includes(attribute.id) ? ' *' : ''}`} value={binding.sources[attribute.id] ?? ''}
      onChange={event => selectSource(attribute.id, event.target.value)}>
      <MenuItem value="">请选择来源{binding.tableId ? '列' : '字段'}</MenuItem>
      {!!binding.sources[attribute.id] && !fields.some(field => field.id === binding.sources[attribute.id] && acceptsProjectionAttribute(field, attribute)) &&
        <MenuItem value={binding.sources[attribute.id]}>来源已失效，请重新选择</MenuItem>}
      {fields.filter(field => acceptsProjectionAttribute(field, attribute)
        && !Object.entries(binding.sources).some(([id, source]) => id !== attribute.id && source === field.id))
        .map(field => <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>)}
    </TextField>)}
    {!isTrace && definition.attributes.some(attribute => !attributes.includes(attribute)) &&
      <Button size="small" sx={{ alignSelf: 'flex-start', px: 0 }} onClick={() => setShowOptional(true)}>添加原因、分类等补充信息</Button>}
    {!isTrace && <TextField select fullWidth size="small" label="明细中另外显示（可选）" value={binding.detailFieldIds ?? []}
      SelectProps={{ multiple: true, renderValue: value => (value as string[]).map(id => fields.find(field => field.id === id)?.name ?? '已失效').join('、') }}
      onChange={event => { const detailFieldIds = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
        const next = { ...binding, detailFieldIds, rowKeyFieldId: undefined }; onChange({ detailFieldIds, rowKeyFieldId: undefined, enabled: projectionConfigurationIssues(document.model, next, definition).length === 0 }); }}>
      {fields.filter(field => field.status !== 'disabled' && ['text', 'number', 'singleSelect', 'multiSelect', 'datetime', 'reference'].includes(field.type)).map(field =>
        <MenuItem key={field.id} value={field.id}><Checkbox size="small" checked={binding.detailFieldIds?.includes(field.id) ?? false} /><ListItemText primary={field.name} /></MenuItem>)}
    </TextField>}
    {!isTrace && <Typography variant="caption" color="text.secondary">物料批号、单位可不填；展示列只在明细中显示，不改变合计。{binding.tableId ? '子表每行由系统自动定位。' : ''}</Typography>}
    {issues.length > 0 && <Alert severity="warning" sx={{ fontSize: 12 }}>{issues.join('；')}。请补齐后点击页面顶部“保存”。</Alert>}
    <Button size="small" color="error" sx={{ alignSelf: 'flex-start', px: 0 }} onClick={onRemove}>移除这项用途</Button>
  </Stack>;
}
