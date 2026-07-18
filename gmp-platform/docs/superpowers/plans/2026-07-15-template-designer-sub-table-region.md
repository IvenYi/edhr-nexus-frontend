# React Template Designer Sub-Table Region Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable record-style sub-table region loop in the React template designer: create a structured sub-table region from a canvas selection, configure fixed/dynamic record behavior, drag child fields into the region as a record template, persist that structure, and verify it in the live designer.

**Architecture:** Keep sub-tables as the existing absolute canvas node type `sub-table`, and extend its `bindings` with a typed `subTableRegion` object. The canvas node remains responsible for visual placement, while `subTableRegion` carries repeat mode, record-template fields, range fragments, presentation flags, and future matrix placeholders. Store actions become the source of truth for creating regions, updating region metadata, and reconciling child-field nodes after drag/drop, delete, merge, and split.

**Tech Stack:** React 18, TypeScript, MUI 5, Zustand, existing `verify-template-designer-react.mjs`, `npm run build`, and browser QA on `http://localhost:3000/master-data/form-templates`.

---

## Scope Boundary

This plan implements the design-side and persisted JSON structure for first-stage record sub-tables. It does not create a real one-line fill runtime because the current React designer only has a `模拟填报` button and no separate runtime module. Dynamic add-row/delete-row behavior is therefore represented in persisted region config and verifier/browser QA at design time. Runtime consumption should be a separate plan once the fill surface exists.

Matrix sub-tables are schema-reserved only: `mode: 'matrix'` and `dimensions` are typed and normalized, but no matrix UI or runtime behavior is exposed.

## File Structure

- Modify `gmp-platform/frontend/src/pages/master-data/template-designer-react/types/canvas.ts`
  - Add `SubTableRegion` and related typed interfaces.
  - Add `subTableRegion?: SubTableRegion` to `CanvasNodeBindings`.

- Create `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/subTableRegion.ts`
  - Own all pure range and region helpers.
  - Create default region metadata.
  - Infer fixed repeat count.
  - Rebuild `recordTemplate.fields` from placed child field nodes.
  - Avoid adding more duplicated helper logic to the already large Zustand store.

- Modify `gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
  - Import the helper module.
  - Create structured sub-table regions when a sub-table field is placed on a range.
  - Add store actions for selected sub-table region updates and data grouping.
  - Reconcile region record templates after sub-table child-field drop, delete, merge, and split.

- Modify `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`
  - Keep the existing `设为子表` context menu behavior.
  - Add `数据分组` for selections inside a sub-table region.
  - Preserve the existing drag/drop pointer QA path.
  - Keep single-cell child field replacement behavior.

- Modify `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx`
  - Add a `renderSubTableRegionSections()` branch for `sub-table` nodes.
  - Expose business-facing settings: base info, structure, fixed/dynamic, fill limits, display, and pagination.
  - Keep ordinary field configuration untouched.

- Modify `gmp-platform/frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx`
  - Render fixed/dynamic labels using `node.bindings.subTableRegion`.
  - Keep purple dashed frame, right-side identifier, connector, and click-to-config behavior.

- Modify `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/document.ts`
  - Normalize persisted legacy `sub-table` nodes that do not yet have `bindings.subTableRegion`.
  - Preserve old saved templates without changing schema version.

- Modify `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
  - Add static contract checks for new types, helpers, store actions, inspector UI, renderer markers, and normalization.

---

### Task 1: Add Typed Sub-Table Region Contract

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/types/canvas.ts`

- [ ] **Step 1: Add failing verifier checks**

In `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`, add these checks near the existing `canvasTypes` assertions:

```js
assertIncludes(canvasTypes, [
  "export type SubTableRegionMode = 'record' | 'matrix'",
  "export type SubTableRecordDirection = 'row' | 'column'",
  "export interface SubTableRegionRange",
  "export interface SubTableRecordTemplate",
  "export interface SubTableRegion",
  "subTableRegion?: SubTableRegion",
], 'canvas.ts: sub-table region type contract');
```

- [ ] **Step 2: Run verifier and confirm the new checks fail**

Run:

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with messages that start with `canvas.ts: sub-table region type contract`.

- [ ] **Step 3: Add the sub-table region types**

In `gmp-platform/frontend/src/pages/master-data/template-designer-react/types/canvas.ts`, insert these exports after `CanvasSelectionRange`:

```ts
export type SubTableRegionMode = 'record' | 'matrix';
export type SubTableRecordDirection = 'row' | 'column';

export interface SubTableRegionRange {
  pageId: string;
  range: CanvasSelectionRange;
  order: number;
}

export interface SubTableFixedRepeatConfig {
  type: 'fixed';
  count: number;
  stride: number;
}

export interface SubTableDynamicRepeatConfig {
  type: 'dynamic';
  minCount: number;
  maxCount?: number;
  addPosition: 'bottom';
  allowRemove: boolean;
  removeConfirm: true;
}

export type SubTableRepeatConfig = SubTableFixedRepeatConfig | SubTableDynamicRepeatConfig;

export interface SubTableRecordTemplateField {
  fieldId: string;
  rowOffset: number;
  colOffset: number;
  rowSpan?: number;
  colSpan?: number;
}

export interface SubTableRecordTemplate {
  direction: SubTableRecordDirection;
  anchor: {
    row: number;
    col: number;
  };
  fields: SubTableRecordTemplateField[];
}

export interface SubTableMatrixDimension {
  source: 'static' | 'reference' | 'dynamic';
  labelFieldId?: string;
  items?: Array<{
    id: string;
    label: string;
    value: unknown;
  }>;
  allowAdd?: boolean;
}

export interface SubTableMatrixValueDefinition {
  fields: Array<{
    fieldId: string;
    role: 'value' | 'remark' | 'attachment';
  }>;
}

export interface SubTableMatrixDimensions {
  row: SubTableMatrixDimension;
  column: SubTableMatrixDimension;
  value: SubTableMatrixValueDefinition;
}

export interface SubTablePresentationConfig {
  showHeader: boolean;
  showIndex: boolean;
  emptyText: string;
  addEntry: 'bottom' | 'contextMenu' | 'both';
}

export interface SubTableRegion {
  id: string;
  fieldId: string;
  mode: SubTableRegionMode;
  ranges: SubTableRegionRange[];
  repeat: SubTableRepeatConfig;
  recordTemplate: SubTableRecordTemplate;
  dimensions?: SubTableMatrixDimensions;
  presentation: SubTablePresentationConfig;
}
```

Then update `CanvasNodeBindings`:

```ts
export interface CanvasNodeBindings extends Partial<Omit<FieldBinding, 'fieldId'>> {
  fieldId?: string;
  fieldIds?: string[];
  subTableId?: string;
  subTableFieldId?: string;
  subTableField?: ModelField;
  subTableRegion?: SubTableRegion;
}
```

- [ ] **Step 4: Run verifier and type build**

Run:

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: verifier PASS for the new type checks, build PASS.

- [ ] **Step 5: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/types/canvas.ts
git commit -m "feat: add template designer sub-table region types"
```

---

### Task 2: Create Pure Sub-Table Region Helpers

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/subTableRegion.ts`

- [ ] **Step 1: Add failing verifier checks**

In `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`, add:

```js
const subTableRegionUtils = read('../src/pages/master-data/template-designer-react/utils/subTableRegion.ts');
assertIncludes(subTableRegionUtils, [
  'createDefaultSubTableRegion',
  'createLegacySubTableRegion',
  'inferFixedRepeatCount',
  'rebuildSubTableRecordTemplate',
  'readNodeCellRange',
  'rangeContainsRange',
  'rangesIntersect',
], 'subTableRegion.ts: helper contract');
```

- [ ] **Step 2: Run verifier and confirm the helper file is missing**

Run:

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with `subTableRegion.ts: missing file` or helper contract failures.

- [ ] **Step 3: Create the helper module**

Create `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/subTableRegion.ts`:

```ts
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
  const a = normalizeRange(first);
  const b = normalizeRange(second);
  return a.l <= b.r && a.r >= b.l && a.t <= b.b && a.b >= b.t;
}

export function rangeContainsRange(parent: CanvasSelectionRange, child: CanvasSelectionRange) {
  const outer = normalizeRange(parent);
  const inner = normalizeRange(child);
  return inner.t >= outer.t && inner.l >= outer.l && inner.b <= outer.b && inner.r <= outer.r;
}

export function readNodeCellRange(node: CanvasNode): CanvasSelectionRange | null {
  const value = node.style.cellRange;
  if (!value || typeof value !== 'object') return null;

  const range = value as Partial<CanvasSelectionRange>;
  if (
    typeof range.t !== 'number'
    || typeof range.l !== 'number'
    || typeof range.b !== 'number'
    || typeof range.r !== 'number'
  ) {
    return null;
  }
  return normalizeRange({ t: range.t, l: range.l, b: range.b, r: range.r });
}

export function inferFixedRepeatCount(range: CanvasSelectionRange, direction: SubTableRecordDirection, stride = 1) {
  const normalized = normalizeRange(range);
  const span = direction === 'row'
    ? normalized.b - normalized.t + 1
    : normalized.r - normalized.l + 1;
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
      showHeader: true,
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
```

- [ ] **Step 4: Run verifier and build**

Run:

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/subTableRegion.ts
git commit -m "feat: add sub-table region helpers"
```

---

### Task 3: Create Regions Through Store Actions

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`

- [ ] **Step 1: Add failing verifier checks**

Add store checks:

```js
assertIncludes(storeFile, [
  'createDefaultSubTableRegion',
  'createBoundSubTableRegionNode',
  'addSubTableRegionFromFieldToRange',
  'updateSelectedSubTableRegion',
  'getSelectedSubTableRegionNode',
], 'useTemplateDesignerStore.ts: sub-table region store actions');
if (!storeFile.includes("field.type === 'subTable'")) failures.push('useTemplateDesignerStore.ts: sub-table range insertion must branch by field type');
if (!storeFile.includes('bindings: {') || !storeFile.includes('subTableRegion: createDefaultSubTableRegion')) failures.push('useTemplateDesignerStore.ts: sub-table region must be stored in node bindings');
```

- [ ] **Step 2: Run verifier and confirm failures**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with `sub-table region store actions` failures.

- [ ] **Step 3: Import helpers into the store**

In `useTemplateDesignerStore.ts`, add:

```ts
import {
  createDefaultSubTableRegion,
  rebuildSubTableRecordTemplate,
  rangeContainsRange,
  readNodeCellRange as readSubTableNodeCellRange,
  rangesIntersect as subTableRangesIntersect,
} from '../utils/subTableRegion';
```

Keep the existing local `readNodeCellRange` and `rangesIntersect` in place for the current store behavior. Use the imported helpers for the new sub-table region logic first, then collapse duplication in a separate cleanup only if needed by build errors.

- [ ] **Step 4: Add node creation helper**

Add this near `createBoundNodeFromSubTableField`:

```ts
function createBoundSubTableRegionNode(
  field: ModelField,
  pageId: string,
  range: CanvasSelectionRange,
  layout: FieldCellLayout,
) {
  const node = createBoundNodeFromField(field, {
    ...layout,
    range,
  });

  return {
    ...node,
    bindings: {
      ...node.bindings,
      fieldId: field.id,
      subTableRegion: createDefaultSubTableRegion({
        id: createId('sub-table-region'),
        fieldId: field.id,
        pageId,
        range,
      }),
    },
  };
}
```

- [ ] **Step 5: Extend the store interface**

Add these methods to `TemplateDesignerStore`:

```ts
addSubTableRegionFromFieldToRange: (fieldId: string, range: CanvasSelectionRange, layout: Omit<FieldCellLayout, 'range'>) => void;
updateSelectedSubTableRegion: (patch: Partial<CanvasNode['bindings']['subTableRegion']>) => void;
getSelectedSubTableRegionNode: () => CanvasNode | null;
```

- [ ] **Step 6: Implement `addSubTableRegionFromFieldToRange`**

Add this action beside `addNodeFromFieldToRange`:

```ts
addSubTableRegionFromFieldToRange: (fieldId, range, layout) => {
  const field = get().getFieldById(fieldId);
  const availableFields = get().getAvailableFieldsForCurrentVersion();
  const page = get().getCurrentPage();
  const layoutRange = normalizeRange(range);
  if (!field || field.type !== 'subTable' || field.status !== 'enabled' || !page) return;
  if (!availableFields.some((item) => item.id === field.id) || !isMultiCellRange(layoutRange)) return;

  const node = createBoundSubTableRegionNode(field, page.id, layoutRange, layout);
  set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          nodes: [
            ...removeCellFieldNodesFromTree(page.nodes, layoutRange),
            node,
          ],
        }))
      : state.document,
    selectedNodeId: node.id,
    selectedRange: layoutRange,
    selectedCell: { row: layoutRange.t, col: layoutRange.l },
    activeCanvasRail: 'config',
    isCanvasSidebarVisible: true,
  }));
},
```

- [ ] **Step 7: Make `addNodeFromFieldToRange` delegate sub-table fields**

At the beginning of `addNodeFromFieldToRange`, after resolving `field` and `layoutRange`, branch:

```ts
if (field?.type === 'subTable') {
  get().addSubTableRegionFromFieldToRange(fieldId, layoutRange, layout);
  return;
}
```

Keep the existing non-sub-table behavior unchanged.

- [ ] **Step 8: Implement selected region helpers**

Add these actions near selector actions:

```ts
getSelectedSubTableRegionNode: () => {
  const node = get().getSelectedNode();
  return node?.type === 'sub-table' && node.bindings?.subTableRegion ? node : null;
},
updateSelectedSubTableRegion: (patch) => set((state) => {
  const selectedNodeId = state.selectedNodeId;
  if (!state.document || !selectedNodeId) return { document: state.document };

  return pushDocumentHistory(state, {
    document: updateCanvasPage(state.document, (page) => ({
      ...page,
      nodes: mapNodes(page.nodes, selectedNodeId, (node) => {
        if (node.type !== 'sub-table' || !node.bindings?.subTableRegion) return node;
        return {
          ...node,
          bindings: {
            ...node.bindings,
            subTableRegion: {
              ...node.bindings.subTableRegion,
              ...patch,
            },
          },
        };
      }),
    })),
  });
}),
```

- [ ] **Step 9: Run verifier and build**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts
git commit -m "feat: create structured sub-table regions"
```

---

### Task 4: Reconcile Child Field Drag/Drop Into Record Templates

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`

- [ ] **Step 1: Add failing verifier checks**

Add:

```js
assertIncludes(storeFile, [
  'reconcileSubTableRegionTemplates',
  'rebuildSubTableRecordTemplate',
  'subTableRegion.fieldId === subTableId',
], 'useTemplateDesignerStore.ts: sub-table record template reconciliation');
if (!canvasWorkspace.includes('rangeContainsRange(subTableRange, normalizeRange(cellSelectionRange))')) failures.push('CanvasSheetWorkspace.tsx: sub-table child fields must still be constrained to the selected sub-table region');
```

- [ ] **Step 2: Run verifier and confirm failures**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with reconciliation failures.

- [ ] **Step 3: Add region template reconciliation helper in the store**

Add this helper near `removeSubTableFieldNodesFromTree`:

```ts
function reconcileSubTableRegionTemplates(nodes: CanvasNode[]): CanvasNode[] {
  const nextNodes = nodes.map((node) => {
    let nextNode = node;

    if (node.type === 'sub-table' && node.bindings?.subTableRegion) {
      const subTableRegion = rebuildSubTableRecordTemplate(node.bindings.subTableRegion, nodes);
      nextNode = {
        ...node,
        bindings: {
          ...node.bindings,
          subTableRegion,
        },
      };
    }

    if (!nextNode.children?.length) return nextNode;
    return {
      ...nextNode,
      children: reconcileSubTableRegionTemplates(nextNode.children),
    };
  });

  return nextNodes;
}
```

- [ ] **Step 4: Reconcile after sub-table child field drop**

In `addNodeFromSubTableFieldToCell`, replace the `nodes` assignment with:

```ts
const nextNodes = [
  ...removeSubTableFieldNodesFromTree(page.nodes, subTableId, layout.range ?? createSingleCellRange()),
  node,
];

return {
  ...page,
  nodes: reconcileSubTableRegionTemplates(nextNodes),
};
```

- [ ] **Step 5: Reconcile after merge, split, clear, and remove**

Update the node-writing branches:

```ts
nodes: reconcileSubTableRegionTemplates(removeNodeAndSubTableFieldsFromTree(page.nodes, nodeId))
```

```ts
nodes: state.selectedNodeId
  ? reconcileSubTableRegionTemplates(removeNodeAndSubTableFieldsFromTree(page.nodes, state.selectedNodeId))
  : page.nodes
```

```ts
nodes: reconcileSubTableRegionTemplates(mergeCellFieldNodesForRange(page.nodes, normalizedSelection))
```

```ts
nodes: reconcileSubTableRegionTemplates(collapseSplitCellFieldNodesToFirstCells(page.nodes, removedMergedRanges))
```

- [ ] **Step 6: Keep child drops region-scoped in the workspace**

In `CanvasSheetWorkspace.tsx`, keep the existing region check and make the helper import explicit if it is not already local:

```ts
if (subTableFieldData && currentPage) {
  const subTableRange = findSubTableNodeRange(currentPage, subTableFieldData.subTableId);
  if (!subTableRange || !rangeContainsRange(subTableRange, normalizeRange(cellSelectionRange))) return;
  addNodeFromSubTableFieldToCell(subTableFieldData.subTableId, subTableFieldData.field, layout);
  return;
}
```

- [ ] **Step 7: Run verifier and build**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx
git commit -m "feat: sync sub-table child fields into record templates"
```

---

### Task 5: Add Data Grouping Context Action

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`

- [ ] **Step 1: Add failing verifier checks**

Add:

```js
assertIncludes(storeFile, [
  'setSubTableRecordTemplateFromRange',
  'inferFixedRepeatCount',
], 'useTemplateDesignerStore.ts: sub-table data grouping action');
assertIncludes(canvasWorkspace, [
  'data-sheet-menu-action="sub-table-data-group"',
  '数据分组',
  'handleSubTableDataGroup',
], 'CanvasSheetWorkspace.tsx: sub-table data grouping context menu');
```

- [ ] **Step 2: Run verifier and confirm failures**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with data grouping failures.

- [ ] **Step 3: Add store action**

Add to the store interface:

```ts
setSubTableRecordTemplateFromRange: (subTableId: string, range: CanvasSelectionRange) => void;
```

Implement beside other canvas actions:

```ts
setSubTableRecordTemplateFromRange: (subTableId, range) => set((state) => {
  if (!state.document) return { document: state.document };
  const normalizedRange = normalizeRange(range);

  return pushDocumentHistory(state, {
    document: updateCanvasPage(state.document, (page) => ({
      ...page,
      nodes: reconcileSubTableRegionTemplates(mapNodes(page.nodes, subTableId, (node) => {
        if (node.type !== 'sub-table' || !node.bindings?.subTableRegion) return node;
        const currentRegion = node.bindings.subTableRegion;
        const direction = currentRegion.repeat.type === 'dynamic'
          ? 'row'
          : currentRegion.recordTemplate.direction;
        const repeat = currentRegion.repeat.type === 'fixed'
          ? {
              ...currentRegion.repeat,
              count: inferFixedRepeatCount(normalizedRange, direction, currentRegion.repeat.stride),
            }
          : currentRegion.repeat;
        return {
          ...node,
          bindings: {
            ...node.bindings,
            subTableRegion: {
              ...currentRegion,
              repeat,
              recordTemplate: {
                ...currentRegion.recordTemplate,
                direction,
                anchor: { row: normalizedRange.t, col: normalizedRange.l },
              },
            },
          },
        };
      })),
    })),
    selectedRange: normalizedRange,
    selectedCell: { row: normalizedRange.t, col: normalizedRange.l },
    activeCanvasRail: 'config',
    isCanvasSidebarVisible: true,
  });
}),
```

- [ ] **Step 4: Add context menu visibility**

In `CanvasSheetWorkspace.tsx`, derive a selected sub-table node id:

```ts
const selectedSubTableNode = currentPage && normalizedRange
  ? currentPage.nodes.find((node) => {
      if (node.type !== 'sub-table' || !node.bindings?.fieldId) return false;
      const subTableRange = findSubTableNodeRange(currentPage, node.bindings.fieldId);
      return Boolean(subTableRange && rangeContainsRange(subTableRange, normalizedRange));
    }) ?? null
  : null;
const canGroupSubTableSelection = Boolean(activeMenuAxis === 'cell' && selectedSubTableNode && isMultiCellRange(normalizedRange));
```

- [ ] **Step 5: Add menu action**

Add the action handler:

```ts
const setSubTableRecordTemplateFromRange = useTemplateDesignerStore((state) => state.setSubTableRecordTemplateFromRange);

const handleSubTableDataGroup = () => {
  if (!selectedSubTableNode || !normalizedRange) return;
  setSubTableRecordTemplateFromRange(selectedSubTableNode.id, normalizedRange);
  closeContextMenu();
};
```

Add this menu item after `renderSetSubTableMenu()`:

```tsx
{canGroupSubTableSelection ? (
  <MenuItem
    data-sheet-menu-action="sub-table-data-group"
    onClick={handleSubTableDataGroup}
  >数据分组</MenuItem>
) : null}
```

- [ ] **Step 6: Run verifier and build**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx
git commit -m "feat: add sub-table data grouping action"
```

---

### Task 6: Add Sub-Table Configuration Panel

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx`

- [ ] **Step 1: Add failing verifier checks**

Add:

```js
assertIncludes(inspector, [
  'renderSubTableRegionSections',
  '结构设置',
  '填报方向',
  '重复方式',
  '固定数量',
  '最小数量',
  '最大数量',
  '允许删除记录',
  '新增入口',
  '分页设置',
], 'DesignerInspector.tsx: sub-table region configuration panel');
if (!inspector.includes("fieldType === 'subTable'") || !inspector.includes("selectedNode.type === 'sub-table'")) failures.push('DesignerInspector.tsx: sub-table config must only render for selected sub-table region nodes');
```

- [ ] **Step 2: Run verifier and confirm failures**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with sub-table configuration panel failures.

- [ ] **Step 3: Add config option constants**

In `DesignerInspector.tsx`, add near the existing option constants:

```ts
const SUB_TABLE_DIRECTION_OPTIONS = [
  { label: '按行填报', value: 'row' },
  { label: '按列填报', value: 'column' },
];

const SUB_TABLE_REPEAT_OPTIONS = [
  { label: '固定', value: 'fixed' },
  { label: '动态', value: 'dynamic' },
];

const SUB_TABLE_ADD_ENTRY_OPTIONS = [
  { label: '底部按钮', value: 'bottom' },
  { label: '右键菜单', value: 'contextMenu' },
  { label: '两者', value: 'both' },
];
```

- [ ] **Step 4: Wire the store action**

Near other store selectors:

```ts
const updateSelectedSubTableRegion = useTemplateDesignerStore((state) => state.updateSelectedSubTableRegion);
```

- [ ] **Step 5: Add the renderer function**

Add this before `renderFieldSections`:

```tsx
const renderSubTableRegionSections = () => {
  const region = bindings.subTableRegion;
  if (!region) return null;

  const updateRegion = updateSelectedSubTableRegion;
  const repeatType = region.repeat.type;

  return (
    <>
      <FieldConfigSection title="基础信息" marker="sub-table-basic">
        <FieldConfigRow label="子表名称" layout="vertical">
          <CompactTextField
            value={boundField?.name ?? ''}
            disabled
          />
        </FieldConfigRow>
        <FieldConfigRow label="帮助提示" layout="vertical">
          <CompactTextareaField
            value={readText(bindings.helpText)}
            placeholder="鼠标悬浮说明"
            onChange={(value) => updateBinding({ helpText: value })}
          />
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="结构设置" marker="sub-table-structure">
        <FieldConfigRow label="填报方向">
          <CompactSelect
            value={region.recordTemplate.direction}
            options={SUB_TABLE_DIRECTION_OPTIONS}
            onChange={(value) => updateRegion({
              recordTemplate: {
                ...region.recordTemplate,
                direction: repeatType === 'dynamic' ? 'row' : value,
              },
            })}
          />
        </FieldConfigRow>
        <FieldConfigRow label="重复方式">
          <CompactSelect
            value={repeatType}
            options={SUB_TABLE_REPEAT_OPTIONS}
            onChange={(value) => {
              if (value === 'dynamic') {
                updateRegion({
                  repeat: {
                    type: 'dynamic',
                    minCount: 0,
                    maxCount: 50,
                    addPosition: 'bottom',
                    allowRemove: true,
                    removeConfirm: true,
                  },
                  recordTemplate: {
                    ...region.recordTemplate,
                    direction: 'row',
                  },
                });
                return;
              }
              updateRegion({
                repeat: {
                  type: 'fixed',
                  count: 1,
                  stride: 1,
                },
              });
            }}
          />
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      {region.repeat.type === 'fixed' ? (
        <FieldConfigSection title="固定设置" marker="sub-table-fixed">
          <FieldConfigRow label="固定数量">
            <CompactNumberField
              value={region.repeat.count}
              min={1}
              onChange={(value) => updateRegion({
                repeat: {
                  ...region.repeat,
                  count: Math.max(1, value),
                },
              })}
            />
          </FieldConfigRow>
        </FieldConfigSection>
      ) : (
        <FieldConfigSection title="动态设置" marker="sub-table-dynamic">
          <FieldConfigRow label="最小数量">
            <CompactNumberField
              value={region.repeat.minCount}
              min={0}
              onChange={(value) => updateRegion({
                repeat: {
                  ...region.repeat,
                  minCount: Math.max(0, value),
                },
              })}
            />
          </FieldConfigRow>
          <FieldConfigRow label="最大数量">
            <CompactNumberField
              value={region.repeat.maxCount ?? 50}
              min={1}
              onChange={(value) => updateRegion({
                repeat: {
                  ...region.repeat,
                  maxCount: Math.max(1, value),
                },
              })}
            />
          </FieldConfigRow>
          <FillLimitCheckbox
            label="允许删除记录"
            checked={region.repeat.allowRemove}
            onChange={(checked) => updateRegion({
              repeat: {
                ...region.repeat,
                allowRemove: checked,
                removeConfirm: true,
              },
            })}
          />
          <FieldConfigRow label="新增入口">
            <CompactSelect
              value={region.presentation.addEntry}
              options={SUB_TABLE_ADD_ENTRY_OPTIONS}
              onChange={(value) => updateRegion({
                presentation: {
                  ...region.presentation,
                  addEntry: value,
                },
              })}
            />
          </FieldConfigRow>
        </FieldConfigSection>
      )}

      <Divider />

      <FieldConfigSection title="填写限制" marker="sub-table-fill-limit">
        {renderFillLimitControls()}
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="查看效果" marker="sub-table-display">
        <FillLimitCheckbox
          label="显示表头"
          checked={region.presentation.showHeader}
          onChange={(checked) => updateRegion({
            presentation: {
              ...region.presentation,
              showHeader: checked,
            },
          })}
        />
        <FillLimitCheckbox
          label="序号列"
          checked={region.presentation.showIndex}
          onChange={(checked) => updateRegion({
            presentation: {
              ...region.presentation,
              showIndex: checked,
            },
          })}
        />
        <FieldConfigRow label="空数据文案" layout="vertical">
          <CompactTextField
            value={region.presentation.emptyText}
            onChange={(value) => updateRegion({
              presentation: {
                ...region.presentation,
                emptyText: value,
              },
            })}
          />
        </FieldConfigRow>
      </FieldConfigSection>

      <Divider />

      <FieldConfigSection title="分页设置" marker="sub-table-pagination">
        <Typography sx={{ fontSize: 12, color: '#6b7280', lineHeight: '20px' }}>
          当前共 {region.ranges.length} 个分页片段，按片段顺序填报和导出。
        </Typography>
      </FieldConfigSection>
    </>
  );
};
```

- [ ] **Step 6: Route sub-table nodes before ordinary field sections**

Update `renderFieldSections`:

```ts
const renderFieldSections = () => {
  if (selectedNode.type === 'sub-table' && fieldType === 'subTable') {
    return renderSubTableRegionSections();
  }

  switch (fieldType) {
    ...
  }
};
```

- [ ] **Step 7: Run verifier and build**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx
git commit -m "feat: configure sub-table regions in designer"
```

---

### Task 7: Render Fixed/Dynamic Region Visual State

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx`

- [ ] **Step 1: Add failing verifier checks**

Add:

```js
assertIncludes(componentRegistry, [
  'node.bindings?.subTableRegion',
  'data-canvas-sub-table-repeat-type',
  '动态',
  '固定',
], 'componentRegistry.tsx: sub-table region visual state');
```

- [ ] **Step 2: Run verifier and confirm failures**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with visual state failures.

- [ ] **Step 3: Add repeat label and marker**

In `ContainerRenderer`, inside the `node.type === 'sub-table' && renderMode === 'cell'` branch, add:

```ts
const region = node.bindings?.subTableRegion;
const repeatLabel = region?.repeat.type === 'dynamic' ? '动态' : '固定';
```

Update the frame `Box`:

```tsx
<Box
  data-canvas-sub-table-frame="true"
  data-canvas-sub-table-repeat-type={region?.repeat.type ?? 'fixed'}
  ...
>
```

Update the label content:

```tsx
{subTableLabel}
{region ? ` · ${repeatLabel}` : ''}
```

- [ ] **Step 4: Keep existing pointer behavior**

Confirm the frame still has:

```ts
pointerEvents: 'none'
```

Confirm the right-side label still has:

```ts
pointerEvents: 'auto'
```

- [ ] **Step 5: Run verifier and build**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx
git commit -m "feat: show sub-table repeat state on canvas"
```

---

### Task 8: Normalize Persisted Legacy Sub-Table Nodes

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/document.ts`

- [ ] **Step 1: Add failing verifier checks**

Add:

```js
assertIncludes(documentUtils, [
  'normalizeCanvasNodes',
  'createLegacySubTableRegion',
  "node.type === 'sub-table'",
  'subTableRegion',
], 'document.ts: persisted sub-table region normalization');
```

If `documentUtils` is not already loaded in the verifier, add:

```js
const documentUtils = read('../src/pages/master-data/template-designer-react/utils/document.ts');
```

- [ ] **Step 2: Run verifier and confirm failures**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
```

Expected: FAIL with document normalization failures.

- [ ] **Step 3: Import helper**

In `document.ts`, add:

```ts
import { createLegacySubTableRegion, readNodeCellRange } from './subTableRegion';
```

- [ ] **Step 4: Add node normalization**

Add before `normalizeCanvasPage`:

```ts
function normalizeCanvasNodes(nodes: CanvasPage['nodes'], pageId: string): CanvasPage['nodes'] {
  return nodes.map((node) => {
    const cellRange = readNodeCellRange(node);
    const shouldCreateRegion = node.type === 'sub-table'
      && node.bindings?.fieldId
      && !node.bindings.subTableRegion
      && cellRange;

    const nextNode = shouldCreateRegion
      ? {
          ...node,
          bindings: {
            ...node.bindings,
            subTableRegion: createLegacySubTableRegion({
              id: `sub-table-region-${node.id}`,
              fieldId: node.bindings!.fieldId!,
              pageId,
              range: cellRange!,
            }),
          },
        }
      : node;

    if (!nextNode.children?.length) return nextNode;
    return {
      ...nextNode,
      children: normalizeCanvasNodes(nextNode.children, pageId),
    };
  });
}
```

- [ ] **Step 5: Use normalization in `normalizeCanvasPage`**

Change:

```ts
nodes: page.nodes ?? [],
```

to:

```ts
nodes: normalizeCanvasNodes(page.nodes ?? [], page.id || `page-${index + 1}`),
```

- [ ] **Step 6: Run verifier and build**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/document.ts
git commit -m "feat: normalize persisted sub-table regions"
```

---

### Task 9: Manual Browser QA

**Files:**
- No code files.
- Use the running app at `http://localhost:3000/master-data/form-templates`.

- [ ] **Step 1: Run static verification**

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
git diff --check
```

Expected: all PASS.

- [ ] **Step 2: Ensure frontend is on port 3000**

If no frontend is running:

```bash
cd gmp-platform/frontend
npm run dev -- --host 0.0.0.0 --port 3000
```

Expected: Vite serves `http://localhost:3000`.

- [ ] **Step 3: Browser QA create fixed sub-table region**

Open `http://localhost:3000/master-data/form-templates`.

QA steps:

1. Open a template version in the React designer.
2. Create or confirm a `子表` field with at least two child fields.
3. Switch to `表单设计`.
4. Select a multi-cell range.
5. Right-click and choose `设为子表`.
6. Confirm purple dashed frame appears, right-side label stays visible, and label shows fixed state.
7. Click the right-side label.
8. Confirm the left panel switches to `字段配置` and shows `结构设置`.

Expected: no selection flicker, no panel widening beyond configured max width, and no blocked cell clicks.

- [ ] **Step 4: Browser QA child field consumption**

QA steps:

1. Click a blank cell inside the sub-table region.
2. Confirm left `字段管理` lists only that sub-table's child fields.
3. Drag one child field into a cell inside the region.
4. Confirm the field is removed from the left list.
5. Drag a second child field into the same cell.
6. Confirm the old child field returns to the left list and only the new field remains in the cell.
7. Drag a child field outside the sub-table region.

Expected: outside drop is ignored, consumed state is scoped to the selected sub-table, and one field per cell is preserved.

- [ ] **Step 5: Browser QA data grouping and dynamic config**

QA steps:

1. Select a multi-cell area inside the sub-table region.
2. Right-click and choose `数据分组`.
3. Click the sub-table label and switch `重复方式` to `动态`.
4. Confirm `填报方向` is `按行填报`.
5. Confirm dynamic settings show `最小数量`, `最大数量`, `允许删除记录`, and `新增入口`.
6. Switch back to `固定`.
7. Confirm `固定数量` is visible.

Expected: dynamic mode forces row direction, fixed mode exposes count, and settings persist after Save.

- [ ] **Step 6: Browser QA delete cleanup**

QA steps:

1. Place at least two child fields inside a sub-table region.
2. Select the sub-table region frame or its right label.
3. Delete the sub-table node.
4. Click a normal canvas cell.
5. Confirm child fields that were inside the deleted sub-table no longer remain on the canvas.
6. Confirm the sub-table field returns to the main field list.

Expected: deleting parent region cascades child field nodes.

- [ ] **Step 7: Commit QA notes if code changed after fixes**

If browser QA required follow-up fixes, rerun:

```bash
cd gmp-platform/frontend
npm run verify:template-designer-react
npm run build
git diff --check
```

Then commit the fix with a scoped message:

```bash
git add gmp-platform/frontend/scripts/verify-template-designer-react.mjs \
  gmp-platform/frontend/src/pages/master-data/template-designer-react
git commit -m "fix: stabilize sub-table region designer QA"
```

---

## Self-Review

Spec coverage:

- Multi-cell `设为子表`: Task 3 and Task 5.
- Record-style object-array schema: Task 1 and Task 2 provide design JSON structure; runtime value storage is out of this plan because there is no fill runtime module in the current React designer.
- Fixed repeat: Task 2 infers fixed count; Task 6 exposes fixed count.
- Dynamic repeat row-only: Task 6 forces `row` direction when switching to dynamic.
- Row/column layout direction: Task 1 types it; Task 6 exposes it for fixed mode.
- Child field consumption and one field per cell: Task 4 keeps existing drop rules and syncs `recordTemplate.fields`.
- Cross-page region support: Task 1 stores `ranges`; Task 6 displays fragment count. Adding UI to append extra fragments is intentionally not included in this first code pass because current canvas selection is scoped to one active canvas page.
- Matrix support: Task 1 reserves `mode: 'matrix'` and `dimensions`; no matrix UI.
- Delete cascade: Task 4 verifies parent deletion still removes child field nodes.

Placeholder scan:

- No task uses unresolved placeholder markers or open-ended implementation wording.
- Each implementation task names exact files and verification commands.

Type consistency:

- `SubTableRegion` is stored as `CanvasNodeBindings.subTableRegion`.
- Store actions use `CanvasSelectionRange`, `CanvasNode`, and existing `FieldCellLayout`.
- Helper functions use the same `CanvasSelectionRange` shape already used by the sheet.
