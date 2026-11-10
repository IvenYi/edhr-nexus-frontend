# 方案、调用覆盖及健壮性复核

## 原因与最小修改

旧TenantTransferTargets返回List并固定limit100，所有调用方只能显示该批，缺少后续导航。前几轮修复了资格放在SQL限量之后和未使用COUNT，但不等于已有全部人员导航。100不是旧业务人数政策；本轮用户直接要求纠正选择覆盖，DEC-0095补当前定义，旧报告不回写。

本轮用已安装Spring Data3.3窗口，页码1起；每批数据库读取size+1，只返回size并提供hasNext。完整Specification、领域scope及稳定排序在窗口之前，当前捕获时间用于前后资格判断；提交仍重新核验。页码/单批大小校验防止无效请求和JPA offset整数溢出，不构成总结果100限制。未加一套仓储框架、缓存或未消费总数。

WorkflowResponsibilityService仍从已取任务解析originSnapshot，再按原asText产生候选文本。主侧尝试Hibernate6.5 arrayContains遇到未映射String[]类型错误，最终使用现有Hibernate静态SQL片段和一个JSON字符串绑定，jsonb_array_elements_text展开后作精确文本比较。动态内容全部绑定，SQL模板固定；保留00042/+42/空格/非法及超界文本不匹配规范ID、重复候选不重复输出、空候选不变unrestricted。相邻全部原资格测试保留。

FormWorkflowOperations在原可见性查询成功后，扫描当前APPROVAL节点收集不同Long ID，以一个bigint数组查询id/display_name。原name方法只在写入证据链使用，字节保持，不顺带改历史或签署。新私有currentAssigneeNames不与通用流程原文本ID姓名方法合并，返回缺失原ID和历史存储姓名等差异均保留。

## 人员查询覆盖清单

| HTTP入口 | 领域读取链 | 页面入口 |
|---|---|---|
| workflow/tasks/{id}/transfer-targets | WorkflowEngine→TenantTransferTargets | TaskDetail中的转办选择器；其密码签署链保持 |
| workflow/operations/tasks/{id}/transfer-targets | WorkflowResponsibilityService→TenantTransferTargets | WorkflowResponsibilityDialog的记录控制转办 |
| workflow/operations/tasks/{id}/reassignment-targets | 通用/记录控制/DHR的WorkflowResponsibilityService或普通表单FormWorkflowOperations→TenantTransferTargets | 集中流程干预重新分配 |
| production/execution/{id}/transfer-targets | ProductionExecutionService→ProductionExecutionEngine→ExecutionAccess→TenantTransferTargets | ProductionExecutionPage与FormReviewPage |

所有实际HTTP目录和前端消费者同步为分页对象，不保留静默首100人的兼容旁路。测试直接调用只同步为显式page/size/content，旧资格、顺序、数量断言保持；新增后续页覆盖。

其他人员入口源码核对：SubjectSelector.fetchUsers使用size200并循环totalPages；UserPage和RolePage也循环完整页；ReferencePersonSelector使用每批100加lookahead，循环到末页后交SubjectSelector。本轮没有发现这些入口存在总100截断，保留其各自范围和组件，未把转办资格套到主体建模/人员引用。UserPage/RolePage里其他size100调用属于数据审计，不是人员名单；其完整历史导航按原审计队列另审。此清单是相关入口核对，不声称全仓所有未来动态调用已认证。

## UI所有权与验证

单人员转办/改派统一新共享PersonnelTargetSelect，复用MUI Autocomplete和React Query，规范见docs/frontend/personnel-target-selection.md。原SubjectSelector承担多主体建模并已有自己的全页机制，语义/接口/选择模式不同，不强行合并。四处旧重复请求、搜索和加载状态随迁移移除，原提交、签署和通知留在各自编排中。

每次搜索使用独立查询键，未选文本与已选实体分离；输入新搜索清旧选择，IME期间不发请求，清除立即执行，网络接收signal。瞬时搜索不放URL和持久存储，关闭不保留名单缓存。加载/重试按钮在输入框旁侧，与弹层错开，并预留相同宽度避免换页末尾跳动；结果弹层保持MUI键盘和滚动行为。新增清除按钮只覆盖未选择实体的搜索文本，选中实体继续用MUI原清除。

没有重设DESIGN.md或App主题。既有列表/弹窗规范及App.tsx MUI token优先于知识工作台局部示例；新控件继承字体、颜色、边框，不修改全局滚动或生产弹窗祖先。浏览器覆盖两个实际页面/弹窗及两条真实API适配器；后两项不是完整生产执行/审批列表页面E2E，完整账号/签署矩阵仍在原队列。

## A23与具体拆分边界

- 保留原资格、提交重核、锁下重读、revision、签署、原因及同事务审计；名单已过滤不能代替提交保护。
- 原目录后置available与SQL条件的具体重复仍属旧A23队列，本轮不以减少重复为由删除写入复核或共享规则。
- 新增page/size参数检查只约束单请求及provider offset能力；没有任意总人数上限、静默截断、无限自动重试、全租户缓存或兜底授权。
- 单数组绑定复用已有候选文本，不重复查询；姓名只取当前涉及ID的两列。前端分页继续由用户明确触发，不一次全量预取，也不把服务器第一页当完整集合做内存分页。
- 本轮完成小型私有姓名方法和共享选择组件抽取；FormWorkflowOperations后续可按projectNodesAndCurrentTasks/projectEdges/projectHistory分离纯投影，必要时形成FormWorkflowReadProjection。可见性读取门禁仍在领域入口，reassign/requireActive及work_order→production_object锁、签名、history、审计仍由原服务同事务拥有。逐方法迁移并以当前输出/任务摘要/来源回归保护，不只统计行数、不建第二套执行引擎。

## 交付与剩余范围

主侧177及11浏览器、构建、格式和共享控件静态检查为当前切片证据；原错误/中间绿轮各自留存，不能当最终独立质量或累计覆盖。仓库ESLint缺配置保留工具缺口；新控件额外采用推荐规则聚焦检查，不伪称全仓lint。全仓premium86既有诊断没有新增，未因本批移除旧队列。

待全新最终质量后有限关闭姓名N+1、原候选参数增长及人员总100截断；文本ID计划/索引按用户意见保留。全审W2-W7/931/86、高风险/A12、完整权限账号/通知收件人/ACL并发/签署及其余性能队列继续。每轮先fetch最新目标与增量，不自动合并、部署、恢复历史或清理孤儿。
