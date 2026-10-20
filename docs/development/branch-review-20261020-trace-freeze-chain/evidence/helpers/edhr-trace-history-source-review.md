# 保存及历史消费者只读源码核对

固定基线：`061d7f1ff71d11084667d08293fd7d5fe0d7680d`，知识 `0.3.25 / schema 1.2.0`。本报告是只读源码协助，不是正式独立 QA；未修改仓库、未运行应用/数据库/迁移/浏览器或任何测试套件，未查询 Actions。以下仅覆盖列明方法/代码块，不声明整文件或完整链路验收。

## 已证实的消费者缺陷

`FormTraceIndexService.extract`（46–79）与同基线 `FormProjectionInterpreter.validate` / `validateConfiguration` / `preview` 的主表身份不一致。解释器以 `String.isBlank()` 将省略、空串和 Java 空白识别为主表；索引提取在 52 和 63 行仅用 `isEmpty()`，空白字符串被当作子表 ID，在 53–54 行找不到子表后跳过整组。因此符合既有规则的主字段配置可以通过设计校验和新快照校验，预览也能解释，却在保存追溯索引或 DHR 历史反查时漏项。

最小合法源样例：主表 `lot:text`；追溯绑定 `id=g, modelId=formTrace, enabled=true, tableId="\u3000", sources={materialLotText:lot}`；`projection.version=form-projection-v1`；值 `{lot:L1}`。由源码可推出严格设计校验通过、解释器预览产生主表值，而当前 extract 返回空。将 tableId 改为 `""` 是正对照。此处未执行该样例，实际红绿由主实例负责。

此项按既有 DEC-0077-42 / `rule.form-projection.trace-field-single-binding` 的运行区域身份修复，不改变单绑政策，也不需要修改已冻结 JSON。修复应只在提取时把全 Java 空白当主表，输出规范空主表 tableId；非空白 ID（含首尾空格）保持原值，NBSP 等 `isBlank()==false` 字符不擅自归一化。

真实调用与影响：

- `ProductionExecutionService.act:215–228`：既有执行动作使用先前解析的 snapshot，保存后调用 `FormInstanceRecordService.saved`。
- `FormInstanceRecordService.saved:40–95`：从传入 snapshot 找到 form，首次写入 form 自身快照；再次保存仅更新 values/status 等，不重写 snapshot。第 91 行调用 `refresh`，后者第 31 行调用 extract，第 32–42 行替换该实例索引。因此该缺陷导致新保存后的追溯索引缺项，而非快照未保存。
- `FormTraceIndexService.query:139–207`：读取 form_trace_value，lookupItems 来自已保存实例 snapshot_json；缺项会影响表单反向查找，不读取最新模板补足。
- `DhrTraceReportService.matches:87–107`：92 行直接用记录自身 snapshot/fieldValues 调用 extract。`detail:72–79` 复用此方法；普通 `query:40–52` 还依赖 live 索引缩候选。
- `DhrInstanceService.detail:256–262`：EARLY_TERMINATED 的冻结 dhr 先校验 termination snapshot hash，再直接返回该冻结内容。因此合法终止快照也会在 DHR matches 的消费者中漏命中，无需实时索引参与即可触发。修复解释器消费者不等于改写冻结证据。

## 未发现新增严格校验误套历史的列明范围

| 入口 | 实际来源与边界 |
| --- | --- |
| `ProductionExecutionService.act:153–254` | 仅 execution 不存在、动作 START、对象 CREATED 时调用 snapshots.build；已有 execution 第 181 行直接 parse snapshot_json/state_json。ATTACH_FORM 第 204 行为新挂载配置调用 customForm，是新的配置冻结，不是历史重校验。 |
| `ProductionExecutionService.view:256–268` | 已执行对象直接 parse 执行快照；未执行对象可构建当前配置预览并将配置异常投影为 configurationError。 |
| `ProductionExecutionEngine.formActionInternal:212–344` | 从传入 snapshot 的 operation/forms 获取 form，执行已有权限、值及签署规则；没有 validateConfiguration 或读取最新模板。 |
| `ProductionExecutionEngine.withCanvasBindings:595–607` | 使用 form 中的冻结 canvas 和 fields 的副本，未读取当前模板。 |
| `FormInstanceRecordService.saved:40–95` / `row:148–158` | 首次保存持久化传入 form；已有记录不更新 snapshot_json；详情返回原 snapshot_json 与已保存值。 |
| `FormInstanceQueryService.find/row:131–156` | 详情/按号查找只从 form_instance_record 取 snapshot_json/values_json，不重建设计配置。 |
| `FormProjectionService.completed:19–40` | 完成时从传入冻结 form 过滤统计 binding；仅调用 preview（旧 validate），冻结 source_json。纯追溯完成不制造统计 outbox。 |
| `FormProjectionService.process:42–57` | 读取锁定批次的 source_json / rule_version；用该 model/values 调用 preview，不取最新模板。 |
| `FormProjectionController.retry:219–234` | 仅 FAILED→PENDING 及审计，未改 source_json；后续 process 仍读取持久化冻结来源。 |
| `FormProjectionController.source / instanceSource:174–196` | 分别读批次 source_json，或实例 snapshot_json/values_json；不重校验当前设计。 |
| `DhrInstanceService.detail:244–318` / `evidenceRow:451–466` | 非终止详情从实际成员实例读取自身 snapshot 和 values；终止快照走已校验 hash 的冻结内容。 |
| `DhrSummaryService.version:81–110` | 读取特定汇总版本 candidate_snapshot 等，校验 frozenIntegrity，再返回版本内容；不混入当前详情值。 |
| `DhrSummaryService.candidates:438–444` / submit 中 `295–335` | 将真实成员的 snapshot/values 冻结到 candidate_snapshot 和逐份 source_snapshot/hash；此处没有新的追溯设计校验。 |
| `DhrArchiveService.export:49–150` | 读取特定版本 candidates/attachments，完整性核对后用候选 record 渲染及导出 JSON；不拿当前表单模板或值替换历史。 |
| `DhrFrozenEvidenceIntegrity.verify:30–53` / `verifyVersionDigest:56–91` | 对冻结候选与逐份 source_snapshot/hash、版本摘要交叉核验；不调用设计校验。 |

上述是源码反证，不能替代运行验证，也不证明所有执行动作/整个 DHR 生命周期已完成审查。既有 A12/表单变更作废未实现和两项用户暂缓 high 未重开或关闭。

## 后续验证建议（本实例未执行）

1. `FormTraceIndexServiceTest` 补 Java 空白主表的真实 extract 正反例，包含省略/空串、空格、制表、U+001C、U+1680、U+2000、U+2028/U+2029、U+205F、U+3000；非空白且含首尾空格的真实子表 ID 与 NBSP 保持原值。已存多绑快照仍提取原来源，不引入严格设计校验。
2. 在保存事务/PG测试中覆盖合法空白主表绑定首次冻结和 SAVE 后的索引、反向查询、原快照不变，以及同项跨字段/子表正对照。
3. DHR `matches/detail` 用同一记录快照覆盖普通和合法终止快照：修复前可复现漏命中，修复后命中且 snapshot/hash 不改。
4. 保留既有聚焦回归：`FormProjectionInterpreterTest#newTraceConfigurationRejectsCrossBindingConflictsWithoutRewritingFrozenInterpretation`；`FormProjectionPostgresTest#editingTemplateAfterFirstUseDoesNotChangeThatExecutionSnapshot`、`#restartUsesPersistedSnapshotRatherThanLaterValues`、`#partialInsertFailureRollsBackAndRetryRecovers`；`ProductionExecutionIntegrationTest#executionPersistsSnapshotDraftAndAuditThenCompletesOnlyAfterAllOperations`、`#formInstanceNumbersAreStableSearchableAndUseFrozenSnapshots`。实际命令与测试环境由主侧核对后执行，不将历史 H2 模式称原生 PostgreSQL。

每个源码范围的固定 Git blob/SHA 和定位见并列 JSON。没有安装任何依赖或使用已有 target/classes 冒充本次构建。
