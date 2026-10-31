# 重新分配电子签名的直接确认

日期：2026-10-29（Asia/Shanghai）。本记录为 `user-confirmed`，不是冠骋实现结论。

用户原话：

> 重新分配需要签名。这些功能去调研一下冠骋，看看是否可以借鉴，我们是否有改善空间

主侧同切片保留的[确认原件与授权范围](../../development/workflow-intervention-research-20261029/user-confirmed.md)说明此前问题为流程干预和记录控制审批重新分配的额外签名要求。本次新确认记录为 [DEC-0091](../decisions/DEC-0091-workflow-reassignment-signature.yaml)，不以竞品页面或API推断用户选择。

## 当前有效范围

- 记录控制审批重新分配必须完成电子签名；缺少有效签名时不能执行。
- 仍要求专门权限、合法目标、原因和审计，且不改变节点、路径或业务结果；签名不替代授权。
- 现行按钮签署身份和凭证规则按DEC-0074核对；本次不改变其共享终端及admin认证例外。
- 不外推普通转办、申请撤回必须签名，不开放DHR通用干预或P0禁止的终止、跳过、强制跳转、加签、管理员直接批准。
- 当前只登记规范，未实现重新分配动作、签名强制、DTO或数据库变更，保持specified/internal；后续需取得实际运行和独立质量证据。

## 历史未决记录保留

读取基线：`8cf4df66d60e8f16677442197a9fc0defcd3ef8c`，原路径 `docs/knowledge/open-questions.yaml`，原ID `question.record-control-managerial-reassignment-signature`。以下是其当时内容，保留历史解释，不再作为当前开放问题：

> 问题：记录控制审批的重新分配是否必须额外完成电子签名，还是只要求专门权限、原因和不可变审计？
>
> 背景：阶段一共享命令保留可选signatureId，但重新分配运行时尚未实现；当前已确认其需要专门权限、目标资格、原因并保持节点和流程路径不变，尚未确认是否以电子签名作为执行阻断条件。
>
> 原选择：必须电子签名；不强制电子签名但保留身份、原因、处理人和时间；按已发布流程或租户合规配置决定。
>
> 原阻断范围：仅签名校验、签名审计字段和发布级验收，不阻塞阶段一候选查询、显式版本启动以及权限、原因和目标资格边界。

本次仅关闭“是否必须签名”的业务选择。已有 `ManagerialReassignmentCommand.signatureId` 或 `WorkflowIntervention.signatureId` 只能作为 `original-evidence` 证明当前类型/字段存在，不能证明已经强制验签或运行闭环。原阶段一、2026-10-21审查和2026-10-28集成证据仍按各自当时时点保留；本次不回写其旧待决结论。

本轮竞品行为由主报告按 `original-evidence` / `secondary-reference` 区分，改进建议仍属 `inference`，本确认不批准未讨论的新功能或默认规则。
