# 审计列表当前页批量补名

L2。用户明确选择“先做本页批量补名”；开始时PR68尚OPEN，来源3c8e46943dbc3d02673d342e501b0884cb0c76dd，目标edhr-dev@e69a8f3d97b34fea8737947c780b047bb0310c64。fetch后无外部代码/知识/契约增量，在原PR追加小批优化，最终标题/正文须覆盖两项原正确性修复和本次姓名N+1子项。

只改两个现有产品文件：AuditController复用原派生方法完成过滤及切页，然后对本页唯一账号分批查询姓名、组装原DTO；UserAccountRepository增加原精确username的IN读取。每批500为SQL参数工程边界，页大小、总记录与所有续页没有新上限。空页循环不执行，故不查姓名；无跨请求缓存、事务/权限改写或通用查询框架。仍加载全部匹配AuditEvent及JSON，未做DB分页/索引。

既有当前displayName优先、历史operatorName及账号回退保持；空操作者仍按“-”账号解析，真实存在该账号时也读当前姓名，不新套ACTIVE/锁定资格。SQL姓名筛选仍查历史operatorName。个人入口仍是当前USER_ACCOUNT目标对象，包含管理员修改，不改成operator=self。页内跨租户同username多结果仍抛IncorrectResultSizeDataAccessException，不能first-wins掩盖；页外姓名不再读取，属于本次明确授权。完整多租户与全局读取政策矩阵仍非已解决。

主侧同源原生18例旧代码为2正/16真失败、0错误/跳过；最终134/134（新18+原116）通过，0F/E/S。旧源/最终新原生测试逐字节相同。随后仅移除原分页测试失效的单人mock与孤立import，六项断言不变并另实跑6/6；产品及原生代码不变，全新质量应覆盖最终候选。知识89以实际报告登记，不把产品测试当语义全审。

原生最终45个具名观察90条业务SELECT逐SQL形状/次数与PostgreSQL execute吻合。5000匹配/页20：共享、不同、缺失及空账号四轴均由5001→2；单页1100不同账号为1事件+3姓名批次=4，下一页105为2，合并ID/姓名覆盖1205条、顺序完整。过滤后无命中/超尾空页为1。原生同页重复账号异常单独未标tag，不把它漏算成“所有网络SQL”。旧源17完整观察26628 SELECT，另51条页外重复账号失败的部分事件单列；两组完成观察数不同，不能把总量相除当优化比。

5000共享行主侧本次调用线程累计分配约11.79MiB、耗时83ms；是含Hibernate统计/observer/SessionMetrics日志的单次合成值，不是生产峰值/RSS或SLA。事件全载、宽JSON、COUNT/一致性、完整授权/浏览器/并发仍待审；不因公司人员少推断历史不会增长。不新增索引：姓名仍以原精确username查，现有唯一索引以tenant_id开头；未来索引须按最终完整查询/分布评估，不能擅加租户过滤或拿此次次数下降承诺所有计划最优。

负对照父类取证边界：baseline runner拍了新测试和产品源，未预拍原观察测试中的Support父类。已从固定3c提交恢复父类、核与当前未变文件逐字节相同，run记录亦无该文件修改；恢复副本不是预运行工作树快照。最终run已拍该父类。见[主侧分析](main-analysis.json)及evidence原件，不掩盖限制。

本体not-applicable/FINAL，有限10=8一致/2明确gap，350知识及0.3.25/schema1.2/P0保持。全新最终质量在clean受测6fc13d2836629d6a6ae6d6a44e571f4220adb283独立134/134、知识89/89、16/16必需项passed/FINAL，无发现/阻断，45观察90 SELECT及实际本页参数完整核对；六包553原件、质量509文件校验通过，资源清理。质量只读源码子项也已passed/FINAL，20原方法保持。见[质量结果](quality-result.yaml)、[独立报告](independent-review.md)。

全部角色及子项FINAL后已实际[PR前漂移复核](pre-pr-drift-review.md)，目标仍e69、PR68仍OPEN，无外部/知识/契约增量、无漂移，受测运行/测试保持；此后仅L0验收/台账/交付文档，未触发新增业务或质量门禁。PERF-AUDIT-LIST-MATERIALIZATION-001仅姓名N+1子项verified-resolved，事件全载仍open；保留原两项正确性验收。整体W3/W4/W5交叉、W2余项/W6健壮性/性能/具体拆分/A23含旧已审/W7增量，以及931知识/86UI候选、高风险/A12/完整矩阵、旧历史/ZIP、text-ID索引、上传PDFOffice导出容量/UNKNOWN持久对账和用户暂停项保持。整文件完成0，历史unique未知；不自动merge/deploy/恢复或查询触发CI。
