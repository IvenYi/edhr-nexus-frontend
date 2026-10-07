import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import type { ModelField, ModelDesignState, ProjectionBinding } from '../types/model';

export interface ProjectionAttribute { id: string; name: string; type: string }
export interface ProjectionModel { id: string; name: string; attributes: ProjectionAttribute[] }
export interface ProjectionCatalog { version: string; models: ProjectionModel[]; notice: string }
export interface ProjectionPreviewRecord { bindingId: string; rowKey: string; modelId: string; tableId: string; attributes: Record<string, unknown>; sources: Record<string, string> }

export function useProjectionCatalog() {
  return useQuery({ queryKey: ['form-projection-catalog'], queryFn: async () =>
    (await client.get('/master-data/template-modeling/projection-catalog')).data.data as ProjectionCatalog, staleTime: 0 });
}

export function acceptsProjectionAttribute(field: ModelField, attribute: ProjectionAttribute) {
  if (field.status === 'disabled') return false;
  if (attribute.type === 'number') return field.type === 'number';
  if (attribute.type === 'reference') return field.type === 'reference' && field.typeConfig.sourceType === 'material';
  return field.type === 'text' || field.type === 'singleSelect';
}

export function projectionSources(model: ModelDesignState, binding: Pick<ProjectionBinding, 'tableId'>): ModelField[] {
  return binding.tableId
    ? (model.fields.find(field => field.id === binding.tableId)?.typeConfig.columns as ModelField[] | undefined) ?? []
    : model.fields.filter(field => field.type !== 'subTable');
}

export function projectionSourceSummary(model: ModelDesignState, binding: ProjectionBinding) {
  const fields = projectionSources(model, binding);
  return [...new Set(Object.values(binding.sources).map(id => fields.find(field => field.id === id)?.name ?? '来源字段已失效'))].join('、') || '待选择来源';
}

export function projectionRequiredAttributes(modelId: string) {
  return modelId === 'production' ? ['unit'] : modelId === 'formTrace' ? [] : ['material', 'materialLotText', 'quantity', 'unit'];
}

export function projectionConfigurationIssues(model: ModelDesignState, binding: ProjectionBinding, definition?: ProjectionModel) {
  if (!definition) return ['用途目录不可用'];
  const fields = projectionSources(model, binding);
  const issues: string[] = [];
  if (binding.tableId) {
    const table = model.fields.find(field => field.id === binding.tableId && field.type === 'subTable');
    if (!table || table.status === 'disabled') issues.push('子表来源已失效');
    const rowKey = fields.find(field => field.id === binding.rowKeyFieldId);
    if (!rowKey || !acceptsProjectionAttribute(rowKey, { id: 'rowKey', name: '', type: 'text' })) issues.push('尚未设置有效的子表行定位');
  }
  for (const id of projectionRequiredAttributes(binding.modelId)) {
    if (!binding.sources[id]) issues.push(`待配置${definition.attributes.find(attribute => attribute.id === id)?.name ?? id}`);
  }
  if (binding.modelId === 'production' && !binding.sources.goodQuantity && !binding.sources.ngQuantity) issues.push('待配置报工数量');
  if (!Object.keys(binding.sources).length) issues.push('待选择来源字段');
  for (const [attributeId, fieldId] of Object.entries(binding.sources)) {
    const attribute = definition.attributes.find(item => item.id === attributeId);
    const field = fields.find(item => item.id === fieldId);
    if (!attribute || !field || !acceptsProjectionAttribute(field, attribute)) issues.push('存在失效或类型不匹配的来源');
  }
  return [...new Set(issues)];
}
