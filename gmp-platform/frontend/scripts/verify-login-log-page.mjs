import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const repoRoot = path.resolve(root, '..');

const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: missing file`);
    return '';
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function readBackend(relativePath) {
  const absolutePath = path.join(repoRoot, 'backend', relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`backend/${relativePath}: missing file`);
    return '';
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function mustInclude(source, snippet, label) {
  if (!source.includes(snippet)) failures.push(`${label} 缺少 ${JSON.stringify(snippet)}`);
}

function mustMatch(source, pattern, label) {
  if (!pattern.test(source)) failures.push(`${label} 未匹配 ${pattern}`);
}

const packageJson = read('package.json');
const constants = read('src/utils/constants.ts');
const menuManagement = read('src/utils/menuManagement.ts');
const router = read('src/router/index.tsx');
const page = read('src/pages/system/LoginLogPage.tsx');
const api = read('src/api/loginLogs.ts');
const authApi = read('src/api/auth.ts');
const appLayout = read('src/components/shared/AppLayout.tsx');
const controller = readBackend('src/main/java/com/zencas/edhr/identity/controller/LoginLogController.java');
const authController = readBackend('src/main/java/com/zencas/edhr/identity/controller/AuthController.java');
const entity = readBackend('src/main/java/com/zencas/edhr/identity/entity/LoginLog.java');
const repository = readBackend('src/main/java/com/zencas/edhr/identity/repository/LoginLogRepository.java');
const migration = readBackend('src/main/resources/db/changelog/0009-login-log.sql');
const permissionMigration = readBackend('src/main/resources/db/changelog/0011-login-log-permission.sql');
const changelog = readBackend('src/main/resources/db/changelog/db.changelog-master.yaml');

mustInclude(packageJson, '"verify:login-log-page": "node scripts/verify-login-log-page.mjs"', 'package.json');

mustMatch(constants, /label:\s*'安全管理'[\s\S]*label:\s*'登录日志'[\s\S]*path:\s*'\/system\/login-logs'/, '系统菜单应在安全管理下暴露登录日志');
mustInclude(menuManagement, 'system.login-logs', '菜单管理默认菜单');
mustInclude(menuManagement, '/system/login-logs', '菜单管理默认菜单路径');
mustInclude(router, 'LoginLogPage', '路由');
mustInclude(router, 'path="login-logs"', '路由');

mustInclude(api, 'export interface LoginLogItem', '登录日志 API 类型');
mustInclude(api, "client.get('/identity/login-logs'", '登录日志 API 路径');
mustInclude(api, 'getLoginLogs', '登录日志 API 方法');

for (const field of [
  'operatorName',
  'username',
  'eventType',
  'eventTypeLabel',
  'actionLabel',
  'authMethod',
  'authMethodLabel',
  'occurredAt',
  'platform',
  'platformLabel',
  'clientType',
  'clientTypeLabel',
  'browser',
  'ipAddress',
]) {
  mustInclude(api, field, `登录日志 API 字段 ${field}`);
}

for (const text of [
  '登录日志',
  '事件类型',
  '操作人/账号',
  '开始时间',
  '结束时间',
  '操作人',
  '账号',
  '登录/登出方式',
  '时间',
  '平台',
  '客户端类型',
  '浏览器',
  'IP',
  '暂无登录日志',
]) {
  mustInclude(page, text, `登录日志页面文案 ${text}`);
}
mustInclude(page, "queryKey: ['login-logs'", '登录日志页面查询 key');
mustInclude(page, 'getLoginLogs', '登录日志页面数据源');
mustInclude(page, 'LOGIN_LOG_EVENT_TYPE_OPTIONS', '登录日志页面事件类型选项');
mustInclude(page, '<Table stickyHeader size="small"', '登录日志页面表格规范');

mustInclude(authApi, "client.post('/auth/logout')", '登出 API 应调用后端');
mustInclude(appLayout, 'logout()', '退出按钮应调用后端登出接口');

for (const field of [
  'operatorId',
  'operatorName',
  'username',
  'eventType',
  'authMethod',
  'occurredAt',
  'platform',
  'clientType',
  'browser',
  'ipAddress',
  'userAgent',
]) {
  mustInclude(entity, field, `LoginLog 实体字段 ${field}`);
}
mustInclude(repository, 'JpaSpecificationExecutor<LoginLog>', 'LoginLog repository 应支持条件查询');
mustInclude(controller, '@RequestMapping("/api/v1/identity/login-logs")', '登录日志查询接口路径');
mustInclude(controller, 'PageResult<LoginLogItem>', '登录日志查询接口应返回分页 DTO');
mustInclude(controller, 'eventType', '登录日志查询接口应支持事件类型');
mustInclude(controller, 'keyword', '登录日志查询接口应支持操作人/账号关键词');
mustInclude(controller, 'startTime', '登录日志查询接口应支持开始时间');
mustInclude(controller, 'endTime', '登录日志查询接口应支持结束时间');
mustInclude(authController, 'recordLoginEvent', '认证接口应记录登录/登出事件');
mustInclude(authController, 'LOGIN', '认证接口应记录登录');
mustInclude(authController, 'LOGOUT', '认证接口应记录登出');
mustInclude(migration, 'CREATE TABLE IF NOT EXISTS login_log', '登录日志迁移建表');
mustInclude(migration, 'operator_name', '登录日志迁移记录操作人');
mustInclude(migration, 'username', '登录日志迁移记录账号');
mustInclude(migration, 'event_type', '登录日志迁移记录登录/登出');
mustInclude(migration, 'auth_method', '登录日志迁移记录方式');
mustInclude(migration, 'platform', '登录日志迁移记录平台');
mustInclude(migration, 'client_type', '登录日志迁移记录客户端类型');
mustInclude(migration, 'browser', '登录日志迁移记录浏览器');
mustInclude(migration, 'ip_address', '登录日志迁移记录 IP');
mustInclude(changelog, '0009-login-log.sql', '主 changelog 应包含登录日志迁移');
mustInclude(permissionMigration, "'system.login-logs'", '既有库迁移应补齐登录日志权限');
mustInclude(permissionMigration, 'INSERT INTO permission', '既有库迁移应插入登录日志权限');
mustInclude(permissionMigration, 'INSERT INTO role_permission', '既有库迁移应默认授予管理员登录日志权限');
mustInclude(changelog, '0011-login-log-permission.sql', '主 changelog 应包含登录日志权限迁移');

if (failures.length > 0) {
  console.error('Login log page verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Login log page verification passed.');
