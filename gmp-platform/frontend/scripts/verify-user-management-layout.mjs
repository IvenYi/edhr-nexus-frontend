import { readFileSync } from 'node:fs';

const content = readFileSync(new URL('../src/pages/system/UserPage.tsx', import.meta.url), 'utf8');
const constantsContent = readFileSync(new URL('../src/utils/constants.ts', import.meta.url), 'utf8');
const appLayoutContent = readFileSync(new URL('../src/components/shared/AppLayout.tsx', import.meta.url), 'utf8');
const uiStandardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const legacyAuditEmptyText = ['暂无真实', '审计记录'].join('');
const failures = [];

function mustInclude(token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function constantsMustInclude(token, reason) {
  if (!constantsContent.includes(token)) failures.push(`missing constants ${JSON.stringify(token)} (${reason})`);
}

function constantsMustNotInclude(token, reason) {
  if (constantsContent.includes(token)) failures.push(`unexpected constants ${JSON.stringify(token)} (${reason})`);
}

function appLayoutMustInclude(token, reason) {
  if (!appLayoutContent.includes(token)) failures.push(`missing AppLayout ${JSON.stringify(token)} (${reason})`);
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

mustInclude('USER_COLUMN_WIDTH_STORAGE_PREFIX', 'user table column widths should have a user-management namespace');
mustInclude('user-management-column-widths:', 'user table column width storage should not collide with organization personnel widths');
mustInclude('USER_FIELD_COLUMN_MIN_WIDTH', 'user table field columns should share a compact minimum width');
mustInclude('userColumns', 'user table columns should be model-driven');
mustAppearInOrder([
  "{ id: 'displayName', label: '姓名'",
  "{ id: 'username', label: '账号'",
  "{ id: 'phone', label: '手机号'",
  "{ id: 'departmentName', label: '所属组织'",
  "{ id: 'roleName', label: '岗位角色'",
  "{ id: 'status', label: '状态'",
  "{ id: 'createdBy', label: '创建人'",
  "{ id: 'createdAt', label: '创建时间'",
  "{ id: 'updatedBy', label: '更新人'",
  "{ id: 'updatedAt', label: '更新时间'",
], 'user table field columns should follow the organization personnel standard order');
mustInclude('<Table stickyHeader size="small" sx={{ tableLayout: \'fixed\', width: totalTableWidth, minWidth: totalTableWidth }}>', 'user table should use fixed compact sticky-header layout');
mustInclude('top: 0', 'user table header cells should stay visible while table rows scroll');
mustNotInclude("position: column.id === 'actions' ? 'sticky' : 'relative'", 'user table header cells should not override stickyHeader with relative positioning');
mustInclude('<colgroup>', 'user table should apply column widths through colgroup');
mustInclude("<TableRow sx={{ '& .MuiTableCell-root': tableHeaderCellSx }}>", 'user table header should use the same 48px row-level header style as organization personnel table');
mustInclude("padding={column.id === 'select' ? 'checkbox' : 'normal'}", 'user table header should use compact checkbox padding for the selection column');
mustInclude('minWidth: column.minWidth', 'user table header should not force each header cell wider than its compact minimum');
mustInclude('tableContainerRef', 'user table should measure its container width');
mustInclude('ResizeObserver', 'user table should recompute automatic widths when the container changes');
mustInclude('resolvedColumnWidths', 'user table should derive widths from saved widths and container size');
mustInclude('localStorage.setItem(columnWidthStorageKey', 'user table should persist column widths');
mustInclude('beginColumnResize', 'user table should expose drag-to-resize behavior');
mustInclude('onPointerDown={(event) => beginColumnResize(event, column)}', 'user table resize handle should support pointer drag events');
mustInclude('data-user-column-resizer', 'user table headers should render a dedicated resize handle');
mustInclude('getStickyActionColumnSx', 'user table action column should be sticky on the right');
mustInclude('USER_ACTION_COLUMN_WIDTH', 'user table action column should have a reusable fixed width');
mustInclude('data-user-action-column-shadow', 'user table fixed action shadow should be an overlay outside the scrolling table body');
mustInclude('tableScrollbarWidth', 'user table fixed action shadow should account for the vertical scrollbar gutter');
mustInclude('width: USER_ACTION_COLUMN_WIDTH', 'user table fixed action shadow should cover the full action column height and width');
mustInclude('right: tableScrollbarWidth', 'user table fixed action shadow should align with the sticky action column');
mustInclude("boxShadow: '-6px 0 8px -8px rgba(0, 0, 0, 0.35)'", 'user table fixed action column divider should be one full-height shadow');
mustInclude("pointerEvents: 'none'", 'user table fixed action column divider should not intercept row or action clicks');
mustNotInclude("right: `${USER_ACTION_COLUMN_WIDTH - 1}px`", 'user table fixed action column shadow should not be a 1px row-like divider');
mustNotInclude("boxShadow: '-1px 0 0 #dcdfe6'", 'user table fixed action column divider should not be drawn once per row');
mustInclude('selectedUserIds', 'user table should track selected rows');
mustInclude('toggleUserSelection', 'user table should support controlled row selection');
mustInclude('togglePageUserSelection', 'user table should support selecting the current page');
mustInclude('batchDeleteConfirm', 'user table should track batch delete confirmation state');
mustInclude('selectedBatchDeleteUsers', 'user table should derive selected rows for batch delete confirmation');
mustInclude('batchDeleteMutation', 'user table should execute batch deletion through a dedicated mutation');
mustInclude('Promise.all(userIds.map((id) => deleteUser(id)))', 'batch deletion should delete every selected user id');
mustInclude('disabled={selectedUserIds.size === 0}', 'batch delete button should be disabled when no rows are selected');
mustInclude('onClick={() => setBatchDeleteConfirm(true)}', 'batch delete button should open a second confirmation dialog');
mustInclude('确认批量删除账号', 'batch delete should use a clear confirmation dialog title');
mustInclude('危险的操作，请仔细阅读并确认数据后操作', 'batch delete confirmation should warn users to carefully review the dangerous operation');
mustAppearInOrder([
  '批量删除',
  '新增',
], 'batch delete button should sit before the add button in the table toolbar');
mustInclude('onChange={(event) => toggleUserSelection(row.id, event.target.checked)}', 'row selection checkbox should use controlled change handling');
mustInclude('openUserDetailDrawer(row)', 'clicking a user row should open the detail drawer');
mustInclude("onClick={(event) => event.stopPropagation()}", 'row action controls should not open the detail drawer');
mustInclude('fetchAllUsers', 'user table should fetch all backend pages instead of truncating at a fixed batch size');
mustNotInclude('size: 500', 'user table should not silently truncate users to the first 500 records');
mustInclude('<Button variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>', 'user filter reset button should match organization page reset style');
mustNotInclude('<Button size="small" startIcon={<RestartAlt />} onClick={resetFilters}>', 'user filter reset button should not keep the mismatched small text style');
mustInclude('<Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">', 'user filter action buttons should always align right');
mustNotInclude('<Typography sx={{ fontWeight: 600, color: \'#303133\' }}>用户管理</Typography>', 'user table header should not repeat the page title above the table');
mustInclude('justifyContent="flex-end"', 'user table toolbar should align the add button to the right after removing the title');
mustInclude('USER_PAGE_SIZE_OPTIONS = [20, 50, 100, 200]', 'user table should expose standard page-size options');
mustInclude('const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE)', 'user table should let users change page size');
mustInclude('Math.ceil(filteredRows.length / rowsPerPage)', 'user table page count should use selected page size');
mustInclude('value={rowsPerPage}', 'user table footer should bind page-size selector to state');
mustInclude('setRowsPerPage(Number(event.target.value))', 'user table footer should update selected page size');
mustInclude('startAdornment: <InputAdornment position="start" sx={{ mr: 0 }}>每页</InputAdornment>', 'user table footer should match organization page page-size adornment');
mustInclude('{USER_PAGE_SIZE_OPTIONS.map((size) => (', 'user table footer should render all standard page-size menu items');
mustInclude('padding="checkbox"', 'user row selection cell should use checkbox padding to align with the header checkbox');
mustInclude('userDisplayNameByIdentity', 'user table should resolve creator/updater ids to user display names');
mustInclude('updatedBy: item.updatedBy || item.createdBy', 'newly-created users should display updater as creator until a real update exists');
mustInclude('updatedAt: item.updatedAt || item.createdAt', 'newly-created users should display updated time as created time until a real update exists');
mustInclude('getUserOperatorName(row.createdBy, userDisplayNameByIdentity)', 'created-by column should show a user name instead of raw id when possible');
mustInclude('getUserOperatorName(row.updatedBy, userDisplayNameByIdentity)', 'updated-by column should show a user name instead of raw id when possible');
mustInclude("column.id === 'updatedBy'", 'user table should render an updated-by column');
mustInclude("column.id === 'updatedAt'", 'user table should render an updated-at column');
appLayoutMustInclude('width: `calc(100vw - ${effectiveSidebarWidth}px)`', 'main content width should subtract the sidebar instead of adding sidebar margin to a full viewport width');
appLayoutMustInclude('maxWidth: `calc(100vw - ${effectiveSidebarWidth}px)`', 'main content should not create document-level horizontal scroll');
appLayoutMustInclude("overflowX: 'hidden'", 'page-level horizontal scroll should be suppressed so tables scroll internally');
uiStandardMustInclude('查询、重置按钮必须始终居右显示', 'UI standard should require right-aligned filter actions');
uiStandardMustInclude('表头必须在表格容器内保持 sticky', 'UI standard should require sticky table headers');
uiStandardMustInclude('操作列固定在右侧，左侧分隔必须使用从表头到表体贯通的阴影效果', 'UI standard should require full-height sticky action shadow');
uiStandardMustInclude('阴影由表格容器或独立覆盖层统一绘制，覆盖操作列宽度，不得在每行操作单元格上重复绘制', 'UI standard should require a single full-height action-column shadow layer');
uiStandardMustInclude('首次创建时如果没有独立更新人或更新时间，更新人和更新时间显示创建人和创建时间', 'UI standard should require initial updated metadata to match created metadata');
uiStandardMustInclude('分页器固定使用“总数 + 分页 + 每页条数选择”布局', 'UI standard should require the standard footer pagination layout');
uiStandardMustInclude('每页条数选项统一为 20、50、100、200', 'UI standard should require standard page-size choices');

mustInclude('filters', 'user management should expose query filters');
mustInclude('姓名', 'user query/table should include display name');
mustInclude('账号', 'user query/table should use account wording');
mustInclude('手机号', 'user query/table should include phone');
mustInclude('创建时间', 'user query/table should include created-at range');
mustInclude('updateCreatedFrom', 'start date changes should normalize the created-at range');
mustInclude('updateCreatedTo', 'end date changes should normalize the created-at range');
mustInclude('openDatePickerWithoutSelection', 'date fields should open picker without selecting text');
mustInclude("userSelect: 'none'", 'date fields and resize interactions should suppress accidental selection');
mustInclude('inputProps={{ max: filters.createdTo || undefined }}', 'start date should not exceed end date');
mustInclude('inputProps={{ min: filters.createdFrom || undefined }}', 'end date should not be earlier than start date');

mustInclude('selectedUser', 'user detail drawer should track the selected user');
mustInclude('userDrawerOpen', 'user detail drawer should have open state');
mustInclude('<Drawer anchor="right"', 'user details should render in a right-side drawer');
mustInclude('信息查看', 'user details drawer should show the standard view title');
mustInclude('userDrawerTab', 'user details drawer should track the active tab');
mustInclude('aria-label="用户详情切换"', 'user details drawer tabs should expose a clear accessible label');
mustInclude('<Tab label="数据信息" />', 'user details drawer should expose a data information tab');
mustInclude('<Tab label="数据审计" />', 'user details drawer should expose a data audit tab');
mustInclude('DetailSection title="基本信息"', 'data tab should include basic information');
mustInclude('DetailSection title="组织与角色"', 'data tab should include organization and role information');
mustInclude('DetailSection title="系统信息"', 'data tab should include system metadata');
mustInclude('DetailField label="更新人"', 'system info should show updated-by metadata');
mustInclude('DetailField label="更新时间"', 'system info should show updated-at metadata');
mustInclude('DetailSection title="审计记录"', 'audit tab should include audit records');
mustInclude('Accordion', 'audit records should use an accordion row pattern');
mustInclude('AuditFieldBlock', 'audit detail should render field blocks');
mustInclude('data-audit-accordion-row', 'each audit record should expose a testable row');
mustInclude('data-audit-field-before', 'expanded audit record should expose before fields');
mustInclude('data-audit-field-after', 'expanded audit record should expose after fields');
mustInclude('preserveAuditJsonLargeNumbers', 'audit JSON parsing should preserve Snowflake ids from older numeric snapshots');
mustInclude('getAuditScalarDisplayValue', 'audit values should translate status, organization and role ids');
mustInclude('getAuditLogs', 'user detail drawer should load backend audit logs');
mustInclude("entityType: 'USER_ACCOUNT'", 'user detail drawer should request user-account audit records');
mustInclude('getUserAuditRecords(selectedUser', 'user detail drawer should derive records for the selected user');
mustInclude('暂无审计记录', 'user detail drawer should show a concise empty audit state');
mustNotInclude(legacyAuditEmptyText, 'user detail drawer empty audit state should not expose implementation wording');
mustNotInclude('fallbackRecords', 'user detail drawer should not synthesize fake audit records');
mustNotInclude('当前快照', 'user detail drawer should not present current user data as an audit event');

mustInclude('EMAIL_PATTERN', 'user dialog should validate email format');
mustInclude('CHINA_MOBILE_PATTERN', 'user dialog should validate mobile phone format');
mustInclude('getUserFormValidationError', 'user dialog should centralize form validation');
mustInclude("return '请输入账号';", 'user dialog should require account');
mustInclude("return '请输入姓名';", 'user dialog should require display name');
mustInclude("return '请选择所属组织';", 'user dialog should require organization');
mustInclude("return '请选择岗位角色';", 'user dialog should require role');
mustInclude("return '请输入正确的邮箱地址';", 'user dialog should show a concrete email validation message');
mustInclude("return '请输入正确的手机号';", 'user dialog should show a concrete mobile validation message');
mustInclude('label="账号"', 'user dialog should use account wording');
mustInclude('label="账号"\n              required', 'user account field should be required');
mustInclude('disabled={Boolean(editingId)}', 'user account field should be disabled while editing');
mustInclude('<FormControl fullWidth required size="small" sx={userSelectSx}>', 'user organization and role controls should be required');
mustInclude('getDepartmentPathLabel', 'organization options should show full paths');
mustInclude("join('/')", 'organization option labels should use slash-separated paths');
mustInclude('renderValue={(value) => getDepartmentSelectValueLabel(String(value), departmentPathById)}', 'organization selected value should show full path');
mustInclude("value={form.roleIds[0] ?? ''}", 'role selector should behave as a single-select control');
mustInclude("roleIds: event.target.value ? [String(event.target.value)] : []", 'role selector should persist one role id in the roleIds array contract');
mustInclude('userFieldSx', 'user dialog controls should share the same visual height');
mustInclude('userSelectSx', 'user dialog select controls should share text-field height');
mustInclude('height: 40', 'user dialog controls should follow compact height');
mustInclude('<DialogContent dividers>', 'user dialog should follow divided content pattern');
mustInclude('rowGap: 1.5', 'user dialog fields should use consistent vertical gap');
mustInclude('columnGap: 1.5', 'user dialog fields should use consistent horizontal gap');

mustInclude('getApiErrorMessage', 'mutations should extract concrete backend error text');
mustInclude("getApiErrorMessage(error, '用户保存失败')", 'save failures should show backend-provided error text');
mustInclude('showSnackbar', 'operation feedback should use a shared snackbar helper');
mustInclude("anchorOrigin={{ vertical: 'top', horizontal: 'right' }}", 'operation feedback should appear in the top-right corner');
mustInclude("reason === 'clickaway'", 'operation feedback should ignore clickaway');
mustInclude('onClose={handleSnackbarClose}', 'operation feedback should use the clickaway-aware close handler');

mustInclude('Tooltip', 'row actions should use icon buttons with tooltips');
mustInclude('LockReset', 'reset-password action should use a reset icon');
mustInclude('Delete', 'delete action should use a delete icon on the global user page');
mustInclude('aria-label="编辑"', 'edit action should expose an accessible icon label');
mustInclude('aria-label="重置密码"', 'reset action should expose an accessible icon label');
mustInclude('aria-label="删除"', 'delete action should expose an accessible icon label');
mustInclude('<Tooltip title="删除" arrow>', 'delete action tooltip should use delete wording on global user page');
mustInclude('确认删除账号', 'delete confirmation title should distinguish account deletion from organization removal');

mustNotInclude('label="用户名"', 'user management should not use username wording in visible labels');
mustNotInclude('multiple\n                label="岗位角色"', 'user role selector should not allow multiple roles');
mustNotInclude('input={<OutlinedInput label="岗位角色" />}', 'single role selector should not use multi-select outlined input');
mustNotInclude('selected.map((roleId)', 'single role selector should not render selected roles as multiple chips');
mustNotInclude("${'　'.repeat(depth)}${node.code} - ${node.name}", 'organization options should hide organization codes');
mustNotInclude('<Table>', 'user table should not use a bare default table');
mustNotInclude("setSnackbar({ open: true, message: '保存成功'", 'save feedback should go through the shared snackbar helper');
mustNotInclude("setSnackbar({ open: true, message: '保存失败'", 'save errors should go through the shared snackbar helper');

constantsMustInclude("ACTIVE: { label: '正常', color: 'success' as const }", 'active users should render green normal status');
constantsMustInclude("DISABLED: { label: '禁用', color: 'error' as const }", 'disabled users should render red disabled status');
constantsMustNotInclude('LOCKED', 'locked status should be removed from user status options');

if (failures.length > 0) {
  console.error('User management layout verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('User management layout verification passed.');
