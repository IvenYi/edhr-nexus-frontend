# edhr-dev 整体审查：首批 W0 / W1

用户授权连续 W0→W7；本目录是持续台账，不是全分支已经审完的证明。2026-10-15 已实际完成交接评估、实时基线、全量盘点、历史去重、第一条 DHR 链源码映射和一个确定性缺陷整改。未合并、未部署、未恢复历史数据、未触发或查询 GitHub Actions。

## 交接评估与基线

完整读取附件 START-HERE.md 和 HANDOFF.md，17 份清单文件的大小/摘要全部匹配。授权边界、W0→W7 顺序、主审所有权、真实独立验收、小批提交及仅业务歧义询问均合理；附件内容作为交接依据，不覆盖用户约束。包摘要及契约 blob 见 [baseline.json](baseline.json)。

交接点 `3977329d` 已过期。首次实时目标 `537bb240` 比交接点增加 38 提交、234 个差异路径，包含 DEC-0077 投影/追溯和 DEC-0078 最终产出，旧 TODO 不能直接认定当前缺陷。再次 fetch 后目标为 `e9c00df8`：累计 39 提交、236 差异路径；新增提交仅改三份启动/交付文档，已实际阅读，源码和知识未变。修复分支通过普通合并保留目标及协作者历史，不强制重置。

知识版本仍为 0.3.25 / schema 1.2.0；版本号不替代 Git 基线。源审查、知识和结构子任务保留其实际 `537bb240` 来源；相关 blob 与新目标一致后才承接，不能把原报告日期/基线改造成新运行证据。PR5/PR6 已合并，历史通过记录只在原有范围保留。

## 实际覆盖

| 台账 | 实际内容 | 不代表什么 |
| --- | --- | --- |
| [coverage.csv](coverage.csv) | 最新目标全部 1,423 个跟踪路径，无排除；13 个二进制也登记 | 文件仍以 inventory-only/pending 起步，不是全量语义通过 |
| [entrypoints.csv](entrypoints.csv) | 437 个 HTTP 注解位置、191 个前端路由候选位置、1 个后台任务、8 个状态机定义候选 | 不是 437 条已鉴权/已运行接口；类注解、动态路由还需解析 |
| [migrations.csv](migrations.csv) | 124 个迁移目录文件，包含主清单/初始化及 SQL | 不是执行顺序已验收，也不等于 124 条 changeset |
| [ontology/ontology-coverage.csv](ontology/ontology-coverage.csv) | 起点 252 份知识文件、2,485 个声明 ID | 不是每个 ID 的实现已一致 |
| [ontology/semantic-review.jsonl](ontology/semantic-review.jsonl) | 33 项实际静态核对：28 consistent、1 局部 superseded、4 evidence-gap；其余 2,452 pending | 不是 33 项运行通过；旧成熟度/历史报告不计本轮通过 |
| [history/history-dedup.json](history/history-dedup.json) | 21 个唯一历史主记录，另 6 个结构线索 | `confirmed-current` 只指原角色核对到的源码观察，不自动升格为业务缺陷 |
| [structure/refactor-plan.md](structure/refactor-plan.md) | 七项具体拆分候选，接口、所有权、不变量、测试、顺序与回滚 | 未执行大模块重构，结构风险不冒充运行错误 |

历史 12 项中 2 个已知修复、9 个当前静态观察、1 个当时待复核；扩展后的 21 项为 10 个已知修复、10 个当前观察、1 个待复核。主审随后对唯一待复核的关闭审计原子性完成红绿复现并修复，覆盖结论叠加记录于 [findings.yaml](findings.yaml)，不篡改历史助手报告。F004 保留待审，不与 F002/F003 的历史修复混为一项。

33 项映射后新增一个关闭审计 test evidence，当前候选知识定义为 2,486；这是本轮增量，不回填起点分母，也不计作全体语义完成。

## 本批判断

第一条 DHR 创建—冻结—历史读取链见 [dhr-lifecycle-map.md](dhr-lifecycle-map.md)，未证实该已读链上的新代码偏差，仍有明确未覆盖环节。已证实的高优先级问题是关闭工单的审计/状态提交不原子，首轮代码提交 `292dd898` 增加事务。独立质量随后实际复现到该候选的 JPA 陈旧实体并发重复关闭，详见 [原始失败报告](evidence/independent-first-failed/quality-result.yaml)；最终修复增加锁前读取，先获取行锁再建立 before 快照，保留服务状态校验。不改可关闭状态、权限、业务校验或数量规则。

首轮 4 例中 2 例失败，修复后 55 例通过仍未覆盖 JPA 缓存并发。最终回归升级为真实 WorkOrder 实体、Spring Data JPA 仓储、Hibernate/JpaTransactionManager/H2，并增加双请求用例；其余仓储仍为替身，审计写实际同事务 SQL。完整红绿和适用范围见 [validation.md](validation.md)。本批独立质量结果另存 `quality-result.yaml`，该结果只裁定本批交付，不是 W1–W7 完成或全分支可发布的证明。

全新最终独立质量结果为 [passed](quality-result.yaml)，实际干净候选 `1dac6338c24efb2330fe8702ed018e55a8947711`，10 项适用检查通过，独立后端 56/56、知识 89/89，两个 high 均 resolved，本批 blockingConditions 为空。报告及用例索引原样保留；随后只增加报告和交付台账，不改变受测代码、测试、知识或工具字节，核对清单见 evidence/final-independent/candidate-protected-manifest.json。

下一步按 [NEXT.md](NEXT.md) 连续推进。全量审查继续进行，目前没有需要用户新增决定的业务问题；已存 open questions 不用重复询问，也不会擅自补政策。
