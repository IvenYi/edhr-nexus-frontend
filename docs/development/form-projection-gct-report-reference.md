# 冠骋报表模型原始源码核对

核对日期：2026-09-29。证据分类：`original-evidence`。本次直接读取本机冠骋源码，不以既有调研摘要替代源码。源码根目录为 `/Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr`；该外部仓库不随本分支分发。

| 模型与原始文件 | 已看到的维度 | 度量／来源 |
| --- | --- | --- |
| `producing/entity/FormReportInfoEntity.java` | 工单、产品及版本、批次／SN、工艺节点与工序、主体、处理日期、生产日期、报工人、原因与分类 | 良品、不良、报废数量、起止时间、工时；表单实例与模板 |
| `producing/entity/FormScrapRegistrationEntity.java` | 工单、产品与工艺路线版本、生产批次／SN、工序、报废批次、原因与分类 | 报废数量；事务、流程与表单实例、流水码 |
| `bom/entity/MaterialConsumeEntity.java` | 工单、产品版本、工序与工艺节点、生产标识、物料、单位、BOM 行、仓库、库位、上料类型 | 消耗量、需求量；表单与上料记录引用 |
| `workbench/biz/BizReportDataSearchBs.java` | 工作台入口限定当天 `handleDate` 和当前 `modifyUserId`；公用方法接收调用者条件 | 查询全部命中报工记录后直接累加良品、不良、报废和工时 |

## 对当前设计的判断

- 可借鉴：将数量事实与来源表单分开保存，保留明确的工单、工序、产品版本及来源标识。我们的生产对象、工序和 DHR 归属来自执行上下文，不能让客户填写的同名文本覆盖它们。
- 不直接复制汇总：公用汇总方法本身未按工序或单位分组。是否每个调用入口均已限定这些维度尚未证明，不能断言冠骋一定重计；我们的正式报表遵守用户确认的按工序／用途合计，并隔离单位。
- 报废取值：冠骋实体有 `scrapQty`，这不证明它必然表示申请、批准或实际处理量。我们的口径来自用户选择的报废数量字段，不替客户猜阶段。
- 物料消耗与库存动作分离：冠骋的消耗处理会调用仓储库存处理。我们的确定性投影只生成查询事实，不因查表配置触发库存副作用。
- 当前工作台的“当天／修改人”与正式业务发生日期、报工人并不天然等价。我们尚未增加工时、人员绩效、日报口径；补充这些报表前需要明确业务日期和人员来源，不能用系统更新时间替代。
- 单位、仓库、BOM 行等必须依赖对应主数据及实际动作。当前单位是选定字段的明确文本，并按值隔离，不提供单位换算；BOM、仓库库位和库存结余报表尚未实现。

## 完成事件的原始证据边界

`bizProcess/listener/OnlineFormProcInstEventListener.java` 的结束处理调用物料消耗保存；`bizProcess/service/OnlineFormDataCatchService.java` 的 `saveFormMaterialConsume` 保存后调用仓储库存处理。相关方法中没有看到本方案使用的持久化待处理事件及独立消费者。外部平台 SDK 的事件派发和完整事务实现未提供，因此不能据此保证其所有异常均同步回滚。

本项目采用用户确认的 Q5：完成前业务校验、完成与事件同事务保存、独立处理失败保留完成状态并允许审计重试。以上外部源码仅用于比较，不构成本项目用户决定的替代来源。

## 最终产出补充核对

`service/ProductNumDataService.java` 的汇总与 `updateOutPutQty` 方法通过 `ifFinalOutPut` 读取制程／工艺节点上的 `FINAL_OUTPUT_BOOL`，用该节点报工的良品和更新批次 `OUTPUT_QTY`，再遍历工单下批次累加并更新 `finished_container_qty_`。因此前述通用工作台累加方法不能用来解释冠骋的批次最终产出。

用户随后确认（`user-confirmed`）：工序报工同步修改工序产出；批次产出取配置的最终产出工序；工单产出为各批次之和。我们保留这个层级；当前仓库 `rule.operation.final-output` 仍为规划态，本分支的工序投影报表不冒充批次／工单最终产出。冠骋“取良品”的实现事实不自动替代本项目数量口径确认。
