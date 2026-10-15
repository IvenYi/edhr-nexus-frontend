import type { ModelField } from '@/pages/master-data/template-designer-react/types';

// Controls retain text while typing; persisted number fields use JSON numbers.
export function executionFormValues(fields: ModelField[], values: Record<string, unknown>): Record<string, unknown> {
  const result = { ...values };
  for (const field of fields) {
    const value = values[field.id];
    if (field.type === 'number' && typeof value === 'string' && value.trim()) {
      const text = value.trim();
      if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text) && Number.isFinite(Number(text))) result[field.id] = Number(text);
    } else if (field.type === 'subTable' && Array.isArray(value) && Array.isArray(field.typeConfig.columns)) {
      result[field.id] = value.map(row => row && typeof row === 'object' && !Array.isArray(row)
        ? executionFormValues(field.typeConfig.columns as ModelField[], row as Record<string, unknown>) : row);
    }
  }
  return result;
}
