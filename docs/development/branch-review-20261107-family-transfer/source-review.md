# W4 产品簇成员转移：只读源码及有限历史评估

本报告是主审开发前的有限 triage，不是最终 QA，不签发质量 passed。固定目标 `04db7e838ec5e194355ff954ff173a02205e0fd6`；实际读取工作树 HEAD `42bd62cc796feefa626384461b33d958f01aac14`，两树均为 `c80a2efe991088dca9673a08bcf446fd69c3bf3f`。开始与收尾工作树 clean。本实例和历史孩子均未修改仓库，未执行应用、数据库、Maven、浏览器或 CI。

知识基线为 0.3.25 / schema 1.2.0 / P0 in-progress；契约实际读于 42bd62cc。读过 AGENTS、codeplzreadme 通用原则、quality-verifier、agent-handoff-contract、知识 README 和 open questions；不以当前代码反向发明业务政策。

## 单一候选

`CAND-W4-MEMBERSHIP-TRANSFER-FLUSH-20261107`，优先级 medium 候选，状态为 source-signal-awaiting-primary-PG-reproduction。候选根因与后果需要主侧真实事务复现后定案；本实例未把 Hibernate 默认 flush 顺序的推断冒充运行结果。

当前合法入口是 `POST /api/v1/master-data/process-modeling/product-families/{id}/members/{productId}/transfer?confirmed=true`（类级前缀见 controller），要求 `master-data.product-families`，保留明确确认。存在半成品或产成品 P、当前属于簇 A、目标簇 B 存在且 A≠B，即可走到跨簇写入。

- original-evidence：`ProductFamilyMembershipService.java:83-102` 在同一 Spring 事务中先 `delete(existing)`，立即 `save` 一个新 Snowflake ID、相同 tenant/product 的实体。两者之间没有显式 flush、JPQL/native delete 或能证明删除已执行的 SQL 查询。保存后的三方审计也仅 `save`。
- original-evidence：`ProductFamilyMember.java:19-25` 声明 tenant/product 唯一；当前 baseline SQL `0001-current-schema.sql:2006-2008` 是即时 unique index，而非可延迟 constraint。旧行尚未实际删除时，新行 INSERT 必须冲突。
- inference：Hibernate 通常在同一 flush 中先执行 entity INSERT、后 DELETE，因此事务提交或触发 flush 时，合法转移可能被 `uk_product_family_member_tenant_product` 拒绝并回滚。这不是应用独立运行确认；主侧需验证实际 Hibernate/Spring Data 版本及执行顺序。
- original-evidence：`ProductFamilyMemberRepository.java:12-23` 只继承 `JpaRepository`，相关 find 没有锁，未提供定制即刻删除。`application.yml:21-30` 为 JPA、ddl-auto none、PG dialect、batch_size20，没有改变 delete/insert 顺序的定制。

## 规则依据及合理性

当前权威知识 `DEC-0002-02` 要求一个产品最多归属一个簇；`DEC-0002-11`、`rule.product-family.member-transfer-audit` 和 `scenario.product-family-transfer` 要求明确确认、事务内转移、不收集原因、产品/旧簇/新簇三方审计。数据库唯一规则和转移功能须同时成立，不能以去掉唯一索引或拆事务绕开。当前 open questions 没有阻塞此规则的成员转移政策问题。

这只修合法转移写入的工程顺序，不改变 DEC-0002-10 在 20261027 收敛后的未开工重核/已开工冻结/未来作业实时匹配政策；旧 H006 不作为本候选的规则依据。

## 反证与测试缺口

- 同簇转移 `service:89` 直接返回旧实体，不进入 delete/save，是必要正对照；它成功不能反证跨簇写成功。
- `ProcessModelingController.java:427-435` 已有权限、外层事务及 confirmed；本候选不声称缺权限或缺事务。
- `ProductFamilyMembershipServiceTest.java:34-43,78-104` 为 Mockito，断言 delete 旧成员、save 新 ID301、写三条审计；没有 EntityManager/事务代理/flush/唯一索引。它明确体现现有新 ID 行为，但不能证明真实数据库可提交。
- `ProcessModelingControllerTest.java:239-253` mock 整个 service，只核确认门禁。
- `ProductFamilyMemberRepositoryTest.java:57-62` 证明同 tenant/product 第二行会 unique 失败，没有调用真实 transfer 服务。
- `BatchProcessIntegrationTest.java:147-159` 和 `ProductionExecutionIntegrationTest.java:981-1015` 用 JDBC UPDATE 当前成员来模拟转簇；它们覆盖生产消费政策，不执行服务的 delete/new-ID insert。

## 最小修复及主侧验证建议

主侧先在真实 PG/JPA/事务代理下从已提交旧成员调用跨簇 transfer，强制事务完成，再用新持久上下文读取；记录原错误和真实 SQL/约束，而非用 mock 或直接 SQL UPDATE 复现。若运行证实上述根因，在 `delete(existing)` 之后同一事务内显式 flush，再保留原新 ID save，是最小候选方案。

不建议本切片改为原位 UPDATE：当前服务和既有测试明确新 ID、createdBy/currentOperator、PrePersist 新 createdAt/updatedAt；复用旧 ID 会改变成员关系身份与创建时间解释。没有必要改 schema、唯一约束、锁政策、审计字段或抽取新框架。

必要回归包括：跨簇成功后唯一一条新 ID 成员及精确三方审计；同簇 no-op 原 ID、无新增审计；确认缺失、非合格物料、无归属的原拒绝；delete 已 flush 后审计失败仍整体回滚为旧成员、零新成员/零新审计。flush 不是 commit，不得拆成 REQUIRES_NEW。实际接受拒绝状态码、真实操作者元数据及权限由主侧按原入口验证。

原读取顺序是目标簇→物料→物料类型→当前成员→原簇，均为普通 find；不存在已实施的成员行锁可声称保留。并发转移/删除/加成员的完整矩阵是相邻未验范围，不用本候选自动新增通用锁政策。`ProductFamilyMembershipService` 规模适合局部一处顺序修正，不为行数做重构；controller 本切片只定位转移三方法，不能算整模块审完。

## 有限历史去重与余项

历史孩子已 FINAL，原件位于 `history/REVIEW.md`、`history/result.json`、`history/manifest.json`。限定 branch-review Markdown/YAML 检索没有找到本 delete/insert flush 同根项已处理记录；不声称全历史 unique。

已去陈旧：H009/H010 在 PR20 的五类新写命令关闭；H012 原候选限制由 DEC0081 精确替代；H006 旧创建归属/工单锁版政策被 20261027 直接替代；H007/H008 已有各自独立验收；F004 原 pending 被 PR9 后续关闭。W5 审计新行摘要、分页算术/动作筛选及本页姓名批读只在各自子项已关闭。旧事件全载 DB 分页方案未获答复，继续保留。

本轮仅建议进入该一个 coherent W4 切片；PR70-72 ZIP/异步/JWT 生命周期、签名密码页和生产弹窗暂停、其他性能/容量/A12/A23 队列没有扩大实施。整体 W0→W7 审计仍未完成，整文件审完数不提升，不给整体百分比。
