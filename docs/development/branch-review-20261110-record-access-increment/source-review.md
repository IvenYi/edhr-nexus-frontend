# 源码、规则和历史去重

证据类型：固定提交的原始源码/迁移/测试是 original-evidence；DEC-0096 和其关联原始用户讨论是 user-confirmed 的当前政策来源；旧 PR 报告仅作 secondary-reference；容量外推和拆分建议是 inference。不是根据现有代码反推业务政策。

## 本次增量

`35e761d6` 的后端主体是 `RecordControlService`，前端为 API 类型及 RecordRequestListPage、RecordRequestDetailPage、RecordApprovalDetailPage、RecordChangePage 四页。`0be80abf` 对齐旧回归夹具与当前 Page、forSubmission、执行仓储依赖、生产权限及 canonical 0091/0092；没有发现为了通过而删除原业务断言。合入链已核：PR74 → `5db90bd6`，与新增代码集成后的当前目标为 `07d6d416`，不是用 PR74 旧 166 项运行覆盖这个新组合。

| 当前读路径 | 源码定位 | 有限核对结论 |
| --- | --- | --- |
| 申请列表 | `RecordControlService.listRequests`，151–202 行 | DB count + LIMIT/OFFSET；每页 1–200 是单页大小而非全结果上限。`canViewDetail` 使用同一普通任务资格谓词及超管只读例外；不据投影授予写权限。 |
| 来源表单查询 | `findRecord`，87–112 行 | 当前申请的 `canViewActiveRequest` 以真实登录身份计算；无权入口提示原因。 |
| 申请详情 | `requireRequestDetailAccess` / `canViewRequestDetail`，285–303 行 | 服务端重新核查，不信任客户端 boolean；终态、申请人、受保护超管、当前/历史任务资格按既有范围区分。 |
| 列表/来源入口 | RequestList 117 行；Change 113–129 行 | disabled + 可聚焦 span + Tooltip；前端旧投影不能绕过真实详情接口。 |
| 详情错误反馈 | RequestDetail 133–134；ApprovalDetail 167–168 行 | 显示接口实际错误；任务详情与申请详情是两个资格边界。 |

## 声明级知识一致性

当前 DEC-0096 仅替代 DEC-0087-09 关于 **IN_REVIEW 记录控制申请详情** 的“无超管例外”限制。受保护超管由认证 ID 反查真实 `user_account`，需 ACTIVE 且 `LOWER(BTRIM(username))='admin'`；显示名、客户端标志、普通 ADMIN 角色均不是凭据。例外不扩展到任务处理、审批、撤回、签署或其他业务域。

DEC-0074 的签署凭证精确小写 admin 与本次只读 trim/casefold 判断适用范围不同，没有擅自统一。完整多租户问题仍为已有非阻断 needs-decision；不能声称本轮证明全租户隔离。历史来源记录中 `7c2c` 加当时未提交更改的 provenance 原样保留；当前实现通过目标提交和源码快照绑定，不改历史锚点制造一致。

本体角色在初轮实际校验知识 89/89，并建立有限 32 项：20 直接/12 相邻，其中 30 范围一致、1 精确部分替代、1 既有非阻断多租户待决。修正夹具后仅增量绑定相同 353 文件及原 354 输入，没有重跑 89 或重复计入 32 项。v2 另实际运行当前知识 89。全部知识盘点仍 pending，不能把有限一致、自动校验或 ID 清单算作全量语义完成。知识 0.3.25 / schema 1.2.0 / P0 in-progress 不提升。

## 问题去重与结论

| 项 | 状态与范围 |
| --- | --- |
| PR5/PR6 和 PR74 | 已合入，不重新收尾，不重复计缺陷。PR74 原成员实时复核/merge 4N 和选项全载仍是原残余队列。 |
| DEC-0096 详情超管只读例外 | 已有产品提交，本轮做增量审查和回归，没有再次实现。 |
| QF-RECORD-ACCESS-001 | 我方新容量夹具未知 `business_key` 被 PG 忽略，造成合成业务身份不完整；medium 测试/证据问题，非产品权限 bug。`0f5d4354` 改为 schema 真列 `business_id`，并断言目标 20/背景 M 关联；旧 failed 保留，新实例复验。 |
| PERF-RECORD-DETAIL-PROJECTION-001 | 当前消费路径的真实 DB 重复扫描风险，尚未优化；与旧人员目录文本 ID 风险有关但不是同一查询或重复修复。 |
| strict 86 / lint 缺配置 | 旧新集合相同，新增 0；全站问题未关闭，没有伪造全部 UI 通过。 |

本轮产品功能 blocker：未确认。未覆盖的完整多租户、并发/全矩阵及真实主环境签署验证，是接受结论的边界，不能改报 passed。
