# W2 子列工作文档同步只读辅助记录

本实例是只读技术辅助，不担任主开发、本体角色或独立质量角色。以下结论来自指定提交的源码和 Git 对象读取；没有运行测试、浏览器、构建、数据库或 GitHub Actions，没有修改仓库、切换分支、提交、推送、合并或部署。本报告不是 `qualityResult`，不表示完整 W2 或全分支审查完成。

## 固定基线和清单

- source / target / contract-read：`37bc05ec268d1e0d2faf105c2f1c449caeb7ed46`；目标 `edhr-dev`；派发分支 `audit/edhr-dev-w2-subfield-sync-20261017`。初始 `git status --short` 为空。
- 实际读取项目 `AGENTS.md`、`codeplzreadme.md`、统一交接契约和 `docs/development/branch-review-20261015/NEXT.md`；知识版本头为 `0.3.25 / schema 1.2.0`。读取相关架构、开放问题和 DEC-0077 声明，仅用于工作文档和执行快照边界，未进行本体全量语义审计。
- 远端 `git ls-remote origin refs/heads/edhr-dev` 实际返回同一 `37bc05ec...`，不是只读取本地 tracking ref。
- PR13 merge `0e16363e9fc1ccb876d6ef96a1b15dc1c9cc145d` 与批准交付 `6d4cd54fb721e6fb8df7d7d96e77380b6edc697c` 的完整 tree 相等，差异为空。
- merge 后 `37bc05ec` 只有报表导航修复：AppLayout 归属函数为投影报表返回 records，并在 location.key 变化时重新选择模块；另有一条测试脚本和报告/图片等证据。新增修改共 20 路径，生产源码只有 `AppLayout.tsx` 三行差异。没有修改本批设计器/store/renderer 路径。仍需由本批主侧/QA选择适用导航相邻回归，不能继承旧次数作为新通过。
- `AGENTS.md`、`codeplzreadme.md`、`docs/agents`、`docs/knowledge`、`docs/architecture` 和 `DESIGN.md` 从 PR13 merge 至新目标无差异；无新增契约或知识漂移。
- 固定 `git ls-tree -r -z 37bc05ec...` 生成 `/tmp/edhr-w2-subfield-inventory.csv`：1894 条唯一路径 / blob，全部 `pending / inventory-only`，UTF-8、标准 CRLF。CSV SHA-256：`a0f003c1bb7d9cb37a5a4fae35f8755c3b0f29ff50dd3a0781d0143e47b8a86a`，349383 bytes。元数据 `/tmp/edhr-w2-subfield-inventory-metadata.json`。这不是 1894 个文件已审，也不包含主审后续新增文件。

## 方法级来源映射

表中路径除明确注明外均相对 `gmp-platform/frontend/src/pages/master-data/template-designer-react/`；行号来自固定基线。只核对列明方法和分支，不宣称完整大文件均已审。

| 入口 / 方法 | 当前实际链路 | 可核对边界 |
| --- | --- | --- |
| 子列设计入口 | `tabs/model/ModelTab.tsx:421` 从当前 parent.typeConfig.columns 得到 currentFields，`:576` updateSubTableFields 调 `updateField(parentId,{typeConfig:{...parentConfig,columns}})` | 编辑同一子列保留 id/code；不是手改 JSON 构造的入口。子列类型下拉排除 subTable，编辑弹窗本身没有因已有画布绑定禁用类型选择。 |
| 编辑名称、类型、说明和数值业务用途 | ModelTab `:594` handleSaveField，`:608` 子表编辑分支 | spread 旧列，保留 id，名称/description/type 改为新值；type 变化时采用新类型默认 typeConfig，否则保留已有配置。最终经 parent updateField。 |
| 子列停用 / 启用 | ModelTab `:585` setCurrentFieldStatus，表行按钮 `:923–931` | map 指定 child 的 status 后调用同一 parent updateField；不删除模型列或已有画布节点。不能把状态同步修复扩成新的隐藏、删除、只读或发布政策。 |
| 在子列设计页新增 | ModelTab `:632–638` createSubTableField + append → updateSubTableFields | 正常新增字段获得自己的来源 ID，既有列对象保留。新增时没有既有 child placement 需要回写，但后续编辑会发生缓存分歧。 |
| 画布快速新增子列 | store `:2202` addSubTableFields | 只 append 新列到 parent.columns；旧列没有被编辑，因而不能把这条纯新增路径本身当成本缺陷触发。随后从当前 canonical fields 放置时嵌入新对象。 |
| 正常子列放置 | store `:2441` addNodeFromSubTableFieldToCell → `:1704` createBoundNodeFromSubTableField → `:1673` createBoundNodeFromField | 拒绝 disabled / subTable 子列，node 同时保存 fieldId=childId、subTableId=parentId、subTableFieldId=childId 和 subTableField 对象；节点 id、布局、默认绑定和引用 ID 分别存在。 |
| 模型更新命令 | store `:2246` updateField → `:2271` 遍历所有 page.nodes → `:1806` syncBoundNodesForField | updateField 对顶层模型字段做不可变更新；syncBoundNodesForField 只匹配 node.bindings.fieldId===本次 parentId，递归 children 但不从 parent.columns 选择各 child。因此 parent placement 可更新，child 的 type/label/embedded field 仍为放置时对象。 |
| 画布组件 | `registry/componentRegistry.tsx:201` useBoundField → `:254` FieldPreviewRenderer | 首选 embedded subTableField；fallback 只查顶层 model.fields。label/options 从该对象取；node.type 决定控件分支。子列改名和类型后均有旧配置来源。 |
| 检查器 | `components/DesignerInspector.tsx:783–788` boundField | getFieldById 只查顶层（store `:3460`），child 因此 fallback 到 bindings.subTableField；同一旧副本会影响类型/名称摘要。 |
| 模拟填写 | `components/mock-fill/MockFillDialog.tsx:179` resolveBoundField；`:1016` renderFieldNode | 优先 embedded；将其作为 field 传给 renderMockFillControl 或外部 renderField；字段 type、typeConfig/默认值/选项参与实际控件选择。不是“仅展示 label 缓存”。 |
| 全页预览 / 生产画布 | `components/form-preview/FormDocumentPreview.tsx:68` renderField；其 FormSheetPage 调用点 `:134` | 优先 suppliedField，其次 embedded，其后顶层 model；FormSheetPage 实际 suppliedField 又来自上述 resolveBoundField，故不能把 suppliedField 参数当作 canonical 子列反证。word 分支 renderField(node,null) 仍有 embedded fallback。 |
| 列表式表单 / 通用子表 | 另路径 `pages/master-data/DhrTemplateWorkspaceDialog.tsx:886` FieldListPreview → `components/form-renderer/FormRuntimeField.tsx:58` RuntimeSubTable | canonical parent.columns 决定子列名称/type，过滤 disabled，再逐列 FormRuntimeField。它与全页画布是不同分支；列表正确不能替全页/模拟消除疑点。当前 disabled 过滤是实现证据，不据此推导已有画布必须删除/隐藏。 |
| 参照字段画布配置的正例 | `components/form-renderer/referenceConfig.ts:20` syncReferenceConfig；store `:2646` updateNodeBindings | 既有命令定位 parent + child，更新 parent.columns，并同步相同表/列各 placement 的 embedded subTableField；widget reference config 同步在一次文档历史内。该正例只覆盖参照配置动作，不能覆盖 ModelTab 的通用编辑路径。 |
| 保存和打开 | Shell `:101` persistCurrentDocument → `utils/document.ts:360` serializeTemplateDesignerDocument；Shell `:85` parse/setDocument | 保存对 model/canvas/workflow 三片分别 JSON.stringify，无 child 修复；parse `:345` 与 normalizeCanvasNodes `:230` 也不从 model 重绑 embedded 字段，因此分歧会随原三片保存重读。此处是源码跟踪，未声称本实例通过真实 HTTP 保存。 |
| 公开 design API | 后端 `template/controller/TemplateModelingController.java:226` saveFormTemplateVersionDesign → `template/service/FormLookupCatalogService.java:248` prepareDesign | model 走投影校验，canvas 独立 trim 后存储；prepareDesign 没有修复 canvas 子列缓存。不能假设后端兜底消除本问题；也无需为本前端命令问题新增 API 或迁移。 |
| 完整文档历史 | store `:1946` pushDocumentHistory、`:3367` undoCanvasChange、`:3380` redoCanvasChange | 一次命令保存整个 TemplateDesignerDocument，不是各 slice 独立历史，上限 50。同步应留在同次 updateField 结果，避免两个 set/两次历史，也避免原历史对象被原地变更。 |
| 执行快照相邻边界 | 后端 `production/service/ExecutionSnapshotBuilder.java:187` form、`:203` normalizeColumns、`:222` collectBindings；ProductionExecutionService `:116` findField | form 从指定模板版本取得 model/canvas，并将 canonical fields 放入冻结 snapshot；collectBindings 只补 required/readOnly。references 递归 frozen columns，不会为画布旧 embedded 自动换 type。当前工作文档更新不授权读取运行时最新模板或回写旧 snapshot。 |

## 为什么优先 embedded，及不应扩大修复的范围

原始实现证据表明子列嵌套在 parent.columns，而这些 renderer 的 fallback 仅查顶层 model.fields；embedded 对象使这些 renderer 可以直接取得子列定义。放置命令当时写入这个副本，渲染器随后一直优先读取它。这说明当前技术依赖，不等于业务明确要求“工作文档内子列永远冻结于放置时”。本实例没有找到按版本、生效或历史状态选择放置时旧字段的分支；也不把没有找到视为穷尽业务政策。

`DEC-0077-12` 明确生产首次 START / 自定义表单附加时复制当时模板配置，之后修改模板不回写已有执行快照；`DEC-0077-13` 继续保留来源冻结及 A12 延期。应区分两层：当前尚在编辑的同一 model/canvas 必须能够通过正常编辑命令保持一致；已有生产对象自己的完整冻结 model/canvas 不应靠渲染时查询最新模板来“修复”。最小方案应只改当前文档写路径。不要在 parse/load/render 时批量刷新旧缓存，不迁移/恢复旧数据，不把本批变成 A12。

本问题截至本辅助报告仅为**合法入口得到充分源码支持的确定性不一致线索**。实际红绿复现、影响定级、改动和独立验收由主审及全新 QA 实例完成，本实例未运行而不冒充运行确认。

## 最小边界和具体验证建议

1. 沿现有 updateField / syncBoundNodesForField 的一次文档事务，同步本次 parent 下仍存在的 child placement；定位至少包含 subTableId + childId，避免同名字段或其他表的独立字段被改。保留每个 node.id、fieldId、subTableFieldId、parentId、页面/Word/单元格布局和 projection sources。
2. child 定义改变后更新 embedded 对象，并沿既有类型兼容约定更新组件 type/label；兼容控件保留 widgetConfig、明确 displayLabel/defaultValue/readonly 等 placement 覆盖，不因改名清除用户配置；类型不兼容才采用既有的必要重置。不要添加名字猜测或重分配来源 ID。
3. 基础用例由主审选择：合法创建 parent/child/placement → 同 child 改名 / text→number → canvas/mock/fullpage/list 读取；保存重读；一个 undo/redo 同时还原 model 和 child snapshot；多页/嵌套节点；同 childId 不同 parent 隔离；非目标字段/布局/projection 不变；disabled status 同步但原显示政策保留。
4. 参照 widgetConfig 明确覆盖 field.typeConfig 的分支是原有配置层级，不能要求每次模型变化抹除所有覆盖。测试应陈述模型字段定义、组件类型和 placement 配置分别验证什么。

## 历史去重与拆分路径

- PR5/6 已合并，H005、H017 删除保护 schema、H018 quantity fixture、H019–21 按原历史 ID 和原验收保留，不重开旧 PR。
- PR10 W2-F001-SAVE-ACK、PR11 H002 份数/状态、PR12 W2-R001 保存至正式投影组合回归，以及 PR13 W2-F002-COLUMN-INSERT-NODE-ALIGNMENT / W2-T001 测试入口均已合并。本批沿旧 `W2-C002-SUBFIELD-EMBEDDED-SNAPSHOT` 继续取证；不把同名其他批次 W2-F002-FORM-AVAILABILITY 混成同一问题。原测试次数不是本批新通过次数。
- H003/4、H009/10 仍留 W3，其他领域按台账顺序继续。A12 变更/作废及两项旧 DHR high 依用户明确决定暂缓，仍 open，不因编辑器同步关闭完整生命周期。
- 具体大模块方案沿既有 R-006 / `structure/refactor-plan.md` S04：先把纯坐标运算移至 `store/operations/sheetCoordinates.ts`，纯 page 命令至 `sheetDocumentCommands.ts`，本类 model/placement 对齐归 `fieldBindings.ts`；store 仍唯一拥有一次完整 document history 提交。
- 下一独立提取才解除 store→componentRegistry→store 的 value 循环：`registry/componentNodeFactories.ts` 提供无 React/store 的默认 node/label metadata，registry 组装 renderer，store 只取默认工厂。逐组件保留默认值、ID前缀、绑定、schema，不能制造第二个 registry。保留原三片保存协议与50条历史，先 characterization 后提取。本批只局部修复，不顺带实施这些模块迁移。

## 证据分类及未执行项

本基线源码、Git tree/diff/remote 属于 `original-evidence`；旧台账和旧质量报告属于 `secondary-reference`；用户 A12 暂缓、手工 merge 的边界属于 `user-confirmed`；缺陷效果、最小实现建议及依赖风险中未经运行部分属于 `inference` / 源码支持线索。

读取两项 frontend-design 技能和 mandatory canonical/verification 参考，实际核对完整 DESIGN.md；仓库没有根 UX-CONTRACT.md 或 premium-ui.json。本任务只读且主审明确禁止运行校验，不创建全局设计契约、不运行 premium 或修改设计资产，不宣称完整技能静态/运行合规；适用门禁由主审交付切片执行。既有 ESLint/vendor/premium 失败只保留为原台账限制，没有新的通过声明。

实际命令仅限 rg/sed/cat、Git 对象/差异/远端读取、Python 生成固定 CSV 和安全 metadata。输出仅 `/tmp` 文件，不写仓库。全1894条清单仍 pending；本报告不能批准自动合并、部署、历史处置或完整 W2 结案。
