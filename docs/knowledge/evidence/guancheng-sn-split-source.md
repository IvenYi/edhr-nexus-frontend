# 冠骋 SN 拆分原始源码核对记录

provenance: original-evidence
sourcePath: /Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/order/biz/MfgOrderSplitSNBs.java
scope: SN 工单拆分

## 已核对行为

- `split` 将请求中的 `fileList[].entries` 展开为 SN 拆分条目，而不是按批次数量生成条目。
- 每个条目先经过 `CheckContainerExistsBs.checkIsExists` 检查；标准/返工工单对已占用或不满足状态的 SN 有不同阻断/复用路径。
- `validateSNQtyEnough` 按导入条目数增加工单已拆分数量，并阻断超过工单计划数量的请求。
- 新 SN 以条目中的编号保存；底层为新对象初始化生产路由、工单、产品和等待状态。

## 证据边界

该记录由本体建模智能体重新查看外部源码后生成，作为仓库内可追溯索引。冠骋运行页面本轮不可访问，因此不能据此确认其页面交互、模板列名、编号生成规则或本项目必须复刻的额外状态。
