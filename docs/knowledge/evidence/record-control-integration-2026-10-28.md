# 记录控制集成的知识映射与边界

本记录只覆盖 2026-10-28 的记录控制集成切片，不表示全量知识审计或生产发布。

## 固定来源

- `original-evidence`：来支 `feat/record-change@aef427c524bd7270b3775fbd7c599c72a545e21b`；起始目标 `edhr-dev@099bb29f4873d863f51e61493c0ebcbe94803801`，已获取目标增量 `8784ba87166addae9cb9659d6120aa84f993c7ef`。后者只改表单模板流程设计入口，不改本切片业务契约。
- `user-confirmed`：来支保留的 2026-09-15/16/17 范围与术语确认原件；原始 Markdown 不改写。主线 2026-10-16 记录了等待真实变更/作废实现后继续 DHR 生效、影响与并发联调的决定。
- `secondary-reference`：阶段一影响报告与既有实现报告仅作历史验证索引，不代表本次已运行。
- `inference`：本切片先消解集成问题并取得真实来源能力；DHR 主动通知、A12 有效统计切换及规则重建在后续功能切片验收。

## 同号不同义映射

主线 DEC-0075、0076、0077、0078 的自定义表单范围、本体试点、追溯投影、正式产出含义及全部原引用保留。只为尚未合入的来支记录和声明分配新标识：

| 来支原 ID（包含全部后缀声明） | 集成 ID | 业务含义 |
| --- | --- | --- |
| DEC-0075 / DEC-0075-01…04 | DEC-0086 / DEC-0086-01…04 | 记录变更首期检索范围 |
| DEC-0076 / DEC-0076-01…10 | DEC-0087 / DEC-0087-01…10 | 记录控制 V1 及暂缓边界 |
| DEC-0077 / DEC-0077-01…02 | DEC-0088 / DEC-0088-01…02 | 表单管理与变更管理并列菜单 |
| DEC-0078 / DEC-0078-01…02 | DEC-0089 / DEC-0089-01…02 | 表单实例编号展示术语 |

新文件名、声明内引用、事实来源、阶段一导航同步；原来支提交与原始用户证据保持可追溯。记录的知识基线对齐 0.3.25，没有升级全库版本。

## 声明级同步

- DEC-0086-03/04 只在首期检索范围内替代 DEC-0050-04 的工单、批次等检索入口要求；批次/SN检索延期，既有真实业务关联、来源授权和未来检索能力不取消。
- DEC-0087-02 明确首期拟内容在申请中隔离保存、批准时才建立下一有效内容修订。它只修正旧 `rule.record-correction.new-revision-only` 的提交时点及 `scenario.record-correction-creates-new-revision` 的旧描述；受控变更产生新修订、旧证据只读及批准前不改正式值继续有效。
- DEC-0087-05 明确退回终结旧申请，再发起取得新申请与流程身份。该规则不证明撤回入口已实现，也不取消后续撤回、转办和重新分配要求。
- DEC-0088-01/02 只收敛菜单并列与菜单可见性，替代首期原始说明中“表单管理页面不存在、不新增空菜单”的历史判断；其余身份、签名与数据范围不变。
- DEC-0089-01 只替代 DEC-0050-01/02/03 的现行展示名称，“表单实例号/表单流水号”保留为历史别名；FR 格式、实例身份、技术字段和历史值不变。
- DEC-0087-08 中“无可靠 DHR 来源”是 2026-09-16 的历史前提。当前 DHR 真实实例、汇总与审批已存在；尚未完成的是记录控制真实生效消费、主动通知及 A12，不能将暂缓理由解释为主线没有 DHR。

## 实现与验收边界

本体只核对源码和断言的含义，不执行业务修复。来支 `RecordControlService`、`RecordControlTaskActionService`、公共引擎及安全查询证明实现入口已存在；测试文件存在不证明本候选运行通过。三个安全/查询规则和对应锚点按当前证据保留 `implemented/internal`，不继承来支缺少发布级证据的 `verified/runtime` 声明。现有 schema 要求正式执行契约注册表中的每条记录均为 verified，本切片不放松该门禁；下列三个来支契约只保留内部规格及原始证据，暂不注册正式运行契约，implemented 规则也不引用它们作为正式执行保证。

| 暂缓注册的原契约 ID | 内部规格 handler | 实现证据 |
| --- | --- | --- |
| execution.record-control-final-result-delivery | WorkflowEngine.recordControlResultEvent → RecordControlTaskActionService.complete → RecordControlService.handle | evidence.record-control-workflow-result-delivery-adapter / evidence.record-control-workflow-result-business-handler |
| execution.record-control-security-closure | SignatureRepository.findGeneric / SignatureController.protectExecutionSignature / RecordControlService.requireRequestDetailAccess | evidence.record-control-signature-generic-controller-boundary / evidence.record-control-active-detail-access-tests |
| execution.record-control-workflow-task-projection | RecordControlController.workflowTasks → RecordControlService.listMyWorkflowTasks → WorkflowTaskRepository.findRecordControlTodoForUser/findRecordControlDoneForUser | evidence.record-control-workflow-task-projection-repository / evidence.record-control-workflow-task-projection-tests |

主侧已识别当前合并 schema 基线未注册来支 0087/0088、合法首次完成未建立 Rev.1，以及申请签名尚未 flush 即通过 JDBC 引用导致外键失败的集成缺口；当前候选在记录控制服务局部 flush 签名，保留原事务与共享签署接口。修复与实际 PostgreSQL/回滚证据由主侧及独立质量角色记录，不能从本文推出已通过。

`discrepancy.dhr-review-effective-source-integration`、`discrepancy.dhr-review-complete-evidence-impact-gap`、A12、活动表单未来作废边界、重新分配签名问题及完整 P0 标准动作均保留。原始用户记录、旧签名、冻结版本与历史审计不回填、不删除。
