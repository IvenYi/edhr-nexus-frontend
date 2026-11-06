# W5 新事件摘要：独立最终质量 failed

固定候选`1c077d2877f760156ab0072f557990c45c1df4b0`，base/目标`9dc5c0014643d99db299d27a80788cc777a0ccca`。新实例未参与实现、未修改任何产品、测试、夹具或生产配置。独立detached工作树实际跑通174/174与知识89/89，0失败/错误/跳过；独立核对3归档699文件、350知识和契约字节、原生旧源2真失败与同字节测试、独立编码向量。随后外部实际实体/JDBC探针确认两个普通文本持久归一化遗漏，因此正式结果 **failed**，不得用174通过覆盖额外失败。

## 通过的范围

原JSONB/时间两个真实PG往返、精确数字/指数读回/重复键/Unicode/2500层及长键边界、SQLnull/JSONnull/类型和数组顺序、新旧/未知/外部hash、原18字段变化、不可变与外层flush回滚均在独立运行通过。0092仅追加nullable无default版本列，正式旧master升级及幂等/旧列集合插入读取保持旧行；这是协议模拟，不是生产混部部署。旧baseline没改，不含历史UPDATE/索引或破坏性回退。

实际PG日志中41次v2审计INSERT的执行参数由外部Python精确Decimal、UTF16键顺序、确定JSON转义和SHA-256重新编码，全部匹配存储摘要。执行成功不等于提交，外层回滚记录不被称为已提交。核心JSON/时间两例每写仅1 INSERT、每读1 SELECT；SET和驱动类型元数据查询分开，没有hash专用SQL。配置真实controller/仓储、真实切面+合成joinpoint、实际签署审计私有producer+合成user/signature/request及真实JPA、附件原27重读实际事件等边界分开。Signature原生9验证独立原文摘要，不拿它冒称AuditEvent链。

新helper局部parser约束避免Jackson默认比PG窄，Frame栈避免新增递归上限，Digest流不造完整canonical副本，但仍有JSON树和排序成本。未新增N+1/SQL循环/全局缓存/业务兜底或通用算法框架。普通读取/UI/权限/其他摘要与旧日志保持。原Aspect catch(Exception)未改，不能称49入口均有同事务失败回滚认证。

独立Python oracle首次对合法补充字符不匹配，是oracle初稿使用原始UTF8字符而Jackson generator实际确定输出`\uD83D\uDE00`导致；通过同jar原始generator外部probe确认大写surrogate/control转义后修正oracle，41次均吻合。没有修改受测源。编码文档可明确此具体转义行为；本段不是产品失败依据。

## QF-W5-UTF16-001，medium/open

位置`AuditEventHash.java:59-60`及新自动封存入口。普通text字段的Java字符串含未配对UTF16代理项时，现有PG JDBC会成功持久化为问号U+003F；新JsonGenerator却在封存时编码原代理项，读回再算得到不同摘要。固定候选的真实`sealSnapshotHash`/`computeSnapshotHash`与相同驱动/PG16探针：中文😀正例通过；高代理、低代理、x高代理y三个成功写入反例均v2失败，同固定时间旧算法均匹配。

这不是JSONB字段的非法Unicode转义：JSONB仍会拒绝未配对代理转义，但普通text/varchar列实际接受驱动替换后的值。当前`WorkflowEngine.java`撤回约376-382和转办约814确有用户reason.strip()仅写普通reason，before/after为合法状态/人员JSON，故普通文本输入路径存在；本探针不冒称执行完整工作流。修复应保持原业务接受/拒绝及字段值，不用新增输入拒绝或丢弃审计使测试变绿。

## QF-W5-VARCHAR-002，medium/open

同一普通text编码路径没有考虑既有varchar长度行为。按原DDL operator_name varchar(128)、data_summary varchar(512)，128个N+尾空格与512个S+尾空格均被PG成功接受，分别截成128/512字符；v2仍按截断前字符串封存，两个读回摘要都不匹配。旧算法同样失败，属于本次新行“按持久值可重算”修复仍遗漏的既有归一化边界。

不要把所有文本trim，也不要用Java UTF16 char数量冒充PG Unicode字符数量；长度以内的尾空格及合法补充字符仍有真实值含义。所有修复、正式新原生回归与字段边界选择均由主角色负责，本角色没有改任何测试或实现。

## 证据与剩余

`text-unicode-probe.jsonl`保留最终六案例（1正常、3代理项、2varchar），`TextUnicodeProbe.java`调用固定候选真实类，`run-text-probe.py`记录操作，`text-unicode-probe-runtime.json`保留确切javac/java命令、classpath SHA和实际实体/helper class文件指纹。`json-escape-probe.txt`另证实合法补充字符和控制字符的实际编码。自有完整PG及外部probe PG均删除，源工作树未改；源码/字节码快照和资源清理记录随manifest封存。

旧历史/完整ZIP、原931知识/86UI、W2-W7/A12/高风险/完整矩阵/容量/UNKNOWN/A23及用户暂停队列保留。本体16项14一致/2gap为本次子集，不能与前轮16相加为新增唯一覆盖。当前两个medium与额外failed检查使本批不满足完成门禁。主角色修复后需新候选及全新独立最终质量，不复用本实例结果签passed。
