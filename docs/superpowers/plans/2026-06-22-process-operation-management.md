# 工序管理改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按后台工作台标准改造工艺建模-工序管理，补齐工序分类、默认工序类型、三列查询区、左侧分类栏和标准字段展示。

**Architecture:** 继续复用 `ProcessModelingPage.tsx` 现有通用表格、字段设置、列宽持久化、详情抽屉、审计和分页能力。后端沿用 `ProcessModelingController`、`Operation` 和 `ProcessModelingRecord`，只扩展工序字段、查询条件、轻量分类列表和审计快照，不新增独立页面。

**Tech Stack:** React + MUI + TanStack Query，Spring Boot + JPA + Liquibase，现有 Node verifier 脚本。

---

### Task 1: 先写失败验证

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-process-modeling-pages.mjs`

- [ ] **Step 1: 增加工序管理标准断言**

验证脚本必须检查：
- `ProcessModelingPage.tsx` 包含 `operationCategory`、`defaultOperationType`、`工序通用描述`。
- `PROCESS_OPERATION_TYPES` 包含 `普通工序`、`关键工序`、`特殊过程`、`检验工序`、`外协工序`。
- 工序管理查询区具备名称/编码、分类、状态三项，按钮等高。
- 工序管理具备左侧分类栏，默认项文案为 `全部`。

- [ ] **Step 2: 运行验证并确认失败**

Run:

```bash
cd gmp-platform/frontend
npm run verify:process-modeling
```

Expected: FAIL，缺少上述新增断言对应的实现。

### Task 2: 后端扩展工序字段

**Files:**
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/Operation.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProcessModelingController.java`
- Add: `gmp-platform/backend/src/main/resources/db/changelog/0027-process-operation-standard-fields.sql`
- Modify: `gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml`

- [ ] **Step 1: 扩展实体字段**

为工序实体增加：
- `operationCategory`
- `generalDescription`
- `defaultOperationType`

- [ ] **Step 2: 扩展 DTO/快照/查询**

列表和详情返回新增字段；新增/编辑保存新增字段；查询支持 `operationCategory`；新增 `GET /api/v1/master-data/process-modeling/operations/categories` 返回全部分类及数量，避免左侧分类被分页数据截断。

- [ ] **Step 3: 增加数据库迁移**

新增列：

```sql
ALTER TABLE operation ADD COLUMN IF NOT EXISTS operation_category VARCHAR(128);
ALTER TABLE operation ADD COLUMN IF NOT EXISTS general_description TEXT;
ALTER TABLE operation ADD COLUMN IF NOT EXISTS default_operation_type VARCHAR(64) NOT NULL DEFAULT '普通工序';
```

### Task 3: 前端改造工序管理

**Files:**
- Modify: `gmp-platform/frontend/src/pages/master-data/ProcessModelingPage.tsx`
- Modify: `gmp-platform/frontend/src/api/master-data.ts`

- [ ] **Step 1: 扩展类型**

`ProcessModelingPayload`、`ProcessModelingRecord`、`ProcessModelingQuery` 增加：
- `operationCategory`
- `generalDescription`
- `defaultOperationType`

- [ ] **Step 2: 扩展列、字段和审计标签**

工序默认列包含：
- 工序名称
- 工序编码
- 工序分类
- 默认工序类型
- 状态
- 创建人
- 创建时间
- 更新人
- 更新时间

弹窗字段包含：
- 工序名称
- 工序分类
- 工序通用描述
- 默认工序类型

- [ ] **Step 3: 增加左侧分类栏**

仅在 `pageKey === 'operations'` 时展示左侧分类栏。默认项为 `全部`，分类项来自后端分类接口；点击分类后同步右侧查询。

- [ ] **Step 4: 查询区按一行三项**

工序管理查询项为：
- 工序名称/编码
- 工序分类
- 状态

查询、重置按钮保持 40px 高度并居右。

### Task 4: 验证

- [ ] **Step 1: 运行前端验证**

```bash
cd gmp-platform/frontend
npm run verify:process-modeling
```

- [ ] **Step 2: 运行前端构建**

```bash
cd gmp-platform/frontend
npm run build
```

- [ ] **Step 3: 运行后端测试**

```bash
cd gmp-platform/backend
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH mvn -Dtest=DatabaseChangelogTest test
```

- [ ] **Step 4: 浏览器 QA**

启动前后端后访问工艺建模-工序管理，确认：
- 左侧分类默认选中 `全部`。
- 查询区一行 3 个查询字段，不撑出横向滚动。
- 新增/编辑弹窗展示工序编码，且工序编码为用户必填字段。
- 默认工序类型为单选枚举。
- 表格滚动在表格内部，字段设置仍可用。
