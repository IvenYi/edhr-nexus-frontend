# 表单模板导入高保真与 OnlyOffice 设计规格

## 目标

在数据模块的模板建模 / 表单模板设计器中，导入 Excel、Word、PDF 后保留原始文件高保真样式，自动识别页面横竖方向，解析文档文字和结构，生成可确认的候选组件，再由用户确认哪些内容成为后续填报组件、哪些保留为静态文字。OnlyOffice 作为原始文档高保真编辑和渲染底座；模板模块负责设计、填报数据、权限、审计和版本发布，其他 eDHR 模块只消费受控输出。

## 当前事实

当前仓库已经具备以下基础能力：

- 表单模板采用主档和多版本结构，版本保存 `modelDesignJson`、`canvasDesignJson`、`workflowDesignJson`。
- 设计器已经是全屏工作区，支持文件导入、分页缩略图、画布页、背景层、文本/表格/单元格/线条/形状/图片层、字段覆盖层。
- 导入接口已经使用版本级 multipart 上传，支持 PDF、Word、Excel、图片，拒绝 PPT。
- 后端已把源文件写入 `FileObject`，解析后写入版本 JSON，并为背景和内嵌图片生成受控预览文件。
- 前端支持字段候选列表，候选字段和工具栏组件可以点击或拖拽到画布，并保存回设计 JSON。

这些能力是后续工作的基础，但还不是目标态。缺口集中在：OnlyOffice 高保真底座、候选确认流程、候选来源可解释性、静态文字和组件的正式分类、运行期填报控件和审计闭环。

## 非目标

- 不把 OnlyOffice 当成模板模块运行数据的唯一存储。
- 不把完整 Office 排版能力自研到 React 画布中。
- 不在第一阶段实现完整填报运行态、电子签名流、放行审批流和复杂组件库。
- 不把 PPT/PPTX 纳入导入范围。
- 不修改 OnlyOffice 源码作为闭源产品分发。

## 设计原则

- 原文高保真由 OnlyOffice 或文档转换服务承担，模板模块负责交互覆盖层和业务管控。
- 导入解析先生成草稿和候选，不直接把所有文字确认为字段。
- 每个候选必须可解释：来源页、坐标、原文、建议动作、置信度、解析规则。
- 用户确认是受控操作，确认、忽略、修改字段类型都要进入审计摘要。
- 所有坐标使用源文档坐标系保存，前端渲染时按页面实际尺寸换算，避免缩放后坐标漂移。
- 保存设计时只保存交互覆盖层，不把填报值写进模板设计 JSON。

## 架构

### 1. 原始文档层

职责：

- 保存上传的 Excel、Word、PDF 源文件。
- 为 OnlyOffice 提供可访问的受控文件 URL。
- 提供 OnlyOffice editor config。
- 接收 OnlyOffice 保存回调，下载修改后的文件并保存为新的源文件修订。

OnlyOffice 官方保存流程要求：编辑器把变更交给 Document Server，编辑完成后 Document Server 通过 `callbackUrl` 通知文档存储服务，并返回修改后文档的 `url`。集成方需要在编辑器配置中提供 `callbackUrl` 和 `token`，否则请求会被拒绝。

Zencas 后端需要成为 OnlyOffice 眼中的 document storage service。

### 2. 高保真渲染层

职责：

- Word 和 Excel 优先由 OnlyOffice iframe 展示和编辑源文件。
- PDF 优先作为受控预览或转换后文档展示；若 OnlyOffice 当前部署对 PDF 编辑能力有限，则先作为高保真预览底座。
- 模板模块画布展示交互覆盖层，覆盖层坐标与源文档页坐标对齐。

高保真渲染层不负责字段组件语义，不保存字段定义。

### 3. 文档解析层

职责：

- 解析页面尺寸、方向、旋转、DPI、页码、是否扫描件。
- 提取文本块、表格单元格、线条、图片和 OCR 文本。
- 输出统一 `DocumentAnalysisDraft`，供候选确认层消费。

现有 `TemplateModelingController` 已包含导入解析能力，但目标态应逐步拆到 service/parser 层。第一阶段可以保持接口兼容，新增服务边界和数据结构，减少继续堆大 Controller。

### 4. 候选确认层

职责：

- 把解析出的文本块、空白区、表格邻格、冒号标签、下划线填空等转换为候选项。
- 用户逐项或批量确认候选动作。
- 确认后的组件写入 `modelDesignJson.fields` 和 `canvasDesignJson.interactiveFields`。
- 静态文字保留在 `canvasDesignJson.pages[].layers`。
- 被忽略内容保留在 draft 决策记录中，不进入画布和字段模型。

### 5. 低代码设计层

职责：

- 在高保真原文画布上展示字段覆盖层。
- 支持拖拽字段候选、手动新增字段、移动/调整字段框。
- 支持基础属性编辑：字段名称、字段编码、组件类型、必填、校验、数据绑定。

### 6. 填报运行层

第一阶段只预留数据结构和接口边界。后续在模板发布后，运行态依据 `interactiveFields` 渲染真实输入控件，填报值进入记录实例，不进入模板设计 JSON。

## 导入流程

1. 用户在表单模板版本设计器点击文件导入，选择 Excel、Word 或 PDF。
2. 后端保存源文件为 `FORM_TEMPLATE_SOURCE`。
3. 后端创建一次 `DocumentAnalysisDraft`。
4. 后端解析页面方向和结构：
   - `width >= height` 记为 landscape。
   - `height > width` 记为 portrait。
   - 若文档携带旋转角，则先按旋转后的有效页面判断。
5. 后端生成高保真渲染入口：
   - Word/Excel：生成 OnlyOffice config 或可打开会话。
   - PDF：生成受控预览背景或 OnlyOffice 预览入口。
6. 后端生成候选组件清单，不直接全部确认。
7. 前端进入候选确认面板。
8. 用户确认候选项为组件、静态文字或忽略。
9. 前端把确认结果提交给后端。
10. 后端更新版本 `modelDesignJson` 和 `canvasDesignJson`，并写审计。
11. 用户继续在画布上拖拽、移动、编辑字段，保存设计。

## 候选判断规则

候选项按以下优先级生成：

- 表格左侧或上方文本加相邻空白单元格，建议为填报字段。
- 冒号、全角冒号、下划线、括号空白后的文本，建议为填报字段。
- 包含日期、时间、数量、温度、重量、批号、设备、操作人、审核人等关键词的文本，建议为对应组件类型。
- 独立标题、说明性段落、页眉页脚、固定声明，建议为静态文字。
- 低置信度 OCR、重复文本、装饰性文本，建议为待人工确认。

候选项不得只保存最终字段名，必须保存来源引用和推荐理由。

## 数据结构

### DocumentAnalysisDraft

```json
{
  "schemaVersion": "1.0",
  "analysisId": "analysis-20260626-001",
  "templateId": "101",
  "versionId": "102",
  "source": {
    "fileId": "301",
    "fileName": "生产巡检记录.xlsx",
    "fileType": "xlsx",
    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "revision": 1
  },
  "pages": [
    {
      "id": "page-1",
      "pageNumber": 1,
      "width": 842,
      "height": 595,
      "orientation": "landscape",
      "rotation": 0,
      "dpi": 144,
      "scanDetected": false
    }
  ],
  "blocks": [
    {
      "id": "block-1",
      "pageId": "page-1",
      "kind": "text",
      "text": "批号：",
      "x": 72,
      "y": 96,
      "width": 80,
      "height": 24,
      "style": {
        "fontSize": 12,
        "fontWeight": "normal",
        "textAlign": "left"
      },
      "sourceType": "excel-cell",
      "sourceRef": {
        "sheetName": "Sheet1",
        "cellAddress": "A3"
      },
      "confidence": 0.98
    }
  ],
  "candidates": [
    {
      "id": "candidate-batch-no",
      "status": "pending",
      "suggestedAction": "component",
      "suggestedComponent": "TextInput",
      "fieldCode": "batch_no",
      "fieldName": "批号",
      "required": false,
      "pageId": "page-1",
      "labelBlockId": "block-1",
      "valueAnchor": {
        "x": 152,
        "y": 96,
        "width": 180,
        "height": 24
      },
      "reason": "冒号标签后存在可填写区域",
      "confidence": 0.92
    }
  ]
}
```

### CandidateDecision

```json
{
  "analysisId": "analysis-20260626-001",
  "decisions": [
    {
      "candidateId": "candidate-batch-no",
      "action": "component",
      "fieldCode": "batch_no",
      "fieldName": "批号",
      "component": "TextInput",
      "required": true
    },
    {
      "candidateId": "candidate-title",
      "action": "staticText"
    },
    {
      "candidateId": "candidate-noise",
      "action": "ignore"
    }
  ]
}
```

### 确认后的 modelDesignJson

```json
{
  "schemaVersion": "1.1",
  "source": {
    "fileId": "301",
    "fileName": "生产巡检记录.xlsx",
    "fileType": "xlsx"
  },
  "analysis": {
    "analysisId": "analysis-20260626-001",
    "confirmedAt": "2026-06-26 18:30:00",
    "confirmedBy": "系统管理员"
  },
  "fields": [
    {
      "id": "field-batch-no",
      "code": "batch_no",
      "name": "批号",
      "type": "text",
      "required": true,
      "pageId": "page-1",
      "x": 152,
      "y": 96,
      "width": 180,
      "height": 24,
      "binding": {
        "fillable": true,
        "component": "TextInput"
      },
      "sourceCandidateId": "candidate-batch-no"
    }
  ]
}
```

### 确认后的 canvasDesignJson

```json
{
  "schemaVersion": "1.1",
  "strategy": "OnlyOffice高保真原文层+模板交互覆盖层",
  "orientation": "landscape",
  "source": {
    "fileId": "301",
    "fileName": "生产巡检记录.xlsx",
    "fileType": "xlsx"
  },
  "rendering": {
    "mode": "onlyoffice",
    "documentSessionId": "oo-session-1"
  },
  "pages": [
    {
      "id": "page-1",
      "pageNumber": 1,
      "width": 842,
      "height": 595,
      "orientation": "landscape",
      "background": {
        "type": "onlyoffice",
        "fileId": "301"
      },
      "layers": [
        {
          "id": "static-title",
          "type": "text",
          "text": "生产巡检记录",
          "x": 300,
          "y": 36,
          "width": 220,
          "height": 28,
          "sourceCandidateId": "candidate-title"
        }
      ]
    }
  ],
  "interactiveFields": [
    {
      "id": "field-batch-no",
      "code": "batch_no",
      "name": "批号",
      "pageId": "page-1",
      "x": 152,
      "y": 96,
      "width": 180,
      "height": 24,
      "component": "TextInput",
      "fillable": true,
      "required": true
    }
  ],
  "fieldBindings": [
    {
      "fieldCode": "batch_no",
      "sourceCandidateId": "candidate-batch-no",
      "labelBlockId": "block-1"
    }
  ],
  "fillRuntime": {
    "valueNamespace": "submission.fields"
  }
}
```

## 后端接口

沿用当前导入接口，但新增草稿和确认接口。

- `POST /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/import`
  - 保存源文件。
  - 解析文档。
  - 返回版本摘要、analysis draft、候选清单、初始画布。
  - 不把所有候选自动确认为字段。

- `GET /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/analysis/{analysisId}`
  - 返回当前解析草稿、候选状态和来源块。

- `PUT /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/analysis/{analysisId}/decisions`
  - 接收候选确认结果。
  - 更新 `modelDesignJson` 和 `canvasDesignJson`。
  - 写入审计摘要。

- `GET /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/onlyoffice/config`
  - 返回 OnlyOffice editor config。
  - 包含 document key、title、fileType、url、documentType、callbackUrl、permissions、token。

- `POST /api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/onlyoffice/callback`
  - 接收 OnlyOffice Document Server 回调。
  - 校验 token。
  - 对保存完成和 forcesave 状态下载修改后的文件。
  - 创建新的源文件修订并写入审计。

## 前端交互

设计器进入后保留现有全屏布局，并新增一个候选确认侧栏或模式。

候选确认侧栏包含：

- 候选原文。
- 推荐动作：组件、静态文字、忽略。
- 推荐原因。
- 置信度。
- 来源页和坐标。
- 字段名称、字段编码、组件类型、必填、校验规则。
- 确认、改为静态文字、忽略。
- 批量确认同类候选。

画布行为：

- 点击候选时高亮对应原文块和建议字段框。
- 确认为组件后，在画布上出现可拖拽字段覆盖层。
- 确认为静态文字后，只保留文本层，不出现在字段模型中。
- 忽略后不显示为字段，也不再默认显示在待确认列表。
- 用户可以从候选侧栏拖拽组件到还原画布上。

OnlyOffice 行为：

- 设计器顶部提供“原文编辑/预览”入口。
- Word/Excel 打开 OnlyOffice iframe。
- PDF 第一阶段打开高保真预览；若部署支持 PDF 编辑，再启用编辑模式。
- OnlyOffice iframe 不直接承载 Zencas 字段编辑，字段覆盖层仍在 Zencas 设计器中维护。

## 审计

新增审计事件：

- 导入源文件：记录文件名、类型、大小、源文件 ID、解析页数、方向统计。
- 生成解析草稿：记录候选数量、组件建议数量、静态文字建议数量、低置信度数量。
- 确认候选：记录确认成组件、静态文字、忽略的数量和字段摘要。
- 保存设计：记录字段增删改、坐标变化和组件类型变化摘要。
- OnlyOffice 保存回调：记录源文件修订、保存状态、文件 ID、操作者或会话信息。

审计详情不应直接塞入完整大体积 JSON。完整 JSON 仍保存在版本设计字段或后续 draft 表中，审计只保存摘要和引用 ID。

## 数据存储

第一阶段可以继续复用版本表 JSON 字段，但建议新增持久化表以支撑候选确认：

- `form_template_analysis`
  - `id`
  - `tenant_id`
  - `template_id`
  - `version_id`
  - `source_file_id`
  - `analysis_json`
  - `status`
  - `created_by`
  - `created_at`
  - `updated_by`
  - `updated_at`

- `form_template_source_revision`
  - `id`
  - `tenant_id`
  - `template_id`
  - `version_id`
  - `file_id`
  - `revision_no`
  - `source`
  - `created_by`
  - `created_at`

若第一阶段控制范围，可以先把 `analysis` 放进 `modelDesignJson.analysisDraft`，但实施计划必须预留迁移到独立表的路径。

## 错误处理

- 文件类型不支持时提示：仅支持 PDF、Word、Excel。
- OnlyOffice 未配置时，导入解析仍可运行，但原文编辑入口置灰并提示未配置文档服务。
- OnlyOffice callback token 校验失败时返回拒绝，并写安全审计。
- Document Server 回调下载文件失败时，不覆盖当前源文件修订，记录失败状态。
- OCR 或解析失败时返回部分解析结果和失败原因，不清空已保存的上一个稳定设计。
- 用户重新导入时必须先明确提示会替换当前解析草稿和未保存覆盖层。

## 验收标准

### 导入和方向识别

- Excel、Word、PDF 都可以在表单模板版本设计器中导入。
- 每页都保存宽度、高度和 `orientation`。
- 横向文档在画布中以横向页面展示，纵向文档以纵向页面展示。

### 高保真原文层

- Word 和 Excel 可以通过 OnlyOffice 打开源文件预览或编辑。
- OnlyOffice 保存后，Zencas 能接收回调并保存新的源文件修订。
- 未配置 OnlyOffice 时系统有清晰降级提示，不影响既有导入解析。

### 候选确认

- 导入后展示待确认候选清单。
- 每个候选能看到原文、来源页、坐标、建议组件、推荐原因和置信度。
- 用户可以确认候选为组件、静态文字或忽略。
- 确认为组件后写入 `modelDesignJson.fields` 和 `canvasDesignJson.interactiveFields`。
- 确认为静态文字后只保留在画布层，不进入字段模型。
- 忽略后不进入字段模型和默认画布层。

### 拖拽设计

- 用户可以把候选组件拖拽到还原画布上。
- 用户可以移动、调整大小、修改字段属性并保存。
- 保存后刷新页面，字段覆盖层和确认结果能恢复。

### 审计

- 导入、解析草稿生成、候选确认、OnlyOffice 回调、保存设计都写入真实审计。
- 审计摘要能说明谁在什么时候确认了哪些字段，哪些内容被保留为静态文字或忽略。

### 验证命令

前端：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run verify:template-modeling
npm run build
```

后端：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn test -Dtest=TemplateModelingControllerTest,PaddleOcrClientTest -DargLine="-javaagent:/Users/wangzilin/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.16/byte-buddy-agent-1.14.16.jar"
```

浏览器 QA：

- 打开 `http://localhost:3000/master-data/form-templates`。
- 创建或选择表单模板版本。
- 分别导入一个横向 Excel、一个纵向 Word、一个 PDF。
- 验证候选确认、拖拽、保存、刷新恢复、OnlyOffice 预览或编辑入口、审计记录。

## 分阶段实施建议

### 阶段一：候选确认闭环

- 增加 analysis draft 数据结构。
- 导入后展示候选确认侧栏。
- 支持组件、静态文字、忽略三类决策。
- 保存确认结果并写审计。

### 阶段二：OnlyOffice PoC

- 增加 OnlyOffice 配置项。
- 增加 editor config 接口。
- 增加 callback 接口。
- Docker Compose 增加可选 Document Server 服务。
- 前端增加原文预览/编辑入口。

### 阶段三：导入保真度验证

- 增加固定 fixture 文档集。
- 对页面尺寸、方向、图层数量、文本坐标、合并单元格、图片层、字段锚点做测试。
- 增加浏览器 QA 脚本或流程记录。

### 阶段四：填报运行态

- 基于确认后的字段覆盖层渲染真实输入控件。
- 保存填报实例值。
- 接入权限、校验、审计、电子签名和发布状态。

## 待确认问题

- 第一阶段是否接受 OnlyOffice 只作为 Word/Excel 原文预览和编辑 PoC，PDF 先走高保真预览。
- 候选确认结果是否需要立即落独立表，还是先落入版本 JSON 并预留迁移。
- 第一批组件类型是否限定为 TextInput、NumberInput、DateTimePicker、Select、Checkbox、Signature、Attachment。
- OnlyOffice Document Server 是否作为本地 Docker Compose 可选服务先接入。
