import type { CanvasNode, ModelField, ModelFieldOption, TemplateDesignerDocument } from '@/pages/master-data/template-designer-react/types';

export const isChoiceField = (field: ModelField) => field.type === 'singleSelect' || field.type === 'multiSelect';

export function parseChoiceOption(line: string, index = 0) {
  const [rawLabel, rawValue] = line.split(':');
  const label = rawLabel.trim() || `选项${index + 1}`;
  return { label, value: rawValue?.trim() || label };
}

/** Materialize the two presets already displayed by newly placed choice controls. */
export function defaultChoiceOptions(): ModelFieldOption[] {
  return [1, 2].map(index => ({ id: `option-${index}`, label: `选项${index}`, value: `选项${index}`, sortOrder: index, status: 'enabled' }));
}

export function choiceOptionList(field: ModelField) {
  const raw = field.typeConfig.options;
  if (!Array.isArray(raw)) return typeof raw === 'string' ? raw : '';
  return (raw as ModelFieldOption[]).filter(option => option.status !== 'disabled')
    .map(option => option.label === option.value ? option.label : `${option.label}:${option.value}`).join('\n');
}

export function choiceWidgetConfig(field: ModelField, widget?: Record<string, unknown>) {
  return isChoiceField(field) ? { ...widget, optionList: choiceOptionList(field) } : widget;
}

function optionsFromText(text: string, previous: ModelFieldOption[]) {
  const rows = text.trim() ? text.split('\n').map(line => line.trim()).filter(Boolean).map(parseChoiceOption) : defaultChoiceOptions();
  const used = new Set<string>();
  const options: ModelFieldOption[] = rows.map((row, index) => {
    const existing = previous.find(option => option.value === row.value && !used.has(option.id));
    const id = existing?.id || crypto.randomUUID();
    used.add(id);
    return { ...existing, ...row, id, sortOrder: index + 1, status: 'enabled' };
  });
  // Disabled definitions have no row in the active widget editor; retain their metadata.
  return [...options, ...previous.filter(option => option.status === 'disabled' && !options.some(current => current.value === option.value))];
}

/** One current-document command owns the canonical options and every placement. */
export function syncChoiceOptions(document: TemplateDesignerDocument, nodeId: string, previousDocument: TemplateDesignerDocument): TemplateDesignerDocument {
  const flatten = (nodes: CanvasNode[]): CanvasNode[] => nodes.flatMap(node => [node, ...flatten(node.children ?? [])]);
  const node = document.canvas.pages.flatMap(page => flatten(page.nodes)).find(item => item.id === nodeId);
  if (!node) return document;
  const previousNode = previousDocument.canvas.pages.flatMap(page => flatten(page.nodes)).find(item => item.id === nodeId);
  if (node.bindings?.widgetConfig?.optionList === previousNode?.bindings?.widgetConfig?.optionList) return document;
  const tableId = node.bindings?.subTableId;
  const fieldId = node.bindings?.subTableFieldId ?? node.bindings?.fieldId;
  const parent = tableId ? document.model.fields.find(field => field.id === tableId) : undefined;
  const columns = Array.isArray(parent?.typeConfig.columns) ? parent.typeConfig.columns as ModelField[] : [];
  const field = (tableId ? columns : document.model.fields).find(item => item.id === fieldId);
  if (!field || !isChoiceField(field)) return document;
  const text = node.bindings?.widgetConfig?.optionList;
  const previous = Array.isArray(field.typeConfig.options) ? field.typeConfig.options as ModelFieldOption[] : [];
  const options = typeof text === 'string' ? optionsFromText(text, previous) : field.typeConfig.options;
  const updated = { ...field, typeConfig: { ...field.typeConfig, options } };
  // Keep the edited text while typing (including a trailing colon or empty row).
  const optionList = typeof text === 'string' ? text : choiceOptionList(updated);
  const syncNodes = (nodes: CanvasNode[]): CanvasNode[] => nodes.map(item => {
    const match = (item.bindings?.subTableFieldId ?? item.bindings?.fieldId) === fieldId && item.bindings?.subTableId === tableId;
    return { ...item, ...(item.children ? { children: syncNodes(item.children) } : {}), ...(match ? { bindings: {
      ...item.bindings, ...(tableId ? { subTableField: updated } : {}),
      widgetConfig: { ...item.bindings?.widgetConfig, optionList },
    } } : {}) };
  });
  return { ...document, model: { ...document.model, fields: document.model.fields.map(item =>
    item.id === tableId ? { ...item, typeConfig: { ...item.typeConfig, columns: columns.map(column => column.id === fieldId ? updated : column) } }
      : !tableId && item.id === fieldId ? updated : item) },
    canvas: { ...document.canvas, pages: document.canvas.pages.map(page => ({ ...page, nodes: syncNodes(page.nodes) })) } };
}
