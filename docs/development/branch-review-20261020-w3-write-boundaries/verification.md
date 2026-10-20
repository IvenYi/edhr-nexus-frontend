# 本批验证入口与边界

使用已验过的 JDK21/Maven3.9.11 与项目现有依赖；没有安装/锁文件改动。所有数据库只指向自建 PostgreSQL16.15 的 localhost:55432，三个数据库均为合成夹具库。容器仅本轮使用，独立验收结束后删除；不使用原业务库或历史上传数据。

```bash
W3_TEST_DATABASE_URL=jdbc:postgresql://localhost:55432/edhr_w3_write_test \
W3_TRANSFER_DATABASE_URL=jdbc:postgresql://localhost:55432/edhr_w3_transfer_test \
bash /workspace/.edhr-cloud-tools/mvn-edhr -C -f gmp-platform/backend/pom.xml \
  -Dexecution.test.driver=org.postgresql.Driver \
  -Dexecution.test.url=jdbc:postgresql://localhost:55432/edhr_w3_execution_test \
  -Dexecution.test.user=edhr \
  -Dexecution.test.dialect=org.hibernate.dialect.PostgreSQLDialect \
  '-Dtest=WorkTemplateWriteBoundaryTest,WorkTemplateControllerTest,WorkTemplateWritePostgresTest,WorkflowTransferPostgresTest,WorkflowEngineTest,WorkflowTaskControllerTest,ExecutionAccessTest,ExecutionSubjectScopeTest,ProductionExecutionEngineTest,ProductionExecutionIntegrationTest#formApprovalTransferMovesPendingTaskWithoutAdvancingTheFlow+transferProjectionIsNodeScopedAndReassignmentIsClearedByReturn+tenantDelegationOutsideFrozenCandidatesPreservesSourceAndMovesOnlyCurrentResponsibility+transferRechecksTheSelectedTenantUserWhenTheirAccountBecomesLocked,DhrReviewLifecycleIntegrationTest,DhrReviewServiceTest,AuditEventTest,FormFillSettingsServiceTest' test

bash /workspace/.edhr-cloud-tools/mvn-edhr -C -f gmp-platform/backend/pom.xml -Dtest=BusinessKnowledgeModelTest test

cd gmp-platform/frontend
npm run build
NODE_PATH=/workspace/.edhr-browser-tools/node_modules CHROME_PATH=/usr/bin/chromium \
  W3_RESULT_PATH=/tmp/edhr-w3-independent-browser.json \
  W3_SCREENSHOT_DIR=/tmp/edhr-w3-independent-screenshots \
  node scripts/test-tenant-task-transfer-browser.mjs
```

主侧最终292项以运行时新生成的Surefire报告提取安全计数/用例名/文件SHA，不归档原始XML或MockMvc/Maven日志。知识89单独计，不将重复运行相加。一次失败的局部清理尝试在编译前终止，旧XML被明确标为不可采信，源码恢复后重新12项通过。浏览器脚本是真实页面、主题、Router、QueryClient、共享组件和真实client配合受控API；不是后端/数据库全栈。

红证：固定a828上运行同一图写测试85项为63失败/22正向；真实PG12项为9失败/3正向。首次JavaTime/虚构unique-current夹具问题与最终采用实际0060约束的结果分别保留。真实PG并发在加refresh之前22项中1项失败，显示两个旧处理人请求均成功；最终23项包括旧候选完成等待竞争均通过。

审计摘要额外探针故意按a828读取后重算，2项均失败；原件在failed-probe-fixtures.zip。它是W5真实跟进项，不是本轮通过用例，不计入292。现行应用不以AuditEvent重算结果阻断本轮动作。不得删除失败原件或宣称重算已通过；若独立复核发现当前修复引入的审计异常，则正常报告阻断。

官方premium原脚本和精确base/candidate比较见evidence/primary，各82finding完全相同，strict均exit2；lint实际exit2（既有缺配置）。这两项只能给出无新增/既有限制，不能写成全站静态检查通过。没有更改扫描配置或断言。

本批没有迁移新增/修改。图写测试加载真实0060的单草稿/FK约束；通用PG夹具自建有限合成表与审计故障trigger，不能据此声称全部Liquibase历史或创建候选解析端到端通过。DHR回归保持原H2兼容模式，通用入口拒绝DHR由真实PG另验。
