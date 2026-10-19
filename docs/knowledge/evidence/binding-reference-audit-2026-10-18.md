# 活动绑定引用审查的既有依据与工程边界

本批对应 `AUD-H004`，决策包为 `docs/development/branch-review-20261018-w3-binding-references/decision-package.yaml`。来源、目标及本体角色实际读取的项目/角色/交接契约为 `edhr-dev@ca98ab2897990eba30bf1433134aa8560578f562`；此前 PR16 已合并，目标合并树与 `c54abcf259930982e360dd3a6310d4569a997fde` 完全相同。本批知识保持 `0.3.25 / schema 1.2.0`、既有成熟度与内部投影，只同步当前绑定引用缺陷，不重开已合入的显式模式整改。

## 声明级依据

- `DEC-0023-03/04/08` 及[原始设计](production-form-process-permission-default-exception-design-v2.md)第10行明确：绑定真实表单后例外沿稳定 `fieldId` 保存、只属于当前绑定；切换表单或流程版本后，失效例外必须清理或阻止保存。两种处理均已允许，不能把原实现缺口改写成新政策。
- `DEC-0035-01/02/03` 及[原始权限组确认](production-form-process-user-confirmed-v4.md)明确现行配置单元：填报权限组与审批节点组。此前按单个主体表述的清理约束须按现行组键解释，不能把一个组内的多个成员拆作独立权限组。稳定真实字段、组默认权限和绑定独立性保持。
- `DEC-0035-04/05` 及[按钮事件原始记录](production-form-process-buttons-events-v2.md)第14行要求事件来自所选已发布流程、字段来自所选表单；切换版本后失效绑定不能继续保存或生效。缺少签名字段是否允许发布仍由原完整校验负责，不在草稿引用检查中新增完整性要求。
- `DEC-0009-01/05` 继续允许不完整作业草稿，不要求草稿已选生效表单、全图连通或必需签名字段全部完成；保存不改变当前发布版本。
- `DEC-0067-01/02/03/04/05` 的显式模式、适用配置、不可变新快照及原权限签署继续适用。非活动模式草稿保留是原工程选择，不因本批成为新增用户政策；本批不检查或清理休眠配置。

上述依据可共同适用，没有需要用户再次决定的冲突。本批不新增、替代或扩大 DEC 声明；`DEC-0035` 对旧主体粒度、`DEC-0067` 对旧无流程免校验/清空绑定的既有局部替代范围保持。`DEC-0023` 的验收场景和人员架构说明中仅写“清理”的投影按原始“清理或阻止保存”规范纠正，原始确认与历史报告保持原文。

## 原始源码问题

以下 `original-evidence` 是上述固定基线的只读源码核对，不是当前测试通过证明：

- `WorkTemplateController::saveGraph` 对 FORM 草稿只做配置对象/已提供模式枚举和普通图数据检查，没有验证已提供的活动权限组、字段和事件引用；切换绑定后直接保存可持久化失效例外。
- `FormFillSettingsService::validate` 已完整核对所选流程、权限组、真实字段和按钮签名绑定；工序绑定保存/复制、作业发布等严格入口经过该校验，但不能据此推定作业草稿入口具有同一引用防护。不能简单把完整 `validate` 挪到草稿保存，因为它同时要求完整模式、表单、流程和必需签名字段。
- 共用 `FormFillSettings` 切换表单流程只合并所选引用，原“字段权限设置”弹窗的明确保存命令只调用 `pruneEventBindings`，将收到的 `fieldPermissions` 原样传回；已不在当前主体列表中的旧权限组无法靠该界面删除。现有 `pruneFieldPermissions` 已按组键和稳定字段完成局部过滤，可在明确命令内复用。
- 流程选项列表的摘要不等于完整流程图。引用变化后必须等待当前键对应的详情与表单版本成功，不能把空列表、加载失败或过期详情解释为真实空权限组并自动删除配置。

继续沿用 `discrepancy.form-process-binding-switch-draft-retains-invalid-exceptions` 和 `AUD-H004`，不另建同根缺陷。

## 工程落实范围

以下属于决策包的 `inference`，不是新增逐字用户确认：

1. 服务端采用原允许的“阻止保存”：只有显式合法活动模式以及所选表单和必要已发布 `FORM_PROCESS` 上下文可解析时，检查已提供的权限组、字段及事件引用；拒绝发生在图/版本、引用投影和审计写入之前。已有合法例外和组默认值不变，不自动清理或回填。
2. 未选模式、未选表单或未选流程，以及引用记录不存在、流程未发布或类型不匹配等未完成上下文，允许草稿保留原输入，不把发布完整性检查搬到草稿。“未完成上下文”不包括已有记录的损坏 JSON 或仓储读取异常；这些错误应传播并使保存失败，不能吞掉后当成空元数据清理配置。完全没有已提供引用时不新增无意义的元数据读取。最终发布继续原完整 `validate`，其中权限、签署、精确节点/按钮诊断和必需绑定不放宽。
3. UI 的纠正放在既有字段权限弹窗的明确保存命令，同时复用 `pruneFieldPermissions` 和 `pruneEventBindings`。仅当当前所选键的真实元数据成功时允许确认；初始打开、切换过程、失败和取消不制造写入，不拿列表摘要当完整流程图。共享组件同时服务作业及产品/产品簇工序入口，父适配、MUI/AppDialog 和现有反馈继续保留。
4. 原完整严格校验和新快照/冻结消费者不扩改，不迁移或恢复历史数据，不夹带 `AUD-H009/H010`、A12 和两项用户暂缓的旧 DHR high，也不声明整个 W3/W2 或全分支审查完成。

## 首轮实现与验证时点

首次同步时主侧实现与测试尚未完成，当时仅记录原始源码问题与既有约束并保留 open，未预写 resolved 或运行通过。当前源码稳定后，本体实际重读三个生产修改文件：

- `FormFillSettingsService::validateDraftBindingReferences` 只在显式模式和已提供引用下读取元数据；缺少表单/必要流程ID、引用记录不存在、流程非PUBLISHED或非FORM_PROCESS等未完成上下文仍允许草稿保留。实际引用集合复用 `BindingReferences`，按 `start:<groupId>`、`start:open`、`approval:<nodeId>` 及节点/事件键检查提供值；合法默认权限和例外保留，未提供的必需签名字段不由草稿强制补齐。首轮已检查仓储异常传播，JSON语法错误也会失败；原完整 `validate` 仍要求全部适用事件绑定当前可用签名字段，权限、按钮和签署校验保持。原说明将此泛化为所有损坏JSON均不放行，漏掉合法JSON非数组的分支，按下节独立质量发现纠正。
- `WorkTemplateController::saveGraph` 在版本节点/连线赋值、版本保存、引用投影重建和审计记录之前调用有限引用检查。缺少模式的草稿保持未配置，与本批之前已经合入的显式模式修复一致；发布继续完整门禁。
- `FormFillSettings` 以当前表单版本成功且PROCESS详情成功作为确认就绪条件，字段弹窗不可用时不允许纠正。其原明确保存命令同时 `pruneFieldPermissions` 和 `pruneEventBindings`，只更新活动分支；没有增加初始打开effect、流程列表摘要清理或失败/取消写入。产品及产品簇父适配未改，原严格保存/复制仍调用同一个共享service。

主会报告在原 `ca98ab2897990eba30bf1433134aa8560578f562` 执行新增三个Controller场景时，失效引用保存反例真实失败，合法/休眠及未完成上下文两个正对照通过，0 errors。原始共享UI反例同样真实失败：明确保存后残留 `start:removed`，没有page或console错误。这些失败定位既有缺陷，不用改业务规则使其转绿；本体不冒称亲自重跑原基线。

本体只读当前Surefire XML的suite/case元数据核对主侧最终结果：10个suite合计302项，299实跑通过、0失败/错误、3既有条件跳过。分别为 `FormFillSettingsServiceTest` 14、`WorkTemplateControllerTest` 72、`FormFillSettingsControllerTest` 2、`ProductProcessOwnerServiceTest` 7、`ProductProcessControllerTest` 14、`FormFillSnapshotTest` 3、`ProductionExecutionIntegrationTest` 71（68实跑/3跳过）、`ProductionExecutionEngineTest` 22、`ProductionExecutionFormValuesTest` 8和 `BusinessKnowledgeModelTest` 89。跳过仍为 `formRecordsBrowserFixture`、`firstStartFreezesOneCommittedConfigurationDuringProcessRebinding`、`browserEvidenceFixture`，不算作通过。新增场景覆盖两模式的失效组/字段/事件/事件字段、拒绝前无图/引用投影/审计写入、合法默认权限与休眠值保留、未完成草稿、必需签名仍属发布门槛、无引用不读元数据和仓储异常传播。后端集成使用H2 PostgreSQL兼容模式、MockMvc/JPA/JDBC及事务，不是本轮原生PostgreSQL验收。

本体实际读取 `/tmp/edhr-w3b-browser-final/browser-results.json`（11774 bytes，SHA-256 `10cd65370c2f5f5fdd5af40e9d2a8f474521a63f99c8f101af7b40d7d5c8ef39`）：6个真实Chromium场景passed，包括DIRECT/PROCESS在1440/390宽度的明确确认4场、PROCESS详情延迟1场、DIRECT表单元数据503失败1场。验证真实共享React/MUI组件及受控API，保留合法字段/default/签名绑定和休眠配置，打开与取消没有配置写入；失败场景精确记录一个预期503网络console，其余5场console为空，全部page errors为空。API均为GET，组件onChange命令由脚本观察，不是浏览器经认证写真实数据库；不据此冒称完整产品/产品簇整页或所有绑定切换序列已覆盖。

相邻显式模式浏览器原件 `/tmp/edhr-w3b-neighbor-browser/browser-results.json`（5899 bytes，SHA-256 `bb270ebd524388607c219d1cbdc720cdd5844244f6a93d46d06362d880245e77`）实际5场passed、page/console errors均为空，包括共用inline/dialog两宽度及真实WorkTemplateEditor在1440的原发布阻断/草稿保存重读。主会另报告Node 13项和前端构建通过；ESLint因既有缺配置退出2，本体未亲自执行这些命令，不把缺配置算作通过。原始产物和安全摘要按本批开发台账归档。

首轮本体依据当时源码与上述主侧证据曾将 `discrepancy.form-process-binding-switch-draft-retains-invalid-exceptions` 更新为resolved；该记录及原正式ontology结果均保留其时点，不能覆盖随后独立质量发现。原用户确认、固定历史审查及旧失败证据保持。该状态不提升DEC-0023等现行成熟度、知识版本、schema、P0/in-progress或客户/运行时投影，不新增试点或执行契约。本体自己的结构、引用、状态、投影和路径诊断不等于全库语义审计或产品运行验收，也不替代本批全新独立质量实例的最终 `qualityResult`。

## 首轮独立质量失败与同切片确定性补正

本节为同一H004切片的必要增量，不新建政策或扩大审计。实际源码基线为 `ef07ee7c34520c509d91954bd6fff4ca436ecd9d` 加明确工作树修复；目标仍为 `edhr-dev@ca98ab2897990eba30bf1433134aa8560578f562`，项目/本体/交接契约没有相关增量，知识仍 `0.3.25 / schema 1.2.0`。

首轮全新独立质量已正式返回 `failed`，原件为 `docs/development/branch-review-20261018-w3-binding-references/evidence/independent-round1/edhr-w3b-independent-quality-result.yaml`（13976 bytes，SHA-256 `3a37692a69888c62956ec54f02f113fb9f574acaefc3db4ae9a5f35fc294fe6c`）。其中 `QF-W3B-001` 为medium：已有PUBLISHED FORM_PROCESS的 `nodesJson` 为 `{}`、JSON null或字符串时，有限guard的 `if (!nodes.isArray()) return` 将结构损坏当作未完成上下文放行，实际图被改写，版本保存、引用投影重建、审计保存各调用一次。独立探针中的数组和语法错误对照均拒绝且零写入。原正式failed与原始探针证据不改写；此前主侧302项及前端通过不能抵销该发现。

根因是在有限草稿检查中用提前return处理已存在记录的非法节点结构，不是业务未决。既有决策包已经规定损坏元数据及查询异常不吞掉、不当空集合放行；本次只将该分支改为与原严格校验一致的“表单流程节点格式不正确”拒绝。新增 `WorkTemplateControllerTest::rejectsMalformedPublishedProcessMetadataBeforeGraphOrAuditWrites` 循环 `{}`、`null`、JSON字符串及语法错误4种结构，断言保存拒绝、原图不变且版本/引用投影/审计零写。缺失ID、记录不存在、未发布/类型不匹配的不完整草稿范围、合法/休眠配置以及原完整权限签署门槛没有变更。

本体只读根侧安全摘要 `/tmp/edhr-w3b-repair-red-summary.json`（405 bytes，SHA-256 `45ca0f9083f1c90ce6a95ede3dd704a152a04627fb0e23d81be9d5496969dc5c`）：新增测试对ef07原生产源码真实1失败、0错误，Maven退出1。随后只读 `/tmp/edhr-w3b-repair-regression-summary.json`（43106 bytes，SHA-256 `4caf6badc79ad227782bbfae281f26c267ad4855fe90c7627809fa2195a9a9a9`）：修复后Maven退出0，原10个suite共303项、300实跑通过、3原有条件跳过、0失败/错误；WorkTemplateControllerTest为73，其余suite数量不变，新增4结构循环测试passed。未归档或展示包含敏感运行内容的raw XML/log，本体未亲自执行Maven。

本体实际核对修复源码SHA-256 `df7a1fc457cf38f9cd5c1c76175990674402af184ad051204ef1dbf572b2e136`，Controller测试SHA-256 `978660d98def059f9e557b8daada393a2b7b999a04e894809de031777224dc91`。当前同根discrepancy据确定性修复及主侧回归维持resolved的实现状态，交付仍须取得全新独立质量的最终passed；首轮failed不可用旧ontology或主侧测试替代。根侧未为此后端修补重跑未变前端，13 Node、6个共享UI、5个相邻UI及构建结果仍属于ef07原候选，不冒称覆盖当前工作树。范围复核、用户PR前整体进度/剩余工作汇报及最终新质量由主会继续完成，本体不提前宣告可合并。

原正式 `/tmp/edhr-w3b-binding-ontology-result.yaml`（8083 bytes，SHA-256 `fe6a5d5a0c437cb8bd46eebc44333696b77e4172c862d3b5a6f39a90e6d31af7`）保持原件，当前增量另出followup结果及诊断。没有新增定义、知识ID、政策、版本或成熟度提升；A12、两项旧DHR high、H009/H010和全分支剩余工作保持原边界。
