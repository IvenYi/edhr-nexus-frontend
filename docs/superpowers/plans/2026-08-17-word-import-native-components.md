# Word Import Native Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import new DOCX paragraphs and images as the same native canvas nodes created from the component library, while retaining Word tables as dedicated objects and leaving old templates unchanged.

**Architecture:** `importWord.ts` converts DOCX paragraphs into `static-text` nodes and DOCX media into `static-image` nodes using the existing page media source map. `wordDocument.blocks` contains only newly imported Word tables. Existing node rendering, Zustand history, selection, movement, styling, and deletion then apply to imported text and images without a second editing path. Existing saved templates retain their legacy Word paragraph/image blocks because `document.ts` does not migrate them.

**Tech Stack:** React 18, TypeScript, MUI 5, Zustand, Vite, Node source verifier.

---

### Task 1: Add red regression assertions for the approved behavior

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Test: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Add failing DOCX image-node assertions**

Require a native image conversion helper, image-node source lookup, a `static-image` node, and no new DOCX image block in `wordDocument`.

```js
if (!wordImportUtils.includes('buildWordImageNodes')) failures.push('importWord.ts: DOCX images must become static-image canvas nodes');
if (!wordImportUtils.includes("type: 'static-image'")) failures.push('importWord.ts: DOCX image nodes must use the standard static-image type');
if (!wordImportUtils.includes('mediaSrcById.get(image.mediaId)')) failures.push('importWord.ts: DOCX image nodes must retain their imported media source');
if (wordImportUtils.includes('word-doc-image-')) failures.push('importWord.ts: new DOCX images must not be persisted as Word image blocks');
```

- [ ] **Step 2: Add failing interaction-boundary assertions**

Require unmount to flush the color draft and reject Delete/Backspace when the key target is outside the free-canvas body. Require thumbnail rendering to use the source of a `static-image` node.

```js
if (!canvasToolbar.includes('commitDraftColorRef.current()')) failures.push('CanvasDesignerToolbar.tsx: unmount must flush the latest draft color without committing on ordinary rerenders');
if (!canvasWorkspace.includes('freeCanvasBodyRef.current?.contains(target)')) failures.push('CanvasSheetWorkspace.tsx: keyboard delete must be scoped to the free canvas body');
if (!pageThumbnails.includes("node.type === 'static-image'")) failures.push('CanvasPageThumbnails.tsx: thumbnail must render native image nodes');
```

- [ ] **Step 3: Run the verifier and confirm the expected red state**

Run: `cd gmp-platform/frontend && npm run verify:template-designer-react`

Expected: failure messages for image conversion, color unmount flush, free-canvas focus boundary, and thumbnail image rendering. Existing paragraph assertions remain green.

### Task 2: Convert newly imported DOCX images to native canvas nodes

**Files:**
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/importWord.ts`
- Test: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Add an image-node factory beside `buildWordParagraphNodes`**

Map each `CanvasSheetImage` to the matching imported media source. Skip a missing source so malformed media cannot break the rest of the import.

```ts
function buildWordImageNodes(images: CanvasSheetImage[], medias: CanvasSheetMedia[]): CanvasNode[] {
  const mediaSrcById = new Map(medias.map((media) => [media.id, media.src]));
  return images.flatMap((image) => {
    const src = mediaSrcById.get(image.mediaId);
    if (!src) return [];
    return [{
      id: `word-image-${image.id}`,
      type: 'static-image',
      parentId: null,
      children: [],
      props: { src, alt: '导入图片' },
      style: { position: 'absolute', compLeft: image.layout.left, compTop: image.layout.top, compWidth: image.layout.width, compHeight: image.layout.height },
      bindings: {},
    } satisfies CanvasNode];
  });
}
```

- [ ] **Step 2: Keep only tables in the new-import Word document**

Remove the image-block loop from `blocksToWordDocument`, keep its table construction unchanged, and keep paragraph height accounting so table positions still follow preceding paragraphs.

```ts
const nodes = [
  ...buildWordParagraphNodes(blocks, contentWidth),
  ...buildWordImageNodes(images, medias),
];
const wordDocument = blocksToWordDocument(blocks, contentWidth);
```

- [ ] **Step 3: Preserve media but not sheet-image overlays**

Continue persisting `medias` on the imported page for native image node sources, and keep `images: []` so a new import cannot render the same image as both an overlay and a node.

```ts
grid: {
  rowHeights: [DEFAULT_ROW_HEIGHT],
  columnWidths: [contentWidth],
  cells: {},
  mergedCells: [],
  medias,
  images: [],
}
```

- [ ] **Step 4: Run the verifier and confirm DOCX conversion is green**

Run: `cd gmp-platform/frontend && npm run verify:template-designer-react`

Expected: image conversion assertions pass; the color/focus/thumbnail assertions still identify remaining work.

### Task 3: Make imported native nodes safe in canvas and thumbnail interactions

**Files:**
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasDesignerToolbar.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasPageThumbnails.tsx`
- Test: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Preserve the original color target and clear Word-table selection when selecting a node**

Add the explicit range style action so deferred cell formatting writes through document history even after selection changes. Capture either the selected text node or a copied selected cell range before opening the native color picker. Notify the workspace before selecting a canvas node so a selected Word table cannot remain selected at the same time.

```ts
updateCellStyleInRange: (range, patch) => set((state) => pushDocumentHistory(state, {
  document: updateCanvasPage(state.document!, (page) => updatePageCellStyleInRange(page, range, patch)),
}));

type ColorCommitTarget =
  | { type: 'node'; nodeId: string }
  | { type: 'cell'; range: CanvasSelectionRange };

onNodeSelect?.();
setSelectedNodeId(node.id);
```

At the free-canvas renderer call site, pass `onNodeSelect={() => setSelectedWordTableBlockId(null)}`.

- [ ] **Step 2: Flush a pending color before toolbar unmount**

Replace the cleanup that only clears the timer with an unmount-only cleanup that calls the latest commit function through a ref. `commitDraftColor` already clears the timer, retains the original target, and ignores an unchanged color. The ref prevents a changed callback identity during normal rendering from prematurely committing the native picker draft.

```ts
const commitDraftColorRef = useRef(commitDraftColor);
commitDraftColorRef.current = commitDraftColor;

useEffect(() => () => commitDraftColorRef.current(), []);
```

- [ ] **Step 3: Scope keyboard deletion to the free-canvas body**

Keep the document listener so the canvas remains usable after selecting a node, but return unless the keyboard event target belongs to `freeCanvasBodyRef.current`. Preserve the existing content-editable and form-control exclusions.

```ts
const target = event.target instanceof Element ? event.target : null;
if (!target || !freeCanvasBodyRef.current?.contains(target)) return;
if (target.closest('[contenteditable="true"], input, textarea, select')) return;
```

- [ ] **Step 4: Render native images in page thumbnails**

Use the node image source when the thumbnail encounters a `static-image` node, while retaining the existing text preview branch and generic fallback for other node types.

```tsx
{node.type === 'static-image' ? (
  <Box component="img" src={String(node.props.src ?? '')} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
) : String(node.type === 'static-text' ? node.props.text ?? '' : node.props.label ?? node.type)}
```

- [ ] **Step 5: Run the verifier and confirm the full feature slice is green**

Run: `cd gmp-platform/frontend && npm run verify:template-designer-react`

Expected: exit code 0 with no failure messages.

### Task 4: Run L1 implementation checks and prepare independent validation

**Files:**
- Verify: `gmp-platform/frontend/scripts/verify-template-modeling-page.mjs`
- Verify: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
- Verify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/**`

- [ ] **Step 1: Run source, modeling, type, and build checks**

Run:

```bash
cd gmp-platform/frontend && npm run verify:template-modeling
cd gmp-platform/frontend && npm run verify:template-designer-react
cd gmp-platform/frontend && npm run build
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Perform targeted browser checks**

In a template-designer session, import a DOCX with text, image, and table. Verify imported text and image are normal selectable nodes; move, style, delete, and undo each. Verify the table remains editable and resizable. Select a node, focus a toolbar button, press Delete, and confirm the node remains. Change a color then immediately change page or close the designer, reopen it, and confirm the last color persists.

- [ ] **Step 3: Run one independent L1 quality review at the release checkpoint**

Provide the quality verifier with the L1 decision package: direct impact is DOCX-to-node representation and canvas interaction; extension path is `product-core`; old templates are explicitly excluded from migration; Excel table mode is unaffected. Require it to inspect actual working-tree paths and return a contract-compliant `qualityResult`.

- [ ] **Step 4: Record the ontology result**

Record `ontologyResult.result: not-applicable`: this change affects frontend document presentation and editing behavior only; it does not alter eDHR business concepts, lifecycle state, business rules, execution actions, audit semantics, permissions, or customer business explanations. Do not modify `docs/knowledge/**`.
