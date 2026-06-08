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
mustInclude('所属部门', 'personnel table department column');
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
mustInclude('!userForm.primaryDepartmentId', 'personnel save should require an organization');
mustInclude('userForm.roleIds.length === 0', 'personnel save should require at least one role');
mustInclude('userFieldSx', 'user dialog controls should share the same visual height');
mustInclude('userSelectSx', 'user dialog select controls should share the same visual height as text fields');
mustInclude('height: 40', 'user dialog controls should follow the compact GCT user-management height');
mustInclude('<DialogContent dividers>', 'user dialog should follow the GCT divided content pattern');
mustInclude('size="small" sx={userSelectSx}', 'user dialog select controls should use the compact GCT size');
mustInclude('<Table stickyHeader size="small">', 'personnel table should use the compact GCT data-table density');
mustInclude('size="small"', 'personnel add action and user dialog should use compact GCT sizing');
mustInclude('startIcon={<Add />}', 'personnel add action should keep the add icon affordance');

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
mustNotInclude("${item.node.code} - ${item.node.name}", 'organization options should hide organization codes');
mustNotInclude('variant="text" startIcon={<Add />} onClick={() => openCreateDialog(null)}', 'organization header should not show top-level create action');
mustNotInclude('disabled={!hasChildren}', 'leaf tree nodes should not render disabled expand icons');
mustNotInclude('<Button variant="contained" startIcon={<Add />}>添加</Button>', 'personnel add button must not be a static placeholder');
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
