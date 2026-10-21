# W3 通用任务客户端有限调用链

固定提交 `c3343f45bb79f72368937f0d197ae01f989f0390`。只读源码辅助，不是正式质量/本体结果，没有修改仓库或执行产品测试、浏览器、API或部署检查。知识版本 `0.3.25 / schema 1.2.0` 仅为交接背景，不代表本实例完成语义审计。

通用任务存在实际路由与调用来源：`router/index.tsx:103` 挂载 `TaskDetail`，`DashboardTaskList:34` 请求本人 todo/done，`:58` 链接同一任务处理页。`TaskDetail:86–96` 对approve/reject/submit直接POST `/workflow/tasks/${id}/${action}`，发送opinion/password；`:67–84`显式转办发送目标和原因。

该通用处理页没有读取任务详情或保存 taskType/nodeType/status/candidate 状态，关联表单/字段权限/审批人区域只是占位文字。`:130–165`同时展示审批通过、退回、转办、提交四按钮，仅按loading或本页面转办成功标记禁用。所以上述动作混用有正常页面入口，不仅来自手工拼URL；但这只是实现现状，不能据UI自行规定后端必须有哪些类型/动作或必签政策。密码框和password请求字段也不能证明服务端已经认证或产生签名，需由主审结合规范及真实后端消费核对。

`api/workflow-tasks.ts` 的七个包装都是GET `/workflow/tasks`，但限定在src的精确模块名导入搜索没有找到消费者；实际TaskDetail绕过这些包装直接调用client。不将未找到静态引用说成动态或外部消费者绝不存在，也不将未使用包装先裁为当前产品运行缺陷。

普通生产与DHR的选定消费链分别保留：ProductionExecutionPage及FormFilling/FormReview worklist都调用`executeProduction`→`/production/execution/{id}/actions`，带revision、operation、form/copy身份；按钮取controls，按配置进入签署/意见。DHR review走`actDhrReview`→`/dhr-reviews/{id}/actions`并带expectedSnapshotHash；DHR filling有`/dhr-filling/{id}/actions`。这些不是通用task操作端口，不把通用页面线索冒充普通生产或DHR已经存在同样漏洞。

同名JSON列出19条有交叉有限范围、11条源码路径及固定Git blob/SHA，`wholeFileReviewComplete:false`、`runtimeExecuted:false`。没有完整文件/模块完成、业务规则变更、运行通过或独立QA结论。没有派发子实例，本实例FINAL。
