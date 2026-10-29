# DHR归档术语与MVP最小范围确认

日期：2026-10-29，Asia/Shanghai。知识模型0.3.25；确认记录起始Git基线为 `e63ed8dd2c3f63e5efb334b523efc7f3d9c32843`，已获取目标为 `edhr-dev@635711f97e9b794f4af02e1e5d1939bb2ecf920f`，项目、角色和交接契约无增量。当前功能切片交接见 `docs/development/record-control-dhr-linkage-20261029/decision-package.yaml`。

## user-confirmed：人类原话及其所承接的建议

用户先就“归档还是封存”和“MVP是否需要”提出疑问。上一轮提出的建议为：统一称DHR归档；区别汇总版本冻结、结束日常办理的归档与下载副本；面向实际使用的MVP，在最终放行后绑定具体正式版本及表单修订、附件、签名、审计和放行依据，限制普通修改，记录归档主体、时间和版本，按权检索、追溯、导出，并验证备份恢复；先不做独立归档审批、解封或完整放行后变更，放行后变更保留P1方向。

用户本轮明确回复：

> 好的，那就统一叫归档，MVP按你说的最小范围做，先把这些决策和todo记录好。接下来继续推进表单变更、作废和DHR的联动。不要改坏现有的功能，并且也不要因为增加功能破坏了现有页面的呈现与规范

本轮确认的是上述术语和MVP最小交付范围，同时明确当前先记录归档TODO、继续记录控制联动。它不等于当前已经归档，也不授权本轮顺带实现归档或放行。归档后普通路径受限的方向被确认；具体操作位置、归档权限码、签署细则、保存期限、备份实施参数等未由这段回复定版，不应私自推导。

## original-evidence：既有规划和当前能力边界

- `docs/prd/edhr-mvp-prd.md` 场景7明确汇总审核之后另有最终放行决定，已放行记录只读，放行后变更为P1独立受控流程；最小归档确认承接此方向，不把DHR审核当产品放行。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrArchiveController.java` 的GET export接受DHR和指定汇总版本，返回ZIP下载；接口本身不能证明已实现归档生命周期。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java` 的提交冻结与 `reorganize` 新草稿路径分别服务汇总版本，不应直接改名为已归档。

以上规划及源码本轮直接读取；它们不是新归档事务、迁移、权限、备份或浏览器验收。

## secondary-reference：调研索引

`docs/reference-assets/research/crown-dhr-change-downstream-20261029/capability-inventory.md` 为前轮能力盘点，可用于定位原始来源，不能单独替代本轮新归档的实现证据。冠骋的菜单名称、状态与部分平台服务缺源边界不作为本产品政策的自动来源。

## inference、保持与暂缓

- `DEC-0090` 保存本轮确认；新增术语和概念为 specified/internal，不注册尚无执行来源的归档运行事实或执行契约，不提升知识模型阶段。
- `DEC-0068-12/13/14` 的站内定向生效提醒和双向在审保护保持；`DEC-0063-16` 的作废默认隐藏、证据可达及打印延期保持。本轮联动实现及独立质量结果另取实际证据，不能从归档确认推定通过。
- 当前统计修订切换不等于完整A12交付；失效历史检索UI、规则重建等保留原未决和TODO，历史证据不删除。
- 归档自动执行还是显式操作、具体控件、权限和备份参数属于后续归档切片的工程设计或待确认边界；本记录没有建立第二套封存状态或任意解封许可。
