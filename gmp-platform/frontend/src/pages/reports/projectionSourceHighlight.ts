import type { ProjectionBinding } from '@/pages/master-data/template-designer-react/types/model';

export interface SourceHit {
  tableId?: string;
  bindingId: string;
  rowKey: string;
  sources: Record<string, string>;
}

/** Resolve the saved identity in the displayed snapshot; never guess from a stale row index or value. */
export function sourceHighlight(hits: SourceHit[], values: Record<string, unknown>, bindings: ProjectionBinding[] = []) {
  const fields = new Set<string>();
  const rows = new Map<string, Set<number>>();
  for (const hit of hits) {
    if (!hit.tableId) { Object.values(hit.sources).forEach(id => fields.add(id)); continue; }
    const records = values[hit.tableId];
    if (!Array.isArray(records)) continue;
    const rowKeyField = bindings.find(binding => binding.id === hit.bindingId)?.rowKeyFieldId ?? '__rowId';
    const indexes = records.flatMap((record, index) => record && String(record[rowKeyField] ?? '') === hit.rowKey ? [index] : []);
    if (indexes.length !== 1) continue;
    if (!rows.has(hit.tableId)) rows.set(hit.tableId, new Set());
    rows.get(hit.tableId)!.add(indexes[0]);
  }
  return {
    rows: [...rows].flatMap(([tableId, indexes]) => [...indexes].map(rowIndex => ({ tableId, rowIndex }))),
    hasMainFields: fields.size > 0,
    isFieldHighlighted: (fieldId: string, tableId: string | undefined, rowIndex: number) => tableId ? Boolean(rows.get(tableId)?.has(rowIndex)) : fields.has(fieldId),
  };
}
