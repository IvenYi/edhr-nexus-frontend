# 第二轮独立质量复验

实例 `/root/batch_process_quality_final`，只读语义子检查 `/root/batch_process_quality_final/semantic_final`；均未参与任何修复。实际读取项目、codeplzreadme、质量与交接契约、知识0.3.25及当前决策/规则/影响报告。HEAD、origin/edhr-dev、远端比较均为 d5adf22066ea4d6bb1c7e7ede09961fc97bea675，契约无未提交修改。

## 原两项修复闭环

- QF-BATCH-001 已解决：DEC-0001-03 已明确逐对象选版、工单不锁单一制程；同文件 -09 同步首次合法START冻结产品簇上下文。replacementScopes 与 knowledgeSync 有声明级处置。`ProductionService.split/requireProcessVersion`、`ExecutionSnapshotBuilder.build` 的原始源码支持这些当前说明。
- QF-BATCH-002 已解决：审计规则身份要求限定到创建/制程引用变化/首次合法START/制程引用展示；普通UPDATE保留差量，只有历史事件实际保存processSnapshot才展示{}。控制器writeChangedAudit及执行auditObjectStatusChange与修正一致，不需要每条事件重复全配置。

## 本实例实际运行

- `mvn -q -f tools/knowledge-model/pom.xml test`：89项，0失败/错误/跳过。日志 `/tmp/batch-process-final-knowledge.log`。
- backend：`mvn -q -Dexec.skip=true -Dbatch.test.url=jdbc:postgresql://localhost:5432/edhr_batch_process_quality_20261027 -Dtest=BatchProcessIntegrationTest test`：12项，0失败/错误/跳过。日志 `/tmp/batch-process-final-critical-tests.log`。该库为首轮独立角色建立的干净当前baseline库，未重置用户原开发库。
- SQL：质量库旧工单制程列=0、旧FK=0、databasechangelog=2。完成事件390211901486321664只有`{status: COMPLETED}`；主侧专用库首次开工事件390207977127727104仍保存“更新后的装配”，当前路线节点已经为“再次变化”。差量与冻结原件边界均有真实数据依据。
- `git diff --check`：通过。独立 GitHub compare_commits 对d5adf220…与edhr-dev返回identical/ahead0/behind0/total0。

候选代码diff SHA256仍为 `990237161db4e31852b34f0b81f3547283d32d6e1feda6a9d0e6e1829603e1d3`，计算范围同首轮quality-review.md。新增BatchProcessIntegrationTest SHA256=`5e4ed61ff5dbf66c850d470a8eaa825ee9e7e3ba927f7bf0715ddb25dbc26d0f`；ProductionObjectEditDialog=`ed2bb4a3837215d7c86df669d4d9b2799a03ce7b1247ff32cd4b636264804088`。

没有实现增量，首轮其余后端组合、全新库初始化、frontend build和独立浏览器结果仍对应相同代码候选。本实例核对后复用这些证据，**未宣称自己重新跑过它们**。本次修复只有知识，因此另做人工语义及89项检查，并独立重跑12项关键真实业务闭环。

## 新发现：交接描述复制错位（low）

QF-BATCH-FINAL-003：ontology-result.yaml 的knowledgeSync以下6项，发现及最后采样时的scope均为同一数量下限文字：

`concept.work-order`、`concept.production-object`、`concept.production-batch`、`concept.execution-snapshot`、`concept.work-order-early-termination`、`concept.audit-change-snapshot`。

原文字是“原未决问题已关闭：BATCH允许任意正数量（含0.5），SN固定1；当前两条数量规则恢复specified/internal。”它实际属于quantity问题，而不是这6个concept的同步说明。当前ontology/glossary业务定义正确，本问题不影响运行模型，仅影响报告处置范围准确性。

已向主侧报告，主侧安排原本体角色仅修正报告，再由全新实例核对报告元数据及候选hash。本实例不参与修复，结果保留 **failed** 的发现时点。没有新的业务实现或本体语义冲突；两项原medium在本轮结果中标记resolved并附复核证据。
