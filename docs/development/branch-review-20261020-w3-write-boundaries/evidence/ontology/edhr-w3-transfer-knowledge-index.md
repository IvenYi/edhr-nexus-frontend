# 租户内委托：只读知识来源清单

固定来源 `84c5b6d6af15f4f9d684c99e8eb8d110ae039954`；目标 `a8285be9b91fb76bcb27ccb16a5258bda1fb5077`；知识0.3.25/schema1.2.0。

仅定位31条具体ID和7处文档范围，不是正式ontologyResult、全量语义验收或运行通过。

最小同步：DEC0031-03及非候选拒绝场景、任一候选完成规则的未转办分支；DEC0055-02目标范围；普通转办rule/fact/alias/anchor；两处当前人员阅读投影。创建来源冻结与当前委托责任分别解释。

原始2026-09-04和2026-09-17用户确认证据必须保留；本轮2026-10-20用户选择是新局部政策替代，不回写为早已决定。

共享term.workflow-transfer-action须明确场景，不能把记录控制/A12的未实现政策一并放开。question.multi-tenant-workflow-isolation仍保留；本次同租户目标校验不是全域多租户隔离完成。

| ID | 处置建议 | 精确范围 |
| --- | --- | --- |
| DEC-0031-02 | updated | 任一原候选可处理只适用于未显式转办的任务；转办后当前目标独占处理资格，逻辑任务终态规则保留。 |
| DEC-0031-03 | updated | 新增显式转办例外，不再把原集合外用户一概禁止；未转办候选资格仍按原规则。 |
| DEC-0031-04 | retained | 创建解析结果/全部主体来源/未解析主体与组织变化不重算保持；当前委托责任不等于改写原来源。 |
| scenario.workflow-task-any-candidate-completes | updated | given补充未转办限定，保留任一完成后逻辑任务终态。 |
| scenario.workflow-task-non-candidate-blocked | updated | 非候选且未获合法显式委托者仍拒绝；合法受让人可在原集合外。 |
| scenario.workflow-task-resolution-snapshot-frozen | retained | 仍验证组织/角色变化不改原创建来源；建议新场景单独验证转办后原件。 |
| discrepancy.workflow-transfer-overwrites-candidate-origin-snapshot | updated | 待主侧固定实现后按真实来源留存证据更新，不能从用户确认直接写成已解决。 |
| DEC-0055-02 | updated | 只替代目标限原冻结候选的范围；当前处理权、禁止自转、有效未锁定、原来源保留及再次转办保护仍适用。 |
| DEC-0055-03 | retained | 同节点同表单份、只改当前责任、仅目标处理和待办迁移保持。 |
| DEC-0055-04 | retained | 原因/身份/表单份/节点/时间、原事务审计及退回清除投影保持。 |
| DEC-0055-05 | historical | 早期遗漏修复的时间线仍正确；本次租户委托是2026-10-20新的范围政策增量，二者不得混写。 |
| scenario.form-approval-transfer-current-task | updated | 目标资格从节点原候选范围变为本租户正常可用用户；其余节点/数据/结果/证据期望保留。 |
| rule.workflow.task-creation-freezes-candidate-resolution | retained | 结构化candidateMembershipFrozenAfterCreate及解析来源保存仍成立；可补明确当前委托状态单独记录。 |
| rule.workflow.task-any-candidate-completes-and-closes-siblings | updated | 条件 task.candidateMembership 与 nonCandidateBehavior:block 不能继续表达无例外原集合；应限定未委托分支或增加合法当前受让人资格解释，不仅改说明。 |
| fact.catalog.task-candidatemembership | updated | sourceLocator称读取userIds的冻结集合；需与实际实现区分原创建来源和当前有效目标，保留稳定ID及alias时解释精确适用范围。 |
| rule.form-approval-transfer | updated | target-authorized事实含义及解释同步租户委托；preserves/projections/structuredHistory维持。 |
| fact.form-approval-transfer.target-authorized | updated | name、sourceLocator 与 alias targetWithinFrozenCandidates 会误称仍限定原候选；需要处理当前定义和旧alias适用边界，不能只改规则解释。 |
| fact.form-approval-transfer.current-actor-can-act | retained | 现有定位已明确先transferAssignees后开放/冻结approvers，区分当前责任与原来源，可保留。 |
| anchor.form-approval-transfer-runtime | updated | 来源定位仍写冻结候选校验，待实现后改为同租户目标校验并更新真实sourceRevision证据。 |
| term.workflow-transfer-action | updated | 共享术语仍写授权候选范围；只对通用/普通表单补租户委托解释，记录控制既有规则不可隐含放开。 |
| term.workflow-task | updated | 任一候选完成是未转办处理分支；补当前责任独占不改变单逻辑任务。 |
| term.workflow-task-resolution-snapshot | retained | 原创建候选及主体来源冻结定义仍正确，补与当前委托处理资格区别即可。 |
| concept.workflow-task | retained | 现有概念只引用逻辑任务术语，稳定ID/成熟度保留，关联新证据即可。 |
| concept.workflow-task-resolution-snapshot | retained | 原解析证据概念保持；不将当前委托目标误当重新解析的原来源。 |
| relation.workflow-task-has-resolution-snapshot | retained | 一任务有来源快照的关联和基数保留，不因当前委托另造逻辑任务。 |
| rule.form-process.subject-members-resolve-latest-relations | retained | 审批到达解析与填报当前解析时点不变；修复后仅更新泛转办来源差异的证据描述。 |
| rule.form-process.approval-any-candidate | updated | 任一候选完成解释须排除显式转办后的非当前处理人；不增加逐个审批或条件引擎能力。 |
| evidence.workflow-task-multi-candidate-runtime-implementation | updated | 旧代码描述正确反映来源丢失；只能在固定新代码检查后附新实现范围，不能覆盖成历史一直保留。 |
| evidence.form-approval-transfer-api | updated | 服务端冻结候选校验的当前代码说明需按真实新实现更新，不暗示任意租户人员可过。 |
| evidence.form-approval-transfer-tests | updated | 冻结边界旧测试与当前租户委托新回归分时点解释；测试源码存在不代表实际通过。 |
| question.multi-tenant-workflow-isolation | retained | 新增目标同租户资格不等于全工作流多租户隔离闭环；非MVP未决问题保持。 |

文件/记录SHA、Git blob和JSON指针见同名JSON；现行实现差异只能在父角色收到固定代码与实际验证后更新。没有修改仓库或运行测试、数据库、浏览器、Actions。
