# React 宿主 + 当前项目 Vue 设计器子应用接入设计

## 目标

在 `gmp-platform` 的数据模块 - 模板建模 - 表单模板页面中，保留当前 React 列表页、版本行“设计”入口和版本保存接口，同时把从 `paas-main-front` 迁入当前项目的 Vue 设计器作为子应用嵌入到当前页内打开。设计器的视觉、布局和交互以迁入后的 Vue 设计器为准，React 只承担宿主、权限、上下文传递、保存回写和关闭刷新。

## 结论

当前不继续用 React 自研设计器作为最终方案。原因不是实现难度，而是它与原设计器在画布语义、组件能力和页面组织上差距太大，继续补会持续偏离交付目标。

首选方案是：

- React 宿主保留在 `gmp-platform`
- Vue 设计器源码迁入 `gmp-platform/frontend/vendor/online-form-designer`
- 两边通过稳定桥接协议交换加载、保存、关闭、脏状态和消息通知
- 后续设计器改动只允许改当前项目里的 vendor 副本，不再改外部 `paas-main-front`

## 当前事实

- React 侧已有模板列表、版本列表、审计和 `saveFormTemplateVersionDesign` 接口。
- 当前版本设计保存接口为 `PUT /master-data/template-modeling/form-templates/{id}/versions/{versionId}/design`，字段是 `modelDesignJson`、`canvasDesignJson`、`workflowDesignJson`。
- 迁入的在线表单设计器入口在 `gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form`，实际设计页是 `views/integration/apaas_dp/designer/apaas-dp-print.vue`。
- Vue 设计器内部通过 `usePrint()` 和 `useSpreadSheet()` 处理加载、保存、画布和分页。
- Vue 项目已经带有 `wujie` / `wujie-vue3` 依赖，适合做子应用承载。

## 范围

### 包含

- 版本行“设计”按钮打开嵌入式设计器。
- Vue 设计器在当前页内打开，不跳新页。
- 设计器关闭后回到列表页并刷新版本数据。
- 保存时回写到当前模板版本。
- 基础脏状态提示和关闭确认。

### 不包含

- 不重写 Vue 设计器为 React。
- 不把 OnlyOffice 再引回方案。
- 不修改迁入 Vue 设计器的大量业务语义。
- 不再把外部 `paas-main-front` 作为运行依赖或改动目标。
- 不在这一轮重做导入解析算法。

## 架构

### 1. React 宿主层

职责：

- 接收模板行、版本行、权限和保存能力。
- 打开全屏或大尺寸承载容器。
- 提供关闭、保存、刷新、脏状态提示。
- 把当前模板版本上下文和后端 API 基址传给子应用。

React 宿主不负责画布编辑逻辑。

### 2. Vue 设计器子应用层

职责：

- 复用当前项目 vendor 副本中的设计器页面、工具栏、分页缩略图、画布、属性面板和导入逻辑。
- 接收宿主传入的模板元数据和版本元数据。
- 通过桥接协议请求加载设计数据。
- 通过桥接协议请求保存当前设计数据。

### 3. 数据桥接层

职责：

- 定义宿主与子应用的消息协议。
- 统一加载、保存、错误、脏状态和关闭事件。
- 负责把 Vue 设计器的输出映射到当前模板版本保存接口。

## 数据流

### 打开设计器

1. 用户在版本行点击“设计”。
2. React 宿主打开设计器容器。
3. 宿主把 `templateId`、`versionId`、`templateName`、`versionLabel`、`token`、`apiBaseUrl` 等上下文传给子应用。
4. Vue 子应用初始化后主动请求设计数据。

### 加载设计数据

推荐两种加载方式，首选 A。

- A. 宿主直接调用当前模板版本接口拿数据，再把标准化后的设计 JSON 传给 Vue 子应用。
- B. 子应用通过桥接请求宿主加载数据。

首选 A，因为加载链路更可控，也便于做数据适配和错误兜底。

### 保存设计数据

1. Vue 设计器在子应用中触发保存。
2. 子应用把当前设计快照通过桥接发给宿主。
3. React 宿主把快照写回 `saveFormTemplateVersionDesign`。
4. 保存成功后宿主通知子应用更新脏状态，关闭后刷新列表和版本数据。

## 关键接口

### 宿主传给子应用

```ts
type TemplateDesignerHostContext = {
  templateId: string | number;
  versionId: string | number;
  templateName: string;
  versionLabel: string;
  apiBaseUrl: string;
  authToken: string;
  tenantId?: string;
  readOnly?: boolean;
};
```

### 子应用发给宿主

```ts
type TemplateDesignerHostEvent =
  | { type: 'ready' }
  | { type: 'dirty-change'; dirty: boolean }
  | { type: 'save-request'; payload: { modelDesignJson: string; canvasDesignJson: string; workflowDesignJson: string } }
  | { type: 'close-request' }
  | { type: 'error'; message: string };
```

### 宿主发给子应用

```ts
type TemplateDesignerBridgeMessage =
  | { type: 'init'; context: TemplateDesignerHostContext; design: unknown }
  | { type: 'save-success' }
  | { type: 'save-error'; message: string }
  | { type: 'close' };
```

## 数据适配

当前 React 自研草案使用的 JSON 结构和 Vue 设计器结构不一致，不能直接互相覆盖。

适配原则：

- 新版本优先保存 Vue 设计器的原生设计数据。
- React 侧只保存必要的版本字段，不改动历史版本的其他业务字段。
- 旧自研草案数据若无法可靠转换，不做强制回填，避免误损。

## 交互边界

- 页面列表、版本列表、审计面板继续由 React 管。
- 画布内的拖拽、导入、分页、缩略图、属性编辑都由 Vue 管。
- 关闭按钮、保存按钮、保存失败提示、脏状态提示由宿主管。
- Vue 子应用不要直接操作 React Router。

## 技术路线

首选实现方式：

- 使用 iframe 先把当前项目 vendor 副本中的 Vue 设计器挂到 React 页面中。
- 子应用按当前项目内的独立 vendor 应用构建和部署。
- React 侧只维护一个稳定的容器和桥接层。

备选方式：

- 直接 iframe 嵌入。

如果后续需要更深度的生命周期控制，再把当前 vendor 副本升级为 `wujie` 子应用；升级仍然只改当前项目内的副本。

## 验收标准

- 点击版本行“设计”后，在当前页内打开 Vue 设计器。
- 设计器的页面布局、分页缩略图、工具栏和画布沿用 Vue 设计器。
- 保存能写回当前版本接口。
- 关闭后列表刷新，版本状态保持正确。
- 不再依赖 React 自研设计器作为最终交付物。
- 不再默认依赖或修改外部 `paas-main-front` 目录。
