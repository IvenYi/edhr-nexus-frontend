# 整体代码审查跨批范围复核（只读辅助）

本次对照 `START-HERE.md`、`HANDOFF.md`、当前 NEXT、PR7–16 各批 README/方法映射及已有验收边界。观察时代码冻结提交为 `a9ecd501a9abf354df95df2a1a01e53474a41a2d`，目标为 `ca98ab2897990eba30bf1433134aa8560578f562`；当前 H004 的全新最终 QA 尚在运行。本报告不复审源码、不执行验证，也不替代主审判断或独立 qualityResult。下表的“已读/通过”均指来源文档记载的原批次，不是本辅助重新认证。

**结论：存在部分执行重心及台账偏移，不能笼统回答“没有漂移”。** 已有工作包含真实方法链审查、反证、无缺陷结论及具体结构方案，并非只有修 bug；但近期推进越来越围绕 finding→修复→独立验收→PR，尚未把这些结果合并成当前基线的全量覆盖总账。已完成的小切片不能替代原交接的全分支审查退出条件。

## 跨批实际范围

PR7–16 已人工合并的现时状态取当前 NEXT；旧 README 中“待合并”是原时点记录，不改写为新一次受测结论。以下范围主要取各批 README、source-map；具体路径及本次亲读摘要在同名来源收据 JSON 中。

| 批次 / PR | 文档列明的主要源码链或方法 | 整改与独立接受仅限于 | 关键未覆盖 / 暂缓 |
|---|---|---|---|
| W0/W1 · PR7 | `ProductionExecutionService.act → ExecutionSnapshotBuilder.build → DhrInstanceService.createAtFirstStart/detail → DhrSummaryService.submit/version`；`WorkOrderController.close` | 首条创建/冻结/当前与历史读取映射；关闭审计原子性及 JPA 陈旧实体并发重复关闭修复。最终独立只接受本批两项缺陷和列明回归。 | 1423 路径不等于全审；33 项知识映射含 4 gap；完整 DHR 生命周期未完成。 |
| W1 · PR8 | 首次 START 的 `act/build` 多查询、制程绑定更新、DHR 目录创建 | 配置竞争导致旧 route/DHR 身份混入新表单/目录的最小修复；真实 PG 受控竞争及相邻回归。 | 全部管理 HTTP 并发组合、记录控制来源生效链、四个知识 gap。 |
| W1/F004 · PR9 | `RdoVersionTreeSelect/toVersionForm/toPayload`、制程候选与已存元数据、路线初始化 | 已存失效引用显示与合法新增选择分离；异步路线未初始化时空绑定保存保护。独立为实际编辑器和对应后端保护。 | 不改变生效准入政策；不等于所有产品/产品簇 CRUD、DHR 或记录控制审完。 |
| W2① · PR10 | `persistCurrentDocument → markSaved/isDirty`、宿主保存 mutation；执行保存→记录→索引/投影定向映射 | 请求 A 等待期间编辑成 B，A 成功后不能把 B 标 clean；手动/自动保存、失败与撤销回归。 | 全部 store 命令、导入归一化、真实后端保存和完整权限矩阵。 |
| W2② · PR11 | `ExecutionFormSelector.renderForm/work steps`、`formAvailabilityStatus`、实际份聚合及真实 engine 路径 | 计划与实际份数、作业结束未到达的 NOT_APPLICABLE、已有实际份状态展示；同步过时数量测试夹具。 | 不替代完整执行状态机、数量政策、全部历史/导入组合。 |
| W2③ · PR12 | `formAction/prepareTableRows → saved → trace.refresh → completed/process/failed → query/source/retry` | 无新生产缺陷；新增稳定 UUID 换序/保存/完成/投影失败重试，以及完成预检失败回滚两条 PG 贯通回归。 | 未完成所有过滤/授权、完整 ProductionExecutionService HTTP/JPA 或全部历史兼容矩阵；本批未做新 UI 验收。 |
| W2④ · PR13 | 导入与字段入口、`insertSheetColumns`、范围/节点/子表偏移、统一 history | 插列遗漏节点与子表几何同步修复；旧 cell-display 测试入口纠正；真实菜单、保存/撤销保护。 | 未验全部 Office 格式和全部结构命令；W2-C002 当时仍待实跑。 |
| W2⑤ · PR14 | `ModelTab.updateSubTableFields → updateField → syncBoundNodesForField`；embedded 与 canonical 消费差异 | 当前文档子列改名/改型同步到画布副本及实际模拟/纸面，单次完整 document 撤销。 | 不迁移旧不一致模板/执行快照；不新增停用隐藏政策；其余 W2 未完成。 |
| W2⑥ · PR15 | Inspector 选项/默认命令、父表 columns 初始化、store 同字段位置同步→冻结模型→SAVE/SUBMIT | 用户确认的同字段共享选项；默认保存真实 value、重复节点 key；独立发现 ModelTab 漏入口后新实例最终接受修正版。首轮 failed 保留。 | 不代表所有字段/默认/设计器命令完成；H003/H004 留后续，A12 等仍暂缓。 |
| W3① · PR16 | `usesProcess/serialize/validate`、作业草稿/GET/发布、工序写入/复制及首次快照；实际编辑器适配 | AUD-H003 缺失模式不再推导 DIRECT；不完整草稿保留，严格发布/新写与新快照拒绝缺失；共用 UI 待配置。 | 非全部管理 HTTP 复制组合、原生 PG 全矩阵或完整认证 E2E；完整 W2/W3 未完成。 |

PR8 后、PR9 前另有 **W1 审批/修订/导出审查批**：12 条方法范围覆盖 `DhrReviewService.detail/act`、专用 DHR 工作流防绕过、`DhrSummaryService.reorganize/version`、附件和固定版本档案导出，文档记载无新增可达产品缺陷。74 个主侧与首轮独立同组用例不能加为 148 个不同覆盖；最终通过的是限定台账/路径修正及既有运行证据，不是两项旧 DHR high 关闭。这是实际“审查不以找出 bug 为前提”的反证，不能漏掉。

当前 **W3② H004** 仍是另一有限切片：活动绑定已提供引用的草稿 guard、当前元数据成功后的明确配置确认；首轮独立 failed 暴露非数组流程节点旁路，最小补修及必要知识增量后等待全新最终 QA。本辅助不提前认定通过，不把本次范围复核扩大成第二批代码整改或提前创建 PR。

## 全量覆盖账本的实际差距

1. 原路径账本 `docs/development/branch-review-20261015/coverage.csv`：1423 行，实际 header 为：

   `baseline_commit,path,asset_type,domain,work_package,in_scope,exclusion_reason,review_depth,review_status,reviewer,source_evidence,finding_ids,tested_commit,notes`

   当前路径账本 `docs/development/branch-review-20261018-w3-binding-references/coverage.csv`：2118 行，实际 header 为：

   `baseline_commit,path,source_blob,review_status,review_depth`

   两者实际均全 `pending / inventory-only`。新表是准确分母，**未恢复原 domain/work_package/类型与处理来源字段，也未把已审方法状态跨批关联到当前路径**。2118 包含代码、测试、文档等 tracked 资产，不是 2118 个生产源文件；不能计为已完成，也不能将其全 pending 解读成过去审查归零。

2. 旧审查没有消失：初批 `ontology/ontology-coverage.csv` 仍为 2485 ID 中 33 reviewed、2452 pending；`ontology/semantic-map.csv` 仍有 33 条静态调用链/断言阅读映射。首批 README 细分为 28 consistent、1 局部 superseded、4 evidence-gap。这些是旧固定基线的真实工作，后续知识增量不能据此自动全部通过。四份实际 `review-progress.jsonl` 分别有 **7、12、4、12** 条方法范围记录，全部明确 `wholeFileReviewComplete:false`；后续 source-map 继续记录了更多方法。它们存在重叠、不同基线及不同阅读深度，不能相加成“已审 35 个唯一文件”或当前总体覆盖率。

3. 在本次亲读的总导航和分批账本中，**尚未找到当前基线下已去重、保留方法深度及知识来源的跨批覆盖状态总表**。NEXT 已明确要求“新基线清单，再合并已审记录”，现状仍是分批原件＋方法表＋叙述指针。原记录保持不可篡改是必要的；一直再生成全 pending 新清单则没有完成“汇总”的另一半。现阶段无法算可信的源码/语义总覆盖百分比。

## 顺序、剩余与漂移判断

原 HANDOFF §7 明确“无依赖包可并行；高风险发现立即形成小修复批次”，W2 本身还包含 DIRECT/PROCESS 和绑定升级。因此 W2/W3 交叉有原授权依据，不能要求机械等 W2 全完才碰 H003/H004；但交叉不等于 W2 退出，NEXT 对完整 W2 未完成的说明应保留。

真实偏移在于：近期交付组织以缺陷闭环为主，阶段尚未覆盖部分多停留在泛化“以后继续”，全量分母与各批方法/知识结果没有形成可直接续接的总账。没有证据表明已擅自转成新功能或大重构，也没有依据宣称原任务已被完整执行。W0 有初始分类/去重基础和持续新基线分母，但当前归属与覆盖合并仍缺；W1 有多个真实链片段，完整证据影响/主动通知、真实 A12 来源变更作废及依赖联调仍按用户决定 high/open/deferred；W2/W3 只有有限切片完成；W4/W5 未形成完整模块/接口关系及安全工程覆盖；W6 有七项具体方案及后续细化，整体仍 proposed/not-implemented；W7 总覆盖复核及综合交付尚未开始完成。

**H012 没有被原历史清单删除。** `history/history-dedup.md/.json` 仍保留 `AUD-H012 / discrepancy.workflow-transfer-overwrites-candidate-origin-snapshot`，当时仅静态初筛，并要求按 DEC-0031-04 分清候选来源快照与转办后可执行目标。W1 的方法表虽然出现 `transferTask`，其说明限定 DHR 防绕过及锁，不能据同名方法已读或同 suite 跑绿关闭 H012。近期 H003/H004/H009/H010 短名单不足以成为完整 W3 分母；当前 NEXT 已补回 H012，但本次没有找到其完整主审裁定或最终关闭证据。其余 H006/H007/H008 等历史观察亦保留原线索身份，由相应工作包核对，不在本辅助重新判缺陷。

## 恢复整体推进的具体下一步

本批继续只交付 H004；适用 QA 完成后，PR 前由主审复核本报告并如实说明上述差距。**下一审查批之前先校正覆盖总账，不再以新增一张全 pending 表代替校正：**

1. 给当前 2118 路径恢复 `asset_type/domain/work_package/in_scope/exclusion_reason` 及证据指针；新增文档、测试、配置也有归属，移除路径单独保留历史，不通过缩小分母制造完成。
2. 导入旧方法记录，以“原提交＋path＋blob/源码 SHA＋方法/范围＋深度＋原证据”关联当前路径。字节相同只能承接**同一列明方法范围**的旧结论，不自动变成当前整文件或运行 passed；blob 已变的保留旧记录并列出增量待核，未审方法仍 pending，无法可靠对齐的标 evidence-gap。不得覆盖原 CSV、原 failed 或旧基线。
3. 知识按稳定 ID、记录内容摘要、声明适用范围及映射证据做同样增量关联；保留四个 gap、用户暂缓及真实未决。给原 21 条历史主记录逐项连到“已合并 / 当前整改 / 待裁定 / 批准暂缓”，近期短名单不能代替它。
4. 用四条独立进度汇报：当前分类路径/全部路径；已审方法或链路/已定义待审单元及深度；知识已审与已映射的 consistent/conflict/unresolved/evidence-gap；唯一 finding 的已修/已验/已合并/受阻/批准暂缓。测试只记实际候选与去重 case，不折算审查百分比。
5. 总账显示真实遗漏后，再按风险决定 W2 剩余、H009/H010、H012及 W4–W7 的下一有限审查批；每批包含源码链结论和覆盖增量，允许“无新缺陷”，而不是只追某个 finding 直到出 PR。

所有结论仅是来源文件对照。未编辑任何仓库文件、提交、推送、合并、部署或运行测试/浏览器/Actions；只写本报告及本次亲读来源收据至 `/tmp`。主审仍需亲读关键来源并负责最终任务范围判断。
