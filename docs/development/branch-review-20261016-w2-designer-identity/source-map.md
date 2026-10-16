# 本批精确源码范围

固定来源8a9cd91f，修复后store增加61行。以下是方法/调用链阅读，不代表全文件、所有渲染模式或全W2完成。辅助报告保留基线行号和反证。

| 当前所有者 | 实际核对范围 | 本批处置 |
| --- | --- | --- |
| TemplateDesignerReactShell | handleImportFileChange、save/parse、当前页导入 | Excel/Word入口及既有保存归属，未改 |
| utils/templateImport、importExcel、importWord | 扩展名分派和CanvasPage导入协议 | 定向读取；不称全Office格式矩阵实测 |
| ModelTab | handleSaveField、updateSubTableFields、setCurrentFieldStatus | 主/子字段原ID及停用，未改政策 |
| store | updateField、syncBoundNodesForField、setFieldStatus | 主字段同步及子列快照线索；未改此链 |
| store | replaceCurrentPageFromImport | 只替换当前页canvas、保留model/projection和其他页，单次history |
| CanvasSheetWorkspace | handleMenuAction中的insert-before/after/column-before/after | 真实UI触发同一insertSheetColumns；markup未改 |
| store | shiftRange/shiftSubTableRegion/shiftCanvasNodesForInsertedColumns，insertSheetColumns | 唯一生产修复，同步坐标并复用reconcileSubTableRegionTemplates |
| store、utils/subTableRegion | pushDocumentHistory、undo/redo、rebuildSubTableRecordTemplate | 保留完整文档与派生偏移所有者；目标测试覆盖单次历史与字段ID |
| utils/document | serializeTemplateDesignerDocument、parseReactTemplateDesignerDocument | 原保存协议重读，未改 |
| projectionConfiguration、后端FormLookupCatalogService及FormProjectionInterpreter | 类型/停用校验、prepareDesign→validate与既有来源拒绝 | 只读反证；不清空绑定、不旁路保存校验 |
| MockFillDialog、FormDocumentPreview、FormRuntimeField | embedded优先与canonical子列的不同消费者 | 子列快照线索待下一批真实触发，不把单一路径当全局反证 |

大模块拆分继续沿既有R-006及W2首批具体方案：纯page坐标命令先于无React节点工厂；store保持一次完整文档history，document.ts保持协议。提取验收必须覆盖ID/projection、子表anchor/groupRange/派生offset、导入及50项历史；本批没有执行拆分。
