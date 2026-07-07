import { useEffect } from 'react';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import type { TemplateDesignerDialogProps } from '../template-designer/templateDesignerTypes';
import { useTemplateDesignerStore } from './store/useTemplateDesignerStore';
import CanvasTab from './tabs/canvas/CanvasTab';
import ModelTab from './tabs/model/ModelTab';
import WorkflowTab from './tabs/workflow/WorkflowTab';
import { parseReactTemplateDesignerDocument, serializeTemplateDesignerDocument } from './utils/document';

type TemplateDesignerReactShellProps = Pick<TemplateDesignerDialogProps, 'row' | 'version' | 'onClose' | 'onSave' | 'saving'>;

export default function TemplateDesignerReactShell({
  row,
  version,
  onClose,
  onSave,
  saving,
}: TemplateDesignerReactShellProps) {
  const activeTab = useTemplateDesignerStore((state) => state.activeTab);
  const document = useTemplateDesignerStore((state) => state.document);
  const setDocument = useTemplateDesignerStore((state) => state.setDocument);
  const setActiveTab = useTemplateDesignerStore((state) => state.setActiveTab);
  const markSaved = useTemplateDesignerStore((state) => state.markSaved);
  const isDirty = useTemplateDesignerStore((state) => state.isDirty);

  useEffect(() => {
    if (!row || !version) return;
    setDocument(parseReactTemplateDesignerDocument(row, version));
    markSaved();
  }, [markSaved, row, setDocument, version]);

  const handleSave = async () => {
    if (!document) return;
    await onSave(serializeTemplateDesignerDocument(document));
    markSaved();
  };

  const handleClose = () => {
    if (isDirty() && !window.confirm('当前 React 设计有未保存修改，确认关闭吗？')) {
      return;
    }
    onClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        bgcolor: '#f4f6fa',
      }}
    >
      <Box
        sx={{
          height: 56,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1a1d23',
          color: '#fff',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Button color="inherit" onClick={handleClose}>
            返回上一页
          </Button>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,.82)' }}>
            {row?.name || '未命名表单'} / {version?.version || '-'}
          </Typography>
        </Stack>
        <Button variant="contained" disabled={saving} onClick={() => void handleSave()}>
          保存
        </Button>
      </Box>
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ px: 2, bgcolor: '#fff' }}>
        <Tab value="model" label="建模设计" />
        <Tab value="canvas" label="表单设计" />
        <Tab value="workflow" label="流程设计" />
      </Tabs>
      <Box sx={{ flex: 1, minHeight: 0, p: 3 }}>
        {activeTab === 'model' ? <ModelTab /> : null}
        {activeTab === 'canvas' ? <CanvasTab /> : null}
        {activeTab === 'workflow' ? <WorkflowTab /> : null}
      </Box>
    </Box>
  );
}
