# Common Component Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a reusable common-component library for free-canvas drawing without coupling imported Word blocks or Excel table-mode data to that library.

**Architecture:** A pure registry owns the approved component catalogue and default node factory. The component panel only renders that registry; the free workspace receives click and drag events and delegates node creation to the Zustand store.

**Tech Stack:** React 18, TypeScript, MUI 5, Zustand, Vite, Node verification script.

---

### Task 1: Replace Word-block management with a common component registry

**Files:**
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer-react/registry/commonComponentRegistry.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/types/canvas.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/document.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/importWord.ts`
- Test: `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`

- [x] **Step 1: Write the failing registry verifier**

Require the ten approved labels in order and assert that text, line, and header-column factory calls create absolute-position nodes.

- [x] **Step 2: Run the verifier and observe failure**

Run: `npm run verify:template-designer-react`

Observed: the missing `commonComponentRegistry.ts` entry point caused the verifier to fail.

- [x] **Step 3: Add the pure catalogue and remove Word component metadata**

Add `commonDisplayComponents` and `createCommonDisplayNode`; remove Word block metadata, selection, lock, hide, rename, and deletion paths so DOCX blocks remain a content layer.

- [x] **Step 4: Run the verifier**

Run: `npm run verify:template-designer-react`

Expected: exit code 0.

### Task 2: Render and insert common components

**Files:**
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/ComponentLibrary.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx`

- [x] **Step 1: Add a fixed two-column component library**

Use the registry only. Cards are drag sources and dispatch a click insert event; insertions are enabled only in free mode.

- [x] **Step 2: Add free-canvas insertion**

Create `addFreeCanvasComponent`, calculate client-to-canvas coordinates in the workspace, and support both native HTML drag and click insertion.

- [x] **Step 3: Add dedicated renderers**

Implement simple designer renderers for line, barcode, QR code, and header columns, and display a safe image placeholder when no source exists.

- [x] **Step 4: Verify static and production builds**

Run: `npm run verify:template-designer-react && npm run build`

Expected: both commands exit code 0.

### Task 3: Independent quality verification

**Files:**
- Verify: affected component-library, canvas workspace, store, registry, DOCX import, Excel import verifier paths

- [x] **Step 1: Run an independent code and regression review**

Confirm the library does not import or mutate Word blocks and no Excel table-mode code was changed.

- [x] **Step 2: Review fresh verification output**

Run: `npm run verify:template-designer-react && npm run build && git diff --check`

Expected: all commands exit code 0.
