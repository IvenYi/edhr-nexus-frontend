# W0 知识全量盘点与 W1 首条 DHR 静态语义映射

来源、目标、实际契约读取均为 `537bb2402227bfe6369c44c2b1b4686481c50f27`，目标 `edhr-dev`；tree `401d4bf799985d8a3079be0d44270aaa7f2813dc`。开始时本实例独立执行 `git ls-remote origin refs/heads/edhr-dev`，远端与 checkout/origin 相同。知识 `0.3.25 / schema 1.2.0`，未读取未提交契约改动。

本体审计适用且正在进行。本次只读盘点和源码核对，没有修改知识、代码、测试或迁移；`ontologyResult: not-applicable` **只表示本批没有知识定义变更**，不能解释为全量本体审计不用做或已经完成。本实例不承担代码修复和最终独立质量裁定。

## 实际分母与历史导入

- 当前 Git 跟踪知识文件 252：198 YAML（含一个 schema）、54 Markdown。所有文件逐文件登记于 `knowledge-files.jsonl`。
- 业务知识定义 2,485 ID，包括嵌套声明/验收场景/实现差异。完整记录在 `knowledge-inventory.jsonl`，简表 `ontology-coverage.csv`。
- 提取通过当前 schema 的 `collectionTypes` 和 `nestedCollectionTypes`，不扫描任意含 `id` 文本；引用、`fact` 条件、supersedes、evidenceIds、termId、targetId 不作为新定义。schema 中枚举 ID 是词汇注册表，schema 按文件登记。
- 原 `7bf87c00...` 的 2,292 ID / 239 文件保持历史，当前新增 193 ID、改变 206、保持内容 2,086、删除 0。`historicalAudit` 单独导入旧报告结论，不自动转成当前审查完成。
- 本批实际逐 ID 静态核对 33 项：28 consistent、1 局部 superseded、4 evidence-gap；另外 2,452 项保持 pending。54 份 Markdown 只是全部盘点，本批完整阅读知识 README 与 DHR 首期用户确认两份，其他 Markdown 未声称全文语义完成。源码实际映射 33 项不等于运行验证 33 项。

## 第一条实际链

1. `ProductionExecutionService.act:152-179` 校验命令、工单/对象状态、修订及操作者，先工单后对象加锁。只有无执行记录、动作 START、对象 CREATED 才调用 `ExecutionSnapshotBuilder.build:25-136`。
2. builder 从明确 process/route/DHR/form/flow 版本读取配置，冻结 context、工序、表单/画布及投影配置。`act:228-230` 在同一个外层事务调用 `DhrInstanceService.createAtFirstStart:54-95` 与 `ProductionService.startObject`。独立 DHR context/directory_snapshot 在首次 START 冻结，`createDirectorySnapshot:341-397` 按明确 DHR template version 读取目录和表单引用。
3. `0089` 的 `(tenant_id, production_object_id)` 唯一约束与事务内工单/对象锁防重；DHR CREATE、生产状态、production_execution 与末尾审计处于同事务。当前没有 DHR 手工创建路由。
4. 表单保存经 `FormInstanceRecordService.saved:39-94`，稳定 copyId/instanceNo，首次写冻结 form snapshot、持续更新已保存 values/status；保存后独立刷新过程追溯索引，只有 COMPLETED 才登记正式投影，不能混同六类记录。
5. `DhrInstanceController.detail:40-42` → `DhrInstanceService.detail:243-317`：从持久化 context/directory JSON 读定义；按真实 productionObjectId 和 PRODUCTION_EXECUTION 读取已保存实例。dhrItemId 决定基础目录归属、copyId 保留每份；无映射记录进入 unmapped/recordsByOrigin，不从完整证据丢弃。这个接口是当前证据视图，不是任意历史冻结汇总版本。
6. `DhrSummaryController.submit:63-66` → `DhrSummaryService.submit:232-349`：在生产对象锁和 DHR 锁内，重新取完整集合/附件，对比 scopeHash，核查目录和未完成补录及附件，要求三项人工确认与说明。candidate/base/overlay/checkResult/reviewBinding 等同版本冻结，并为每个 source_snapshot 写 hash。审计失败由事务回滚，不把草稿删除后留下部分冻结。
7. 历史入口 `DhrSummaryController.version:47-49` → `DhrSummaryService.version:81-138`：明确 dhrId + versionId 查询冻结 JSON；调用 header 而不调用 live detail，不混入当前表单值；`DhrFrozenEvidenceIntegrity.verify:26-90` 对候选/独立证据行及整个版本摘要进行核对。header 的当前生命周期/审批结果与版本正文分开，不据此宣称整个响应每个状态值都是提交时值。
8. 正常所有工序完成经 act:232-234 → `completeWithProductionObject:97-112`，缺 DHR 阻断且整体回滚；提前结束及终止 snapshot 是另外的事件，不与正常完成混同。

该链的具体 ID、规范来源、源符号行、写入、历史读取、已读测试断言、结论和未覆盖范围逐项在 `semantic-review.jsonl` / `semantic-map.csv`，不是“路径存在所以 consistent”。

## 六类记录的所有权及本批边界

| 层 | 实际责任与时点 | 本批核对限制 |
|---|---|---|
| 原始表单记录 | form_instance_record，首次保存稳定身份和所用表单定义，后续保存更新 values/status | 已读 saved 与 DHR读取；未审所有记录控制动作 |
| 流程工作数据 | production_execution.state_json，按动作推进、保存草稿和值/节点状态 | 已读 act，未将 state_json 当 audit_event |
| 正式业务投影 | COMPLETED 后 FormProjectionService.completed 登记，后续处理独立 | 本批只核对调用时点，worker、最终产出累计和幂等须 W2/W4逐项审 |
| 过程追溯索引 | FormTraceIndexService.refresh 在成功保存事务刷新最新内容 | 本批只核对保存调用点，正反向匹配及冻结历史检索待 W2 |
| DHR证据 | 首次 START 冻结定义，当前详情全量实际记录，submit 冻结完整版本；终止另冻结 | 当前/历史读取分开；导出/审批全矩阵及配置并发待继续 |
| 审计历史 | DHR/执行真实动作保存 AuditEvent，失败回滚 | 本批静态事务路径与测试断言；不是不可篡改或法规认证结论 |

## 新增有效规则对旧交接的影响

- 当前 `DEC-0077` 是投影 41 声明；旧来源里同名 DEC-0075 只属历史编号，不覆盖当前 DEC-0075 自定义表单归属及资料齐套。当前 0077-28/30/33 明确真实上下文归属、无上下文只登记不自动归属、保存后过程可查和最终完成正式投影，不能沿用“只查完成才可追溯”的旧叙述。
- 当前 `DEC-0078-01..07` 已实际读取：零或一最终工序、使用时冻结、多笔正式成功来源累计、批次只取最终工序/工单只汇总所属批次、缺失与真实零区分、最终单位匹配且原事实保留、旧实例不补算、无逐工序单位配置/自动带入。旧交接和投影集成时“最终产出 planned TODO”属于其时点，当前局部 implemented/internal 定义已有效。
- 本批未完成这七项最终产出代码逐 ID 核对，全部仍在 pending 分母，不能仅凭新文档和测试文件存在判 passed；W4 要沿 ProductionOutputService/正式来源/新快照 outputPolicyVersion 核对。
- `DEC-0062-08` 仅第一期延期范围已经由 0063/0068 局部承接；保留其历史，不错误删除整份决定。
- 当前 19 个 open questions 保留，数量下限、记录本、A12/失效历史等未决只阻塞依赖范围。本条 DHR静态创建/冻结/读取无需新增用户业务决定。

## 结论及下一步

本批未证实 DHR 创建—冻结—历史读取的代码偏差，没有为了清单变绿建议改业务。四个 evidence-gap 分别为整条 summary-freeze 规则尚未审完修订/导出/迁移；以及三个 DHR facts 的历史 availability/成熟度和完整消费契约待进一步复核。不能把“数据库列可查询”直接升级为知识运行事实适配已验收，也不能凭旧 capturedAt 字句错误重开旧PR。

尚待重点：首次 START 与管理员配置编辑并发的冻结时点一致性、终止与汇总/补录交互、完整审批/导出/修订、F004 实际链与工单关闭审计原子性。测试仅阅读了真实断言，本实例没运行 Maven、浏览器、真实 PostgreSQL；不能引用历史 green 充作本轮验证。
