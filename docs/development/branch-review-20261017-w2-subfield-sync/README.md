# W2 第五批：子列定义与当前画布同步

PR13 已人工合并。合并提交 `0e16363e9fc1ccb876d6ef96a1b15dc1c9cc145d` 的 tree 精确等于批准交付 `6d4cd54fb721e6fb8df7d7d96e77380b6edc697c`。本批先拉取最新 edhr-dev，以后续导航修复 `37bc05ec268d1e0d2faf105c2f1c449caeb7ed46` 为来源、目标及契约读取基线，无契约/知识/设计规范漂移。导航源码增量只有 AppLayout 三行；本批实际重跑其 8 项测试。

交付 [PR14](https://github.com/IvenYi/edhr-nexus-frontend/pull/14)，目标 edhr-dev，等待用户人工合并；未部署或恢复历史数据。独立实际受测提交仍为下述845b3a7f，后续只登记L0报告/证据及本链接，不把交付提交冒充另一次运行验证。

本批为 L2，承接原 W2-C002 线索。正常放置子表字段后，在字段设计中把同一子列从“旧编号/文本”改为“新数量/数字”，model.columns 已改变，画布、模拟填报及完整纸面仍读旧 embedded subTableField。实际 ModelTab 编辑弹窗→模拟填报复现同一问题。根因是 updateField(parentId) 的同步函数只匹配 fieldId===parentId，而子列组件绑定 fieldId===childId。

生产修改仅在 store 的既有 syncBoundNodesForField 内补父表/子列 ID 匹配，同步当前 placement 的字段副本、label 和兼容控件类型（13 行新增、5 行删除）。有效 widget 覆盖保留，类型不兼容沿既有主字段规则清理。节点/字段/投影身份、布局和 readonly/required/hidden 保持；列 status 仅同步元数据，不新增停用即隐藏或删除规则。沿用一次完整 document 的历史事务。没有读时换最新模板、旧文档迁移或历史冻结回填。

## 实际证据

- [固定清单](coverage.csv)含基线全部 1894 条路径/blob，全部 pending / inventory-only；[方法映射](source-map.md)单独列明亲读范围，不把清单当成审查完成率。
- 同一最终测试对原 Git store 重放：新增 7 项中 6 失败、1 canonical 列表正对照通过，0 跳过。真实旧版 UI 在首个 1440px 场景到达模拟纸面后因旧名称失败；没有把未执行的 390px 计为旧版失败。
- 最终候选主侧 109 Node、9 Chromium 均通过，0 跳过；tsc/Vite 构建通过。7 项新 store/SSR 用例及两个新 UI 场景覆盖改名/改型、兼容覆盖、身份/布局、跨页/递归、一次撤销重做、客户端序列化和实际保存回调载荷。其余相邻回归保留。
- [本体角色原始结果](evidence/ontologyResult.yaml)：not-applicable，知识 0.3.25 / schema 1.2.0 不变，无冲突/问题。DEC-0077-12/22 的使用时冻结和同一画布/保存/撤销边界保留。
- 全新未参与任何修复的实例对冻结候选 `845b3a7f067e6d0fb54f77b73dcc8b3024d94f82` 返回正式 [qualityResult: passed](evidence/independent/qualityResult.yaml)：11 项必需检查全部通过、blockingConditions 为空，实际独立重跑同组 109 Node、9 Chromium 和完整构建。主侧与独立运行不累加为 218 个覆盖；[primary-result.json](evidence/primary-result.json)仍保留主侧原时点结果。
- 独立唯一 low `W2-QF-001` 为本批 source-map 的 Shell 文件名遗漏 React；已在 `2ae06d4aed42aa8c7d449fbcd86038eb5c8240dd` 按 L0 更正并由原独立实例正式确认 resolved，见 [L0补充复核](evidence/independent/l0-document-review.yaml)。原始质量报告保留当时 open 状态，处置记录见 [delivery-receipt.json](evidence/delivery-receipt.json)。验收后的修改只限报告/台账/证据，不改产品、测试、知识或工具。

浏览器使用真实 Shell/ModelTab/Canvas/MUI/store；catalog GET 和保存回调为受控替身，不证明后端 HTTP/JPA、认证、签署或真实客户试用。390px 证明本场景可操作，不等于触屏或完整移动端适配；固定纸面在窄视口仍需滚动，截图不构成全站视觉通过。

## 保留限制与下一步

本轮主侧及独立 npm lint 均因既有 ESLint 配置缺失退出 2；`verify:template-designer-react` 因现存 vendor/online-form-designer 退出 1，未移动或删除缓存规避检查。主侧验证时官方 premium 临时脚本不存在、原 package 不可读且技能目录为空；decisionPackage、primary-result 和 environment-limitation 保留该时点原记录。独立实例随后恢复读取官方 1.4.0 原脚本并实际重跑 base/candidate：strict 均退出 2，各 84 项（71 violations、13 unresolved），完整 finding multiset 精确相同，新增/移除均 0，修改 store 命中 0，见[原始比较](evidence/independent/premium-comparison.json)。这是本轮新证据，不沿用历史次数；全局 strict 仍未通过，局部模式核对也不能代替官方扫描。

不自动修复已经保存的不一致模板或生产快照。PR5/6 不重开，A12 表单变更/作废及两项旧 DHR high 依用户决定暂缓并保持 open。本批不完成全部 W2。下一检查点按 [持续台账](../branch-review-20261015/NEXT.md)核对剩余 W2 条件/fillMode 与保存重读消费链，再推进 W3。大模块沿 S04 的具体拆分边界记录在方法映射，本批不实施重构。不得自动合并、部署或恢复历史数据。
