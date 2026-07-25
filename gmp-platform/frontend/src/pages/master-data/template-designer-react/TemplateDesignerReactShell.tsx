import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import type { TemplateDesignerDialogProps } from './types';
import { useTemplateDesignerStore } from './store/useTemplateDesignerStore';
import CanvasTab from './tabs/canvas/CanvasTab';
import MockFillDialog from './components/mock-fill/MockFillDialog';
import ModelTab from './tabs/model/ModelTab';
import WorkflowTab from './tabs/workflow/WorkflowTab';
import { parseReactTemplateDesignerDocument, serializeTemplateDesignerDocument } from './utils/document';
import { importTemplateToCanvasPage } from './utils/templateImport';

type TemplateDesignerReactShellProps = Pick<TemplateDesignerDialogProps, 'row' | 'version' | 'onClose' | 'onSave' | 'onAutoSave' | 'saving'>;

const headerActionButtonSx = {
  height: 32,
  minWidth: 88,
  px: 2,
  borderRadius: 1,
};

const headerOutlinedActionButtonSx = {
  ...headerActionButtonSx,
  color: '#f8fafc',
  borderColor: 'rgba(255,255,255,.14)',
  bgcolor: 'transparent',
  '&:hover': {
    borderColor: 'rgba(255,255,255,.28)',
    bgcolor: 'rgba(255,255,255,.06)',
  },
};

const headerPrimaryActionButtonSx = {
  ...headerActionButtonSx,
  color: '#fff',
  bgcolor: '#2990ff',
  '&:hover': { bgcolor: '#1677d2' },
  '&.Mui-disabled': {
    color: 'rgba(255,255,255,.72)',
    bgcolor: 'rgba(41,144,255,.52)',
  },
};

export default function TemplateDesignerReactShell({
  row,
  version,
  onClose,
  onSave,
  onAutoSave,
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
  const [mockFillOpen, setMockFillOpen] = useState(false);
  const [subTableDesignFieldId, setSubTableDesignFieldId] = useState<string | null>(null);
  const activeSubTableDesignField = useMemo(
    () => document?.model.fields.find((field) => field.id === subTableDesignFieldId && field.type === 'subTable') ?? null,
    [document, subTableDesignFieldId],
  );
  const isSubTableDesigning = Boolean(activeSubTableDesignField);
  const templateVersionLabel = version?.version || '-';
  const templatePathLabel = activeSubTableDesignField
    ? `${row?.name || '未命名表单'} : ${templateVersionLabel} > ${activeSubTableDesignField.name || activeSubTableDesignField.code || '未命名子表'}`
    : `${row?.name || '未命名表单'} : ${templateVersionLabel}`;

  useEffect(() => {
    if (!row || !version) return;
    setDocument(parseReactTemplateDesignerDocument(row, version));
    setActiveTab('canvas');
    setSubTableDesignFieldId(null);
    markSaved();
  }, [markSaved, row, setActiveTab, setDocument, version]);

  useEffect(() => {
    if (subTableDesignFieldId && !activeSubTableDesignField) {
      setSubTableDesignFieldId(null);
    }
  }, [activeSubTableDesignField, subTableDesignFieldId]);

  const persistCurrentDocument = async (persist: TemplateDesignerDialogProps['onSave']) => {
    const currentDocument = useTemplateDesignerStore.getState().document;
    if (!currentDocument) return;
    await persist(serializeTemplateDesignerDocument(currentDocument));
    markSaved();
  };

  const handleSave = async () => persistCurrentDocument(onSave);

  const handleFieldConfirmPersist = async () => {
    if (!onAutoSave) return;
    await persistCurrentDocument(onAutoSave);
  };

  const handleClose = () => {
    if (isDirty() && !window.confirm('当前 React 设计有未保存修改，确认关闭吗？')) {
      return;
    }
    onClose();
  };

  const handleShellBack = () => {
    if (isSubTableDesigning) {
      setSubTableDesignFieldId(null);
      return;
    }
    handleClose();
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
              onClick={handleShellBack}
              sx={{ color: '#f8fafc', flexShrink: 0, minWidth: 0, px: 1 }}
            >
              {isSubTableDesigning ? '返回上一层' : '返回上一页'}
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
          <Typography data-shell-template-path="true" sx={{ fontSize: 14, color: 'rgba(255,255,255,.82)', whiteSpace: 'nowrap' }}>
            {templatePathLabel}
          </Typography>
        </Stack>
        {isSubTableDesigning ? null : (
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
        )}
        {isSubTableDesigning ? null : (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              variant="outlined"
              onClick={handleImportTemplate}
              sx={headerOutlinedActionButtonSx}
            >
              模板导入
            </Button>
            <Button variant="outlined" onClick={() => setMockFillOpen(true)} sx={headerOutlinedActionButtonSx}>
              模拟填报
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveOutlined />}
              disabled={saving}
              onClick={() => void handleSave()}
              sx={headerPrimaryActionButtonSx}
            >
              保存
            </Button>
            <Button variant="outlined" onClick={handleClose} sx={headerOutlinedActionButtonSx}>
              关闭
            </Button>
          </Stack>
        )}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'model' ? (
          <Box sx={{ height: '100%', minHeight: 0, p: 3 }}>
            <ModelTab
              subTableDesignFieldId={subTableDesignFieldId}
              onSubTableDesignFieldIdChange={setSubTableDesignFieldId}
              onFieldConfirmPersist={handleFieldConfirmPersist}
              saving={saving}
            />
          </Box>
        ) : null}
        {activeTab === 'canvas' ? <CanvasTab /> : null}
        {activeTab === 'workflow' ? (
          <Box sx={{ height: '100%', minHeight: 0, p: 3 }}>
            <WorkflowTab />
          </Box>
        ) : null}
      </Box>
      {document ? (
        <MockFillDialog
          open={mockFillOpen}
          document={document}
          onClose={() => setMockFillOpen(false)}
        />
      ) : null}
    </Box>
  );
}
