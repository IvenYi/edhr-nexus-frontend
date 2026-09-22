import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const app = read('src/App.tsx');
const shared = read('src/components/listTableStyles.ts');
const listTableShell = read('src/components/ListTableShell.tsx');
const listTableShellDoc = read('../../docs/frontend/list-table-shell.md');
const listPageGuidelines = read('../../docs/frontend/list-page-guidelines.md');

assert(!app.includes('MuiTableHead:'), 'App theme must not define a competing MuiTableHead override');
assert(app.includes('MuiTableCell:') && app.includes('head: listTableHeaderCellStyle'), 'App theme must consume the shared MuiTableCell head token');
for (const token of ["height: 48", "padding: '0 16px'", "backgroundColor: '#f5f7fa'", "borderBottom: '1px solid #e4e7ed'"]) {
  assert(shared.includes(token), `Missing canonical table-head token: ${token}`);
}
assert(shared.includes('export const listTableHeaderCellSx'), 'Shared list-table header token is missing');
assert(shared.includes('export const listTablePrimaryTextSx'), 'Shared list-table primary text token is missing');
assert(shared.includes('export const listTableStickyEdgeShadow'), 'Shared frozen-column shadow token is missing');
assert(shared.includes('export const listTableStickyEdgeSx'), 'Shared frozen-column paint token is missing');
assert(shared.includes('export function listTableStickyActionSx'), 'Shared simple-list operation-column token is missing');
assert(shared.includes("-6px 0 8px -8px rgba(0, 0, 0, 0.35)"), 'Frozen-column shadow token must use the canonical edge shadow');
assert(shared.includes("'&&.MuiTableCell-body'") && shared.includes('`${listTableStickyEdgeShadow}, ${listTableBodyDividerShadow}`'), 'Frozen body cells must retain the edge shadow above row-level cell styles and the row divider');
assert(/'&&\.MuiTableCell-body':\s*\{\s*borderBottom: 'none'/.test(shared), 'Frozen body cells must not duplicate their divider with a native bottom border');
assert(shared.includes("fontWeight: 400"), 'List primary text must use the normal body weight');
assert(shared.includes("fontSize: 14"), 'List primary text must use the body font size');
assert(shared.includes("lineHeight: '20px'"), 'List primary text must use the body line height');
assert(listPageGuidelines.includes('不得使用蓝色链接、下划线或额外加粗'), 'List-page guidelines must prohibit blue or bold primary-column links');
assert(listPageGuidelines.includes('首个数据列必须与其他普通数据列使用完全相同的正文基线'), 'List-page guidelines must require the first data column to match the body-text baseline');
assert(shared.includes("width: '1px'"), 'Resize divider must use an explicit 1px CSS width');
assert(shared.includes('right: 0'), 'Resize hitbox and visible divider must stay inside the current sticky cell boundary');
assert(listTableShell.includes('export const ListTableShell'), 'Shared list-table shell is missing');
assert(listTableShell.includes('resolveListColumnWidths'), 'Shared list-table shell must resolve declared column widths');
assert(listTableShell.includes('ResizeObserver'), 'Shared list-table shell must measure its shared viewport');
assert(listTableShellDoc.includes('所有独立列表页和业务工作列表'), 'Shared list-table shell documentation must use generic list semantics');
assert(listPageGuidelines.includes('所有独立列表页和业务工作列表必须复用 `ListTableShell`'), 'List-page guidelines must require the generic public list shell');

const listPages = [
  'src/pages/master-data/ProductModelingPage.tsx',
  'src/pages/master-data/ProductFamilyModelingPage.tsx',
  'src/pages/master-data/DocumentManagementPage.tsx',
  'src/pages/master-data/TemplateModelingPage.tsx',
  'src/pages/master-data/ProcessModelingPage.tsx',
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

const publicListPages = [
  'src/pages/master-data/ProductModelingPage.tsx',
  'src/pages/master-data/ProductFamilyModelingPage.tsx',
  'src/pages/master-data/DocumentManagementPage.tsx',
  'src/pages/master-data/TemplateModelingPage.tsx',
  'src/pages/master-data/ProcessModelingPage.tsx',
  'src/pages/master-data/WorkshopManagementPage.tsx',
  'src/pages/master-data/EquipmentPage.tsx',
  'src/pages/master-data/OperationPage.tsx',
  'src/pages/master-data/UnitPage.tsx',
  'src/pages/master-data/RoutePage.tsx',
  'src/pages/master-data/ProductFamilyPage.tsx',
  'src/pages/master-data/SopDocumentPage.tsx',
  'src/pages/production/WorkOrderPage.tsx',
  'src/pages/production/BatchManagementPage.tsx',
  'src/pages/workflow-center/ReviewTemplateList.tsx',
  'src/pages/workflow-center/FormProcessList.tsx',
  'src/pages/workflow-center/BindingRuleList.tsx',
  'src/pages/workflow-center/InstanceList.tsx',
  'src/pages/workflow-center/InstanceLogs.tsx',
  'src/pages/workflow-center/WorkTemplateList.tsx',
  'src/pages/workflow-center/WorkApplicabilityRulesTab.tsx',
  'src/pages/dhr-management/DhrManagementPage.tsx',
  'src/pages/dhr-management/DhrSummaryPage.tsx',
  'src/pages/form-management/FormInstanceListPage.tsx',
  'src/pages/form-management/FormFillingPage.tsx',
  'src/pages/form-management/FormReviewPage.tsx',
  'src/pages/system/AuditLogPage.tsx',
  'src/pages/system/BusinessDictionaryPage.tsx',
  'src/pages/system/OrganizationPage.tsx',
  'src/pages/system/RolePage.tsx',
  'src/pages/system/UserPage.tsx',
  'src/pages/system/LoginLogPage.tsx',
  'src/pages/system/SignatureLogPage.tsx',
  'src/pages/account/PersonalSettingsPage.tsx',
];

for (const path of publicListPages) {
  const source = read(path);
  assert(source.includes('ListTableShell'), `${path} must use the shared public list-table shell`);
}

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

for (const path of [
  'src/pages/production/WorkOrderPage.tsx',
  'src/pages/workflow-center/FormProcessList.tsx',
  'src/pages/workflow-center/ReviewTemplateList.tsx',
  'src/pages/workflow-center/WorkApplicabilityRulesTab.tsx',
]) {
  const source = read(path);
  assert(source.includes('listTableBodyCellSx'), `${path} must reuse the shared 40px list-row token`);
}

const productModelingPage = read('src/pages/master-data/ProductModelingPage.tsx');
assert(productModelingPage.includes('ListTableShell'), 'Product Modeling must use the shared list-table shell');
assert(productModelingPage.includes('resolveListColumnWidths'), 'Product Modeling must resolve parent and version widths through the shared list-table shell');
assert(productModelingPage.includes('versionTableWidth={versionTableWidth}'), 'Product Modeling child versions must use their own wider width without stretching the parent table');
assert(productModelingPage.includes("product-modeling-column-widths:v2:"), 'Product Modeling parent widths must use the repaired preference key');
assert(productModelingPage.includes("product-modeling-version-column-widths:v2:"), 'Product Modeling version widths must use the repaired preference key');

const rdoPages = [
  'src/pages/master-data/ProductModelingPage.tsx',
  'src/pages/master-data/ProductFamilyModelingPage.tsx',
  'src/pages/master-data/DocumentManagementPage.tsx',
  'src/pages/master-data/TemplateModelingPage.tsx',
  'src/pages/master-data/ProcessModelingPage.tsx',
];
for (const path of rdoPages) {
  const source = read(path);
  assert(source.includes('ListTableShell'), `${path} must use the shared list-table shell`);
  assert(source.includes('resolveListColumnWidths'), `${path} must resolve parent and version widths through the shared list-table shell`);
}

const primaryTextPages = [
  'src/pages/master-data/ProductModelingPage.tsx',
  'src/pages/master-data/ProductFamilyModelingPage.tsx',
  'src/pages/master-data/DocumentManagementPage.tsx',
  'src/pages/master-data/TemplateModelingPage.tsx',
  'src/pages/master-data/ProcessModelingPage.tsx',
  'src/pages/master-data/WorkshopManagementPage.tsx',
  'src/pages/production/BatchManagementPage.tsx',
];
for (const path of primaryTextPages) {
  const source = read(path);
  assert(source.includes('listTablePrimaryTextSx'), `${path} must use the neutral primary list text token`);
}

for (const path of [
  'src/pages/master-data/ProductFamilyPage.tsx',
  'src/pages/master-data/SopDocumentPage.tsx',
  'src/pages/workflow-center/InstanceList.tsx',
]) {
  const source = read(path);
  assert(!source.includes("fontFamily: 'monospace'"), `${path} must not render its first data column with a monospace font`);
}

const batchManagementPage = read('src/pages/production/BatchManagementPage.tsx');
assert(batchManagementPage.includes("case 'batchNo'") && batchManagementPage.includes('...listTablePrimaryTextSx'), 'Batch number text must use the neutral primary list text token');

const workshopManagementPage = read('src/pages/master-data/WorkshopManagementPage.tsx');
assert(/column\.id === 'actions' \? \{[^}]*position: 'sticky'[^}]*\.\.\.listTableStickyEdgeSx/.test(workshopManagementPage), 'Workshop action header must use the shared frozen-column edge token');

const frozenColumnPages = [
  'src/pages/master-data/ProductModelingPage.tsx',
  'src/pages/master-data/ProductFamilyModelingPage.tsx',
  'src/pages/master-data/DocumentManagementPage.tsx',
  'src/pages/master-data/TemplateModelingPage.tsx',
  'src/pages/master-data/ProcessModelingPage.tsx',
  'src/pages/master-data/EquipmentPage.tsx',
  'src/pages/master-data/WorkshopManagementPage.tsx',
  'src/pages/production/WorkOrderPage.tsx',
  'src/pages/production/BatchManagementPage.tsx',
  'src/pages/workflow-center/ReviewTemplateList.tsx',
  'src/pages/workflow-center/FormProcessList.tsx',
  'src/pages/workflow-center/WorkTemplateList.tsx',
  'src/pages/workflow-center/WorkApplicabilityRulesTab.tsx',
  'src/pages/form-management/FormInstanceListPage.tsx',
  'src/pages/form-management/FormFillingPage.tsx',
  'src/pages/form-management/FormReviewPage.tsx',
  'src/pages/dhr-management/DhrManagementPage.tsx',
  'src/pages/dhr-management/DhrSummaryPage.tsx',
  'src/pages/system/BusinessDictionaryPage.tsx',
  'src/pages/system/OrganizationPage.tsx',
  'src/pages/system/RolePage.tsx',
  'src/pages/system/UserPage.tsx',
];

for (const path of frozenColumnPages) {
  const source = read(path);
  assert(source.includes('listTableStickyEdgeSx'), `${path} must use the shared frozen-column edge token`);
  assert(!source.match(/boxShadow:\s*["']-(?:2|4|6)px 0/), `${path} must not define a page-level frozen-column shadow`);
}

for (const path of ['src/pages/production/WorkOrderPage.tsx', 'src/pages/production/BatchManagementPage.tsx']) {
  const source = read(path);
  assert(source.includes("visibleColumns.some((column) => column.id === 'status')"), `${path} must detect whether the frozen status column is visible`);
  assert(source.includes('...(!hasVisibleStatusColumn ? listTableStickyEdgeSx : {})'), `${path} must move the frozen edge shadow to actions when status is hidden`);
  assert(source.includes("getOperationColumnSx('head', hasVisibleStatusColumn)") && source.includes("getOperationColumnSx('body', hasVisibleStatusColumn)"), `${path} must apply the visibility-dependent edge to header and body`);
}

const simpleActionColumnPages = [
  'src/pages/master-data/OperationPage.tsx',
  'src/pages/master-data/ProductFamilyPage.tsx',
  'src/pages/master-data/RoutePage.tsx',
  'src/pages/master-data/UnitPage.tsx',
  'src/pages/master-data/SopDocumentPage.tsx',
  'src/pages/workflow-center/BindingRuleList.tsx',
  'src/pages/workflow-center/InstanceList.tsx',
];
for (const path of simpleActionColumnPages) {
  const source = read(path);
  assert(source.includes('listTableStickyActionSx'), `${path} must use the shared sticky operation-column token`);
  assert((source.match(/listTableStickyActionSx\([^)]*, 'head'\)/g) ?? []).length > 0, `${path} must apply the shared sticky operation token to its header`);
  assert((source.match(/listTableStickyActionSx\([^)]*, 'body'\)/g) ?? []).length > 0, `${path} must apply the shared sticky operation token to its body`);
}

console.log(`Verified the shared list-table style contract across ${publicListPages.length} public list pages, ${listPages.length} style entry points, ${resizablePages.length} resizable lists, and ${rdoPages.length} RDO pages.`);
