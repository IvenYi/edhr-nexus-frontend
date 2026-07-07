import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const frontendRoot = resolve(repoRoot, 'frontend');
const backendRoot = resolve(repoRoot, 'backend');
const failures = [];

function mustNotExist(path, reason) {
  if (existsSync(path)) failures.push(`unexpected path ${path} (${reason})`);
}

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

const packageJson = read(resolve(frontendRoot, 'package.json'));
const router = read(resolve(frontendRoot, 'src/router/index.tsx'));
const constants = read(resolve(frontendRoot, 'src/utils/constants.ts'));
const menuManagement = read(resolve(frontendRoot, 'src/utils/menuManagement.ts'));
const appLayout = read(resolve(frontendRoot, 'src/components/shared/AppLayout.tsx'));
const authController = read(resolve(backendRoot, 'src/main/java/com/zencas/edhr/identity/controller/AuthController.java'));
const roleController = read(resolve(backendRoot, 'src/main/java/com/zencas/edhr/identity/controller/RoleController.java'));
const authControllerTest = read(resolve(backendRoot, 'src/test/java/com/zencas/edhr/identity/controller/AuthControllerTest.java'));
const roleControllerTest = read(resolve(backendRoot, 'src/test/java/com/zencas/edhr/identity/controller/RoleControllerTest.java'));

mustNotExist(resolve(frontendRoot, 'src/features/gct-edhr'), 'frontend GCT pages, routes, metadata, and mock client should be removed');
mustNotExist(resolve(frontendRoot, 'scripts/verify-gct-edhr-coverage.mjs'), 'old GCT coverage verifier should be removed with the module');
mustNotExist(resolve(backendRoot, 'src/main/java/com/zencas/edhr/gct'), 'backend GCT controllers, services, DTOs, and stores should be removed');
mustNotExist(resolve(backendRoot, 'src/test/java/com/zencas/edhr/gct'), 'backend GCT tests should be removed with the backend module');
mustNotExist(resolve(backendRoot, 'src/main/java/com/zencas/edhr/identity/service/GctPermissionCatalog.java'), 'dynamic GCT permission catalog should be removed');
mustNotExist(resolve(backendRoot, 'src/main/resources/gct/gct-page-specs.json'), 'backend GCT page specs should be removed');

mustInclude(packageJson, '"verify:gct-module-removed": "node scripts/verify-gct-module-removed.mjs"', 'package script should expose the removal regression check');
mustNotInclude(packageJson, 'verify:gct-edhr', 'old GCT coverage script should not remain runnable');

mustNotInclude(router, 'GenericEdhrPage', 'router should not lazy-load the removed GCT page');
mustNotInclude(router, 'gct-edhr/*', 'router should not mount GCT routes');
mustNotInclude(router, '@/features/gct-edhr', 'router should not import removed GCT frontend code');

mustNotInclude(constants, 'GCT_EDHR_MENU_MODULE', 'sidebar constants should not import or append the GCT menu module');
mustNotInclude(constants, '@/features/gct-edhr', 'sidebar constants should not depend on removed GCT metadata');

mustInclude(menuManagement, 'REMOVED_GCT_MODULE_IDS', 'managed menu migration should recognize retired GCT module ids');
mustInclude(menuManagement, 'REMOVED_GCT_MODULE_LABELS', 'managed menu migration should recognize retired GCT module labels');
mustInclude(menuManagement, 'REMOVED_GCT_PATH_PREFIXES', 'managed menu migration should recognize retired GCT route prefixes');
mustInclude(menuManagement, 'isRemovedGctModule(module)', 'managed menu normalization should drop persisted GCT modules');
mustInclude(menuManagement, 'isRemovedGctPath(path)', 'managed menu normalization should drop persisted GCT menu paths');
mustInclude(menuManagement, 'isRetiredSidebarPath', 'app shell should be able to identify removed sidebar routes without hard-coding GCT');
mustInclude(menuManagement, 'removeRetiredSidebarModules', 'managed menu defaults should be pruned before rendering');

mustInclude(appLayout, 'isRetiredSidebarPath', 'app shell should close retired GCT tabs and redirect away from removed routes');
mustInclude(appLayout, 'currentRouteTab.path', 'app shell should avoid reopening tabs for retired routes');
mustNotInclude(appLayout, '/gct-edhr', 'app shell should not map removed GCT paths to a module');
mustNotInclude(appLayout, "return 'gct-edhr'", 'app shell should not expose a removed GCT module id');

mustNotInclude(authController, 'GctPermissionCatalog', 'auth controller should not inject dynamic GCT permissions');
mustNotInclude(authController, 'gctPermissionCatalog', 'auth controller should resolve only persisted permissions');
mustNotInclude(roleController, 'GctPermissionCatalog', 'role controller should not inject dynamic GCT permissions');
mustNotInclude(roleController, 'gctPermissionCatalog', 'role permission list should contain only persisted permissions');

mustNotInclude(authControllerTest, 'GctPermissionCatalog', 'auth tests should not mock removed GCT catalog');
mustNotInclude(authControllerTest, 'gct-edhr', 'auth tests should not expect removed GCT permission codes');
mustNotInclude(roleControllerTest, 'GctPermissionCatalog', 'role tests should not mock removed GCT catalog');
mustNotInclude(roleControllerTest, 'gct-edhr', 'role tests should not expect removed GCT permission codes');

if (failures.length > 0) {
  console.error('GCT module removal verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('GCT module removal verification passed.');
