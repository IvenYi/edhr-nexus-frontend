# 记录变更：只读或停用父子表中的历史签名

本批实际fetch `edhr-dev@0701b3d5d99787195e9d4c33935ae36da370839d`，PR79已合入，整树与42872814相同，无外部代码、知识、契约增量。按原W3/W5跨链与W6健壮性/A23、W7增量继续审查，L2。前批候选性能整改不重新收尾。

## 已确认缺陷

`W3-RECORD-LOCKED-SUBTABLE-SIGNATURE-001`，high，本批新申请范围已修复并进入独立验收。触发条件：已完成表单包含签名的子表，父子表字段配置`readOnly=true`或`status=disabled`；用户变更另一个可编辑主字段，不修改该子表，无论提交数据包含还是省略该子表。

旧`RecordControlDiff.prepare`从源值deepCopy，遇不可修改父表直接continue。原签名清除只发生在主签名分支或可编辑子表normalize内，因此父表保护同时绕过了签名清除。原提交把该拟值签入申请，审批将其写入Rev2、当前记录和执行值；旧签名虽没有被篡改，却被再次携带为新修订的值，存在签名归属误解。

本体规范合理且已有明确依据：DEC-0087-02/06及[原用户证据](../../knowledge/evidence/record-control-v1-user-confirmed.md)要求新修订不继承原业务签名，旧签名在旧修订历史保留，申请和审批各有独立动作签名，本期不要求原业务签署人对Rev2重签。只读/停用父表不构成继承例外；不是新增政策，也不恢复原业务签名。

## 最小修复

产品只改`RecordControlDiff`。输入不可修改校验、行标识恢复/校验及原差异计算先执行；在拟值形成后，统一按冻结的signature字段和subTable结构移除其历史签名。删除原主签名和单层子签名的分散移除，源值仍先deepCopy。

该清除只操作被声明为signature的字段；不会因某个业务值长得像签名、字段同名或JSON里出现signatureId就删除数据。没有catch-all、重试、默认值、缓存、权限兜底或额外SQL。只读/停用校验继续拒绝业务值篡改；原`equivalent/addDifferences`排除签名，清除本身不构成内容差异，也不能凭它创建新修订。作废不走prepare，原作废保留值/历史规则不变。

## 实际验证

同最终测试字节的旧产品实际16项：8正向通过，8真实失败（unit4＋原生PG4），0错误/跳过。PG四例使用distinct合成新来源，不更新原基础表单的旧修订；通过原saved服务创建Rev1。原signField使用真实签名密码、测试认证PNG及认证记录，形成有真实ID、目标和SHA的业务签名；JWT+MockMvc提交、审批、读取历史实际均200，并在旧代码上确实写出了携旧签名的Rev2。不是仅mock出的失败或只做静态推断。

clean受测`ab5b44d2292a8a7a08cbeb6aba502b30f50df8f0`主侧123/123（87原生PG＋36单元/方法安全/控制器/静态）及知识89/89通过，均0F/E/S。四组合正例核新申请拟值、新Rev2/current/execution无旧签名，旧Rev1/旧signature整行、旧hash和模板快照保持，原行身份及业务值保持；unit同时核无内容变化与只读篡改拒绝，原记录控制/审批回滚、权限、候选查询等回归保留。

主侧独立离线重算旧/新8观察的Rev1、Rev2内容hash；从服务器原INSERT绑定参数核24份签名载荷（每例原字段/申请/审批3份）的SHA、真实ID/目标/身份及提交source/proposed一致。登录41、审批实际签署42沿原共享终端规则，未切换登录。每版12次新链HTTP（四例各提交/审批/历史3次）均200。测试认证图片与来源是合成夹具，不构成生产签署认证或浏览器交互验收。

## 兼容及存量限制

只影响修复后新调用prepare的申请。修复前已保存的IN_REVIEW拟值不会被自动净化，已形成的旧Rev2及历史也不回写。本批不读取共享业务库，是否存在受影响存量未知；若后续发现，需按原可退回/重新申请流程和实际审批状态另行核对，不能擅自改已签载荷或批量恢复数据。本批通过不代表所有存量或所有修复后审批都已自动排除此问题。

## 健壮性、性能与具体拆分

本次统一的清除函数只遍历已有冻结字段及对应子表行，无循环SQL、内存分页、无界ID参数或跨请求缓存，也不重复读取数据库。原两处清除合为单一职责，避免父级早return再次漏掉；它与“校验仍拒绝篡改”分开，不能为简化删除必要保护。未声称做过生产容量实验或新性能优化。

`RecordControlDiff`现261行，字段约束、行身份/差异和拟值形成仍是同一责任，本批不按行数拆类。若未来增加多个修订来源，可把`identifyRows/normalizeSubtable/rowsById/stripRowIds`作为有明确所有者的RowIdentity支持；`equivalent/addDifferences`保留差异语义，签名清除保持拟值边界，不把行身份兼容策略藏进全局JSON工具。

相邻592行`RecordControlService`的具体方案继续：`findRecord/references/revisions/listRequests/listMyWorkflowTasks/requestsForMyWorkflowTasks/requestDetail`归只读查询对象；列表/详情共享资格先明确单一所有者；`submit/withdraw/handle/applyResult`保持命令事务编排，`applyChange/applyObsolete/updateExecution/audit`保持同一事务和原锁顺序。本批没有实施大重构。

## 后续审查信号及原队列

- 源码信号：RecordControlDiff调用Evidence时未传完整拟值/previous，记录变更的引用候选GET也未传取值上下文；条件引用及历史原因保留是否受影响，需下一轮聚焦复现和知识核对，当前不宣称已确认缺陷或已修复。
- `DhrEvidenceImpactService.changes`附件核验仍有readAllBytes路径，是既有附件容量队列中的具体实现锚点；本批未量化、未优化，不重复冒称新unique性能发现或将其他入口的流式优化当成这里已通过。
- 公式仅有源码字符串分支，当前字段注册无对应运行类型，不能据此宣称存在已支持公式功能或擅增政策。

原W2余项/W3–W5跨链/W6健壮性性能、具体抽取及A23含已审/W7新增、全知识语义/strict86/lint缺配置/A12/高风险/完整矩阵/family剩余4N及选项全载/容量UNKNOWN/未答方案/用户暂停项继续，整文件0/historyUnique未知。无UI修改，未重跑浏览器/strict/lint；结构知识89不等于全语义审查完成。专业正式结果、原件封存及PR前复核另有记录，不能用主侧通过替代独立门禁。
