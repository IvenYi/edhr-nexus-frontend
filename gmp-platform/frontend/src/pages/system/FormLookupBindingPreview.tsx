import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import AppDialog from '@/components/AppDialog';
import { getFormLookupBindingPreview, type FormLookupBinding } from '@/api/formLookupCatalog';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';

export default function FormLookupBindingPreview({ itemId, binding, onClose }: { itemId: string; binding: FormLookupBinding; onClose: () => void }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [located, setLocated] = useState<boolean | null>(null);
  const query = useQuery({ queryKey: ['form-lookup-binding-preview', itemId, binding.versionId, binding.revision],
    queryFn: () => getFormLookupBindingPreview(itemId, binding), retry: false });
  const document = useMemo(() => query.data ? parseReactTemplateDesignerDocument({ id: binding.templateId, name: binding.templateName }, query.data) : null, [query.data, binding]);
  const currentBinding = document?.model.projection?.bindings.find(row => row.id === binding.bindingId);
  const matches = currentBinding?.sources[itemId] === binding.fieldId && (currentBinding.tableId ?? '') === binding.tableId;
  useEffect(() => {
    setLocated(null);
    if (!document || !matches) return;
    const frame = requestAnimationFrame(() => {
      const field = previewRef.current?.querySelector('[data-form-preview-highlighted="true"]');
      setLocated(Boolean(field)); field?.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
  }, [document, matches]);
  return <AppDialog open onClose={onClose} closeAriaLabel="关闭表单预览" fullWidth maxWidth="lg">
    <DialogTitle>{binding.templateName} · {binding.version} · {binding.fieldName}</DialogTitle>
    <DialogContent dividers>
      {query.isPending ? <Alert severity="info">正在读取表单版式…</Alert> : query.isError ? <Alert severity="error" action={<Button onClick={() => void query.refetch()}>重试</Button>}>{query.error instanceof Error ? query.error.message : '表单预览读取失败'}</Alert> : <>
        {!matches ? <Alert severity="warning" sx={{ mb: 1 }}>该关联已变化，请返回关联配置并刷新。</Alert> : located === false ? <Alert severity="info" sx={{ mb: 1 }}>此字段尚未放置在表单版式中，无法定位。</Alert> : null}
        <Box ref={previewRef} sx={{ display: 'flex', minHeight: 0, height: '65vh', overflow: 'hidden' }}>{document && <FormCanvasPreview document={document} fullPage
          interaction={{ isFieldHighlighted: (fieldId, tableId) => Boolean(matches && fieldId === binding.fieldId && (tableId ?? '') === binding.tableId) }}
          runtime={{ values: {}, disabled: true, onChange: () => {} }} />}</Box>
      </>}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>返回关联配置</Button></DialogActions>
  </AppDialog>;
}
