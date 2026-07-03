# React Host + Vue Designer Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary React designer rewrite with an embedded Vue online-form designer inside the current `gmp-platform` template-modeling page, while keeping the existing version-row `设计` entry and version save endpoint intact.

**Architecture:** React stays the host shell and owns list state, version state, permissions, dialog open/close, and saving to `saveFormTemplateVersionDesign`. The Vue online-form designer runs as an embedded sub-application behind a narrow `postMessage` bridge, so the Vue app keeps its own canvas UI and interaction model while the host supplies the current template/version context and receives save/dirty events back. The initial delivery uses an iframe-backed bridge because it preserves the Vue app unchanged and keeps the integration surface small.

**Tech Stack:** React 18, TypeScript, MUI, React Query, browser `postMessage`, Vite, Vue 3, the migrated `gmp-platform/frontend/vendor/online-form-designer` online-form designer, and the existing Spring Boot template-modeling API.

---

### Task 1: Replace the React self-built designer with a host shell and bridge

**Files:**
- Modify: `gmp-platform/frontend/src/pages/master-data/TemplateDesignerDialog.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerBridge.ts`
- Create: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerHostFrame.tsx`
- Create: `gmp-platform/frontend/vendor/online-form-designer`
- Modify: `gmp-platform/frontend/package.json`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerCanvas.tsx`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerDialogs.tsx`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerHeader.tsx`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerInspector.tsx`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerPageThumb.tsx`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerSidebar.tsx`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/TemplateDesignerToolbar.tsx`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerDefaults.ts`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerTypes.ts`
- Delete: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerUtils.ts`
- Delete: `gmp-platform/frontend/scripts/verify-template-designer-pages.mjs`

- [ ] **Step 1: Write the failing host-shell verifier**

Create a new verifier script that fails against the current React rewrite because the old canvas components are still present and the host shell is not yet wired to an iframe bridge.

```js
mustInclude(content, 'TemplateDesignerHostFrame', 'designer dialog should mount the embedded Vue host');
mustInclude(content, 'postMessage', 'designer dialog should talk to the child app through a bridge');
mustNotInclude(content, 'TemplateDesignerCanvas', 'old React canvas implementation should no longer be the entry');
```

- [ ] **Step 2: Implement the minimal React host shell**

Keep the public dialog props unchanged, but make the dialog render only:

```tsx
<TemplateDesignerHostFrame
  templateId={row.id}
  versionId={version.id}
  templateName={row.name}
  versionLabel={version.version}
  authToken={localStorage.getItem('token') || ''}
  onSave={onSave}
  onClose={onClose}
/>
```

The host frame should:

- build the Vue designer URL
- load the iframe
- send the initial template/version snapshot after the child reports `ready`
- receive `save-request`, `dirty-change`, `close-request`, and `error` events
- keep the current full-screen modal behavior

- [ ] **Step 3: Update the React verifier and build**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run verify:template-designer
npm run build
```

Expected: the verifier passes after the host shell exists, and the build still succeeds after the obsolete React designer files are removed.

---

### Task 2: Teach the Vue online-form designer to run in hosted mode

**Files:**
- Modify: `gmp-platform/frontend/vendor/online-form-designer/package.json`
- Modify: `gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form/src/views/integration/apaas_dp/designer/apaas-dp-print.vue`
- Modify: `gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form/src/views/designer/hooks/usePrint.ts`
- Modify: `gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/header.vue`
- Modify: `gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form/src/views/designer/hooks/useSpreadSheet.ts` if the hosted save callback needs a small hook point
- Create: `gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form/src/views/designer/bridge/template-designer-protocol.ts`
- Create: `gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form/src/views/designer/bridge/template-designer-host.ts`
- Update: `gmp-platform/frontend/scripts/verify-template-designer-pages.mjs`

- [ ] **Step 1: Write the failing bridge-contract verifier**

Add a small script that asserts the online-form designer entry can switch into hosted mode and that the bridge protocol names are present.

```js
mustInclude(content, 'hosted', 'designer entry should support hosted bootstrap');
mustInclude(content, 'save-request', 'hosted designer should emit save requests');
mustInclude(content, 'dirty-change', 'hosted designer should report dirty state');
mustInclude(content, 'close-request', 'hosted designer should ask the parent to close');
```

- [ ] **Step 2: Add hosted bootstrap and bridge handling**

Implement a small bridge module that:

- listens for the host `init` payload
- receives the initial designer snapshot from React
- forwards save requests back to the host
- forwards close requests back to the host instead of calling `history.back()`
- keeps the existing Vue canvas, toolbar, thumbnails, and page behavior unchanged once the hosted snapshot is mounted

Use a minimal protocol shape:

```ts
type TemplateDesignerBridgeEvent =
  | { type: 'ready' }
  | { type: 'dirty-change'; dirty: boolean }
  | { type: 'save-request'; payload: { modelDesignJson: string; canvasDesignJson: string; workflowDesignJson: string } }
  | { type: 'close-request' }
  | { type: 'error'; message: string };
```

- [ ] **Step 3: Add dedicated online-form dev/build scripts and verify them**

Add scripts that can build and run the online-form entry directly, then run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run designer:build
```

Expected: the online-form entry builds successfully after the hosted bootstrap is in place.

---

### Task 3: Add a version snapshot adapter between current template versions and the Vue designer

**Files:**
- Modify: `gmp-platform/frontend/src/pages/master-data/template-designer/templateDesignerBridge.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/TemplateDesignerDialog.tsx`
- Modify: `gmp-platform/frontend/src/api/template-modeling.ts` only if the bridge needs an explicit helper type

- [ ] **Step 1: Write the failing snapshot adapter test**

Cover two behaviors:

1. opening the dialog on an existing version produces a deterministic hosted snapshot
2. save from the Vue child still writes through `saveFormTemplateVersionDesign`

```ts
const snapshot = buildHostedDesignerSnapshot(row, version);
expect(snapshot.versionId).toBe(version.id);
expect(snapshot.designerPayload).toBeDefined();
```

- [ ] **Step 2: Implement the adapter**

The adapter should:

- read the current template/version row from `TemplateModelingPage`
- turn the version record into a hosted designer snapshot
- keep the current `modelDesignJson` / `canvasDesignJson` / `workflowDesignJson` columns as the save target
- treat legacy React-rewrite JSON as best-effort only; do not force a fragile migration if the shape is not reliable

Use a narrow host payload:

```ts
type HostedDesignerSnapshot = {
  templateId: string | number;
  versionId: string | number;
  templateName: string;
  versionLabel: string;
  designerPayload: {
    modelDesignJson: string;
    canvasDesignJson: string;
    workflowDesignJson: string;
  };
};
```

- [ ] **Step 3: Keep the list-page and save mutation behavior unchanged**

The version-row `设计` button should still open the same full-screen dialog, and a successful save should still invalidate the template list and audit queries.

---

### Task 4: Run build, visual QA, and message-bridge smoke tests

**Files:**
- Modify: `gmp-platform/frontend/package.json`
- Modify: `gmp-platform/frontend/vendor/online-form-designer/package.json`
- Create or update: the two verifier scripts above

- [ ] **Step 1: Run both build pipelines**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run build

cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run designer:build
```

Expected: both commands exit 0.

- [ ] **Step 2: Run browser QA on the full flow**

Verify in the browser:

- clicking version-row `设计` opens the designer inside the current page
- the Vue designer is visible, not the React rewrite
- save goes back to the version design endpoint
- close returns to the list page
- the iframe is not blank and the child app loads its toolbar and canvas
- an existing version still opens even if it only has the older React-rewrite payload, with a safe fallback instead of a crash

- [ ] **Step 3: Keep the bridge contract small**

If QA exposes a missing event or payload field, extend the bridge protocol first instead of adding direct DOM coupling or cross-app global state.
