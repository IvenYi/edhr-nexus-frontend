import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const app = read('src/App.tsx');
const shared = read('src/components/listTableStyles.ts');

assert(!app.includes('MuiTableHead:'), 'App theme must not define a competing MuiTableHead override');
assert(app.includes('MuiTableCell:') && app.includes('head: listTableHeaderCellStyle'), 'App theme must consume the shared MuiTableCell head token');
for (const token of ["height: 48", "padding: '0 16px'", "backgroundColor: '#f5f7fa'", "borderBottom: '1px solid #e4e7ed'"]) {
  assert(shared.includes(token), `Missing canonical table-head token: ${token}`);
}
assert(shared.includes('export const listTableHeaderCellSx'), 'Shared list-table header token is missing');
assert(shared.includes("width: '1px'"), 'Resize divider must use an explicit 1px CSS width');
assert(shared.includes('right: 0'), 'Resize hitbox and visible divider must stay inside the current sticky cell boundary');

const listPages = [
  'src/pages/master-data/ProductModelingPage.tsx',
  'src/pages/master-data/ProductFamilyModelingPage.tsx',
  'src/pages/master-data/DocumentManagementPage.tsx',
  'src/pages/master-data/WorkshopManagementPage.tsx',
  'src/pages/production/WorkOrderPage.tsx',
  'src/pages/production/BatchManagementPage.tsx',
  'src/pages/workflow-center/ReviewTemplateList.tsx',
  'src/pages/workflow-center/FormProcessList.tsx',
  'src/pages/workflow-center/WorkTemplateList.tsx',
  'src/pages/form-management/formManagementListStyles.tsx',
  'src/pages/form-management/FormInstanceListPage.tsx',
  'src/pages/form-management/FormFillingPage.tsx',
  'src/pages/form-management/FormReviewPage.tsx',
];

for (const path of listPages) {
  const source = read(path);
  assert(source.includes('listTableHeaderCellSx') || source.includes('formTableHeaderCellSx'), `${path} must reuse the shared table-head token`);
}

const resizablePages = [
  'src/pages/master-data/ProductModelingPage.tsx',
  'src/pages/master-data/ProductFamilyModelingPage.tsx',
  'src/pages/master-data/DocumentManagementPage.tsx',
  'src/pages/master-data/WorkshopManagementPage.tsx',
  'src/pages/workflow-center/ReviewTemplateList.tsx',
  'src/pages/workflow-center/FormProcessList.tsx',
  'src/pages/form-management/FormInstanceListPage.tsx',
  'src/pages/form-management/FormFillingPage.tsx',
  'src/pages/form-management/FormReviewPage.tsx',
];

for (const path of resizablePages) {
  const source = read(path);
  assert(source.includes('listColumnResizeHandleSx'), `${path} must render the shared visible resize divider`);
  assert(source.includes('onPointerDown') || source.includes('getResizeHandleProps'), `${path} must provide an interactive column-resize handle`);
}

console.log(`Verified the shared list-table style contract across ${listPages.length} entry points and ${resizablePages.length} resizable lists.`);
