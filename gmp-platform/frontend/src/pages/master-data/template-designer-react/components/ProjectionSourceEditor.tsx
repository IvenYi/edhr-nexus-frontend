import { Alert, Button, Checkbox, IconButton, ListItemText, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AdsClick from '@mui/icons-material/AdsClick';
import { useEffect, useState } from 'react';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ProjectionBinding } from '../types/model';
import { acceptsProjectionAttribute, projectionConfigurationIssues, projectionConfigurationProblems, projectionRequiredAttributes, projectionSourceCandidates, projectionSources, type ProjectionModel } from '../utils/projectionConfiguration';
import ProjectionRemoveButton from './ProjectionRemoveButton';
import { useProjectionCanvasPicker } from './ProjectionCanvasPicker';

export default function ProjectionSourceEditor({ binding, definition, onChange, showErrors = false }: {
  binding: ProjectionBinding; definition: ProjectionModel; onChange: (patch: Partial<ProjectionBinding>) => void; showErrors?: boolean;
}) {
  const document = useTemplateDesignerStore(state => state.document);
  const [showOptional, setShowOptional] = useState(false);
  const [addedTraceId, setAddedTraceId] = useState('');
  const picker = useProjectionCanvasPicker();
  useEffect(() => () => picker?.cancel(binding.id), [binding.id]);
  if (!document) return null;
  const fields = projectionSources(document.model, binding);
  const required = projectionRequiredAttributes(binding.modelId);
  const issues = projectionConfigurationIssues(document.model, binding, definition);
  const problems = projectionConfigurationProblems(document.model, binding, definition);
  const errorFor = (id: string) => showErrors ? problems.find(problem => problem.attributeId === id)?.message : undefined;
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
    picker?.cancel();
    const sources = { ...binding.sources };
    if (fieldId) sources[attributeId] = fieldId; else delete sources[attributeId];
    if (fieldId && addedTraceId === attributeId) setAddedTraceId('');
    const next = { ...binding, sources, rowKeyFieldId: undefined };
    onChange({ sources, rowKeyFieldId: undefined, enabled: projectionConfigurationIssues(document.model, next, definition).length === 0 });
  };
  return <Stack spacing={1.5}>
    <Typography variant="body2" color="text.secondary">{isTrace ? '关联字段记录的信息。填报仍按原方式录入，查询时在追溯页面输入要查的值。' : binding.tableId ? '配置一次列含义，每行分别形成业务明细。' : '选择描述同一笔业务的字段；另一笔业务单独配置。'}</Typography>
    {isTrace && traceCandidates.length > 0 && <TextField select fullWidth size="small" label="添加追溯项" value={addedTraceId}
      error={showErrors && !Object.keys(binding.sources).length} helperText={showErrors && !Object.keys(binding.sources).length ? '选择追溯项后，再选择来源字段' : undefined}
      onChange={event => setAddedTraceId(event.target.value)}>
      <MenuItem value="">按需添加</MenuItem>
      {traceCandidates.map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name}</MenuItem>)}
    </TextField>}
    {missingAttributes.map(id => <Alert key={id} severity="warning" action={<ProjectionRemoveButton label="移除失效的来源配置" onClick={() => selectSource(id, '')} />}>追溯项或业务信息已失效，原来源：{fields.find(field => field.id === binding.sources[id])?.name ?? '来源字段已失效'}</Alert>)}
    {attributes.map(attribute => <Stack key={attribute.id} spacing={0.5}>
      <Stack direction="row" spacing={0.5} alignItems="flex-start">
      <TextField select fullWidth size="small"
      label={`${binding.modelId === 'formTrace' ? attribute.name : attribute.name.replace(/（.*?）/g, '')}${required.includes(attribute.id) ? ' *' : ''}`} value={binding.sources[attribute.id] ?? ''}
      error={Boolean(errorFor(attribute.id))} helperText={errorFor(attribute.id)}
      onChange={event => selectSource(attribute.id, event.target.value)}>
      <MenuItem value="">请选择来源{binding.tableId ? '列' : '字段'}</MenuItem>
      {!!binding.sources[attribute.id] && !fields.some(field => field.id === binding.sources[attribute.id] && acceptsProjectionAttribute(field, attribute)) &&
        <MenuItem value={binding.sources[attribute.id]}>来源已失效，请重新选择</MenuItem>}
      {projectionSourceCandidates(document.model, binding, attribute)
        .map(field => <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>)}
      </TextField>
      {!isTrace && picker && <Tooltip title={picker.request?.key === `${binding.id}/${attribute.id}` ? '取消选取（Esc）' : '从表单选取'}>
        <IconButton size="small" aria-label={`从表单选取${attribute.name}`} aria-pressed={picker.request?.key === `${binding.id}/${attribute.id}`}
          color={picker.request?.key === `${binding.id}/${attribute.id}` ? 'primary' : 'default'}
          onClick={() => picker.request?.key === `${binding.id}/${attribute.id}` ? picker.cancel() : picker.start({
            key: `${binding.id}/${attribute.id}`, label: attribute.name.replace(/（.*?）/g, ''),
            candidates: projectionSourceCandidates(document.model, binding, attribute).map(field => field.id),
            onPick: fieldId => selectSource(attribute.id, fieldId),
          })}><AdsClick fontSize="small" /></IconButton>
      </Tooltip>}
      </Stack>
      {picker?.request?.key === `${binding.id}/${attribute.id}` && <Typography role={picker.error ? 'alert' : 'status'} variant="caption" color={picker.error ? 'error.main' : 'primary.main'}>
        {picker.error || `请在表单中选择${picker.request.label}，Esc 取消`}
      </Typography>}
    </Stack>)}
    {!isTrace && definition.attributes.some(attribute => !attributes.includes(attribute)) &&
      <Button size="small" sx={{ alignSelf: 'flex-start', px: 0 }} onClick={() => setShowOptional(true)}>添加原因、分类等补充信息</Button>}
    {!isTrace && <TextField select fullWidth size="small" label="明细中另外显示（可选）" value={binding.detailFieldIds ?? []}
      error={Boolean(errorFor('detailFieldIds'))} helperText={errorFor('detailFieldIds')}
      SelectProps={{ multiple: true, renderValue: value => (value as string[]).map(id => fields.find(field => field.id === id)?.name ?? '已失效').join('、') }}
      onChange={event => { const detailFieldIds = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
        const next = { ...binding, detailFieldIds, rowKeyFieldId: undefined }; onChange({ detailFieldIds, rowKeyFieldId: undefined, enabled: projectionConfigurationIssues(document.model, next, definition).length === 0 }); }}>
      {fields.filter(field => field.status !== 'disabled' && ['text', 'number', 'singleSelect', 'multiSelect', 'datetime', 'reference'].includes(field.type)).map(field =>
        <MenuItem key={field.id} value={field.id}><Checkbox size="small" checked={binding.detailFieldIds?.includes(field.id) ?? false} /><ListItemText primary={field.name} /></MenuItem>)}
    </TextField>}
    {!isTrace && <Typography variant="caption" color="text.secondary">物料批号、单位可不填；展示列只在明细中显示，不改变合计。{binding.tableId ? '子表每行由系统自动定位。' : ''}</Typography>}
    {issues.length > 0 && !showErrors && <Alert severity="warning" sx={{ fontSize: 12 }}>{issues.join('；')}</Alert>}
  </Stack>;
}
