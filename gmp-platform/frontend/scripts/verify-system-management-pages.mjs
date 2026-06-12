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
  iconAssets: 'src/utils/iconAssets.tsx',
  iconPage: 'src/pages/system/IconManagementPage.tsx',
  menuPage: 'src/pages/system/MenuManagementPage.tsx',
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
  'cascade: options?.cascade ?? false',
  'builtinKey?: string | null',
  'builtin?: boolean',
  'deleteIcon',
  'batchDeleteIcons',
  'reorderIcons',
  'getPublicSystemSettings',
  'getSystemSettings',
  'updateSystemSettings',
  'logoWidth',
  'logoHeight',
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
  'normalizeSystemBranding',
  'getPublicSystemSettings',
  'logoWidth',
  'logoHeight',
  'refreshBranding = useCallback(async (settings?: SystemSettings)',
  'queryClient.setQueryData<SystemSettings>(SYSTEM_BRANDING_QUERY_KEY, nextBranding)',
  'applySystemBranding(nextBranding)',
  'document.title',
  'rel="icon"',
], files.brandingHook);

const appLayout = read(files.appLayout);
assertContains(appLayout, [
  'useSystemBranding',
  'branding.systemName',
  'branding.logoUrl',
  'branding.logoWidth',
  'branding.logoHeight',
  'renderManagedIcon',
], files.appLayout);

const iconAssets = read(files.iconAssets);
assertContains(iconAssets, [
  "ICON_ASSET_VALUE_PREFIX = 'asset:'",
  'parseIconAssetFileId',
  'getPublicFilePreviewUrl',
  'public-preview',
  'getIconAssetPreviewUrl',
  'renderManagedIcon',
], files.iconAssets);

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
  'InfoOutlined',
  '可拖拽图标到左侧分组移动，或在网格内拖拽排序。',
  '上传图标',
  '上传图标说明',
  '请上传图标素材文件。',
  '支持 .svg、.png、.jpg、.jpeg、.gif、.webp 格式',
  '<input ref={uploadInputRef} hidden type="file" multiple',
  '删除图标分组',
  '当前分类以及分类下所有图标全部删除',
  '确认删除',
  '批量删除',
  'Pagination',
  'ICON_PAGE_SIZE_OPTIONS = [20, 50, 100, 200]',
  'totalElements',
  '每页',
  'startAdornment: <InputAdornment position="start" sx={{ mr: 0 }}>每页</InputAdornment>',
  'getIconAssetPreviewUrl',
  'ICON_PREVIEW_SIZE = 42',
  '用户上传',
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
  'response?.data?.message',
  'empty',
], files.iconPage);
assertNotContains(iconPage, [
  'FileUpload',
  'importInputRef',
  'importMutation',
  'handleImportChange',
  '导入图标',
  'DriveFileMove',
  '当前分组：',
  '请上传单个图标素材文件。',
  'pageSizeOptions = [20, 40, 80]',
  '每页 {option}',
  'showFirstButton',
  'showLastButton',
  '无标签',
  'getFilePreviewBlobUrl',
  'URL.createObjectURL',
  'URL.revokeObjectURL',
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
  { name: '分页总数文案符合用户管理规范', pattern: /共 \{iconsPage\?\.totalElements \?\? 0\} 条数据/ },
  { name: '图标分组数量使用后端返回值', pattern: /group\.iconCount \?\? 0/ },
  { name: '删除有图标分组先弹确认', pattern: /requestDeleteGroup[\s\S]*group\.iconCount[\s\S]*setDeleteGroupConfirm/ },
  { name: '确认删除分组时启用级联删除', pattern: /confirmCascadeDeleteGroup[\s\S]*cascade: true/ },
  { name: '空分组删除不启用级联', pattern: /requestDeleteGroup[\s\S]*cascade: false/ },
  { name: '后端提示分组下存在图标时转确认弹框', pattern: /onError: \(error, variables\)[\s\S]*分组下存在图标[\s\S]*setDeleteGroupConfirm/ },
  { name: '删除分组按钮统一进入确认逻辑', pattern: /onClick=\{\(\) => requestDeleteGroup\(group\)\}/ },
  { name: '上传按钮先打开说明弹框', pattern: /onClick=\{openUploadDialog\}/ },
  { name: '说明弹框确认后才打开文件选择', pattern: /uploadInputRef\.current\?\.click\(\)/ },
  { name: '上传图标支持多文件批量上传', pattern: /mutationFn: async \(files: File\[\]\)[\s\S]*Promise\.all[\s\S]*uploadIcon/ },
  { name: '上传变更读取全部选中文件', pattern: /handleUploadChange[\s\S]*Array\.from\(files \?\? \[\]\)/ },
  { name: '内置分组阻止上传自定义图标', pattern: /getCustomUploadGroupId[\s\S]*系统内置图标分组不能放入自定义图标[\s\S]*uploadMutation/ },
  { name: '上传图标预览使用公开预览地址', pattern: /function IconPreview[\s\S]*getIconAssetPreviewUrl\(icon\)[\s\S]*component="img"[\s\S]*src=\{previewSrc\}/ },
  { name: '上传图标图片使用统一像素尺寸', pattern: /component="img"[\s\S]*width: ICON_PREVIEW_SIZE[\s\S]*height: ICON_PREVIEW_SIZE[\s\S]*objectFit: 'contain'/ },
  { name: '上传图标占位图使用统一像素尺寸', pattern: /ImageOutlined[\s\S]*fontSize: ICON_PREVIEW_SIZE/ },
  { name: '内置图标使用统一像素尺寸', pattern: /renderBuiltinIcon\(icon\.builtinKey,\s*\{ sx: \{ color: COLORS\.textSecondary, fontSize: ICON_PREVIEW_SIZE \} \}\)/ },
], files.iconPage);

const menuPage = read(files.menuPage);
assertContains(menuPage, [
  'IconSelectorField',
  'getIconGroups',
  'getIconPage',
  'menu-icon-picker-groups',
  'menu-icon-picker',
  'ICON_PICKER_PAGE_SIZE',
  'selectedIconGroupId',
  '图标选择',
  'aria-label="关闭图标选择"',
  'label="分类"',
  '<MenuItem value="ALL">全部</MenuItem>',
  '按图标名称模糊查询',
  'data-menu-icon-picker-option',
  'ICON_PICKER_PAGE_SIZE_OPTIONS = [20, 50, 100, 200]',
  'Pagination',
  '共 {totalElements} 条数据',
  'getIconPickerValue',
  'toIconAssetValue',
  'getIconAssetPreviewUrl',
  'renderManagedIcon',
  '模块图标',
], files.menuPage);
assertMatches(menuPage, [
  { name: '模块图标使用图标选择器', pattern: /<IconSelectorField[\s\S]*label="模块图标"[\s\S]*onChange=\{\(icon\) => updateModule\(\{ icon \}\)\}/ },
  { name: '一级菜单图标使用图标选择器', pattern: /<IconSelectorField[\s\S]*label="图标"[\s\S]*onChange=\{\(icon\) => updateRootMenu\(rootIndex, \{ icon \}\)\}/ },
  { name: '图标选择器使用分类与名称关键词查询图标管理数据', pattern: /getIconPage\(\{ groupId: selectedIconGroupId, keyword: iconKeyword\.trim\(\), page: iconPickerPage, size: iconPickerPageSize \}\)/ },
  { name: '图标选择器标题固定为图标选择', pattern: /<Typography sx=\{\{ fontWeight: 600, color: '#303133' \}\}>图标选择<\/Typography>/ },
], files.menuPage);
assertNotContains(menuPage, [
  'label="模块图标" value={selectedModule.icon}',
  'label="图标" value={menu.icon',
  'DialogActions',
  '当前选择：',
  '{label}选择器',
], files.menuPage);

const settingsPage = read(files.settingsPage);
assertContains(settingsPage, [
  'data-system-settings-page',
  '系统名称',
  '浏览器标题',
  '系统 Logo',
  'LOGO_SIZE_MAX = 60',
  'Logo 长度',
  'Logo 高度',
  'logoWidth',
  'logoHeight',
  'readLogoSizeInput',
  'inputProps={{ min: 1, max: LOGO_SIZE_MAX }}',
  'Logo 长度不能超过 60px',
  'Logo 高度不能超过 60px',
  '浏览器标签 Icon',
  '上传',
  '删除',
  '保存设置',
  'refreshSettings = async (nextSettings?: SystemSettings)',
  "queryClient.setQueryData(['system', 'settings'], nextSettings)",
  'onSuccess: async (savedSettings)',
  'await refreshSettings(savedSettings)',
  'refreshBranding',
], files.settingsPage);

const systemSettingEntity = fs.readFileSync(path.join(root, '../backend/src/main/java/com/zencas/edhr/system/entity/SystemSetting.java'), 'utf8');
assertContains(systemSettingEntity, [
  '@Column(name = "logo_width")',
  '@Column(name = "logo_height")',
  'private Integer logoWidth',
  'private Integer logoHeight',
], 'SystemSetting.java');

const systemSettingsController = fs.readFileSync(path.join(root, '../backend/src/main/java/com/zencas/edhr/system/controller/SystemSettingsController.java'), 'utf8');
assertContains(systemSettingsController, [
  'LOGO_SIZE_MAX = 60',
  'normalizeLogoSize',
  'setting.setLogoWidth',
  'setting.setLogoHeight',
  'logoWidth(normalizeLogoSize(setting.getLogoWidth(), "Logo 长度"))',
  'logoHeight(normalizeLogoSize(setting.getLogoHeight(), "Logo 高度"))',
  'private Integer logoWidth',
  'private Integer logoHeight',
], 'SystemSettingsController.java');

const systemSettingsSql = fs.readFileSync(path.join(root, '../backend/src/main/resources/db/changelog/0007-system-logo-size-settings.sql'), 'utf8');
assertContains(systemSettingsSql, [
  'ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS logo_width INTEGER NOT NULL DEFAULT 32',
  'ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS logo_height INTEGER NOT NULL DEFAULT 32',
], '0007-system-logo-size-settings.sql');

const packageJson = read(files.packageJson);
assertContains(packageJson, [
  'verify:system-management-pages',
  'scripts/verify-system-management-pages.mjs',
], files.packageJson);

console.log('系统管理图标与设置页面静态验证通过');
