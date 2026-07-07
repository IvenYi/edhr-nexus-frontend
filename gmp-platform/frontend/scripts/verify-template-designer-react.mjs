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
const documentTypes = read('../src/pages/master-data/template-designer-react/types/document.ts');
const storeFile = read('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts');
const documentUtils = read('../src/pages/master-data/template-designer-react/utils/document.ts');
const modelTab = read('../src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx');
const fieldRegistry = read('../src/pages/master-data/template-designer-react/registry/fieldRegistry.ts');
const propertyRenderer = read('../src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx');
const canvasTab = read('../src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx');
const workflowTab = read('../src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx');
const componentRegistry = read('../src/pages/master-data/template-designer-react/registry/componentRegistry.tsx');
const sidebar = read('../src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx');
const inspector = read('../src/pages/master-data/template-designer-react/components/DesignerInspector.tsx');
const renderer = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx');

if (!packageJson.includes('verify:template-designer-react')) failures.push('package.json: missing verify:template-designer-react script');
if (!templateModelingPage.includes('React设计')) failures.push('TemplateModelingPage.tsx: missing React设计 button label');
if (!templateModelingPage.includes('TemplateDesignerReactDialog')) failures.push('TemplateModelingPage.tsx: missing React dialog mount');
if (!dialog.includes('fullScreen')) failures.push('TemplateDesignerReactDialog.tsx: missing fullScreen dialog');
if (!shell.includes('建模设计')) failures.push('TemplateDesignerReactShell.tsx: missing model tab');
if (!shell.includes('表单设计')) failures.push('TemplateDesignerReactShell.tsx: missing canvas tab');
if (!shell.includes('流程设计')) failures.push('TemplateDesignerReactShell.tsx: missing workflow tab');
if (!documentTypes.includes("schema: 'edhr-template-designer-react'")) failures.push('document.ts: missing persisted schema marker');
if (!documentTypes.includes('export interface TemplateDesignerDocument')) failures.push('document.ts: missing TemplateDesignerDocument interface');
if (!storeFile.includes('create<TemplateDesignerStore>')) failures.push('useTemplateDesignerStore.ts: missing Zustand store creation');
if (!storeFile.includes('setActiveTab')) failures.push('useTemplateDesignerStore.ts: missing setActiveTab action');
if (!storeFile.includes('markSaved')) failures.push('useTemplateDesignerStore.ts: missing markSaved action');
if (!documentUtils.includes('isReactTemplateDesignerPayload')) failures.push('document utils: missing schema guard');
if (!documentUtils.includes('parseReactTemplateDesignerDocument')) failures.push('document utils: missing persisted document parser');
if (!documentUtils.includes('serializeTemplateDesignerDocument')) failures.push('document utils: missing serializer');
if (!shell.includes('window.confirm')) failures.push('TemplateDesignerReactShell.tsx: missing dirty close confirmation');
if (!shell.includes('markSaved')) failures.push('TemplateDesignerReactShell.tsx: missing markSaved usage after save');
if (!fieldRegistry.includes('inputnumber')) failures.push('fieldRegistry.ts: missing inputnumber field definition');
if (!fieldRegistry.includes('userpicker')) failures.push('fieldRegistry.ts: missing userpicker field definition');
if (!fieldRegistry.includes('optionsText')) failures.push('fieldRegistry.ts: missing option field config schema');
if (!modelTab.includes('新增字段')) failures.push('ModelTab.tsx: missing add field action');
if (!modelTab.includes('字段类型')) failures.push('ModelTab.tsx: missing field type editor');
if (!modelTab.includes('MenuItem')) failures.push('ModelTab.tsx: missing MUI MenuItem field type selector');
if (!propertyRenderer.includes('TextField')) failures.push('PropertyFormRenderer.tsx: missing MUI text editor rendering');
if (!componentRegistry.includes('layout-container')) failures.push('componentRegistry.tsx: missing layout-container component definition');
if (!componentRegistry.includes('bottom-button-container')) failures.push('componentRegistry.tsx: missing bottom-button-container component definition');
if (!componentRegistry.includes('RadioGroup')) failures.push('componentRegistry.tsx: missing field renderer previews');
if (!canvasTab.includes('字段组件')) failures.push('CanvasTab.tsx: missing field/component toolbox heading');
if (!sidebar.includes('基础字段')) failures.push('DesignerSidebar.tsx: missing field section title');
if (!sidebar.includes('字段映射')) failures.push('DesignerSidebar.tsx: missing model-field mapping section');
if (!inspector.includes('属性配置')) failures.push('DesignerInspector.tsx: missing inspector title');
if (!renderer.includes('children?.map')) failures.push('CanvasNodeRenderer.tsx: missing recursive children render');
if (!renderer.includes('CanvasDropZone')) failures.push('CanvasNodeRenderer.tsx: missing child insert zone');
if (!componentRegistry.includes('propSchema')) failures.push('componentRegistry.tsx: missing propSchema support');
if (!fieldRegistry.includes('compatibleComponents')) failures.push('fieldRegistry.ts: missing compatibleComponents');
if (!inspector.includes('绑定字段')) failures.push('DesignerInspector.tsx: missing field binding editor');
if (!storeFile.includes('bindFieldToNode')) failures.push('useTemplateDesignerStore.ts: missing bindFieldToNode action');
if (!storeFile.includes('insertNode')) failures.push('useTemplateDesignerStore.ts: missing insertNode action');
if (!storeFile.includes('addNodeFromField')) failures.push('useTemplateDesignerStore.ts: missing addNodeFromField action');
if (!storeFile.includes('getFieldById')) failures.push('useTemplateDesignerStore.ts: missing getFieldById helper');
if (!storeFile.includes('syncBoundNodesForField')) failures.push('useTemplateDesignerStore.ts: missing bound-node sync helper');
if (!storeFile.includes('bindings?.fieldId === fieldId')) failures.push('useTemplateDesignerStore.ts: missing field-to-canvas propagation');
if (!workflowTab.includes('ReactFlow')) failures.push('WorkflowTab.tsx: missing ReactFlow canvas');
if (!workflowTab.includes('addEdge')) failures.push('WorkflowTab.tsx: missing edge creation support');
if (!workflowTab.includes('新增节点')) failures.push('WorkflowTab.tsx: missing add node action');

if (failures.length > 0) {
  console.error('verify-template-designer-react failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-template-designer-react passed');
