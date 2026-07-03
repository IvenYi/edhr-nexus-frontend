import { existsSync, readFileSync } from 'node:fs';

const failures = [];

const files = [
  '../package.json',
  '../vite.config.ts',
  '../src/pages/master-data/TemplateDesignerDialog.tsx',
  '../src/pages/master-data/TemplateModelingPage.tsx',
  '../src/pages/master-data/template-designer/TemplateDesignerDialog.tsx',
  '../src/pages/master-data/template-designer/TemplateDesignerHostFrame.tsx',
  '../src/pages/master-data/template-designer/TemplateDesignerPreloadFrame.tsx',
  '../src/pages/master-data/template-designer/templateDesignerBridge.ts',
  '../vendor/online-form-designer/README.md',
  '../vendor/online-form-designer/package.json',
  '../vendor/online-form-designer/vite.config.ts',
  '../vendor/online-form-designer/src/projects/online-form/index.html',
  '../vendor/online-form-designer/src/projects/online-form/main.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/router/index.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/integration/apaas_dp/designer/apaas-dp-print.vue',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/bridge/template-designer-host.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/bridge/template-designer-protocol.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/views/designer/hooks/local-designer-cache.ts',
  '../vendor/online-form-designer/src/projects/online-form/src/router/routes/index.ts',
  '../vendor/online-form-designer/src/router/guard/permissionGuard.ts',
];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
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
    mustInclude(content, "type: 'simulate-fill'", 'host header should trigger the child mock fill flow');
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
  }

  if (relativePath.endsWith('templateDesignerBridge.ts')) {
    mustInclude(content, 'buildHostedDesignerSnapshot', 'bridge should build a deterministic hosted snapshot');
    mustInclude(content, 'buildVueDesignerUrl', 'bridge should resolve the child designer URL');
    mustInclude(content, "export type TemplateDesignerTabKey = 'model' | 'form' | 'process';", 'bridge should define the hosted designer tab contract shared with the child');
    mustInclude(content, 'TemplateDesignerHostEvent', 'bridge should define child-to-host events');
    mustInclude(content, "DEFAULT_VUE_DESIGNER_PATH = '/online-form/#/designer'", 'production host should default to the deployed current-project designer hash route');
    mustInclude(content, "DEFAULT_VUE_DESIGNER_DEV_PATH = '/template-designer-runtime/src/projects/online-form/index.html#/designer'", 'dev host should use the explicit online-form entry for the migrated designer');
    mustInclude(content, 'import.meta.env.DEV', 'dev host should switch away from the production path during local development');
    mustInclude(content, 'url.hash', 'host should put Vue route query in hash mode');
    mustNotInclude(content, 'localhost:5173', 'host should not default to the external paas-main-front dev server');
    mustNotInclude(content, 'paas-main-front', 'host bridge should not reference the external checkout');
  }

  if (relativePath === '../vendor/online-form-designer/README.md') {
    mustInclude(content, 'Make designer changes in this directory only', 'vendor copy should document the local-only edit boundary');
  }

  if (relativePath === '../vendor/online-form-designer/package.json') {
    mustInclude(content, 'dev:online-form', 'vendor designer should provide its own dev command');
    mustInclude(content, 'build:online-form', 'vendor designer should provide its own build command');
    mustInclude(content, '--port 3100', 'vendor dev server should match the host proxy default');
    mustInclude(content, '--base /template-designer-runtime/', 'vendor dev server should keep Vite root assets under the proxied runtime prefix');
  }

  if (relativePath.endsWith('src/projects/online-form/main.ts')) {
    mustInclude(content, "import { setupRouter } from '/@online-form/router'", 'online-form entry should mount the online-form router');
    mustNotInclude(content, "import { setupRouter } from '/@developer-center/router'", 'online-form entry should not mount the developer-center router');
    mustInclude(content, 'isHostedDesignerMode', 'online-form entry should recognize hosted designer mode');
    mustInclude(content, 'setupI18n(app, { loadRemote: !hostedDesignerMode })', 'hosted designer mode should not load standalone remote i18n settings');
    mustInclude(content, 'if (!isHostedDesignerMode())', 'hosted designer mode should skip standalone platform setting loading');
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
    mustInclude(content, 'v-if="!hostedDesigner"', 'hosted designer should not render the embedded designer header');
    mustInclude(content, 'activeTab', 'hosted designer entry should manage the active center tab state');
    mustInclude(content, '建模设计', 'hosted designer entry should provide the model design view content');
    mustInclude(content, '流程设计', 'hosted designer entry should provide the process design view content');
  }

  if (relativePath.endsWith('template-designer-host.ts')) {
    mustInclude(content, 'setCallback', 'migrated designer bridge should wire the hosted save callback');
    mustInclude(content, 'sheetsHasChanged', 'migrated designer bridge should inspect spreadsheet dirty state');
    mustInclude(content, 'save', 'migrated designer bridge should expose save for the host header button');
    mustInclude(content, "data.type === 'save'", 'migrated designer bridge should handle host-triggered save requests');
    mustInclude(content, "data.type === 'set-active-tab'", 'migrated designer bridge should handle host-triggered tab changes');
    mustInclude(content, "data.type === 'import-template'", 'migrated designer bridge should handle host-triggered template import');
    mustInclude(content, "data.type === 'simulate-fill'", 'migrated designer bridge should handle host-triggered mock fill');
    mustInclude(content, 'save-request', 'migrated designer bridge should emit save requests');
    mustInclude(content, 'dirty-change', 'migrated designer bridge should report dirty state');
    mustInclude(content, 'close-request', 'migrated designer bridge should ask the host to close');
  }

  if (relativePath.endsWith('template-designer-protocol.ts')) {
    mustInclude(content, "type: 'set-active-tab'; tab: TemplateDesignerTabKey", 'host/child protocol should support hosted tab switching');
    mustInclude(content, "type: 'import-template'", 'host/child protocol should support hosted template import');
    mustInclude(content, "type: 'simulate-fill'", 'host/child protocol should support hosted mock fill');
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
