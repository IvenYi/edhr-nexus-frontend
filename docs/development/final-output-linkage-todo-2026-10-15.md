# TODO：最终产出工序配置与数量联动

状态：待开发；2026-10-15 调研登记。源码核对基线为 `form-traceability-projection` 的 `fcf4d0007f7a76fa3998f8fc0aba2fc937bc416e`，知识基线 `0.3.24`。后续开发前须在合并后的 `edhr-dev` 重新核对实现与知识版本。

集成导航：本调研所用投影 `DEC-0075` 在合入 `edhr-dev` 时重新编号为 `DEC-0077`，声明编号尾缀不变。目标分支的 `DEC-0075` 仍表示自定义表单归属与资料齐套；以下链接指向当前投影决策，历史调研口径与原提交不变。

## 任务顺序与边界

1. 本记录随投影分支提交并推送，然后合入 `edhr-dev`，解决冲突。
2. 重新读取目标分支的协作、本体、交接和验证契约，补齐投影相关知识资产与实现证据。
3. 确认下文真正未决的业务选择，按新契约补齐遗漏项。不能把本 TODO 中的建议直接升级为用户确认。

本次只登记和集成，不修改生产数量、现有模拟记录、使用时快照或数据库。A12 受控修订/作废仍是另一个范围，不应以必须先完成 A12 为由阻塞已确认的首次正式完成联动。

## 已确认规则（user-confirmed）

依据：[DEC-0077-11/13](../knowledge/decisions/DEC-0077-form-traceability-projection-ownership.yaml)及[确认记录的 2026-09-30 数量语义](../knowledge/evidence/form-traceability-projection-ownership-user-confirmed.md)。这是仓库保存的确认摘要，本次未获得当时的完整原始对话，不冒充逐字引文。

| 层级 | 数量来源与边界 |
| --- | --- |
| 工序 | 各自工序的正式报工更新各自工序产出；已有正式报工明细及查询合计不等于生产数量链已闭环。 |
| 批次 | 取显式指定的最终产出工序所提供的正式报工数量，不能把所有工序相加，也不能直接推断最后一个路线节点。 |
| 工单 | 汇总所属批次的产出，不能再次累计各道工序的报工。 |
| 指标 | 产出取决于配置来源的真实业务含义；不强制良品字段，也不默认良品、不良品、报废相加或相减。三类质量指标独立配置统计。 |
| 缺数与历史 | 未采集、未配置、无正式有效数据不等于真实零；正确历史按使用时快照解释，不因当前配置变化而改写。 |

2026-09-30 已收敛数量含义，不能继续用旧的“良品还是总量”问题阻塞开发。现有文档将最终产出规则标为 `planned/internal` 反映实现状态，不能当成用户批准延期的证据。此前[设计复核](form-projection-final-design-review-2026-10-07.md)及[设计澄清](form-projection-design-clarifications-2026-10-10.md)也已列出工序到批次、工单的联动要求。

## 当前实现与缺口（original-evidence）

以下定位均以本记录的源码基线为准；文件路径可定位，行号会随合并变化。

| 环节 | 已有实现 | 仍缺少的内容与原始定位 |
| --- | --- | --- |
| 制程工序配置 | 产品制程版本绑定路线节点、表单和文档。 | 没有最终产出工序标记或产出来源选择。后端 `ProductProcessVersionRequest.java:34-38`、`ProductProcessOperationBinding.java`；前端 `ProductProcessVersionEditorDialog.tsx:67-74,179-196`。 |
| 使用时快照 | `ExecutionSnapshotBuilder.java:74-100` 复制已选制程配置。 | 无最终产出配置的消费者和冻结内容。 |
| 报工来源 | `FormProjectionInterpreter.java:59,120` 支持良品、不良品、投入人时、开始/结束时间、生产日期、报工人等，要求良品/不良至少一项。 | 无独立产出数量角色。后续可以让同一个已有数字字段承担产出及良品角色，不能据此要求用户重复增加一个物理填报输入框。 |
| 正式投影 | `FormInstanceRecordService.java:92-94` 在最终完成时投影；`FormProjectionService.java:21-54` 持久化批次和正式明细，支持幂等。`FormProjectionController.java:149-158` 提供按生产对象/工序等合计。 | 没有独立工序正式产出聚合及批次、工单写回。报表查询结果有筛选/数量上限，不能拿来当完整生产汇总的权威写入来源。 |
| 过程参考 | `ExecutionOutputSummary.java:28-60` 读取旧 `typeConfig.businessPurpose` 和已保存值，三项齐全时将良品、不良品、报废相加；`ProductionExecutionService.java:266-270` 只读呈现。 | 不读取新投影绑定，不承担正式产出。该旧算法不能成为批次最终产出的默认算法。 |
| 批次与工单 | `ProductionObject.java:22-24` 的质量数量默认 0；`ProductionService.java:134-142,194-211` 推进完成及工单终态。 | 无独立批次最终产出及数据就绪语义；`WorkOrder.java` 与工单响应无正式产出数量。状态完成、DHR 形成不能证明数量联动成功。 |

后端 Java 路径均相对于 `gmp-platform/backend/src/main/java/com/zencas/edhr/`：配置在 `masterdata/{dto,entity}/`，快照、投影和过程参考在 `production/service/`，解释器在 `template/service/`，数量实体在 `production/entity/`，报表接口在 `production/controller/`。前端配置路径为 `gmp-platform/frontend/src/pages/master-data/components/ProductProcessVersionEditorDialog.tsx`。

迁移源码 `gmp-platform/backend/src/main/resources/db/changelog/0062-production-object-and-work-order-lifecycle.sql:29-31` 存在 `good + ng + scrap <= target` 约束。若同一不良后续又报废，例如目标 60、良品 58、不良 2、报废 2，直接回写就会触碰旧约束。这是源码风险推断，本次没有重查运行库约束；开发时必须复核实际数据库及独立指标语义，不能用自动扣减或强迫互斥来规避。

安速康模拟的[既有验收记录](ansukang-e2e-2026-10-14.md)是二手验证线索（secondary-reference）：两批次正式报工良品共 97、不良共 3，且 DHR 已形成，但不代表批次和工单产出已有正确写回。该模拟不可作为本 TODO 完成证明，旧模拟是否补算须先定策略。

## 冠骋借鉴（original-evidence）

本次重新读取本地原始前后端源码，未运行冠骋部署页面、接口或数据库。本地目录无 Git 元数据，部署版本未知；下列结论限于所列源码快照，旧调研文章只作定位线索。

根目录：前端 `/Users/ivenwang/Documents/iven space/paas-main-front/`，后端 `/Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/`。

| 内容 | 事实与限制 | 原始定位 |
| --- | --- | --- |
| 最终工序选择 | 工序配置有 `final_output_bool_` 复选框，文案“以当站工序作为最终产出”；tip 采用该工序报工良品数。显示受 `finalOutputEnabled`/`openFinalOutput` 开关控制，不能断言部署界面总会显示。 | 前端 `operation-trigger.vue:50-74`、`operation-config-render.vue:329-342,380-386,489-507,599-600`；`src/locales/lang/zh-CN/sys/edhr.ts:392-394`。 |
| 唯一性 | 前端提示已有最终工序并限制其他节点选择；后端原“批次恰好一个、其他零个”校验整段被注释，不能说服务端已严格保证唯一或必选。 | 后端 `processing/biz/ProductProcessingSubmitBs.java:72-87,168`。 |
| 标记存储 | 配置写入 `em_routing_operation_config`，按制程和路线节点查标记。 | 后端 `changelog-upgrade_300.xml:217-230`；`service/ProductNumDataService.java:114-122`。 |
| 数量联动 | 按批次和节点查报工并合计 `good_qty_`，覆盖写批次 `OUTPUT_QTY`，再合计工单下批次写 `finished_container_qty_`，不是每次回调向旧结果重复累加。 | 后端 `service/ProductNumDataService.java:128-159`。 |
| 生效时点 | `SAVE` 或 `SUBMIT` 分支可保存报工并更新产出；报工明细按表单实例删旧写新。不能描述为只在最终完成时触发。 | 后端 `bizProcess/listener/OnlineFormButtonEventListener.java:217-223,299-305,329-334`、`bizProcess/service/OnlineFormDataCatchService.java:375-385`。 |
| SN | 另有按已完成 SN 个数更新工单产量的方法，不宜把批次算法直接推广到所有生产形态。 | 后端 `service/ProductNumDataService.java:181-183`。 |

前端两个组件完整相对路径为 `src/projects/page-designer/src/_kit/kit-eDHR/web/operation-config/` 下的 `operation-trigger/operation-trigger.vue` 和 `operation-config-render.vue`。后端 Java 相对于 `src/main/java/com/gct/apaas/edhr/`；XML 为 `src/main/resources/com/gct/apaas/liquibase/suit/edhr/upgrade/changelog-upgrade_300.xml`。

可借鉴的是“制程内显式指定最终工序、按稳定身份汇总、逐层覆盖重算”的结构。不能照搬其固定良品口径、保存即统计时点或已注释校验来替代我方已确认规则。

### 原始文件 SHA-256

以下摘要用于下次核对源码是否变化，不代表部署版本认证。

| 文件（与上文根目录及相对路径对应） | SHA-256 |
| --- | --- |
| `operation-trigger.vue` | `74c00f7ea6e8336379659f33e8de74a6ffc9ad6013e61488a3d906420a067ad6` |
| `operation-config-render.vue` | `d5f72f3f5bd1e78b6135638795a2aa976bf10cef7581f4e0c340525465354c7e` |
| `edhr.ts` | `1f0641a038b87734d4972bb496a7a05ab0d5809c5e6b1ef900c55f39424f5790` |
| `ProductNumDataService.java` | `624b0c513dae3dc8542db599770630518bb2576222dca04339780393d83c2196` |
| `ProductProcessingSubmitBs.java` | `4dc3e0cec217789e1b636b8b2505e63c1dd5b4ccd626415df8c275eb4963b78e` |
| `OnlineFormButtonEventListener.java` | `9698c2c890c27ca70ad8e63c0cfd7d4fb26e6ca89048d029a0be5b541866e83c` |
| `OnlineFormDataCatchService.java` | `d457a6d1c731789618e21975db57eb40ed7100792f7f12c457111dc129177cee` |
| `changelog-upgrade_300.xml` | `9c70260551a07037db43c3f59584f822571a6a9ed05945b82d5a1060975d2349` |

## 开发前待确认（unresolved）

1. 最终产出工序是否必须配置、允许几个？建议同一具体制程版本至多一个，可不设但清楚显示未配置，不默认最后工序。建议尚未确认。
2. 正式报工最终生效后即更新累计数量，还是等最终工序完工再写批次？建议生效即更新累计、完工明确完成状态；仍待确认。
3. 缺来源、待处理、失败和部分批次尚无数据时，工单累计如何标识完整性；产出单位、空单位及不一致单位如何处理？不能默认“件”或隐式换算。
4. 已有模拟和历史实例是否补算、如何选择与核查？必须尊重正确的使用时快照，不把新配置直接套在旧实例上。

这些问题只影响后续实现，不阻塞本次记录任务、分支集成和既有知识对齐。它们不重新打开已经确认的数量层级和正式统计生效边界。

## 实施清单与验收

扩展路径建议（inference）：`configuration` 承载制程版本和来源角色；`product-core` 的生产领域拥有正式数量计算与持久化，投影提供稳定来源事实。是否还需要事务编排，在新契约下结合实际链路决定；不能把权威数量计算放到报表页面或筛选接口，也不为某客户增加散落分支。

- [ ] 在新知识契约下生成同一切片的 L2 决策包和影响分析，记录已确认/推断/未决、生产快照、迁移、权限、审计、相邻回归和证据缺口。
- [ ] 根据确认的基数和时点，在具体制程版本工序中配置最终产出节点，以稳定路线节点 ID 保存；服务端校验，使用时冻结，避免改动共享工序定义或历史实例。
- [ ] 明确工序产出数量来源角色及兼容的数字字段，允许复用已有填报字段；独立保持良品/不良品/报废统计，不引入默认加减公式。
- [ ] 从完整正式事实更新工序产出，指定最终节点更新批次，工单汇总所属批次；记录源表单、来源版本、实际行与处理状态，重试、重复回调、乱序和并发不得重复计数或覆盖较新结果。
- [ ] 明确未配置、无数据、实际零、待处理、失败和部分汇总的 API/列表展示；报告流水与生产状态、DHR 完成保持职责边界。
- [ ] 复核并处理旧数量约束、迁移和历史补算策略；迁移不虚构完成事实、既往签署或审批，不默默重写正确快照。
- [ ] 核验多工序相同批次不重复累加、同工序多份表单/多实际行、两批次工单汇总、实际零与未配置、单位不一致、失败恢复、幂等并发、配置换版与历史隔离；不要沿用有筛选或上限的报表结果作为汇总源。
- [ ] 按确认口径重跑安速康代表流程，对照表单→正式事实→工序→批次→工单→报表与 DHR 证据；97/3 等旧模拟数仅在该口径确实适用时作为预期。
- [ ] 更新本体、规则、执行契约、实现锚点和可复核证据；完成聚焦单元/集成、迁移与真实交互检查，并取得独立质量 `passed` 后再交用户验收。
