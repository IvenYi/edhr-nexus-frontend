# Builtin Icon Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate Icon Management with the icons already used by the current system and render them as a protected builtin icon library.

**Architecture:** Store builtin icons as ordinary `icon_group` / `icon_asset` metadata with `source = BUILTIN`, no file upload dependency, and a stable `builtin_key` that maps to the Material UI icon component on the frontend. User-uploaded icons continue to use `file_id` and preview URLs. Builtin icons are visible in the same grid but cannot be deleted.

**Tech Stack:** Spring Boot, JPA, Liquibase formatted SQL, PostgreSQL, React, TypeScript, MUI, React Query, Vite.

---

## File Structure

- Modify: `gmp-platform/backend/src/main/resources/db/changelog/0003-system-icon-settings.sql`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/entity/IconAsset.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/repository/IconAssetRepository.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/system/controller/IconManagementController.java`
- Modify: `gmp-platform/backend/src/test/java/com/zencas/edhr/system/controller/IconManagementControllerTest.java`
- Modify: `gmp-platform/frontend/src/api/system.ts`
- Create: `gmp-platform/frontend/src/utils/builtinIcons.tsx`
- Modify: `gmp-platform/frontend/src/pages/system/IconManagementPage.tsx`
- Modify: `gmp-platform/frontend/scripts/verify-system-management-pages.mjs`

## Task 1: Backend Builtin Icon Contract

- [ ] Add tests proving `listGroups()` includes a `系统内置图标` group and `listIcons()` can return `BUILTIN` icons with `builtinKey`.
- [ ] Add tests proving single delete and batch delete reject builtin icons with a clear message.
- [ ] Add `builtin_key` column, builtin group seed, and builtin icon seed rows to `0003-system-icon-settings.sql`.
- [ ] Add `builtinKey` field to `IconAsset`.
- [ ] Protect builtin icon deletion in controller methods.

## Task 2: Frontend Builtin Icon Rendering

- [ ] Add `builtinKey` to `IconAsset` API type.
- [ ] Add a `builtinIcons.tsx` registry mapping current system icon keys to MUI components.
- [ ] Render builtin icons in `IconManagementPage` when `source === 'BUILTIN'`.
- [ ] Disable single and batch delete for builtin icons and show a tooltip explaining they are system builtin icons.
- [ ] Extend static verification to check `BUILTIN`, `builtinKey`, and the builtin registry.

## Task 3: Verification

- [ ] Run backend targeted tests.
- [ ] Run frontend static verifications and build.
- [ ] Restart backend, verify `/api/v1/system/icons` returns builtin icons.
- [ ] Browser QA: open `/system/icons` and confirm the grid shows builtin icons instead of the empty state.
