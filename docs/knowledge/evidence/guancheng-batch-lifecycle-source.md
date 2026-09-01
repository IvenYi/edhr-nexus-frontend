# 冠骋批次生命周期与拆分原始源码核对记录

provenance: original-evidence
sourcePaths:
  - /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/container/biz/StartOfContainer.java
  - /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/container/biz/ContainerCloseBs.java
  - /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/container/biz/RemoveOfContainer.java
  - /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/order/biz/MfgOrderSplitContainerBs.java
  - /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/transaction/biz/ContainerWorkCompleteBs.java
  - /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/service/EdhrInstService.java
scope: batch-lifecycle-and-split-cascade

## 已核对行为

- 开工只接收批次标识；服务先初始化批次的路由节点执行记录和当前工序，再执行批次开工事务、建立事务追溯关系，最后把批次状态更新为 `running`。
- 工单初始拆分（`MfgOrderSplitContainerBs`）为新批次设置产品、产品簇、制程版本、工艺路线、首个工序、DHR 模板和放行模板引用，状态初始化为 `waiting`，创建打印记录，写入 `CONTAINER_WORK_CREATE` 事务及主题追溯关系，并回写工单的已创建批次数、已创建批次数量和未生产数量；这不是既有批次行上的再拆分接口。
- 既有批次的拆分是另一条业务链：冠骋源码明确存在批次转 SN（`ContainerSnSplitBs`，要求批次已不再是 `waiting`，扣减父批次数量并创建 SN 的路由、DHR 和事务追溯）以及返工场景创建子批次（`EdhrCreateContainerOfContainerSplit`，建立 `split_from_id_`/父子关系）。本轮未在原始源码中确认纯 BATCH 批次管理行“批次再拆为多个 BATCH”的独立实现，因此不把它写成已确认产品事实。
- 未开始批次删除仅允许 `waiting` 状态。删除前检查有效事务实例；生产批次删除会将工单批次数减一、已创建数量减去原始批次数量、未生产数量加回，移除无效事务和 DHR/表单实例，写入 `CONTAINER_DELETE` 事务，然后删除当前批次或恢复最近历史快照。
- 进行中批次关闭不允许 `waiting` 或已结束状态。关闭会写入结束原因、完成日期和 `ended` 状态，关闭生产事务实例，写入 `CONTAINER_END` 事务，并将批次 DHR 实例标记为 `ABANDON`；同时级联关闭该批次下未开始/进行中的 SN 与返工批次，再重新计算工单结束状态。
- 批次正常完工由工序执行推进；当没有后续当前工序时写入 `CONTAINER_COMPLETE`，把批次置为 `finished` 并更新 DHR 物料运行状态；DHR 实例完成且系统关闭汇总时可自动创建产品放行单，随后清理生产执行任务并更新工单完成状态。
- 批次和 SN 的关闭均会结束处于 `waiting`/`running` 的生产事务实例和节点状态；DHR 作废操作保留结束原因并触发表单作废流程，而不是把结束当作正常完工。

## 证据边界

以上结论来自冠骋仓库中的原始 Java 源码。它们说明外部系统的业务连锁，不直接证明当前 eDHR 已实现同样的事务、路由、DHR、放行单或父子对象级联。当前 eDHR 的 `ProductionService` 已实现对象状态和工单状态的基础联动，但没有提前结束状态、结束原因字段、执行事务/DHR 级联或拆分父子关系；这些差异必须在后续生产执行设计中单独决策和验证。
