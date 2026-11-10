# W5 新自动审计摘要往返修复：有限本体核对

结果 `not-applicable`，知识 `0.3.25 / schema 1.2.0 / P0 in-progress` 保持。起点与目标为 edhr-dev@9dc5c0014643d99db299d27a80788cc777a0ccca，PR66已合入、整树同dbc95776；本角色读取适用契约并核对其字节与该提交一致，未发现契约或知识增量。主实现仍处于稳定工作树，具体HEAD、文件SHA和未提交状态见 `final-source-manifest.json`，不为工作树虚构提交SHA。

本角色未修改业务代码、测试、迁移、配置、架构或知识资产。实际执行的是正式知识模块89/89，0失败/错误/跳过；实际读取新的编码、PG/迁移与邻接事务测试源码，不代称亲自运行这些业务测试。主侧运行与全新独立质量应按其各自原件验收。

## 当前定义与实现

有限16记录为15个ID与1份历史Markdown，14项在声明子范围一致、2项证据缺口。记录含原始成熟度、schema记录类型、来源提交/定位、原始值及实际核对依据。此集合与上轮附件核验16记录不是同一集合；不新增或推算全审唯一覆盖率，不把implemented/verified标签当本轮运行通过。

现行term.audit-event/concept.audit-event和事件到变化快照关系要求独立不可变事件、对象、原始动作、操作者、发生时间与真实前后值；没有规定旧字符串拼接算法或纳秒存储为业务政策。新nullable版本列、UTF8版本域加固定18字段、JSONB值确定编码及原LocalDateTime微秒截断属于现有摘要能力的工程修复，不产生新状态、用户动作或审批规则。未知版本仅显式拒绝内部重算，不改变普通读取和下载资格；未标旧行保留旧算法诊断、显式已有hash不自动改写或盖v2。

已读稳定实现：PrePersist只在原hasText判断为空时选择v2并对同一createdAt截到微秒，未引入新时区或取当前时间替代旧时间。原18字段覆盖保留。JSON内容以单元素数组区分SQLnull与JSONnull，对象键稳定排序、数组保序、任意精度数值去尾零、重复键按最后值解释，纯编码直接送SHA。局部Jackson限制显式处理、容器输出用迭代栈，未把解析器默认数字长度或深度上限另立为业务限制。内容字段仍为原JSONB映射；此实现不是原JSON字符串字节保全。

0092仅追加无default的nullable版本列，master追加include，原baseline未改；没有UPDATE/回填/重封存或触发器。应用回退保留版本列与新旧hash，不承诺破坏性schema回退。迁移测试的旧应用兼容是旧列集合SQL读写，不应冒称真实旧二进制混部/生产部署验收。旧三表事务夹具追加实际0092使实体列与夹具一致，原提交/回滚断言保留，不是放松业务标准。附件native测试在原hex/身份断言上增加按真实ID从JPA重读并复算v2，额外验证查询在被观察业务动作之外，不能把动作查询数当所有测试网络SQL。新unit的1/10MiB资源观察增加旧算法同内容参照；本角色只读测试源码，不代称运行通过。

当前main/java逐builder重新静态盘点49位点/37文件，0显式AuditEvent hash；现有生产者继续共享PrePersist。已读AuditController/DhrArchiveService仍透传已存hash，未新增自动验错、UI验证状态或下载放行/阻断；生产工单和对象的真实差量及中文动作投影未改。Signature TEXT原文SHA、DHR/附件hash和冻结内容仍独立，不以AuditEvent修复替它们做兼容或历史恢复。

## 保留边界

AuditAspect既有catch(Exception)记录日志后返回业务结果仍在，未由本批修改。49共享入口不等于49业务链都已认证同事务审计失败回滚；显式领域写事务按实际独立测试范围说明。无密钥SHA也不证明具有数据库写权限者不能同时替换内容和摘要，本批不引入链式日志、电子签名或外部保全。

旧事件可能已丢失原JSON字符/纳秒依据；新行可重算不修复这些历史，旧W5新行缺陷和不可恢复历史限制须分开结案。原2026-10-20等失败/研究证据保留原时点，不重写为新方案已验证。当前ZIP仅保留部分审计字段且选定范围可裁剪，即使新行带数据库版本列，也不能据此认证ZIP脱库自足重算，完整打印/ZIP/来源/签名/附件/视觉矩阵仍为证据缺口。

350知识文件逐字节不变。没有新业务政策需要confirmed建模，也不为工程内部版本创建新术语、规则或执行契约、增加知识版本或提升成熟度。原931知识/86UI候选、高风险/A12/完整矩阵、历史/text-ID索引、上传/PDF/Office容量、大解析器、UNKNOWN持久对账、W2余项-W7及已审代码A23过度防御复查继续；朋友任务签名页与生产管理弹窗样式暂停保持。整文件完成/总体审计完成未由本角色增加。

原件索引：`ontologyResult.yaml`、`finite-audit-records.jsonl`、`knowledge-fingerprint-inventory.json`、`baseline-source-manifest.json`、`final-source-manifest.json`、`current-producer-count.json`、`knowledge-test-summary.json`。正式知识日志/XML与实际读源码快照均保存在本目录，manifest逐文件封存。
