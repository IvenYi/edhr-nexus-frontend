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

for (const label of ['租户设置', '权限配置', '表单模板']) {
  mustNotInclude(frontendRoot, 'src/utils/constants.ts', label, 'removed system management menu labels should not render in the sidebar');
}

for (const route of ['/system/tenant', '/system/permissions', '/system/form-templates']) {
  mustNotInclude(frontendRoot, 'src/utils/constants.ts', route, 'removed system management menu paths should not render in the sidebar');
}

for (const token of ['TenantPage', 'PermissionPage', 'FormTemplatePage', 'path="tenant"', 'path="permissions"', 'path="form-templates"']) {
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
  'src/api/form-templates.ts',
]) {
  mustNotExist(frontendRoot, path, 'removed system management frontend code should be deleted');
}

for (const path of [
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/controller/TenantController.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/controller/PermissionController.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/FormTemplateController.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/entity/Tenant.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/repository/TenantRepository.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplate.java',
  'gmp-platform/backend/src/main/java/com/zencas/edhr/template/repository/FormTemplateRepository.java',
]) {
  mustNotExist(repoRoot, path, 'removed system management backend endpoints should be deleted');
}

mustInclude(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/entity/Permission.java', 'public class Permission', 'permission entity is still required by authentication and role assignment');
mustInclude(repoRoot, 'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/repository/PermissionRepository.java', 'public interface PermissionRepository', 'permission repository is still required by authentication and role assignment');

if (failures.length > 0) {
  console.error('System menu pruning verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('System menu pruning verification passed.');
