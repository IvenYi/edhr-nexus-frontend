import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { FormRuntimeContext, FormRuntimeField, type FormRuntime } from '@/components/form-renderer/FormRuntimeField';
import SignatureDisplay from '@/components/form-renderer/SignatureDisplay';
import { resolveReferenceField } from '@/components/form-renderer/referenceConfig';
import { readSignaturePresentation } from '@/components/form-renderer/signaturePresentation';
import type { CanvasNode, ModelField, TemplateDesignerDocument } from '../../types';
import type { PreviewFieldInteraction } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import WordCanvasPreview from '../canvas/WordCanvasPreview';
import { FormSheetPage, MockFillPreviewPage, renderMockFillControl } from '../mock-fill/MockFillDialog';

export interface FormDocumentPreviewProps {
  document: TemplateDesignerDocument;
  /** Omit runtime for a non-interactive template preview. */
  runtime?: FormRuntime;
  fieldPermissions?: Record<string, 'EDIT' | 'READ_ONLY'>;
  interaction?: PreviewFieldInteraction;
  fallback?: ReactNode;
}

const ignoreChange = () => {};
const flattenNodes = (nodes: CanvasNode[]): CanvasNode[] => nodes.flatMap(node => [node, ...flattenNodes(node.children ?? [])]);

export function bindFormPreviewField(runtime: FormRuntime, node: CanvasNode, field: ModelField, recordIndex: number, permissions: FormDocumentPreviewProps['fieldPermissions']) {
  const tableId = node.bindings?.subTableId;
  const rows = tableId && Array.isArray(runtime.values[tableId]) ? runtime.values[tableId] as Record<string, unknown>[] : [];
  const signatureAllowed = field.type === 'signature' && runtime.signaturePermissions?.[tableId || field.id] === 'EDIT';
  const readOnly = Boolean(runtime.disabled || node.bindings?.readonly || (!signatureAllowed && permissions?.[field.id] === 'READ_ONLY') || (tableId && permissions?.[tableId] === 'READ_ONLY'));
  return {
    ...runtime,
    disabled: readOnly,
    values: tableId ? rows[recordIndex] ?? {} : runtime.values,
    referenceValues: tableId ? { ...runtime.values, ...rows[recordIndex] } : runtime.values,
    onSignatureRequest: runtime.onSignatureRequest && !readOnly ? () => runtime.onSignatureRequest?.({ fieldId: field.id, ...(tableId ? { tableId, rowIndex: recordIndex } : {}) }) : undefined,
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
export default function FormDocumentPreview({ document, runtime, fieldPermissions, interaction, fallback }: FormDocumentPreviewProps) {
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
    const readOnly = !binding || binding.disabled || (field?.type === 'signature' && (!binding.onSignatureRequest || binding.signaturePermissions?.[node.bindings?.subTableId || field.id] !== 'EDIT'));
    const displayValue = field?.type === 'reference' && value && typeof value === 'object' && 'name' in value ? value.name : value;
    const rawOptions = field?.typeConfig.options;
    const options = binding && field && ['singleSelect', 'multiSelect'].includes(field.type) ? (
      Array.isArray(rawOptions) ? rawOptions.filter(item => item.status !== 'disabled').map(item => ({ key: String(item.value), value: String(item.value), label: String(item.label) }))
        : String(rawOptions ?? '').split('\n').filter(Boolean).map(line => { const [label, value] = line.split(':'); return { key: value ?? label, value: value ?? label, label }; })
    ) : undefined;
    const fallbackControl = () => renderMockFillControl({
      node, field, previewOnly: readOnly, options,
      valueKey: field?.id ?? node.id,
      values: binding && field ? { [field.id]: (field.type === 'signature' && binding.signaturesInvalidated ? '' : displayValue ?? '') as Parameters<typeof renderMockFillControl>[0]['values'][string] } : {},
      onValueChange: (id, next) => { if (!readOnly) binding?.onChange(id, next); },
      onSignatureRequest: () => { if (!readOnly && field) binding?.onSignatureRequest?.(); },
    });
    const control = binding && field && (['attachment', 'image'].includes(field.type) || (field.type === 'reference' && !binding.disabled))
      ? <FormRuntimeContext.Provider value={binding}><FormRuntimeField field={resolveReferenceField(field, node)} readOnly={binding.disabled} canvas /></FormRuntimeContext.Provider>
      : binding && field?.type === 'signature' && !binding.signaturesInvalidated && readSignaturePresentation(value)
        ? <SignatureDisplay value={value} displayMode={node.bindings?.widgetConfig?.signatureDisplayMode ?? field.typeConfig.signatureDisplayMode} />
        : fallbackControl();
    const actions = field ? interaction?.actionsForField?.({ id: field.id, name: field.name, type: field.type }) ?? [] : [];
    const highlighted = Boolean(field && interaction?.highlightFieldId === field.id);
    return <Box onMouseEnter={() => field && interaction?.onFieldHover?.(field.id)} onMouseLeave={() => interaction?.onFieldHover?.(null)}
      sx={{ position: 'relative', height: '100%', minHeight: 0, minWidth: 0,
        outline: highlighted ? '2px solid #1677c8' : undefined,
        '&:hover .preview-field-actions, &:focus-within .preview-field-actions': { opacity: 1 } }}>
      <Box {...(readOnly ? { inert: '' } : {})} sx={{ height: '100%', minHeight: 0, minWidth: 0,
        ...(interaction && readOnly ? { bgcolor: '#f3f5f7', '& .MuiInputBase-root': { bgcolor: '#f3f5f7' } } : {}) }}>{control}</Box>
      {field && actions.length ? <Box className="preview-field-actions" sx={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 0.25, opacity: 0,
        bgcolor: 'rgba(255,255,255,.96)', border: '1px solid #d9e4f0', borderRadius: 1, boxShadow: '0 2px 8px rgba(31,45,61,.12)' }}>
        {actions.map(action => <Tooltip key={action.key} title={action.title} arrow><IconButton size="small" aria-label={action.title}
          onClick={event => { event.stopPropagation(); action.onClick(field.id, event.currentTarget); }} sx={{ width: 24, height: 24 }}>{action.icon}</IconButton></Tooltip>)}
      </Box> : null}
    </Box>;
  };
  return <Box data-form-document-preview="true" sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: '#eef3f8', p: 3 }}>
    <Stack {...((!runtime || runtime.disabled) && !interaction ? { inert: '' } : {})} spacing={3} sx={{ minWidth: 'fit-content' }}>
      {document.canvas.pages.map(page => page.wordDocument ? (
        <WordCanvasPreview key={page.id} page={page} embedded renderField={node => renderField(node, null)} />
      ) : Object.keys(page.cells).length || page.nodes.length || page.images.length ? (
        runtime ? <FormSheetPage key={page.id} page={page} document={document} values={{}} subTableRecordCounts={recordCounts}
          renderField={renderField} isSubTableReadOnly={node => Boolean(interaction) || tableReadOnly(node)} onValueChange={ignoreChange} onSignatureRequest={ignoreChange}
          onAddSubTableRecord={id => changeRowCount(id, 1)} onRemoveSubTableRecord={id => changeRowCount(id, -1)} />
          : <MockFillPreviewPage key={page.id} page={page} document={document} />
      ) : <Box key={page.id}>{fallback ?? <Typography color="text.secondary">暂无表单版式</Typography>}</Box>)}
      {!document.canvas.pages.length ? fallback ?? <Typography color="text.secondary">暂无表单版式</Typography> : null}
    </Stack>
  </Box>;
}
