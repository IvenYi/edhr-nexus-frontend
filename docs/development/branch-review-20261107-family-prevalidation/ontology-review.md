# 产品簇批量添加预校验：有限本体核对

本角色为仓库要求的本体角色，非实现或独立产品质量角色。固定源/目标/契约读取 `5e8edb47ae91af83555f4b67a87598c3c2a9a664`，PR73 merge整树同ffc8e443；知识 `0.3.25` / schema `1.2.0` / P0 `in-progress`。当前状态FINAL；已一次只读绑定最终来源 `4ee3efba39c5ff44972561ae25956c33a0c14357` 及主侧实际产品原件。

用户已明确批准对call_dad21472bffe4d2d8d878fa7adb7c04e选择“先批量化预校验读取（推荐）”，并保留原实时复核、写入和审计；这是工程性能授权，不新增业务政策，也不是自动合并/部署授权。DP三类选中ID有界读取在现有Service负责、512只限单次SQL参数、不限制总选择，是合理的最小扩展路径。

有限28个现行ID已重新读取实际YAML并核对原始源码，旧包仅提供导航清单，不复用旧一致结论或加算全局unique。本批12直接/16相邻，27项在“业务保留与工程边界”范围一致、1项精确来源证据缺口。类型、成熟度、业务规则和知识文件均未改；这28不代表整个文件、整领域或931全量语义覆盖。

直接规则包括半成品/产成品资格、每产品最多一簇、集合0..many与产品归属0..1、物料主数据复用、原成员审计中文投影及多产品同簇场景。资格规则合理：批读后仍按原输入去重顺序判定首错，已有其他簇归属不可由普通添加改成转移；同簇原跳过、第二轮写前成员即时读取、原新关系/产品与目标簇两方审计必须保留。空、缺失、无类型和不合格错误不因批读而改义；本批不为状态增加未授权资格。

实际批量入口 `/api/v1/master-data/process-modeling/product-families/{id}/members/batch-add` 只有列表请求体及 `master-data.product-families`，本身没有confirmed参数；二次确认属于相邻transfer入口。保留确认规则不能写成给batch-add新增确认。转移继续PR73在原事务delete后flush、新ID与三方审计；批读不得改成原位UPDATE、拆事务、放宽unique或自动重试。

`fact.catalog.product-productfamilycount` 的integer类型与唯一归属规范保持，真实成员仓储/即时唯一索引可支撑0或1归属。其sourceLocator仍为 `product.productFamilyCount` 语义路径，原 `ProductProcessResolutionService` 读单一成员归属、没有同名计数求值接口，不能据 implemented/internal 或父规则说明推定完整通用运行事实provider。此为 `discrepancy.ontology-p0-coarse-fact-locators` 已明确保留到P1的粗定位证据缺口，本批记 `evidence-gap`，不新建count API、不伪造policy替代或新确认功能bug，也不把该项算完整实现一致。原事实来源不是本次应改的业务规则。

相邻范围保留产品优先/当前产品簇兜底、未开工对象首次START按当前归属/有效性/形态重核后冻结、已开工快照不改。作业按当前上下文实时匹配后续工序，已创建（即使零业务节点）实例沿原快照及归属，已过站不补做。PR73纠正的confirmed/reason两fact仍指实际Controller；保持string语义标签和无原因字段，不构建通用事实注册。无新增概念、关系、执行契约或成熟度提升，因此正式 `ontologyResult: not-applicable`，不为颜色硬改知识。

350个知识文件已逐字节与固定源核对全部相同，sha256sum清单摘要 `ec67bff59cf2f8b848caa4ab70cc3ed2b2e2ad9dd08228679b95d6389d00a8b4`。本角色实际运行独立知识校验 `bash /workspace/.edhr-cloud-tools/mvn-edhr --batch-mode --no-transfer-progress --file tools/knowledge-model/pom.xml clean test`，89项、0失败/错误/跳过；见knowledge-result.json及XML。这是schema/引用/投影等校验，不是产品、PG、HTTP、浏览器或生产性能验收。

已读取主侧同测试字节旧新PG SQL、跨512边界且总量完整、资格/冲突首错、第二轮双连接并发、审计/关系失败整体回滚及查询/累计分配观察。已从主侧原件读取100样本602→404；全部观察见本报告末尾与source-binding.json，本角色未执行产品。预校验SQL减少不等于整个事务常量，第二轮和JPA merge依然逐项，参数批次不等于总量上限，线程累计分配不等于峰值/SLA。批读有必要的即时复核，不能仅因形状重复判为A23过度防御；请求局部映射不能变跨请求缓存或全租户加载。

最终已核来源 `4ee3efba39c5ff44972561ae25956c33a0c14357`、目标仍 `5e8edb47ae91af83555f4b67a87598c3c2a9a664`，契约无增量、350知识字节全同，主侧绿运行实际166项、0失败/错误/跳过，逐XML重计一致；knowledge89为本角色自己实际运行。当前未改任何仓库文件，未运行产品、PG、HTTP或浏览器，未查/触发CI，未merge/deploy/恢复历史，没有派发子任务。W2–W7、931知识/86UI、A12/高风险/完整矩阵、A23含已审及用户暂停队列保持；本批整文件完成0、historicalunique未知。


最终正式产物：ontology-result.yaml（not-applicable）、finite-review-records.json（28有限项、27一致/1gap）、source-binding.json、知识350前后清单与知识89原件。无repo改动，无孩子；最终独立产品质量由主侧另派未参与修复实例完成，本结果不能替代qualityResult。

主侧批量观察（仅读取原件，不冒称本角色运行）：[{"file": "bulk-conflict-order.json", "selectCalls": 5, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-1025.json", "selectCalls": 4108, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-513.json", "selectCalls": 2058, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-100.json", "selectCalls": 404, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-10.json", "selectCalls": 44, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-1.json", "selectCalls": 8, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-many-types.json", "selectCalls": 2059, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-concurrent-membership.json", "selectCalls": 5, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-raw-type.json", "selectCalls": 3, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-conflict.json", "selectCalls": 5, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-qualification-before-conflict.json", "selectCalls": 3, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-first-missing.json", "selectCalls": 2, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-first-ineligible.json", "selectCalls": 2, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-null-id.json", "selectCalls": 1, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-empty.json", "selectCalls": 1, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-null.json", "selectCalls": 1, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-existing-noop.json", "selectCalls": 7, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-ordered-duplicates.json", "selectCalls": 13, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-audit-failure.json", "selectCalls": 12, "scope": "parent actual observation; not executed by ontology role"}, {"file": "bulk-tenant.json", "selectCalls": 8, "scope": "parent actual observation; not executed by ontology role"}]。

原负控23=19通过/4项查询预算真实性能断言失败/0错误或跳过；这四项不是新的正常路径正确性bug。原native测试与最终同字节，负控Service同5e8；最终主侧166包含新native23及原相邻143（旧仓储6为H2，不混称全PG）。DP最终已明确batch-add无confirmed，仅转移原确认保持；初次来源和最终读取均保留，不覆盖初次快照。

主侧单独50k合成fixture prepared SELECT计划：material100/512用PK、member100用既有tenant/product唯一索引，member512与小类型表512选择Seq Scan；不宣称全部走索引、不把物理扫描等同应用全租户加载，也不据本地样本加索引。threadAllocatedBytes只为调用线程累计分配，不是峰值或生产SLA。

工具原件校准：首次源绑定工具误对git show的文件字节strip，导致README尾换行被裁去而SHA校验失败并停止。已保留初稿/裁尾快照/原因，改为git show保留原字节后重建来源指纹；知识350原清单及实际89运行本来有效，不改产品/测试/知识/需求、不重跑绿覆盖。见tool-calibration.json。
