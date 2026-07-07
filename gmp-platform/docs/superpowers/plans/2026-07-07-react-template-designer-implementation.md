# React Template Designer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a parallel React template designer entry in template modeling and implement the first working version of a full three-tab React designer with shared document state, canvas/component/field/config infrastructure, save/load integration, and repo-native verification.

**Architecture:** Keep the existing Vue designer path untouched and add a second React-only designer under the main frontend app. The React designer uses a single Zustand document store, schema-driven field/component registries, MUI-rendered property editors, and `@xyflow/react` for the workflow tab. Verification follows the existing repo pattern: static `verify:*` scripts for contract checks plus `npm run build`.

**Tech Stack:** React 18, TypeScript, MUI, Zustand, React Query, `@xyflow/react`, Vite, existing `verify:*` node scripts

---

## File Structure

### Files to create

- `frontend/scripts/verify-template-designer-react.mjs`
  - Repo-native verification script for the new React designer files and integration markers.
- `frontend/src/pages/master-data/template-designer-react/index.ts`
  - Barrel export for the React designer module.
- `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx`
  - Full-screen dialog host for the React designer.
- `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`
  - Shared shell with top bar, save action, tabs, dirty-close guard, and tab content switching.
- `frontend/src/pages/master-data/template-designer-react/types/document.ts`
  - Persisted document schema and tab discriminators.
- `frontend/src/pages/master-data/template-designer-react/types/model.ts`
  - Model field, field group, and field config types.
- `frontend/src/pages/master-data/template-designer-react/types/canvas.ts`
  - Canvas node, binding, layout, and property schema types.
- `frontend/src/pages/master-data/template-designer-react/types/workflow.ts`
  - Workflow node and edge persistence types.
- `frontend/src/pages/master-data/template-designer-react/types/index.ts`
  - Shared type exports.
- `frontend/src/pages/master-data/template-designer-react/utils/document.ts`
  - Empty document factory, schema guards, serializers, and deserializers.
- `frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
  - Single Zustand store with document, UI, model, canvas, workflow, and history slices.
- `frontend/src/pages/master-data/template-designer-react/registry/fieldRegistry.ts`
  - Field type definitions and default field factories.
- `frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx`
  - Component definitions, default node factories, and canvas renderers.
- `frontend/src/pages/master-data/template-designer-react/registry/index.ts`
  - Registry exports.
- `frontend/src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx`
  - Schema-driven MUI property editor renderer.
- `frontend/src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx`
  - Left toolbox and field/component palette container.
- `frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx`
  - Right property panel wrapper.
- `frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx`
  - Recursive canvas node renderer.
- `frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasDropZone.tsx`
  - Click-to-insert and reorder targets for first-version canvas operations.
- `frontend/src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx`
  - Field model editor UI.
- `frontend/src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx`
  - Canvas workspace UI.
- `frontend/src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx`
  - Workflow tab UI built on `@xyflow/react`.

### Files to modify

- `frontend/package.json`
  - Add `verify:template-designer-react`.
- `frontend/src/pages/master-data/TemplateModelingPage.tsx`
  - Add the parallel React entry button, dialog state, save mutation wiring, and React designer mount.
- `frontend/src/api/template-modeling.ts`
  - Reuse existing save API types without changing endpoint shape; add any shared type helpers only if needed.

### Verification commands used throughout

- `npm run verify:template-designer-react`
- `npm run verify:template-designer`
- `npm run build`

---

### Task 1: Parallel React Entry and Verification Scaffold

**Files:**
- Create: `frontend/scripts/verify-template-designer-react.mjs`
- Create: `frontend/src/pages/master-data/template-designer-react/index.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx`
- Create: `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`
- Modify: `frontend/package.json`
- Modify: `frontend/src/pages/master-data/TemplateModelingPage.tsx`

- [ ] **Step 1: Write the failing verification script and package command**

```js
// frontend/scripts/verify-template-designer-react.mjs
import { existsSync, readFileSync } from 'node:fs';

const failures = [];

function read(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  if (!existsSync(url)) {
    failures.push(`${relativePath}: missing file`);
    return '';
  }
  return readFileSync(url, 'utf8');
}

const packageJson = read('../package.json');
const templateModelingPage = read('../src/pages/master-data/TemplateModelingPage.tsx');
const dialog = read('../src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx');
const shell = read('../src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx');

if (!packageJson.includes('verify:template-designer-react')) failures.push('package.json: missing verify:template-designer-react script');
if (!templateModelingPage.includes('React设计')) failures.push('TemplateModelingPage.tsx: missing React设计 button label');
if (!templateModelingPage.includes('TemplateDesignerReactDialog')) failures.push('TemplateModelingPage.tsx: missing React dialog mount');
if (!dialog.includes('fullScreen')) failures.push('TemplateDesignerReactDialog.tsx: missing fullScreen dialog');
if (!shell.includes('建模设计')) failures.push('TemplateDesignerReactShell.tsx: missing model tab');
if (!shell.includes('表单设计')) failures.push('TemplateDesignerReactShell.tsx: missing canvas tab');
if (!shell.includes('流程设计')) failures.push('TemplateDesignerReactShell.tsx: missing workflow tab');

if (failures.length > 0) {
  console.error('verify-template-designer-react failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-template-designer-react passed');
```

```json
// frontend/package.json
{
  "scripts": {
    "verify:template-designer-react": "node scripts/verify-template-designer-react.mjs"
  }
}
```

- [ ] **Step 2: Run the verification command and confirm RED**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react`

Expected: FAIL with missing file and missing marker messages for the new React designer module.

- [ ] **Step 3: Implement the minimal parallel entry and shell**

```tsx
// frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx
import { Dialog, DialogContent } from '@mui/material';
import TemplateDesignerReactShell from './TemplateDesignerReactShell';
import type { TemplateDesignerDialogProps } from '@/pages/master-data/template-designer/templateDesignerTypes';

export default function TemplateDesignerReactDialog({
  open,
  row,
  version,
  onClose,
  onSave,
  saving,
}: TemplateDesignerDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogContent sx={{ p: 0 }}>
        {row && version ? (
          <TemplateDesignerReactShell row={row} version={version} onClose={onClose} onSave={onSave} saving={saving} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
```

```tsx
// frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx
import { useState } from 'react';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import type { TemplateDesignerDialogProps } from '@/pages/master-data/template-designer/templateDesignerTypes';

type ReactTemplateDesignerShellProps = Pick<TemplateDesignerDialogProps, 'row' | 'version' | 'onClose' | 'onSave' | 'saving'>;

export default function TemplateDesignerReactShell({ row, version, onClose }: ReactTemplateDesignerShellProps) {
  const [tab, setTab] = useState<'model' | 'canvas' | 'workflow'>('model');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f4f6fa' }}>
      <Box sx={{ height: 56, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1a1d23', color: '#fff' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button color="inherit" onClick={onClose}>返回上一页</Button>
          <Typography>{row?.name} / {version?.version}</Typography>
        </Stack>
        <Button variant="contained" disabled>保存</Button>
      </Box>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, bgcolor: '#fff' }}>
        <Tab value="model" label="建模设计" />
        <Tab value="canvas" label="表单设计" />
        <Tab value="workflow" label="流程设计" />
      </Tabs>
      <Box sx={{ flex: 1, p: 3 }}>
        {tab === 'model' ? '建模设计占位区' : null}
        {tab === 'canvas' ? '表单设计占位区' : null}
        {tab === 'workflow' ? '流程设计占位区' : null}
      </Box>
    </Box>
  );
}
```

```tsx
// frontend/src/pages/master-data/TemplateModelingPage.tsx
import TemplateDesignerReactDialog from './template-designer-react/TemplateDesignerReactDialog';

const [reactDesignerState, setReactDesignerState] = useState<TemplateDesignerState>({ open: false, row: null, version: null });

<Tooltip title="React设计" arrow>
  <IconButton
    size="small"
    aria-label="React设计"
    onClick={(event) => {
      event.stopPropagation();
      setReactDesignerState({ open: true, row, version });
    }}
  >
    <DesignServicesIcon fontSize="small" />
  </IconButton>
</Tooltip>

<TemplateDesignerReactDialog
  open={reactDesignerState.open}
  row={reactDesignerState.row}
  version={reactDesignerState.version}
  saving={false}
  onClose={() => setReactDesignerState({ open: false, row: null, version: null })}
  onSave={async () => undefined}
/>
```

- [ ] **Step 4: Run verification and build to confirm GREEN**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react && npm run build`

Expected: verify script prints `verify-template-designer-react passed`; build exits `0`.

- [ ] **Step 5: Commit**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
git add frontend/package.json \
  frontend/scripts/verify-template-designer-react.mjs \
  frontend/src/pages/master-data/TemplateModelingPage.tsx \
  frontend/src/pages/master-data/template-designer-react/index.ts \
  frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx \
  frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx
git commit -m "feat: add react template designer entry"
```

### Task 2: Shared Document Types and Zustand Store

**Files:**
- Create: `frontend/src/pages/master-data/template-designer-react/types/document.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/types/model.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/types/canvas.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/types/workflow.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/types/index.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/utils/document.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Extend the verification script with failing schema and store checks**

```js
// append to frontend/scripts/verify-template-designer-react.mjs
const documentTypes = read('../src/pages/master-data/template-designer-react/types/document.ts');
const storeFile = read('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts');
const documentUtils = read('../src/pages/master-data/template-designer-react/utils/document.ts');

if (!documentTypes.includes("schema: 'edhr-template-designer-react'")) failures.push('document.ts: missing persisted schema marker');
if (!documentTypes.includes('export interface TemplateDesignerDocument')) failures.push('document.ts: missing TemplateDesignerDocument interface');
if (!storeFile.includes('create<TemplateDesignerStore>')) failures.push('useTemplateDesignerStore.ts: missing Zustand store creation');
if (!storeFile.includes('setActiveTab')) failures.push('useTemplateDesignerStore.ts: missing setActiveTab action');
if (!storeFile.includes('markSaved')) failures.push('useTemplateDesignerStore.ts: missing markSaved action');
if (!documentUtils.includes('isReactTemplateDesignerPayload')) failures.push('document.ts utils: missing schema guard');
```

- [ ] **Step 2: Run verification and confirm RED**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react`

Expected: FAIL with missing type, store, and schema helper markers.

- [ ] **Step 3: Implement the document schema and minimal store**

```ts
// frontend/src/pages/master-data/template-designer-react/types/document.ts
export type TemplateDesignerTabKey = 'model' | 'canvas' | 'workflow';

export interface TemplateDesignerMeta {
  schema: 'edhr-template-designer-react';
  version: 1;
  templateId: string | number;
  versionId: string | number;
  templateName: string;
  versionLabel: string;
}

export interface TemplateDesignerDocument {
  meta: TemplateDesignerMeta;
  model: ModelDesignState;
  canvas: CanvasDesignState;
  workflow: WorkflowDesignState;
}
```

```ts
// frontend/src/pages/master-data/template-designer-react/utils/document.ts
export function isReactTemplateDesignerPayload(input: unknown): input is ReactTemplateDesignerPersisted<unknown> {
  if (!input || typeof input !== 'object') return false;
  return (input as { schema?: unknown }).schema === 'edhr-template-designer-react';
}

export function createEmptyTemplateDesignerDocument(meta: TemplateDesignerMeta): TemplateDesignerDocument {
  return {
    meta,
    model: { groups: [], fields: [] },
    canvas: { pages: [{ id: 'page-1', name: '页面 1', nodes: [] }] },
    workflow: { nodes: [], edges: [], config: {} },
  };
}
```

```ts
// frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts
import { create } from 'zustand';

export interface TemplateDesignerStore {
  activeTab: TemplateDesignerTabKey;
  document: TemplateDesignerDocument | null;
  savedSnapshot: string;
  setDocument: (document: TemplateDesignerDocument) => void;
  setActiveTab: (tab: TemplateDesignerTabKey) => void;
  markSaved: () => void;
  isDirty: () => boolean;
}

export const useTemplateDesignerStore = create<TemplateDesignerStore>((set, get) => ({
  activeTab: 'model',
  document: null,
  savedSnapshot: '',
  setDocument: (document) => set({ document }),
  setActiveTab: (activeTab) => set({ activeTab }),
  markSaved: () => set((state) => ({ savedSnapshot: JSON.stringify(state.document) })),
  isDirty: () => {
    const { document, savedSnapshot } = get();
    return document ? JSON.stringify(document) !== savedSnapshot : false;
  },
}));
```

- [ ] **Step 4: Run verification and build**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react && npm run build`

Expected: verify script passes; build exits `0`.

- [ ] **Step 5: Commit**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
git add frontend/scripts/verify-template-designer-react.mjs \
  frontend/src/pages/master-data/template-designer-react/types \
  frontend/src/pages/master-data/template-designer-react/utils/document.ts \
  frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts
git commit -m "feat: add react template designer document store"
```

### Task 3: Save/Load Wiring and React Designer Shell State

**Files:**
- Modify: `frontend/src/pages/master-data/TemplateModelingPage.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/utils/document.ts`
- Modify: `frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Add failing save/load checks to the verification script**

```js
// append to frontend/scripts/verify-template-designer-react.mjs
if (!templateModelingPage.includes('saveFormTemplateVersionDesign')) failures.push('TemplateModelingPage.tsx: missing shared save API usage for React designer');
if (!shell.includes('window.confirm')) failures.push('TemplateDesignerReactShell.tsx: missing dirty close confirmation');
if (!shell.includes('markSaved')) failures.push('TemplateDesignerReactShell.tsx: missing markSaved usage after save');
if (!documentUtils.includes('parseReactTemplateDesignerDocument')) failures.push('document utils: missing persisted document parser');
```

- [ ] **Step 2: Run verification and confirm RED**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react`

Expected: FAIL with save/load and dirty-close contract failures.

- [ ] **Step 3: Implement shell initialization, parsing, and save wiring**

```ts
// frontend/src/pages/master-data/template-designer-react/utils/document.ts
export function parseReactTemplateDesignerDocument(
  row: TemplateModelingRecord,
  version: TemplateVersionRecord,
): TemplateDesignerDocument {
  const meta = {
    schema: 'edhr-template-designer-react' as const,
    version: 1 as const,
    templateId: row.id,
    versionId: version.id,
    templateName: row.name,
    versionLabel: version.version,
  };

  const parsedModel = safeParse(version.modelDesignJson);
  const parsedCanvas = safeParse(version.canvasDesignJson);
  const parsedWorkflow = safeParse(version.workflowDesignJson);

  return createEmptyTemplateDesignerDocument(meta, {
    model: isReactTemplateDesignerPayload(parsedModel) ? parsedModel.payload : undefined,
    canvas: isReactTemplateDesignerPayload(parsedCanvas) ? parsedCanvas.payload : undefined,
    workflow: isReactTemplateDesignerPayload(parsedWorkflow) ? parsedWorkflow.payload : undefined,
  });
}
```

```tsx
// frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx
useEffect(() => {
  if (!row || !version) return;
  const document = parseReactTemplateDesignerDocument(row, version);
  useTemplateDesignerStore.getState().setDocument(document);
  useTemplateDesignerStore.getState().markSaved();
}, [row, version]);

const handleClose = () => {
  if (isDirty() && !window.confirm('当前 React 设计有未保存修改，确认关闭吗？')) return;
  onClose();
};

const handleSave = async () => {
  if (!document) return;
  await onSave(serializeTemplateDesignerDocument(document));
  markSaved();
};
```

```tsx
// frontend/src/pages/master-data/TemplateModelingPage.tsx
<TemplateDesignerReactDialog
  open={reactDesignerState.open}
  row={reactDesignerState.row}
  version={reactDesignerState.version}
  saving={saveDesignerMutation.isPending}
  onClose={() => setReactDesignerState({ open: false, row: null, version: null })}
  onSave={(payload) => saveDesignerMutation.mutateAsync(payload)}
/>
```

- [ ] **Step 4: Run verification and build**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react && npm run build`

Expected: both commands succeed.

- [ ] **Step 5: Commit**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
git add frontend/scripts/verify-template-designer-react.mjs \
  frontend/src/pages/master-data/TemplateModelingPage.tsx \
  frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx \
  frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx \
  frontend/src/pages/master-data/template-designer-react/utils/document.ts
git commit -m "feat: wire react designer save and load"
```

### Task 4: Field Registry and Model Tab

**Files:**
- Create: `frontend/src/pages/master-data/template-designer-react/registry/fieldRegistry.ts`
- Create: `frontend/src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx`
- Create: `frontend/src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`
- Modify: `frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Add failing model-tab checks**

```js
// append to frontend/scripts/verify-template-designer-react.mjs
const modelTab = read('../src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx');
const fieldRegistry = read('../src/pages/master-data/template-designer-react/registry/fieldRegistry.ts');
const propertyRenderer = read('../src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx');

if (!fieldRegistry.includes('inputnumber')) failures.push('fieldRegistry.ts: missing inputnumber field definition');
if (!fieldRegistry.includes('userpicker')) failures.push('fieldRegistry.ts: missing userpicker field definition');
if (!modelTab.includes('新增字段')) failures.push('ModelTab.tsx: missing add field action');
if (!modelTab.includes('字段类型')) failures.push('ModelTab.tsx: missing field type editor');
if (!propertyRenderer.includes('TextField')) failures.push('PropertyFormRenderer.tsx: missing MUI text editor rendering');
```

- [ ] **Step 2: Run verification and confirm RED**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react`

Expected: FAIL with missing field registry and model tab markers.

- [ ] **Step 3: Implement the field registry, property renderer, and model tab**

```ts
// frontend/src/pages/master-data/template-designer-react/registry/fieldRegistry.ts
export const fieldRegistry: FieldTypeDefinition[] = [
  createTextFieldDefinition('input', '单行文本'),
  createTextFieldDefinition('textarea', '多行文本'),
  createNumberFieldDefinition('inputnumber', '整数'),
  createNumberFieldDefinition('inputdouble', '小数'),
  createOptionFieldDefinition('radio', '单选'),
  createOptionFieldDefinition('checkbox', '复选'),
  createOptionFieldDefinition('select', '下拉'),
  createBooleanFieldDefinition('switch', '开关'),
  createDateFieldDefinition('datepicker', '日期'),
  createDateFieldDefinition('datetimepicker', '日期时间'),
  createDateFieldDefinition('timepicker', '时间'),
  createPickerFieldDefinition('userpicker', '人员'),
  createPickerFieldDefinition('department', '部门'),
  createContainerFieldDefinition('sub-table', '子表'),
  createReadonlyFieldDefinition('readonlycmp', '只读文本'),
];
```

```tsx
// frontend/src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx
<Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
  <Typography variant="h6">字段模型</Typography>
  <Button variant="contained" onClick={() => addField('input')}>新增字段</Button>
</Stack>
<List>
  {fields.map((field) => (
    <ListItemButton key={field.id} selected={field.id === selectedFieldId} onClick={() => setSelectedField(field.id)}>
      <ListItemText primary={field.name || '未命名字段'} secondary={`${field.code || '-'} / ${field.type}`} />
    </ListItemButton>
  ))}
</List>
<PropertyFormRenderer
  title="字段配置"
  schema={selectedFieldSchema}
  value={selectedField}
  onChange={(patch) => updateField(selectedField.id, patch)}
/>
```

```tsx
// frontend/src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx
if (item.editor === 'text') {
  return (
    <TextField
      key={item.key}
      size="small"
      label={item.label}
      value={String(value[item.key] ?? '')}
      onChange={(event) => onChange({ [item.key]: event.target.value })}
      fullWidth
    />
  );
}
```

- [ ] **Step 4: Run verification and build**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react && npm run build`

Expected: verify script passes; build exits `0`.

- [ ] **Step 5: Commit**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
git add frontend/scripts/verify-template-designer-react.mjs \
  frontend/src/pages/master-data/template-designer-react/registry/fieldRegistry.ts \
  frontend/src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx \
  frontend/src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx \
  frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts \
  frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx
git commit -m "feat: add react designer model tab"
```

### Task 5: Canvas Registry, Sidebar, Inspector, and Recursive Renderer

**Files:**
- Create: `frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx`
- Create: `frontend/src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx`
- Create: `frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx`
- Create: `frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx`
- Create: `frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasDropZone.tsx`
- Create: `frontend/src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`
- Modify: `frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Add failing canvas infrastructure checks**

```js
// append to frontend/scripts/verify-template-designer-react.mjs
const canvasTab = read('../src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx');
const componentRegistry = read('../src/pages/master-data/template-designer-react/registry/componentRegistry.tsx');
const sidebar = read('../src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx');
const inspector = read('../src/pages/master-data/template-designer-react/components/DesignerInspector.tsx');
const renderer = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx');

if (!componentRegistry.includes('layout-container')) failures.push('componentRegistry.tsx: missing layout-container component definition');
if (!componentRegistry.includes('bottom-button-container')) failures.push('componentRegistry.tsx: missing bottom-button-container component definition');
if (!canvasTab.includes('字段组件')) failures.push('CanvasTab.tsx: missing field/component toolbox heading');
if (!sidebar.includes('基础字段')) failures.push('DesignerSidebar.tsx: missing field section title');
if (!inspector.includes('属性配置')) failures.push('DesignerInspector.tsx: missing inspector title');
if (!renderer.includes('children?.map')) failures.push('CanvasNodeRenderer.tsx: missing recursive children render');
```

- [ ] **Step 2: Run verification and confirm RED**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react`

Expected: FAIL with missing canvas registry and renderer markers.

- [ ] **Step 3: Implement the registry-driven canvas workspace**

```tsx
// frontend/src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx
<Box sx={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr) 320px', gap: 2, height: '100%' }}>
  <DesignerSidebar />
  <Paper sx={{ p: 2, minHeight: 0, overflow: 'auto' }}>
    <Typography variant="subtitle1" sx={{ mb: 2 }}>字段组件</Typography>
    <CanvasDropZone parentId={null} />
    <CanvasNodeRenderer nodes={currentPage.nodes} />
  </Paper>
  <DesignerInspector />
</Box>
```

```tsx
// frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx
export default function CanvasNodeRenderer({ nodes }: { nodes: CanvasNode[] }) {
  return (
    <>
      {nodes.map((node) => {
        const definition = getComponentDefinition(node.type);
        const Renderer = definition.renderDesigner;
        return (
          <Box key={node.id} sx={{ mb: 1 }}>
            <Renderer node={node} />
            {node.children?.length ? <CanvasNodeRenderer nodes={node.children} /> : null}
          </Box>
        );
      })}
    </>
  );
}
```

```tsx
// frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx
export const componentRegistry: DesignerComponentDefinition[] = [
  createFieldComponentDefinition('input', '输入框'),
  createFieldComponentDefinition('textarea', '文本域'),
  createFieldComponentDefinition('inputnumber', '整数框'),
  createFieldComponentDefinition('inputdouble', '小数框'),
  createFieldComponentDefinition('radio', '单选框'),
  createFieldComponentDefinition('checkbox', '复选框'),
  createFieldComponentDefinition('select', '下拉框'),
  createFieldComponentDefinition('switch', '开关'),
  createFieldComponentDefinition('datepicker', '日期'),
  createFieldComponentDefinition('datetimepicker', '日期时间'),
  createFieldComponentDefinition('timepicker', '时间'),
  createFieldComponentDefinition('userpicker', '人员选择'),
  createFieldComponentDefinition('department', '部门选择'),
  createFieldComponentDefinition('readonlycmp', '只读文本'),
  createContainerDefinition('form', '表单容器'),
  createContainerDefinition('grid', '栅格'),
  createContainerDefinition('grid-col', '栅格列'),
  createContainerDefinition('layout-container', '布局容器'),
  createContainerDefinition('left-right-columns', '左右布局'),
  createContainerDefinition('tabs', '标签页'),
  createContainerDefinition('divider', '分割线'),
  createContainerDefinition('sub-table', '子表'),
  createContainerDefinition('button-container', '按钮容器'),
  createContainerDefinition('bottom-button-container', '底部按钮容器'),
];
```

- [ ] **Step 4: Run verification and build**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react && npm run build`

Expected: commands succeed.

- [ ] **Step 5: Commit**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
git add frontend/scripts/verify-template-designer-react.mjs \
  frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx \
  frontend/src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx \
  frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx \
  frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx \
  frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasDropZone.tsx \
  frontend/src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx \
  frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts \
  frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx
git commit -m "feat: add react designer canvas workspace"
```

### Task 6: Field Binding, Property Schemas, and First-Version Canvas Behaviors

**Files:**
- Modify: `frontend/src/pages/master-data/template-designer-react/registry/fieldRegistry.ts`
- Modify: `frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasDropZone.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `frontend/scripts/verify-template-designer-react.mjs`

- [ ] **Step 1: Add failing field-binding and property-schema checks**

```js
// append to frontend/scripts/verify-template-designer-react.mjs
if (!componentRegistry.includes('propSchema')) failures.push('componentRegistry.tsx: missing propSchema support');
if (!fieldRegistry.includes('compatibleComponents')) failures.push('fieldRegistry.ts: missing compatibleComponents');
if (!inspector.includes('绑定字段')) failures.push('DesignerInspector.tsx: missing field binding editor');
if (!storeFile.includes('bindFieldToNode')) failures.push('useTemplateDesignerStore.ts: missing bindFieldToNode action');
if (!storeFile.includes('insertNode')) failures.push('useTemplateDesignerStore.ts: missing insertNode action');
```

- [ ] **Step 2: Run verification and confirm RED**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react`

Expected: FAIL with missing binding and property-schema markers.

- [ ] **Step 3: Implement node insertion, binding, and property editing**

```ts
// frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts
insertNode: (parentId, node) => set((state) => ({
  document: state.document ? insertNodeIntoCurrentPage(state.document, parentId, node) : state.document,
})),
bindFieldToNode: (nodeId, fieldId) => set((state) => ({
  document: state.document ? patchNode(state.document, nodeId, { bindings: { fieldId } }) : state.document,
})),
updateNodeProps: (nodeId, patch) => set((state) => ({
  document: state.document ? patchNode(state.document, nodeId, { props: { ...getNode(state.document, nodeId)?.props, ...patch } }) : state.document,
})),
```

```tsx
// frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx
<Autocomplete
  size="small"
  options={bindableFields}
  getOptionLabel={(option) => `${option.name} (${option.code})`}
  value={selectedBindingField}
  onChange={(_, option) => bindFieldToNode(selectedNode.id, option?.id ?? '')}
  renderInput={(params) => <TextField {...params} label="绑定字段" />}
/>
<PropertyFormRenderer
  title="属性配置"
  schema={selectedComponentDefinition.propSchema}
  value={selectedNode.props}
  onChange={(patch) => updateNodeProps(selectedNode.id, patch)}
/>
```

```tsx
// frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasDropZone.tsx
<Button
  size="small"
  onClick={() => insertNode(parentId, createDefaultNode('input'))}
>
  点击插入输入框
</Button>
```

- [ ] **Step 4: Run verification and build**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react && npm run build`

Expected: both commands succeed.

- [ ] **Step 5: Commit**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
git add frontend/scripts/verify-template-designer-react.mjs \
  frontend/src/pages/master-data/template-designer-react/registry/fieldRegistry.ts \
  frontend/src/pages/master-data/template-designer-react/registry/componentRegistry.tsx \
  frontend/src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx \
  frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx \
  frontend/src/pages/master-data/template-designer-react/components/canvas/CanvasDropZone.tsx \
  frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts
git commit -m "feat: add react designer field bindings"
```

### Task 7: Workflow Tab, Final Integration, and End-to-End Verification

**Files:**
- Create: `frontend/src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx`
- Modify: `frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`
- Modify: `frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`
- Modify: `frontend/scripts/verify-template-designer-react.mjs`
- Modify: `frontend/package.json`

- [ ] **Step 1: Add failing workflow and final contract checks**

```js
// append to frontend/scripts/verify-template-designer-react.mjs
const workflowTab = read('../src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx');

if (!workflowTab.includes('ReactFlow')) failures.push('WorkflowTab.tsx: missing ReactFlow canvas');
if (!workflowTab.includes('addEdge')) failures.push('WorkflowTab.tsx: missing edge creation support');
if (!workflowTab.includes('新增节点')) failures.push('WorkflowTab.tsx: missing add node action');
if (!shell.includes('save') && !shell.includes('handleSave')) failures.push('TemplateDesignerReactShell.tsx: missing save action handler');
```

- [ ] **Step 2: Run verification and confirm RED**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react`

Expected: FAIL with missing workflow markers.

- [ ] **Step 3: Implement the first workflow tab**

```tsx
// frontend/src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function WorkflowTab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (connection: Connection) => setEdges((current) => addEdge(connection, current));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Button variant="contained" onClick={appendNode}>新增节点</Button>
      <Box sx={{ flex: 1, minHeight: 480, bgcolor: '#fff' }}>
        <ReactFlowProvider>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}>
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 4: Run the full verification gate**

Run: `cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend && npm run verify:template-designer-react && npm run verify:template-designer && npm run build`

Expected:
- `verify-template-designer-react passed`
- existing `verify-template-designer` still passes
- build exits `0`

- [ ] **Step 5: Commit**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
git add frontend/scripts/verify-template-designer-react.mjs \
  frontend/src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx \
  frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts \
  frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx \
  frontend/package.json
git commit -m "feat: add react designer workflow tab"
```

## Self-Review

### Spec coverage

- Parallel React entry beside the existing Vue entry: covered by Task 1 and Task 3.
- Independent React module under the main frontend app: covered by Task 1 and the File Structure section.
- Single-document Zustand architecture: covered by Task 2 and Task 3.
- Field/component/config emphasis for the canvas: covered by Task 4, Task 5, and Task 6.
- First-version component and field set: covered by Task 4, Task 5, and Task 6.
- Workflow tab based on the existing stack: covered by Task 7.
- Save/load via existing backend contract with React-specific schema payloads: covered by Task 3.
- Repo-native verification plus build gate: covered by every task and the final Task 7 gate.

### Placeholder scan

- No `TODO`, `TBD`, “implement later”, or “similar to Task N” placeholders remain.
- Every task lists exact file paths, explicit commands, and concrete code snippets.

### Type consistency

- Shared tab key is consistently `model | canvas | workflow`.
- Persisted schema marker is consistently `edhr-template-designer-react`.
- Save payload remains `modelDesignJson`, `canvasDesignJson`, `workflowDesignJson`.
- Store actions referenced later are defined earlier: `setActiveTab`, `markSaved`, `insertNode`, `bindFieldToNode`, `updateNodeProps`.

