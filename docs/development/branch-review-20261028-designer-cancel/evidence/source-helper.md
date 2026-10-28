# W2 设计器字段放置/取消只读源码辅助报告

状态：FINAL；固定源码基线 `6306457580dbd2787db7df8f2e3cf80ddd21defd`，知识基线 0.3.25。13 条有限方法范围，0 个整文件完成；未运行测试，不是最终独立 QA。

当前源码发现两处取消可进入提交路径：普通/子表列卡片源与 Word 已放字段移动源。需主侧真实浏览器旧红/新绿及全新质量实例验收；本辅助不修产品、不写测试。普通字段首次非拖动仍是原候选，不因本次取消修复关闭。

## DP01 · DesignerSidebar field card rendering / getAvailableFieldsForCurrentVersion selector

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx`：81-104;337-373，Git blob `3d8d20e58ecdd3858a46c5d29f2b477d06b0c9ff`。

普通字段列表来自当前页未放置enabled模型字段；子表上下文展示尚未放置的列。普通字段卡Button只有onPointerDown且draggable=false，没有onClick/onKeyDown插入；不能把按钮语义本身视为已实现键盘放置。子表列normalize保留disabled但列表此处未过滤enabled，store拒绝disabled；不在本辅助任务修改此展示差异。

## DP02 · handleFieldPointerDown / finishPointerDrag / handlePointerMove / handlePointerUp / handlePointerCancel

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx`：206-317，Git blob `3d8d20e58ecdd3858a46c5d29f2b477d06b0c9ff`。

源码确定的取消与提交共用缺口：匹配pointercancel调用与pointerup相同finishPointerDrag；active=true且坐标命中合法cell时，它仍dispatch FIELD_POINTER_DROP_EVENT。4px阈值以下取消不提交，其他pointerId的cancel被忽略；取消后listeners会移除。取消路径可误新增普通字段或子表列，grid与Word由下游分流；正式缺陷/修复关闭须浏览器原基线及候选复验。

## DP03 · moveWordTableFieldToDropPosition / beginWordTableInlineFieldMove.finish / beginWordTableInlineFieldMove.handlePointerCancel

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`：2806-2913，Git blob `4cd3c2f9c8e6ccf4c5f8a8409ee3a1c7142b583f`。

第二同根取消入口：Word已放字段移动使用finish(..., selectField)，pointercancel虽传false，但active分支不检查该参数，仍解析目标并调用moveWordTableFieldToDropPosition；只有未激活时选择逻辑检查selectField。move会移走原marker、写目标marker并改node.style.wordTableCell，通过updateCurrentPage入一次document历史；取消不应进入此提交分支。

## DP04 · resolveSubTableFieldDropMessage / getGridOffsetCellLayout / addDroppedFieldToCell / handlePointerFieldDrop

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`：536-552;2740-2752;3403-3533，Git blob `4cd3c2f9c8e6ccf4c5f8a8409ee3a1c7142b583f`。

grid指针消费先校验整数坐标及页行列边界，按真实落点取得merged-aware单元格和缓存offset几何。子表列额外要求所选范围在指定子表中，固定重复模式还须已有recordTemplate.groupRange且目标在组内；普通字段直接调用ToCell。现有拖放只使用落点单元格或其合并范围，不会批量填充当前全部选区。

## DP05 · getWordTableFieldCellLayout / addDroppedFieldToWordTableCell / Word branch of handlePointerFieldDrop

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`：2764-2805;3477-3494，Git blob `4cd3c2f9c8e6ccf4c5f8a8409ee3a1c7142b583f`。

Word目标必须有当前页实际table/cell；子表字段不能放入自由表格。使用table实际宽高及单元格样式定位，优先实际可见cell DOM计算caret/inline marker位置，随后调用Word store action。Word cell可以容纳多个不同字段，不等同grid覆盖现有目标；非拖动入口若扩展到Word还须明确插入位置，不能无条件伪装成拖放坐标。

## DP06 · getAvailableFieldsForCurrentVersion / collectBoundFieldIds / addNodeFromFieldToCell / addNodeFromFieldToWordTableCell / addNodeFromSubTableFieldToCell / addNodeFromFieldToRange

`gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`：1379-1402;1767-1802;2398-2543;3490-3525，Git blob `a226d2b03fa8edbd5c4e5756acd6f87a7423773f`。

普通字段store检查稳定ID、enabled和当前页可用集合，拒绝已放置字段；同字段跨页及既有复制不能据此概括为禁止。grid操作清目标文字并移除重叠field/display节点后增加新node；Word操作保留其他不同字段并追加node/marker。ToCell/Range并非完整目标guard：子表区域/组边界guard在workspace层，故不可仅因API名称而绕过包装层。Range普通分支存在但当前UI caller只有设为子表。

## DP07 · pushDocumentHistory / updateCurrentPage / undoCanvasChange / redoCanvasChange / markSaved / isDirty

`gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`：54;1963-1975;2406-2471;2876-2880;3396-3424;3577-3585，Git blob `a226d2b03fa8edbd5c4e5756acd6f87a7423773f`。

放置及Word move通过统一document历史写入；history保留最多50个document引用，非无界增长，也非每一步深拷贝全部原件。取消应保持整个document、dirty状态、undo/redo原样；只检查node个数不足，Word源/目标文本和bindings亦须比较。正常放置一轮undo/redo应完整恢复真实文档。

## DP08 · handleSetSubTableField / handleCreateQuickSubTable / handleConfirmQuickAddFields / renderSetSubTableMenu

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`：4343-4383;4481-4495;4580-4600;4808-4840;6947-6965，Git blob `4cd3c2f9c8e6ccf4c5f8a8409ee3a1c7142b583f`。

已有子表通过设为子表菜单有非拖动放置，快速设为子表同时创建模型与绑定；快速添加字段只addFields/addSubTableFields并切fields侧栏，没有普通已有字段放置。不能以这些入口证明普通字段首次非拖动已完成，也不能称整个设计器只有拖动。

## DP09 · handleCellPointerDown.cleanup / handleCellPointerDown.up / dispatchInsert / card onClick

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/ComponentLibrary.tsx`：40-116，Git blob `f5c01ba6738243c777eda8ab6e22570ad1028e57`。

显示组件已有明确点击插入及拖动；pointercancel/Escape/blur只cleanup，只有匹配pointerup在active时dispatch insert，是取消不提交的当前相邻实现依据。显示组件不是普通业务模型字段；本轮不把该控件的点击政策自动迁移到普通卡片。

## DP10 · handleWordTableContextMenu / handleSheetKeyDown / openCellContextMenu / renderWordTableContextMenu

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx`：1952-2036;3539-3589;4260-4311;5639-5759;6863-6965，Git blob `4cd3c2f9c8e6ccf4c5f8a8409ee3a1c7142b583f`。

grid/Word存在contextmenu监听及实际菜单；先前Shift+F10/ContextMenu浏览器观察保持为历史证据，本辅助不重报本轮运行。grid keyboard handler支持文本编辑、剪贴与删除，未见从未放普通字段创建node的命令；剪贴移动已有字段不是首次放置。Word自由背景没有普通字段无目标插入入口，普通字段定位依赖cell。

## DP11 · DesignerSidebar source assertions / Word target/source event shape assertions

`gmp-platform/frontend/scripts/verify-template-designer-react.mjs`：1506-1544;2602-2631，Git blob `f92ddd7fdf645f14d834f169c89bb895b0036d5c`。

既有测试明确禁止onClick={() => addNodeFromField(field.id)}并要求字段由目标cell消费，禁止侧栏增加插入目标等标题；后部明确draggable=false防原生拖拽与pointer重复。前部保留draggable字符串不是支持原生drag的实际行为断言。测试未覆盖pointercancel不得放置；本批应补真实交互断言，不能通过改旧断言新增普通卡片点击含义。

## DP12 · CanvasTab rail Buttons / DesignerSidebar/ComponentLibrary routing

`gmp-platform/frontend/src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx`：33-62;90-166，Git blob `a2f0205b0d0967615f0cbd64cc0b2f707fa972bc`。

fields/grid侧栏有真实Button切换；此边界保留共享选择并分别渲染字段/显示组件，不执行普通字段放置。CanvasTab/Sidebar/Workspace当前没有readOnly prop；因此不能在此范围声称已独立验证发布版本权限。设计器宿主进入资格与后端保存授权是独立范围，取消修复不应擅加新的编辑策略。

## DP13 · findFieldDropCellAtPoint / dispatchFieldPointerHover / handlePointerMove

`gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx`：177-197;280-299，Git blob `3d8d20e58ecdd3858a46c5d29f2b477d06b0c9ff`。

直接elementFromPoint命中失败时，fallback对所有当前DOM drop cells调用getBoundingClientRect，active pointermove每次调用hover hit-test，并更新组件state。若大量可见cell或overlay阻挡，使fallback常发生，则C个cell×P次事件产生重复扫描/几何读；仅源码候选，不是已测掉帧或容量事故。workspace相邻缓存offset命中可作未来复用方案，但本轮未优化。

## 非拖动最小方案与范围

当前已追踪普通字段卡、grid/Word菜单、快速添加、剪贴、显示组件入口仍无普通已有字段首次非拖动放置；这是有限源码覆盖，不是整个设计器完整可访问性认证。

- 在目标侧增加显式放置已有字段命令而非改变原普通卡片点击；复用当前enabled/unused字段列表和稳定fieldId。
- 首期可限制一个普通或合并单元格作为目标，执行现有workspace drop包装，保留目标覆盖、子表组限制和一次完整history；不悄悄逐格批量放置。
- 若扩展连续/不连续多选，应先明确一次field是一个跨度node还是多个节点及覆盖行为；现有普通拖放未定义此语义。
- Word需明确已选cell内caret位置或显式插入位置，保留多个不同字段及inline marker顺序；当前自由背景无cell不得调用generic addNode冒充等价。
- 打开命令后若page/target/field资格变化，执行前重核实际当前目标；取消、无选区、无可用字段、越界目标必须无写入。
- 验证实际键盘/按钮、取消、empty/disabled、保存重开、undo/redo、窄屏及焦点恢复；不能以程序调用store代替非拖动交互证明。

## 取消修复边界

让finish显式区分commit=false；cancel只移除listener/清preview hover/释放capture，不dispatch或move，不更新document/history。匹配pointerup的正常路径保持原校验和历史。

必要回归：grid普通/合并cell取消；Word新放置取消；子表列合法group目标取消；Word已有字段移动取消保留源/目标text和node；正常up对照及完整undo/redo；阈前cancel；不同pointerId；取消后迟到up；两种viewport真实可见目标。

暂不纳入：Escape/blur/buttons丢失等新增事件政策暂列邻接候选；普通字段非拖动新命令；性能优化；共享drag框架。

## 大模块具体拆分建议

- `DesignerSidebar`：后续将pointer生命周期、捕获、预览和drop/hover dispatch抽为useFieldPointerDrag，输入稳定字段/子表身份及目标resolver，输出onPointerDown和preview；父组件继续负责字段资格、列表与样式。 取消缺陷来自生命周期与提交副作用耦合。先用本批两处小guard修复即可，不为了本批引入大框架。 验收：保留不同pointer、取消、卸载和正常drop浏览器对照；不与显示组件不同click语义统一。
- `CanvasSheetWorkspace`：未来按WordTableFieldInteractions独立hook提取Word marker移动、caret target解析、cell layout及move生命周期；共享页snapshot/store回调通过参数输入，grid selection与菜单仍留各自所有者。 当前同组件包含Word/grid选区、菜单、几何和持久文档写入；以marker/cell稳定身份形成可测边界，比仅按行数拆分更可靠。 验收：Word同cell/跨cell顺序、取消与正常move、完整单步undo、保存parse及文本编辑相邻回归。
- `CanvasSheetWorkspace target-side field placement`：非拖动确认后提取单一placeExistingFieldAtTarget协调方法，target用grid-range/word-cell显式联合类型，选择器只呈现字段；协调方法负责实际目标存在和资格重核，调用已有写命令一次。 拖动和非拖动共用已有校验但不能混淆grid覆盖和Word追加语义；避免UI再造document写入。 验收：相同目标/字段两种入口生成等价规范文档与一次history，非法目标均无写入；仍需先明确多选/caret范围。

## 性能候选

- `candidate.designer-field-pointer-hit-test-scan`（source-risk-pending-measurement-and-discussion）：C=current rendered drop cells; P=active pointermove events with failed direct hit. Worst fallback visits O(C*P) DOM boxes, plus repeated React preview updates; virtualization may bound C and direct hit avoids fallback. 测量：真实宽表/多可见页和overlay遮挡，记录direct/fallback命中率、被测box数、frame耗时、long tasks；与相邻workspace cached-offset定位对比，不预设容量阈值。 未宣称：没有运行性能实验；没有测得掉帧/内存泄漏/生产事故；没有实施优化。
- `candidate.designer-available-field-repeat-scan`（source-risk-pending-measurement-and-discussion）：getAvailableFieldsForCurrentVersion每次遍历page nodes；每个Word node又find table和cell。多个selector/放置校验重用同一页时可能重复O(N*(B+C))查找。document history有50上限，不能称无界。 测量：按N字段节点、B Word块和C各块cell生成合法设计，采样render/selector/放置解析次数及CPU；仅证据充分且讨论后考虑页级索引或memo。 未宣称：没有确认N+1 SQL，本范围是前端纯内存/DOM；没有SQL循环或数据库分页的本批验证；没有实施缓存改变。

## 证据和限制

- DEC-0080保留实际字段身份与同身份共享选项、完整document保存撤销；取消修复不更改这些语义。
- open-questions中表头共享/追溯试用等未决不影响取消不得提交；未发现该知识文件将pointercancel定义为放置。
- 本文不是正式ontologyResult，不宣称已完成全知识语义审计。
- 本辅助仅执行源码读取与 /tmp 报告生成，没有浏览器、Node、Maven、数据库或性能实跑。
- 仓库产品/测试/知识修改均非本辅助所作；并行主侧工作与报告固定基线分开。
- 保留 TaskDetail、记录变更/作废、生产弹窗设计等用户暂缓；本报告不触及其整改。
- 整体审计未完成；不能累加这13个方法范围为13个文件或全分支覆盖。
