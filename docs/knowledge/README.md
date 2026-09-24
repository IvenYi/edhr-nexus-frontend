# eDHR 结构化业务知识基线

当前知识模型版本：`knowledgeModelVersion: 0.3.24`，schema 版本：`1.1.0`。

当前工作树增量 `DEC-0069` 确认生产对象提前结束同步使关联 DHR 真实进入“已终止”，保留已保存证据并停止普通执行；不自动作废表单，不新增独立质量审批。终止后补录与异常结案审核延期，企业 SOP 额外签名要求留作未来配置研究。此增量为 `specified/internal`，保留 0.3.24 基线：正式知识测试固定断言该版本，本角色只拥有知识资产，不修改测试代码；与主开发集成时再协调版本发布。工作树运行实现和迁移仍需独立核验，不能据源码片段宣称交付。详见 `DEC-0069` 和 `evidence/dhr-termination-lifecycle-confirmed.md`。

当前工作树增量定义作业与工序表单共享填报设置（`DEC-0067`）：作业表单节点、产品/产品簇工序绑定表单都显式选择直接填报或按流程填报。直接模式配置权限组、字段例外、按钮和签署；按流程模式沿用既有流程配置；两处共用组件并要求保存、发布快照和运行闭环。仅替代 `DEC-0036-01A` 的无流程跳过配置校验及清除绑定配置边界，保留其他流程版本治理和 `DEC-0073`。最新 user-confirmed 指令明确当前 MVP 不兼容旧数据、旧数据可重造，取消历史回填、新旧双轨兼容和旧数据自动迁移，保留新执行快照不可变、权限与签署校验。旧兼容推断已撤销；双模式草稿保留与存储仍是 inference，不等同于双轨兼容。新知识保持 `specified/internal`，尚未独立质量验证。详见 `evidence/form-fill-settings-confirmed.md`。
当前工作树增量定义生产表单份备注及创建信息（`DEC-0066`）：切换份序抽屉展示表单总览与各份备注、真实创建信息、可复制实例号和状态，并突出新增与当前选择；新增时须填写本份备注，与模板业务字段值分开保存，成功选中新份、取消不创建。2026-09-24 补充悬浮备注显示编辑图标并可修改，覆盖进行中工序内的已完成份及进行中份，编辑不切换当前份。沿用原版本控制和审计事务，不改变编号时点、签名或完工规则。备注编辑资格复用、长度上限与存储方案单独作为推断记录；知识保持 `specified/internal`，不声明实现或发布验证完成。

当前 `0.3.24` 基线增量记录 DHR 汇总与制程审核配置（`DEC-0063`）：DHR列表 与 DHR汇总 使用独立菜单；汇总消费目录直接绑定、作业表单节点和生产执行自定义表单三类实例，在不可变基础目录之上允许增加多级覆盖目录，按实例创建受控关联，并在提交时冻结完整候选范围、归档关系、来源快照和哈希。产品/产品簇共用制程版本可选择 `NONE` 或绑定已发布 `DHR_SUMMARY` 流程版本的 `REQUIRED` 策略，并在首次开工时冻结；历史 DHR 不回填汇总版本或审核绑定。当前只完成配置与 `PENDING_REVIEW` 边界，DHR审核 独立菜单、审批实例/任务、电子签名、退回和批准结果落地仍属后续切片；不得把待审核解释为已批准或产品已放行。本体核对发现并已修复覆盖目录空 `parentKey` 可形成孤立根目录的偏差，服务端现强制所有覆盖目录位于基础目录之下。知识保持 `implemented/internal`，不表示发布级验证完成。

同一 DHR 汇总切片直接修订现有 `DEC-0072`：保留对 `DEC-0063-02`、`DEC-0071-01` 候选呈现的局部替代，右侧按 `originKind + operationId + formId` 展示来源卡片，同模板不同节点或创建项保持分开。默认整组归入，也可展开明确选择已完成实例，部分纳入显示 `x/y`；混合状态整组操作须明确反馈，不能静默跳过未完成实例。取消全组纳入、同目录和连续位置硬约束；草稿与 `readOnly` 冻结目录都保持真实交错顺序，左侧仅相邻同源实例折叠，每份可查看且草稿可逐份移出。底层 `validatePlacements`、既有证据纳入政策、源业务校验、必填目录和未完成补录阻断继续保留，不新增必填或选填豁免。候选、归档、顺序、哈希及审计仍逐实例，完整候选范围继续冻结，空来源不生成证据，冻结历史不改。修订规则为 `implemented/internal`，2026-09-24 主智能体聚焦浏览器及 20 项后端测试通过；浏览器拦截 API、持久化使用 H2，真实 PostgreSQL 提交及发布验收不在本次证据内；不新建决策或重复历史，不变更 `0.3.24` 基线。

同一切片继续直接修订 `DEC-0072`：全部已归档来源包括 DIRECTORY 支持草稿显示名，组行只改当前范围全部实例（可选折叠行仍限相邻段），单份仅改一份。别名只属于逐实例汇总关联，不改来源表单或基础快照；保存重开、提交冻结及重新整理继承，空别名回退原名，DIRECTORY 自动归位、固定归属和不可移除不变。目录去掉独立份数数字，单例也有实例列表按钮，行点击预览首份，拖拽只显示一个落点。沿用 0101、草稿审计与 placements 指纹，旧冻结版本不回写。全来源别名及本次交互已通过新增的聚焦持久化与隔离浏览器测试，保持 `implemented/internal`，不代表真实生产提交或发布验证。等宽槽、列表开合和零实例占位处置仅记为 inference，详见现有确认证据。知识基线仍为 `0.3.24`。

当前工作树增量定义 DHR 模板设计的版本隔离（`DEC-0061`）：批记录模板的复制版本可独立保存目录与表单引用；从版本行进入设计时，composition 的读取和保存必须同时绑定用户明确选择的 `templateId + versionId`，不得回退为缓存、默认排序、最新版本或父模板。该规则保持 `implemented/internal`；控制器和静态前端回归证据已登记，真实浏览器交互仍由用户验收，不改变 DHR 实例快照、审计或持久化结构。

当前 `0.3.23` 基线增量记录 DHR 实例管理第一期（`DEC-0062`）：BATCH/SN 生产对象在首次合法 `START` 时同事务自动创建唯一 DHR，冻结生产与 DHR 目录上下文，按 `dhrItemId` 自动聚合 `PRODUCTION_EXECUTION` 表单证据并按 `copyId` 保留每份，全部工序完成时同步进入 `COMPLETED`。本期只提供列表和只读详情，初始权限只默认授予管理员；进入该闭环的生产执行若缺失 DHR 必须阻断完成。汇总审批、发布归档、拖拽或人工补充不在本期。当前知识状态为 `specified/internal`，不把并行工作树实现误写为已发布能力。

`0.3.23` 纠正普通表单审批转办的决策 provenance：转办原本就是表单流程审批节点应具备的标准动作，早期“审批节点只有审批/退回、第一版不开放转办”是业务澄清与实现的共同遗漏，不是已确认的产品排除决策。`DEC-0024-01`和`DEC-0024-03`作为历史错误保留但标记为 `deprecated`，`DEC-0055`明确记录知识补录与运行缺口修复。本次只修正历史解释，不改变转办的权限、目标范围、原因、状态机、审计、UI 或已发布流程兼容策略。

`0.3.22` 补录并修复了早期遗漏的普通表单流程审批节点转办（`DEC-0055`），不表示此版本才新增转办产品方向。转办作为可配置标准动作，仅在当前审批待办中按当前处理权和节点到达时的冻结候选范围执行；原因固定必填，不推进节点、不修改表单数据、不产生审批结论，并复用原生产执行事务、结构化历史、审计和个人待办投影。填报责任转交、记录控制审批转办、管理员重新分配、加签和跳过不在该修复切片。知识保持 `implemented/internal`，不把 working-tree 证据解释为已发布能力。

当前基线补充 `DEC-0055`：生产工作台取消“结束本表单填报”，普通表单随工序完工统一收尾，作业表单所有已创建份最终完成后自动推进对应 FORM 节点。待审批不等于完成，普通选填未完成仍须告知且保留进行中。仅替代 `DEC-0046` 及 `DEC-0047` 中显式结束的前置要求，历史决定与其他多份规则保留；新规则维持 `specified/internal`，旧实例兼容与事务审计须按验收场景独立验证。

当前基线补充 `DEC-0056`：表单引用字段的来源、展示字段和查询条件贯通模拟与正式填报，覆盖主表及动态子表，并在正式提交验证有效性。既有冻结版本、生产来源权限、签名和审计契约继续适用；旧控件配置兼容及来源 SQL 映射等工程选择单独记录为推断。已有工作树源码和聚焦测试证据，知识保持 `implemented/internal`，不表示运行部署或发布验收已完成。

当前基线补充 `DEC-0058`：生产表单允许独立点击字段签名，使用个人电子签名密码及已认证图片，保存签名与审计并回显，提交仍独立。本份内容修改使本份已有签名失效并要求重签，历史签名及内容快照保留。既有按钮前账户密码签署事件保持独立，不从字段名称推断审核身份；新规则为 `specified/internal`，不宣称已实现、部署或通过发布验证。

`0.3.21` 增量记录所有主数据模块分模块推进的删除保护（`DEC-0053`）：存在阻断关联时拒绝删除，并展示关联记录、所属模块与处理位置；原权限、生命周期、版本所有权及生产历史保留契约继续适用。新规则保持 `specified/internal`，不表示全部模块已实现或已发布。实际引用覆盖、并发、权限和旧孤立数据兼容须逐模块验证，不新增强删或清空追溯记录的入口。

当前工作树增量定义全局表单实例的业务来源（`DEC-0057`）：来源是创建时持久化的业务承载域，用于查询、授权和产品展示，不是工序配置、作业发起或自定义附件等生产执行内表单入口类型。当前唯一有效值为 `PRODUCTION_EXECUTION`，展示为“生产执行”。保存、历史回填和查询读取已通过聚焦迁移及集成测试；独立质量验证仍待完成，因此规则保持 `implemented/internal`，不表示迁移已在任何运行库执行。

`0.3.20` 增量记录个人表单查询（`DEC-0052`）：三个填报视图和两个审批视图按源当前资格、主动创建身份或本人结构化成功动作历史查询；仅保存不算已填，退回保留历史。权限为生产来源权限加对应个人入口权限，不依赖全局查看；历史详情只读，写动作继续由源引擎校验。复用原执行状态、history及审计，不新增任务表或日志表。旧自由文本历史不推测，新接口仅覆盖生产来源；页面、独立新建、转发、变更作废和DHR不在本切片中。知识保持 `implemented/internal`，不表示已发布。

`0.3.19` 增量记录全局表单实例查询的来源授权和读写边界（`DEC-0051`）：专门实例查看权限加当前生产来源权限，允许查看默认租户内该来源全部已保存记录，不默认限定本人或部门。复用已有实例身份与源动作校验，不新增实例库或执行引擎。本切片已有源码和聚焦集成、迁移测试证据，知识为 `implemented/internal`；工作树实现与测试通过不等于已部署或发布，也不改变既有生产执行能力的独立证据。

表单流程公共主体选择器第一版统一支持用户、部门和角色三类稳定主体引用。部门默认覆盖本部门及下级，也可切换为仅本部门；审批节点到达时按最新组织或角色关系解析候选人，填报权限在用户访问时按最新关系判断。用户组、部门负责人和业务责任人尚无完整主数据与解析契约，不进入当前配置入口。详见 `DEC-0029`。

表单流程配置当前采用“主体默认权限 + 绑定级真实字段例外”模型：表单流程模板可复用于多个表单，节点可选保存填报或审批主体及“全部可编辑/全部只读”默认权限；未配置填报主体/权限组表示当前单租户内所有已认证用户可填报，未配置审批主体表示所有已认证用户可审批。作业流程的表单填写节点绑定具体表单模板版本后，才可按该版本真实字段的稳定 `fieldId` 配置例外权限，未配置例外时继承主体默认权限。开放范围不通过展开全量用户实现，仍受认证、流程实例、节点和任务状态约束。流程字段、字段槽位、业务字段分类、字段权限组和权限模板仅作为历史兼容概念，不属于当前新配置入口。详见 `DEC-0023` 与 `DEC-0033`。

表单流程节点按钮与按钮事件属于独立的配置层：开始节点支持保存、提交，审批节点支持审批、退回和转办。签署事件仅关联保存、提交、审批或退回，使用账户密码签名并可选择是否填充签名字段；转办原因固定必填，不配置审批意见必填或签名字段事件。流程版本只声明事件；具体字段绑定发生在作业流程表单填写节点并保存所选表单版本的稳定 `fieldId`。普通表单审批转办已在生产执行状态机和表单审批待办中实现，但其他按钮事件能力的成熟度仍以各自规则与证据为准。详见 `DEC-0025` 与 `DEC-0055`；`DEC-0024-01`和`DEC-0024-03`仅作为已纠正的历史错误保留，不进入现行范围投影。

生产执行运行时按当前活动表单流程节点投影 `controls.buttons`：填报节点保留暂存/提交，流转到审批节点后不再展示填报动作，只展示当前审批节点按钮配置的动作。底部节点动作栏由生产执行页渲染；`FormCanvasPreview`/`FormDocumentPreview` 只负责字段或文档内容，不承载第二套节点动作渲染。前端投影不能替代服务端当前节点、处理权和动作白名单校验；空或缺失按钮配置的历史回退策略仍需按实现差异单独处理。详见 `DEC-0073`。

记录控制审批流程与表单流程模板分开：审批流程只配置表单变更或作废申请确认后的审批路径、并行结构、审批主体，以及审批节点固定动作的按钮显示名称、样式、意见要求和电子签名，不配置发起填报权限、表单校验或具体签名字段绑定。开始节点只表示流程边界，不是用户任务且不配置按钮；申请内容、申请人电子签名和已发布流程选择在记录控制申请入口完成，点击确认即构成审批发起并应直接进入首个审批节点。审批节点固定提供审批、退回和转办，动作语义及显隐由系统固定，不能删除、替换、重复或隐藏；审批和退回可配置意见必填，转办不提供意见必填配置。转办的权限、原因、任务状态和审计沿用审批任务动作规则。每个审批节点发布前必须配置审批主体。公共流程阶段一已实现按 CHANGE/OBSOLETE 和对应发起权限查询当前已发布候选，以及通过 Java 端口按显式定义/版本幂等创建实例、保存审计关联和流程快照摘要、越过开始节点并创建排除申请人的首审批任务。记录控制申请入口、签名真实性验证、来源资格与业务锁、申请与流程原子事务、审批/退回/转办/撤回/重新分配、结果投递和业务落地仍待后续实现验证；结果处理器当前只有接口声明，不得解释为同步投递已经闭环。详见 `DEC-0037`、`DEC-0039`、历史决策 `DEC-0040`、替代决策 `DEC-0041` 与阶段一实现边界 `DEC-0042`。

审批语义的客户展示术语由 `DEC-0056` 统一：表达审批决策动作时页面、菜单、任务和流程配置使用“审批”；流程中心菜单/页面名称使用四字“审批流程”，不把“模板”放入该展示名。检查、评审、审计和 CAPA 的纠正措施等非审批语义保持原词；`REVIEW`、`APPROVAL`、`APPROVE`、路由、权限码和数据库标识保持不变。当前 DHR 审批运行时仍无实现证据，不能因术语统一而宣称已交付。历史决策、历史审计记录及原始证据中的旧词仅为追溯保留，不构成现行产品展示名。

记录控制域的现行中文产品动作名统一为“表单变更、表单作废、转办、重新分配、退回”。上下文明确时“表单变更/表单作废”可简称“变更/作废”；“更正、普通转办、管理重新分配”不得作为并列现行产品动作名继续用于新文档、页面、接口说明或验收用例。`correction`、`CHANGE`、`OBSOLETE`、`TRANSFER`、`RETURN` 以及现有 Java、数据库和权限标识属于稳定技术契约，本次不做破坏性重命名。CAPA 的“纠正措施”和普通语义中的“请求被拒绝”不属于记录控制动作术语治理范围。详见 `DEC-0043`。

本目录是 eDHR 业务概念、关系、规则、决策、证据和未决问题的机器可读权威来源。人员阅读架构文档、业务运行代码和界面都可以提供证据，但不能替代这里的结构化知识基线。

用户不手工维护本目录。主智能体从已确认的正常业务讨论中自动生成 `decisionPackage`，业务知识本体建模智能体依据角色契约更新知识资产；只有真正存在业务歧义时才请求用户确认。

## 目录结构

- `schema.yaml`：版本化词汇、枚举、记录结构、条件/结果语法与投影契约。
- `execution-contracts.yaml`：规则引用的已验证执行契约注册表；当前包含生产对象审计快照写入契约。生产审计中文字段属于展示投影，不新增或改写后端执行契约。
- `glossary.yaml`：稳定术语、定义、别名、知识状态和可见性。
- `ontology.yaml`：概念和概念间关系。
- `facts/*.yaml`：会被规则、状态、流程、权限、审计或执行契约引用的受控业务事实目录；每个事实同时声明稳定 ID、实现来源 `sourcePath`、规则语义别名 `aliases` 和最小 provenance。
- `implementation-anchors/*.yaml`：将概念、事实、规则和执行契约连接到代码、接口、数据库、页面和测试的实现锚点；锚点必须记录来源修订、定位、采集日期和复核状态。
- `rules/*.yaml`：按业务域维护的结构化规则。
- `rules/identity.yaml`：身份域主体在运行时展开、去重和来源保留规则。
- `decisions/*.yaml`：已确认决策、背景、替代关系、验收场景和实现差异。
- `evidence/*.yaml`：代码、数据库、测试和文档证据索引。
- `open-questions.yaml`：尚需用户判断的真实业务问题。

## 状态与投影

知识状态只能是：

- `planned`：已识别但尚未完成业务定义。
- `specified`：业务定义已确认但尚未实现。
- `implemented`：已有实现，尚未完成发布级验证。
- `verified`：实现、测试和执行契约证据完整且已验证。
- `deprecated`：已废弃，仅为历史追溯保留。

`status` 与 `visibility` 是两个独立维度：`status` 表示成熟度，`visibility` 表示记录可进入的发布投影。`visibility` 只能是 `internal`、`customer`、`runtime` 或 `customer-and-runtime`；它不能替代成熟度、执行契约或证据。

内部投影可读取所有状态，但不会豁免 `verified` 的契约要求。规则必须遵守以下不变量：

- `planned`、`specified` 和 `implemented` 必须为 `visibility: internal`。
- `verified` 无论 visibility 为何，均必须有非空 `executionContractId` 和非空 `evidenceIds`。
- `deprecated` 不得使用 `runtime` 或 `customer-and-runtime`。
- customer 投影只接受 `verified` 且 visibility 为 `customer` 或 `customer-and-runtime` 的规则。
- runtime 投影只接受 `verified` 且 visibility 为 `runtime` 或 `customer-and-runtime` 的规则，并再次要求有效执行契约和证据。

`executionContractId` 不是自由文本。任何 `verified` 规则都必须引用 `execution-contracts.yaml` 中真实存在的记录；被引用执行契约必须为 `verified`，visibility 必须为 `runtime` 或 `customer-and-runtime`，并具有非空证据。生产对象审计快照处理已具备控制器实现、聚焦测试和已验证执行契约，但规则本身按当前决策保持 `implemented/internal`，不提前进入客户或运行时投影；生产域审计展示在前端通过共享格式化器把已知内部字段和枚举转换为中文业务字段行，原始 `contentBefore`/`contentAfter` 不被改写。后续只有完成发布级验证后才可推进规则成熟度。其余未满足证据闭环的规则同样不得新增或伪造执行契约。

## Schema 驱动结构

`schema.yaml` 的 `collectionTypes` 将各顶层集合名映射到 `recordTypes`，`nestedCollectionTypes` 将决策内嵌集合映射到对应记录类型。校验器必须通过这两张映射发现记录，不得另行硬编码文件与记录类型对应关系；映射目标必须是已定义的 `recordTypes`，未知集合必须被拒绝。

`0.3.16 / schema 1.1.0` 是 P0 基线发布：事实目录、实现锚点、最小 provenance、正式 JUnit 校验、CI 门禁和表单流程版本引用首个试点已经纳入版本化知识资产。当前已扩展到全部非废弃规则事实，详见 `docs/knowledge/impact-analysis/ontology-p0-coverage.md`。目录覆盖不等于每个事实都已实现；事实状态必须服从逐条证据，规则 `implemented` 不能单独证明事实实现。P0 仍保留独立质量门禁和逐事实符号级定位缺口，详见 `DEC-0038`；前者关闭前不得把整个 P0 标记为 `verified`，后者暂缓到 P1。

`allowedFieldTypeDescriptors` 是 `fieldTypes` 的封闭语法。只允许 `string`、`integer`、`condition-expression`、`rule-result`、指向现有枚举的 `enum:<enumKey>`、`array<string>`，以及指向现有记录类型的 `array<recordTypeName>`。未知描述符、缺失枚举和缺失记录类型引用均为校验错误。正式 JUnit 校验器会消费这些结构约束，包括 ID 前缀、条件表达式形状、证据路径策略和执行契约引用完整性。

`schema.yaml.conditionBranchConfiguration` 定义条件节点配置的业务形状：`conditionBranches` 是有序、非空的分支数组，每个分支独立保存 `conditionRule`、字段目录版本和字段显示快照；`conditionDefaultBranch` 是唯一的“否则”默认分支，不携带条件 AST。输入契约只接受 `conditionBranches[].conditionRule` 与 `conditionDefaultBranch`，不兼容 `config.conditionRule`、分支 `rule` 或固定 `condition-true`/`condition-false` 出口；旧结构不属于当前输入和兼容契约。该结构描述配置和发布校验契约，不表示运行时字段来源、求值、实例快照或节点推进已经实现。

## 基数词汇

关系的 `cardinality` 固定按 `source -> target` 方向解释：

- `one-to-zero-or-one`：一个 source 关联零或一个 target。
- `one-to-zero-or-many`：一个 source 关联零到多个 target。
- `many-to-one`：每个 source 必须关联一个 target；一个 target 可被零到多个 source 关联。

除 `many-to-one` 已明确的反向语义外，其余词汇不对 target 端反向数量作额外断言。缺少已实现运行数据的关系必须用零下界，避免把配置或未来执行的可选性误写成必然存在。

## 标识规则

- 术语、概念、关系、规则、证据、未决问题和执行契约分别使用稳定前缀 `term.`、`concept.`、`relation.`、`rule.`、`evidence.`、`question.` 和 `execution.`。
- 决策和决策声明使用 `DEC-` 前缀，验收场景使用 `scenario.`，实现差异使用 `discrepancy.`；业务变化通过新决策的 `supersedes` 显式关联旧决策。
- 标识一经引用不得复用或改变语义；嵌套的决策声明、验收场景和实现差异同样必须全局唯一。
- 所有 `termId`、关系端点、`evidenceIds`、枚举值、必填字段和知识模型版本必须通过 `schema.yaml` 校验。
- 所有非废弃规则条件中的 `fact` 必须通过事实 ID 或事实 `aliases` 解析到事实目录，且使用的操作符必须在该事实的 `allowedOperators` 中；`factCatalogProfile` 只表示领域目录分组，不能用于绕过事实校验。废弃规则保留历史表达，不进入当前事实目录强制覆盖。
- 事实的 `sourcePath` 是实现来源定位，不等同于规则中的业务语义路径；规则兼容路径写入 `aliases`，新规则优先引用稳定事实 ID。
- 实现锚点必须指向已存在的概念、事实、规则或执行契约，并至少包含一类代码、接口、数据库、页面或测试引用。
- P0 事实和实现锚点的最小 provenance 包括 `sourceRevision`、`sourceLocator`、`capturedAt` 和 `reviewStatus`；`working-tree` 表示当前未提交工作树，不能被解释为已发布 Git 版本。

## 维护流程

1. 主智能体从已确认讨论生成 `decisionPackage`，区分 `confirmed`、`inferred` 和 `unresolved`，并声明本体升级阶段和退出条件。
2. 本体建模智能体读取当前基线、schema、相关实现和历史决策，只将 `confirmed` 写入权威资产；P0 任务优先登记规则实际引用的事实和关键实现锚点。
3. `unresolved` 非空时停止正式建模并返回 `blocked-by-question`；冲突通过新决策和 `supersedes` 解决，不静默覆盖。
4. 状态推进必须补齐相应实现、测试和执行契约证据；缺少任一项不得标记 `verified`。P0/P1/P2/P3 阶段没有退出证据不得标记阶段完成。
5. 修改后执行 Maven/JUnit 正式校验并进入独立质量验证；Ruby bootstrap 仅用于最小诊断。

## 正式校验

Maven/JUnit 是跨平台知识模型校验的正式入口，也是质量门禁依据：

```bash
cd gmp-platform/backend && mvn -Dtest=BusinessKnowledgeModelTest test
```

## Bootstrap 诊断

以下 Ruby 命令仅保留为最小 bootstrap/诊断手段，不是正式门禁入口。在仓库根目录执行；正式验证结果以 `BusinessKnowledgeModelTest` 为准。

```bash
ruby - docs/knowledge <<'RUBY'
require "yaml"
require "pathname"

root = File.realpath(Dir.pwd)
base = File.expand_path(ARGV.fetch(0), root)
paths = Dir[File.join(base, "**/*.yaml")].sort
docs = paths.to_h { |path| [path, YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)] }
schema_path = File.join(base, "schema.yaml")
schema = docs.fetch(schema_path)
raise "schema version" unless schema.fetch("knowledgeModelVersion") == "0.3.24" && schema.fetch("schemaVersion") == "1.1.0"
docs.each { |path, doc| raise "knowledge version: #{path}" unless doc.fetch("knowledgeModelVersion") == schema.fetch("knowledgeModelVersion") }

record_types = schema.fetch("recordTypes")
collection_types = schema.fetch("collectionTypes")
nested_collection_types = schema.fetch("nestedCollectionTypes")
mapped_types = collection_types.values + nested_collection_types.values
raise "collection mapping target" unless mapped_types.all? { |type| record_types.key?(type) }
raise "collection mapping coverage" unless mapped_types.sort == record_types.keys.sort
raise "duplicate collection mapping" unless mapped_types.uniq.length == mapped_types.length

descriptor_policy = schema.fetch("allowedFieldTypeDescriptors")
literal_descriptors = descriptor_policy.fetch("literals")
raise "literal descriptor grammar" unless literal_descriptors.sort == %w[condition-expression integer rule-result string]
raise "unknown descriptor policy" unless descriptor_policy.fetch("unknownDescriptors") == "forbidden"
parameterized = descriptor_policy.fetch("parameterized")
raise "enum descriptor registry" unless parameterized.fetch("enum").fetch("referencedRegistry") == "enums" && parameterized.fetch("enum").fetch("unknownReferences") == "forbidden"
raise "array descriptor registry" unless parameterized.fetch("array").fetch("referencedRegistry") == "recordTypes" && parameterized.fetch("array").fetch("scalarItemTypes") == ["string"] && parameterized.fetch("array").fetch("unknownReferences") == "forbidden"

record_types.each do |type, definition|
  definition.fetch("fieldTypes").each do |field, descriptor|
    valid = literal_descriptors.include?(descriptor)
    if descriptor =~ /\Aenum:([A-Za-z][A-Za-z0-9]*)\z/
      valid = schema.fetch("enums").key?($1)
    elsif descriptor =~ /\Aarray<([A-Za-z][A-Za-z0-9]*)>\z/
      item_type = $1
      valid = item_type == "string" || record_types.key?(item_type)
      if record_types.key?(item_type)
        valid &&= nested_collection_types[field] == item_type
      end
    end
    raise "unknown field descriptor #{type}.#{field}: #{descriptor}" unless valid
  end
end

records = record_types.keys.to_h { |type| [type, []] }
docs.each do |path, document|
  next if path == schema_path
  document.each do |collection, value|
    next if collection == "knowledgeModelVersion"
    type = collection_types[collection]
    raise "unknown top-level collection #{collection}: #{path}" unless type
    raise "collection must be records #{collection}: #{path}" unless value.is_a?(Array) && value.all? { |record| record.is_a?(Hash) }
    records[type].concat(value)
  end
end

queue = collection_types.values.flat_map { |type| records.fetch(type) }
until queue.empty?
  record = queue.shift
  record.each do |field, value|
    next unless value.is_a?(Array) && value.any? { |item| item.is_a?(Hash) }
    raise "unknown nested collection #{field}" unless nested_collection_types.key?(field)
  end
  nested_collection_types.each do |field, type|
    next unless record.key?(field)
    children = record.fetch(field)
    raise "nested collection must be records #{field}" unless children.is_a?(Array) && children.all? { |child| child.is_a?(Hash) }
    records[type].concat(children)
    queue.concat(children)
  end
end

records.each do |type, typed_records|
  definition = record_types.fetch(type)
  typed_records.each do |record|
    missing = definition.fetch("requiredFields").reject { |field| record.key?(field) }
    raise "#{type} missing #{missing}" unless missing.empty?
    definition.fetch("fieldTypes").each do |field, descriptor|
      next unless record.key?(field)
      value = record[field]
      valid = case descriptor
              when "string" then value.is_a?(String)
              when "integer" then value.is_a?(Integer)
              when "condition-expression", "rule-result" then value.is_a?(Hash)
              when /\Aenum:(.+)\z/
                allowed = schema.fetch("enums").fetch($1).map { |item| item.is_a?(Hash) ? item.fetch("id") : item }
                allowed.include?(value)
              when "array<string>" then value.is_a?(Array) && value.all? { |item| item.is_a?(String) }
              when /\Aarray<(.+)>\z/ then value.is_a?(Array) && value.all? { |item| item.is_a?(Hash) }
              else false
              end
      raise "#{type}.#{field} type" unless valid
    end
  end
end

prefixes = schema.fetch("idPrefixes")
raise "ID prefix coverage" unless prefixes.keys.sort == record_types.keys.sort
records.each do |type, typed_records|
  prefix = prefixes.fetch(type)
  typed_records.each { |record| raise "#{type} ID prefix" unless record.fetch("id").start_with?(prefix) }
end
all_ids = records.values.flatten.map { |record| record["id"] }.compact
raise "duplicate ID" unless all_ids.uniq.length == all_ids.length

terms = records["term"].to_h { |record| [record["id"], record] }
concepts = records["concept"].to_h { |record| [record["id"], record] }
evidence = records["evidence"].to_h { |record| [record["id"], record] }
execution_contracts = records["executionContract"].to_h { |record| [record["id"], record] }
contract_policy = schema.fetch("projectionRules").fetch("executionContract")
contract_reference = contract_policy.fetch("referencedBy")
raise "execution contract source type" unless contract_reference.fetch("recordType") == "rule"
raise "execution contract target collection" unless collection_types.fetch(contract_reference.fetch("targetCollection")) == contract_reference.fetch("targetRecordType")
raise "execution contract target type" unless contract_reference.fetch("targetRecordType") == "executionContract"
records["concept"].each { |record| raise "unknown term" unless terms.key?(record.fetch("termId")) }
records["relation"].each { |record| raise "unknown concept" unless concepts.key?(record.fetch("source")) && concepts.key?(record.fetch("target")) }
records.values.flatten.each do |record|
  Array(record["evidenceIds"]).each { |id| raise "unknown evidence #{id}" unless evidence.key?(id) }
end

path_policy = schema.fetch("evidencePathPolicy")
evidence.each_value do |record|
  next unless path_policy.fetch("mustExistForTypes").include?(record.fetch("type"))
  configured_path = record.fetch("path")
  raise "absolute evidence path #{configured_path}" if path_policy.fetch("relativeOnly") && Pathname.new(configured_path).absolute?
  expanded = File.expand_path(configured_path, root)
  if path_policy.fetch("mustRemainWithinRepository")
    raise "evidence path escapes repository #{configured_path}" unless expanded.start_with?(root + File::SEPARATOR)
  end
  raise "missing evidence path #{configured_path}" unless File.file?(expanded)
  if path_policy.fetch("mustRemainWithinRepository")
    real_path = File.realpath(expanded)
    raise "evidence symlink escapes repository #{configured_path}" unless real_path.start_with?(root + File::SEPARATOR)
  end
end

condition_schema = schema.fetch("conditionExpression")
raise "condition additionalFields" unless condition_schema.fetch("additionalFields") == "forbidden"
validate_condition = lambda do |expression|
  raise "condition expression" unless expression.is_a?(Hash)
  group_keys = expression.keys & condition_schema.fetch("groupKeys")
  if group_keys.any?
    raise "condition group shape" unless group_keys.length == 1 && expression.keys == group_keys
    key = group_keys.first
    if key == "not"
      raise "condition not" unless expression[key].is_a?(Hash)
      validate_condition.call(expression[key])
    else
      raise "condition #{key}" unless expression[key].is_a?(Array) && !expression[key].empty?
      expression[key].each { |child| validate_condition.call(child) }
    end
  else
    raise "condition fields" unless expression.keys.sort == condition_schema.fetch("clauseRequiredFields").sort
    raise "condition fact" unless expression.fetch("fact").is_a?(String)
    raise "condition operator" unless schema.fetch("enums").fetch("ruleOperators").include?(expression.fetch("operator"))
    value = expression.fetch("value")
    value_type = case value
                 when String then "string"
                 when Integer then "integer"
                 when TrueClass, FalseClass then "boolean"
                 when NilClass then "null"
                 when Array then "array"
                 end
    raise "condition value" unless condition_schema.fetch("clauseValueTypes").include?(value_type)
  end
end

records["rule"].each do |record|
  validate_condition.call(record.fetch("condition"))
  result = record.fetch("result")
  raise "result fields" unless schema.fetch("ruleResult").fetch("requiredFields").all? { |field| result.key?(field) }
  raise "result type" unless schema.fetch("enums").fetch("ruleResultTypes").include?(result.fetch("type"))
  status = record.fetch("status")
  visibility = record.fetch("visibility")
  policy = schema.fetch("projectionRules")
  internal = policy.fetch("internal")
  non_verified = policy.fetch("maturityInvariants").fetch("nonVerified")
  verified = policy.fetch("maturityInvariants").fetch("verified")
  deprecated = policy.fetch("maturityInvariants").fetch("deprecated")
  raise "internal status" unless internal.fetch("allowedStatuses").include?(status)
  raise "internal visibility" unless internal.fetch("acceptedVisibilities").include?(visibility)
  raise "non-verified visibility" if non_verified.fetch("statuses").include?(status) && visibility != non_verified.fetch("requiredVisibility")
  if verified.fetch("statuses").include?(status)
    verified.fetch("requiredFields").each { |field| raise "verified missing #{field}" unless record.key?(field) }
    verified.fetch("nonEmptyFields").each do |field|
      value = record[field]
      raise "verified empty #{field}" if value.nil? || (value.respond_to?(:empty?) && value.empty?)
    end
  end
  if record.key?("executionContractId")
    contract_id = record.fetch("executionContractId")
    raise "empty execution contract reference" unless contract_id.is_a?(String) && !contract_id.empty?
    raise "unknown execution contract #{contract_id}" unless execution_contracts.key?(contract_id)
  end
  raise "deprecated runtime visibility" if deprecated.fetch("statuses").include?(status) && deprecated.fetch("forbiddenVisibilities").include?(visibility)
  ["customer", "runtime"].each do |projection|
    projection_policy = policy.fetch(projection)
    next unless projection_policy.fetch("acceptedVisibilities").include?(visibility)
    raise "#{projection} status" unless projection_policy.fetch("allowedStatuses").include?(status)
    projection_policy.fetch("requiredFields").each { |field| raise "#{projection} missing #{field}" unless record.key?(field) }
    projection_policy.fetch("nonEmptyFields").each do |field|
      value = record[field]
      raise "#{projection} empty #{field}" if value.nil? || (value.respond_to?(:empty?) && value.empty?)
    end
  end
end

records["executionContract"].each do |record|
  raise "execution contract status" unless record.fetch("status") == contract_policy.fetch("requiredStatus")
  raise "execution contract visibility" unless contract_policy.fetch("acceptedVisibilities").include?(record.fetch("visibility"))
  contract_policy.fetch("nonEmptyFields").each do |field|
    value = record[field]
    raise "execution contract empty #{field}" if value.nil? || (value.respond_to?(:empty?) && value.empty?)
  end
end

puts "Bootstrap knowledge validation: passed"
RUBY
```

负向变异探针必须失败：以下命令在临时副本中把一个规则变为 `verified/internal` 并移除执行契约；若 bootstrap 没有失败，则知识模型校验存在缺口。

```bash
tmp_dir="$(mktemp -d)"
cp -R docs/knowledge "$tmp_dir/knowledge"
ruby - "$tmp_dir/knowledge/rules/product-process.yaml" <<'RUBY'
require "yaml"
path = ARGV.fetch(0)
document = YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)
rule = document.fetch("rules").first
rule["status"] = "verified"
rule["visibility"] = "internal"
rule.delete("executionContractId")
File.write(path, YAML.dump(document))
RUBY
if awk '/^ruby - docs\/knowledge <<'"'"'RUBY'"'"'$/{found=1; next} found && /^RUBY$/{exit} found {sub(/^  /, ""); print}' docs/knowledge/README.md | ruby - "$tmp_dir/knowledge"; then
  echo "negative mutation unexpectedly passed" >&2; exit 1
else
  echo "negative mutation rejected as expected"
fi
```

Ruby bootstrap 或负向探针通过不能替代 Maven/JUnit 正式校验，也不得作为发布级验证结果。
