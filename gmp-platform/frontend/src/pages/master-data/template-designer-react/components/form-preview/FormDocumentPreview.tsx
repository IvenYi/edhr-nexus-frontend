import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { FormRuntimeContext, FormRuntimeField, type FormRuntime } from '@/components/form-renderer/FormRuntimeField';
import SignatureDisplay from '@/components/form-renderer/SignatureDisplay';
import { resolveReferenceField } from '@/components/form-renderer/referenceConfig';
import { readSignaturePresentation } from '@/components/form-renderer/signaturePresentation';
import type { CanvasNode, ModelField, TemplateDesignerDocument } from '../../types';
import WordCanvasPreview from '../canvas/WordCanvasPreview';
import { FormSheetPage, MockFillPreviewPage, renderMockFillControl } from '../mock-fill/MockFillDialog';

export interface FormDocumentPreviewProps {
  document: TemplateDesignerDocument;
  /** Omit runtime for a non-interactive template preview. */
  runtime?: FormRuntime;
  fieldPermissions?: Record<string, 'EDIT' | 'READ_ONLY'>;
  fallback?: ReactNode;
}

const ignoreChange = () => {};
const flattenNodes = (nodes: CanvasNode[]): CanvasNode[] => nodes.flatMap(node => [node, ...flattenNodes(node.children ?? [])]);

export function bindFormPreviewField(runtime: FormRuntime, node: CanvasNode, field: ModelField, recordIndex: number, permissions: FormDocumentPreviewProps['fieldPermissions']) {
  const tableId = node.bindings?.subTableId;
  const rows = tableId && Array.isArray(runtime.values[tableId]) ? runtime.values[tableId] as Record<string, unknown>[] : [];
  const readOnly = Boolean(runtime.disabled || node.bindings?.readonly || permissions?.[field.id] === 'READ_ONLY' || (tableId && permissions?.[tableId] === 'READ_ONLY'));
  return {
    ...runtime,
    disabled: readOnly,
    values: tableId ? rows[recordIndex] ?? {} : runtime.values,
    referenceValues: tableId ? { ...runtime.values, ...rows[recordIndex] } : runtime.values,
    onChange: (id: string, value: unknown) => {
      if (readOnly || field.type === 'signature') return;
      if (!tableId) { runtime.onChange(id, value); return; }
      const nextRows = Array.from({ length: Math.max(rows.length, recordIndex + 1) }, (_, index) => rows[index] ?? {});
      nextRows[recordIndex] = { ...nextRows[recordIndex], [id]: value };
      runtime.onChange(tableId, nextRows);
    },
  };
}

/** Shared paper, cells and controls for template preview and production filling. */
export default function FormDocumentPreview({ document, runtime, fieldPermissions, fallback }: FormDocumentPreviewProps) {
  const allNodes = document.canvas.pages.flatMap(page => flattenNodes(page.nodes));
  const tableNodes = allNodes.filter(node => node.type === 'sub-table' && node.bindings?.subTableRegion);
  const tableReadOnly = (node: CanvasNode) => Boolean(runtime?.disabled || node.bindings?.readonly || fieldPermissions?.[node.bindings?.fieldId ?? ''] === 'READ_ONLY');
  const recordCounts = Object.fromEntries(tableNodes.map(node => {
    const rows = runtime?.values[node.bindings?.fieldId ?? ''];
    return [node.id, Math.max(1, Array.isArray(rows) ? rows.length : 0)];
  }));
  const changeRowCount = (nodeId: string, delta: number) => {
    const node = tableNodes.find(entry => entry.id === nodeId);
    const fieldId = node?.bindings?.fieldId;
    if (!runtime || !node || !fieldId || tableReadOnly(node)) return;
    const current = Array.isArray(runtime.values[fieldId]) ? runtime.values[fieldId] as Record<string, unknown>[] : [];
    const count = Math.max(1, current.length);
    runtime.onChange(fieldId, Array.from({ length: Math.max(1, count + delta) }, (_, index) => current[index] ?? {}));
  };
  const renderField = (node: CanvasNode, suppliedField: ModelField | null, recordIndex = 0): ReactNode => {
    if (node.bindings?.hidden) return null;
    const field = suppliedField ?? node.bindings?.subTableField ?? document.model.fields.find(entry => entry.id === (node.bindings?.subTableFieldId ?? node.bindings?.fieldId)) ?? null;
    const table = tableNodes.find(entry => entry.bindings?.fieldId === node.bindings?.subTableId);
    const binding = runtime && field ? bindFormPreviewField({ ...runtime, disabled: runtime.disabled || Boolean(table?.bindings?.readonly) }, node, field, recordIndex, fieldPermissions) : undefined;
    const value = binding && field ? binding.values[field.id] : undefined;
    if (binding && field && (['attachment', 'image'].includes(field.type) || (field.type === 'reference' && !binding.disabled))) {
      return <FormRuntimeContext.Provider value={binding}><FormRuntimeField field={resolveReferenceField(field, node)} readOnly={binding.disabled} canvas /></FormRuntimeContext.Provider>;
    }
    if (binding && field?.type === 'signature' && readSignaturePresentation(value)) {
      return <SignatureDisplay value={value} displayMode={node.bindings?.widgetConfig?.signatureDisplayMode ?? field.typeConfig.signatureDisplayMode} />;
    }
    const readOnly = !binding || binding.disabled || field?.type === 'signature';
    const displayValue = field?.type === 'reference' && value && typeof value === 'object' && 'name' in value ? value.name : value;
    const rawOptions = field?.typeConfig.options;
    const options = binding && field && ['singleSelect', 'multiSelect'].includes(field.type) ? (
      Array.isArray(rawOptions) ? rawOptions.filter(item => item.status !== 'disabled').map(item => ({ key: String(item.value), value: String(item.value), label: String(item.label) }))
        : String(rawOptions ?? '').split('\n').filter(Boolean).map(line => { const [label, value] = line.split(':'); return { key: value ?? label, value: value ?? label, label }; })
    ) : undefined;
    const control = renderMockFillControl({
      node, field, previewOnly: readOnly, options,
      valueKey: field?.id ?? node.id,
      values: binding && field ? { [field.id]: (displayValue ?? '') as Parameters<typeof renderMockFillControl>[0]['values'][string] } : {},
      onValueChange: (id, next) => { if (!readOnly) binding?.onChange(id, next); },
      onSignatureRequest: ignoreChange,
    });
    return <Box {...(readOnly ? { inert: '' } : {})} sx={{ height: '100%', minHeight: 0, minWidth: 0 }}>{control}</Box>;
  };
  return <Box data-form-document-preview="true" sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: '#eef3f8', p: 3 }}>
    <Stack {...(!runtime || runtime.disabled ? { inert: '' } : {})} spacing={3} sx={{ minWidth: 'fit-content' }}>
      {document.canvas.pages.map(page => page.wordDocument ? (
        <WordCanvasPreview key={page.id} page={page} embedded renderField={node => renderField(node, null)} />
      ) : Object.keys(page.cells).length || page.nodes.length || page.images.length ? (
        runtime ? <FormSheetPage key={page.id} page={page} document={document} values={{}} subTableRecordCounts={recordCounts}
          renderField={renderField} isSubTableReadOnly={tableReadOnly} onValueChange={ignoreChange} onSignatureRequest={ignoreChange}
          onAddSubTableRecord={id => changeRowCount(id, 1)} onRemoveSubTableRecord={id => changeRowCount(id, -1)} />
          : <MockFillPreviewPage key={page.id} page={page} document={document} />
      ) : <Box key={page.id}>{fallback ?? <Typography color="text.secondary">暂无表单版式</Typography>}</Box>)}
      {!document.canvas.pages.length ? fallback ?? <Typography color="text.secondary">暂无表单版式</Typography> : null}
    </Stack>
  </Box>;
}
