# 表单列表任务交接说明

> 交接日期：2026-09-16  
> 适用仓库：`/Users/ivenwang/Documents/edhr-nexus`  
> 任务范围：全局表单实例列表页面（不是表单模板列表、表单追溯报表或表单审批工作列表）

## 1. 接手前必读

新上下文开始工作前，先读取：

- `AGENTS.md`
- `codeplzreadme.md`
- `docs/frontend/list-page-guidelines.md`
- `docs/knowledge/README.md`
- 与表单实例来源相关的知识资产，尤其是 `DEC-0054`

当前知识基线为 `knowledgeModelVersion: 0.3.20`、`schemaVersion: 1.1.0`。本页面最近的查询区和文案调整属于 **L0 纯 UI 变更**，没有改变业务规则、接口参数或数据库结构，因此本次不触发本体门禁。

## 2. 产品和业务口径

这里展示的是全局表单实例。当前实例来源由创建时持久化的 `sourceType` 决定，生产执行创建的实例使用 `PRODUCTION_EXECUTION`，页面显示为“生产执行”。不要根据实例号、入口按钮或前端页面推断来源；工序配置、作业发起、自定义表单等是生产执行内部的入口类型，不是全局来源枚举。

统一用户可见术语：

- `实例编号` 不再使用，统一为 **表单实例号**；
- `模板名称` 在列表查询和详情中显示为 **表单模板**；
- `模板编码` 显示为 **表单编码**；
- `记录状态` 显示为 **状态**；
- `生产对象号` 显示为 **生产对象**；
- `工单号` 显示为 **工单**。

当前阶段明确不增加：备注名、表单类型、详情/操作列。列表通过点击行或点击表单实例号进入详情抽屉。

## 3. 已完成的前端实现

目标页面：

- 页面：`gmp-platform/frontend/src/pages/form-management/FormInstanceListPage.tsx`
- API 客户端：`gmp-platform/frontend/src/api/form-instance-records.ts`
- 页面路由：`/form-management/list`

### 查询区

收起状态只显示两个高频条件，并将操作按钮放入第三列：

1. 表单实例号
2. 表单模板
3. 重置、查询、展开

展开后第一行增加表单编码；高级条件位于分隔区内：

- 生产对象
- 工单
- 生产对象类型
- 状态
- 创建时间起
- 创建时间止

展开使用 MUI `Collapse`，收起高级条件时不会清空已填写的值。展开状态的操作按钮位于条件区底部；窄屏时操作按钮自动换行。

### 列表区

默认列顺序为：

1. 表单实例号
2. 表单模板（同时显示模板版本）
3. 表单编码
4. 生产对象（对象号，同时显示批次/SN）
5. 工单
6. 工序
7. 创建时间
8. 更新时间
9. 来源
10. 状态

“来源”和“状态”是连续的右侧冻结列，横向滚动时必须保持贴右。左上方只有字段设置图标，不再放置多余的“表单记录”文字。字段设置支持：

- 显隐；
- 拖拽排序；
- 列宽拖拽；
- 按当前用户持久化到 localStorage。

列布局版本当前为 `5`，存储前缀为 `form-management-list-columns-`。新增或调整列时必须同步更新 `ColumnId`、`columns`、列渲染和布局迁移逻辑，并保持来源/状态在最后。

### 详情抽屉

点击行或表单实例号打开右侧详情抽屉，标签固定为“数据信息”和“数据审计”。详情中的关键字段使用“表单实例号、表单模板、表单编码、状态”等统一文案。

## 4. API 与后端边界

全局列表接口：

- `GET /api/v1/form-instances`
- `GET /api/v1/form-instances/{id}`
- `GET /api/v1/form-instances/by-number/{instanceNo}`

前端查询参数仍使用既有技术字段：`instanceNo`、`templateName`、`templateCode`、`productionObjectNo`、`productionObjectType`、`workOrderNo`、`recordStatus`、`createdFrom`、`createdTo`、`page`、`size` 等。UI 文案调整不能擅自改接口字段。

相关后端文件：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/FormInstanceQueryController.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormInstanceQueryService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/FormInstanceRecordController.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormInstanceRecordService.java`

生产执行保存实例时必须写入持久化来源；列表和详情读取持久化来源，不能把“生产执行”作为前端常量伪造出来。

## 5. 已执行验证

- `cd gmp-platform/frontend && npm run build`：通过；
- `git diff --check`：通过；
- 浏览器已验证收起/展开布局：收起只显示两个条件，展开显示表单编码和完整高级条件；
- 展开/收起不会丢失高级条件已填写的值；
- 页面源码中已无用户可见的“实例编号”文案。

## 6. 当前已知阻塞和处理边界

本地后端最近一次启动被 Liquibase 校验阻止，原因是数据库中已有变更集校验和与当前工作树不一致：

- `0002-seed-data.sql`
- `0084-form-worklist-permissions.sql`

因此 `/api/v1/form-instances` 可能返回 500。这是既有迁移/共享开发库状态问题，不是本次查询布局改动造成的。接手者不要为了让页面启动而直接修改这两个历史迁移文件或清理数据库；应先按团队数据库迁移约定确认处理方式，再做真实数据联调。

当前仓库工作树很脏，包含其他功能和知识资产的未提交改动。只查看和修改本页面时，限制在目标文件及必要测试，不能 reset、checkout 或清理无关改动。

## 7. 后续建议

1. 先解决本地 Liquibase 校验和问题，启动后端并用真实数据验证列表、详情和来源标签；
2. 在 1440px、1200px 和窄屏下复核查询区、表格内部横向滚动和右侧冻结列；
3. 若继续增加查询条件或列，先确认是否已有产品决策，不要仅因竞品截图就增加备注名、表单类型或操作列；
4. 涉及实例来源、状态、权限、审计或创建契约的改动要升级为 L1/L2，并重新按项目契约判定本体和质量门禁；
5. 任何新上下文都应以当前仓库源码和知识基线为准，不要沿用旧对话中“表单追溯就是表单列表”或“来源可以由入口推断”的旧假设。

