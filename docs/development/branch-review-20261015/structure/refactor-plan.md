# edhr-dev 结构审查首批方案（W0 扫描 / W6 草案）

基线：`537bb2402227bfe6369c44c2b1b4686481c50f27`；tree `401d4bf799985d8a3079be0d44270aaa7f2813dc`；知识模型 `0.3.25`。来源/目标/契约读取均为该提交，目标 `edhr-dev`，未提交契约路径 `[]`。此文是主审的只读结构分析输入，不是最终质量结果。未修改仓库、未执行测试、未操作数据库、未访问 Actions。

## 测量与审查范围

`metrics.json` 枚举 `git ls-files -z` 的 1,422 个当前跟踪普通文件；13 个二进制保留记录而不计文本行。323 个 TS/JS 文件用项目已安装 TypeScript compiler AST 得到真实函数/箭头/方法起止行、嵌套函数、控制分支及 hook 调用。448 个 Java 文件用去注释/字符串/text-block 后括号平衡提取方法，是词法近似，不能替代 Java 编译/语法分析。物理行包含空行和注释；分支数包含子函数，不能冒充圈复杂度。import 图覆盖静态 ES import/export、相对路径与 `@/` 别名；动态 import、require、反射和运行请求不在自动图内。

主审重点七个源文件均亲自读了职责边界、状态/接口及关键操作片段，另读五个支撑源文件（`router/index.tsx`、`FormDocumentPreview.tsx`、`MockFillDialog.tsx`、`componentRegistry.tsx`、`utils/document.ts`）。其中只有 `FormDocumentPreview.tsx` 阅读范围覆盖全文件，其他为定位式架构阅读；不能据此把七个模块或全仓标记为语义已通过。测试脚本仅检查入口与部分断言，未执行。完整读取范围见 `source-review.json`。

| 当前文件（frontend 路径省略 `gmp-platform/frontend/src/`） | 物理行 | 实际大符号 / AST 范围 | 文件内状态 / 请求信号 |
|---|---:|---|---|
| `pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx` | 7,096 | `CanvasSheetWorkspace` 1297–7096（5,800）；`renderWordDocumentLayer` 5139–5594（456）；`renderImportedGrid` 4908–5137（230） | 49 store selector 调用、29 useState、25 useRef、18 useEffect |
| `pages/master-data/ProcessModelingPage.tsx` | 5,143 | `ProcessModelingPage` 1867–5143（3,277）；`renderFormField` 3635–3812（178） | 45 useState、28 useMemo、5 useQuery、10 useMutation |
| `pages/workflow-center/WorkTemplateEditor.tsx` | 5,049 | `FlowWorkspace` forwardRef 回调 1683–4415（2,733）；外层 `WorkTemplateEditor` 4420–5049（630）；`validateFlowGraphForPublish` 454–652（199） | 27 useState、12 useRef、7 useQuery、5 useMutation |
| `pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts` | 3,490 | Zustand create 回调 1903–3490（1,588）；`setSelectedSubTableHeaderVisible` 2623–2732（110） | 文档、选区、绑定、历史及 UI 状态同一 store |
| `pages/master-data/DhrTemplateWorkspaceDialog.tsx` | 2,980 | `DhrTemplateWorkspace` 1206–2980（1,775）；`DhrContentTree` 203–486（284）；`SheetPreview` 651–884（234）；`FormCanvasPreview` 1021–1106（86） | 26 useState、12 useEffect、5 useQuery、1 useMutation |
| `pages/master-data/components/ProductProcessVersionEditorDialog.tsx` | 1,155 | 对话框 831–1155（325）；`DhrDirectoryFormPicker` 497–641（145）；`RdoVersionTreeSelect` 237–369（133） | 23 useState、20 useMemo、4 useQuery；多个导出又供另一工作台复用 |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java` | 1,249 | `createBatchRecordTemplate` 335–369；`saveFormTemplateVersionDesign` 230–253；审计 975–993、1119–1147 | 64 Java import；CRUD、版本、分类、DTO、审计；导入已委托独立 service |

TS 全静态图有三组 SCC：`types/model.ts ↔ types/canvas.ts`（类型）、`DhrTemplateWorkspaceDialog ↔ FormDocumentPreview`（返回边仅 type）、`useTemplateDesignerStore ↔ componentRegistry`（value）。剔除 type-only import 后只有最后一组。没有证据支持“类型循环已经导致运行错误”；value 循环是已确认耦合，也未发现本轮运行失败。

## S01：共享渲染器脱离编辑页面（优先的结构候选）

**为何拆**：源码真实运行链是 `App.tsx:7 → router/index.tsx lazy import → DhrFillingPage:17 / DhrManagementPage:77 / FormFillingPage:51 / FormReviewPage:27 / FormInstanceListPage:52 / ProductionExecutionPage:8 / FormProjectionReportPage:15 → DhrTemplateWorkspaceDialog.FormCanvasPreview:1021`。`DhrEvidenceCanvas:5` 也从该页面取 renderer。之后 `FormCanvasPreview` 的 fullPage 分支 `:1054 → template-designer-react/components/form-preview/FormDocumentPreview:47 → MockFillDialog` 导出的 `renderMockFillControl:465`、`FormSheetPage:980`、`MockFillPreviewPage:1372`。`FormDocumentPreview:9` 返回 workspace 的边只导入 `PreviewFieldInteraction` 类型，不能说是运行循环。当前风险是运行与历史读取入口对编辑对话框和 mock-fill 文件布局的广泛耦合，改预览文件需回归多个入口。

**具体目标 / 接口**：

1. 新 `components/form-renderer/previewTypes.ts` 原样接收 `PreviewFieldPermission`、`PreviewFieldAction`、`PreviewFieldInteraction`（当前 workspace 514–532），只依赖 React 类型。新 `components/form-renderer/FormCanvasPreview.tsx` 接收原 `document / fieldPermissions / interaction / runtime / layout / fullPage`，输出同一 ReactElement；迁移 `PreviewFieldActionBar`、`PreviewField`、`SheetPreview`、`FieldListPreview` 及其专属纯辅助函数到相邻模块。`FormCanvasPreview` 自持 pageId；业务 values/上传/引用/签名命令继续由调用页面经 `FormRuntime` 提供。
2. 再分独立小批将 `FormDocumentPreview`、`FormSheetPage` 与 `renderMockFillControl` 实际共享的纸张/控件职责移到 `components/form-renderer/paper/`；mock-fill 对话框作为消费者，保留其模拟数据/签名预览状态。不能把 mock 对话框整文件原样搬到公共目录。真实附件和可编辑引用继续走 `FormRuntimeField`，不能误换为 mock 控件。
3. 依赖方向 `业务/编辑入口 → 公共 preview → runtime field + 设计文档类型/纯布局工具`；公共 renderer 不 import workspace/page/mock 对话框。首次可用旧页面原路径 re-export 保持兼容，批量消费者随后切到新路径，最后移除 shim。

**不变量**：主/子表 fieldId、rowIndex、referenceValues 合并；字段/整表 READ_ONLY 与签名权限差异；签名脏值失效；Word / sheet / field-list 三分支；隐藏字段、高亮与 actions；空态、纸张、动态行、边框；API、历史文档和序列化不变。源码 `bindFormPreviewField` 已有禁止只读回调写入的保护，拆分不可只保留 disabled 样式。

**保护 / 缺口**：复用 `scripts/test-form-document-preview.mjs`、`test-dhr-word-preview.mjs`、`test-form-references.mjs`、`test-review-batch-01.mjs`；`verify:dhr-template-workspace` 只是源码契约检查，路径调整需保持原断言目的。增加公共入口加载与页面实际适配、主表/双动态行读写、READ_ONLY、Word 只读、附件/引用、历史值定位交互；代表性浏览器覆盖生产填报和 DHR 历史读取。没有运行这些检查。

**处置 / 回滚**：可选分批结构整改，无确证当前业务缺陷依赖其完成；优先级高于单纯瘦身。先移动 types 和稳定 renderer，再移 paper，再改消费者；每批构建/针对性回归。旧导出 shim 可回滚 import 批次；无迁移/历史数据写入。不得为这一项顺带重写设计器类型层。

## S02：CanvasSheetWorkspace 分离渲染、手势和坐标转换

**已读边界**：顶部 `getWordTableRangeBounds / isWordTableCellInRange / getCompleteWordTableSelectionRange` 是无网络、无 store 的选区纯计算；组件起始 1297–1382 同时订阅大量 store 并持本地编辑/拖拽状态。`startStyleFillDrag` 3184–3259 安装 ownerDocument 和 window 监听，pointerup 才调用一次 `fillSheetCellStyles`，Escape/blur/pointercancel 不提交，页面变化 effect 清理。`renderImportedGrid` 4908–5137 读取合并范围、选区、编辑态；`renderWordDocumentLayer` 5139–5594 处理 Word 段落与表格、失焦写回。

**目标**：先把选区纯函数移到 `utils/wordTableSelection.ts`，输入 `CanvasWordTableBlock / WordTableCellRange[]`，输出 `WordTableRange | null`，不持状态。第二批 `components/canvas/SheetGridLayer.tsx` 输入已算 displayPage、轨道、viewport rows、selection/editing + callbacks，输出 grid，不自行订阅整份 document。`WordDocumentLayer.tsx` 输入文档、选区/resize preview 与命令 callbacks；`SubTableOverlayLayer.tsx` 输入 regions/几何/hover。最后才考虑 `hooks/useSheetStyleFillGesture.ts`，仅持手势瞬态和 cleanup，接收 viewport ref、坐标映射函数与单次 commit 回调；不再造持久文档 store。

**所有权 / 不变量**：持久 document、bindings、history 仍 store；当前编辑草稿、手势/鼠标捕获与 viewport 归 workspace 或专用手势 hook，不能复制同一 state。始终在拖拽终止提交一个命令；取消无写入；变页/卸载完整清理；纸张缩放、合并单元格、动态子表布局不变；保留实际 clipboard MIME 与 Word marker 编码。`renderImportedGrid` 与 Word renderer 适用的页面有差异，不能统一成万能配置组件。

**回归**：现有 `test-sheet-cell-transfer.mjs`、`test-quick-sub-table.mjs`、`test-cell-display-components.mjs`、`verify:template-designer-react` 可保护局部逻辑；需补纯选区反向/越界、真实 pointer cancel / blur / page switch、一次拖拽一次 undo 的交互。收益为手势资源安全和可单测边界；依赖 S04 纯命令接口稳定后再动状态。可选后续，不本轮承诺 5,800 行函数全部拆完；每次纯搬迁独立 revert，不改数据。

## S03：ProcessModelingPage 分离路线算法与列表偏好

**已读边界**：`getRouteEdgeMaps / getRouteParallelGroups` 1035–1184 基于边推断并行、共同汇合及嵌套编号；`fromRouteGraphResponse` 1579–1621 与 `toRouteGraphPayload` 1623–1657 包含边界节点、REWORK、handle、位置取整、排序和并行关系。外层 1867–5143 同时负责材料、工序、路线列表、分类、列偏好、审计抽屉和 ReactFlow。`saveRouteGraphMutation` 2447–2461 单独调用保存图 API，版本创建/更新与图保存当前是前端分步编排；不能在结构 PR 中声称已变成单事务。

**目标**：`pages/master-data/process-modeling/routeGraphCodec.ts` 接收 response 或 nodes/edges，输出 hydrated graph / payload，无 React hooks；`routeGraphAnalysis.ts` 输出 parallel/rework badges 和冲突判断；`processTablePreferences.ts` 保留各 pageKey 存储键、schemaVersion、列宽上下界及排序归一化；`RouteGraphWorkspace.tsx` 持 ReactFlow nodes/edges/viewport 与交互，输入 version identity、initial graph、operation library、onSaveGraph；父页保留具体 CRUD mutation 和审计聚合。不要把所有表单/CRUD 再移到 3,000 行 hook。

**回归 / 约束**：先为 codec 建真实输入输出 roundtrip，包括历史缺失 START/END、handle fallback、并行与返工混合、空图、ID 字符串、ruleExpression 与优先级。偏好旧存储兼容/未知列/页面隔离。`verify:process-modeling` 当前大量 `mustInclude`，只算静态约束，不能代替算法回归；需保持目标断言并调整文件来源。后端路线图现有测试按矩阵选择，浏览器验证创建版本、保存失败留图和选择/删节点。收益是独立测量复杂算法，回滚纯提取无数据迁移。可选，W4 语义未核清前只先准备 codec characterization，不改变并行规则。

## S04：useTemplateDesignerStore 保持事务壳，提取纯文档操作

**已读边界**：1785–1886 同一接口有 document、savedSnapshot、history、selection、字段/画布/工作流命令。`pushDocumentHistory` 1888–1901 在 document 引用改变时推入一次历史，最多 50，清空 redo；`replaceCurrentPageFromImport` 2801–2828 保留 page id/name；插行 2868–2903 同步 cells、merged ranges、nodes/子表模板；paste/fill 3110–3132 一次 push；undo/redo 3306–3330 交换同一文档；markSaved/isDirty 3481–3489 比较完整 JSON。真实序列化在 `utils/document.ts:360`，封装 schema `edhr-template-designer-react` version 1 三个 slice，并非 store 自定义另一个保存协议。

**目标**：`store/operations/sheetCoordinates.ts` 纯位移/范围运算；`store/operations/sheetDocumentCommands.ts` 输入 page + 命令、输出完整 next page；`fieldBindings.ts` 管绑定树与 model 对齐；store 的 `set(state => pushDocumentHistory(...))` 保持唯一提交入口，先不拆多个互相调用的 Zustand slices。每次命令返回 document 与 selection 一致的 nextState，不能先改 field 再改 canvas 各推一次历史。

**value 循环的具体解除**：store:22 `getComponentDefinition` → `componentRegistry.tsx:25` 再取 store；store 在 `createBoundNodeFromField:1617` 实际只用 `createDefaultNode` 和 label，而 registry 同时把 renderDesigner 和 schema 绑在一起。新 `registry/componentNodeFactories.ts` 持纯默认节点工厂/label/schema metadata，`getDefaultComponentNode(type)` 不 import React/store；registry 组装 factories + renderer，store 只取 factory。类型/默认值/ID 前缀/必填/readonly/空值占位与 schema 必须逐组件保真，不另造重复 registry。未发现本轮循环运行失败，不标业务 bug。

**回归 / 回滚**：复用 cell-transfer、quick-sub-table、cell-display、projection-panel、field-business-purpose 和 document 解析/序列化测试；补每种默认 component 旧/新等价、一次复杂子表操作只一个 undo、redo 清空和 50 上限、import 保留 page identity、save-load 字节/语义兼容。先纯函数，再 factory 解除循环，再命令封装；无 migration，逐批 revert。风险是过度拆分失去原子性，若测试不足则保持 store 壳，不以行数强制拆。

## S05：WorkTemplateEditor 的图协议、发布校验、节点配置和交互

**已读边界**：`persistentFlowGraph:366–378` 去 node 的 selected/dragging 后保存；`validateFlowGraphForPublish:454–652` 校验 FORM/PROCESS 配置、表单版本资格、CONDITION、入口/出口、连接可达；`normalizeFlowGraph:654–749` 按现有约束过滤旧条件节点及关联边（是否业务缺陷在 W3 单独核对，结构拆分不得改政策）。FlowWorkspace 1683–4415 持 nodes/edges、selection、menus、引用候选、validation、dirty 和 history refs；recordHistory/undo/redo 1903–1947、拖拽结束 3426–3430。外层 4420–5049 持版本加载/保存/复制/发布、未保存确认和 skipGraphReset。

**目标**：`workflow-center/work-template/flowGraphCodec.ts` 暴露 normalize/persistent；`flowGraphValidation.ts` 输入 graph + 显式 referenceableFormVersionIds，输出原 FlowValidationResult；`FlowNodeConfigurationPanel.tsx` 输入 selected node/config/options + onPatch，不持第二份 graph；`WorkFlowCanvas.tsx` 持 ReactFlow/undo/redo/dragstart，暴露与现有 FlowWorkspaceHandle 相同 graph/validate/markSaved/deleteNode。最外 editor 持 templateId/selectedVersionId/server mutations/confirmations；发布资格刷新仍由原入口安排，不能把第一次列表缓存当实时资格。

**不变量 / 验证**：节点/出口/branch id、otherwise 唯一性、连线序列化、DRAFT 可编辑、只读发布版、dirty 确认、save 后 graph 不被 refetch 重置、拖拽一次 history、复制/虚拟初稿行为。先 codec characterization（含 malformed JSON 与 legacy condition 的当前行为），再 validator 边界与后端发布反向测试，再配置信息面板；最后迁移 canvas。旧条件过滤带业务风险，不在纯提取时顺带修。没有证据表明已有专门实际 codec 动态测试，需补而不是仅源码 `includes`。可选后续，发布与保存问题若证实才选其最小提取；逐批 revert，无历史回填。

## S06：ProductProcessVersionEditorDialog 先解引用显示再提取选择器

**已读边界**：当前同时导出可复用目录选择、文档/表单预览、绑定列表，`ProductModelingWorkspacePage:89` 又回到该对话框文件 import，产品簇和产品页使用默认 editor。`RdoVersionTreeSelect:281` 仅从 options find 当前 value，`:311` selected 不存在时显示空；外层 optionsQuery:868 使用 previous placeholder；已有表单/文档绑定在 :940 附近按当前 option map 查找再 filter(Boolean)。这是源码显示链事实，尚不足以把“候选缺失＝失效/非法”定为缺陷。需要 W4 对照后端 loadOptions、历史来源快照和已确认版本政策。

**目标**：`components/rdo/RdoVersionTreeSelect.tsx` 输入 options、selectedId、显式 selectedReference（已持有名称/版本/状态时）、loadState，输出 onChange(id)；分离 display identity 与 selectable candidates，不推断缺失原因。`DhrDirectoryFormPicker.tsx` 与 `ReferenceBindingList.tsx` 原接口提取，预览组件调用 S01 公共 renderer。`product-process-editor/versionDraft.ts` 纯 toVersionForm/toOperationDrafts/toPayload；父 dialog 拥有 form、operation drafts、dirty 与 route 初始化，候选 query 单独适配但仍以 product + selected DHR version 为 key。

**契约 / 顺序**：保留绑定 ID 与目录项 ID、同模板目录来源、DIRECT/PROCESS 与签署资格、route switch 的确认策略/清空行为；不擅自新增保存禁入/生产准入规则。不在尚未确认 invalid 情况时清 ID。先补已选版本不在当前候选、请求失败/加载/权限、旧 binding 不丢失的显示测试，若 current bug 成立以局部修复先走；然后拆稳定选择器/纯 DTO。现有 process-modeling verify 只是结构检查；需实际组件页面适配/回显与 loadOptions 测试。此候选有业务待核线索，方案可写，改规则必须先确认；回滚原 props 与 imports 无数据迁移。

## S07：TemplateModelingController 按事务用例提取，避免重复历史工作

**反证旧线索**：当前只有 1,249 行，legacy Word import :118–120 已委托 `TemplateLegacyWordImportService.importDoc`，不是旧文档描述的 PDF/Excel/Word/图片解析全挤在本控制器。不能再次提出“先拆所有解析器”并称当前缺陷。

**现有明确边界**：createFormTemplate:125、createBatchRecordTemplate:335 各将主模板/初始版本/两条审计写在同一 public `@Transactional`；save design:230–253 将 lookup 快照准备、三个 JSON slice 和审计同事务；delete template/version 维持 ProtectDeletion 的入口参数位置；categories :419–509 同步分类名及记录。writeChangedAudit:975–993 只记录非系统字段差异，toAuditJson 失败会抛业务错误使事务回滚。

**目标**：`template/service/FormTemplateCommandService` 含 create/update/version/design 用例，`DhrTemplateCommandService` 含 DHR create/update/delete，`TemplateCategoryCommandService` 含创建/重命名/重排及关联更新。controller 保持原 HTTP 参数、PreAuthorize、响应 DTO 和 ProtectDeletion AOP 位置，调一个 public transactional service 方法；审计 writer 可提 `TemplateAuditWriter` 但不能使用 REQUIRES_NEW、async 或吞序列化错误。`TemplateModelingQueryService` 只在确需复用时提取分页/批量版本 counts，先别扩成统一 repository 框架。DTO 可先保留在原 public record 防止 API 测试/调用方编译破坏。

**测试 / 收益 / 风险**：复用 `TemplateModelingControllerTest` 的审计/独立版本/唯一性/删除/委托解析检查及 `TemplateProjectionAuthorizationTest` 等现有权限测试；Mock repository 单元测试不能证明 transaction rollback，需真实 DB 注入审计失败验证主模板、版本、分类重命名全部无部分写入。保留 Snowflake response 字符串、版本身份、设计 JSON、audit operator/差异、事务和删除 AOP 参数；提取事务后集成测试须从 Spring proxy 入口验证。先选择单用例（例如 createFormTemplate）形成独立小批后推广，不一次拆全部。可选；若 W1/W2 确认原子性缺陷再只提取该必要用例。无 migration 的源码提取可 revert；已经发生的数据写入/审计不会因 revert 被抹除。

## 批次顺序、状态与退出

本轮全部为 `proposed / not-implemented`。S01/S04 是已确认的依赖耦合；S06 是源码候选须做完整业务链反证；其余为明确的大模块职责方案。没有把长文件或循环直接定为已证实业务缺陷，没有新功能或全重构承诺。

推荐按具体缺陷所在域先建立 characterization：S04 纯函数与 factory → S01 types/稳定 renderer → S03 codec/偏好 → S05 validator/codec → S06 候选与已选身份适配（仅规则核清后）→ S02 手势/子图层 → S07 单事务用例。无依赖模块可并行，选中哪个批次由主审根据 W1–W5 的根因决定，并不要求全部实施。每批必须能单独构建、保留协议和撤销/审计边界，相关测试通过后由未参与修复的最终质量实例独立核对；新增副作用再作迁移/回滚评估。

下一步：随 W1–W5 深入核对各候选的规则与实际入口；把确证问题对应到最小必要结构提取，其余保留为可选方案。后续 edhr-dev 更新时重新获取/核对，记录路径与函数范围增量，不能沿用该 baseline 直接声称新 tree 已审。
