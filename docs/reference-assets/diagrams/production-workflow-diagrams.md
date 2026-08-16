# 生产业务流程图

本组图用于内部研发对照冠骋生产执行方式，并设计 eDHR 的后续生产模块。图不是客户功能说明，也不会改变当前知识模型、运行时规则或产品承诺。

## 图例

- 冠骋图中的实线节点：由探索之旅、业务流程图或冠骋前后端代码确认。
- 冠骋图中的虚线节点：已找到同域能力，但不是主流程每次必经的步骤。
- 事务不是“异常处理旁路”。在冠骋中，事务定义、适用配置、实例、节点状态和主线追溯构成运行编排层；不良、返工、报废只是该层可配置的部分业务场景。
- eDHR 目标图中的 `建议 P0`、`建议 P1`、`建议 P2`：开发建议，不是已实现状态、运行时能力或对客户的承诺。
- 快照图中的实线：当前受控主数据关系；虚线：生产模块实现后才会建立的运行期关系。

## 图稿

| 图 | Mermaid 源文件 | PNG 图稿 | 使用目的 |
| --- | --- | --- | --- |
| 冠骋生产与事务运行链路 | [源文件](crown-production-execution-workflow.mmd) | [PNG](crown-production-execution-workflow.png) | 展示事务配置、工序/事件触发、实例编排、表单回写与追溯之间的主链。 |
| eDHR 推荐生产与事务演进链路 | [源文件](edhr-target-production-execution-workflow.mmd) | [PNG](edhr-target-production-execution-workflow.png) | 对齐当前产品制程建模；P0 预留事务上下文，P1 建最小事务闭环，P2 再扩展编排节点。 |
| eDHR 执行快照、事务上下文与追溯 | [源文件](edhr-production-execution-snapshot-and-traceability.mmd) | [PNG](edhr-production-execution-snapshot-and-traceability.png) | 说明运行期不读取可变主数据，并从 P0 保留后续事务实例可消费的上下文。 |

## 主要证据

- 冠骋的用户级主流程：`/Users/ivenwang/Documents/iven space/edhr探索之旅.docx` 的“生产执行、电子放行、数据追溯”章节。
- 冠骋开工、快照、DHR 创建：[ContainerWorkStartBs.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/transaction/biz/ContainerWorkStartBs.java:195>)。
- 冠骋完工前权限、必填表单与 BOM 校验：[ContainerWorkCompleteBs.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/transaction/biz/ContainerWorkCompleteBs.java:108>)。
- 冠骋工序事件触发事务实例：[TxnExecuteService.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/transaction/method/TxnExecuteService.java:327>)。
- 冠骋事务流程的表单、配置和子事务节点：[FormNodeDelegate.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/bizProcess/juel/FormNodeDelegate.java:56>)、[ConfigNodeDelegate.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/bizProcess/juel/ConfigNodeDelegate.java:39>)、[TransactionNodeDelegate.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/bizProcess/juel/TransactionNodeDelegate.java:64>)。
- 冠骋事务主线和主体关系：[TxnMainlineEntity.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/transaction/entity/TxnMainlineEntity.java:20>)、[TxnRefApi.java](</Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/transaction/method/TxnRefApi.java:37>)。
- 本产品对事务、投影、DHR 汇总的边界：[transaction-traceability-dhr-business-rules.md](../../architecture/transaction-traceability-dhr-business-rules.md)。
- 详细调研：[冠骋事务模块调研](../research/crown-transaction-module-research.md)。

## 当前状态

产品制程、路线、DHR、表单与文档的受控配置已实现。工单、批次、执行快照、工序实例、DHR 实例、汇总、放行和追溯查询仍是后续生产模块范围；不得依据本图将其描述为当前可用功能。
