# 独立最终质量复核 FINAL

结论：**passed，L2**。本实例及只读源码孩子均未参与任何修复，未修改业务代码、测试、fixture、配置或断言。三个既有medium在固定候选与本次实际回归范围内关闭，无新增开放发现或阻塞。结构化完整结果见quality-result.yaml；运行与验真明细见analysis.json。

实际base/target：`b6691e2c6289ab414a7a3fed1f128562cbba4166`；来源head及tested candidate：`703f2ee90417e778cf745fbbcd24f908a345d3bd`；contractReadCommit：`703f2ee90417e778cf745fbbcd24f908a345d3bd`。已读项目、质量、交接、通用编码原则、知识README/openquestions/架构、DEC0063/0090、ZIP来源追溯规则和本批决策/分析。目标PR71 merge树与45858291相同，契约、知识及350个知识文件无增量。知识0.3.25/schema1.2.0/P0 in-progress保持。

工作树：独立detached `/workspace/edhr-header-jwt-qa-20261107`。实际测试期间唯一dirty/untracked/excluded为frontend/node_modules依赖软链，链接至主树已安装依赖；run.json原样记录，未伪造clean。测试完移除自身软链后核head不变且最终clean，见final-worktree.json。报告仅在本raw目录，未查/触发CI/Actions，未merge/deploy/恢复/扫描删除。

## 实际验证

主测试125/125，0失败/错误/跳过，2026-11-07T12:59:14.647056+00:00至2026-11-07T13:00:19.502397+00:00，JVM -Xmx1536m及独立tmp。125=真实JWT HTTP13+gate5+原95+原JWT相关10/新增ASYNC2。独立知识入口fresh89/89，0F/E/S；原始XML全保存。不累计任何历史通过。

| 类 | 测试 | 失败 | 错误 | 跳过 |
|---|---:|---:|---:|---:|
| AuditAspectTest | 3 | 0 | 0 | 0 |
| SecurityConfigTest | 6 | 0 | 0 | 0 |
| SecurityJwtExpirationTest | 2 | 0 | 0 | 0 |
| AuditEventHashTest | 48 | 0 | 0 | 0 |
| AuditEventTest | 2 | 0 | 0 | 0 |
| JwtAuthenticationFilterTest | 3 | 0 | 0 | 0 |
| JwtTokenProviderTest | 1 | 0 | 0 | 0 |
| DhrArchiveAsyncLifecycleTest | 5 | 0 | 0 | 0 |
| DhrArchiveAsyncOwnershipTest | 5 | 0 | 0 | 0 |
| DhrArchiveControllerStreamingTest | 6 | 0 | 0 | 0 |
| DhrArchiveJwtHeadersTest | 13 | 0 | 0 | 0 |
| DhrArchiveResponseFilterTest | 5 | 0 | 0 | 0 |
| DhrArchiveCleanupFailureTest | 7 | 0 | 0 | 0 |
| DhrArchiveLayoutReaderTest | 3 | 0 | 0 | 0 |
| DhrExportReadObservationPostgresTest | 12 | 0 | 0 | 0 |
| DhrFormFilesTest | 4 | 0 | 0 | 0 |

真实SecurityConfig/tokenProvider签发验签/JWT filter/Controller/advice/Tomcat；合成密钥/claims、mock ZIP生成和file repos，不冒称真实登录目录/业务DB全HTTP链。context-path `/header-audit` 的GET、HEAD、inline和授权负例通过。受控overlap max1/单nosniff，ZIP162字节完整、任务启动1次；拒绝和排队timeout为500/完整137字节JSON/Disposition精确inline，无旧ZIP长度或EOF，未开始body且文件已删。匿名/无效401、仅view403未触发生成。实际PNG、公开PNG、实际PDF页预览均private,max-age=300，无Pragma/Expires。700ms只是测试调度，不作生产耗时、频率或SLA。

独立PG16随机loopback及专名数据库，完整canonical+0092共12 change sets成功，ddl-auto=none、未禁约束。原PG12项含冻结/ZIP/PDF合并及审计；renderer仍mock。原48 hash、2 AuditEvent和3 AuditAspect全过。QA/主原件各11观察与33调用线程SELECT；各3次server EXPORT逐条20参数，hash version精确audit-event-v2。无服务器逐事件tag，不称全网络或精确逐区间SQL归因。

QA11及原件11个JFR均独立重算等于各自原观察；下表为本QA逻辑读取，非OS设备IO。

| 观察 | 字节 | 事件 |
|---|---:|---:|
| archive-1 | 597180 | 74 |
| archive-10 | 4167979 | 510 |
| archive-100 | 39878142 | 4869 |
| ordinary-0 | 0 | 0 |
| ordinary-1 | 262144 | 2 |
| ordinary-10 | 262144 | 2 |
| ordinary-100 | 262144 | 2 |
| signature-0 | 0 | 0 |
| signature-1 | 262144 | 2 |
| signature-10 | 262144 | 2 |
| signature-100 | 262144 | 2 |

## 源码与证据核对

请求局部monitor在HeaderWriterFilter外侧持有initial链至退出，body同monitor中先CAS领取再沿原TWR copy；inline可重入。new filter只安全链注册一次，无Filter bean双注册。ASYNC错误不等monitor，仅Throwable/未commit/WAITING转FAILED后清长度及类型并改inline；completion从WAITING/FAILED单次领取清理，BODY/已commit不被改写，晚到body拒绝。原IOException/RuntimeException清理和suppressed边界保持。JWT只开启ASYNC原Bearer重验，没有session/permitAll/ERROR默认/过期政策变化。A23及耦合/所有权复核通过；无全局锁、SQL分页、重试扫描、默认writer复制或Service无关重构。

32受测输入与候选、主latest完全一致。最新同字节旧源负控13=10正/3真AssertionF、0E/S；旧max2且重复nosniff、拒绝/timeout均401。旧三产品源匹配Git base，旧filter不存在；负控由本QA独立核原件，未重新执行。四归档共604成员均核ZIP、manifest和每成员SHA/字节数，并逐一等于现存原raw：

- main.zip：395成员，SHA256 `94f47b173fd13917e7214c77ac6090f60f972917ae46f3965d8081a4829c1018`；manifest SHA256 `7c89e72d0488a1cfff2f96e92f7652f406a01dd9f59a9ef9468ff9a40f7c62f0`。
- negative.zip：68成员，SHA256 `9cb36c9e8231e6353c622afaaca7b4641119f8b62df27fd28b2259deb89309e0`；manifest SHA256 `b05b7f4a0d4b2de71b012c8c252d3589c086dd8ba0b7b81e79854fca8a726c00`。
- source.zip：107成员，SHA256 `d07ae45e26a26ade679a2f7a086a6ca8487be7892a53ce30210397ea59078d7d`；manifest SHA256 `2b705be723bb8343a965e77d34b94c68ec3188b50ba06a1556f6f0338ff275a7`。
- auth-source.zip：34成员，SHA256 `0a9278a532f873e39d55d91c10084524134a5b8e1f73163ee7e2cc253fa2c291`；manifest SHA256 `72d5d841581946da8801a249e4d6f0c06aa95a93a97d60bc8b217a0d28de861e`。

历史全部保留：首次throws编译遗漏0JUnit；首probe只观setHeader漏addHeader的max0为校准错误；修正旧13后3真F；中间124和125各2 EOF错误；长度setter纠正后focused13仍2 attachment失败；最终明确inline严格精确断言、完整125通过及latest同源旧13仍3F。报告工具自身首次误预期短literal v2，读实际原件audit-event-v2后仅校准报告parser；首失败日志audit-evidence-first-failed.log保留，产品/测试/断言未改、测试未重跑。

## 残余及后续责任

非可中断monitor等待/下游永久挂起、真实活动网络取消、自然到期长排队、Error/OOM/crash/UNKNOWN对账、容量/全部租户矩阵未标passed。已发HTTP和已有EXPORT无回滚承诺；下载副本不等于DEC0090真正归档或备份恢复。7.x官方库修复不是当前6.x drop-in，本批未升级。性能/模块拆分先量化讨论，数据库分页未答未实施。

原W2–W7、931知识/86UI候选、A12/高风险/完整矩阵、历史ZIP/text-ID索引/上传PDFOffice容量/共享ACL并发及A23含已审和暂停队列继续；整文件0、历史unique未知。知识89不证明全量语义审计或知识运行发布，不提升P0。

自有PG容器已移除，HTTP端口[36085, 43215]均关闭，自有tmp ZIP为0。只读源码孩子已正式FINAL。主侧需在全部角色/孩子FINAL后执行实际PR前来源/目标/契约/知识漂移复核；本QA不代其宣称完成。全部报告、fresh XML、原raw指纹及完整SHA manifest随本目录交付。
