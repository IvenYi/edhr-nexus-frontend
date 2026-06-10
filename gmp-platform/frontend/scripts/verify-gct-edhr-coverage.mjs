import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptsDir, '..');
const workspaceRoot = resolve(projectRoot, '..', '..');

const EXPECTED_PAGE_COUNT = 99;
const EXPECTED_SCHEMA_VERSION = '1.0.0';
const EXPECTED_SOURCE_FILE = 'GCT_eDHR_功能详细规格与AI实现提示词.md';
const EXPECTED_MODULE_COUNTS = {
  操作面板: 1,
  基础建模: 24,
  生产管理: 13,
  检验管理: 10,
  放行管理: 4,
  记录管理: 17,
  统计报表: 17,
  系统管理: 13,
};

const EXPECTED_TYPE_COUNTS = {
  master: 40,
  list: 22,
  report: 11,
  transaction: 9,
  execution: 8,
  approval: 6,
  dashboard: 3,
};

const EXPECTED_DEMO_CHAIN_STEPS = [
  '基础建模',
  '工单',
  '批次/SN',
  '生产执行',
  '检验执行',
  '放行',
  '表单/DHR',
  '打印',
  '追溯报表',
];

const SYSTEM_FIELDS = [
  'id',
  'tenantId',
  'status',
  'createdBy',
  'createdAt',
  'updatedBy',
  'updatedAt',
  'remark',
];

const VALID_PAGE_TYPES = new Set(Object.keys(EXPECTED_TYPE_COUNTS));
const SEMANTIC_TRANSITION_ACTION_CODES = new Set([
  'release',
  'withdraw',
  'finish',
  'transfer',
  'reset_password',
  'approve',
  'reject',
  'submit',
  'process',
  'disable',
  'enable',
  'delete',
  'copy',
  'version_create',
  'version_copy',
  'print',
  'download',
  'export',
  'import',
  'publish',
  'unpublish',
  'save',
  'configure',
]);

const generatedPagesFile = resolve(projectRoot, 'src/features/gct-edhr/metadata/generatedPages.ts');
const generatedMenusFile = resolve(projectRoot, 'src/features/gct-edhr/metadata/generatedMenus.ts');
const typesFile = resolve(projectRoot, 'src/features/gct-edhr/types.ts');
const genericEdhrPageFile = resolve(projectRoot, 'src/features/gct-edhr/pages/GenericEdhrPage.tsx');
const demoChainPanelFile = resolve(projectRoot, 'src/features/gct-edhr/components/DemoChainPanel.tsx');
const routerFile = resolve(projectRoot, 'src/router/index.tsx');
const constantsFile = resolve(projectRoot, 'src/utils/constants.ts');
const appLayoutFile = resolve(projectRoot, 'src/components/shared/AppLayout.tsx');
const packageJsonFile = resolve(projectRoot, 'package.json');
const backendSpecFile = resolve(
  workspaceRoot,
  'gmp-platform/backend/src/main/resources/gct/gct-page-specs.json',
);
const generatorFile = resolve(workspaceRoot, 'scripts/gct/generate-gct-specs.mjs');
const sourceSpecFile = resolve(workspaceRoot, EXPECTED_SOURCE_FILE);
const task3MockFiles = {
  fieldInfer: resolve(projectRoot, 'src/features/gct-edhr/utils/fieldInfer.ts'),
  actionPolicy: resolve(projectRoot, 'src/features/gct-edhr/utils/actionPolicy.ts'),
  mockDataFactory: resolve(projectRoot, 'src/features/gct-edhr/utils/mockDataFactory.ts'),
  mockEdhrClient: resolve(projectRoot, 'src/features/gct-edhr/api/mockEdhrClient.ts'),
  mockEdhrStore: resolve(projectRoot, 'src/features/gct-edhr/store/mockEdhrStore.ts'),
};
const task4GenericUiFiles = {
  EdhrQueryBar: resolve(projectRoot, 'src/features/gct-edhr/components/EdhrQueryBar.tsx'),
  EdhrDataTable: resolve(projectRoot, 'src/features/gct-edhr/components/EdhrDataTable.tsx'),
  EdhrToolbar: resolve(projectRoot, 'src/features/gct-edhr/components/EdhrToolbar.tsx'),
  PermissionButton: resolve(projectRoot, 'src/features/gct-edhr/components/PermissionButton.tsx'),
  DetailDrawer: resolve(projectRoot, 'src/features/gct-edhr/components/DetailDrawer.tsx'),
  FormDialog: resolve(projectRoot, 'src/features/gct-edhr/components/FormDialog.tsx'),
  StateTransitionDialog: resolve(projectRoot, 'src/features/gct-edhr/components/StateTransitionDialog.tsx'),
  AuditPanel: resolve(projectRoot, 'src/features/gct-edhr/components/AuditPanel.tsx'),
  ExecutionPanel: resolve(projectRoot, 'src/features/gct-edhr/components/adapters/ExecutionPanel.tsx'),
  ApprovalPanel: resolve(projectRoot, 'src/features/gct-edhr/components/adapters/ApprovalPanel.tsx'),
  ReportPanel: resolve(projectRoot, 'src/features/gct-edhr/components/adapters/ReportPanel.tsx'),
  DashboardPanel: resolve(projectRoot, 'src/features/gct-edhr/components/adapters/DashboardPanel.tsx'),
  DemoChainPanel: resolve(projectRoot, 'src/features/gct-edhr/components/DemoChainPanel.tsx'),
};

const requiredFiles = [
  generatedPagesFile,
  generatedMenusFile,
  typesFile,
  genericEdhrPageFile,
  demoChainPanelFile,
  routerFile,
  constantsFile,
  appLayoutFile,
  packageJsonFile,
  backendSpecFile,
  generatorFile,
  sourceSpecFile,
];

const failures = [];

for (const filePath of requiredFiles) {
  if (!existsSync(filePath)) {
    failures.push(`missing required file: ${filePath}`);
  }
}

if (failures.length) {
  reportAndExit(failures);
}

const spec = readJson(backendSpecFile);
const packageJson = readJson(packageJsonFile);
const pagesSource = readFileSync(generatedPagesFile, 'utf8');
const menusSource = readFileSync(generatedMenusFile, 'utf8');
const typesSource = readFileSync(typesFile, 'utf8');
const genericEdhrPageSource = readFileSync(genericEdhrPageFile, 'utf8');
const demoChainPanelSource = readFileSync(demoChainPanelFile, 'utf8');
const routerSource = readFileSync(routerFile, 'utf8');
const constantsSource = readFileSync(constantsFile, 'utf8');
const appLayoutSource = readFileSync(appLayoutFile, 'utf8');
const sourceSpec = readFileSync(sourceSpecFile, 'utf8');
const sourceHash = sha256(sourceSpec);
const frontendPages = extractGeneratedJsonLiteral(pagesSource, 'GCT_EDHR_PAGES', failures);
const frontendMenuModule = extractGeneratedJsonLiteral(menusSource, 'GCT_EDHR_MENU_MODULE', failures);

verifyPackageJson(packageJson, failures);
verifySpecMetadata(spec, sourceHash, failures);

if (!pagesSource.includes('export const GCT_EDHR_PAGES')) {
  failures.push('generatedPages.ts is missing GCT_EDHR_PAGES export');
}

if (!menusSource.includes('export const GCT_EDHR_MENU_MODULE')) {
  failures.push('generatedMenus.ts is missing GCT_EDHR_MENU_MODULE export');
}

for (const token of [
  'EdhrPageMeta',
  'EdhrFieldMeta',
  'EdhrActionMeta',
  'EdhrAuditEntry',
  'EdhrStateTransition',
  'EdhrPageType',
]) {
  if (!typesSource.includes(token)) {
    failures.push(`types.ts is missing ${token}`);
  }
}

const pages = Array.isArray(spec.pages) ? spec.pages : [];
if (!Array.isArray(spec.pages)) {
  failures.push('backend JSON must expose a pages array');
}

if (spec.pageCount !== EXPECTED_PAGE_COUNT) {
  failures.push(`backend pageCount expected ${EXPECTED_PAGE_COUNT}, got ${spec.pageCount}`);
}

if (pages.length !== EXPECTED_PAGE_COUNT) {
  failures.push(`expected ${EXPECTED_PAGE_COUNT} pages, got ${pages.length}`);
}

compareCounts('module', countBy(pages, (page) => page.module), EXPECTED_MODULE_COUNTS, failures);
compareCounts('backend moduleCounts', spec.moduleCounts ?? {}, EXPECTED_MODULE_COUNTS, failures);
compareCounts('page type', countBy(pages, (page) => page.type), EXPECTED_TYPE_COUNTS, failures);
compareCounts('backend pageTypeCounts', spec.pageTypeCounts ?? {}, EXPECTED_TYPE_COUNTS, failures);

verifyPages(pages, failures);
verifyMenus(spec.menus, pages, failures);
verifyFrontendSources(pages, pagesSource, menusSource, failures);
verifyFrontendStructuredOutput(frontendPages, frontendMenuModule, spec, failures);
verifyTask2Integration(routerSource, constantsSource, appLayoutSource, failures);
verifyTask3MockLayer(task3MockFiles, failures);
await verifyTask3MockBehavior(failures);
verifyTask4GenericUi(genericEdhrPageSource, task4GenericUiFiles, failures);
await verifyTask6DemoChain(frontendPages, demoChainPanelSource, failures);

if (failures.length) {
  reportAndExit(failures);
}

console.log('GCT eDHR coverage verification passed.');
console.log(`- pages: ${pages.length}`);
console.log(`- modules: ${Object.entries(EXPECTED_MODULE_COUNTS).map(([name, count]) => `${name}=${count}`).join(', ')}`);
console.log(`- page types: ${Object.entries(EXPECTED_TYPE_COUNTS).map(([name, count]) => `${name}=${count}`).join(', ')}`);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    failures.push(`failed to read JSON ${filePath}: ${error instanceof Error ? error.message : error}`);
    return {};
  }
}

function verifyPackageJson(pkg, messages) {
  const expectedCommand = 'node scripts/verify-gct-edhr-coverage.mjs';
  if (pkg?.scripts?.['verify:gct-edhr'] !== expectedCommand) {
    messages.push(`package.json scripts.verify:gct-edhr must be "${expectedCommand}"`);
  }
}

function verifySpecMetadata(payload, expectedHash, messages) {
  if (payload.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    messages.push(
      `backend JSON schemaVersion expected ${EXPECTED_SCHEMA_VERSION}, got ${payload.schemaVersion ?? '<missing>'}`,
    );
  }
  if (payload.sourceFile !== EXPECTED_SOURCE_FILE) {
    messages.push(`backend JSON sourceFile expected ${EXPECTED_SOURCE_FILE}, got ${payload.sourceFile ?? '<missing>'}`);
  }
  if (payload.sourceHash !== expectedHash) {
    messages.push('backend JSON sourceHash must match the SHA-256 hash of the source markdown');
  }
  if (!payload.generatedAt || typeof payload.generatedAt !== 'string') {
    messages.push('backend JSON generatedAt must be a non-empty string');
  }
}

function extractGeneratedJsonLiteral(sourceText, exportName, messages) {
  const exportNeedle = `export const ${exportName}`;
  const exportIndex = sourceText.indexOf(exportNeedle);
  if (exportIndex < 0) {
    messages.push(`${exportName} export was not found`);
    return null;
  }

  const equalsIndex = sourceText.indexOf('=', exportIndex);
  if (equalsIndex < 0) {
    messages.push(`${exportName} export is missing an initializer`);
    return null;
  }

  const initializerOffset = sourceText.slice(equalsIndex + 1).search(/\S/);
  if (initializerOffset < 0) {
    messages.push(`${exportName} initializer is empty`);
    return null;
  }

  const start = equalsIndex + 1 + initializerOffset;
  const opener = sourceText[start];
  const closer = opener === '[' ? ']' : opener === '{' ? '}' : null;
  if (!closer) {
    messages.push(`${exportName} initializer must start with a JSON array or object literal`);
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;

  for (let index = start; index < sourceText.length; index += 1) {
    const char = sourceText[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === opener) {
      depth += 1;
    } else if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }

  if (end < 0) {
    messages.push(`${exportName} JSON literal is not balanced`);
    return null;
  }

  const literal = sourceText.slice(start, end);
  const tail = sourceText.slice(end).trimStart();
  if (!tail.startsWith('as const')) {
    messages.push(`${exportName} must be emitted as a JSON literal followed by "as const"`);
  }

  try {
    return JSON.parse(literal);
  } catch (error) {
    messages.push(`${exportName} JSON literal could not be parsed: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

function reportAndExit(messages) {
  console.error('GCT eDHR coverage verification failed:');
  messages.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function compareCounts(label, actual, expected, messages) {
  for (const [key, expectedCount] of Object.entries(expected)) {
    if (actual[key] !== expectedCount) {
      messages.push(`${label} count for ${key} expected ${expectedCount}, got ${actual[key] ?? 0}`);
    }
  }

  for (const [key, count] of Object.entries(actual)) {
    if (!(key in expected)) {
      messages.push(`${label} count has unexpected key ${key}=${count}`);
    }
  }
}

function verifyPages(pages, messages) {
  const seenPaths = new Set();
  const seenCodes = new Set();

  for (const page of pages) {
    const context = page.title || page.code || '<unknown page>';

    if (!page.code || seenCodes.has(page.code)) {
      messages.push(`duplicate or missing page code: ${page.code ?? context}`);
    }
    seenCodes.add(page.code);

    if (!page.path || seenPaths.has(page.path)) {
      messages.push(`duplicate or missing page path: ${page.path ?? context}`);
    }
    seenPaths.add(page.path);

    verifyPath(page, messages);

    if (!VALID_PAGE_TYPES.has(page.type)) {
      messages.push(`${context} has invalid page type: ${page.type}`);
    }

    for (const key of [
      'positioning',
      'businessScenario',
      'boundary',
      'interfaceSuggestion',
      'acceptanceCriteria',
      'aiPrompt',
      'stateFlow',
    ]) {
      if (!page[key] || typeof page[key] !== 'string') {
        messages.push(`${context} is missing preserved text field: ${key}`);
      }
    }

    if (!/[\u4e00-\u9fff]/.test(`${page.module}${page.title}${page.label}`)) {
      messages.push(`${context} does not preserve Chinese module/title/label text`);
    }

    if (!Array.isArray(page.apiSuggestions) || page.apiSuggestions.length === 0) {
      messages.push(`${context} must include apiSuggestions`);
    }

    verifyFields(page, messages);
    verifyActions(page, messages);
  }
}

function verifyPath(page, messages) {
  const context = page.title || page.code || '<unknown page>';
  const path = page.path ?? '';
  const parts = path.split('/').filter(Boolean);

  if (parts.length !== 4 || parts[0] !== 'gct-edhr') {
    messages.push(`${context} path must match /gct-edhr/<module>/<group>/<page>: ${path}`);
    return;
  }

  for (const part of parts.slice(1)) {
    if (!/^[a-z0-9-]+$/.test(part)) {
      messages.push(`${context} path segment must be lowercase ASCII kebab-case: ${path}`);
    }
    if (/^\d+(?:-\d+)*$/.test(part)) {
      messages.push(`${context} path segment must not be a bare section number: ${path}`);
    }
  }

  if (parts[1] !== page.moduleSlug || parts[2] !== page.groupSlug || parts[3] !== page.pageSlug) {
    messages.push(`${context} path tokens do not match module/group/page slugs: ${path}`);
  }
}

function verifyFields(page, messages) {
  const context = page.title || page.code || '<unknown page>';

  for (const key of ['queryFields', 'listFields', 'formFields', 'systemFields', 'fields']) {
    if (!Array.isArray(page[key])) {
      messages.push(`${context} ${key} must be an array`);
      return;
    }
    verifyNoDuplicateLabels(`${context} ${key}`, page[key], messages);
  }

  const systemLabels = new Set(page.systemFields.map((field) => field.label));
  for (const fieldName of SYSTEM_FIELDS) {
    if (!systemLabels.has(fieldName)) {
      messages.push(`${context} missing system field ${fieldName}`);
    }
  }

  const allFieldLabels = new Set(page.fields.map((field) => field.label));
  for (const fieldName of SYSTEM_FIELDS) {
    if (!allFieldLabels.has(fieldName)) {
      messages.push(`${context} fields array missing appended system field ${fieldName}`);
    }
  }

  for (const field of page.fields) {
    if (!field.id || !field.name || !field.label) {
      messages.push(`${context} has field with missing id/name/label`);
    }
    if (field.label.trim().startsWith('*')) {
      messages.push(`${context} has field label that still includes required marker: ${field.label}`);
    }
    if (typeof field.required !== 'boolean') {
      messages.push(`${context} field ${field.label} must have boolean required`);
    }
    if (typeof field.system !== 'boolean') {
      messages.push(`${context} field ${field.label} must have boolean system`);
    }
    if (!Array.isArray(field.usages) || field.usages.length === 0) {
      messages.push(`${context} field ${field.label} must have usages`);
    }
  }

  for (const field of page.systemFields) {
    if (!field.system || !field.usages.includes('system')) {
      messages.push(`${context} system field ${field.label} must be marked as system usage`);
    }
  }
}

function verifyActions(page, messages) {
  const context = page.title || page.code || '<unknown page>';

  if (!Array.isArray(page.actions)) {
    messages.push(`${context} actions must be an array extracted from 页面功能动作`);
    return;
  }

  if (page.actions.length === 0) return;

  verifyNoDuplicateLabels(`${context} actions`, page.actions, messages);

  for (const action of page.actions) {
    if (!action.id || !action.code || !action.label || !action.sourceLabel) {
      messages.push(`${context} has action with missing id/code/label/sourceLabel`);
    }
    if (!/^[a-z0-9_]+$/.test(action.code)) {
      messages.push(`${context} action code must be ASCII snake_case: ${action.code}`);
    }
    if (action.code.startsWith('item_')) {
      messages.push(`${context} action ${action.label} fell back to item_ hash code: ${action.code}`);
    }
    if (typeof action.permissionRequired !== 'boolean' || typeof action.auditRequired !== 'boolean') {
      messages.push(`${context} action ${action.label} must carry permission/audit booleans`);
    }
  }

  if (!Array.isArray(page.stateTransitions)) {
    messages.push(`${context} stateTransitions must be an array`);
    return;
  }

  const transitionActions = new Set(page.stateTransitions.map((transition) => transition.action));
  for (const action of page.actions) {
    if (isSemanticTransitionAction(action.code) && !transitionActions.has(action.code)) {
      messages.push(`${context} stateTransitions missing semantic action ${action.code}`);
    }
  }
}

function isSemanticTransitionAction(actionCode) {
  return (
    SEMANTIC_TRANSITION_ACTION_CODES.has(actionCode) ||
    actionCode.endsWith('_import') ||
    actionCode.endsWith('_export') ||
    actionCode.endsWith('_download') ||
    actionCode.endsWith('_print') ||
    actionCode.endsWith('_configure')
  );
}

function verifyNoDuplicateLabels(context, items, messages) {
  const labels = new Set();
  for (const item of items) {
    if (labels.has(item.label)) {
      messages.push(`${context} has duplicate label: ${item.label}`);
    }
    labels.add(item.label);
  }
}

function verifyMenus(menus, pages, messages) {
  if (!Array.isArray(menus)) {
    messages.push('backend JSON must expose a menus array');
    return;
  }

  const expectedModules = Object.keys(EXPECTED_MODULE_COUNTS);
  if (menus.length !== expectedModules.length) {
    messages.push(`menus must contain ${expectedModules.length} first-level business modules, got ${menus.length}`);
  }

  const pagePaths = new Set(pages.map((page) => page.path));
  const menuLeafPaths = new Set();

  expectedModules.forEach((moduleLabel, index) => {
    const menu = menus[index];
    if (!menu) return;

    if (menu.label !== moduleLabel) {
      messages.push(`menu ${index + 1} expected label ${moduleLabel}, got ${menu.label}`);
    }

    const children = Array.isArray(menu.children) ? menu.children : [];
    if (children.length !== EXPECTED_MODULE_COUNTS[moduleLabel]) {
      messages.push(
        `menu ${moduleLabel} expected ${EXPECTED_MODULE_COUNTS[moduleLabel]} children, got ${children.length}`,
      );
    }

    verifyNoDuplicateLabels(`menu ${moduleLabel} children`, children, messages);

    for (const child of children) {
      if (!pagePaths.has(child.path)) {
        messages.push(`menu leaf path has no page metadata: ${child.path}`);
      }
      menuLeafPaths.add(child.path);
    }
  });

  for (const pagePath of pagePaths) {
    if (!menuLeafPaths.has(pagePath)) {
      messages.push(`page path missing from backend menu leaves: ${pagePath}`);
    }
  }
}

function verifyFrontendSources(pages, pagesSourceText, menusSourceText, messages) {
  const pagePaths = new Set(pages.map((page) => page.path));
  const pageSourcePaths = extractPathTokens(pagesSourceText);
  const menuSourcePaths = extractPathTokens(menusSourceText);

  if (!menusSourceText.includes('"id": "gct-edhr"')) {
    messages.push('generatedMenus.ts must define module id gct-edhr');
  }
  if (!menusSourceText.includes('"label": "GCT"')) {
    messages.push('generatedMenus.ts must define module label GCT');
  }
  if (!menusSourceText.includes('"icon": "Dashboard"')) {
    messages.push('generatedMenus.ts must define module icon Dashboard');
  }

  comparePathSet('generatedPages.ts path tokens', pageSourcePaths, pagePaths, messages);
  comparePathSet('generatedMenus.ts path tokens', menuSourcePaths, pagePaths, messages);
}

function verifyFrontendStructuredOutput(frontendPages, frontendMenuModule, backendPayload, messages) {
  const backendPages = Array.isArray(backendPayload.pages) ? backendPayload.pages : [];
  if (!Array.isArray(frontendPages)) {
    messages.push('generatedPages.ts GCT_EDHR_PAGES must parse to an array');
    return;
  }

  if (!frontendMenuModule || typeof frontendMenuModule !== 'object' || Array.isArray(frontendMenuModule)) {
    messages.push('generatedMenus.ts GCT_EDHR_MENU_MODULE must parse to an object');
    return;
  }

  if (frontendPages.length !== backendPages.length) {
    messages.push(`frontend pages count ${frontendPages.length} does not match backend ${backendPages.length}`);
  }

  const frontendByCode = new Map(frontendPages.map((page) => [page.code, page]));

  for (const backendPage of backendPages) {
    const frontendPage = frontendByCode.get(backendPage.code);
    if (!frontendPage) {
      messages.push(`generatedPages.ts missing page code ${backendPage.code}`);
      continue;
    }

    if (frontendPage.path !== backendPage.path) {
      messages.push(`page ${backendPage.code} path mismatch between frontend and backend`);
    }

    for (const key of ['queryFields', 'listFields', 'formFields', 'systemFields', 'fields', 'actions']) {
      const frontendCount = Array.isArray(frontendPage[key]) ? frontendPage[key].length : -1;
      const backendCount = Array.isArray(backendPage[key]) ? backendPage[key].length : -1;
      if (frontendCount !== backendCount) {
        messages.push(
          `page ${backendPage.code} ${key} count mismatch between frontend ${frontendCount} and backend ${backendCount}`,
        );
      }
    }
  }

  for (const frontendPage of frontendPages) {
    if (!backendPages.some((backendPage) => backendPage.code === frontendPage.code)) {
      messages.push(`generatedPages.ts has extra page code ${frontendPage.code}`);
    }
  }

  verifyStructuredMenu(frontendMenuModule, backendPayload.menus, messages);
}

function verifyStructuredMenu(frontendMenuModule, backendMenus, messages) {
  if (frontendMenuModule.id !== 'gct-edhr') {
    messages.push(`frontend menu module id expected gct-edhr, got ${frontendMenuModule.id}`);
  }
  if (frontendMenuModule.label !== 'GCT') {
    messages.push(`frontend menu module label expected GCT, got ${frontendMenuModule.label}`);
  }
  if (frontendMenuModule.icon !== 'Dashboard') {
    messages.push(`frontend menu module icon expected Dashboard, got ${frontendMenuModule.icon}`);
  }

  const frontendMenus = Array.isArray(frontendMenuModule.menus) ? frontendMenuModule.menus : [];
  if (!Array.isArray(backendMenus)) {
    messages.push('backend menus must be an array before frontend menu comparison');
    return;
  }

  if (frontendMenus.length !== backendMenus.length) {
    messages.push(`frontend menu count ${frontendMenus.length} does not match backend ${backendMenus.length}`);
  }

  backendMenus.forEach((backendMenu, index) => {
    const frontendMenu = frontendMenus[index];
    if (!frontendMenu) return;

    if (frontendMenu.label !== backendMenu.label) {
      messages.push(`frontend menu ${index + 1} label ${frontendMenu.label} does not match backend ${backendMenu.label}`);
    }

    const frontendChildren = Array.isArray(frontendMenu.children) ? frontendMenu.children : [];
    const backendChildren = Array.isArray(backendMenu.children) ? backendMenu.children : [];
    const frontendLeaves = new Set(frontendChildren.map((child) => `${child.label}\u0000${child.path}`));
    const backendLeaves = new Set(backendChildren.map((child) => `${child.label}\u0000${child.path}`));

    comparePathSet(`frontend menu ${backendMenu.label} leaf label+path`, frontendLeaves, backendLeaves, messages);
  });
}

function verifyTask2Integration(routerSourceText, constantsSourceText, appLayoutSourceText, messages) {
  if (!/const\s+GenericEdhrPage\s*=\s*lazy\(/.test(routerSourceText)) {
    messages.push('router index.tsx must lazy import GenericEdhrPage');
  }
  if (!/<Route\s+path=["']gct-edhr\/\*["']/.test(routerSourceText)) {
    messages.push('router index.tsx must mount a protected gct-edhr/* route');
  }

  if (!/import\s*\{\s*GCT_EDHR_MENU_MODULE\s*\}\s*from\s*['"]@\/features\/gct-edhr\/metadata\/generatedMenus['"]/.test(constantsSourceText)) {
    messages.push('constants.ts must import GCT_EDHR_MENU_MODULE from generatedMenus');
  }
  if (!/SIDEBAR_MODULES[\s\S]*GCT_EDHR_MENU_MODULE[\s\S]*\]\s*;/.test(constantsSourceText)) {
    messages.push('constants.ts must append GCT_EDHR_MENU_MODULE to SIDEBAR_MODULES');
  }

  if (!/interface\s+RenderedMenu\s*{[\s\S]*parentLabel\?:\s*string[\s\S]*}/.test(appLayoutSourceText)) {
    messages.push('AppLayout must define RenderedMenu for flattened second-level menu items');
  }
  if (!/function\s+flattenModuleMenus\s*\(\s*menus:\s*SidebarMenu\[\]\s*\):\s*RenderedMenu\[\]/.test(appLayoutSourceText)) {
    messages.push('AppLayout must define flattenModuleMenus(menus: SidebarMenu[]): RenderedMenu[]');
  }
  if (!appLayoutSourceText.includes('return menus.flatMap((menu) => {')) {
    messages.push('AppLayout flattenModuleMenus must flatten parent menu groups into one rendered list');
  }
  if (!appLayoutSourceText.includes('const renderedMenus = useMemo(() => flattenModuleMenus(activeModule.menus), [activeModule]);')) {
    messages.push('AppLayout must memoize renderedMenus from flattenModuleMenus(activeModule.menus)');
  }
  if (!appLayoutSourceText.includes('{activeModule.label}')) {
    messages.push('AppLayout function menu heading must render activeModule.label');
  }
  if (!appLayoutSourceText.includes('renderedMenus.map((menu)')) {
    messages.push('AppLayout function menu must render renderedMenus instead of nested menu groups');
  }
  for (const forbiddenNestedMenuSnippet of [
    'getMenuExpansionKey',
    'expandedMenus',
    'handleToggleMenu',
    'Collapse',
    'ExpandLess',
    'ExpandMore',
  ]) {
    if (appLayoutSourceText.includes(forbiddenNestedMenuSnippet)) {
      messages.push(`AppLayout must not keep third-level expandable menu behavior: ${forbiddenNestedMenuSnippet}`);
    }
  }

  if (!/function\s+isPathSegmentMatch\s*\(\s*pathname:\s*string,\s*prefix:\s*string\s*\)/.test(appLayoutSourceText)) {
    messages.push('AppLayout must define isPathSegmentMatch(pathname, prefix)');
  }
  if (!appLayoutSourceText.includes('pathname === prefix') || !appLayoutSourceText.includes('pathname.startsWith(`${prefix}/`)')) {
    messages.push('AppLayout path matching helper must require exact match or a following slash segment');
  }
  for (const rawPathSnippet of [
    "pathname.startsWith('/master-data')",
    "pathname.startsWith('/workflow')",
    "pathname.startsWith('/system')",
    "pathname.startsWith('/gct-edhr')",
    'pathname.startsWith(menuPath)',
  ]) {
    if (appLayoutSourceText.includes(rawPathSnippet)) {
      messages.push(`AppLayout must not use bare startsWith for path matching: ${rawPathSnippet}`);
    }
  }
  if (!/isPathSegmentMatch\(pathname,\s*['"]\/gct-edhr['"]\)\)\s*return\s+['"]gct-edhr['"]/.test(appLayoutSourceText)) {
    messages.push("AppLayout getModuleIdByPath must map only the /gct-edhr segment to module id 'gct-edhr'");
  }
  if (!/return\s+isPathSegmentMatch\(pathname,\s*menuPath\)/.test(appLayoutSourceText)) {
    messages.push('AppLayout matchPath must use segment-boundary matching for menu paths');
  }
}

function verifyTask3MockLayer(files, messages) {
  const sources = {};

  for (const [name, filePath] of Object.entries(files)) {
    if (!existsSync(filePath)) {
      messages.push(`Task 3 mock layer missing ${name}: ${filePath}`);
      continue;
    }
    sources[name] = readFileSync(filePath, 'utf8');
  }

  if (Object.keys(sources).length !== Object.keys(files).length) {
    return;
  }

  requireTokens('fieldInfer.ts', sources.fieldInfer, [
    'inferEdhrFieldType',
    'createDeterministicMockValue',
    'date',
    'datetime',
    'number',
    'status',
    'user',
    'code',
    'text',
    'textarea',
    'select',
  ], messages);

  requireTokens('actionPolicy.ts', sources.actionPolicy, [
    'getActionPolicy',
    'getDisplayActionsForPage',
    'ACTION_POLICY_MAP',
    'query',
    'reset',
    'create',
    'detail',
    'edit',
    'delete',
    'disable',
    'enable',
    'copy',
    'version_create',
    'version_copy',
    'process',
    'finish',
    'approve',
    'reject',
    'release',
    'withdraw',
    'transfer',
    'reset_password',
    'print',
    'download',
    'export',
    'import',
    'publish',
    'unpublish',
    'save',
    'configure',
    'execution',
    'approval',
    'report',
    'dashboard',
  ], messages);

  requireTokens('mockDataFactory.ts', sources.mockDataFactory, [
    'MOCK_RECORDS_PER_PAGE',
    'generateMockRecordsForPage',
    'generateMockRecordsByPage',
    'createDeterministicRecord',
    'createDeterministicMockValue',
    'EdhrRecord',
    'tenantId',
    'pageCode',
    'createdBy',
    'createdAt',
    'updatedBy',
    'updatedAt',
    'values',
  ], messages);

  requireTokens('mockEdhrClient.ts', sources.mockEdhrClient, [
    'queryRecords',
    'pageSize',
    'filters',
    'sortField',
    'sortDirection',
    'applyFilters',
    'applySorting',
    'getRecord',
    'createRecord',
    'updateRecord',
    'deleteRecord',
    'executeAction',
    'appendAuditEntry',
    'appendStatusHistory',
    'getAuditEntries',
    'getStatusHistory',
    'version_create',
    'version_copy',
    'copy',
    '已删除',
    '禁用',
    'recordSequence',
    'timeSequence',
  ], messages);

  requireTokens('mockEdhrStore.ts', sources.mockEdhrStore, [
    'create<GctEdhrMockStoreState>',
    'loadPage',
    'setQuery',
    'resetQuery',
    'setPagination',
    'setSorting',
    'selectRecord',
    'createRecord',
    'updateRecord',
    'deleteRecord',
    'executeAction',
    'loadAuditTrail',
    'records',
    'total',
    'loading',
    'query',
    'pagination',
    'sorting',
    'selectedRecord',
    'auditEntries',
    'statusHistory',
    'lastActionResult',
    'loadPageRequestSeq',
    'auditTrailRequestSeq',
    'selectRecordRequestSeq',
    'requestId',
  ], messages);
}

function verifyTask4GenericUi(genericPageSourceText, files, messages) {
  const sources = {};

  for (const [name, filePath] of Object.entries(files)) {
    if (!existsSync(filePath)) {
      messages.push(`Task 4 generic UI missing ${name}: ${filePath}`);
      continue;
    }
    sources[name] = readFileSync(filePath, 'utf8');
  }

  requireTokens('GenericEdhrPage.tsx', genericPageSourceText, [
    'useMockEdhrStore',
    'GCT_EDHR_PAGES',
    'getDisplayActionsForPage',
    'getActionPolicy',
    'useLocation',
    'useEffect',
    'useRef',
    'loadPage',
    'setQuery',
    'resetQuery',
    'setPagination',
    'setSorting',
    'selectRecord',
    'createRecord',
    'updateRecord',
    'deleteRecord',
    'executeAction',
    'auditEntries',
    'statusHistory',
    'EdhrQueryBar',
    'EdhrToolbar',
    'EdhrDataTable',
    'DetailDrawer',
    'FormDialog',
    'StateTransitionDialog',
    'ExecutionPanel',
    'ApprovalPanel',
    'ReportPanel',
    'DashboardPanel',
    'DemoChainPanel',
    'targetStatus',
    'selectRecordRequestRef',
    'requestId',
  ], messages);

  if (/页面占位|<Typography[^>]*>\s*GCT eDHR\s*<\/Typography>/.test(genericPageSourceText)) {
    messages.push('GenericEdhrPage.tsx must render a functional GCT eDHR workbench instead of the placeholder page');
  }

  if (!genericPageSourceText.includes('page.path') || !genericPageSourceText.includes('location.pathname')) {
    messages.push('GenericEdhrPage.tsx must resolve page metadata from location.pathname and page.path');
  }

  if (!genericPageSourceText.includes('NotFound') && !genericPageSourceText.includes('未找到')) {
    messages.push('GenericEdhrPage.tsx must render a NotFound-style empty state when page metadata is missing');
  }

  if (!/getActionPolicy\(action\.code\)[\s\S]{0,600}targetStatus/.test(genericPageSourceText)) {
    messages.push('GenericEdhrPage.tsx must use getActionPolicy(action.code).targetStatus to route semantic state actions');
  }
  if (/stateTransitionActions\.has\(action\.code\)/.test(genericPageSourceText)) {
    messages.push('GenericEdhrPage.tsx must not route state transitions only through a hard-coded action set');
  }
  if (!/const\s+requestId\s*=\s*\+\+selectRecordRequestRef\.current/.test(genericPageSourceText)) {
    messages.push('GenericEdhrPage.tsx handleSelectRecord must guard async selectRecord with a request sequence ref');
  }
  if (!/selectRecordRequestRef\.current\s*===\s*requestId/.test(genericPageSourceText)) {
    messages.push('GenericEdhrPage.tsx handleSelectRecord must check the latest request before opening detail drawer');
  }

  if (!sources.EdhrQueryBar || !sources.EdhrDataTable || !sources.EdhrToolbar || !sources.DetailDrawer) {
    return;
  }

  requireTokens('EdhrQueryBar.tsx', sources.EdhrQueryBar, [
    'page.queryFields',
    'setQuery',
    'resetQuery',
    'TextField',
    '查询',
    '重置',
  ], messages);
  if (/fieldType === ['"]number['"]\s*\?\s*Number\(event\.target\.value\)/.test(sources.EdhrQueryBar)) {
    messages.push('EdhrQueryBar.tsx number query fields must not convert an empty input with Number(event.target.value)');
  }
  if (!/event\.target\.value\s*===\s*['"]{2}/.test(sources.EdhrQueryBar)) {
    messages.push('EdhrQueryBar.tsx must preserve empty number input as an empty filter value');
  }

  requireTokens('EdhrToolbar.tsx', sources.EdhrToolbar, [
    'getDisplayActionsForPage',
    'PermissionButton',
    'page.title',
    'page.type',
    'page.baseStatuses',
    'page.businessStatuses',
  ], messages);

  requireTokens('PermissionButton.tsx', sources.PermissionButton ?? '', [
    '@mui/icons-material',
    'Tooltip',
    'IconButton',
    'getActionLabel',
    'getActionPolicy',
  ], messages);

  requireTokens('EdhrDataTable.tsx', sources.EdhrDataTable, [
    'page.listFields',
    'page.formFields',
    'TableSortLabel',
    'TablePagination',
    'setPagination',
    'setSorting',
    'selectRecord',
    'PermissionButton',
  ], messages);

  requireTokens('DetailDrawer.tsx', sources.DetailDrawer, [
    'Drawer',
    'AuditPanel',
    'auditEntries',
    'statusHistory',
    'page.systemFields',
    'selectedRecord',
  ], messages);

  requireTokens('FormDialog.tsx', sources.FormDialog ?? '', [
    'createRecord',
    'updateRecord',
    'executeAction',
    'copy',
    'version',
    'page.formFields',
    'TextField',
  ], messages);

  requireTokens('StateTransitionDialog.tsx', sources.StateTransitionDialog ?? '', [
    'executeAction',
    'deleteRecord',
    'remark',
    'process',
    'finish',
    'approve',
    'reject',
    'release',
    'withdraw',
    'transfer',
    'disable',
    'enable',
    'validationError',
    'setValidationError',
    'isConfirmDisabled',
    'isRemarkRequired',
    'extraField.required',
    'extraValue.trim',
    'remark.trim',
  ], messages);
  if (!/disabled=\{[\s\S]{0,160}isConfirmDisabled/.test(sources.StateTransitionDialog ?? '')) {
    messages.push('StateTransitionDialog.tsx confirm button must be disabled when required validation fails');
  }

  requireTokens('AuditPanel.tsx', sources.AuditPanel ?? '', [
    'auditEntries',
    'statusHistory',
    'Accordion',
    'List',
    'beforeValue',
    'afterValue',
    '变更前',
    '变更后',
    'JSON.stringify',
  ], messages);

  requireTokens('ExecutionPanel.tsx', sources.ExecutionPanel ?? '', [
    '扫码',
    '当前工序',
    '执行进度',
    'PermissionButton',
  ], messages);

  requireTokens('ApprovalPanel.tsx', sources.ApprovalPanel ?? '', [
    '审批队列',
    'approve',
    'reject',
    'PermissionButton',
  ], messages);

  requireTokens('ReportPanel.tsx', sources.ReportPanel ?? '', [
    '指标摘要',
    'export',
    'download',
    'records',
  ], messages);

  requireTokens('DashboardPanel.tsx', sources.DashboardPanel ?? '', [
    'KPI',
    '待办',
    '趋势',
    'records',
  ], messages);

  requireTokens('DemoChainPanel.tsx', sources.DemoChainPanel ?? '', [
    'GCT_EDHR_DEMO_CHAIN_STEPS',
    '基础建模',
    '工单',
    '批次/SN',
    '生产执行',
    '检验执行',
    '放行',
    '表单/DHR',
    '打印',
    '追溯报表',
    'useNavigate',
  ], messages);
}

async function verifyTask6DemoChain(frontendPages, demoChainSourceText, messages) {
  if (!Array.isArray(frontendPages)) {
    messages.push('Task 6 demo chain cannot run without frontend pages metadata');
    return;
  }

  if (!demoChainSourceText.includes('export const GCT_EDHR_DEMO_CHAIN_STEPS')) {
    messages.push('DemoChainPanel.tsx must export GCT_EDHR_DEMO_CHAIN_STEPS for automated demo-chain verification');
    return;
  }

  if (/\?\?\s*currentPage|\?\?\s*GCT_EDHR_PAGES\[[^\]]+\]/.test(demoChainSourceText)) {
    messages.push('DemoChainPanel.tsx must not fall back to currentPage or the first GCT page when a demo-chain pageCode is invalid');
  }

  const tempDir = mkdtempSync(resolve(tmpdir(), 'gct-edhr-demo-chain-probe-'));
  const entryFile = resolve(tempDir, 'probe.ts');
  const bundleFile = resolve(tempDir, 'probe.mjs');

  writeFileSync(entryFile, createTask6DemoChainProbeSource(), 'utf8');

  try {
    const { build } = await import('esbuild');
    await build({
      entryPoints: [entryFile],
      outfile: bundleFile,
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node20',
      absWorkingDir: projectRoot,
      logLevel: 'silent',
    });

    const probeModule = await import(pathToFileURL(bundleFile).href);
    const probeFailures = Array.isArray(probeModule.failures) ? probeModule.failures : [];
    messages.push(...probeFailures.map((failure) => `Task 6 demo chain probe: ${failure}`));
  } catch (error) {
    messages.push(`Task 6 demo chain probe failed to execute: ${error instanceof Error ? error.message : error}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function requireTokens(label, sourceText, tokens, messages) {
  for (const token of tokens) {
    if (!sourceText.includes(token)) {
      messages.push(`${label} is missing Task 3 token: ${token}`);
    }
  }
}

async function verifyTask3MockBehavior(messages) {
  const tempDir = mkdtempSync(resolve(tmpdir(), 'gct-edhr-probe-'));
  const entryFile = resolve(tempDir, 'probe.ts');
  const bundleFile = resolve(tempDir, 'probe.mjs');

  writeFileSync(entryFile, createTask3ProbeSource(), 'utf8');

  try {
    const { build } = await import('esbuild');
    await build({
      entryPoints: [entryFile],
      outfile: bundleFile,
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node20',
      absWorkingDir: projectRoot,
      logLevel: 'silent',
    });

    const probeModule = await import(pathToFileURL(bundleFile).href);
    const probeFailures = Array.isArray(probeModule.failures) ? probeModule.failures : [];
    messages.push(...probeFailures.map((failure) => `Task 3 behavior probe: ${failure}`));
  } catch (error) {
    messages.push(`Task 3 behavior probe failed to execute: ${error instanceof Error ? error.message : error}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function createTask3ProbeSource() {
  return `
import { GCT_EDHR_PAGES } from ${JSON.stringify(generatedPagesFile)};
import { GctEdhrMockClient, mockEdhrClient } from ${JSON.stringify(task3MockFiles.mockEdhrClient)};
import { getDisplayActionsForPage } from ${JSON.stringify(task3MockFiles.actionPolicy)};
import { useMockEdhrStore } from ${JSON.stringify(task3MockFiles.mockEdhrStore)};

const probeFailures = [];

function assert(condition, message) {
  if (!condition) probeFailures.push(message);
}

function firstBusinessField(page) {
  return page.fields.find((field) => !field.system) ?? page.listFields.find((field) => !field.system);
}

function pickPage(predicate, label) {
  const page = GCT_EDHR_PAGES.find(predicate);
  assert(Boolean(page), 'missing probe page: ' + label);
  return page;
}

function compareDescending(values) {
  for (let index = 1; index < values.length; index += 1) {
    if (String(values[index - 1]).localeCompare(String(values[index]), 'zh-CN') < 0) return false;
  }
  return true;
}

function deterministicSnapshot(records) {
  return records.slice(0, 3).map((record) => ({
    id: record.id,
    status: record.status,
    createdAt: record.createdAt,
    values: record.values,
  }));
}

function sleep(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function expectReject(operation, message) {
  let rejected = false;
  try {
    await operation();
  } catch {
    rejected = true;
  }
  assert(rejected, message);
}

const listPage = pickPage((page) => page.listFields.length > 0, 'list fields');
if (listPage) {
  const client = new GctEdhrMockClient();
  const all = await client.queryRecords(listPage.code, { page: 1, pageSize: 50 });
  assert(all.total === 20, 'each page should seed 20 mock records');

  const deterministicClientA = new GctEdhrMockClient();
  const deterministicClientB = new GctEdhrMockClient();
  const deterministicA = await deterministicClientA.queryRecords(listPage.code, { page: 1, pageSize: 3 });
  const deterministicB = await deterministicClientB.queryRecords(listPage.code, { page: 1, pageSize: 3 });
  assert(
    JSON.stringify(deterministicSnapshot(deterministicA.records)) === JSON.stringify(deterministicSnapshot(deterministicB.records)),
    'independent clients should produce identical deterministic record snapshots',
  );

  const pageOne = await client.queryRecords(listPage.code, { page: 1, pageSize: 5 });
  const pageTwo = await client.queryRecords(listPage.code, { page: 2, pageSize: 5 });
  assert(pageOne.records.length === 5 && pageTwo.records.length === 5, 'pagination should return requested page size');
  assert(pageOne.records[0]?.id !== pageTwo.records[0]?.id, 'pagination page 2 should not repeat page 1 first record');

  const field = firstBusinessField(listPage);
  const filterValue = field ? all.records[0]?.values[field.name] : undefined;
  if (field && filterValue !== undefined) {
    const filtered = await client.queryRecords(listPage.code, {
      page: 1,
      pageSize: 50,
      filters: { [field.name]: String(filterValue).slice(0, 4) },
    });
    assert(filtered.total > 0, 'filtering should match deterministic field values');
    assert(filtered.records.every((record) => String(record.values[field.name]).includes(String(filterValue).slice(0, 4))), 'filtering should restrict records by field value');
  }

  const sorted = await client.queryRecords(listPage.code, {
    page: 1,
    pageSize: 20,
    sortField: 'createdAt',
    sortDirection: 'desc',
  });
  assert(compareDescending(sorted.records.map((record) => record.createdAt)), 'sorting desc should order by createdAt');
}

const offPageActionPage = pickPage(
  (page) => page.actions.length > 0 && !page.actions.some((action) => action.code === 'process'),
  'page that does not declare process action',
);
if (offPageActionPage) {
  const client = new GctEdhrMockClient();
  const pageResult = await client.queryRecords(offPageActionPage.code, { page: 1, pageSize: 1 });
  const record = pageResult.records[0];
  if (record) {
    await expectReject(
      () => client.executeAction(offPageActionPage.code, record.id, 'process', { remark: 'off-page action' }),
      'mock client should reject actions not declared by the current page metadata',
    );
    await expectReject(
      () => client.executeAction(offPageActionPage.code, record.id, 'unknown_action', { remark: 'unknown action' }),
      'mock client should reject unknown actions',
    );
  }
}

const deletePage = pickPage((page) => page.actions.some((action) => action.code === 'delete'), 'delete action');
if (deletePage) {
  const client = new GctEdhrMockClient();
  const before = await client.queryRecords(deletePage.code, { page: 1, pageSize: 5 });
  const record = before.records[0];
  await client.deleteRecord(deletePage.code, record.id);
  const hidden = await client.queryRecords(deletePage.code, { page: 1, pageSize: 50 });
  const deleted = await client.queryRecords(deletePage.code, { page: 1, pageSize: 50, filters: { status: '已删除' } });
  assert(!hidden.records.some((item) => item.id === record.id), 'logical delete should hide record by default');
  assert(deleted.records.some((item) => item.id === record.id), 'logical delete should be queryable with status=已删除');
}

const clonePage = pickPage((page) => page.actions.some((action) => action.code === 'copy'), 'copy action');
if (clonePage) {
  const client = new GctEdhrMockClient();
  const pageResult = await client.queryRecords(clonePage.code, { page: 1, pageSize: 1 });
  const source = pageResult.records[0];
  const field = firstBusinessField(clonePage);
  if (source && field) {
    const beforeSource = await client.getRecord(clonePage.code, source.id);
    const result = await client.executeAction(clonePage.code, source.id, 'copy', {
      values: { [field.name]: 'COPY_ONLY_VALUE' },
      remark: 'copy-only-remark',
      operatorName: '复制操作员',
    });
    const afterSource = await client.getRecord(clonePage.code, source.id);
    assert(Boolean(result.createdRecord), 'copy should return createdRecord');
    assert(result.createdRecord?.values[field.name] === 'COPY_ONLY_VALUE', 'copy input.values should be applied to createdRecord');
    assert(afterSource?.values[field.name] === beforeSource?.values[field.name], 'copy input.values must not mutate source record');
    assert(afterSource?.remark === beforeSource?.remark, 'copy remark must not mutate source record');
    assert(afterSource?.updatedAt === beforeSource?.updatedAt, 'copy must not update source updatedAt');
  }
}

if (clonePage) {
  const client = new GctEdhrMockClient();
  const pageResult = await client.queryRecords(clonePage.code, { page: 1, pageSize: 1 });
  const source = pageResult.records[0];
  if (source) {
    const nestedValue = { stage: 'before', items: [{ name: 'before-item' }] };
    await client.updateRecord(clonePage.code, source.id, {
      values: { nestedValue },
      remark: 'nested-snapshot',
      operatorName: '嵌套值操作员',
    });

    nestedValue.stage = 'after';
    nestedValue.items[0].name = 'after-item';

    const stored = await client.getRecord(clonePage.code, source.id);
    const storedNested = stored?.values.nestedValue;
    assert(storedNested?.stage === 'before', 'updateRecord should snapshot nested input values');
    assert(storedNested?.items?.[0]?.name === 'before-item', 'updateRecord should snapshot nested list input values');

    if (storedNested) {
      storedNested.stage = 'client-mutated';
      storedNested.items[0].name = 'client-mutated-item';
    }

    const storedAgain = await client.getRecord(clonePage.code, source.id);
    assert(storedAgain?.values.nestedValue?.stage === 'before', 'getRecord should return deep-cloned values');
    assert(storedAgain?.values.nestedValue?.items?.[0]?.name === 'before-item', 'getRecord should deep-clone nested list values');

    const audits = await client.getAuditEntries(clonePage.code, source.id);
    const editAudit = audits.find((entry) => entry.actionCode === 'edit' && entry.remark === 'nested-snapshot');
    const auditNested = editAudit?.afterValue?.values?.nestedValue;
    assert(auditNested?.stage === 'before', 'audit afterValue should snapshot nested values');
    assert(auditNested?.items?.[0]?.name === 'before-item', 'audit afterValue should snapshot nested list values');
  }
}

const versionPage = pickPage((page) => page.actions.some((action) => action.code === 'version_create' || action.code === 'version_copy'), 'version action');
if (versionPage) {
  const client = new GctEdhrMockClient();
  const actionCode = versionPage.actions.some((action) => action.code === 'version_copy') ? 'version_copy' : 'version_create';
  const pageResult = await client.queryRecords(versionPage.code, { page: 1, pageSize: 1 });
  const source = pageResult.records[0];
  const field = firstBusinessField(versionPage);
  if (source && field) {
    const beforeSource = await client.getRecord(versionPage.code, source.id);
    const result = await client.executeAction(versionPage.code, source.id, actionCode, {
      values: { [field.name]: 'VERSION_ONLY_VALUE' },
      remark: 'version-only-remark',
      operatorName: '版本操作员',
    });
    const afterSource = await client.getRecord(versionPage.code, source.id);
    assert(Boolean(result.createdRecord), 'version action should return createdRecord');
    assert(result.createdRecord?.values[field.name] === 'VERSION_ONLY_VALUE', 'version input.values should be applied to createdRecord');
    assert(afterSource?.values[field.name] === beforeSource?.values[field.name], 'version input.values must not mutate source record');
    assert(afterSource?.updatedAt === beforeSource?.updatedAt, 'version must not update source updatedAt');
  }
}

const detailPage = pickPage((page) => page.actions.some((action) => action.code === 'detail'), 'detail action');
if (detailPage) {
  const client = new GctEdhrMockClient();
  const pageResult = await client.queryRecords(detailPage.code, { page: 1, pageSize: 1 });
  const record = pageResult.records[0];
  const beforeHistory = await client.getStatusHistory(detailPage.code, record.id);
  const beforeAudit = await client.getAuditEntries(detailPage.code, record.id);
  const beforeRecord = await client.getRecord(detailPage.code, record.id);
  await client.executeAction(detailPage.code, record.id, 'detail');
  const afterHistory = await client.getStatusHistory(detailPage.code, record.id);
  const afterAudit = await client.getAuditEntries(detailPage.code, record.id);
  const afterRecord = await client.getRecord(detailPage.code, record.id);
  assert(afterHistory.length === beforeHistory.length, 'readonly detail should not append status history');
  assert(afterAudit.length === beforeAudit.length, 'auditRequired=false detail should not append audit');
  assert(afterRecord?.updatedAt === beforeRecord?.updatedAt, 'readonly detail should not update updatedAt');
  assert(afterRecord?.status === beforeRecord?.status, 'readonly detail should not change status');

  const wrongPage = GCT_EDHR_PAGES.find((page) => page.code !== detailPage.code);
  if (wrongPage) {
    await expectReject(
      () => client.getAuditEntries(wrongPage.code, record.id),
      'mock client should reject cross-page audit trail reads',
    );
    await expectReject(
      () => client.getStatusHistory(wrongPage.code, record.id),
      'mock client should reject cross-page status history reads',
    );
  }
}

const noActionListPage = pickPage((page) => page.type === 'list' && page.actions.length === 0, 'no-action list page');
if (noActionListPage) {
  const actionCodes = getDisplayActionsForPage(noActionListPage).map((action) => action.code);
  for (const code of ['query', 'reset', 'detail', 'export']) {
    assert(actionCodes.includes(code), 'no-action list fallback should include ' + code);
  }
}

if (clonePage) {
  const store = useMockEdhrStore;
  await store.getState().loadPage(clonePage.code);
  const state = store.getState();
  const source = state.records[0];
  const field = firstBusinessField(clonePage);
  if (source && field) {
    const result = await store.getState().executeAction(source.id, 'copy', {
      values: { [field.name]: 'STORE_COPY_VALUE' },
      remark: 'store-copy',
    });
    const afterState = store.getState();
    assert(Boolean(result.createdRecord), 'store copy should receive createdRecord');
    assert(afterState.selectedRecord?.id === result.createdRecord?.id, 'store copy should select createdRecord');
    assert(afterState.auditEntries.every((entry) => entry.recordId === result.createdRecord?.id), 'store copy auditTrail should point at createdRecord');
  }
}

if (listPage) {
  const store = useMockEdhrStore;
  await store.getState().loadPage(listPage.code);
  const raceRecords = store.getState().records.slice(0, 2);
  if (raceRecords.length === 2) {
    const [slowRecord, fastRecord] = raceRecords;
    const originalGetRecord = mockEdhrClient.getRecord.bind(mockEdhrClient);
    mockEdhrClient.getRecord = async (pageCode, recordId) => {
      if (recordId === slowRecord.id) await sleep(25);
      return originalGetRecord(pageCode, recordId);
    };

    try {
      const slowSelect = store.getState().selectRecord(slowRecord.id);
      const fastSelect = store.getState().selectRecord(fastRecord.id);
      await Promise.all([slowSelect, fastSelect]);
      assert(store.getState().selectedRecord?.id === fastRecord.id, 'selectRecord stale guard should preserve the latest selection');
    } finally {
      mockEdhrClient.getRecord = originalGetRecord;
    }
  }
}

const actionChainPage = pickPage((page) => ['query', 'reset', 'detail', 'process', 'finish']
  .every((code) => getDisplayActionsForPage(page).some((action) => action.code === code)), 'query/reset/detail/process/finish action chain');
if (actionChainPage) {
  const store = useMockEdhrStore;
  await store.getState().loadPage(actionChainPage.code);
  assert(store.getState().records.length > 0, 'store loadPage should execute query against action-chain page');
  const businessField = firstBusinessField(actionChainPage);
  const firstRecord = store.getState().records[0];
  if (businessField && firstRecord) {
    await store.getState().setQuery({ [businessField.name]: String(firstRecord.values[businessField.name]).slice(0, 4) });
    assert(Object.keys(store.getState().query).length === 1, 'store setQuery should keep query filters');
    await store.getState().resetQuery();
    assert(Object.keys(store.getState().query).length === 0, 'store resetQuery should clear query filters');
  }
  const record = store.getState().records[0];
  if (record) {
    await store.getState().selectRecord(record.id);
    assert(store.getState().selectedRecord?.id === record.id, 'store selectRecord should execute detail-equivalent record load');
    const detailResult = await store.getState().executeAction(record.id, 'detail');
    assert(detailResult.actionCode === 'detail', 'store executeAction should execute detail action');
    const processResult = await store.getState().executeAction(record.id, 'process', { remark: 'demo process' });
    assert(processResult.actionCode === 'process', 'store executeAction should execute process action');
    const finishResult = await store.getState().executeAction(record.id, 'finish', { remark: 'demo finish' });
    assert(finishResult.actionCode === 'finish', 'store executeAction should execute finish action');
    assert(store.getState().lastActionResult?.actionCode === 'finish', 'store should retain the latest action result after finish');
  }
}

export const failures = probeFailures;
`;
}

function createTask6DemoChainProbeSource() {
  return `
import { GCT_EDHR_PAGES } from ${JSON.stringify(generatedPagesFile)};
import { GCT_EDHR_DEMO_CHAIN_STEPS } from ${JSON.stringify(demoChainPanelFile)};

const probeFailures = [];
const expectedLabels = ${JSON.stringify(EXPECTED_DEMO_CHAIN_STEPS)};
const pageByCode = new Map(GCT_EDHR_PAGES.map((page) => [page.code, page]));

function assert(condition, message) {
  if (!condition) probeFailures.push(message);
}

assert(GCT_EDHR_PAGES.length === ${EXPECTED_PAGE_COUNT}, 'metadata should expose all ${EXPECTED_PAGE_COUNT} GCT pages');
assert(GCT_EDHR_PAGES.every((page) => page.path?.startsWith('/gct-edhr/')), 'every metadata path should be mounted under /gct-edhr/*');
assert(GCT_EDHR_DEMO_CHAIN_STEPS.length === expectedLabels.length, 'demo chain should contain exactly ' + expectedLabels.length + ' steps');
assert(
  JSON.stringify(GCT_EDHR_DEMO_CHAIN_STEPS.map((step) => step.label)) === JSON.stringify(expectedLabels),
  'demo chain labels should match the expected main flow order',
);

const seenPaths = new Set();
const seenCodes = new Set();
for (const step of GCT_EDHR_DEMO_CHAIN_STEPS) {
  assert(Boolean(step.pageCode), 'demo chain step ' + step.label + ' must declare pageCode');
  const page = pageByCode.get(step.pageCode);
  assert(Boolean(page), 'demo chain step ' + step.label + ' pageCode has no metadata page: ' + step.pageCode);
  if (!page) continue;
  assert(page.path.startsWith('/gct-edhr/'), 'demo chain step ' + step.label + ' must route through /gct-edhr/*');
  assert(!seenPaths.has(page.path), 'demo chain page path must be unique: ' + page.path);
  assert(!seenCodes.has(page.code), 'demo chain page code must be unique: ' + page.code);
  seenPaths.add(page.path);
  seenCodes.add(page.code);
}

export const failures = probeFailures;
`;
}

function extractPathTokens(sourceText) {
  return new Set(sourceText.match(/\/gct-edhr\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+/g) ?? []);
}

function comparePathSet(label, actual, expected, messages) {
  for (const path of expected) {
    if (!actual.has(path)) {
      messages.push(`${label} missing ${path}`);
    }
  }
  for (const path of actual) {
    if (!expected.has(path)) {
      messages.push(`${label} has extra path ${path}`);
    }
  }
}
