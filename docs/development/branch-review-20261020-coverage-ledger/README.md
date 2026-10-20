# 跨批覆盖总账恢复

本批为 L1 审查工具及台账维护。目标是修复 PR17 前已披露的跨批总账缺口，恢复可续接的审查入口，不修改业务实现、知识政策、数据库或历史数据。全分支 W0→W7 审查仍在进行。

## 固定基线与来源

2026-10-20 显式获取 `origin/edhr-dev`，固定提交 `1185e6daa3425bb1856df7a6db12b2e939b0afad`，树 `ffd9dc58be3ea39baa031a0089e7fd9a9607de19`。PR17 已人工合并于 `336466d95c3866581e5d7d641544756ba7807946`，合并树与交付 `6c93b38662ee3b795306129ff093c22fcfd75032` 相同。之后用户新增 `2c5ca14e`、`dd46244c`、`d7dd56d3`、`1185e6da` 四次提交，含追溯单绑、空白区域身份和显示/保存修复及其证据；本批纳入文件差异，不冒充已重新验收这些业务改动。

AGENTS、codeplz、角色/交接契约和 DESIGN 相对 PR17 无变化；知识版本仍为 0.3.25、schema 1.2.0。原 CSV、JSONL、质量报告和失败记录保持原字节，仅更新旧目录的实时入口 NEXT.md。基线清单描述上述固定提交，新增本批工具/台账文件不倒填到该历史树。

来源目录见 [source-catalog.json](source-catalog.json)。三个只读来源整理实例的原始返回及 SHA 存于 [evidence/source-preparation](evidence/source-preparation/receipts.json)，它们是索引准备材料，不是正式独立质量结论。规范目录逐条保留原证据提交、路径、定位、SHA，以及受审源码提交、blob、SHA、方法范围和限定说明。没有通过短 ID 合并不同的 F002/T001；父问题和子问题关系保留，不能把记录数当唯一缺陷数。

## 四种进度分别呈现

| 维度 | 实际结果 | 边界 |
| --- | --- | --- |
| 分类盘点 | 2,293 个受控路径；恢复原 14 列及显式源码 blob、证据关联；HTTP 437、前端路由 191、状态定义 8、后台 1 个候选，迁移 126 个文件 | 路径分类及入口为启发式候选，需要源码核对；不是人工逐文件审查完成 |
| 源码核对 | 汇总 162 条列明范围记录，涉及 66 个唯一源码路径；125 条文件 blob 未变，37 条变化需增量复核，涉及 12 个路径 | 条目可能重叠，非 162 个不同方法，也没有全部方法分母；只承接原范围，整文件完成数为 0 |
| 知识语义 | schema 声明集合提取 2,534 个唯一 ID；旧 33 条结论保留：28 consistent、1 superseded、4 evidence-gap；其中文本都未变，26 条依赖变化，7 条保留原范围证据 | 26 份维护结果仅作 provenance；未审项、旧 gap 和后续 knowledgeSync 不转为当前一致通过；本批新增语义审查为 0 |
| 整改与验收 | 40 条父/子/工具/文档/暂缓问题记录；68 个按原字节摘要去重的历史 qualityResult，保留 48 passed、19 failed、1 blocked 原状态 | 不是 40 个唯一缺陷或 68 次不同测试；不重写旧报告、不将历史通过计为本批执行，本批业务运行检查为 0 |

机器汇总见 [ledger/summary.json](ledger/summary.json)。源码范围、知识记录、问题、质量结果分别位于 method-reviews.jsonl、semantic-reviews.jsonl / knowledge-records.jsonl、findings.json、quality-report-index.json。原始自由文本日志和命令不再次复制到验收索引，仅保留 Git 来源定位及受控元数据。

## 承接规则与可复现验证

文件 blob 相同只保留列明范围的历史证据，不声称当前运行通过；文件变化或移除时标为 needs-delta-review，不断言每个方法都变化。缺少来源提交记 evidence-gap，错误提交、源码摘要或证据摘要直接报错，不回退到当前 HEAD。知识记录使用排序键规范 JSON 的 SHA256；定义仅取 schema 的顶层/嵌套集合，不把引用对象的 id 算成定义。知识自身摘要相同仍需比较原记录列明的源码/断言依赖；这是有限依赖列表，不是完整自动依赖图。

使用 Python 3 和 PyYAML（当前 3.12 / 6.0.3），在仓库根目录执行：

```sh
python3 scripts/test-branch-review-ledger.py
python3 scripts/build-branch-review-ledger.py --ref 1185e6daa3425bb1856df7a6db12b2e939b0afad --catalog docs/development/branch-review-20261020-coverage-ledger/source-catalog.json --out docs/development/branch-review-20261020-coverage-ledger/ledger --check
```

普通生成必须使用新的空输出目录；`--check` 在临时目录重建并逐字节比较，不覆盖已有证据。更换目标提交时须先对新变更增量核对来源目录，再使用新目录生成，不把本目录误称最新结果。保留来源整理说明中的 18 条范围/时间限定与原 H009 标签勘误。

## 下一条审查链与剩余任务

总账收尾后先显式 fetch 最新 edhr-dev，在新基线上审查用户新增追溯单绑的 W2→W1 边界：Shell/prepareDesign → 配置 validateConfiguration → ExecutionSnapshotBuilder 的表单快照 → 历史读取。核对空白区域身份、主表显示/保存、旧 preview/validate 消费差异及新旧快照兼容；0116/0117 清理只读源码与隔离验证，不执行真实清理，不恢复历史数据。审查允许得出无缺陷结论；只有证实缺陷才另起最小整改切片。

随后回到 W3：H009 为 completionCondition 透传，H010 为旧条件形状，两者是 source-confirmed/pending，不是本批重新裁定；还须覆盖 saveGraph 之外 newDraft/copy 入口。H012 为通用工作流转移候选来源快照，与 H009 不是同一项。H006/H007/H008/H012 保留待裁定，H003/H004 已合入、H005 不重开。

W1 四个知识 gap 与两项旧 DHR high 保留。后者为完整证据影响比较/主动通知、真实 A12 来源变更/作废生效与消费联调；因记录控制上游尚未实现，依 2026-10-16 用户确认暂缓，仍 open，不计已解决。无依赖的现有写入口、历史读取和权限审查继续。

W4 主数据/生产累计、W5 构建/依赖/迁移/后台幂等、W6 已有七项具体拆分方案的择项验证、W7 遗漏反查和最终集成独立验证均未按工作包完成。已有具体拆分方案保留，不启动大重构。没有可信的全方法/场景分母，不发布整体完成百分比。

主侧已实际通过 10 项隔离 Git 历史回归，完整 1185 总账临时重建与交付文件逐字节相同；输出及摘要存于 [evidence/primary/receipts.json](evidence/primary/receipts.json)。未运行应用测试/数据库/浏览器，本批未改应用。正式独立结果将在收尾登记；独立角色未给出正式 passed 前不发布可验收结论。不开启 Actions，不合并、不部署、不执行迁移。
