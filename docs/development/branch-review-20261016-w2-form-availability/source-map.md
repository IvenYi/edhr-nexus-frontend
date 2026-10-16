# 本批定向源码阅读

基线41f19bca；以下是方法与职责边界的定向核对，不代表整文件或全分支已审。全量1780路径仍在独立的pending清单中。技术辅助盘点原文见[evidence/primary/inventory-verification.md](evidence/primary/inventory-verification.md)，该文保留当时静态线索状态；真实红绿结论以本批报告为准。

| 入口或符号 | 实际核对与责任 |
| --- | --- |
| ExecutionFormSelector.renderForm | 使用availability.formCopies中实际instanceIds及status展示工序/自定义行。无实际份只保留计划版本、必填与预览；不生成实例。 |
| ExecutionFormSelector展开work steps | 同一份数判断还存在于原生title；当前步骤沿用可填报/审批动作状态，已有非当前份沿用真实聚合状态，无份且work结束为不适用。 |
| workFormGroups / workFormStages | 沿图边计算步骤，沿真实active节点选当前表单；本批不改变这些规则。搜索、预览、busy和当前copy选择回归保留。 |
| ProductionExecutionService.get→view→formAvailabilityStatus | 从已持久化冻结snapshot/state读取并构建权限及formCopies；仅改变无实例状态的判断顺序，不改engine、act或事务隔离。目标新增processQuality响应保留。 |
| ExecutionFormCopies.ids/status | group.instanceIds及旧单实例兼容确定实际份；只有所有实际份完成才COMPLETED，否则IN_PROGRESS，优先级高于work是否结束。 |
| ProductionExecutionEngine.start→advanceWork→conditionOutlet | 配置表单开工创建，作业表单到达FORM才创建。条件使用冻结sourceType；本批合法测试BATCH跳过FORM、SN到达FORM，并完成实际动作，不人工填造运行状态。 |
| 引擎SUBMIT / addFormCopy / endForm / complete | 验证实际份内容身份与状态，选填未完成份可以在既有兼容告知后保留进行中；本批不改推进、结束、补填或审计政策。 |
| ProductionOutputValue→quantityText / QuantitySources | 新目标主值按组摘要，弹层分列；SSR与实际浏览器分别验证2组及10根/12件不相加，不以表单状态推断正式计入。 |

当前为局部读取投影纠错，不执行模块拆分。大模块具体拆分方案继续采用[W2首批源码映射](../branch-review-20261016-w2-form-integrity/source-map.md)及原[结构候选](../branch-review-20261015/structure/)；这些只是逐批提取的建议，须先建立文档协议、历史命令和事务所有权的行为护栏，不能以统计行数替代方案或直接开始大重构。

下一检查点仍为W2：填报值经SAVE/SUBMIT/完成事务到原始份、主/子表字段来源、正式业务投影与DHR索引的同一身份；按最新DEC0079区分过程参考与正式计入。H003/H004等作业配置线索留W3，A12变更/作废依赖继续暂缓。
