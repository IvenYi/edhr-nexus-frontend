# 审计读取只读增量：权限证据与全载引入历史

本增量仅补查两点，固定源码/目标基线仍为`e69a8f3d97b34fea8737947c780b047bb0310c64`。未修改产品、测试、配置、知识或数据库，未执行应用测试、浏览器、PG或Actions。原报告`/tmp/edhr-audit-read-source-20261106/`保持原件。本文件不是最终独立质量验收。

## 1. 权限：当前实现事实成立，统一后端政策尚无足够证据

当前`SecurityConfig:49–55`对这些请求要求登录。`AuditController`类及list/getById无`@PreAuthorize`，也无按调用入口、对象归属或菜单的服务端权限判断；`/{id}`直接按审计ID查原事件。代码事实是已登录调用方可请求全局列表与指定ID详情，不能用前端菜单隐藏描述成后端授权。是否符合预期需要明确政策矩阵；本增量未对无权限账户执行HTTP实测，因此不把源码事实写成已跑越权用例。

本次在固定基线的knowledge决策/规则/证据中检索了`system.audit-logs`及审计查询/读取/查看授权表达，并复核相关旧findings、W4范围报告与入口源码，**没有找到足以确认全局列表/原始详情完整后端授权矩阵的现行用户决策，也未找到专门记录这个问题的旧缺陷ID**。此为有限检索结果，不声称全仓永无依据。旧`branch-review-20261026-w4-lifecycle/scope-review.md:9`明确保留“全局审计权限/容量仍未完成”；findings.md:13同样明确当时PG对象审计读取未验证全局权限政策。原`PERF-AUDIT-LIST-MATERIALIZATION-001`是全载/姓名/分页风险ID，不能改用为授权问题ID。

以下已存在的不同入口不能被一条全局菜单权限覆盖：

| 入口 | 已有源码/规范边界 | 本批不能擅自改变的部分 |
| --- | --- | --- |
| 系统→安全管理→审计日志 | 前端菜单`system.audit-logs`；服务端当前仅登录 | 菜单权限是否足够、还需何种数据范围，以及能否读所有实体类型/原始内容，需要明确政策依据 |
| 工单详情的数据审计 | WorkOrderPage:418–424用同一list传WORK_ORDER和对象ID；工单管理API有production.work-orders权限 | 给整个list统一加system.audit-logs会影响只有工单权限的正常内嵌审计；客户端传entityType/entityId本身也不能证明服务端已验证对象权限 |
| 批次详情的数据审计 | BatchManagementPage:270–275传PRODUCTION_OBJECT和对象ID；DEC-0019-02/批次行级审计场景明确保留内嵌入口；批次API有production.batches权限 | 不得为加全局菜单限制而删掉既有行级审计；具体后端如何把对象读取资格映射到共享list仍需合同设计 |
| 个人设置→数据审计 `/me` | AuditController:71–107从JWT userId读取现存UserAccount，固定USER_ACCOUNT+该账户ID；既有测试356–437包含管理员修改当前账户的事件 | 这表示“当前用户作为审计目标”，不是“当前用户作为操作者”；不能改operator_id筛选，不能要求用户具有全局审计菜单权限。共享内部调用list如将来套代理注解还须检查内部调用边界 |
| DHR汇总/填写/审批审计 | 使用专属Controller而非共享AuditController；DhrSummaryController类权限、DhrFillingController类权限、DhrReviewController类权限及task先解→versionAudit边界已有代码；DhrAuditReadTest验证DHR/版本/tenant证据归属 | 不应一并改成system.audit-logs，不能以公共列表问题否定或绕过专属路径资格。旧W1 source-map:13只是这些特定读取的审查边界，不是全局授权已通过证明 |

`ProductionControllerAuthorizationTest`是生产Controller方法注解反射检查，并非AuditController角色矩阵；`AuditControllerTest`为直接controller+mock仓储测试，`/me`对象范围断言也不证明真实JWT/跨角色HTTP授权已全部验收。本增量仅阅读这些既有断言，不冒称本轮执行。

建议登记为**授权政策/验收证据缺口，待W3/W5相邻权限审查补矩阵**，不要在本批分页/动作筛选最小修复里凭菜单名称补一刀切注解。未来矩阵至少分别列：未登录、仅全局审计权限、仅工单/批次原读取资格、本人/me、无对象资格、任意审计ID详情与跨对象/tenant；具体允许/拒绝值须由已有原政策或用户确认决定。本增量不新增具体允许值、不创建虚构旧ID，也不宣告该风险已关闭。

## 2. queryAll原始提交：确切变化可追溯，作者取舍不能推断

`git log -G 'Integer.MAX_VALUE|moduleKeyword|matchesAuditText|queryAll' -- AuditController.java`定位到唯一引入提交：

- **`1ea671cf1da3cff4f3f811ccfec0c44f1c4a86cb`**，2026-06-15 00:40:41 +0800。
- 提交说明只有`feat: add audit and login log management`；未说明选择全载的性能考量、已知数据量或其他替代方案。
- 原始完整相关patch见`history/queryall-introduction.patch`，前后源码和原测试已另存。不是由PR67或本轮引入。

该patch同批发生的确切变化：

1. 旧版`PageRequest.of(page-1,size,...)`+repository返回内容/总数，改为`PageRequest.of(0,Integer.MAX_VALUE,...)`。
2. 新增DTO投影及旧行module/menu/summary派生回退；repository虽新增这三类原字段过滤参数，controller故意传空串。
3. 对全部命中事件先toAuditLogItem，再按resolved module/menu/summary做Java contains，最后subList和filteredItems.size。
4. 同提交新增测试`listFiltersAgainstResolvedDisplayFieldsForLegacyAuditRows`（原文件151–186）：无module/menu/dataSummary的USER_ACCOUNT事件，按“系统”“组织管理 · 用户管理”“组织管理 · 用户管理 #42”查询仍命中。该测试是“旧记录展示值必须能筛选”的直接代码证据。
5. 同提交文档`docs/design-audit/organization-management-ui-standard.md`的审计标准要求条件传给后端分页接口、不只在当前页前端过滤；它没有要求服务端用Integer.MAX或内存分页。

因此可以准确表达：**全载、派生后筛选及旧行展示值回归在同一原始提交引入，旧行筛选需求有明确测试；当前结构用全载保证在切页前完成派生筛选。**不能进一步写成“作者明确为了旧数据兼容选择全载”“这是经过性能权衡后的设计”或“全载是该需求唯一解”，因为提交说明/文档并无这些陈述。仍可在保留旧事件语义的前提下设计数据库投影/分页，这是原报告建议，不是本增量实施。

## 边界与交付

主侧通知本体已确认DEC-0013-03对应action筛选差异为实现缺陷；本增量不重复裁决、不修改存储action，也不评审在途修复。queryAll性能和int溢出沿原历史ID与主侧实测；权限证据缺口单列，不借修小缺陷扩大业务政策。完整来源、原提交patch、检索命令及返回码见本目录manifest与search-results.json。
