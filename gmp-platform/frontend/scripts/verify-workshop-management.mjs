import { existsSync, readFileSync } from 'node:fs';

const failures = [];

function read(relativePath) {
  const url = new URL(`../${relativePath}`, import.meta.url);
  if (!existsSync(url)) {
    failures.push(`${relativePath}: missing file`);
    return '';
  }
  return readFileSync(url, 'utf8');
}

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustAppearInOrder(content, tokens, reason) {
  let lastIndex = -1;
  for (const token of tokens) {
    const index = content.indexOf(token);
    if (index === -1) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
    else if (index <= lastIndex) failures.push(`out-of-order ${JSON.stringify(token)} (${reason})`);
    lastIndex = index;
  }
}

const packageContent = read('package.json');
const constantsContent = read('src/utils/constants.ts');
const managedMenuContent = read('src/utils/menuManagement.ts');
const routerContent = read('src/router/index.tsx');
const pageContent = read('src/pages/master-data/WorkshopManagementPage.tsx');
const apiContent = read('src/api/workshops.ts');
const controllerContent = read('../backend/src/main/java/com/zencas/edhr/masterdata/controller/WorkshopController.java');
const migrationContent = read('../backend/src/main/resources/db/changelog/0061-workshop-management.sql');

mustInclude(packageContent, '"verify:workshop-management": "node scripts/verify-workshop-management.mjs"', 'workshop verification should be runnable');
mustAppearInOrder(constantsContent, ["label: '工艺建模'", "label: '模板建模'", "label: '工厂建模'"], 'factory modeling should be below template modeling');
mustInclude(constantsContent, "{ label: '车间管理', path: '/master-data/workshops' }", 'factory modeling should expose workshop management');
mustInclude(managedMenuContent, 'REQUIRED_FACTORY_MODELING_MENU', 'stored custom menus should receive the required factory modeling group');
mustInclude(routerContent, 'const WorkshopManagementPage', 'router should lazy load workshop management');
mustInclude(routerContent, 'path="workshops"', 'router should expose the workshop route');

for (const token of ['车间编码', '车间名称', '描述', '状态', '新增车间', '编辑车间', '数据审计']) {
  mustInclude(pageContent, token, 'workshop page should expose the confirmed CRUD fields and interactions');
}
mustInclude(pageContent, 'disabled={Boolean(editingWorkshop && !editingWorkshop.codeEditable)}', 'referenced workshops should lock their code');
mustInclude(pageContent, 'auditQuery.isError', 'audit failures should not be reported as empty audit history');
mustInclude(pageContent, "<MenuItem value=\"ACTIVE\">启用</MenuItem>", 'workshop status should expose active');
mustInclude(pageContent, "<MenuItem value=\"INACTIVE\">停用</MenuItem>", 'workshop status should expose inactive');
mustInclude(apiContent, "client.get('/master-data/workshops'", 'frontend should query the dedicated workshop API');
mustInclude(controllerContent, '@RequestMapping("/api/v1/master-data/workshops")', 'backend should expose the dedicated workshop API');
mustInclude(controllerContent, '@PreAuthorize("hasAuthority(\'master-data.workshops\')")', 'backend should enforce the workshop page permission');
mustInclude(controllerContent, 'existsByWorkshopId', 'backend should protect referenced workshops');
mustInclude(controllerContent, '.entityType("WORKSHOP")', 'workshop changes should be audited');
mustInclude(migrationContent, "'master-data.workshops'", 'workshop page permission should be persisted');
mustInclude(migrationContent, 'LOWER(code)', 'workshop code should be tenant-unique without case sensitivity');
mustInclude(migrationContent, 'UPDATE workshop SET code = BTRIM(code)', 'legacy workshop codes should use the same trimming rule as the API');
mustInclude(migrationContent, 'splitStatements:false', 'PostgreSQL validation blocks should not be split by Liquibase');
mustInclude(migrationContent, 'fk_production_line_workshop', 'database should protect production line references');
mustInclude(migrationContent, 'ON DELETE RESTRICT', 'database should reject concurrent deletion of referenced workshops');

if (failures.length > 0) {
  console.error('Workshop management verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Workshop management verification passed.');
