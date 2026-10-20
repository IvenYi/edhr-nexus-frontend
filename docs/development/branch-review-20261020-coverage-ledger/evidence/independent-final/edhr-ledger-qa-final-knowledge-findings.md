# 知识/问题来源独立复验

本轮受测候选：cbf83d0eef9df2c18f6296b8426383775e56b430，实际 HEAD 与之相同，工作树 clean；固定业务来源和契约基线仍为1185e6daa3425bb1856df7a6db12b2e939b0afad、知识0.3.25/schema1.2.0。本实例未参与任何修复，未修改仓库，未运行应用、数据库、迁移或浏览器。

实际复验结果通过：

- 原SQL-only最小反例使用新-final脚本和输出独立重跑，现sqlIncluded=true且carryStatus=needs-delta-review，符合预期。QF-LEDGER-003的错误承接反例已不再复现。
- 独立按schema提取的2,534个定义及canonical摘要，逐条与本轮交付一致；没有把引用ID计入定义，没有当前语义通过声明。
- 原33条历史记录逐条保留28 consistent、1 superseded、4 evidence-gap；旧定义摘要均未变，原列明依赖逐条与历史/当前Git blob匹配。6条0089 SQL来源现已补齐，独立识别的实际依赖与生成依赖集合完全相同，遗漏为0。真实SQL本身未变化，26条delta/7条保留原范围证据的计数保持正确。
- 40条问题记录仍为21主线+17子记录+2暂缓，完整ID/别名关系、来源摘要、两暂缓high、四gap及H009/H010/H012区分保持。26份knowledgeSync仍为维护provenance，未转为本轮语义审查。

原始初轮报告、统计和SQL反例均未覆盖。新证据：`/tmp/edhr-ledger-qa-final-knowledge-findings.json`、`/tmp/edhr-ledger-qa-final-knowledge-check.py`、`/tmp/edhr-ledger-qa-final-sql-dependency-repro.py`和同名.json。本子任务未发现新的可复现问题，结论仅适用于上述索引与依赖边界，不声称业务全量审查完成；正式质量结果由主QA汇总。
