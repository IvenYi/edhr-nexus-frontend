# W1 后续审查进度

本目录接续首批，固定来源/目标为 `edhr-dev@6379bf105127b05a65695992b008b55c142264f9`，审查分支 `audit/edhr-dev-w1-followup-20261015`。这是进行中的审查批次，不是 W1 或全分支完成报告。首个检查点31a8074a只有审查文档/清单；后续本批已复现并修复首次START配置引用混合，增加回归和有限知识证据。没有迁移或历史数据处置。

## 首批已按用户授权合并

用户明确同意通过 PR 合入首批。PR [#7](https://github.com/IvenYi/edhr-nexus-frontend/pull/7) 已合并为上述 `6379bf10`；批准头为 `427df1ef`，合并树与该头完全相同。实际受测 `1dac6338` 的产品、测试、知识和工具摘要逐项匹配，随后只有报告及授权说明，不冒充新一轮独立运行。原独立 56/89 通过记录保持其实际候选和范围。机器核对见 [merge-receipt.json](merge-receipt.json)。没有部署，未手动查询/触发 Actions。

本地原 `remote.origin.fetch` 只映射 main，导致显式 fetch 仅更新 FETCH_HEAD、旧 origin/edhr-dev 未更新，跟踪分支切换失败还留下本次操作自身的索引变化。已验证当时索引严格等于旧目标树、没有原有用户变化，仅恢复自身操作路径；随后为 edhr-dev 添加映射并普通快进。工作区已恢复干净，没有强制重置或改写历史。后续统一使用明确的目标引用，避免用旧 remote-tracking 值继续审查：

```bash
git status --short
git fetch origin refs/heads/edhr-dev:refs/remotes/origin/edhr-dev
git rev-parse refs/remotes/origin/edhr-dev
```

## 当前覆盖与来源继承

新目标实际为 **1,474 个跟踪路径**，coverage/entrypoints/migrations 和 inventory-summary 已按新目标重新生成；无排除。增加的审查资产和回归测试不能倒填到首批 1,423 路径分母。HTTP 437、前端路由 191、后台 1、状态定义 8 仍为静态候选；迁移目录 124 文件仍不是已执行 changeset。

知识文件仍 252、定义 2,486、版本 0.3.25。本次未修改定义；首批 33 项语义来源和 2,452 pending 保留原基线，不重复计为本批新增完成。只针对原四项 evidence-gap 回到原始规则和实际消费者补读，38 个相关路径的源对象在领域读取点 3cfff 与合并点 6379 相同，详见 ontology/baseline.json。契约实际初读仍为 537，后续仅无增量/blob 核对，不能伪写重读提交。

## 主侧本轮实际源码核对

- `ProductionExecutionService.act` 先工单再对象锁，锁后检查对象状态及 execution revision。`DhrFillingService.act` 的非完成路径委托到该受锁入口，不仅依赖最初的状态读取。补录 mutate 另以工单→对象→DHR→execution 顺序加锁，只准生产 COMPLETED 且汇总 NOT_STARTED/DRAFT。
- `ProductionService.endObject` 与 `DhrInstanceService.terminateWithProductionObject` 在同一事务处理生产终态、DHR 状态、终止快照/hash和审计；DHR 非填报中、有汇总草稿/版本、缺少实例或执行记录均有阻断。已有用例实际验证另一对象不受影响、重复终止拒绝、缺失 DHR 不留部分终态。
- `DhrSummaryService` 的保存/提交/重新整理先锁对象再 DHR，与补录共享对象/DHR 锁顺序。reorganize 仅准当前 FORMALIZED、理由非空及 expectedVersionId 为最新版本；prepareNextDraft 创建草稿并保留原冻结版本。未据此宣称普通工作流、全部签署入口或并发矩阵审完。
- 已终止 detail 最终返回校验过的终止冻结正文；但返回前仍会先解析当前 execution 并计算 incomplete（DhrInstanceService:249–254）。这是应继续核对的读取依赖：尚未发现合法后续变化能触发失败，不以人为写坏数据作为已证实业务缺陷，不为去掉风险顺带重构。
- 首次 START 与管理员同时修改制程/路线/表单/工作流配置的整体冻结一致性尚待受控事务复现。现有“并发 START”和“执行等锁后遇到终止”只覆盖对应竞争，不能替代配置编辑竞争。

## 本次实际运行

以新目标 6379 执行了 [25 项聚焦测试](evidence/main-run-result.json)：ProductionExecutionIntegrationTest 选择 5、DhrSummaryPersistenceTest 选择 3、DhrAttachmentAndArchiveTest 13、DhrFillingServiceTest 4；全部通过，0 failure/error/skip。方法和参数化用例名、原 XML 摘要见 [用例索引](evidence/main-run-case-index.json)。这是主侧运行，不称为新的独立质量验收，不与首批 56/89 相加虚增覆盖。

本次未使用 exec.skip，实际重新构建当前 DHR 打印前端资源。归档用例经真实 DhrPdfRenderer / Playwright Chromium 生成 PDF，并用 PDFBox 核对页数与中文文本；同时核对 FULL/SELECTED 同版集合、原件字节、冻结摘要和审计/签名范围。HTTP 路由用 MockMvc，持久化为隔离 H2，附件在临时目录；不是外部 PostgreSQL、生产数据、整页视觉或完整用户浏览器 E2E。日志中的浏览器依赖提示未导致所选 Chromium 测试失败，不外推其他浏览器可用性。

## 本轮技术判断与下一步

四个知识 gap 均已缩小到具体消费者/运行边界，但仍是 evidence-gap：没有通用事实读取器的证据，不能由列存在或硬编码领域实现自动提升 fact availability/成熟度。逐 ID 说明见 [ontology/README.md](ontology/README.md) 和 gap-recheck.jsonl。本体结果 not-applicable 仅指本次不写定义，整体审计继续适用。未新增已证实代码缺陷或必须让用户决定的业务歧义。

以上是31a8074a检查点当时的结论；其后的确定性整改单列于下，不用新发现覆盖当时的原始证据。

## 后续 L2：首次 START 配置竞争整改

已按 [决策包](decision-package.yaml) 完成实际PostgreSQL受控复现：START上下文route3/DHR4，却混入新配置form15/item150。原行锁保护生产状态，默认READ_COMMITTED无法保护跨查询的配置一致性。修复执行事务隔离级别及回滚后的特定40001冲突翻译；未更改业务政策。最终用例进一步验证旧DHR项被后续配置事务删除时仍冻结旧目录，新对象读取新配置，旧execution不回写。详情见 [发现](findings.yaml)、[验证说明](validation.md) 和 [红轮证据](evidence/start-configuration-red.json)。

本批知识仅同步两条源码/测试说明并新增一个test evidence，定义2486→2487，版本0.3.25不变。35条相关原声明是定位索引，不是35个新增语义通过；四个evidence-gap仍保留。见 [本体结果](ontology/config-race-ontology-result.yaml)。

PostgreSQL专项必须显式使用真实驱动运行；H2的隔离语义不能代替。运行、跳过与独立质量分开记录，原25项、首批56/89和本批数量不相加虚增覆盖。最终主侧及独立结果在本目录新增索引中记录，不回填6379固定清单或原检查点运行结果。

最终全新独立实例已对代码候选 `1113fe14f7f7539b9727fc708f49838504287d4f` 返回 [qualityResult passed](evidence/independent-config/quality-result.yaml)：12项必需检查通过、该high resolved、无open finding/阻断。实际PostgreSQL67通过/2原夹具跳过、H2相邻33通过、知识89通过，另3项控制器分支probe未加进测试数。前后1,196个产品/测试/知识/工具/契约保护文件摘要一致。后续只加入报告及状态说明，不改写实际受测提交；交付边界与原始证据位置见[交付说明](evidence/independent-config/DELIVERY.md)。本批技术上建议审阅合并，不代表全分支审完或已获合并/部署授权。

下一检查点：W1审批/修订/导出剩余入口，已补读的方法、保护边界和待执行场景见[剩余路径映射](remaining-path-map.md)；随后F004及W2–W7。七个方法级实际审查记录见[增量进度](review-progress.jsonl)，均未将整个文件或W1标完。本批只推送审查分支供审阅，不自动合并或部署；终止detail依赖目前仍无合法失败触发，暂不修改该处业务代码。
