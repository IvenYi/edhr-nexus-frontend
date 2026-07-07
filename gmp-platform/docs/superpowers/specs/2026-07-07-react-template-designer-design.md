# React 模板设计器重构设计

## 1. 背景与目标

当前数据模块下的模板建模页面，子版本数据行上的“设计”按钮打开的是 React 全屏对话框，但内部仍通过 iframe 托管 Vue 设计器。现阶段需要新增一个并行的 React 入口，并以当前项目技术栈在主前端工程内重构一套可持续演进的 React 版模板设计器，为后续直接替换 Vue 设计器做准备。

本次设计目标如下：

- 在模板建模子版本数据行上新增第二个设计入口，保留现有 Vue 设计入口不变。
- 新入口打开 React 版完整三页签设计器，包含建模设计、表单设计、流程设计。
- React 设计器不要求兼容 Vue 设计器已有存量 JSON 结构，可采用新的 React 保存结构。
- 重点建立画布能力的基础设施，包括组件体系、字段体系、绑定关系、属性配置、保存结构。
- 第一版以“完整可用内核 + 有限但闭环的组件/字段集”为边界，不追求一次性复刻 Vue 全量生态。

非目标：

- 不修改现有 Vue 设计器的行为与保存链路。
- 不在本次实现中复刻所有高级组件、插件组件、运行时行为。
- 不要求第一版实现完整自由拖拽与全量快捷键系统。

## 2. 现状分析

### 2.1 当前入口结构

- 页面入口位于 `frontend/src/pages/master-data/TemplateModelingPage.tsx`。
- 子版本行当前已有“设计”按钮，点击后打开 `TemplateDesignerDialog`。
- `TemplateDesignerDialog` 仅负责全屏对话框壳子，内部渲染 `TemplateDesignerHostFrame`。
- `TemplateDesignerHostFrame` 通过 iframe 加载 Vue 设计器，并通过 `postMessage` 与其进行初始化、保存、模拟填报、关闭等消息通信。
- 当前保存接口为 `/master-data/template-modeling/form-templates/{id}/versions/{versionId}/design`，前端保存字段固定为：
  - `modelDesignJson`
  - `canvasDesignJson`
  - `workflowDesignJson`

### 2.2 当前前端技术栈

主前端工程已具备本次实现所需核心技术基础：

- React 18
- TypeScript
- MUI
- Zustand
- React Query
- `@xyflow/react`

因此 React 设计器应直接作为主前端工程的正式模块实现，不进入 `vendor/online-form-designer` 子树，也不引入新的重型编辑器框架。

### 2.3 Vue 设计器可参考结构

现有 Vue 设计器的关键设计思想可抽取为以下几点：

- 工具箱与画布组件由 schema 注册体系驱动，而不是在视图层硬编码。
- 字段体系与组件体系是两套结构，通过字段绑定关联，而不是把字段定义直接写死在组件 props 中。
- 右侧属性面板由 prop-editor 配置驱动，支持默认值、显示条件、联动变更等能力。
- 页面/画布内容本质上是一棵组件树，布局容器与字段组件共享统一节点体系。

React 版需要复刻的是这些结构性思想，而不是照搬 Vue 文件组织或语法层实现。

## 3. 总体方案

### 3.1 并行接入策略

模板建模页在子版本数据行操作列新增第二个按钮：

- 保留现有“设计”按钮，继续打开当前 Vue 设计器。
- 新增“React设计”按钮，打开新的 React 版模板设计器。

这样可以保证：

- Vue 设计器现有使用链路不受影响。
- React 设计器可以独立开发、联调和验证。
- 后续具备平滑切换默认入口的条件。

### 3.2 React 设计器目录

React 设计器新模块位于：

`frontend/src/pages/master-data/template-designer-react/`

建议结构：

```text
template-designer-react/
  index.ts
  TemplateDesignerReactDialog.tsx
  TemplateDesignerReactShell.tsx
  components/
  tabs/
    model/
    canvas/
    workflow/
  store/
  registry/
  schemas/
  types/
  utils/
```

边界要求：

- `Dialog` 负责全屏对话框宿主。
- `Shell` 负责顶部栏、页签、保存、关闭、脏状态提醒。
- `tabs/model` 负责字段模型编辑。
- `tabs/canvas` 负责工具箱、画布、属性面板。
- `tabs/workflow` 负责流程节点与连线编辑。
- `store` 负责统一状态与操作。
- `registry` 负责组件/字段/属性 schema 注册。
- `types` 与 `schemas` 负责持久化结构与编辑器元模型。

### 3.3 单一内核方案

React 版采用单一设计器内核，不拆成三个互相独立的子系统。

单一内核原则：

- 一个统一的 `TemplateDesignerDocument` 作为设计器唯一事实来源。
- 建模、画布、流程三页签均围绕同一个文档工作。
- 保存时从同一个文档切片导出到三个保存字段。

这样做的原因：

- 后续可直接替换 Vue，而不是保留三套状态同步逻辑。
- 字段变更可以同步驱动画布绑定和流程引用校验。
- 属性编辑、脏状态、撤销重做、校验逻辑可以复用。

## 4. 核心数据结构

### 4.1 设计器文档

统一文档建议结构：

```ts
interface TemplateDesignerDocument {
  meta: {
    schema: 'edhr-template-designer-react';
    version: 1;
    templateId: string | number;
    versionId: string | number;
    templateName: string;
    versionLabel: string;
  };
  model: ModelDesignState;
  canvas: CanvasDesignState;
  workflow: WorkflowDesignState;
}
```

### 4.2 建模结构

建模部分至少包含：

- 字段分组
- 字段定义
- 字段类型
- 必填、只读、默认值、校验规则等基础属性
- 枚举选项、引用关系、子表字段等类型特定配置

建议结构：

```ts
interface ModelField {
  id: string;
  code: string;
  name: string;
  type: string;
  groupId?: string;
  required?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  config: Record<string, unknown>;
}
```

### 4.3 画布结构

画布部分采用组件树结构：

```ts
interface CanvasNode {
  id: string;
  type: string;
  parentId?: string | null;
  children?: CanvasNode[];
  props: Record<string, unknown>;
  style: Record<string, unknown>;
  bindings?: {
    fieldId?: string;
    fieldIds?: string[];
  };
}
```

画布本身需至少支持：

- 页面级配置
- 根容器与子节点树
- 节点选中
- 容器嵌套
- 基础排序
- 节点绑定字段

### 4.4 流程结构

流程部分采用节点图结构，使用现有 `@xyflow/react`：

```ts
interface WorkflowDesignState {
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
  config: Record<string, unknown>;
}
```

第一版重点是建立基本节点、连线与配置能力，不复刻 Vue 全量流程设计细节。

## 5. 状态管理设计

使用单一 Zustand store，并按 slice 切分职责：

- `documentSlice`
  - 当前文档
  - 加载/重置
  - 保存快照
- `uiSlice`
  - 当前页签
  - 当前选中的字段/节点
  - 面板开关状态
- `modelSlice`
  - 字段增删改
  - 字段分组管理
  - 字段校验
- `canvasSlice`
  - 组件树管理
  - 节点插入、删除、移动、更新
  - 字段绑定
- `workflowSlice`
  - 节点与连线管理
  - 节点配置管理
- `historySlice`
  - dirty 状态
  - undo/redo 预留

关键约束：

- 组件节点不直接存储字段完整定义，只引用 `fieldId`。
- 字段定义只存在于建模 slice。
- 通过 selector 组合出画布渲染与属性面板所需视图数据。

## 6. 组件体系设计

### 6.1 组件注册表

React 版组件体系采用注册表驱动，避免巨型 `switch`。

建议协议：

```ts
interface DesignerComponentDefinition {
  type: string;
  label: string;
  category: 'form' | 'layout' | 'data' | 'button' | 'process';
  icon?: string;
  createDefaultNode: () => CanvasNode;
  canAcceptChildren?: (parent: CanvasNode, child: CanvasNode) => boolean;
  propSchema: PropertySchemaItem[];
  renderDesigner: React.ComponentType<DesignerRendererProps>;
}
```

作用：

- 左侧组件工具箱由注册表渲染。
- 中央画布节点渲染由注册表分发。
- 右侧属性面板根据 `propSchema` 自动生成。

### 6.2 首批画布组件范围

第一版实现以下组件：

字段类组件：

- input
- textarea
- inputnumber
- inputdouble
- radio
- checkbox
- select
- switch
- datepicker
- datetimepicker
- timepicker
- userpicker
- department
- readonlycmp

布局类组件：

- form
- grid
- grid-col
- layout-container
- left-right-columns
- tabs
- divider

容器类组件：

- sub-table
- button-container
- bottom-button-container

暂不纳入首版运行能力的组件：

- custom-code
- iframe
- 插件化 kit 组件
- 复杂流程按钮类组件

这些组件在注册体系中预留扩展位，但第一版不交付完整能力。

## 7. 字段体系设计

### 7.1 字段注册表

字段同样采用注册表驱动：

```ts
interface FieldTypeDefinition {
  type: string;
  label: string;
  defaultField: () => ModelField;
  compatibleComponents: string[];
  configSchema: PropertySchemaItem[];
}
```

作用：

- 建模页根据字段类型生成默认字段。
- 画布绑定字段时根据 `compatibleComponents` 限制可选范围。
- 字段配置面板根据 `configSchema` 自动生成。

### 7.2 首批字段类型

第一版实现：

- input
- textarea
- inputnumber
- inputdouble
- radio
- checkbox
- select
- switch
- datepicker
- datetimepicker
- timepicker
- userpicker
- department
- sub-table
- readonlycmp

该集合覆盖模板建模的基础主路径，并且与 Vue 现有字段 schema 对应度高。

## 8. 属性配置体系设计

右侧属性面板必须 schema-driven。

建议通用协议：

```ts
interface PropertySchemaItem {
  key: string;
  label: string;
  editor: string;
  defaultValue?: unknown;
  visible?: (context: PropertySchemaContext) => boolean;
  disabled?: (context: PropertySchemaContext) => boolean;
  options?: (context: PropertySchemaContext) => Array<{ label: string; value: unknown }>;
  validate?: (value: unknown, context: PropertySchemaContext) => string | null;
  onChangeEffect?: (value: unknown, context: PropertySchemaContext) => void;
}
```

首批必须覆盖的配置：

通用配置：

- 标题
- 字段编码
- 占位文案
- 必填
- 只读
- 隐藏
- 默认值
- 校验规则

布局配置：

- 宽度
- 列宽
- 对齐
- 边距
- 内边距
- 标签宽度

选择项配置：

- 枚举选项
- 多选
- 文本/值映射

表格配置：

- 列定义
- 字段绑定
- 是否允许新增/编辑/删除

容器配置：

- tabs 页签
- grid 列
- 按钮容器布局

## 9. 页面交互设计

### 9.1 设计器壳子

React 设计器全屏对话框需提供：

- 返回
- 保存
- 标题与版本展示
- 三页签切换
- 脏状态关闭确认

整体视觉参考现有 `TemplateDesignerHostFrame` 顶部结构，保持操作习惯一致。

### 9.2 三页签能力

建模设计：

- 字段列表
- 字段分组
- 字段新增、编辑、删除
- 字段类型切换与配置

表单设计：

- 左侧字段/组件工具箱
- 中央画布
- 右侧属性面板
- 点击插入组件
- 组件选中与属性编辑
- 字段绑定
- 容器内基础排序

流程设计：

- 基础节点
- 连线
- 右侧节点属性面板
- 与字段/组件的必要引用能力

### 9.3 第一版交互边界

第一版必须支持：

- 左侧字段与组件面板
- 点击插入组件
- 节点选中
- 属性编辑
- 字段绑定
- 容器内基本排序
- 保存
- 重新打开恢复
- dirty 提示

第一版暂不强求：

- 完整自由拖拽
- 全量快捷键
- 全量撤销重做命令
- Vue 全量高级组件生态

## 10. 保存与加载设计

### 10.1 保存协议

继续复用现有后端保存接口，不新增后端接口。

保存时仍写入：

- `modelDesignJson`
- `canvasDesignJson`
- `workflowDesignJson`

但这三个字段中的数据结构改为 React 自有 schema，并统一带版本头。

建议结构：

```ts
interface ReactTemplateDesignerPersisted<T> {
  schema: 'edhr-template-designer-react';
  version: 1;
  payload: T;
}
```

### 10.2 加载策略

由于本次不要求兼容 Vue 存量 JSON，加载策略明确如下：

- 若对应字段为空，则初始化 React 默认文档。
- 若字段中存在 React schema，则按 React 结构恢复。
- 若字段中存在旧 Vue 结构，则视为 React 设计器不可编辑状态，可提示“当前版本尚无 React 设计数据，请从空白状态开始”，但不尝试自动迁移。

这样可以避免在本次引入高风险的数据迁移逻辑。

## 11. 实施顺序

建议按以下步骤落地：

1. 模板建模页新增 React 入口按钮。
2. 新增 React 全屏设计器对话框与壳子。
3. 落 `types`、持久化 schema、Zustand store。
4. 实现建模页签。
5. 实现组件注册表、字段注册表、属性 schema 解释器。
6. 实现表单设计页签：
   - 左侧工具箱
   - 中央画布
   - 右侧属性面板
7. 接首批字段类型与画布组件。
8. 实现流程页签，基于 `@xyflow/react` 提供基础节点与连线。
9. 接入保存、加载、脏状态提示。
10. 补充验证脚本与构建验证。

## 12. 验证方案

本次实现完成后至少需要以下验证：

- 页面可正常打开模板建模页并看到新入口按钮。
- 点击 React 入口可打开全屏设计器。
- 三页签可切换。
- 可新增字段、修改字段配置并持久化。
- 可在画布插入首批组件、绑定字段、修改属性并持久化。
- 流程页可新增基础节点与连线并持久化。
- 保存后重新打开可恢复 React 设计数据。
- `npm run build` 通过。
- 如有必要，新增针对模板设计页的最小页面验证脚本。

## 13. 风险与控制

### 13.1 范围失控风险

Vue 现有组件与字段数量较大，若首版追求全量复刻，将显著拉长交付周期并降低稳定性。

控制方式：

- 严格限定首批字段与组件集。
- 先做闭环，再扩容。

### 13.2 架构退化风险

若首版只做 UI 壳子，后续会陷入大量返工。

控制方式：

- 第一版必须建立单一文档、注册表、属性 schema、字段绑定这四个基础设施。

### 13.3 数据割裂风险

React 与 Vue 设计器并行存在，且本次不兼容存量 JSON，容易产生版本差异。

控制方式：

- 保留 Vue 入口不动。
- React 设计数据带 schema 头明确区分。
- 在 React 入口中明确提示当前数据来源与限制。

## 14. 结论

本次最优方案是在主前端工程内新增一套独立的 React 模板设计器模块，采用单一文档内核与注册表驱动结构，先交付完整三页签壳子与有限但闭环的字段/组件/配置能力。该方案能够在不打断现有 Vue 设计器链路的前提下，为后续直接替换建立稳定基础。
