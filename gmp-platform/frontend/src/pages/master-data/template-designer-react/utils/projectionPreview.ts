import type { ModelDesignState, ModelField } from '../types/model';
import { referenceConditions } from '@/components/form-renderer/referenceConfig';

export function previewSampleKey(tableId: string | undefined, rowIndex: number, fieldId: string) {
  return `${tableId ?? ''}/${rowIndex}/${fieldId}`;
}

export function projectionPreviewFieldIds(model: ModelDesignState) {
  const assigned = new Map<string, Set<string>>();
  const add = (region: string, id: string) => {
    const ids = assigned.get(region) ?? new Set<string>();
    if (ids.has(id)) return;
    ids.add(id); assigned.set(region, ids);
    const columns = region ? (model.fields.find(field => field.id === region)?.typeConfig.columns as ModelField[] | undefined) ?? [] : model.fields;
    const field = columns.find(item => item.id === id);
    if (field?.type === 'reference') referenceConditions(field).forEach(condition => {
      if (condition.targetFieldId) add(columns.some(column => column.id === condition.targetFieldId) ? region : '', condition.targetFieldId);
    });
  };
  model.projection?.bindings.filter(binding => binding.enabled).forEach(binding => {
    const region = binding.tableId ?? '';
    Object.values(binding.sources).forEach(id => add(region, id));
    if (binding.rowKeyFieldId) add(region, binding.rowKeyFieldId);
  });
  return assigned;
}

/** Build independent rows from one shared column configuration; never mutate the template. */
export function buildProjectionPreviewValues(model: ModelDesignState, samples: Record<string, unknown>,
  rowCounts: Record<string, number>) {
  const values: Record<string, unknown> = {};
  const assigned = projectionPreviewFieldIds(model);
  assigned.forEach((ids, region) => {
    const fields = region ? (model.fields.find(field => field.id === region)?.typeConfig.columns as ModelField[] | undefined) ?? [] : model.fields;
    const rows = Array.from({ length: region ? rowCounts[region] ?? 2 : 1 }, (_, rowIndex) => {
      const row: Record<string, unknown> = {};
      ids.forEach(id => {
        const field = fields.find(item => item.id === id);
        const sample = samples[previewSampleKey(region, rowIndex, id)] ?? '';
        row[id] = field?.type === 'number' ? (sample === '' ? null : Number(sample))
          : field?.type === 'reference' ? (sample && typeof sample === 'object' ? sample : null) : sample;
      });
      return row;
    });
    if (region) values[region] = rows; else Object.assign(values, rows[0]);
  });
  return values;
}
