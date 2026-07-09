# Template Designer React Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the form-template design page in React so the version-row `设计` entry opens a full-screen designer that visually matches the current product layout, supports page thumbnails, canvas paging, selection and drag editing, and persists design JSON through the existing version design endpoint.

**Architecture:** Keep the existing template-modeling page as the entry point and replace the current JSON editor dialog with a real designer shell. Split the designer into focused pieces for top chrome, toolbar, left thumbnail rail, center canvas, and lightweight dialogs for source-file edit and simulation fill. Use the existing `saveFormTemplateVersionDesign` contract and parse legacy canvas JSON defensively so saved versions remain compatible.

**Tech Stack:** React 18, TypeScript, MUI, React Query, existing template-modeling API, Vite build, local browser QA.

---

### Task 1: Add designer data helpers and defaults

**Files:**
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerTypes.ts`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerDefaults.ts`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerUtils.ts`

- [ ] **Step 1: Define the designer schema**

```ts
export interface TemplateDesignerPage {
  id: string;
  pageNumber: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  title?: string;
  layers: TemplateDesignerLayer[];
}
```

- [ ] **Step 2: Add parser and fallback helpers**

```ts
export function parseTemplateDesignerState(input?: string | null): TemplateDesignerDocument
export function createFallbackTemplateDesignerDocument(rowName: string, versionLabel: string): TemplateDesignerDocument
export function serializeTemplateDesignerDocument(document: TemplateDesignerDocument): string
```

- [ ] **Step 3: Run a light type-check pass**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run build
```

Expected: fail later only because the new dialog is not wired yet, not because helper types are malformed.

### Task 2: Replace the dialog with a real designer shell

**Files:**
- Delete: `gmp-platform/frontend/src/pages/master-data/TemplateDesignerDialog.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerDialog.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerHeader.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerToolbar.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerSidebar.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerCanvas.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerPageThumb.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerInspector.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerDialogs.tsx`

- [ ] **Step 1: Write the failing dialog layout test in a browser verifier**

Add a structural check that the dialog renders:
- a dark top header
- `模型设计 / 表单设计 / 表单设置`
- a file import action
- a `保存设计` button with dropdown
- a left thumbnail rail capped at 300px
- a main A4 canvas area

- [ ] **Step 2: Implement the designer shell**

Move the full-screen dialog to the new folder and wire it to render:
- top bar
- mode tabs
- toolbar
- left rail
- page thumbnails
- canvas stage
- lightweight dialogs for source-file edit and simulation fill

- [ ] **Step 3: Keep page selection and scroll state**

Track the active page from the canvas scroll container and sync thumbnail highlighting plus click-to-scroll behavior.

- [ ] **Step 4: Run the frontend build**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run build
```

Expected: pass after the new dialog compiles.

### Task 3: Wire the template-modeling page entry and save flow

**Files:**
- Modify: `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`
- Modify: `gmp-platform/frontend/src/api/template-modeling.ts` if payload typing needs to expand

- [ ] **Step 1: Keep the version-row `设计` button as the entry**

Ensure the existing button opens the rewritten full-screen designer and loads the selected row/version state.

- [ ] **Step 2: Persist the current canvas JSON**

Serialize the designer state back into `modelDesignJson`, `canvasDesignJson`, and `workflowDesignJson` using the existing save mutation.

- [ ] **Step 3: Preserve the detail drawer and list page**

Do not disturb the existing template list, version rows, audit drawer, or category panel behavior.

### Task 4: Add a focused verification script and browser QA

**Files:**
- Create: `gmp-platform/frontend/scripts/verify-template-designer-pages.mjs`
- Modify: `gmp-platform/frontend/package.json`

- [ ] **Step 1: Add a structural verifier**

Check for the new React designer shell, page thumbnails, canvas stage, toolbar actions, and dropdown menu labels.

- [ ] **Step 2: Run build and verifier**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run build
npm run verify:template-designer
```

Expected: both pass.

- [ ] **Step 3: Open the page in a browser and inspect layout**

Confirm visually that the page is not blank, the canvas is centered and A4-proportioned, thumbnails are small, and the left rail stays narrow.
