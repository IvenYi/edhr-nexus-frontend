# 本批定向源码范围

基线400c2dd2；方法阅读及聚焦验证单独记载，不等于1820个文件全部已审。

| 原始入口/方法 | 实际核对的契约与结果 |
| --- | --- |
| ProductionExecutionService.act：动作switch至formRecords.saved及execute/JPA/audit持久化尾段 | SAVE/SUBMIT/APPROVE/RETURN/SIGN_FIELD进入记录保存，同一执行事务；本批只读此方法范围，不宣称所有动作/并发或完整HTTP事务已验。 |
| ProductionExecutionEngine.formAction及prepareTableRows/previousRow/requireRowId/validateValues | 保存前生成和校验规范UUID，已有行按ID匹配，旧无身份位置仅首次接管；最终完成校验沿既有规则。新增用例按合法动作产生状态，不手填COMPLETED。 |
| FormLookupCatalogService.prepareDesign及TemplateModelingController保存入口 | 新保存模型移除自选rowKeyFieldId，反证部分只在绕过入口或旧冻结配置中成立的线索；不改旧配置或补数据。 |
| FormInstanceRecordService.saved/savedStage/projectCreationMetadata/detail | 以实际object/operation/copy确定唯一保存份，冻结表单/版本，保存值和阶段更新；同事务刷新trace，最终完成才正式预检；读时创建元数据不回写。 |
| FormTraceIndexService.extract/add/refresh/query/appendSameRowConditions | 支持显式映射，主表同实例、子表同实际UUID行匹配，保存后替换最近内容；原生引用/数字/日期类型与租户条件沿既有契约。只记录实际读到的这些方法范围。 |
| FormProjectionService.completed/process/failed及Worker.processPending | 统计与trace分层，完成先业务预检，outbox冻结model/form/values/context；锁+唯一键保证处理幂等，中间插入失败整事务回滚，失败状态与重试保留来源。 |
| FormProjectionInterpreter.validate/preview/append/scalarValue | 主/子表字段范围、真实行身份、数量非负、空单位及冻结来源；自选键代码存在不等于正常新保存仍产生该配置。 |
| FormProjectionController.query/source/instanceSource/retry | 正式只读SUCCEEDED及完成冻结source；过程source读取实例冻结form和最近保存值；实际行定位不读最新模板或猜位置，retry要求FAILED与原因。本批并未完整验收所有过滤组合。 |
| projectionSourceHighlight及FormProjectionReportPage来源document/highlight/sourceChanged分支 | 真实ID唯一匹配才高亮；查询后再次保存抑制旧命中。仅源码和既有Node回归，不宣称本批实际浏览器通过。 |
| DhrManagementPage.DhrEvidenceViewer相邻消费者 | 同一详情的snapshot/fieldValues与traceHits交给共同高亮函数；本批仅映射，不将其计为完整DHR运行验收。 |

具体大模块拆分路径继续见[已有W2方案](../branch-review-20261016-w2-form-integrity/source-map.md)及[结构整改方案](../branch-review-20261015/structure/refactor-plan.md)。事务、历史、文档协议和字段身份所有者保持；当前记录服务169行、正式投影66行、索引225行，不为审查扩展新框架或重构模块。
