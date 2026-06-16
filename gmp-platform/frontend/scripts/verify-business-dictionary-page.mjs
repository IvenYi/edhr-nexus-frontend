import { readFileSync } from 'node:fs';

const pageContent = readFileSync(new URL('../src/pages/system/BusinessDictionaryPage.tsx', import.meta.url), 'utf8');
const routerContent = readFileSync(new URL('../src/router/index.tsx', import.meta.url), 'utf8');
const apiContent = readFileSync(new URL('../src/api/system.ts', import.meta.url), 'utf8');
const constantsContent = readFileSync(new URL('../src/utils/constants.ts', import.meta.url), 'utf8');
const menuManagementContent = readFileSync(new URL('../src/utils/menuManagement.ts', import.meta.url), 'utf8');
const packageContent = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const standardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const failures = [];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
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

function mustAppearInOrderWithin(content, anchor, tokens, reason) {
  const start = content.indexOf(anchor);
  if (start === -1) {
    failures.push(`missing ${JSON.stringify(anchor)} (${reason})`);
    return;
  }
  mustAppearInOrder(content.slice(start), tokens, reason);
}

mustInclude(packageContent, '"verify:business-dictionary": "node scripts/verify-business-dictionary-page.mjs"', 'business dictionary verification should be runnable from npm scripts');
mustInclude(standardContent, '业务字典页面采用左侧字典列表、右侧字典项列表的双栏工作台', 'UI standard should describe the business dictionary template');

mustInclude(apiContent, 'BusinessDictionaryRecord', 'system API should type business dictionary records');
mustInclude(apiContent, 'BusinessDictionaryItemRecord', 'system API should type business dictionary item records');
mustInclude(apiContent, 'getBusinessDictionaries', 'system API should expose dictionary list');
mustInclude(apiContent, 'createBusinessDictionary', 'system API should expose dictionary create');
mustInclude(apiContent, 'updateBusinessDictionary', 'system API should expose dictionary update');
mustInclude(apiContent, 'deleteBusinessDictionary', 'system API should expose dictionary delete');
mustInclude(apiContent, 'getBusinessDictionaryItems', 'system API should expose dictionary item list');
mustInclude(apiContent, 'createBusinessDictionaryItem', 'system API should expose dictionary item create');
mustInclude(apiContent, 'updateBusinessDictionaryItem', 'system API should expose dictionary item update');
mustInclude(apiContent, 'deleteBusinessDictionaryItem', 'system API should expose dictionary item delete');
mustInclude(apiContent, 'reorderBusinessDictionaryItems', 'system API should expose dictionary item reorder');
mustInclude(apiContent, 'getBusinessDictionaryOptions', 'system API should expose reusable dictionary options for other pages');

mustInclude(routerContent, 'const BusinessDictionaryPage', 'router should lazy-load business dictionary page');
mustInclude(routerContent, 'path="dictionaries"', 'router should expose /system/dictionaries');
mustInclude(routerContent, '<BusinessDictionaryPage />', 'route should render business dictionary page');
mustInclude(constantsContent, "{ label: '业务字典', path: '/system/dictionaries' }", 'default sidebar should include business dictionary under system management');
mustInclude(menuManagementContent, "{ label: '业务字典', path: '/system/dictionaries' }", 'managed sidebar should force business dictionary menu entry');
mustInclude(menuManagementContent, "if (path === '/system/dictionaries') return 'system.dictionaries';", 'business dictionary route should map to backend permission');
mustInclude(constantsContent, 'SIDEBAR_MODULES', 'sidebar config should remain the source of truth for the menu');

mustInclude(pageContent, 'BUSINESS_DICTIONARY_COLUMN_WIDTH_STORAGE_PREFIX', 'dictionary columns should persist widths per user');
mustInclude(pageContent, 'BUSINESS_DICTIONARY_COLUMN_SETTINGS_STORAGE_PREFIX', 'dictionary columns should persist visibility/order per user');
mustInclude(pageContent, 'BUSINESS_DICTIONARY_ITEM_COLUMN_WIDTH_STORAGE_PREFIX', 'item columns should persist widths per user');
mustInclude(pageContent, 'BUSINESS_DICTIONARY_ITEM_COLUMN_SETTINGS_STORAGE_PREFIX', 'item columns should persist visibility/order per user');
mustInclude(pageContent, 'ViewColumnRounded', 'field settings trigger should use the standard icon');
mustInclude(pageContent, 'TuneRounded', 'field settings trigger should use the standard tuning affordance');
mustInclude(pageContent, 'handleColumnSettingDragStart', 'field settings should support drag sorting');
mustInclude(pageContent, 'beginColumnResize', 'table columns should support drag width changes');
mustInclude(pageContent, '<Table stickyHeader size="small"', 'tables should follow compact sticky standard');
mustInclude(pageContent, 'TABLE_DATA_ROW_HEIGHT = 40', 'table rows should keep the 40px standard');
mustInclude(pageContent, 'calc(100vh - 150px)', 'page should fill the app shell workspace');
mustInclude(pageContent, '<Tab label="数据信息" />', 'detail drawer should include data info tab');
mustInclude(pageContent, '<Tab label="数据审计" />', 'detail drawer should include data audit tab');
mustInclude(pageContent, 'Accordion', 'audit records should use accordion rows');
mustInclude(pageContent, '暂无审计记录', 'audit tab should use standard empty wording');
mustInclude(pageContent, 'getAuditLogs', 'drawer should query backend audit logs');
mustInclude(pageContent, "entityType: selectedDetail?.type === 'dictionary' ? 'BUSINESS_DICTIONARY' : 'BUSINESS_DICTIONARY_ITEM'", 'audit query should use the selected dictionary entity type');
mustInclude(pageContent, 'getApiErrorMessage', 'mutations should show concrete backend error messages');
mustInclude(pageContent, "anchorOrigin={{ vertical: 'top', horizontal: 'right' }}", 'operation feedback should appear in the top-right corner');
mustInclude(pageContent, '业务字典', 'page should render business dictionary wording');
mustInclude(pageContent, '字典项', 'page should render dictionary item wording');
mustAppearInOrder(pageContent, [
  "{ id: 'name', label: '字典名称'",
  "{ id: 'code', label: '字典编码'",
  "{ id: 'itemCount', label: '字典项数'",
  "{ id: 'status', label: '状态'",
  "{ id: 'createdBy', label: '创建人'",
  "{ id: 'createdAt', label: '创建时间'",
  "{ id: 'updatedBy', label: '更新人'",
  "{ id: 'updatedAt', label: '更新时间'",
], 'dictionary table should follow the standard field order');
mustAppearInOrderWithin(pageContent, 'const itemColumns: Array<TableColumn<DictionaryItemColumnId>> = [', [
  "{ id: 'label', label: '字典项名称'",
  "{ id: 'value', label: '字典项值'",
  "{ id: 'sortOrder', label: '排序'",
  "{ id: 'status', label: '状态'",
  "{ id: 'createdBy', label: '创建人'",
  "{ id: 'createdAt', label: '创建时间'",
  "{ id: 'updatedBy', label: '更新人'",
  "{ id: 'updatedAt', label: '更新时间'",
], 'dictionary item table should follow the standard field order');
mustInclude(pageContent, '系统内置业务字典不能删除', 'built-in dictionaries should be protected in the UI');
mustInclude(pageContent, '系统内置字典项不能删除', 'built-in dictionary items should be protected in the UI');
mustInclude(pageContent, 'deleteDictionaryMutation', 'page should support deleting dictionaries');
mustInclude(pageContent, 'deleteItemMutation', 'page should support deleting dictionary items');
mustInclude(pageContent, 'reorderItemsMutation', 'page should support item drag reorder');

if (failures.length > 0) {
  console.error('Business dictionary verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Business dictionary verification passed.');
