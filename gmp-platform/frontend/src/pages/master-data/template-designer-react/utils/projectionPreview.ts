import type { ModelDesignState, ModelField } from '../types/model';

export function previewSampleKey(tableId: string | undefined, rowIndex: number, fieldId: string) {
  return `${tableId ?? ''}/${rowIndex}/${fieldId}`;
}

/** Build independent rows from one shared column configuration; never mutate the template. */
export function buildProjectionPreviewValues(model: ModelDesignState, samples: Record<string, string>,
  rowCounts: Record<string, number>, materials: { id: string; name: string }[]) {
  const values: Record<string, unknown> = {};
  const assigned = new Map<string, Set<string>>();
  model.projection?.bindings.filter(binding => binding.enabled).forEach(binding => {
    const region = binding.tableId ?? '';
    const ids = assigned.get(region) ?? new Set<string>();
    Object.values(binding.sources).forEach(id => ids.add(id));
    if (binding.rowKeyFieldId) ids.add(binding.rowKeyFieldId);
    assigned.set(region, ids);
  });
  assigned.forEach((ids, region) => {
    const fields = region ? (model.fields.find(field => field.id === region)?.typeConfig.columns as ModelField[] | undefined) ?? [] : model.fields;
    const rows = Array.from({ length: region ? rowCounts[region] ?? 2 : 1 }, (_, rowIndex) => {
      const row: Record<string, unknown> = {};
      ids.forEach(id => {
        const field = fields.find(item => item.id === id);
        const sample = samples[previewSampleKey(region, rowIndex, id)] ?? '';
        row[id] = field?.type === 'number' ? (sample === '' ? null : Number(sample))
          : field?.type === 'reference' ? materials.find(material => material.id === sample) ?? null : sample;
      });
      return row;
    });
    if (region) values[region] = rows; else Object.assign(values, rows[0]);
  });
  return values;
}
