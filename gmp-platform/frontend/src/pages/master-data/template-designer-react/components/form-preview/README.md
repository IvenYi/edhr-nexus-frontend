# 表单版式组件

`FormDocumentPreview` 是表单模块对外提供的完整纸张预览／填报组件。eDHR 预览与生产执行共用纸张尺寸、单元格、子表排版及基础控件。

```tsx
import FormDocumentPreview from '@/pages/master-data/template-designer-react/components/form-preview/FormDocumentPreview';

// 纯预览：可滚动，不可操作内部控件。
<FormDocumentPreview document={document} />

// 业务填报：传入当前表单实例数据及原有业务回调。
<FormDocumentPreview
  document={document}
  runtime={{ values, onChange, disabled, upload, references }}
  fieldPermissions={permissions}
/>
```

- `document`：解析后的 `TemplateDesignerDocument`；版式、字段定义取自同一个模板版本。
- `runtime.values`：主表按字段 ID 存值；子表按子表字段 ID 存行数组，每行按子字段 ID 存值。`onChange(fieldId, value)` 回传主字段或完整子表数组。
- `runtime.disabled`、字段权限及模板只读配置共同控制编辑权限。签名仍由业务签署流程写入，组件只展示签名框或已有签名。
- 引用查询、附件上传继续调用 `references` / `upload`；组件不保存、提交或发起流程。
- `fallback`：无画布版式时的展示内容。

容器应提供明确的可用高度；组件内部滚动。暂存、提交及其他业务操作栏由调用方放在组件外部。
