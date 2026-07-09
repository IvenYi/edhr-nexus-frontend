# React 模板设计器重构整理

整理时间：2026-07-09

来源：

- 聊天记录：`/Users/wangzilin/Downloads/【开发】设计器重构-019f3b97-4804-70f2-900b-b21e28f2e189.md`
- 工作区：`/Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案`
- 代码目录：`gmp-platform`
- 当前分支：`edhr-dev`

## 最终达成目标

最终目标不是只做一个能打开的 React 页面，而是在模板建模的子版本行提供一套可逐步替代现有 Vue 设计器的 React 设计器。

目标状态应满足：

1. 保留现有 Vue 设计器入口，同时新增并稳定保留 `React设计` 并行入口。
2. React 设计器完整覆盖 `字段设计 / 表单设计 / 流程设计` 三个页签。
3. React 设计器使用自己的文档模型和保存结构，不强制兼容旧 Vue JSON，但要能通过现有保存链路落库。
4. `表单设计` 达到接近或超过 Vue 设计器的可用体验：A4 白底画布、表格模式、自由模式、标尺、分页缩略图、画布设置、行列选择、范围选择、拖拽行高列宽、单元格编辑等。
5. 模板导入要能根据文件真实内容还原到白底画布：Excel 用表格模式承载，Word 用自由/纸张画布承载，并自动判断横向/纵向。
6. `.xlsx/.xls/.docx/.doc` 都要有清晰处理策略；旧版 `.doc` 不能再依赖前端二进制猜解，需要走稳定解析链路。
7. 每一阶段都要有 `npm run verify:template-designer-react`、`npm run build` 和必要的浏览器 QA 作为验收依据。

## 已确认的关键决策

- 新实现放在 `gmp-platform/frontend/src/pages/master-data/template-designer-react/`，不放进 `vendor/online-form-designer`。
- 新入口在 `TemplateModelingPage.tsx` 子版本行，与现有 Vue 设计按钮并存，文案为 `React设计`。
- React 版不要求兼容 Vue 存量 JSON，采用自己的 schema 和统一 Zustand store。
- 首版不是单页壳子，而是三页签完整内核：字段、表单、流程共享同一个文档状态。
- 前端没有通用单测体系，当前回归方式是源码契约脚本 `verify-template-designer-react.mjs` 加 `npm run build`，复杂交互再补浏览器 QA。

## 聊天记录进度线

### 2026-07-07

- 明确范围：新按钮打开 React 版完整三页签设计器，不兼容旧 Vue JSON。
- 确认路线：采用单一 React 设计器内核，而不是三个割裂子设计器。
- 已生成并提交设计文档：
  - `gmp-platform/docs/superpowers/specs/2026-07-07-react-template-designer-design.md`
  - 提交：`5fb7d1a7 docs: add react template designer design`
- 已生成实现计划：
  - `gmp-platform/docs/superpowers/plans/2026-07-07-react-template-designer-implementation.md`
- 初版 React 设计器已落地并提交：
  - 当前 HEAD 为 `d60285cf Add React template designer`
- 后续继续增强：
  - 字段设计、组件注册、画布组件、流程页签。
  - 表单设计改成接近 Vue 截图的深色顶栏、工具栏、分页缩略图、表格工作区。
  - 修复表单设计溢出、流程设计白屏、页签切换容器错误。
  - 补齐表格标题、行列高亮、A4 白纸、选区、右键增行列、拖拽列宽行高。

### 2026-07-08

- 继续对齐 Vue 表单设计器视觉和交互：
  - 表头/行号贴顶贴左。
  - 缩略图宽度可拖拽，最小 `250px`、最大 `350px`。
  - A4 固定纸张大小，新增列不改变白底画布宽度。
  - 左上角全选三角、空白区域取消选中、短分割线。
  - 画布模式增加 Word 风格标尺、虚线正式展示区。
  - 全局 `画布设置` 浮层，支持网格线、标尺、页眉、页脚。
  - 浮层扩展 `画布模式 / 画布方向 / 画布间距`，并接入真实表格/自由模式切换、横纵向、页边距。
  - 自由模式支持超出 A4 后分页虚线和 `第N页` 背景标识，缩略图按实际页数展示。
- 模板导入第一版完成：
  - Excel 导入表格模式。
  - Word 导入自由模式。
  - 自动判断方向。
  - 增加 `static-text` / `static-image`、绝对定位节点、整页替换动作。
- 真实导入 QA 发现：
  - `.xlsx` 实际导入成功。
  - `.docx` 可读但保真度一般。
  - `.doc` 会乱码，根因是前端把旧版 Word 二进制用文本猜解，不可靠。
- 用户明确要求：必须验证 React 设计器本身，导入要按文档真实内容解析并尽量超过 Vue 效果。
- 后续开始升级导入模型：合并单元格、边框、图片、纸张/网格模型。

### 2026-07-09

- 继续定位导入链路：
  - `.xlsx/.xls` 前端导入可正常还原。
  - `.doc` 根因确认在旧版 Word 解析层，不是 React 渲染层。
- 新增 `.doc` 后端解析链路：
  - 基于 Apache POI `HWPF` 解析旧版 `.doc`。
  - 新增接口 `/api/v1/master-data/template-modeling/form-templates/import/legacy-word`。
  - 前端 `.doc` 导入改走新接口。
  - 当前主后端整仓构建受既有 Lombok/环境问题影响，所以同时补了 Vite dev 桥接，保证本地 React 设计器可以先走同一路径。
- `.doc` 接口级回归结果：
  - 真实样例从乱码变成可读中文。
  - 样例结果：`81` 行、`4` 列、`285` 个单元格、`15` 个合并区域。
  - 本地 `curl` 回归返回 `200`。
- 删除顶部工具栏红框区域：
  - 移除旧的 `网格线 / 页眉 / 页脚 / 表格模式 / 画布模式` 顶部控件。
  - 对应校验脚本同步更新。
  - 已做页面 QA，确认区域不再显示。
- 最新在做的任务：
  - 表格模式下双击单元格可以内联修改文字。
  - 单击选中单元格后，直接键盘输入可开始录入。
  - 代码和契约已接入，但聊天记录最后停在“准备做最后一轮实际交互 QA”。

## 当前目录文件盘点

### 文档

- `gmp-platform/docs/superpowers/specs/2026-07-07-react-template-designer-design.md`
  - 已提交的 React 设计器设计规格。
- `gmp-platform/docs/superpowers/plans/2026-07-07-react-template-designer-implementation.md`
  - 已落盘的实施计划。
- `gmp-platform/docs/superpowers/reports/2026-07-09-react-template-designer-progress-summary.md`
  - 本整理文档。

### 前端入口和 API

- `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`
  - 子版本行 `React设计` 入口。
- `gmp-platform/frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx`
  - React 设计器对话框。
- `gmp-platform/frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`
  - 顶层壳子、页头、三页签、保存/导入入口。
- `gmp-platform/frontend/src/api/template-modeling.ts`
  - 模板建模接口；包含 legacy Word 导入 API。

### React 设计器核心目录

- `components/DesignerInspector.tsx`
  - 右侧属性面板。
- `components/DesignerSidebar.tsx`
  - 左侧组件/字段入口。
- `components/PropertyFormRenderer.tsx`
  - 属性表单渲染。
- `components/canvas/CanvasDesignerToolbar.tsx`
  - 表单设计工具栏；顶部旧模式控件已删除。
- `components/canvas/CanvasNodeRenderer.tsx`
  - 画布节点渲染，包含静态文本/图片等导入节点承载。
- `components/canvas/CanvasPageThumbnails.tsx`
  - 分页缩略图。
- `components/canvas/CanvasSheetWorkspace.tsx`
  - 表格/自由画布核心工作区；行列标题、选区、标尺、画布设置、单元格编辑都集中在这里。
- `tabs/model/ModelTab.tsx`
  - 字段设计。
- `tabs/canvas/CanvasTab.tsx`
  - 表单设计布局容器。
- `tabs/workflow/WorkflowTab.tsx`
  - 流程设计。
- `registry/fieldRegistry.ts`
  - 字段类型注册。
- `registry/componentRegistry.tsx`
  - 组件注册和预览配置。
- `store/useTemplateDesignerStore.ts`
  - 统一设计器状态、保存快照、表格/画布/流程动作。
- `types/*.ts`
  - React 设计器文档、字段、画布、流程类型。
- `utils/document.ts`
  - 默认文档、归一化、加载保存结构。
- `utils/importExcel.ts`
  - Excel 导入。
- `utils/importWord.ts`
  - Word 导入，`.doc` 会走 legacy Word 接口。
- `utils/importGrid.ts`
  - 导入网格模型转换。
- `utils/templateImport.ts`
  - 模板导入统一分流。

### 前端脚本和依赖

- `gmp-platform/frontend/scripts/verify-template-designer-react.mjs`
  - React 设计器契约校验脚本。
- `gmp-platform/frontend/scripts/legacy-word-dev-import.mjs`
  - 本地 dev 环境 `.doc` 导入桥接。
- `gmp-platform/frontend/scripts/fixtures/template-designer-react/`
  - 导入验证样例：`react-import-sample.xlsx`、`react-import-sample.docx`、`sample-badge.png`。
- `gmp-platform/frontend/package.json`、`package-lock.json`
  - 新增/调整前端解析依赖。
- `gmp-platform/frontend/vite.config.ts`
  - dev 桥接接入。

### 后端 `.doc` 导入

- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/dto/TemplateImportGridResponse.java`
  - 导入网格响应 DTO。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/TemplateLegacyWordImportService.java`
  - `.doc` 解析服务。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`
  - legacy Word 导入接口。
- `gmp-platform/backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java`
  - 控制器测试更新。
- `gmp-platform/backend/pom.xml`
  - POI/HWPF 相关依赖或构建配置调整。

## 当前工作区状态

当前分支：

- `edhr-dev`
- `HEAD`：`d60285cf Add React template designer`
- `origin/edhr-dev`：同一提交

当前存在未提交改动。主要分两类：

1. 已跟踪文件修改：
   - 后端 `.doc` 导入接口与依赖。
   - 前端 API、Vite dev 桥接、验证脚本。
   - React 设计器 shell、store、组件、tab、类型、导入工具相关文件。
2. 未跟踪新增文件：
   - 后端导入 DTO 和 service。
   - 前端导入工具、画布组件、样例 fixtures、dev 桥接脚本。

当前不应直接 `git add -A`，提交前需要显式确认纳入范围，避免把无关或生成文件混入。

## 当前验证结果

截至 2026-07-09 10:20，本轮已重新执行并闭环：

- `npm run verify:template-designer-react`
  - 结果：通过。
- `npm run build`
  - 结果：通过。
  - 构建有 Vite 大 chunk 警告，属于当前前端包体警告，不是构建失败。
- `JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home mvn -s /tmp/maven-settings-aliyun.xml test -Dtest=TemplateModelingControllerTest`
  - 结果：通过，`12` 个测试无失败。
- `JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home mvn -s /tmp/maven-settings-aliyun.xml test`
  - 结果：通过，`176` 个测试无失败。
- 浏览器 QA：单元格编辑。
  - 双击进入编辑后 `Escape` 取消不会提交草稿。
  - 单击单元格后键盘输入可启动编辑器，`Enter` 提交成功。
  - 临时记录 `QA_CELL_1783563496185` 已删除。
- 浏览器 QA：Excel 导入、保存、关闭、刷新、重开。
  - 临时记录 `QA_REACT_1783563564364` 已删除。
  - 导入样例后页面有 `24` 个格位、`17` 个非空单元格。
  - 保存后接口读回 `canvasDesignJson`，包含 marker `QA_CLOSE_1783563564364`，保存单元格数 `17`。
  - 刷新页面后重新打开 React 设计器，marker 仍可见。
  - 证据截图：
    - `/tmp/react-designer-import-qa/06-after-marker-before-save.png`
    - `/tmp/react-designer-import-qa/07-after-reopen.png`
- 浏览器 QA：四类导入截图。
  - `/tmp/react-designer-import-qa/01-xlsx.png`
  - `/tmp/react-designer-import-qa/02-xls.png`
  - `/tmp/react-designer-import-qa/03-doc.png`
  - `/tmp/react-designer-import-qa/04-docx.png`
  - `/tmp/react-designer-import-qa/05-after-save.png`

本轮额外修复并验证：

- React 设计器保存上下文：原先共用旧 Vue 设计器保存 mutation，React 保存时可能报“设计器上下文缺失”；已改为读取 `reactDesignerState.row/version`。
- Excel 导入容错：ExcelJS 读取带图片锚点的 `.xlsx` 可能抛 `Cannot read properties of undefined (reading 'anchors')`；已增加图片读取容错，并在现代解析失败时降级到 legacy 单元格导入，保证表格内容不被阻断。
- Escape 取消编辑：原先 Escape 后输入框 blur 仍可能提交草稿；已增加 `skipNextBlurCommitRef`，取消编辑后跳过下一次 blur commit。

## 已完成能力

- `React设计` 并行入口。
- React 三页签：`字段设计 / 表单设计 / 流程设计`。
- 字段设计：
  - 字段新增、删除、类型、选项、属性配置。
  - 字段变更同步驱动画布绑定节点。
- 表单设计：
  - 表格模式和自由模式。
  - A4 白底画布、横向/纵向、页边距、虚线内容区。
  - Excel 风格列标题/行标题、标题贴顶贴左。
  - 单元格点击、高亮、范围多选、全选、取消选中。
  - 右键新增行列、拖拽行高列宽。
  - 单元格样式写入：粗体、斜体、下划线、删除线、对齐、换行等。
  - 分页缩略图、拖拽侧栏宽度。
  - 画布模式 Word 风格标尺。
  - 全局 `画布设置` 浮层：网格线、标尺、页眉、页脚、模式、方向、间距。
  - 自由模式跨页虚线和 `第N页` 标识。
  - 最新已接入单元格双击编辑、选中后键盘直输。
- 流程设计：
  - 基于 `@xyflow/react` 的流程画布、节点和连线回写。
- 模板导入：
  - Excel `.xlsx/.xls`：前端解析并回填表格模式。
  - Word `.docx`：可导入到自由模式，但保真度仍需继续提升。
  - Word `.doc`：已改为后端/本地 dev 桥接解析，接口级验证已从乱码变为可读网格数据。

## 未完成任务

1. Word 高保真还原仍需继续提升。
   - `.docx` 当前可读，但仍偏“段落/网格落位”，不是完美复刻原文版式。
   - 需要继续对齐 Vue `word-parser`、纸张模型、图片、边框、分页和自由画布定位。

2. 提交前需要整理改动范围。
   - 当前代码未提交。
   - 需要明确哪些 source、fixtures、脚本纳入提交，哪些构建产物、临时文件、无关文件排除。

## 下一步建议顺序

1. 梳理 git 改动，显式 staging，排除 `.DS_Store`、`dist/`、`tsconfig*.tsbuildinfo`、日志和临时 QA 文件。
2. 提交 React 设计器本阶段成果。
3. 进入下一阶段 Word 高保真：分页、边框、图片、自由画布定位、`.docx`/`.doc` 版式一致性。

## 验收标准

达到“最终达成目标”至少需要以下验收全部通过：

1. `React设计` 入口可从模板建模子版本行稳定打开。
2. 三个页签切换不白屏，且切换只影响下方内容容器。
3. 表格模式可完成单元格选中、范围选择、行列编辑、行列尺寸调整、单元格直接录入。
4. 自由模式具备标尺、页边距、跨页标识、缩略图联动。
5. `画布设置` 在表格/自由模式都可用，所有开关和子面板真实影响画布。
6. Excel 导入真实业务样例后能以表格模式还原内容、行列、样式、分页缩略图。
7. Word `.docx/.doc` 导入后能以自由/纸张模型还原可读内容、分页、合并/边框等关键结构。
8. 保存后关闭再打开，字段、表格、自由画布、导入数据、流程节点都能恢复。
9. `npm run verify:template-designer-react` 通过。
10. `npm run build` 通过。
11. 后端新增 `.doc` 接口在真实后端环境通过至少一组真实样例验证。
