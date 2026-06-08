# GCT eDHR Full Spec Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement every page and acceptance capability described in `GCT_eDHR_功能详细规格与AI实现提示词.md` as a demonstrable GCT eDHR module.

**Architecture:** Keep the existing React + MUI frontend and Spring Boot backend intact. Add a parallel `/gct-edhr/*` frontend module driven by generated page metadata, plus a backend `/api/v1/gct/**` facade with generic page specs, records, actions, status history, audit events, and a demo-chain API. Existing `/master-data`, `/workflow`, `/system`, auth, and current APIs remain available.

**Tech Stack:** React 18, TypeScript, MUI 5, Zustand, Vite, Node.js metadata generation/verification scripts, Spring Boot 3.3, Java 21, in-memory GCT record store for first-pass demonstration, existing audit/security utilities.

---

## Coverage Target

The source document contains 99 pages:

- 操作面板: 1
- 基础建模: 24
- 生产管理: 13
- 检验管理: 10
- 放行管理: 4
- 记录管理: 17
- 统计报表: 17
- 系统管理: 13

Page type distribution:

- `master`: 40
- `list`: 22
- `report`: 11
- `transaction`: 9
- `execution`: 8
- `approval`: 6
- `dashboard`: 3

## File Structure

- Create: `scripts/gct/generate-gct-specs.mjs`
  - Parses `GCT_eDHR_功能详细规格与AI实现提示词.md` and generates frontend/backend specs from the same source.
- Create: `gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs`
  - Verifies generated metadata covers all 99 pages, unique routes, menu links, and type distribution.
- Create: `gmp-platform/frontend/src/features/gct-edhr/types.ts`
  - Frontend metadata and record/audit/status types.
- Create: `gmp-platform/frontend/src/features/gct-edhr/metadata/generatedPages.ts`
  - Generated 99 page metadata.
- Create: `gmp-platform/frontend/src/features/gct-edhr/metadata/generatedMenus.ts`
  - Generated GCT menu metadata.
- Create: `gmp-platform/frontend/src/features/gct-edhr/utils/fieldInfer.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/utils/actionPolicy.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/utils/mockDataFactory.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/api/mockEdhrClient.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/store/mockEdhrStore.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/EdhrQueryBar.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/EdhrDataTable.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/EdhrToolbar.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/PermissionButton.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/DetailDrawer.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/FormDialog.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/StateTransitionDialog.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/AuditPanel.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/adapters/ExecutionPanel.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/adapters/ApprovalPanel.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/adapters/ReportPanel.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/adapters/DashboardPanel.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/components/DemoChainPanel.tsx`
- Create: `gmp-platform/frontend/src/features/gct-edhr/pages/GenericEdhrPage.tsx`
- Modify: `gmp-platform/frontend/src/router/index.tsx`
  - Adds `/gct-edhr/*` route.
- Modify: `gmp-platform/frontend/src/utils/constants.ts`
  - Adds generated GCT menu module.
- Modify: `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
  - Supports `/gct-edhr` active module and fixes current tab title derivation from actual pathname.
- Create: `gmp-platform/backend/src/main/resources/gct/gct-page-specs.json`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/dto/GctPageSpecDto.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/dto/GctRecordDto.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/dto/GctActionRequest.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/dto/GctActionResultDto.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/dto/GctPermissionButtonDto.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/dto/GctStatusHistoryDto.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/service/GctPageRegistry.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/service/GctRecordService.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/service/GctActionService.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/service/GctPermissionService.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/service/GctStatusService.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/service/GctAuditService.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/store/GctRecordStore.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/store/InMemoryGctRecordStore.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/controller/GctPageController.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/controller/GctRecordController.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/gct/controller/GctDemoFlowController.java`

## Task 1: Generated Spec Metadata And Coverage Guard

**Files:**
- Create: `scripts/gct/generate-gct-specs.mjs`
- Create: `gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs`
- Create: `gmp-platform/frontend/src/features/gct-edhr/types.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/metadata/generatedPages.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/metadata/generatedMenus.ts`
- Create: `gmp-platform/backend/src/main/resources/gct/gct-page-specs.json`

- [ ] **Step 1: Write the failing frontend coverage verifier**

Create `gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs` to import the generated metadata and assert:

```js
import { pathToFileURL } from 'node:url';

const pagesModule = await import(pathToFileURL(new URL('../src/features/gct-edhr/metadata/generatedPages.ts', import.meta.url)).href).catch(() => null);
const menusModule = await import(pathToFileURL(new URL('../src/features/gct-edhr/metadata/generatedMenus.ts', import.meta.url)).href).catch(() => null);

const failures = [];
if (!pagesModule?.GCT_EDHR_PAGES) failures.push('missing GCT_EDHR_PAGES export');
if (!menusModule?.GCT_EDHR_MENU_MODULE) failures.push('missing GCT_EDHR_MENU_MODULE export');

if (failures.length) {
  console.error('GCT eDHR coverage verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('GCT eDHR coverage verification passed.');
```

- [ ] **Step 2: Run verifier and confirm RED**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-gct-edhr-coverage.mjs
```

Expected: FAIL because generated metadata files do not exist.

- [ ] **Step 3: Create frontend types**

Create `gmp-platform/frontend/src/features/gct-edhr/types.ts` with types for page metadata, fields, actions, records, audit entries, and status history.

- [ ] **Step 4: Create metadata generator**

Create `scripts/gct/generate-gct-specs.mjs`. It must parse all `###` page sections in the markdown and write:

- Frontend `generatedPages.ts`
- Frontend `generatedMenus.ts`
- Backend `gct-page-specs.json`

Generation rules:

- 99 pages must be generated.
- Page paths use `/gct-edhr/<module>/<group>/<page>` ASCII kebab slugs.
- Chinese labels stay in `label/title`.
- Fields are deduplicated; leading `*` sets `required: true`.
- Query/list/detail/form/actions are extracted from the document.
- Type distribution must match the source document.

- [ ] **Step 5: Run generator and update verifier**

Run:

```bash
node scripts/gct/generate-gct-specs.mjs
cd gmp-platform/frontend
node scripts/verify-gct-edhr-coverage.mjs
```

Then expand the verifier to assert:

- exactly 99 pages
- route uniqueness
- page code uniqueness
- module counts 1/24/13/10/4/17/17/13
- type counts 40/22/11/9/8/6/3
- every menu leaf maps to a page path

- [ ] **Step 6: Run verifier, frontend build, and commit**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-gct-edhr-coverage.mjs
npm run build
```

Commit:

```bash
git add scripts/gct/generate-gct-specs.mjs gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs gmp-platform/frontend/src/features/gct-edhr/types.ts gmp-platform/frontend/src/features/gct-edhr/metadata/generatedPages.ts gmp-platform/frontend/src/features/gct-edhr/metadata/generatedMenus.ts gmp-platform/backend/src/main/resources/gct/gct-page-specs.json
git commit -m "feat: generate gct edhr page metadata"
```

## Task 2: Frontend Route And App Shell Integration

**Files:**
- Modify: `gmp-platform/frontend/src/router/index.tsx`
- Modify: `gmp-platform/frontend/src/utils/constants.ts`
- Modify: `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
- Test: `gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs`

- [ ] **Step 1: Extend verifier for route/menu shell checks**

Add checks that source files contain:

- `/gct-edhr/*`
- `GCT_EDHR_MENU_MODULE`
- `pathname.startsWith('/gct-edhr')`
- `const currentModuleForPath`
- `getCurrentPageTitle(currentModuleForPath, location.pathname)`

- [ ] **Step 2: Confirm RED**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-gct-edhr-coverage.mjs
```

Expected: FAIL because route/menu/app-shell integration is missing.

- [ ] **Step 3: Add `/gct-edhr/*` route**

Lazy import `GenericEdhrPage` and mount it under protected `AppLayout`.

- [ ] **Step 4: Add GCT menu module**

Import `GCT_EDHR_MENU_MODULE` and append it to `SIDEBAR_MODULES`.

- [ ] **Step 5: Fix AppLayout tab title**

Keep module browsing behavior, but derive the current tab label from `autoModuleId` / actual `location.pathname`, not from `activeModuleId`.

- [ ] **Step 6: Verify and commit**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-gct-edhr-coverage.mjs
npm run build
```

Commit:

```bash
git add gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs gmp-platform/frontend/src/router/index.tsx gmp-platform/frontend/src/utils/constants.ts gmp-platform/frontend/src/components/shared/AppLayout.tsx
git commit -m "feat: mount gct edhr routes and menus"
```

## Task 3: Frontend Mock Data Client And Store

**Files:**
- Create: `gmp-platform/frontend/src/features/gct-edhr/utils/fieldInfer.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/utils/actionPolicy.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/utils/mockDataFactory.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/api/mockEdhrClient.ts`
- Create: `gmp-platform/frontend/src/features/gct-edhr/store/mockEdhrStore.ts`
- Test: `gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs`

- [ ] **Step 1: Extend verifier for mock capability**

Assert source contains functions for deterministic mock records, pagination, filtering, sorting, create, update, logical delete, action handling, audit append, and status history append.

- [ ] **Step 2: Confirm RED**

Run verifier and confirm it fails for missing mock client/store.

- [ ] **Step 3: Implement field inference and action policy**

Map Chinese field names to field types and map action labels to action codes/status transitions.

- [ ] **Step 4: Implement deterministic mock data factory**

Generate 20 records per page using metadata fields and system fields.

- [ ] **Step 5: Implement mock client/store**

Support query/reset behavior, pagination, sorting, create/edit/detail, copy/version, disable/delete, process/approve/reject/release/print/download actions, audit entries, and status history.

- [ ] **Step 6: Verify and commit**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-gct-edhr-coverage.mjs
npm run build
```

Commit:

```bash
git add gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs gmp-platform/frontend/src/features/gct-edhr/utils gmp-platform/frontend/src/features/gct-edhr/api gmp-platform/frontend/src/features/gct-edhr/store
git commit -m "feat: add gct edhr mock data client"
```

## Task 4: Generic Frontend Page Components

**Files:**
- Create component files under `gmp-platform/frontend/src/features/gct-edhr/components/`
- Create: `gmp-platform/frontend/src/features/gct-edhr/pages/GenericEdhrPage.tsx`
- Test: `gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs`

- [ ] **Step 1: Extend verifier for generic UI coverage**

Assert `GenericEdhrPage` renders query, toolbar, table, details, form dialog, state transition dialog, audit panel, and type-specific adapters.

- [ ] **Step 2: Confirm RED**

Run verifier and confirm missing generic UI files.

- [ ] **Step 3: Implement common components**

Build compact MUI query bar, toolbar, permission buttons, table, drawer, form dialog, state transition dialog, and audit panel using metadata.

- [ ] **Step 4: Implement type adapters**

Add execution, approval, report, and dashboard panels so special page types are not just plain CRUD.

- [ ] **Step 5: Implement `GenericEdhrPage`**

Find metadata from path, render title/subtitle, type adapter, common table/detail/form/action surfaces, and a demo chain entry for workbench/dashboard pages.

- [ ] **Step 6: Verify and commit**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-gct-edhr-coverage.mjs
npm run build
```

Commit:

```bash
git add gmp-platform/frontend/scripts/verify-gct-edhr-coverage.mjs gmp-platform/frontend/src/features/gct-edhr/components gmp-platform/frontend/src/features/gct-edhr/pages/GenericEdhrPage.tsx
git commit -m "feat: render gct edhr generic pages"
```

## Task 5: Backend GCT Facade

**Files:**
- Create backend `gct` package files listed in File Structure.
- Test: backend Maven test/package commands.

- [ ] **Step 1: Write failing backend tests**

Add focused tests for:

- page registry loads 99 specs
- record service paginates mock records
- action service writes status history
- audit service writes audit event DTO through existing repository boundary or test double

- [ ] **Step 2: Confirm RED**

Run:

```bash
cd gmp-platform/backend
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn -Dtest=GctPageRegistryTest,GctRecordServiceTest,GctActionServiceTest test
```

Expected: FAIL because `gct` package does not exist.

- [ ] **Step 3: Implement DTOs, registry, store, services, and controllers**

Use in-memory store for first-pass demonstration. All action endpoints must re-check permission and append audit/status history.

- [ ] **Step 4: Verify and commit**

Run:

```bash
cd gmp-platform/backend
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn -Dtest=GctPageRegistryTest,GctRecordServiceTest,GctActionServiceTest test
mvn -DskipTests package
```

Commit:

```bash
git add gmp-platform/backend/src/main/java/com/zencas/edhr/gct gmp-platform/backend/src/test/java/com/zencas/edhr/gct gmp-platform/backend/src/main/resources/gct/gct-page-specs.json
git commit -m "feat: add gct edhr backend facade"
```

## Task 6: Demo Chain And End-To-End Verification

**Files:**
- Modify frontend GCT demo chain components/client as needed.
- Modify backend `GctDemoFlowController` as needed.
- Test: frontend verifier/build, backend tests/package, browser QA.

- [ ] **Step 1: Verify 99 route smoke**

Add a script or browser automation that iterates all generated frontend paths and verifies the page title and at least one action/table surface.

- [ ] **Step 2: Verify main demo chain**

Run the chain:

基础建模 -> 工单 -> 批次/SN -> 生产执行 -> 检验执行 -> 放行 -> 表单/DHR -> 打印 -> 追溯报表

Expected: every step creates or transitions a GCT record and appends status history/audit entries.

- [ ] **Step 3: Browser QA desktop/mobile**

Check:

- `/gct-edhr/workbench/dashboard`
- representative master page
- representative execution page
- representative approval page
- representative report page
- representative dashboard page

- [ ] **Step 4: Final verification**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
node scripts/verify-gct-edhr-coverage.mjs
npm run build

cd ../backend
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn test
mvn -DskipTests package
```

- [ ] **Step 5: Commit**

Commit any final fixes:

```bash
git add gmp-platform/frontend gmp-platform/backend
git commit -m "test: verify gct edhr full spec flow"
```

## Self-Review Checklist

- Spec coverage: metadata generator must produce 99 pages and preserve every page title, type, query field, list field, form/detail field, action, boundary, API suggestion, acceptance standard, and AI prompt text from the source document.
- Routing coverage: every generated menu item maps to a valid `/gct-edhr/*` route.
- Behavior coverage: all pages support query, reset, pagination, sorting, detail, permission-controlled actions, status history, and audit panel.
- Special type coverage: execution, approval, transaction, report, and dashboard pages have type-specific UI beyond a plain table.
- Demo coverage: final chain runs from master modeling to trace report.
- Safety: existing routes and current business pages remain intact.
