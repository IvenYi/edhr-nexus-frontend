# W3 命令类型、状态与处理权源码核对（只读辅助）

固定来源、目标、契约 `c3343f45bb79f72368937f0d197ae01f989f0390`；知识 `0.3.25 / schema 1.2.0`。本实例是源码辅助，不是正式本体或质量验收，未修改仓库、未运行产品测试。42个有限源码/规范/断言范围、16条路径，另有子辅助19个前端有限范围。范围有交叉，不是61个不同方法或整文件完成。

## 可优先运行验证的一项局部候选

`W3D-TASK-PAGINATION-001`：`WorkflowTaskController.todo`（86–103）和`done`（105–124）直接以int计算`(page-1)*size`和`start+size`，随后`subList`，没有参数正数和溢出保护。非空队列下`page=0,size=50`得到负起点；完全正数的`page=2147483647,size=2`也得到int起点-4和终点-2。`GlobalExceptionHandler.handleGenericException`（80–88）会将该未处理列表异常变成HTTP500。源码与整数控制流证据成立，尚未执行真实HTTP复现，不以此冒称运行缺陷已验收。

建议主侧用真实认证的MockMvc请求建立非空队列，覆盖todo/done的零/负分页、正数乘法/加法溢出、正常首页/后页/超出末页。最小工程修正只应要求正分页并采用long边界后安全转int，保持现有排序、身份与只查询一次；不自行增加任意最大页长或业务权限。当前47项finding有限检索没有发现同项，未做全历史语义去重。

## 本轮核对后保留的保护

`completeTask`先按实例→任务加锁并refresh，再要求实例RUNNING、任务PENDING/PROCESSING，检查当前top-level候选、unrestricted或legacy assignee。委托后的originSnapshot只作为来源，不进入当前处理资格；PR20锁/委托修复不重开。任务或实例终态拒绝后续完成，DHR必须通过`completeDhrTask`专用分支。

`handleRejection`先终止其他活动任务；DHR或有并行拆分祖先时结束本轮，顺序generic路径选择首个入边前节点或终止。实际源码反证“退回后其他分支仍活动”的猜测，不能据未读控制流报告新缺陷。并行汇合、深层退回及候选拒绝的既有测试断言已读，未运行。

待办/已办使用认证主体覆盖旧assigneeId参数。todo根据活动任务及当前assignee/候选/open marker，done根据实际处理人和终态；通用todo/done排除DHR。SQL没有分页，是控制器完整列表切片，这也是本候选所在层。未证明完整多租户隔离，它仍为明确非MVP未决。

## 动作矩阵只形成有限线索，不替代业务决定

generic控制器三个完成HTTP端口分别传APPROVE、REJECT、SUBMIT常量；`completeTask`没有统一按taskType/nodeType的动作矩阵，`resolveTaskStatus`对未知字符串默认COMPLETED。但是固定main/java搜索没有任意action参数直传此方法的外部调用；未知action目前是内部防御性线索，不是已证实HTTP绕过。

真实客户端并非完全没有入口：路由tasks/:id挂载TaskDetail，Dashboard待办链接过去。页面未GET任务元数据，四个动作按钮同时显示，仅按loading或本页转办成功禁用；完成动作直接POST到上述端口。因此按任务种类混用动作有正常页面入口；但“这些动作对generic各task/node类型的规范矩阵是什么”仍缺独立明确依据，不能仅以UI按钮、命名或生产表单规则发明新政策。

普通生产表单走`ProductionExecutionEngine.formActionInternal`及`/production/execution/{id}/actions`，它根据当前controls按钮和资格拒绝非法动作。DEC-0023及`rule.form-process.node-button-configuration-v1`的START保存/提交、APPROVAL审批/退回/转办规则属于这条路径。DHR也有自己的审批端口、按钮、签署与证据校验，完成时才调用专用engine wrapper。不能直接把这两条路径的规范套给generic占位任务页，也不能把其REJECT英文名当作普通表单存在额外拒绝业务动作。

generic `createInstance`在固定main/java检索中仅有声明，没有已集成生产调用者；记录控制显式启动端口存在，但公开控制器只GET候选，申请确认/动作/结果落地在DEC-0042中仍未实现且用户暂缓。管理员裸CRUD可制造任意实例/任务是另一内容治理边界，不能以此伪装真实合法生产创建链已经证明。

当前任务是否属于实例currentNodeIds和当前版本没有额外显式校验，但正常创建/推进/退回/终态路径尚未发现可达的活动旧节点任务；任意管理员修改不在本批自行封闭。将此作为源码线索保留，不冒称已裁定高危漏洞。可选signatureId也不推出generic统一必签政策，普通生产与DHR签署各自保留。

## 子实例与来源

只读前端辅助 `/root/w3d_command_source/front_action_consumers` 已返回FINAL，未派其他子实例、未修改仓库或运行测试。原件 `/tmp/edhr-w3d-front-action-consumers.json`、`.md` 的精确SHA/字节回执在本map中。其19条范围与当前主map分别保留，不把UI检查变成正式运行验证。

本报告不输出qualityResult或ontologyResult，不宣称全W3、全文件或完整分支审查完成。PR21合并后的实例权限修复及PR20委托/锁原处置保持。后续由主审裁定是否以新测试确认分页候选，并将真实业务歧义与无依赖源码审查分开推进。
