# 记录控制公共流程阶段一契约影响分析

- 知识基线：`knowledgeModelVersion: 0.3.18`（基于 0.3.16 更新）。
- 执行级别：L2。
- 决策包：`DEC-PACKAGE-20260915-RECORD-CONTROL-STAGE1`。
- 扩展路径：`product-core`、`transaction-orchestration`、`standard-action`。

## 已核对直接影响

- `original-evidence`：公共流程新增 `RecordControlWorkflowPort` 及共享 DTO；候选查询只返回类型匹配的当前已发布版本，REST 入口按 CHANGE/OBSOLETE 分别要求对应发起权限。
- `original-evidence`：`WorkflowEngine.createRecordControlInstance` 按显式定义和版本启动，绕过绑定规则；它按幂等键复用完全匹配请求或拒绝冲突，并保存定义、版本、申请业务 ID、申请人签名引用、审计关联、上下文快照和流程快照摘要。
- `original-evidence`：记录控制开始节点不创建任务；引擎自动进入首审批节点，冻结候选快照并排除申请人。
- `original-evidence`：`0080-record-control-workflow-contract.sql` 增加实例幂等键、审计关联、流程快照摘要、幂等唯一索引和阶段一记录控制权限。

## 传递影响与所有权

- `user-confirmed`：记录控制申请域拥有申请、来源资格、申请人签名、业务锁和批准后业务落地；公共流程域拥有候选、显式启动、路由、任务和流程运行日志。
- `potential-impact`：记录控制申请确认事务必须在自身领域复验来源资格、数据范围、申请人签名真实性和确认权限，再调用公共流程端口并回写实例关联；当前尚无申请域实现证据。
- `potential-impact`：后续任务动作仍需消费启动时冻结的候选和按钮配置；阶段一共享枚举不证明审批、退回或转办已经闭环。

## 兼容、快照、审计与权限

- 原有绑定规则 `createInstance` 入口保持不变；新增显式入口只服务 RECORD_CONTROL 的 CHANGE/OBSOLETE。
- 流程实例新增字段对既有非记录控制实例可空；2026-09-15 本地重建已验证 Liquibase 88/88、0080 两个 changeset、三列、唯一索引、6 个权限码和 ADMIN 六项关联。生产环境迁移兼容仍由发布门禁负责。
- 实例固定保存 `definitionId`、`versionId`、`contextSnapshot` 和 `workflowSnapshotHash`，后续发布新版本不改变实例引用；当前摘要只覆盖版本的 `nodesJson` 与 `edgesJson`。
- `auditCorrelationId` 已进入实例与共享事件载荷；显式启动写入既有 `WorkflowActionLog`，阶段一不创建 `WorkflowEventLog` 第二套运行日志表。不可变合规审计及跨域关联仍缺发布级证据。
- 候选接口按类型要求 `record-control.corrections.create` 或 `record-control.voids.create`；候选结果不是确认授权凭证。模板级使用 ACL 当前不存在，这是实现边界，不提升为通用业务规则。

## 明确不受影响

- 普通表单流程和作业流程仍使用既有绑定规则启动入口。
- 阶段一不创建记录控制申请、修订、业务锁，也不执行变更或作废业务落地。
- 活动表单作废资格仍由 `question.record-control-active-form-void-boundary` 保持开放，不阻塞公共流程阶段一契约。
- 重新分配签名仍由 `question.record-control-managerial-reassignment-signature` 保持开放，不阻塞阶段一候选和显式启动。

## 证据缺口

- `evidence-gap`：尚未执行幂等唯一索引并发争用验证和非管理员组合账号权限矩阵；本地真实迁移与 ADMIN 权限数据已经验证。
- `evidence-gap`：`WorkflowResultEvent` 与 `RecordControlWorkflowResultHandler` 只有共享类型和接口；流程完成、退回、撤回触发、记录控制处理器及 `eventId` 幂等消费尚未实现。
- `inference`：当前单体可采用同步事务处理器并在失败时整体回滚；该选择在缺少处理器和触发测试前不进入 confirmed、implemented 或 runtime 投影。
- `evidence-gap`：审批、退回、转办、撤回和重新分配运行时尚未完成，活动表单作废资格不在本阶段范围。

## 验证范围

- 已执行聚焦单元测试：候选过滤、显式当前已发布版本校验、开始节点无任务、首审批排除申请人、幂等重试、幂等冲突、快照和审计关联。
- 仍需独立质量门禁：知识 schema/引用校验、真实数据库迁移、API 权限矩阵和后续申请域端到端事务验证。
