import { readFileSync } from 'node:fs';

const constantsContent = readFileSync(new URL('../src/utils/constants.ts', import.meta.url), 'utf8');
const routerContent = readFileSync(new URL('../src/router/index.tsx', import.meta.url), 'utf8');
const apiContent = readFileSync(new URL('../src/api/master-data.ts', import.meta.url), 'utf8');
const packageContent = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const standardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const pageContent = readFileSync(new URL('../src/pages/master-data/ProcessModelingPage.tsx', import.meta.url), 'utf8');
const processModelingPermissionMigrationContent = readFileSync(new URL('../../backend/src/main/resources/db/changelog/0014-process-modeling-permissions.sql', import.meta.url), 'utf8');
const failures = [];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
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

mustInclude(packageContent, '"verify:process-modeling": "node scripts/verify-process-modeling-pages.mjs"', 'process modeling verification should be runnable from npm scripts');
mustInclude(standardContent, '数据模块下的工艺建模页面统一沿用系统模块后台工作台标准', 'UI standard should include the process modeling page standard');

mustInclude(constantsContent, "label: '工艺建模'", 'data module should expose the renamed process modeling group');
mustAppearInOrder(constantsContent, [
  "{ label: '物料管理', path: '/master-data/materials' }",
  "{ label: '工序管理', path: '/master-data/operations' }",
  "{ label: '工艺路线', path: '/master-data/routes' }",
  "{ label: '产品管理', path: '/master-data/products' }",
  "{ label: '产品簇', path: '/master-data/product-families' }",
  "{ label: '文档管理', path: '/master-data/documents' }",
], 'process modeling menus should follow the requested order');
mustNotInclude(constantsContent, "{ label: '物料类型', path: '/master-data/material-types' }", 'material type page should be removed from process modeling menus');
mustNotInclude(constantsContent, "{ label: '计量单位', path: '/master-data/units' }", 'old unit menu should not remain under process modeling');
mustNotInclude(constantsContent, "{ label: '设备管理', path: '/master-data/equipment' }", 'old equipment menu should not remain under process modeling');
mustNotInclude(constantsContent, "{ label: 'SOP文档', path: '/master-data/sop-documents' }", 'old SOP menu label should be renamed to document management');

mustInclude(routerContent, 'const ProcessModelingPage', 'router should lazy-load the reusable process modeling page');
mustInclude(routerContent, 'path="materials"', 'router should expose material management');
mustInclude(routerContent, 'pageKey="materials"', 'material route should pass a page key');
mustNotInclude(routerContent, 'path="material-types"', 'router should remove material type management route');
mustNotInclude(routerContent, 'pageKey="materialTypes"', 'material type page key should not be routable');
mustInclude(routerContent, 'path="products"', 'router should expose product management');
mustInclude(routerContent, 'pageKey="products"', 'product route should pass a page key');
mustInclude(routerContent, 'path="documents"', 'router should expose document management');
mustInclude(routerContent, 'pageKey="documents"', 'document route should pass a page key');

mustInclude(apiContent, 'ProcessModelingEntityType', 'master data API should expose a shared entity type');
mustInclude(apiContent, 'MaterialRecord', 'master data API should type material rows');
mustNotInclude(apiContent, 'MaterialTypeRecord', 'master data API should not expose material type rows');
mustInclude(apiContent, 'ProductRecord', 'master data API should type product rows');
mustInclude(apiContent, 'ProcessDocumentRecord', 'master data API should type document rows');
mustInclude(apiContent, 'getMaterials', 'master data API should expose material list');
mustInclude(apiContent, 'createMaterial', 'master data API should expose material create');
mustInclude(apiContent, 'updateMaterial', 'master data API should expose material update');
mustInclude(apiContent, 'deleteMaterial', 'master data API should expose material delete');
mustNotInclude(apiContent, 'getMaterialTypes', 'master data API should remove material type list endpoint wrapper');
mustNotInclude(apiContent, 'createMaterialType', 'master data API should remove material type create endpoint wrapper');
mustNotInclude(apiContent, 'updateMaterialType', 'master data API should remove material type update endpoint wrapper');
mustNotInclude(apiContent, 'deleteMaterialType', 'master data API should remove material type delete endpoint wrapper');
mustInclude(apiContent, 'getProducts', 'master data API should expose product list');
mustInclude(apiContent, 'getProcessDocuments', 'master data API should expose document list');

mustInclude(processModelingPermissionMigrationContent, "'master-data.materials'", 'material management should be granted through persisted permissions');
mustInclude(processModelingPermissionMigrationContent, "'master-data.products'", 'product management should be granted through persisted permissions');
mustInclude(processModelingPermissionMigrationContent, "'master-data.documents'", 'document management should be granted through persisted permissions');
mustInclude(processModelingPermissionMigrationContent, 'INSERT INTO role_permission', 'admin role should receive process modeling permissions');

mustInclude(pageContent, 'PROCESS_MODELING_PAGE_CONFIGS', 'reusable page should be config-driven');
mustAppearInOrder(pageContent, [
  'const processColumnLabels',
  'const PROCESS_MODELING_PAGE_CONFIGS',
], 'column labels should be initialized before page configs call baseColumns');
mustInclude(pageContent, 'pageKey', 'reusable page should select behavior by route page key');
mustInclude(pageContent, 'PROCESS_MODELING_COLUMN_WIDTH_STORAGE_PREFIX', 'columns should persist widths per user');
mustInclude(pageContent, 'PROCESS_MODELING_COLUMN_SETTINGS_STORAGE_PREFIX', 'columns should persist order and visibility per user');
mustInclude(pageContent, 'ViewColumnRounded', 'field settings trigger should use the standard icon');
mustInclude(pageContent, 'TuneRounded', 'field settings trigger should use the standard tuning affordance');
mustInclude(pageContent, 'handleColumnSettingDragStart', 'field settings should support drag sorting');
mustInclude(pageContent, 'beginColumnResize', 'table columns should support drag width changes');
mustInclude(pageContent, '<Table stickyHeader size="small"', 'table should follow the compact sticky standard');
mustInclude(pageContent, 'TABLE_DATA_ROW_HEIGHT = 40', 'table rows should keep the 40px standard');
mustInclude(pageContent, 'calc(100vh - 150px)', 'single list pages should fill the app shell workspace');
mustInclude(pageContent, '<Tab label="数据信息" />', 'detail drawer should expose data information tab');
mustInclude(pageContent, '<Tab label="数据审计" />', 'detail drawer should expose data audit tab');
mustInclude(pageContent, 'theme.zIndex.drawer + 2', 'detail drawer should sit above the app header and tag bar');
mustInclude(pageContent, 'Accordion', 'audit records should use accordion rows');
mustInclude(pageContent, '暂无审计记录', 'audit tab should use the standard empty wording');
mustInclude(pageContent, 'createdBy', 'pages should display creator metadata');
mustInclude(pageContent, 'updatedBy', 'pages should display updater metadata');
mustInclude(pageContent, 'getAuditLogs', 'detail drawer should use backend audit logs');
mustInclude(pageContent, 'entityType: config.entityType', 'audit query should use the current master data entity type');
mustInclude(pageContent, 'getApiErrorMessage', 'mutations should show concrete backend error messages');
mustInclude(pageContent, "anchorOrigin={{ vertical: 'top', horizontal: 'right' }}", 'operation feedback should appear in the top-right corner');
mustInclude(pageContent, "label: '状态'", 'all process modeling pages should expose status');
mustInclude(pageContent, "label: '创建人'", 'all process modeling tables should include creator');
mustInclude(pageContent, "label: '更新时间'", 'all process modeling tables should include update time');
mustNotInclude(pageContent, "codeAutoGenerated", 'material dialog should not show the old generated-code tip');
mustNotInclude(pageContent, "编码在提交时自动生成", 'material dialog should remove the generated-code notice text');
mustInclude(pageContent, "label: '版本'", 'material and document forms should expose version');
mustInclude(pageContent, 'materialName', 'material management should split material name into its own query field');
mustInclude(pageContent, 'materialCode', 'material management should split material code into its own query field');
mustInclude(pageContent, 'materialTypeName', 'material management should split material type into its own query field');
mustInclude(pageContent, 'renderMaterialFilters', 'material management should render dedicated filter controls');
mustInclude(pageContent, 'StatusPill', 'status column should use pill styling with a dot');
mustInclude(pageContent, 'renderRowActions', 'material grouped rows should render edit and delete operations');
mustInclude(pageContent, 'renderFormField', 'dialog fields should be rendered through a reusable field helper');
mustInclude(pageContent, "const gridColumn = field.multiline ? '1 / -1' : undefined", 'dialog should allow multiline fields to span both columns');
mustInclude(pageContent, "gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }", 'dialog should use two fields per row on non-mobile widths');
mustInclude(pageContent, 'process-modeling-material-groups', 'material management should support grouped version rows');
mustInclude(pageContent, 'ExpandMore', 'material grouped rows should use an expand affordance');
mustInclude(pageContent, 'materialGroupRows', 'material management should group versions by material code');
mustInclude(pageContent, 'expandMaterialGroup', 'material management should support expanding grouped versions');
mustInclude(pageContent, 'materialGroupDisplayName', 'grouped material rows should render the shared material name');
mustInclude(pageContent, 'materialVersion', 'material rows should expose version data');
mustNotInclude(pageContent, "title: '物料类型'", 'material type page config should be removed');
mustNotInclude(pageContent, "entityType: 'MATERIAL_TYPE'", 'material type entity should not be exposed as a page config');
mustInclude(pageContent, "products: {\n    title: '产品管理',\n    entityType: 'MATERIAL'", 'product management should audit the source material because it is a derived material view');
mustInclude(pageContent, "readOnly: true", 'derived product management should be a read-only material view');
mustInclude(pageContent, "derivedFrom: '由物料类型为半成品或产成品的物料自动派生'", 'derived product management should explain its source');
mustInclude(pageContent, "columns: baseColumns(['name', 'code', 'specification', 'materialTypeId', 'unit', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'], { actions: false })", 'derived product management should show material type and hide action column');
mustInclude(pageContent, "field.id === 'materialTypeId'", 'material forms should select material type from standard types');
mustInclude(pageContent, 'STANDARD_MATERIAL_TYPE_OPTIONS', 'material forms should keep standard material type options after removing material type maintenance');
mustNotInclude(pageContent, 'getMaterialTypes', 'material type page endpoint should not be called by the frontend');
mustNotInclude(pageContent, 'label="编码"', 'forms should not expose manual code input');

if (failures.length > 0) {
  console.error('Process modeling verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Process modeling verification passed.');
