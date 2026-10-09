import type { DhrSummaryPlacement } from '@/api/dhr-instances';

export function orderedSummaryChildren(parentKey: string, staticKeys: string[], placements: DhrSummaryPlacement[]): string[] {
  const anchors = new Set(staticKeys);
  const optional = placements.map((placement, index) => ({ placement, index }))
    .filter(({ placement }) => placement.targetNodeKey === parentKey)
    .sort((left, right) => (left.placement.displayOrder ?? left.index) - (right.placement.displayOrder ?? right.index) || left.index - right.index);
  const before = (key: string | null) => optional
    .filter(({ placement }) => (anchors.has(placement.beforeNodeKey ?? '') ? placement.beforeNodeKey : null) === key)
    .map(({ placement }) => `record-${placement.recordId}`);
  return [...staticKeys.flatMap((key) => [...before(key), key]), ...before(null)];
}

export function placeSummaryRecord(
  current: DhrSummaryPlacement[], recordId: string, targetNodeKey: string, beforeKey?: string,
): DhrSummaryPlacement[] {
  if (beforeKey === `record-${recordId}` && current.some((placement) => placement.recordId === recordId && placement.targetNodeKey === targetNodeKey)) return current;
  const remaining = current.filter((placement) => placement.recordId !== recordId);
  const beforeRecord = beforeKey?.startsWith('record-')
    ? remaining.find((placement) => placement.recordId === beforeKey.slice(7) && placement.targetNodeKey === targetNodeKey)
    : undefined;
  const anchor = beforeRecord?.beforeNodeKey ?? (beforeKey?.startsWith('record-') ? undefined : beforeKey);
  const sameSlot = remaining.map((placement, index) => ({ placement, index }))
    .filter(({ placement }) => placement.targetNodeKey === targetNodeKey && placement.beforeNodeKey === anchor)
    .sort((left, right) => (left.placement.displayOrder ?? left.index) - (right.placement.displayOrder ?? right.index) || left.index - right.index)
    .map(({ placement }) => placement);
  const insertAt = beforeRecord ? sameSlot.findIndex((placement) => placement.recordId === beforeRecord.recordId) : sameSlot.length;
  const previous = current.find((placement) => placement.recordId === recordId);
  sameSlot.splice(insertAt < 0 ? sameSlot.length : insertAt, 0, { recordId, targetNodeKey, ...(anchor ? { beforeNodeKey: anchor } : {}), ...(previous?.displayName ? { displayName: previous.displayName } : {}) });
  const slotIds = new Set(sameSlot.map((placement) => placement.recordId));
  return [...remaining.filter((placement) => !slotIds.has(placement.recordId)),
    ...sameSlot.map((placement, displayOrder) => ({ ...placement, displayOrder }))];
}
