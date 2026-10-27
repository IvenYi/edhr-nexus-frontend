# Designer 非拖动入口只读核对

固定基线：`00b98f8cf3ca8a3696e15d1ffac2b3b766314f2c`。这是源码辅助核对，不是正式独立质量验收。未运行浏览器、测试、构建或 Maven；未修改仓库。

结论：设计器有非拖动入口，但能力不同：显示组件可点击插入，已有子表可通过菜单设定，快速添加只创建模型字段。已追踪 UI 中仍未找到“已有普通未放置字段”的非拖动首次放置入口；保留既有候选 `adjacent.designer-field-card-keyboard-placement`，不新增同根编号、不宣称全设计器没有替代。

键盘方面需要真实页面验证 ContextMenu/Shift+F10 的浏览器行为和焦点/选区；不能仅因缺少显式 keydown 分支就断言键盘菜单不可用。

## 有界源码覆盖与下一步

### ND01 · CanvasTab rail Buttons / DesignerSidebar/ComponentLibrary rendering

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx`，定位：90-160。状态：source-inspected / pending-runtime。

fields/grid等侧栏有真实Button.onClick；fields展示DesignerSidebar，grid展示ComponentLibrary。切换侧栏本身不放置业务字段。

实际可执行的下一步：在真实设计器按Tab聚焦侧栏按钮，以Enter切换fields/grid，检查焦点和当前画布选择保留。

### ND02 · handleFieldPointerDown / field card Button

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx`，定位：212-279;340-373。状态：source-inspected / pending-runtime。

普通字段卡为真实Button，draggable=false，只有onPointerDown；4px阈值后通过template-designer-field-pointer-drop发出目标坐标。未发现本地onClick/onKeyDown插入处理。只能证明本卡片已接入指针路径，不能由此推断整个设计器。

实际可执行的下一步：准备一个可用未放置普通字段，Tab聚焦其卡片，分别Enter/Space，观察nodes和焦点；随后指针拖放作为对照。

### ND03 · addDroppedFieldToCell / addDroppedFieldToWordTableCell / FIELD_POINTER_DROP_EVENT listener

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`，定位：2800;3422-3533;4945+。状态：source-inspected / pending-runtime。

指针事件按sheet/Word目标分流，网格drop解析范围后调用ToCell，Word drop调用Word cell API。网格原生onDrop也是现有入口；这些仍依赖拖放，不是非拖动替代。

实际可执行的下一步：分别以普通网格和Word表格作为真实目标，验证坐标绑定、重复放置限制与撤销。

### ND04 · handleOpenQuickAddFieldsDialog / handleConfirmQuickAddFields / renderQuickAddFieldDialog / quick-add-fields MenuItem

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`，定位：4487;4504;4583;5768;6947。状态：source-inspected / pending-runtime。

单元格右键菜单“快速添加字段”打开可点击对话框；确认只调用addFields/addSubTableFields创建模型字段并切换fields侧栏，没有调用节点放置API。不能算已有普通字段的非拖动放置入口。

实际可执行的下一步：从可选区域打开快速添加，检查model.fields增加、canvas nodes不增加；再检查键盘是否能进入和办理该菜单/对话框。

### ND05 · handleSetSubTableField / renderSetSubTableMenu / handleCreateQuickSubTable

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`，定位：4343-4380;4809+;4878-4893;6953;7072+。状态：source-inspected / pending-runtime。

已有子表存在确定的非拖动放置路径：“设为子表”MenuItem/子菜单onClick→addNodeFromFieldToRange。菜单需cell轴、多单元格、非已有子表选择、存在availableSubTableFields。另“快速设为子表”调用createSubTableFromRange，同时创建模型及绑定。该能力不能泛化到普通字段。

实际可执行的下一步：使用一份仅一个和一份多个可用子表的模型，在合法多格范围点击设为子表；验证选择、范围绑定、重叠拒绝和undo/redo。

### ND06 · dispatchInsert / ComponentLibrary card Button.onClick

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/ComponentLibrary.tsx`，定位：80;94-110。状态：source-inspected / pending-runtime。

组件卡明确onClick发common-component-insert；CanvasSheetWorkspace监听并在选中范围或free canvas插入。registry明确为display components，不创建business fields。text等显示组件有非拖动入口，不能替代普通模型字段的放置。

实际可执行的下一步：选一个cell，点击及键盘Enter激活text组件；检查display node产生而model.fields不增加。没有选择范围时检查原有提示。

### ND07 · handleSheetKeyDown / sheet root tabIndex/onKeyDown / cell onContextMenu

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`，定位：3539+;4945+;6535-6542。状态：source-inspected / pending-runtime。

键盘支持已放置节点的cut/paste、清除及Enter/F2文本编辑；sheet根tabIndex=0，cell为-1。未发现显式ContextMenu/Shift+F10、普通字段选择插入命令。浏览器可能对当前焦点合成contextmenu，不能仅凭未写按键分支宣称不能键盘开菜单。

实际可执行的下一步：在真实页面从Tab进入sheet，测试ContextMenu及Shift+F10菜单位置和有效range；检查是否可仅键盘选择目标并首次插入普通字段。另测试已绑定节点cut/paste，区分移动与首次放置。

### ND08 · addNodeFromField / addNodeFromFieldToCell / addNodeFromFieldToWordTableCell / addNodeFromFieldToRange

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`，定位：1899-1903;2398-2520。状态：source-inspected / pending-runtime。

通用addNodeFromField存在，但rg frontend/src仅找到API声明/实现，未找到实际产品UI调用，不能作为用户入口。各专用方法保留enabled/available过滤、表格目标/范围及子表限制，并以pushDocumentHistory管理绑定修改。

实际可执行的下一步：后续任何确认修复应调用匹配当前目标的现有guarded API，验证可用/已绑定/禁用字段、Word/网格、历史及序列化，而不是直接绕过store追加node。

### ND09 · addFields / addSubTableFields / createSubTableFromRange / getAvailableFieldsForCurrentVersion

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`，定位：2189-2240;2544+;3514+。状态：source-inspected / pending-runtime。

addFields创建模型及选中字段，不生成画布节点；子表range创建同时生成模型及绑定。可用字段基于enabled及当前页已绑定ID过滤。快速添加与普通字段卡的能力边界在store层也不同。

实际可执行的下一步：对真实入口核对模型和节点数、唯一字段名、可用列表、重复绑定限制及保存后重新读取；不要把内部store脚本调用冒充UI覆盖。

### ND10 · source assertions / store helper checks

路径：`gmp-platform/frontend/scripts/verify-template-designer-react.mjs`，定位：1207-1318;1542;2222。状态：source-inspected / pending-runtime。

现有脚本明确拒绝字段卡onClick直接addNodeFromField的字符串模式，并覆盖quick-add/store APIs；browser save脚本用store API注入绑定数据，不能证明UI普通字段插入；decorative preview browser只实际验证指针drop和ghost语义。此次只阅读，所有脚本均未执行。

实际可执行的下一步：新增验证应覆盖真实CanvasTab/Sidebar/menu与store联动；不以脚本中程序化store放置或只含handler源码字符串冒充非拖动可用。

## 保留候选及最小方案

延续原候选而非新增同根缺陷。已找到显示组件点击插入、子表菜单放置、快速创建模型字段，均不能证明已有普通字段首次放置有非拖动替代。在已追踪的产品UI调用中未找到此普通字段替代；未作浏览器复验，不宣称整个设计器无替代或已构成完整可访问性缺陷。

若真实浏览器确认已有普通字段缺少可用非拖动放置，先明确现有交互合同，再考虑选择目标cell/range后提供显式放置/绑定命令；通过现有ToCell/Word/Range API实现。不要直接把旧generic addNodeFromField绑到卡片点击；现有测试有意禁止该形式。

保护条件：
- 保留现有字段可用性、enabled、当前页重复绑定限制
- 尊重网格与Word目标差异和现有子表多格/重叠guard
- 保留选区、撤销/重做、保存序列化和原指针拖放
- 不更改业务字段/模型定义和业务政策，不降低现有测试标准

现有 source assertion 刻意不允许直接把 `addNodeFromField(field.id)` 绑到字段卡 onClick；它是当前实现/测试依据，不等于业务政策或无障碍豁免。任何后续整改须先由真实交互确认缺口，并保留或明确评估该合同。

## 边界

只完成上述 10 个方法/入口范围。未将文件数或方法数当作全文件/全产品审查完成。没有修改生产管理弹窗样式。脚本中程序化 store 注入不能冒充用户入口验证。
