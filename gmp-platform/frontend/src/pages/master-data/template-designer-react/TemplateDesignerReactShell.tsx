import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import { useEffect, useRef, type ChangeEvent } from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import type { TemplateDesignerDialogProps } from './types';
import { useTemplateDesignerStore } from './store/useTemplateDesignerStore';
import CanvasTab from './tabs/canvas/CanvasTab';
import ModelTab from './tabs/model/ModelTab';
import WorkflowTab from './tabs/workflow/WorkflowTab';
import { parseReactTemplateDesignerDocument, serializeTemplateDesignerDocument } from './utils/document';
import { importTemplateToCanvasPage } from './utils/templateImport';

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
  const getCurrentPage = useTemplateDesignerStore((state) => state.getCurrentPage);
  const replaceCurrentPageFromImport = useTemplateDesignerStore((state) => state.replaceCurrentPageFromImport);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!row || !version) return;
    setDocument(parseReactTemplateDesignerDocument(row, version));
    setActiveTab('canvas');
    markSaved();
  }, [markSaved, row, setActiveTab, setDocument, version]);

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

  const handleImportTemplate = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const importedPage = await importTemplateToCanvasPage(file, getCurrentPage());
      replaceCurrentPageFromImport(importedPage);
      setActiveTab('canvas');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '模板导入失败');
    }
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xlsm,.xls,.docx,.doc"
        hidden
        onChange={(event) => {
          void handleImportFileChange(event);
        }}
      />
      <Box
        sx={{
          height: 64,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1f2128',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackOutlined />}
              onClick={handleClose}
              sx={{ color: '#f8fafc', flexShrink: 0, minWidth: 0, px: 1 }}
            >
              返回上一页
            </Button>
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              alignSelf: 'center',
              height: 28,
              borderColor: 'rgba(255,255,255,.24)',
            }}
          />
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,.82)', whiteSpace: 'nowrap' }}>
            {row?.name || '未命名表单'} · {version?.version || '-'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {[
            { key: 'model', label: '字段设计' },
            { key: 'canvas', label: '表单设计' },
            { key: 'workflow', label: '流程设计' },
          ].map((item) => (
            <Button
              key={item.key}
              onClick={() => setActiveTab(item.key as typeof activeTab)}
              sx={{
                minWidth: 96,
                height: 38,
                px: 2,
                borderRadius: 1.5,
                color: activeTab === item.key ? '#fff' : 'rgba(255,255,255,.78)',
                bgcolor: activeTab === item.key ? 'rgba(255,255,255,.10)' : 'transparent',
                border: activeTab === item.key ? '1px solid rgba(255,255,255,.18)' : '1px solid transparent',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Button
            variant="outlined"
            onClick={handleImportTemplate}
            sx={{ color: '#f8fafc', borderColor: 'rgba(255,255,255,.14)' }}
          >
            模板导入
          </Button>
          <Button variant="outlined" sx={{ color: '#f8fafc', borderColor: 'rgba(255,255,255,.14)' }}>
            模拟填报
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            disabled={saving}
            onClick={() => void handleSave()}
            sx={{ bgcolor: '#4b5563' }}
          >
            保存
          </Button>
          <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#2990ff' }}>
            关闭
          </Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'model' ? (
          <Box sx={{ height: '100%', minHeight: 0, p: 3 }}>
            <ModelTab />
          </Box>
        ) : null}
        {activeTab === 'canvas' ? <CanvasTab /> : null}
        {activeTab === 'workflow' ? (
          <Box sx={{ height: '100%', minHeight: 0, p: 3 }}>
            <WorkflowTab />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
