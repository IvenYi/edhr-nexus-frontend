# 独立质量复验：只读/停用子表的历史签名归属

固定目标 `edhr-dev@0701b3d5d99787195e9d4c33935ae36da370839d`，受测候选 `ab5b44d2292a8a7a08cbeb6aba502b30f50df8f0`。本实例未参与实现、测试修复或知识维护；使用自有 detached worktree、自有临时127端口PostgreSQL及自有target运行。没有修改任何仓库业务/测试/配置文件或调用CI。

## 规则及实现判断

独立核对DEC0087-02/04/06及原用户证据：原表单签名归属原修订，新修订不继承旧签名；申请和审批签名各归其动作，本期不要求原业务签署人重签Rev2。只读或停用父子表不是签名继承例外。普通生产内容变更的重签与记录控制修订是不同动作，未冲突。本体有限结果NA，知识版本0.3.25/schema1.2/P0不提升。

旧代码在父子表readOnly/disabled时直接continue，跳过子表签名清除。新代码在原不可修改/未知字段约束及内容差异计算之后，按冻结signature/subTable结构统一清除拟值副本中的签名。源值deepCopy及冻结模板不变；签名清除不被计为内容差异，原只读内容篡改仍拒绝。统一函数消除了分散清除遗漏，职责仍在RecordControlDiff，不需要另造通用签署清洗框架。函数按类型和冻结层级工作，不按业务键名或对象外观清理，没有新SQL/缓存/重试/默认值或吞异常；必要原校验未降级。

产品差异仅RecordControlDiff一处，加2测试及DP，共4文件。submit/applyResult/工作流/ExecutionAccess/signField/审计/权限/快照、公开Controller/DTO/UI及schema字节保持；没有大模块重构。RecordControlDiff仍归拟值身份/差异规范化所有者；未来若拆分，应以表行规范化与差异格式化为边界保留单一prepare入口、输入约束及清除时序，不能移动业务写事务或复制签署引擎。相邻592行RecordControlService的只读查询/单一资格所有权与写事务编排继续原具体拆分方案，不按行数散拆锁和审计。

## 实际独立验证

- **123/123，0失败/错误/跳过**：87原生PostgreSQL（原83加新4）＋36其他单元/方法安全/控制器/静态检查。canonical0092、严格一次性数据库URL guard及两容量optin均实际启用。不是123个E2E。
- 知识 **89/89** 为本实例实际执行。353知识文件及5个知识Java输入和POM共359输入同base/candidate字节；自动结构/引用检查不等于全库人工语义通过。
- 新四组合为只读/停用父表×输入显式带入/省略子表。独立来源通过原saved服务创建Rev1，原signField用真实密码及合成认证PNG生成字段签名，随后JWT+MockMvc提交/审批/历史各4次，12次均200；新拟值/Rev2/current/execution均无旧签名，普通业务值、原生行ID及冻结表单保持。
- 旧source同最终2测试字节，原件16=8正向/8真实签名继承失败、0错误/跳过。本实例未重跑旧版，独立绑定旧产品到目标Git、检查XML及旧4个原生观察，确认旧4真实提交并批准且Rev2/current继承了旧签名，不是夹具或预算假红。
- 对旧4及独立4共8观察，独立重算原字段签名的原始snapshot_data SHA、Rev1 raw values SHA和新Rev2保存值SHA；旧signature整行、Rev1原值及hash均保留。原签名在旧历史及申请sourceValues中继续存在，不把源证据误删。
- 独立从两phase原始PostgreSQL完整参数化JPA INSERT中，核24份field/submit/approve真实签名：逐份重算SHA并核ID/target/载荷。字段target为PRODUCTION_EXECUTION109，申请/审批target为真实requestId；提交签名41、审批签名42，登录会话41保持，原共享终端契约成立。申请签名source/proposed分别等于request已存来源/拟值，新拟值无旧签名。这里只对完整参数化真实JPA动作签名解析，不把混合字面值的认证fixture INSERT当成同一参数布局。
- 原候选回归20调用＝20实际SELECT＝20auto_explain，0..1000完整结果/原SQL预算仍通过，无图JSON列。本批未做新性能优化或额外生产容量认证。

原件、XML、SQL参数、完整载荷及独立解析脚本见manifest。测试依赖软链是本实例创建的唯一untracked，运行时在run.json如实保留；所有测试完成后仅移除该软链，最终WTclean。自有PG已移除，主依赖目录及共享DB/8081未动。

## 明确限制

清除只在新的prepare处理拟值；修复前已存IN_REVIEW拟值和历史Rev2不会自动净化，不能泛称全部存量或全部后续审批已修。真实存量本实例没有查询，不能声称不存在。若有受影响在审申请，需另行只读盘点并按原流程人工退回后新建，不擅自回写已签署申请或受控历史。

测试认证图片、来源及密码为合成fixture，实际后端signField/签署和JWT+MockMvc链不代表浏览器、生产网络或完整签署发布。无UI改动未执行本轮browser/strict/lint，原strict86及lint缺配置继续。W2余项/W3-W5跨链/W6性能健壮性具体抽取及已审A23/W7、全知识语义/A12/高风险/完整矩阵/容量UNKNOWN/未答性能/用户暂停继续，整文件完成数及历史unique不据此提高。引用上下文和另一路摘要数组仅待去重复现源码信号，本批未确认、整改或关闭。

正式质量结果为passed，12项必需检查通过、无发现或阻断。该结论只接受本批新申请签名归属修复，不表示整体审计完成或生产部署许可。
