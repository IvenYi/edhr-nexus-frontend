# 冠骋表单变更 / 作废审批调研

## 结论

冠骋的表单变更和作废审批，不是表单自己的填报/审批流（`OF_APPROVE`），而是套在**已经结束的表单实例**上的一层业务审批。用户先在表单变更、DHR 变更或记录本变更页定位到一张已完成表单，改数据或发起作废，再选一条变更审核流程。审核通过后才真正改数据或把表单置为作废；退回则不落地，表单回到提交前状态。

三条入口（表单 / DHR / 记录本）共用同一套记录和同一个 handler。变更（`CHANGE`）和作废（`ABANDON`）也共用这条审批叠加层，只是结束时的落地动作不同。

这条叠加层和旧的立即变更/立即作废路径现在还同时存在。后者会立刻改数据，不走 `em_edhr_summary_approve_his`。调研时不能把两条路径收成一条。

本文记录的是竞品事实和内部研发建议，不代表 eDHR 当前已实现能力，也不构成客户承诺。

## 先区分两条路径

冠骋源码里和“表单变更 / 作废”相关的路径至少有两条，不能混读：

1. **业务审批叠加层（当前产品主路径）**
   - 提交入口：`submit_change` / `submit_abandon`
   - 运行类型：`PmProcessDefinitionTypeEnum.BUSINESS_APPROVE`
   - 配置分类：`SummaryProcessType.CHANGE` = `__change_process__`
   - 共享记录：`em_edhr_summary_approve_his` / `EdhrSummaryApproveHisEntity`
   - 效果：提交时只把表单打成 `IN_AUDIT`，审核结束才改数据或作废

2. **旧立即变更 / 立即作废路径**
   - `FormChangeProcessService.change()` 会立刻校验并写入表单数据
   - REST 仍保留 `/gct-apaas/api/form/change/process/*`，但审核/退回等接口已转调 `ApproveProcessService`
   - MedPro 的 `doMedProSubmitFormChange` 仍直接调用 `postOnlineFormProcessChange` / `postOnlineFormBaseSubmit`
   - 未填报 eDHR 表单还可以走 `needAbandonBtn` 的立即作废，不经过这条叠加层

另外还要和表单自己的填报审批区分：`FormChangeProcessService` 里仍有 `OF_APPROVE` 路径，那是表单填报/节点审批，不是变更配置里新建的变更审核流程。

## eDHR 发起入口（只看 eDHR，不看 MedPro）

eDHR 里「表单变更」按钮不是填报页、工作台、已完成详情里随手能点的。它只在 `pageType === 'record-change'` 时打开。

按钮真正露出来的条件在 `use-annotation.ts`：

- 表单已结束（`COMPLETED` / `ABANDON` 都算结束）
- 未作废
- 父组件把 `EDHR_BUTTON_PERMISSION.Update` 设成 `true`
- 类型是基础表 / 流程表 / 文件表；`TEXT` / `VIEW` 不能变更

没有父组件 provide 时，默认注入是 `Update: false`。所以填报、详情、工作台即使打开同一张已完成表单，也不会出现「表单变更」。

### 能点出「表单变更」的页面

| 页面 | 路由 key | 查询方式 | 变更类型 | 默认菜单有没有 |
| --- | --- | --- | --- | --- |
| 表单变更（合并页） | `record-change` | 可切 DHR / 表单；DHR 查批次或 SN，表单查流水号 | DHR → `DHR_CHANGE`；表单 → `FORM_CHANGE` | 有。系统管理 → 表单变更 |
| 表单变更 | `doc-record-change` | 只查表单流水号 | `FORM_CHANGE` | 无。路由有，默认菜单未挂 |
| DHR 变更 | `edhr-record-change` | 只查批次 / SN | `DHR_CHANGE` | 无。路由有，默认菜单未挂 |
| 记录本变更 | `notebook-record-change` | 选记录本 | `NOTEBOOK_CHANGE` | 无。路由有，默认菜单未挂 |

当前变更容器走的是 `useEbrWikiFactory`（V1），不是 V2。未封存时会打开 `Annotate` / `Cancel` / `Update`，并写入 `_gct_summary_approve_type_`。eDHR 已 `ARCHIVED`、记录本已 `archived` 时这三项关掉。

产品说明里的三条专用页，代码都在；但 eDHR 套件默认菜单只挂了合并页 `record-change`。专用页要靠低代码菜单把 `link_page_` 配成对应路由才会出现。

### 点不出「表单变更」的页面

| 页面 | 实际 pageType / 打开方式 | 结果 |
| --- | --- | --- |
| eDHR 填报 | `pageType="edhr-filling"` | `Update` 保持 false |
| 工作台待办 / 已办 | `pageType: 'hide-create-instances'` | 只隐藏新建实例，不开变更按钮 |
| 表单填报已完成 | `openSingleDrawer` 看详情 | 无 `EDHR_BUTTON_PERMISSION` provide，默认 `Update: false`；操作列只有「详情」 |
| 电子放行 | 没有 `record-change` | 不开变更按钮 |
| 变更审核 `change-task` | 待办 / 已办 | 这是审核入口，不是发起入口；默认菜单也没挂 |

填报页上的作废是另一条路：`needAbandonBtn` 只对未填报、挂在 eDHR 下的表单做立即作废，不走 `submit_change` 叠加层。

V2 的 `record-change` 分支只开了三个按钮，没有写 `_gct_summary_approve_type_`。当前 eDHR 变更页没有走 V2；填报弹窗走 V2，但 pageType 不是 `record-change`。

因此：eDHR 默认产品里，用户要发起表单变更，只能进「系统管理 → 表单变更」，切到表单后按流水号查询。三条专用页和变更审核页都是可挂页面，不是默认菜单。

## 在冠骋产品中的位置

| 使用位置 | 如何体现 | 证据类型 |
| --- | --- | --- |
| 变更配置 | 和汇总配置并列的低代码配置页：新建/配置变更审核流程模板。提交弹窗不在这里新建。 | 探索资料；`em_edhr_summary_process` + `type_=CHANGE`；页面 JSON 不在 git |
| 表单变更 | 按表单流水号查询，打开后点作废或变更，改完点提交变更，签名、填原因、选流程。 | 探索资料；`doc-change.vue`、`record-change` |
| DHR 变更 | 以 DHR 目录改其中的表单，操作与表单变更相同。 | 探索资料；`edhr-change.vue` |
| 记录本变更 | 改记录本里的表单，操作相同。 | 探索资料；`notebook-change.vue` |
| 变更审核 | 我的待办展示待审变更；处理页标红变更字段，并展示变更原因和变更人。 | 探索资料；`change-task` |
| 流程干预 | 可对变更审核做退回/转办等干预。 | 探索资料；`approval-process-intervention/change-tab`，`taskTypeList: FORM_CHANGE\|DHR_CHANGE\|NOTEBOOK_CHANGE` |
| 变更列表 | 产品说明称展示全部变更记录。当前 web-render 路由未钉死对应页面。 | 探索资料；源码未定位到独立列表页 |
| 表单内批注 / 操作日志 | 示例要求提交后可用变更记录（批注）和操作日志看改了哪里。 | 探索资料；`annotate-button`、`OnlineFormChangeLogHandler` |

## 变更配置入口

配置和运行要分开看。**变更配置**是模板库，**提交变更/作废**只从库里选一条已有流程。

### 配置层：变更配置页

产品探索文本把「变更配置」放在基础建模 / 模板建模区域，和「汇总配置」并列，后面是编码规则、审批配置、模板审批。操作只有新建（名称 + 描述）和配置（审核节点 + 并行节点）。

实现上它不是硬编码菜单：

- `changelog-edhr-menu.xml` 只有 27 个菜单，有「表单变更」「流程干预」，没有「汇总配置」「变更配置」
- `asyncRouter.ts` 有 `record-change`、`change-task`、`approval-process-intervention`、`system-config`，没有独立变更配置路由
- `system-config` 里的「汇总配置」只是开关 `enforceUseDHRSummaryProcess`，不是模板列表

配置数据在 `em_edhr_summary_process`。`SummaryProcessType` 用 `type_` 区分分类：

- `SUMMARY` → `__summary_process__`
- `CHANGE` → `__change_process__`
- `PRODUCT_PROCESS` → `__product_process_process__`
- `ROUTING` → `__routing_process__`

保存走 `SummaryProcessSubmitBs`：新建记录的 `proc_def_id` 为 `PROCESS + uuid`，流程定义类型写成 `PM_APPROVE`，`categoryId` 由 `type_` 转出。前端低代码按钮调 `$DHRSummaryDesignModal` / `$eDHRSummaryDesignModal`，打开 `approval-design-modal.vue`（`DesignerType.BIZ_PROCESS_TEMPLATE`，默认节点是审核 + 并行）。

页面本身是租户低代码页，JSON 不在本仓库。权限 XML 能看到相邻页 id，但钉不死变更配置自己的 page id：

- `web_lJTMcvzb_jhwd`：工艺/路线类配置
- `web_process_config_blhi`：制程类配置
- `web_audit_process_jg30`：审批配置
- `web_process_log_jg30`：流程日志 / 模板审批历史

### 运行层：提交时人选

`form-abandon-v2-modal.vue`（移动端 `form-abandon-v2-popup.vue`）签名、填原因后，调用 `openSelectProcessModal({ categoryId: '__change_process__' })`。选择弹窗：

- 「我的常用」查 `em_edhr_summary_approve_common_use`，`type_=CHANGE`
- 「全部」按 `__change_process__` 拉流程定义分页
- 操作只有查看和单选，没有新建

选中的 id 作为 `approveTmplId` 传给 `submit_change` / `submit_abandon`。后端 `OnlineFormChangeBs` / `OnlineFormAbandonBs` 要求这个 id，再按它启动 `BUSINESS_APPROVE` + `CHANGE` 分类流程。源码里没有从表单模板预绑变更流程再自动带出的路径。

### 不要和「审批配置 / 变更审核」混读

`web_audit_process_jg30` 的权限里有模板审核、工艺审核、制程审核、DHR审核、变更审核，以及 `Change.AddForm` / `Change.AddDhr` / `Change.Config` / `Change.Delete`。这是审批配置页，不是变更配置模板库。

当前 git 里的 `temp-audit-process` 组件只实现表单分类、DHR分类、特殊表单、特殊 DHR，权限键用的是 `Tmpl.*`，配置类型是 `DOC_CONTROL_APPROVE`。流程干预、流程日志里的「变更审核」页签是运行中的待办/日志，也不是模板新建页。

因此：表单会走哪条变更审核流，是提交当时人选的；变更配置只负责把可选模板建出来。

## 完整模型

### 1. 这是一层叠加审批，不是表单自己的流程

提交时并不改写表单模板流程，而是：

- 在 `em_edhr_summary_approve_his` 写一条记录
- `params` 保存本次请求体（含新数据和原因）
- `oldParams` 保存提交前的表单实例 JSON
- `changeNo` 用审批历史序号生成
- `type` 区分入口：`FORM_CHANGE` / `DHR_CHANGE` / `NOTEBOOK_CHANGE`
- `changeType` 区分动作：`CHANGE` / `ABANDON`
- 按所选 `approveTmplId` 找到 `em_edhr_summary_process`，再启动 Camunda 流程
- 把表单实例状态改成 `IN_AUDIT`

`ProcessHandlerFactory` 把三种 `type` 都映射到 `OnlineFormChangeProcessHandler`。入口不同，结束时的落地逻辑相同。

### 2. 入口、按钮和提交弹窗

三条页面都把 `pageType` 设为 `record-change`：

- 表单变更：`doc-record-change` → `doc-change.vue`
- DHR 变更：`edhr-record-change` → `edhr-change.vue`
- 记录本变更：`notebook-record-change` → `notebook-change.vue`

当前 record-change 容器走的是 `useEbrWikiFactory`（不是 V2）。未封存时打开：

- `Annotate` / `Cancel` / `Update` = true
- `_gct_summary_approve_type_` = `FORM_CHANGE`（表单）或 `DHR_CHANGE`（DHR）或 `NOTEBOOK_CHANGE`（记录本）

eDHR 已封存（`ARCHIVED`）时这三项会关掉。记录本已 `archived` 时同样关掉。`useEbrWikiFactoryV2` 的 record-change 分支只开了三个按钮，没有写 `_gct_summary_approve_type_`；当前变更页没有走 V2。

`form-annotation-controller.ts` 里实际露出的按钮：

| 按钮 | 条件 |
| --- | --- |
| `modify-button` | 表单已结束、未作废、`Update` 为真 |
| `abandon-button` / `resubmit-button` | 表单已结束、`Cancel` 为真、业务类型不是 `PRODUCT_RELEASE`；已作废时显示重新提交 |
| `annotate-button` | 已结束或审核中，且 `Annotate` 为真，或当前是变更审核页 |
| `needAbandonBtn` 的立即作废 | **不在**数据变更页、表单未填报、属于 eDHR。这不是叠加层 |

`TEXT` / `VIEW` 表单不能变更或作废。前端 `isFormEnded` 把 `COMPLETED` 和 `ABANDON` 都算结束状态。

提交弹窗是 `form-abandon-v2-modal.vue`：

- 申请人签名
- 原因，最多 120 字
- 确认后 `openSelectProcessModal({ categoryId: '__change_process__' })`

产品示例写的是“提交人和审核人双人签名”。v2 弹窗只采集申请人。MedPro 另有双签弹窗，且走旧立即变更接口。

### 3. 提交时的后端约束

`OnlineFormChangeBs.submit_change`：

- 表单必须是 `COMPLETED`，否则 `suit.form.inst.status.can.not.change`
- 必须带 `approveTmplId`
- 写 approve-his，`changeType=CHANGE`
- 启动 `BUSINESS_APPROVE` + `CHANGE` 分类流程
- 表单改为 `IN_AUDIT`
- 记 trace log 时 `requiredValidationEnabled = false`
- 记变更日志，并校验记录号唯一

`OnlineFormAbandonBs.submit_abandon`：

- 表单不能是 `IN_AUDIT`；**没有**要求必须是 `COMPLETED`
- 同样写 approve-his，`changeType=ABANDON`
- 提交时不改表单数据，只把状态打成 `IN_AUDIT`
- 前端成功后，如果该表单 `ofRequired`，可能再调 `insertFormInstance` 补一张待填实例

也就是说：叠加层的作废可以挂在非审核中的已有实例上；立即作废路径则要求未填报，且通常要挂在 eDHR 下。

### 4. 配置、启动和运行

变更流程配置存在 `em_edhr_summary_process`。`SummaryProcessSubmitBs` 新建时：

- 流程定义类型写成 `PM_APPROVE`
- `categoryId` 按 `SummaryProcessType.convertToCategoryId(type)` 转成 `__change_process__`

运行时 `SummaryApproveHisService.generateDataAndProcess(...)` 却用 `BUSINESS_APPROVE` 启动。`ApproveProcessService` 和 `ProcessTaskEventListener` 的 `@ProcessPath` / 事件监听也都绑在 `BUSINESS_APPROVE`。配置类型和运行 businessKey 不是同一个枚举值；当前能对上，是因为启动时显式传入了运行类型。

启动后还会把最近 5 条常用变更模板记到 `em_edhr_summary_approve_common_use`。

运行动作：

| 动作 | 行为 |
| --- | --- |
| 审核 | 完成当前任务，handler 只写变更日志，标题为“变更审核”或“作废审核” |
| 转办 | 转给其他人，写日志 |
| 退回 / 干预退回 | 退回开始节点，approve-his 置 `ENDED`，按退回规则恢复表单状态；变更退回时还会按 `oldParams` 重建记录号关系 |
| 流程结束 | listener 调 `handler.processEnd`，approve-his 置 `FINISHED` |

审核页按钮来自 `em_edhr_summary_process` 的 `biz_button`。前端传入的 `id` 是 **流程实例 id**（`record.processInstanceId`），不是 approve-his id。打开表单时带 `_gct_is_form_change_approval_page_` 和 `_gct_default_annotation_status_`。

产品说明里的设计器只提审核节点和并行节点。通用 BPMN 面板里还有消息节点、脚本节点、条件分支；变更模板有没有真正用消息节点，当前没有实例级证据。

### 5. 结束时才落地

`OnlineFormChangeProcessHandler.processEnd` 在流程结束后才调用平台方法：

| changeType | 结束动作 | 表单最终状态 |
| --- | --- | --- |
| `CHANGE` | 流程表单走 `onlineFormProcessService.change()`，其它走 `onlineFormBaseService.submit()`，都带 `noLog` | `COMPLETED` |
| `ABANDON` | `onlineFormProcessService.abandon()`，带 `noLog` | `ABANDON` |

退回：

| changeType | 退回后表单状态 | 是否应用新数据 |
| --- | --- | --- |
| `CHANGE` | `COMPLETED` | 否 |
| `ABANDON` | 恢复 `oldParams.instanceStatus` | 否，提交时本来也没改数据 |

审核、转办本身不改表单数据。变更数据只存在 approve-his 的 `params` 里，通过后才写入。

结束时 `change()` 会走 `dataValidateAndSubmit`。非流程表单的 `submit()` 此刻是否仍校验必填，当前没有单独核对。

结束后会 `edhrInstanceService.refreshInstStatusByOfInstId(...)`。

## 状态矩阵

| 时机 | approve-his | 表单实例 | 是否写入新数据 |
| --- | --- | --- | --- |
| 提交变更 | `IN_AUDIT` | `IN_AUDIT` | 否，新数据只在 `params` |
| 提交作废 | `IN_AUDIT` | `IN_AUDIT` | 否 |
| 变更审核通过 | `FINISHED` | `COMPLETED` | 是 |
| 作废审核通过 | `FINISHED` | `ABANDON` | 否，只改状态 |
| 变更退回 / 干预退回 | `ENDED` | `COMPLETED` | 否 |
| 作废退回 / 干预退回 | `ENDED` | `oldParams.instanceStatus` | 否 |

## 已确认的关键运行路径

```text
变更配置（em_edhr_summary_process, category=__change_process__）
        |
        v
表单变更 / DHR 变更 / 记录本变更
        |
   查询已结束表单 ----+---- 表单变更（改数据 + 批注）
                    |
                    +---- 表单作废（不改数据）
                    |
                    v
          申请人签名 + 原因 + 选择变更流程
                    |
                    v
     submit_change / submit_abandon
                    |
                    v
     em_edhr_summary_approve_his
     + BUSINESS_APPROVE 流程实例
     + 表单 IN_AUDIT
                    |
        +-----------+-----------+
        |                       |
      审核 / 转办              退回 / 干预退回
        |                       |
        v                       v
  流程结束 processEnd         his=ENDED
        |                  变更 -> 表单保持 COMPLETED
        |                  作废 -> 恢复 oldParams 状态
        v
  CHANGE -> 调用平台 change/submit，表单 COMPLETED
  ABANDON -> 调用平台 abandon，表单 ABANDON
        |
        v
  刷新 eDHR 实例状态；必填表单作废后前端可能补新实例
```

## 已确认 / 仍未确认

**已确认**

- 这是 `BUSINESS_APPROVE` 叠加层，不是表单 `OF_APPROVE` 填报流
- 三条入口共用 `OnlineFormChangeProcessHandler`
- `CHANGE` / `ABANDON` 共用记录和流程分类，结束动作不同
- 提交变更要求表单 `COMPLETED`；提交作废只禁止 `IN_AUDIT`
- 审核中不落地，通过后才改数据或作废
- 旧立即变更 / 立即作废路径仍在，MedPro 和未填报作废会用到
- 必填表单作废后补新实例，是前端在 `submit_abandon` 成功后做的
- 审核页 `biz_button` 的 `id` 传的是流程实例 id
- 产品示例要求双签，v2 弹窗只采集申请人
- 「变更配置」是低代码页，和「汇总配置」共用 `em_edhr_summary_process`，`type_=CHANGE`；不在硬编码菜单/路由里
- 提交弹窗只选择已有 `__change_process__` 模板，不新建；`approveTmplId` 由人选，不是表单预绑

**仍未确认**

- 结束时非流程表单 `submit()` 是否还校验必填
- 产品里的“变更列表”对应哪一个 web-render 页面
- 变更模板是否真用消息节点；设计器默认节点和产品说明不一致
- `PM_APPROVE` 配置类型和 `BUSINESS_APPROVE` 运行类型，除启动入参外还有没有其它匹配规则
- 作废提交对 `UNFILLED` / `RUNNING` / `STASH` / `COMPLETED` 的产品规则，源码只排除了 `IN_AUDIT`
- `useEbrWikiFactoryV2` 若被变更页启用，会不会丢掉 `_gct_summary_approve_type_`
- 变更配置低代码页的 `gct_page` id / JSON 仍未钉死
- 审批配置权限里的「变更审核」页签，当前 `temp-audit-process` 源码未实现；是否给表单预绑变更流程未确认

## 对 eDHR 后续实现的影响

以下是 `inferred` 的研发建议，尚未成为 eDHR 产品规则。

1. **不要把变更审批做成表单填报流的一个按钮。** 冠骋的主路径是：已完成表单先冻结为审核中，通过后再应用。若 eDHR 需要同类能力，应单独建变更申请/审批记录，而不是复用填报节点。
2. **变更和作废可以共用审批配置，但状态回滚规则不能共用。** 变更退回回到 `COMPLETED` 且不应用新数据；作废退回要回到提交前状态。
3. **入口类型可以先做薄。** 表单、DHR、记录本在冠骋只是 `type` 不同，落地 handler 相同。eDHR 若暂时没有记录本，不必先复制三套审批引擎。
4. **不要把旧立即变更路径当成目标模型。** 它还在，而且 MedPro 仍在用，但和当前 eDHR 产品主路径不是同一套。若要对齐冠骋当前产品，应对齐叠加层，而不是 `FormChangeProcessService.change()`。
5. **双签、必填表单补实例、封存不可改，都不要直接写成 eDHR 承诺。** 双签只出现在产品示例和 MedPro；必填补实例是前端副作用；封存隐藏按钮在工厂里能看到，但和审核中 DHR 的只读规则不是同一件事。
6. **先不要承诺“变更列表”和消息节点。** 前者产品有、前端页未钉死；后者设计器有、产品说明没有。

## 参考证据

- `edhr探索之旅.docx` 的归档提取文本：[crown-exploration-extracted.txt](crown-exploration-extracted.txt)：变更配置、表单/DHR/记录本变更、变更审核、变更列表、表单及 DHR 变更示例。
- `approve/biz/OnlineFormChangeBs.java`、`OnlineFormAbandonBs.java`：叠加层提交、状态预检、approve-his 写入。
- `approve/service/SummaryApproveHisService.java`：按 `em_edhr_summary_process` 启动 `BUSINESS_APPROVE` 流程。
- `approve/factory/ProcessHandlerFactory.java`、`handler/business/OnlineFormChangeProcessHandler.java`：三种入口共用 handler，结束/退回状态计算。
- `approve/service/ApproveProcessService.java`、`listener/ProcessTaskEventListener.java`：审核、转办、退回、干预退回、流程结束。
- `approve/service/FormChangeProcessService.java`、`controller/FormChangeProcessController.java`：旧立即变更/作废，以及仍保留的 REST。
- `edhr/biz/SummaryProcessSubmitBs.java`、`approve/enums/SummaryProcessType.java`：变更配置保存为 `PM_APPROVE` + `__change_process__`。
- `src/projects/web-render/src/views/edhr-application/render/edhr-summary/components/modals/select-process-modal.vue`：提交时按分类选择已有模板，无新建。
- `src/projects/web-render/src/render/Event/utils/builtInMethods.ts`、`approval-design-modal.vue`：低代码配置按钮打开汇总/变更流程设计器。
- `upgrade/5214/changelog-menu_permission_5214.xml`：审批配置 / 流程日志的低代码页 id 和「变更审核」权限键；变更配置页 JSON 不在 git。
- `edhr/biz/AuditButtonSearchBs.java`：审核按钮按流程实例 id 取当前待办节点操作。
- `packages/nocode-web-render/src/annotation/form-abandon-v2-modal.vue`：申请人签名、原因、选择 `__change_process__`。
- `packages/nocode-base/src/hooks/annotation/form-annotation-controller.ts`：按钮显隐、`submit_change` / `submit_abandon`、必填表单补实例、MedPro 旧路径。
- `src/projects/online-form/src/views/integration/apaas_ebr/hooks/useEbrWikiFactory.ts`：record-change 页的 `Annotate/Cancel/Update` 和 `_gct_summary_approve_type_`。
- `src/projects/web-render/src/views/edhr-application/render/record-change/`、`render/change-task/`、`render/approval-process-intervention/change-tab/`：三条入口、待办已办、干预列表。
