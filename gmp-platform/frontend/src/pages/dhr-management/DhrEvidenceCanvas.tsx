import { useMemo } from 'react';
import { CloseRounded, FolderOutlined } from '@mui/icons-material';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import type { DhrEvidenceRecord } from '@/api/dhr-instances';
import { FormCanvasPreview } from '@/pages/master-data/DhrTemplateWorkspaceDialog';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';

export function getRecordTitle(record: DhrEvidenceRecord) {
  return record.templateName || record.snapshot.name || '未命名表单';
}

function formDocument(record: DhrEvidenceRecord | null) {
  if (!record?.snapshot.model || !record.snapshot.canvas) return null;
  try {
    const document = parseReactTemplateDesignerDocument(
      { id: record.templateId, name: getRecordTitle(record) },
      {
        id: record.templateVersionId,
        version: record.templateVersion || record.snapshot.version || '',
        modelDesignJson: record.snapshot.model,
        canvasDesignJson: record.snapshot.canvas,
      },
    );
    const fields = Array.isArray(record.snapshot.fields) ? record.snapshot.fields : [];
    document.model.fields = fields.map((field, index) => ({
      ...field,
      typeConfig: field.typeConfig ?? {},
      status: field.status ?? 'enabled',
      sortOrder: field.sortOrder ?? index,
    })) as typeof document.model.fields;
    return document;
  } catch {
    return null;
  }
}

export function EvidenceCanvas({ record, emptyMessage }: { record: DhrEvidenceRecord | null; emptyMessage: string }) {
  const document = useMemo(() => formDocument(record), [record]);
  const fields = Array.isArray(record?.snapshot.fields) ? record.snapshot.fields : [];

  if (!record) {
    return <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', p: 3, color: '#909399', textAlign: 'center' }}>
      <Box><FolderOutlined sx={{ fontSize: 42, opacity: 0.45, mb: 1 }} /><Typography>{emptyMessage}</Typography></Box>
    </Box>;
  }
  if (document) return <FormCanvasPreview document={document} fullPage runtime={{ values: record.fieldValues, disabled: true, onChange: () => {} }} />;

  return <Box sx={{ flex: 1, overflow: 'auto', m: 2, p: 3, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1 }}>
    {fields.length ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      {fields.map((field, index) => {
        const id = String(field.id ?? field.fieldId ?? index);
        const label = String(field.name ?? field.label ?? `字段 ${index + 1}`);
        const value = record.fieldValues[id];
        return <Box key={id} sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{value === undefined || value === null || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)}</Typography>
        </Box>;
      })}
    </Box> : <Typography color="text.secondary">该实例没有可展示的字段定义。</Typography>}
  </Box>;
}

export function EvidencePreview({ record, onClose }: { record: DhrEvidenceRecord | null; onClose: () => void }) {
  return <Dialog open={Boolean(record)} onClose={onClose} fullScreen PaperProps={{ sx: { bgcolor: '#eef1f6' } }}>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box minWidth={0}><Typography variant="h6" noWrap>{record ? getRecordTitle(record) : '表单实例'}</Typography><Typography variant="caption" color="text.secondary">{record?.instanceNo} · {record?.templateVersion}</Typography></Box>
      <IconButton onClick={onClose} aria-label="关闭"><CloseRounded /></IconButton>
    </DialogTitle>
    <DialogContent dividers sx={{ bgcolor: '#eef1f6', p: 0, display: 'flex', minHeight: 0 }}><EvidenceCanvas record={record} emptyMessage="请选择一份表单实例。" /></DialogContent>
  </Dialog>;
}
