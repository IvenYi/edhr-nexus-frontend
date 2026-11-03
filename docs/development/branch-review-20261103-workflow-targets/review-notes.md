# 有限源码与边界核对

缺陷F-TARGET-LIMIT影响普通表单及DHR管理员改派目标列表。调用为Controller→FormWorkflowOperations.targets或WorkflowResponsibilityService.reassignmentTargets→TenantTransferTargets.search。原搜索只在DB限定租户、ACTIVE、锁定和关键词并取前100，领域随后逐人查询权限；因此结果可为空，而范围内实际上存在有权目标。新两例使用真实应用代理/完整Liquibase/自有PG，120无权前置用户和43号真实双权限目标同关键词，另4个单权限用户不能冒充合格。

修复在人员目录的四参search增加必需权限集合，每码独立EXISTS且AND，支持权限分布于不同角色及重复授权；这与原Form两个permission AND、DHR count(DISTINCT code)=2等价。三个参数的普通转办仍传空集合，没有新增权限要求。当前处理人排除提前DB限量前，原后置available/排除逻辑保留；未在本次顺带清理旧代码。两个领域读者去掉逐人权限查询；实际提交仍调用原qualified/eligible，不能相信过期名单。没有缓存、规则配置框架、额外fallback、迁移或索引。

## A23与提取

| 方法范围 | 结论 | 处置 |
| --- | --- | --- |
| 人员tenant/status/lockedUntil | 现有可用性，不由权限存在替代 | DB保持；旧后置同字段检查有重复信号，本批不混做无关清理，W6再核 |
| requiredPermissions的AND EXISTS | 既有两码资格，过滤要先于取100 | 共享目录封装，无页面条件分支或新业务开关 |
| 写入qualified/eligible/expectedTaskState | 读取后可能变更，最终动作要重核 | 保留，不能当过度防御删除 |
| 原因/实际签署人/会话管理权/事务审计 | 已确认责任变更契约 | 保留全部旧校验与原子写入 |
| candidateSnapshot/originSnapshot/transferAssignees | 原候选依据与当前目标是两类事实 | 不重建运行任务，不改冻结、节点或内容 |
| 记录控制/通用改派的旧候选后过滤 | 不是本次新DHR/Form双权限路径 | 仍有先100后冻结候选过滤的静态候选，另加原生用例，不冒称全部目标列表已修好 |

后续具体拆分方案：FormWorkflowOperations的source/detail/节点历史投影可抽取FormWorkflowReadProjection，owner为集中只读投影；targets/reassign保留领域写编排，读取上下文与锁下重读分开。写入口必须继续work_order→production_object锁序、revision/状态再核、原approvers保留/current transferAssignees变更、签名+结构化历史+领域审计同事务。先以当前44原生及ordinary-transfer/访问回归作保护，再逐方法移出纯投影，不能以通用执行引擎或第二套任务替代。回滚仅恢复委托调用/方法，不回写既有实例。当前只做小范围人员资格封装，未实施大模块重构。

WorkflowResponsibilityService未来可把DHR/记录控制领域资格与审计贡献抽成独立领域策略；通用状态、锁和签署编排保留一个owner。必须先固定各域拒绝路径/身份及原候选来源，再抽接口，不能把DHR禁止本人转办等边界折叠成一个布尔默认。此为方案，不是新增运行框架。

## 性能与索引

本修复由真实漏列驱动，消除两新领域读取中逐用户权限COUNT；写入对单一目标的即时查询保持。仍是DB有界最多100人，不把全部租户/全部有权用户加载到内存。没有承诺精确SQL总数或延迟；尚未做独立请求计数/大数据压测。既有user_role(user_id,role_id)、role_permission(role_id,permission_id)及permission(code)唯一索引可承接EXISTS连接；未加索引，不据小样本断言所有生产分布均高效，后续计划须在完整索引/混合数据EXPLAIN ANALYZE。

新增集中列表虽然在SQL执行COUNT/LIMIT/OFFSET，不是Java内存分页，FormWorkflowOperations的JSON lateral/数组展开仍可能随记录及父执行快照变大而重复解析；管理员全量可见场景需测大量表单份/宽父JSON。WorkflowOperationsQuery.detail仍逐任务查询处理人名，任务历史增长会形成N+1；Form detail对当前任务也逐个name查。已有上下文提供ID但未批读名称，可作为有限投影改造方案，先量化讨论。汇总5+2N/605和导出数组/PDF累计是另有证据的剩余项，未由本次目标修复关闭。

## 界面增量有限复核

维持DESIGN.md及docs/frontend/list-page-guidelines.md等现有规范，普通列表/表格由ListTableShell/listTableStyles及列设置owner，详情由DetailDrawer，责任动作复用WorkflowResponsibilityDialog/FormDialog/SnackbarProvider，MUI提供控件及主题。read-only核当前types、带前缀实例/任务ID编码、任务选择、权限隐藏、错误/加载/重开状态和领域审计映射；没有新设计令牌或页面组件实现。

实际运行维护浏览器40场景与构建/列表规范，仅有合成API响应；并查看实际截图。全仓strict扫描86原始候选保留为failed/unresolved诊断：68 actionless模式、3 noValidate、1 scrollbar及14 native-select ownership声明缺口，未逐项判定，不计86产品缺陷。增量14前端路径中只命中RecordRequestListPage已有分页native select；本次修复没有前端差异。完整UI合同/键盘/账号矩阵和候选逐项核查留在W6/W7，不能因40场景通过或静态匹配自动认定全审完成。
