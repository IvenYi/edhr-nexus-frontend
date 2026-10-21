import type { ModelField, TemplateDesignerDocument, CanvasNode } from '@/pages/master-data/template-designer-react/types';
import { referenceFields } from './referencePresentation';
import { resolveReferenceField } from './referenceConfig';

const targetTypes = ['text', 'number', 'datetime', 'singleSelect', 'reference'];
export function referenceConditionSourceFields(config: Record<string, unknown>) {
  const source = String(config.sourceType);
  const extras = ['material', 'product', 'equipment', 'productionBatch', 'serialNumber', 'productionObject', 'workOrder', 'defectReason', 'scrapReason'].includes(source) ? ['status'] : [];
  if (['productionBatch', 'serialNumber', 'productionObject'].includes(source)) extras.push('name', 'specification');
  if (source === 'workOrder') extras.push('name');
  if (source === 'productionObject') extras.push('objectType');
  if (source === 'user') extras.push('departmentIds', 'departmentName');
  return [...referenceFields(config).map(item => item.value), ...extras];
}

export function referenceConditionIssue(config: Record<string, unknown>, fieldId: string, fields: ModelField[], condition: { sourceField?: string; operator?: string; targetFieldId?: string }) {
  if (!condition.sourceField && !condition.targetFieldId) return '';
  if (!condition.sourceField || !condition.targetFieldId) return '请完整选择查询条件两侧字段';
  if (!referenceConditionSourceFields(config).includes(condition.sourceField)) return '引用表中的字段不适用于当前引用对象';
  if (!['eq', 'ne', 'contains', 'notContains'].includes(condition.operator ?? 'eq')) return '比较方式已失效';
  const target = fields.find(item => item.id === condition.targetFieldId);
  if (!target || target.status !== 'enabled' || !targetTypes.includes(target.type) || target.typeConfig.multiple === true || target.id === fieldId) return '当前表中的字段已失效或不支持查询';
  return '';
}

/** Validate model fields and effective canvas overrides before either save entry point. */
export function referenceConfigurationIssues(document: TemplateDesignerDocument): string[] {
  const issues = new Set<string>();
  const check = (field: ModelField, candidates: ModelField[]) => {
    if (field.type !== 'reference' || field.status === 'disabled') return;
    const config = field.typeConfig;
    if (config.sourceType === 'material' && config.referenceMaterialScope === 'types' && (!Array.isArray(config.referenceMaterialTypeIds) || !config.referenceMaterialTypeIds.length)) issues.add(`${field.name}：请选择物料类型`);
    for (const condition of Array.isArray(config.referenceQueryConditions) ? config.referenceQueryConditions : []) {
      const issue = referenceConditionIssue(config, field.id, candidates, condition);
      if (issue) issues.add(`${field.name}：${issue}`);
    }
  };
  const main = document.model.fields;
  for (const field of main) {
    check(field, main);
    if (field.type === 'subTable' && field.status !== 'disabled') {
      const columns = (field.typeConfig.columns ?? []) as ModelField[];
      columns.forEach(column => check(column, [...main, ...columns]));
    }
  }
  const visit = (nodes: CanvasNode[]) => nodes.forEach(node => {
    const table = main.find(item => item.id === node.bindings?.subTableId);
    const columns = (table?.typeConfig.columns ?? []) as ModelField[];
    const field = table ? columns.find(item => item.id === node.bindings?.subTableFieldId) ?? node.bindings?.subTableField : main.find(item => item.id === node.bindings?.fieldId);
    if (field && table?.status !== 'disabled') check(resolveReferenceField(field, node), [...main, ...columns]);
    visit(node.children ?? []);
  });
  document.canvas.pages.forEach(page => visit(page.nodes));
  return [...issues];
}
