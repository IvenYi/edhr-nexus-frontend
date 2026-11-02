# 记录控制候选读取的本轮确认

2026-11-03，根主方在整体闭环检查中向用户说明：公共候选查询仍要求 `record-control.corrections.create` / `record-control.voids.create`，与当前记录控制申请按认证访问的边界没有完全收敛；询问是否本轮对齐候选读取为 `isAuthenticated`，申请及审批资格保持。

根主方转达的用户答复：**“本轮一起对齐并验证（推荐）”**。

该确认结束的是 `DEC-0087-07` 及 `discrepancy.record-control-v1-workflow-permission-mismatch` 中候选读取协同的局部暂缓，不是新增岗位、角色或模板授权，也不是允许任意账号审批。匿名请求仍拒绝；菜单继续按权限显隐；来源资格、当前有效修订、活动申请约束、实际签署身份、签名和审批任务数据范围均保留。

本轮原始基线：本地 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad` 加工作区差异，目标 `8ec8391721858a7f96d73a5d293d93f43679118a` 未合并；知识 `0.3.25`。

`DEC-0094` 记录已确认范围。主方负责 `RecordControlWorkflowController` 与聚焦方法安全／HTTP验证；本体不把方案确认或测试源码存在记为运行通过。最终验证及独立质量由本轮 `docs/development/workflow-record-dhr-closure-20261102/` 原件说明。

本轮已原始读取控制器的 `@PreAuthorize("isAuthenticated()")`、新增 `RecordControlCandidateAuthorizationTest` 及主方当前原 sure-fire 文本：3 项通过、0 失败、0 错误。该测试使用真实 Spring 方法安全代理，业务端口为 mock，仅证明认证读取边界和类型拒绝；不是数据库或浏览器全链。根主方真实页面已复现候选403基线，修后申请后续曾推进到批准数值类型问题，失败与修后整链分别留证，不把这段部分进展等同于完整 E2E 通过。
