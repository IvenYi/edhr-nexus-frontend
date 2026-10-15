# W1 首次 START 配置竞争验证

目标仍为 `edhr-dev@6379bf105127b05a65695992b008b55c142264f9`，开发来源 `31a8074a8962da66b2c4e49f4bf5a1a92724bfa0` 加本批差异。上一检查点的25项主侧测试及首批独立56/89保留原提交与范围，不代替本次运行。

## 确定缺陷与修复边界

真实 PostgreSQL 16.15 的修复前红轮：1项运行、1失败、0 error/skip。START 读完旧制程上下文后，另一事务提交合法新制程父子配置；旧上下文仍为 route3/DHR4，实际持久化 form15/item150，断言期待 form5 失败。精确摘要及原XML/快照摘要见 [start-configuration-red.json](evidence/start-configuration-red.json)。红轮测试当时只包含父子重绑定；最终测试进一步覆盖随后移除旧DHR项。

`act` 的现有事务改用 PostgreSQL REPEATABLE_READ，使多次配置查询及随后同事务DHR目录创建使用一致视图。保留工单→对象锁、状态/revision/权限检查及审计原子性。PostgreSQL 在等锁竞争时可能报 SQLState40001；直接HTTP控制器在事务代理已回滚后，才将该特定冲突翻译为现有刷新重试的400业务错误，不自动重放动作，其他异常继续原处理。

当前普通首次 START 的入口由控制器直接调用服务；DhrFillingService 外层事务加入时不会提升已有隔离级别，但该路径仅接受 SAVE/SUBMIT/APPROVE/RETURN/SIGN_FIELD，不接受 START。本批不宣称所有嵌套服务调用均改变了隔离级别。

## PostgreSQL 专项必须实际运行

环境为仅供本批使用的独立数据库 `edhr_w1_snapshot_race_20261015`，位于现有测试容器的 loopback15432；没有连接用户生产库或处置历史数据。测试使用真实 Spring 事务代理、JPA、JDBC、鉴权后的 MockMvc 执行控制器、DHR创建及持久化断言；JdbcTemplate spy只控制旧上下文查询后的交错。管理侧按照真实 `ProductProcessOwnerService.updateVersion` 原子替换父子配置，再按 `saveDhrTemplateComposition` 的另一提交移除旧DHR项，以SQL建模；未调用管理员HTTP及其完整验证/审计链。

```bash
cd gmp-platform/backend
bash /tmp/pr6-mvn -Dtest=ProductionExecutionIntegrationTest \
  -Dexecution.test.url=jdbc:postgresql://127.0.0.1:15432/edhr_w1_snapshot_race_20261015 \
  -Dexecution.test.driver=org.postgresql.Driver \
  -Dexecution.test.dialect=org.hibernate.dialect.PostgreSQLDialect \
  -Dexecution.test.user=edhr test
```

加强后的新增用例严格要求本次旧配置、旧DHR目录仍含item50，而新开工的另一对象使用新配置；旧execution不回写。最终主侧 PostgreSQL 全类：69个条目，67通过，0失败/error，2个原有 opt-in 浏览器夹具跳过（`formRecordsBrowserFixture`、`browserEvidenceFixture`），不计通过。本批不运行整页视觉或用户浏览器E2E。原日志 `/tmp/edhr-w1-snapshot-pg-final.log`，XML在 `/tmp/edhr-w1-snapshot-pg-final-xml/`。

## H2 与 PostgreSQL 的验证分工

曾实际尝试在H2执行加强用例，H2 REPEATABLE_READ不能保证 PostgreSQL 的数据库级MVCC视图：此前未读DHR项表可见新删除，START返回400“已绑定的DHR模板版本未配置表单”。失败日志 `/tmp/edhr-w1-snapshot-h2.log`、原XML `/tmp/edhr-w1-snapshot-h2-initial/`保留。没有为适配该模拟器而修改业务或放松200/精确引用断言。

仅新增的数据库语义专项显式要求 `execution.test.driver=org.postgresql.Driver`；H2默认不执行它，因此H2通过不能代替上述PostgreSQL必跑项。原有测试断言和资格均不变。主侧另对执行类及 WorkOrderCloseAtomicityTest、DhrFillingServiceTest、DhrSummaryPersistenceTest 运行H2回归：102个条目、99通过、0失败/error、3跳过（上述两个夹具和已在PostgreSQL通过的新增专项）。知识Maven89通过、0失败/error/skip。各轮用例和原XML摘要见 [主侧结果](evidence/start-configuration-main-result.json) 与 [用例索引](evidence/start-configuration-main-case-index.json)，不同环境重复运行不相加虚增覆盖。

每次 backend Maven 均未使用 exec.skip，实际构建DHR打印资源；本批上述用例没有调用PDF浏览器渲染，不把资源构建误称视觉验证。知识校验只是schema/ID/引用/现有知识测试，不代替全量语义审查。

## 交付与剩余范围

代码改动限定一个事务边界及一个HTTP冲突翻译，另增加必要回归和有限知识证据。不更改模板编辑、发布、数量、生命周期或权限政策，不恢复旧快照。不将人工损坏execution JSON作为已终止详情可达缺陷；依赖观察及原四个evidence-gap继续保留。

最终独立质量已由未参与修复的新实例实际完成并返回passed，见 [独立报告](evidence/independent-config/quality-result.yaml)：候选1113fe14、目标6379，12项必需检查通过；独立PG67通过/2原夹具skip、H2相邻33通过/0skip、知识89通过/0skip，均0failure/error。另3项控制器分支probe通过，分别核对原因链40001映射、其他SQL错误及普通异常原样抛出，不加入上述测试数量。1,196个保护文件前后摘要相同；未把主测结果改称独立运行。

新增交付文件只复制独立报告与安全摘要、更新发现状态和下一步链接；不回填为新的受测代码提交。W1剩余审批/修订/导出入口、F004及W2–W7仍在台账中待推进。当前修复无独立验收阻断，技术上建议审阅合并；本批没有合并或部署授权。
