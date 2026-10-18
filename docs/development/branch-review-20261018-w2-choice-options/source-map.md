# 源码方法范围、所有权和 S04 拆分方案

基线 `b191e054892ae06cb0d8a45f62d034deabbba3e3`；修复定位为本批当前工作树，行号随后续提交可能偏移。只声明表内方法/分支已核对，不声明整个文件已深入审查。以下设计器相对路径的根为 `gmp-platform/frontend/src/pages/master-data/template-designer-react/`。

| 源码入口 / 方法 | 实际核对范围与所有权 |
| --- | --- |
| `components/DesignerInspector.tsx` `parseOptionListText:448`；单选编辑 `1454`、默认 `1511/1565`；多选 `1830/1895/1949` | 编辑文本沿现有 widget 命令；默认写解析后的 value。每个 placement 的默认、布局和只读仍是 placement 设置，不新增全字段同默认政策。 |
| `store/useTemplateDesignerStore.ts` `initializeChoiceField:144`、`createModelFieldFromInput:151`、`addField:2165`、`updateField:2263` | 两个既有可见预置只由新字段/主动改型命令物化；主字段和子列新增工厂共享写前初始化。不是文档读取归一化职责。 |
| 同 store `createBoundNodeFromField:1684`、`createBoundNodeFromSubTableField:1713`、`bindFieldToNode:2615` | 从 canonical 模型生成/重绑组件选项，保持 node/field/subTable 标识和兼容 widget 设置；不沿旧节点继承其他字段选项。 |
| 同 store `syncBoundNodesForField:1815`、`updateField:2263` | 模型编辑反向投射全部页及递归子节点，复用 PR14 父/子匹配；同一父表列 embedded 与 canonical 同步。 |
| `tabs/model/ModelTab.tsx` `createSubTableField:270`、`updateSubTableFields:576`、`handleSaveField:593` → store `updateField` | 实际字段设计页子列新增/改型通过父表columns替换，首轮遗漏已获独立真实UI反证。修正版在该写命令比较旧列ID/类型，仅初始化新增/改型列，旧同类型列不补值；ModelTab共享读取normalize和registry保持原边界。 |
| 同 store `updateNodeBindings:2664`、`pushDocumentHistory:1963` | 原 `syncReferenceConfig` 后执行选项同步，仍只提交一次完整 nextDocument；保留统一 undo/redo 及 50 条历史边界。 |
| `frontend/src/components/form-renderer/choiceOptions.ts`（新，70 行） | `parseChoiceOption`/`choiceOptionList`/`choiceWidgetConfig` 是现有文本表示转换；`syncChoiceOptions` 仅在选项文本变化时更新 canonical 及同字段位置，父表+子列 ID 隔离，保留同值身份与停用元数据。它不是生产运行授权或迁移器。 |
| `registry/fieldRegistry.ts` 默认选项；`utils/document.ts` `normalizeModelField:124`、`parse:345`、`serialize:360` | 原 registry 的空 options 仍供旧文档读取 fallback；读取不补当前预置。model/canvas/workflow 三片协议不变；原缺失/空选项不迁移。 |
| `frontend/src/components/form-renderer/newSubTableRow.ts:4` | 生成真实 `__rowId`；只读取 canonical 有效选项解析单选默认；本次不改该 helper，也不读取 widget 并集绕开提交校验。 |
| `components/form-preview/FormDocumentPreview.tsx` `bindFormPreviewField:25`、`changeRowCount:55/64` | 真实纸面增行调用既有工厂，已有 row 原对象保留；实际 runtime onChange 是默认输入变为真实值的所有者。 |
| `components/mock-fill/MockFillDialog.tsx` `parseConfiguredOptions:288`、`renderFieldNode:1016/1036` | 选项显示继续原解析；共享数据 valueKey 与 React 节点 key 区分，节点 key 增 node.id，不能另造第二份字段值。 |
| `TemplateDesignerReactShell.tsx` `persistCurrentDocument:102` → `TemplateModelingPage.tsx` `saveDesignerPayload:1252` → 后端 `TemplateModelingController.saveFormTemplateVersionDesign:230` | Shell 捕获原 document，序列化三片；后端原事务保存并审计。本批浏览器受控保存回调证明实际载荷，不冒称真实后端保存 API E2E。 |
| 后端 `ExecutionSnapshotBuilder.build:25`、`form:183`、`collectBindings:222` | 新执行复制当时选定 model/canvas；字段选项由 model 保持，不新增从 widget 合并允许值的规则。 |
| 后端 `ProductionExecutionService.act:155`、`:178/181` | `154` 是 `REPEATABLE_READ` 注解，实际方法名是 **act**。首次 START 构建 snapshot，已有 execution 读持久 snapshot/state。辅助消费者原报告第 3 节泛称 `execute`，原字节保留，由此更正；不把旧笔误扩展为新 API。 |
| 后端 `ProductionExecutionEngine.validateValues:527/581`、`applyDefaults:683`、`collectDefaultBindings:711` | 原允许选项校验来自冻结 canonical config；SAVE 与 SUBMIT 校验层次不同。无后端生产代码修改，不降低只读、必填、引用或签署检查。 |
| `frontend/scripts/test-designer-choice-options.mjs`、`test-designer-save-browser.mjs` | 实际 store / 保存重读 / 默认工厂、真实 Inspector 和纸面交互；旧实现反证与正对照分开。主字段重复用 typed document，实际 UI 重复用子列。 |
| `backend/src/test/.../ProductionExecutionIntegrationTest.java` `inspectorChoiceOptionsSaveAndSubmitAgainstTheSameFrozenCanonicalValues:181` | 浏览器导出安全合成 fixture → 新冻结 → SAVE → 未知值 SUBMIT 拒绝且 revision/values/audit 不变 → 合法 SUBMIT 成功；比较完整冻结 JSON 树。H2 PostgreSQL 兼容模式，不是原生 PG。 |

## 当前相邻范围的只读结论

原始 [运行消费报告](evidence/helpers/edhr-w2-runtime-consumers.md) 和 [W3 调用点追加](evidence/helpers/edhr-w3-mode-callers.md) 保留实际读取基线和“未运行测试”声明。W3 的 `FormFillSettingsService.usesProcess/serialize/validate` 同时连接工序 create/update/copy、作业 save/publish/GET 引用状态和首次 snapshot；只收紧一个枚举方法不能关闭补值及发布旁路。DEC-0009 允许不完整草稿，CUSTOM 挂载不经同一模式入口，后续修复不能全局拒绝缺模式或重解释已冻结执行。本批未改这些方法。

`DesignerInspector.renderConditionLimit` 只有定义、没有调用；当前 FieldBinding 只有静态 required/readonly/hidden，不能以手造条件 JSON 不执行就宣布动态条件功能缺陷。字段查询依赖、placement 限制、流程权限和 W3 条件出口分别核对，不合并成一套新规则。

## 大模块具体拆分方案（S04，提案未实施）

首候选读取时物理行数：store 3574、Inspector 2272、MockFillDialog 1644；修正版store实际3586。包括空行和注释，只作职责混杂定位，不作为必须改写的门槛。本批只新增70行纯转换/同步模块及局部命令接线，不执行大规模拆分。

1. **纯坐标与 page 命令。** `store/operations/sheetCoordinates.ts` 拥有范围、坐标和几何位移纯函数；`sheetDocumentCommands.ts` 输入 `page + command`，输出完整 `nextPage + selection`。先以插列、合并格、动态子表边界及来源身份等价性测试固定行为，再单独移动。命令不能自行 set store 或提交 history。收益是隔离几何和文档状态，回滚为单批 revert。
2. **字段绑定对齐。** `fieldBindings.ts` 输入 `document + fieldId/parentId + patch`，输出完整 `nextDocument`；拥有 model、各页 placement 与 embedded 对齐。既有 `referenceConfig` 与本批 `choiceOptions` 保持各自纯表示转换，不能再建第二个策略所有者。store 保持唯一 document 提交/历史所有者。验收保护父表隔离、字段/节点/投影身份、布局、同值 option ID、停用定义、单次 undo/redo、redo 清空和 50 条上限。
3. **解除工厂值循环。** 后续独立切片提取 `registry/componentNodeFactories.ts`，无 React/store 依赖，只输出默认 node、label 和 schema metadata；registry 组装 renderer，store 只取 factory，消除 store→registry→store 的值依赖。不另造重复 registry。先逐组件 characterization 默认值、ID 前缀、绑定和 schema，再提取；不能把 3500 行 store 搬成同样大的 hook。
4. **保留持久与事务边界。** `utils/document.ts` 继续拥有唯一三片持久化协议；快照、record、trace/projection 和审计/outbox 继续各自原服务事务所有权。结构 PR 不附带缺模式/生失效/隐藏政策，不自动迁移历史模板；以保存往返、完整 document undo/redo、冻结正反证保护行为，可逐批前向修复或 revert。

这些提案需独立影响分析、最小批次与适用回归后再实施。当前 finding 的局部修复不代表 S04 全部完成，也不把大文件行数本身当业务缺陷。
