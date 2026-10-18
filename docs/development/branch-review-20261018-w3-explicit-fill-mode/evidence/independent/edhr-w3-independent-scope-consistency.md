# W3 独立只读辅助：盘点、声明与来源一致性

本报告为全新独立质量实例的只读辅助，不是正式 `qualityResult`。本辅助未参与修复，没有修改 tracked 文件，没有运行编译、应用测试、浏览器、构建、提交、推送或合并。

核对范围为 `4b25dc7f29c27cfb39c0f570b547869aa0c2f289..2f8144220d1f7fc5a54b183204777bcae5bbd564`。实际 HEAD 为后者，读取时工作树干净。知识基线 `0.3.25`、schema `1.2.0`；实际项目、质量角色和交接契约读取自 candidate，目标契约与 base 相同，没有未提交契约路径。已读本批 README、baseline、findings、source-map、decisionPackage 及相关 DEC-0067/DEC-0009、当前知识和未决项的适用内容。

## 确定核对结果

- 独立 `git ls-tree -r -z` 得到 base 2062 个路径，全部 blob。`coverage.csv` 恰好 2062 行，没有漏项、额外路径、重复路径、错误 baseline 或错误 blob；2062 项全为 `pending / inventory-only`。CSV 384885 bytes，SHA-256 `b475671f2ba5d3eec18fe8a0bdbd0f28cbf489a624abf1c203ee6bea5c23837e`，无 BOM、2063 个 CRLF、无裸 LF，符合台账。
- base 中 12 份历史 `branch-review-*/...coverage.csv` 或 `...inventory.csv` 在 candidate 字节均未改变。旧分母、旧结果没有被本批清单覆盖。
- AGENTS、codeplz、DESIGN、knowledge schema、`docs/agents/` 全部契约和两份 GitHub workflow 共 10 个保护文件 base/candidate blob 相同。本报告不据此宣称已核验 GitHub ruleset 或必需状态检查。
- 知识差异新增 1 个 evidence ID，无删除 ID。DEC-0067 的全部 decisionStatements 与 base 深度相等；规则除 evidenceIds 外深度相等；知识版本、specified/internal 及 reviewStatus 不提升。唯一状态变化是同一条 AUD-H003 对应 implementationDiscrepancy 从 open 到 resolved；当前文字明确其依据为源码和主侧回归，独立质量另取最终结果，不冒称 DEC 全切片、W2/W3 或全库审查完成。
- 对 source-map 的命名方法逐条核对，声明涉及的 9 个主要源码文件、35 个方法/调用文本均存在。实际阅读确认两条产品/产品簇保存和复制适配路径分别经过共享 serialize/parse；ExecutionSnapshotBuilder 在工序绑定与 WORK FORM 调用严格模式 helper，CUSTOM 另走 customForm；首次 START 在同一事务内先构建快照，再创建执行。
- 前端父路径实际存在：router 的产品 modeling workspace、ProductModelingPage 的完整 Dialog、ProductFamilyModelingPage 的完整 Dialog。workspace 和共享 Dialog 中原新增命令显式创建 DIRECT，实际共用 FormFillSettingsButton。WorkTemplateEditor 的 publish validator、caption、serializer 及错误处理与 source-map 描述相符：新缺模式错误“请选择填报方式”不包含“表单”，不会命中现有表单引用错误分支。此结论不扩大成所有历史流程引用错误处理都已纠正。
- S04/S 大模块拆分提案含纯图协议、编辑命令唯一 history、后端发布事务用例、冻结消费边界及相应等价回归保护，确为具体方案；本批差异没有实施这些大搬迁。
- helpers / ontology / primary 的 20 个归档 receipt 均与实际目标字节数和 SHA-256 相等。primary 记录的 10 个源码/测试脚本 read-time 摘要与 candidate 字节均相等。README 的 Java 296 总计、293 通过、3 条件跳过，与主侧安全摘要相符；本辅助没有重跑或独立证明这些运行结果。

## 判断与限制

在本辅助限定的盘点、来源、方法映射与声明一致性范围内，**未发现可复现的确定问题**。报告清楚保留了待审状态、H2 与原生 PG 的层次、受控 API 浏览器与真实后端 E2E 的区别、主侧运行与正式独立质量结果的区别，以及 ESLint/官方 UI 脚本缺口。AUD-H004/H009/H010、A12 和两项旧 DHR high 没有被误标关闭。

本结论不替代父质量实例对实际候选的代码行为、测试、构建和 UI 复验；不构成合并许可。逐项 JSON 见 `/tmp/edhr-w3-independent-scope-consistency.json`，其中记录 exact base/head、每份历史/保护文件、归档摘要、源码符号与明确未执行项。
