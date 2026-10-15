# 本批验证与证据边界

代码修复提交 `292dd898`；初始目标 `537bb2402227bfe6369c44c2b1b4686481c50f27`，随后普通合并文档目标 `e9c00df8c85b021e7bf206e575a5a726cd46c12b` 形成 `aad4cfe9445a82658c1113de73c9c3561af566d5`。三份上游文档未改变后端或知识字节，主侧测试原始时点和独立验收实际候选分别记录，不冒充同一次运行。

## 可复现的红绿回归

环境为 JDK 21、Maven 3.9.11；`/tmp/pr6-mvn` 是此云环境的 JDK/官方 Maven 启动包装器。设置文件及代理信任材料在仓库外，不提交、不输出。可在正常 Maven/JDK21 环境将 `bash /tmp/pr6-mvn` 换为 `mvn`。

修复前将新增测试置于原生产代码 `537bb240`：

```bash
cd gmp-platform/backend
bash /tmp/pr6-mvn -Dexec.skip=true -Dtest=WorkOrderCloseAtomicityTest test
```

最终红轮为 4 tests / 2 failures / 0 errors / 0 skipped。失败均是 expected COMPLETED but was CLOSED：审计持久化失败及 JSON 序列化失败后，工单已单独提交。成功和非法状态两例原本通过。保留 [红轮用例索引](evidence/close-red-case-index.json) 及原 XML SHA256，原始本地日志 `/tmp/edhr-audit-close-red-final.log`；未用后续绿轮覆盖红轮证据。

增加唯一生产代码变更 `WorkOrderController.close` 的 `@Transactional` 后实际执行：

```bash
cd gmp-platform/backend
bash /tmp/pr6-mvn -Dexec.skip=true -Dtest=WorkOrderCloseAtomicityTest,WorkOrderControllerTest,ProductionServiceTest,DhrSummaryPersistenceTest,DhrInstanceLookupTest,DhrReviewLifecycleIntegrationTest test
```

结果 **55 tests / 0 failures / 0 errors / 0 skipped，退出 0，BUILD SUCCESS**。分项：关闭原子性 4、工单控制器 3、生产服务 17、DHR 汇总持久化 24、实例查询 2、DHR 审核生命周期 5。各用例名及原 XML 摘要见 [绿轮索引](evidence/close-green-case-index.json)。原始日志 `/tmp/edhr-audit-close-green.log`，原 XML 已复制到 `/tmp/edhr-audit-evidence/close-green`，不将含环境 properties 的完整 XML 放进仓库。

四例新增测试使用真实 Spring Controller/Service 事务代理、实际 StateMachineService/WorkOrderStatusMachine、H2 JDBC 和 DataSourceTransactionManager；Repository 是测试适配替身。无测试外层事务遮蔽真实提交。断言审计两类失败回滚、成功前后状态及长整型字符串操作者、非法状态无写入。不是实际 HTTP、JPA 或 PostgreSQL 运行验收，也不是线程并发测试。

`-Dexec.skip=true` 仅跳过该后端测试不消费的离线打印前端生成步骤，不跳过测试；本批没有据此声称完整 JAR 打包、打印资源或前端构建通过。当前工作未改 UI/SQL/数据结构，因此没有为这个事务补丁新增视觉或迁移验收要求；全量审查的这些项仍 pending。

## 其他实际核对

- 固定目标 Git 树完整枚举，1,423 路径与 git ls-tree 集合一致，无排除；入口仍候选、迁移仍清单。
- 交接包 17 文件大小/摘要匹配，历史 PR5/PR6 通过记录未篡改、未冒用为新功能验收。
- 知识起点 2,485 定义、候选新增 1 test evidence；DEC-0015 只更新该实现差异处置，规则、成熟度、历史内审 JSON 不变。
- 知识 Maven 校验已实际执行：`bash /tmp/pr6-mvn -B -f tools/knowledge-model/pom.xml test`，89 tests / 0 failures / 0 errors / 0 skipped，退出 0。这是 schema/引用/ID 校验，不是全量语义通过。索引见 `evidence/knowledge-check.json`；独立质量结果在 `quality-result.yaml`，以文件中的实际结果为准。

## 环境与未执行范围

云环境已有 Node/npm、Playwright Chromium、中文字体与 loopback PostgreSQL，可支持后续真实浏览器/视觉检查。本批没有把旧 PR 运行进程当成新 HEAD 服务，也未连接/改动用户 macOS 的原模拟库或上传目录。新上游 startup-commands 的 `/Users/...`、macOS JDK 和端口是其机器的记录，不是这台 Linux 的实测。浏览器联调按仓库统一 3000/8081，开始前先核对占用和源码版本。

本批未做全系统/真实 PostgreSQL/浏览器全链、压力/并发、数据库升级、ZIP/离线打印或发布验收；这些属于后续工作包，并非本次单行事务修复失败的伪阻断。未查询/触发 Actions，未声明分支保护或远端 required checks 通过。
