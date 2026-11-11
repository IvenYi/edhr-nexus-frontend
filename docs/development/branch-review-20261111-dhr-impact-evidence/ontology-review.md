# 本体有限复核：DHR 冻结证据与附件读取

正式结论：`not-applicable/FINAL`。本角色只读仓库、仅写自身/tmp证据；未修改代码、测试、迁移、接口、知识或配置，未运行Maven/业务数据库/浏览器、查询触发CI、合并、部署或恢复历史，未创建子角色。

基线知识0.3.25/schema1.2.0，P0/in-progress不升级。目标7629506c真实PR81合入整树等59253386；实际再次fetch未变。来源候选及最终契约读取提交见candidate-binding.json，376输入完整SHA绑定，353知识与目标全字节相同。初始源码/测试字节保留initial-source-binding.json，不冒称初始dirty测试就是最终受测字节。

有限语义18项：15 consistent、2 evidence-gap、1 needs-decision。记录逐项带ID、原成熟度、来源定位、实际方法范围和依据；与历史批次有交叉，不报新增unique或全库一致。本体NA意味着无需同步新知识，不是没有核对规则合理性。既有规则合理：完整关联证据按同版冻结，身份/状态/源内容与附件SHA变化可提示；读失败不能静默净化，过时批准由写时锁内重核阻断，人工退回或新版本重审，旧冻结与批准保留。50MiB是既有单附件含边界上限，非本轮新政策、附件数量上限或全部格式/生产容量认证。人工确认是人的核查责任，不替代客观检查或自动判读任意质量/源签名有效性。

源码原始证据：DhrSummaryService.submit形成真实冻结和REQUIRED流程；version按候选/独立证据/版本digest核对后调用changes(false)。DhrReviewService.detail先核任务资格，再version，再changes(false)覆盖，确认同一次请求重复；act具有独立workflow→production object→DHR锁、当前资格/expected hash/活动申请/人工确认/未完成份检查和changes(true)，不能用详情结果代替。DhrEvidenceImpactService.changes按冻结成员批量读取当前表单、检测缺失/新增/修订/状态/内容及附件范围/VERIFIED/完整SHA，保持原件异常为变化提示，不重写旧证据。当前附件匹配为逐当前项扫描冻结数组，摘要仍readAllBytes；这是成本信号，不是必须改变业务规则。DhrAttachmentService既有提交metadata复用与流式verifiedFile不代表本changes入口已流式。DhrReviewController的审计和单附件下载还会先detail，后续整HTTP/响应输出成本不是本角色已运行的结论。

PERF-DHR-REVIEW-REPEAT-001早已登记，且原H2测试明确观察两次changes(false)；本轮canonical PG/文件读取/分配量化是同风险补证，不重新算新unique。原逐表单查询PERF-DHR-EVIDENCE-NPLUS1-001已有独立批读修复，不凭旧表笼统重开。仅同请求复用/有界摘要/附件ID索引是可讨论的工程方向，当前取证不构成自动实施批准；批准命令锁内实时核对、权限、文件完整性、冻结成员和历史保护不可删。A23区分必要失败可见保护和重复成本，不把catch后标记evidenceChanges误说成校验通过。

测试源码的真实saveDraft/submit和冻结流程创建支持本切片fixture含义；并非实际首次生产START、浏览器到后端E2E或全HTTP权限矩阵。本轮新增原生审批fixture按已有合法配置不要求签名，不称新电子签署全矩阵；相邻签署回归只能由其各自原件证明。本体未运行这些测试；具体通过数、逻辑读取/JFR/SQL与线程累计分配均须由主侧与全新独立QA最终原件证明。累计分配不是堆峰值/RSS/并发容量，逻辑文件读取不是物理磁盘IO。原件恢复仅自有临时fixture，不授权恢复任何业务历史。

本角色只复用PR81主侧原89项正式知识结构校验，359输入与当前候选/目标逐字节相同；不是本角色本轮执行Maven，也不能由结构通过推定全库语义。原始规范及用户确认按仓库版本化资产读取，旧报告只作secondary-reference和去重索引，未重获外部客户原附件/原会话，不据此捏造本轮客户验证。

保留两项DHR high的精确剩余：通用质量/异常/源签署在内容未变时的自动判读和变化比较；当前收件人改派/多或无限制候选/旧提交人无法唯一恢复的组合验证。此次附件读取取证不关闭它们，不恢复旧的“根本无DHR联动”错误概括。完整A12历史、归档/放行、非MVP多租户、用户暂停、其他未答性能和全量W2–W7/A23复查、strict86/lint缺配置及生产容量UNKNOWN继续。不存在依赖当前切片的新业务问题或语义冲突。
