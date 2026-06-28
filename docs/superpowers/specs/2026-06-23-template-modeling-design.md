# 模板建模设计规格

## 目标

数据模块新增“模板建模”，下挂“表单模板”和“批记录模板”。第一阶段把表单模板做成版本化模板资产：支持分类、主档、版本、生效失效时间、文件导入入口、三模式设计器骨架和审计；批记录模板先保留同标准的基础入口，后续再接工艺路线和多表单组合。

## 范围

- 表单模板不是普通 CRUD。它由“表单模板主档”和“表单模板版本”组成。
- 新增表单模板时必须同时创建首个版本。
- 模板编码由用户填写，不自动生成；版本号由用户填写。
- 新增弹窗使用两张卡片承载：基础信息、版本信息。
- 新增弹窗按钮固定为：取消、保存、保存并设计。
- 设计器提供三个模式：模型设计、画布设计、流程设计。
- 文件导入入口支持 PDF、Word、Excel、图片，第一阶段先完成上传入口和解析结果确认区，不实现完整 OCR/版式解析引擎。
- 画布设计第一阶段按“图层锚定 + 格式复刻”建立数据结构和视觉骨架：原文件后续可渲染为底层背景图，字段框锚定在坐标上。
- 批记录模板第一阶段只做菜单、分类、基础列表和审计，不复制表单模板设计器复杂能力。

## 信息架构

左侧分类栏：

- 默认包含“全部”和“未分类”。
- 支持新增、编辑、删除和拖拽排序自建分类。
- “全部”和“未分类”为系统项，不允许编辑、删除、拖拽。
- 删除分类时如果分类下存在模板，禁止删除。

右侧表格：

- 查询区一行三项，默认字段为名称、编码、状态。
- 表格内部滚动，页面不出现横向或纵向滚动条。
- 字段设置、列宽持久化、行点击抽屉、数据审计按现有后台工作台标准执行。

表单模板默认列：

- 表单名称、表单编码、当前版本、模板分类、生效时间、失效时间、状态、创建人、创建时间、更新人、更新时间、操作。

批记录模板默认列：

- 模板名称、模板编码、模板分类、状态、创建人、创建时间、更新人、更新时间、操作。

## 新增表单模板

基础信息卡片：

- 表单名称，必填。
- 表单编码，必填，由用户填写。
- 表单分类，支持输入模糊查询，无数据时显示“暂无数据”。
- 表单描述。

版本信息卡片：

- 版本，必填。
- 生效时间。
- 失效时间。

提交动作：

- 保存：创建主档和首个版本，停留列表。
- 保存并设计：创建主档和首个版本后进入设计器，并默认打开模型设计。

## 设计器

顶部：

- 显示模板名称、编码、版本。
- 提供文件导入入口，`accept` 为 `.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg`。

模式切换：

- 模型设计：展示导入解析出的字段候选，用户可确认字段、调整字段类型、必填、校验规则，并一键导入模型。
- 画布设计：展示“图层锚定 + 格式复刻”说明和画布骨架；后续底层背景图来自原文件渲染，字段框保存坐标、尺寸、字体、字号、对齐方式等。
- 流程设计：展示流程节点骨架；后续接审核、电子签名、放行规则。

接口边界：

- 导入接口第一阶段保存导入任务元数据和 mock 解析结果，不承诺 100% 解析准确率。
- 设计保存接口保存 `modelDesignJson`、`canvasDesignJson`、`workflowDesignJson`，并写入审计。

## 后端数据模型

`form_template` 主档：

- `id`、`tenant_id`、`code`、`name`、`category_name`、`description`、`status`、`current_version_id`、`created_by`、`created_at`、`updated_by`、`updated_at`。

`form_template_version` 版本：

- `id`、`tenant_id`、`template_id`、`version`、`description`、`effective_from`、`effective_to`、`source_file_name`、`source_file_type`、`import_status`、`model_design_json`、`canvas_design_json`、`workflow_design_json`、`status`、`created_by`、`created_at`、`updated_by`、`updated_at`。

`template_category` 分类：

- `id`、`tenant_id`、`template_type`、`name`、`sort_order`、`created_by`、`created_at`、`updated_by`、`updated_at`。

## 接口

- `GET /api/v1/master-data/template-modeling/form-templates`：分页查询表单模板主档，返回当前版本摘要。
- `POST /api/v1/master-data/template-modeling/form-templates`：创建主档和首个版本。
- `PUT /api/v1/master-data/template-modeling/form-templates/{id}`：编辑主档和当前版本基础信息。
- `POST /api/v1/master-data/template-modeling/form-templates/{id}/versions`：创建新版本。
- `GET /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}`：查看版本详情。
- `PUT /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/design`：保存设计 JSON。
- `POST /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/import`：记录导入文件并返回字段确认候选。
- `GET /api/v1/master-data/template-modeling/batch-record-templates`：分页查询批记录模板。
- `POST /api/v1/master-data/template-modeling/batch-record-templates`：创建批记录模板。
- `GET/POST/PUT/DELETE /api/v1/master-data/template-modeling/{templateType}/categories`：分类管理。
- `PUT /api/v1/master-data/template-modeling/{templateType}/categories/order`：分类排序。

## 审计

- 新增表单模板写完整主档和首版本快照。
- 修改只写实际变化字段。
- 保存设计、导入文件、分类新增/编辑/删除/排序均写审计。
- 审计字段必须使用中文业务含义，设计 JSON 可以在审计详情中按 JSON 展示。

## 验收

- 菜单中存在“模板建模 / 表单模板 / 批记录模板”。
- 表单模板左侧分类、右侧表格、查询区、字段设置、分页和抽屉符合后台工作台标准。
- 新增表单模板弹窗包含基础信息和版本信息两张卡片。
- 保存并设计后进入设计器，能切换模型设计、画布设计、流程设计。
- 文件导入入口限制 PDF、Word、Excel、图片。
- 后端测试验证创建表单模板时创建首版本、保存设计写入版本 JSON、分类统计含全部和未分类。
