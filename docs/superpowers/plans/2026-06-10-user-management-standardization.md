# 用户管理标准化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将组织管理下“用户管理”页改造成与“组织架构”页人员工作台一致的后台操作页面。

**Architecture:** 保持组织架构页不做大规模重构，先在 `UserPage.tsx` 内复用同一套交互模式和视觉标准，并用独立静态校验脚本锁住用户管理页的关键约束。后续多个页面稳定后再抽公共组件。

**Tech Stack:** React 18、TypeScript、MUI、TanStack Query、Vite、现有 eDHR API。

---

### Task 1: 标准文档和静态校验

**Files:**
- Create: `docs/design-audit/organization-management-ui-standard.md`
- Create: `gmp-platform/frontend/scripts/verify-user-management-layout.mjs`
- Modify: `gmp-platform/frontend/package.json`

- [ ] **Step 1: 写用户管理静态校验脚本**

校验脚本读取 `src/pages/system/UserPage.tsx`，断言查询区、表格列、列宽持久化、行点击抽屉、审计 Tab、用户弹窗、右上角 Snackbar 和禁止旧文案等标准。

- [ ] **Step 2: 运行校验确认失败**

Run: `node scripts/verify-user-management-layout.mjs`

Expected: FAIL，至少缺少查询区、详情抽屉、审计、列宽持久化。

- [ ] **Step 3: 增加 package 脚本**

在 `package.json` 中加入：

```json
"verify:user-management": "node scripts/verify-user-management-layout.mjs"
```

### Task 2: 用户管理页标准化

**Files:**
- Modify: `gmp-platform/frontend/src/pages/system/UserPage.tsx`

- [ ] **Step 1: 引入组织架构页人员工作台标准**

在 `UserPage.tsx` 中实现：
- 查询区：姓名、账号、状态、手机号、创建时间范围。
- 表格列：选择、姓名、账号、手机号、所属组织、岗位角色、状态、创建人、创建时间、操作。
- 可拖拽列宽和当前用户持久化。
- 图标操作：编辑、重置密码、删除账号。
- 行点击详情抽屉：数据信息、数据审计。
- 用户弹窗：账号、姓名、所属组织、岗位角色必填；角色单选；编辑账号禁用；邮箱/手机号校验。

- [ ] **Step 2: 审计数据接入**

使用 `getAuditLogs({ entityType: 'USER_ACCOUNT', entityId: selectedUser?.id })` 查询真实审计。空态显示“暂无审计记录”。

- [ ] **Step 3: API 错误提示**

保存、删除、重置密码失败时通过 `getApiErrorMessage` 显示后端具体错误。

### Task 3: 验证和 QA

**Files:**
- Verify: `gmp-platform/frontend/src/pages/system/UserPage.tsx`
- Verify: `gmp-platform/frontend/scripts/verify-user-management-layout.mjs`

- [ ] **Step 1: 运行静态校验**

Run: `npm run verify:user-management`

Expected: PASS。

- [ ] **Step 2: 运行既有组织架构校验**

Run: `npm run verify:organization`

Expected: PASS，确认模板页未被破坏。

- [ ] **Step 3: 运行前端构建**

Run: `npm run build`

Expected: PASS，仅允许既有 chunk size warning。

- [ ] **Step 4: 浏览器 QA**

打开 `/system/users`，确认查询区、表格列、列宽拖拽、行点击抽屉、数据审计 Tab、新增/编辑用户弹窗、重置密码和删除确认都能正常打开或显示反馈。
