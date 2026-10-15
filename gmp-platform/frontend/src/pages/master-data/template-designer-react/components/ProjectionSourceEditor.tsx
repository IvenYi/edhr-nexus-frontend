import { Alert, Button, Collapse, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AdsClick from '@mui/icons-material/AdsClick';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
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
  const [addedTraceId, setAddedTraceId] = useState('');
  const [moreExpanded, setMoreExpanded] = useState(false);
  const picker = useProjectionCanvasPicker();
  useEffect(() => () => picker?.cancel(binding.id), [binding.id]);
  if (!document) return null;
  const fields = projectionSources(document.model, binding);
  const required = projectionRequiredAttributes(binding.modelId);
  const problems = projectionConfigurationProblems(document.model, binding, definition);
  const detailProblem = problems.find(problem => problem.attributeId === 'detailFieldIds');
  const issues = projectionConfigurationIssues(document.model, binding, definition).filter(issue => issue !== detailProblem?.message);
  const errorFor = (id: string) => showErrors ? problems.find(problem => problem.attributeId === id)?.message : undefined;
  const isTrace = binding.modelId === 'formTrace';
  const attributes = definition.attributes.filter(attribute => !isTrace || binding.sources[attribute.id] || attribute.id === addedTraceId);
  if (!isTrace) {
    const order = ['material', 'quantity', 'outputQuantity', 'goodQuantity', 'ngQuantity', 'workHours', 'unit', 'materialLotText', 'reportStartTime', 'reportEndTime', 'productionDate', 'reporter', 'category', 'reason', 'teamText', 'documentNumberText'];
    attributes.sort((left, right) => (order.indexOf(left.id) < 0 ? order.length : order.indexOf(left.id)) - (order.indexOf(right.id) < 0 ? order.length : order.indexOf(right.id)));
  }
  const visibleAttributes = attributes.filter(attribute => isTrace || required.includes(attribute.id)
    || binding.modelId === 'production' && ['outputQuantity', 'goodQuantity', 'ngQuantity'].includes(attribute.id)
    || binding.sources[attribute.id] || errorFor(attribute.id));
  const moreAttributes = attributes.filter(attribute => !visibleAttributes.includes(attribute));
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
  const renderSource = (attribute: ProjectionModel['attributes'][number]) => <Stack key={attribute.id} spacing={0.5}>
      <Stack direction="row" spacing={0.5} alignItems="flex-start">
      <TextField select fullWidth size="small"
      label={`${isTrace || attribute.id === 'workHours' ? attribute.name : attribute.name.replace(/（.*?）/g, '')}${required.includes(attribute.id) ? ' *' : ''}`} value={binding.sources[attribute.id] ?? ''}
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
    </Stack>;
  return <Stack spacing={1.5}>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">来源配置</Typography>
      <Tooltip title={isTrace ? '关联字段记录的信息。填报仍按原方式录入，查询时在追溯页面输入要查的值。'
        : `${binding.tableId ? '配置一次列含义，每行分别形成业务明细，由系统自动定位。' : '选择描述同一笔业务的字段；另一笔业务单独配置。'}${binding.modelId === 'production' ? '产出、良品、不良数量至少配置一项。产出可复用良品或不良的数字字段；最终产出需明确配置产出来源并填写与产品一致的单位。' : '物料、数量必须配置；物料批号、单位可不填。'}`}>
        <IconButton size="small" aria-label="来源配置说明"><InfoOutlined fontSize="small" /></IconButton>
      </Tooltip>
    </Stack>
    {isTrace && traceCandidates.length > 0 && <TextField select fullWidth size="small" label="添加追溯项" value={addedTraceId}
      error={showErrors && !Object.keys(binding.sources).length} helperText={showErrors && !Object.keys(binding.sources).length ? '选择追溯项后，再选择来源字段' : undefined}
      onChange={event => setAddedTraceId(event.target.value)}>
      <MenuItem value="">按需添加</MenuItem>
      {traceCandidates.map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name}</MenuItem>)}
    </TextField>}
    {missingAttributes.map(id => <Alert key={id} severity="warning" action={<ProjectionRemoveButton label="移除失效的来源配置" onClick={() => selectSource(id, '')} />}>追溯项或业务信息已失效，原来源：{fields.find(field => field.id === binding.sources[id])?.name ?? '来源字段已失效'}</Alert>)}
    {visibleAttributes.map(renderSource)}
    {moreAttributes.length > 0 && <>
      <Button size="small" color="inherit" aria-expanded={moreExpanded} startIcon={moreExpanded ? <ExpandMore /> : <ChevronRight />}
        sx={{ alignSelf: 'flex-start', color: 'text.secondary' }} onClick={() => { picker?.cancel(binding.id); setMoreExpanded(!moreExpanded); }}>更多业务字段</Button>
      <Collapse in={moreExpanded} unmountOnExit><Stack spacing={1.5}>{moreAttributes.map(renderSource)}</Stack></Collapse>
    </>}
    {detailProblem && <Alert severity="warning" action={<ProjectionRemoveButton label="移除失效的补充展示配置" onClick={() => {
      const detailFieldIds = (binding.detailFieldIds ?? []).filter(id => !projectionConfigurationProblems(document.model, { ...binding, detailFieldIds: [id] }, definition).some(problem => problem.attributeId === 'detailFieldIds'));
      const next = { ...binding, detailFieldIds }; onChange({ detailFieldIds, enabled: projectionConfigurationIssues(document.model, next, definition).length === 0 });
    }} />}>{detailProblem.message.replace('请重新选择', '请移除失效的配置')}</Alert>}
    {issues.length > 0 && !showErrors && <Alert severity="warning" sx={{ fontSize: 12 }}>{issues.join('；')}</Alert>}
  </Stack>;
}
