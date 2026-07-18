import type {
  CanvasNode,
  CanvasSelectionRange,
  SubTableRecordDirection,
  SubTableRecordTemplateField,
  SubTableRegion,
  SubTableRepeatConfig,
} from '../types';

export function normalizeRange(range: CanvasSelectionRange): CanvasSelectionRange {
  return {
    t: Math.min(range.t, range.b),
    l: Math.min(range.l, range.r),
    b: Math.max(range.t, range.b),
    r: Math.max(range.l, range.r),
  };
}

export function rangesIntersect(first: CanvasSelectionRange, second: CanvasSelectionRange) {
  const normalizedFirst = normalizeRange(first);
  const normalizedSecond = normalizeRange(second);
  return normalizedFirst.l <= normalizedSecond.r
    && normalizedFirst.r >= normalizedSecond.l
    && normalizedFirst.t <= normalizedSecond.b
    && normalizedFirst.b >= normalizedSecond.t;
}

export function rangeContainsRange(parent: CanvasSelectionRange, child: CanvasSelectionRange) {
  const normalizedParent = normalizeRange(parent);
  const normalizedChild = normalizeRange(child);
  return normalizedChild.t >= normalizedParent.t
    && normalizedChild.l >= normalizedParent.l
    && normalizedChild.b <= normalizedParent.b
    && normalizedChild.r <= normalizedParent.r;
}

export function buildSubTableGroupRepeatRanges(
  regionRange: CanvasSelectionRange,
  groupRange: CanvasSelectionRange,
  direction: SubTableRecordDirection,
) {
  const normalizedRegion = normalizeRange(regionRange);
  const normalizedGroup = normalizeRange(groupRange);
  if (!rangeContainsRange(normalizedRegion, normalizedGroup)) return [];

  const groupWidth = normalizedGroup.r - normalizedGroup.l + 1;
  const groupHeight = normalizedGroup.b - normalizedGroup.t + 1;
  const ranges: CanvasSelectionRange[] = [];

  if (direction === 'row') {
    for (let top = normalizedGroup.t; top + groupHeight - 1 <= normalizedRegion.b; top += groupHeight) {
      const leftStart = top === normalizedGroup.t ? normalizedGroup.r + 1 : normalizedGroup.l;
      for (let left = leftStart; left + groupWidth - 1 <= normalizedRegion.r; left += groupWidth) {
        ranges.push({ t: top, l: left, b: top + groupHeight - 1, r: left + groupWidth - 1 });
      }
    }
    return ranges;
  }

  for (let left = normalizedGroup.l; left + groupWidth - 1 <= normalizedRegion.r; left += groupWidth) {
    const topStart = left === normalizedGroup.l ? normalizedGroup.b + 1 : normalizedGroup.t;
    for (let top = topStart; top + groupHeight - 1 <= normalizedRegion.b; top += groupHeight) {
      ranges.push({ t: top, l: left, b: top + groupHeight - 1, r: left + groupWidth - 1 });
    }
  }
  return ranges;
}

export function readNodeCellRange(node: CanvasNode): CanvasSelectionRange | null {
  const value = node.style.cellRange;
  if (!value || typeof value !== 'object') return null;

  const range = value as Partial<CanvasSelectionRange>;
  const { t, l, b, r } = range;
  if (typeof t !== 'number' || typeof l !== 'number' || typeof b !== 'number' || typeof r !== 'number') {
    return null;
  }
  return normalizeRange({ t, l, b, r });
}

export function inferFixedRepeatCount(range: CanvasSelectionRange, direction: SubTableRecordDirection, stride = 1) {
  const normalizedRange = normalizeRange(range);
  const span = direction === 'row'
    ? normalizedRange.b - normalizedRange.t + 1
    : normalizedRange.r - normalizedRange.l + 1;
  return Math.max(1, Math.floor(span / Math.max(1, stride)));
}

function defaultRepeat(range: CanvasSelectionRange): SubTableRepeatConfig {
  return {
    type: 'fixed',
    count: inferFixedRepeatCount(range, 'row', 1),
    stride: 1,
  };
}

export function createDefaultSubTableRegion(input: {
  id: string;
  fieldId: string;
  pageId: string;
  range: CanvasSelectionRange;
}): SubTableRegion {
  const range = normalizeRange(input.range);
  return {
    id: input.id,
    fieldId: input.fieldId,
    mode: 'record',
    ranges: [{ pageId: input.pageId, range, order: 1 }],
    repeat: defaultRepeat(range),
    recordTemplate: {
      direction: 'row',
      anchor: { row: range.t, col: range.l },
      fields: [],
    },
    presentation: {
      showHeader: false,
      showIndex: false,
      emptyText: '暂无数据',
      addEntry: 'bottom',
    },
  };
}

export function createLegacySubTableRegion(input: {
  id: string;
  fieldId: string;
  pageId: string;
  range: CanvasSelectionRange;
}): SubTableRegion {
  return createDefaultSubTableRegion(input);
}

function getRegionPrimaryRange(region: SubTableRegion) {
  return [...region.ranges].sort((first, second) => first.order - second.order)[0]?.range ?? null;
}

function toTemplateField(region: SubTableRegion, node: CanvasNode): SubTableRecordTemplateField | null {
  const childFieldId = node.bindings?.subTableFieldId;
  const nodeRange = readNodeCellRange(node);
  const regionRange = getRegionPrimaryRange(region);
  if (!childFieldId || !nodeRange || !regionRange || !rangeContainsRange(regionRange, nodeRange)) return null;

  return {
    fieldId: childFieldId,
    rowOffset: nodeRange.t - region.recordTemplate.anchor.row,
    colOffset: nodeRange.l - region.recordTemplate.anchor.col,
    rowSpan: nodeRange.b - nodeRange.t + 1,
    colSpan: nodeRange.r - nodeRange.l + 1,
  };
}

export function rebuildSubTableRecordTemplate(region: SubTableRegion, nodes: CanvasNode[]): SubTableRegion {
  const fieldMap = new Map<string, SubTableRecordTemplateField>();

  const visit = (items: CanvasNode[]) => {
    items.forEach((node) => {
      const templateField = node.bindings?.subTableId === region.fieldId ? toTemplateField(region, node) : null;
      if (templateField && !fieldMap.has(templateField.fieldId)) {
        fieldMap.set(templateField.fieldId, templateField);
      }
      if (node.children?.length) visit(node.children);
    });
  };

  visit(nodes);

  return {
    ...region,
    recordTemplate: {
      ...region.recordTemplate,
      fields: Array.from(fieldMap.values()).sort((first, second) => (
        first.rowOffset - second.rowOffset
        || first.colOffset - second.colOffset
        || first.fieldId.localeCompare(second.fieldId)
      )),
    },
  };
}
