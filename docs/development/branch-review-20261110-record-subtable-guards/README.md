# 记录变更：只读子表历史签名归属修复

已创建[PR80](https://github.com/IvenYi/edhr-nexus-frontend/pull/80)，`audit/edhr-dev-record-subtable-guards-20261110`→`edhr-dev`，观察OPEN/MERGEABLE/CLEAN，建议人工合入本批新申请修复。验收提交`c1a32c3c0787c542ba7c87c1dad358ec6017537e`后仅L0交付登记；登记前本地/实际远端/PR head及33受测输入一致，见[交付观察](evidence/delivery-verification.json)。登记正常推送后再次核对，不回写该历史时点。

PR79已真实合入`edhr-dev@0701b3d5d99787195e9d4c33935ae36da370839d`，整树同42872814，无额外代码/知识/契约增量。本批L2继续原整体审计，受测候选`ab5b44d2292a8a7a08cbeb6aba502b30f50df8f0`。

确认并修复`W3-RECORD-LOCKED-SUBTABLE-SIGNATURE-001/high`：父子表只读或停用时，原早return跳过历史签名清除，另一主字段变更批准后，旧签名随拟值进入Rev2/current/execution。依据DEC0087-02/06及原用户确认，新修订不继承原业务签名、旧签名历史保留，本期不要求原业务签署人对Rev2重签；原规则合理，不新增政策。

产品只改RecordControlDiff：输入约束、差异计算先执行，再按冻结字段结构统一清除拟值副本中的历史签名，移除原分散清除。源值、模板快照、只读业务内容、行身份及原签署/权限/事务/审计/UI/schema保持。没有新SQL、缓存、兜底、重试或大重构。

- 主侧及全新独立分别实际 **123/123**：87原生PostgreSQL＋36单元/方法安全/控制器/静态；知识分别实际 **89/89**，均0F/E/S。
- 同最终2测试字节的旧产品实际16=8正/8真实失败、0E/S；unit4＋PG4覆盖只读/停用×输入含/省略子表，旧PG4确实提交并批准后携带旧签名。不是测试夹具错误或静态猜测。
- 新PG4实际signField真实密码/测试认证PNG，JWT+MockMvc提交、审批、历史各4次，共12次200。新申请拟值、新修订/当前/执行值无旧签名，Rev1/旧signature整行/旧hash/冻结模板与业务行身份保持。
- 主侧和独立均从各自原生证据核旧/新8观察及24份实际PG签名INSERT参数载荷，并重算签名、Rev1和Rev2摘要；申请source保留旧证据、proposed不继承。登录41、审批实际签署42沿原共享终端规则。
- 正式[质量结果](quality-result.yaml) **passed/FINAL**，12必需项通过、无发现阻断；[本体结果](ontology-result.yaml) **not-applicable/FINAL**，有限17=14一致/1历史精确替代/2既有范围外未决，不新增unique覆盖，353知识不改。

仅修复**新prepare的申请**。修复前已存IN_REVIEW拟值、历史Rev2不自动净化；未查询共享业务库存量，不能声称没有影响。不得直接改已签载荷或历史，若后续发现受影响在审申请，应按原审批状态及退回后新建流程另行核对。

详见[源码/规则/健壮性与后续信号](review.md)、[独立报告](independent-review.md)、[本体报告](ontology-review.md)、[主侧实际分析](main-analysis.json)及[三包原件](evidence-packages.json)。三包669成员的SHA/尺寸、原角色manifest/SHA256SUMS均已核；保留旧源失败、源码、SQL参数、完整载荷、HTTP/XML与资源清理。离线参数分析器对混合字面值fixture的适配单列保留，未改产品或测试。

主123与知识89运行时均为clean ab5；独立运行时唯一自有依赖软链untracked与清理后clean分别记录。双方自有PG已清，所有本批专业角色FINAL且无孩子后，才实际执行[PR前漂移/阶段复核](pre-pr-drift-review.md)。此后只允许L0证据/台账/交付，33受测输入保持。

原W2–W7、全知识语义、健壮性性能/具体抽取/A23含已审、strict86/lint缺配置/A12/高风险/完整矩阵/family剩余4N及选项全载/容量UNKNOWN/未答方案/用户暂停项继续；整文件0/historyUnique未知。无UI修改未重跑本轮浏览器/strict/lint；后端合成签署链不是生产签署发布认证。本批仅关闭所述新申请签名归属子项。

下一轮先fetch真实合入/新增，再优先复现记录变更引用校验及候选读取的上下文信号；另一路DHR附件readAllBytes沿既有容量队列去重复核、量化后讨论。二者当前不算已确认或已修复，原无依赖跨链/权限/事务与健壮性审查继续。不自动merge/deploy/恢复，不查询或触发CI/Actions。
