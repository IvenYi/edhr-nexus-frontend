import { readFileSync } from 'node:fs';

const constantsContent = readFileSync(new URL('../src/utils/constants.ts', import.meta.url), 'utf8');
const routerContent = readFileSync(new URL('../src/router/index.tsx', import.meta.url), 'utf8');
const apiContent = readFileSync(new URL('../src/api/template-modeling.ts', import.meta.url), 'utf8');
const pageContent = readFileSync(new URL('../src/pages/master-data/TemplateModelingPage.tsx', import.meta.url), 'utf8');
const standardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const controllerContent = readFileSync(new URL('../../backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java', import.meta.url), 'utf8');
const changelogContent = readFileSync(new URL('../../backend/src/main/resources/db/changelog/db.changelog-master.yaml', import.meta.url), 'utf8');
const templateMigrationContent = readFileSync(new URL('../../backend/src/main/resources/db/changelog/0033-template-modeling-management.sql', import.meta.url), 'utf8');
const templateAnalysisMigrationContent = readFileSync(new URL('../../backend/src/main/resources/db/changelog/0035-form-template-analysis-and-onlyoffice.sql', import.meta.url), 'utf8');
const dockerComposeContent = readFileSync(new URL('../../docker-compose.yml', import.meta.url), 'utf8');
const failures = [];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function mustOccurAtLeast(content, token, count, reason) {
  const occurrences = content.split(token).length - 1;
  if (occurrences < count) failures.push(`expected ${JSON.stringify(token)} at least ${count} times, found ${occurrences} (${reason})`);
}

function mustAppearInOrder(content, tokens, reason) {
  let lastIndex = -1;
  for (const token of tokens) {
    const index = content.indexOf(token);
    if (index === -1) {
      failures.push(`missing ${JSON.stringify(token)} (${reason})`);
    } else if (index <= lastIndex) {
      failures.push(`out-of-order ${JSON.stringify(token)} (${reason})`);
    }
    lastIndex = index;
  }
}

mustInclude(standardContent, '模板建模页面统一沿用工序管理双栏工作台标准', 'UI standard should document template modeling standard');
mustInclude(standardContent, "Snackbar `anchorOrigin={{ vertical: 'top', horizontal: 'right' }}`", 'UI standard should require explicit top-right feedback placement');
mustInclude(standardContent, '成功提示和错误提示均使用同一 Snackbar/Alert 标准', 'UI standard should align success and error feedback style');

mustInclude(constantsContent, "label: '模板建模'", 'data module should expose template modeling menu group');
mustAppearInOrder(constantsContent, [
  "{ label: '表单模板', path: '/master-data/form-templates' }",
  "{ label: '批记录模板', path: '/master-data/batch-record-templates' }",
], 'template modeling menus should follow requested order');

mustInclude(routerContent, 'const TemplateModelingPage', 'router should lazy-load template modeling page');
mustInclude(routerContent, 'path="form-templates"', 'router should expose form templates');
mustInclude(routerContent, 'pageKey="formTemplates"', 'form template route should pass page key');
mustInclude(routerContent, 'path="batch-record-templates"', 'router should expose batch record templates');
mustInclude(routerContent, 'pageKey="batchRecordTemplates"', 'batch record route should pass page key');

mustInclude(apiContent, 'TemplateModelingRecord', 'template API should expose record type');
mustInclude(apiContent, 'TemplateVersionRecord', 'template API should expose version type');
mustInclude(apiContent, 'versionDescription', 'template create payload should separate template description from version description');
mustInclude(apiContent, 'TemplateCategoryRecord', 'template API should expose category type');
mustInclude(apiContent, 'currentVersion', 'form template list records should expose current version summary');
mustInclude(apiContent, 'versions?: TemplateVersionRecord[]', 'form template list records should expose complete version rows');
mustInclude(apiContent, 'effectiveFrom', 'form template versions should expose effective start time');
mustInclude(apiContent, 'effectiveTo', 'form template versions should expose effective end time');
mustInclude(apiContent, 'getTemplateModelingCategories', 'template API should expose category list');
mustInclude(apiContent, 'createTemplateModelingCategory', 'template API should expose category create');
mustInclude(apiContent, 'updateTemplateModelingCategory', 'template API should expose category update');
mustInclude(apiContent, 'deleteTemplateModelingCategory', 'template API should expose category delete');
mustInclude(apiContent, 'reorderTemplateModelingCategories', 'template API should expose category drag sorting');
mustInclude(apiContent, 'getFormTemplates', 'template API should expose form template list');
mustInclude(apiContent, 'createFormTemplate', 'template API should expose form template create');
mustInclude(apiContent, 'updateFormTemplate', 'template API should expose form template update');
mustInclude(apiContent, 'deleteFormTemplate', 'template API should expose form template delete');
mustInclude(apiContent, 'createFormTemplateVersion', 'template API should expose form template version create');
mustInclude(apiContent, 'deleteFormTemplateVersion', 'template API should expose form template version delete');
mustInclude(apiContent, 'saveFormTemplateDesign', 'template API should expose form template design save');
mustInclude(apiContent, 'importFormTemplateSourceFile', 'template API should expose form template source import');
mustInclude(apiContent, 'client.post(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/import`, formData', 'template source import should post to the selected version import endpoint');
mustInclude(apiContent, 'reparseFormTemplateSourceFile', 'template API should expose current source reparse endpoint');
mustInclude(apiContent, '`${templateModelingBase}/form-templates/${id}/versions/${versionId}/source/reparse`', 'template source reparse should post to the selected version source reparse endpoint');
mustInclude(apiContent, 'TemplateCanvasDesign', 'template API should type parsed canvas design schema');
mustInclude(apiContent, 'TemplateInteractiveField', 'template API should reserve interactive field anchors for drag and fill workflows');
mustInclude(apiContent, `export interface TemplateInteractiveField {
  id: string;
  code: string;
  name?: string;
  type?: string;
  required?: boolean;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | string;
  component?: string;
  fillable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  anchor?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  dataBinding?: Record<string, unknown>;
  binding?: { fillable?: boolean; component?: string };
  sourceText?: string;
  keyText?: string;
  valueText?: string;
  semanticRole?: 'keyValue' | 'staticText' | string;
  pairing?: Record<string, unknown>;
  sourceCandidateId?: string;
}`, 'interactive field schema should preserve key-value semantic metadata after candidate confirmation and manual placement');
mustInclude(apiContent, 'TemplateAnalysisDraft', 'template import API should expose analysis draft type');
mustInclude(apiContent, 'TemplateAnalysisBlock', 'template import API should expose source text block type');
mustInclude(apiContent, 'TemplateCandidateDecisionItem', 'template import API should expose candidate decision payload');
mustInclude(apiContent, 'background?: TemplateCanvasBackground | null', 'analysis pages should carry restored background metadata for confirmation recovery');
mustInclude(apiContent, 'layerSummary?: {', 'analysis pages should carry layer summary metadata for restored canvas explainability');
mustInclude(apiContent, `export interface TemplateCanvasPage {
  id: string;
  pageNumber: number;
  width: number;
  height: number;
  orientation?: 'portrait' | 'landscape' | string;
  deskewApplied?: boolean;
  background?: TemplateCanvasBackground | null;
  layerSummary?: {`, 'canvas pages should carry layer summary metadata when rebuilt from import analysis');
mustInclude(apiContent, 'sourceText?: string', 'template import candidates should preserve raw source text for confirmation');
mustInclude(apiContent, 'keyText?: string', 'template import candidates should expose key text for key-value confirmation');
mustInclude(apiContent, 'valueText?: string', 'template import candidates should expose parsed value text for key-value confirmation');
mustInclude(apiContent, 'semanticRole?:', 'template import candidates should expose semantic role metadata');
mustInclude(apiContent, 'pairing?: Record<string, unknown>', 'template import candidates should expose key-value pairing metadata');
mustInclude(apiContent, 'getFormTemplateAnalysisDraft', 'template API should expose analysis draft fetch endpoint');
mustInclude(apiContent, 'confirmFormTemplateAnalysisCandidates', 'template API should expose candidate confirmation endpoint');
mustInclude(apiContent, 'getFormTemplateOnlyOfficeConfig', 'template API should expose OnlyOffice config endpoint');
mustInclude(apiContent, 'documentServerUrl', 'OnlyOffice config should include document server URL');
mustInclude(apiContent, 'permissions: {', 'OnlyOffice config should expose explicit document permissions');
mustInclude(apiContent, 'edit: boolean', 'OnlyOffice document permissions should expose edit capability');
mustInclude(apiContent, 'download: boolean', 'OnlyOffice document permissions should expose download capability');
mustInclude(apiContent, 'print: boolean', 'OnlyOffice document permissions should expose print capability');
mustInclude(apiContent, "type: 'text' | 'table' | 'cell' | 'line' | 'shape' | 'image' | string", 'canvas layer schema should include imported shape layers');
mustInclude(apiContent, 'shapeType?: string', 'canvas layer schema should preserve source shape type');
mustInclude(apiContent, 'fileId?: string | number | null', 'canvas image layers should preserve imported file ids');
mustInclude(apiContent, 'url?: string | null', 'canvas image layers should preserve preview urls');
mustInclude(apiContent, 'mimeType?: string | null', 'canvas image layers should preserve image mime type');
mustInclude(apiContent, "objectFit?: 'fill' | 'contain' | 'cover' | string", 'canvas image layers should preserve object fit');
mustInclude(apiContent, 'opacity?: number', 'canvas image layers should preserve opacity');
mustInclude(apiContent, 'rotation?: number', 'canvas image layers should preserve rotation');
mustInclude(apiContent, 'colSpan?: number', 'canvas cell layers should preserve imported Excel merged column spans');
mustInclude(apiContent, 'rowSpan?: number', 'canvas cell layers should preserve imported Excel merged row spans');
mustInclude(apiContent, 'showGrid?: boolean', 'canvas table layers should allow Excel cell borders to render without a synthetic grid overlay');
mustInclude(apiContent, 'selectable?: boolean', 'canvas layers should expose editable/selectable metadata');
mustInclude(apiContent, 'editable?: boolean', 'canvas layers should expose imported editability metadata');
mustInclude(apiContent, 'deletable?: boolean', 'canvas layers should expose imported deletion metadata');
mustInclude(apiContent, 'draggable?: boolean', 'canvas layers should expose draggable metadata');
mustInclude(apiContent, 'zIndex?: number', 'canvas layers should expose z-index metadata for low-code editing');
mustInclude(apiContent, 'sourceType?: string', 'canvas layers should preserve parser source type metadata');
mustInclude(apiContent, 'sourceRef?: Record<string, unknown>', 'canvas layers should preserve parser source reference metadata');
mustInclude(apiContent, 'confidence?: number', 'canvas layers should preserve OCR confidence metadata');
mustInclude(apiContent, 'FormData', 'template source import should upload the real binary file');
mustInclude(apiContent, "formData.append('file', file)", 'template source import should append multipart file field');
mustNotInclude(apiContent, "'Content-Type': 'multipart/form-data'", 'template source import should let the browser set multipart boundary');
mustInclude(apiContent, "headers: { 'Content-Type': undefined }", 'template source import should clear the JSON default header for FormData');
mustInclude(apiContent, 'TEMPLATE_SOURCE_IMPORT_TIMEOUT_MILLIS', 'template source import should override the global axios timeout for long-running parsing');
mustInclude(apiContent, 'timeout: TEMPLATE_SOURCE_IMPORT_TIMEOUT_MILLIS', 'template source import and reparse should not fail at the global 30s timeout');
mustInclude(apiContent, 'coordinateSystem', 'template canvas schema should preserve coordinate metadata for later dragging and filling');
mustInclude(apiContent, 'fillRuntime', 'template canvas schema should reserve fill runtime metadata');
mustInclude(apiContent, 'getBatchRecordTemplates', 'template API should expose batch record list');
mustInclude(apiContent, 'createBatchRecordTemplate', 'template API should expose batch record create');
mustInclude(apiContent, 'updateBatchRecordTemplate', 'template API should expose batch record update');
mustInclude(apiContent, 'deleteBatchRecordTemplate', 'template API should expose batch record delete');

mustInclude(pageContent, 'TEMPLATE_MODELING_PAGE_CONFIGS', 'template modeling page should be config-driven');
mustInclude(pageContent, "formTemplates: {", 'page should configure form templates');
mustInclude(pageContent, "batchRecordTemplates: {", 'page should configure batch record templates');
mustInclude(pageContent, '基础信息', 'form template dialog should use a base information card');
mustInclude(pageContent, '版本信息', 'form template dialog should use a version information card');
mustInclude(pageContent, '<DialogContent dividers>', 'template create dialog should copy material dialog content style');
mustInclude(pageContent, '<Stack spacing={1.5} sx={{ pt: 0.5 }}>', 'template create dialog should copy material dialog stack spacing');
mustInclude(pageContent, '<DetailSection title="基础信息">', 'template create dialog base card should copy material section component');
mustInclude(pageContent, '<DetailSection title="版本信息">', 'template create dialog version card should copy material section component');
mustInclude(pageContent, 'versionDescription', 'template form should capture version description separately');
mustInclude(pageContent, 'label="版本说明"', 'template version info should expose version description field');
mustInclude(pageContent, '保存并设计', 'form template dialog should expose save-and-design action');
mustInclude(pageContent, '表单编码', 'form template code should be user-editable');
mustOccurAtLeast(pageContent, 'effectiveFrom: defaultEffectiveFromValue()', 2, 'form template create and child-version dialogs should default effective start time to current date');
mustInclude(pageContent, 'validateEffectiveDateRange', 'form template submit should validate effective date range');
mustInclude(pageContent, '失效时间不能早于生效时间', 'form template submit should block end time before start time');
mustInclude(pageContent, '当前版本', 'form template table should expose current version');
mustInclude(pageContent, '生效时间', 'form template table/dialog should expose effective start time');
mustInclude(pageContent, '失效时间', 'form template table/dialog should expose effective end time');
mustInclude(pageContent, 'openDesigner', 'form template rows should open the designer');
mustInclude(pageContent, 'data-form-template-designer', 'form template page should expose designer shell');
mustInclude(pageContent, 'data-form-template-designer-fullscreen', 'designer should open as a fullscreen workspace instead of a drawer');
mustInclude(pageContent, 'data-form-template-page-thumbnails', 'fullscreen designer should expose page thumbnail panel');
mustInclude(pageContent, 'ArticleOutlined', 'page thumbnail opener should use a page-oriented icon');
mustInclude(pageContent, 'const [pageThumbnailsOpen, setPageThumbnailsOpen] = useState(true)', 'page thumbnails panel should track open state');
mustInclude(pageContent, 'const [activeCanvasPageId, setActiveCanvasPageId] = useState', 'designer should track the active canvas page for new components');
mustInclude(pageContent, 'const activeCanvasPage =', 'designer should resolve active page from current canvas pages');
mustInclude(pageContent, 'data-form-template-page-thumbnail-opener', 'left rail should expose a stable page thumbnail opener');
mustInclude(pageContent, 'onClick={() => setPageThumbnailsOpen(true)}', 'page thumbnail opener should open the thumbnails panel');
mustInclude(pageContent, 'pageThumbnailsOpen ? (', 'page thumbnail panel should render only when opened');
mustInclude(pageContent, 'onClick={() => setPageThumbnailsOpen(false)}', 'page thumbnail close action should hide the thumbnails panel');
mustInclude(pageContent, 'const [pageThumbnailWidth, setPageThumbnailWidth] = useState(150)', 'page thumbnail panel should default to the requested 150px width');
mustInclude(pageContent, 'width: pageThumbnailWidth, minWidth: pageThumbnailWidth', 'page thumbnail panel should use the resizable width state');
mustInclude(pageContent, 'data-form-template-page-thumbnail-card', 'page thumbnail items should expose stable card markers for resize QA');
mustInclude(pageContent, 'data-form-template-page-thumbnail-preview', 'page thumbnail previews should expose stable preview markers for resize QA');
mustInclude(pageContent, "width: 'clamp(96px, calc(100% - 54px), 220px)'", 'page thumbnail cards should resize with the thumbnail panel');
mustInclude(pageContent, "width: '72%'", 'page thumbnail previews should resize with their card');
mustInclude(pageContent, 'data-form-template-page-thumbnail-resizer', 'page thumbnail panel should expose a right-side resize handle');
mustInclude(pageContent, "cursor: 'col-resize'", 'page thumbnail resize handle should use a column-resize cursor');
mustInclude(pageContent, 'data-form-template-editor-canvas', 'fullscreen designer should expose editor canvas');
mustInclude(pageContent, 'data-form-template-editor-page', 'fullscreen designer should expose paper page area');
mustInclude(pageContent, 'data-form-template-canvas-page', 'fullscreen designer should render parsed import canvas pages');
mustInclude(pageContent, 'function resolveTemplateCanvasPageWidth', 'fullscreen designer should compute visual page width from imported canvas dimensions');
mustInclude(pageContent, 'function isExcelCanvasPage', 'fullscreen designer should identify Excel-imported canvas pages');
mustInclude(pageContent, 'TEMPLATE_EXCEL_CANVAS_MIN_VISUAL_WIDTH', 'Excel-imported canvases should have a readable minimum visual width');
mustInclude(pageContent, "['xls', 'xlsx'].includes(fileType)", 'Excel canvas detection should cover xls and xlsx imports');
mustInclude(pageContent, 'function resolveTemplateCanvasPageWidth(canvasPage: TemplateCanvasPage, source?: TemplateCanvasSource | null)', 'fullscreen designer should resolve Excel sizing from canvas source metadata');
mustInclude(pageContent, 'isExcelCanvasPage(source)', 'fullscreen designer should use canvas source metadata for Excel sizing');
mustInclude(pageContent, 'const pageVisualWidth = resolveTemplateCanvasPageWidth(canvasPage, templateCanvasDesign.source);', 'fullscreen designer should use resolved visual width for each imported page');
mustInclude(pageContent, 'width: pageVisualWidth', 'wide Excel canvases should not be compressed into the fixed portrait page width');
mustInclude(pageContent, "maxWidth: 'none'", 'wide Excel canvases should scroll horizontally instead of being squeezed by viewport max width');
mustInclude(pageContent, 'const shouldLeftAlignCanvasPages = isExcelCanvasPage(templateCanvasDesign.source)', 'Excel imports should start from the left edge of the canvas viewport');
mustInclude(pageContent, '|| templateCanvasPages.some((canvasPage) => resolveTemplateCanvasPageWidth(canvasPage, templateCanvasDesign.source) > TEMPLATE_CANVAS_MAX_VISUAL_WIDTH)', 'wide imported canvases should left-align so their first columns stay visible');
mustInclude(pageContent, "alignItems: shouldLeftAlignCanvasPages ? 'flex-start' : 'center'", 'wide imported canvases should not be centered out of the initial viewport');
mustNotInclude(pageContent, 'borderTop: true, borderLeft: true', 'canvas should not render decorative page corner marks');
mustNotInclude(pageContent, 'borderBottom: true, borderRight: true', 'canvas should not render decorative page corner marks');
mustInclude(pageContent, 'data-form-template-background-layer', 'fullscreen designer should render parsed source background layers');
mustInclude(pageContent, 'data-form-template-table-layer', 'fullscreen designer should render restored table layers from imported Excel files');
mustInclude(pageContent, 'data-form-template-table-grid-cell', 'table canvas layers should render row and column grid cells instead of a plain box');
mustInclude(pageContent, 'const showGrid = layer.showGrid !== false;', 'Excel imported table layers should be able to hide the synthetic grid and rely on cell borders');
mustInclude(pageContent, 'showGrid && Array.from({ length: rows * columns })', 'table grid cells should not render when a source import disables the synthetic grid');
mustInclude(pageContent, 'gridTemplateColumns: `repeat(${Math.max(1, layer.columns || 1)}, minmax(0, 1fr))`', 'table canvas layers should use imported column count for grid rendering');
mustInclude(pageContent, 'gridTemplateRows: `repeat(${Math.max(1, layer.rows || 1)}, minmax(0, 1fr))`', 'table canvas layers should use imported row count for grid rendering');
mustInclude(pageContent, 'data-form-template-cell-layer', 'fullscreen designer should render restored cell style layers from imported Excel files');
mustInclude(pageContent, 'data-form-template-line-layer', 'fullscreen designer should render restored line layers independently');
mustInclude(pageContent, 'const isVerticalLine = Number(layer.height || 0) > Number(layer.width || 0)', 'line canvas layers should detect vertical lines from imported PDF geometry');
mustInclude(pageContent, "borderLeft: isVerticalLine ? `${layer.borderWidth || 1}px ${layer.borderStyle || 'solid'} ${layer.borderColor || '#303133'}` : 'none'", 'vertical line canvas layers should render with a left border instead of a top border');
mustInclude(pageContent, 'data-form-template-shape-layer', 'fullscreen designer should render restored shape layers independently');
mustInclude(pageContent, 'data-form-template-image-layer', 'fullscreen designer should render restored image layers independently');
mustInclude(pageContent, "if (layer.type === 'image')", 'fullscreen designer should render image canvas layers through a dedicated branch');
mustInclude(pageContent, 'getCanvasLayerFileId', 'fullscreen designer should resolve imported image layer file ids');
mustInclude(pageContent, 'canvasAssetFileIds', 'fullscreen designer should fetch private preview blobs for backgrounds and image layers');
mustInclude(pageContent, "objectFit: layer.objectFit || 'fill'", 'image canvas layers should preserve imported object fit');
mustInclude(pageContent, 'transform: `rotate(${layer.rotation || 0}deg)`', 'image canvas layers should preserve imported rotation');
mustInclude(pageContent, 'renderTemplateCanvasLayer', 'fullscreen designer should render canvas layers by type instead of flattening them to plain text');
mustInclude(pageContent, 'data-form-template-field-overlay', 'fullscreen designer should render anchored field overlays');
mustInclude(pageContent, 'renderTemplateInteractiveFieldControl', 'fullscreen designer should render fillable field overlays by component type');
mustInclude(pageContent, 'data-form-template-field-control', 'field overlays should expose a stable marker for rendered fill controls');
mustInclude(pageContent, 'data-form-template-field-signature-pad', 'field overlays should render a signature-pad surface for signature fields');
mustInclude(pageContent, 'data-form-template-field-textarea', 'field overlays should render a multi-line text area surface for long-text fields');
mustInclude(pageContent, 'data-form-template-field-datetime', 'field overlays should render a date/time control surface for datetime fields');
mustInclude(pageContent, 'data-form-template-field-number', 'field overlays should render a number control surface for number fields');
mustInclude(pageContent, 'const [fieldPreviewValues, setFieldPreviewValues] = useState<Record<string, string>>({})', 'designer should keep temporary fill preview values outside template JSON');
mustInclude(pageContent, 'updateFieldPreviewValue', 'designer should update temporary fill preview values from field controls');
mustInclude(pageContent, 'fieldPreviewValues[field.code] ?? fieldPreviewValues[field.id] ?? \'\'', 'field controls should read temporary preview values by field code');
mustInclude(pageContent, "setFieldPreviewValues({})", 'designer should reset temporary fill preview values when loading or clearing a template');
mustAppearInOrder(pageContent, [
  'renderTemplateInteractiveFieldControl(',
  'fieldPreviewValues[field.code] ?? fieldPreviewValues[field.id] ?? \'\'',
  '(value) => updateFieldPreviewValue(field, value)',
], 'field overlay controls should be wired to temporary preview state instead of persisted design JSON');
const fieldPreviewUpdaterStart = pageContent.indexOf('const updateFieldPreviewValue');
const fieldPreviewUpdaterEnd = pageContent.indexOf('const deleteInteractiveField', fieldPreviewUpdaterStart);
if (fieldPreviewUpdaterStart === -1 || fieldPreviewUpdaterEnd === -1) {
  failures.push('missing field preview updater section (temporary fill preview values should have an isolated updater)');
} else {
  const fieldPreviewUpdaterContent = pageContent.slice(fieldPreviewUpdaterStart, fieldPreviewUpdaterEnd);
  mustInclude(fieldPreviewUpdaterContent, 'setFieldPreviewValues((current) => ({ ...current, [key]: value }));', 'preview updater should only write temporary preview state');
  mustNotInclude(fieldPreviewUpdaterContent, 'setTemplateModelDesign', 'preview updater should not mutate persisted model design');
  mustNotInclude(fieldPreviewUpdaterContent, 'setTemplateCanvasDesign', 'preview updater should not mutate persisted canvas design');
  mustNotInclude(fieldPreviewUpdaterContent, 'updateInteractiveField', 'preview updater should not route through persisted field mutation');
}
mustInclude(pageContent, 'selectedCanvasTarget', 'designer should track the selected editable canvas target');
mustInclude(pageContent, 'data-form-template-selected-layer', 'selected imported layers should expose a stable selected marker');
mustInclude(pageContent, 'updateCanvasLayer', 'designer should edit imported canvas layer data in state');
mustInclude(pageContent, 'deleteCanvasLayer', 'designer should delete imported canvas layers from state');
mustInclude(pageContent, 'moveCanvasLayer', 'designer should move imported canvas layers by updating source coordinates');
mustInclude(pageContent, 'updateInteractiveField', 'designer should edit fillable field overlays in state');
mustInclude(pageContent, 'deleteInteractiveField', 'designer should delete fillable field overlays in state');
mustInclude(pageContent, 'moveInteractiveField', 'designer should move fillable field overlays by updating source coordinates');
mustNotInclude(pageContent, 'data-form-template-layer-properties-panel', 'fullscreen designer should not render the right-side properties panel');
mustNotInclude(pageContent, 'data-form-template-candidate-confirmation-panel', 'fullscreen designer should not hide candidate confirmation in a right-side panel');
mustInclude(pageContent, "if (type === 'signature') return 'SignaturePad';", 'designer should map signature fields to the signature pad component');
mustInclude(pageContent, "if (component === 'SignaturePad') return 'signature';", 'designer should map the signature pad component back to signature field type');
mustInclude(pageContent, "if (type === 'textarea') return 'TextArea';", 'designer should map long-text fields to the text area component');
mustInclude(pageContent, "if (component === 'TextArea') return 'textarea';", 'designer should map the text area component back to long-text field type');
mustInclude(pageContent, 'const normalizedComponent = field.component || field.binding?.component || componentForTemplateFieldType(normalizedType)', 'saved designs should reopen signature fields with the signature pad component preserved');
mustInclude(pageContent, 'const component = candidate?.suggestedComponent || componentForTemplateFieldType(candidate?.type)', 'candidate placement should preserve parser-suggested components such as signature pads');
mustInclude(pageContent, 'const fieldType = candidate?.type || typeForComponent(component)', 'candidate placement should keep the field type aligned with the chosen component');
mustInclude(pageContent, 'data-form-template-add-text-tool', 'left rail should expose a text component creation tool');
mustInclude(pageContent, 'data-form-template-add-field-tool', 'left rail should expose a fillable field component creation tool');
mustInclude(pageContent, 'addCanvasTextLayer', 'designer should create editable text layers from the tool rail');
mustInclude(pageContent, 'addInteractiveFieldToCanvas', 'designer should create fillable fields from the tool rail');
mustInclude(pageContent, 'addFieldCandidateToCanvas', 'designer should add imported field candidates to the active canvas page');
mustInclude(pageContent, 'resolveCandidateCanvasPlacement', 'designer should resolve candidate placement from parsed page and anchor metadata');
mustInclude(pageContent, 'candidate?.valueAnchor?.width ?? 168', 'field candidate placement should preserve parsed candidate anchor width');
mustInclude(pageContent, 'candidate?.valueAnchor?.height ?? 30', 'field candidate placement should preserve parsed candidate anchor height');
mustInclude(pageContent, 'point ? pageItem : templateCanvasPages.find((item) => item.id === candidate?.pageId) ?? pageItem', 'click-to-place candidate workflow should use parsed page, while drag/drop should use the drop page');
mustInclude(pageContent, 'point ?? { x: candidate?.valueAnchor?.x ?? 96, y: candidate?.valueAnchor?.y ?? 144 }', 'click-to-place candidate workflow should use the parsed candidate anchor point by default');
mustInclude(pageContent, "anchor: { pageId: resolvedPage.id, source: candidate ? 'field-candidate' : 'manual-tool', unit: 'source-point' }", 'field candidate placement should bind to the resolved source page');
mustInclude(pageContent, 'setSelectedCanvasTarget({ type: \'field\', pageId: resolvedPage.id, id: field.id })', 'field candidate placement should select the resolved source page target');
mustInclude(pageContent, 'handleCanvasToolDragStart', 'designer tool rail should support drag-start payloads');
mustInclude(pageContent, 'handleCanvasPageDrop', 'designer canvas pages should support drop-to-place workflows');
mustInclude(pageContent, 'dropEvent.currentTarget.getBoundingClientRect()', 'designer drop handler should calculate the release point from the canvas page bounds');
mustInclude(pageContent, 'dropX = (dropPoint.x / pageRect.width) * canvasPage.width', 'designer drop handler should translate browser x coordinate into source canvas x coordinate');
mustInclude(pageContent, 'dropY = (dropPoint.y / pageRect.height) * canvasPage.height', 'designer drop handler should translate browser y coordinate into source canvas y coordinate');
mustInclude(pageContent, 'draggable onDragStart={(event) => handleCanvasToolDragStart(event, { kind: \'text\' })}', 'text tool should be draggable from the left rail');
mustInclude(pageContent, 'draggable onDragStart={(event) => handleCanvasToolDragStart(event, { kind: \'field\' })}', 'field tool should be draggable from the left rail');
mustInclude(pageContent, 'onDragOver={(event) => event.preventDefault()}', 'canvas pages should allow drag-over for component drops');
mustInclude(pageContent, 'onDrop={(event) => handleCanvasPageDrop(event, canvasPage)}', 'canvas pages should create components at the drop point');
mustNotInclude(pageContent, 'if (analysisDraft?.analysisId && analysisDraft.candidates.length > 0) throw new Error(\'请先完成解析候选确认，再保存设计\')', 'hidden candidate confirmation should not block design saving');
mustInclude(pageContent, 'disabled={saveDesignMutation.isPending}', 'save button should only be disabled while saving when the right properties panel is removed');
mustNotInclude(pageContent, "title={analysisDraft?.analysisId && analysisDraft.candidates.length > 0 ? '请先完成解析候选确认' : undefined}", 'save button should not reference hidden candidate confirmation');
mustInclude(pageContent, 'sourceCandidateId: candidate.id', 'candidate field overlays should preserve source candidate identity for preview dedupe');
mustInclude(pageContent, 'field.sourceCandidateId !== candidate.id', 'switching candidate decisions should remove stale field overlays from the same candidate');
mustInclude(pageContent, 'syncCandidateComponentPreview(candidate, nextDecision)', 'candidate field edits should update the already-previewed component overlay');
mustInclude(pageContent, 'const candidateDecisionToStaticTextLayer =', 'candidate static-text decisions should be convertible into canvas text layers');
mustInclude(pageContent, 'id: `static-candidate-${candidate.id}`', 'static-text candidate preview layers should keep the same id convention as persisted confirmation layers');
mustInclude(pageContent, "sourceType: 'analysis-candidate'", 'static-text candidate preview layers should carry persisted analysis-candidate source metadata');
mustInclude(pageContent, 'data-form-template-static-candidate-layer', 'static-text candidate layers should expose a stable canvas marker');
mustInclude(pageContent, 'const candidateDecisionToFieldCandidate =', 'candidate drag payload should use the current confirmation decision overrides');
mustInclude(pageContent, 'decision?.fieldCode ?? candidate.fieldCode', 'candidate decision drag payload should preserve edited field codes');
mustInclude(pageContent, 'decision?.fieldName ?? candidate.fieldName', 'candidate decision drag payload should preserve edited field names');
mustInclude(pageContent, 'decision?.component ?? candidate.suggestedComponent', 'candidate decision drag payload should preserve edited component type');
mustInclude(pageContent, 'decision?.required ?? candidate.required ?? false', 'candidate decision drag payload should preserve edited required flag');
mustAppearInOrder(pageContent, [
  'function normalizeInteractiveField',
  'sourceText: field.sourceText',
  'keyText: field.keyText',
  'valueText: field.valueText',
  'semanticRole: field.semanticRole',
  'pairing: field.pairing',
], 'interactive field parser should preserve key-value semantic metadata when reopening saved designs');
mustAppearInOrder(pageContent, [
  'const addFieldCandidateToCanvas =',
  'sourceText: candidate?.sourceText',
  'keyText: candidate?.keyText',
  'valueText: candidate?.valueText',
  'semanticRole: candidate?.semanticRole',
  'pairing: candidate?.pairing',
], 'click and drag placement from parsed candidates should carry key-value semantic metadata into interactive fields');
mustAppearInOrder(pageContent, [
  'const analysisCandidateToFieldCandidate = (candidate: TemplateAnalysisCandidate): TemplateImportResponse[\'fieldCandidates\'][number] => ({',
  'sourceText: candidate.sourceText',
  'keyText: candidate.keyText',
  'valueText: candidate.valueText',
  'semanticRole: candidate.semanticRole',
  'pairing: candidate.pairing',
], 'analysis candidate conversion should preserve key-value semantic metadata');
mustAppearInOrder(pageContent, [
  'modelDesignJson: JSON.stringify(templateModelDesign, null, 2)',
  'canvasDesignJson: JSON.stringify(syncedCanvasDesign, null, 2)',
], 'design save payload should serialize model and canvas interactive fields without dropping semantic metadata');
mustInclude(pageContent, 'function syncTemplateCanvasFieldBindings', 'design save should normalize field bindings before persisting canvas JSON');
mustInclude(pageContent, 'const fieldBindings = interactiveFields.map((field) => {', 'field binding sync should derive bindings from current interactive fields');
mustInclude(pageContent, 'existingBindingsByFieldId.get(field.id)', 'field binding sync should preserve existing source metadata by field id');
mustInclude(pageContent, 'fieldCode: field.code', 'field binding sync should refresh binding field codes after field code edits');
mustInclude(pageContent, 'valuePath: field.dataBinding?.valuePath ?? `fields.${field.code}`', 'field binding sync should refresh value paths from field data binding');
mustInclude(pageContent, 'submissionPath: field.dataBinding?.submissionPath ?? `submission.fields.${field.code}`', 'field binding sync should refresh submission paths from field data binding');
mustInclude(pageContent, 'const syncedCanvasDesign = syncTemplateCanvasFieldBindings(templateCanvasDesign, templateModelDesign.fields);', 'design save should use synchronized canvas bindings');
mustInclude(pageContent, 'function resolveUniqueTemplateFieldCode', 'candidate drag placement should resolve unique field codes before creating fillable controls');
mustInclude(pageContent, 'existingCodes.has(candidateCode)', 'candidate drag placement should detect duplicate candidate field codes');
mustInclude(pageContent, '`${candidateCode}_${suffix}`', 'duplicate candidate placements should get deterministic suffixed field codes');
mustInclude(pageContent, 'const sourceFields = templateModelDesign.fields.filter((field) => !replaceSameCandidate || field.sourceCandidateId !== candidate?.id)', 'candidate decision preview should exclude existing model fields from the same source candidate');
mustInclude(pageContent, 'const sourceInteractiveFields = interactiveFields.filter((field) => !replaceSameCandidate || field.sourceCandidateId !== candidate?.id)', 'candidate decision preview should exclude existing canvas fields from the same source candidate');
mustInclude(pageContent, 'const existingFieldCodes = new Set([...sourceFields, ...sourceInteractiveFields].map((field) => field.code));', 'candidate drag placement should compare against existing model and canvas field codes');
mustInclude(pageContent, 'const code = resolveUniqueTemplateFieldCode(baseCode, existingFieldCodes);', 'candidate drag placement should use the resolved unique field code');
mustInclude(pageContent, 'dataBinding: { valuePath: `fields.${code}`, submissionPath: `submission.fields.${code}` }', 'candidate drag placement should bind each duplicate placement to its unique field path');
mustNotInclude(pageContent, 'JSON.stringify(fieldPreviewValues', 'temporary fill preview values should not be serialized into template design');
mustNotInclude(pageContent, 'data-form-template-candidate-highlight', 'designer should not render candidate anchor highlights on the canvas');
mustNotInclude(pageContent, "border: '2px dashed #e6a23c'", 'designer should not render orange candidate highlight borders on the canvas');
mustNotInclude(pageContent, "bgcolor: 'rgba(230, 162, 60, 0.14)'", 'designer should not render orange candidate highlight backgrounds on the canvas');
mustInclude(pageContent, 'restoreTemplateDesignerSnapshot', 'failed imports should restore the previous visible designer state');
mustInclude(pageContent, 'templateImportSnapshotRef', 'file import should keep a pre-import snapshot for rollback');
mustInclude(pageContent, 'restoreTemplateDesignerSnapshot(importSequence)', 'file import error path should roll back only the active failed import');
mustInclude(pageContent, 'getFormTemplateAnalysisDraft(', 'designer should fetch persisted pending analysis drafts when reopening a version');
mustInclude(pageContent, 'restorePendingAnalysisDraft', 'designer should restore unconfirmed candidate drafts from persisted model metadata');
mustInclude(pageContent, 'analysisDraft: parsed.analysisDraft', 'model design parser should preserve pending analysis draft metadata for reopen recovery');
mustInclude(pageContent, 'analysis: parsed.analysis', 'model design parser should preserve confirmed analysis metadata when saving after reopen');
const confirmSuccessStart = pageContent.indexOf('const confirmCandidatesMutation = useMutation');
const confirmSuccessEnd = pageContent.indexOf('const onlyOfficeConfigMutation = useMutation', confirmSuccessStart);
if (confirmSuccessStart === -1 || confirmSuccessEnd === -1) {
  failures.push('missing candidate confirmation mutation section (candidate confirmation success should reload persisted design)');
} else {
  const confirmSuccessContent = pageContent.slice(confirmSuccessStart, confirmSuccessEnd);
  mustAppearInOrder(confirmSuccessContent, [
    'const version = response.data.data;',
    'setTemplateModelDesign(parseTemplateModelDesign(version));',
    'setTemplateCanvasDesign(parseTemplateCanvasDesign(version));',
    'setFieldPreviewValues({});',
    'setFieldCandidates([]);',
    'setAnalysisDraft(null);',
  ], 'candidate confirmation success should reload persisted design and clear temporary candidate/fill-preview state');
}
mustInclude(pageContent, 'data-form-template-onlyoffice-entry', 'designer should expose OnlyOffice source document entry');
mustInclude(pageContent, 'onlyOfficeConfigMutation', 'designer should request OnlyOffice config on demand');
mustInclude(pageContent, 'DocsAPI', 'designer should initialize OnlyOffice DocsAPI editor');
mustInclude(pageContent, 'DocEditor', 'designer should create a OnlyOffice DocEditor instance');
mustInclude(pageContent, 'const onlyOfficeDialogSx = {', 'OnlyOffice dialog should define an explicit stacking layer above the fullscreen designer');
mustInclude(pageContent, 'theme.zIndex.modal + 20', 'OnlyOffice dialog z-index should exceed the fullscreen designer z-index');
mustInclude(pageContent, 'sx={onlyOfficeDialogSx}', 'OnlyOffice dialog should apply the higher stacking layer');
mustInclude(pageContent, 'data-form-template-onlyoffice-frame', 'designer should expose OnlyOffice preview frame');
mustInclude(pageContent, 'data-form-template-onlyoffice-reparse', 'OnlyOffice dialog should expose a sync-to-canvas reparse action');
mustInclude(pageContent, 'reparseSourceMutation', 'designer should reparse the current source after OnlyOffice edits');
mustInclude(pageContent, 'onlyOfficeEditorState', 'OnlyOffice dialog should track editor readiness and save state before syncing');
mustInclude(pageContent, "status: 'loading'", 'OnlyOffice editor state should start in loading before DocsAPI is ready');
mustInclude(pageContent, "status: 'ready'", 'OnlyOffice editor state should mark the editor ready after DocsAPI app readiness');
mustInclude(pageContent, "status: 'dirty'", 'OnlyOffice editor state should mark unsaved document edits');
mustInclude(pageContent, "status: 'saved'", 'OnlyOffice editor state should mark callback-ready saved documents');
mustInclude(pageContent, 'events: {', 'OnlyOffice config should register editor lifecycle events');
mustInclude(pageContent, 'onAppReady', 'OnlyOffice config should mark the editor ready when DocsAPI reports app readiness');
mustInclude(pageContent, 'onDocumentStateChange', 'OnlyOffice config should distinguish unsaved and saved document state');
mustInclude(pageContent, "const canSyncOnlyOfficeToCanvas = ['ready', 'saved'].includes(onlyOfficeEditorState.status);", 'sync-to-canvas should allow ready view-only or unchanged source documents as well as saved edited documents');
mustInclude(pageContent, "onlyOfficeEditorState.status === 'dirty'", 'sync-to-canvas should still block unsaved OnlyOffice edits before reparsing');
mustInclude(pageContent, "请先在 OnlyOffice 中保存源文档", 'sync-to-canvas should explain when unsaved edits block reparsing');
mustInclude(pageContent, "请等待 OnlyOffice 编辑器加载完成", 'sync-to-canvas should explain when the editor is not ready for reparsing');
mustInclude(pageContent, 'return reparseFormTemplateSourceFile(designerRecord.id, versionId);', 'source reparse should target the resolved designer version');
mustInclude(pageContent, 'applyTemplateImportResult(response.data.data);', 'source reparse should reuse the same import-result state application path');
mustInclude(pageContent, '源文档已重新解析并同步到画布', 'source reparse should report successful sync to canvas');
mustInclude(pageContent, 'pageId: pageItem.id', 'new fillable fields should be anchored to the target canvas page');
mustInclude(pageContent, 'fetchAuthenticatedTemplateFileBlob', 'fullscreen designer should load private template backgrounds with authenticated blob requests');
mustInclude(pageContent, 'backgroundObjectUrls', 'fullscreen designer should render authenticated object URLs for imported backgrounds');
mustInclude(pageContent, 'function resolveCanvasBackgroundSrc', 'fullscreen designer should resolve background image sources consistently');
mustInclude(pageContent, 'const fallbackUrl = page.background?.url', 'background rendering should support backend supplied URL when no private file id exists');
mustInclude(pageContent, 'return objectUrl || fallbackUrl', 'background rendering should prefer authenticated object URLs and fall back to direct URLs');
mustInclude(pageContent, 'backgroundSrc = resolveCanvasBackgroundSrc(canvasPage, backgroundObjectUrls)', 'page thumbnails and canvas pages should share background source resolution');
mustInclude(pageContent, 'background: pageItem.background', 'analysis draft fallback should preserve page background metadata');
mustInclude(pageContent, 'layerSummary: pageItem.layerSummary', 'analysis draft fallback should preserve page layer summary metadata');
mustInclude(pageContent, 'templateImportRevision', 'file re-import should force the canvas and private background object URLs to refresh');
mustInclude(pageContent, 'setTemplateImportRevision((current) => current + 1)', 'file re-import should bump a render revision after parsing a new source file');
mustInclude(pageContent, 'key={`${canvasRenderKey}-${canvasPage.id}`}', 'file re-import should remount canvas pages when the parsed source changes');
mustInclude(pageContent, 'const clearTemplateDesignerCanvas = () => {', 'file import should clear the visible designer canvas before parsing a new source file');
mustInclude(pageContent, 'setFieldCandidates([])', 'file import clearing should remove stale field candidates before the new import response arrives');
mustInclude(pageContent, 'setTemplateModelDesign(emptyTemplateModelDesign())', 'file import clearing should remove stale model fields before the new import response arrives');
mustInclude(pageContent, 'setTemplateCanvasDesign(emptyTemplateCanvasDesign())', 'file import clearing should remove stale canvas pages and layers before the new import response arrives');
mustInclude(pageContent, 'setActiveCanvasPageId(null)', 'file import clearing should reset the active canvas page before the new import response arrives');
mustInclude(pageContent, 'setBackgroundObjectUrls((current) => {', 'file import clearing should remove stale background object URLs before the new import response arrives');
mustInclude(pageContent, 'const templateImportSequenceRef = useRef(0)', 'file import should track the latest import request');
mustInclude(pageContent, 'const beginTemplateSourceImport = () => {', 'file import should centralize clear-before-import behavior');
mustInclude(pageContent, 'templateImportSequenceRef.current += 1', 'every file import should advance the latest import sequence before upload');
mustInclude(pageContent, 'onMutate: beginTemplateSourceImport', 'every file import path should clear the canvas before starting the upload');
mustAppearInOrder(pageContent, [
  'onMutate: beginTemplateSourceImport',
  'const versionId = getDesignerVersionId(designerRecord);',
  'return importFormTemplateSourceFile(designerRecord.id, versionId, file);',
], 'source import should clear first and target the resolved designer version');
mustInclude(pageContent, 'if (importSequence !== templateImportSequenceRef.current) return;', 'stale import responses should not repaint an older canvas after a new import starts');
mustAppearInOrder(pageContent, [
  'const applyTemplateImportResult = (result: TemplateImportResponse) => {',
  'setFieldCandidates(result.fieldCandidates);',
  'setTemplateModelDesign(nextModelDesign);',
  'setTemplateCanvasDesign(nextCanvasDesign);',
  'setActiveCanvasPageId(nextCanvasDesign.pages[0]?.id ?? null);',
  'setDesignerRecord((current) => current ? { ...current, currentVersionId: result.version.id, currentVersion: result.version } : current);',
], 'shared import-result handler should repaint designer state from returned artifacts');
mustAppearInOrder(pageContent, [
  'const result = response.data.data;',
  'applyTemplateImportResult(result);',
], 'successful file import should use the shared import-result handler');
mustAppearInOrder(pageContent, [
  'const reparseSourceMutation = useMutation({\n    onMutate: beginTemplateSourceImport',
  'return reparseFormTemplateSourceFile(designerRecord.id, versionId);',
  'applyTemplateImportResult(response.data.data);',
  "restoreTemplateDesignerSnapshot(importSequence);\n      setSnackbar({ open: true, message: error instanceof Error ? error.message : '重新解析失败'",
], 'OnlyOffice source reparse should clear, repaint, and roll back through the import lifecycle');
mustInclude(pageContent, "type SnackbarSeverity = 'success' | 'error' | 'info'", 'file import should be able to show a neutral in-progress snackbar');
mustInclude(pageContent, 'const templateSourceFileInputRef = useRef<HTMLInputElement | null>(null)', 'file import should use an explicit input ref instead of relying on label wrapping');
mustInclude(pageContent, 'const openTemplateSourceFilePicker = () => {', 'file import button should explicitly open the native file picker');
mustInclude(pageContent, 'templateSourceFileInputRef.current?.click();', 'file import button should trigger the hidden input through the explicit ref');
mustNotInclude(pageContent, '<Button component="label"', 'file import button should not rely on label-wrapped hidden input clicks');
mustInclude(pageContent, 'const formatTemplateImportSuccessMessage = (result: TemplateImportResponse) => {', 'successful file import should report how much content was imported');
mustInclude(pageContent, "正在导入并解析", 'selected files should show immediate in-progress feedback before the request finishes');
mustInclude(pageContent, "'源文件已导入：'", 'successful file import should include a concrete imported-content summary');
mustInclude(pageContent, 'const handleTemplateSourceFileSelected = (file: File) => {\n    setSnackbar({ open: true, message: `正在导入并解析 ${file.name}，请稍候`, severity: \'info\' });\n    importMutation.mutate(file);\n  };', 'every selected import file should show immediate feedback before entering the import mutation');
mustInclude(pageContent, "event.target.value = ''", 'file import input should reset so the same file can be re-imported');
mustNotInclude(pageContent, 'hasExistingTemplateDesign', 'file import should not keep stale design while waiting for overwrite confirmation');
mustNotInclude(pageContent, 'pendingImportFile', 'file import should not defer clearing through a pending overwrite state');
mustNotInclude(pageContent, 'data-form-template-import-overwrite-dialog', 'file import should no longer show a secondary overwrite confirmation');
mustNotInclude(pageContent, '继续导入', 'file import should not require a second continue action before clearing canvas');
mustInclude(pageContent, 'function resolveDesignerVersion', 'designer should resolve a concrete designable version from row state');
mustInclude(pageContent, 'function getDesignerVersionId', 'designer import and save should share robust version id resolution');
mustOccurAtLeast(pageContent, 'getDesignerVersionId(designerRecord)', 2, 'designer import and save should not rely on only currentVersionId/currentVersion direct reads');
mustInclude(pageContent, 'row.versions?.find((candidate) => String(candidate.id) === String(row.currentVersionId))', 'designer opening should fall back to the matching version row when currentVersion is absent');
mustInclude(pageContent, 'row.versions?.length === 1 ? row.versions[0] : null', 'designer opening should use the only version row as a safe fallback');
mustInclude(pageContent, 'parseTemplateCanvasDesign', 'fullscreen designer should parse persisted canvas schema');
mustInclude(pageContent, 'templateCanvasDesign', 'fullscreen designer should keep canvas design state');
mustInclude(pageContent, 'interactiveFields', 'fullscreen designer should reserve interactive fields for later drag/drop and filling');
mustInclude(pageContent, 'JSON.stringify(syncedCanvasDesign', 'saving form template design should preserve imported canvas schema');
mustNotInclude(pageContent, "canvasDesignJson: JSON.stringify({ layers: [], strategy: '图层锚定+格式复刻' }, null, 2)", 'saving form template design should not reset the imported canvas schema');
mustInclude(pageContent, 'data-form-template-tool-rail', 'fullscreen designer should expose a standard left tool rail');
mustInclude(pageContent, 'width: 50, minWidth: 50', 'left tool rail should use the requested 50px width');
mustInclude(pageContent, 'width: 50, height: 50', 'left tool rail buttons should use the requested 50px height');
mustInclude(pageContent, '返回列表页', 'fullscreen designer should expose back-to-list action');
mustInclude(pageContent, '<ArrowBackIosNewRounded fontSize="small" />', 'back-to-list action should include a left back icon');
mustInclude(pageContent, 'data-form-template-top-toolbar', 'fullscreen designer top toolbar should expose a stable marker');
mustInclude(pageContent, 'data-form-template-top-toolbar direction="row" alignItems="center" sx={{ height: 50, minHeight: 50', 'fullscreen designer top toolbar should use the requested 50px height');
mustInclude(pageContent, '自动保存', 'fullscreen designer should expose auto-save status text');
mustOccurAtLeast(pageContent, '13:00:37 已触发自动保存', 1, 'fullscreen designer should show auto-save status in the metadata bar');
mustInclude(pageContent, 'data-form-template-title-divider', 'fullscreen designer top toolbar should separate the title from the back action');
mustInclude(pageContent, 'data-form-template-toolbar-title', 'fullscreen designer top toolbar should expose the template name and version');
mustInclude(pageContent, "{designerRecord.name || '-'}：{designerRecord.currentVersion?.version || '-'}", 'fullscreen designer top toolbar should display template name and version');
mustNotInclude(pageContent, '此处为表单模板的名称', 'fullscreen designer metadata bar should not expose placeholder text');
mustInclude(pageContent, 'data-form-template-metadata-bar', 'fullscreen designer metadata bar should expose a stable marker');
mustInclude(pageContent, 'data-form-template-metadata-bar sx={{ height: 40, minHeight: 40', 'fullscreen designer metadata bar should use the requested 40px height');
mustNotInclude(pageContent, "{designerRecord.name || '-'} · {designerRecord.code || '-'} · {designerRecord.currentVersion?.version || '-'}", 'fullscreen designer metadata bar should not repeat template summary text');
mustInclude(pageContent, 'data-form-template-file-import-actions', 'fullscreen designer top toolbar should keep file import as a top action');
mustInclude(pageContent, 'data-form-template-file-import-actions direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0, justifyContent: \'flex-end\', overflow: \'hidden\' }}', 'fullscreen designer file import action should align right');
mustInclude(pageContent, 'data-form-template-file-import-divider', 'fullscreen designer file import action should have a left divider');
mustInclude(pageContent, 'data-form-template-file-import-end-divider', 'fullscreen designer file import action should have a right divider');
mustAppearInOrder(pageContent, [
  'data-form-template-toolbar-title',
  'data-form-template-file-import-divider',
  '文件导入',
  'data-form-template-file-import-end-divider',
], 'file import dividers should wrap the file import action');
mustInclude(pageContent, 'data-form-template-toolbar-controls', 'fullscreen designer metadata bar should expose moved format controls');
mustAppearInOrder(pageContent, [
  'data-form-template-file-import-actions',
  'data-form-template-metadata-bar',
  'data-form-template-toolbar-controls',
], 'format controls should move below the top file import action into the 40px metadata bar');
mustInclude(pageContent, 'data-form-template-toolbar-controls direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0, justifyContent: \'flex-start\', overflow: \'hidden\' }}', 'moved format controls should be left-aligned inside the metadata bar');
mustNotInclude(pageContent, 'data-form-template-toolbar-controls direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0, justifyContent: \'center\', overflow: \'hidden\' }}', 'moved format controls should not remain centered inside the metadata bar');
mustInclude(pageContent, 'data-form-template-toolbar-divider', 'toolbar controls should expose a right-side divider');
mustInclude(pageContent, 'data-form-template-collaborator-avatars', 'designer should expose a collaborator avatar group');
mustInclude(pageContent, "ml: index === 0 ? 0 : -1.75", 'collaborator avatars should overlap to show multi-user collaboration');
mustInclude(pageContent, 'data-form-template-collaborator-divider', 'designer collaborator add action should have a left divider');
mustAppearInOrder(pageContent, [
  'data-form-template-collaborator-avatars',
  'data-form-template-collaborator-divider',
  'aria-label="添加协作者"',
], 'collaborator divider should sit between avatars and add collaborator action');
mustNotInclude(pageContent, '<Tab label="模型设计" />', 'fullscreen designer top toolbar should not expose the model design tab');
mustNotInclude(pageContent, '<Tab label="画布设计" value={1} />', 'fullscreen designer top toolbar should not expose the canvas design tab');
mustNotInclude(pageContent, '<Tab label="流程设计" value={2} />', 'fullscreen designer top toolbar should not expose the workflow design tab');
mustNotInclude(pageContent, "width: 1, height: 20, bgcolor: '#e4e7ed', mx: 0.5", 'fullscreen designer top toolbar should not expose the gray divider after design tabs');
mustNotInclude(pageContent, 'open={designerRecord !== null}\n        onClose={() => setDesignerRecord(null)}\n        sx={appContentDrawerSx}', 'designer should no longer be implemented as an app content drawer');
mustInclude(pageContent, 'accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"', 'designer should support PDF Word Excel and image import');
mustNotInclude(pageContent, '.ppt,.pptx', 'designer import selector should not expose PPT files');
mustNotInclude(pageContent, '字段确认后会以可填报字段框叠加到原文件版式上', 'empty canvas should not render the initial anchored-layer instructional placeholder');
mustNotInclude(pageContent, '原文件版式画布', 'empty canvas should not render the initial source-layout placeholder box');
mustNotInclude(pageContent, 'data-form-template-candidate-confirmation-panel', 'fullscreen designer should not expose the removed candidate confirmation panel');
mustInclude(pageContent, '图层锚定', 'canvas design should reference anchored layout restoration');
mustInclude(pageContent, 'data-template-category-panel', 'template pages should render a left category panel');
mustInclude(pageContent, 'TEMPLATE_CATEGORY_ALL', 'template category panel should expose all bucket');
mustInclude(pageContent, 'TEMPLATE_CATEGORY_UNCATEGORIZED', 'template category panel should expose uncategorized bucket');
mustInclude(pageContent, 'templateCategoryOptions = useMemo', 'template category panel should mirror operation category option construction');
mustInclude(pageContent, 'selectTemplateCategory', 'template category selection should mirror operation category selection');
mustInclude(pageContent, 'openCreateTemplateCategoryDialog', 'template category create action should mirror operation category create action');
mustInclude(pageContent, 'openEditTemplateCategoryDialog', 'template category edit action should mirror operation category edit action');
mustInclude(pageContent, 'requestDeleteTemplateCategory', 'template category delete action should mirror operation category delete action');
mustInclude(pageContent, 'handleTemplateCategoryDragStart', 'template category drag start should mirror operation category drag start');
mustInclude(pageContent, 'handleTemplateCategoryDrop', 'template category drop should mirror operation category drop');
mustInclude(pageContent, 'renderTemplateCategoryPanel', 'template category panel should be a copied operation category panel variant');
mustInclude(pageContent, 'role="button"', 'template category rows should match operation category accessibility');
mustInclude(pageContent, 'tabIndex={0}', 'template category rows should be keyboard focusable');
mustInclude(pageContent, "if (event.key === 'Enter' || event.key === ' ') selectTemplateCategory", 'template category rows should support keyboard selection');
mustInclude(pageContent, "gridTemplateColumns: category.system ? 'minmax(0, 1fr) auto' : '24px minmax(0, 1fr) auto auto auto'", 'template category rows should copy operation category grid structure');
mustInclude(pageContent, "cursor: category.system ? 'pointer' : 'grab'", 'template category cursor should copy operation category behavior');
mustInclude(pageContent, 'Tooltip title="新增分类" arrow', 'template category create button should copy operation category icon tooltip');
mustInclude(pageContent, 'IconButton size="small" color="primary" aria-label="新增分类"', 'template category create action should use icon button, not a text button');
mustInclude(pageContent, 'data-template-category-drag-handle', 'template category rows should expose drag handles');
mustInclude(pageContent, 'draggable={!category.system}', 'system template categories should not be draggable');
mustInclude(pageContent, '新增分类', 'template category panel should expose create action');
mustInclude(pageContent, '字段设置', 'template table should keep reusable field settings');
mustInclude(pageContent, 'TEMPLATE_COLUMN_WIDTH_STORAGE_PREFIX', 'template table should persist column widths by current user');
mustInclude(pageContent, 'TEMPLATE_COLUMN_SETTINGS_STORAGE_PREFIX', 'template table should persist field settings by current user');
mustInclude(pageContent, 'TEMPLATE_VERSION_COLUMN_WIDTH_STORAGE_PREFIX', 'template version table should persist column widths by current user');
mustInclude(pageContent, 'TEMPLATE_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX', 'template version table should persist field settings by current user');
mustInclude(pageContent, 'expandedTemplateGroups', 'template right panel should support grouped row expansion like process routes');
mustInclude(pageContent, 'expandAllTemplateGroups', 'template right panel should expose expand all action');
mustInclude(pageContent, 'collapseAllTemplateGroups', 'template right panel should expose collapse all action');
mustInclude(pageContent, 'templateVersionColumns', 'template right panel should expose a version child table');
mustInclude(pageContent, 'renderTemplateRightPanel', 'template right panel should be isolated like process route right panel');
mustInclude(pageContent, 'renderTemplateTableRow', 'template main rows should render through a route-style row renderer');
mustInclude(pageContent, 'renderTemplateVersionTable', 'template expanded rows should render a version child table');
mustInclude(pageContent, 'renderTemplateGroupCell', 'template main grouped cells should render route-style values');
mustInclude(pageContent, 'drawerVersionRow', 'template version rows should open version-level detail state');
mustInclude(pageContent, 'openTemplateVersionDrawer', 'template version child rows should open version-level drawer');
mustInclude(pageContent, 'row.versions', 'template version child table should prefer complete version list');
mustInclude(pageContent, 'creatingVersionFrom', 'template main rows should support create child version mode');
mustInclude(pageContent, 'openCreateTemplateVersionDialog', 'template main rows should expose create child version action');
mustInclude(pageContent, 'aria-label="新增子版本"', 'template main row action should include create child version button');
mustInclude(pageContent, 'TEMPLATE_VERSION_FIELD_IDS', 'template child version creation should define a version-only payload whitelist');
mustInclude(pageContent, 'pickTemplatePayload(payload, TEMPLATE_VERSION_FIELD_IDS)', 'template child version creation should not submit main template fields');
mustInclude(pageContent, '新增子版本', 'template child version dialog should use requested title');
mustInclude(pageContent, 'canDeleteTemplateFromMainRow(row)', 'template main row delete should depend on version count');
mustInclude(pageContent, 'getTemplateVersionRows(row).length <= 1', 'template main row delete should only show when one version exists');
mustInclude(pageContent, 'renderTemplateVersionActions(row, versionRow, versions.length > 1)', 'template version row delete should only show when multiple versions exist');
mustInclude(pageContent, 'setDeleteVersionTarget({ row, version })', 'template version row delete action should target a child version');
mustNotInclude(pageContent, 'openDesigner(row)}><DesignServices', 'template main rows should not render designer action');
mustInclude(pageContent, 'color="error" aria-label="删除"', 'template delete icon button should be red');
mustInclude(pageContent, 'data-template-column-settings-trigger', 'template table should expose standard icon field settings trigger');
mustInclude(pageContent, 'data-template-column-settings-panel', 'template table should expose standard field settings panel');
mustInclude(pageContent, 'data-template-column-settings-row', 'template field settings should expose draggable rows');
mustInclude(pageContent, '<Tab label="主表" value="main" />', 'template field settings should expose main table tab');
mustInclude(pageContent, '<Tab label="子表" value="version" />', 'template field settings should expose version child table tab');
mustInclude(pageContent, 'Tooltip title="全部展开" arrow', 'template right toolbar should expose expand-all icon action');
mustInclude(pageContent, 'Tooltip title="全部收起" arrow', 'template right toolbar should expose collapse-all icon action');
mustInclude(pageContent, 'UnfoldMoreRounded', 'template right toolbar should use standard expand-all icon');
mustInclude(pageContent, 'UnfoldLessRounded', 'template right toolbar should use standard collapse-all icon');
mustInclude(pageContent, '<ExpandLess fontSize="small" />', 'template main first cell should show collapse icon');
mustInclude(pageContent, '<ExpandMoreIcon fontSize="small" />', 'template main first cell should show expand icon');
mustInclude(pageContent, 'data-template-column-resizer', 'template table columns should expose drag width handles');
mustInclude(pageContent, 'data-template-version-column-resizer', 'template version columns should expose drag width handles');
mustInclude(pageContent, 'aria-label="表单模板版本列表"', 'template expanded child table should be labelled');
mustInclude(pageContent, '<colgroup>', 'template table should use fixed colgroup widths');
mustInclude(pageContent, "tableLayout: 'fixed'", 'template table should use fixed table layout');
mustInclude(pageContent, "height: isTableEmptyState ? '100%' : 'auto'", 'template empty/loading/error states should fill table container');
mustInclude(pageContent, 'mainTableColSpan', 'template empty state colSpan should follow visible columns and sticky action spacer');
mustInclude(pageContent, '<Pagination page={page}', 'template pagination should use standard pagination component');
mustInclude(pageContent, 'PAGE_SIZE_OPTIONS.map', 'template pagination should use standard page size options');
mustInclude(pageContent, '<Tab label="数据信息" />', 'template detail drawer should expose data tab');
mustInclude(pageContent, '<Tab label="数据审计" />', 'template detail drawer should expose audit tab');
mustInclude(pageContent, 'formatAuditValue', 'template audit values should be formatted');
mustInclude(pageContent, 'appContentDrawerSx', 'template drawers should align with app content z-index standard');
mustInclude(pageContent, 'slotProps={{ backdrop: { sx: appContentDrawerSx } }}', 'template drawer backdrop should use app content z-index');
mustInclude(pageContent, 'appContentDrawerPaperSx', 'template drawer paper should use app content z-index');
mustInclude(pageContent, "anchorOrigin={{ vertical: 'top', horizontal: 'right' }}", 'template feedback snackbar should stay at top right');
mustInclude(pageContent, 'function DetailSection', 'template detail drawer should copy material drawer section style');
mustInclude(pageContent, 'function DetailField', 'template detail drawer should copy material drawer field style');
mustInclude(pageContent, 'function AuditFieldBlock', 'template audit drawer should copy material audit field block style');
mustInclude(pageContent, '信息查看', 'template detail drawer should use material drawer title');
mustInclude(pageContent, '基本信息', 'template drawer data tab should use material drawer base section');
mustInclude(pageContent, '系统信息', 'template drawer data tab should use material drawer system section');
mustInclude(pageContent, '审计记录', 'template drawer audit tab should use material drawer audit section');
mustInclude(pageContent, "bgcolor: '#f7f9fc'", 'template drawer should use material drawer background');
mustInclude(pageContent, "currentVersion: '当前版本'", 'template audit fields should translate current version');
mustInclude(pageContent, "effectiveFrom: '生效时间'", 'template audit fields should translate effective start time');
mustInclude(pageContent, "effectiveTo: '失效时间'", 'template audit fields should translate effective end time');

mustInclude(controllerContent, '@RequestMapping("/api/v1/master-data/template-modeling")', 'backend should expose template modeling base route');
mustInclude(controllerContent, '@GetMapping("/form-templates")', 'backend should expose form template list');
mustInclude(controllerContent, 'loadTemplateVersions', 'backend form template list should load complete version list');
mustInclude(controllerContent, 'List<TemplateVersionResponse> versions', 'backend form template response should expose version rows');
mustInclude(controllerContent, '@PostMapping("/form-templates")', 'backend should expose form template create');
mustInclude(controllerContent, '@PostMapping("/form-templates/{id}/versions")', 'backend should expose form template version create');
mustInclude(controllerContent, 'formTemplateVersionRepository.deleteAll(versions)', 'backend should delete form template versions before deleting template');
mustInclude(controllerContent, 'formTemplateRepository.delete(existing)', 'backend should delete the loaded form template after child versions');
mustInclude(controllerContent, '@GetMapping("/form-templates/{id}/versions/{versionId}")', 'backend should expose form template version detail');
mustInclude(controllerContent, '@PutMapping("/form-templates/{id}/versions/{versionId}/design")', 'backend should expose form template design save');
mustInclude(controllerContent, '@PostMapping("/form-templates/{id}/versions/{versionId}/import")', 'backend should expose form template source import');
mustInclude(controllerContent, '@PostMapping("/form-templates/{id}/versions/{versionId}/source/reparse")', 'backend should expose current source reparse endpoint for OnlyOffice sync');
mustInclude(controllerContent, 'createSourceRevision(id, versionId, sourceFile.getId(), "REPARSE")', 'backend source reparse should create a source revision for traceability');
mustInclude(controllerContent, 'analysisDraft.put("revision", revision.getRevisionNo())', 'backend source reparse should stamp the new revision on the analysis draft');
mustInclude(controllerContent, 'result.put("background", new LinkedHashMap<>(mapValue(backgroundMap)))', 'backend analysis pages should preserve restored background metadata');
mustInclude(controllerContent, 'result.put("layerSummary", analysisLayerSummary(sourcePage.get("layers")))', 'backend analysis pages should summarize restored source layers');
mustInclude(controllerContent, 'parseOfficeTemplateWithOnlyOfficeBackground', 'backend should render Office source documents through OnlyOffice before restoring canvas backgrounds');
mustInclude(controllerContent, 'storeTemplateConvertedPdf', 'backend should persist converted Office PDFs for traceable high-fidelity rendering');
mustInclude(controllerContent, 'parsePdfTemplateFromPdfFile(sourceFile, convertedPdfFile, sourceFileType, createdFiles)', 'backend should render converted PDFs while preserving the original Office source metadata');
mustInclude(controllerContent, 'version.setImportStatus("已重新解析")', 'backend source reparse should mark the version as reparsed');
mustInclude(controllerContent, 'writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "重新解析表单源文件"', 'backend source reparse should audit sync-to-canvas actions');
mustInclude(controllerContent, '/analysis/{analysisId}/decisions', 'backend should expose candidate confirmation endpoint');
mustInclude(controllerContent, 'buildCandidateDecisionLedger', 'backend should persist a replayable candidate decision ledger');
mustInclude(controllerContent, 'ledger.put("schemaVersion", "1.0")', 'candidate decision ledger should be versioned for future migrations');
mustInclude(controllerContent, 'ledger.put("source", jsonNodeToMap(source))', 'candidate decision ledger should preserve source document metadata');
mustInclude(controllerContent, 'copyCandidateLedgerValue(candidate, item, "sourceText")', 'candidate decision ledger should preserve parsed source text');
mustInclude(controllerContent, 'copyCandidateLedgerValue(candidate, item, "keyText")', 'candidate decision ledger should preserve parsed key text');
mustInclude(controllerContent, 'copyCandidateLedgerValue(candidate, item, "semanticRole")', 'candidate decision ledger should preserve component versus static-text semantics');
mustInclude(controllerContent, 'copyCandidateLedgerValue(candidate, item, "pairing")', 'candidate decision ledger should preserve key-value pairing metadata');
mustInclude(controllerContent, 'copyCandidateLedgerValue(candidate, item, "valueAnchor")', 'candidate decision ledger should preserve placement anchors for replay');
mustInclude(controllerContent, 'validateAnalysisSourceFileIsCurrent', 'backend should reject stale analysis drafts after source document revisions change');
mustInclude(controllerContent, '解析草稿源文件已过期，请重新解析后再确认', 'stale analysis drafts should ask users to reparse the current source before confirmation');
mustInclude(controllerContent, 'CANDIDATE_FIELD_CODE_PATTERN', 'backend should validate candidate field codes before generating binding paths');
mustInclude(controllerContent, '解析候选字段编码格式无效', 'backend should reject candidate field codes that are unsafe for fill binding paths');
mustInclude(controllerContent, 'isStaticTextCandidate', 'backend should classify parsed text candidates before user confirmation');
mustInclude(controllerContent, 'isInstructionText', 'backend should classify explanatory paragraphs as static text candidates');
mustInclude(controllerContent, '说明性文本，建议保留为静态文字', 'backend should explain why instruction paragraphs remain static text');
mustInclude(controllerContent, 'ExcelFieldSeedSource', 'backend should build Excel cell layers before deriving candidate anchors');
mustInclude(controllerContent, 'EXCEL_ROWS_PER_CANVAS_PAGE', 'backend Excel import should paginate long sheets instead of truncating at the first screenful');
mustNotInclude(controllerContent, 'Math.min(sheet.getLastRowNum(), firstRow + 29)', 'backend Excel import should not cap the source sheet at 30 total rows');
mustNotInclude(controllerContent, 'labels.size() >= 30 && layers.size() >= 80', 'backend Excel import should not stop reading source rows after the first page');
mustInclude(controllerContent, 'lockImportedSourceLayer', 'backend Excel import should mark source document layers as non-interactive');
mustInclude(controllerContent, 'layer.put("selectable", false);', 'backend Excel source layers should not be selectable or draggable on the canvas');
mustInclude(controllerContent, 'table.put("showGrid", false);', 'backend Excel table shell should let original cell borders drive the visual grid');
mustInclude(controllerContent, 'private record ExcelPageLayout', 'backend Excel import should compute cumulative per-page row layout');
mustInclude(controllerContent, 'excelRequiredCellHeight', 'backend Excel import should auto-fit wrapped text rows');
mustInclude(controllerContent, 'excelEstimatedWrappedLineCount', 'backend Excel import should estimate wrapped text line count from cell width');
mustInclude(controllerContent, 'double y = pageLayout.rowTop(row.getRowNum())', 'Excel cell layers should use cumulative row top positions');
mustInclude(controllerContent, 'double height = pageLayout.spanHeight(row.getRowNum(), rowSpan)', 'Excel cell layers should use cumulative row heights');
mustInclude(controllerContent, 'layer.put("y", anchor == null ? 48 : pageLayout.rowTop(anchor.getRow1()))', 'Excel image layers should follow cumulative row top positions');
mustNotInclude(controllerContent, 'row.getRowNum() - pageStartRow) * 32.0', 'Excel cell layers should not use fixed 32px row spacing');
mustNotInclude(controllerContent, 'anchor.getRow1() - pageStartRow) * 32.0', 'Excel image layers should not use fixed 32px row spacing');
mustInclude(controllerContent, 'excelLastAnchoredImageRow', 'backend Excel pagination should include embedded images anchored below text rows');
mustInclude(controllerContent, 'page.put("orientation", pageOrientation)', 'backend should preserve Excel print orientation without stretching content bounds');
mustNotInclude(controllerContent, 'height = roundCanvasNumber(width * fallback.height() / Math.max(1, fallback.width()))', 'backend should not stretch portrait Excel canvases to paper aspect ratio');
mustInclude(controllerContent, 'right-blank-cell', 'backend should anchor Excel key-value candidates to adjacent blank value cells');
mustInclude(controllerContent, 'valueSourceRef', 'backend should preserve the source reference for Excel value cells');
mustInclude(controllerContent, 'Set.of("TextInput", "NumberInput", "DateTimePicker", "SignaturePad", "TextArea")', 'backend should accept confirmed signature pad and text area candidate components');
mustInclude(controllerContent, 'if ("signature".equals(type)) return "SignaturePad";', 'backend should suggest signature pad for signature field types');
mustInclude(controllerContent, 'if ("textarea".equals(type)) return "TextArea";', 'backend should suggest text area for long-text field types');
mustInclude(controllerContent, 'label.contains("签名") || label.contains("签字")', 'backend should infer signature fields from parsed labels');
mustInclude(controllerContent, 'isLongTextFieldLabel(label)', 'backend should infer long-text fields from parsed labels');
mustInclude(controllerContent, 'if ("SignaturePad".equals(component)) return "signature";', 'backend should persist signature pad decisions as signature field type');
mustInclude(controllerContent, 'if ("TextArea".equals(component)) return "textarea";', 'backend should persist text area decisions as long-text field type');
mustInclude(controllerContent, '/onlyoffice/config', 'backend should expose OnlyOffice config endpoint');
mustInclude(controllerContent, '/onlyoffice/source', 'backend should expose signed OnlyOffice source file endpoint');
mustInclude(controllerContent, 'onlyOfficeSourceToken(id, versionId, version.getSourceFileId())', 'OnlyOffice config should use a signed source URL instead of the platform-authenticated file preview URL');
mustInclude(controllerContent, 'verifyOnlyOfficeSourceToken(token, id, versionId, version.getSourceFileId())', 'OnlyOffice source endpoint should validate its dedicated token before returning the file');
mustInclude(controllerContent, 'ONLYOFFICE_SOURCE_TOKEN_TTL_SECONDS', 'OnlyOffice signed source URLs should have a bounded lifetime');
mustInclude(controllerContent, '.withExpiresAt(Date.from(Instant.now().plusSeconds(ONLYOFFICE_SOURCE_TOKEN_TTL_SECONDS)))', 'OnlyOffice signed source tokens should expire automatically');
mustInclude(controllerContent, 'isOnlyOfficeSaveStatus(status)', 'OnlyOffice callback should accept numeric and string save statuses consistently');
mustInclude(controllerContent, 'return "2".equals(value) || "6".equals(value);', 'OnlyOffice callback save statuses should include status 2 and 6 after string normalization');
mustInclude(controllerContent, 'document.put("permissions", onlyOfficeDocumentPermissions(fileType))', 'OnlyOffice config should attach explicit document permissions');
mustInclude(controllerContent, 'permissions.put("edit", !"pdf".equalsIgnoreCase(fileType))', 'OnlyOffice permissions should keep PDF view-only while allowing editable office sources');
mustInclude(controllerContent, 'permissions.put("download", false)', 'OnlyOffice permissions should disable direct source document download');
mustInclude(controllerContent, 'permissions.put("print", false)', 'OnlyOffice permissions should disable direct source document printing');
mustInclude(controllerContent, '@RequestParam("file") MultipartFile file', 'backend import should receive a multipart source file');
mustInclude(controllerContent, 'storeTemplateSourceFile', 'backend import should store the uploaded source file');
mustInclude(controllerContent, 'parseTemplateImport', 'backend import should parse the uploaded source into design artifacts');
mustNotInclude(controllerContent, 'parsePowerPointTemplate', 'backend import should not require PPT parsing');
mustNotInclude(controllerContent, '"ppt", "pptx"', 'backend import should not allow PowerPoint extensions');
mustNotInclude(controllerContent, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'backend import should not allow PowerPoint MIME types');
mustInclude(controllerContent, 'interactiveFields', 'backend import should reserve interactive fields for drag/drop and fill workflows');
mustInclude(controllerContent, 'coordinateSystem', 'backend import should persist source coordinate metadata for future drag/drop editing');
mustInclude(controllerContent, 'fillRuntime', 'backend import should reserve customer fill runtime metadata');
mustInclude(controllerContent, 'result.putIfAbsent("fillRuntime", defaultFillRuntime())', 'candidate confirmation should preserve or add fill runtime metadata for future fill workflows');
mustInclude(controllerContent, 'isOnlyOfficeDownloadOriginAllowed', 'OnlyOffice callback download should support origin-level allowlist entries');
mustInclude(controllerContent, 'sameOrigin(editedUri, allowedOrigin)', 'OnlyOffice callback download should compare scheme, host, and effective port for origin allowlist entries');
mustInclude(controllerContent, 'effectivePort(first) == effectivePort(second)', 'OnlyOffice callback download origin checks should include effective port');
mustInclude(controllerContent, '仅支持 PDF、Word、Excel、图片', 'backend import should reject unsupported files with friendly copy');
mustNotInclude(controllerContent, '仅支持 PDF、Word、Excel、PPT、图片', 'backend import friendly copy should not mention PPT');
mustInclude(controllerContent, '@GetMapping("/batch-record-templates")', 'backend should expose batch record list');
mustInclude(controllerContent, '@PostMapping("/batch-record-templates")', 'backend should expose batch record create');
mustInclude(controllerContent, '@GetMapping("/{templateType}/categories")', 'backend should expose template categories');
mustInclude(controllerContent, '@PutMapping("/{templateType}/categories/order")', 'backend should expose category reorder');
mustInclude(controllerContent, 'writeChangedAudit', 'backend should write changed audits');
mustInclude(controllerContent, 'validateEffectiveDateRange', 'backend should validate effective date range');
mustInclude(controllerContent, '失效时间不能早于生效时间', 'backend should reject end time before start time');

mustInclude(changelogContent, '0033-template-modeling-management.sql', 'template modeling should have a migration');
mustInclude(templateMigrationContent, 'INSERT INTO role_permission (id, role_id, permission_id)', 'role permission migration must populate primary key id');
mustInclude(templateMigrationContent, "nextval('hibernate_sequence') AS id", 'role permission migration should generate ids from hibernate sequence');
mustInclude(templateAnalysisMigrationContent, 'form_template_analysis', 'template migration should persist analysis drafts');
mustInclude(dockerComposeContent, 'onlyoffice-document-server:', 'docker compose should provide an optional OnlyOffice document server service');
mustInclude(dockerComposeContent, 'onlyoffice/documentserver', 'docker compose should use the official OnlyOffice Document Server image');
mustInclude(dockerComposeContent, 'ONLYOFFICE_ENABLED: "true"', 'docker backend should enable OnlyOffice when the compose stack includes Document Server');
mustInclude(dockerComposeContent, 'ONLYOFFICE_DOCUMENT_SERVER_URL: http://localhost:8088', 'docker backend should expose the browser-facing OnlyOffice URL');
mustInclude(dockerComposeContent, 'ONLYOFFICE_DOWNLOAD_ALLOWED_HOSTS: localhost,127.0.0.1,onlyoffice-document-server', 'docker backend should allow callbacks to download only from the document server host set');
mustInclude(dockerComposeContent, 'onlyoffice-document-server:', 'backend should depend on OnlyOffice document server in the docker stack');

if (failures.length) {
  console.error(`Template modeling verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Template modeling verification passed.');
