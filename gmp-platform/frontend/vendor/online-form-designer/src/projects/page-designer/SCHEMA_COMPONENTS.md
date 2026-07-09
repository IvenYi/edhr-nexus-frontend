# 页面设计器三端组件清单

> 基于 `src/projects/page-designer/src/schema/` 目录分析生成，统计范围：`field`、`modal`、`mobile`、`pad`、`web` 五端。

---

## 汇总统计

| 端 | 分类数 | 组件总数 |
|----|--------|---------|
| field | 3 | **58 * 3(三端) = 174** |
| modal | 1 | **4** |
| mobile | 7 | **44** |
| pad | 5 | **37** |
| web | 8 | **58** |
| **合计** | — | **317** |

---

## Field 字段组件（58 个）

> 字段组件为表单字段、搜索字段的属性配置 Schema，分为 `form`（表单字段）和 `search`（搜索字段）两类，以及根目录下的通用动态表单组件。

### 根目录 — 动态表单组件（4 个）

| 组件标题 | 组件类型 |
|---------|----------|
| 动态表单选项 | `FormComponents.DynamicFormOpts` |
| 动态表单显示方式 | `FormComponents.DynamicFormShowType` |
| 动态表单类型 | `FormComponents.DynamicFormType` |
| 动态表单值 | `FormComponents.DynamicFormValue` |

### form — 表单字段（38 个）

| 组件标题 | 组件类型 |
|---------|----------|
| 汇总 | `agg` |
| 审批流 | `approval-process` |
| 业务流 | `biz-process` |
| 多选 | `checkbox` |
| 公式（表格列） | `data-table-formula` |
| 日期 | `datepicker` |
| 日期时间 | `datetimepicker` |
| 部门 | `department` |
| 单据模板 | `document-template` |
| 动态表格 | `dynamic-table` |
| E-SOP | `e-sop` |
| 电子签名 | `electronic-signature` |
| 公式条件 | `expression-condition` |
| 公式 | `expression` |
| 单行文本 | `input` |
| 小数 | `inputdouble` |
| 数值 | `inputnumber` |
| 标签模板 | `label-template-ref` |
| 标签设计 | `label-template` |
| 在线表单 | `online-form` |
| 打印机 | `printer` |
| 单选 | `radio` |
| 范围人员 | `range-user` |
| 版本组件（只读输入） | `rdo-input` |
| 版本下拉选择 | `rdo-select` |
| 自定义（只读组件） | `readonlycmp` |
| 下拉选择 | `select` |
| 序列号规则 | `serial-rule` |
| 手写签名 | `signature` |
| 子表 | `sub-table` |
| 开关 | `switch` |
| 多行文本 | `textarea` |
| 时间 | `timepicker` |
| 模板树形选择 | `tmpl-tree-select` |
| 事务字段 | `transaction` |
| 附件上传 | `upload-file` |
| 图片上传 | `upload-image` |
| 人员 | `userpicker` |
| 工作流节点 | `workflow-nodes` |

### search — 搜索字段（16 个）

| 组件标题 | 组件类型 |
|---------|----------|
| 业务流搜索 | `SearchBizProcess` |
| 日期搜索 | `SearchDate` |
| 日期时间搜索 | `SearchDateTime` |
| 文本搜索 | `SearchInput` |
| 数字搜索 | `SearchNumberInput` |
| 打印机搜索 | `SearchPrinter` |
| 版本下拉选择搜索 | `SearchRdoSelect` |
| 下拉选择搜索 | `SearchSelect` |
| 部门搜索 | `SearchSelectDepartment` |
| 范围人员搜索 | `SearchSelectRangUser` |
| 字符串/数字混合搜索 | `SearchStringNumberInput` |
| 开关搜索 | `SearchSwitch` |
| 时间搜索 | `SearchTime` |
| 模板树形选择搜索 | `SearchTmplTreeSelect` |
| 事务搜索 | `SearchTransaction` |
| 人员搜索 | `SearchUserSelect` |

---

## Modal 端（4 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 弹窗 | `BuiltinType.MODAL` |
| 弹窗主体（内置） | `BuiltinType.MODAL_BODY` |
| 弹窗底部（内置） | `BuiltinType.MODAL_FOOTER` |
| 工作流节点弹窗 | `BuiltinType.MODAL` |

---

## Mobile 端（44 个）

### basic — 基础组件（6 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 表单 | `FormComponents.Form` |
| 复选框 | `FormComponents.GenCheckbox` |
| 图片 | `FormComponents.GenImage` |
| 单选框 | `FormComponents.GenRadio` |
| 开关 | `FormComponents.GenSwitch` |
| 文本 | `FormComponents.Text` |

### data — 数据组件（11 个）

#### 根目录（3 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 数据列表 | `FormComponents.DataList` |
| 描述列表 | `FormComponents.Descriptions` |
| 树形表格 | `FormComponents.TreeTable` |

#### card-list（5 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 卡片列表 | `FormComponents.CardList` |
| 卡片内容区 | `FormComponents.CardContent` |
| 卡片头部左侧 | `FormComponents.CardHeaderLeft` |
| 卡片头部右侧 | `FormComponents.CardHeaderRight` |
| 按钮（动态） | `FormComponents.CardOpeBtn` |

#### data-table（3 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 数据表格 | `FormComponents.DataTable` |
| 表格列（动态） | `FormComponents.DataTableColumn` |
| 公式列 | `FormComponents.DataTableFormula` |

### high — 高级组件（1 个）

| 组件标题 | 组件类型 |
|---------|---------|
| Vue3（自定义代码） | `FormComponents.CustomCode` |

### layout — 布局组件（9 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 按钮容器 | `FormComponents.ButtonContainer` |
| 操作按钮 | `FormComponents.BottomButtonContainer` |
| 面板 | `FormComponents.Collapse` |
| 分割线 | `FormComponents.Divider` |
| 栅格容器 | `FormComponents.Grid` |
| 子栅格 | `FormComponents.GridCol` |
| 占位 | `FormComponents.SpaceOccupation` |
| 选项卡 | `FormComponents.Tabs` |
| 标签页 | `FormComponents.TabPane` |

### other — 其他组件（11 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 按钮 | `FormComponents.BaseButton` |
| 自定义按钮 | `FormComponents.CustomButton` |
| iframe | `FormComponents.Iframe` |
| 跳转页面 | `FormComponents.LinkPageBtn` |
| 流程审批按钮（动态） | `FormComponents.ProcessApproveButton` |
| 流程发起 | `FormComponents.ProcessButton` |
| 搜索 | `FormComponents.QuickSearch` |
| 重置按钮 | `FormComponents.ResetButton` |
| 查询 | `FormComponents.Search` |
| 提交按钮 | `FormComponents.SubmitButton` |
| 手写板 | `FormComponents.Wacom` |

### process — 流程组件（2 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 审批历史 | `FormComponents.ApprovalHistory` |
| 流程表单 | `FormComponents.FormProcess` |

### sub-table — 子表操作（4 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 新建 | `FormComponents.SubTableAddBtn` |
| 复制 | `FormComponents.SubTableCopyBtn` |
| 删除 | `FormComponents.SubTableDeleteBtn` |
| 编辑 | `FormComponents.SubTableEditBtn` |

---

## Pad 端（37 个）

### basic — 基础组件（6 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 表单 | `FormComponents.Form` |
| 复选框 | `FormComponents.GenCheckbox` |
| 图片 | `FormComponents.GenImage` |
| 单选框 | `FormComponents.GenRadio` |
| 开关 | `FormComponents.GenSwitch` |
| 文本 | `FormComponents.Text` |

### data — 数据组件（11 个）

#### card-list（5 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 卡片列表 | `FormComponents.CardList` |
| 卡片头部左侧 | `FormComponents.CardHeaderLeft` |
| 卡片头部右侧 | `FormComponents.CardHeaderRight` |
| 卡片内容区 | `FormComponents.CardContent` |
| 按钮（动态） | `FormComponents.CardOpeBtn` |

#### data-table（2 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 数据表格 | `FormComponents.DataTable` |
| 操作 | `FormComponents.DataTableOpe` |

#### data-v-table（1 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 数据表格（虚拟化） | `FormComponents.DataVTable` |

### layout — 布局组件（10 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 操作按钮 | `FormComponents.BottomButtonContainer` |
| 按钮容器 | `FormComponents.ButtonContainer` |
| 面板 | `FormComponents.Collapse` |
| 分割线 | `FormComponents.Divider` |
| 栅格容器 | `FormComponents.Grid` |
| 子栅格 | `FormComponents.GridCol` |
| 左右分栏 | `FormComponents.LeftRightColumns` |
| 占位 | `FormComponents.SpaceOccupation` |
| 选项卡 | `FormComponents.Tabs` |
| 标签页 | `FormComponents.TabPane` |

### other — 其他组件（9 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 删除按钮（批量） | `FormComponents.BatchDeleteButton` |
| 自定义按钮 | `FormComponents.CustomButton` |
| 跳转页面 | `FormComponents.LinkPageBtn` |
| 搜索 | `FormComponents.QuickSearch` |
| 重置按钮 | `FormComponents.ResetButton` |
| 查询 | `FormComponents.Search` |
| 提交按钮 | `FormComponents.SubmitButton` |
| 详情 | `FormComponents.TableInfoButton` |
| 跳转页面（表格内） | `FormComponents.TableLinkButton` |

### sub-table — 子表操作（4 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 新建 | `FormComponents.SubTableAddBtn` |
| 复制 | `FormComponents.SubTableCopyBtn` |
| 删除 | `FormComponents.SubTableDeleteBtn` |
| 编辑 | `FormComponents.SubTableEditBtn` |

---

## Web 端（58 个）

### basic — 基础组件（6 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 表单 | `FormComponents.Form` |
| 复选框 | `FormComponents.GenCheckbox` |
| 图片 | `FormComponents.GenImage` |
| 单选框 | `FormComponents.GenRadio` |
| 开关 | `FormComponents.GenSwitch` |
| 文本 | `FormComponents.Text` |

### data — 数据组件（8 个）

#### 根目录（4 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 列表 | `FormComponents.DataList` |
| 描述列表 | `FormComponents.Descriptions` |
| 关联数据表 | `FormComponents.RefDataTable` |
| 树形表格 | `FormComponents.TreeTable` |

#### data-table（4 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 数据表格 | `FormComponents.DataTable` |
| 操作 | `FormComponents.DataTableOpe` |
| 操作按钮（动态） | `FormComponents.OpeButton` |
| 嵌套子表格 | `FormComponents.SubDataTable` |

### high — 高级组件（1 个）

| 组件标题 | 组件类型 |
|---------|---------|
| Vue3（自定义代码） | `FormComponents.CustomCode` |

### layout — 布局组件（15 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 操作按钮 | `FormComponents.BottomButtonContainer` |
| 按钮容器 | `FormComponents.ButtonContainer` |
| 流程按钮组 | `FormComponents.ButtonProcessContainer` |
| 面板 | `FormComponents.Collapse` |
| 分割线 | `FormComponents.Divider` |
| 栅格容器 | `FormComponents.Grid` |
| 子栅格 | `FormComponents.GridCol` |
| 布局容器 | `FormComponents.LayoutContainer` |
| 左右三栏 | `FormComponents.LeftLayoutThree` |
| 左右分栏 | `FormComponents.LeftRightColumns` |
| 占位 | `FormComponents.SpaceOccupation` |
| 上下分栏 | `FormComponents.TopBottomColumns` |
| 上下三栏 | `FormComponents.TopLayoutThree` |
| 选项卡 | `FormComponents.Tabs` |
| 标签页 | `FormComponents.TabPane` |

### other — 其他组件（27 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 按钮 | `FormComponents.BaseButton` |
| 删除按钮（批量） | `FormComponents.BatchDeleteButton` |
| 复制按钮 | `FormComponents.CopyButton` |
| 新建按钮 | `FormComponents.CreateButton` |
| 自定义按钮 | `FormComponents.CustomButton` |
| 删除按钮 | `FormComponents.DeleteButton` |
| 单据打印按钮 | `FormComponents.DocumentPrintButton` |
| 导出按钮 | `FormComponents.ExportButton` |
| 导出按钮（GC） | `FormComponents.ExportButton` |
| 导入按钮（GC） | `FormComponents.ImportButton` |
| iframe | `FormComponents.Iframe` |
| 导入按钮 | `FormComponents.ImportButton` |
| 标签打印 | `FormComponents.LabelPrintButton` |
| 建模追溯 | `FormComponents.ModelingButton` |
| 流程审批按钮（动态） | `FormComponents.ProcessApproveButton` |
| 流程发起 | `FormComponents.ProcessButton` |
| 刷新按钮 | `FormComponents.RefreshButton` |
| 重置按钮 | `FormComponents.ResetButton` |
| 查询 | `FormComponents.Search` |
| 搜索（下拉） | `FormComponents.SelectSearch` |
| 提交按钮 | `FormComponents.SubmitButton` |
| 审批 | `FormComponents.TableApproveButton` |
| 详情 | `FormComponents.TableInfoButton` |
| 跳转页面 | `FormComponents.TableLinkButton` |
| 列表选择器 | `FormComponents.TableSelect` |
| 使用信息 | `FormComponents.UseinfoButton` |
| 手写板 | `FormComponents.Wacom` |

### process — 流程组件（3 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 审批历史 | `FormComponents.ApprovalHistory` |
| 流程图 | `FormComponents.FlowDiagram` |
| 流程表单 | `FormComponents.FormProcess` |

### rdo — 版本组件（4 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 版本复制 | `FormComponents.CopyVersionButton` |
| 版本创建 | `FormComponents.CreateVersionButton` |
| 列表 | `FormComponents.RdoDataList` |
| 保存 | `FormComponents.RdoSaveButton` |

### sub-table — 子表操作（5 个）

| 组件标题 | 组件类型 |
|---------|---------|
| 新建 | `FormComponents.SubTableAddBtn` |
| 复制 | `FormComponents.SubTableCopyBtn` |
| 删除 | `FormComponents.SubTableDeleteBtn` |
| 编辑 | `FormComponents.SubTableEditBtn` |
| 操作 | `FormComponents.SubTableOpe` |
