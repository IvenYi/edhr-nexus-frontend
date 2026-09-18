import type { ModelField } from '@/pages/master-data/template-designer-react/types';

/** Signatures attest to content; adding another signature does not change that content. */
export function signatureContent(fields: ModelField[], values: Record<string, unknown>): string {
  const content = { ...values };
  for (const field of fields) {
    if (field.type === 'signature') delete content[field.id];
    if (field.type === 'subTable' && Array.isArray(content[field.id])) {
      const columns = Array.isArray(field.typeConfig.columns) ? field.typeConfig.columns as ModelField[] : [];
      content[field.id] = (content[field.id] as Record<string, unknown>[]).map(row => JSON.parse(signatureContent(columns, row)));
    }
  }
  return JSON.stringify(content, (_, value) => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))) : value);
}
