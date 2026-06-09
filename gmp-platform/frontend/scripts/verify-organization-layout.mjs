import { readFileSync } from 'node:fs';

const content = readFileSync(new URL('../src/pages/system/OrganizationPage.tsx', import.meta.url), 'utf8');
const constantsContent = readFileSync(new URL('../src/utils/constants.ts', import.meta.url), 'utf8');
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

mustInclude('gridTemplateColumns', 'left organization tree and right personnel workspace');
mustInclude('新增公司主体', 'explicit root organization creation affordance');
mustInclude('新增部门', 'explicit company-to-department creation affordance');
mustInclude('新增班组', 'explicit department-to-team creation affordance');
mustInclude('{childLabel ? (', 'tree child creation action should render as a compact icon affordance');
mustInclude("color: isSelected ? '#1890ff' : '#909399'", 'selected tree create affordance should be icon-only with color state');
mustInclude('id: string;', 'department snowflake ids stay as strings in the organization tree');
mustInclude('parentId?: string | null;', 'department parent ids stay as strings in the organization tree');
mustInclude('useState<Set<string>>', 'expanded tree state preserves string ids');
mustInclude('useState<string | null>(null)', 'selected and parent ids preserve string ids');
mustInclude('姓名', 'personnel query/table name field');
mustInclude('账号', 'personnel query/table account field');
mustInclude('手机号', 'personnel query/table phone field');
mustInclude('创建时间', 'personnel query/table created-at field');
mustInclude('所属架构', 'personnel table organization column');
mustAppearInOrder([
  "{ id: 'displayName', label: '姓名'",
  "{ id: 'username', label: '账号'",
  "{ id: 'phone', label: '手机号'",
  "{ id: 'departmentName', label: '所属架构'",
  "{ id: 'status', label: '状态'",
  "{ id: 'createdBy', label: '创建人'",
  "{ id: 'createdAt', label: '创建时间'",
], 'personnel table field columns should follow the customer-facing order');
mustInclude('共 {filteredRows.length} 条数据', 'personnel table total summary');
mustInclude('createUser', 'organization personnel panel should create users');
mustInclude('updateUser', 'organization personnel panel should edit users');
mustInclude('getRoles', 'organization personnel panel should load role options');
mustInclude('openCreateUserDialog', 'personnel add button should open a user dialog');
mustInclude('openEditUserDialog(row)', 'personnel edit action should open the user dialog');
mustInclude('selectedUser', 'personnel row click should track the user selected for detail display');
mustInclude('userDrawerOpen', 'personnel row click should open a right-side detail drawer');
mustInclude('openUserDetailDrawer(row)', 'personnel row click should invoke the detail drawer handler');
mustInclude('<Drawer anchor="right"', 'personnel details should render in a right-side drawer');
mustInclude('updatedBy?: string;', 'personnel detail data should expose an updated-by field');
mustInclude('updatedAt?: string;', 'personnel detail data should expose an updated-at field');
mustInclude('appContentDrawerSx', 'personnel details drawer should cover the full viewport height');
mustInclude('zIndex: 1300', 'personnel details drawer should render above the fixed app header');
mustInclude('appContentDrawerPaperSx', 'personnel details drawer paper should override MUI full-height defaults');
mustInclude('top: 0', 'personnel details drawer should start at the top of the viewport');
mustInclude('bottom: 0', 'personnel details drawer should stretch to the bottom of the page');
mustInclude("height: 'auto'", 'personnel details drawer paper should be sized by top and bottom constraints');
mustInclude('sx={appContentDrawerSx}', 'personnel details drawer modal root should cover the full viewport height');
mustInclude('slotProps={{ backdrop: { sx: appContentDrawerSx } }}', 'personnel details drawer backdrop should cover the full viewport height');
mustInclude('PaperProps={{ sx: appContentDrawerPaperSx }}', 'personnel details drawer paper should use the paper-specific sizing override');
mustInclude('DetailField label="更新人"', 'personnel detail system info should show updated-by metadata');
mustInclude('DetailField label="更新时间"', 'personnel detail system info should show updated-at metadata');
mustInclude('DetailSection title="审计记录"', 'personnel detail drawer should fill the lower area with audit records');
mustInclude('操作人', 'personnel detail audit records should identify who operated');
mustInclude('操作动作', 'personnel detail audit records should identify the operation action');
mustInclude('操作时间', 'personnel detail audit records should identify when the operation happened');
mustInclude('变更前内容', 'personnel detail audit records should show before content');
mustInclude('变更后内容', 'personnel detail audit records should show after content');
mustInclude('getUserAuditRecords(selectedUser', 'personnel detail drawer should derive audit records from the selected user');
mustInclude('getAuditLogs', 'personnel detail drawer should load available backend audit logs');
mustInclude("onClick={(event) => event.stopPropagation()}", 'personnel row action area should not open the detail drawer');
mustInclude('saveUserMutation', 'personnel dialog should persist user changes');
mustInclude("queryClient.invalidateQueries({ queryKey: ['departments-tree'] });", 'saving users should refresh organization tree personnel');
mustInclude('openDeleteConfirmFromEditDialog', 'organization edit dialog should expose a delete action');
mustInclude('setDeleteConfirm(editingId)', 'organization edit delete action should reuse the delete confirmation dialog');
mustInclude('getDeleteBlockReason', 'organization edit delete action should detect child organizations or users');
mustInclude('countUsers(node)', 'organization edit delete action should account for users under the organization tree');
mustInclude('disabled={Boolean(deleteBlockReason)}', 'organization edit delete button should be disabled when deletion is blocked');
mustInclude("mutationFn: (body: { name: string; parentId?: string | null })", 'organization dialog should only submit name and parent id');
mustInclude("saveMutation.mutate({ name: form.name, parentId })", 'organization dialog save should not submit a manually typed code');
mustInclude('编辑组织节点', 'organization node edit dialog should be explicit');
mustInclude('新增用户', 'personnel dialog should support user creation');
mustInclude('编辑用户', 'personnel dialog should support user editing');
mustInclude('label="账号"', 'personnel dialog should use account wording instead of username wording');
mustInclude('label="账号"\n              required', 'personnel account field should be required');
mustInclude('label="姓名"\n              value={userForm.displayName}\n              onChange', 'personnel name field should be present before required validation');
mustInclude('label="姓名"\n              value={userForm.displayName}\n              onChange={(event) => setUserForm({ ...userForm, displayName: event.target.value })}\n              fullWidth\n              required', 'personnel name field should be required');
mustInclude('<FormControl fullWidth required size="small" sx={userSelectSx}>', 'personnel organization and role controls should be required');
mustInclude('岗位角色', 'personnel dialog should support role assignment');
mustInclude("value={userForm.roleIds[0] ?? ''}", 'personnel role selector should behave as a single-select control');
mustInclude("roleIds: event.target.value ? [String(event.target.value)] : []", 'personnel role selector should persist one selected role id in the existing roleIds array contract');
mustInclude('!userForm.primaryDepartmentId', 'personnel save should require an organization');
mustInclude('userForm.roleIds.length === 0', 'personnel save should require at least one role');
mustInclude('userFieldSx', 'user dialog controls should share the same visual height');
mustInclude('userSelectSx', 'user dialog select controls should share the same visual height as text fields');
mustInclude('height: 40', 'user dialog controls should follow the compact GCT user-management height');
mustInclude('<DialogContent dividers>', 'user dialog should follow the GCT divided content pattern');
mustInclude('size="small" sx={userSelectSx}', 'user dialog select controls should use the compact GCT size');
mustInclude('<Table stickyHeader size="small" sx={{ tableLayout: \'fixed\', width: totalTableWidth, minWidth: totalTableWidth }}>', 'personnel table should use compact density with computed full-width columns');
mustInclude('size="small"', 'personnel add action and user dialog should use compact GCT sizing');
mustInclude('startIcon={<Add />}', 'personnel add action should keep the add icon affordance');
mustInclude('openDatePickerWithoutSelection', 'date fields should open the picker without selecting date text');
mustInclude('updateCreatedFrom', 'start date changes should normalize the created-at range');
mustInclude('updateCreatedTo', 'end date changes should not allow dates before the start date');
mustInclude('onInput={(event) => updateCreatedFrom((event.target as HTMLInputElement).value)}', 'start date should react to keyboard input as well as picker change');
mustInclude('onInput={(event) => updateCreatedTo((event.target as HTMLInputElement).value)}', 'end date should react to keyboard input as well as picker change');
mustInclude('onMouseDown={openDatePickerWithoutSelection}', 'date fields should prevent default mouse selection before opening the picker');
mustInclude('catch {', 'date picker should not emit console errors when showPicker is rejected outside a trusted user gesture');
mustInclude("userSelect: 'none'", 'date fields and resize interactions should suppress accidental text selection');
mustInclude('inputProps={{ max: filters.createdTo || undefined }}', 'start date should not exceed end date when end date is set');
mustInclude('inputProps={{ min: filters.createdFrom || undefined }}', 'end date should not be earlier than start date');
mustInclude('organizationWorkspaceHeight', 'organization workspace should share one fill-height constraint');
mustInclude("alignItems: 'stretch'", 'organization grid should stretch the left tree and right list containers to page height');
mustInclude("height: organizationWorkspaceHeight", 'organization grid should fill the available app page height');
mustInclude("height: '100%'", 'organization tree and personnel list cards should fill the stretched grid row');
mustInclude("flex: 1", 'personnel table container should consume remaining right-panel height');
mustInclude('useRef<HTMLDivElement | null>(null)', 'personnel table should measure its rendered container for full-width initial columns');
mustInclude('tableContainerRef', 'personnel table container should expose a ref for width measurement');
mustInclude('tableContainerWidth', 'personnel table should track container width for automatic initial column widths');
mustInclude('ResizeObserver', 'personnel table should recompute automatic column widths when the container changes size');
mustInclude('tableHeaderCellSx', 'personnel table header should use compact fixed-height cells');
mustInclude('tableBodyCellSx', 'personnel table body should use compact fixed-height cells');
mustInclude('personnelColumns', 'personnel table columns should be driven by a resizable column model');
mustInclude("{ id: 'select', label: '', defaultWidth: 50, minWidth: 50, resizable: false, align: 'center' }", 'personnel selection column should be fixed at 50px and not draggable');
mustInclude("{ id: 'actions', label: '操作', defaultWidth: 150, minWidth: 150, resizable: false }", 'personnel action column should be fixed at 150px and not draggable');
mustInclude('const PERSONNEL_FIELD_COLUMN_MIN_WIDTH = 60;', 'personnel business field columns should share the 60px minimum width standard');
for (const fieldColumnId of ['displayName', 'username', 'phone', 'departmentName', 'status', 'createdBy', 'createdAt']) {
  const fieldMinWidthPattern = new RegExp(`\\{ id: '${fieldColumnId}'[^}]*minWidth: PERSONNEL_FIELD_COLUMN_MIN_WIDTH`);
  if (!fieldMinWidthPattern.test(content)) {
    failures.push(`missing 60px min-width standard for personnel field column ${JSON.stringify(fieldColumnId)}`);
  }
}
mustInclude('columnWidths', 'personnel table should track user-adjusted column widths');
mustInclude('resolvedColumnWidths', 'personnel table should derive rendered widths from container width and saved column widths');
mustInclude('resolvePersonnelColumnWidths(columnWidths, tableContainerWidth)', 'personnel table should automatically distribute spare width to field columns on first render');
mustInclude('columnWidthStorageKey', 'personnel column widths should persist per current user');
mustInclude('organization-personnel-column-widths:', 'personnel column width storage should be namespaced by page and user');
mustInclude('loadPersonnelColumnWidths', 'personnel column widths should restore from localStorage');
mustInclude('localStorage.setItem(columnWidthStorageKey', 'personnel column widths should persist to localStorage');
mustInclude('beginColumnResize', 'personnel table should expose drag-to-resize behavior');
mustInclude('data-column-resizer', 'personnel table headers should render a dedicated resize hit area');
mustInclude("'&::after'", 'personnel table resize hit area should render a default visible divider');
mustInclude("bgcolor: '#dcdfe6'", 'personnel table resize divider should be visible by default');
mustInclude('height: 18', 'personnel table resize divider should be a subtle short vertical line');
mustInclude("'&:hover::after'", 'personnel table resize divider should highlight on hover');
mustInclude('zIndex: 3', 'personnel table resize divider should paint above sticky header backgrounds');
mustNotInclude('right: -4', 'personnel table resize divider should stay inside the current sticky header cell so every field separator remains visible');
mustNotInclude("borderRight: column.id === 'actions' ? 'none' : '1px solid #e4e7ed'", 'personnel field separators should not render both cell borders and resize dividers');
mustInclude("tableLayout: 'fixed'", 'personnel table should honor persisted column widths');
mustInclude('width: totalTableWidth', 'personnel table should use the actual column sum as its rendered width so fixed columns stay fixed');
mustInclude('<colgroup>', 'personnel table should apply column widths through a colgroup');
mustInclude("minHeight: 48", 'personnel table toolbar should be compact');
mustInclude("borderTop: 'none'", 'personnel pagination footer should not double the table bottom divider');
mustInclude('新增', 'personnel add button should use create wording');
mustInclude('Tooltip', 'personnel row actions should use icon buttons with tooltips');
mustInclude('LockReset', 'personnel reset-password action should use a reset icon');
mustInclude('PersonRemove', 'personnel remove action should use a remove icon');
mustInclude('removeUserFromOrganization', 'organization personnel remove action should preserve the user and only clear organization membership');
mustInclude('removeUserMutation', 'organization personnel row action should remove the user from the organization instead of deleting the account');
mustInclude('setRemoveUserConfirm', 'organization personnel row action should open a remove confirmation dialog');
mustInclude('aria-label="编辑"', 'personnel edit action should expose an accessible icon label');
mustInclude('aria-label="重置密码"', 'personnel reset-password action should expose an accessible icon label');
mustInclude('aria-label="移出"', 'personnel remove action should expose an accessible icon label');
mustInclude('<Tooltip title="移出" arrow>', 'personnel remove action tooltip should use remove wording');
mustInclude('确认移出人员', 'personnel remove confirmation title should use remove wording');
mustInclude('用户已移出组织', 'personnel remove success message should use remove wording');
mustInclude('component="div"', 'detail fields should render as div containers so badges do not nest inside paragraph tags');

if (content.includes('快速新增')) {
  failures.push('ambiguous "快速新增" copy should be replaced by explicit company/department/team creation actions');
}

mustNotInclude('当前选中组织', 'selected organization summary panel should not render above the tree');
mustNotInclude('仅查看本部门', 'personnel list header should not render the direct-department-only toggle');
mustNotInclude("selected?.node.name ?? '人员列表'", 'personnel list header should not show the selected organization title');
mustNotInclude("selected ? `${getLevelLabel(selected.depth)} · ${selected.node.code}` : '请选择组织节点'", 'personnel list header should not show selected organization code metadata');
mustNotInclude('selectedChildLabel', 'large selected-node create button should not be kept');
mustNotInclude('班组为末级', 'disabled terminal-level button should not be kept above the tree');
mustNotInclude("childLabel.replace('新增', '')", 'selected tree create affordance should not render label text');
mustNotInclude('minWidth: 62', 'selected tree create affordance should not keep button sizing');
mustNotInclude('& .MuiButton-startIcon', 'selected tree create affordance should not use button start-icon styling');
mustNotInclude('<TextField label="编码"', 'organization dialog should not require users to type a code');
mustNotInclude('label="用户名"', 'personnel dialog should not use username wording');
mustNotInclude('multiple\n                label="岗位角色"', 'personnel role selector should not allow selecting multiple roles');
mustNotInclude('input={<OutlinedInput size="small" label="岗位角色" />}', 'single role selector should not use the multi-select outlined input renderer');
mustNotInclude('(selected as string[]).map((roleId)', 'single role selector should not render selected roles as multiple chips');
mustNotInclude("${item.node.code} - ${item.node.name}", 'organization options should hide organization codes');
mustNotInclude('variant="text" startIcon={<Add />} onClick={() => openCreateDialog(null)}', 'organization header should not show top-level create action');
mustNotInclude('disabled={!hasChildren}', 'leaf tree nodes should not render disabled expand icons');
mustNotInclude('<Button variant="contained" startIcon={<Add />}>添加</Button>', 'personnel add button must not be a static placeholder');
mustNotInclude('minHeight: 520', 'left organization panel should not keep a large fixed minimum height');
mustNotInclude('minHeight: 58', 'personnel table toolbar should not be oversized');
mustNotInclude("alignItems: 'start'", 'organization grid should no longer leave left and right cards at natural height');
mustNotInclude('alignSelf: \'start\'', 'left organization card should stretch with the page-height workspace');
mustNotInclude('openDatePickerFromField', 'date picker opener should prevent selection on mouse down instead of click-only focus');
mustNotInclude('onClick={openDatePickerFromField}', 'date fields should not use click-only picker opening that selects text');
mustNotInclude('maxHeight: 560', 'personnel table should fill remaining card height rather than keep a fixed max height');
mustNotInclude('<Button size="small" variant="text" onClick={() => openEditUserDialog(row)}>', 'personnel action column should not use text buttons');
mustNotInclude("{ id: 'actions', label: '操作', defaultWidth: 132, minWidth: 120, resizable: true }", 'personnel action column should no longer be a draggable 132px column');
mustNotInclude("{ id: 'actions', label: '操作', defaultWidth: 100, minWidth: 100, resizable: false }", 'personnel action column should no longer use the old 100px fixed width');
mustNotInclude("{ id: 'select', label: '', defaultWidth: 48, minWidth: 48, resizable: true, align: 'center' }", 'personnel selection column should no longer be a draggable 48px column');
mustNotInclude("sx={{ tableLayout: 'fixed', minWidth: totalTableWidth }}", 'personnel table should not rely on min-width only because browser table layout stretches fixed columns');
mustNotInclude('setDeleteUserConfirm', 'organization personnel should no longer expose a delete-user confirmation state');
mustNotInclude('deleteUserMutation', 'organization personnel should no longer call the delete-user mutation');
mustNotInclude('用户删除成功', 'organization personnel remove action should not describe account deletion');
mustNotInclude('确认删除用户', 'organization personnel confirmation should not describe account deletion');
mustNotInclude('borderTop: \'1px solid #ebeef5\'', 'personnel footer should not create a double divider under the table');
mustNotInclude("top: '110px'", 'drawer should not reserve fixed header space when full-page coverage is required');
mustNotInclude("height: 'calc(100% - 110px)'", 'drawer should stretch with top and bottom constraints instead of a calculated height');
mustNotInclude('<Chip size="small" label={selectedUser.displayName}', 'personnel detail drawer should remove the top user summary chip');
mustNotInclude('<Chip size="small" label={selectedUser.username}', 'personnel detail drawer should remove the top account summary chip');
mustNotInclude('<Button size="small" variant="contained" onClick={() => openEditUserDialog(selectedUser)}>', 'personnel detail drawer should remove the top edit action group');
mustNotInclude('setResetDialog({ id: selectedUser.id, username: selectedUser.username });', 'personnel detail drawer should remove the top reset-password action group');
mustNotInclude('setRemoveUserConfirm({ id: selectedUser.id, username: selectedUser.username })', 'personnel detail drawer should remove the top remove action group');
mustNotInclude('<MoreHoriz', 'personnel toolbar should not show placeholder actions');

constantsMustInclude("ACTIVE: { label: '正常', color: 'success' as const }", 'active users should render as green normal status');
constantsMustInclude("DISABLED: { label: '禁用', color: 'error' as const }", 'disabled users should render as red disabled status');
constantsMustNotInclude('LOCKED', 'locked status should be removed from user status options');
constantsMustNotInclude('已锁定', 'locked status copy should not appear');

if (failures.length > 0) {
  console.error('Organization layout verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Organization layout verification passed.');
