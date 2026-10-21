# 首版初始化与开发迁移审查（只读）

基线：`origin/edhr-dev@13def47d4def51237d1393eaa7bf2651e98a0cbd`；知识0.3.25/schema1.2.0。审查在2026-10-21完成。本报告未修改业务代码、迁移、知识、数据库或原工作区。

## 结论

当前所谓“初始化”实际是从早期开发模型逐次演进到当前模型的整条Liquibase变更链，并非整理后的首版空库建模脚本。存在一次性旧结构兼容、开发数据回填和明确清理，不能说“没有”。这些不等于必须对客户长期支持多个历史模型。

第一版对外交付可以整理成当前schema＋当前必需预置的干净基线，但这属于后续发布资产整理，不能直接删几份旧脚本：不少脚本同时承担当前必需字段/索引/约束和历史转换；已恢复的开发库还带有原databasechangelog身份与校验和。干净基线需空库安装测试、最终schema/预置对比、现有开发库承接方案及附件/证据校验，避免用新的兼容层给旧开发数据续命。

## 全量入口与清单

本次列举126/126个master直接包含的SQL文件，合计3858行；完整每文件路径、Git blob、行数、显式变更集头、注释和标记见`inventory.json`，内容按远端Git blob校核，未将原dirty文件冒充远端源码。SQL未引入嵌套include链。

- `application.yml:31-33`：Liquibase默认启用，指向`db/changelog/db.changelog-master.yaml`；Hibernate为`ddl-auto:none`。
- `application-dev.yml`：dev数据库默认`edhr_dev`并启用Liquibase。
- `application-projection.yml`：旧调试profile只覆盖端口/数据源/上传目录，继续继承同一个master，不是另一套schema。
- `docker-compose.yml`：Postgres创建默认数据库；backend启动后仍走同一个Liquibase链；没有额外挂载`docker-entrypoint-initdb.d`。
- backend Dockerfile：只准备依赖/上传目录，entrypoint为Java应用，不运行演示灌数。
- main Java未发现CommandLineRunner/ApplicationRunner灌数。唯一`@PostConstruct`为`StateMachineRegistry.init`，只扫描内存状态机元数据，不写库。
- 独立`backend/scripts/*demo*.py`及`verify-form-instance-migration.sql`不在启动master或Docker入口；演示脚本是手工工具，不是自动初始化。完整脚本工具清单不等同所有工具行为已逐一执行验证。

SQL内容标记分类（可重叠，不可相加）：

| 内容 | 文件数 | 说明 |
|---|---:|---|
| 前向DDL | 102 | 创建/修改当前表、列、索引、函数、触发器等；包括必要结构和历史结构替换，不能全部视为兼容 |
| 内置身份/权限/图标/物料类型/追溯预置INSERT | 24 | 默认管理员/权限等基础预置，无安速康业务演示数据 |
| 现有数据UPDATE或派生/基线INSERT | 44 | 需再区分预置修正、历史回填、引用索引和维护审计，不等于44份全为旧模型兼容 |
| 含前向DELETE FROM | 5 | 0010、0016、0086、0104、0112；0086中部分DELETE是当前引用索引触发器维护，不是清除业务数据 |
| 含前向DROP TABLE/COLUMN | 8 | 0010、0046、0047、0070、0090、0091、0095、0104，不含rollback注释 |
| 通过JSON配置UPDATE清除多绑 | 2 | 0116、0117，故仅搜DELETE会漏掉实际配置清理 |
| 旧Liquibase checksum白名单 | 7 | 0001、0002、0003、0061、0084、0086-deletion-protection、0087 |
| 保留旧孤儿引用的NOT VALID约束 | 2 | 0073、0086-deletion-protection；新写仍被检查，不等于全历史已经一致 |
| 自动插入安速康/虚构生产演示 | 0（本master范围） | 逐个核对全部INSERT目标及来源，未见业务演示插入；默认管理员、工厂和基础字典不是业务模拟记录 |

计数是可复核内容标记，不是全126文件的业务正确性批准。完整逐表/语义审计和空库启动没有由本角色执行。

## 有依据的历史兼容/回填实例

| 路径（db/changelog/下） | 实际行为/原因 | 空库行为（源码推定，非空库运行结果） |
|---|---|---|
| 0060a-work-order-legacy-table-preparation.sql:3-80 | 仅当旧work_order存在时补tenant/order_no/计划数量/时间；可由旧code和quantity回填，缺值会造`WO-id`、0和迁移时间。对应旧工单schema适配，不是当前正常创建入口 | 0001未创建work_order，precondition MARK_RAN；随后0061创建当前表 |
| 0069-work-order-legacy-column-constraints.sql:4-12、0077-work-order-legacy-product-reference.sql:4-23 | 仅在旧code列/指向旧product的外键存在时移除约束，不回写历史产品编号 | 对当前新表一般无匹配对象 |
| 0088a-dhr-instance-legacy-table-preparation.sql:3-22 | 仅识别旧code/batch_id/workflow_instance_id结构；有记录立即阻断，不猜生产对象；空旧表改名legacy后让0089建新表 | 空库无旧dhr_instance，precondition MARK_RAN |
| 0038-backfill-dhr-template-versions.sql:1-21 | 旧DHR模板无版本时补草稿版本 | 没有模板则不插入 |
| 0045-document-management-versions.sql:4-60 | 把旧SOP轻量文档变为首个受控版本并移关系；保留ID路径 | 结构与索引必须创建；转换部分无旧记录时为空 |
| 0051-document-version-code.sql:5-40 | 文档编号由主表转版本；重复旧编号追加ID，缺编号造DOC-id，主表code清空 | 当前版本code NOT NULL/唯一约束仍需；回填无记录时为空 |
| 0059-work-template-audit-baseline.sql:1-58 | 为没有审计的旧WORK模板写SYSTEM BASELINE并明确不是原用户CREATE；也改旧WORK启用状态 | 无WORK模板时不插入基线 |
| 0072-work-form-process-references.sql:4-79 | 从原作业版本JSON显式formProcessVersionId生成引用索引，专用负ID backfill序列 | 当前引用表/约束需创建；无旧流程则回填空 |
| 0082-form-instance-records.sql:31-55、0083-form-instance-query.sql:20-33 | 从已保存执行副本建立历史实例索引及BASELINE；再从自己的冻结snapshot补查询列，不猜原人身份 | 当前实例/索引表需创建；无旧执行时无业务行 |
| 0086-master-data-deletion-protection.sql:16-151 | NOT VALID保留旧孤儿但保护新引用；为JSON内引用建删除防护派生索引，并通过触发器持续维护 | 当前防护函数/索引/约束/触发器需要；数据回填无旧版本时为空 |
| 0094-created-at-schema-compatibility.sql:4-13 | 补实体映射要求而初始schema漏掉的created_at列，不造历史时间 | 空库也必须得到这些列；不能只删脚本而不把列并入干净基线 |
| 0098-dhr-early-termination.sql:25-51 | 只纠正可确定的旧DHR终止状态，记录historical=true、无原快照、迁移BASELINE而不伪造原操作者/原终止事件 | 状态与终止表需创建，无匹配旧DHR时不改业务 |
| 0109-saved-form-trace-index.sql:19-68 | 按实例自己的冻结追溯绑定重建保存内容的检索索引，并带legacy行定位后备值；不是按当前模板猜绑定 | 追溯索引表/索引需要；无旧实例时无回填 |
| 0118-signature-payload-text.sql:3-15 | 签名原文本摘要与JSONB规范化存储不一致的当前正确性修复；改TEXT并保留JSON合法性CHECK，不重算旧摘要、不重建丢失原始字节 | 空库也必须得到TEXT+CHECK；整理基线时应直接建正确类型，不能删除而退回JSONB |

## 明确清理/模型撤除实例

| 路径 | 清理对象与边界 |
|---|---|
| 0010 | 撤掉编码规则权限与表；当前0001/0002先建/先种再删，直接证明不是最终干净基线 |
| 0016 | 撤掉已取消物料类型独立页面权限与授权，保留物料类型本体 |
| 0046 / 0047 / 0090 / 0091 | 移除已取消或移入版本职责的配置/当前版本/快照/状态列；不是运行时旧新双轨 |
| 0095:4-8 | 已批准范围内丢弃重复remark列的内容，rollback只能重建空列，无法恢复原内容 |
| 0104:5-69 | 明确写“Development-model correction”；有审流程依赖或生命周期不符则阻断；把旧汇总布局恢复草稿、维护审计，删除旧汇总版本/证据；源表单/原审计不删除。对于新建空库DML无业务行，但最终删过渡列/设NOT NULL仍是当前schema形成步骤 |
| 0112:7-10 | 删除四项退役内置追溯定义（产品序列号、相关生产批次、班组、关联单据）；实例快照不改。新空库0108刚种12项，0112删4项，0113补日期后为9项，说明首发可直接种当前9项 |
| 0116 / 0117 | 用户2026-10-19明确授权清除存量字段多绑；删冲突字段全部追溯映射与空binding，保留其他合法配置和已形成证据；0117修空白区域身份漏扫，保留已应用0116 checksum。无模板冲突时不改行，新空库DML无业务数据 |

## 本轮可解释的动因与不能据此推出的结论

原始源码证明这些是连续开发期间的schema演进与旧MVP数据处置。git历史也可定位0060a最初提交`d4e581b84019615c5cbc199f826a0ad5eb95decf`（preserve legacy work order migration）；0104注释直接声明开发模型纠正。不能从这些推断客户已使用过V0或产品必须做多版本兼容。

`IF EXISTS`、`IF NOT EXISTS`、`ON CONFLICT`有时只是迁移幂等/重复预置保护，不能见到就认定错误兼容；`NOT VALID`、旧checksum白名单、旧字段回填和历史JSON fallback才应逐项判断是否还需要进入首发交付。历史快照按自身版本解释也不等于无条件旧代码双轨兼容，不能借清理首版删除签署/审计证据约束。

若要整理首版，建议在已统一开发环境的基础上单独形成受测候选：当前schema＋当前预置直接建成；把只对旧开发数据有意义的转换移出新安装路径；原迁移保存为开发历史而不伪造checksum；明确当前测试库采用全量导出/恢复或重建后的承接方式。必须比对函数、触发器、索引、FK/CHECK/NOT NULL、序列、当前9追溯项及菜单权限，不能只对比表数。不因这一建议自动展开重构或删除迁移。

## 已知知识集成风险

远端`DEC-0081`是2026-10-20“tenant-scoped-task-delegation”；原dirty原因/引用文件也使用`DEC-0081`。如果下一步把所有dirty功能集成，必须为尚未合入的原因/引用决策重编号并同步引用，这是同ID异义，不能认为Git无冲突就通过。该风险不阻塞按用户授权完整复制当前调试库至edhr_dev，但阻止声称所有本地功能已与最新edhr-dev完全一致。

## 范围与证据

original-evidence：远端master及126 SQL/blob；application、Docker启动入口；StateMachineRegistry；原dirty0115实文（单独标记，未混入远端126份）；DEC-0077-27/42当前知识确认与迁移/快照边界。secondary-reference：既有开发说明仅作导航，不用作迁移动因唯一证据。user-confirmed：本轮源调试库整体覆盖、旧测试数据不重要，以及先前允许直接删多绑配置。inference：空库分支推定和首发基线整理建议，未冒称已完成空库运行或已获重构批准。

本角色未运行数据库、SQL迁移、完整空库安装或业务E2E；未宣称全部126文件的全语义与发布正确性通过。主侧数据库恢复与最终质量验收另行进行；本报告不替代源库既有签名/审计摘要有效性的核验。
