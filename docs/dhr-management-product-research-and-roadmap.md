# DHR 管理模块：调研、产品规划与首版决策交接

> 本文补充 `docs/dhr-management-handoff.md`。前者回答“产品为什么这样设计、后续准备怎么做”，后者回答“如何接手当前代码和本地环境”。新上下文必须同时阅读两份文档。

## 0. 文档用途和证据等级

这不是一份凭空重新设计的 PRD，而是此前 DHR 调研、用户确认、参考矩阵分析和首版开发结果的连续记录。阅读时必须区分：

- **用户确认**：用户在讨论中明确收敛的产品策略，优先级最高。
- **原始实现证据**：当前仓库中的源码、数据库迁移、接口和测试。
- **知识基线**：`docs/knowledge/` 中已经结构化的业务决策、规则、事实和证据。
- **参考资料**：冠骋功能矩阵截图、旧 PRD 和竞品行为，只用于发现能力和交互形态，不能直接当成当前需求。
- **方案建议/待确认**：为了后续实现提出的设计，不得误写成已经确认或已经实现。

当前知识基线版本为 `0.3.23`，首版 DHR 决策为 `DEC-0062`。

## 1. DHR 模块要解决的业务问题

DHR（Device/Batch History Record，在本项目中是面向生产对象的电子生产历史记录）不是一份简单的批次报告，也不是把多个表单值复制到一个新表里。它的核心是：

1. 以一个实际生产对象作为唯一业务锚点。
2. 在生产开始时锁定当时生效的工单、产品、制程、路线、DHR 模板和目录上下文。
3. 按 DHR 目录项收集和组织生产过程证据。
4. 保留证据的来源、版本、副本和审计关系，而不是破坏或复制原始表单。
5. 在生产完成、汇总、审核、发布/归档等阶段形成可追溯的生命周期闭环。

首版只先打通“生产开始 → DHR 实例 → 生产表单证据 → DHR 列表/详情 → 生产完成同步”的最小闭环，后续再加入汇总、补充、审批和发布。

## 2. 调研结论：现有系统能复用什么、还缺什么

### 2.1 已有能力和可复用基础（原始源码核对）

#### 生产对象和开工事务

- 现有生产执行、生产对象、工单模型同时支持 `BATCH` 和 `SN`。
- 生产执行服务已经有首次合法 `START`、生产对象状态和事务边界。
- 因此 DHR 创建应挂在首次合法 `START` 的同一事务中，而不是让用户事后随意补建。
- 生产执行完成全部工序时有明确的完成动作，可以在同一事务同步 DHR 状态。

相关代码：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionSnapshotBuilder.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/entity/ProductionObject.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/entity/WorkOrder.java`

#### 表单实例和证据来源

- `form_instance_record` 已经保存生产表单实例记录、业务来源、快照、值、版本和 `copy_id`。
- 生产执行来源使用 `source_type=PRODUCTION_EXECUTION`。
- 表单快照中已经有冻结的 `dhrItemId`，可用于把来源记录匹配到 DHR 模板目录项。
- `copyId` 代表同一目录项的不同副本，不能在汇总时错误合并。
- DHR 应该保存“来源记录关联”，而不是重新生成一份脱离来源的表单副本。

相关代码：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormInstanceRecordService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormInstanceQueryService.java`
- `gmp-platform/backend/src/main/resources/db/changelog/0082-form-instance-records.sql`

#### DHR 模板、目录和制程绑定

- 系统已有 DHR 模板、模板版本、目录、目录项和表单绑定模型。
- 已有 DHR 模板版本目录快照，适合在 DHR 实例创建时冻结。
- 已有产品制程版本与 DHR 模板版本的绑定基础。
- 模板后续发布新版本时，不能静默改写已经开始生产的 DHR。

相关迁移和页面：

- `gmp-platform/backend/src/main/resources/db/changelog/0035-dhr-template-workspace.sql`
- `gmp-platform/backend/src/main/resources/db/changelog/0049-product-process-dhr-item-binding.sql`
- `gmp-platform/frontend/src/pages/master-data/DhrTemplateWorkspaceDialog.tsx`

#### 流程中心、状态机和审计

- 现有流程中心已经有流程模板、流程实例、节点、待办、已办、退回、转办和日志能力。
- 当前已有表单变更、表单作废等流程分类和状态机基础。
- DHR 汇总审批应复用现有流程引擎，新增业务分类/绑定，不应另造一套孤立的审批系统。
- 现有权限、审计和删除保护机制可复用到 DHR 实例、证据关联和汇总版本。

相关代码：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/`
- `gmp-platform/frontend/src/pages/workflow-center/`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/deletion/`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/`

### 2.2 当前系统的关键缺口

调研时系统还缺少一套完整的 DHR 实例管理闭环，主要缺口是：

1. 没有生产对象到唯一 DHR 实例的持久化关系和唯一约束。
2. 没有在首次合法开工时创建 DHR 的事务逻辑。
3. 没有 DHR 创建时的生产/模板/目录快照。
4. 没有按 `dhrItemId` 和 `copyId` 组织生产表单证据的 DHR 只读投影。
5. 没有 DHR 列表、详情接口和菜单权限。
6. 没有 DHR 缺失时阻断生产完成的保护。
7. 没有 DHR 汇总草稿、候选证据、人工挂载、汇总版本和审批绑定。
8. 生产、检验、灭菌、物料、记录本、批次拆分等模块并不都已经提供统一的 DHR 证据来源契约，因此不能在首版做空壳的跨模块汇总。

## 3. 冠骋功能矩阵的参考内容和本项目的解释

用户提供的功能矩阵包含四块：DHR 填报、DHR 汇总、DHR 审核、DHR 列表。它是重要的竞品/参考输入，但不是当前实现清单。

### 3.1 DHR 填报

参考矩阵的行为是：针对批次/SN 下没有 DHR 的情况创建 DHR，然后进入填报界面。

本项目的收敛决定是更严格地把创建时点放到生产事务中：

- BATCH 和 SN 都属于首版正式支持范围。
- 首次合法 `START` 时系统自动创建 DHR。
- 不允许通过一个事后手工按钮绕过生产开工创建 DHR。
- 首版页面先提供列表和只读详情，不把“DHR 填报”误做成一套独立的自由编辑表单。

未来如果需要“DHR 填报”，它应解释为对目录证据完整性和人工补充的受控处理，而不是任意修改已冻结来源表单。

### 3.2 DHR 汇总

参考矩阵描述了：

- “待汇总”和“已汇总”两个页签；
- 待汇总可进行汇总处理；
- 已汇总可查看详情或退回重新整理；
- 将生产预处理、生产事务、返工、附录、检验、检验事务、检验附录、灭菌、记录本、批次拆分、关联表单和关联 DHR 等候选证据放入目录；
- 汇总完成后可直接汇总，也可进入审核流程，并由开关控制。

本项目接受其“候选证据整理 + 受控汇总”的业务方向，但不原样照搬其中的临时流程选择。实现时应把拖拽理解为快捷交互，底层动作必须是：

```text
将一个有来源的表单/业务证据记录
关联到某个 DHR 实例
的某个汇总草稿版本
的某个目录项
```

拖拽不能移动原表单、复制表单值、改变原工序归属或修改已冻结的历史汇总版本。

### 3.3 DHR 审核

参考矩阵包含“我的待办”和“我的已办”。本项目后续可以复用流程中心的待办/已办、审批、退回、转办、签名和审计能力。

审核对象必须是已经冻结的 DHR 汇总版本，而不是一个仍可被拖拽修改的实时查询结果。退回后修改下一版草稿，不修改审批中或已审核版本。

### 3.4 DHR 列表

参考矩阵要求所有 DHR 可查看详情，并覆盖生产、灭菌、物料等模块。

本项目首版先提供基于生产对象的 DHR 列表和只读详情；只有当其他模块提供真实、可追溯的证据来源契约后，才逐步加入跨模块详情。

参考矩阵中可能存在“进行中主动创建/作废”等操作，但本项目首版不据此新增手工创建或作废状态。任何新增生命周期动作都必须单独完成状态机、权限、审计和用户确认。

## 4. 首版之前已经收敛的用户决策

以下是首版开发时已经确定的边界，后续上下文不得重新推翻或偷偷扩大：

### 4.1 BATCH 和 SN 同期支持

旧 PRD 中“批次优先、SN 后续”的表述已经落后于当前生产执行和表单实例能力。用户确认：

- DHR 首个正式切片同时支持 BATCH 和 SN；
- 两者使用同一套 DHR 实例、目录、证据和生命周期模型；
- 不能为 BATCH 和 SN 建两套逻辑；
- 验收必须同时覆盖 BATCH 和 SN。

### 4.2 DHR 创建时点和唯一性

- 生产对象是 DHR 的唯一业务锚点。
- BATCH/SN 在首次合法 `START` 时自动创建一个 DHR。
- 创建与生产开工在同一事务中，任一环节失败则整体回滚。
- 每个租户 + 生产对象最多一个有效 DHR。
- 拆分、未开工或取消阶段不创建有效 DHR。
- 首版禁止手工创建 DHR，避免绕过生产执行上下文。

### 4.3 创建时冻结上下文

DHR 创建时冻结：

- 工单和工单号；
- 产品和产品编码；
- 生产对象和对象类型；
- 产品制程版本；
- 工艺路线版本；
- DHR 模板版本；
- DHR 模板目录快照。

后续发布新模板或修改制程配置不能改写已经开始生产的 DHR。

### 4.4 首版证据聚合

- 自动聚合的首版来源是同一生产对象下的 `PRODUCTION_EXECUTION` 表单实例记录。
- 只有快照中有 `dhrItemId` 的记录才能自动匹配目录项。
- 每个 `copyId` 单独保留，不能把不同副本合并成一份。
- work-bound 和 direct-form 复用同一个来源实例时只引用一次。
- 没有目录映射的记录进入未映射区或不自动纳入有效目录项。
- 当前首版不是跨所有业务模块的正式汇总器。

### 4.5 生产完成阻断

- 进入 DHR 闭环的生产执行必须具有关联 DHR。
- 全部工序完成时必须同步把 DHR 置为 `COMPLETED`。
- 如果关联 DHR 缺失，完成动作必须失败并回滚生产状态，不能静默跳过。

### 4.6 首版页面、权限和菜单

- 首版提供 DHR 列表和只读详情。
- 菜单权限：`records.dhr-management`。
- 查询权限：`dhr.instances.view`。
- 初始化默认只授予 `ADMIN`。
- 首版不提供汇总审批、退回、发布、归档、作废、拖拽补充和人工证据挂载。

### 4.7 历史数据策略（明确选择不回填）

用户明确选择方案 A：忽略历史数据，不回填历史 DHR。

这表示：

- 功能上线前已经开工或完成的旧 BATCH/SN 不强制生成 DHR；
- 不在本体知识中增加历史兼容或历史回填策略；
- 不伪造旧操作员、旧创建时间、旧审核状态或旧汇总结果；
- 只保证新 DHR 建立后，新生产数据和新功能正常闭环；
- 当前数据库 `dhr_instance` 为 0 不代表迁移失败。

此前讨论过的 `SYSTEM/BASELINE` 是受控回填的解释，不是当前实现要求；除非用户未来重新确认，否则不要实现。

## 5. 首版已经实现的内容与代码映射

### 5.1 数据库和权限

- `gmp-platform/backend/src/main/resources/db/changelog/0089-dhr-instance-management.sql`
- 创建 DHR 实例、编号序列、唯一约束、菜单和权限初始化。
- 已确认 Liquibase 变更集 `0089-dhr-instance-management::codex` 在本地 PostgreSQL 成功执行。
- 已确认 `ADMIN` 拥有 `records.dhr-management` 和 `dhr.instances.view`。

### 5.2 后端

- `DhrInstanceService.createAtFirstStart`：首次开工创建实例、冻结上下文和目录。
- `DhrInstanceService.completeWithProductionObject`：生产完成时同步 DHR，缺失实例则阻断。
- `DhrInstanceService.list`：DHR 列表查询和筛选。
- `DhrInstanceService.detail`：只读详情和生产表单证据聚合。
- `DhrInstanceController`：列表、详情和权限保护接口。
- `ProductionExecutionService`：在生产执行事务中接入 DHR 创建/完成。

### 5.3 前端

- `gmp-platform/frontend/src/pages/dhr-management/DhrManagementPage.tsx`
- `gmp-platform/frontend/src/api/dhr-instances.ts`
- `gmp-platform/frontend/src/router/index.tsx`
- `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
- `gmp-platform/frontend/src/utils/menuManagement.ts`

### 5.4 知识基线

- `docs/knowledge/decisions/DEC-0062-dhr-instance-management-phase1.yaml`
- `docs/knowledge/rules/dhr-instance-management.yaml`
- `docs/knowledge/facts/dhr-instance-management.yaml`
- `docs/knowledge/evidence/dhr-instance-management.yaml`
- `docs/knowledge/implementation-anchors/dhr-instance-management.yaml`
- `docs/knowledge/README.md`

知识基线已修复到 `0.3.23`，并处理了重复 DEC ID 和版本不一致问题。

## 6. 后续产品规划：按依赖顺序推进

### 阶段 0：新上下文接管和首版冒烟验收

目标：确认新上下文真的在本地项目中，并确认首版功能可见、可访问。

步骤：

1. 选择 `edhr-nexus` 项目的 Local 环境和 `edhr-dev`。
2. 阅读本文件和 `docs/dhr-management-handoff.md`。
3. 检查工作区，不覆盖用户改动。
4. 启动后端和前端。
5. 退出登录、重新登录并刷新。
6. 验收 DHR 菜单、空列表、详情路由、后端权限和未授权访问。

完成条件：环境、分支、服务、菜单和权限均与本交接一致。

### 阶段 1：首版真实闭环验收和问题修复

目标：不增加产品范围，只把首版从“代码和测试通过”推进到“真实页面和业务数据闭环”。

验收场景：

1. BATCH 首次合法 START 自动建 DHR。
2. SN 首次合法 START 自动建 DHR。
3. 重复/并发 START 不生成第二个 DHR。
4. 拆分、未开工、取消不生成有效 DHR。
5. 模板或制程后续变化不改写已创建实例快照。
6. 带 `dhrItemId` 的生产表单正确归档，不同 `copyId` 分别保留。
7. 无 `dhrItemId` 的来源不会伪装成有效目录证据。
8. 最后一个工序完成时 DHR 同事务完成。
9. 缺失 DHR 时生产完成动作回滚。
10. ADMIN 能看，未授权角色不能看，菜单和接口权限一致。

### 阶段 2：DHR 汇总草稿和候选证据

目标：把“生产对象上自动生成的 DHR 目录”扩展为“可受控整理的 DHR 汇总草稿”。

推荐页面布局：

- 左侧：DHR 模板目录树；
- 中间：当前目录项已归集的证据；
- 右侧：按生产、返工、附录、检验、灭菌、记录本、批次拆分和关联 DHR 分类的候选证据。

推荐交互：

- 拖拽到目录：高频快捷操作；
- 多选后“加入目录”：批量操作；
- 候选项操作菜单“添加到 DHR”：窄屏和无障碍替代操作。

底层数据模型必须是“来源记录关联到 DHR 汇总草稿版本的目录项”，不能复制或移动原表单。

前置条件：每一种候选来源必须有明确的来源 ID、所属生产对象、有效状态、版本、权限和审计字段。没有真实来源契约的模块不能只做一个空分类。

### 阶段 3：DHR 汇总流程配置和审批

目标：在流程中心和制程配置中形成受控的 DHR 汇总审批规则。

已收敛的设计方向：

1. 在流程中心现有审批流程分类中增加 `DHR_SUMMARY`。
2. 复用现有流程设计器、版本发布、节点、待办、已办、退回、转办、签名和审计能力。
3. 在产品制程版本绑定 DHR 模板版本时，同时绑定：
   - DHR 模板版本；
   - 汇总审批策略；
   - 已发布的汇总流程版本。
4. 审批策略建议为：
   - `NONE`：完整性检查通过后直接成为已汇总；
   - `REQUIRED`：完整性检查通过后必须进入指定审批流程。
5. 不允许操作员在每个批次/SN汇总时临时改变是否审批或任意选择流程。
6. 生产对象首次开工时，把模板版本、审批策略和流程版本写入 DHR/执行快照。

推荐数据关系：

```text
ProductProcessVersion
  -> DhrTemplateVersion
  -> summaryReviewMode
  -> DhrSummaryWorkflowDefinitionId
  -> DhrSummaryWorkflowVersionId
```

推荐执行顺序：

1. 检查必需证据、审批中表单、作废/替代状态、签名和未关闭作业。
2. 检查通过后冻结一个不可变的 `DhrSummaryVersion`。
3. 只有 `REQUIRED` 才启动审批。
4. 审批人审核冻结版本。
5. 退回后修改下一版草稿，不能修改审批中或已审核版本。

### 阶段 4：DHR 审核、退回和再提交

目标：形成参考矩阵中的“我的待办/我的已办”，并让 DHR 审核结果可追溯。

必须覆盖：

- 待办和已办；
- 通过、退回、再次提交；
- 审批角色和权限；
- 汇总内容、人工补充、退回原因、操作者和时间的审计；
- DHR 汇总状态和审批实例状态的明确映射；
- 已审核版本不可被拖拽或实时查询改写。

### 阶段 5：人工补充证据

目标：允许受控地把自动匹配之外的合法证据加入 DHR。

建议规则：

- 只允许选择有业务来源、与当前生产对象相关且当前用户有权限的记录；
- 保存来源 ID、来源类型、目标目录、操作者、时间和补充理由；
- 同一来源不能重复挂载；
- 作废、审批中或已被替代的来源不能作为有效证据；
- 已提交审核的汇总版本不可修改；退回后使用新的草稿版本；
- “拖拽”只是快捷交互，不是把竞品领域模型直接照搬。

开始编码前需要确认：可补充的证据类型、是否允许跨模块选择、理由是否必填、是否需要审批、补充后是否重新触发完整性检查。

### 阶段 6：发布、归档、作废和跨模块列表

只有阶段 2～5 稳定后再考虑：

- DHR 全量列表和按生产/灭菌/物料等模块筛选；
- 发布、归档、作废、只读导出；
- 归档版本、电子签名、审计和删除保护；
- 其他模块通过统一证据提供契约加入 DHR。

手工创建、历史回填和历史兼容仍然不在当前规划；除非用户重新确认产品决策，否则不要实现。

## 7. 当前明确的未决问题

这些问题会改变数据模型或验收结果，开发前必须确认，不能自行猜测：

1. DHR 模板目录中哪些项是必需项，哪些可以为空但允许提交汇总。
2. 每类候选证据的有效状态、替代关系和审批中状态如何判断。
3. `NONE` 和 `REQUIRED` 的默认值以及哪些角色可以配置。
4. DHR 汇总审批流程绑定到产品制程版本、DHR 模板版本还是两者组合。
5. 汇总退回后是创建新草稿版本还是恢复旧草稿，版本号和审计如何表达。
6. 人工补充是否允许跨模块、是否必须填写理由、是否需要二次审核。
7. 哪些模块已经有真实证据来源，哪些模块要先补来源契约。
8. 发布、归档、作废和导出的最终业务状态及电子签名要求。

如果这些问题不影响阶段 1，先记录为 `unresolved`，不要阻塞首版验收；进入阶段 2/3 前必须完成对应确认。

## 8. 每个阶段的固定交付门禁

```text
用户确认范围
  -> L0/L1/L2 执行级别
  -> 影响分析和扩展路径
  -> 原始源码/迁移/接口核对
  -> 最小设计和数据边界
  -> 实现
  -> 聚焦单元/集成测试
  -> 真实 PostgreSQL 验证
  -> 真实页面/权限交互验证
  -> 更新知识基线
  -> 独立质量验证
  -> 汇总实际结果、未验证项和残余风险
```

任何后续上下文都必须保持以下原则：

- 不把规划写成已实现。
- 不把竞品截图写成当前产品需求。
- 不为了显示菜单而绕过权限或直接写前端假数据。
- 不为了兼容历史数据而偷偷增加回填分支。
- 不在没有状态机、审计和权限设计时增加审批/发布/作废按钮。
- 不在没有真实来源契约时增加跨模块证据空壳。

## 9. 新上下文接手后的第一条消息模板

```text
请先阅读：
1. /Users/ivenwang/Documents/edhr-nexus/docs/dhr-management-handoff.md
2. /Users/ivenwang/Documents/edhr-nexus/docs/dhr-management-product-research-and-roadmap.md
3. /Users/ivenwang/Documents/edhr-nexus/AGENTS.md
4. /Users/ivenwang/Documents/edhr-nexus/codeplzreadme.md

然后确认当前目录为 /Users/ivenwang/Documents/edhr-nexus、分支为 edhr-dev，
不要创建 Worktree、不要重置现有改动、不要删除 output/。

请先按本文阶段 0 做环境和 DHR 首版冒烟验收，再根据阶段 1 的验收清单推进。
后续进入 DHR 汇总时，必须沿用本文的 DHR_SUMMARY 流程分类、制程版本绑定、不可变汇总版本和受控证据关联设计；
任何未决问题先标记并向我确认，不要自行扩大范围。
```
