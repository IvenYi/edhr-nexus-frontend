# AI Worker 与可读过程事件来源

知识基线0.3.25/P0，契约提交 `4ca507d294859213bde8eaf5d1efff77a0a93406` 加切片2B工作树。本记录区分用户授权、规范、源码与运行证据，不宣称DSH或本产品已满足商用上线条件。

## 用户确认与适用范围

用户在了解客户授权、幂等回执及Shell权限边界后，对“最小权限DSH启动、真实Worker→Java任务执行、可读过程日志及故障恢复验证”的下一步明确回复“好的开始吧”。这是本轮实施的 `user-confirmed` 来源；不开发页面，先用确定性模型替身，不消耗付费模型额度。该确认不改变DEC-0097中知识发布、任务完成、生产选用或生产执行的边界。

## 规范与实现关系

复用 `concept.ai-execution-run`、`concept.ai-operation-event` 和 `concept.ai-operation-receipt`。工具开始表示尝试进入受控执行，不能证明业务提交；明确拒绝、结果未知、中断和实际提交分别解释。产品日志应关联任务、轮次、调用标识及实际操作结果，不能记录模型隐藏推理、密钥或将原始附件直接作为用户运行日志。已有原生回执与审计仍解释真实写入，当前修订仍须读回。

`AiTaskService.toolEvent`、`recordFormRead`、`recordFormEvent`和`end`是本轮过程事件的Java实现锚点；`AiWorkerController`提供受当前执行资格约束的调用入口，`AiEventPresentation`从事件类型生成可读摘要。`AiFormService`的原生读写路径提供结果依据；Worker不能通过过程上报接口自行声明成功。以上为 `original-evidence` 的源码路径核对，源码存在不等于完整状态转换、并发、恢复或独立质量已通过。

`gmp-platform/ai-worker/src/worker.mjs`的 `runClaimedWorker`编排领取、续租、pending回执核对、工具挂载、驱动执行和释放。`form-plugin.mjs`关联稳定调用标识，身份与代际仍取自宿主领取；本地pending文件仍只是技术恢复辅助，不是权威业务事实或用户日志。正式DSH profile加载清单、真实Java连接、进程强杀及恢复结果须取本轮实际验证原件，不能继承2A适配测试的结论。

收尾源码增量已核对：`POST /api/v1/ai/internal/forms/reconcile`先复核当前任务、轮次与代际，再读取真实原生回执；`recordRecovery`按当前轮次与操作编号幂等记录`FORM_OPERATION_CONFIRMED`，表示历史保存已确认，不把它当成新保存或当前修订。`recordFormEvent`核对工具类型与实际创建/保存动作相符才记录提交；结果未知后的事实确认通过原生提交或回执核对表达。读取的`callId`保持可选以兼容既有接口。

`AiProperties`与Worker固定基线对应`form-worker-2b`、`ai-task-v2`、`unpublished`、`fixture-no-model`四项。恢复拒绝不可用或不兼容配置，不静默迁移旧轮次或把unpublished知识当作已发布知识包。测试入口`launch-profile.mjs`、`profile-boot.mjs`、`drive-fixture.mjs`和`AiFormPostgresTest`用于官方DSH启动、确定性驱动、隔离Java链路与故障验证；本体只核对入口及源码关系，实际通过数量和最终候选由主侧验收记录及独立质量报告提供。

`yield`以STOPPED及WORKER_YIELDED结束验证轮次并释放占用，是当前决策包标明的 `inference` 工程安排，不伪称用户指定的业务状态。它既不删除已提交成果，也不满足SUCCEEDED的预览、语义检查及当前修订证据要求，不代替后续PARTIAL/WAITING_INPUT语义。

## 保留边界

DEC-0097-03/04/05/06/07/09/10/12/13继续有效，没有政策替代。知识包发布、完整模型预算与恢复、原生预览和任务成功判定、双模型表单质量、日志界面及上线容量仍按各自切片验收；本轮内部知识不获得客户或运行投影资格。旧实验与2A验收是 `secondary-reference`，不能代替2B结果。阶段继续P0，不新增试点或通用推理引擎。
