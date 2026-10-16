# 方法范围与拆分边界

固定基线 37bc05ec，方法定位来自本批原始源码核对；修复后行号会偏移。下表只声明列明方法/分支已读，不声明整个大文件已审。[只读辅助原始报告](evidence/inventory-review.md)保留更细调用图及证据分类；该报告产生于运行复现前，线索状态不反填。

| 路径/方法（设计器路径相对 template-designer-react） | 核对范围及结论 |
| --- | --- |
| tabs/model/ModelTab.tsx:421/576/594/608 | 子列编辑通过父字段 updateField(columns)；名称/类型改变保持 child ID，UI 允许已放置子列改型。 |
| 同文件 setCurrentFieldStatus:585、新增:632 | 状态及新增也经父字段更新；状态同步不能推导删除或隐藏政策。纯 append 不是旧子列编辑触发。 |
| store/useTemplateDesignerStore.ts createBoundNodeFromSubTableField:1704、放置:2441 | 原放置嵌入子列对象，fieldId=childId，另存 subTableId/subTableFieldId；本批保留 ID/布局。 |
| 同文件 syncBoundNodesForField:1806、updateField:2246 | 原同步仅匹配主字段；本批补 parent/child 匹配，遍历全部页及递归 children，不原地改旧 document。 |
| registry/componentRegistry.tsx useBoundField:201、DesignerInspector.tsx:783 | 优先 embedded；getFieldById 只查顶层，不能依赖 fallback 获得 canonical child。 |
| components/mock-fill/MockFillDialog.tsx resolveBoundField:179/renderFieldNode:1016 | embedded 优先决定实际控件；真实浏览器复现旧名、候选新名/数字输入。 |
| components/form-preview/FormDocumentPreview.tsx renderField:68 | suppliedField 或 embedded 优先，FormSheetPage 的 suppliedField 也来自同一 resolver；实际 SSR 与模拟分别验证。 |
| components/form-renderer/FormRuntimeField.tsx RuntimeSubTable:58（frontend/src 下） | 通用列表直接用 parent.columns，原来已正确；独立正对照，不替代纸面验证。 |
| components/form-renderer/referenceConfig.ts syncReferenceConfig:20、store updateNodeBindings:2646 | 既有参照配置命令已按 parent/child 同步；不代表通用 ModelTab 编辑此前也有同步。 |
| TemplateDesignerReactShell.tsx persistCurrentDocument:102、utils/document.ts serialize:360/parse:345 | 原 model/canvas/workflow 三片保存，解析不重绑 child；本批受控回调及序列化验证不外推真实 HTTP/JPA。 |
| store pushDocumentHistory:1946、undoCanvasChange:3367/redo:3380 | 单一完整 document 历史、上限50；本批同命令单次 undo/redo，保存边界不变。 |
| backend template/FormLookupCatalogService.prepareDesign:248 | 源码核对 model/canvas 分别处理，无后端自动修复旧 embedded 的保证；无后端改动。 |
| backend production/ExecutionSnapshotBuilder.form:187、ProductionExecutionService | 使用时复制当时模板，已有执行读自身 snapshot；不改读取所有权或旧快照。仅源码边界检查。 |

## 大模块具体拆分方案

沿原 R-006 / structure/refactor-plan.md 的 S04，不在这次小修复内移动模块：先将纯坐标运算提取到 store/operations/sheetCoordinates.ts，纯 page 命令到 sheetDocumentCommands.ts，本类 model/placement 对齐归 fieldBindings.ts，输入 document/fieldId/patch、输出完整 nextDocument。store 保持唯一一次 history 提交，保持 model/canvas/workflow 三片保存协议。

第二个独立切片才解除 store→componentRegistry→store 值依赖：registry/componentNodeFactories.ts 提供无 React/store 的默认 node/label metadata，registry 仅组装 renderer，store 只取工厂；不得产生第二 registry。逐组件 characterization 保护默认值、ID前缀、绑定/schema、50条历史和布局，再提取。此次仅局部同步，无大模块重构或新业务政策。
