# 记录控制公共流程阶段一契约影响分析

- 知识基线：`knowledgeModelVersion: 0.3.24`。
- 执行级别：L2。
- 决策包：`DEC-PACKAGE-20260915-RECORD-CONTROL-STAGE1`。
- 扩展路径：`product-core`、`transaction-orchestration`、`standard-action`。

## 已核对直接影响

- `original-evidence`：公共流程新增 `RecordControlWorkflowPort` 及共享 DTO；候选查询只返回类型匹配的当前已发布版本，REST 入口按 CHANGE/OBSOLETE 分别要求对应发起权限。
- `original-evidence`：`WorkflowEngine.createRecordControlInstance` 按显式定义和版本启动，绕过绑定规则；它按幂等键复用完全匹配请求或拒绝冲突，并保存定义、版本、申请业务 ID、申请人签名引用、审计关联、上下文快照和流程快照摘要。
- `original-evidence`：记录控制开始节点不创建任务；引擎自动进入首审批节点，冻结候选快照并排除申请人。
- `original-evidence`：`0080-record-control-workflow-contract.sql` 增加实例幂等键、审计关联、流程快照摘要、幂等唯一索引和阶段一记录控制权限。
- `original-and-test-evidence`：`RECORD_CONTROL_REQUEST` 签名在通用列表分页和计数前排除，通用单条读取、创建、覆盖、更新和删除均被拒绝；普通通用签名类型保持原接口行为。
- `original-and-test-evidence`：`IN_REVIEW` 申请详情仅申请人、当前候选或处理人及本人已处理任务相关人员可见，无关用户被拒绝；已结束历史详情仍按当前租户认证范围开放。
- `original-and-test-evidence`：变更审批待办/已办使用记录控制专用数据库分页；业务类型、任务状态、认证处理人或候选关系在分页和计数前过滤，接口返回真实 `PageResult`，前端不再从通用流程任务页做客户端过滤。

## 传递影响与所有权

- `user-confirmed`：记录控制申请域拥有申请、来源资格、申请人签名、业务锁和批准后业务落地；公共流程域拥有候选、显式启动、路由、任务和流程运行日志。
- `original-evidence`：记录控制申请域已在事务中复验来源资格、当前修订和活动申请锁，使用共享电子签名能力生成申请证据，显式启动公共流程并回写实例关联；我的申请和审批任务按认证身份过滤。
- `original-evidence`：`RecordControlTaskActionService` 通过专用电子签名审批入口完成任务，最终批准或退回才同步投递业务结果；通用任务完成、转办、实例终止和 CRUD/list/log 入口均阻断或排除 CHANGE/OBSOLETE，避免绕过业务事务和审计证据。
- `original-evidence`：共享终端的签署人可以不同于当前登录账号；申请确认内部返回和同签署人幂等重放使用受控内部读取，不经过面向外部详情的数据范围门禁，避免把登录账号与真实签署人差异误判为越权。

## 兼容、快照、审计与权限

- 原有绑定规则 `createInstance` 入口保持不变；新增显式入口只服务 RECORD_CONTROL 的 CHANGE/OBSOLETE。
- 流程实例新增字段对既有非记录控制实例可空；2026-09-15 本地重建已验证 Liquibase 88/88、0080 两个 changeset、三列、唯一索引、6 个权限码和 ADMIN 六项关联。生产环境迁移兼容仍由发布门禁负责。
- 实例固定保存 `definitionId`、`versionId`、`contextSnapshot` 和 `workflowSnapshotHash`，后续发布新版本不改变实例引用；当前摘要只覆盖版本的 `nodesJson` 与 `edgesJson`。
- `auditCorrelationId` 已进入实例与共享事件载荷；显式启动写入既有 `WorkflowActionLog`，阶段一不创建 `WorkflowEventLog` 第二套运行日志表。不可变合规审计及跨域关联仍缺发布级证据。
- 候选接口按类型要求 `record-control.corrections.create` 或 `record-control.voids.create`；候选结果不是确认授权凭证。模板级使用 ACL 当前不存在，这是实现边界，不提升为通用业务规则。
- 本期不新增岗位、角色或模板级功能权限；这一暂缓不放宽活动申请详情、我的申请和审批任务的数据级隔离，也不开放记录控制签名的通用 CRUD。
- 记录控制审批任务查询不复用通用流程任务分页；专用投影只允许后端认证用户身份参与过滤，客户端不能指定或覆盖目标处理人。

## 明确不受影响

- 普通表单流程和作业流程仍使用既有绑定规则启动入口。
- 普通通用签名类型仍沿用既有通用接口；记录控制专用签名隔离不改变其查询和维护语义。
- 已结束的变更或作废历史列表与详情继续对当前租户认证用户开放，活动详情收紧不改变历史查看范围。
- 原阶段一公共流程切片本身不创建记录控制申请、修订或业务锁；后续记录控制域实现现已补齐这些能力，并在最终批准时落地变更或作废。
- 本阶段完成时活动表单作废资格尚未确认；2026-09-16 后续用户决策已将首期发起资格限定为已完成且存在当前有效修订的实例，见 `DEC-0076`。该新决策不改写阶段一实现证据。
- 重新分配签名仍由 `question.record-control-managerial-reassignment-signature` 保持开放，不阻塞阶段一候选和显式启动。

## 证据缺口

- `evidence-gap`：尚未执行幂等唯一索引并发争用验证和非管理员组合账号权限矩阵；本地真实迁移与 ADMIN 权限数据已经验证。
- `original-evidence`：最终审批或退回已产生 `WorkflowResultEvent`，由 `RecordControlTaskActionService` 在同一事务同步交给 `RecordControlService`；处理器按 `eventId` 幂等消费，业务落地失败向外传播并回滚。
- `original-evidence`：申请与审批电子签名、变更批准生成新修订、作废批准保留历史、退回保持来源不变均已有源码和聚焦测试；通用转办对记录控制任务显式阻断。
- `evidence-gap`：撤回和重新分配签名仍属后续范围；真实 PostgreSQL 历史升级、并发幂等争用、非管理员组合账号矩阵及双账号浏览器 E2E 尚未完成。

## 验证范围

- 已执行聚焦单元与集成测试：知识 schema/引用、候选过滤、显式版本启动、开始节点无任务、首审批排除申请人、幂等重试与冲突、快照和审计关联、专用审批结果同步、通用流程旁路阻断、申请/审批数据范围及菜单路由。
- 已执行安全聚焦测试：通用签名列表排除与单条 CRUD 阻断、活动详情的申请人和审批人允许、无关用户拒绝、已结束历史开放。
- 已执行审批任务投影测试：待办和已办均调用专用分页仓储，保留真实总数与总页数，并断言不回退到通用任务查询；相关聚焦测试共 10 项通过，前端构建通过。
- 提交前独立质量门禁仍需复核源码与测试结果；真实 PostgreSQL 迁移/并发和双账号浏览器 E2E 保留为发布验证范围。
