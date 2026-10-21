# W3 实例管理写入口权限

延续 edhr-dev 整体审查，执行级别 L2。PR20 已人工合入：最新目标 `e8ecc103c8e6825c61c61b39b9cbd12b1474700e`，合并树与交付 `a23f94c2` 相同。PR5–20 不重开。本批核心提交 `fc0980035d717fd1790ac72c907f940390540c4d`，知识提交 `684db88a` 的正式 ontologyResult 已 updated/FINAL，89知识校验及6条有限语义核对通过；当前等待全新独立验收，尚未创建 PR，不宣称整轮完成。

发现 `W3C-INSTANCE-WRITE-AUTH-001`：普通登录者可通过实例 POST、PUT、DELETE 直接调用仓库，绕过相邻 terminate 和任务管理写入口已有的 `workflow.intervene`。修复仅给这三个入口加同一既有权限声明，不新建权限码，不改变管理员裸 CRUD 内容政策、读取、候选审批或 DHR 专属规则。依据和范围见 [decision-package.yaml](decision-package.yaml) 与 [findings.md](findings.md)。

主侧真实 JWT 过滤链、方法安全、JPA 事务代理及隔离 PostgreSQL 的同一 22 项，旧产品基线为 9 个预期403实际200、13个正向/保护对照通过；三行修复后22全过。最后相邻组实际89 Java、0失败/错误/跳过，其中45原生PG（新22+既有转办23）；DHR生命周期5项是H2兼容模式。重复运行不累计覆盖数。原首个夹具缺事务代理导致22个setup错误，已修正夹具并保留原件，不计产品缺陷。见 [validation-summary.json](evidence/primary/validation-summary.json)。修复后主侧运行时 HEAD 仍是旧提交、源码处于未提交状态的事实保留；实际字节与随后核心提交对应，最终独立验证须针对干净固定候选。

本批不涉及前端、UI、迁移、依赖或配置，未执行浏览器/视觉/前端构建或生产迁移。此前 premium strict 和 ESLint 的限制保持历史状态，不称本批已通过全站门禁。未查看或触发 GitHub Actions，未改历史数据或恢复生产库。

当前固定清单见 [ledger/summary.json](ledger/summary.json)，有限范围、历史及新增语义、整改处置分别记录；正式知识原件见 [ontologyResult](evidence/ontology/edhr-w3c-final-ontology-result.yaml)。下一步由全新实例独立验收。创建 PR 前实际向用户汇报任务有无漂移、当前进度和后续范围。整体审查仍有完整W2/W3、W4–W7、四个历史知识gap和用户暂缓的记录控制/DHR两项high/A12；相邻源码线索不自动计为已修复或已验收。
