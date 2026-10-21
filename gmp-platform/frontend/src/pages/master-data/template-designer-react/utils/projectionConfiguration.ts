import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import type { ModelField, ModelDesignState, ProjectionBinding } from '../types/model';

export interface ProjectionAttribute { id: string; name: string; type: string; referenceSources?: string[] }
export interface ProjectionModel { id: string; name: string; attributes: ProjectionAttribute[] }
export interface ProjectionCatalog { version: string; models: ProjectionModel[]; notice: string }
export interface ProjectionPreviewRecord { bindingId: string; rowKey: string; modelId: string; tableId: string; attributes: Record<string, unknown>; sources: Record<string, string> }

export function useProjectionCatalog() {
  return useQuery({ queryKey: ['form-projection-catalog'], queryFn: async () =>
    (await client.get('/master-data/template-modeling/projection-catalog')).data.data as ProjectionCatalog, staleTime: 0 });
}

function acceptsReferenceSources(config: ModelField['typeConfig'], allowed: string[]) {
  const source = String(config.sourceType);
  if (allowed.includes(source)) return true;
  if (source === 'material') return config.referenceMaterialScope === 'product' && allowed.includes('product');
  if (source !== 'productionObject') return false;
  switch (config.referenceProductionScope ?? 'all') {
    case 'batch': return allowed.includes('productionBatch');
    case 'sn': return allowed.includes('serialNumber');
    case 'all': return allowed.includes('productionBatch') && allowed.includes('serialNumber');
    default: return false;
  }
}

export function acceptsProjectionAttribute(field: ModelField, attribute: ProjectionAttribute) {
  if (field.status === 'disabled') return false;
  if (attribute.id === 'reporter') return field.type === 'signature' || field.type === 'reference' && field.typeConfig.sourceType === 'user';
  if (attribute.type === 'number') return field.type === 'number';
  if (attribute.type === 'date' || attribute.type === 'datetime') return field.type === 'datetime'
    && (field.typeConfig.mode ?? 'datetime') === attribute.type;
  if (attribute.type === 'reference') return field.type === 'reference' && field.typeConfig.multiple !== true
    && acceptsReferenceSources(field.typeConfig, attribute.referenceSources ?? ['material']);
  if (field.type === 'reference') return (attribute.id === 'unit' && field.typeConfig.sourceType === 'dictionary')
    || acceptsReferenceSources(field.typeConfig, attribute.referenceSources ?? []);
  return field.type === 'text' || field.type === 'singleSelect';
}

export function projectionTableId(id?: string): string {
  // Match the interpreter's String.isBlank main-table identity; nonblank IDs stay exact.
  const value = id ?? '';
  return /^[\u0009-\u000d\u001c-\u0020\u1680\u2000-\u2006\u2008-\u200a\u2028\u2029\u205f\u3000]*$/.test(value) ? '' : value;
}

export function projectionSources(model: ModelDesignState, binding: Pick<ProjectionBinding, 'tableId'>): ModelField[] {
  const tableId = projectionTableId(binding.tableId);
  return tableId
    ? (model.fields.find(field => field.id === tableId)?.typeConfig.columns as ModelField[] | undefined) ?? []
    : model.fields.filter(field => field.type !== 'subTable');
}

export function projectionSourceSummary(model: ModelDesignState, binding: ProjectionBinding) {
  const fields = projectionSources(model, binding);
  return [...new Set(Object.values(binding.sources).map(id => fields.find(field => field.id === id)?.name ?? '来源字段已失效'))].join('、') || '待选择来源';
}

export function projectionBindingLabel(model: ModelDesignState, binding: ProjectionBinding, definition?: ProjectionModel) {
  const name = definition?.name ?? '已失效用途';
  if (binding.tableId || binding.modelId === 'formTrace') return name;
  const items = (model.projection?.bindings ?? []).filter(item => item.modelId === binding.modelId && !item.tableId);
  return `${projectionDetailName(binding.modelId)} ${items.findIndex(item => item.id === binding.id) + 1}`;
}

export function projectionDetailName(modelId: string) {
  return ({ consumption: '消耗明细', scrap: '报废明细', production: '报工记录', defect: '不良明细' } as Record<string, string>)[modelId] ?? '业务明细';
}

export function projectionSourceCandidates(model: ModelDesignState, binding: ProjectionBinding, attribute: ProjectionAttribute) {
  return projectionSources(model, binding).filter(field => acceptsProjectionAttribute(field, attribute)
    && (binding.modelId !== 'formTrace' || binding.sources[attribute.id] === field.id
      || !traceFieldAssignments(model, field.id, binding.tableId).some(item => item.binding.id !== binding.id))
    && (binding.modelId === 'formTrace' && binding.sources[attribute.id] === field.id
      || !Object.entries(binding.sources).some(([id, source]) => id !== attribute.id && source === field.id && !canShareOutputSource(binding.modelId, id, attribute.id))));
}

export function traceFieldAssignments(model: ModelDesignState, fieldId: string, tableId?: string) {
  return (model.projection?.bindings ?? []).filter(binding => binding.modelId === 'formTrace' && projectionTableId(binding.tableId) === projectionTableId(tableId))
    .flatMap(binding => Object.entries(binding.sources).filter(([, source]) => source === fieldId).map(([attributeId]) => ({ binding, attributeId })));
}

function canShareOutputSource(modelId: string, left: string, right: string) {
  return modelId === 'production' && [left, right].includes('outputQuantity')
    && [left, right].every(id => ['outputQuantity', 'goodQuantity', 'ngQuantity'].includes(id));
}

export function projectionSourceRoles(model: ModelDesignState, binding: ProjectionBinding, definition?: ProjectionModel) {
  const fields = projectionSources(model, binding);
  return Object.entries(binding.sources).map(([id, source]) => ({
    id,
    role: definition?.attributes.find(attribute => attribute.id === id)?.name.replace(/（.*?）/g, '') ?? '已失效角色',
    field: fields.find(field => field.id === source)?.name ?? '来源字段已失效',
  }));
}

export function projectionRequiredAttributes(modelId: string) {
  return modelId === 'production' || modelId === 'formTrace' ? [] : modelId === 'defect' ? ['reason', 'quantity'] : ['material', 'quantity'];
}

export interface ProjectionConfigurationProblem { attributeId?: string; message: string }

export function projectionConfigurationProblems(model: ModelDesignState, binding: ProjectionBinding, definition?: ProjectionModel): ProjectionConfigurationProblem[] {
  if (!definition) return [{ message: '用途已失效，请移除或重新配置' }];
  const fields = projectionSources(model, binding);
  const issues: ProjectionConfigurationProblem[] = [];
  const name = (id: string) => definition.attributes.find(attribute => attribute.id === id)?.name.replace(/（.*?）/g, '') ?? id;
  const tableId = projectionTableId(binding.tableId);
  if (tableId) {
    const table = model.fields.find(field => field.id === tableId && field.type === 'subTable');
    if (!table || table.status === 'disabled') issues.push({ message: '子表来源已失效' });
  }
  for (const id of projectionRequiredAttributes(binding.modelId)) {
    if (!binding.sources[id]) issues.push({ attributeId: id, message: `请选择“${name(id)}”的来源${tableId ? '列' : '字段'}` });
  }
  if (binding.modelId === 'production' && !binding.sources.outputQuantity && !binding.sources.goodQuantity && !binding.sources.ngQuantity)
    issues.push(...['outputQuantity', 'goodQuantity', 'ngQuantity'].map(attributeId => ({ attributeId, message: '产出、良品、不良数量至少配置一项来源' })));
  if (!Object.keys(binding.sources).length && binding.modelId === 'formTrace') issues.push({ message: '请选择至少一个追溯项及来源字段' });
  for (const [attributeId, fieldId] of Object.entries(binding.sources)) {
    const attribute = definition.attributes.find(item => item.id === attributeId);
    const field = fields.find(item => item.id === fieldId);
    if (!attribute || !field || !acceptsProjectionAttribute(field, attribute))
      issues.push({ attributeId, message: `“${name(attributeId)}”的来源${field ? `“${field.name}”类型不匹配` : '已失效'}，请重新选择` });
    if (binding.modelId === 'formTrace' && (Object.values(binding.sources).filter(source => source === fieldId).length > 1
      || traceFieldAssignments(model, fieldId, binding.tableId).some(item => item.binding.id !== binding.id)))
      issues.push({ attributeId, message: `“${field?.name ?? fieldId}”关联了多个追溯配置，每个字段最多关联一个追溯项，请手动移除多余关联或更换来源` });
    const otherRole = Object.entries(binding.sources).find(([id, source]) => id !== attributeId && source === fieldId && !canShareOutputSource(binding.modelId, id, attributeId));
    if (otherRole) issues.push({ attributeId, message: `“${name(attributeId)}”与“${name(otherRole[0])}”不能使用同一个来源字段` });
    if (attribute?.type === 'number' && (model.projection?.bindings ?? []).some(other => other.id !== binding.id && other.modelId === binding.modelId
      && (other.tableId ?? '') === (binding.tableId ?? '') && Object.entries(other.sources).some(([id, source]) => source === fieldId && definition.attributes.some(item => item.id === id && item.type === 'number'))))
      issues.push({ attributeId, message: `“${field?.name ?? name(attributeId)}”已用于另一笔${definition.name}，请选择独立数量来源或移除重复业务` });
  }
  if ((binding.detailFieldIds ?? []).some(id => !fields.some(field => field.id === id && field.status !== 'disabled'
    && ['text', 'number', 'singleSelect', 'multiSelect', 'datetime', 'reference'].includes(field.type)))) issues.push({ attributeId: 'detailFieldIds', message: '明细展示字段已失效，请重新选择' });
  return issues;
}

export function projectionConfigurationIssues(model: ModelDesignState, binding: ProjectionBinding, definition?: ProjectionModel) {
  return [...new Set(projectionConfigurationProblems(model, binding, definition).map(issue => issue.message))];
}
