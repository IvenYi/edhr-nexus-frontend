# W3 AUD-H003：填报模式中央服务调用点（只读追加）

角色为临时只读技术辅助，不是实现、本体或独立质量验收。实际读取基线：sourceCommit、targetCommit、contractReadCommit均为 `b191e054892ae06cb0d8a45f62d034deabbba3e3`；targetBranch=`edhr-dev`，当前工作分支 `audit/edhr-dev-w2-runtime-contract-20261018`；uncommittedContractPaths=[]；知识0.3.25/schema1.2.0。沿用已读AGENTS/codeplz/统一交接契约，本追加亲读DEC-0009、DEC-0036、DEC-0067及填报设置原始确认。

未修改repo，未运行测试、build、browser、数据库或Actions；以下测试均指源码断言阅读。本报告不替用户回答W2选项多处配置所有权问题，相关依赖继续等待主侧确认。

## 原始规则及草稿边界

- `docs/knowledge/decisions/DEC-0067-form-fill-settings.yaml` DEC-0067-01/04/05：作业FORM和产品/产品簇工序表单显式选择DIRECT/PROCESS，适用设置贯通保存重读、快照、运行；已取消缺失模式推导、开放默认、旧数据兼容/迁移；新快照仍不可变，权限/签署不能放宽。
- `docs/knowledge/evidence/form-fill-settings-confirmed.md` user-confirmed原文同上；其inference明确“双模式草稿独立保留”和存储方案是工程选择，不能解释为旧数据双轨；“保存/发布拒绝无效配置”列为交接包工程方案，不应把它扩大为取消全部草稿能力。
- `docs/knowledge/decisions/DEC-0009-production-work-flow-publish-validation.yaml` DEC-0009-01：草稿允许保存不完整配置，明确不要求填写节点已选生效表单版本、全图已经从开始连通结束；仍允许基础格式/节点引用/普通出口检查。发布才承担完整性准入；01/05无被0067整份替代的声明。
- `DEC-0036-01A`已deprecated的“无流程则跳过配置校验、清流程即清绑定”范围被0067局部替代；保留表单版本必选、流程冻结与受控升级。不能以旧01A或旧测试证明当前允许缺失模式。
- **精确边界**：不完整草稿与运行默认是不同责任。已确认草稿可缺表单引用/连线；已确认缺失模式不得被解释为DIRECT。原始文件未逐字规定“缺失模式草稿一定能保存”或“必须拒绝所有未配完的PROCESS草稿”；不可仅从源码现状推定其中任何一条新政策。模式枚举基础检查与完整配置校验也不是同一层。

历史去重：`docs/development/branch-review-20261015/history/history-dedup.md:20` AUD-H003对应 `discrepancy.form-fill-settings-missing-mode-default-and-validation-bypass`，当前DEC0067同名差异仍open。本追加不新建重复发现。

## 中央服务现状

文件前缀均为 `gmp-platform/backend/src/main/java/com/zencas/edhr/`。

`workflow/service/FormFillSettingsService.java`：

| 方法/行号 | 当前行为 | 单独收紧usesProcess是否足够 |
|---|---|---|
| usesProcess24 | `.path("fillMode").asText("")`；非空且不在DIRECT/PROCESS拒绝；空串/空白、缺失、Json null落false。Java null直接NPE；非对象节点一般path后空串也落false。 | 只改变真正到达它的输入。需检查文本枚举类型，不能仅凭asText接受其他JSON形状。 |
| parse30 | null/blank字符串→{}；否则readTree。 | parse的只读序列化职责不会因usesProcess变化而自动改变。 |
| directNode47 | 从directFillConfig复制config或空对象，造entry START。 | 生产仅由validate内部调用；无独立生产端入口直接绕过usesProcess的调用点。 |
| activeBinding55 | 调usesProcess；PROCESS返回整个settings，DIRECT返回directFillConfig或空对象。 | 生产仅validate内部81调用。 |
| serialize60 | null/Json null→{}，对象deepCopy，其他类型拒绝；**65先缺失/null补DIRECT**，66再validate。 | **不足**：补值先发生，strict usesProcess看不到原missing/null。 |
| validate70 | **71整体null/Json null/missing提前return**；非对象拒绝；73 usesProcess；PROCESS校验发布流程及活动绑定，DIRECT校验当前directFillConfig；随后校验主体、权限、字段和签署绑定。 | **不足**：整体null/missing仍提前跳过。不能为闭合模式检查删掉权限/签名验证。 |

## 所有生产调用点及其因果

当前主代码对usesProcess的外部直接调用为四处；内部为activeBinding与validate。serialize的外部调用两处，validate外部一处。未见非表单settings调用。

### 1. 产品及产品簇工序绑定

- `masterdata/service/ProductProcessOwnerService.java:114` createVersion、134 updateVersion→`:295` saveOperationBindings→`:332` `fillSettingsService.serialize(form.getFillSettings(), form.getFormTemplateVersionId())`。仅迭代request.forms，**documents不调用**；空forms列表不调用。
- 该共享service由`masterdata/controller/ProductProcessController.java:245–267` process-owner API使用，ownerType可PRODUCT/PRODUCT_FAMILY，不是只有产品簇。创建复制来源时`OwnerService:123`→`:386` toOperationRequests→391 parse存储JSON→332再serialize；缺失旧值复制会遇到新strict/serialize策略，不能宣称是纯新建影响。
- 产品旧路由独立实现：`masterdata/controller/ProductProcessController.java:296` createVersion（316/320）、337 updateVersion（349）→`:464` saveOperationBindings→508 serialize。复制读取579 parse，响应676 parse；同样只处理forms，documents不调用中央服务。
- `masterdata/dto/ProductProcessVersionRequest.java:57` fillSettings为可空JsonNode；60的4参重载构造和64的3参构造保留null。它们是缺失输入来源，**不是允许缺失的政策**。
- 序列化收紧会拒绝这些缺失表单设置的create/update/copy。读取workspace/response/audit只调用parse，不会自动因usesProcess收紧而拒绝。事务边界位于create/update方法；本辅助未验真实回滚。

### 2. 作业图保存、读取引用状态、发布

- `workflow/controller/WorkTemplateController.java:183` saveGraph：仅kind=FORM进入196；198缺失/null补DIRECT，199 usesProcess；非FORM START/END/CONDITION/CONFIRMATION/通知配置不调用。只调枚举判定，没有完整fillSettings.validate。因此**strict usesProcess本身仍不能拒绝保存层已经补值的missing/null**。当前保存允许未选表单和未连线，不能顺手改成完整发布校验。
- 同文件`:632` formProcessReferenceStatuses→641 usesProcess：先按FORM筛选，再按PROCESS读取formProcessVersionId/当前发布/升级兼容提示。由`:173` listFormProcessReferences的GET触发；前端`WorkTemplateEditor.tsx:1816`对非virtual版本自动query，不只发布时使用。因此strict会使含missing/blank模式的**已存不完整草稿引用状态读取**抛错，需要区分可观察的配置错误与无条件整个列表失败；本报告不代主侧选择处理方案。
- 同文件`:236` publishVersion→244→`:743` validatePublishableFormProcessReferences：748只有has(fillMode)或has(directFillConfig)才749调用validate；750 usesProcess决定DIRECT跳过流程引用校验。没有两个键时仍走旧formProcessVersionId分支，值空即continue；**中央strict不会自动触及这条旧旁路**。发布前243已检查表单版本生效，不能把“表单版本存在”代替模式/适用配置有效。
- `workflow/service/FormProcessReferenceService.java:27` rebuildForWorkVersion **不调用中央模式服务**：遍历FORM中的formProcessVersionId重建使用投影，draft异常catch注释声明草稿可暂时不完整；saveGraph211、发布262/264等调用。其当前行为、注释和使用投影不构成缺失模式默认政策，也不应由此次调用点调整静默改变删除保护/版本所有权。
- `workflow/controller/FormFillSettingsController.java`只调用`settings.process(versionId)`查已发布流程，不调用usesProcess/serialize/validate；不会因中央模式枚举收紧直接误伤候选列表。

### 3. 新执行快照与当前已冻结执行

- `production/service/ExecutionSnapshotBuilder.java:86–92`：读取product_process_operation_form_binding.fill_settings_json，JSON空值fallback{}→139 attachFillSettings→140 usesProcess。FORM工序配置的missing/null/blank会从旧DIRECT变成构建失败，符合不得运行默认的核对方向；不是documents或整个operation config被误当settings。
- 同文件`:123–129`：遍历发布work图，先kind=FORM筛选，传node.data.config进入同一个attachFillSettings。PROCESS冻结特定发布flow和binding；DIRECT冻结directFillConfig为entryNode/binding。模式没有单独存成顶层fillMode，执行靠冻结结构区分。
- `production/service/ProductionExecutionService.java:155` act（154为事务注解）：178仅首次START构建snapshot，181已有execution读持久snapshot/state；258 view在无execution时也尝试build，259–266捕获BusinessException形成configurationError空operations；因此中央strict可影响未开工预览/首次开工，**不会对已保存执行重新调用模式解析**。
- `production/service/ProductionExecutionEngine.java`对usesProcess/fillMode/DIRECT/PROCESS检索无调用：formControls158/167、formActionInternal222/235、initializeFormGraph734/738、提交330都依赖冻结form.has(flow)或entryNode。910 defaultFormNode在无entryNode时造开放START；这是存量/其他来源路径，中央strict不自动改变它；若主侧另改Engine必须另行查来源边界，不能据“中央拒绝”宣称已冻结数据必然被重验。
- **CUSTOM边界**：ExecutionSnapshotBuilder173 customForm→form(versionId)，没有调用attachFillSettings，合法自定义表单当前没有fillMode。Engine defaultFormNode覆盖该来源。原始填报设置确认证据“自定义挂载表单配置入口不在扩展范围”；不能将这类无模式误判为工作/工序绑定缺陷后直接拒绝。DHR汇总审批、记录控制设置同样没有中央服务调用。

## 现有测试源码与需要保留的验证目的

这里只列亲读的断言/夹具；没有执行或计数通过。

### 明确固定错误默认/旧发布旁路

1. `backend/src/test/java/com/zencas/edhr/workflow/service/FormFillSettingsServiceTest.java:43` `savesExplicitDefaultWithoutInferringFromDormantReference`：45 `serialize(null,1L)`断言fillMode=DIRECT；46 `{formProcessVersionId:"2"}`断言usesProcess=false。名称里的Explicit不能替代输入缺失事实。
2. `.../workflow/controller/WorkTemplateControllerTest.java:738` `saveGraphPersistsExplicitDirectModeWithoutInferringDormantProcess`：747输入只有formProcessVersionId，752断言保存补DIRECT，并保留旧流程引用。它固定缺失→DIRECT，不是显式DIRECT模式隔离正例。
3. 同文件318 `allowsPublishingAFormNodeWithoutAFormProcess`：输入只有formTemplateVersionId702，断言PUBLISHED，固定无模式/无新配置的发布旁路。正确无流程业务能力须用显式DIRECT正例保护，不能把“无流程”本身改成非法。

### 无模式的旧测试夹具可能提前失败，不能删除原验证目标

同WorkTemplateControllerTest：272 publishesDraftAndCreatesTheNextInheritedDraft；302 allowsPublishingAFlowWithoutConditionNodes；334 allowsSignatureEventWithoutFieldFillToRemainUnbound；360 rejectsANonSignatureFieldAsSignatureTarget；386 reportsTheExactNodeAndButtonWhenASignatureTargetIsMissing；414 allowsASignatureFieldAsSignatureTarget；442 allowsPublishingLegacyFlowFieldConfigurationWithoutMapping；466 rejectsPublishingWhenBindingPermissionReferencesUnknownFormField；486 rejectsBindingAnEventWithoutExplicitFieldFill。均亲读到FORM配置有流程/表单引用但没有fillMode。收紧后若只因模式先失败，不能将其原签署/例外字段/生命周期正反例算仍有效。1042/1058/1076的不存在/未生效/过期表单版本测试和1094孤立节点测试也用缺失模式夹具；当前发布顺序可能先在表单版本检验失败，实际需以运行结果判断，不预言全部失败。

该类测试`@InjectMocks`字段（48–56）**没有FormFillSettingsService mock或真实实例注入**；原publish多数走旧分支所以不触及它。将新publish路径统一中央validate后，夹具不仅需明确模式，还需要真实/适当注入服务，否则可能NPE而未验证业务。此为测试结构观察，不是当前测试运行错误证明。

### 草稿正例需保留

同文件1007 `savesAnIncompleteDraftWithoutPublishValidation`：FORM连config都没有，edges=[]仍保存；测试主旨是保留未完成表单/图，不是证明可以推导DIRECT。622 `keepsAnUnconfiguredConditionNodeInDraftButRejectsPublishingIt`独立保护条件草稿，不应受FORM模式逻辑影响。可以用明确模式且尚缺表单版本/流程引用的夹具继续验证草稿政策，但本辅助不承担修改方案。

### 工序/快照相关

- `.../masterdata/service/ProductProcessOwnerServiceTest.java:85` beforeEach注入真实FormFillSettingsService；188 `recordsProductFamilyUpdateAndDeleteAuditsWithOperationConfigurationSnapshots`，245–246 FormBindingRequest.builder缺fillSettings，201–204读出formBinding也未设置fillSettingsJson。它会真实触发null序列化；应保留产品簇审计目标，不能用mock掩盖缺失模式。
- `.../masterdata/controller/ProductProcessControllerTest.java:363` 外目录拒绝和388重复表单拒绝用旧四参FormBindingRequest，fillSettings=null；这些路径按当前顺序在serialize前因目录/重复拒绝，不能推断strict后必然失败，不能降低原拒绝测试。
- `.../production/service/FormFillSnapshotTest.java:16` DIRECT带休眠流程引用，证明不读取休眠flow、deepCopy后源config变更不影响binding；34 PROCESS证明发布版本图+binding冻结。它们均**已显式模式**，是应保留的正例，不是缺失兼容断言。
- `.../production/controller/ProductionExecutionIntegrationTest.java:176,547` 工序绑定fixture显式DIRECT；1228作业FORM显式PROCESS；1284 direct签署配置显式DIRECT。未运行，不宣称完整回归已通过。
- FormFillSettingsServiceTest其他正反例仍需保留活动模式隔离、字段不存在、主体资格、按钮重复、签名绑定、guardMode不可取消等约束，不能为补模式而松动。

## 交付结论边界

中央严格模式判定未发现非表单settings生产调用，但其调用层同时包括写入、发布、草稿引用状态读取和首次执行构建，不能把一个函数改动视为单端点影响。缺失补值、null early-return和publish旧旁路均位于strict判定之前/之外；只改usesProcess不能关闭AUD-H003。已冻结执行不重新读当前模式，自定义挂载入口不在DEC0067本切片，不可擅自全局新增拒绝。

源证据足以推进明确默认推导差异的主侧定位与必要验证；不替用户决定W2选项归属，不改变任何业务政策，也未声称代码已修或质量已过。
