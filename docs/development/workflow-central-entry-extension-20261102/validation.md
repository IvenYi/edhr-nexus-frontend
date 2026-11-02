# 普通表单与 DHR 集中流程扩展验证

执行级别：L2。当前验证候选为本地 `edhr-dev` 的 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad` 加本功能未提交差异；不代表已集成远端 `8ec8391721858a7f96d73a5d293d93f43679118a`。远端契约增量为空，远端 DhrReviewService 对象补取失败，保留该集成边界。

## 已执行

- 隔离 PostgreSQL：`edhr_record_control_test_central_20261102`。显式环境变量通过测试类的库名白名单；没有对 `edhr_dev` 执行这些测试。
- `RECORD_CONTROL_TEST_DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/edhr_record_control_test_central_20261102 PGUSER=ivenwang JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home mvn -q -Dtest=RecordControlPostgresIntegrationTest test`：31 项通过。包含新增的 DHR 改派、表单改派、同源分页、业务可见范围、资格/签名拒绝、过期提交、竞争和审计失败回滚；也覆盖原变更/作废、转办、受限撤回及 DHR 联动回归。
- `ProductionExecutionEngineTest,ExecutionAccessTest,DhrReviewServiceTest,DhrReviewLifecycleIntegrationTest`：22 + 13 + 12 + 6 = 53 项通过。与上述 PG 测试曾联合执行；最终仅重跑修正提示顺序后的 PG 类，其余领域代码未变更。
- 最终本体资产的 `mvn -q -Dtest=BusinessKnowledgeModelTest test`：89 项通过。
- 前端 `npm run build` 通过；`npm run verify:list-table-style` 通过。
- `scripts/test-workflow-list-ui-browser.mjs`：40 项通过（1440 / 390 两种宽度）。使用真实维护的列表、详情、签名弹窗、DHR 审计组件、主题、API 客户端，API 为拦截合成数据；验证表单前缀身份、两种业务类型、签名必填、请求、图标、列设置、精确表单份审计过滤、审计中文显示与相邻列表回归。

报告保存在 [evidence](evidence)，浏览器结果为 [ui/result.json](evidence/ui/result.json)。这些不是主开发库写操作的浏览器端到端验收，也不是用户人工验收。

## 当前边界

- 不新增数据库迁移，不新增 DHR 处理人转办、撤回、归档或作业/工艺路线流程。
- 普通表单只投影已有持久化实例及运行流程；不为未保存表单或没有流程节点的旧数据补造运行记录。管理员改派只针对当前审批节点；填写权限保持既有规则。
- DHR 仍通过专属服务审批、退回和校验冻结证据；集中列表只聚合读取及调用受控责任变更。
- 正常开发库现有人工验收样本不复位。本次自动化数据写入均位于隔离库。
- 独立质量结论另见本轮 `quality-result.yaml`；没有该结论前不宣告交付完成。
