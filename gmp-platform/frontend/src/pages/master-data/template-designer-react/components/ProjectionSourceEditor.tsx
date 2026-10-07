import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
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
    : showOptional || required.includes(attribute.id) || (binding.modelId === 'production' && ['goodQuantity', 'ngQuantity'].includes(attribute.id)) || binding.sources[attribute.id]);
  const missingAttributes = Object.keys(binding.sources).filter(id => !definition.attributes.some(attribute => attribute.id === id));
  const traceCandidates = definition.attributes.filter(attribute => !binding.sources[attribute.id]
    && fields.some(field => acceptsProjectionAttribute(field, attribute) && !Object.values(binding.sources).includes(field.id)));
  const selectSource = (attributeId: string, fieldId: string) => {
    const sources = { ...binding.sources };
    if (fieldId) sources[attributeId] = fieldId; else delete sources[attributeId];
    if (fieldId && addedTraceId === attributeId) setAddedTraceId('');
    onChange({ sources });
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
    {binding.tableId && <Box sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">子表行定位（现有版本要求）</Typography>
      <TextField select fullWidth size="small" label="每行唯一字段" value={binding.rowKeyFieldId ?? ''} sx={{ mt: 1 }}
        onChange={event => onChange({ rowKeyFieldId: event.target.value })}>
        <MenuItem value="">请选择</MenuItem>
        {fields.filter(field => acceptsProjectionAttribute(field, { id: 'rowKey', name: '', type: 'text' })).map(field =>
          <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>)}
      </TextField>
    </Box>}
    {issues.length > 0 && <Alert severity="warning" sx={{ fontSize: 12 }}>{issues.join('；')}。可先保存配置草稿，补齐后启用。</Alert>}
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <FormControlLabel sx={{ m: 0 }} control={<Checkbox size="small" checked={binding.enabled} disabled={!binding.enabled && issues.length > 0}
        onChange={(_, enabled) => onChange({ enabled })} />} label={<Typography variant="body2" sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>启用此用途</Typography>} />
      <Button size="small" color="error" sx={{ minWidth: 0, px: 1, flexShrink: 0, whiteSpace: 'nowrap' }} onClick={onRemove}>移除用途</Button>
    </Stack>
  </Stack>;
}
