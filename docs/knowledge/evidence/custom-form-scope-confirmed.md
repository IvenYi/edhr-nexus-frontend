# 自定义表单归属与资料齐套确认

- 时间：2026-09-24。
- 输入：当前用户任务及 `docs/plans/2026-09-24-custom-form-scope.yaml`。
- 知识基线：0.3.24；本次作为工作树增量，保持 `specified/internal`。

## user-confirmed

用户提出自定义表单可随工序或随批次，并可选择在对应对象完工前校验完成；批次表单应支持跨工序。用户要求同时考虑生产完工后的批记录状态、未完成表单对放行与归档的影响。对按归属门禁、生产完成与资料齐套分离、未闭环不能定稿放行正常归档、受控补充保留原历史的方案确认“好”，随后明确“恢复本功能的 L2 门禁并通过美学设计开始实现”。

已确认：新增默认开启完工校验、填写添加原因；关闭校验只允许先完成生产；最终完成包含适用签署和审批；每一份均需闭环。已有未完成自定义份在完工后提供原因继续填报，不重开生产。审核中须人工退回，定稿后须重新整理；原版本与批准事实不可覆盖。

2026-09-24 同一功能切片补充纠正：用户指出“应该是选择表单模板，而不是发布的表单模板，表单模板没有发布状态”。候选列表、搜索和空态应使用表单模板语义，查询及添加均不得要求表单模板版本为 `PUBLISHED`。此次纠正针对先前误用的发布限制，不是新增表单模板生命周期；仍选择明确版本并冻结模板快照。模板有效性、租户及现有执行权限继续适用，作业流程和表单流程的发布要求不受影响，遗留状态列无需迁移。

## original-evidence

- `ExecutionSnapshotBuilder.java` 的候选查询与 `customForm` 原先均将 `form_template_version.status='PUBLISHED'` 作为资格条件；`form(versionId)` 已读取并组装所选版本的 model、canvas 和 fields。该限制混淆表单模板与工作流版本发布语义，修复查询与添加时须一并去除，不能只调整空态文案。

- `ProductionExecutionEngine.java` 原有自定义表单位于工序 forms 内，`completionIssues` 根据 required 检查份序，`allComplete` 按工序完成计算；不能将此原实现当成批次共享已经存在。
- `DhrSummaryService.java` 已有草稿、提交、重新整理、候选与逐实例纳入校验。新增资料齐套必须覆盖所有自定义份，包括尚未产生全局表单记录的份；是否选择纳入目录是另一项关系。
- `FormInstanceQueryService.java` 当前定位只支持 FILL，明确不支持变更或作废资格查询。
- `RecordControlWorkflowService.java` 及公共端口承载阶段一流程契约，不能证明生产自定义份已有正式作废生效回写。
- `open-questions.yaml` 的 `question.record-control-active-form-void-boundary` 仍未决；本功能不替记录控制模块决定活动表单作废资格。
- 放行和归档只有状态声明线索，不能据此声明可调用业务入口或真实运行验证。现有链路验证止于生产执行、汇总与审核。

## inference 与实施边界

复用原创建工序作为技术存储定位、缺失 scope 的历史兼容方式属于实施策略，不能将创建位置推断为批次表单的业务归属。本体不把并行进行的源码修改、未来测试或可选实现路径写为 verified。

“完成或经授权关闭”是闭环目标；记录控制未提供正式生效契约前，系统只能依赖已验证的最终完成事实，不提供无审批豁免。放行后影响评估、归档后补充及关闭接入仍需各自模块的实现和验收证据。

## 知识校验范围

2026-09-24 使用 Java 21 执行 `BusinessKnowledgeModelTest`：完整工作树为 59 项、56 失败，首先命中本任务开始前已存在的未跟踪 `DEC-0058-approval-display-terminology.yaml`，其版本 0.3.23 与基线 0.3.24 冲突；同属既有资产的 `DEC-0059-form-instance-business-source.yaml` 也未由本次修改。

在独立副本 `/tmp/edhr-custom-scope-knowledge-check` 中复制知识文件和实际证据文件，仅排除以上两个既有未跟踪资产，以 `mvn -q -Dtest=BusinessKnowledgeModelTest -DargLine=-Duser.dir=/tmp/edhr-custom-scope-knowledge-check surefire:test` 执行同一正式校验器，59 项全部通过。该结果只证明本切片与其余基线的结构、引用、证据路径和投影约束有效，不代表完整工作树门禁通过，也不证明业务代码实现或运行验证。主任务须单独披露既有冲突。

同日模板选择资格纠正后，在独立副本 `/tmp/edhr-template-selection-knowledge-check` 复制当前知识与实际证据文件，仍仅排除上述两个既有冲突资产，执行 `mvn -q -Dtest=BusinessKnowledgeModelTest -DargLine=-Duser.dir=/tmp/edhr-template-selection-knowledge-check surefire:test`，59 项全部通过（0 失败、0 错误、0 跳过）。此结论仅覆盖结构、引用、证据路径与投影，不提升为完整工作树或运行功能验证。
