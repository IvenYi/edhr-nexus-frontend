import type { CanvasNode, ModelField } from '@/pages/master-data/template-designer-react/types';

/** Defaults become real input data when a user creates a row. Existing rows are never overwritten. */
export function newSubTableRow(columns: ModelField[], nodes: CanvasNode[]) {
  const row: Record<string, unknown> = { __rowId: crypto.randomUUID() };
  for (const field of columns) {
    const configured = nodes.find(node => node.bindings?.subTableFieldId === field.id)?.bindings?.defaultValue ?? field.typeConfig.defaultValue;
    if (configured == null || field.status === 'disabled') continue;
    if (field.type === 'text' && typeof configured === 'string') row[field.id] = configured;
    if (field.type === 'number' && String(configured).trim() && Number.isFinite(Number(configured))) row[field.id] = Number(configured);
    if (field.type === 'singleSelect' && typeof configured === 'string') {
      const raw = field.typeConfig.options;
      const options = Array.isArray(raw) ? raw.filter(option => option.status !== 'disabled') : String(raw ?? '').split('\n').filter(Boolean).map(line => {
        const [label, value] = line.split(':'); return { label, value: value ?? label };
      });
      const exact = options.find(option => option.value === configured);
      const labels = options.filter(option => option.label === configured);
      if (exact) row[field.id] = exact.value; else if (labels.length === 1) row[field.id] = labels[0].value;
    }
  }
  return row;
}
