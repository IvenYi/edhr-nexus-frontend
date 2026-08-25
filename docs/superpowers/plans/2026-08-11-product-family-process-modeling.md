# 产品簇制程建模 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在产品簇页面建立半成品/产成品成员关系，并让产品和产品簇共用同一套可审计的制程版本配置与生产兜底查询。

**Architecture:** 在现有 `product_process` 上增加 `owner_type + owner_id`，保留并迁移旧 `product_version_id`；所有版本、工序、表单和文档绑定表继续复用。新增产品簇成员关系表和 owner-aware 制程服务，产品旧接口保留兼容入口。前端将产品簇路由从通用主数据表切换为复用产品管理的父子表格、详情审计抽屉、成员维护弹窗和制程版本编辑器。

**Tech Stack:** Spring Boot/JPA, PostgreSQL/Liquibase, JUnit 5/Mockito, React/TypeScript, MUI, TanStack Query, existing Playwright/browser verification scripts.

---

## Task 1: 修复知识模型多决策校验并验证 0.3.1

**Files:**
- Modify: `gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java:54-67`
- Read/verify: `docs/knowledge/schema.yaml`, `docs/knowledge/decisions/DEC-0001-product-process-modeling.yaml`, `docs/knowledge/decisions/DEC-0002-product-family-process-modeling.yaml`
- Test: `gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java`

- [ ] **Step 1: Write the failing regression test**

Change `nestedCollectionsAreDiscoveredFromSchemaMappings` so it mutates the mapped nested collection field for every record in `records(model, "decision")`, not only `firstRecord(model, "decision")`. Keep the existing schema mutation (`decisionStatements` -> `statements`) and assert the validator accepts both DEC-0001 and DEC-0002.

```java
List<Map<String, Object>> decisions = records(model, "decision");
for (Map<String, Object> decision : decisions) {
    decision.put("statements", decision.remove("decisionStatements"));
}
```

- [ ] **Step 2: Run the focused test and verify the current failure is reproduced**

Run:

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest#nestedCollectionsAreDiscoveredFromSchemaMappings test
```

Expected before the fix: failure mentioning DEC-0002 and `decisionStatements`.

- [ ] **Step 3: Implement the schema-driven test fix**

Apply the loop to all decision records and leave the validator production logic unchanged; this test must verify that schema mappings, not a single fixture record, control nested collection discovery.

- [ ] **Step 4: Run the formal knowledge gate**

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest test
```

Expected: all knowledge model tests pass. Record this as ontology gate evidence and update the ontology result from `conflict` to `updated` only after the command passes.

- [ ] **Step 5: Commit the knowledge gate repair**

```bash
git add gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java docs/knowledge
git commit -m "fix: validate multiple knowledge decisions"
```

## Task 2: Add product-family membership and unified process-owner migration

**Files:**
- Create: `gmp-platform/backend/src/main/resources/db/changelog/0053-product-family-process-owner.sql`
- Modify: `gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductFamilyMember.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcess.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/repository/ProductFamilyMemberRepository.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/repository/ProductProcessRepository.java`
- Test: `gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/repository/ProductFamilyMemberRepositoryTest.java`

- [ ] **Step 1: Write migration/entity tests**

Cover member persistence, unique family/product ownership, and rejection of a material whose resolved type is neither `半成品` nor `产成品`.

```java
assertThat(memberRepository.findByTenantIdAndProductId("default", productId)).isPresent();
assertThat(memberRepository.findByTenantIdAndProductId("default", productId).get().getProductFamilyId())
        .isEqualTo(familyId);
```

- [ ] **Step 2: Run focused tests and verify the current failure**

```bash
cd gmp-platform/backend
mvn -Dtest=ProductFamilyMemberRepositoryTest,ProcessModelingControllerTest test
```

Expected: missing entity/repository/service behavior until the migration and implementation are added.

- [ ] **Step 3: Create the Liquibase migration**

Create `product_family_member` with tenant, family, material, audit fields, foreign keys to `product_family(id)` and `material(id)`, a unique index on `(tenant_id, product_family_id, product_id)`, and a unique index on `(tenant_id, product_id)`.

Add nullable `owner_type VARCHAR(32)` and `owner_id BIGINT` to `product_process`. Backfill existing rows with `owner_type = 'PRODUCT'` and `owner_id = product_version_id`, then make owner fields non-null. Make the legacy `product_version_id` nullable for product-family roots, preserve the existing product unique index for compatibility, and add a unique owner index on `(tenant_id, owner_type, owner_id)`.

Use idempotent DDL in the existing Liquibase style and register the changeset after `0052` in `db.changelog-master.yaml`.

- [ ] **Step 4: Implement entities and repositories**

`ProductFamilyMember` must expose tenant, family, product/material ID, and audit fields with the same lifecycle conventions as `ProductFamily`. `ProductProcess` must expose `ownerType` and `ownerId` while retaining `productVersionId` for compatibility. Add repository methods for owner lookup, member lookup, product ownership lookup, and counts used by list rows.

- [ ] **Step 5: Run migration and focused tests**

```bash
cd gmp-platform/backend
mvn -Dtest=ProductFamilyMemberRepositoryTest,ProcessModelingControllerTest test
```

Expected: PASS, including empty-database schema boot and existing product-process tests.

- [ ] **Step 6: Commit the persistence slice**

```bash
git add gmp-platform/backend/src/main/resources/db/changelog/0053-product-family-process-owner.sql gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductFamilyMember.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcess.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/repository/ProductFamilyMemberRepository.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/repository/ProductProcessRepository.java gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/repository/ProductFamilyMemberRepositoryTest.java
git commit -m "feat: add product family process ownership"
```

## Task 3: Implement product-family CRUD, membership transactions, and audit

**Files:**
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProductFamilyController.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductFamilyMembershipService.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProcessModelingController.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/dto/ProductFamilyMemberResponse.java`
- Create: `gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/ProductFamilyControllerTest.java`
- Create: `gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/service/ProductFamilyMembershipServiceTest.java`

- [ ] **Step 1: Write membership and audit tests**

Cover ineligible material rejection, ordinary add rejection for products owned by another family, and successful transfer. The successful transfer must assert one member row remains, the old family no longer contains it, the new family contains it, and three audit events are written with generic `CREATE`/`UPDATE`/`DELETE` semantics.

```java
assertThatThrownBy(() -> service.addMembers(familyId, List.of(rawMaterialId)))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("半成品或产成品");
```

- [ ] **Step 2: Run focused tests and verify missing behavior**

```bash
cd gmp-platform/backend
mvn -Dtest=ProductFamilyControllerTest,ProductFamilyMembershipServiceTest test
```

- [ ] **Step 3: Implement the membership service**

Implement `@Transactional` add, remove, and transfer operations. Resolve material type names from `MaterialTypeRepository`; reject every type other than `半成品` and `产成品`. Ordinary add must reject products already owned by another family. Transfer must delete the old relation and insert the new relation in one transaction, with no reason field. Delete of a family with members or process versions must be blocked to avoid orphaned configuration.

- [ ] **Step 4: Implement family list/detail/member endpoints**

Return parent-row member/version counts without embedding child arrays in page data. Add member options with current-family selection, owning-family display, and eligibility status. Add detail and audit endpoints that aggregate family, member, process-version, operation, form, and document audit records without inventing new action enum values.

- [ ] **Step 5: Run backend tests and verify transaction rollback**

```bash
cd gmp-platform/backend
mvn -Dtest=ProductFamilyControllerTest,ProductFamilyMembershipServiceTest,ProcessModelingControllerTest test
```

Add a failure-in-the-middle test confirming the old relation is restored when the new relation or audit write fails.

- [ ] **Step 6: Commit the membership slice**

```bash
git add gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProductFamilyController.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductFamilyMembershipService.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProcessModelingController.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/dto/ProductFamilyMemberResponse.java gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/ProductFamilyControllerTest.java gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/service/ProductFamilyMembershipServiceTest.java
git commit -m "feat: manage product family members"
```

## Task 4: Extract owner-aware process version APIs and fallback resolution

**Files:**
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessOwnerService.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/dto/ProcessOwnerType.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProductProcessController.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/repository/ProductProcessRepository.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionService.java`
- Test: `gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/service/ProductProcessOwnerServiceTest.java`
- Test: `gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionServiceTest.java`

- [ ] **Step 1: Write owner-aware version tests**

Test that product and product-family owners use the same version builder and reject duplicate labels independently:

```java
service.createVersion(ProcessOwnerType.PRODUCT_FAMILY, familyId, request("V1.0"));
assertThatThrownBy(() -> service.createVersion(ProcessOwnerType.PRODUCT_FAMILY, familyId, request("v1.0")))
        .hasMessageContaining("版本");
service.createVersion(ProcessOwnerType.PRODUCT, productId, request("V1.0"));
```

Test route/DHR/form/document/PDF-page validation and `UPDATE` audit for both owner types.

- [ ] **Step 2: Write fallback resolution tests**

At a fixed `LocalDateTime`, cover:
1. Product has active version: return only product versions, `fallback=false`.
2. Product has only expired/future versions and family has active version: return only family versions, `fallback=true`, exact Chinese message.
3. Neither owner has an active version: throw the production-selection business exception with a clear message.
4. Product has no family: do not attempt a family query and return the no-version block.

- [ ] **Step 3: Extract common owner-aware service behavior**

Move process-root creation, version copy, reference validation, operation binding replacement, version snapshots, and audit writing from the product-only controller into `ProductProcessOwnerService`. Validate `ownerType` and `ownerId` before every operation. Keep product endpoints as adapters that call the service with `PRODUCT` and preserve current response shapes.

- [ ] **Step 4: Add product-family version endpoints**

Expose `/process-owners/{ownerType}/{ownerId}/workspace`, version CRUD, and version audit using the shared service. Product-family requests must resolve a `ProductFamily`; product requests must resolve an eligible material. Reuse existing process-version response and operation response structures.

- [ ] **Step 5: Implement fallback resolution as a pure service contract**

Use `RdoVersionStatusResolver.isReferenceable` with supplied `atTime`; never select a persisted current flag. Return source, fallback flag, message, and versions. Do not create production snapshots until the production module exists.

- [ ] **Step 6: Run process tests and existing regression tests**

```bash
cd gmp-platform/backend
mvn -Dtest=ProductProcessControllerTest,ProductProcessOwnerServiceTest,ProductProcessResolutionServiceTest test
```

- [ ] **Step 7: Commit the owner-aware process slice**

```bash
git add gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessOwnerService.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionService.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/dto/ProcessOwnerType.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProductProcessController.java gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/repository/ProductProcessRepository.java gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/service/ProductProcessOwnerServiceTest.java gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionServiceTest.java
git commit -m "feat: share process configuration owners"
```

## Task 5: Build the product-family modeling page and shared member/version interactions

**Files:**
- Create: `gmp-platform/frontend/src/pages/master-data/ProductFamilyModelingPage.tsx`
- Create: `gmp-platform/frontend/src/pages/master-data/components/ProductFamilyMemberDialog.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/components/ProductProcessVersionEditorDialog.tsx`
- Modify: `gmp-platform/frontend/src/api/product-modeling.ts`
- Modify: `gmp-platform/frontend/src/api/master-data.ts`
- Modify: `gmp-platform/frontend/src/router/index.tsx`
- Modify: `gmp-platform/frontend/src/pages/master-data/ProductModelingPage.tsx`
- Test: `gmp-platform/frontend/src/pages/master-data/ProductFamilyModelingPage.test.tsx`
- Modify: `gmp-platform/frontend/scripts/verify-process-modeling-pages.mjs`

- [ ] **Step 1: Add frontend API types and write interaction tests**

Add typed APIs for family list/detail/audit, members, batch add, transfer, remove, and owner-aware process workspace/version CRUD. Test that a parent row expands with an empty process state; the member dialog filters to eligible products; current members remain selected after a preview interaction; other-family products are disabled and show transfer; transfer confirmation includes old and new family names; and the version editor opens with `ownerType=PRODUCT_FAMILY` but the same fields and route graph.

- [ ] **Step 2: Run focused frontend tests and verify failures**

```bash
cd gmp-platform/frontend
npm test -- ProductFamilyModelingPage.test.tsx
```

- [ ] **Step 3: Implement the parent/child table**

Use dimensions, sticky operation column, column settings, status badge, blue parent-name link, empty/loading/error states, and icon ordering from `ProductModelingPage.tsx`. Do not add a “view parent product” icon or an audit icon. Parent operations are members, add version, edit, delete; child operations match product management.

- [ ] **Step 4: Implement details and members**

Use the existing detail drawer pattern with `数据信息` and `数据审计` tabs. Implement the two-column member dialog with search, batch selection, current members, disabled other-family members, transfer confirmation, ordinary remove confirmation, and one persistent fallback tip. Keep selection state independent from form/document preview state.

- [ ] **Step 5: Reuse the process version editor**

Add owner props without duplicating the editor. Product-family mode changes only the owner identity shown in read-only context and the API owner path. Preserve route selection, route graph, operation configuration, form/document previews, PDF page range, save/cancel, dirty-cancel confirmation, copy, and audit behavior.

- [ ] **Step 6: Switch the product-family route and update visual verification**

Point `/master-data/product-families` to `ProductFamilyModelingPage`. Extend `verify-process-modeling-pages.mjs` to assert required columns/actions, no audit action icon, member transfer strings, owner-aware process calls, empty expandable state, and the fallback tip.

- [ ] **Step 7: Run frontend checks**

```bash
cd gmp-platform/frontend
npm test -- ProductFamilyModelingPage.test.tsx
npm run build
node scripts/verify-process-modeling-pages.mjs
```

- [ ] **Step 8: Commit the frontend slice**

```bash
git add gmp-platform/frontend/src/pages/master-data/ProductFamilyModelingPage.tsx gmp-platform/frontend/src/pages/master-data/components/ProductFamilyMemberDialog.tsx gmp-platform/frontend/src/pages/master-data/components/ProductProcessVersionEditorDialog.tsx gmp-platform/frontend/src/api/product-modeling.ts gmp-platform/frontend/src/api/master-data.ts gmp-platform/frontend/src/router/index.tsx gmp-platform/frontend/src/pages/master-data/ProductModelingPage.tsx gmp-platform/frontend/src/pages/master-data/ProductFamilyModelingPage.test.tsx gmp-platform/frontend/scripts/verify-process-modeling-pages.mjs
git commit -m "feat: add product family process modeling page"
```

## Task 6: Full verification, ontology evidence, and independent quality gate

**Files:**
- Read/verify: all files changed by Tasks 1-5
- Modify only if required by a failed test: the owning file from the task that introduced the failure
- Evidence: `docs/knowledge/evidence/product-process.yaml` and final quality handoff output

- [ ] **Step 1: Run full backend verification**

```bash
cd gmp-platform/backend
mvn test
```

Expected: backend unit, controller, migration, and knowledge tests pass.

- [ ] **Step 2: Run full frontend verification**

```bash
cd gmp-platform/frontend
npm test
npm run build
node scripts/verify-process-modeling-pages.mjs
```

- [ ] **Step 3: Execute browser visual and CRUD verification**

With frontend and backend running, verify:
1. Product-family empty state and expandable parent row.
2. Create/edit/detail/audit/delete flow.
3. Member add, duplicate prevention, transfer confirmation, remove, and reload persistence.
4. Create/edit/copy/delete two family process versions.
5. Route graph, operation form/document configuration, PDF page range, and dirty-cancel behavior.
6. Product-first/family-fallback service responses using seeded data.

Capture desktop and narrow viewport screenshots for the list, member dialog, detail audit tab, and full-screen version editor. Check that the sticky action column, tree indentation, empty state, and dialog content do not overlap.

- [ ] **Step 4: Dispatch independent quality verification**

Provide the quality agent with exact base/head commits, knowledge baseline `0.3.1`, affected files, database migration, acceptance scenarios, and browser evidence. It must only report findings and return `qualityResult: passed` before completion.

- [ ] **Step 5: Address findings and run clean re-verification**

For any high/critical issue, use a fresh quality agent after the fix. For low/medium issues, the original verifier may recheck only the affected scenario if it did not participate in the fix.

- [ ] **Step 6: Update knowledge evidence and final status**

After implementation and tests pass, update affected knowledge evidence paths and promote only implemented, tested configuration rules to `implemented`; keep production snapshot and runtime fallback integration `specified` until the production module consumes the resolver. Run:

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest test
```

Record `ontologyResult.result: updated` and `qualityResult.result: passed` with exact commands and commit hashes.

- [ ] **Step 7: Final review and push preparation**

```bash
git diff --check
git status --short --branch
git log --oneline --decorate -8
```

Do not stage or revert the pre-existing untracked `.superpowers/` directory.
