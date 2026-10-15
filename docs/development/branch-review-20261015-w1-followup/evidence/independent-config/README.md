# W1 START 配置一致性：最终独立复验

结论：`qualityResult.result: passed`。本实例 `/root/audit_w1_snapshot_independent` 是本批未参与修复的全新质量实例；没有修改生产、测试、迁移、配置或知识文件，也没有提交、推送、合并、部署或查询/触发 Actions。政策辅助实例亦只读，已返回结构化 FINAL；实际 Maven 和控制器 probe 由本实例独立执行，不沿用主侧通过记录。

实际候选为 `1113fe14f7f7539b9727fc708f49838504287d4f`，目标为 `edhr-dev@6379bf105127b05a65695992b008b55c142264f9`。目标是候选祖先，因此测试的 HEAD 已包含目标，不伪造单独集成提交。工作树另有 15 个审查台账路径，包含范围和 SHA 见 `working-tree-final.json`、`reviewed-documentation-manifest.json`；不将未提交文档编造成 commit。契约实际按候选 HEAD 重新读取，和目标、历史 537bb240 的对应 blob 相同；不沿抄主侧早期实际读取提交。

独立实际运行：

| 环境/范围 | 条目 | 通过 | 失败/error | 跳过 |
| --- | ---: | ---: | ---: | ---: |
| PostgreSQL 16.15，ProductionExecutionIntegrationTest 全类 | 69 | 67 | 0/0 | 2 |
| H2，WorkOrderCloseAtomicityTest / DhrFillingServiceTest / DhrSummaryPersistenceTest | 33 | 33 | 0/0 | 0 |
| tools/knowledge-model 全部测试 | 89 | 89 | 0/0 | 0 |

新增 `firstStartFreezesOneCommittedConfigurationDuringProcessRebinding` 在独立 PostgreSQL 库 `edhr_w1_independent_snapshot_20261015` 实际通过，未跳过。两个跳过仅为既有 opt-in 夹具 `formRecordsBrowserFixture`（缺 `form.records.browser`）和 `browserEvidenceFixture`（缺 `execution.browser`）。本实例没有在 H2 声称验证该 PostgreSQL MVCC 专项。

另有 3 项非 Maven 控制器隔离 probe：嵌套 SQLState40001 转现有400、其他 SQLState 保持原异常重抛、非 SQL 异常保持原异常重抛，且每次只调用服务一次。它们不加入上述 67/33/89 测试数。真实事务回滚、权限和持久化由 PostgreSQL 集成覆盖，不由 mock-service probe 证明。

PostgreSQL 日志有两次真实 40001；双 START 仍严格要求 200/400 且只有一次 execution、DHR 与对应审计；等锁终止后执行400，revision及终态不变。审计失败、签署失败等相邻回归通过。两个 backend Maven 均实际执行 `build:dhr-print`，未使用 exec.skip；本批没有整页浏览器、视觉、PDF渲染或生产数据验证。

原红轮 XML 和快照独立核对 SHA 与内容，确有旧 route3/DHR4 加新 form15/item150；本实例没有重跑旧生产源。最终加强用例同时覆盖随后删除旧目录项，当前 START 仍冻结旧 item50，下一对象使用新配置且旧 execution 不回写。写侧是依据实际 updateVersion / composition 的有序原子 SQL 模型，不是管理员 HTTP E2E。FK 删除保护仍存在；只在旧绑定解除、此新对象尚未创建 DHR 且无其他已知引用时删除该项，不能外推任意历史项可删除。

知识保持 `0.3.25 / schema 1.2.0`。实际差异仅两条 evidence description 与一个新增 test evidence；定义 2486→2487，不改 DEC、业务规则、生命周期、删除政策、数量或成熟度。源码/测试/知识/工具等保护清单共 1196 个文件，验证前后 SHA 无变化；四个候选变更文件 SHA 另列。源码核对确认首次 START 由直接控制器进入 RR 事务；DhrFillingService 外层事务不会升级隔离，但它不允许 START，不宣称所有嵌套调用均升级。

12 项必需检查通过，已独立复核并关闭本批原 high `W1-START-CONFIGURATION-MIX`，没有新的 open finding 或 blockingCondition。本结论仅对这批整改及明确相邻范围有效。四个知识 evidence-gap、W1 剩余入口/F004、W2–W7 保留；已终止 detail 的前置 execution 解析仍是未找到合法坏 JSON 触发的观察，不据人为损坏数据库要求改业务代码。没有合并或部署授权。

记录卫生：开始曾从仓库根目录调用一次 H2 Maven，因该目录无 pom 未执行测试，保留为 `h2-wrong-directory-*`；更正至 backend 后实际 33 项通过。Maven target 内其他旧 XML 已从本次索引排除，结果只计命令指定的 5 个 suite XML，PostgreSQL XML 已在 H2 前保存。没有用旧报告虚增独立运行数。

建议提交到仓库的安全摘要：`quality-result.yaml`、`postgresql-result.json`、`postgresql-case-index.json`、`h2-result.json`、`h2-case-index.json`、`knowledge-result.json`、`knowledge-case-index.json`、`commands.json`、`raw-xml-summary.json`、`candidate-source-sha256.json`、`protected-manifest-final.json`、`contract-blob-baseline.json`、`working-tree-final.json`、`reviewed-documentation-manifest.json`、`primary-red-crosscheck.json`、`controller-probe-result.json` 和本说明。可另保留临时 probe 源码供复现，但不能把它冒充项目 Maven 测试。

原 `.log`、原 XML 及 `primary-red-*` 拷贝只保存在 `/tmp`，可能含测试 JWT/随机测试凭据或完整测试请求，不应直接提交到仓库。`raw-xml-summary.json` 是不含 system-out 的 SHA/计数摘要。
