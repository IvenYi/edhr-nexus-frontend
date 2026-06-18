import { readFileSync } from 'node:fs';

const constantsContent = readFileSync(new URL('../src/utils/constants.ts', import.meta.url), 'utf8');
const routerContent = readFileSync(new URL('../src/router/index.tsx', import.meta.url), 'utf8');
const apiContent = readFileSync(new URL('../src/api/master-data.ts', import.meta.url), 'utf8');
const packageContent = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const standardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const pageContent = readFileSync(new URL('../src/pages/master-data/ProcessModelingPage.tsx', import.meta.url), 'utf8');
const processModelingPermissionMigrationContent = readFileSync(new URL('../../backend/src/main/resources/db/changelog/0014-process-modeling-permissions.sql', import.meta.url), 'utf8');
const changelogMasterContent = readFileSync(new URL('../../backend/src/main/resources/db/changelog/db.changelog-master.yaml', import.meta.url), 'utf8');
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
mustInclude(apiContent, 'materialPurpose?: string', 'material rows should expose material purpose');
mustInclude(apiContent, 'effectiveDate?: string', 'material rows should expose version effective date');
mustInclude(apiContent, 'expiryDate?: string', 'material rows should expose version expiry date');
mustInclude(apiContent, 'versionCount?: number', 'material groups should expose version count');
mustInclude(apiContent, 'effectiveVersionCount?: number', 'material groups should expose effective version count');
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
mustInclude(changelogMasterContent, '0025-material-version-display-fields.sql', 'material version display fields should have a database migration');

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
mustInclude(pageContent, "materialPurpose: '物料用途'", 'material table should expose material purpose label');
mustInclude(pageContent, "effectiveVersionCount: '生效版本数量'", 'material table should expose effective version count label');
mustInclude(pageContent, "effectiveDate: '生效日期'", 'material version rows should expose effective date label');
mustInclude(pageContent, "expiryDate: '失效日期'", 'material version rows should expose expiry date label');
mustInclude(pageContent, "labels: { name: '物料名称', code: '物料料号', version: '版本数量' }", 'material main table should use material-specific name/code/version labels');
mustInclude(pageContent, "columns: baseColumns(['name', 'code', 'specification', 'materialTypeId', 'unit', 'version', 'effectiveVersionCount', 'materialPurpose', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']", 'material table should include version count, effective version count, and material purpose');
mustInclude(pageContent, 'materialName', 'material management should split material name into its own query field');
mustInclude(pageContent, 'materialCode', 'material management should split material code into its own query field');
mustInclude(pageContent, 'materialTypeName', 'material management should split material type into its own query field');
mustInclude(pageContent, 'renderMaterialFilters', 'material management should render dedicated filter controls');
mustInclude(pageContent, "import StatusBadge from '@/components/StatusBadge';", 'process modeling statuses should use the shared system status badge');
mustInclude(pageContent, "gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }", 'material query filters should show three fields per row on desktop');
mustInclude(pageContent, "gridColumn: { xs: '1', md: '3' }", 'material query buttons should attach to the end of the last filter row');
mustNotInclude(pageContent, 'const renderMaterialFilters = () => (\n    <Stack spacing={1.5}>', 'material query buttons should not be split into a separate row');
mustInclude(pageContent, '<StatusBadge label={getStatusLabel(row.status)} color={getStatusColor(row.status)} />', 'status column should use the shared system status badge');
mustInclude(pageContent, '<StatusBadge label={getStatusLabel(row.latestVersion.status)} color={getStatusColor(row.latestVersion.status)} />', 'material group status should use the shared system status badge');
mustInclude(pageContent, '<StatusBadge label={getStatusLabel(versionRow.status)} color={getStatusColor(versionRow.status)} />', 'material version status should use the shared system status badge');
mustNotInclude(pageContent, 'StatusPill', 'status column should not use a custom status component');
mustInclude(pageContent, 'renderRowActions', 'material grouped rows should render edit and delete operations');
mustInclude(pageContent, 'renderFormField', 'dialog fields should be rendered through a reusable field helper');
mustInclude(pageContent, "const gridColumn = field.multiline ? '1 / -1' : undefined", 'dialog should allow multiline fields to span both columns');
mustInclude(pageContent, "gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }", 'dialog should use two fields per row on non-mobile widths');
mustInclude(pageContent, 'process-modeling-material-groups', 'material management should support grouped version rows');
mustInclude(pageContent, 'ExpandMore', 'material grouped rows should use an expand affordance');
mustInclude(pageContent, 'renderMaterialVersionTable', 'expanded material rows should render a nested version table');
mustInclude(pageContent, '<Table stickyHeader size="small" aria-label="物料版本列表"', 'expanded material rows should use a nested child table');
mustInclude(pageContent, '物料版本号', 'material version child table should include version number');
mustInclude(pageContent, '版本状态', 'material version child table should include version status');
mustInclude(pageContent, '生效日期', 'material version child table should include effective date');
mustInclude(pageContent, '失效日期', 'material version child table should include expiry date');
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
