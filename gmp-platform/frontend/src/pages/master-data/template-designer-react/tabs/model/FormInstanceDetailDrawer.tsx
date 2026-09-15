import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, CircularProgress, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { getFormInstanceRecord } from '@/api/form-instance-records';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '../../utils/document';

export default function FormInstanceDetailDrawer({ templateId, recordId, onClose }: { templateId: string; recordId: string | null; onClose: () => void }) {
  const query = useQuery({ queryKey: ['form-instance-detail', templateId, recordId], queryFn: () => getFormInstanceRecord(templateId, recordId!), enabled: Boolean(recordId), retry: false });
  const record = query.data;
  const document = useMemo(() => {
    if (!record) return null;
    const form = record.snapshot;
    const parsed = parseReactTemplateDesignerDocument({ id: record.templateId, name: form.name }, {
      id: record.versionId, version: form.version, modelDesignJson: form.model, canvasDesignJson: form.canvas,
    });
    parsed.model.fields = form.fields.map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index }));
    return parsed;
  }, [record]);
  return <Drawer anchor="right" open={Boolean(recordId)} onClose={onClose} PaperProps={{ sx: { width: 'min(1100px, 94vw)' } }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: '1px solid #e4e7ed' }}>
      <Box><Typography variant="h6">{record?.snapshot.name || '表单记录'}</Typography>
        {record ? <Typography color="text.secondary" variant="body2">{record.instanceNo} · 模板版本 {record.snapshot.version}</Typography> : null}
      </Box>
      <IconButton aria-label="关闭表单记录" onClick={onClose}><CloseRounded /></IconButton>
    </Stack>
    <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
      {query.isFetching ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress aria-label="加载表单记录" /></Box> : null}
      {query.isError ? <Alert severity="error">表单记录加载失败，请检查访问权限或稍后重试。</Alert> : null}
      {!query.isFetching && !query.isError && record && document ? <>
        {record.legacy ? <Alert severity="info" sx={{ mb: 2 }}>历史记录已补充实例号；原始创建人和创建时间未知时显示为空。</Alert> : null}
        <FormCanvasPreview document={document} runtime={{ values: record.fieldValues, disabled: true, onChange: () => {} }} />
      </> : null}
    </Box>
  </Drawer>;
}
