import { existsSync, readFileSync } from 'node:fs';

const failures = [];
const frontendRoot = new URL('../', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);

function read(root, path) {
  const url = new URL(path, root);
  if (!existsSync(url)) {
    failures.push(`${path}: missing file`);
    return '';
  }
  return readFileSync(url, 'utf8');
}

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

const page = read(frontendRoot, 'src/pages/system/AuditLogPage.tsx');
const api = read(frontendRoot, 'src/api/audit.ts');
const packageJson = read(frontendRoot, 'package.json');
const uiStandard = read(repoRoot, 'docs/design-audit/organization-management-ui-standard.md');
const controller = read(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/AuditController.java');
const dto = read(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/dto/AuditLogItem.java');
const event = read(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/entity/AuditEvent.java');
const auditable = read(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/common/audit/Auditable.java');
const auditAspect = read(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/common/audit/AuditAspect.java');
const auditControllerTest = read(repoRoot, 'gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller/AuditControllerTest.java');
const auditMigration = read(repoRoot, 'gmp-platform/backend/src/main/resources/db/changelog/0008-audit-log-context-fields.sql');

mustInclude(packageJson, '"verify:audit-log-page": "node scripts/verify-audit-log-page.mjs"', 'audit log verification should be runnable from npm');

mustInclude(uiStandard, '安全管理下的审计日志列表必须明确展示：操作人、账号、操作时间、操作动作、触发方式、功能模块、菜单、具体功能', 'UI standard should lock the audit log required columns');
mustInclude(uiStandard, '审计日志中的功能模块必须展示最左侧模块栏名称', 'UI standard should require audit function module to use the left sidebar module name');
mustInclude(uiStandard, '菜单必须展示为“一级目录 · 二级目录”', 'UI standard should require first-level and second-level menu paths');
mustInclude(uiStandard, '具体功能只展示功能名称', 'UI standard should keep specific functions free of menu prefixes');
mustInclude(uiStandard, '审计字段必须翻译成中文业务名称', 'UI standard should require readable audit field labels');
mustInclude(uiStandard, '涉及文件、图标、Logo、浏览器图标的审计必须保存并展示快照和预览地址', 'UI standard should require media audit snapshots');
mustInclude(uiStandard, '操作数据不在列表中展示，必须放入详情抽屉', 'UI standard should keep operated data in the detail drawer');
mustInclude(uiStandard, '筛选条件必须传到后端分页接口', 'UI standard should require backend-backed audit filtering');
mustInclude(uiStandard, 'operatorDisplayName', 'UI standard should document audit operator display name contract');
mustInclude(uiStandard, 'operatorAccount', 'UI standard should document audit operator account contract');
mustInclude(uiStandard, 'operationTime', 'UI standard should document audit operation time contract');
mustInclude(uiStandard, 'triggerMethodLabel', 'UI standard should document audit trigger method label contract');
mustInclude(uiStandard, 'moduleName', 'UI standard should document audit module name contract');
mustInclude(uiStandard, 'menuName', 'UI standard should document audit menu name contract');
mustInclude(uiStandard, 'functionName', 'UI standard should document audit function name contract');
mustInclude(uiStandard, 'dataSummary', 'UI standard should document audit operated data contract');

mustInclude(api, 'export interface AuditLogItem', 'frontend audit API should expose a typed list item');
mustInclude(api, 'operatorDisplayName?: string', 'audit API type should include operator display name');
mustInclude(api, 'operatorAccount?: string', 'audit API type should include operator account');
mustInclude(api, 'operationTime?: string', 'audit API type should include operation time');
mustInclude(api, 'triggerMethod?: string', 'audit API type should include trigger method');
mustInclude(api, 'moduleName?: string', 'audit API type should include module name');
mustInclude(api, 'menuName?: string', 'audit API type should include menu name');
mustInclude(api, 'functionName?: string', 'audit API type should include function name');
mustInclude(api, 'dataSummary?: string', 'audit API type should include operated data summary');

mustInclude(page, 'AUDIT_COLUMN_SETTINGS_STORAGE_PREFIX', 'audit table should persist field settings by current user');
mustInclude(page, 'audit-log-column-settings:', 'audit table settings should have a dedicated namespace');
mustInclude(page, 'getAuditColumnSettingsStorageKey', 'audit column settings should be scoped by login user');
mustInclude(page, 'AUDIT_PAGE_SIZE_OPTIONS = [20, 50, 100, 200]', 'audit page should use standard page-size options');
mustInclude(page, 'AUDIT_QUERY_FIELD_SX', 'audit query fields should share a fixed three-column layout style');
mustInclude(page, "gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }", 'audit query area should show three fields per row on desktop');
mustInclude(page, 'AUDIT_QUERY_BUTTON_SX', 'audit page should use standard query/reset button sizing');
mustInclude(page, '<Button size="small" sx={AUDIT_QUERY_BUTTON_SX} variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>重置</Button>', 'audit reset button should match the standard query area text button');
mustInclude(page, '<Button size="small" sx={AUDIT_QUERY_BUTTON_SX} variant="contained" startIcon={<Search />} onClick={() => setPage(1)}>查询</Button>', 'audit query button should match the standard query area text button');
mustNotInclude(page, 'Tooltip title="重置筛选"', 'audit query area should not use icon-only reset action');
mustNotInclude(page, 'Tooltip title="查询"', 'audit query area should not use icon-only query action');
mustInclude(page, 'TABLE_DATA_ROW_HEIGHT = 40', 'audit table should use standard compact data rows');
mustInclude(page, 'data-audit-log-column-settings-trigger', 'audit table should expose field settings trigger');
mustInclude(page, 'data-audit-log-column-settings-row', 'audit field setting rows should be testable');
mustInclude(page, 'draggable', 'audit field settings should support drag sorting');
mustInclude(page, 'onDragStart={(event) => handleColumnSettingDragStart(event, column.id)}', 'audit field setting rows should start drag sorting');
mustInclude(page, 'toggleAuditColumnVisibility(column.id)', 'audit field setting rows should toggle visibility');
mustInclude(page, "AUDIT_LOG_PAGE_HEIGHT = 'calc(100vh - 142px)'", 'audit page should lock the app-shell workspace height');
mustInclude(page, 'height: AUDIT_LOG_PAGE_HEIGHT', 'audit page should prevent body-level overflow');
mustInclude(page, "minHeight: 0", 'audit page should allow inner table scrolling');
mustInclude(page, 'width: resolvedTableWidth', 'audit table should fill available table container width');
mustInclude(page, 'minWidth: resolvedTableWidth', 'audit table should not leave blank space when columns are narrower than the container');
mustInclude(page, '<Table stickyHeader size="small" sx={{ tableLayout: \'fixed\', width: resolvedTableWidth, minWidth: resolvedTableWidth, height: isAuditTableEmptyState ? \'100%\' : \'auto\' }}>', 'audit table should follow the standard full-height empty-state pattern');
mustInclude(page, '<TableBody sx={{ height: isAuditTableEmptyState ? \'100%\' : \'auto\' }}>', 'audit table body should only stretch empty states');
mustInclude(page, 'colSpan={visibleAuditColumns.length}', 'audit empty states should respect hidden columns');
mustInclude(page, 'startAdornment: <InputAdornment position="start" sx={{ mr: 0 }}>每页</InputAdornment>', 'audit footer should use standard page-size adornment');
mustInclude(page, 'openAuditDetailDrawer(row)', 'clicking an audit row should open details drawer');
mustInclude(page, '<Drawer anchor="right"', 'audit details should use a right-side drawer');
mustInclude(page, 'zIndex: 1300', 'audit details drawer should render above the fixed app header');
mustInclude(page, '...appContentDrawerSx', 'audit drawer paper should inherit the full-height high-z-index layer');
mustInclude(page, "transform: 'none !important'", 'audit drawer paper should not remain translated off-screen after opening');
mustInclude(page, "transition: 'none !important'", 'audit drawer paper should avoid stale slide transition state in the app shell');
mustInclude(page, '信息查看', 'audit drawer should use standard title wording');
mustInclude(page, '<Tab label="数据信息" />', 'audit drawer should expose data info tab');
mustInclude(page, '<Tab label="数据审计" />', 'audit drawer should expose data audit tab');
mustInclude(page, 'DetailSection title="行为信息"', 'audit data info tab should group behavior fields');
mustInclude(page, 'DetailSection title="操作对象"', 'audit data info tab should group operated data fields');
mustInclude(page, 'DetailSection title="环境信息"', 'audit data info tab should group trigger method and IP');
mustNotInclude(page, '<DetailField label="对象类型">', 'audit drawer should not expose raw entity type');
mustNotInclude(page, '<DetailField label="对象ID">', 'audit drawer should not expose raw entity id');
mustInclude(page, 'getAuditMenuDisplayName', 'audit list and drawer should normalize menu names to first-level · second-level paths');
mustInclude(page, 'buildAuditMenuPathByName', 'audit menu display should be backed by the managed sidebar menu hierarchy');
mustInclude(page, 'getAuditFunctionDisplayName', 'audit list and drawer should show only the concrete function name');
mustInclude(page, 'normalizeAuditModuleName', 'audit list and drawer should normalize legacy module names');
mustInclude(page, 'getAuditColumnValue', 'audit table cells should use normalized display values');
mustInclude(page, 'auditFieldLabelMap', 'audit data diff fields should be translated to Chinese labels');
mustInclude(page, 'formatAuditMediaSnapshot', 'audit data diff should render readable media snapshots for icon/logo/favicon fields');
mustInclude(page, 'isAuditMediaField', 'audit data diff should detect icon/logo/favicon media fields');
mustInclude(page, 'mediaPreviewUrl', 'audit media snapshot rows should keep a preview URL for readable original/new asset comparison');
mustInclude(page, '文件 ID', 'audit media snapshots should expose the file id as Chinese text');
mustInclude(page, '预览地址', 'audit media snapshots should expose the preview URL as Chinese text');
mustInclude(page, '来源', 'audit media snapshots should expose the asset source as Chinese text');
mustInclude(page, '标签', 'audit media snapshots should expose asset tags as Chinese text');
mustInclude(page, '系统 Logo', 'audit field labels should translate system logo fields');
mustInclude(page, '网站图标', 'audit field labels should translate favicon/browser icon fields');
mustInclude(page, '图标素材', 'audit field labels should translate icon asset fields');
mustNotInclude(page, 'label: key', 'audit data diff must not display raw technical keys as field labels');
mustNotInclude(page, 'auditFieldLabelMap[field] ?? field', 'audit field label fallback must not directly expose technical field keys');
mustInclude(page, 'AuditSummaryRecord', 'audit drawer should show operated data using the audit record display pattern');
mustInclude(page, 'title="操作数据"', 'audit drawer should include operated data in the audit-style record');
mustInclude(page, 'AuditFieldBlock title="变更前"', 'audit drawer should show before content');
mustInclude(page, 'AuditFieldBlock title="变更后"', 'audit drawer should show after content');
mustInclude(page, '暂无审计记录', 'audit page should use concise empty audit text');
mustInclude(page, 'if (filters.operatorName) params.operatorName = filters.operatorName;', 'audit query should send operator name to backend');
mustInclude(page, 'if (filters.operatorAccount) params.operatorAccount = filters.operatorAccount;', 'audit query should send operator account to backend');
mustInclude(page, 'if (filters.action) params.action = filters.action;', 'audit query should send action to backend');
mustInclude(page, 'if (filters.moduleName) params.moduleName = filters.moduleName;', 'audit query should send module name to backend');
mustInclude(page, 'if (filters.menuName) params.menuName = filters.menuName;', 'audit query should send menu name to backend');
mustNotInclude(page, 'dataKeyword:', 'audit page filters should not keep operated data as a query condition');
mustNotInclude(page, 'filters.dataKeyword', 'audit page should not submit operated data keyword from the query area');
mustNotInclude(page, 'label="操作数据"', 'audit query area should not render operated data as a filter field');
mustNotInclude(page, 'source.filter((row)', 'audit filters should be backed by the API instead of only filtering the current page');

mustAppearInOrder(page, [
  "{ id: 'operatorDisplayName', label: '操作人'",
  "{ id: 'operatorAccount', label: '账号'",
  "{ id: 'operationTime', label: '操作时间'",
  "{ id: 'actionLabel', label: '操作动作'",
  "{ id: 'triggerMethod', label: '触发方式'",
  "{ id: 'moduleName', label: '功能模块'",
  "{ id: 'menuName', label: '菜单'",
  "{ id: 'functionName', label: '具体功能'",
], 'audit table columns should answer who/account/when/action/how/module/menu/function in order');
mustNotInclude(page, "{ id: 'dataSummary', label: '操作数据'", 'operated data should not be a list column');

for (const label of ['操作人', '账号', '操作时间', '操作动作', '触发方式', '功能模块', '菜单', '具体功能', '操作数据']) {
  mustInclude(page, label, `audit page should show ${label}`);
}

mustNotInclude(page, '<Typography variant="h5">审计日志</Typography>', 'audit page should not keep the old loose title-only layout');
mustNotInclude(page, '<TableContainer>', 'audit page should not use the old unconstrained table container');

for (const field of [
  'operatorAccount',
  'moduleName',
  'menuName',
  'functionName',
  'dataSummary',
]) {
  mustInclude(event, field, `AuditEvent entity should include ${field}`);
  mustInclude(auditMigration, field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), `audit_event migration should include ${field}`);
  mustInclude(dto, field, `audit list DTO should include ${field}`);
}

mustInclude(dto, 'operatorDisplayName', 'audit list DTO should include operator display name');
mustInclude(dto, 'operationTime', 'audit list DTO should expose operation time');
mustInclude(dto, 'actionLabel', 'audit list DTO should expose action display name');
mustInclude(dto, 'triggerMethod', 'audit list DTO should expose trigger method');
mustInclude(dto, 'triggerMethodLabel', 'audit list DTO should expose trigger method label');
mustInclude(controller, 'PageResult<AuditLogItem>', 'audit list endpoint should return the richer audit DTO');
mustInclude(controller, 'toAuditLogItem', 'audit controller should map entity to display DTO');
mustInclude(controller, 'matchesAuditText', 'audit controller should filter against resolved display fields');
mustInclude(controller, 'resolveOperatorDisplayName', 'audit controller should resolve a person name from account/id when possible');
mustInclude(controller, 'resolveActionLabel', 'audit controller should resolve action label');
mustInclude(controller, 'resolveModuleName', 'audit controller should resolve module label');
mustInclude(controller, 'resolveMenuName', 'audit controller should resolve menu label');
mustInclude(controller, 'resolveFunctionName', 'audit controller should resolve specific function label');
mustInclude(controller, 'normalizeModuleLabel', 'audit controller should normalize legacy module labels');
mustInclude(controller, 'resolveLeftSidebarModuleName', 'audit controller should keep function module aligned to the left sidebar module name');
mustInclude(controller, 'return moduleName + " · " + menuLeaf;', 'audit controller should emit first-level and second-level menu paths');
mustInclude(controller, 'stripMenuPrefix', 'audit controller should remove legacy menu prefixes from function names');
mustNotInclude(controller, 'return menuName + " · " + actionLabel;', 'audit controller should not use menu-prefixed function fallback');
mustInclude(controller, 'resolveDataSummary', 'audit controller should resolve operated data summary');
for (const actionLabel of [
  'Map.entry("REORDER", "排序调整")',
  'Map.entry("BATCH_DELETE", "批量删除")',
  'Map.entry("UPLOAD_LOGO", "上传系统 Logo")',
  'Map.entry("UPLOAD_FAVICON", "上传网站图标")',
  'Map.entry("DELETE_LOGO", "删除系统 Logo")',
  'Map.entry("DELETE_FAVICON", "删除网站图标")',
  'Map.entry("MOVE", "移动")',
]) {
  mustInclude(controller, actionLabel, `audit controller should translate ${actionLabel}`);
}
for (const option of [
  "{ value: 'REORDER', label: '排序调整' }",
  "{ value: 'BATCH_DELETE', label: '批量删除' }",
  "{ value: 'UPLOAD_LOGO', label: '上传系统 Logo' }",
  "{ value: 'UPLOAD_FAVICON', label: '上传网站图标' }",
  "{ value: 'DELETE_LOGO', label: '删除系统 Logo' }",
  "{ value: 'DELETE_FAVICON', label: '删除网站图标' }",
  "{ value: 'MOVE', label: '移动' }",
]) {
  mustInclude(page, option, `audit action filter should expose translated option ${option}`);
}
mustInclude(controller, '@RequestParam(required = false) String operatorAccount', 'audit endpoint should accept operator account query');
mustInclude(controller, '@RequestParam(required = false) String moduleName', 'audit endpoint should accept module name query');
mustInclude(controller, '@RequestParam(required = false) String menuName', 'audit endpoint should accept menu name query');
mustInclude(controller, '@RequestParam(required = false) String dataKeyword', 'audit endpoint should accept operated data query');
mustNotInclude(controller, '@PostMapping\n    public ApiResponse<AuditEvent> create', 'audit log controller must not expose mutation endpoints');
mustNotInclude(controller, '@PutMapping("/{id}")\n    public ApiResponse<AuditEvent> update', 'audit log controller must not expose mutation endpoints');
mustNotInclude(controller, '@DeleteMapping("/{id}")\n    public ApiResponse<Void> delete', 'audit log controller must not expose mutation endpoints');

for (const method of ['moduleName()', 'menuName()', 'functionName()', 'dataSummary()']) {
  mustInclude(auditable, method, `Auditable annotation should expose ${method}`);
}
for (const setter of [
  '.moduleName(auditable.moduleName())',
  '.menuName(auditable.menuName())',
  '.functionName(auditable.functionName())',
  '.dataSummary(auditable.dataSummary())',
]) {
  mustInclude(auditAspect, setter, `AuditAspect should persist ${setter}`);
}
mustInclude(auditControllerTest, 'auditLogsDoNotExposeMutationEndpoints', 'audit controller tests should lock read-only audit logs');
mustInclude(auditControllerTest, 'listFiltersAgainstResolvedDisplayFieldsForLegacyAuditRows', 'audit controller tests should lock resolved display field filtering');
mustInclude(auditControllerTest, 'listResolvesFunctionModuleToLeftSidebarModuleName', 'audit controller tests should lock function module as left sidebar module');

if (failures.length > 0) {
  console.error('Audit log page verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Audit log page verification passed.');
