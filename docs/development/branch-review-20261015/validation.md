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

首轮四例使用真实 Spring Controller/Service 事务代理、实际 StateMachineService/WorkOrderStatusMachine、H2 JDBC 和 DataSourceTransactionManager；Repository 是测试适配替身。无测试外层事务遮蔽真实提交。上述首轮证据不是实际 HTTP、JPA 或 PostgreSQL 运行验收，也不是线程并发测试；后续升级范围单独记录如下。

`-Dexec.skip=true` 仅跳过该后端测试不消费的离线打印前端生成步骤，不跳过测试；本批没有据此声称完整 JAR 打包、打印资源或前端构建通过。当前工作未改 UI/SQL/数据结构，因此没有为这个事务补丁新增视觉或迁移验收要求；全量审查的这些项仍 pending。

## 独立失败后的 JPA 并发整改

首个独立实例实际重跑 55 项后端和 89 项知识校验通过，仍以真实 JPA 诊断查出 QF-W1-001 high。原 [failed 报告](evidence/independent-first-failed/quality-result.yaml)、[复现源码](evidence/independent-first-failed/CloseJpaRaceProbe.java) 和日志保留，不覆盖成 passed。请求 A 普通读取 COMPLETED 后，B 先关闭提交；A 后续 PESSIMISTIC_WRITE 查询复用 JPA 受管实体旧状态，形成两个成功及两条同样审计。行锁并不自动刷新已加载实体。

主侧将五例回归升级到实际 WorkOrder 映射、Spring Data JPA Repository、Hibernate、JpaTransactionManager 和私有 H2；Controller/Service/状态机仍为实际实现。Material/其他 repository 为替身，AuditEventRepository 为替身但写同一事务内实际 test_audit SQL。不是实际 AuditEvent JPA、HTTP 或 PostgreSQL。

修复前生产代码保持 `fbbf6318`、使用新五例执行，结果 **5 tests / 1 failure / 0 errors / 0 skipped**：`concurrentCloseIsAcceptedOnceWithOneAccurateAudit` 期望“只有已完成的工单可以关闭”，实际为 `accepted`。原 XML 摘要/测试源码摘要见 [JPA 红轮索引](evidence/close-jpa-red-case-index.json)，原始日志 `/tmp/edhr-audit-jpa-race-red-final.log`。

随后仅将 close 入口读取改为已有 `findByTenantIdAndIdForUpdate`，先持有同一行锁再做 before 快照，保留外层事务和服务校验。不清空 EntityManager、不改变重复请求规则、不改 cancel 等邻接入口。测试暂停第一请求至第二请求尝试后再放行，要求第二请求按真实 CLOSED 被拒绝，且只有一条准确审计。

第一次升级测试编译时修正了 HibernateJpaDialect 的 vendor 包名；随后移除对已换成真实 JPA 仓储的 Mockito verify，以实际数据库断言验证行为。这两次调试结果不充当业务红轮。首次锁前修复回归还暴露了测试人为暂停 2 秒与 H2 默认 2 秒锁等待相撞，结果为超时错误；已显式将私有测试库 LOCK_TIMEOUT 设为 10 秒，保留第二请求必须业务拒绝的断言，不把锁异常当通过。生产配置未改。调试日志均留在 `/tmp/edhr-audit-jpa-*`；最终结果另存，未冒用中间失败。

含五例在内的六组使用上文相同选择器实际回归，**56 tests / 0 failures / 0 errors / 0 skipped，退出 0，BUILD SUCCESS**，2026-10-15T14:33:19Z 结束；对应代码提交 `4e7fd37500157b4fd055e8a54fe8105f1bf03ae2`。分组为 5/3/17/24/2/5；原 XML 摘要保存在 `evidence/close-jpa-green-case-index.json`，原日志 `/tmp/edhr-audit-jpa-close-green-final.log`。首次独立失败实例不再参与修复或最后验收；修复稳定后创建全新最终质量实例，结果见 `quality-result.yaml`。

## 其他实际核对

- 固定目标 Git 树完整枚举，1,423 路径与 git ls-tree 集合一致，无排除；入口仍候选、迁移仍清单。
- 交接包 17 文件大小/摘要匹配，历史 PR5/PR6 通过记录未篡改、未冒用为新功能验收。
- 知识起点 2,485 定义、候选新增 1 test evidence；DEC-0015 只更新该实现差异处置，规则、成熟度、历史内审 JSON 不变。
- 知识 Maven 校验已实际执行：`bash /tmp/pr6-mvn -B -f tools/knowledge-model/pom.xml test`，89 tests / 0 failures / 0 errors / 0 skipped，退出 0。这是 schema/引用/ID 校验，不是全量语义通过。索引见 `evidence/knowledge-check.json`；独立质量结果在 `quality-result.yaml`，以文件中的实际结果为准。

## 环境与未执行范围

云环境已有 Node/npm、Playwright Chromium、中文字体与 loopback PostgreSQL，可支持后续真实浏览器/视觉检查。本批没有把旧 PR 运行进程当成新 HEAD 服务，也未连接/改动用户 macOS 的原模拟库或上传目录。新上游 startup-commands 的 `/Users/...`、macOS JDK 和端口是其机器的记录，不是这台 Linux 的实测。浏览器联调按仓库统一 3000/8081，开始前先核对占用和源码版本。

本批未做全系统/真实 PostgreSQL/浏览器全链、压力/并发、数据库升级、ZIP/离线打印或发布验收；这些属于后续工作包，并非本次单行事务修复失败的伪阻断。未查询/触发 Actions，未声明分支保护或远端 required checks 通过。
