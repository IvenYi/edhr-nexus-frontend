# 独立 QA：知识与问题来源核对

受测候选：319501bca472cac261c8e492c0d4682cf04f17d2；业务来源基线：1185e6daa3425bb1856df7a6db12b2e939b0afad。角色/交接契约及知识0.3.25/schema1.2.0已实际读取。本子任务只读，不参与实现或修复；未运行应用、浏览器、数据库、迁移或 Actions。

独立临时脚本不导入生产生成器：按 schema 顶层集合与类型化嵌套集合提取定义，重新计算排序键规范 JSON SHA256；与交付2,534条记录逐条核对 ID、类型、路径、定位及记录摘要，全部一致。引用对象 id 未计入定义，没有新增语义通过声明。

原33条 semantic JSONL逐条与固定Git原件相同，28 consistent、1 superseded、4 evidence-gap原结论保留。33条自身定义摘要均未变。以原记录列明的字段内出现的真实Git路径独立识别依赖并比较历史与当前blob，26条需delta、7条可保留原范围证据，当前计数匹配；这不是重新审查业务语义。26份 knowledgeSync仅作provenance。

问题记录40行精确对应原21主线+17子记录+2用户暂缓，全部完整ID唯一，所有finding来源receipt摘要验证通过。F002-FORM-AVAILABILITY通过显式alias指向AUD-H002，COLUMN-INSERT-NODE-ALIGNMENT独立保留；两个T001完整ID独立。H003/H004为历史独立验收关闭，H005为原已修复不重开。H009为completionCondition透传、H010为旧条件保存/发布不对称，均confirmed-pending；H012为通用WorkflowEngine转办候选来源快照，pending-adjudication，与ProductionExecutionEngine.transferForm不同。两项用户暂缓DHR high、四个旧知识gap和H009旧标签勘误均保留。

## 可复现问题：QF-LEDGER-003（medium）

`scripts/build-branch-review-ledger.py` 的 DEPENDENCY扩展名过滤遗漏`.sql`，使原记录明确列明的数据库实现依据不进入依赖比较。当前原件中 `0089-dhr-instance-management.sql` 被以下六条遗漏：DEC-0062-02、DEC-0062-06、anchor.dhr-instance-query-permission、fact.dhr-instance.has-view-permission、rule.dhr-instance-query-permission、rule.dhr-instance-unique-per-production-object。

该SQL在原提交与1185的blob均为811927fe470afc02b1c5f54f2ded5440d386f24f，所以当前26/7分布没有因此变化。但实际隔离Git反例证明：只修改原semantic implementationEvidence列明SQL，其余源码/依据未变，生成器返回retained-scoped-evidence且sqlIncluded=false，预期应为needs-delta-review。错误承接可复现，必须补齐来源识别及对应回归后复验。

执行：`python3 /tmp/edhr-ledger-qa-sql-dependency-repro.py`。反例输出见同名.json；独立完整核对原件为 `/tmp/edhr-ledger-qa-knowledge-check-observe.py` 和 `/tmp/edhr-ledger-qa-knowledge-findings.json`。未提出未验证的修复实现，修复由主智能体完成。

本子任务结论：知识/问题索引其余核对通过，但依赖识别存在上述medium问题，应由主 QA在正式failed中保留。不得把本报告当业务全量审计完成。
