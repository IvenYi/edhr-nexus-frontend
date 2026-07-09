# Page Designer 拆分功能文档

> **文档目的**：以 `designer-view.tsx` 为入口，梳理 page-designer 项目的全部功能模块及其子功能点，用于拆分规划、任务规划和时间规划。
>
> **生成日期**：2026-02-26

---

## 目录

- [一、整体架构概览](#一整体架构概览)
- [二、功能模块详细清单](#二功能模块详细清单)
  - [模块 1 — 外壳 & 导航层](#模块-1--外壳--导航层)
  - [模块 2 — 页面基本信息](#模块-2--页面基本信息)
  - [模块 3 — 设计工作区布局](#模块-3--设计工作区布局)
  - [模块 4 — 核心状态管理（Controller 层）](#模块-4--核心状态管理controller-层)
  - [模块 5 — 核心业务 Hook 层](#模块-5--核心业务-hook-层)
  - [模块 6 — 画布 Stage](#模块-6--画布-stage)
  - [模块 7 — 拖拽系统（DnD）](#模块-7--拖拽系统dnd)
  - [模块 8 — 工具箱 Toolkit（左侧面板）](#模块-8--工具箱-toolkit左侧面板)
  - [模块 9 — 属性/样式面板（右侧面板）](#模块-9--属性样式面板右侧面板)
  - [模块 10 — Schema 注册中心](#模块-10--schema-注册中心)
  - [模块 11 — 平台组件注册](#模块-11--平台组件注册)
  - [模块 12 — 业务套件（_kit）](#模块-12--业务套件_kit)
  - [模块 13 — 协作锁系统](#模块-13--协作锁系统)
  - [模块 14 — Store 层](#模块-14--store-层)
  - [模块 15 — 工具方法 & 类型层](#模块-15--工具方法--类型层)
- [三、依赖关系图](#三依赖关系图)
- [四、跨包依赖问题](#四跨包依赖问题)
- [五、拆分优先级](#五拆分优先级)

---

## 一、整体架构概览

```
page-designer/src/
├── designer/          # 核心设计器（入口、画布、面板、DnD、工具箱）
├── hooks/             # Composable 层（核心业务逻辑，10+ 个 hook）
├── schema/            # 组件 Schema 注册中心（按平台分目录）
├── components/        # 平台组件注册模块（pcModule / mobileModule / padModule）
├── _kit/              # 行业业务套件（eDHR / QMS / medpro）
├── types/             # TypeScript 类型定义
├── interface/         # 接口定义
├── enum/              # 枚举定义
├── constant/          # 全局常量
├── utils/             # 工具方法
├── assets/            # 静态资源
└── views/             # 业务视图（数据联动配置等）
```

**涉及的外部 packages：**

| 包名 | 功能 |
|---|---|
| `@gct/runtime` | 运行时核心库：类型、枚举、hooks（`Platform`、`t()`、`useAppInst`、`useIFrameProps` 等） |
| `@gct/runtime-web-next` | 设计器 UI 框架壳（`DesignViewLayout`、`DesignSaveTip`、`DesignStepCheck`） |
| `@gct/runtime-web` | Web 端运行时扩展（`SvgIcon`、Web 端 widgets、编辑器组件） |
| `@gct-paas/core` | 基础工具库（`useNamespace`、`copyTextToClipboard`、`PluginPgkUtil`） |
| `@gct-paas/design` | 设计器接口定义（`IDesignerController`、`IDesignerState`、`IDesignerHooks`） |
| `@mobile/utils/mqtt` | MQTT 工具（⚠️ 跨包问题，Web 侧不应直接依赖 mobile 包） |

---

## 二、功能模块详细清单

### 模块 1 — 外壳 & 导航层

**核心文件**：`designer/designer-view.tsx`

| 功能点 | 说明 |
|---|---|
| 步骤流转控制 | `INFO` → `DESIGN` 两步切换，初始步骤由 `pid` 是否为新建决定 |
| iframe 回调通信 | `sendCallback()` 向父窗口 `postMessage`，支持 `close`、`success` 等回调方法 |
| 页面名称同步 | Header 修改名称后同步写入 `pageInfo.name` 和 `infoRef.setName()` |
| Header 操作区 | 预览按钮 + 沙箱预览按钮，由 `actions` computed 动态构建 |
| 预览防重复点击 | `isPreviewLoading` 状态守卫，配合 300ms 延迟释放 |
| 保存并退出 | `onSaveAndExt()`：Info 表单 + 设计内容双路保存，区分是否 dismiss |
| 离开保存提示 | `handleBack()` → 脏检查 → `DesignSaveTip` Popover（退出/保存并退出） |
| 步骤点击跳转 | `onChangeStep()`：DESIGN → INFO 自由跳转，INFO → DESIGN 需校验+保存确认 |
| 协作锁生命周期 | `onMounted` / `onBeforeUnmount` / `beforeunload` 三处触发 `cancelOccupy` |
| 新版设计器提示横幅 | `isNewDesigner` / `viewMsgClose` 控制，含"转换"按钮 |
| 平台检测与全局标记 | `onInit()` 中设置 `gct.designPlatform`（WEB/PDA/PAD） |
| Schema 初始化 | 调用 `initSchema()` 注册所有平台组件描述 |
| Controller 注入 | `provide('designer', controller)` 注入全树 |
| 方法映射刷新 | 监听 `modalInfo.id` 变化和 `get-schema-code` 事件，重建 `methodMap` |

---

### 模块 2 — 页面基本信息

**核心文件**：`designer/designer-view-info.tsx`

| 功能点 | 说明 |
|---|---|
| 三平台差异表单 | Web / Mobile / Pad 字段差异处理（不同分类类型、Key 前缀） |
| 分类异步加载 | 按 `type` 过滤（`web_module` / `mobile_module` / `pad_module`） |
| 分类自动兜底 | 新建页面且无传入分类时，自动选中第一个分类 |
| Key 前缀锁定 | 根据平台自动加 `web_` / `mobile_` / `pad_` 前缀，不可编辑 |
| Key 校验 | 长度/格式/重复校验（调用后端接口） |
| 页面创建 | 新建流程，调用 POST 接口 |
| 页面更新 | 编辑流程，调用 PUT 接口 |
| 一键复制 Key | 复制页面 Key 到剪贴板 |
| expose 对外暴露 | `isChanged`、`validate()`、`save()`、`setName()` 供父组件调用 |
| 历史刷新触发 | 保存成功后调用 `loadPageDesignHistoryList()` |

---

### 模块 3 — 设计工作区布局

**核心文件**：`designer/designer-view-content.tsx`

| 功能点 | 说明 |
|---|---|
| 三栏布局宿主 | 左（工具箱 + 导航） + 中（画布） + 右（属性面板） |
| 工具箱宽度拖拽 | CSS 变量 `--drag-resize-width` + `v-dragResize` |
| 双布局模式 | `toolkitFixed` 驱动固定展开 / 悬浮模式切换 |
| `hidden` 支持 | 多页签场景下整体隐藏 |
| 拖拽全局预览层 | 顶层渲染 `Vue3DndItemPreview`，跟随鼠标显示拖拽物料 |

---

### 模块 4 — 核心状态管理（Controller 层）

#### 4.1 DesignerController

**核心文件**：`designer/designer.controller.ts`

| 功能点 | 说明 |
|---|---|
| `IDesignerController` 实现 | 通过 `provide('designer')` 注入全树 |
| 悬浮层级堆栈 | `pushStack` / `popStack` / `resetStack`，多层嵌套正确高亮最内层 |
| 拖拽数据传递 | `setDragData()` / `getDragData()`，串联拖拽源与放置目标 |
| 容器自动展开 | 悬停 2s 防抖触发，通过 `expansion` Hook 收集需展开的容器 |
| 强制视图重绘 | `force()`：`state.count++` 驱动依赖的计算属性重算 |
| 高亮变更委托 | `changeSelectHighlight()` / `changeHoverHighlight()` 委托给 Hooks |
| 命令式选中 | `setSelect(key)` 通过 `setSelect` 钩子触发 |

#### 4.2 DesignerState

**核心文件**：`designer/designer.state.ts`

| 属性 | 说明 |
|---|---|
| `isDragging` | 拖拽进行中标识 |
| `dropContainer` | 当前拖拽目标容器 widget schema |
| `expansionContainerList` | 待展开容器列表（最近 3 层） |
| `count` | 强制重绘计数器 |
| `draggingData` _(deprecated)_ | 旧版拖拽数据，已废弃 |
| `hoverEL` _(deprecated)_ | 旧版悬浮元素，已废弃 |

#### 4.3 DesignerHooks

**核心文件**：`designer/designer.hooks.ts`

| 钩子 | 说明 |
|---|---|
| `expansion` | 容器展开计算（各容器类型注册展开逻辑，如 Tabs / Collapse） |
| `selectHighlightChange` | 选中高亮重算（各 widget wrapper 独立 tap） |
| `hoverHighlightChange` | 悬浮高亮重算 |
| `setSelect` | 命令式选中指定 key 的组件 |

#### 4.4 接口契约

**包**：`@gct-paas/design`
- `IDesignerController` / `IDesignerState` / `IDesignerHooks` 三接口定义
- 是目前**唯一的面向接口设计的边界**，拆分时应扩展而非破坏

---

### 模块 5 — 核心业务 Hook 层

#### 5.1 useDesigner（1186行，首要拆分目标）

**核心文件**：`hooks/useDesigner.ts`

**① 页面 JSON 管理**

| 功能点 | 说明 |
|---|---|
| `pageJson` | 响应式页面核心数据（widgets / modals / JS / CSS / vars / events / permissions） |
| `setPageJson(json)` | 初始化/重置 pageJson，解析 JS 方法映射表，触发历史缓存 |
| `transformPageJson(json)` | 保存前预处理（移除底部按钮容器冗余） |
| `savePageJsonSnapshot()` | 序列化为快照字符串，供脏检查 |
| `isModified()` | 快照对比判断页面是否被修改 |

**② 保存与持久化**

| 功能点 | 说明 |
|---|---|
| `save(flag, showSuccess)` | 校验 → 收集插件配置 → 三平台分发 API → 更新快照 → 解除占用 |
| `validateWidgets(widgets)` | 递归校验所有 widget 必填属性 + 数值范围校验，失败弹错误提示 |
| `buildRuntimeJson()` | 设计时 JSON → 运行时 JSON（合并 Babel 编译 JS） |

**③ 预览**

| 功能点 | 说明 |
|---|---|
| `preview()` | 防抖 400ms，三端分发预览 URL 跳转 |
| `previewSandbox()` | 沙箱环境预览跳转 |
| `getDataList()` | 获取沙箱配置列表 |
| `historyPreview(hid)` | 指定历史版本的预览 URL + platform 生成 |

**④ 历史版本管理**

| 功能点 | 说明 |
|---|---|
| `loadPageDesignHistoryList()` | 分页加载历史版本列表（50条/页，上限1000条） |
| `loadPageDesignHistoryInfo(id)` | 加载单条版本详情 |
| `recover(hid)` | 恢复指定版本到 pageJson 并立即保存 |
| `deleteHistory(hid)` | 删除历史记录并刷新列表 |

**⑤ 操作历史（撤销/重做）**

| 功能点 | 说明 |
|---|---|
| `emitCache(modified)` | 将当前 pageJson 写入本地撤销栈，同时触发占用续租 |
| `undoOrRestore(content)` | 从撤销栈恢复 pageJson，重置选中组件 |

**⑥ 弹框设计状态管理**

| 功能点 | 说明 |
|---|---|
| `setModalDesignState(flag, modalId, isGlobal)` | 打开/关闭弹框设计态，异步加载 modalInfo |
| `getModalInfo(modelId, isGlobal)` | 从 pageJson.modals 或远程获取弹框数据 |
| `setSubTableModalDesignState(flag, id)` | 控制子表弹框设计态 |
| `setWfNodesModalDesignState` | 控制工作流节点弹框设计态 |
| `setWorkflowNodesModalDesignState` | 控制工作流整体弹框设计态 |
| `setModalInfo(modal)` | 直接设置当前弹框信息 |
| `modalBody / modalFooter / modalBottomBtn` | 弹框 body / footer / 底部按钮容器引用 |

**⑦ 组件集合查询**

| 功能点 | 说明 |
|---|---|
| `allWidget` | 当前作用域所有 widget 扁平集合 |
| `allFormWidget` | 表单类 widget（Form/RdoForm/FormProcess/MedProRdoForm） |
| `excludeSubTableFormWidget` | 排除子表内嵌表单的表单集合 |
| `allSubTableWidget` | 所有子表组件 |
| `allListWidget` | 列表组件（DataList/RdoDataList） |
| `allTableWidget` | 表格组件（DataTable/DataVTable/RefDataTable） |
| `allDeptWidget` | 部门选择组件 |
| `allRefSelectWidget` | 引用类下拉组件 |
| `getWidgetByScope<K>(type)` | 泛型类型查询指定类型的所有 widget |

**⑧ 拖拽相关**

| 功能点 | 说明 |
|---|---|
| `checkWidgetMove(evt)` | 检查拖拽移动合法性（当前始终返回 true） |
| `handleAddDrag(newIndex, childrenList, scope, formID)` | 拖拽放入回调，自动选中新 widget 并写入历史 |

**⑨ 其他**

| 功能点 | 说明 |
|---|---|
| `isNewDesigner` | 标识当前是否使用新版设计器 |
| `getAsyncWidget(widget)` | 按平台获取组件异步加载入口 |
| `getWidgetHooks / getWhiteList / getBlackList` | 获取组件生命周期钩子 / 白名单 / 黑名单 |
| `setPluginConfigs(configs)` | 设置插件配置 |
| `methodMap` | AST 解析后的页面 JS Export 函数描述集合 |

---

#### 5.2 usePage

**核心文件**：`hooks/usePage.ts`

| 功能点 | 说明 |
|---|---|
| 新建/编辑模式判断 | `pid.startsWith(newKeyTag)` |
| 三平台页面数据加载 | `getWebpageInfo` / `getMobilePageInfo` / `getPadPageInfo` |
| 老数据兼容 | 自动补全 `pageConfig`，确保 `BottomButtonContainer` 存在 |
| 设计时插件加载 | `PluginPgkUtil.loadDesignPlugin` + 已删除插件兼容加载 |
| 页面持久锁定 | `lockPage(true)`：弹出确认框 → `postWebpageLockWebPage` |
| 页面解锁 | `lockPage(false)`：调用 `postWebpageUnLockWebPage`，清空锁定信息 |
| 占用状态初始化 | `initLockState()` → `initOccupy()` + `loadOccupyInfo()` |
| 权限列表加载 | `getPermissionList()` |
| 初始化串联调度 | `loadPageInfo()` 串行触发 9 个初始化步骤 |
| 面板切换 | `togglePanel(value)` 切换右侧属性面板 |

---

#### 5.3 useScope

**核心文件**：`hooks/useScope.ts`

| 功能点 | 说明 |
|---|---|
| 作用域枚举路由 | `SCOPE.PAGE` / `SCOPE.MODAL` 切换 |
| `scopeData` | PAGE 返回页面 widgets，MODAL 自动合并 body + footer + bottomBtn |
| `scopeJs` / `scopeCss` | 透明代理，写入到 `pageJson` 或 `modalInfo` |
| `scopeId` | 当前作用域 ID（页面 ID 或弹框 ID） |
| `navTagScopeData` | 面包屑专用，MODAL 时返回整个 `modalInfo` 节点 |
| `setScope(def)` / `getScope()` | 作用域切换与读取 |

---

#### 5.4 useMitt

**核心文件**：`hooks/useMitt.ts`

| 功能点 | 说明 |
|---|---|
| 单例事件总线 | 基于 `/@/utils/mitt` 创建模块级单例 |
| 跨组件解耦通信 | 支持 `get-schema-code`、`switch-stage` 等事件发布/订阅 |

---

#### 5.5 useSelectedWidget

**核心文件**：`hooks/useSelectedWidget.ts`

| 功能点 | 说明 |
|---|---|
| 选中态三层管理 | `selectedWidget`（widget）/ `selectModalRef`（modal）/ `hoverRef`（悬浮） |
| 统一选中对象 | `selectedRef`：优先 modal 否则 widget |
| 祖先链追踪 | `selectedParentWidgets`，支持面包屑导航 |
| 同级列表记录 | `selectedParentChildrenRef` |
| 属性编辑器描述聚合 | `selectedAllPropEditors`（按类型 + 平台查找） |
| 事件描述聚合 | `selectedAllEvents` |
| 样式编辑器描述聚合 | `selectedAllStyleEditors` |
| 设计器配置聚合 | `selectedAllDesingerConfig` |
| 选中样式/属性/事件 | `selectedStyle` / `selectedProps` / `selectedEvents` |
| 表单容器聚焦 | `focusFormContainer`（暴露 model / formId / nodeType） |
| 子表弹框兼容 | 自动定位子表内嵌 Form 组件 |
| 设置方法集 | `setSelectedWidget` / `resetSelectedWidget` / `setSelectedModal` / 等 |

---

#### 5.6 useWidget

**核心文件**：`hooks/useWidget.ts`

| 功能点 | 说明 |
|---|---|
| 选中态判断 | id + materialType 双重比较 |
| 遮罩显示控制 | `NotMask` 列表 + schema `hideMask` 配置 |
| 平台适配 | 按 `widget.platform` 选取 `widgetdesigner` 配置 |
| 通用 Props 定义 | `widgetWrapperProps` / `widgetProps` 统一规范 |

---

#### 5.7 useStyle

**核心文件**：`hooks/useStyle.ts`

| 功能点 | 说明 |
|---|---|
| `wrapperStyle` | 外层包装 CSS（位置 / 尺寸 / 背景 / 边距 / 圆角，带 `!important`） |
| `wStyle` | 内部组件 CSS（`propsToStyle` 批量转换，自动补 px） |
| 字体样式映射 | bold / italic / fontSize / align / textDecoration → CSS 属性 |
| 移动端适配 | `pxToVw`，基于 375px 设计稿将 px 转换为 vw |
| `ignoringStyle` 过滤 | 排除组件 schema 声明的忽略属性 |

---

#### 5.8 useToolkit

**核心文件**：`hooks/useToolkit.ts`

| 功能点 | 说明 |
|---|---|
| Tab 状态控制 | `toolkit`（当前 Tab）/ `toolkitShow`（可见）/ `toolkitFixed`（固定）/ `toolkitPinned`（钉住） |
| 组件分类生成 | `ComponentUtils.getWidgetsToolkit` 按平台过滤 schema 并分组 |
| 上下文感知切换 | 进入 SubTable / CardList 时自动过滤不适用组件 |
| 套件组件扩展 | 从 `gct.register.designer` 动态读取外部注册的 KIT 组件 |
| 字段工具箱 | `setFieldToolkit`：从模型加载字段列表供拖入表单 |
| Tab 切换 | `toggleToolkit(payload, force)`（受 `toolkitPinned` 保护） |
| 固定 / 钉住 | `fixedToolkit()` / `pinnedToolkit()` 切换状态 |

---

#### 5.9 usePropEditor

**核心文件**：`hooks/usePropEditor.ts`

| 功能点 | 说明 |
|---|---|
| 链式路径双向绑定 | `a.b.c` 深层读写 `selectedProps` |
| `root:` 前缀模式 | 从 `selectedRef` 根对象读写（而非 `props` 子对象） |
| 对象批量映射 | `{ localKey: 'schema.path' }` 格式批量读写多字段 |
| 变更回调 | `nextTick` 后执行 `changeCallback`，避免响应式时序问题 |
| 历史写入 | 变更后触发 `emitCache` 写入撤销栈 |

---

#### 5.10 其他 Hook

| Hook | 功能概述 |
|---|---|
| `useGlobal` | 全局设计器配置管理 |
| `useStyleEditor` | 样式编辑器面板逻辑 |
| `useValidator` | Widget 校验规则管理 |
| `usePageOccupy` | 页面占用逻辑（与 `useUserOccupy` 配合） |
| `getFieldSchema` | 从模型字段生成 widget schema |
| `validatorMap` | 校验器映射表 |

---

### 模块 6 — 画布 Stage

**核心目录**：`designer/stage/`

#### 6.1 画布路由

| 文件 | 说明 |
|---|---|
| `stage.vue` | 按 `platform` 分发渲染三端画布，`modalInfo.id` 作为 key 实现实例隔离 |
| `stage-header.vue` | 画布顶部工具栏（视图缩放、平台切换、操作按钮） |
| `stage-design-content.tsx` | 核心渲染逻辑，组件树遍历 + 递归嵌套渲染 |

#### 6.2 平台主画布

| 文件 | 说明 |
|---|---|
| `stage-canvas.vue` | Web 平台主画布 |
| `stage-mobile-canvas.vue` | Mobile 平台主画布 |
| `stage-pad-canvas.vue` | Pad 平台主画布 |

#### 6.3 模态画布

| 文件 | 说明 |
|---|---|
| `stage-modal-canvas.vue` | Web 端普通模态框画布 |
| `stage-mobile-modal-canvas.vue` | Mobile 端模态框画布 |
| `stage-pad-modal-canvas.vue` | Pad 端模态框画布 |
| `stage-sub-table-modal-canvas.vue` | Web 子表格模态框画布 |
| `stage-mobile-sub-table-modal-canvas.vue` | Mobile 子表格模态框画布 |
| `stage-pad-sub-table-modal-canvas.vue` | Pad 子表格模态框画布 |
| `stage-wf-nodes-modal-canvas.vue` | 工作流节点模态框画布 |
| `stage-workflow-modal-canvas.vue` | 工作流整体模态框画布 |

---

### 模块 7 — 拖拽系统（DnD）

**核心目录**：`designer/components/vue3-dnd-*`

> 自包含度高，适合提取为独立 package `@gct-paas/designer-dnd`

| 组件 | 说明 |
|---|---|
| `vue3-dnd-container` | 可放置容器（定义接收区域，触发 `handleAddDrag`） |
| `vue3-dnd-item` | 可拖拽 widget 包装层（挂载 DnD 事件，触发 `pushStack` / `popStack`） |
| `vue3-dnd-item-actions` | widget 选中时操作栏（复制 / 删除 / 上移 / 下移） |
| `vue3-dnd-item-hover-title` | 悬浮时显示组件名标签 |
| `vue3-dnd-highlighter` | 选中 / 悬浮高亮边框渲染 |
| `vue3-dnd-drop-line` | 拖放落点指示线 |
| `vue3-dnd-material-item` | 工具箱物料条目（拖拽源） |
| `vue3-dnd-item-preview` | 全局拖拽跟随预览（在 content 层渲染） |

---

### 模块 8 — 工具箱 Toolkit（左侧面板）

**核心目录**：`designer/toolkits/`

| 文件 | 功能点 |
|---|---|
| `toolkit.vue` | Tab 容器；fixd / 悬浮 / 钉住三态；`import.meta.glob` 动态注册子面板；`v-dragResize` 宽度拖拽 |
| `toolkit-widgets.vue` | 分组展示可拖拽物料；搜索过滤；拖拽起始回调 |
| `toolkit-field.vue` + `toolkit-field-item.tsx` | 模型字段列表；字段拖入自动绑定；字段类型映射 widget |
| `toolkit-outline.vue` | 页面组件树大纲；点击定位选中；支持折叠 |
| `toolkit-js.vue` | Monaco 编辑器编写页面 JS；方法映射刷新 |
| `toolkit-css.vue` | Monaco 编辑器编写全局 CSS |
| `toolkit-modal.vue` | 弹框列表管理（新增 / 编辑 / 删除 / 进入弹框设计态） |
| `toolkit-template.vue` | 页面模板选择 + 应用 |
| `modals/` | 工具箱内各弹窗子组件 |

---

### 模块 9 — 属性/样式面板（右侧面板）

**核心目录**：`designer/panels/`

#### 9.1 面板容器

| 文件 | 说明 |
|---|---|
| `panel.vue` | 按 `currentPanel`（PAGE / WIDGET）动态挂载子面板 |
| — | 注入 `openDiffModal`（版本对比弹窗）和 `openPreview`（预览弹窗） |
| — | 监听 `switch-stage` 事件切换预览设备类型 |

#### 9.2 页面属性面板 `panel-page.vue`

| 功能点 | 说明 |
|---|---|
| 属性 Tab | 折叠三组：基础属性、角色权限设置、弹窗标题配置 |
| 页面 Key 只读展示 | 不可编辑，仅展示 |
| KeepAlive 缓存开关 | 控制页面缓存行为 |
| 权限条目 CRUD | 新增 / 编辑 / 删除，每条有 name + key |
| Mobile 弹窗标题配置 | 仅 Mobile 平台显示 |
| 事件 Tab | 页面生命周期事件绑定 |

#### 9.3 组件属性面板 `panel-widget.vue`

| 功能点 | 说明 |
|---|---|
| Props Tab | 渲染 `selectedAllPropEditors` 全部属性编辑器配置项 |
| Events Tab | 展示可绑定事件列表，支持 `hidden` 回调控制显隐 |
| Style Tab | 渲染 `selectedAllStyleEditors`（含模态框类型样式） |
| `TagNav` 面包屑 | 组件层级路径导航，点击上级跳转 |
| 单类型全屏展示 | 只有一种内容时避免多余 Tab |

#### 9.4 属性编辑器集合 `prop-editor/`

| 子目录 | 说明 |
|---|---|
| `basic/` | 文本、数字、开关、下拉、颜色、日期等基础编辑器 |
| `advanced/` | JSON 编辑器、代码编辑器、表达式编辑器等 |
| `field/` | 字段绑定编辑器 |
| `other/` | 特殊业务编辑器 |
| `modals/` | 编辑器内嵌弹窗 |

#### 9.5 样式编辑器集合 `style-editor/`

- 尺寸 / 间距 / 字体 / 颜色 / 背景 / 边框 / 圆角等样式分组编辑器

#### 9.6 页面子面板

| 子目录 | 说明 |
|---|---|
| `page/vars/` | 页面级变量编辑（CRUD） |
| `page/global/` | 全局配置（国际化、主题、布局等） |
| `page/modals/` | 版本对比弹窗、历史记录弹窗 |
| `page/panel-history.vue` | 版本历史列表 + 版本恢复 + 历史预览 |
| `page/panel-global.vue` | 全局属性配置 |

---

### 模块 10 — Schema 注册中心

**核心文件**：`schema/index.ts`

| 功能点 | 说明 |
|---|---|
| 动态扫描 | `import.meta.glob` 按平台目录自动扫描所有 Schema 文件 |
| 平台合并注册 | 向 `IDesignerProvider` 注入每个平台的组件元数据 |

**每平台注册的数据类型：**

| 注册类型 | 说明 |
|---|---|
| `PropEditors` | 组件属性编辑器映射（驱动右侧属性面板渲染） |
| `StyleEditors` | 组件样式编辑器映射 |
| `Events` | 组件可绑定事件定义 |
| `Callback` | 组件生命周期回调扩展 |
| `BeforeCreate` | 拖入画布前置处理钩子（如自动初始化属性） |
| `DesignerConfig` | 设计器行为配置（可嵌套规则、拖拽限制） |
| `WhiteList / BlackList` | 子组件允许 / 禁止名单 |
| `Schema` | 组件结构描述（含默认 props） |
| `customWidget*` | 自定义上传组件独立注册空间 |

**Schema 目录结构：**

| 目录 | 说明 |
|---|---|
| `schema/web/` | Web 平台组件 Schema |
| `schema/mobile/` | Mobile 平台组件 Schema |
| `schema/pad/` | Pad 平台组件 Schema |
| `schema/field/` | 字段组件 Schema |
| `schema/modal/` | 模态框 Schema |
| `schema/common/` | 通用 Schema |
| `schema/common-config/` | 通用配置 Schema |
| `schema/utils.ts` | Schema 构建工具方法 |

---

### 模块 11 — 平台组件注册

**核心目录**：`components/`

| 文件 | 说明 |
|---|---|
| `pcModule.ts` | Web 端运行时组件异步注册 |
| `mobileModule.ts` | Mobile 端运行时组件注册 |
| `mobileModuleDesign.ts` | Mobile 端设计态组件注册 |
| `padModule.ts` | Pad 端运行时组件注册 |
| `padModuleDesign.ts` | Pad 端设计态组件注册 |

**渲染入口（`_kit/` 下）：**

| 文件 | 说明 |
|---|---|
| `web-render-index.ts` | Web 端渲染组件入口 |
| `mobile-render-index.ts` | Mobile 端渲染组件入口 |
| `pad-render-index.ts` | Pad 端渲染组件入口 |

---

### 模块 12 — 业务套件（_kit）

**核心目录**：`_kit/`

| 套件 | 说明 |
|---|---|
| `kit-eDHR` | eDHR 行业套件（额外组件 / 配置） |
| `kit-QMS` | 质量管理套件 |
| `kit-medpro` | 医疗行业套件 |

**挂载机制**：通过 `gct.register.designer` 动态注册 → `useToolkit` 读取 → 合并到工具箱分组。

---

### 模块 13 — 协作锁系统

#### 13.1 UI 层

**核心文件**：`designer/components/design-view-lock/`

| 功能点 | 说明 |
|---|---|
| 占用人信息展示 | 头像 + 姓名 |
| 持久锁定按钮 | 需二次确认后生效 |
| 解锁按钮 | 权限校验后可操作（仅本人或 admin） |

#### 13.2 逻辑层

**核心文件**：`/@/components/UserOccupy/useUserOccupy.ts`

| 功能点 | 说明 |
|---|---|
| `initOccupy` | 初始化 MQTT 连接，订阅 `CANCELOCCUPY` 和 `CLEAN_CACHE` 主题 |
| `loadOccupyInfo` | 轮询查询占用信息，间隔自适应 |
| `occupy` | 节流方式占用页面，开启续租定时器 |
| `cancelOccupy` | 释放占用，销毁续租定时器 |
| `lock` / `unlock` | 持久锁定 / 解锁（仅本人或 admin 可操作） |
| MQTT Will 消息 | 浏览器关闭时自动释放占用 |
| `CLEAN_CACHE` 指令 | 接收强制刷新指令（附时间戳重载） |
| `unlockAvailable` | 计算属性：当前用户是否有解锁权限 |

> ⚠️ **跨包问题**：`useUserOccupy` 引用了 `@mobile/utils/mqtt/web`，须迁移至 Web 通用层。

---

### 模块 14 — Store 层

| Store | 功能点 |
|---|---|
| `query store` | URL 参数解析（`pid` / `category` / `platform`），设计器全局参数单一来源 |
| `user store` | 用户身份（`userId` / `username`），用于锁定权限判断、LO 操作记录 |
| `pathQuery store` | 保存 / 预览时构造跳转 URL（携带 `aid`、`environment` 等参数） |
| `app-info store` | 应用级插件配置，`loadPageInfo` 中用于插件加载 |

---

### 模块 15 — 工具方法 & 类型层

| 文件/目录 | 说明 |
|---|---|
| `/@/utils/transform-js` | JS 代码字符串 → `methodMap`（函数名 → AST 描述），供作用域调用 |
| `schema/utils.ts` | Schema 构建工具（PropEditor / StyleEditor 快速生成方法） |
| `utils/`（本地） | 组件工具方法（`ComponentUtils.getWidgetsToolkit` 等） |
| `types/` | TS 类型定义（按平台分 web / mobile / pad 子目录） |
| `interface/` | 接口定义 |
| `enum/` | 枚举定义（`designer.ts` / `panel.ts` / `toolkit.ts` / `widget.ts`） |
| `constant/` | 全局常量（Toolkit Tab 枚举、Panel 类型枚举等） |

---

## 三、依赖关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                    designer-view（外壳 & 导航）                   │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐  │
│  │ view-info    │  │ view-content      │  │ Header 操作区    │  │
│  │ (基本信息)   │  │ (工作区布局)       │  │ (搜索/锁定/预览)│  │
│  └──────┬───────┘  └─────┬─────────────┘  └──────────────────┘  │
│         │                │                                       │
│         │    ┌───────────┼───────────────┐                       │
│         │    │           │               │                       │
│  ┌──────┴──┐ ┌──────┐ ┌─┴────────┐ ┌───┴────────┐              │
│  │Toolkit  │ │Stage │ │  Panel   │ │DnD Preview │              │
│  │(工具箱) │ │(画布)│ │(属性面板)│ │(拖拽预览)  │              │
│  └────┬────┘ └──┬───┘ └────┬─────┘ └────────────┘              │
└───────┼─────────┼──────────┼────────────────────────────────────┘
        │         │          │
┌───────┴─────────┴──────────┴────────────────────────────────────┐
│                   Hook 层（核心业务逻辑）                          │
│  ┌─────────────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐ │
│  │  useDesigner    │ │ usePage  │ │ useScope   │ │ useMitt   │ │
│  │  (1186行)       │ │          │ │            │ │           │ │
│  └────────┬────────┘ └─────┬────┘ └─────┬──────┘ └───────────┘ │
│  ┌────────┴────────┐       │             │                      │
│  │useSelectedWidget│  ┌────┴──────┐  ┌───┴──────────┐          │
│  │                 │  │useToolkit │  │usePropEditor │          │
│  └─────────────────┘  └───────────┘  └──────────────┘          │
└───────┬─────────────────────┬───────────────────────────────────┘
        │                     │
┌───────┴─────────┐   ┌──────┴──────────────────────────────┐
│ Controller 层   │   │         Schema 注册中心              │
│ Controller      │   │  web/ mobile/ pad/ field/ modal/    │
│ State + Hooks   │   │  PropEditors/StyleEditors/Events... │
└────────┬────────┘   └──────────────────────────────────────┘
         │
┌────────┴────────────────────────────────────────────────────────┐
│                     基础层 (packages)                             │
│  @gct/runtime  │  @gct/runtime-web-next  │  @gct/runtime-web   │
│  @gct-paas/core  │  @gct-paas/design                           │
└─────────────────────────────────────────────────────────────────┘
         │
┌────────┴────────────────────────────────────────────────────────┐
│                    外部依赖                                       │
│  Store 层（query/user/pathQuery/app-info）                       │
│  API 层（/@/apis/gct-apaas/* 三端六类接口）                       │
│  协作锁（useUserOccupy + MQTT）                                  │
│  工具方法（transform-js / ComponentUtils / ...）                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、跨包依赖问题

| 问题 | 影响 | 建议 |
|---|---|---|
| `useUserOccupy → @mobile/utils/mqtt/web` | Web 项目依赖 mobile 包，阻断 Web 包独立发布 | 将 MQTT 工具上移至 `@gct-paas/core` 或新建 `@gct-paas/mqtt` 通用包 |
| `useDesigner` 1186 行单体 | 职责过重，改动风险高，多人协作冲突频繁 | 按功能分组拆分为 5-8 个子 hook |
| 三平台条件分支散布 | 各 hook / 组件内大量 `if (platform === ...)` | 抽象平台策略层，各端实现独立 |
| Schema 与 Hook 循环引用 | `useSelectedWidget` 依赖 Schema，Schema 的 `BeforeCreate` 依赖 hook | 通过注册表模式解耦 |

---

## 五、拆分优先级

| 优先级 | 目标 | 原因 | 预估影响范围 |
|---|---|---|---|
| **P0** | `useDesigner.ts` 拆分为子 hook | 1186 行单体，风险最高，阻塞其他拆分 | 全局 |
| **P0** | MQTT 工具上移出 `@mobile` 包 | 跨包污染，阻断 Web 包独立发布 | 协作锁模块 |
| **P1** | DnD 系统提取为独立 package | 自包含度高，无业务耦合 | `designer/components/vue3-dnd-*` |
| **P1** | Schema 注册中心接口形式化 | 三平台均依赖，稳定后可并行拆分各端 | `schema/` 全目录 |
| **P1** | Controller 层接口扩展 | 扩展 `@gct-paas/design` 覆盖 Hooks/State | Controller 三文件 |
| **P2** | 画布 Stage 按端隔离 | 减少三端条件判断 | `stage/` 目录 12+ 文件 |
| **P2** | `_kit` 业务套件独立 package | 行业定制与核心解耦 | `_kit/` 三个套件 |
| **P2** | 工具箱 Toolkit 模块化 | 各子面板独立注册，支持插件扩展 | `toolkits/` 目录 |
| **P3** | `prop-editor` / `style-editor` 提取为通用编辑器库 | 可跨多个设计器项目复用 | `panels/prop-editor/` + `style-editor/` |
| **P3** | Store 层独立化 | 消除设计器对主应用 Store 的直接引用 | 4 个 store 模块 |
| **P3** | 类型 / 枚举 / 常量集中到共享包 | 消除重复定义 | `types/` + `enum/` + `constant/` |

> 待办清单详见 [PAGE_DESIGNER_REFACTOR_TODO.md](./PAGE_DESIGNER_REFACTOR_TODO.md)
