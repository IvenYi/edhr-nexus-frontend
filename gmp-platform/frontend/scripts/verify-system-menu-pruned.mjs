import { existsSync, readFileSync } from 'node:fs';

const failures = [];

const frontendRoot = new URL('../', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);

function fileUrl(root, path) {
  return new URL(path, root);
}

function read(root, path) {
  const url = fileUrl(root, path);
  if (!existsSync(url)) {
    failures.push(`${path}: missing file`);
    return '';
  }
  return readFileSync(url, 'utf8');
}

function exists(root, path) {
  return existsSync(fileUrl(root, path));
}

function matchesToken(content, token) {
  return token instanceof RegExp ? token.test(content) : content.includes(token);
}

function formatToken(token) {
  return token instanceof RegExp ? token.toString() : JSON.stringify(token);
}

function mustInclude(root, file, token, reason) {
  const content = read(root, file);
  if (!matchesToken(content, token)) {
    failures.push(`${file}: missing ${formatToken(token)} (${reason})`);
  }
}

function mustNotInclude(root, file, token, reason) {
  const content = read(root, file);
  if (matchesToken(content, token)) {
    failures.push(`${file}: should not include ${formatToken(token)} (${reason})`);
  }
}

function mustNotExist(root, path, reason) {
  if (exists(root, path)) {
    failures.push(`${path}: should not exist (${reason})`);
  }
}

mustInclude(frontendRoot, 'package.json', '"verify:system-menu-pruned": "node scripts/verify-system-menu-pruned.mjs"', 'system menu pruning verification should be runnable from npm');

for (const label of ['租户设置', '权限配置', '表单模板', '编码规则']) {
  mustNotInclude(frontendRoot, 'src/utils/constants.ts', label, 'removed system management menu labels should not render in the sidebar');
}

for (const route of ['/system/tenant', '/system/permissions', '/system/form-templates', '/system/numbering-rules']) {
  mustNotInclude(frontendRoot, 'src/utils/constants.ts', route, 'removed system management menu paths should not render in the sidebar');
}

mustInclude(frontendRoot, 'src/utils/menuManagement.ts', 'REMOVED_SYSTEM_MENU_PATHS', 'managed menu normalization should prune removed system routes from cached menus');
mustInclude(frontendRoot, 'src/utils/menuManagement.ts', "'/system/numbering-rules'", 'cached managed menus should drop the removed numbering route');
mustInclude(frontendRoot, 'src/utils/menuManagement.ts', '!REMOVED_SYSTEM_MENU_PATHS.has(child.path)', 'removed child menu routes should be filtered during normalization');
mustInclude(frontendRoot, 'src/utils/menuManagement.ts', '!REMOVED_SYSTEM_MENU_PATHS.has(path)', 'removed direct menu routes should be filtered during normalization');
mustInclude(frontendRoot, 'src/utils/menuManagement.ts', 'SECURITY_MANAGEMENT_PATHS', 'managed menu normalization should migrate security paths out of stale cached groups');
mustInclude(frontendRoot, 'src/utils/menuManagement.ts', "if (menu.label === '安全管理') continue;", 'security management group should keep its own children during migration');
mustInclude(frontendRoot, 'src/utils/menuManagement.ts', 'menu.children = menu.children.filter((child) => !SECURITY_MANAGEMENT_PATHS.has(child.path));', 'stale non-security groups should drop security children');
mustInclude(frontendRoot, 'src/utils/menuManagement.ts', 'systemModule.menus = systemModule.menus.filter((menu) => menu.path ? !SECURITY_MANAGEMENT_PATHS.has(menu.path) : true);', 'stale direct security menu paths should be removed outside security management');

for (const token of ['TenantPage', 'PermissionPage', 'FormTemplatePage', 'NumberingRulePage', 'path="tenant"', 'path="permissions"', 'path="form-templates"', 'path="numbering-rules"']) {
  mustNotInclude(frontendRoot, 'src/router/index.tsx', token, 'removed system management pages should not be routable');
}

mustNotInclude(frontendRoot, 'src/api/identity.ts', 'identity/tenants', 'tenant management API helpers should be removed with the tenant page');
mustNotInclude(frontendRoot, 'src/api/identity.ts', "client.get('/identity/permissions'", 'standalone permission configuration API should be removed');
mustInclude(frontendRoot, 'src/api/identity.ts', "client.get('/identity/roles/permissions'", 'role management still needs permission list data for assignment');
mustInclude(frontendRoot, 'src/api/identity.ts', 'client.get(`/identity/roles/${id}/permissions`)', 'role permission lookup should remain available');
mustInclude(frontendRoot, 'src/api/identity.ts', 'client.put(`/identity/roles/${id}/permissions`, body)', 'role permission updates should remain available');

for (const path of [
  'src/pages/system/TenantPage.tsx',
  'src/pages/system/PermissionPage.tsx',
  'src/pages/system/FormTemplatePage.tsx',
  'src/pages/system/NumberingRulePage.tsx',
  'src/api/form-templates.ts',
  'src/api/numbering.ts',
]) {
  mustNotExist(frontendRoot, path, 'removed system management frontend code should be deleted');
}

for (const path of [
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/controller/TenantController.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/controller/PermissionController.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/FormTemplateController.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/NumberingController.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/entity/Tenant.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/entity/NumberingRule.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/repository/TenantRepository.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/repository/NumberingRuleRepository.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/numbering/NumberingService.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplate.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/template/repository/FormTemplateRepository.java',
]) {
  mustNotExist(repoRoot, path, 'removed system management backend endpoints should be deleted');
}

mustInclude(repoRoot, 'gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml', '0010-remove-numbering-rule.sql', 'numbering rule removal should be applied as an incremental migration');
mustInclude(repoRoot, 'gmp-platform/backend/src/main/resources/db/changelog/0010-remove-numbering-rule.sql', 'DROP TABLE IF EXISTS numbering_rule', 'numbering rule table should be removed by incremental migration');
mustInclude(repoRoot, 'gmp-platform/backend/src/main/resources/db/changelog/0010-remove-numbering-rule.sql', "DELETE FROM permission WHERE code = 'system.numbering-rules'", 'numbering rule permission should be removed by incremental migration');
mustInclude(repoRoot, 'gmp-platform/backend/src/main/resources/db/changelog/0010-remove-numbering-rule.sql', 'DELETE FROM role_permission', 'numbering rule role permissions should be cleaned before deleting permission');

for (const token of ['NUM_001', 'NUM_002', 'NUM_003', 'NUM_004']) {
  mustNotInclude(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/common/exception/ErrorCode.java', token, 'numbering rule error codes should be removed with the backend feature');
}

mustInclude(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/entity/Permission.java', 'public class Permission', 'permission entity is still required by authentication and role assignment');
mustInclude(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/repository/PermissionRepository.java', 'public interface PermissionRepository', 'permission repository is still required by authentication and role assignment');

if (failures.length > 0) {
  console.error('System menu pruning verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('System menu pruning verification passed.');
