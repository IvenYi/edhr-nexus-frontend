# W2 设计器来源身份只读辅助记录

本实例仅提供只读源码辅助，不担任主开发或独立质量角色。没有修改仓库、运行测试/构建/浏览器/数据库/Actions、切换分支、提交、推送或合并。报告不是 qualityResult，也不是完整 W2 或全分支验收。

## 固定基线与盘点

- source/target/contract-read：`8a9cd91f62742e9469c785baee482129eb6ec84e`，目标 `edhr-dev`，派发分支 `audit/edhr-dev-w2-designer-identity-20261016`。
- 实际读取 `AGENTS.md`、`codeplzreadme.md`、统一交接契约与当前 `NEXT.md`；读取 frontend-design 及 frontend-design-premium 主技能作为 UI 行为约束。没有依据技能扩大只读任务或声称运行检查。
- `docs/knowledge/schema.yaml` 实际版本 `0.3.25 / schema 1.2.0`；没有本体全量语义审计、业务决策或知识修改。
- PR12 合并提交 `8a9cd91f...` 的第二父提交为交付 `0eb8d24195fa558e40954d72bef73be57edde47f`，二者 tree 均为 `03faafccd95f3d7262ebbdd80a20f20aaedcb05c`。完整树差异为空；AGENTS/codeplzreadme/docs/agents/docs/knowledge/docs/architecture 差异为空。
- `git ls-tree -r -z` 固定对象盘点产生 `/tmp/edhr-w2-designer-inventory.csv`，1843 条唯一路径/来源 blob，全部 `pending / inventory-only`。清单不是已审覆盖率，不覆盖后续主审新增测试或修复。

## 方法级映射与反证

下表只是列明方法的核对，不宣称完整文件均已审。路径均位于 `gmp-platform/frontend/src/pages/master-data/template-designer-react/`，后端路径另列。行号取本基线。

| 入口/命令 | 实际链路 | 来源身份及边界 |
| --- | --- | --- |
| 导入 Excel/Word | `TemplateDesignerReactShell.tsx:152–170` 的隐藏文件 input/handleImportFileChange → `utils/templateImport.ts:22` → `importExcel.ts:1005` 或 `importWord.ts:948` → `store/useTemplateDesignerStore.ts:2801` replaceCurrentPageFromImport | 扩展名接受 xlsx/xlsm/xls/docx/doc；导入产物是 CanvasPage，非整份 model。替换当前页沿用当前 pageId/name，保留 document 的 model/projection 与其他页，并调用一次 pushDocumentHistory。导入会替换当前页 nodes/版式，不能把“保留模型字段”写成“保留原画布节点”。本实例未解析真实 Office 文件或浏览器交互。 |
| JSON 读取/写回 | `utils/document.ts:341` parseReactTemplateDesignerDocument、`:360` serializeTemplateDesignerDocument、`:156` normalizeModelState | JSON 是三个版本持久片的协议，不是当前公开文件导入入口。normalizeModelState 保留 projection，字段 id/code 存在时保留，不按名称或位置重分配当前有效字段。不可使用手工坏 JSON 冒充正常导入触发。 |
| 主字段改名/类型 | `tabs/model/ModelTab.tsx:594` handleSaveField → store updateField `:2188` → syncBoundNodesForField `:1748` | patch 保留字段 id；model spread 保留 projection。主字段节点按同 fieldId 同步类型、label 及必要 widget defaults。类型不再兼容 projection 不会悄悄改绑另一个字段；后续保存必须通过校验。 |
| 字段停用 | ModelTab `:585` setCurrentFieldStatus → store setFieldStatus `:2230`，子表则 updateSubTableFields `:576` → updateField(parent) | 改 status，不删除/换 id，不静默移除绑定。当前 ModelTab 没有公开主字段硬删除或子表模型列硬删除按钮；画布列删除与模型列删除必须分别命名。 |
| 子表列编辑 | ModelTab `:576` updateSubTableFields、`:606` 编辑分支 → store updateField(parentId,{typeConfig.columns}) | 列对象通过 spread 留 id/code，parentId 与 projection sources 留存。嵌入子节点的快照同步疑点另列下一检查点，未并入本批根因。 |
| 画布节点/单元格删除 | `components/DesignerInspector.tsx:775` 删除组件；`components/canvas/CanvasSheetWorkspace.tsx:1774` 键盘删除；store removeNode `:2763` → removeNodeAndSubTableFieldsFromTree `:1262` | 修改 page.nodes/Word markers，不删 model fields/projection。删除子表区域时还会删相应 page child placements。不能把画布移除误报成来源配置被删除。 |
| 工作表删行/删列 | CanvasSheetWorkspace `:4620` handleMenuAction → deleteSheetColumns `:2904` / deleteSheetRows `:2960` → shiftCanvasNodesForDeletedColumns/Rows → reconcileSubTableRegionTemplates | 坐标、合并格、页节点区域随删行列处理，model/projection 未被替换；每个 store 命令使用一次 document history。未在本实例运行边界矩阵或作全路径正确声明。 |
| 工作表插列 | CanvasSheetWorkspace `:4636–4649` 左右插列 → store insertSheetColumns `:2836` | 固定基线实现移动 cells/mergedCells 与列宽，但没有 nodes 字段，和 insertSheetRows 的 nodes 位移不对称。主审另行通过真实 store 创建字段/子表/节点，已报告 5 条行为回归基线红；该运行证据属于主审，本实例只复核静态入口与缺失字段，不冒称自行复现。整改范围归主审。 |
| 正常保存校验 | Shell `:107` handleSave → projectionConfigurationIssues / Problems `utils/projectionConfiguration.ts:73` → ProjectionValidationDialog | 检查字段存在/停用、子表存在/类型、属性类型、数量去重和 detailFieldIds；无效时保留文档并打开用途修正对话框，可明确删除或改绑。字段自动确认保存不经过这层对话框，但共用后端校验，因此不能仅此断言可落库绕过。 |
| 公开 design API 兜底 | 后端 `template/controller/TemplateModelingController.java:226` saveFormTemplateVersionDesign → `template/service/FormLookupCatalogService.java:248` prepareDesign → `FormProjectionInterpreter.java:94` validate / `:303` field | prepareDesign 强制所有 binding enabled、移除自选 rowKeyFieldId 后验证。无效/停用来源、父表非 subTable、跨组列或不兼容类型均拒绝。Controller 事务覆盖持久化与审计，属于源码边界核对，非本实例运行验收。 |
| 撤销/重做 | store pushDocumentHistory `:1888`、undoCanvasChange `:3306`、redoCanvasChange `:3320`，Toolbar 点击入口 | 历史对象是整个 TemplateDesignerDocument，含 model/canvas/workflow；上限 50。一次命令修改的 projection、字段身份和画布可同退，不应拆成多个独立 set。当前已有 test-designer-save-state 的 projection/layout/serialize 测试，只证明既有保护用例存在，本实例没有重跑。 |

## 下一检查点：子列快照与 canonical 模型

候选线索 `W2-C002-SUBTABLE-FIELD-SNAPSHOT` 仅登记待实际复现，未定级为已确认缺陷，本批不扩大修复：

1. 正常新增子表列并放置：store `createBoundNodeFromSubTableField:1646` 既持有 child fieldId/subTableFieldId，也保存 `bindings.subTableField` 对象。
2. 正常在 ModelTab 编辑同一子列，updateField 传入 parentId；syncBoundNodesForField 只匹配 node.bindings.fieldId === parentId。此静态链没有看到主动刷新 child embedded snapshot。
3. 模拟填写 `MockFillDialog.tsx:179` resolveBoundField 优先取 embedded subTableField；生产全页 `components/form-preview/FormDocumentPreview.tsx:65` renderField 优先 suppliedField，再 embedded snapshot，FormSheetPage 又会 supplied 此 snapshot。检查器 `DesignerInspector.tsx:785` 在 main getFieldById 无结果时也 fallback 到它。因此不能把 canonical 模型当成这些具体画布路径的既有反证。
4. 可确认为反证的另一条路径：`gmp-platform/frontend/src/components/form-renderer/FormRuntimeField.tsx:60` RuntimeSubTable 从传入 parent field 的 `typeConfig.columns` 枚举 canonical columns、过滤 disabled、逐列渲染，没有使用 embedded subTableField 决定列 type。但这仅覆盖列表/通用子表渲染，不能替全页画布/模拟填写消除疑点。
5. 下一批应以合法 UI 新增/放置/编辑/停用同一列，再核对模拟、全页与列表呈现及序列化/undo；先证实当前真实入口后决定修复。不迁移历史、不改业务禁用政策，不在本批插列根因中混入第二类整改。

## 历史去重与保留边界

- PR5/6 已合并；H005 引用上下文、H017 删除保护 schema、H018 quantity fixture、H019/20/21 保留历史身份和既有修复，不重开或复写原始验收。
- PR10 的 W2-F001-SAVE-ACK 保存请求快照确认已合并；PR11 H002 计划/实际份数与未达到状态已合并；PR12 W2-R001 保存到正式投影的行 UUID/回滚/重试组合回归已合并。本次只验证合并树/相关代码仍在，不把原通过次数当新测试次数。
- H003/4、H009/10 仍按台账留 W3，没有新增运行证据不宣称已修复；H006/7/8 等留对应 W4/W5。
- A12 表单变更/作废及两项旧 DHR high 按用户确认暂缓，仍 open，不能因本次设计器审查关闭完整 DHR 生命周期。
- 具体拆分沿既有 R-006：先提取纯 page 坐标/节点/subTableRegion 命令，再提取 field/node factory；store 保留唯一一次 document history 事务所有者，document.ts 保留三片持久协议。提取时必须保护 fieldId、projection ID、子表 anchor/groupRange/template offsets、单次 undo/redo 及 50 条上限；本批不执行大模块重构。

## 证据限度

来源区分：本基线代码与 Git 对象属于 original-evidence；历史台账和旧验收属于 secondary-reference；主审发来的 5 条红色行为回归属于主审报告的运行线索，不是本实例执行。用户关于 A12 暂缓属于 user-confirmed。子列快照目前属于 source-supported inference/next-checkpoint。

实际运行仅限 rg/sed/cat、Git 对象/差异读取及用 Python 生成全路径 CSV 和安全摘要。没有浏览器、Office 文件解析、测试、构建、数据库或 Actions 通过声明。全 1843 条清单仍 pending；不能据本辅助报告宣称完整 W2/全分支审查结束或批准自动合并/部署。
