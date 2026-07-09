import { existsSync, readFileSync } from 'node:fs';

const failures = [];

function read(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  if (!existsSync(url)) {
    failures.push(`${relativePath}: missing file`);
    return '';
  }
  return readFileSync(url, 'utf8');
}

const packageJson = read('../package.json');
const templateModelingPage = read('../src/pages/master-data/TemplateModelingPage.tsx');
const saveDesignerMutationBlock = templateModelingPage.match(/const saveDesignerMutation = useMutation\(\{[\s\S]*?const renderTemplateCategoryPanel/)?.[0] ?? '';
const dialog = read('../src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx');
const shell = read('../src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx');
const documentTypes = read('../src/pages/master-data/template-designer-react/types/document.ts');
const storeFile = read('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts');
const documentUtils = read('../src/pages/master-data/template-designer-react/utils/document.ts');
const modelTab = read('../src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx');
const fieldRegistry = read('../src/pages/master-data/template-designer-react/registry/fieldRegistry.ts');
const propertyRenderer = read('../src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx');
const canvasTab = read('../src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx');
const canvasToolbar = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasDesignerToolbar.tsx');
const canvasWorkspace = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx');
const pageThumbnails = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasPageThumbnails.tsx');
const shellFile = shell;
const workflowTab = read('../src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx');
const componentRegistry = read('../src/pages/master-data/template-designer-react/registry/componentRegistry.tsx');
const sidebar = read('../src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx');
const inspector = read('../src/pages/master-data/template-designer-react/components/DesignerInspector.tsx');
const renderer = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx');
const templateImportUtils = read('../src/pages/master-data/template-designer-react/utils/templateImport.ts');
const excelImportUtils = read('../src/pages/master-data/template-designer-react/utils/importExcel.ts');
const wordImportUtils = read('../src/pages/master-data/template-designer-react/utils/importWord.ts');

const commitEditingCellBlock = canvasWorkspace.match(/const commitEditingCell = \([\s\S]*?const cancelEditingCell/)?.[0] ?? '';
const toolbarButtonUsages = [...canvasToolbar.matchAll(/<ToolbarIconButton\b([^>]*)>/g)].map((match) => match[1]);
const toolbarLabels = [
  '撤销',
  '重做',
  '加粗',
  '斜体',
  '下划线',
  '删除线',
  '左对齐',
  '居中对齐',
  '右对齐',
  '顶部对齐',
  '垂直居中',
  '底部对齐',
  '自动换行',
  '合并单元格',
  '拆分单元格',
  '插入表格',
  '调整列宽',
  '调整行高',
];

if (!packageJson.includes('verify:template-designer-react')) failures.push('package.json: missing verify:template-designer-react script');
if (!packageJson.includes('"exceljs"')) failures.push('package.json: missing exceljs dependency for template import');
if (!packageJson.includes('"xlsx"')) failures.push('package.json: missing xlsx dependency for template import');
if (!templateModelingPage.includes('React设计')) failures.push('TemplateModelingPage.tsx: missing React设计 button label');
if (!templateModelingPage.includes('TemplateDesignerReactDialog')) failures.push('TemplateModelingPage.tsx: missing React dialog mount');
if (!saveDesignerMutationBlock.includes('reactDesignerState.row')) failures.push('TemplateModelingPage.tsx: React designer save mutation must use React designer row context');
if (!saveDesignerMutationBlock.includes('reactDesignerState.version')) failures.push('TemplateModelingPage.tsx: React designer save mutation must use React designer version context');
if (!dialog.includes('fullScreen')) failures.push('TemplateDesignerReactDialog.tsx: missing fullScreen dialog');
if (!shell.includes('字段设计')) failures.push('TemplateDesignerReactShell.tsx: missing model tab');
if (!shell.includes('表单设计')) failures.push('TemplateDesignerReactShell.tsx: missing canvas tab');
if (!shell.includes('流程设计')) failures.push('TemplateDesignerReactShell.tsx: missing workflow tab');
if (!shellFile.includes('模板导入')) failures.push('TemplateDesignerReactShell.tsx: missing import action');
if (!shellFile.includes('模拟填报')) failures.push('TemplateDesignerReactShell.tsx: missing mock-fill action');
if (!shellFile.includes('返回上一页')) failures.push('TemplateDesignerReactShell.tsx: missing back action');
if (!shellFile.includes('type="file"')) failures.push('TemplateDesignerReactShell.tsx: missing hidden file input for template import');
if (!shellFile.includes('.xlsx,.xlsm,.xls,.docx,.doc')) failures.push('TemplateDesignerReactShell.tsx: missing template import accept types');
if (!shellFile.includes('importTemplateToCanvasPage')) failures.push('TemplateDesignerReactShell.tsx: missing template import conversion call');
if (!shellFile.includes('replaceCurrentPageFromImport')) failures.push('TemplateDesignerReactShell.tsx: missing store import replacement action');
if (!documentTypes.includes("schema: 'edhr-template-designer-react'")) failures.push('document.ts: missing persisted schema marker');
if (!documentTypes.includes('export interface TemplateDesignerDocument')) failures.push('document.ts: missing TemplateDesignerDocument interface');
if (!storeFile.includes('create<TemplateDesignerStore>')) failures.push('useTemplateDesignerStore.ts: missing Zustand store creation');
if (!storeFile.includes('setActiveTab')) failures.push('useTemplateDesignerStore.ts: missing setActiveTab action');
if (!storeFile.includes('markSaved')) failures.push('useTemplateDesignerStore.ts: missing markSaved action');
if (!storeFile.includes("activeTab: 'canvas'")) failures.push('useTemplateDesignerStore.ts: missing default canvas tab');
if (!storeFile.includes('selectedRange')) failures.push('useTemplateDesignerStore.ts: missing range selection state');
if (!storeFile.includes('selectAllCells')) failures.push('useTemplateDesignerStore.ts: missing selectAllCells action');
if (!storeFile.includes('selectColumnRange')) failures.push('useTemplateDesignerStore.ts: missing selectColumnRange action');
if (!storeFile.includes('selectRowRange')) failures.push('useTemplateDesignerStore.ts: missing selectRowRange action');
if (!storeFile.includes('insertSheetColumns')) failures.push('useTemplateDesignerStore.ts: missing insertSheetColumns action');
if (!storeFile.includes('insertSheetRows')) failures.push('useTemplateDesignerStore.ts: missing insertSheetRows action');
if (!storeFile.includes('setSheetColumnWidth')) failures.push('useTemplateDesignerStore.ts: missing setSheetColumnWidth action');
if (!storeFile.includes('setSheetRowHeight')) failures.push('useTemplateDesignerStore.ts: missing setSheetRowHeight action');
if (!documentUtils.includes('isReactTemplateDesignerPayload')) failures.push('document utils: missing schema guard');
if (!documentUtils.includes('parseReactTemplateDesignerDocument')) failures.push('document utils: missing persisted document parser');
if (!documentUtils.includes('serializeTemplateDesignerDocument')) failures.push('document utils: missing serializer');
if (!documentUtils.includes('rowCount: 30')) failures.push('document utils: missing portrait-oriented default row count');
if (!documentUtils.includes('columnWidths')) failures.push('document utils: missing column width normalization');
if (!documentUtils.includes('rowHeights')) failures.push('document utils: missing row height normalization');
if (!documentUtils.includes("paperMode: 'table'")) failures.push('document utils: missing default paper mode');
if (!documentUtils.includes("paperOrientation: 'portrait'")) failures.push('document utils: missing default paper orientation');
if (!documentUtils.includes('paperMarginTopMm')) failures.push('document utils: missing paper margin normalization');
if (!shell.includes('window.confirm')) failures.push('TemplateDesignerReactShell.tsx: missing dirty close confirmation');
if (!shell.includes('markSaved')) failures.push('TemplateDesignerReactShell.tsx: missing markSaved usage after save');
if (!shell.includes("setActiveTab('canvas')")) failures.push('TemplateDesignerReactShell.tsx: missing reset to canvas tab on entry');
if (!shell.includes('height: 28')) failures.push('TemplateDesignerReactShell.tsx: missing back-area divider');
if (!fieldRegistry.includes('inputnumber')) failures.push('fieldRegistry.ts: missing inputnumber field definition');
if (!fieldRegistry.includes('userpicker')) failures.push('fieldRegistry.ts: missing userpicker field definition');
if (!fieldRegistry.includes('optionsText')) failures.push('fieldRegistry.ts: missing option field config schema');
if (!modelTab.includes('新增字段')) failures.push('ModelTab.tsx: missing add field action');
if (!modelTab.includes('删除字段')) failures.push('ModelTab.tsx: missing delete field action');
if (!modelTab.includes('字段类型')) failures.push('ModelTab.tsx: missing field type editor');
if (!modelTab.includes('MenuItem')) failures.push('ModelTab.tsx: missing MUI MenuItem field type selector');
if (!propertyRenderer.includes('TextField')) failures.push('PropertyFormRenderer.tsx: missing MUI text editor rendering');
if (!componentRegistry.includes('layout-container')) failures.push('componentRegistry.tsx: missing layout-container component definition');
if (!componentRegistry.includes('bottom-button-container')) failures.push('componentRegistry.tsx: missing bottom-button-container component definition');
if (!componentRegistry.includes('RadioGroup')) failures.push('componentRegistry.tsx: missing field renderer previews');
if (!canvasTab.includes('分页缩略图')) failures.push('CanvasTab.tsx: missing page thumbnails panel');
if (!canvasTab.includes('CanvasDesignerToolbar')) failures.push('CanvasTab.tsx: missing designer toolbar mount');
if (!canvasToolbar.includes('Tooltip')) failures.push('CanvasDesignerToolbar.tsx: toolbar buttons must use Tooltip for hover descriptions');
if (!canvasToolbar.includes('label: string')) failures.push('CanvasDesignerToolbar.tsx: ToolbarIconButton must require a label');
if (!canvasToolbar.includes('title={label}')) failures.push('CanvasDesignerToolbar.tsx: tooltip title must use the button label');
if (!canvasToolbar.includes('aria-label={label}')) failures.push('CanvasDesignerToolbar.tsx: toolbar buttons must expose accessible labels');
if (toolbarButtonUsages.some((props) => !/\blabel=/.test(props))) failures.push('CanvasDesignerToolbar.tsx: every ToolbarIconButton usage must provide a label');
for (const label of toolbarLabels) {
  if (!canvasToolbar.includes(`label="${label}"`)) failures.push(`CanvasDesignerToolbar.tsx: missing toolbar label "${label}"`);
}
if (!canvasToolbar.includes('undoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: undo button must call store undoCanvasChange');
if (!canvasToolbar.includes('redoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: redo button must call store redoCanvasChange');
if (!canvasToolbar.includes('canUndoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: undo button must reflect store availability');
if (!canvasToolbar.includes('canRedoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: redo button must reflect store availability');
if (!canvasTab.includes('CanvasSheetWorkspace')) failures.push('CanvasTab.tsx: missing sheet workspace mount');
if (!canvasTab.includes('sidebarWidth')) failures.push('CanvasTab.tsx: missing resizable thumbnail sidebar width state');
if (!canvasTab.includes('data-thumbnail-resize')) failures.push('CanvasTab.tsx: missing thumbnail sidebar resize handle');
if (!canvasTab.includes('Math.max(250')) failures.push('CanvasTab.tsx: missing thumbnail sidebar min width clamp');
if (!canvasTab.includes('Math.min(350')) failures.push('CanvasTab.tsx: missing thumbnail sidebar max width clamp');
if (!canvasWorkspace.includes('scrollbarWidth')) failures.push('CanvasSheetWorkspace.tsx: missing sheet viewport calculations');
if (!canvasWorkspace.includes('columnLabels')) failures.push('CanvasSheetWorkspace.tsx: missing column labels');
if (!canvasWorkspace.includes('selectedCell')) failures.push('CanvasSheetWorkspace.tsx: missing cell selection wiring');
if (!canvasWorkspace.includes('selectedRange')) failures.push('CanvasSheetWorkspace.tsx: missing range selection rendering');
if (!canvasWorkspace.includes('sheetPaperWidth')) failures.push('CanvasSheetWorkspace.tsx: missing centered paper size calculations');
if (!canvasWorkspace.includes('data-sheet-paper')) failures.push('CanvasSheetWorkspace.tsx: missing explicit paper container marker');
if (!canvasWorkspace.includes('data-sheet-column-active')) failures.push('CanvasSheetWorkspace.tsx: missing column highlight marker');
if (!canvasWorkspace.includes('data-sheet-row-active')) failures.push('CanvasSheetWorkspace.tsx: missing row highlight marker');
if (!canvasWorkspace.includes("position: 'sticky'")) failures.push('CanvasSheetWorkspace.tsx: missing sticky header positioning');
if (!canvasWorkspace.includes('onContextMenu')) failures.push('CanvasSheetWorkspace.tsx: missing context menu support');
if (!canvasWorkspace.includes('window.prompt')) failures.push('CanvasSheetWorkspace.tsx: missing width/height prompt editing');
if (!canvasWorkspace.includes('resize-column')) failures.push('CanvasSheetWorkspace.tsx: missing column resize handles');
if (!canvasWorkspace.includes('resize-row')) failures.push('CanvasSheetWorkspace.tsx: missing row resize handles');
if (!canvasWorkspace.includes('editingCell')) failures.push('CanvasSheetWorkspace.tsx: missing inline cell editing state');
if (!canvasWorkspace.includes('skipNextBlurCommitRef')) failures.push('CanvasSheetWorkspace.tsx: Escape cancel must skip the following blur commit');
if (!canvasWorkspace.includes('onDoubleClick')) failures.push('CanvasSheetWorkspace.tsx: missing double-click cell editing');
if (!canvasWorkspace.includes('onKeyDown')) failures.push('CanvasSheetWorkspace.tsx: missing keyboard direct input handling');
if (!canvasWorkspace.includes('data-sheet-cell-focus')) failures.push('CanvasSheetWorkspace.tsx: missing focusable cell keyboard target');
if (!canvasWorkspace.includes('event.currentTarget.focus()')) failures.push('CanvasSheetWorkspace.tsx: missing per-cell focus handoff for direct typing');
if (!canvasWorkspace.includes('updateSelectedCellValue') && !canvasWorkspace.includes('updateSheetCellValue')) failures.push('CanvasSheetWorkspace.tsx: missing cell value commit handling');
if (!storeFile.includes('updateSheetCellValue')) failures.push('useTemplateDesignerStore.ts: missing cell commit action by row/col');
if (!canvasWorkspace.includes('data-sheet-cell-editor')) failures.push('CanvasSheetWorkspace.tsx: missing explicit inline cell editor marker');
if (!commitEditingCellBlock.includes('skipNextBlurCommitRef.current = true')) failures.push('CanvasSheetWorkspace.tsx: Enter commit must skip the following blur commit so undo restores the previous cell value');
if (!canvasWorkspace.includes('selectionOutline')) failures.push('CanvasSheetWorkspace.tsx: missing range selection outline');
if (!canvasWorkspace.includes('A4_PAPER_WIDTH_MM')) failures.push('CanvasSheetWorkspace.tsx: missing A4 paper width standard');
if (!canvasWorkspace.includes('A4_PAPER_HEIGHT_MM')) failures.push('CanvasSheetWorkspace.tsx: missing A4 paper height standard');
if (!canvasWorkspace.includes('data-paper-mode-ruler="top"')) failures.push('CanvasSheetWorkspace.tsx: missing paper-mode top ruler');
if (!canvasWorkspace.includes('data-paper-mode-ruler="left"')) failures.push('CanvasSheetWorkspace.tsx: missing paper-mode left ruler');
if (!canvasWorkspace.includes('data-canvas-settings-floating="true"')) failures.push('CanvasSheetWorkspace.tsx: missing global canvas settings floating panel');
if (!canvasWorkspace.includes('data-paper-settings-floating="true"')) failures.push('CanvasSheetWorkspace.tsx: missing floating paper settings');
if (!canvasWorkspace.includes('画布设置')) failures.push('CanvasSheetWorkspace.tsx: missing paper settings label');
if (!canvasWorkspace.includes('画布方向')) failures.push('CanvasSheetWorkspace.tsx: missing paper orientation settings');
if (!canvasWorkspace.includes('画布间距')) failures.push('CanvasSheetWorkspace.tsx: missing paper spacing settings');
if (!canvasWorkspace.includes('自由模式')) failures.push('CanvasSheetWorkspace.tsx: missing free paper mode option');
if (!canvasWorkspace.includes('paperMode')) failures.push('CanvasSheetWorkspace.tsx: missing persisted paper mode usage');
if (!canvasWorkspace.includes('paperOrientation')) failures.push('CanvasSheetWorkspace.tsx: missing persisted paper orientation usage');
if (!canvasWorkspace.includes('paperMarginLeftMm')) failures.push('CanvasSheetWorkspace.tsx: missing persisted paper margin usage');
if (!canvasWorkspace.includes('showRuler')) failures.push('CanvasSheetWorkspace.tsx: missing paper ruler toggle');
if (!canvasWorkspace.includes('buildRulerTicks')) failures.push('CanvasSheetWorkspace.tsx: missing word-style ruler ticks');
if (!canvasWorkspace.includes("linear-gradient(180deg, #fafbfc 0%, #f0f2f6 100%)")) failures.push('CanvasSheetWorkspace.tsx: missing word-style horizontal ruler surface');
if (!canvasWorkspace.includes('paperViewportGapTop')) failures.push('CanvasSheetWorkspace.tsx: missing paper top viewport gap');
if (!canvasWorkspace.includes('paperViewportGapBottom')) failures.push('CanvasSheetWorkspace.tsx: missing paper bottom viewport gap');
if (!canvasWorkspace.includes('paperContentWidth')) failures.push('CanvasSheetWorkspace.tsx: missing fixed paper content width');
if (!canvasWorkspace.includes('displayColumnWidths')) failures.push('CanvasSheetWorkspace.tsx: missing fixed-width column rendering');
if (!canvasWorkspace.includes("borderLeft: index === 0")) failures.push('CanvasSheetWorkspace.tsx: missing first-column border rendering');
if (!canvasWorkspace.includes("borderTop: index === 0")) failures.push('CanvasSheetWorkspace.tsx: missing first-row border rendering');
if (!canvasWorkspace.includes('clearSelection')) failures.push('CanvasSheetWorkspace.tsx: missing blank-area clear selection behavior');
if (!canvasWorkspace.includes("borderBottom: '5px solid #d9d9d9'")) failures.push('CanvasSheetWorkspace.tsx: missing Vue-style top-left selector triangle');
if (!pageThumbnails.includes('第 1 页')) failures.push('CanvasPageThumbnails.tsx: missing thumbnail page label');
if (!pageThumbnails.includes('分页缩略图')) failures.push('CanvasPageThumbnails.tsx: missing thumbnail title');
if (!pageThumbnails.includes('height: 36')) failures.push('CanvasPageThumbnails.tsx: missing aligned thumbnail header height');
if (!pageThumbnails.includes('fontWeight: 600')) failures.push('CanvasPageThumbnails.tsx: missing adjusted thumbnail title weight');
if (!pageThumbnails.includes("maxWidth: 'none'")) failures.push('CanvasPageThumbnails.tsx: missing adaptive thumbnail card width');
if (!sidebar.includes('基础字段')) failures.push('DesignerSidebar.tsx: missing field section title');
if (!sidebar.includes('字段映射')) failures.push('DesignerSidebar.tsx: missing model-field mapping section');
if (!sidebar.includes('插入目标')) failures.push('DesignerSidebar.tsx: missing insert target hint');
if (!inspector.includes('属性配置')) failures.push('DesignerInspector.tsx: missing inspector title');
if (!inspector.includes('页面属性')) failures.push('DesignerInspector.tsx: missing page inspector fallback');
if (!renderer.includes('children?.map')) failures.push('CanvasNodeRenderer.tsx: missing recursive children render');
if (!renderer.includes('CanvasDropZone')) failures.push('CanvasNodeRenderer.tsx: missing child insert zone');
if (!renderer.includes('DeleteOutline')) failures.push('CanvasNodeRenderer.tsx: missing node delete action');
if (!componentRegistry.includes('propSchema')) failures.push('componentRegistry.tsx: missing propSchema support');
if (!componentRegistry.includes('styleSchema')) failures.push('componentRegistry.tsx: missing styleSchema support');
if (!componentRegistry.includes('emptySymbol')) failures.push('componentRegistry.tsx: missing widget config schema');
if (!componentRegistry.includes('prefix')) failures.push('componentRegistry.tsx: missing prefix/suffix config support');
if (!componentRegistry.includes('compWidth')) failures.push('componentRegistry.tsx: missing component size config');
if (!componentRegistry.includes('maxLength')) failures.push('componentRegistry.tsx: missing text-length config support');
if (!componentRegistry.includes('precision')) failures.push('componentRegistry.tsx: missing numeric precision config support');
if (!componentRegistry.includes('optionLayout')) failures.push('componentRegistry.tsx: missing option layout config support');
if (!componentRegistry.includes('format')) failures.push('componentRegistry.tsx: missing date/time format config support');
if (!fieldRegistry.includes('compatibleComponents')) failures.push('fieldRegistry.ts: missing compatibleComponents');
if (!inspector.includes('绑定字段')) failures.push('DesignerInspector.tsx: missing field binding editor');
if (!inspector.includes('字段属性')) failures.push('DesignerInspector.tsx: missing field metadata section');
if (!inspector.includes('组件配置')) failures.push('DesignerInspector.tsx: missing widget config section');
if (!inspector.includes('样式配置')) failures.push('DesignerInspector.tsx: missing widget style section');
if (!inspector.includes('字段编码')) failures.push('DesignerInspector.tsx: missing field code display');
if (!storeFile.includes('bindFieldToNode')) failures.push('useTemplateDesignerStore.ts: missing bindFieldToNode action');
if (!storeFile.includes('insertNode')) failures.push('useTemplateDesignerStore.ts: missing insertNode action');
if (!storeFile.includes('addNodeFromField')) failures.push('useTemplateDesignerStore.ts: missing addNodeFromField action');
if (!storeFile.includes('getFieldById')) failures.push('useTemplateDesignerStore.ts: missing getFieldById helper');
if (!storeFile.includes('syncBoundNodesForField')) failures.push('useTemplateDesignerStore.ts: missing bound-node sync helper');
if (!storeFile.includes('bindings?.fieldId === fieldId')) failures.push('useTemplateDesignerStore.ts: missing field-to-canvas propagation');
if (!storeFile.includes('removeNode')) failures.push('useTemplateDesignerStore.ts: missing canvas node removal action');
if (!storeFile.includes('updateNodeStyle')) failures.push('useTemplateDesignerStore.ts: missing node style update action');
if (!storeFile.includes('moveNode')) failures.push('useTemplateDesignerStore.ts: missing node move action');
if (!storeFile.includes('removeField')) failures.push('useTemplateDesignerStore.ts: missing field removal action');
if (!storeFile.includes('clearRemovedFieldBindings')) failures.push('useTemplateDesignerStore.ts: missing field binding cleanup helper');
if (!storeFile.includes('replaceCurrentPageFromImport')) failures.push('useTemplateDesignerStore.ts: missing import page replacement action');
if (!storeFile.includes('undoStack: TemplateDesignerDocument[]')) failures.push('useTemplateDesignerStore.ts: missing undo history stack');
if (!storeFile.includes('redoStack: TemplateDesignerDocument[]')) failures.push('useTemplateDesignerStore.ts: missing redo history stack');
if (!storeFile.includes('pushDocumentHistory')) failures.push('useTemplateDesignerStore.ts: missing document history helper');
if (!storeFile.includes('undoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing undoCanvasChange action');
if (!storeFile.includes('redoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing redoCanvasChange action');
if (!storeFile.includes('canUndoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing canUndoCanvasChange selector');
if (!storeFile.includes('canRedoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing canRedoCanvasChange selector');
if (!componentRegistry.includes("type === 'tabs'")) failures.push('componentRegistry.tsx: missing structured tabs default node');
if (!componentRegistry.includes("type === 'grid'")) failures.push('componentRegistry.tsx: missing structured grid default node');
if (!renderer.includes('ArrowUpward')) failures.push('CanvasNodeRenderer.tsx: missing move-up action');
if (!renderer.includes('ArrowDownward')) failures.push('CanvasNodeRenderer.tsx: missing move-down action');
if (!renderer.includes('moveNode')) failures.push('CanvasNodeRenderer.tsx: missing node reorder wiring');
if (!renderer.includes('isAbsoluteNode')) failures.push('CanvasNodeRenderer.tsx: missing absolute-position node rendering helper');
if (!componentRegistry.includes('static-text')) failures.push('componentRegistry.tsx: missing static-text component for imported Word text');
if (!componentRegistry.includes('static-image')) failures.push('componentRegistry.tsx: missing static-image component for imported Word images');
if (!templateImportUtils.includes('importTemplateToCanvasPage')) failures.push('templateImport.ts: missing importTemplateToCanvasPage orchestrator');
if (!templateImportUtils.includes('orientation')) failures.push('templateImport.ts: missing orientation normalization');
if (!excelImportUtils.includes('importExcelToCanvasPage')) failures.push('importExcel.ts: missing excel import converter');
if (!excelImportUtils.includes('sheet.columnWidths')) failures.push('importExcel.ts: missing excel column width mapping');
if (!excelImportUtils.includes('safeGetWorksheetImages')) failures.push('importExcel.ts: modern Excel image lookup must be isolated from cell import');
if (!excelImportUtils.includes('safeGetImageRange')) failures.push('importExcel.ts: modern Excel image range lookup must tolerate unsupported anchors');
if (!excelImportUtils.includes('return importModernExcel(file, pageId, pageName).catch(() => importLegacyExcel(file, pageId, pageName));')) failures.push('importExcel.ts: modern Excel import failures must fall back to legacy cell import');
if (!wordImportUtils.includes('importWordToCanvasPage')) failures.push('importWord.ts: missing word import converter');
if (!wordImportUtils.includes('static-text')) failures.push('importWord.ts: missing word text node conversion');
if (!workflowTab.includes('ReactFlow')) failures.push('WorkflowTab.tsx: missing ReactFlow canvas');
if (!workflowTab.includes('addEdge')) failures.push('WorkflowTab.tsx: missing edge creation support');
if (!workflowTab.includes('新增节点')) failures.push('WorkflowTab.tsx: missing add node action');
if (!workflowTab.includes('onNodeClick')) failures.push('WorkflowTab.tsx: missing workflow node selection');
if (!workflowTab.includes('节点名称')) failures.push('WorkflowTab.tsx: missing workflow node inspector');

if (failures.length > 0) {
  console.error('verify-template-designer-react failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-template-designer-react passed');
