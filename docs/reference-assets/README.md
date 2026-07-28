# 参考资料归档索引

本目录用于保存 eDHR 产品讨论、竞品调研、业务流程、截图和原型相关的长期参考资料。

## 归档规则

- 重要截图、微信临时文件、系统临时目录文件必须复制到本目录或其子目录后再引用。
- 不直接长期引用 `/var/folders`、微信 `RWTemp`、浏览器下载临时目录等易清理路径。
- 文件命名建议包含日期、来源和主题，例如 `2026-07-07-gct-transaction-bus-reference.png`。
- 文档中引用图片时优先使用项目内路径，例如 `docs/reference-assets/...`。

## 已知核心资料

- `/Users/ivenwang/Documents/edhr-nexus/edhr-develop-need-read.md`
- `/Users/ivenwang/Documents/iven space/edhr探索之旅.docx`
- `/Users/ivenwang/Pictures/edhr生产业务.png`
- `/Users/ivenwang/Documents/iven space/paas-main-front`
- `/Users/ivenwang/Documents/iven space/gct-edhr-bed`

## 冠骋代码参考边界

- `/Users/ivenwang/Documents/iven space/paas-main-front`：冠骋 eDHR 前端工程，可用于观察菜单、页面、字段、交互、事务配置、表单配置和 DHR 相关业务表达。
- `/Users/ivenwang/Documents/iven space/gct-edhr-bed`：冠骋 eDHR 后端套件代码，可作为业务证据求证表单、事务、追溯、DHR 汇总、流程和投影等设计思路。
- 上述代码中的低代码平台、通用框架、平台基础能力、代码生成器等部分不作为产品设计重点参考。
- 参考代码时优先提炼业务模型、状态流转、关键实体关系和接口语义，不直接照搬实现。

## 2026-07-07 后端代码校准结论

基于 `/Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr` 的业务代码复核，后续文档中的投影、追溯、DHR 汇总和事务处理应采用以下统一结论：

- 投影不是单一动作，应拆成表单实例数据保存、追溯索引、业务统计投影、事务主线事件、事务关系图等产物。
- 冠骋事务总线至少包含事务实例、事务主线和事务引用关系；其中事务引用关系通过 `txn_start_id_`、`txn_end_id_`、`txn_subject_id_`、`txn_tracking_id_` 表达有效期关系。
- DHR 汇总不是纯拖拽目录，而是 DHR 模板目录或汇总大纲、被选表单实例关系、汇总版本、完整性检查和汇总审核共同组成。
- 表单作废和变更不能只改实例状态；产品化设计应支持投影重算、冲销或失效标记，并保留原始表单数据、审核记录和追溯解释。
- 客户侧表单设计器不直接暴露“基础字段、逻辑字段、追溯字段、业务字段”复杂分类，内部仍需要字段语义字典和投影处理器。

## 2026-07-13 字段模型校准结论

- 冠骋的字段枚举仅作为反例：设备、产品、LOT/SN、良品数、仓储单号等业务概念不能继续被设计为基础字段类型。
- P0 基础字段固定为文本、数字、日期、时间、日期时间、枚举、布尔、关联对象、签名、附件；明细表格是数据容器。
- “人员、部门、设备、物料、批次/SN、工单、产品、工序”等通过关联对象的目标类型、数据来源和业务语义配置，不拆成字段类型。
- 枚举字段通过值规则选择单选或多选；布尔字段通过是/否或确认勾选展示；日期、时间、日期时间必须分别建模。
- 系统信息、审批意见/结论/退回原因和公式计算分别属于布局组件/流程任务记录/既有字段的取值方式，不占用新的字段类型。
- 草稿模板可调整字段；已发布或已有实例的模板必须新建版本。涉及值结构、语义、关联对象或投影规则时，需要显式确认影响。

重点代码证据路径：

- `transaction/entity/TxnMainlineEntity.java`
- `transaction/method/TxnRefApi.java`
- `bizProcess/service/OnlineFormDataCatchService.java`
- `bizProcess/listener/OnlineFormButtonEventListener.java`
- `bizProcess/listener/OnlineFormProcInstEventListener.java`
- `notebook/FormTraceManager.java`
- `edhr/biz/SummaryReportSaveBs.java`
- `edhr/biz/SummaryReportFinishBs.java`
- `edhr/biz/EdhrReverseTraceBs.java`
- `approve/handler/business/OnlineFormChangeProcessHandler.java`

## 已归档资料

- `screenshots/2026-07-07-project-docs-to-update.png`：用户标注需同步修正的三份项目文档，包括“表单导入与结构化建模设计结论”“模板建模设计规格”“表单模板导入高保真与 OnlyOffice 设计规格”。
- `diagrams/2026-07-08-edhr-production-business-flow.png`：用户提供的 eDHR 生产业务流程图，描述基础数据、生产阶段和放行阶段的主链路。

## 事务、投影与 DHR 业务说明

- `docs/architecture/transaction-traceability-dhr-business-rules.md`：独立于模板实现的事务、投影、追溯与 DHR 汇总业务边界。
- 表单模板、设计器和填报运行时由模板模块负责；本仓库其余模块只依赖受控版本、实例快照和生命周期事件。

## 已失效资料

以下路径来自早期讨论，但在 2026-07-07 本地检查时已不存在，无法直接打开：

- `/Users/ivenwang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_ijen2sl0iaor21_9f1d/temp/RWTemp/2026-06/4036097b327c3bbfb1b2512e06bd4185.png`
- `/Users/ivenwang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_ijen2sl0iaor21_9f1d/temp/RWTemp/2026-06/eff9f95dbaad96b36b33b544ad83c44f.png`
- `/var/folders/sv/f_vzczh51y9cqbtqhfnvwmyw0000gn/T/codex-clipboard-08f87a41-c96b-45b4-84e0-ab9ff8b45b85.png`

如果后续从微信、聊天记录或截图工具中重新找到这些图片，应复制到本目录并在这里补充说明。
