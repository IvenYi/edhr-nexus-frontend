# 冻结候选只读文档与证据核对

这是独立质量实例派发的只读辅助审查，不是单独的 `qualityResult`，也不替代主质量实例的源码、测试、浏览器或数据库验证。

- 实际 base：`b191e054892ae06cb0d8a45f62d034deabbba3e3`。
- 实际 HEAD：`c4491dde7703e778c0b4ba7dd293dc940d8a262d`；核对时工作树 clean。
- 实际知识基线：`0.3.25`，schema `1.2.0`。
- 契约：读取当前 AGENTS、quality-verifier、统一交接契约；项目/编码/角色/交接契约与 base 字节不变。参考当前知识入口、未决问题、DEC-0080 新资产及 DEC-0009/DEC-0067 原范围。
- 仅运行只读 Git/文件读取、CSV 解析和 bytes/SHA256 核对；没有运行测试、build、Maven、浏览器、数据库或 GitHub Actions，没有修改任何仓库路径。

## 结论

在以下有限范围内未发现需要整改的可定位问题。`findings: []`。本辅助结论不声明完整 W2、全库知识语义审计或产品运行验收完成。

1. **固定分母真实。** `coverage.csv` 1931 行的路径集合及每条 `source_blob` 精确等于 base 的 `git ls-tree -rz`；1931 条都为 `pending / inventory-only`，基线列均为 b191。356732 bytes、SHA256 `fd7204343cc4d6a0698976e5327b1aa7f641824dd45de2861a4742ef13541e1b`，无 BOM，全部 CRLF。README、findings、source-map、baseline 和 NEXT 均未把盘点冒充全量审查完成。PR14 merge 与批准提交的 tree 均为 `c18e8b782a1a9d85b4435673f86a8e227e6d88ef`。
2. **原始归档及范围相符。** 9 份 helpers、3 份 ontology、14 份 primary 归档分别匹配收据 bytes/SHA256，并与现存 `/tmp` 原件逐字节相同；用户交接 ZIP 的摘要及两份主文档成员也与归档逐字节相同。辅助报告原笔误 `execute` 没有回写，收据/source-map 单列实际 `ProductionExecutionService.act`。原始辅助材料、环境 smoke、用户附件与独立验收的身份已明确区分。
3. **冻结源码与证据时点可追踪。** 主测 `productionAndTestSources` 的 9 个摘要、正式 ontology scope 中 7 个 owned 知识/架构摘要、14 个源码/测试摘要、3 个契约摘要均精确匹配冻结候选。正式本体结果明确在 b191 的 dirty 阶段生成，未伪称 base 已含修复；目前可由这些摘要连接到 c4491dde。真实 UI fixture 与后端安全测试资源仍为相同 6343 bytes，SHA256 `721d500935aa38b52dae95414e45d1c41c8921b2c50788864ea3554a2ada2b63`。
4. **用户确认没有被扩大。** DEC-0080 与 Markdown 保存实际异步原问题及答复“必须共用同一组选项（推荐）”，只规定同一表单内同一单/多选字段共享选项；不同字段、跨表单、默认值全生命周期、A12 及历史迁移未被新授权。canonical model、写命令内同步与实际 value 默认属于工程选择。旧 DEC-0077-12/22 的冻结、完整 document 保存撤销边界保留，无虚构 supersedes。新定义/场景为 specified/internal；未新增业务事实、运行规则或执行契约，未提升知识版本、客户/runtime 可见性或 P0 成熟度。schema、open-questions 字节不变。
5. **去重与暂缓准确。** PR5/6 和已合 PR10–14 的修复保留原验收范围；当前 W2-F004 与前批 W2-F003 分开，不重计历史测试。W3 AUD-H003 缺模式/发布旁路仍 open，并明确需要保留 DEC-0009 的不完整草稿边界；H004/H009/H010 仍 open。A12、表单变更作废及其两项旧 DHR high 仍按用户决定暂缓/open，未被本批关闭或降级。
6. **S04 是具体未实施方案。** source-map 按职责提出坐标/page 命令、字段绑定对齐、组件节点工厂及原持久/事务所有权，包含输入输出、唯一 history、等价性测试、身份/布局/冻结回归和逐批回滚。当前文件行数与说明一致：store 3574、Inspector 2272、MockFillDialog 1644、新模块 70；没有把行数本身当缺陷或声称已完成大重构。
7. **验证边界诚实。** 文档把 126 Node、13 浏览器、186 Java 实跑通过/3 条件跳过列为主侧结果，没有把主测或本体只读核对当独立 QA。H2 PostgreSQL 兼容模式、受控浏览器保存回调与原生 PG/认证后端 HTTP E2E 已分清。390px 的既有 toolbar 溢出/纸面横滚未被说成完整移动验收。lint 缺配置及主侧当时 premium 未运行的记录保留为其原时点；主 QA 当前恢复官方扫描时，应另记实际结果，不改写原记录。

## 交付前的 L0 登记

冻结候选中的 README/findings/baseline/NEXT 仍保留“候选尚未登记 / 本体或独立 pending”的创建时状态。该状态没有冒充验收通过，不构成当前代码/知识阻断。主实例在收到主 QA 正式 FINAL 后，应以纯 L0 文档记录实际候选 SHA、正式本体/质量结果及当前扫描结论，保留所有原件、原受测 SHA 与主侧当时未运行的事实。

机器核对细节：`/tmp/edhr-w2-choice-readonly-doc-inspection.json`。该文件只包含范围、摘要比对、计数和时点说明，不包含原始日志、认证数据或配置全文。
