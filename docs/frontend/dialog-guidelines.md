# 普通表单弹窗规范

以物料新建/编辑弹窗为视觉基准，适用于列表页及普通配置页的新建、编辑表单。全屏设计器、预览、确认、签名等弹窗不套用此表单外壳。

## 组件

- 使用 `src/components/FormDialog.tsx` 承载普通表单，保留 `DialogTitle`、`DialogContent dividers`、`DialogActions` 三段结构。已有复杂页面可在 `AppDialog` 上设置 `variant="form"`，但不得给全屏模式套普通表单样式。
- 使用 `src/components/FormDialogSection.tsx` 或同视觉结构的已有 `DetailSection` 分组字段。单组字段也需要“基本信息”分组；版本字段独立为“版本信息”。
- 普通字段在分组内使用 `src/components/FormDialogFieldGrid.tsx`：桌面双列、窄屏单列；字段数量为奇数时，最后一个普通字段自动跨满一行。长文本、上传等字段自行设置 `sx={{ gridColumn: { sm: '1 / -1' } }}` 跨两列；不要用页面级 `Stack` 让整张普通表单退成单列。
- 取消在左，保存等主操作在右；保留页面原有校验、禁用和提交状态。
- 弹窗外壳统一标题 `20px/600`、内容左右 `24px`、底栏左右 `24px`，移动端缩为 `16px`；页面不另写同类边距。字段默认 `size="small"`、间距 `12px`，两列网格在窄屏退为单列。
- 普通主对象的新建/编辑表单最多保留一个自由文本说明字段，标签统一为“描述”；有子版本时，子版本对应字段统一标为“版本说明”。不得在同一层级同时显示“描述”和“备注”，也不得额外显示一个重复的“版本备注”。执行记录、工单等有独立业务含义的备注不套用此命名规则。
- 基础字段按两列排布，短字段不无故跨两列；描述、版本说明等长文本字段可独占一行。删除旧重复输入时，不得在编辑保存中无提示清空存量备注值；持久化字段清理需单独核对数据。

## 示例

```tsx
<FormDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
  <DialogTitle>{editing ? '编辑' : '新增'}物料</DialogTitle>
  <DialogContent dividers>
    <FormDialogSection title="基本信息">
      <FormDialogFieldGrid>
        <TextField size="small" label="名称" fullWidth />
        <TextField size="small" label="编码" fullWidth />
      </FormDialogFieldGrid>
    </FormDialogSection>
  </DialogContent>
  <DialogActions><Button onClick={onClose}>取消</Button><Button variant="contained">保存</Button></DialogActions>
</FormDialog>
```

仅迁移视觉布局时不改字段含义、接口、校验或保存流程；需要新增持久化字段时，必须同步接口、迁移和测试。独立确认弹窗仍使用 `ConfirmDialog`。
