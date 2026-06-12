import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  constants: 'src/utils/constants.ts',
  menuManagement: 'src/utils/menuManagement.ts',
  router: 'src/router/index.tsx',
  appLayout: 'src/components/shared/AppLayout.tsx',
  loginPage: 'src/pages/LoginPage.tsx',
  api: 'src/api/system.ts',
  brandingHook: 'src/hooks/useSystemBranding.ts',
  builtinIcons: 'src/utils/builtinIcons.tsx',
  iconPage: 'src/pages/system/IconManagementPage.tsx',
  settingsPage: 'src/pages/system/SystemSettingsPage.tsx',
  packageJson: 'package.json',
};

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`缺少文件: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function assertContains(source, snippets, label) {
  const missing = snippets.filter((snippet) => !source.includes(snippet));
  if (missing.length > 0) {
    throw new Error(`${label} 缺少: ${missing.join(', ')}`);
  }
}

function assertMatches(source, checks, label) {
  const missing = checks.filter(({ pattern }) => !pattern.test(source)).map(({ name }) => name);
  if (missing.length > 0) {
    throw new Error(`${label} 未匹配: ${missing.join(', ')}`);
  }
}

function assertNotContains(source, snippets, label) {
  const unexpected = snippets.filter((snippet) => source.includes(snippet));
  if (unexpected.length > 0) {
    throw new Error(`${label} 不应包含: ${unexpected.join(', ')}`);
  }
}

const constants = read(files.constants);
assertContains(constants, [
  '图标管理',
  '/system/icons',
  '系统设置',
  '/system/settings',
], files.constants);

const menuManagement = read(files.menuManagement);
assertContains(menuManagement, [
  'ensureRequiredSystemMenus',
  'system.icons',
  'system.settings',
  '/system/icons',
  '/system/settings',
], files.menuManagement);
assertMatches(menuManagement, [
  { name: '加载旧菜单时补齐默认系统菜单', pattern: /loadManagedSidebarModules[\s\S]*ensureRequiredSystemMenus/ },
  { name: '保存菜单时保留系统管理新增项', pattern: /saveManagedSidebarModules[\s\S]*ensureRequiredSystemMenus/ },
], files.menuManagement);

const router = read(files.router);
assertContains(router, [
  'IconManagementPage',
  'SystemSettingsPage',
  'path="icons"',
  'path="settings"',
], files.router);

const api = read(files.api);
assertContains(api, [
  'getIconGroups',
  'createIconGroup',
  'updateIconGroup',
  'deleteIconGroup',
  'reorderIconGroups',
  'getIcons',
  'getIconPage',
  'size: params.size ?? 20',
  'uploadIcon',
  'importIcons',
  'builtinKey?: string | null',
  'builtin?: boolean',
  'deleteIcon',
  'batchDeleteIcons',
  'reorderIcons',
  'getPublicSystemSettings',
  'getSystemSettings',
  'updateSystemSettings',
  'uploadSystemLogo',
  'uploadSystemFavicon',
  'deleteSystemLogo',
  'deleteSystemFavicon',
], files.api);

const builtinIcons = read(files.builtinIcons);
assertContains(builtinIcons, [
  'AccountTree',
  'WarningAmberOutlined',
  'builtinIconComponents',
  'isBuiltinIconKey',
  'renderBuiltinIcon',
], files.builtinIcons);
const builtinSql = fs.readFileSync(path.join(root, '../backend/src/main/resources/db/changelog/0004-builtin-icons.sql'), 'utf8');
const sqlBuiltinKeys = [...builtinSql.matchAll(/\('([^']+)',\s*'[^']+',\s*'[^']+',\s*\d+\)/g)].map((match) => match[1]);
const componentBody = builtinIcons.match(/export const builtinIconComponents = \{([\s\S]*?)\}\s+satisfies/)?.[1] ?? '';
const frontendBuiltinKeys = [...componentBody.matchAll(/^\s*([A-Za-z_$][\w$]*),\s*$/gm)].map((match) => match[1]);
const missingBuiltinKeys = sqlBuiltinKeys.filter((key) => !frontendBuiltinKeys.includes(key));
const extraBuiltinKeys = frontendBuiltinKeys.filter((key) => !sqlBuiltinKeys.includes(key));
if (sqlBuiltinKeys.length !== frontendBuiltinKeys.length || missingBuiltinKeys.length > 0 || extraBuiltinKeys.length > 0) {
  throw new Error(`内置图标 SQL 与前端映射不一致: sql=${sqlBuiltinKeys.length}, frontend=${frontendBuiltinKeys.length}, missing=${missingBuiltinKeys.join(',')}, extra=${extraBuiltinKeys.join(',')}`);
}

const brandingHook = read(files.brandingHook);
assertContains(brandingHook, [
  'useSystemBranding',
  'applySystemBranding',
  'getPublicSystemSettings',
  'document.title',
  'rel="icon"',
], files.brandingHook);

const appLayout = read(files.appLayout);
assertContains(appLayout, [
  'useSystemBranding',
  'branding.systemName',
  'branding.logoUrl',
], files.appLayout);

const loginPage = read(files.loginPage);
assertContains(loginPage, [
  'useSystemBranding',
  'branding.systemName',
  'branding.logoUrl',
], files.loginPage);

const iconPage = read(files.iconPage);
assertContains(iconPage, [
  'data-system-icon-management-page',
  '图标分组',
  '关键词搜索',
  '上传图标',
  '上传图标说明',
  '支持 .svg、.png、.jpg、.jpeg、.gif、.webp 格式',
  '导入图标',
  '批量删除',
  'Pagination',
  'pageSize',
  'totalElements',
  '每页',
  "icon.source === 'BUILTIN'",
  'builtinKey',
  'renderBuiltinIcon',
  '系统内置图标不能删除',
  'isBuiltinGroup',
  'orderedGroups',
  'builtinGroupId',
  'getCustomUploadGroupId',
  'visibleIcons',
  'dataTransfer.setData',
  'openUploadDialog',
  'draggable',
  'onDrop',
  'selectedIconIds',
  'empty',
], files.iconPage);
assertNotContains(iconPage, [
  'toggleAllVisible',
  'allVisibleSelected',
  '>全选<',
  'formatDateTime(icon.createdAt)',
  'formatDateTime',
  '未知上传人',
  'icon.createdBy || icon.uploadedBy',
], files.iconPage);
assertMatches(iconPage, [
  { name: '内置分组不展示重命名和删除操作', pattern: /!builtinGroup && \([\s\S]*openEditGroupDialog[\s\S]*groupDeleteMutation/ },
  { name: '内置分组固定展示在普通分组前', pattern: /orderedGroups[\s\S]*isBuiltinGroup\(group\)[\s\S]*return -1/ },
  { name: '内置分组使用后端 builtin 字段识别', pattern: /function isBuiltinGroup\(group: IconGroup\)[\s\S]*Boolean\(group\.builtin\)/ },
  { name: '内置分组不可作为拖拽源', pattern: /draggable=\{!builtinGroup\}/ },
  { name: '内置分组不展示可拖拽光标', pattern: /cursor: builtinGroup \? 'default' : 'grab'/ },
  { name: '全部图标展示接口返回的全部数据', pattern: /visibleIcons[\s\S]*return icons;/ },
  { name: '内置图标卡片不可作为拖拽源', pattern: /draggable=\{!builtin\}/ },
  { name: '内置图标不展示可移动操作', pattern: /系统内置图标不能移动/ },
  { name: '图标卡片有悬浮阴影', pattern: /&:hover[\s\S]*boxShadow/ },
  { name: '图标列表使用后端分页信息', pattern: /iconsPage\?\.totalElements/ },
  { name: '图标分组数量使用后端返回值', pattern: /group\.iconCount \?\? 0/ },
  { name: '上传按钮先打开说明弹框', pattern: /onClick=\{openUploadDialog\}/ },
  { name: '说明弹框确认后才打开文件选择', pattern: /uploadInputRef\.current\?\.click\(\)/ },
  { name: '内置分组阻止上传或导入自定义图标', pattern: /getCustomUploadGroupId[\s\S]*系统内置图标分组不能放入自定义图标[\s\S]*handleImportChange/ },
], files.iconPage);

const settingsPage = read(files.settingsPage);
assertContains(settingsPage, [
  'data-system-settings-page',
  '系统名称',
  '浏览器标题',
  '系统 Logo',
  '浏览器标签 Icon',
  '上传',
  '删除',
  '保存设置',
  'refreshBranding',
], files.settingsPage);

const packageJson = read(files.packageJson);
assertContains(packageJson, [
  'verify:system-management-pages',
  'scripts/verify-system-management-pages.mjs',
], files.packageJson);

console.log('系统管理图标与设置页面静态验证通过');
