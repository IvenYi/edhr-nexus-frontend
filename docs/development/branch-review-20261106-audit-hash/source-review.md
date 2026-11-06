# W5 新事件摘要：只读源码与兼容边界核对

本角色只读源码、选择回归范围并运行了外部 Jackson/PostgreSQL 兼容观察，没有修改项目代码、测试、夹具、配置、知识或旧日志，没有执行应用 JUnit，不能替代最终独立质量。固定生产者/读者源码为 `edhr-dev@9dc5c0014643d99db299d27a80788cc777a0ccca`，知识0.3.25/schema1.2.0。当前未提交DP和helper单独标注工作树输入，不冒称属于该提交。正式质量仍须在主实现测试完成后，由未参与任何修复的新实例执行。

## 当前真实链路

固定提交main/java有49个`AuditEvent.builder()`位点、37文件，逐块都设置createdAt，没有一个显式传入snapshotHash；没有`new AuditEvent`、`setSnapshotHash`或直接SQL INSERT audit_event的实际生产入口。新算法放在共享PrePersist可覆盖这些入口，不需要给49调用方散落条件。`AuthController`、`ExecutionAccess`里的三处显式snapshotHash属于Signature；AuditController的同名builder字段属于响应DTO，不能归入AuditEvent自定义摘要。逐位点来源见producer-inventory.json。

原实体覆盖18个字段，before/after为JSONB、createdAt为无时区时间。所有实际computeSnapshotHash调用都在实体封存入口；当前全局审计列表、DHR归档、汇总审计和人员/申请人投影都没有读时重算AuditEvent摘要。因此本批最小修复可只改新写入事件与版本兼容，不把未知/历史事件自动判坏，不新增页面状态或下载门禁。DHR归档对Signature的校验属于独立机制，必须保持。

nullable无default版本列、无DML升级保持旧行与旧摘要；不能按64位hex、创建时间或当前49个生产者来倒推历史算法。新事件版本与摘要同时生成，旧非空摘要路径仍原样保留。读取未知版本必须明确拒绝算法计算，不尝试若干算法直到碰巧匹配。应用回滚保留列及新旧摘要，不能为“回滚”删除版本或重写旧hash。这个边界与PR66只读兼容方案一致。

## 直接确认的解析兼容风险及工程处置

实际依赖Jackson 2.17.1。外部Java探针使用相同jar、USE_BIG_INTEGER_FOR_INTS/USE_BIG_DECIMAL_FOR_FLOATS，在自有PG16数据库比较JSONB接受范围；不是HTTP或产品性能验收。原始输出为boundary-probe.jsonl与boundary-probe-v2.jsonl，命令、jar指纹、PG版本和清理证据一并封存。

| 合法JSON案例 | Jackson默认精确mapper | 原生PG JSONB | 仅局部放开constraints的精确mapper |
| --- | --- | --- | --- |
| 1001位整数/1001位小数 | 拒绝，默认数字长度1000 | 接受 | 接受 |
| 1310位整数 | 拒绝 | 接受 | 接受 |
| 50001字符键 | 拒绝，默认键长50000 | 接受 | 接受 |
| 20000001字符字符串 | 拒绝，默认字符串长20000000 | 接受 | 接受 |
| 1001、1500、2500层数组 | 拒绝，默认深度1000 | 接受 | 接受 |
| `1e10000` | 输入7字符可接受 | 接受，但读回展开为10001字符 | 可接受展开数字 |
| `{"a":1,"\u0061":2}` | 接受，最后解码键取值 | 接受，最后解码键取值 | 接受 |

这不是建议新加限制；相反，新封存路径若直接使用默认mapper会拒绝旧代码可入库内容。特别是短输入指数在PG读回扩展后会撞数字长度限制，影响真实往返。已向主角色交付证据；当前工作树helper已使用专用JsonFactory显式设置number/name/string/depth约束，未修改全局默认值，并设置生成深度。生成器以显式循环能写1500/2500层，当前canonical遍历用Frame栈避免Java递归深度限制。以上只是初版源码/外部兼容证据，最终产品仍须实际PG往返和独立验收。

时间探针也确认PG/JDBC会把`.123456789`读成`.123457`，把`.999999500`读成下一秒。新封存必须先把同一实体createdAt赋为微秒值再计算；只格式化六位、不更新持久实体仍会产生误差。当前工作树实现已先truncatedTo(MICROS)，保留LocalDateTime而未擅自改UTC；旧行不动。

确定编码还应覆盖SQL null/JSON null/空字符串、对象排序但数组保序、任意精度十进制同值、负零、重复解码键、Unicode escape及补充平面字符。当前helper固定版本域+18字段，JSON字段有包装以区分SQLnull与JSONnull，显式Frame遍历并向Digest流输出，不先拼完整canonical字符串；源码初读未见新增SQL/额外数据库往返。对象树仍会占用内存，键排序为O(k log k)，不能称“流式摘要”就宣称整体常量内存。大before/after的解析、排序、累计分配/延迟仍需主侧测量，不能外推峰值或生产并发SLA。

## 最小回归选择与各自实际边界

| 范围 | 已读入口/现有测试 | 可证明 | 仍须补的运行证据 |
| --- | --- | --- | --- |
| 配置JSON生产者 | SystemSettingsController.updateSettings:107→writeAudit:516；SystemSettingsControllerTest | 原快照/操作者/敏感字段投影断言；测试仓储为mock，不自动执行PrePersist | 正式schema下调用真实updateSettings，真实SystemSetting/AuditEvent仓储，事务提交、flush/clear/reload后复算；只改显示名等字段，不发邮件 |
| 生产/DHR/附件 | DhrAttachmentUploadVerifyObservationPostgresTest原27项 | 正式Liquibase+实际服务/JPA/原生PG、AuditEvent生产、真实SQL/审计拒绝与外层回滚；原hash断言仅形状/身份/动作 | 主新实体往返测试证明算法；最好对原服务产生的实体重读复算，不把hex长度当正确性 |
| 签署关联审计 | AuthControllerTest.createPersonalSignatureReauthenticatesStoresSignatureAndWritesAudit（源码:657） | 真实controller创建Signature/关联AuditEvent内容；仓储mock，但该测试在:742手工sealSnapshotHash，能覆盖新编码执行 | 仍不是PG。需将该真实生产的AuditEvent通过真实仓储持久化并重读，或选择同一真实认证链原生probe；不能仅另造同名AuditEvent冒充生产者 |
| 切面 | AuditAspectTest三项；AuditAspect.audit:37 | 真实切面构造及执行上下文、返回值/参数不冒充业务diff；mock保存不会调用PrePersist | 真实AuditEventRepository保存并flush/clear/reload一次切面产生的事件；保留原切面吞审计异常的既有行为，不扩大整改 |
| 原读者 | AuditControllerTest | 原过滤、动作归类、显示字段和DTO透传；部分测试显式seal，但无PG | 对既有响应兼容作相邻回归，不新增读时校验政策 |
| 其他摘要不受影响 | SignatureSnapshotPostgresTest | 真实Signature持久化、archive消费者原文/SHA与篡改拒绝 | 该类不生产AuditEvent；只能证明独立签名机制保持，不能把它计为AuditEvent签署关联生产链验收 |

DocumentCategoryAuditPostgresTest也是真正配置类/JPA/原生PG写审计，但它的启动说明与配置只安装原baseline、Liquibase关闭。若重用必须明确应用0092；否则新实体INSERT包含新列而旧夹具schema无列，会得到夹具不匹配，不能以删新字段或降断言绕过。现有Mock型TemplateModeling/WorkTemplate/ProcessModeling测试同样只能作相邻业务回归，不能自动当新PrePersist运行证据。

## 源码初读结果与剩余

DP的最小新行修复、旧兼容、18字段、无新SQL及既有读取规则边界合理。当前新helper初版已吸收已证实的Jackson约束差异，并用显式栈避免新递归上限；没有发现需要新业务决策的矛盾。此结论不关闭W5缺陷，也未认证新实现，主角色仍负责旧源JSON/时间分离反证、编码/篡改/迁移/实际生产者/成本与相邻测试，最后交给全新独立质量。

旧日志原字符串/纳秒不能可靠还原、精简或裁剪ZIP不含18字段而不能自足复算等限制继续保留。无新UI/下载阻断、历史修复、数据库部署或merge授权。原931/86、W2-W7、A12/高风险/完整矩阵、容量与UNKNOWN对账、已审代码A23复查和用户暂停项不在本角色关闭范围。
