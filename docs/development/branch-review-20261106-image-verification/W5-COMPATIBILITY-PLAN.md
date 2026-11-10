# W5-AUDIT-HASH-001 只读兼容方案

本文件是下一独立批次的工程建议，不是已实施变更或质量验收。该旧问题仍为 `preexisting-medium-open`，不随 PNG/JPEG 核验优化关闭。本任务没有运行应用测试、没有修改仓库代码、schema、知识、日志或旧摘要。

固定基线为 `edhr-dev@cf5594947e96dcc56497997d7941da0f7a89be7e`，知识 `0.3.25 / schema 1.2.0`。来源副本及 SHA-256 见 `source-manifest.json`；当前未提交图片核验决策包单独标注为工作树输入，不冒称属于该提交。范围是摘要生产/读取链的静态核对，不能折算成这些文件或全仓已完成审计。

## 1. 已确认事实与原始依据

1. `AuditEvent.java:26–33,54–61,69–108`：before/after 存入 PostgreSQL `jsonb`，createdAt 为 `LocalDateTime`；`@PrePersist` 在 snapshotHash 空白时按 18 个字段的原字符串、长度前缀计算 SHA-256。非空摘要原样保留。所谓 canonical 目前只做字符串长度分界，不做 JSON 语义或数据库时间精度归一化。
2. 当前 DDL `baseline/0001-current-schema.sql:59–78`：JSONB、`timestamp without time zone`、64 字符摘要，既没有摘要算法/版本字段，也没有原始封存字符串。数据库 JSONB 可重排键和空白，时间会采用持久精度；读回再调用旧计算不能保证与写前相同。
3. 旧原生 PostgreSQL 探针已保留在 `docs/development/branch-review-20261020-w3-write-boundaries/evidence/primary/edhr-w3-audit-hash-baseline-probe-summary.json`：固定 `a8285be9…` 的两条测试均在 round-trip rehash 断言失败，0 error/skip。此处仅引用原件，**本任务没有重新运行**。`AuditEvent.java` 在 a828 与本次 cf 的 SHA-256 同为 `61932bd33d0c0cb8d1886335c5aab0229753e3d5f4022fdeead5f0e075a0ad6e`。
4. `AuditEvent.java:64–66` 的 `@PreUpdate` 拒绝实体更新；这不是数据库级不可变或外部防篡改保证。无密钥的普通 SHA-256 只能在校验依据可信时检测内容不符，不能证明数据库写权限持有者没有同时替换内容和摘要。本建议不引入签名、链式日志或外部时间戳。

## 2. 实际生产者：当前没有混用自定义实体摘要

固定提交的 main/java 有 **49 个 `AuditEvent.builder()` 位点，分布在 37 个文件**。每个 builder 原块、行号及字段标记见 `producer-inventory.json`。49 个都设置 createdAt；49 个都不提供 snapshotHash，因此当前实际均依赖 `@PrePersist` 自动封存。

| 模块 | builder 位点 | 文件数 | 当前摘要来源 |
| --- | ---: | ---: | --- |
| common 审计切面 | 1 | 1 | 自动封存 |
| identity | 9 | 3 | 自动封存 |
| masterdata | 10 | 9 | 自动封存 |
| production | 13 | 11 | 自动封存 |
| recordcontrol | 1 | 1 | 自动封存 |
| system | 5 | 4 | 自动封存 |
| template | 4 | 3 | 自动封存 |
| workflow | 6 | 5 | 自动封存 |

反向检索未发现 main/java 中 `new AuditEvent`、`setSnapshotHash` 或直接 SQL 写 audit_event；当前受控 changelog 也没有直接插入/修改 audit_event 的脚本。这个结论只覆盖所查当前代码，不推断生产库历史来源，也不否认实体公开 builder/setter 在技术上允许自定义摘要。

容易误归类的位点：

- `AuthController.java:373–385` 的 `.snapshotHash(snapshotHash)` 属 **Signature**。其 `writeSignatureAudit` 在 1115–1135 将签名快照内容写到另一条 AuditEvent，未把签名摘要塞入该 AuditEvent。
- `ExecutionAccess.java:263–266,300–303` 的两处显式摘要也属于 **Signature**。
- `AuditController.java:119–141` 的 `.snapshotHash(event.getSnapshotHash())` 是 **AuditLogItem DTO 读取**。
- `DhrSummaryService`/`DhrFrozenEvidenceIntegrity` 的 DHR 版本摘要、附件 SHA、Signature.snapshotData 摘要均是独立机制。不得为修复 AuditEvent 改动它们。

## 3. 当前读取与影响边界

| 读者 | 原始源码定位 | 实际行为 |
| --- | --- | --- |
| 全局及个人审计列表 | `compliance/controller/AuditController.java:29–90,113–141` | 展示现有 snapshotHash，没有重算/阻断 |
| DHR 归档审计清单 | `production/service/DhrArchiveService.java:212–244` | SELECT 并透传 AuditEvent 摘要，没有重算 |
| DHR 汇总审计分页 | `production/service/DhrSummaryService.java:165–184` | 读取元数据和 before/after，此响应不读摘要 |
| 用户/部门创建及修改人投影 | `identity/controller/UserController.java:294–318,605–625`；`DepartmentController.java:234–259,331–351` | 消费 action/人员/时间，不重算摘要 |
| DHR 证据影响查申请人 | `production/service/DhrEvidenceImpactService.java:45–53` | 从 SUBMIT 事件取唯一操作者，不消费摘要 |

全 main/java 的 `computeSnapshotHash` 调用只有实体 `@PrePersist`。因此旧问题并不等于当前每次读取或下载都报错；它使“读回后独立复核这条审计事件”不可靠。DhrArchiveService:247–287 对 Signature 则**确实**做快照摘要校验，两者不能混同。

当前审计列表的全量查询/内存分页、逐条人员补全属于全审性能队列，需按既有台账去重；不是本方案的修复范围。

## 4. 建议的下一最小批次

建议只为**新写入的 AuditEvent**建立可重算的版本化封存。先把写前/真实 PG 往返测试打通，再改读取展示。建议的版本名为工程示例 `audit-event-v2`，实际命名在实施决策包固定，不把建议记成用户已确认政策。

### 4.1 兼容 schema 与分派

- 追加可空 `snapshot_hash_version`（名称为建议），**无非空默认值、无历史 UPDATE**。null 表示未标记历史方案，不能因为 hash 长度是 64 就判断它是旧自动算法或自定义算法。
- 新自动封存路径同时写 v2 和摘要；摘要仍存现有 64 字符列，保持外部 DTO 原字段语义与长度。v2 版本标识也参与摘要域分离，防止同一串被解释为其他业务摘要。
- 保留旧算法的明确名称和固定向量用于解释/诊断。不要把 `computeSnapshotHash()` 无条件改成新算法后对所有旧行重算；读取层按版本选择校验。
- 当前没有自定义 AuditEvent 摘要生产者，因而无需为假想实体摘要引入通用插件。对非空且未标版本的外部提供摘要，保持原值、不自动盖上 v2；未来若新增调用方应在自己的明确契约中定义，不能静默继承自动事件校验语义。
- 新版对未知版本返回“不支持此摘要版本”诊断结果，不能尝试另一算法直到碰巧匹配。旧/未标记数据返回“未按新方案验证”，不判坏，也不显示为“已验证”。这只是建议的内部校验结果，不自动变成前端放行或下载阻断政策。

### 4.2 对持久语义做确定封存

继续覆盖原 18 个持久字段，避免无意漏掉操作者、原因、来源、IP 等。最小规范应在源码注释与固定测试向量中写清：

1. 固定字段顺序和域标识；用明确的 null token，区分 SQL null、空串与 JSON `null`。普通文本原值保留，不 trim、不做 Unicode 规范化，不按显示投影重写历史姓名/action。
2. before/after 依据 **JSON 值语义**编码：对象按明确稳定键顺序递归排列，数组顺序保留；布尔/字符串/null 类型保留；数字采用任意精度十进制规范表示，避免 Jackson 默认 double 精度损失。`1`、`1.0`、`1e0` 需得到同一表示，`-0` 与 `0` 同一表示；大于 2^53 的整数必须准确。使用 BigInteger/BigDecimal，不能直接套只保证 IEEE-754 的 JCS 实现而不核对产品数值。
3. 必须把重复键、Unicode escape、嵌套结构、标量 JSON 和 PostgreSQL JSONB 可接受范围纳入真实 PG 测试。建议重复键按 JSONB 的最后值语义解释，保持现有入库含义；不要顺便增加一条“禁止重复键”业务门禁。
4. 时间明确为无时区的 LocalDateTime，而不是擅自转 UTC。封存前把新事件 createdAt 固定为数据库能准确往返的微秒精度（建议显式 truncate 并对同一实体赋值，然后格式固定六位小数），这样不会依赖 JDBC/PG 对纳秒的舍入。测试包括临界值、跨秒和无小数情况。记录这一新行工程精度选择；历史时间不改。
5. 编码使用 UTF-8、确定的字节长度框架；不要混用旧算法的 Java UTF-16 字符长度，也不要拼接无分界字段。SHA-256 小写 hex；摘要字段本身不参与循环计算。

不应在每次写事件时添加 `SELECT (?::jsonb)::text` 等数据库往返来“统一格式”。那会把每次写入变成额外查询，并使 hash 定义依赖数据库打印版本。可在纯 helper 中定义稳定结构编码，生产每条事件只执行现有持久化。

不必持久化另一份完整 canonical payload 来绕开 JSONB；那会重复存储可能很大的审计正文。若上述 PG 同语义实验发现不能可靠实施，再比较精确原文列的兼容代价，不能未经实验叠加两套存储。

### 4.3 读取与导出分步

- 下一最小修复至少要完成写入和重读可复核、版本可辨识及相邻回归。不要在同一批把全局审计内存分页、大量 UI、链式签名一起重构。
- 如同批向 AuditLogItem 或 DHR 归档新增版本字段，只做增量字段并对现有消费端做兼容测试；旧 snapshotHash 值、before/after 与页面显示保持。增加“验证通过/失败”展示或下载强制阻断属于可见行为，需要先确认产品处理方式。
- 当前 DHR 归档只导出 AuditEvent 的**部分字段**，没有全部 18 个封存字段。因此仅增加版本字段不能使该精简清单脱离数据库独立验证。若需要“ZIP自足复核”，必须另定义完整原始审计证据条目（含版本及全部封存字段），不宣称当前精简或脱敏导出已具备这项能力。
- 当前隐私/范围裁剪的归档会移除部分 before/after/dataSummary；裁剪清单只能说明存储摘要与事件来源。不能拿裁剪视图重算原事件后报篡改，也不能为了校验泄露被裁剪字段。

## 5. 历史、混部、回滚边界

- 旧行及旧摘要不更新，不用新算法补一个“正确值”，不为通过测试改写旧原件。重新序列化后的旧 JSON 无法可靠还原过去原字符串/时间，不能宣称能够自动修复所有历史摘要。
- nullable 版本列先行可兼容旧应用：旧进程仍写 null/legacy，旧读取忽略新增列；新进程只对自己正确封存的新事件标 v2。混部阶段不能仅靠部署时间推断算法。
- 应在迁移测试证明仅增加 schema，没有 DML 改旧行；保留版本列和新摘要即可回滚应用。不要为回滚删列或回写 v1 摘要。旧应用当前不重算摘要，仍能显示新行已存值；此事实仍须以回滚契约测试验证。
- 不引入 DB trigger 重封存、后台全表补算或读时“自愈”。不可变规则、业务失败/审计失败事务关系和各领域锁序保持。
- 本建议不是生产部署授权。若具体运行环境、旧客户端或外部导出消费者无法支持增量 schema/字段，才进入对应澄清；本只读任务没有取得这些环境证据。

## 6. 必要验收与结束条件

1. **负对照**：在固定旧算法上保留原生 JSONB/纳秒 round-trip 失败，分别隔离 JSON 与时间，不用 H2 冒充 PG。
2. **编码向量**：键重排/空白/escape 同值一致；数组重排和真实字段变化必须不同；null/空/JSONnull区分；嵌套、重复键、大整数、极小数/指数、中文/补充平面Unicode、精度边界有固定向量。
3. **真实 PG**：通过正式 Liquibase、JPA persist→flush→clear→reload 后重新计算与原摘要相同；再次数据库重新读；无业务额外 SELECT；合法默认/必填字段行为保持。
4. **篡改反证**：新行任一受覆盖字段被修改后验证失败，不能只检查 hex 长度；未知版本不误判；旧未标版本保持原值且返回明确未验证。
5. **旧与混部**：旧 null hash、已存旧自动hash、未知外部提供hash、空白hash、混合版本；迁移前后原行字节/值不变；新/旧应用的读写与应用回滚矩阵。
6. **生产者相邻回归**：至少选择一条 JSON 配置生产链、一条生产/DHR/附件事务链、一条签署关联审计和 common 切面，确认49自动位点仍共用一次封存；不重写 Signature/DHR/file hash。事务回滚、createdAt排序、不可变更新行为保持。
7. **读取与导出**：现有响应与ZIP条目保持兼容；精简/裁剪条目不冒称独立可重算；若新增完整证据，测试全部字段与版本、脱敏范围、历史及缺失数据。
8. **成本**：测代表性大 before/after 的累计分配/延迟，避免 canonicalization 引入无界中间副本；没有性能实验前不承诺峰值或吞吐。
9. **完成门禁**：新的 L2 决策包、有限本体/审计语义核对、主实现测试、未参与修复的新实例独立验证、目标增量及任务漂移复核全部完成，才能关闭**新行往返缺陷**。历史不可重算限制另列，不冒称已修复历史完整性。

## 7. 需要以后讨论的产品选择

这些选择不阻塞当前图片优化，也不要求用户现在逐项回答：是否向用户展示摘要验证状态，是否在审计导出/下载发现新版本不符时阻断，是否需要完全离线的审计证据包，以及历史未标记事件的客户解释方式。可先交付上述兼容的写入/复核修复；没有确认前不新增放行或下载门禁。

本次结论：已把 W5 后续方案收敛为有限新行封存与版本兼容问题，当前仍 **open / 未修复 / 未运行验收**。没有把此方案转成知识事实、生产行为或历史修复授权。
