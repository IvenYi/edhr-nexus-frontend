import { readFileSync } from 'node:fs';

const constantsContent = readFileSync(new URL('../src/utils/constants.ts', import.meta.url), 'utf8');
const routerContent = readFileSync(new URL('../src/router/index.tsx', import.meta.url), 'utf8');
const apiContent = readFileSync(new URL('../src/api/master-data.ts', import.meta.url), 'utf8');
const packageContent = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const standardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const pageContent = readFileSync(new URL('../src/pages/master-data/ProcessModelingPage.tsx', import.meta.url), 'utf8');
const processModelingControllerContent = readFileSync(new URL('../../backend/src/main/java/com/zencas/edhr/masterdata/controller/ProcessModelingController.java', import.meta.url), 'utf8');
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
mustInclude(standardContent, 'Snackbar 内部提示沿用系统-用户管理样式：使用 MUI Alert 默认外观，不使用 filled 变体。', 'UI standard should document the user-management feedback style');

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
mustInclude(pageContent, 'PROCESS_MODELING_MATERIAL_VERSION_COLUMN_WIDTH_STORAGE_PREFIX', 'material version child table columns should persist widths per user');
mustInclude(pageContent, 'PROCESS_MODELING_MATERIAL_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX', 'material version child table columns should persist order and visibility per user');
mustInclude(pageContent, 'resolvedMaterialVersionColumnWidths', 'material version child table should resolve widths independently');
mustInclude(pageContent, 'resolveColumnWidths(materialVersionColumnWidths, totalTableWidth, visibleMaterialVersionColumns)', 'material version child table should stretch to the main table width');
mustInclude(pageContent, 'ViewColumnRounded', 'field settings trigger should use the standard icon');
mustInclude(pageContent, 'TuneRounded', 'field settings trigger should use the standard tuning affordance');
mustInclude(pageContent, 'UnfoldMoreRounded', 'material toolbar should use an easy-to-understand expand-all icon');
mustInclude(pageContent, 'UnfoldLessRounded', 'material toolbar should use an easy-to-understand collapse-all icon');
mustNotInclude(pageContent, 'KeyboardDoubleArrowDown', 'material toolbar should not use the old expand-all icon');
mustNotInclude(pageContent, 'KeyboardDoubleArrowUp', 'material toolbar should not use the old collapse-all icon');
mustInclude(pageContent, 'handleColumnSettingDragStart', 'field settings should support drag sorting');
mustInclude(pageContent, 'beginColumnResize', 'table columns should support drag width changes');
mustInclude(pageContent, 'beginMaterialVersionColumnResize', 'material version child table columns should support drag width changes');
mustInclude(pageContent, "type ColumnSettingsTarget = 'main' | 'materialVersion';", 'field settings should support main table and material version child table targets');
mustInclude(pageContent, 'const [columnSettingsTab, setColumnSettingsTab] = useState<ColumnSettingsTarget>(\'main\');', 'field settings popover should track the active main or child table tab');
mustInclude(pageContent, 'const materialVersionColumnSettingsStorageKey = useMemo(() => getCurrentUserPreferenceStorageKey(PROCESS_MODELING_MATERIAL_VERSION_COLUMN_SETTINGS_STORAGE_PREFIX, pageKey), [pageKey]);', 'material version field settings should use a separate persistence key');
mustInclude(pageContent, 'const [materialVersionColumnSettings, setMaterialVersionColumnSettings] = useState<ProcessColumnSettings>(() => loadColumnSettings(materialVersionColumnSettingsStorageKey, materialVersionColumnSettingsConfig));', 'material version field settings should load persisted order and visibility');
mustInclude(pageContent, 'const activeColumnSettings = columnSettingsTab === \'materialVersion\' ? materialVersionColumnSettings : columnSettings;', 'field settings panel should switch between main and child table settings');
mustInclude(pageContent, 'const activeColumnSettingsItems = columnSettingsTab === \'materialVersion\' ? materialVersionColumnSettingsItems : columnSettingsItems;', 'field settings panel should switch between main and child table columns');
mustInclude(pageContent, 'const setActiveColumnSettings = columnSettingsTab === \'materialVersion\' ? setMaterialVersionColumnSettings : setColumnSettings;', 'field settings changes should update the active main or child table settings');
mustInclude(pageContent, '<Tab label="主表" value="main" />', 'material field settings should expose the main table tab');
mustInclude(pageContent, '<Tab label="子表" value="materialVersion" />', 'material field settings should expose the material version child table tab');
mustInclude(pageContent, 'visibleMaterialVersionColumns', 'material version child table should render only visible child columns');
mustInclude(pageContent, "row.versions.length > 1 ? renderMultiVersionMaterialGroupActions(row) : renderSingleVersionMaterialGroupActions(row)", 'material main-row delete should depend on version count');
mustInclude(pageContent, '<Table stickyHeader size="small"', 'table should follow the compact sticky standard');
mustInclude(pageContent, 'TABLE_DATA_ROW_HEIGHT = 40', 'table rows should keep the 40px standard');
mustInclude(pageContent, 'calc(100vh - 150px)', 'single list pages should fill the app shell workspace');
mustInclude(pageContent, '<Tab label="数据信息" />', 'detail drawer should expose data information tab');
mustInclude(pageContent, '<Tab label="数据审计" />', 'detail drawer should expose data audit tab');
mustInclude(pageContent, 'theme.zIndex.drawer + 2', 'detail drawer should sit above the app header and tag bar');
mustInclude(pageContent, "transform: 'none !important'", 'detail drawer paper should stay inside the viewport when opened');
mustInclude(pageContent, 'Accordion', 'audit records should use accordion rows');
mustInclude(pageContent, '暂无审计记录', 'audit tab should use the standard empty wording');
mustInclude(pageContent, 'createdBy', 'pages should display creator metadata');
mustInclude(pageContent, 'updatedBy', 'pages should display updater metadata');
mustInclude(pageContent, 'getAuditLogs', 'detail drawer should use backend audit logs');
mustInclude(pageContent, 'entityType: config.entityType', 'audit query should use the current master data entity type');
mustInclude(pageContent, 'getAuditEntityIds', 'detail drawer audit queries should normalize and filter audit entity ids');
mustInclude(pageContent, "auditEntityId.startsWith('process-modeling-material-groups:')", 'detail drawer audit queries should not use virtual material group ids');
mustInclude(pageContent, '审计记录加载中', 'audit tab should show a loading state instead of an empty state while querying');
mustInclude(pageContent, '审计记录加载失败', 'audit tab should show query failures instead of silently showing an empty state');
mustInclude(pageContent, 'getApiErrorMessage', 'mutations should show concrete backend error messages');
mustInclude(pageContent, "anchorOrigin={{ vertical: 'top', horizontal: 'right' }}", 'operation feedback should appear in the top-right corner');
mustInclude(pageContent, "<Alert severity={snackbar.severity} onClose={closeSnackbar}>{snackbar.message}</Alert>", 'operation feedback should follow the system user management alert style');
mustNotInclude(pageContent, 'variant="filled"', 'operation feedback should not use filled alerts');
mustInclude(pageContent, "showSnackbar(`${config.title}保存成功`, 'success')", 'process modeling save success copy should follow the system user management pattern');
mustInclude(pageContent, "getApiErrorMessage(error, `${config.title}保存失败`)", 'process modeling save failure copy should follow the system user management pattern');
mustInclude(pageContent, "label: '状态'", 'all process modeling pages should expose status');
mustInclude(pageContent, "label: '创建人'", 'all process modeling tables should include creator');
mustInclude(pageContent, "label: '更新时间'", 'all process modeling tables should include update time');
mustNotInclude(pageContent, "codeAutoGenerated", 'material dialog should not show the old generated-code tip');
mustNotInclude(pageContent, "编码在提交时自动生成", 'material dialog should remove the generated-code notice text');
mustInclude(pageContent, "label: '版本'", 'material and document forms should expose version');
mustInclude(pageContent, "materialPurpose: '物料用途'", 'material table should expose material purpose label');
mustInclude(pageContent, "effectiveVersionCount: '生效版本数量'", 'material table should expose effective version count label');
mustInclude(pageContent, 'getMaterialVersionRuntimeStatus', 'material status should be derived from effective and expiry time');
mustInclude(pageContent, 'getMaterialGroupRuntimeStatus', 'material main status should be derived from grouped version runtime status');
mustInclude(pageContent, 'status: getMaterialGroupRuntimeStatus(sortedVersions)', 'material groups should store a grouped runtime status');
mustInclude(pageContent, "const materialRuntimeStatusOptions = [\n  { value: 'ALL', label: '全部' },\n  { value: 'ACTIVE', label: '启用' },\n  { value: 'PENDING', label: '待生效' },\n  { value: 'DISABLED', label: '禁用' },\n] as const;", 'material list status filter should use grouped material statuses');
mustInclude(pageContent, "getMaterialVersionRuntimeStatus(versionRow)", 'material version child status should use runtime status');
mustInclude(pageContent, "effectiveDate: '生效日期'", 'material version rows should expose effective date label');
mustInclude(pageContent, "expiryDate: '失效日期'", 'material version rows should expose expiry date label');
mustInclude(pageContent, "labels: { name: '物料名称', code: '物料料号', version: '版本数量' }", 'material main table should use material-specific name/code/version labels');
mustInclude(pageContent, "columns: baseColumns(['name', 'code', 'specification', 'materialTypeId', 'unit', 'version', 'effectiveVersionCount', 'materialPurpose', 'status', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']", 'material table should include version count, effective version count, and material purpose');
mustInclude(pageContent, "{ id: 'expiryDate', label: '失效日期' },\n      { id: 'description', label: '版本说明', multiline: true },\n    ],\n  },", 'material form should expose version description without a manual status control');
mustNotInclude(pageContent, "{ id: 'expiryDate', label: '失效日期' },\n      { id: 'description', label: '描述', multiline: true },", 'material form should not expose description field');
mustNotInclude(pageContent, "const MATERIAL_VERSION_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['version', 'status'", 'material version dialog should not expose manual status');
mustInclude(pageContent, 'getTodayDateTimeInput', 'material create should default effective time to today');
mustInclude(pageContent, 'MATERIAL_BASE_FIELD_IDS', 'material dialog should split base information fields');
mustInclude(pageContent, 'MATERIAL_VERSION_FIELD_IDS', 'material dialog should split version information fields');
mustInclude(pageContent, "const MATERIAL_VERSION_FIELD_IDS: Array<keyof ProcessModelingPayload> = ['version', 'effectiveDate', 'expiryDate', 'description'];", 'material version section should include version description without manual status');
mustInclude(pageContent, "type MaterialDialogMode = 'createMaterial' | 'editMaterial' | 'createVersion' | 'editVersion';", 'material dialog should distinguish create/edit material and version modes');
mustInclude(pageContent, 'const [materialDialogMode, setMaterialDialogMode] = useState<MaterialDialogMode | null>(null);', 'material dialog should store the active material dialog mode');
mustInclude(pageContent, "setMaterialDialogMode(pageKey === 'materials' ? 'createMaterial' : null);", 'new material dialog should use the create material mode');
mustInclude(pageContent, "setMaterialDialogMode('createVersion');", 'new material version dialog should use the create version mode');
mustInclude(pageContent, "version: '',", 'new material versions should not default the version field');
mustNotInclude(pageContent, "version: 'V1.0',\n      status: 'ACTIVE',\n      effectiveDate: getTodayDateTimeInput(),\n      expiryDate: null,", 'new material version dialog should not default version or manual status');
mustInclude(pageContent, 'isExpiryBeforeEffective', 'material forms should validate expiry time is not earlier than effective time');
mustInclude(pageContent, 'handleMaterialDateChange', 'material forms should normalize dependent effective and expiry date values');
mustInclude(pageContent, "inputProps={dateFieldId === 'expiryDate' && form.effectiveDate ? { min: form.effectiveDate } : undefined}", 'material expiry picker should disable options earlier than the effective date time');
mustInclude(pageContent, "isExpiryBeforeEffective(value, current.expiryDate) ? null : current.expiryDate", 'changing effective date should clear an already invalid expiry date');
mustInclude(pageContent, "失效时间不能早于生效时间", 'material forms should show a clear effective/expiry validation message');
mustInclude(pageContent, 'normalizeMaterialPayload', 'material save should trim submitted fields according to the active material dialog mode');
mustInclude(pageContent, "if (materialDialogMode === 'editMaterial')", 'editing material base information should not submit hidden version fields');
mustInclude(pageContent, "...pickMaterialPayload(normalized, MATERIAL_BASE_FIELD_IDS),", 'editing material base information should only submit base fields');
mustInclude(pageContent, "if (materialDialogMode === 'editVersion')", 'editing a material version should not submit hidden base fields');
mustInclude(pageContent, "return pickMaterialPayload(normalized, MATERIAL_VERSION_FIELD_IDS);", 'editing material versions should submit version fields only');
mustInclude(pageContent, "setMaterialDialogMode(materialMode ?? (pageKey === 'materials' ? 'editMaterial' : null));", 'material edit dialogs should distinguish main material and version edit modes');
mustInclude(pageContent, "const shouldRenderMaterialBaseSection = materialDialogMode === 'createMaterial' || materialDialogMode === 'editMaterial';", 'material create/edit should control the base information section');
mustInclude(pageContent, "const shouldRenderMaterialVersionSection = materialDialogMode === 'createMaterial' || materialDialogMode === 'createVersion' || materialDialogMode === 'editVersion';", 'material create/version dialogs should control the version information section');
mustInclude(pageContent, "shouldRenderMaterialBaseSection ? renderMaterialFormSection('物料基础信息', MATERIAL_BASE_FIELD_IDS) : null", 'editing material should show only base information while creating material keeps it visible');
mustInclude(pageContent, "shouldRenderMaterialVersionSection ? renderMaterialFormSection('物料版本信息', MATERIAL_VERSION_FIELD_IDS) : null", 'new material versions should show only version information');
mustInclude(pageContent, "renderMaterialFormSection('物料基础信息', MATERIAL_BASE_FIELD_IDS)", 'material dialog should show a base information section');
mustInclude(pageContent, "renderMaterialFormSection('物料版本信息', MATERIAL_VERSION_FIELD_IDS)", 'material dialog should show a version information section');
mustInclude(pageContent, 'materialName', 'material management should split material name into its own query field');
mustInclude(pageContent, 'materialCode', 'material management should split material code into its own query field');
mustInclude(pageContent, 'materialTypeName', 'material management should split material type into its own query field');
mustInclude(pageContent, 'renderMaterialFilters', 'material management should render dedicated filter controls');
mustInclude(pageContent, "import StatusBadge from '@/components/StatusBadge';", 'process modeling statuses should use the shared system status badge');
mustInclude(pageContent, "gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }", 'material query filters should show three fields per row on desktop');
mustInclude(pageContent, "gridColumn: { xs: '1', md: '3' }", 'material query buttons should attach to the end of the last filter row');
mustNotInclude(pageContent, 'const renderMaterialFilters = () => (\n    <Stack spacing={1.5}>', 'material query buttons should not be split into a separate row');
mustInclude(pageContent, '<StatusBadge label={getStatusLabel(pageKey === \'materials\' ? getMaterialVersionRuntimeStatus(row as MaterialRecord) : row.status)}', 'status column should use the shared system status badge');
mustInclude(pageContent, '<StatusBadge label={getStatusLabel(row.status)} color={getStatusColor(row.status)} />', 'material group status should use the grouped runtime status badge');
mustInclude(pageContent, '<StatusBadge label={getStatusLabel(getMaterialVersionRuntimeStatus(versionRow))}', 'material version status should use the shared system status badge');
mustNotInclude(pageContent, 'StatusPill', 'status column should not use a custom status component');
mustInclude(pageContent, 'renderRowActions', 'material grouped rows should render edit and delete operations');
mustInclude(pageContent, 'renderSingleVersionMaterialGroupActions', 'single-version material grouped rows should keep delete on the main row');
mustInclude(pageContent, 'renderMultiVersionMaterialGroupActions', 'multi-version material grouped rows should remove delete from the main row');
mustInclude(pageContent, 'row.versions.length > 1 ? renderMultiVersionMaterialGroupActions(row) : renderSingleVersionMaterialGroupActions(row)', 'material main-row delete should depend on version count');
mustInclude(pageContent, "type DeleteTargetScope = 'record' | 'material' | 'materialVersion';", 'material delete dialog should distinguish material and version deletion copy');
mustInclude(pageContent, "const deleteDialogTitle = pageKey === 'materials'", 'material delete dialog should use material-specific title copy');
mustInclude(pageContent, "确认删除物料版本", 'material version delete dialog should use the material version title');
mustInclude(pageContent, "删除后该物料版本将无法恢复。", 'material version delete dialog should explain the irreversible consequence');
mustInclude(pageContent, '<Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>', 'material delete dialog should follow the system user delete dialog size');
mustInclude(pageContent, '<DialogContent dividers>', 'material delete dialog should follow the system user delete dialog content style');
mustInclude(pageContent, '<Typography variant="body2">', 'material delete dialog should follow the system user delete dialog message style');
mustNotInclude(pageContent, "deleteDialogPaperSx", 'material delete dialog should not use the oversized custom paper style');
mustNotInclude(pageContent, "deleteDialogConfirmButtonSx", 'material delete dialog should not use the oversized custom button style');
mustNotInclude(pageContent, '<Alert severity="error">确定删除「{deleteTarget ? getDisplayName(deleteTarget) : \'\'}」吗？此操作不可撤销。</Alert>', 'delete dialog should not use the old alert-style confirmation body');
mustInclude(pageContent, 'renderFormField', 'dialog fields should be rendered through a reusable field helper');
mustInclude(pageContent, "const gridColumn = field.multiline ? '1 / -1' : undefined", 'dialog should allow multiline fields to span both columns');
mustInclude(pageContent, "gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }", 'dialog should use two fields per row on non-mobile widths');
mustInclude(pageContent, 'process-modeling-material-groups', 'material management should support grouped version rows');
mustInclude(pageContent, 'ExpandMore', 'material grouped rows should use an expand affordance');
mustInclude(pageContent, 'renderMaterialVersionTable', 'expanded material rows should render a nested version table');
mustInclude(pageContent, '<Table stickyHeader size="small" aria-label="物料版本列表"', 'expanded material rows should use a nested child table');
mustNotInclude(pageContent, "...tableHeaderCellSx, height: 40", 'material version table header should match the main table header height');
mustInclude(pageContent, "sx={{ p: 0, bgcolor: '#fafcff' }}", 'material version child table should fill the parent container without side padding');
mustInclude(pageContent, 'MATERIAL_VERSION_COLUMNS', 'material version child table should use its own column model');
mustInclude(pageContent, `<Table stickyHeader size="small" aria-label="物料版本列表" sx={{ tableLayout: 'fixed', width: totalMaterialVersionTableWidth, minWidth: totalMaterialVersionTableWidth }}>`, 'material version child table should use persisted child table widths');
mustInclude(pageContent, "<TableContainer sx={{ width: '100%', bgcolor: '#fff', overflow: 'visible' }}>", 'material version child table should let the action column stick to the main table scroll viewport');
mustInclude(pageContent, "{visibleMaterialVersionColumns.map((column) => <col key={`${group.id}:${column.id}`} style={{ width: getMaterialVersionColumnWidth(column) }} />)}", 'material version child table should use visible child column widths');
mustInclude(pageContent, "{visibleMaterialVersionColumns.map((column) => (", 'material version child table should render visible child headers and cells');
mustInclude(pageContent, "onMouseDown={(event) => beginMaterialVersionColumnResize(event, column.id)}", 'material version child table headers should be resizable');
mustInclude(pageContent, "...getStickyActionColumnSx(column, 'head')", 'material version action header should use the main sticky action style');
mustInclude(pageContent, "...getStickyActionColumnSx(column, 'body')", 'material version action cell should use the main sticky action style');
mustInclude(pageContent, '物料版本号', 'material version child table should include version number');
mustInclude(pageContent, '版本状态', 'material version child table should include version status');
mustInclude(pageContent, '生效日期', 'material version child table should include effective date');
mustInclude(pageContent, '失效日期', 'material version child table should include expiry date');
mustInclude(pageContent, '版本说明', 'material version child table should include version description');
mustInclude(pageContent, "['version', 'status', 'effectiveDate', 'expiryDate', 'description', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions']", 'material version child table should include date, description, audit metadata, and action columns');
mustInclude(pageContent, "id === 'createdBy' ? '创建人'", 'material version child table should label the creator column');
mustInclude(pageContent, "id === 'createdAt' ? '创建时间'", 'material version child table should label the created time column');
mustInclude(pageContent, "id === 'updatedBy' ? '更新人'", 'material version child table should label the updater column');
mustInclude(pageContent, "id === 'updatedAt' ? '更新时间'", 'material version child table should label the updated time column');
mustInclude(pageContent, "column.id === 'description' ? versionRow.description || '-'", 'material version child table should render version description');
mustInclude(pageContent, "column.id === 'createdBy' ? versionRow.createdBy || '-'", 'material version child table should render creator');
mustInclude(pageContent, "column.id === 'createdAt' ? formatDateTime(versionRow.createdAt)", 'material version child table should render created time');
mustInclude(pageContent, "column.id === 'updatedBy' ? versionRow.updatedBy || '-'", 'material version child table should render updater');
mustInclude(pageContent, "column.id === 'updatedAt' ? formatDateTime(versionRow.updatedAt)", 'material version child table should render updated time');
mustInclude(pageContent, 'renderMaterialVersionActions', 'material version child table should render version actions');
mustInclude(pageContent, 'openCreateMaterialVersionDialog', 'material group rows should support adding child versions');
mustInclude(pageContent, '<PlaylistAdd fontSize="small" />', 'material group rows should use add-version icon');
mustInclude(pageContent, "title=\"新增子版本\"", 'material group rows should show add child version action');
mustInclude(pageContent, "renderEditAction(group.latestVersion, '编辑', 'editMaterial')", 'main material row edit should open the base information dialog');
mustInclude(pageContent, "openEditDialog(row, 'editVersion')", 'material version row edit should open the version information dialog');
mustNotInclude(pageContent, 'toggleMaterialVersionStatus', 'material version child table status should not be manually toggled');
mustNotInclude(pageContent, 'ToggleOff', 'material version child table should not show manual disable action');
mustNotInclude(pageContent, 'ToggleOn', 'material version child table should not show manual enable action');
mustInclude(pageContent, 'expandAllMaterialGroups', 'material toolbar should support expanding all material groups');
mustInclude(pageContent, 'collapseAllMaterialGroups', 'material toolbar should support collapsing all material groups');
mustInclude(pageContent, 'aria-label="全部展开"', 'material toolbar should expose expand all action');
mustInclude(pageContent, 'aria-label="全部收起"', 'material toolbar should expose collapse all action');
mustInclude(pageContent, 'selectedAuditEntityIds', 'material grouped drawer audit should request all version audit records');
mustInclude(pageContent, 'Promise.all(selectedAuditEntityIds.map', 'material grouped drawer audit should merge audit logs for all selected version ids');
mustInclude(pageContent, 'openMaterialGroupDrawer', 'material main rows should open a grouped material drawer');
mustInclude(pageContent, 'openMaterialVersionDrawer', 'material version rows should open a single-version drawer');
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

mustInclude(processModelingControllerContent, 'resolveMaterialRuntimeStatus', 'backend material status should be derived from effective and expiry time');
mustInclude(processModelingControllerContent, 'resolveMaterialGroupRuntimeStatus', 'backend material group status should be derived from all version runtime statuses');
mustInclude(processModelingControllerContent, '.filter(group -> matchesStatus(group.getStatus(), status))', 'material list should filter by grouped derived runtime status');
mustInclude(processModelingControllerContent, 'case "status" -> Comparator.comparing(this::resolveMaterialRuntimeStatus', 'material status sorting should use derived runtime status');
mustInclude(processModelingControllerContent, '.status(resolveMaterialGroupRuntimeStatus(sortedVersions))', 'material groups should expose grouped derived runtime status');
mustInclude(processModelingControllerContent, '.peek(material -> material.setStatus(resolveMaterialRuntimeStatus(material)))', 'material versions should expose derived runtime status');
mustInclude(processModelingControllerContent, 'if (effectiveDate != null && effectiveDate.isAfter(now)) return "PENDING";', 'future effective material versions should be pending');
mustInclude(processModelingControllerContent, 'if (expiryDate != null && !expiryDate.isAfter(now)) return "EXPIRED";', 'expired material versions should be expired');
mustInclude(processModelingControllerContent, 'if (statuses.stream().allMatch("EXPIRED"::equals)) return "DISABLED";', 'material group should be disabled when all versions are expired');
mustInclude(processModelingControllerContent, 'validateMaterialDateRange(request);', 'backend material create/update should validate effective and expiry time range');
mustInclude(processModelingControllerContent, 'throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");', 'backend should reject material expiry time earlier than effective time');

if (failures.length > 0) {
  console.error('Process modeling verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Process modeling verification passed.');
