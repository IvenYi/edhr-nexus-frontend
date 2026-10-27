# 作业实时匹配：定义、影响范围与验收

基线：`edhr-dev@d5adf22066ea4d6bb1c7e7ede09961fc97bea675`，本地先同步远端再修改；知识基线 `0.3.25`。本报告与同目录 `decision-package.yaml` 属于同一 L2 功能切片。直接修正当前行为，不增加旧模式、切换开关或平行政策。

## 1. 本轮确定的含义

**用户确认（user-confirmed）**：作业实时查询；产品从 A 簇转到 B 簇后，已经创建的 a 作业实例继续归属于原批次，即使尚未执行任何节点也保留；新命中的 b 作业只对后续工序生效，已经过站不补做。制程另行讨论。本轮原话、旧声明原文及精确替代范围见 `docs/knowledge/evidence/work-live-matching-2026-10-26.md`。

**工程落实（inference，已实现并验证）**：沿用当前 `OPERATION_START` 触发；将“后续工序”落实为尚未开工的 `PENDING` 工序。`IN_PROGRESS` 和 `COMPLETED` 均不补入新作业。本轮没有新增工序中途触发、后台扫描、浏览器推送或定时自动创建。实时指每次执行查询读取当前规则；创建时再按 START 事务的一致可见配置重查，不以此前页面预览为最终依据。

| 对象 | 表达什么 | 决定时点 | 后续规则/转簇变化 |
|---|---|---|---|
| 作业适用规则 | 当前产品、产品簇、实际工序是否匹配某作业模板 | 每次候选查询及工序 START | 可改变未实例化候选，不撤销已有实例 |
| 候选计划 | 当前查询预计会创建的作业及其表单 | 响应内存投影 | 可以增加、移除、更新版本；不是生产记录 |
| 已创建作业实例 | 某生产对象、某实际工序中的工作图状态 | 工序 START | 继续使用原身份、图、表单和进度 |
| 作业执行快照 | 创建时的模板/版本、命中规则、匹配事实、流程图与表单依据 | 每个实例创建时 | 不因转簇、规则删除或重新发布而回写 |
| 制程快照 | 原选定制程的路线、工序及配置依据 | 保留现有首次 START 行为 | 本轮不改；不从作业实时匹配推导制程可切换 |

实例判定依据是 `state.operations[工序节点ID].works[作业模板ID]`；仅存在于 `snapshot.operations[].works` 的旧计划不是实例。当前实例身份作用域是生产对象＋实际路线工序节点＋作业模板；同一模板在不同工序可以有不同实例，不做全批次跨工序去重。同一工序已创建的实例不因模板新版本发布而重建。

## 2. 状态与变更矩阵

| 场景 | 查询结果 | 写入/执行结果 |
|---|---|---|
| 批次已保存、尚未首次开工，产品转簇 | 按当前簇展示候选 | 首次 START 重新匹配当前工序并创建 |
| 批次已开工，后续工序 PENDING | 按当前簇、规则及当前已发布版本展示 | 该工序 START 才创建；不继承首次 START 时的旧候选集合 |
| 规则删掉、修改范围或命中例外；尚无实例 | 候选依当前规则消失或变化 | 不再创建旧候选；EXCEPTION/SCOPED/GLOBAL原优先级不变 |
| 新版本发布；尚无实例 | 候选使用当前已发布版本 | 预览后再次发布时，START使用事务可见的当前版本 |
| 已有实例失配，且尚未完成首个业务节点 | 原实例和表单仍可见 | 继续原实例，不清空、不换版本 |
| 当前工序 IN_PROGRESS，出现新的匹配 | 原实例集合保持 | 不在已开始的工序中补入新作业 |
| 已过站工序 COMPLETED | 已有证据保持 | 不补做，不倒退状态 |
| 对象完成、取消、提前结束或工单终止 | 保留已有保存内容 | 不刷新候选以创建新实例；沿用原终态写入限制 |
| 产品原本无簇，后来入簇，或移出簇 | 未实例化候选依当前成员关系匹配 | 与A→B共用解析路径；此具体组合未单独运行测试，不宣称专项已验收 |
| 后续候选配置失效（如无当前已发布版本） | 对应工序显示开工问题 | 仅该工序开工被拒绝；当前已有实例仍能处理 |

WORK规则没有新增用户可控启停动作。共享表中的 `is_active` 技术字段不被解释为本轮新增产品能力。

## 3. 直接与传递影响：原始源码核对（original-evidence）

| 领域/入口 | 具体影响与边界 | 实现证据 |
|---|---|---|
| 制程与作业装配 | `build`保留制程构建；`refreshWorks`独立读取当前簇及规则，仅替换无实例的计划，保留已实例化作业及其表单 | `ExecutionSnapshotBuilder.build/refreshWorks` |
| 执行详情、扫码与刷新 | 响应中的PENDING候选可变化；GET不写执行、表单记录或审计，不改变revision | `ProductionExecutionService.view/get/scan` |
| 工序开工 | 在原权限、工单/对象锁和revision检查下重新匹配；与实例状态、执行快照和审计同事务保存 | `ProductionExecutionService.act`、`ProductionExecutionController.act` |
| 作业节点与工序完工 | 原实例继续按冻结图推进；已创建实例不重新初始化；完工仍等待已有作业与必需表单满足原门禁 | `ProductionExecutionEngine.start/confirm/advanceWork/completionIssues` |
| 作业表单 | 候选表单可随计划变化；已有实例的表单版本、份次、值及签署不替换；到达FORM节点时才产生实际填报状态 | `ExecutionSnapshotBuilder.refreshWorks`、`ProductionExecutionEngine`、`ExecutionFormCopies` |
| 正式表单记录与查找统计 | 保存/提交按原实例表单快照及实际工序写入；候选不会凭查询进入记录或统计 | `FormInstanceRecordService.saved`、`FormProjectionService` |
| 个人填报/审核列表 | 共用`view`，但只遍历实际`ExecutionFormCopies.ids`及存在的copy状态，不把新候选显示成实际任务 | `FormWorklistService`（`executions.view`及copy遍历） |
| DHR填报工作区 | 共用执行详情，因此后续候选展示会变化；DHR自身目录保持首次创建快照 | `DhrFillingService.workspace`、`DhrInstanceService.createAtFirstStart` |
| DHR档案归集 | 原目录从首次START冻结，真实记录按`form_instance_record`归集；没有目录项映射的作业表单仍沿原未映射记录路径，不自动添加目录项 | `DhrInstanceService`（`recordsByItem`/`unmapped`） |
| 生产操作台 | 继续消费`view.snapshot.operations`及`state.operations`；候选列表在响应更新时变化，已选作业不存在时沿原fallback选择 | `ProductionExecutionPage.tsx`的`receive`、`selectedWork`及作业面板 |
| 审计 | START新增snapshot前后依据，原生产对象状态审计修复保留；规则匹配上下文含产品、当前簇、实际工序与触发类型 | `ProductionExecutionService.act/auditObjectStatusChange`、`refreshWorks.matchContext` |

以上源码默认位于 `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/`，控制器位于相邻 `controller/`，前端位于 `gmp-platform/frontend/src/pages/production/`。这是聚焦调用链核对，不声称自动穷举全仓依赖。

## 4. 保留范围与历史处理

- **制程未改**：`ProductionService.split/requireProcessVersion`及`ProductProcessResolutionService.findVersionForProduct`未修改；工单锁定制程、转簇后继续拆分可能被拒绝的现有问题仍在。作业修复不代表制程问题已解决。
- **权限与签署未改**：原`production.execution`权限、表单处理人资格、电子签名和完工门禁沿用；运行回归覆盖缺权限拒绝及签署路径。
- **旧实例不迁移**：不批量重写生产快照、不回填旧实例缺失的`matchContext`、不改历史审计。旧快照中未来工序只有计划且无实例时，可以查询最新候选；实际开工时保存替换后的计划。完成/终止对象保持原存量解释。
- **存储/API**：不新增表、不改变数据库约束或HTTP命令字段；快照内新增`matchContext`为创建依据，原实例允许没有该字段。无数据库迁移脚本。
- **回退边界**：可通过撤回本次代码及当前定义回到旧读取方式，保存的实例图仍可按原结构读取；但旧代码会恢复“后续候选不实时更新”的行为。若已有按新规则执行的业务数据，不能删除或回滚其实例与审计，不把代码回退描述成业务证据撤销。

## 5. 知识同步范围

| 资产 | 同步内容 |
|---|---|
| DEC-0007-03/04 | 实时候选、后续工序生效、实例创建冻结及失配保留 |
| DEC-0002-10及原差异 | 明确排除作业候选范围；只保留制程转簇/继续拆分问题 |
| 3条production-work规则 | 当前匹配、发布版本解析、实例快照及匹配事实 |
| member-transfer-future-only、freeze-batch-execution-snapshot | 将原未来对象限制限定到制程；解释区分制程冻结与逐工序作业冻结 |
| 4词条、3关系、2事实来源 | 分清计划/实例/快照、历史命中关系、当前匹配事实 |
| 证据、README及架构说明 | 原话、旧声明原文、工程选择、源码与测试结果分别标注 |

保留知识版本`0.3.25`及原成熟度，不因为本轮局部验证宣称独立作业实体、通用规则执行层或整个本体路线已完成。第一轮质量发现相邻两条规则遗漏，已补正；首轮failed记录保留，最终以全新质量实例结果为准。

## 6. 验证与真实限制

主侧及首轮独立PostgreSQL套件均为117项、115实跑通过、2浏览器夹具条件跳过；六项新增集成用例全部执行。覆盖A→B转簇、零业务节点实例保留、预览后版本变化、规则删除/例外、旧计划更新、过站不补做、GET零写、重复START、审计失败回滚、候选失效隔离；相邻套件覆盖权限、并发START、终止竞争、表单份次、签署及DHR。六项测试名称和逐case记录见`quality-postgres.json`。知识正式门禁89项通过。最终独立结果见`quality-final.yaml`（该文件产生前不得宣称最终质量已通过）。

没有执行真实浏览器视觉检查，没有新增前端代码。没有单独验证“无簇→入簇/移出簇”的专项场景，没有为本次动态查询做大规模容量基准，不能用功能通过声称这些已验收。

**已识别成本**：现在每个PENDING工序的候选刷新会读取当前成员关系与适用规则，并为匹配模板读取版本/表单。个人任务列表也调用`view`，因此其扫描到的活动对象和待开工工序会增加查询量；这是源码确认的传递影响，尚无本轮容量测量。START审计保存快照前后会增加事件体积。本轮不引入缓存来损害实时语义，也不自动启动任务列表重构；后续容量优化应保留GET零写、实例冻结及START重新确认的边界。
