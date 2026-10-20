# 作业新写入口的已取消字段审查

日期：2026-10-20。知识 `0.3.25 / schema 1.2.0`。原始目标 `a8285be9b91fb76bcb27ccb16a5258bda1fb5077`，有限修复 `84c5b6d6af15f4f9d684c99e8eb8d110ae039954`。

沿 `WorkTemplateController.saveGraph`、`createDraftVersion/newDraft`、`copyPublishedVersionToDraft` 两分支、`publishVersion` 与发布后继承核对，确认 DEC-0010-02 和 DEC-0011 的现行保存规范未被所有新写入口执行。FORM 的 `completionCondition`，以及 CONDITION 顶层 `conditionRule`、`conditionFieldCatalogVersion`、`conditionFieldSnapshot`、`conditionExpression` 可以经当前写命令再次保存。新建正常UI没有生成这些旧字段的入口；反例前提是明确提供该字段或显式继承带该字段的既存源，不能说成正常新建配置必然发生。

84c 的 `validateSupportedNodeConfigurations` 只按字段存在拒绝上述形状，含 null，不解释值、不删除键后保存。保存和发布在实体/状态/当前标记变化之前调用；覆盖复制在setter之前调用，`newDraft`覆盖创建和继承。发布前置检查不能只放到后继 `newDraft`，否则会晚于发布版本保存、flush、审计及引用动作。

DEC-0009 的不完整草稿保持：FORM 未配置引用、CONDITION 分支规则未配置、尚未连通的图仍按原层次允许草稿保存；发布才执行其完整性。其他未知扩展键不自动禁止，已有版本及生产快照不清理、不改写，也不改变条件运行时尚未闭环的来源、异常及执行审计政策。

主审提供的实际安全摘要显示：同一85项夹具在原目标63个预期失败、22个相邻对照通过、0错误/跳过；独立mapper的时间模块夹具问题另保留，不当作产品红证。84c前主侧当前85项与原73项控制器回归全过，另12项原生PG检查在加载原0060约束后全过。此处引用主审运行原件，不是本体角色亲自执行业务测试；不能用这些计数代替最终独立质量。

新PG探针曾加入生产迁移不存在的唯一current约束，该夹具错误已纠正为真实0060约束，原失败不改写。额外审计摘要读回重算失败独立登记W5，不把审计同事务/原值保持测试冒充摘要重算通过。

本轮只关闭两条登记差异的有限字段写入范围。默认分支额外字段、所有未知字段政策、条件运行来源/求值异常、完整发布/HTTP矩阵和全W3仍未因此完成。固定范围和正式原件由 `docs/development/branch-review-20261020-w3-write-boundaries/` 承接。
