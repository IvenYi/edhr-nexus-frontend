# 原始源码与政策定向复核

- 实际读取 AGENTS、质量角色、统一交接及 codeplz 通用原则，核对 base→candidate 无治理、知识、架构、API、后端生产、迁移或设计规范差异。`DEC-0077-22` 的共用配置/保存/撤销和 `-12` 的使用时冻结支持恢复已有保存语义；`-07/-30/-31/-32/-33`、DEC-0034、0060、0078 及开放问题保留原范围。候选未更改知识，不新增资格、发布冻结或数量政策。只读 ontologyResult 的 not-applicable 与实际两处生产变更一致，不是全库知识验收。
- `TemplateDesignerReactShell.tsx:89–145`：初始化仍无参数确认初始文档；persistCurrentDocument 在 await 前取得并序列化同一文档，成功后将该文档交 markSaved。手动/字段自动保存复用此入口，catch 不确认失败保存，关闭继续调用 isDirty。API 主机 TemplateModelingPage 的两类 mutation 仍请求明确模板/版本、失败提示并保留内容。
- `useTemplateDesignerStore.ts:1888–1942,3056,3306–3331,3481–3499`：修改命令保留不可变历史项，markSaved 仅设置成功文档的 savedSnapshot，并拒绝模板或版本不同的延迟确认；无参数调用兼容初始确认。当前文档本身不被替换、undo/redo 不被清空。序列化依旧按 model/canvas/workflow 三片，projection 随 model；新行为及真实浏览器验证 A/B 边界。
- `ProductionExecutionEngine.formActionInternal` 定向检查合法来源/当前份、按钮与处理权、字段只读、结构/签名安全、SAVE 不做业务完整性阻断及最终完成校验。ProductionExecutionService 的动作 switch 后依旧在同一事务调用 formRecords.saved、保存执行和审计。34项后端回归覆盖列明邻接，不把注解等同真实PG事务运行证明。
- `FormInstanceRecordService.saved/savedStage/detail` 保留冻结 form 和最近保存 values，先刷新独立过程索引，仅 COMPLETED 调正式入口；`FormTraceIndexService.refresh/extract` 只采集显式合法来源与实际 rowKey；`FormProjectionService.completed/process` 冻结 form/model/values/context，后处理读取 source_json。
- `FormProjectionController.query/source/instanceSource` 与类级授权：正式查询筛 SUCCEEDED，正式来源读持久 source_json，过程来源读实例 snapshot_json + 最近 values；DHR 回查另加权限。`projectionSourceHighlight.sourceHighlight` 按显示快照稳定 rowKey 唯一定位，`FormProjectionReportPage` 的 sourcePath/sourceChanged/highlight 分开最近保存和正式来源。未扩展其余权限、查询矩阵、复杂OR、跨子表、A12或完整页面审查。
- UI仅恢复现有未保存确认的触发条件，无样式/新控件改动。亲看桌面确认框和390px确认框，文案与两操作清晰，继续编辑按Enter可达；窄屏现有大画布/头部裁切不是新问题，也不宣称移动适配完成。DESIGN第10节与列表规范的维护边界保持。

以上只说明实际选定方法和相邻分支，方法记录的源码SHA/符号另有独立机器核对；无整文件/全W2完成声明。
