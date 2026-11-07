# 独立最终复验

**passed / L2 / FINAL**。未参与本轮任何实现或修复。独立真实运行候选为 `1709dbc4d3d28d8721ff001b69ad934a6de54d18`；最终候选 `b2b0df85572f634925d9e3b1ac4a91c0988bb86c` 仅由主侧删去一条未使用测试import。目标独立 fetch 仍 `04db7e838ec5e194355ff954ff173a02205e0fd6`。契约实际读当前候选，与目标原字节无增量；知识0.3.25/schema1.2.0/P0保持。本实例未改产品代码、测试、夹具、配置或断言。

实际独立产品回归 **156/156**、知识检查 **89/89**，均0失败/错误/跳过，运行提交均为1709，未把它们冒称成b2b0的重跑。新真实PG/JPA转移13、旧成员服务5、仓储6、制程解析3、Controller55、Batch PG21、审计hash48/event2/aspect3。原仓储6使用H2，不能混称全156为PG；其他Mockito单元同样不冒充集成。PG完整canonical Liquibase至0092、ddl-auto none。原两个可选Batch观察通过提供pg_stat_statements和既有growth开关实际执行，没有改测试标准。

## 根因及修复边界

相同测试的主侧原始负控13为9通过、3断言失败、1真实产品DataIntegrityViolation错误、0跳过。独立核过其原XML、PG日志和源指纹，没有重新执行旧控。直接合法转移ERROR来自`uk_product_family_member_tenant_product`；实际失败INSERT只记在ERROR/STATEMENT，不能当成功execute，也不是夹具报错。HTTP400、第三审计标记尚未到达及提交前门闩未到达也来自该唯一冲突。原test与156受测1709 test同字节；最终b2b0 test只少未用import，不再声称与负控源码逐字节同。负控service等于目标04db。

产品只在delete后加一行repository.flush，先实际删除再保存新ID成员；SQL证明native、JWT/MVC及外层事务三种转移均在同一非零XID按DELETE→member INSERT→三audit INSERT执行。flush不提交事务。保留新ID、新created元数据及既有三方审计；无原位UPDATE、约束放宽、锁策略、重试、异常吞噬或业务规则改动。

第三audit注入拒绝前，数据库确已成功执行DELETE、member INSERT和前两audit INSERT；非事务序列证明第三次到达，失败SQL另记ERROR/STATEMENT，随后旧成员完整恢复、audit为0。新member插入拒绝同样回滚之前DELETE。外层事务等待commit前的另一连接仍看旧簇11和audit0，release后新簇12、新ID和三审计一起可见；工作线程严格终止。该读隔离不等于全部START/转移并发写矩阵。

真实JWT签发、过滤器、Controller、异常处理和事务代理通过MockMvc验到确认后200、缺确认400、匿名401和无权403；这是进程内MVC，不是网络端口、浏览器或真实登录验收。同簇no-op、资格与不存在对象拒绝保持精确旧成员及零审计。

## 原件及独立计算

`analysis.json`绑定25受测输入到候选Git字节，16个观察均对照PG成功execute/tag。`independent-audit-hashes.json`从持久化JSON独立重编码并重算231条审计SHA-256，逐条匹配v2，同时核901、姓名、account、UI、IP与产品/旧簇/新簇内容。该工具不调用产品hash方法。

离线工具首次把JSON整数1000写成普通1000，与既有Java `BigDecimal.stripTrailingZeros().toString()` 的`1E+3`规则不同，因此分析断言失败；原稿、校准原因完整保留于`analyze-initial-source.py`和`analysis-calibration.json`。随后仅修正独立分析器数值编码，231全数匹配；没有重跑或改变产品测试、需求和断言。不能把该分析工具校准误报为产品失败，也不能隐去它。

主侧`final`0JUnit编排路径拼错、`retry`154通过/2跳过和`verified`156通过分别保留，未用最后绿覆盖旧记录。该阶段原件由主侧包保留，独立核对不冒称自己执行过其历史命令。

## 知识及健壮性

有限只读孩子已FINAL：350个知识路径逐字节349不变，只有core-business两fact各5来源metadata字段变化；Controller在04db与候选一致，是confirmed/requireConfirmed及无reason字段的实际来源。定义、类型、操作符、availability、状态、成熟度和原业务规则不改。没有将语义标签second-confirmation改成新boolean请求字段或声称通用运行事实provider已实现。实际知识89由本实例独立执行，未用孩子只读结论或本体日志替代。

A23：显式flush有真实ORM/唯一约束失败依据，属于必要顺序控制。没有为假想未来增加重复资格、兜底或通用框架。新方法不添加SQL循环、内存分页或大数组；现存批量添加1/10/100对应8/62/602SELECT是相邻风险，100为样本。bulk100的inspector prepared audit INSERT100与服务器execute200分别记录，不混算。

第二轮成员查询可能观察到并发变化，不能仅从重复形状推定为过度防御或直接删去。用户批准下一批批量化预校验读取，仍保留实时复核、写入和审计；当前补丁未实施性能优化或改变资格错误语义。

服务267行已经分离`resolveEligibleProducts`、`writeMembershipAudits`及snapshot构造；一行flush不值得新抽象。相邻Controller1758行可在后续确定范围后按产品簇CRUD/成员/选项与制程模型版本/工序绑定分别拆分：先把`/product-families`成员路由整体移至专用Controller，保留相同prefix、权限、确认、事务和响应；领域规则继续留MembershipService，公共异常继续原Advice。再用原55Controller和真实13验路由/权限/原子性，不把鉴权和事务散到通用工具。这里只给具体边界，不实施大重构或宣称全文件已审。

## 退出及剩余范围

自有PG容器已删除并inspect确认不存在，Maven/测试进程退出0，门闩worker终止通过。运行时唯一临时依赖symlink明确excluded，结束仅unlink该自有链接，工作树恢复clean；源码25与Git候选一致。无CI/Actions查询或触发，无merge/deploy、历史恢复或孤儿扫删。

本轮没有影响当前交付的阻断，建议可合并这一局部修复。最初报告的新测试line36未用AtomicInteger导入由主侧在b2b0清理，low已解决；本实例只报告并独立验收，没有参与修复。`initial-1709`保留原low开放报告和全部旧源绑定。

该增量已独立检Git唯一差异、编译b2b0且exit0，保存main/Observation/ObservationConfig三类`javap -c -p -s -constants`，逐字比原受测1709的指令、签名和常量相同（不含debug行号，不谎称class文件字节相同）。25输入中24逐字不变，唯一test严格等于旧文本删除一条未用import；知识350全同。按候选变化影响评估要求，适用新增检查是这次编译与指令/源差异核对；产品行为、断言、装配、事务及观察均不变，可以复用1709实际156/89，不额外把旧运行归到新提交。原本体updated/FINAL仍绑定1709，此import增量不改知识或业务语义。

批量读取下一批已获授权但未完成；完整跨租户、并发START/转移写、浏览器及容量不由本批证明。W2-W7余项、931知识/86UI候选、A12/高风险/完整矩阵、A23含已审复查与用户暂停项继续；整文件完成0、历史unique未知。最终PR前漂移核对和交付元数据由主侧在全部角色FINAL后完成。
