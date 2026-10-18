# W2 运行消费链只读源码核对

身份：临时技术辅助；不是开发、本体建模或质量验收。未修改仓库文件，未运行测试、构建、浏览器、数据库或 GitHub Actions；不代表独立质量通过。

基线：sourceCommit / targetCommit / contractReadCommit 均为 `b191e054892ae06cb0d8a45f62d034deabbba3e3`，targetBranch=`edhr-dev`，实际工作分支=`audit/edhr-dev-w2-runtime-contract-20261018`，uncommittedContractPaths=[]。知识版本 `0.3.25`，schema `1.2.0`。下列行号在该基线核对。仓库根路径为 `/workspace/edhr-nexus-frontend`。

已读治理：AGENTS.md、codeplzreadme.md、docs/agents/agent-handoff-contract.md；知识README与open-questions，DEC-0034、DEC-0067及其原始确认证据，DEC-0075的相邻冻结/实例边界，DEC-0022历史替代说明。不是全量知识审计；没有提升成熟度。A12、记录变更/作废和两项旧DHR high仍遵守主侧的用户暂缓，不重开PR5/6。

## 1. fillMode：已有明确实现差异仍真实可达

现行依据：`docs/knowledge/decisions/DEC-0067-form-fill-settings.yaml` DEC-0067-01/04/05及`docs/knowledge/evidence/form-fill-settings-confirmed.md`原始user-confirmed：两入口显式模式，保存重读/发布冻结/运行贯通；MVP不要求旧数据兼容，不再缺失模式推导或开放默认；新执行快照仍不可变。该DEC已有 `discrepancy.form-fill-settings-missing-mode-default-and-validation-bypass`，本次不要重复编号当成新发现。

当前UI及服务链：

| 环节 | 原始路径/定位 | 实际结论 |
|---|---|---|
| 共享模式读取 | `gmp-platform/frontend/src/components/form-fill-settings/types.ts:34` fillMode | `value.fillMode ?? 'DIRECT'`，缺失仅呈现DIRECT，并未写回显式值。 |
| 共享UI写入 | `.../form-fill-settings/FormFillSettings.tsx:106,112,129,176` updateDirect/模式切换/流程选择/权限保存 | 用户发生这些编辑才写fillMode；组件mount未见强制写回。PROCESS使用所选已发布流程，DIRECT使用directFillConfig；非活动草稿保留不是历史数据兼容。 |
| 作业FORM创建 | `gmp-platform/frontend/src/pages/workflow-center/WorkTemplateEditor.tsx:2315` addQuickNode（2346）；`:2370` addConditionBranchNode（2439）；`:2775` addNode（2785） | 三条新增路径的新FORM config={}；随后显示直接填报，源码未写fillMode。 |
| 表单版本选择 | 同文件`:4038` onClick、`:2926` updateSelectedNode | 只合入formTemplateVersionId/name，旧config其余值保留，未添加模式。选择表单而不修改填报设置后保存，仍可向后端提交缺失模式。这是源码可达性，不是已执行浏览器结论。 |
| 作业存储 | `.../workflow/controller/WorkTemplateController.java:183` saveGraph、198 | FORM config缺失/null模式自动补DIRECT，再usesProcess。与显式模式/不推导契约存在已有差异。 |
| 发布 | 同文件`:236` publishVersion→244→`:743` validatePublishableFormProcessReferences（748） | 仅有fillMode或directFillConfig时进入新校验；无二者且无流程引用可continue。该绕过对历史/直接API写入数据形状可达；不等于正常saveGraph之后仍缺fillMode。 |
| 共享后端校验 | `.../workflow/service/FormFillSettingsService.java:24` usesProcess；`:60` serialize；`:70` validate | 空模式视非PROCESS，serialize补DIRECT；validate(null/missing)返回；无模式对象按DIRECT解释。未知非空模式拒绝。 |
| 工序入口 | `.../master-data/ProductModelingWorkspacePage.tsx:795` 和 `.../components/ProductProcessVersionEditorDialog.tsx:988` | 两入口新挂表单均显式初始化 `{fillMode:'DIRECT'}`；旧绑定重读仅复制其fillSettings（212/167），不能用新建路径证明旧值已清理。默认选择是否要求额外用户点击由既有产品确认解释，不能从代码自行新增“每次必点模式”规则。 |
| 工序持久化/复制 | `.../masterdata/service/ProductProcessOwnerService.java:332` serialize；`:386` toOperationRequests→391 parse；`.../masterdata/controller/ProductProcessController.java:508,579,676` | JSON存入fill_settings_json，读取与复制携带；两路径均复用同一共享服务，缺失补DIRECT会一起影响。 |
| 执行冻结 | `.../production/service/ExecutionSnapshotBuilder.java:86–92` 工序绑定；`:124–129` 作业FORM；`:139` attachFillSettings | usesProcess决定flow/binding或entryNode；PROCESS加载明确发布版本并冻结图；DIRECT仅冻结directFillConfig。缺失模式再次落DIRECT分支。 |

建议反证：新作业加FORM并选表单版本，不改模式面板，记录真实保存载荷；接口分别试missing/null/空串/未知枚举及显式DIRECT/PROCESS，正例必须保留。不要用模式对象缺失的历史样例证明允许兼容。修复若涉及权限/签署/冻结必须按L2范围独立验收；本辅助未运行。

## 2. 字段可见/只读/必填：当前入口是静态placement限制和流程权限

`gmp-platform/frontend/src/pages/master-data/template-designer-react/types/canvas.ts:19–25` 的 FieldBinding只定义required/readonly/hidden；ModelField定义（types/model.ts）没有动态条件AST。

`components/DesignerInspector.tsx:860` handleFillLimitChange：开启其中一个时把另两个设false；`:875–894` renderFillLimitControls是真实调用的配置入口。`:896` renderConditionLimit仅定义 `widgetConfig.conditionConfig` checkbox，整个文件无该函数调用；全当前前端/生产后端未找到可见/只读/必填条件AST的UI写入/执行链。因此不能把手造visibleCondition/requiredWhen等JSON不求值直接算当前可达缺陷。引用字段referenceQueryConditions是候选查询依赖（DesignerInspector1683及referenceConfig.ts），不是字段可见性/权限条件；作业conditionBranches是W3另一套语义。

| 消费 | 原始路径/方法 | 具体作用与边界 |
|---|---|---|
| 模拟填写 | `.../components/mock-fill/MockFillDialog.tsx:179` resolveBoundField，`:475` renderMockFillControl | 隐藏node返回null，readonly禁用控件，required进入控件；模拟状态是自己的values，不是服务端持久化证明。 |
| 完整纸面 | `.../components/form-preview/FormDocumentPreview.tsx:25` bindFormPreviewField、`:67` renderField | hidden跳过；只读合并全局disabled、node.readonly、field权限、父子表权限；onChange再次守卫；不计算动态条件。 |
| 列表 | `.../DhrTemplateWorkspaceDialog.tsx:886` FieldListPreview（898只筛enabled，940只读）；`.../components/form-renderer/FormRuntimeField.tsx:58` RuntimeSubTable | 读取canonical fields/columns、服务端fieldPermissions；子列禁用由readOnly/typeConfig.readonly。列表不会自动沿每个placement的hidden来移除canonical字段。hidden是placement还是全字段政策不能由这个差异反推；没有明确政策时保持线索，不擅自改隐藏规则。 |
| 执行前端输入 | `.../production/ProductionExecutionPage.tsx:176` formDocument useMemo、191 formRuntime、562 | 解析冻结model/canvas后用冻结form.fields替换canonical模型；运行权限来自controls.permissions；canvas走FormDocumentPreview，fields走FormCanvasPreview。不是重新查询最新模板。 |
| 冻结限制 | `.../production/service/ExecutionSnapshotBuilder.java:221` collectBindings | 遍历画布binding，将required/readonly标志投到同ID字段/同父表的子字段；不投hidden，也不解释条件。 |
| 服务端权限 | `.../production/service/ExecutionAccess.java:179` permissions、208 editable | current actor/canAct、字段readOnly/disabled、命中权限组、默认+例外；多组只读优先。不是前端字段可编辑就允许服务端写。 |
| 保存动作 | `.../production/service/ProductionExecutionEngine.java:210` formActionInternal、222 withCanvasBindings、252 | 从冻结form和当前状态重算权限；拒绝只读变更/停用变更；prepareTableRows再validateNestedEdits，子列readonly/signature/disabled按旧真实行身份比较（640）。 |
| 必填 | 同文件`:526` validateValues；`:316–335` 提交/审批与最终完成 | enabled字段required或typeConfig.required时缺值报错，递归子表。SAVE/RETURN/SIGN_FIELD不作全表提交必填阻断；其他动作先按当前节点可编辑字段校验，最终完成再全表校验。不能把暂存允许缺值当取消必填政策。 |

legacy实体：`template/entity/FieldPermissionPolicy.java`、`FormValidationRule.java`与其Repository仍存在，但源码检索只命中各自entity/repository定义，无当前controller/service/UI引用；`FormField`关系表也不等于React模型JSON当前消费。仅存在表/实体不能证明动态条件功能仍有合法入口。未查询数据库、不判断存量是否有数据。

## 3. 表单模板保存重读及运行值保存

模板设计：`TemplateDesignerReactShell.tsx:102` persistCurrentDocument捕获当前document→`utils/document.ts:360` serializeTemplateDesignerDocument保存model/canvas/workflow三片schema；`TemplateModelingPage.tsx:1252` saveDesignerPayload→`api/template-modeling.ts:246` PUT；`template/controller/TemplateModelingController.java:230` saveFormTemplateVersionDesign分别更新三片、save并审计。model额外经过FormLookupCatalogService.prepareDesign校验用途，canvas/workflow原文存储。重读GET API237→parseReactTemplateDesignerDocument345→createEmptyTemplateDesignerDocument/normalizeModelField125；canvas节点大部分按原对象保留，旧子表region有normalize兼容。没有动态条件AST的新解释器/自动修复。

生产值：ProductionExecutionPage.act（约337）先executionFormValues按form.fields规整，再executeProduction；ProductionExecutionService.java154 execute使用REPEATABLE_READ，178首次构建snapshot，181之后读已存snapshot/state；215派发engine.formAction；228 formRecords.saved；238保存snapshot/state。engine写入values只在通过权限、嵌套/引用/签署及当前动作校验后发生（326）。此为源码映射，不是实际数据库事务验证。

## 4. 新补线索：子表singleSelect的widget选项与新行默认值失配

父侧要求具体核对的形状：模型options=[]，node.widgetConfig.optionList='合格:pass\n不合格:fail'，node.bindings.defaultValue='合格'。必须区分可构造数据与合法UI的精确写值。

明确原始证据：

1. `registry/fieldRegistry.ts:211–216` 新singleSelect的模型options默认=[]。
2. `DesignerInspector.tsx:447` parseOptionListText仅split换行；`:1453–1455` option编辑写widgetConfig.optionList；`:1544–1548` 文本框允许输入任意该行文本；`:1562–1573` 默认圆点将当前完整optionLabel直接写bindings.defaultValue。没有把“label:value”拆成label/value。因此UI输入“合格:pass”再点默认会产生defaultValue='合格:pass'，不是父侧样例的'合格'。除非另有更早配置或API，这个精确样例不能直接声称由该UI步骤产生。
3. **较小合法UI反证**：选项行使用纯文本“合格”“不合格”，点“合格”默认，模型options保持[]且bindings.defaultValue='合格'。当前UI确实支持该配置；应由主侧实际交互确认。
4. `components/form-renderer/newSubTableRow.ts:4–21`：configured优先node.defaultValue后模型defaultValue；singleSelect映射却只读取模型options，忽略widgetConfig.optionList。因此上述纯文本配置和父侧给定形状从源码求值均没有row[field.id]；text/number对照不受此项影响。此处未执行测试。
5. `FormDocumentPreview.tsx:64` changeRowCount实际调用newSubTableRow；`FormRuntimeField.tsx:80` 列表添加记录同样调用；老行`current[index] ?? newRow`保留，不能通过重算默认覆盖已有显式空值。
6. 纸面选项优先级原始消费：`FormDocumentPreview.tsx:74–82` 非空widget optionList优先模型，解析label:value并trim；`MockFillDialog.tsx:288` parseConfiguredOptions同理；`:810–839` radio/checkbox使用值或标签决定选中、实际onClick写option.value。这证明widget选项是目前真实渲染输入，不应由新行helper静默忽略。
7. **后端相邻风险**：全`backend/src/main/java`检索optionList为0；`ProductionExecutionEngine.validateValues:581–589`单选允许值仅来自config.options；`collectDefaultBindings:711–724`只投defaultValue、没有选项覆盖；`applyDefaults:683–708`也只按模型options映射。所以仅把前端新行默认改为widget选项真实值，仍不能宣称完整后端保存/提交闭环；模型空时manual widget选值也会在非SAVE提交校验被拒绝。SAVE当下不作该全表值校验，不能据SAVE成功声称SUBMIT成功。
8. 既有测试源码（未执行）：`scripts/test-runtime-row-values.mjs`两例只覆盖模型options及canvas默认优先；`scripts/test-form-document-preview.mjs:177`、194 widget显示测试注入已有accepted值，没有创建新行/后端保存。不能用它们的历史通过覆盖当前缺口。

相关既有解释：`docs/knowledge/evidence/form-traceability-projection-ownership-user-confirmed.md:507`记录工程方案“新行默认值与初始化默认值不覆盖显式输入；单选默认值尝试有效选项值或唯一标签，不依名称猜引用实体”。它为现有默认落真实输入和不覆盖旧值提供来源，但不是新增通用选项政策或用户重新确认。widget覆盖显示优先已有运行测试源码保护；本轮应由主侧正反例和专业角色核对最终边界。

可控反证建议：先合法纯文本widget选项＋默认的新行数据断言；再既有模型label/value映射对照；再有widget label:value显示与真实选择（不把UI默认完整行字符串问题隐去）；确认disabled/重复label/显式空值/已有行保留；如果交付扩到保存，必须补canonical冻结允许选项与后端SUBMIT验证。多个placement给同一field不同optionList的冲突处理不能自行发明规则；需要查既有owner约定或保持该部分未决。不得为让测试变绿把所有label无条件存值，或弱化后台允许选项校验。

## 5. 本批结束边界与具体下一步

确定已存在的fillMode high属于旧差异继续核对；本次未运行，不能写“已修”或“验证通过”。动态字段条件仅死定义/旧实体存在，没有证据支持新增运行解释器；旧字段/画布规范化与DEC0067取消缺失模式兼容是不同范围，不能扩大取消全部历史渲染。组件单选默认值的合法纯文本UI反证优先级高，但前后端选项覆盖以及label:value默认值写入必须逐层披露。

W3边界：ProductionExecutionEngine.transferTargets375、transferForm382以及settleForm/finishNode等流程推进不在此次整改建议内；作业conditionOutlet776与open-questions的condition-runtime问题仍独立待审，不因本次字段限制核对而关闭completionCondition或transfer事项。没有新增政策、知识同步或成熟度变化。

建议主侧按已运行证据选择单一最小切片；本辅助只提交源证据索引，不担任修复后的独立QA。
