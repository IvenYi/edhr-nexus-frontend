# DHR 审批菜单展示名确认

知识基线：`0.3.24`；日期：2026-09-23；决策包：`DEC-PACKAGE-20260923-DHR-APPROVAL-LABEL-AND-LIST-SETTINGS`。

## user-confirmed

本次用户指令将 DHR 管理中的客户可见菜单名称从“DHR审核”改为“DHR审批”。既有审核/审批功能、路由、权限码、冻结汇总版本及流程语义保留。DHR/表单列表字段设置、页签对齐与图标由前端切片处理，本证据不建立相应业务规则。

## 历史解释与替代范围

`DEC-0056-01` 原要求审批决策入口显示“DHR 审批”；`DEC-0068-01` 后明确指定“DHR审核”并在该切片局部替代前者。当前指令晚于 `DEC-0068`，`DEC-0070-01` 仅局部替代其菜单展示名，保留 `DEC-0068` 其他声明、验收范围及原始措辞，以便追溯。两条历史决策均不被改写。

## original-evidence 与验证边界

2026-09-23 静态读取工作树的 `gmp-platform/frontend/src/utils/constants.ts` 和 `gmp-platform/frontend/src/utils/menuManagement.ts`：菜单当前仍写“DHR审核”，路径均为 `/dhr-management/review`；后者把该路径映射到 `records.dhr-review`。这说明展示名尚待主开发修改，也记录了本次应保持的技术标识。静态读取不证明页面运行、权限实际生效或 DHR 流程验收。

成熟度为 `specified/internal`；知识基线保持 `0.3.24`。本记录不改变运行代码、测试、UI、数据库、审计或权限。
