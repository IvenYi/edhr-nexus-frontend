# 首条 DHR 创建—冻结—历史读取链

主侧亲读以下方法及支撑定义；起点 `537bb240`，与新目标 `e9c00df8` 相应源码 blob 一致。不是以下大文件全部业务语义完成。逐 ID 来源、行号、断言与范围见 [ontology/semantic-map.csv](ontology/semantic-map.csv) 和 [ontology/semantic-review.jsonl](ontology/semantic-review.jsonl)。

| 阶段 | 实际源码锚点（backend/src/main/java/com/zencas/edhr/） | 写入/读取与边界 |
| --- | --- | --- |
| 动作入口 | production/controller/ProductionExecutionController.java；ProductionExecutionService.act:152–248 | production.execution 权限，校验 revision、操作者及对象状态，先锁工单后锁对象；首个 START 才建快照/实例 |
| 执行定义冻结 | production/service/ExecutionSnapshotBuilder.build:25–136 | 使用明确制程/路线/DHR/表单版本读取；冻结 context、节点/边、表单/工作流及投影、outputPolicyVersion 等执行配置 |
| DHR 首建 | DhrInstanceService.createAtFirstStart:54–95；createDirectorySnapshot:341–397 | 首次 START 同事务生成 dhr_instance 的 context/directory_snapshot，实例 IN_PROGRESS；0089 中 tenant/object 唯一性防重；不是手工新建 API |
| 生产与执行提交 | ProductionExecutionService.act:228–244 | DHR 创建、生产开工、execution.saveAndFlush 和动作审计处于同一外层事务，异常回滚 |
| 原始表单保存 | FormInstanceRecordService.saved:40–94 | 首次保存稳定 copyId/instanceNo 和所用定义，后续 values/status 可更新；成功保存刷新过程追溯索引，COMPLETED 才登记正式投影 |
| 当前详情 | production/controller/DhrInstanceController.detail；DhrInstanceService.detail:243–317 | 定义来自已存 context/directory，证据读取真实对象上已保存 form_instance_record；按目录/工作/补录分组，未映射项保留。此接口是当前工作视图 |
| 汇总版本冻结 | production/controller/DhrSummaryController.submit；DhrSummaryService.submit:232–349 | 锁对象/DHR，scopeHash 防陈旧集合提交，校验目录、补录完成、附件和三项人工确认；版本存 base/overlay/candidates/attachments/check/reviewBinding，独立 evidence 行存源快照/hash，审计同事务 |
| 历史版本读取 | DhrSummaryController.version；DhrSummaryService.version:81–138 | 以 tenant+dhrId+versionId 读取冻结 JSON；使用 header 而非 live detail，不把当前表单值塞回历史正文；header 生命周期/审批结果是另列当前元数据 |
| 完整性核对 | DhrFrozenEvidenceIntegrity.verify:26–90 | 校验候选 ID、原始 evidence 行数量与逐项 hash/JSON，再校验版本字段与 placement 的整体摘要；这不是“不可篡改认证” |
| 正常完成 | ProductionExecutionService.act:232–234；DhrInstanceService.completeWithProductionObject:97–112 | 所有工序结束时联动完成 DHR；缺实例阻断并回滚。提前结束/终止是另一事件，不能混用此链结论 |

## 六种记录不能混用

| 记录 | 所有权与时间语义 |
| --- | --- |
| 原始表单 | form_instance_record 的稳定身份、所用定义和最新已保存值；未完成也可成为过程记录 |
| 流程工作数据 | production_execution.state_json 的动作/草稿/节点状态，不是审计历史 |
| 正式业务投影 | 表单最终完成后独立登记/处理的业务事实，不能以过程索引代替 |
| 过程追溯索引 | 已保存内容的查询索引，与正式投影的触发时间和用途不同 |
| DHR 证据 | 首建冻结定义；当前详情收集实际记录；汇总提交形成版本冻结。三者不是同一时点 |
| 审计历史 | 实际动作的 AuditEvent 与业务提交同事务，不用请求参数冒充真实前后快照 |

本批未证实上述已读链的实现偏差。33 项知识核对中四项证据缺口保留，不计一致；DEC-0078 七项虽实际阅读了规则，完整累计代码还在 W4 pending。

已读但未完整验证：首次 START 与配置写入并发、全部表单控制动作、终止/汇总/补录交互、审批签署、修订作废、历史 availability/事实适配、ZIP 与离线打印、完整浏览器端到端。已有 DHR 相关测试本批运行通过的范围见 validation.md，不能据此将整条链标为 E2E 通过。
