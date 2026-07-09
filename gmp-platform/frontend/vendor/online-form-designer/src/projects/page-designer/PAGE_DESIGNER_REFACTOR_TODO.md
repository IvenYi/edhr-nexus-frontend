# Page Designer 重构待办清单

> 关联文档：[PAGE_DESIGNER_REFACTOR_PLAN.md](./PAGE_DESIGNER_REFACTOR_PLAN.md)
>
> 完成后在 `[ ]` 中填入 `x` 标记为 `[x]`。

---

## P0 — 阻塞级（必须最先完成）

### useDesigner 拆分

- [ ] 拆出 `usePageJson` — 页面 JSON 管理（pageJson / setPageJson / transformPageJson / savePageJsonSnapshot / isModified）
- [ ] 拆出 `useDesignerSave` — 保存与持久化（save / validateWidgets / buildRuntimeJson）
- [ ] 拆出 `useDesignerPreview` — 预览（preview / previewSandbox / getDataList / historyPreview）
- [ ] 拆出 `useDesignerHistory` — 历史版本管理（loadPageDesignHistoryList / loadPageDesignHistoryInfo / recover / deleteHistory）
- [ ] 拆出 `useOperationHistory` — 操作历史/撤销重做（emitCache / undoOrRestore）
- [ ] 拆出 `useModalDesign` — 弹框设计状态（setModalDesignState / getModalInfo / setSubTableModalDesignState / 工作流弹框 / modalBody / modalFooter）
- [ ] 拆出 `useWidgetQuery` — 组件集合查询（allWidget / allFormWidget / allSubTableWidget / allListWidget 等）
- [ ] 组合层 `useDesigner` 重构为薄包装，聚合上述子 hook
- [ ] 验证所有引用 `useDesigner` 的地方功能正常

### MQTT 工具解耦

- [ ] 将 `@mobile/utils/mqtt/web` 迁移至 `@gct-paas/core` 或新建 `@gct-paas/mqtt` 通用包
- [ ] 更新 `useUserOccupy` 的 import 路径
- [ ] 验证协作锁功能（占用 / 释放 / MQTT 通知）

---

## P1 — 核心架构拆分

### DnD 系统独立

- [ ] 创建独立 package `@gct-paas/designer-dnd`（或同级目录）
- [ ] 迁移 `vue3-dnd-container`
- [ ] 迁移 `vue3-dnd-item`
- [ ] 迁移 `vue3-dnd-item-actions`
- [ ] 迁移 `vue3-dnd-item-hover-title`
- [ ] 迁移 `vue3-dnd-highlighter`
- [ ] 迁移 `vue3-dnd-drop-line`
- [ ] 迁移 `vue3-dnd-material-item`
- [ ] 迁移 `vue3-dnd-item-preview`
- [ ] 定义 DnD 包的公共 API（导出 / 类型）
- [ ] 更新 page-designer 中的引用路径
- [ ] 验证拖拽全流程（拖入 / 排序 / 预览 / 高亮 / 操作栏）

### Schema 注册中心形式化

- [ ] 定义统一 Schema 注册接口（PropEditors / StyleEditors / Events / Callback / DesignerConfig 等）
- [ ] 重构 `schema/index.ts` 使用注册表模式
- [ ] 拆分 Web 平台 Schema 为独立注册单元
- [ ] 拆分 Mobile 平台 Schema 为独立注册单元
- [ ] 拆分 Pad 平台 Schema 为独立注册单元
- [ ] 拆分通用 Schema（common / common-config / field / modal）
- [ ] 验证三端组件 Schema 注册 + 属性面板渲染

### Controller 层接口扩展

- [ ] 扩展 `@gct-paas/design` 中 `IDesignerController` 接口覆盖新方法
- [ ] 扩展 `IDesignerState` 接口，移除 deprecated 字段
- [ ] 扩展 `IDesignerHooks` 接口
- [ ] `DesignerController` 实现对齐新接口
- [ ] `DesignerState` 清理废弃字段
- [ ] 验证 Controller 注入和使用链路

---

## P2 — 模块隔离

### 画布 Stage 按端隔离

- [ ] Web 画布组件独立（stage-canvas / stage-modal-canvas / stage-sub-table-modal-canvas）
- [ ] Mobile 画布组件独立（stage-mobile-canvas / stage-mobile-modal-canvas / stage-mobile-sub-table-modal-canvas）
- [ ] Pad 画布组件独立（stage-pad-canvas / stage-pad-modal-canvas / stage-pad-sub-table-modal-canvas）
- [ ] 工作流画布独立（stage-wf-nodes-modal-canvas / stage-workflow-modal-canvas）
- [ ] `stage.vue` 重构为平台策略路由
- [ ] `stage-header.vue` 抽象通用接口
- [ ] 验证三端画布渲染 + 模态画布切换

### 业务套件独立

- [ ] `kit-eDHR` 提取为独立 package
- [ ] `kit-QMS` 提取为独立 package
- [ ] `kit-medpro` 提取为独立 package
- [ ] 定义套件注册接口（组件 / Schema / 工具箱分组）
- [ ] 验证套件组件在工具箱中正常显示和拖入

### 工具箱 Toolkit 模块化

- [ ] `toolkit.vue` 重构为插件化 Tab 注册机制
- [ ] `toolkit-widgets.vue` 独立模块
- [ ] `toolkit-field.vue` + `toolkit-field-item.tsx` 独立模块
- [ ] `toolkit-outline.vue` 独立模块
- [ ] `toolkit-js.vue` 独立模块
- [ ] `toolkit-css.vue` 独立模块
- [ ] `toolkit-modal.vue` 独立模块
- [ ] `toolkit-template.vue` 独立模块
- [ ] 验证各 Tab 切换 / 固定 / 钉住 / 宽度拖拽

---

## P3 — 通用化 & 收尾

### 属性/样式编辑器通用化

- [ ] `prop-editor/basic/` 提取为通用编辑器组件
- [ ] `prop-editor/advanced/` 提取为通用编辑器组件
- [ ] `prop-editor/field/` 提取为通用编辑器组件
- [ ] `prop-editor/other/` 提取为通用编辑器组件
- [ ] `style-editor/` 提取为通用样式编辑器组件
- [ ] 定义编辑器组件公共 API
- [ ] 验证属性面板 / 样式面板正常渲染和双向绑定

### Store 独立化

- [ ] `query store` 迁移至设计器内部或抽象为参数接口
- [ ] `user store` 抽象为用户信息接口
- [ ] `pathQuery store` 迁移至设计器内部
- [ ] `app-info store` 抽象为应用配置接口
- [ ] 验证保存 / 预览 / 锁定等依赖 Store 的流程

### 类型 / 枚举 / 常量集中

- [ ] `types/` 合并至共享类型包
- [ ] `enum/` 合并至共享类型包
- [ ] `constant/` 合并至共享类型包
- [ ] `interface/` 合并至共享类型包
- [ ] 更新全部引用路径
- [ ] 验证 TypeScript 编译无错误

---

## 功能模块细项

### 外壳 & 导航层

- [ ] `designer-view.tsx` — 步骤流转控制
- [ ] `designer-view.tsx` — iframe 回调通信
- [ ] `designer-view.tsx` — Header 操作区（预览 / 沙箱预览）
- [ ] `designer-view.tsx` — 预览防重复点击
- [ ] `designer-view.tsx` — 保存并退出（双路保存）
- [ ] `designer-view.tsx` — 离开保存提示（Popover）
- [ ] `designer-view.tsx` — 步骤点击跳转（含校验确认）
- [ ] `designer-view.tsx` — 协作锁生命周期管理
- [ ] `designer-view.tsx` — 新版设计器提示横幅
- [ ] `designer-view.tsx` — 平台检测与 `gct.designPlatform` 设置
- [ ] `designer-view.tsx` — Schema 初始化
- [ ] `designer-view.tsx` — Controller provide 注入
- [ ] `designer-view.tsx` — 方法映射刷新（modalInfo / get-schema-code）

### 页面基本信息

- [ ] `designer-view-info.tsx` — 三平台差异表单
- [ ] `designer-view-info.tsx` — 分类异步加载 + 自动兜底
- [ ] `designer-view-info.tsx` — Key 前缀锁定 + 校验（长度 / 格式 / 重复）
- [ ] `designer-view-info.tsx` — 页面创建（POST）
- [ ] `designer-view-info.tsx` — 页面更新（PUT）
- [ ] `designer-view-info.tsx` — 一键复制 Key
- [ ] `designer-view-info.tsx` — expose 对外暴露接口

### 工作区布局

- [ ] `designer-view-content.tsx` — 三栏布局
- [ ] `designer-view-content.tsx` — 工具箱宽度拖拽
- [ ] `designer-view-content.tsx` — 固定 / 悬浮布局模式
- [ ] `designer-view-content.tsx` — hidden 多页签支持
- [ ] `designer-view-content.tsx` — 拖拽全局预览层

### 协作锁系统

- [ ] `design-view-lock/` — 占用人信息展示
- [ ] `design-view-lock/` — 持久锁定按钮（二次确认）
- [ ] `design-view-lock/` — 解锁按钮（权限校验）
- [ ] `useUserOccupy` — initOccupy（MQTT 连接 + 主题订阅）
- [ ] `useUserOccupy` — loadOccupyInfo（轮询 + 自适应间隔）
- [ ] `useUserOccupy` — occupy（节流 + 续租定时器）
- [ ] `useUserOccupy` — cancelOccupy（释放 + 销毁定时器）
- [ ] `useUserOccupy` — lock / unlock
- [ ] `useUserOccupy` — MQTT Will 消息（自动释放）
- [ ] `useUserOccupy` — CLEAN_CACHE 指令（强制刷新）

### Hook 层

- [ ] `usePage` — 页面数据加载（三平台）
- [ ] `usePage` — 老数据兼容
- [ ] `usePage` — 插件加载
- [ ] `usePage` — 锁定/解锁
- [ ] `usePage` — 初始化串联调度
- [ ] `useScope` — 作用域路由 + scopeData 分发
- [ ] `useScope` — scopeJs / scopeCss 透明代理
- [ ] `useMitt` — 单例事件总线
- [ ] `useSelectedWidget` — 选中态管理（widget / modal / hover）
- [ ] `useSelectedWidget` — 祖先链追踪
- [ ] `useSelectedWidget` — 编辑器描述聚合
- [ ] `useSelectedWidget` — 表单容器聚焦
- [ ] `useWidget` — 选中态判断 + 遮罩控制
- [ ] `useStyle` — wrapperStyle / wStyle 计算
- [ ] `useStyle` — 移动端 px→vw 转换
- [ ] `useToolkit` — 组件分类生成 + 上下文切换
- [ ] `useToolkit` — 套件组件扩展
- [ ] `useToolkit` — 字段工具箱
- [ ] `usePropEditor` — 链式路径双向绑定 + 历史写入

### 平台组件注册

- [ ] `pcModule.ts` — Web 端组件异步注册
- [ ] `mobileModule.ts` / `mobileModuleDesign.ts` — Mobile 端组件注册
- [ ] `padModule.ts` / `padModuleDesign.ts` — Pad 端组件注册
- [ ] `_kit/web-render-index.ts` — Web 渲染入口
- [ ] `_kit/mobile-render-index.ts` — Mobile 渲染入口
- [ ] `_kit/pad-render-index.ts` — Pad 渲染入口

---

## 最终验收

- [ ] 全量 TypeScript 编译通过
- [ ] 全量 ESLint 检查通过
- [ ] Web 端页面设计器完整流程验证（新建 → 编辑 → 保存 → 预览）
- [ ] Mobile 端页面设计器完整流程验证
- [ ] Pad 端页面设计器完整流程验证
- [ ] 协作锁功能验证（占用 / 释放 / 锁定 / 解锁）
- [ ] 拖拽全流程验证（物料拖入 / 排序 / 嵌套 / 操作栏）
- [ ] 历史版本功能验证（查看 / 恢复 / 删除 / 预览）
- [ ] 撤销/重做功能验证
- [ ] 弹框设计功能验证（普通 / 子表 / 工作流）
- [ ] 业务套件功能验证（eDHR / QMS / medpro）
- [ ] 沙箱预览功能验证
