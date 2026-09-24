import type { DhrEvidenceRecord, DhrSummaryPlacement } from '@/api/dhr-instances';
import { placeSummaryRecord } from './summaryPlacementOrder';

export interface SummarySourceGroup {
  key: string;
  originKind: 'WORK' | 'CUSTOM';
  records: DhrEvidenceRecord[];
}

export function summarySourceKey(record: DhrEvidenceRecord): string {
  // formId identifies a work form node or one custom-form attachment; templateId does not.
  if (!record.operationId || !record.formId) return JSON.stringify([record.originKind, record.id]);
  return JSON.stringify([record.originKind, record.operationId, record.formId]);
}

export function groupSummarySources(records: DhrEvidenceRecord[]): SummarySourceGroup[] {
  const groups = new Map<string, SummarySourceGroup>();
  records.forEach((record) => {
    if (record.originKind === 'DIRECTORY') return;
    const key = summarySourceKey(record);
    const group = groups.get(key);
    if (group) group.records.push(record);
    else groups.set(key, { key, originKind: record.originKind, records: [record] });
  });
  return [...groups.values()].map((group) => ({
    ...group,
    records: [...group.records].sort((a, b) => a.instanceNo.localeCompare(b.instanceNo) || a.id.localeCompare(b.id)),
  }));
}

export function placeSummarySourceGroup(
  current: DhrSummaryPlacement[], group: SummarySourceGroup, targetNodeKey: string, beforeKey?: string,
): DhrSummaryPlacement[] {
  const ids = new Set(group.records.map((record) => record.id));
  if (beforeKey?.startsWith('record-') && ids.has(beforeKey.slice(7))) return current;
  let result = current;
  if (!targetNodeKey) return current.filter((placement) => !ids.has(placement.recordId));
  group.records.forEach((record) => { result = placeSummaryRecord(result, record.id, targetNodeKey, beforeKey); });
  return result;
}
