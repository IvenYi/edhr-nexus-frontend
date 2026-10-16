# 批次质量累计与工序面板确认

知识基线 `0.3.25 / schema 1.2.0`；本轮实际读取来源、目标及契约为 `edhr-dev@6379bf105127b05a65695992b008b55c142264f9`，角色、项目和交接契约均从该提交的工作文件读取，无未提交契约差异。本记录只覆盖批次质量三项及当前工序面板，不构成全库审计、知识运行发布或质量最终验收。

## user-confirmed

2026-10-15 用户在核对批次旧三列默认零后明确确认：

> 可以，良品和NG按最终工序累计，产品报废按全流程本批产品统计，其他物料不要混进来。没采集的不要显示0，单位缺失就提示待核对，我觉得有待核对的时候可以hover上去查看所有记录下来的数据详情。按这个方案补齐，同步本体知识，旧数据不动，并在3000上做好验证。

同一消息要求核对生产执行面板的工序数量。后续注释问“那是不是这里是要按当前工序报工 报废等用途业务字段来累加了？”。该问句是对范围的澄清，不单独提升为新增公式或时间政策。当前工序按自己显式用途来源累计，来自既有 `DEC-0077-06/08/13`；不得把批次最终工序范围反套为全部工序都取最终工序。

同切片主智能体后续交接补充用户再次确认：良品和NG按各自用途累计，报废数值 hover 显示原材料、半成品及包材；工序按物料和单位分别显示，批次主值仍只含本批产品。本体角色按主智能体传递的正常业务确认同步，不要求用户填写知识文件；未收到逐字原话的部分按此转述留证，不伪造引文。

此前被用户接受的具体说明：同最终工序多次报工分别累计；NG 为累计报告不良数量，不自动等于待处置库存；质量三项不自动加减最终产出；报废登记不自动代表实际销毁。缺数与真实零、正式完成和成功投影时点、产品单位核对及旧冻结保护分别沿用 `DEC-0077-05/07/13` 与 `DEC-0078-02/04/05/06`。不通过本轮决定缺陷次数、跨表单同一业务事件、返工冲销、库存扣减或 A12 修订作废。

## original-evidence

本体角色本轮读取当前原始源码及资产，而不是以先前调研报告替代：

- 启动时 `ProductionOutputService.object/order/read/summarize/operation` 已由真实生产对象读取完整成功正式产出来源；原有 `read` 只选 `model_id='production'`，尚不计算质量三项。旧未配置实例不按当前制程回算。补齐后的源码核对见下方收尾说明，不将启动时缺口继续当成未实施。
- `docs/knowledge/rules/production-execution.yaml` 原 `rule.operation-output-field-purpose.result.outputComponents` 列出三项，容易被误读为产出公式；`DEC-0045-07` 保留了旧“产出包括”原话。当前产出公式解释已由 `DEC-0077-13`、`DEC-0078-03` 排除，今次明确质量累计范围并纠正当前定义，不抹除历史原文。
- 原 `term.production-batch` 与 `term.production-object` 只称对象保存质量三项，没有区分数据库兼容列与当前派生显示，需同步修正。旧实体列或 CHECK 存在不决定新的业务口径。
- `FormReferenceLookup.source("material")` 只要求物料有效，没有产品类别限制；`source("product")` 才限定产成品/半成品。`FormProjectionInterpreter` 的 scrap 用途要求物料引用和数量，不限制为产品。因此原料、半成品、包材可按真实物料配置报废；批次产品报废的筛选不能被误解释为报废表单只支持产品。现有引用保存 id/name/code/sourceType，不包含已冻结物料类别。

## inference：工程选择与边界

- 生产领域从完整持久化正式来源读时计算 `quality`，复用既有归属及冻结依据，不向旧实体三列回写，不触发旧“三项和小于目标”约束，也不为了这次展示修改旧约束。旧兼容列存在不再被作为实际零的证据。
- 批次良品/NG 取冻结最终节点，产品报废从真实本批全部工序取明确产品身份；空或异单位不猜补、不转换，保留原数量和来源，待核对且不并入权威同单位累计。普通工序报废按物料和原单位分组，不能跨物料相加为一个产品报废量。共享批次表单的显示工序不等于真实工序归属。
- 正式累计与已保存过程参考分别显示；过程参考读取冻结统计来源及已保存值，不纳入正式统计。来源浮层支持 hover、focus 和点击，长列表可滚动，展示计入及排除记录、原数量/单位/物料、表单与实际行位置及原因。该具体交互是实现选择，不冒称用户逐项指定。
- 已保存过程参考优先采用显式 projection 统计绑定；无统计绑定时保留旧 businessPurpose 兼容读取，但正式累计不读旧标记。工序报废明细显示各物料和原单位，批次浮层也保留其他物料来源并注明排除。若为便于理解只读关联当前主数据类别，须标为“物料类别（当前）”，不是原始填报或签署时冻结类别，不据当前类别改变真实产品身份及历史原值。
- 本轮没有最终策略或相关冻结依据的旧实例不按当前模板/制程补配来源；具有既有冻结依据的已完成模拟记录可被只读派生查询，不改变该记录、签署、投影或 DHR。此处只补展示链，不授权历史源数据修复。

## 验证状态

初次同步为 `specified/internal`。同切片收尾，本体角色重新读取 `6379bf1` 工作树原始实现及主侧聚焦测试报告后，将新增质量定义、关系、规则及事实推进为 `implemented/internal`；本轮未标 `verified` 或注册运行知识执行契约。没有独立质量最终结果前，不宣称3000运行验收通过；不因局部实现同步提升整个 P0 阶段。

### 实现收尾核对

- `ProductionOutputService.read` 读取完整 production/scrap 正式来源；`summarize` 通过 `ProductionQualitySummary.metric` 生成批次 `quality` 及各工序 `operations[].quality`。批次良品和NG沿冻结最终节点；报废跨工序且以冻结 `context.productId` 对真实引用身份，其他物料来源保留并标排除。无新冻结策略实例仍返回 LEGACY，不读当前模板追算。
- `ProductionQualitySummary.metric` 保留来源 attributes、details、原单位及 form/record/binding/table/row/field 身份；分别处理成功、待处理、失败、缺数及单位核对。正式质量不读取旧 entity 三列；两对象控制器通过 `qualityQuantity` 返回可空scalar。当前物料类别只由读时主数据连接辅助显示，UI明确标当前类别，不伪称签署时快照。
- `ExecutionQualitySummary.project` 从冻结工序表单及每份已保存值生成 `processQuality`，优先显式统计来源；无新统计绑定时 legacy 标记只作过程兼容。`ExecutionOutputSummary` 原 API 保留质量参考但 `outputQuantity` 恒为空，撤销三项合成产出的旧行为。`ProductionExecutionPage` 将正式三项与折叠的已保存过程参考分开；批次与工单对象列表及详情采用同一数量组件。
- `ProductionOutput.tsx` 实现 hover/focus/click 来源浮层、可滚动来源和多物料/单位分组、原字段值及计入原因。此为源码核对，未冒称本体角色实际执行鼠标、触屏或3000视觉验证；来源身份已返回不自动等于用户已验证能在UI清晰定位实际行。主侧本轮浏览器及独立质量须单独确认。

### 已复核的主侧执行证据

本体角色读取测试源码、`target/surefire-reports` 的当前报告和主侧日志，不冒称亲自运行以下业务测试：

| 测试类 | 总数 | 实跑通过 | 条件跳过 |
|---|---:|---:|---:|
| ProductionOutputPostgresTest | 11 | 11 | 0 |
| ProductionQualitySummaryTest | 4 | 4 | 0 |
| ExecutionOutputSummaryTest | 5 | 5 | 0 |
| ExecutionFormCopiesTest | 10 | 10 | 0 |
| FormProjectionPostgresTest | 13 | 13 | 0 |
| ProductionExecutionIntegrationTest | 68 | 66 | 2 |

合计111项，109执行通过，0失败/错误，2项按已有浏览器夹具property条件跳过。新增质量用例直接覆盖最终/前道隔离、30+28=58、独立NG、跨工序产品报废、其他物料保留排除、空/异单位、缺失/实际0、待处理原值及重试幂等；保存参考用例验证新绑定、非产品单位以及缺单位待核对。原始主侧日志为 `/tmp/batch-quality-backend-tests.log`；测试报告位于 `gmp-platform/backend/target/surefire-reports/`，不把临时日志当发布资产。

主侧前端构建日志 `/tmp/batch-quality-frontend-build.log` 显示成功；后端 package 日志 `/tmp/batch-quality-backend-build.log` 包含打印前端生成记录，命令成功由主侧执行回执确认。本体只复核实际日志与源码，不把 build 成功当3000交互或旧数据保护通过。独立正式知识校验由本体角色实际运行，89项通过；收尾新增锚点后另行复跑，结果记本轮 ontologyResult。
