import type { CanvasNode, ModelField, TemplateDesignerDocument } from '@/pages/master-data/template-designer-react/types';

export interface ReferenceValue { id: string; name: string }
export interface ReferenceCondition { sourceField: string; operator: string; targetFieldId: string }
export function referenceConditions(field: ModelField): ReferenceCondition[] {
  const raw = field.typeConfig.referenceQueryConditions;
  return Array.isArray(raw) ? raw.filter(item => item && (item.sourceField || item.targetFieldId)) : [];
}

export function resolveReferenceField(field: ModelField, node: CanvasNode): ModelField {
  if (field.type !== 'reference') return field;
  const widget = node.bindings?.widgetConfig ?? {};
  const config = { ...field.typeConfig };
  if ('referenceSourceType' in widget) config.sourceType = widget.referenceSourceType;
  for (const key of ['referenceField', 'referenceQueryConditions']) if (key in widget) config[key] = widget[key];
  return { ...field, typeConfig: config };
}

/** Synchronize all placements of the same field in the same undo step. */
export function syncReferenceConfig(document: TemplateDesignerDocument, nodeId: string): TemplateDesignerDocument {
  const flatten = (nodes: CanvasNode[]): CanvasNode[] => nodes.flatMap(node => [node, ...flatten(node.children ?? [])]);
  const node = document.canvas.pages.flatMap(page => flatten(page.nodes)).find(item => item.id === nodeId);
  if (!node) return document;
  const tableId = node.bindings?.subTableId;
  const id = node.bindings?.subTableFieldId ?? node.bindings?.fieldId;
  const parent = tableId ? document.model.fields.find(field => field.id === tableId) : undefined;
  const columns = Array.isArray(parent?.typeConfig.columns) ? parent.typeConfig.columns as ModelField[] : [];
  const field = (tableId ? columns : document.model.fields).find(field => field.id === id) ?? node.bindings?.subTableField;
  if (!field || field.type !== 'reference') return document;
  const resolved = resolveReferenceField(field, node);
  const fields = document.model.fields.map(item => item.id === tableId ? { ...item, typeConfig: { ...item.typeConfig, columns: columns.map(column => column.id === id ? resolved : column) } } : !tableId && item.id === id ? resolved : item);
  const syncNodes = (nodes: CanvasNode[]): CanvasNode[] => nodes.map(item => {
    const match = (item.bindings?.subTableFieldId ?? item.bindings?.fieldId) === id && item.bindings?.subTableId === tableId;
    return { ...item, ...(item.children ? { children: syncNodes(item.children) } : {}), ...(match ? { bindings: { ...item.bindings,
      ...(tableId ? { subTableField: resolved } : {}),
      widgetConfig: { ...item.bindings?.widgetConfig, referenceSourceType: resolved.typeConfig.sourceType, referenceField: resolved.typeConfig.referenceField ?? '', referenceQueryConditions: resolved.typeConfig.referenceQueryConditions ?? [] },
    } } : {}) };
  });
  return { ...document, model: { ...document.model, fields }, canvas: { ...document.canvas, pages: document.canvas.pages.map(page => ({ ...page, nodes: syncNodes(page.nodes) })) } };
}

export function referenceDependencyValues(field: ModelField, values: Record<string, unknown>) {
  return Object.fromEntries(referenceConditions(field).map(condition => [condition.targetFieldId, values[condition.targetFieldId] ?? null]));
}

export function mockReferenceValues(document: TemplateDesignerDocument, values: Record<string, unknown>, node: CanvasNode, valueKey: string) {
  const context: Record<string, unknown> = {};
  const visit = (nodes: CanvasNode[], pageId: string) => nodes.forEach(item => {
    if (item.bindings?.fieldId && !item.bindings.subTableId) context[item.bindings.fieldId] = values[`${pageId}:${item.id}`] ?? item.bindings.defaultValue ?? '';
    visit(item.children ?? [], pageId);
  });
  document.canvas.pages.forEach(page => visit(page.nodes, page.id));
  if (node.bindings?.subTableId) {
    const prefix = valueKey.slice(0, valueKey.lastIndexOf(':') + 1);
    const table = document.model.fields.find(field => field.id === node.bindings?.subTableId);
    const columns = Array.isArray(table?.typeConfig.columns) ? table.typeConfig.columns as ModelField[] : [];
    columns.forEach(field => { context[field.id] = values[`${prefix}${field.id}`] ?? ''; });
  }
  return context;
}

export function updateMockFieldValue<T>(document: TemplateDesignerDocument, values: Record<string, T>, key: string, value: T): Record<string, T> {
  const placements: Array<{ key: string; fieldId: string }> = [];
  const visit = (nodes: CanvasNode[], pageId: string) => nodes.forEach(node => {
    if (node.bindings?.fieldId && !node.bindings.subTableId) placements.push({ key: `${pageId}:${node.id}`, fieldId: node.bindings.fieldId });
    visit(node.children ?? [], pageId);
  });
  document.canvas.pages.forEach(page => visit(page.nodes, page.id));
  const fieldId = placements.find(item => item.key === key)?.fieldId;
  const next = { ...values, [key]: value };
  if (fieldId) placements.filter(item => item.fieldId === fieldId).forEach(item => { next[item.key] = value; });
  return next;
}
