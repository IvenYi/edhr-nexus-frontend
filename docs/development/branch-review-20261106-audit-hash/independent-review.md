# W5 新自动审计事件摘要：载体传输最终独立复验

正式结论 **passed**，仅覆盖 `9dc5c0014643d99db299d27a80788cc777a0ccca..1c2cbb86b119f593925e5a147505a7ed97dd7fa2`。本实例未参与任何产品、测试、夹具或配置修复；在自己的 detached 工作树和隔离 PG16 容器实际重跑 **206/206、知识89/89**，全部0失败/错误/跳过。实际fetch目标仍9dc5c001，契约在当前候选读取并与目标逐字节相同。只清理自己的PG、依赖软链接与工作树，受测源始终未修改。

## 三项旧质量发现的实际复验

独立使用当前实际编译class、原探针Java源码及自己的PG/JDBC连接重放两轮全部11案例：普通text/varchar六例全部v2重算相等；JSON载体五例中四个成功持久化案例全部相等，字面 `\\uD800` 控制仍由原JSONB规则拒绝。原始未配对Java代理项、正常配对补充字符及字面Unicode转义没有混淆。探针源码、javac/java确切CLI、classpath和实际class SHA以及PG版本均在probe-runtime.json、两份JSONL与runtime-classes；自有PG删除有证据。

因此 QF-W5-UTF16-001、QF-W5-VARCHAR-002、QF-W5-JSON-UTF16-003 在当前候选已解决。两份旧质量failed原件保留，174/201等历史通过只属于旧候选；未以旧结果替换当前验收。本实例没有执行任何修复。

实现现在先按PG JDBC UTF8转换原始Java载体文本，再分别执行普通text的真实varchar存储投影或JSON解析；不会无差别替换解析后的JSONB叶子，也不改变event原字段。13个varchar宽度均与正式DDL核对；超界ASCII尾空格按代码点投影，界内空格保持，正常补充字符按一个字符处理，非空格超长仍由原DB拒绝。新自动事件时间先赋实体微秒值，既有显式hash及旧行不重封存。JSONB值排序、精确数字、重复键末值、数组顺序、SQLnull/JSONnull区别及固定版本域/18字段覆盖符合DP；UTF8 generator的补充字符大写代理转义与独立编码匹配。

## 独立运行与原始证据

新鲜206测试包含48编码/篡改/约束/资源单元、原JSON/时间2、兼容与实际producer18、text4、varchar15、JSON载体5、迁移2、当前baseline3，以及原附件/签署/读者/切面等相邻用例。不是206全都PG或完整HTTP。配置调用真实controller/repository；切面使用合成joinpoint但真实producer/repository；签署关联直接调用真实私有producer并真实JPA，不能冒称完整密码/图片认证。附件27现在重新读取真实事件复算，原事务11及独立Signature9通过。原Aspect吞审计异常未改，不能将49生产位点说成全域同事务回滚认证。

实际PG日志中 **63次v2审计INSERT成功执行** 的完整参数，通过独立Python精确Decimal、UTF16键排序、确定JSON转义/框架及SHA计算全部吻合。成功执行不是提交，里面有随后回滚的验证动作，原失败INSERT分开。原JSON/时间核心每次写1INSERT、读1SELECT，SET与driver类型元数据另列，没有新增hash归一化查询。真实配置/切面/签署producer标签包含在这63次参数核对中。

9份原始归档及 **1727文件** 的大小和SHA逐项通过。三组旧源负对照分别2项2真失败、4项1正3真失败、5项2正3真失败，均0错误/跳过；对应测试与当前候选完全同字节，旧实体反证源等于固定base。没有把编译、字体环境或分析脚本分类失败当成产品回归，也未藏去这些原始输出。

正式Liquibase从旧master升级/重复执行，原legacy/external/null hash行保持，nullable版本无default、没有业务DML；旧应用列集合插入和读取仍兼容，应用回滚保留列与新旧hash。这是原生测试中的兼容协议模拟，不是生产混部或部署。原baseline和其他摘要/控制器/前端未变，当前changeset12。

知识350文件/协作契约与base全同，0.3.25/schema1.2/P0未升级；实际知识测试89通过不代替全库语义核对。初本体16=14限定一致/2gap、文本与载体各6受影响增量均为历史有限范围，不累加unique。旧历史不可可靠还原原文/纳秒、裁剪ZIP缺全字段而不能自足重算等限制仍保留。当前代码只替换新自动封存，不新增页面验证状态、下载门禁或历史修复。

## 容量与范围限制

局部parser放开Jackson较小默认限制并使用Frame显式栈，不更改全局ObjectMapper或PG接收规则；1310位数、指数读回扩展、2500层JSON及长键/字符串有实际测试。JSON树与对象键排序仍有内存/CPU成本，Digest流式输出不等于全路径常量内存。原始样本仅为调用线程累计堆分配与单次本地耗时，不是峰值、RSS、native、并发或SLA。README中的50/36ms属于上一corrected阶段，当前transport主原件约62/45ms；主角色已确认仅在L0登记中对齐标签，本报告只认原始对应阶段数据。

无新UI/schema部署/生产HTTP或全生命周期认证声明。原W2-W7/931知识/86UI/A12/高风险/完整矩阵/容量/UNKNOWN/已审代码A23复查及用户暂停项继续，whole-file完成0、历史unique未知。本结论仅认证当前新行修复和三项medium闭环，不是整体审计完成。

证据入口：qualityResult.yaml、validation-summary.json、native-sql-and-independent-rehash.json、archive-check.json、negative-controls.json、probe-runtime.json、text-unicode-probe.jsonl、json-text-persistence-probe.jsonl、varchar-width-check.json、knowledge-contract-scope.json、retained-results-check.json、worktree-state.json。原始XML/PG/源码/JFR见transport/，当前读过的32份源码/契约副本见source-snapshot/。
