# 合法主表区域的追溯消费核对

## 基线与规范来源

本轮按 `edhr-dev@061d7f1ff71d11084667d08293fd7d5fe0d7680d` 及同一提交的项目、角色、交接契约核对；知识保持 `0.3.25 / schema 1.2.0`。PR18 已人工合并，该合并树与交付 `c118f97569de528edeae3f765f24c4204d8bbb1c` 相同。本页属于保存—首次冻结—历史读取链中的有限实现证据，不代表全分支或全部知识审计完成。

- `user-confirmed`：沿用 `DEC-0077-42` 的单字段最多一个追溯项、同项跨字段复用、新配置严格校验及已形成证据保留边界；沿用 `DEC-0077-33` 的保存后过程内容可查及 `DEC-0077-38` 的来源和冻结解释边界。本轮没有新增业务政策或声明替代。
- `original-evidence`：当前单绑规则和计数事实明确按既有解释器的 Java `String.isBlank` 识别主表。省略、空串及 Java 认定的全空白 `tableId` 是同一主表区域；非空白标识保留原值，不修剪、猜测或合并不同子表。这是已定身份规则的实现一致性核对，不是本轮创造新的字段身份。
- `inference`：索引沿既有 `table_id='' / row_key='form' / row_index=-1` 表达主表定位；总览和独立模拟值使用现有 `projectionTableId` 比较区域。保持绑定中的原 `tableId`，是避免修改配置与冻结证据的最小落实方式，不声称用户逐字指定了方法或存储列。

## 亲读源码与已证实的基线差异

本体实例直接读取以下方法，不以辅助源码地图或旧测试通过替代本轮原始证据：

| 路径和范围 | 实际依据 |
| --- | --- |
| `FormLookupCatalogService.prepareDesign`、`FormProjectionInterpreter.validateConfiguration` | 设计保存校验新的字段追溯基数；后者把 Java 空白区域归为主表，仍不修改原绑定标识。 |
| `ExecutionSnapshotBuilder.form` | 新使用时从指定模板版本复制投影配置并调用严格配置检查。不能由此推出已有实例读取时重新套用设计约束。 |
| `FormProjectionInterpreter.preview`、`FormProjectionService.completed/process` | 解释器以 `isBlank` 从根对象读主表值；已有正式批次沿自身 `source_json.model/values` 解释，不回读最新模板。 |
| `FormInstanceRecordService.saved`、`FormTraceIndexService.refresh/extract` | 保存事务调用共享提取器刷新最新显式追溯值。基线 `extract` 用 `isEmpty`，合法空白区域被当作子表，找不到该表后跳过，导致已保存主表值漏索引。 |
| `DhrInstanceService.detail`、`DhrTraceReportService.matches/detail/query` | 提前结束详情先核验终止快照摘要，再读取冻结 DHR；`matches` 直接对成员的冻结 `snapshot/fieldValues` 调用同一提取器，因而也受基线差异影响。这是正确快照的消费者识别错误，不是快照未保存。 |
| `TemplateDesignerReactShell` 的“用途总览”入口、`ProjectionDialog` 的区域分组、`projectionPreview` 的字段集合和样本值构造 | 基线总览按原字符串把合法主表别名显示成失效子表，独立模拟值也被放到该字符串对应的嵌套区域；后端主表预览读根对象，形成两侧消费不一致。这里的“模拟预览”是用途总览页签，不是另一个“模拟填报”入口。 |

## 修复边界与数据保护

修复应只统一以上遗漏消费者的区域解释：后端提取器采用 Java 空白判断，前端总览和模拟样本沿已有共享 `projectionTableId`；非空白子表标识及实际行身份保持，重复放置不制造新的字段身份。不得把新单绑设计校验放进旧多绑冻结证据的读取路径，不修改 `snapshot_json`、`source_json`、终止快照 hash、字段值、签署、审计或真实归属。

本体在主侧修复工作树中直接补查到：`extract` 两处改为 `isBlank`；`ProjectionDialog` 的定位、区域去重、分组和结果区域标题复用 `projectionTableId`；`projectionPreview` 的样本键及字段区域集合也复用同一函数。代码未给原绑定的 `tableId` 赋新值，已有设计/冻结校验及正式投影解释入口不修改。具体提交与源码摘要随本轮审查记录固定，此处不是业务运行或独立质量通过证明。

本轮不执行 0116/0117 或新增清理迁移，不恢复历史数据，也不自动回填此前已漏建的实时索引。修复后新保存或既有合法保存命令仍按原事务刷新索引；此前未重新保存的漏索引记录，不能仅凭消费者代码修复就宣称已被补齐。直接从经核验终止快照提取的历史反查与依赖实时索引的普通候选筛选，分别记录验证范围。

两项用户暂缓的 DHR high、四个旧知识 `evidence-gap`、A12 来源变更/作废及未定历史查询视图继续保留；本次不据局部修复宣称完整 DHR 生命周期完成。原 `DEC-0077-42` 的配置删除授权、旧确认原话、0116/0117 实际执行记录与旧失败报告不改写。

## 验证与成熟度

本体只负责本页列明方法和知识定义的直接核对，以及正式知识校验。主侧红绿、隔离 PostgreSQL、浏览器和最终独立验收须分别使用[本轮决策包](../../development/branch-review-20261020-trace-freeze-chain/decision-package.yaml)对应的实际输出和受测提交；本页不预先宣称这些检查已通过。

本体实际执行 `bash /workspace/.edhr-cloud-tools/mvn-edhr -C --file tools/knowledge-model/pom.xml test`，正式知识检查 89 项通过，failure/error/skipped 均为 0；日志保留于本次工作区，安全汇总供本轮交付归档。本体范围 `git diff --check` 通过。这些检查覆盖结构、ID、引用和知识投影约束，不替代业务保存/冻结、PostgreSQL或浏览器验收。

既有规则、计数事实和关系继续 `specified/internal`，原已实现锚点保持原成熟度；不标 `verified/runtime`，不提升 P0，不新增本体试点。有限语义审查只承接逐 ID 的实际核对范围、记录摘要和源码证据，不把维护同步或结构校验当全库语义通过。
