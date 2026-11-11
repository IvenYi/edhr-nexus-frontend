# 记录控制、DHR 联动及流程责任操作的闭环核查

本轮用户要求整体检查表单变更／作废、DHR 联动、流程日志／干预及原 TODO，已完成才清理陈旧待办和知识说明，并补未完成的全流程验证。该要求是核查和验证授权，不新增归档、活动表单作废、放行后完整变更或通用质量判读政策。

知识基线 `0.3.25`；原始源码核对基点为本地 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad` 加保留的工作区差异，目标 `8ec8391721858a7f96d73a5d293d93f43679118a` 已获取但未合并。项目、角色、交接及目标知识增量已核对为空，未将 fetch 当作重新读取远端实现或合并验收。本轮不提升知识版本、schema 或 P0 阶段。

## 原始实现核对与纠错

- `RecordControlService.lookup/submit` 已读取来源状态、当前修订及活动申请；`submit` 在来源锁内复核 `COMPLETED`、当前修订一致、活动申请数及 `EFFECTIVE` 修订。认证身份来自 `actor` 和实际签署人，不能继续使用 2026-09 的 `source-status-validation-pending` 作为当前事实定位。
- `RecordControlService.submit/applyResult/withdraw`、`RecordControlTaskActionService` 和 `WorkflowEngine` 已具有原子申请确认、最终结果消费、受限撤回、退回终结、修订切换和失败回滚实现。并行汇合、任一分支退回失效其他待办有 `WorkflowEngineTest` 源断言；原始设计形成时尚无运行能力的历史说明保留，但不应继续作为当前“等待朋友实现”的结论。
- `DhrEvidenceImpactService.sourceEffective/changes` 与 `DhrImpactNotificationService` 已分别实现真实生效影响及个人提醒、冻结变化检测和过时批准阻断。`RecordControlPostgresIntegrationTest` 原断言包含当前审批人/提交人、重名隔离、唯一原审计身份恢复、重复事件、写入失败回滚和来源／DHR竞争。这里核对测试源码及已保留报告，不冒称本体角色执行了本轮数据库或浏览器测试。
- `DhrSummaryPage` 沿 `DEC-0063-16` 常规视图默认隐藏作废表单，通过标题行低频入口查看；完整归集、核查、冻结和历史可达范围保持。“作废记录保持可见”应解释为完整证据按权可达，不能恢复常规平铺。
- `DhrInstanceService.terminateWithProductionObject` 与 `ProductionService.endObject` 已有同步终止实现，`production/controller/ProductionExecutionIntegrationTest` 有状态、快照保留、阻断及并发断言；不再使用“正在并行实现”定位当前状态事实。该相邻能力不由本轮记录控制 E2E 自动宣称全部重新验收。
- 普通表单/DHR集中查询和签名重新分配以 `DEC-0093` 精确补充／替代旧范围；DHR本人转办、撤回及通用批准绕过仍不开放。`DEC-0092-06` 的 DHR 排除只保留为当时实现事实。
- 普通生产表单转办的签名边界复核原始 `DEC-0028-02`、按钮事件v3用户来源和 `DEC-0055/0074`：合法可签署按钮为SAVE/SUBMIT/APPROVE/RETURN，TRANSFER不配置签名事件；`FormNodeConfiguration.validateButtonConfiguration`在保存/发布均拒绝该事件，前端也排除。管理员重新分配必签与此不混用；不得以手工加入不合法TRANSFER签名事件的夹具推导新签署政策或产品漏签缺陷。
- 本范围规则实际依赖的 `facts/core-business.yaml` 中来源完成／当前修订、申请状态／内容／签名、作废批准、并行汇合及干预类别，早期仅将别名挂在 `ProductionService`。本轮按原始服务定位这些实际派生值，保持稳定 ID／别名与内部投影；不会因共享目录含 DHR 字样而重写其他领域或关闭全局 P0 粗粒度定位缺口。共享审批配置的 `DHR_SUMMARY` 分类与记录控制申请的 `CHANGE/OBSOLETE` 枚举分别解释。
- 根主方本轮真实页面基线复现：公共候选读取的额外创建权限造成普通账号403；记录变更等入口遗漏既有提交边界的数值归一化，导致数量提案携带字符串且能申请、批准投影却拒绝非数字。前者按本轮用户确认对齐读取边界，后者复用既有 `production/executionFormValues` 工具补 `RecordChangePage`、`FormFillingPage`、`FormReviewPage` 和 `DhrFillingPage` 四个遗漏入口，保留输入期间的小数和空值文本，不改共享控件契约，也不新增数字精度、质量统计或签署政策。源码已逐入口核对；失败原件和修后实际运行以同轮 `evidence/baseline-live-*.json` 及最终报告定位，未完成前不记为修后通过。

## 保留范围与不能混用的证据

1. 原生 Java 服务已经运行，不等于研发知识 YAML 已由通用规则层执行。`execution-contracts.yaml` 目前未注册记录控制/DHR通用规则执行契约；不据业务测试批量改 `verified/runtime`。
2. `discrepancy.dhr-review-complete-evidence-impact-gap` 和 `discrepancy.dhr-summary-selected-completed-evidence` 的当前实质剩余，是通用适用质量、异常处置、源签署有效性的自动判读／变化比较；旧手选和完成状态过滤已经修正。两项不能混成“仍无DHR联动”，也不能因基本业务链通过而全部关闭。
3. `discrepancy.dhr-review-effective-source-integration` 的普通账号基本UI链、当前审批人与提交人、无当前任务、重名、唯一原提交人恢复、无关账号不可见／不可代读、重投和失败回滚已有本轮原件。2026-11-03截至本轮，仅余改派后当前审批人收件人集合、多候选／无限制候选收件人集合和无法唯一恢复旧提交身份时不猜测的组合证据；该时点并未以单条链冒充组合通过。2026-11-11新增接续已由真实canonical PG聚焦16项逐一补齐两类生效结果的这些组合，该既有实现证据缺口据此resolved，详见[新原件与范围](dhr-filling-review-implementation.md#2026-11-11生效提醒剩余组合证据接续)；不回填本页原32项/12步，不由停用／锁定账号推导未确认的无提醒政策，也不替代完整浏览器、权限及本批最终独立质量门禁。
4. `DEC-0071/0072` 的目录整理剩余验证应具体列为整组／单份交错整理、取消位置恢复默认、刷新持久化、并发修订拒绝和旧冻结回读；改派测试不能替代这些整理场景。
5. 候选读取协同已按本轮明确确认的DEC-0094结束局部暂缓，源实现及方法安全证据分列；归档执行、打印过滤作废、活动表单作废、放行后完整变更、A12历史界面／规则重建、多租户及作业条件运行契约分别按各自当前决策保留。只关闭已有明确来源和本轮验证支持的范围。

## 本轮实际运行原件

本体角色已读取 `evidence/live-e2e-result.json`、`RecordControlPostgresIntegrationTest.txt`、`component-ui-result.json`，并回到实际脚本和测试断言核对；执行由主方完成，本体没有运行 Maven 或另行执行浏览器。

| 原件 | 已确认的运行范围 | 边界 |
| --- | --- | --- |
| `live-e2e-result.json` | 真实维护页面、真实后端、显式隔离PG，`selectedSteps=all`，12个检查步骤通过，`errors=[]`。普通账号变更／作废、签名申请、受限撤回和新号重提、处理人转办及管理员签名改派、退回终结、DHR双向在审阻断、人工退回后汇总V2、DHR新处理人原生批准、V1正文及冻结行保留、DHR和表单数据审计均有实际交互／持久化断言。 | 12步含登录与服务初始化，不是12条独立业务流程；初始化冻结版经真实服务构造。运行在独立端口与隔离数据库，不是主开发库写入验收。 |
| 同轮数值入口断言及`ordinary-approved-number-type.json` | 变更拟数据入库类型为number；DHR填报保存0、个人填报逐字输入1.25并保存有`jsonb_typeof=number`；个人审批修改2.5、实际签署后原样本只读PG原件确认`COMPLETED`、`qtyType=number`、`qty=2.5`。四入口复用同一已有提交归一化，普通转办仍无签名。 | 主侧首轮all脚本最终曾只断言值文本；新增原样本类型查询单独保存，脚本后续已加强为`COMPLETED:number:2.5`，新的独立复跑另取其实际结果。不泛化为全部数字精度或全部类型组合已测。 |
| `RecordControlPostgresIntegrationTest.txt`及对应源码 | 32项，0失败／错误／跳过。同幂等键并发只建一个申请、签名和流程；不同申请／撤回批准／改派／DHR提交竞争、当前贡献切换及历史贡献保留、通知ID接收人／唯一审计恢复／重名／去重、通知或审计失败回滚、两域责任变化审计。 | 服务集成覆盖不能冒充所有收件人组合真实UI已测；并行路径的组件展示和引擎测试也与浏览器顺序审批样例分列。 |
| `component-ui-result.json` | 1440与390宽度的实际列表／详情／弹窗和API客户端，共40项全部通过，含列设置、并行／无任务、空／错／加载、各业务类型及数据审计。 | 合成拦截API，没有真实后端或数据库写入，不作为真实整链的替代。 |
| `mainBefore`／`mainAfter` | 主库9张本范围业务表的记录数与指纹前后一致。 | 仅证明已列业务表的本轮前后指纹一致，不扩大为全数据库完全未变化。 |

`discrepancy.record-control-stage1-permission-and-concurrency-verification-pending` 已按同幂等键真实PG争用及本轮全认证候选读取的方法安全／HTTP原件关闭；候选只读不授予申请或审批权。DHR目录交错整理等专项仍未由这些运行自动覆盖；完整质量比较、归档及其他明确暂缓范围保持。最终独立质量应取本轮正式结果，不能由本体读取报告代替。

运行证据、逐项清单和最终独立质量分别保存在 `docs/development/workflow-record-dhr-closure-20261102/`。旧切片的 `failed`、`passed`、历史原件和日期保持，不反填未发生的验证。
