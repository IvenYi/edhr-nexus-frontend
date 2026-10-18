# W3b 绑定切换前端只读调用链

日期：2026-10-18（Asia/Shanghai）。角色：临时前端技术辅助；非正式本体角色，非独立质量验证。仓库 `/workspace/edhr-nexus-frontend`，读取时 HEAD `ca98ab2897990eba30bf1433134aa8560578f562`。读取时仓库干净。当前知识版本 `0.3.25`。本报告仅原始源码与当前决策核对，未运行 Node、构建、浏览器、Java 或数据库验证，未修改仓库。

## 结论与边界

`AUD-H004 / discrepancy.form-process-binding-switch-draft-retains-invalid-exceptions` 有确定的静态实现依据。共用设置组件的流程选择命令只更新流程 ID/名称，作业编辑器的表单选择和历史流程升级命令只合并引用；它们未调用现成 `pruneFieldPermissions` / `pruneEventBindings`。作业草稿序列化不规范化这些值，后端草稿保存也只做设置格式/显式模式检查，故旧字段权限、旧组键、旧事件绑定可进入新引用的草稿。发布与产品制程保存的严格验证可阻止适用无效配置进入发布/制程保存，但不等于实现了切换后有效例外保留及失效例外清理。

不应把此结论扩展为运行权限已经被绕过：本次未执行运行验证，后端适用设置验证依然存在。不得清空全部权限、重置默认权限、自动绑定新签名字段、弱化签署要求或修改冻结执行快照。

## 实际读取的治理与政策

- `AGENTS.md`、`codeplzreadme.md`：原始源码优先、精准修改、独立质量不能由参与修复者冒充。
- `DEC-0023-03/04/08`：字段例外归当前具体表单/流程绑定，真实稳定 fieldId；切换表单或流程版本后，只保留新表单仍存在且仍对应新权限配置单元的例外，失效必须清理或阻止保存。验收场景明确“剩余有效例外继续保留”。
- `DEC-0035-01/02/03`：配置单元已是 START 权限组、APPROVAL 节点组，不能按组内主体成员逐个扁平化重映射；默认权限和例外按组保存。`04/05`：事件归节点内具体按钮，绑定真实 fieldId，不能新造事件或自动换签名目标。
- `DEC-0067-01/03/04/05` 与原始 `evidence/form-fill-settings-confirmed.md`：显式模式；PROCESS 沿用选中发布版本；共享设置贯通两入口；无缺失模式兼容推导。两模式非活动草稿独立保留是已记录工程 inference，不是旧数据兼容政策。模式切换不等于绑定切换，不能为了清理当前引用而删除另一模式的配置。
- PR16/AUD-H003 当前已合并且本报告不重开该项。

## 原始写命令映射

以下行号以基线 ca98ab2 为准；修改后需更新证据锚点。

| 所有者/命令 | 实际行为 | 本项风险/保留范围 |
| --- | --- | --- |
| `FormFillSettings.tsx:112` 模式 ToggleButtonGroup | `onChange({...value, fillMode:next})`，保留两种草稿，切回 people 页签 | 这是模式选择，不应自动清空 `directFillConfig` 或顶层 PROCESS 草稿；保留缺失模式不自动 DIRECT 的 PR16 行为 |
| `FormFillSettings.tsx:135` PROCESS Autocomplete | `onChange({...value,fillMode:'PROCESS',formProcessVersionId:next?.versionId??'',formProcessName:...})` | 旧顶层 `fieldPermissions`、`eventBindings` 全部保留；清除流程也保留草稿，属于 DEC0067 已替代旧“清除流程即清空”的边界，不能简单恢复旧政策 |
| `FormFillSettings.tsx:88-107` DIRECT 配置编辑 | `updateDirect` 合并 direct patch，同步已改组默认权限；只有 `version.isSuccess` 时按新 direct 图与当前 fields 调现成 prune | 已覆盖 DIRECT 组/按钮变化的一些路径，但不覆盖只改表单且不编辑 direct 的路径；不能用它证明每次绑定切换清理 |
| `FormFillSettings.tsx:175-183` 字段权限弹窗保存 | 仅 `eventBindings` 主动 prune，`fieldPermissions` 直接取弹窗回传；分别写 direct 或顶层 | 用户不打开弹窗直接保存会绕过；弹窗内部初始化 `permissions` 原样赋 draft，也无自动过滤旧组的保存前保证 |
| `WorkTemplateEditor.tsx:4038-4050` 选择表单版本 | 只传 `formTemplateVersionId` / `formTemplateName` patch | 保留旧 PROCESS 与 DIRECT 设置，引用已改变但字段例外未核对 |
| `WorkTemplateEditor.tsx:2690-2707` 升级历史 PROCESS | 只传最新发布流程 ID/名称 | 此入口不经过共享 Autocomplete handler，不能只修共用流程选择；升级后仍可立刻保存草稿 |
| `WorkTemplateEditor.tsx:3804-3810` 清除引用业务单据 | 清空表单 ID/名称及顶层 `fieldPermissions`、`eventBindings` | 不清 `directFillConfig`，与选新表单命令行为不一致。属于特殊无表单草稿边界，应有明确回归；不要顺手把缺失表单草稿改成全面发布校验 |
| `WorkTemplateEditor.tsx:2927-2954` updateSelectedNode | `config:{...node.data.config,...patch.config}`，标 dirty 并记 history | 所有上述引用 patch 都保留原配置；如要真正删除 key，不能只省略 patch key，否则旧 key 会合并回来；需要完整对象/显式 `{}` 或明确替换 API |
| `WorkTemplateEditor.tsx:4136` shared settings 适配 | `onChange(config)=>updateSelectedNode({config})` | 即使共享组件构造新值时省略 key，编辑器浅合并也会恢复旧 key，设计时须考虑 |
| `WorkTemplateEditor.tsx:366` persistentFlowGraph | 仅去 selected/dragging，配置原样保留 | 不是规范化边界 |
| `WorkTemplateEditor.tsx:4509-4544,4719-4726` 保存草稿 | `flowRef.current.graph()`→persistentFlowGraph→PUT graph；无绑定剪枝 | 不会等共享组件 `process`/`version` query 完成，跨组件加载状态没连接到保存按钮 |
| `FormFillSettingsButton.tsx:25-35` 工序小弹窗 | 打开 `structuredClone(value??{})`；内部 onChange 只改局部 draft；取消丢弃；应用向父回传 draft，随即关闭 | 取消当前正确隔离，不得异步请求完成后提交已取消草稿。应用当前只阻断缺失模式或 PROCESS 无 ID，没有元数据 ready/clean 条件 |

## 两个真实工序父适配（覆盖产品与产品簇）

1. **产品 workspace**：`ProductModelingWorkspacePage.tsx:813` 直接用共享 `FormFillSettingsButton`；回调只对当前 `routeNodeKey` + `(dhrTemplateItemId || formTemplateVersionId)` 的绑定替换 `fillSettings`。`updateDraft:745` 仅替换选中工序；`toOperationDrafts:199` 保存原 fillSettings；`toPayload:158` 用 `{...formBinding}` 原样发出。最终 `saveOperationsMutation:377` PUT `/master-data/product-modeling/products/{productVersionId}/versions/{versionId}`。新添加表单在 :795 明确 `{fillMode:'DIRECT'}`，应保留这条显式创建命令，不再要求额外点击。
2. **全屏共享制程版本 Dialog**：`components/ProductProcessVersionEditorDialog.tsx:1132` 同样使用共享小弹窗；`updateSelectedNode:974`、`toOperationDrafts:151`、`toPayload:181` 不会清理绑定。`submit:1009-1032` 校验版本重复/有效期/PDF 页码后直接 `onSubmit`，没有配置适用性剪枝。产品 `ProductModelingPage.tsx:404` 使用默认 `getProductModelOptions`，保存走 products 路径；产品簇 `ProductFamilyModelingPage.tsx:936-960` 传 `loadOptions`→`getProcessOwnerOptions('PRODUCT_FAMILY', familyId,...)`，保存走 `/process-owners/PRODUCT_FAMILY/{id}/versions...`。这是同一 Dialog 的两个真实父路由，不应声称只有产品 workspace 一处工序入口。

全屏 Dialog 的 `handleDhrChange:1001` 直接删当前所有工序的 forms；`handleRouteChange:995` 重置 drafts；这些是其他已有命令，不能顺势改成移植旧填报设置。本项要验证的保留是同一绑定里仍有效的 group/fieldId，不是跨目录重建语义。

## 现成 prune 能做什么、不能做什么

`FormFieldPermissions.tsx:34-58` `pruneFieldPermissions`：只保留目标 `subjects.id` 中的键；对留下 rule 通过 `{...rule}` 保留 defaultPermission/其他现有值，过滤两个 fieldId 列表为新 fields 集；不突变入参。不能用“全部清空”替代它，因为同组同 fieldId 例外应继续保留。

`FormFieldPermissions.tsx:60-83` `pruneEventBindings`：保留当前 events.key 存在且绑定 fieldId 为空或属于 fields 的项；输出仅 `{fieldId}` 或 `{}`，不自动选择签名字段、不新造事件。它**不校验字段 type/status/readOnly**，所以“同 fieldId 但从 signature 变成普通字段/禁用签名”仍由后端严格签名验证阻断；不要在修 H004 时静默自动换目标或降低签署要求。如果扩展 prune 为清理不可用签名目标，应明确证明来自既有服务器资格规则，并保留保存/发布拒绝未绑定必需签署的测试。

`processPermissionSubjects:85` 实际键为 `start:{permissionGroupRule.id}`、`approval:{node.id}`；START 没有规则时是 `start:open`。不能对同名 label、相同成员或数组序号做跨版本智能匹配；现行稳定键命中才能保留。`processBuiltinEvents:185` 实际键为 `{node.id}:{event.id}`，只收启用的 BEFORE FILL_SIGN_FIELD 及受支持动作。`templateFields:232` 从 model payload.fields 或 fields 读真实 id（已有 code/index 回退），本项不宜顺带重构字段建模政策。

## 最容易误修的异步边界

- **流程列表不含图**：后端 `FormFillSettingsController.java:21-29` 真 GET `/form-fill-settings/processes` 只有 id/name/versionId/versionNumber；前端 ProcessOption.nodesJson 虽 optional，不能假定列表已给图。GET `/processes/{id}` 才返回 nodesJson/edgesJson。不能对 `Autocomplete next` 直接做 subjects/events 得到 [] 后清空有效项。
- **query 精确 ID 隔离**：当前 `FormFillSettings:31-35` process query 用 `['form-fill-process',id]`；form version 用 `['form-template-version',templateId,id]`。换 ID 后新请求未返回，当前渲染 graph/fields 可暂为 undefined/[]。应只在明确的选引用命令或受控保存规范化中使用完成的目标元数据，不在初次打开/加载失败/空缓存时 effect 自动清配置。
- **立即保存**：当前 onChange 同步提交新引用后用户立即点击 Work“保存草稿”/小弹窗“应用”，组件没有 ready 条件，保存拿到带旧绑定的新引用。修复若只靠 query 成功后的 effect，需证明立即保存不再穿过；更稳妥是原子提交引用+剪枝，或在保存边界规范化/阻断不确定状态。
- **竞态与取消**：若异步 handler 获取目标详情后提交，需要确认请求时的节点/表单/流程/模式仍是当前，防止 A→B→C 中 B 晚返回覆盖 C，防止切换节点后回写旧目标，防止关闭/取消弹窗后仍 onChange。不能用请求完成时闭包里的旧 `{...value}` 覆盖用户此间的其他编辑。
- **失败不改配置**：目标元数据加载失败时，应保留用户当前可恢复草稿并可重试/明确阻断保存，而不是把 fields/subjects 空值当成有效空集合静默删除。
- **休眠模式**：PROCESS 切流程，目标组/事件只针对顶层 PROCESS 配置；不得用流程的 subjects/events 清 directFillConfig。DIRECT 组/按钮编辑也不得清顶层 PROCESS 草稿。换具体表单是两个模式共用 fieldId 的变化，是否先保留休眠草稿再在激活/保存时精确验证属于工程策略；至少不得让休眠配置影响当前模式的权限/签署或把已保留有效值整体丢掉。

## 最小修改所有权建议（inference，不代替主会设计）

1. 保留 `FormFieldPermissions` 现有 pure prune 作为唯一字段/事件交集算法；如需新 helper，只组装“目标 form fields + 目标 mode 图”，不要复制几套不同过滤规则。
2. 共用 `FormFillSettings` 负责 PROCESS 显式选择命令和模式局部数据的协调；真实列表缺图，所以必须解决目标 metadata ready 与引用原子提交的关系。不要引入打开即改配置 effect。
3. WorkTemplateEditor 的表单选择及历史版本升级也必须覆盖；可复用统一受控命令/保存规范化，但不能只修共享 Autocomplete。考虑 updateSelectedNode 浅合并会恢复省略键，明确哪些 map 需要 `{}` 替换。
4. 所有工序父组件共享 SettingsButton，因此优先在共享所有者修复，不各父页面复制；保留取消局部 draft 隔离、已有显式 DIRECT 创建、工序/表单绑定隔离。
5. 服务端草稿若增加针对已解析目标的有限引用校验/规范化，必须保留 DEC0009/PR16 不完整草稿可保存，不把整套 publish 校验搬进 draft。后端严格 publish/制程 serialize/首次快照的校验不可削弱。

当前已确认 DEC0023-08 足以支持“保留有效交集、清理或阻止失效项”。未发现必须先问用户才能继续上述确定修复的业务歧义。具体采用原子命令还是保存时规范化属于实现选择，应由主会结合后端调用链决定。若打算全清旧权限/改变默认权限/自动迁移同名字段或组/取消必需签署，超出了已有政策，不能作为技术捷径。

## 主会拟采用“有限草稿保存阻断”后的补充核对

主会方案：服务端草稿保存边界只检查已提供、可解析的当前 active 绑定引用，失效项拒绝；不要求未配置 mode/表单/流程/必需签名已完成，不触碰休眠模式；产品保存原严格校验保留。这与 DEC0023-08 的“清理或阻止保存”一致，且能避免前端选项异步竞态导致漏校验，不需要新增业务政策。

但是**只增加后端阻断会暴露现有 UI 无法纠正隐藏失效组的问题**：

- `FormPermissionConfigDialog:302-319` 打开时 `setDraft(permissions??{})`，旧组/旧字段原样保留。
- :538 以后只显示新 `subjects`，已消失的组没有任何可见控件可选/删除。
- :630 多选 value 是 `fieldOptions.filter(field=>exceptions.includes(field.id))`，已经不存在的旧 fieldId 不显示 chip；只有用户主动修改某一可见组的多选值时，当前例外列表才会被替换为可见值。没有修改的组仍保留隐藏旧 ID。
- :737 `onSave(draft,eventDraft)` 原样回传，`FormFillSettings:177` 只 prune 事件，没有 prune permissions，直接点击“保存配置”并不能清理旧组/字段。
- 事件已有局部恢复能力：`FormFillSettings` 保存配置时按新 event keys/fields prune，`FormProcessEventBindingEditor:746` 允许对仍存在事件手动重选当前 signature 字段；不会自动创建签名绑定，适用必需签署仍由服务端严检。

最小配套建议：在**现有明确的“保存配置”写命令**上也执行 `pruneFieldPermissions(fieldPermissions,subjects,fields)`，保留现成 `pruneEventBindings`。只用已加载当前上下文，不打开即自动修改，不恢复全量发布校验。这样用户遭保存阻断后，可以打开字段权限设置并保存配置，隐藏失效键被移除，仍有效组/fieldId/defaultPermission 留下，重新保存草稿可通过。共享所有者一处即可覆盖 Work inline 和工序小弹窗两种父适配。

需测试权限配置弹窗在元数据未 ready/失败时不会用空 subjects/fields 删除配置。现有打开按钮 `FormFillSettings:83` 已阻断无模式、无表单、version loading/error、PROCESS 无 process.data；但弹窗底部 :737 仅 `disabled={!editable}`，如本次增加保存时规范化，应明确证明当前元数据条件仍成立（或加针对性 ready 防护），不能假定初次打开防护等价于整个交互期间一定安全。

本辅助未发现这一组合方案与已确认规则冲突。H009/H010 只作为后续待审，没有在本次提出或实施整改。

## 能证明问题的实际验证入口（建议，未执行）

- 原始 browser harness `scripts/test-explicit-fill-mode-browser.mjs` 已用真实 React/MUI shared Settings、SettingsButton、WorkTemplateEditor + MemoryRouter、Query/Snackbar provider；`**/api/v1/**` 为受控 API fixture，PUT graph 捕获真实页面请求，适合复用。必须修正旧 fixture：旧脚本给 list option 也塞 nodesJson，真实列表并没有图；H004 race 场景应列表不带图，detail 延迟单独响应。
- Work 真实页面：预置 form702 + PROCESS901，权限键包含共享 start:g1/仅旧 start:gone，fieldIds 包含 keep/old，事件含共享 start:sign/仅旧 start:removed；切到 form703（只有 keep）后**不打开权限弹窗**直接保存，检查真实 PUT graph 中保留 keep、删除 old；刷新检查持久化回显。基线 handler 无任何规范化，应仍发送 old；需要先记录实际 red，不能用本静态报告当 red 测试证据。
- PROCESS 选择：同一表单，旧流程901→新902（保留 start:g1，删除 start:gone，保留一个 event key）；立刻点击保存/应用；检查有效 rule defaultPermission 及 keep 例外保留，无效组/事件删掉或明确保存阻断，directFillConfig 逐字保持。
- 历史升级按钮：提供 reference outdated + 当前流程选项，通过真实“升级...”按钮走 Work 独立 handler 后保存。不能只证明共享下拉框。
- 小弹窗：在实际 SettingsButton 中切流程后取消不触发父 onChange；重新打开仍是原配置；应用只更新所选绑定，别的 route/表单配置不变。延迟 detail、连续选两流程、切模式、取消/关闭应覆盖竞态。
- 两个工序父适配：至少读取实际 Product workspace payload 和共享 full Dialog payload；产品簇 full Dialog 的 loadOptions/owner endpoint 与产品不同，应有实际父适配契约回归或准确列为未运行边界，不能用相同组件单测写成两条完整 E2E 已通过。
- Node 可执行实际导出的 prune helpers做交集保留、移除、defaultPermission 不变、输入不突变、空 bindings 的单元回归；若抽纯命令 helper，应用真实 helper 而非复制算法。单测不能替代真实 UI 选择→立即保存的连通验证。

## 证据声明

original-evidence：本报告引用的当前 ca98ab2 决策 YAML 与上述前后端源码、既有 browser/Node 脚本。

secondary-reference：已有 discrepancy 摘要只作线索，结论已回到命令源码核对。

user-confirmed：以现有 DEC0023/DEC0035/DEC0067 指向的原始用户确认为权威，本辅助没有新增用户决定。

inference：最小实现所有权、异步协调方案与建议测试矩阵，不是新增业务政策。

本报告不输出 qualityResult 或 ontologyResult，不声称运行验证通过。
