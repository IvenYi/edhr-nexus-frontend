# 候选流程批读：源码审查及整改边界

目标是处理已确认的 `PERF-WORKFLOW-CANDIDATE-CURRENT-VERSION-001`。本批开始实际 fetch 的 `edhr-dev` 为 `3b7e4d9a35503020e0baef2a91bb3e9a663fcb05`，PR78 已合入，整树与前批交付 `99fa3fd7` 相同；没有外部代码、知识或契约增量。实际工程授权及原规模证据保留在[前批](../branch-review-20261110-workflow-candidate-capacity/performance-next.md)。执行级别 L2。

## 已核对的规则与实现

DEC-0094-01/02 和 DEC-0087-04 的现行规则合理，继续作为代码依据：普通认证用户可读取类型匹配、当前已发布的具体流程版本；候选读取不授予申请、审批或菜单资格，申请时仍实际复核。原 stage1 对候选创建权限的历史记录保留，由 DEC0094 精确替代，不能拿旧证据恢复该权限。完整多租户隔离仍是非 MVP 未决，不能由这个查询推导为完成。

旧 service 先读取定义实体，再对每个定义取 Optional current 版本实体，最后只输出 7 个字段。上轮已实测 100/1000 个有效候选分别 103/1003 次 SELECT（合成夹具另有两个匹配过滤对照；通式为 1+D）。版本实体还包含未使用的 nodes_json/edges_json。

新查询在 workflow 仓储按定义 type/businessType/status 和版本 isCurrent 联合读取，直接选取 7 个标量，并沿用数据库 name ASC。没有 IN 参数列表、总量限制、分页后过滤或新索引。service 只做映射和现有异常兼容。无 current 的定义不返回；current 未发布不回退历史发布版。

多 current 的检查必须发生在 PUBLISHED 过滤前。原 Optional 查询本来会拒绝多个 current；Set 检查保留该行为，不是猜测的新业务防御，也不能删去后任选第一条或最新版本。真实 schema 的 `uk_workflow_definition_version_one_draft` 已禁止两个 DRAFT；测试分别覆盖可存储的发布/发布、发布/草稿、草稿/发布，以及双草稿原约束拒绝，不删除约束造坏数据。

## 健壮性、性能与 A23

- 已核调用链：原候选 GET → workflow port → 本 service → 仓储。start 及签名、实际版本复核、业务写入、锁、审计和冻结历史不在本次改动中。
- 消除这个读取入口的逐定义 SQL 和完整图实体物化；只有固定的类型/业务类型/状态参数，未在循环里发 SQL，没有文本 ID 列表扩张。service 的循环只检查和映射已读标量。
- 继续完整返回选项，因此应用/响应规模仍为 O(候选数)。本次最大合成规模每类 1000；更大目录的前端渲染、完整接口容量与并发不是本批已验证结论，不能以 100 截断规避。
- 保留空业务类型拒绝、匹配范围、名称排序和异常；无吞异常、空数组伪装失败、自动重试、缓存、默认选择、新空值兜底或跨事务数据复用。
- query 合并为一条配置读取视图，后续选择到发起之间仍可能变更配置，因此原命令即时复核继续必要；不把候选当执行冻结。
- SQL 预算及未读取 JSON 列由 Hibernate 捕获断言，并由真实 PG 执行日志与 auto_explain 交叉核对；测量排除夹具、HTTP 序列化和摘要核对。线程累计分配不是峰值，热缓存带采集计时不是生产 SLA。

## 具体抽取方案

`RecordControlWorkflowService` 原 127 行，职责已由候选读取与 start 端口表达。本批把查询放在仓储内，以一个局部循环保留映射/唯一性；没有证据需要再造查询服务或通用批处理框架。未来若候选读取出现独立分页/搜索/多调用方，可将查询映射抽成 workflow 所有的 CandidateQuery；start 的验证、事务及 engine 调用继续原 service，不能顺带移动业务写事务。

相邻 `RecordControlService` 592 行的具体候选边界保留：`findRecord/references/revisions/listRequests/listMyWorkflowTasks/requestsForMyWorkflowTasks/requestDetail` 可归独立只读查询对象；`requireRequestDetailAccess/canViewRequestDetail` 的共享资格应先明确唯一所有者，再供列表与详情复用。`submit/withdraw/handle/applyResult` 保持命令编排及事务所有权；`applyChange/applyObsolete/updateExecution/audit` 在其事务内调用，不另开事务或拆散锁/审计顺序。这是待审拆分方案，本批不实施，也不把未答的列表资格 SQL 优化混入授权。

PG 测试类较长。可将目录 fixture、候选读取和查询预算移入独立 `RecordControlCandidatePostgresTest`，把严格数据库 URL guard 与 canonical 启动支撑抽为单一测试支持；原业务 69 场景继续现类，避免继承导致重复运行全部写入场景。本批沿用现类，控制验证差异，未启动大模块重构。

## 验证来源与限制

正式主侧、独立及索引观察结果在收尾报告登记。首轮旧源测试的双 DRAFT 夹具触发原唯一约束，原件保留；修正为验证约束后，完整同字节旧源反证才用作预算失败依据，不能把夹具错误包装成产品缺陷。

本批不重跑或声称通过 UI 浏览器/strict/lint：没有 UI 改动，原 strict 86 和 lint 缺配置仍在原台账。全知识语义、W2 余项/W3–W5 跨链、W6 性能健壮性与已审 A23、W7 新增、A12/高风险/完整矩阵/family 剩余4N及选项全载/容量 UNKNOWN 与用户暂停项继续。目录与部分测试通过不等于全仓审计完成；整文件完成数和历史 unique 不能据此新增。
