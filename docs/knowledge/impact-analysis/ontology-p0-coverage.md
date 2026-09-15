# Ontology P0 Coverage Review

knowledgeModelVersion: `0.3.18`
schemaVersion: `1.1.0`
reviewedAt: `2026-09-15`

## 结论

本次审查确认 P0 的**事实目录覆盖目标**继续满足：当前工作树全部 201 个唯一非 `deprecated` 规则条件事实均可通过 fact ID 或 alias 解析到唯一事实目录记录，并按目录中的 `allowedOperators` 约束操作符。`factCatalogProfile` 仅是分组信息，不能绕过全量解析校验。废弃规则仍保留为历史表达，不计入当前覆盖率。`DEC-0038` 中的 180/180 是 P0 首次发布时的历史基线统计；后续工作树已持续增加业务规则和对应事实，本报告按当前资产重新计算，不把全部统计变化归因于某一个功能切片。

这不等于 201 个事实都已实现为运行时读取字段。事实目录中已有真实实现证据的记录保留 `implemented`；仅有规则定义、设计约束或未来运行时语义的记录保持 `specified / not-available / unreviewed`。规则 `implemented` 不能单独证明其条件事实已经实现。

## 分域核对

| 域 | 事实来源 | 锚点 | 证据结论 |
| --- | --- | --- | --- |
| identity | `SubjectResolver.java` | `anchor.core.identity-subject-resolution` | 主体解析、候选快照和测试有源码/迁移/测试证据；未来运行时语义事实仍未实现的保持 specified。 |
| product-process | `ProductProcessResolutionService.java`、OwnerService 及相关页面 | `anchor.core.product-process-resolution` | 制程解析、版本窗口、绑定和页面/测试入口可追溯；语义别名未自动视为精确字段。 |
| production | `ProductionService.java`、WorkOrderController 及对象实体 | `anchor.core.production-work-order`、`anchor.core.production-object-runtime` | 工单、批次/SN、对象状态和审计入口可追溯；未来执行规则仍保持 specified。 |
| production-work | `WorkTemplateController.java`、WorkTemplateEditor | `anchor.core.production-work-configuration` | 作业模板、流程配置、适用规则和条件分支配置入口可追溯；运行时匹配、求值和实例快照未实现。 |
| record-control | `WorkflowTemplateController.java`、`ReviewTemplateEditor.tsx`、`WorkflowActionConfig.tsx` | `anchor.core.record-control-review-template`、`anchor.core.record-control-transfer-button`、`anchor.core.record-control-review-template-start-no-buttons` | 记录控制审核模板的开始节点无按钮边界、审批主体、审批节点固定动作和转办按钮呈现配置可追溯；申请确认事务、运行时转办、签名采集和审核引擎仍未形成发布级证据。 |
| workshop | `WorkshopController.java`、WorkshopManagementPage | `anchor.core.workshop-management` | 车间 CRUD、引用保护、审计、页面和测试可追溯。 |

## 机械校验结果

- `core-business.yaml`：186 条事实；`form-process-binding.yaml`：15 条事实；事实目录合计 201 条，无重复 ID、无重复 alias、无悬空 `conceptId` 或 `evidenceIds`。
- `implementation-anchors/core-business.yaml`：11 个核心域锚点；代码、迁移、UI 和测试路径均存在。
- 规则事实覆盖：201/201 个唯一非废弃规则事实，覆盖率 100%；事实目录按文件分为 `core-business` 186 条、`form-process-binding` 15 条。
- 事实操作符：均来自对应事实的 `allowedOperators`；正式校验器负责拒绝非法操作符。
- 版本：知识模型 `0.3.18`、schema `1.1.0` 与当前资产头一致。

## 证据边界

当前 `sourceLocator` 对核心事实主要达到领域级定位，部分语义别名不是源码中的字面字段或方法名。这是 P0 的已知证据边界，不应伪装成精确符号级依赖索引。P1 再补充逐事实代码符号、接口字段、数据库字段和查询路径，并建立结构化影响路径与冲突检查。

独立质量子智能体已完成复验，覆盖统计、引用和正式测试均通过；本次 P0 质量门禁已关闭。工作树仍为未提交状态，因此 provenance 中的 `working-tree` 不能被解释为不可变发布版本。

## Roadmap

- P0：事实目录全量解析、最小 provenance、核心域实现锚点、正式校验和独立质量门禁已完成。
- 记录控制审核入口：`DEC-0041` 已替代 `DEC-0040`，开始节点只保留流程边界且不配置按钮；申请确认即启动审核的运行时事务仍保持 specified。审批节点固定转办动作及其呈现边界继续有效。
- P1：精确符号级事实定位、关系语义、查询投影和自动影响路径，暂缓。
- P2：知识发布 manifest、时间版本和历史解释，暂缓。
- P3：JSON-LD/RDF/OWL/SHACL 与受控推理，暂缓。
