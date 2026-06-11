import { readFileSync } from 'node:fs';

const content = readFileSync(new URL('../src/pages/system/RolePage.tsx', import.meta.url), 'utf8');
const menuManagementContent = readFileSync(new URL('../src/utils/menuManagement.ts', import.meta.url), 'utf8');
const packageContent = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const uiStandardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const failures = [];

function mustInclude(token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function packageMustInclude(token, reason) {
  if (!packageContent.includes(token)) failures.push(`missing package ${JSON.stringify(token)} (${reason})`);
}

function menuManagementMustInclude(token, reason) {
  if (!menuManagementContent.includes(token)) failures.push(`missing menu management ${JSON.stringify(token)} (${reason})`);
}

function menuManagementMustNotInclude(token, reason) {
  if (menuManagementContent.includes(token)) failures.push(`unexpected menu management ${JSON.stringify(token)} (${reason})`);
}

function uiStandardMustInclude(token, reason) {
  if (!uiStandardContent.includes(token)) failures.push(`missing UI standard ${JSON.stringify(token)} (${reason})`);
}

function mustAppearInOrder(tokens, reason) {
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

packageMustInclude('"verify:role-management": "node scripts/verify-role-management-layout.mjs"', 'role page verification should be runnable from npm scripts');
uiStandardMustInclude('字段设置作为后续表格页面的标准能力和复用模板', 'role page should follow reusable field settings standard');

mustInclude('ROLE_COLUMN_WIDTH_STORAGE_PREFIX', 'role table column widths should have a page namespace');
mustInclude('role-management-column-widths:', 'role table column widths should persist per page and user');
mustInclude('ROLE_COLUMN_SETTINGS_STORAGE_PREFIX', 'role table column settings should have a page namespace');
mustInclude('role-management-column-settings:', 'role table column settings should persist per page and user');
mustInclude('ConfigurableRoleColumnId', 'role table should separate configurable data fields from fixed select/action columns');
mustInclude('RoleColumnSettings', 'role table should use a normalized settings contract');
mustInclude('roleColumns', 'role table should be model-driven');
mustAppearInOrder([
  "{ id: 'name', label: '岗位角色'",
  "{ id: 'description', label: '描述'",
  "{ id: 'isBuiltin', label: '是否内置'",
  "{ id: 'createdBy', label: '创建人'",
  "{ id: 'createdAt', label: '创建时间'",
  "{ id: 'updatedBy', label: '更新人'",
  "{ id: 'updatedAt', label: '更新时间'",
], 'role table should use the expected business field order');
mustNotInclude("{ id: 'code', label: '岗位编码'", 'role table should not show role code as a standard column');
mustInclude("column.id === 'isBuiltin'", 'role table should render the built-in flag column');
mustInclude('isBuiltinRole(row)', 'role table should use backend built-in flag with ADMIN fallback');
mustInclude('getRoleColumnSettingsStorageKey', 'role column settings should be scoped to current login user');
mustInclude('loadRoleColumnSettings', 'role column settings should restore from localStorage');
mustInclude('normalizeRoleColumnSettings', 'role column settings should tolerate stale saved settings');
mustInclude('visibleRoleColumns', 'role table should render from current visible column settings');
mustInclude('columnSettingsItems', 'role field settings popover should list configurable fields');
mustInclude('visibleConfigurableRoleColumnCount <= 1', 'role field settings should keep at least one data column visible');
mustInclude('localStorage.setItem(columnSettingsStorageKey', 'role column settings should persist changes');
mustInclude('localStorage.setItem(columnWidthStorageKey', 'role column widths should persist changes');
mustInclude('resolveRoleColumnWidths(columnWidths, tableContainerWidth, visibleRoleColumns)', 'role table should distribute width across visible columns');
mustInclude('tableContainerRef', 'role table should measure its container width');
mustInclude('ResizeObserver', 'role table should recompute widths when the container changes');

mustInclude('TABLE_DATA_ROW_HEIGHT = 40', 'role table should use the compact 40px data row standard');
mustInclude('tableHeaderCellSx', 'role table header should use the shared compact header style');
mustInclude('tableBodyCellSx', 'role table body should use compact row styling');
mustInclude("boxShadow: 'inset 0 -1px 0 #ebeef5'", 'role table row divider should not add to row height');
mustInclude('emptyTableBodyCellSx', 'role table empty/loading/error states should fill the container');
mustInclude('const isRoleTableEmptyState = isLoading || isError || pagedRows.length === 0;', 'role table should track empty state for full-height rendering');
mustInclude('<Table stickyHeader size="small" sx={{ tableLayout: \'fixed\', width: totalTableWidth, minWidth: totalTableWidth, height: isRoleTableEmptyState ? \'100%\' : \'auto\' }}>', 'role table should stretch only empty states');
mustInclude('<TableBody sx={{ height: isRoleTableEmptyState ? \'100%\' : \'auto\' }}>', 'role table body should stretch only empty states');
mustInclude('<TableCell colSpan={visibleRoleColumns.length}', 'role table empty state should respect hidden columns');
mustInclude('<colgroup>', 'role table should apply widths through colgroup');
mustInclude('visibleRoleColumns.map((column)', 'role table should render colgroup, header, and rows from visible columns');
mustInclude('getStickyActionColumnSx', 'role action column should be sticky on the right');
mustInclude('ROLE_ACTION_COLUMN_WIDTH', 'role action column should have a fixed reusable width');
mustInclude('data-role-action-column-shadow', 'role table should draw one full-height action-column shadow');
mustInclude('tableScrollbarWidth', 'role action shadow should account for the vertical scrollbar gutter');

mustInclude('data-role-column-settings-trigger', 'role table should expose a field settings trigger');
mustInclude('aria-label="字段设置"', 'field settings trigger should be icon-only and accessible');
mustInclude('Popover', 'role field settings should render as a popover');
mustInclude('data-role-column-settings-panel', 'role field settings popover should expose a testable panel');
mustInclude('data-role-column-settings-row', 'role field setting rows should be testable');
mustInclude('DragIndicator', 'field setting rows should show a drag handle icon');
mustInclude('ViewColumnRounded', 'field settings trigger should use the column icon');
mustInclude('TuneRounded', 'field settings trigger should show a tuning affordance');
mustInclude('handleColumnSettingDragStart', 'field settings should support native drag sorting');
mustInclude('beginColumnSettingPointerDrag', 'field settings should support pointer drag sorting');
mustInclude('document.elementFromPoint', 'pointer drag sorting should use the row under the pointer');
mustInclude('getColumnSettingDropPlacement', 'field settings should allow dropping before or after a target row');
mustInclude('toggleRoleColumnVisibility(column.id)', 'field settings should toggle role columns');

mustInclude('filters', 'role page should expose query filters');
mustInclude("name: ''", 'role filters should include role name');
mustNotInclude("const emptyFilters: RoleFilters = {\n  name: '',\n  code: '',\n};", 'role filters should not include role code');
mustInclude('resetFilters', 'role page should support resetting query filters');
mustInclude('RestartAlt', 'role filter reset should use the standard reset icon');
mustInclude('Search', 'role filter query should use the standard search icon');
mustInclude('ROLE_QUERY_BUTTON_SX', 'role query action buttons should share fixed dimensions');
mustInclude('openCreateDialog', 'role page should support creating roles');
mustInclude('openEditDialog(row)', 'role table edit action should open the role dialog');
mustNotInclude('label="岗位编码"', 'role add/edit dialog should not show role code');
mustNotInclude('code: form.code.trim()', 'role save payload should not include manually entered code');
mustNotInclude('!form.code.trim()', 'role form validation should not require role code');
mustInclude('deleteMutation', 'role page should support deleting roles');
mustInclude('isBuiltinRole(row)', 'role page should protect the default system administrator role and backend built-in roles');
mustInclude('系统管理员角色不允许删除', 'role delete action should explain protected system role deletion');
mustInclude('getUsers', 'role delete confirmation should load users to find accounts assigned to the role');
mustInclude('fetchAllRoleAssignedUsers', 'role page should fetch all users for role delete impact analysis');
mustInclude("queryClient.fetchQuery({ queryKey: ['role-management-users'], queryFn: fetchAllRoleAssignedUsers })", 'role delete should refresh assigned users before deciding whether to show the dangerous confirmation');
mustInclude('if (assignedUsers.length === 0)', 'role delete should skip the confirmation dialog when no accounts are assigned');
mustInclude('deleteMutation.mutate(row.id)', 'role delete should directly delete roles that have no assigned accounts');
mustInclude('deleteConfirmAssignedUsers', 'role delete confirmation should derive affected accounts for the selected role');
mustInclude('<Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} maxWidth="sm" fullWidth>', 'role delete confirmation should match the user management delete dialog sizing');
mustInclude('<Stack spacing={1.5}>', 'role delete confirmation should match the user management delete dialog spacing');
mustInclude('<Alert severity="error">危险的操作，请仔细阅读并确认数据后操作</Alert>', 'role delete confirmation should use the same danger alert style as user management');
mustInclude("bgcolor: '#f8fafc'", 'role delete impacted account list should match the user management delete list background');
mustInclude('data-role-delete-impacted-users', 'role delete confirmation should expose a testable affected account list');
mustInclude('危险的操作，请仔细阅读并确认数据后操作', 'role delete confirmation should clearly mark the action as dangerous');
mustInclude('当前有以下账号还挂载了该岗位角色', 'role delete confirmation should list accounts still assigned to the role');
mustInclude('岗位角色将置空', 'role delete confirmation should explain assigned users will lose roles');
mustInclude('账户状态会变成禁用', 'role delete confirmation should explain assigned users will be disabled');
mustInclude('确认删除', 'role delete confirm button should match the user management batch delete action wording');
mustInclude("queryClient.invalidateQueries({ queryKey: ['role-management-users'] });", 'role delete should refresh role impact users after deletion');
mustInclude("queryClient.invalidateQueries({ queryKey: ['roles-all'] });", 'role changes should refresh user and organization role-name lookups');
mustInclude("queryClient.invalidateQueries({ queryKey: ['users', 'user-management-all'] });", 'role delete should refresh the user management table cache directly');
mustInclude('getApiErrorMessage', 'role mutations should surface concrete backend error messages');
mustInclude('showSnackbar', 'role page should use a shared top-right snackbar helper');
mustInclude("anchorOrigin={{ vertical: 'top', horizontal: 'right' }}", 'role operation feedback should appear in the top-right corner');

mustInclude('roleDrawerOpen', 'role row click should open a detail drawer');
mustInclude('openRoleDetailDrawer(row)', 'role table rows should open the drawer from row click');
mustInclude('<Drawer anchor="right"', 'role detail should use the standard right drawer');
mustInclude('<Tab label="数据信息" />', 'role drawer should include data info tab');
mustInclude('<Tab label="数据审计" />', 'role drawer should include data audit tab');
mustInclude('<DetailField label="创建人">', 'role drawer should show creator');
mustInclude('<DetailField label="更新时间">', 'role drawer should show update time');
mustInclude('getAuditLogs', 'role drawer audit tab should query backend audit logs');
mustInclude("entityType: 'ROLE'", 'role audit query should use the ROLE entity type');
mustInclude('roleAuditRecords', 'role drawer should transform role audit events into display records');
mustInclude('Accordion', 'role drawer audit records should use accordion rows');
mustInclude('data-audit-accordion-row', 'role audit accordion rows should be testable');
mustInclude('AuditFieldBlock title="变更前"', 'role audit detail should show before JSON fields');
mustInclude('AuditFieldBlock title="变更后"', 'role audit detail should show after JSON fields');
mustInclude("permissionIds: '菜单权限'", 'role permission audit should display permission changes with a business field name');
mustInclude('hiddenRoleAuditFields', 'role audit formatter should explicitly hide backend-only fields from the drawer');
mustInclude("new Set(['code'])", 'role audit drawer should hide role code / 岗位编码');
mustInclude('!hiddenRoleAuditFields.has(field)', 'role audit rows should filter hidden fields before rendering');
mustInclude('permissionNameById', 'role permission audit should build a permission id to readable name lookup');
mustInclude('formatPermissionAuditValue', 'role permission audit should translate permission ids into readable names');
mustInclude('未知权限(', 'role permission audit should keep unknown permission ids readable instead of raw ids');
mustInclude('getRoleAuditRecords(selectedRole, auditEventsData ?? [], permissionNameById)', 'role audit formatter should receive the permission name lookup');
mustInclude('暂无审计记录', 'role drawer should use the standard empty audit wording');

mustInclude('permissionDialogOpen', 'menu permission setting should use an independent dialog');
mustInclude('openPermissionDialog(row)', 'operation column should open menu permission setting');
mustInclude('selectedPermissionModuleCode', 'permission dialog should support module-level selection');
mustInclude('selectedPermissionMenuCode', 'permission dialog should support menu-level selection');
mustInclude('ROLE_DATA_SCOPE_OPTIONS', 'permission dialog should expose data permission options');
mustInclude('模块权限', 'permission dialog should show module permissions');
mustInclude('菜单权限', 'permission dialog should show menu permissions');
mustInclude('功能权限', 'permission dialog should show function permissions');
mustInclude('数据权限', 'permission dialog should show data permissions');
mustInclude('selectedPermissionIds', 'menu permission dialog should track checked permissions');
mustInclude('getPermissions', 'menu permission dialog should load assignable permissions');
mustInclude('ROLE_PERMISSION_FETCH_SIZE', 'permission dialog should fetch enough permissions for generated GCT page and action permissions');
mustInclude('useManagedSidebarModules', 'permission dialog should render modules and menus from the same source as the sidebar');
mustInclude('inferPermissionCode', 'permission dialog should map sidebar routes to backend permission codes');
menuManagementMustInclude("path.replace(/^\\//, '').replace(/\\//g, '.')", 'GCT menu routes should map to backend permission codes instead of staying unselectable');
menuManagementMustNotInclude("path.startsWith('/gct-edhr')) return undefined", 'GCT menu routes should not stay unselectable');
mustInclude('permissionModules', 'permission dialog should derive display modules from sidebar modules');
mustInclude('getRolePermissions', 'menu permission dialog should load role permission ids');
mustInclude('updateRolePermissions', 'menu permission dialog should save permission ids');
mustInclude('getCurrentUser', 'menu permission save should refresh the current login user after role permission changes');
mustInclude('skipAuthRedirect: true', 'current user permission refresh should not clear the token or redirect to login when refresh fails');
mustInclude('refreshCurrentLoginUserPermissions', 'role page should centralize current user permission refresh');
mustInclude('catch (error)', 'permission refresh failure should keep the save result instead of throwing the user back to login');
mustInclude("localStorage.setItem('user', JSON.stringify(refreshedUser));", 'current login user permissions should be persisted after permission save');
mustInclude("window.dispatchEvent(new CustomEvent('edhr:auth-user-change'));", 'role permission save should notify the app shell to recompute visible menus');
mustInclude('savePermissionMutation', 'menu permission dialog should use a dedicated save mutation');
mustInclude('菜单权限设置', 'operation column and dialog should use clear menu permission wording');
mustInclude('保存权限', 'permission dialog should have an explicit save action');
mustInclude('togglePermissionIds', 'checking a parent menu should include mapped menu and function permission ids');
mustInclude('permissionIds', 'permission dialog should track module and menu permission id groups');
mustInclude("menuPermission.kind === 'group' ? '分组'", 'permission menu rows should distinguish sidebar groups from mapped menus');
mustInclude('indeterminate={indeterminate}', 'permission tree should show partial checked state');

mustInclude('Tooltip title="编辑" arrow', 'role operation edit button should use icon plus tooltip');
mustInclude('Tooltip title="菜单权限设置" arrow', 'role operation permissions button should use icon plus tooltip');
mustInclude('FactCheck', 'role operation permissions button should use a scenario-appropriate permission checklist icon');
mustNotInclude('<Security fontSize="small" />', 'role operation permissions button should not use the old generic shield icon');
mustInclude("Tooltip title={isBuiltinRole(row) ? '系统管理员角色不允许删除' : '删除'} arrow", 'role operation delete button should use icon plus tooltip and protected-role hint');
mustInclude('aria-label="编辑"', 'edit operation should be accessible');
mustInclude('aria-label="菜单权限设置"', 'permission operation should be accessible');
mustInclude('aria-label="删除"', 'delete operation should be accessible');
mustNotInclude('<Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>新增岗位</Button>', 'role page should not keep the old oversized page-title action');
mustNotInclude('maxHeight: 420', 'permission tree should not keep the old embedded permission panel inside the role form');
mustNotInclude('可见菜单与操作', 'role form should not mix menu permissions into basic role CRUD');
uiStandardMustInclude('只要行数据因为用户操作发生改变，就必须写入数据审计', 'standard should require audit records for every user-driven row data change');
uiStandardMustInclude('审计展示不得直接暴露原始 ID', 'standard should require audit values to be translated into readable business names');
uiStandardMustInclude('危险级联删除必须在二次确认中列出受影响对象和确认后的数据变化', 'standard should require dangerous cascading deletes to show impacted records and consequences');

if (failures.length > 0) {
  console.error('Role management layout verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Role management layout verification passed.');
