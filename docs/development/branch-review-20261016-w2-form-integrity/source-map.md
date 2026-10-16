# W2首批：设计—保存—完成—来源读取

来源和目标均为9542cb4cc2071df2c00129cc5dbb4572a245cfa1，知识0.3.25。PR9合并树与批准交付98465347相同。本批只记录下面实际读到的方法和分支，不将清单或整文件标为已审完。

| 环节 | 原始实现及本批阅读范围 | 核对结论与验证边界 |
| --- | --- | --- |
| 设计文档协议 | `utils/document.ts`：normalizeModelField/normalizeModelState、createEmptyTemplateDesignerDocument、parsePersistedSlice、parseReactTemplateDesignerDocument、serializeTemplateDesignerDocument | model/canvas/workflow三片共用原schema；projection随model保留。没有新增协议或重建fieldId。本批新行为回归验证来源映射/布局往返。其余导入及归一化分支仍待审。 |
| 统一撤销 | `store/useTemplateDesignerStore.ts`：pushDocumentHistory、setProjectionBindings、updateSheetCellValue、undoCanvasChange/redoCanvasChange、markSaved/isDirty；行列/导入仅选定边界 | 完整document作为历史项；面板切换与文档修改分开。W2-F001修复成功确认使用的文档身份，未提取或重写整个store。79项前端行为/SSR回归不等于所有命令覆盖。 |
| 保存调用 | `TemplateDesignerReactShell.tsx`：初始化effect、persistCurrentDocument、handleSave、handleFieldConfirmPersist、handleClose；`TemplateModelingPage.tsx`：saveDesignerPayload及手动/自动mutation | 两种保存共用同一持久化入口，回调前画布仍能编辑。真实浏览器复现A请求不含B却无提示关闭；修复只把A交给markSaved。API、成功/失败通知及原关闭确认复用现有所有者。 |
| 执行写入 | `ProductionExecutionService.java`：动作switch、formRecords.saved调用及执行/审计持久化尾段；`ProductionExecutionEngine.java`：formActionInternal的资格、权限、值合并、签名失效、保存/推进分支与validateValues选定分支 | 来源/字段/签署安全校验保留；SAVE不会据此获得最终统计资格。此为源码映射和34项聚焦后端回归，不宣称管理HTTP、全部授权矩阵或真实PG事务验收。 |
| 已保存实例 | `FormInstanceRecordService.java`：saved、savedStage、detail/row | 保存最新values和阶段，表单来源来自使用时snapshot；同一调用刷新过程索引，只有COMPLETED才调用正式投影。没有改其生产代码。 |
| 过程追溯 | `FormTraceIndexService.java`：refresh、extract及add的已映射主/子表、类型与空值分支 | 同一保存调用内按明确映射刷新内容，保留真实rowKey/字段来源；未保存输入不入索引。不新增复杂OR、跨子表规则或A12历史视图。 |
| 正式完成投影 | `FormProjectionService.java`：completed、process、failed | 完成时业务预检并构造冻结form/model/values/context的outbox；处理读取持久source_json，不读取最新模板。源码@Transactional边界不是本批实际PG/HTTP事务证明。 |
| 来源回查 | `FormProjectionController.java`：query的SUCCEEDED筛选、冻结source/实际行定位及合计键，source/instanceSource；`pages/reports/projectionSourceHighlight.ts`：sourceHighlight | 正式记录与最近保存过程来源分开；正式来源取批次source_json，过程取保存实例。精确rowKey定位不凭旧index猜测。其他报表/权限/历史组合入口仍待后续。 |
| 预览消费 | `FormProjectionReportPage.tsx`：sourcePath/source查询、来源document还原及sourceChanged/highlight计算 | 使用读取到的来源fields/canvas/values；过程内容更新后不沿旧命中强行标记。只读定向方法，不算完整页面审完。 |

数量/空值继续遵守DEC-0077-31/32及DEC-0078-04/05：空批号、空单位与普通字段required分开，单位在完整粒度内隔离；无正式数据与真实0分开。BATCH小数下限、自由文本身份、表头共享、复杂组合、自动带入其余生命周期及A12保持现有未决/暂缓边界。本批未更改数量政策。

具体大型模块拆分方案沿历史辅助报告S04：先提取无状态坐标/范围和page命令，保留store为唯一事务/历史提交者；默认节点factory脱离React/store，避免registry值依赖循环；document.ts继续拥有唯一三片持久协议；生产实例/过程索引/正式outbox保留原事务所有权。每次提取需保护fieldId、rowKey、projection、一次用户操作一次undo、redo和历史上限，按W6小批实施，本批没有执行大重构。
