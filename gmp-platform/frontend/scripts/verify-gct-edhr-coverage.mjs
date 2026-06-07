import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptsDir, '..');
const workspaceRoot = resolve(projectRoot, '..', '..');

const EXPECTED_PAGE_COUNT = 99;
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

const generatedPagesFile = resolve(projectRoot, 'src/features/gct-edhr/metadata/generatedPages.ts');
const generatedMenusFile = resolve(projectRoot, 'src/features/gct-edhr/metadata/generatedMenus.ts');
const typesFile = resolve(projectRoot, 'src/features/gct-edhr/types.ts');
const backendSpecFile = resolve(
  workspaceRoot,
  'gmp-platform/backend/src/main/resources/gct/gct-page-specs.json',
);
const generatorFile = resolve(workspaceRoot, 'scripts/gct/generate-gct-specs.mjs');

const requiredFiles = [generatedPagesFile, generatedMenusFile, typesFile, backendSpecFile, generatorFile];

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
const pagesSource = readFileSync(generatedPagesFile, 'utf8');
const menusSource = readFileSync(generatedMenusFile, 'utf8');
const typesSource = readFileSync(typesFile, 'utf8');

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

if (failures.length) {
  reportAndExit(failures);
}

console.log('GCT eDHR coverage verification passed.');
console.log(`- pages: ${pages.length}`);
console.log(`- modules: ${Object.entries(EXPECTED_MODULE_COUNTS).map(([name, count]) => `${name}=${count}`).join(', ')}`);
console.log(`- page types: ${Object.entries(EXPECTED_TYPE_COUNTS).map(([name, count]) => `${name}=${count}`).join(', ')}`);

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    failures.push(`failed to read JSON ${filePath}: ${error instanceof Error ? error.message : error}`);
    return {};
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
    if (typeof action.permissionRequired !== 'boolean' || typeof action.auditRequired !== 'boolean') {
      messages.push(`${context} action ${action.label} must carry permission/audit booleans`);
    }
  }
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
