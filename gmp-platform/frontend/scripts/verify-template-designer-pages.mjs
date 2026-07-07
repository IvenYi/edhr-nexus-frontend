import { existsSync, readFileSync } from 'node:fs';

const failures = [];

const files = [
  '../package.json',
  '../vite.config.ts',
  '../src/pages/master-data/TemplateDesignerDialog.tsx',
  '../src/pages/master-data/TemplateModelingPage.tsx',
  '../src/pages/master-data/template-designer/TemplateDesignerDialog.tsx',
  '../src/pages/master-data/template-designer/TemplateDesignerHostFrame.tsx',
  '../src/pages/master-data/template-designer/TemplateMockFillPage.tsx',
  '../src/pages/master-data/template-designer/TemplateDesignerPreloadFrame.tsx',
  '../src/pages/master-data/template-designer/templateDesignerBridge.ts',
  '../src/router/index.tsx',
  '../vendor/online-form-designer/README.md',
  '../vendor/online-form-designer/package.json',
  '../vendor/online-form-designer/vite.config.ts',
  '../vendor/online-form-designer/internal/vite-config/src/config/common.ts',
  '../vendor/online-form-designer/src/projects/online-form/index.html',
  '../vendor/online-form-designer/src/projects/online-form/HostedApp.vue',
  '../vendor/online-form-designer/src/projects/online-form/main.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/error-handle.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/init-app-config.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/platform.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/register-glob-comp.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/register-glob-layout.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/render-components.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/router-guard.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/online-form-router.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/nocode-base.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/nocode-web-render.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/http-axios.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/user-store.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/permission-store.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/use-router.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/widget-index.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/expression.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/runtime-web.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/setup-i18n.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/hosted-cell-widget-props.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/hosted-cell-widget-style.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/hosted-field-config.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/reverse-modeling.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/hosted-shims/use-print.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/router/index.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/integration/apaas_dp/designer/apaas-dp-print.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/toolbar.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/toolkit.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/designer-side-panel.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/hosted-properties-panel.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/base/padding-setting.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/panel/panel-paper.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/panel/panel-cell.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/page-thumbnails.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/modules/sheet.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/bridge/template-designer-host.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/bridge/template-designer-protocol.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/constants/index.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/hooks/local-designer-cache.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/hooks/useAllSpreadSheets.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/hooks/useSpreadSheet.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/styles/designer.less',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/styles/spread-sheet.less',
  '../vendor/online-form-designer/src/projects/online-form/src/router/routes/index.ts',
  '../vendor/online-form-designer/src/router/guard/permissionGuard.ts',
];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function mustMatch(content, pattern, reason) {
  if (!pattern.test(content)) failures.push(`missing pattern ${pattern} (${reason})`);
}

for (const relativePath of files) {
  const url = new URL(relativePath, import.meta.url);
  if (!existsSync(url)) {
    failures.push(`${relativePath}: missing file`);
    continue;
  }

  const content = readFileSync(url, 'utf8');

  if (relativePath === '../package.json') {
    mustInclude(content, 'designer:install', 'current project should own the vendor designer install command');
    mustInclude(content, 'designer:dev', 'current project should own the vendor designer dev command');
    mustInclude(content, 'designer:build', 'current project should own the vendor designer build command');
  }

  if (relativePath === '../vite.config.ts') {
    mustInclude(content, "'/template-designer-runtime'", 'current React dev server should proxy the embedded designer runtime path');
    mustInclude(content, 'TEMPLATE_DESIGNER_DEV_SERVER', 'designer dev proxy target should be configurable');
  }

  if (relativePath.endsWith('template-designer/TemplateDesignerDialog.tsx')) {
    mustInclude(content, 'TemplateDesignerHostFrame', 'dialog should mount the embedded Vue designer host');
    mustInclude(content, 'fullScreen', 'dialog should stay full screen');
    mustInclude(content, "width: '100vw'", 'dialog paper should occupy the full viewport width');
    mustInclude(content, "height: '100vh'", 'dialog paper should occupy the full viewport height');
    mustInclude(content, "overflow: 'hidden'", 'dialog content should not create a nested clipped loading viewport');
    mustNotInclude(content, 'TemplateDesignerCanvas', 'old React canvas implementation should no longer be the entry');
  }

  if (relativePath === '../src/pages/master-data/TemplateModelingPage.tsx') {
    mustInclude(content, 'TemplateDesignerPreloadFrame', 'template modeling page should preload the embedded designer shell before the user clicks Design');
    mustInclude(content, 'designerPreloadTarget', 'template modeling page should derive a stable designer preload target from the listed rows');
  }

  if (relativePath.endsWith('TemplateDesignerPreloadFrame.tsx')) {
    mustInclude(content, 'buildVueDesignerUrl', 'preload frame should reuse the same hosted designer URL resolver as the real designer');
    mustInclude(content, 'requestIdleCallback', 'preload frame should defer warmup until the page is idle');
    mustInclude(content, '<iframe', 'preload frame should warm the migrated Vue designer through a hidden iframe');
    mustInclude(content, '表单模板设计器预加载', 'preload frame should expose a stable non-user-facing iframe title for diagnostics');
  }

  if (relativePath.endsWith('TemplateDesignerHostFrame.tsx')) {
    mustInclude(content, '<iframe', 'host frame should embed the Vue designer');
    mustInclude(content, "flex: '1 1 auto'", 'host frame root and canvas slot should stretch inside the full-screen dialog');
    mustInclude(content, "minWidth: 0", 'host frame should allow the iframe area to fill the flex row without intrinsic shrinkage');
    mustInclude(content, '返回上一页', 'host header should own the back action instead of the embedded designer header');
    mustInclude(content, '建模设计', 'host header should expose the model design tab in the centered toolbar area');
    mustInclude(content, '表单设计', 'host header should expose the form design tab in the centered toolbar area');
    mustInclude(content, '流程设计', 'host header should expose the process design tab in the centered toolbar area');
    mustInclude(content, '模板导入', 'host header should expose the template import action beside save and close');
    mustInclude(content, '模拟填报', 'host header should expose the mock fill action beside save and close');
    mustInclude(content, "type: 'set-active-tab'", 'host header should notify the child designer when the active tab changes');
    mustInclude(content, "type: 'import-template'", 'host header should trigger the child template import flow');
    mustInclude(content, "type: 'simulate-fill-snapshot-request'", 'host header should request a current designer snapshot for React mock fill');
    mustInclude(content, "event.data.type === 'simulate-fill-snapshot'", 'host frame should receive the current designer snapshot without saving');
    mustInclude(content, 'saveTemplateMockFillSnapshot', 'host frame should store the mock fill snapshot for the new React page');
    mustInclude(content, 'buildTemplateMockFillUrl', 'host frame should open the new React mock fill route');
    mustInclude(content, "window.open(buildTemplateMockFillUrl", 'host frame should open mock fill in a separate React page');
    mustNotInclude(content, "type: 'simulate-fill' }", 'host frame should no longer trigger the legacy vendor mock fill flow');
    mustInclude(content, "width: '1px'", 'host header divider should stay as a real 1px separator instead of stretching across the title slot');
    mustInclude(content, "component=\"span\"", 'host header title should render as explicit inline text instead of relying on default paragraph output');
    mustInclude(content, 'const titleName = row.name?.trim() || \'未命名表单\'', 'host header should provide a stable title fallback');
    mustInclude(content, 'const titleVersion = version.version?.trim() || \'-\'', 'host header should provide a stable version fallback');
    mustInclude(content, '{titleName}', 'host header should render the current form name text');
    mustInclude(content, '{titleVersion}', 'host header should render the current form version text');
    mustInclude(content, "color: selected ? '#fff' : 'rgba(255,255,255,.68)'", 'host header center tabs should define the shared ready-state colors');
    mustInclude(content, "bgcolor: selected ? 'rgba(255,255,255,.12)' : 'transparent'", 'host header center tabs should define the shared ready-state backgrounds');
    mustInclude(content, "'&.Mui-disabled': {", 'host header should override MUI disabled fading during loading');
    mustInclude(content, "color: 'rgba(255,255,255,.82)'", 'host header import and simulate actions should keep their normal text color while disabled during loading');
    mustInclude(content, "'&.Mui-disabled': { bgcolor: '#444', color: '#fff' }", 'host header save button should keep the loaded appearance while disabled during loading');
    mustInclude(content, "postToChild(iframeRef.current, { type: 'save' })", 'host save button should trigger the embedded designer save action');
    mustInclude(content, '保存', 'host header should own the save action beside close');
    mustNotInclude(content, '数据模块 / 模板建模 / 表单模板 / {row.name} / {version.version}', 'host header should no longer render the breadcrumb path in the title slot');
    mustInclude(content, 'postMessage', 'host frame should talk to the child app through a bridge');
    mustInclude(content, 'save-request', 'host frame should receive child save requests');
    mustInclude(content, 'dirty-change', 'host frame should track dirty state');
    mustInclude(content, 'close-request', 'host frame should receive child close requests');
  }

  if (relativePath.endsWith('local-designer-cache.ts')) {
    mustInclude(content, 'normalizeDesignerJson', 'hosted local designer should sanitize cached or incoming designer json');
    mustInclude(content, 'normalizePaper', 'hosted local designer should always provide rows, cols, cells, and canvas lists');
    mustInclude(content, 'HOSTED_DEFAULT_COL_COUNT = 9', 'hosted local designer should initialize with exactly nine visible columns');
    mustInclude(content, 'HOSTED_DEFAULT_COL_WIDTH = 80', 'hosted local designer should make nine default columns fill the A4 sheet content width');
    mustInclude(content, 'Array(HOSTED_DEFAULT_COL_COUNT)', 'hosted local designer should build default columns from the hosted count');
  }

  if (relativePath.endsWith('templateDesignerBridge.ts')) {
    mustInclude(content, 'buildHostedDesignerSnapshot', 'bridge should build a deterministic hosted snapshot');
    mustInclude(content, 'buildVueDesignerUrl', 'bridge should resolve the child designer URL');
    mustInclude(content, "export type TemplateDesignerTabKey = 'model' | 'form' | 'process';", 'bridge should define the hosted designer tab contract shared with the child');
    mustInclude(content, 'TemplateDesignerHostEvent', 'bridge should define child-to-host events');
    mustInclude(content, "type: 'simulate-fill-snapshot-request'", 'bridge should define a snapshot request instead of legacy mock fill');
    mustInclude(content, "type: 'simulate-fill-snapshot'; snapshot: HostedDesignerSnapshot", 'bridge should define the child snapshot response');
    mustInclude(content, 'saveTemplateMockFillSnapshot', 'bridge should persist mock fill snapshots for new tabs');
    mustInclude(content, 'loadTemplateMockFillSnapshot', 'bridge should load mock fill snapshots in the React route');
    mustInclude(content, 'buildTemplateMockFillUrl', 'bridge should centralize the React mock fill route');
    mustInclude(content, "DEFAULT_VUE_DESIGNER_PATH = '/online-form/#/designer'", 'production host should default to the deployed current-project designer hash route');
    mustInclude(content, "DEFAULT_VUE_DESIGNER_DEV_PATH = '/template-designer-runtime/src/projects/online-form/index.html#/designer'", 'dev host should use the explicit online-form entry for the migrated designer');
    mustInclude(content, 'import.meta.env.DEV', 'dev host should switch away from the production path during local development');
    mustInclude(content, 'url.hash', 'host should put Vue route query in hash mode');
    mustNotInclude(content, 'localhost:5173', 'host should not default to the external paas-main-front dev server');
    mustNotInclude(content, 'paas-main-front', 'host bridge should not reference the external checkout');
  }

  if (relativePath.endsWith('TemplateMockFillPage.tsx')) {
    mustInclude(content, 'data-template-mock-fill-page', 'React mock fill page should expose a stable verification marker');
    mustInclude(content, 'loadTemplateMockFillSnapshot', 'React mock fill page should read the designer JSON snapshot');
    mustInclude(content, 'canvasDesignJson', 'React mock fill page should render from the designer canvas JSON first');
    mustInclude(content, 'modelDesignJson', 'React mock fill page should fall back to model design JSON');
    mustInclude(content, '模拟填报', 'React mock fill page should be labeled as the mock fill experience');
    mustInclude(content, 'data-template-mock-fill-input', 'React mock fill page should render fillable cells');
    mustNotInclude(content, '骋云 Paas 平台', 'React mock fill page should not carry the legacy Paas title');
    mustNotInclude(content, 'openMockReportUrl', 'React mock fill page should not reuse the legacy vendor render page');
  }

  if (relativePath === '../src/router/index.tsx') {
    mustInclude(content, 'TemplateMockFillPage', 'router should lazy-load the React mock fill page');
    mustInclude(content, 'path="/master-data/form-templates/mock-fill"', 'mock fill should be a top-level React route, not the vendor render route');
  }

  if (relativePath.endsWith('views/designer/constants/index.ts')) {
    mustInclude(content, 'DEFAULT_PAPER_COL_COUNT = 9', 'shared default paper should initialize with exactly nine visible columns');
    mustInclude(content, 'DEFAULT_PAPER_COL_WIDTH = 80', 'shared default paper should make nine default columns fill the A4 sheet content width');
    mustInclude(content, 'Array(DEFAULT_PAPER_COL_COUNT)', 'shared default paper should build default columns from the shared count');
    mustInclude(content, 'width: DEFAULT_PAPER_COL_WIDTH', 'shared default paper should use the wider default paper column width');
    mustInclude(content, 'Array(DEFAULT_PAPER_COL_COUNT)', 'shared default paper cells should align with the visible column count');
  }

  if (relativePath.endsWith('views/designer/modules/toolkit.vue')) {
    mustInclude(content, "title=\"$t('sys.onlineForm.canvasProperties')\"", 'hosted toolkit should rename the properties entry to canvas properties');
    mustInclude(content, "<span class=\"designer__toolkit-label\">{{ $t('sys.onlineForm.canvasProperties') }}</span>", 'hosted toolkit should show the canvas properties label');
    mustInclude(content, 'designer__toolkit-canvas-icon', 'hosted toolkit should use the new canvas-oriented icon');
    mustNotInclude(content, '<span class="designer__toolkit-label">属性配置</span>', 'hosted toolkit should not keep the legacy properties label');
  }

  if (relativePath.endsWith('views/designer/modules/designer-side-panel.vue')) {
    mustInclude(content, "if (props.activePanel === 'properties') return '画布属性';", 'hosted side panel header should rename the properties area to canvas properties');
  }

  if (relativePath.endsWith('views/designer/modules/panel/panel-paper.vue')) {
    mustInclude(content, 'orientation-options', 'paper panel should render paired orientation cards');
    mustInclude(content, "$t('sys.onlineForm.canvasOrientation')", 'paper panel should label direction as canvas direction');
    mustInclude(content, "$t('sys.appDesigner.printDesign.form.landscape')", 'paper panel should expose the landscape option');
    mustInclude(content, 'setOrientation(Orientation.Landscape)', 'paper panel should let the user switch to landscape');
    mustInclude(content, 'setOrientation(Orientation.Portrait)', 'paper panel should let the user switch to portrait');
    mustInclude(content, 'paper.value.orientation = orientation;', 'paper panel should update orientation through the paper ref');
    mustInclude(content, 'class="important-mt-0"', 'paper panel should reduce the top margin above canvas direction');
    mustNotInclude(content, "$t('sys.onlineForm.pageOrientation')", 'paper panel should no longer label direction as page direction');
    mustNotInclude(content, "$t('sys.onlineForm.canvasProperties')", 'paper panel should not render a duplicate canvas properties section title');
    mustNotInclude(content, 'watch(', 'paper panel should not pin the page orientation anymore');
    mustNotInclude(content, 'paper.value.orientation = Orientation.Portrait;', 'paper panel should not force portrait orientation anymore');
    mustNotInclude(content, "$t('sys.appDesigner.printDesign.form.name2')", 'paper panel should remove the form name block');
    mustNotInclude(content, "$t('sys.dataSet.modelName')", 'paper panel should remove the model name block');
    mustNotInclude(content, "$t('sys.onlineForm.paperProperties')", 'paper panel should remove the paper size summary block');
    mustNotInclude(content, 'SubTableList', 'paper panel should remove the table-list configuration section');
    mustNotInclude(content, 'removeThead', 'paper panel should remove the table header configuration section');
  }

  if (relativePath.endsWith('views/designer/modules/base/padding-setting.vue')) {
    mustInclude(content, '--padding-frame-inset-x', 'margin setting control should use adaptive horizontal frame inset');
    mustInclude(content, '--padding-inner-width', 'margin setting control should keep the center editor adaptive');
    mustInclude(content, 'max(14px, calc(var(--padding-frame-inset-x) - (var(--padding-input-width) / 2)))', 'side margin inputs should stay within narrow panels');
    mustNotInclude(content, '--padding-line-length', 'margin setting should no longer keep connector line sizing');
    mustNotInclude(content, 'width: var(--padding-line-length)', 'margin setting input connector lines should be removed');
  }

  if (relativePath.endsWith('views/designer/hooks/useSpreadSheet.ts')) {
    mustInclude(content, 'paper.value.orientation = orientation;', 'spreadsheet initialization should still honor the stored document direction');
    mustNotInclude(content, 'paper.value.orientation = Orientation.Portrait;', 'spreadsheet initialization should not hard-code portrait orientation');
  }

  if (relativePath.endsWith('views/designer/styles/spread-sheet.less')) {
    mustInclude(content, "linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%)", 'designer canvas viewport should match the host page background theme');
    mustInclude(content, 'box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);', 'designer paper should get the new softer page shadow');
  }

  if (relativePath === '../vendor/online-form-designer/README.md') {
    mustInclude(content, 'Make designer changes in this directory only', 'vendor copy should document the local-only edit boundary');
  }

  if (relativePath.endsWith('src/projects/online-form/index.html')) {
    mustInclude(content, '<title>设计器</title>', 'embedded designer browser title should be 设计器');
    mustNotInclude(content, 'VITE_GLOB_APP_TITLE', 'embedded designer browser title should not depend on the legacy Paas app title env');
    mustNotInclude(content, '骋云PaaS平台', 'embedded designer should not expose the legacy Paas platform title');
    mustNotInclude(content, 'href="/src/assets/images/favicon.png"', 'vendor online-form entry should not force the legacy Paas favicon');
  }

  if (relativePath === '../vendor/online-form-designer/vite.config.ts') {
    mustInclude(content, 'isHostedDesignerOnlyBuild', 'hosted-only designer build should be able to prune standalone entries');
    mustInclude(content, "process.env.VITE_ONLINE_FORM_HOSTED_ONLY === 'true'", 'vite config should read the hosted-only build flag');
    mustInclude(content, '!isHostedDesignerOnlyBuild()', 'hosted-only designer build should not add the standalone formula entry');
    mustInclude(content, 'designerBuildHeartbeat', 'designer build should print periodic progress while Vite is busy');
    mustInclude(content, '[designer-build]', 'designer build heartbeat logs should be easy to recognize');
    mustInclude(content, 'hostedDesignerOnlyAliases', 'hosted-only designer build should alias standalone-only modules to shims');
    mustInclude(content, 'register-glob-comp.ts', 'hosted-only designer build should not compile full global component registration');
    mustInclude(content, 'register-glob-layout.ts', 'hosted-only designer build should not compile full global layout registration');
    mustInclude(content, 'online-form-router.ts', 'hosted-only designer build should not compile the standalone online-form router');
    mustInclude(content, 'runtime-web.ts', 'hosted-only designer build should not compile the full runtime-web package from standalone setup');
    mustInclude(content, 'nocode-base.ts', 'hosted-only designer build should not compile the full nocode-base aggregate package');
    mustInclude(content, 'nocode-web-render.ts', 'hosted-only designer build should not compile nocode-web-render material consume and annotation packages');
    mustInclude(content, 'http-axios.ts', 'hosted-only designer build should not compile the standalone HTTP client and platform stores');
    mustInclude(content, 'user-store.ts', 'hosted-only designer build should not compile the standalone user store');
    mustInclude(content, 'permission-store.ts', 'hosted-only designer build should not compile the standalone permission store');
    mustInclude(content, 'use-router.ts', 'hosted-only designer build should not compile the standalone router helpers');
    mustInclude(content, 'setup-i18n.ts', 'hosted-only designer build should not compile remote i18n APIs');
    mustInclude(content, 'expression.ts', 'hosted-only designer build should not compile the full expression editor and page-designer schema');
    mustInclude(content, 'hosted-field-config.vue', 'hosted-only designer build should not compile all standalone field property editors');
    mustInclude(content, 'hosted-cell-widget-props.vue', 'hosted-only designer build should replace standalone field props editors directly');
    mustInclude(content, 'hosted-cell-widget-style.vue', 'hosted-only designer build should replace standalone field style editors directly');
    mustInclude(content, 'widget-index.ts', 'hosted-only designer build should not scan every standalone field props or style editor through the widget index');
    mustInclude(content, 'reverse-modeling.ts', 'hosted-only designer build should not compile app-designer reverse-modeling chunks');
    mustInclude(content, '../../../hooks/reverse-modeling', 'hosted-only designer build should catch toolkit reverse-modeling relative imports');
    mustInclude(content, '../../hooks/reverse-modeling', 'hosted-only designer build should catch widget and modal reverse-modeling relative imports');
    mustInclude(content, 'use-print.ts', 'hosted-only designer build should not compile remote print initialization APIs');
    mustInclude(content, 'render-components.ts', 'hosted-only designer build should not compile standalone render component registration');
    mustInclude(content, 'emptyOutDir: true', 'designer build should clear stale hashed assets before writing a fresh output');
    mustInclude(content, 'server:', 'designer dev server should own a watch configuration');
    mustInclude(content, 'ignored:', 'designer dev server should ignore generated build outputs');
    mustInclude(content, "'**/dist/**'", 'designer dev server should not reload when designer build writes dist files');
  }

  if (relativePath === '../vendor/online-form-designer/package.json') {
    mustInclude(content, 'dev:online-form', 'vendor designer should provide its own dev command');
    mustInclude(content, 'build:online-form', 'vendor designer should provide its own build command');
    mustInclude(content, 'VITE_ONLINE_FORM_HOSTED_ONLY=true', 'designer production build should only include the hosted designer runtime');
    mustInclude(content, 'VITE_SKIP_BUILD_GZIP=true', 'designer production build should not spend local CPU precompressing generated chunks');
    mustInclude(content, '--port 3100', 'vendor dev server should match the host proxy default');
    mustInclude(content, '--base /template-designer-runtime/', 'vendor dev server should keep Vite root assets under the proxied runtime prefix');
  }

  if (relativePath === '../vendor/online-form-designer/internal/vite-config/src/config/common.ts') {
    mustInclude(content, 'skipBuildGzip', 'shared vendor config should support skipping gzip for designer builds');
    mustInclude(content, "process.env.VITE_SKIP_BUILD_GZIP === 'true'", 'designer build should be able to disable local gzip generation');
    mustInclude(content, '...(skipBuildGzip', 'vite compression plugin should be conditional');
  }

  if (relativePath.endsWith('src/projects/online-form/main.ts')) {
    mustInclude(content, "import { setupRouter } from '/@online-form/router'", 'online-form entry should mount the online-form router');
    mustNotInclude(content, "import { setupRouter } from '/@developer-center/router'", 'online-form entry should not mount the developer-center router');
    mustInclude(content, 'loadRootComponent', 'online-form entry should choose a lightweight hosted root component during hosted designer mode');
    mustInclude(content, 'HostedApp.vue', 'hosted-only build should use the lightweight hosted root component');
    mustNotInclude(content, "import AppComponent from './App.vue'", 'hosted-only build should not statically scan the standalone root App component');
    mustInclude(content, 'isHostedDesignerMode', 'online-form entry should recognize hosted designer mode');
    mustInclude(content, 'hostedDesignerOnlyBuild', 'online-form entry should support a hosted-only production build');
    mustInclude(content, 'const hostedDesignerMode = hostedDesignerOnlyBuild || isHostedDesignerMode()', 'online-form entry should resolve hosted designer mode before choosing the root component');
    mustInclude(content, 'const AppComponent = await loadRootComponent(hostedDesignerMode)', 'hosted dev iframe should load the lightweight hosted root component');
    mustNotInclude(content, 'const AppComponent = await loadRootComponent(hostedDesignerOnlyBuild)', 'hosted dev iframe should not load the standalone root App component');
    mustInclude(content, 'importStandaloneModule', 'standalone-only modules should use runtime imports that hosted-only builds do not scan');
    mustInclude(content, '/* @vite-ignore */', 'standalone-only module imports should be ignored by Vite in hosted-only builds');
    mustInclude(content, 'registerHostedDesignerGlobals', 'hosted-only build should use a lightweight designer global registration path');
    mustInclude(content, 'registerStandaloneGlobals', 'standalone online-form should still lazy-load the full global registration path');
    mustInclude(content, "'/src/components/registerGlobComp.ts'", 'full global registration should only load for standalone runtime');
    mustInclude(content, "'/src/layouts/registerGlobLayout.ts'", 'layout registration should only load for standalone runtime');
    mustInclude(content, "'/src/logics/initAppConfig.ts'", 'platform config initialization should only load for standalone runtime');
    mustInclude(content, "'/src/router/guard/index.ts'", 'full router guards should only load for standalone runtime');
    mustInclude(content, "'/src/logics/error-handle/index.ts'", 'error collection should only load for standalone runtime');
    mustInclude(content, "'/src/hooks/platform/index.ts'", 'platform settings should only load for standalone runtime');
    mustInclude(content, "import('@gct/runtime-web')", 'runtime web overlay bridge should only load for standalone runtime');
    mustNotInclude(content, "import('@/components/registerGlobComp')", 'hosted-only build should not scan full global component registration');
    mustNotInclude(content, "import('@/layouts/registerGlobLayout')", 'hosted-only build should not scan full global layout registration');
    mustNotInclude(content, "import('@/logics/initAppConfig')", 'hosted-only build should not scan platform config initialization');
    mustNotInclude(content, "import('/@/router/guard')", 'hosted-only build should not scan full router guards');
    mustNotInclude(content, "import('@/logics/error-handle')", 'hosted-only build should not scan error collection');
    mustNotInclude(content, "import('/@/hooks/platform')", 'hosted-only build should not scan platform settings');
    mustNotInclude(content, "import { registerGlobComp } from '@/components/registerGlobComp';", 'hosted-only build should not statically include full global components');
    mustNotInclude(content, "import { registerGlobLayout } from '@/layouts/registerGlobLayout';", 'hosted-only build should not statically include full layouts');
    mustNotInclude(content, "import { setupGlobDirectives } from '@/directives';", 'hosted-only build should not statically include platform directives');
    mustNotInclude(content, "import { setupRouterGuard } from '/@/router/guard';", 'hosted-only build should not statically include full router guards');
    mustNotInclude(content, "import { setupErrorHandle } from '@/logics/error-handle';", 'hosted-only build should not statically include error collection');
    mustNotInclude(content, "import { initAppConfigStore } from '@/logics/initAppConfig';", 'hosted-only build should not statically include platform config initialization');
    mustNotInclude(content, "import { usePlatformSetting } from '/@/hooks/platform';", 'hosted-only build should not statically include platform settings');
    mustNotInclude(content, "import { OverlayContainer } from '@gct/runtime-web';", 'hosted-only build should not statically include runtime web overlay');
    mustInclude(content, "'/src/projects/online-form/src/views/render/__components__/index.ts'", 'standalone online-form runtime components should be lazy-loaded without hosted-only build scanning');
    mustNotInclude(content, "import('/@online-form/views/render/__components__/index')", 'hosted-only build should not scan the standalone render component alias');
    mustNotInclude(content, "import('./src/views/render/__components__/index')", 'hosted-only build should not use an unaliasable relative render component import');
    mustNotInclude(content, "import { AsyncGctOnlineComponents } from './src/views/render/__components__/index';", 'hosted-only build should not statically include all render component classes');
    mustInclude(content, 'setupI18n(app, { loadRemote: !hostedDesignerMode })', 'hosted designer mode should not load standalone remote i18n settings');
    mustNotInclude(content, 'if (hostedDesignerOnlyBuild) {\n    registerHostedDesignerGlobals(app);', 'hosted dev iframe should use hosted global registration too');
    mustInclude(content, 'if (hostedDesignerMode) {\n    registerHostedDesignerGlobals(app);', 'hosted dev iframe should not load standalone global registration');
    mustInclude(content, 'if (!hostedDesignerMode)', 'hosted designer mode should skip standalone runtime component registration and platform modules');
    mustInclude(content, 'if (!hostedDesignerMode)', 'hosted designer mode should skip standalone platform setting loading');
  }

  if (relativePath.endsWith('src/projects/online-form/HostedApp.vue')) {
    mustInclude(content, '<RouterView />', 'hosted root app should only render the routed designer page');
    mustInclude(content, 'ConfigProvider', 'hosted root app should keep Ant Design locale context');
    mustNotInclude(content, 'AppProvider', 'hosted root app should not compile the standalone application provider');
    mustNotInclude(content, 'useTitle', 'hosted root app should not compile standalone title management');
    mustNotInclude(content, 'useFavicon', 'hosted root app should not compile standalone favicon management');
    mustNotInclude(content, 'useRootSetting', 'hosted root app should not compile standalone platform settings');
    mustNotInclude(content, 'useLocale', 'hosted root app should not compile standalone locale store hooks');
  }

  if (relativePath.includes('/hosted-shims/')) {
    mustNotInclude(content, '/@web-render', 'hosted-only shims should not compile web-render project chunks');
    mustNotInclude(content, '/@page-designer', 'hosted-only shims should not compile page-designer project chunks');
    mustNotInclude(content, '/@app-designer', 'hosted-only shims should not compile app-designer project chunks');
    mustNotInclude(content, '@mobile', 'hosted-only shims should not compile mobile project chunks');
    mustNotInclude(content, '/@/router/routes/basic', 'hosted-only shims should not compile global login, redirect, or exception routes');
    mustNotInclude(content, '/@/store/modules/user', 'hosted-only shims should not compile the standalone user store');
    mustNotInclude(content, '/@/store/modules/permission', 'hosted-only shims should not compile the standalone permission store');
    mustNotInclude(content, '/@/utils/http/axios', 'hosted-only shims should not compile the standalone HTTP client');
    mustNotInclude(content, '@/utils/http/axios', 'hosted-only shims should not compile the standalone HTTP client');
    mustNotInclude(content, 'remote-apis', 'hosted-only shims should not compile remote designer API chunks');
    mustNotInclude(content, 'registerGlobComp.ts', 'hosted-only shims should not re-export full global component registration');
    mustNotInclude(content, 'runtime-web-next', 'hosted-only shims should not compile runtime-web implementation packages');
  }

  if (relativePath.endsWith('hosted-shims/nocode-web-render.ts')) {
    mustInclude(content, 'useWebUpload', 'hosted nocode-web-render shim should preserve upload helpers used by image and file widgets');
    mustInclude(content, 'initWebPaasUploadApis', 'hosted nocode-web-render shim should preserve upload API initialization');
    mustInclude(content, 'useWebAnnotation', 'hosted nocode-web-render shim should preserve annotation API shape');
    mustInclude(content, 'formPrint', 'hosted nocode-web-render shim should preserve print API shape');
    mustNotInclude(content, 'material-consume', 'hosted nocode-web-render shim should not compile material consume packages');
    mustNotInclude(content, 'material-balance', 'hosted nocode-web-render shim should not compile material balance packages');
    mustNotInclude(content, '/@page-designer', 'hosted nocode-web-render shim should not compile page-designer chunks');
    mustNotInclude(content, '/@web-render', 'hosted nocode-web-render shim should not compile web-render chunks');
  }

  if (relativePath.endsWith('hosted-shims/online-form-router.ts')) {
    mustInclude(content, 'createRouter', 'hosted-only router shim should create the embedded designer router directly');
    mustInclude(content, "path: '/designer'", 'hosted-only router shim should only mount the designer route');
    mustInclude(content, "redirect: '/designer'", 'hosted-only router shim should redirect unknown or root paths to the designer');
    mustInclude(content, 'apaas-dp-print.vue', 'hosted-only router shim should mount the migrated designer page');
    mustNotInclude(content, 'LoginRoute', 'hosted-only router shim should not include the standalone login route');
    mustNotInclude(content, 'PAGE_NOT_FOUND_ROUTE', 'hosted-only router shim should not include global exception routes');
    mustNotInclude(content, 'REDIRECT_ROUTE', 'hosted-only router shim should not include global redirect routes');
    mustNotInclude(content, 'useRouterStore', 'hosted-only router shim should not require the standalone router store');
  }

  if (relativePath.endsWith('hosted-shims/use-print.ts')) {
    mustInclude(content, 'usePrint', 'hosted-only print shim should preserve the usePrint API shape');
    mustInclude(content, 'initialize', 'hosted-only print shim should expose a no-op initialize method');
    mustInclude(content, 'loading', 'hosted-only print shim should expose the loading ref used by the designer page');
    mustNotInclude(content, './remote-apis', 'hosted-only print shim should not import remote API loaders');
    mustNotInclude(content, '/@/apis', 'hosted-only print shim should not import generated API controllers');
  }

  if (relativePath.endsWith('hosted-shims/setup-i18n.ts')) {
    mustInclude(content, 'createI18n', 'hosted-only i18n shim should create the shared i18n instance');
    mustInclude(content, 'defaultLocaleFlat', 'hosted-only i18n shim should use local default messages');
    mustInclude(content, 'zh-CN', 'hosted-only i18n shim should default to Simplified Chinese');
    mustInclude(content, 'setupI18n', 'hosted-only i18n shim should preserve the setupI18n API shape');
    mustNotInclude(content, 'api/sys/locale', 'hosted-only i18n shim should not import remote locale APIs');
    mustNotInclude(content, 'useLocaleStoreWithOut', 'hosted-only i18n shim should not import the standalone locale store');
    mustNotInclude(content, 'getLocaleList', 'hosted-only i18n shim should not load remote locale lists');
  }

  if (relativePath.endsWith('hosted-shims/hosted-cell-widget-props.vue')) {
    mustInclude(content, 'hosted-cell-widget-props', 'hosted cell widget props shim should expose a stable marker');
    mustInclude(content, 'emptySymbolOptions', 'hosted cell widget props shim should keep common empty symbol configuration');
    mustInclude(content, 'showInputPropEditor', 'hosted cell widget props shim should keep common input state configuration');
    mustInclude(content, 'showAffixEditor', 'hosted cell widget props shim should keep common prefix and suffix configuration');
    mustNotInclude(content, 'asyncImportWidgetProps', 'hosted cell widget props shim should not compile every standalone field props editor');
    mustNotInclude(content, 'import.meta.glob', 'hosted cell widget props shim should not scan field props with glob imports');
  }

  if (relativePath.endsWith('hosted-shims/hosted-cell-widget-style.vue')) {
    mustInclude(content, 'hosted-cell-widget-style', 'hosted cell widget style shim should expose a stable marker');
    mustInclude(content, 'CompSizeEditor', 'hosted cell widget style shim should keep the common component size editor');
    mustNotInclude(content, 'asyncImportWidgetStyle', 'hosted cell widget style shim should not compile every standalone field style editor');
    mustNotInclude(content, 'import.meta.glob', 'hosted cell widget style shim should not scan field styles with glob imports');
  }

  if (relativePath.endsWith('hosted-shims/hosted-field-config.vue')) {
    mustInclude(content, 'HostedCellWidgetProps', 'hosted field config should use the lightweight hosted props editor');
    mustInclude(content, 'HostedCellWidgetStyle', 'hosted field config should use the lightweight hosted style editor');
    mustNotInclude(content, 'useReverseModeling', 'hosted field config should not compile reverse-modeling and app-designer chunks');
    mustNotInclude(content, '/@online-form/views/__cell_widgets__/cell-widget-props.vue', 'hosted field config should not compile all standalone field props editors');
    mustNotInclude(content, '/@online-form/views/__cell_widgets__/cell-widget-style.vue', 'hosted field config should not compile all standalone field style editors');
  }

  if (relativePath.endsWith('hosted-shims/reverse-modeling.ts')) {
    mustInclude(content, 'useReverseModeling', 'hosted reverse-modeling shim should preserve the composable API shape');
    mustInclude(content, 'calcUsedFields', 'hosted reverse-modeling shim should preserve the used-field helper API shape');
    mustNotInclude(content, '/@app-designer', 'hosted reverse-modeling shim should not compile app-designer chunks');
    mustNotInclude(content, '/@page-designer', 'hosted reverse-modeling shim should not compile page-designer chunks');
    mustNotInclude(content, '/@/apis', 'hosted reverse-modeling shim should not compile generated API controllers');
  }

  if (relativePath.endsWith('hosted-shims/nocode-base.ts')) {
    mustInclude(content, 'PlatformEnum', 'hosted nocode-base shim should preserve platform constants used by the designer');
    mustInclude(content, 'FormTypeEnum', 'hosted nocode-base shim should preserve form type constants used by the designer');
    mustInclude(content, 'useNocodeEmitter', 'hosted nocode-base shim should preserve emitter API shape');
    mustNotInclude(content, './hooks', 'hosted nocode-base shim should not re-export full hooks');
    mustNotInclude(content, './components', 'hosted nocode-base shim should not re-export full components');
    mustNotInclude(content, './interface', 'hosted nocode-base shim should not re-export full render interfaces');
    mustNotInclude(content, '/@/apis', 'hosted nocode-base shim should not compile generated API controllers');
    mustNotInclude(content, '/@page-designer', 'hosted nocode-base shim should not compile page-designer chunks');
    mustNotInclude(content, '/@web-render', 'hosted nocode-base shim should not compile web-render chunks');
  }

  if (relativePath.endsWith('hosted-shims/http-axios.ts')) {
    mustInclude(content, 'defHttp', 'hosted HTTP shim should preserve the generated controller API shape');
    mustInclude(content, 'get:', 'hosted HTTP shim should expose get');
    mustInclude(content, 'post:', 'hosted HTTP shim should expose post');
    mustInclude(content, 'put:', 'hosted HTTP shim should expose put');
    mustInclude(content, 'delete:', 'hosted HTTP shim should expose delete');
    mustNotInclude(content, '/@/store/modules/user', 'hosted HTTP shim should not compile the user store');
    mustNotInclude(content, '/@/hooks/web/useRouter', 'hosted HTTP shim should not compile router helpers');
  }

  if (relativePath.endsWith('hosted-shims/widget-index.ts')) {
    mustInclude(content, 'widgetConfigMap', 'hosted widget index should preserve the widget config API used by spreadsheet field creation');
    mustInclude(content, 'asyncImportWidgetDesign', 'hosted widget index should preserve field design component loading');
    mustNotInclude(content, '*-props.vue', 'hosted widget index should not scan every standalone field props editor');
    mustNotInclude(content, '*-style.vue', 'hosted widget index should not scan every standalone field style editor');
    mustNotInclude(content, '/@page-designer', 'hosted widget index should not compile page-designer chunks');
    mustNotInclude(content, '/@web-render', 'hosted widget index should not compile web-render chunks');
    mustNotInclude(content, '/@app-designer', 'hosted widget index should not compile app-designer chunks');
  }

  if (relativePath.endsWith('hosted-shims/expression.ts')) {
    mustInclude(content, 'ExpressionModeEnum', 'hosted expression shim should preserve expression mode enum exports');
    mustInclude(content, 'ExpressionTabEnum', 'hosted expression shim should preserve expression tab enum exports');
    mustInclude(content, 'ExpressionCard', 'hosted expression shim should preserve the expression card export');
    mustInclude(content, 'openModal', 'hosted expression shim should preserve the useExpression API shape');
    mustNotInclude(content, 'page-designer', 'hosted expression shim should not compile page-designer schema');
    mustNotInclude(content, 'registerGlobComp', 'hosted expression shim should not compile global component registration');
    mustNotInclude(content, 'monaco', 'hosted expression shim should not compile the Monaco expression editor');
  }

  if (relativePath.endsWith('hosted-shims/user-store.ts')) {
    mustInclude(content, 'useUserStoreWithOut', 'hosted user store shim should preserve the lazy store API shape');
    mustNotInclude(content, '@mobile', 'hosted user store shim should not compile mobile mqtt code');
    mustNotInclude(content, '/@/apis', 'hosted user store shim should not compile generated API controllers');
  }

  if (relativePath.endsWith('hosted-shims/permission-store.ts')) {
    mustInclude(content, 'usePermissionStoreWithOut', 'hosted permission store shim should preserve the lazy store API shape');
    mustNotInclude(content, 'import.meta.glob', 'hosted permission store shim should not scan project route modules');
    mustNotInclude(content, '/@web-render/router/asyncRouter', 'hosted permission store shim should not compile web-render dynamic routes');
  }

  if (relativePath.endsWith('hosted-shims/use-router.ts')) {
    mustInclude(content, 'getCurrentRouter', 'hosted router helper shim should preserve current router access');
    mustInclude(content, 'getProjectRoutesModules', 'hosted router helper shim should preserve async route API shape');
    mustNotInclude(content, 'import.meta.glob', 'hosted router helper shim should not scan project route modules');
  }

  if (relativePath.endsWith('src/projects/online-form/src/router/index.ts')) {
    mustInclude(content, 'getOnlineFormRouterBase', 'online-form router should keep the nested Vite dev entry path as its hash base');
    mustInclude(content, "createWebHashHistory(getOnlineFormRouterBase())", 'online-form router should not normalize hosted dev URLs back to the Vite base root');
    mustInclude(content, 'src/projects/online-form', 'online-form router base should recognize the hosted dev entry path');
  }

  if (relativePath.endsWith('apaas-dp-print.vue')) {
    mustInclude(content, 'initializeHostedDesigner', 'migrated designer entry should support hosted initialization');
    mustInclude(content, "route.query.hosted === '1'", 'migrated designer should switch by hosted query');
    mustInclude(content, 'designer--hosted', 'hosted designer should hide its internal black header to avoid duplicate operation bars');
    mustInclude(content, 'designer--page-thumbnails-open', 'hosted designer should expose a layout state when page thumbnails are open');
    mustInclude(content, 'DesignerSidePanel', 'hosted designer should render the shared embedded left side panel');
    mustInclude(content, 'hostedDesignerOnlyBuild', 'hosted designer entry should know when the production build only targets the host shell');
    mustInclude(content, 'StandaloneDesignerHeader', 'standalone designer header should be lazy and removable from hosted-only builds');
    mustInclude(content, 'StandalonePanel', 'standalone right panel should be lazy and removable from hosted-only builds');
    mustNotInclude(content, "import DesignerHeader from '/@online-form/views/designer/modules/header.vue';", 'hosted-only build should not statically include the standalone designer header');
    mustNotInclude(content, "import Panel from '/@online-form/views/designer/modules/panel.vue';", 'hosted-only build should not statically include the standalone designer properties panel');
    mustInclude(content, 'pageThumbnailsVisible', 'hosted designer should own the page thumbnail open/close state');
    mustInclude(content, 'activeSidePanel', 'hosted designer should track the selected left side panel content');
    mustInclude(content, 'selectSidePanel', 'hosted designer should switch side panel content from the left rail');
    mustInclude(content, "'pages' | 'fields' | 'widgets' | 'properties'", 'hosted designer should allow the left rail to show selected properties');
    mustInclude(content, 'PAGE_THUMBNAILS_MIN_WIDTH = 210', 'hosted left side panel should keep a 210px minimum width');
    mustInclude(content, 'pageThumbnailsWidth', 'hosted designer should own the resizable page thumbnail width state');
    mustInclude(content, 'pageThumbnailsStyle', 'hosted designer should pass page thumbnail width through a CSS variable');
    mustInclude(content, 'startPageThumbnailsResize', 'hosted designer should start resizing from the thumbnail/canvas separator');
    mustInclude(content, 'designer__page-thumbnails-resizer', 'hosted designer should render a draggable separator between thumbnails and canvas');
    mustInclude(content, '@select-side-panel="selectSidePanel"', 'hosted designer toolkit should select embedded side panel content');
    mustInclude(content, ':active-panel="activeSidePanel"', 'hosted side panel should receive the selected content key');
    mustInclude(content, '@close="pageThumbnailsVisible = false"', 'hosted side panel should be closable from the panel header');
    mustInclude(content, 'v-if="!hostedDesigner && StandaloneDesignerHeader"', 'hosted designer should not render the embedded designer header');
    mustInclude(content, '<div v-if="!hostedDesigner && StandalonePanel" class="designer__panel">', 'hosted designer should remove the right properties panel');
    mustInclude(content, 'activeTab', 'hosted designer entry should manage the active center tab state');
    mustInclude(content, '建模设计', 'hosted designer entry should provide the model design view content');
    mustInclude(content, '流程设计', 'hosted designer entry should provide the process design view content');
  }

  if (relativePath.endsWith('modules/toolbar.vue')) {
    mustInclude(content, 'useRoute', 'hosted toolbar should derive embedded mode from the current route');
    mustInclude(content, "route.query.hosted === '1'", 'hosted toolbar should switch by hosted query');
    mustInclude(content, 'HOSTED_TEMPLATE_FONT_FAMILY', 'hosted toolbar should keep a stable Microsoft YaHei font fallback');
    mustInclude(content, 'Microsoft YaHei', 'hosted toolbar should prefer Microsoft YaHei');
    mustInclude(content, '微软雅黑', 'hosted toolbar should include the Chinese Microsoft YaHei name');
    mustInclude(content, 'paper', 'hosted toolbar should reuse the shared paper state for page header and footer toggles');
    mustInclude(content, 'sheetReadonly', 'hosted toolbar should respect readonly state for header and footer toggles');
    mustInclude(content, 'v-model:checked="paper.paperHeader"', 'hosted toolbar should expose a page header checkbox after gridlines');
    mustInclude(content, 'v-model:checked="paper.paperFooter"', 'hosted toolbar should expose a page footer checkbox after gridlines');
    mustInclude(content, '{{ $t(\'sys.onlineForm.header\') }}', 'hosted toolbar header checkbox should reuse the existing header label');
    mustInclude(content, '{{ $t(\'sys.footer\') }}', 'hosted toolbar footer checkbox should reuse the existing footer label');
    mustMatch(
      content,
      /<font-family-selector\s+v-if="!hostedDesigner"[\s\S]*?v-model:value="cellFontFamily"/,
      'hosted toolbar should hide the font family selector',
    );
    mustMatch(
      content,
      /<font-size-selector\s+v-if="!hostedDesigner"[\s\S]*?v-model:value="cellFontSize"/,
      'hosted toolbar should hide the font size selector',
    );
    mustMatch(
      content,
      /v-if="!isTextOnlineForm && !hostedDesigner"[\s\S]*?TableIcon2d/,
      'hosted toolbar should hide the 2D sub-table image button',
    );
    mustMatch(
      content,
      /v-if="!isTextOnlineForm && !hostedDesigner"[\s\S]*?TableIconCheck/,
      'hosted toolbar should hide the check-table image button',
    );
  }

  if (relativePath.endsWith('modules/toolkit.vue')) {
    mustInclude(content, 'useRoute', 'hosted toolkit should derive embedded mode from the current route');
    mustInclude(content, "route.query.hosted === '1'", 'hosted toolkit should switch by hosted query');
    mustInclude(content, 'pageThumbnailsVisible', 'hosted toolkit should receive page thumbnail visibility state');
    mustInclude(content, 'activeSidePanel', 'hosted toolkit should receive the selected side panel key');
    mustInclude(content, "type HostedSidePanelKey = 'pages' | 'fields' | 'widgets' | 'properties';", 'hosted toolkit should share the side panel key contract');
    mustInclude(content, "(e: 'select-side-panel', panel: HostedSidePanelKey): void", 'hosted toolkit should emit side panel selections');
    mustInclude(content, "emit('select-side-panel', panel)", 'hosted toolkit clicks should switch the embedded panel');
    mustInclude(content, 'v-if="hostedDesigner"', 'hosted toolkit should render direct rail buttons instead of popovers');
    mustInclude(content, 'v-if="!hostedDesigner"', 'non-hosted toolkit should keep the old popover behavior');
    mustInclude(content, 'designer__toolkit-page-icon', 'hosted toolkit should render a dedicated page icon');
    mustInclude(content, 'designer__toolkit-field-icon', 'hosted toolkit should render a semantic field icon instead of Aa text');
    mustInclude(content, 'designer__toolkit-widget-icon', 'hosted toolkit should render a compact component icon instead of large sliders');
    mustInclude(content, "selectSidePanel('properties')", 'hosted toolkit should expose a left rail entry for selected component or field properties');
    mustInclude(content, 'designer__toolkit-canvas-icon', 'hosted toolkit should render a semantic canvas icon');
    mustInclude(content, 'designer__toolkit--hosted', 'hosted toolkit should apply the icon-only side rail style');
    mustInclude(content, "hostedDesigner.value ? 'rightTop' : 'leftTop'", 'hosted toolkit popovers should open into the page after moving left');
    mustInclude(content, ':placement="toolkitPlacement"', 'hosted toolkit should use the computed popover placement');
  }

  if (relativePath.endsWith('modules/designer-side-panel.vue')) {
    mustInclude(content, "type HostedSidePanelKey = 'pages' | 'fields' | 'widgets' | 'properties';", 'side panel should define the shared content key contract');
    mustInclude(content, '字段管理', 'side panel should title the field list as field management');
    mustInclude(content, '组件管理', 'side panel should title the component list as component management');
    mustInclude(content, '画布属性', 'side panel should title the selected component or field properties panel');
    mustInclude(content, '分页缩略图', 'side panel should title the thumbnail list as page thumbnails');
    mustInclude(content, 'ToolkitContentFields', 'side panel should embed field management content directly');
    mustInclude(content, 'ToolkitContentWidgets', 'side panel should embed component management content directly');
    mustInclude(content, 'HostedPropertiesPanel', 'hosted side panel should use a hosted-only properties panel');
    mustInclude(content, '<HostedPropertiesPanel v-else />', 'side panel should embed hosted selected component or field properties directly');
    mustNotInclude(content, "import Panel from './panel.vue';", 'hosted side panel should not import the full standalone properties panel');
    mustInclude(content, 'PageThumbnails', 'side panel should embed page thumbnails directly');
    mustInclude(content, "defineEmits<{ (e: 'close'): void }>()", 'side panel close button should emit close');
    mustInclude(content, 'designer-side-panel__body--fields', 'side panel should style field content as an embedded panel');
    mustInclude(content, 'designer-side-panel__body--widgets', 'side panel should style widget content as an embedded panel');
    mustInclude(content, 'designer-side-panel__body--properties', 'side panel should style selected properties as an embedded panel');
  }

  if (relativePath.endsWith('modules/hosted-properties-panel.vue')) {
    mustInclude(content, 'PanelPaper', 'hosted properties panel should keep paper properties');
    mustInclude(content, 'PanelCell', 'hosted properties panel should keep cell properties');
    mustInclude(content, 'PanelMultiCells', 'hosted properties panel should keep multi-cell properties');
    mustInclude(content, 'PanelPaperWidget', 'hosted properties panel should keep page header/footer widget properties');
    mustInclude(content, 'PanelPaperWidgetGroup', 'hosted properties panel should keep page header/footer group properties');
    mustNotInclude(content, 'panel-tmpl-config', 'hosted properties panel should not compile template config chunks');
    mustNotInclude(content, 'panel-data-init-config', 'hosted properties panel should not compile data init chunks');
    mustNotInclude(content, 'material-consumption', 'hosted properties panel should not compile material consumption chunks');
    mustNotInclude(content, 'usePermissionStoreWithOut', 'hosted properties panel should not pull the permission store and all project routes');
    mustNotInclude(content, '/@web-render', 'hosted properties panel should not compile web-render project chunks');
    mustNotInclude(content, '/@page-designer', 'hosted properties panel should not compile page-designer project chunks');
    mustNotInclude(content, '@mobile', 'hosted properties panel should not compile mobile project chunks');
    mustNotInclude(content, '<div v-else class="panel-title"', 'hosted properties panel should not render a duplicate properties title above the paper panel');
  }

  if (relativePath.endsWith('modules/panel/panel-cell.vue')) {
    mustInclude(content, 'loadHostedFieldConfig', 'hosted-only panel cell should avoid compiling standalone field config');
    mustInclude(content, 'hosted-field-config.vue', 'hosted-only panel cell should load the lightweight hosted field config');
    mustInclude(content, '/* @vite-ignore */', 'hosted-only panel cell should keep standalone field config out of Vite analysis');
  }

  if (relativePath.endsWith('modules/page-thumbnails.vue')) {
    mustNotInclude(content, 'page-thumbnails__header', 'page thumbnails should no longer own the shared side panel title');
    mustNotInclude(content, 'page-thumbnails__close', 'page thumbnails should no longer own the shared side panel close button');
    mustInclude(content, 'useAllSpreadSheets', 'page thumbnail panel should reuse existing sheet state');
    mustInclude(content, 'sheetsData', 'page thumbnail panel should list current pages from sheets');
    mustInclude(content, 'activeSheetId', 'page thumbnail panel should highlight the active page');
    mustInclude(content, 'changeActiveSheet(sheet)', 'page thumbnail panel should switch pages when a thumbnail is clicked');
    mustInclude(content, '第 {{ index + 1 }} 页', 'page thumbnail panel should render numbered page labels');
    mustInclude(content, 'thumbnailRows', 'page thumbnail panel should render a scaled preview from sheet rows');
    mustInclude(content, 'thumbnailCols', 'page thumbnail panel should render a scaled preview from sheet columns');
    mustInclude(content, 'thumbnailCellText', 'page thumbnail panel should render actual sheet cell values in thumbnails');
    mustInclude(content, 'page-thumbnails__grid', 'page thumbnail panel should show the actual canvas grid preview');
    mustInclude(content, 'font-size: 12px', 'page thumbnail labels should use a smaller font size');
    mustInclude(content, 'color: #6f7785', 'page thumbnail labels should use subdued gray text');
    mustInclude(content, 'aspect-ratio', 'page thumbnails should resize their cards proportionally with the side panel');
    mustInclude(content, 'calc(100% - 28px)', 'page thumbnails should adapt to the draggable side panel width');
  }

  if (relativePath.endsWith('modules/sheet.vue')) {
    mustInclude(content, 'showSheetTabs', 'hosted sheet should use an explicit sheet tab visibility gate');
    mustInclude(content, "route.query.hosted === '1'", 'hosted sheet should switch by hosted query');
    mustInclude(content, '<SheetsComp v-if="showSheetTabs" />', 'hosted sheet should not render the bottom sheet tab strip');
  }

  if (relativePath.endsWith('styles/designer.less')) {
    mustInclude(content, '&.designer--hosted', 'hosted designer should own its embedded grid override');
    mustInclude(content, '--page-thumbnails-size', 'hosted designer should define a stable page thumbnail panel width');
    mustInclude(content, 'designer--page-thumbnails-open', 'hosted designer should switch grid layout when thumbnails are open');
    mustInclude(
      content,
      "'toolkit page-thumbnails page-thumbnails-resizer spread-sheet'",
      'hosted designer should place the draggable separator between thumbnails and canvas without a right panel',
    );
    mustInclude(content, "'toolkit spread-sheet'", 'hosted designer should let the canvas consume the removed right panel width');
    mustInclude(content, '&__page-thumbnails', 'hosted designer should expose the page thumbnail grid area');
    mustInclude(content, '&__page-thumbnails-resizer', 'hosted designer should expose the draggable page thumbnail separator');
    mustInclude(content, 'cursor: col-resize', 'hosted designer thumbnail separator should clearly resize horizontally');
    mustInclude(content, 'minmax(210px, var(--page-thumbnails-size))', 'hosted designer side panel column should keep a 210px usable minimum');
  }

  if (relativePath.endsWith('styles/spread-sheet.less')) {
    mustInclude(content, '.designer.designer--hosted .spread-sheet', 'hosted sheet should reclaim the hidden sheet tab height');
    mustInclude(content, 'height: 100%', 'hosted sheet should fill the full canvas slot after sheet tabs are hidden');
    mustInclude(content, 'Microsoft YaHei', 'hosted sheet should use Microsoft YaHei by default');
    mustInclude(content, '微软雅黑', 'hosted sheet should include the Chinese Microsoft YaHei name');
  }

  if (relativePath.endsWith('template-designer-host.ts')) {
    mustInclude(content, 'setCallback', 'migrated designer bridge should wire the hosted save callback');
    mustInclude(content, 'sheetsHasChanged', 'migrated designer bridge should inspect spreadsheet dirty state');
    mustInclude(content, 'save', 'migrated designer bridge should expose save for the host header button');
    mustInclude(content, "data.type === 'save'", 'migrated designer bridge should handle host-triggered save requests');
    mustInclude(content, "data.type === 'set-active-tab'", 'migrated designer bridge should handle host-triggered tab changes');
    mustInclude(content, "data.type === 'import-template'", 'migrated designer bridge should handle host-triggered template import');
    mustInclude(content, "data.type === 'simulate-fill-snapshot-request'", 'migrated designer bridge should handle host-triggered mock fill snapshot requests');
    mustInclude(content, 'exportDesignSnapshot', 'migrated designer bridge should export current JSON without saving');
    mustInclude(content, "postHostEvent({ type: 'simulate-fill-snapshot'", 'migrated designer bridge should return a snapshot to the React host');
    mustNotInclude(content, 'openMockReportUrl', 'migrated designer bridge should not open the legacy vendor render page');
    mustNotInclude(content, 'PlatformEnum', 'migrated designer bridge should not depend on legacy Paas platform render mode');
    mustInclude(content, 'save-request', 'migrated designer bridge should emit save requests');
    mustInclude(content, 'dirty-change', 'migrated designer bridge should report dirty state');
    mustInclude(content, 'close-request', 'migrated designer bridge should ask the host to close');
  }

  if (relativePath.endsWith('template-designer-protocol.ts')) {
    mustInclude(content, "type: 'set-active-tab'; tab: TemplateDesignerTabKey", 'host/child protocol should support hosted tab switching');
    mustInclude(content, "type: 'import-template'", 'host/child protocol should support hosted template import');
    mustInclude(content, "type: 'simulate-fill-snapshot-request'", 'host/child protocol should support hosted mock fill snapshots');
    mustInclude(content, "type: 'simulate-fill-snapshot'; snapshot: HostedDesignerSnapshot", 'host/child protocol should return hosted mock fill snapshots');
    mustNotInclude(content, "type: 'simulate-fill'", 'host/child protocol should not use the legacy vendor mock fill message');
  }

  if (relativePath.endsWith('hooks/useAllSpreadSheets.ts')) {
    mustInclude(content, 'markClean?: boolean', 'spreadsheet snapshot export should support not marking the editor clean');
    mustInclude(content, 'markClean !== false', 'spreadsheet save should only reset dirty baseline for real saves');
    mustInclude(content, 'loadHostedReverseModeling', 'hosted-only multi-sheet hook should avoid compiling standalone reverse-modeling');
    mustInclude(content, '/* @vite-ignore */', 'hosted-only multi-sheet hook should keep standalone reverse-modeling out of Vite analysis');
  }

  if (relativePath.endsWith('hooks/useSpreadSheet.ts')) {
    mustInclude(content, 'exportDesignSnapshot', 'spreadsheet hook should expose a snapshot-only export for mock fill');
    mustInclude(content, 'saveSheets(isEasyEdition.value, { markClean: false })', 'snapshot-only export should not mark the editor clean');
    mustInclude(content, 'loadHostedReverseModeling', 'hosted-only spreadsheet hook should avoid compiling standalone reverse-modeling');
    mustInclude(content, '/* @vite-ignore */', 'hosted-only spreadsheet hook should keep standalone reverse-modeling out of Vite analysis');
  }

  if (relativePath.endsWith('src/projects/online-form/src/router/routes/index.ts')) {
    mustInclude(content, "import designerRoutes from './modules/designer'", 'hosted designer route should be part of the online-form base routes');
    mustInclude(content, '...designerRoutes', 'online-form router should mount the designer route before fallback routes');
  }

  if (relativePath.endsWith('src/router/guard/permissionGuard.ts')) {
    mustInclude(content, "to.query.hosted === '1'", 'hosted designer mode should not require the vendor app login state');
    mustInclude(content, 'next();', 'hosted designer guard should allow navigation directly');
  }
}

if (failures.length > 0) {
  console.error('Template designer verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Template designer verification passed.');
