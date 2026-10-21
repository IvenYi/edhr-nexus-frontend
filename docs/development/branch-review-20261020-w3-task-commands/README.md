# W3 实例管理写入口权限

已创建 [PR21](https://github.com/IvenYi/edhr-nexus-frontend/pull/21)，来源 `audit/edhr-dev-w3-task-command-boundaries-20261020`，目标 `edhr-dev`，等待用户人工合并。没有自动merge/deploy。实际独立受测42cb2820之后仅L0归档/验收/范围及PR登记；产品、测试、知识与冻结catalog/ledger未变。临时自建PG已按确切ID移除，见 [清理记录](evidence/owned-postgres-cleanup.json)。

延续 edhr-dev 整体审查，执行级别 L2。PR20 已人工合入：最新目标 `e8ecc103c8e6825c61c61b39b9cbd12b1474700e`，合并树与交付 `a23f94c2` 相同。PR5–20 不重开。本批核心提交 `fc0980035d717fd1790ac72c907f940390540c4d`，知识提交 `684db88a` 的正式 ontologyResult 已 updated/FINAL，89知识校验及6条有限语义核对通过。全新独立对干净候选 `42cb2820` 正式 passed，16/16必需检查通过，本轮权限切片已完成，等待PR交付；完整分支审查继续。

最终验收见 [acceptance.json](acceptance.json) 和 [独立qualityResult](evidence/independent/edhr-w3c-qa-qualityResult.yaml)。独立实际89业务+89知识、45原生PG均通过，零跳过；独立旧基线同fixture22为9红13正，与主侧一致。首次独立隔离目录缺前端打印构建资源导致0XML，保留环境失败原件，不计产品红证；补齐相同基线资源后有效复现。全部当前本体/质量实例及质量子实例FINAL后，已实际向用户完成[PR前范围复核](scope-review.md)。后续仅L0归档/登记，不改变产品、测试、知识或冻结catalog/ledger，不把原报告改为后续提交的重跑。

发现 `W3C-INSTANCE-WRITE-AUTH-001`：普通登录者可通过实例 POST、PUT、DELETE 直接调用仓库，绕过相邻 terminate 和任务管理写入口已有的 `workflow.intervene`。修复仅给这三个入口加同一既有权限声明，不新建权限码，不改变管理员裸 CRUD 内容政策、读取、候选审批或 DHR 专属规则。依据和范围见 [decision-package.yaml](decision-package.yaml) 与 [findings.md](findings.md)。

主侧真实 JWT 过滤链、方法安全、JPA 事务代理及隔离 PostgreSQL 的同一 22 项，旧产品基线为 9 个预期403实际200、13个正向/保护对照通过；三行修复后22全过。最后相邻组实际89 Java、0失败/错误/跳过，其中45原生PG（新22+既有转办23）；DHR生命周期5项是H2兼容模式。重复运行不累计覆盖数。原首个夹具缺事务代理导致22个setup错误，已修正夹具并保留原件，不计产品缺陷。见 [validation-summary.json](evidence/primary/validation-summary.json)。修复后主侧运行时 HEAD 仍是旧提交、源码处于未提交状态的事实保留；实际字节与随后核心提交对应，最终独立验证须针对干净固定候选。

本批不涉及前端、UI、迁移、依赖或配置，未执行浏览器/视觉/前端构建或生产迁移。此前 premium strict 和 ESLint 的限制保持历史状态，不称本批已通过全站门禁。未查看或触发 GitHub Actions，未改历史数据或恢复生产库。

当前固定清单见 [ledger/summary.json](ledger/summary.json)，有限范围、历史及新增语义、整改处置分别记录；正式知识原件见 [ontologyResult](evidence/ontology/edhr-w3c-final-ontology-result.yaml)。冻结台账保留验收前的fixed-awaiting-independent-acceptance，最终处置只登记acceptance.json。整体审查仍有完整W2/W3、W4–W7、四个历史知识gap和用户暂缓的记录控制/DHR两项high/A12；相邻源码线索不自动计为已修复或已验收。未自动merge/deploy。
