# PR75 合入后的记录变更异步审查

已交付 [PR76](https://github.com/IvenYi/edhr-nexus-frontend/pull/76)，`audit/edhr-dev-record-change-async-20261110` → `edhr-dev`。登记前实际观察 OPEN / MERGEABLE / CLEAN，本地/真实远端/PR head均为验收提交 `35c96d328476f83fe89deee573ef082ef89b13c0`，27输入仍同受测字节，见 [交付核验](evidence/delivery-verification.json)。此后仅L0登记，推送后再次核对；建议按本批异步归属修复范围人工合入，不把残余问题或整体审计一并关闭。

L2，目标 `edhr-dev@8be9b78b41644693864a9429b5c5741d18d52edf`。PR75 已合入，整树与上次交付 `a6be4f07` 相同；没有额外产品、知识或契约增量。本轮按原 W3/W7 记录控制页面及 W6 健壮性/A23 队列，落实上批明确保留的异步源码信号，没有重新收尾旧 PR。

已修正 `RecordChangePage` 两类确定问题：较早的表单查询/提交后刷新会覆盖较新的查询结果、错误或加载状态；较早的流程候选响应会覆盖当前模式或来源的候选/错误。页面现在只接受当前上下文的响应，并区分候选加载中与真正空结果。沿用现有 `ConfirmDialog` 保留放弃未提交草稿的确认，取消保留原草稿；IME Enter 不查询，手工 Enter 阻止默认事件，避免打开确认后同一次键盘事件误触取消。

仅一个产品页面、一个专用组件浏览器脚本和决策包；后台、API、schema、权限、签署/幂等/修订/审计政策、知识、共享弹窗和视觉 token 均未修改。不自动选择流程版本，不自动重试提交，不实施待答复的性能方案。

受测候选 `7e43939b519b743e73ca993d66632b1316655fed`。主侧新场景 **26/26**、相邻浏览器 **58/58**、build/list-style/font 通过；同一最终脚本指向未修改的旧 8be 工作树 **26 项均失败**，这是症状矩阵，不是 26 个独立缺陷。主侧 26/build 发生在提交前 dirty8be，后续相同暂存字节提交为 7e；58/static 实际在 clean7e 运行。独立实例的真实运行和来源以其最终正式报告为准，不改写历史运行 HEAD。

- [缺陷、规则与健壮性核对](review.md)
- [验证范围与失败历史](verification.md)
- `ontology-result.yaml` / `ontology-review.md`：有限语义及来源核对。
- `quality-result.yaml` / `independent-review.md`：全新独立实例最终质量结论。
- `evidence-packages.json`：三份原件 ZIP、逐成员 SHA-256 与角色清单。
- `pre-pr-drift-review.md`：全部实例 FINAL 后实际执行的范围/阶段复核。

既有 strict **86 = 72 violations + 14 unresolved**，与目标的差异为 0，保留重复项数量逐项比较；lint 仍缺配置、exit2，没有全站静态绿。知识353文件/2848资产是清单口径，不能与旧931子集计算完成率。整体 W2–W7、全量知识语义、UI86、A12/高风险/完整矩阵、A23含已审回看、容量/UNKNOWN及用户暂停项继续；本批整文件完成0，历史唯一完成量未知。

另保留候选当前503错误在提交Dialog背后、Dialog仍显示空态的既有问题，下一轮优先局部整改；本轮测试不证明弹窗内错误反馈/可访问性全过。

下一轮先 fetch 真实合入和新增。记录列表资格 SQL 与审计事件 DB 分页仍未答复、未实施；候选版本服务循环查当前版本仅为新源码信号，先去重、量化和讨论。用户暂停的通用任务签名密码页和生产弹窗样式保持暂停；不自动 merge、部署、恢复或查询/触发 CI。
