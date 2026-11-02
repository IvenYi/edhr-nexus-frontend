# 冠骋集中流程日志／干预范围原始证据（2026-11-02）

本记录服务于 [DEC-PACKAGE-20261102-CROWN-WORKFLOW-SCOPE](../../reference-assets/research/crown-workflow-scope-20261102/decision-package.yaml)，知识基线保持 `0.3.25 / schema 1.2.0`。本体角色核对主目录来源提交 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad`，最近成功获取的目标为 `e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae`；相关契约无增量。本轮此前 fetch 连接超时，不声称跟踪提交就是服务器当前最新。

## 证据分类和适用范围

- `user-confirmed`：用户要求调研冠骋这两个集中入口中有哪些业务，重点回答表单流程、作业流程和 DHR 审批是否显示。
- `original-evidence`：本轮直接读取下列外部原始 Java／Vue／TS／XML 与《edhr探索之旅.docx》，不是只读取旧调研。前后端导出目录没有 `.git`，原手册与源码是否来自同一部署版本未知；本轮未运行冠骋或操作它的业务数据。
- `secondary-reference`：2026-10-29 干预调研和参考资料清单只用于定位原件，不替代本次核对。
- `inference`：将任务类型、业务来源类型、流程定义类型、作业实例和 UI 页签区分后形成解释；不能因底层共用流程设施就声称它们出现在同一个集中列表，也不能因某个标签缺失而断言所有线上版本永远不支持。

外部原件根目录：

```text
front = /Users/ivenwang/Documents/iven space/paas-main-front
back  = /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed
docx  = /Users/ivenwang/Documents/iven space/edhr探索之旅.docx
```

## 集中日志与干预分别取证

`front/src/projects/web-render/src/views/edhr-application/render/approval-process-intervention/useDocumentTask.ts` 定义 `doc / tmpl / routing / productProcess / dhr / change` 六组干预入口，并按业务开关及相应权限过滤；不是每个租户／账号都显示全部入口。DHR 标签的实际条件使用 `dhrSumDisabled` 真值，该变量名不能代替对实际部署配置的核对。

同目录普通表单干预 `doc-tab/todo.vue:95-97` 按 `taskType='FORM,EDHR'` 查询；DHR 干预 `dhr-tab/todo.vue:105` 为 `EDHR_SUMMARY`，工艺 `routing-tab/todo.vue:90` 为 `ROUTING`，制程 `product-process-tab/todo.vue:114` 为 `PRODUCT_PROCESS`，变更 `change-tab/todo.vue:100-101` 包括 `FORM_CHANGE / DHR_CHANGE / NOTEBOOK_CHANGE`。模板 `control-tab/index.vue:29-33,81-85` 使用独立的 `DocControlTaskTodo` 查询，而不是直接沿用普通表单查询。

日志入口的证据不同：`back/src/main/resources/com/gct/apaas/liquibase/suit/edhr/upgrade/5214/changelog-menu_permission_5214.xml:675-760` 为 `web_process_log_jg30` 登记 `Tmpl / Routing / ProductProcess / Dhr / Change` 五类权限，分别命名模板审核、工艺审核、制程审核、DHR审核和变更审核，没有普通表单的 `Doc` 权限项。

本体角色从原始 DOCX 的所有 `w:p` 元素重新提取文字，段落 1557／4385 均说明“表单审核、DHR审核、工艺审、制程审核、变更审核”的流程日志；1562／4390 对干预作同类介绍。`word/media/image294.png` 原图示例只显示 DHR审核／变更审核标签，可证明示例界面及显示内容，不能据此穷举全部权限和开关组合。手册“表单审核”文案不能自行消解为普通填报流还是模板审核，需与原始 `Tmpl` 权限区分。

因此：干预中的普通表单流程和 DHR 审核均有明确源码证据；日志支持 DHR 审核及五类审核组的资料证据，但当前缺完整低代码页面 JSON 和平台日志查询实现，不能把干预六组直接复制成“日志也一定有六组”，普通 `FORM/EDHR` 填报审批是否进入集中日志仍应标为证据不足。

## 后端任务身份与作业边界

- `back/src/main/java/com/gct/apaas/edhr/approve/enums/SummaryApproveHisType.java:10-23` 将 `EDHR_SUMMARY / FORM_CHANGE / DHR_CHANGE / NOTEBOOK_CHANGE / PRODUCT_PROCESS / ROUTING` 列为汇总审批历史类型；`approve/listener/ProcessTaskEventListener.java:270-284` 把审批历史 `type` 写入 `ProcessTaskTodo.taskType`。这些类型不是对所有事务执行类型的穷举。
- `bizProcess/listener/EdhrProcessTaskEventListener.java:289-320` 从 DHR 实例构造待办，写入 `ProcessTaskTypeEnum.EDHR_SUMMARY`；这与集中干预 DHR 页签的筛选匹配。DHR审核与 `DHR_CHANGE` 变更申请是不同类型，不混称为同一流程。
- `transaction/entity/TxnInstEntity.java:16-20` 的作业／事务实例模型为 `em_txn_inst`；`transaction/biz/TxnInstSubmitBs.java:270-279` 按 `ModelName.TXN_INST` 通过 `BizProcessEngine.startBizProcessInstance` 启动实例；`transaction/biz/TxnInstListSearchBs.java:46-67` 注册“批次/SN事务列表查询”，查询 `TxnInstEntity` 模型。这是作业执行的独立业务承载／查询证据，不等于它绝不与其他流程共用底层引擎。
- `bizProcess/juel/FormNodeDelegate.java:122-147` 可以在事务内创建表单，`OfInstCreateDTO.businessType=BusinessTypeEnum.TXN` 且关联 `txnInstId`，再由 `bizProcess/service/OnlineFormService.java:55-56` 委托平台 `OnlineFormInstanceService.create`。平台实现缺失，当前不足以证明该来源怎样映射到集中查询的 `taskType=FORM/EDHR`；不能把“整条作业没有独立干预分组”外推成“作业内表单永远不能进入普通表单处理入口”。

`ROUTING` 是工艺路线配置对象的审核，`PRODUCT_PROCESS` 是制程配置对象的审核；不据它们存在，推断批次／SN 的工艺路线执行被整个纳入集中审核干预列表。`OF_APPROVE` 属流程定义类型，`FORM/EDHR` 属当前页签查询的任务类型，`TXN` 在上述位置是表单业务来源类型；三者不可直接互换。

## 我方政策和验证边界

[DEC-0092](../decisions/DEC-0092-workflow-operations-entry-and-actions.yaml) 的我方流程日志／干预与 DHR 专属边界保留，本轮不新增政策、不改变当前数据、权限、签署或执行路径，不提升知识版本、成熟度或路线阶段。

本体角色验证限于原始材料／当前声明交叉核对、知识结构／引用／本地证据路径及差异检查；不宣称冠骋线上运行、低代码查询端到端、数据库写入或独立质量已经通过。完整说明与当前证据强度见[本轮研究报告](../../reference-assets/research/crown-workflow-scope-20261102/README.md)，原件路径和摘要见[来源清单](../../reference-assets/research/crown-workflow-scope-20261102/evidence/source-manifest.json)。质量门禁另取同切片最终结果。
