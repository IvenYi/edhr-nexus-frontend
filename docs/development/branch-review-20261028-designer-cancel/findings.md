# 本批发现、依据与剩余范围

固定目标`6306457580dbd2787db7df8f2e3cf80ddd21defd`，PR37真实合并，树同交付6f7af830。审查源为当前源码、实际浏览器事件、现行知识与确认来源；历史报告只作导航。当前两项修复已由全新独立实例在干净52c1069e验证，18/18必需检查passed/FINAL，按acceptance resolved；下文其他候选与限制不因此关闭。

## W2-DESIGNER-POINTER-CANCEL-COMMIT-001 · medium

同一取消语义缺陷的两个入口，不按5个运行红例重复计bug：

1. `DesignerSidebar.handleFieldPointerDown`内，pointerup和pointercancel均调用`finishPointerDrag`；后者只看active和坐标，即使取消也派发FIELD_POINTER_DROP_EVENT。后续grid可清除目标原文并放置字段，Word会添加字段/marker，子表列会绑定。结果进入document及undo历史。
2. `CanvasSheetWorkspace.beginWordTableInlineFieldMove`内，取消虽然传false，但原false只控制未激活时的选中；active分支仍调用`moveWordTableFieldToDropPosition`，改原/目标单元格marker和字段位置。

浏览器Pointer Events的取消语义以及相邻ComponentLibrary与样式填充的取消仅清理路径支持本修复。无需新增业务政策，不将“取消”转换为合法放置意图。修复只添加commit判定，两产品文件合计7增7删；匹配pointerup仍执行原路径，字段身份、启停、可用性、子表组限制、grid覆盖及Word多字段规则保持。

新增真实组件浏览器回归在旧基线同12项中5红7正、0夹具阻断：普通格、合并格、Word新放、子表列及Word已有字段移动取消均真实修改了文档。修复后1440/390同12项通过；每次取消比较完整document、undo、redo（含非空redo），检查预览/落点指示/源卡恢复，迟到pointerup无写；正常grid/Word/子表放置及Word移动验证一次history和完整undo/redo。错pointerId、阈前取消及落区外结束是正向边界。合成pointercancel触发真实监听器，不是物理触控或操作系统中断测试，不证明后端保存持久化。

## TEST-DESIGNER-DISPLAY-IDENTITY-STUB-001 · low

既有`test-cell-display-components.mjs`的身份API替身缺getDepartmentTree/getRoles/getUsers；当前组件传递导入SubjectSelector后，esbuild在测试执行前报3个缺导出。独立导出63064575真实源树、脚本及实际tsconfig可重现。仅增加三个共用的抛错替身：本呈现测试若意外请求身份数据必须失败，原6项断言和业务逻辑保持。完整相关5脚本现35项通过（第一次29通过+1文件编译失败不冒充30业务项）。

初始旧源树导出漏tsconfig导致alias失败、随后误包含不存在tsconfig.app导致archive失败，均属主侧诊断环境问题；完整导出后才形成上述有效原错误复现。新增浏览器harness初次未生成CSS却读取bundle.css的启动失败也保留，均不算产品红例。

## 非拖动入口：原候选仍开放

沿`adjacent.designer-field-card-keyboard-placement`，当前13条辅助方法范围和本轮7项真实桌面观察：普通已有字段卡可Tab到达，Enter/Space/click不首次放置；正常拖动可用。Shift+F10及ContextMenu能打开菜单，显示组件点击/键盘插入、已有子表菜单放置均可用，快速添加只建模型。不声称全设计器没有非拖动能力，也不因取消修复关闭此候选。

建议在目标单元格菜单提供显式“放置已有字段”，先限定普通或合并单元格，通过workspace现有包装校验和一次document命令实现；保留原卡片拖动/点击含义。当前普通drop是落点单格，并没有逐格填满多选区的语义；Word支持多个字段，须单独确定caret或末尾插入的位置。连续/离散多选、Word目标、子表与无选区情形不可由generic addNode随意补义。具体方案及验收边界见[source-helper](evidence/source-helper.md)。本批不实施新命令，候选待交互范围确认。

## 健壮性、结构和性能

两个具体性能候选先记录/待测讨论，不实施优化，也不当作已证掉帧或容量事故：

- `candidate.designer-field-pointer-hit-test-scan`：大表或多页增加当前DOM单元格C；每次指针移动P在elementFromPoint未直接命中时，fallback遍历getBoundingClientRect，最坏O(C×P)几何读取。直接命中为反证，实际可见量可能受渲染边界限制。下一步测fallback比例、box读取次数、frame/long-task，再讨论是否复用workspace已有offset定位。
- `candidate.designer-available-field-repeat-scan`：getAvailableFieldsForCurrentVersion遍历当前页N节点，Word节点还查块B/单元格C；多个selector/放置校验可能重复O(N×(B+C))查找。需合法大画布测调用次数和CPU再评估索引或memo。history最多50项，不能写成无界内存增长。本范围纯前端，没有SQL，不是N+1 SQL或内存数据库分页的确认。

大模块具体拆分（暂不实施）：Sidebar的pointer生命周期/preview/dispatch可成为`useFieldPointerDrag`，字段资格和列表仍归Sidebar；Workspace的Word marker/caret/cell定位与move可独立为`WordTableFieldInteractions`，输入当前页及store回调；非拖动方案确认后，可用grid-range/word-cell联合目标类型提取一个`placeExistingFieldAtTarget`协调方法，保持grid覆盖与Word追加区别。每项的输入输出、状态所有权、风险与保护测试见辅助原件，不把长文件搬进长hook或建立通用drag框架。

其他Escape/blur/buttons丢失、卸载与其他resize/selection手势需要单独审查；本批不把两取消路径通过升级为所有手势完成。此前字典计数、DHR宽记录、批次导入等性能讨论项及ModelTab/菜单选择器缩页候选保留原ID。

## 证据边界与未通过项

官方strict旧/新各19项，排除绝对路径前缀及行号后完整finding多重集合一致，均exit2；lint仍缺ESLint配置exit2。本批不改业务或测试标准使全局扫描变绿。工艺静态脚本退役迁移ENOENT为PR37已记录限制，本批未重复运行，不冒称通过。

两宽同12取消场景不算24种；保存相关脚本实际9次运行包含同场景不同宽度，也不与主侧/独立复验累加唯一覆盖。本体7个ID中6项有限一致、1项客户试用证据缺口，不写成7项一致。清单4008路径、13辅助方法范围、主侧记录、89知识结构测试分别统计，整文件/全分支完成不由此增加。

生产弹窗样式、TaskDetail签名朋友修复、记录变更/作废及依赖DHR high/A12、四旧知识gap与旧历史证据限制仍保留；不自动合并/部署或恢复历史数据。
