# System Icon Library And Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real backend-persisted Icon Management and System Settings pages under System Management.

**Architecture:** Reuse the existing `file_object` upload/preview/delete infrastructure for binary assets. Add dedicated metadata tables and controllers for icon groups, icon assets, and tenant-level system settings, then wire React pages, routes, sidebar menu defaults, permissions, and app-shell runtime branding.

**Tech Stack:** Spring Boot, JPA, Liquibase formatted SQL, PostgreSQL, React, TypeScript, MUI, React Query, Vite.

---

## File Structure

- Modify: `gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml`
- Create: `gmp-platform/backend/src/main/resources/db/changelog/0003-system-icon-settings.sql`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/entity/IconGroup.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/entity/IconAsset.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/entity/SystemSetting.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/repository/IconGroupRepository.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/repository/IconAssetRepository.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/repository/SystemSettingRepository.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/controller/IconManagementController.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/controller/SystemSettingsController.java`
- Create: `gmp-platform/backend/src/test/java/com/zencas/edhr/system/controller/IconManagementControllerTest.java`
- Create: `gmp-platform/backend/src/test/java/com/zencas/edhr/system/controller/SystemSettingsControllerTest.java`
- Modify: `gmp-platform/frontend/src/utils/constants.ts`
- Modify: `gmp-platform/frontend/src/utils/menuManagement.ts`
- Modify: `gmp-platform/frontend/src/router/index.tsx`
- Modify: `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
- Modify: `gmp-platform/frontend/src/pages/LoginPage.tsx`
- Create: `gmp-platform/frontend/src/api/system.ts`
- Create: `gmp-platform/frontend/src/hooks/useSystemBranding.ts`
- Create: `gmp-platform/frontend/src/pages/system/IconManagementPage.tsx`
- Create: `gmp-platform/frontend/src/pages/system/SystemSettingsPage.tsx`
- Create: `gmp-platform/frontend/scripts/verify-system-management-pages.mjs`
- Modify: `gmp-platform/frontend/package.json`

## Task 1: Backend Tests First

- [x] **Step 1: Create controller tests for icon management**

Create `IconManagementControllerTest.java` with tests covering:

```java
@Test
void refusesToDeleteGroupWhenIconsExist() {}

@Test
void batchDeleteRemovesIconMetadataAndAttemptsFileCleanup() {}

@Test
void reordersGroupsAndIcons() {}
```

Run:

```bash
JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home \
PATH="/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home/bin:$PATH" \
mvn test -Dtest=IconManagementControllerTest
```

Expected before implementation: compile failure because controller/entity classes do not exist.

- [x] **Step 2: Create controller tests for system settings**

Create `SystemSettingsControllerTest.java` with tests covering:

```java
@Test
void returnsDefaultPublicSettingsWhenNoRowExists() {}

@Test
void updatesTextSettingsAndWritesAudit() {}

@Test
void uploadLogoUpdatesSettingsFileReference() {}
```

Run:

```bash
JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home \
PATH="/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home/bin:$PATH" \
mvn test -Dtest=SystemSettingsControllerTest
```

Expected before implementation: compile failure because controller/entity classes do not exist.

## Task 2: Backend Implementation

- [x] **Step 1: Add Liquibase changeset**

Create `0003-system-icon-settings.sql` with `icon_group`, `icon_asset`, `system_setting`, two new permissions, and ADMIN role-permission inserts.

- [x] **Step 2: Add entities and repositories**

Add JPA entities matching the migration columns. Use `@PrePersist` and `@PreUpdate` for timestamps.

- [x] **Step 3: Add icon management controller**

Implement CRUD, order updates, upload/import, single delete and batch delete. Reuse file storage behavior for validation and physical file cleanup.

- [x] **Step 4: Add system settings controller**

Implement public read, authenticated read/update, logo upload, favicon upload, and asset delete endpoints.

- [x] **Step 5: Run backend target tests**

Run:

```bash
JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home \
PATH="/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home/bin:$PATH" \
mvn test -Dtest=IconManagementControllerTest,SystemSettingsControllerTest
```

Expected after implementation: all tests pass.

## Task 3: Frontend Verification First

- [ ] **Step 1: Create static verification script**

Create `verify-system-management-pages.mjs` checking:

```js
[
  '/system/icons',
  '/system/settings',
  '图标管理',
  '系统设置',
  'system.icons',
  'system.settings',
  'getSystemSettings',
  'applySystemBranding',
]
```

- [ ] **Step 2: Add npm script**

Add:

```json
"verify:system-management-pages": "node scripts/verify-system-management-pages.mjs"
```

Run:

```bash
npm run verify:system-management-pages
```

Expected before frontend implementation: fails because routes/pages/API are missing.

## Task 4: Frontend Implementation

- [ ] **Step 1: Add API client methods**

Create `src/api/system.ts` with icon group, icon asset and settings methods using `/api/v1` axios client.

- [ ] **Step 2: Add branding hook**

Create `useSystemBranding.ts` to fetch public settings, update document title and favicon, and expose branding to layout/login pages.

- [ ] **Step 3: Add menus and route entries**

Update `constants.ts`, `menuManagement.ts`, and `router/index.tsx`.

- [ ] **Step 4: Add IconManagementPage**

Build a two-column workbench: left grouping panel, right icon query/action bar and icon grid.

- [ ] **Step 5: Add SystemSettingsPage**

Build a form for system name, browser title, logo upload/preview/delete and favicon upload/preview/delete.

- [ ] **Step 6: Run frontend verification**

Run:

```bash
npm run verify:system-management-pages
npm run build
```

Expected after implementation: verification and build pass.

## Task 5: Integrated QA

- [ ] **Step 1: Start backend**

Run:

```bash
JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home \
PATH="/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home/bin:$PATH" \
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

- [ ] **Step 2: Start or reuse frontend**

Run if port 3000 is not already active:

```bash
npm run dev -- --host 127.0.0.1 --port 3000
```

- [ ] **Step 3: Browser QA**

Verify:

- System Management contains Icon Management and System Settings.
- Role permission dialog shows the two new menus.
- Icon upload/import/list/delete/batch delete works.
- Group add/rename/reorder/delete works.
- System settings save updates app shell title and browser title immediately.

- [ ] **Step 4: Cleanup QA data**

Remove any temporary icon groups, icon assets, file objects and settings values created for QA.
