# System Icon Library And Settings Design

## Goal

在系统管理下新增“图标管理”和“系统设置”两个菜单，提供真实前后端持久化能力。图标管理用于维护可上传、可导入、可分组和可删除的 icon 素材库；系统设置用于维护系统名称、系统 logo、浏览器标签标题和浏览器标签 icon，并让设置对所有用户生效。

## Current Context

- 前端使用 React、MUI、React Query 和 Vite。
- 系统壳层菜单来自 `SIDEBAR_MODULES`，并可被菜单管理页面保存到 `localStorage` 覆盖。
- 岗位角色的菜单权限弹窗复用 `useManagedSidebarModules()`，因此默认菜单新增项需要同步进入权限设置。
- 后端使用 Spring Boot、JPA、Liquibase formatted SQL 和 PostgreSQL。
- 后端已有 `file_object`、`FileController`、`/api/v1/files/upload`、`/api/v1/files/{id}/preview`、`/api/v1/files/{id}`，可复用为图标、logo 和 favicon 的实际文件存储能力。

## Menus And Permissions

默认菜单在“系统 > 系统管理”下新增：

- 图标管理：`/system/icons`
- 系统设置：`/system/settings`

默认权限新增：

- `system.icons`：图标管理页面权限
- `system.settings`：系统设置页面权限

系统管理员默认拥有这两个权限。若用户本地已通过“菜单管理”保存过自定义菜单，前端需要在加载本地菜单时补齐这两个默认菜单，避免默认新增项被旧本地配置覆盖。

## Icon Management

### Backend Model

新增 `icon_group`：

- `id`
- `tenant_id`
- `name`
- `sort_order`
- `created_by`
- `created_at`
- `updated_by`
- `updated_at`

新增 `icon_asset`：

- `id`
- `tenant_id`
- `group_id`
- `file_id`
- `name`
- `tags`
- `source`
- `sort_order`
- `created_by`
- `created_at`
- `updated_by`
- `updated_at`

`file_id` 关联 `file_object.id`。上传图标时先调用文件存储逻辑保存文件，再写入 `icon_asset` 元数据。删除图标时删除 `icon_asset`，并尽力删除对应 `file_object` 与物理文件。

### Backend API

- `GET /api/v1/system/icon-groups`
- `POST /api/v1/system/icon-groups`
- `PUT /api/v1/system/icon-groups/{id}`
- `DELETE /api/v1/system/icon-groups/{id}`
- `PUT /api/v1/system/icon-groups/order`
- `GET /api/v1/system/icons`
- `POST /api/v1/system/icons/upload`
- `POST /api/v1/system/icons/import`
- `PUT /api/v1/system/icons/{id}`
- `DELETE /api/v1/system/icons/{id}`
- `POST /api/v1/system/icons/batch-delete`
- `PUT /api/v1/system/icons/order`

分组删除时，如果分组下存在图标，后端拒绝删除并返回明确错误。

### Frontend UX

页面沿用后台工作台风格：

- 左侧为图标分组列表，支持新增、重命名、删除和拖拽排序。
- 右侧顶部为查询与动作区，包含关键词搜索、上传、导入、批量删除。
- 右侧主体为图标网格，展示预览、名称、标签、上传人、上传时间。
- 支持单图标删除、多选和批量删除。
- 拖拽图标到分组时变更 `groupId`；同组内拖拽时变更排序。
- 空数据、加载中、加载失败状态撑满容器。

## System Settings

### Backend Model

新增 `system_setting`：

- `id`
- `tenant_id`
- `system_name`
- `system_logo_file_id`
- `browser_title`
- `browser_icon_file_id`
- `created_by`
- `created_at`
- `updated_by`
- `updated_at`

每个租户保留一条当前设置。初始值：

- 系统名称：`eDHR 系统`
- 浏览器标签网站名称：`eDHR - 医疗器械电子设备历史记录系统`
- logo 和 favicon 为空，前端使用当前默认样式兜底。

### Backend API

- `GET /api/v1/system/settings/public`
- `GET /api/v1/system/settings`
- `PUT /api/v1/system/settings`
- `POST /api/v1/system/settings/logo`
- `POST /api/v1/system/settings/favicon`
- `DELETE /api/v1/system/settings/logo`
- `DELETE /api/v1/system/settings/favicon`

`public` 接口返回前端渲染系统壳层所需的非敏感字段，仍保持当前安全边界内使用，不包含账号、权限或内部路径。

### Frontend UX

系统设置页面分为两个区域：

- 基础信息：系统名称、浏览器标签网站名称。
- 品牌资源：系统 logo、浏览器标签 icon，支持上传、预览、删除和保存。

保存成功后立即刷新当前前端显示：

- 顶部系统名称。
- 登录页或工作台显示名称。
- `document.title`。
- favicon。

## Audit

关键动作写入 `audit_event`：

- 图标分组：CREATE、UPDATE、DELETE、REORDER。
- 图标素材：CREATE、IMPORT、UPDATE、DELETE、BATCH_DELETE、MOVE、REORDER。
- 系统设置：UPDATE、UPLOAD_LOGO、UPLOAD_FAVICON、DELETE_LOGO、DELETE_FAVICON。

审计内容记录变更前后快照。批量删除记录删除的图标 ID、名称和文件 ID。

## Validation

- 图标上传允许 `image/svg+xml`、`image/png`、`image/jpeg`、`image/gif`、`image/webp`。
- 单个图标文件大小限制为 2 MB。
- favicon 建议 48px * 48px，允许 `ico`、`png`、`svg`。
- logo 建议 128px * 128px 或横向透明 PNG/SVG。
- 系统名称和浏览器标题为必填，去除首尾空格后保存。
- 批量删除没有选中项时禁用按钮。

## Testing And QA

- 后端增加控制器测试，覆盖分组增删改、分组存在图标时拒绝删除、图标上传元数据、批量删除、系统设置保存和 public 查询。
- 前端增加静态验证脚本，检查菜单、路由、API 调用、图标管理控件、系统设置字段和设置应用逻辑。
- 运行 `npm run build`、相关前端验证脚本、后端目标测试。
- 启动前后端后做浏览器 QA：菜单可见、页面可打开、上传/删除/批量删除可走通、系统名称和标签页标题可即时更新。
