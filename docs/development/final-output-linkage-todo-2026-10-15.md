# TODO：最终产出工序配置与数量联动

当前状态：已在 `edhr-dev@4b236d7d` 工作树实现，完成主侧验证、本体 `updated` 和全新独立质量最终 `passed`，待用户验收。当前确认规则见 [DEC-0078](../knowledge/decisions/DEC-0078-final-output-linkage.yaml)，实现与实际验证见[交付记录](final-output-linkage-2026-10-15.md)。下文调研保留原基线，不能再用其中的历史缺口描述当前实现。

历史调研：2026-10-15 登记；原源码核对基线为 `form-traceability-projection` 的 `fcf4d0007f7a76fa3998f8fc0aba2fc937bc416e`，知识基线 `0.3.24`。开发前已在合并后的 `edhr-dev` 重新读取协作及本体契约，当前知识基线 `0.3.25`、schema `1.2.0`。

集成导航：本调研所用投影 `DEC-0075` 在合入 `edhr-dev` 时重新编号为 `DEC-0077`，声明编号尾缀不变。目标分支的 `DEC-0075` 仍表示自定义表单归属与资料齐套；以下链接指向当前投影决策，历史调研口径与原提交不变。

## 任务顺序与边界

1. 本记录随投影分支提交并推送，然后合入 `edhr-dev`，解决冲突。
2. 重新读取目标分支的协作、本体、交接和验证契约，补齐投影相关知识资产与实现证据。
3. 确认下文真正未决的业务选择，按新契约补齐遗漏项。不能把本 TODO 中的建议直接升级为用户确认。

上述顺序已完成至开发验证阶段。原调研登记本身没有修改生产数据；本轮开发在隔离库执行新增迁移和虚构场景，不改原安速康模拟与历史快照。A12 受控修订/作废仍是另一个范围，不以必须先完成 A12 为由阻塞已确认的首次正式完成联动。

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

## 调研时的实现与缺口（original-evidence，历史基线）

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

## 开发前问题的确认结果（user-confirmed）

1. 同一具体制程版本至多一个最终产出工序，可不设；不默认最后工序、不因未配置而新增生产阻断。
2. 表单正式完成且投影成功后即计入累计。同工序多次报工分别累计，工序完工不再二次加数。
3. 显示已知累计及部分汇总状态，实际零与无数据分开；最终工序只将单位等于冻结产品单位的记录计入批次，空或异单位保留来源并提示核对，不换算。普通工序按用户填写的单位分组，只影响本工序；不增加工序单位配置或自动带入。
4. 用户确认不补旧实例和旧模拟；新开工冻结新配置，不套用当前配置追算历史。

当前范围无业务未决问题。完整原话和确认、推断边界见同一[决策包](final-output-linkage-decision-package.yaml)。

## 实施清单与验收

采用扩展路径（inference）：`configuration` 承载制程版本和来源角色；`product-core` 的生产领域从完整已持久化正式事实读时计算权威数量，不维护额外累计缓存。投影提供稳定来源事实；报表筛选接口不作为汇总来源，不增加客户条件分支。

- [x] 在新知识契约下生成同一切片的 L2 决策包和影响分析，记录已确认/推断/未决、生产快照、迁移、权限、审计、相邻回归和证据缺口。
- [x] 在具体制程版本工序中配置最终产出节点，以稳定路线节点 ID 保存；服务端和数据库校验，使用时冻结，两个现存编辑入口及复制保留标记。
- [x] 增加独立产出数量来源角色，允许复用同笔已有数字字段；良品/不良品/报废不引入默认加减公式。
- [x] 从完整正式事实计算工序产出、批次最终产出与工单累计；记录源表单、实际行与处理状态，重试和并发不重复计数。
- [x] API、列表和详情区分未配置、无数据、实际零、待处理、失败、单位核对及部分汇总；不改变生产和DHR状态。
- [x] 新增0114默认false和部分唯一索引，实际隔离PostgreSQL迁移通过；独立产出不复用旧质量数量约束，不补历史、不重写旧快照。
- [x] 聚焦数据库和真实API核验多次报工、实际行、两批次汇总、真实零、单位隔离、重试并发与换版冻结；前端40项及构建通过。
- [x] 安速康原表后续复跑：已在3000/8081重新导入三份原件，新建 `ASK-FINAL-20261015-R2` 模拟；A两次报工30+28=58件、B39件、工单97件，七份表单及两份DHR V1定稿完成，三类流水与正反追溯及来源高亮独立验证通过。旧业务320行及原件未改；保留日期自动化失败的第一轮，未回写完成表单。当时披露的质量三列缺口已由后续确认的[质量联动切片](batch-quality-linkage-2026-10-15.md)补齐，原模拟记录继续只读，报废因原单位空仍待核对；用户最终确认待完成。见[原表复跑记录](ansukang-final-output-e2e-2026-10-15.md)。
- [x] 本体资产同步 `updated`、知识89项通过；全新独立质量最终 `passed`，10项必需检查通过，无阻断条件，见[最终质量报告](final-output-linkage-quality-final.yaml)。
