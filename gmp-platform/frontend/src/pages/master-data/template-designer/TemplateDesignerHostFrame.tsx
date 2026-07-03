import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';
import {
  buildHostContext,
  buildHostedDesignerSnapshot,
  buildVueDesignerUrl,
  isTemplateDesignerHostEvent,
  type TemplateDesignerBridgeMessage,
  type TemplateDesignerTabKey,
  type TemplateDesignerSavePayload,
} from './templateDesignerBridge';

interface TemplateDesignerHostFrameProps {
  row: TemplateModelingRecord;
  version: TemplateVersionRecord;
  authToken: string;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: TemplateDesignerSavePayload) => Promise<unknown>;
}

function postToChild(frame: HTMLIFrameElement | null, message: TemplateDesignerBridgeMessage) {
  frame?.contentWindow?.postMessage(message, '*');
}

const TEMPLATE_DESIGNER_TABS: Array<{ key: TemplateDesignerTabKey; label: string }> = [
  { key: 'model', label: '建模设计' },
  { key: 'form', label: '表单设计' },
  { key: 'process', label: '流程设计' },
];

export default function TemplateDesignerHostFrame({
  row,
  version,
  authToken,
  saving,
  onClose,
  onSave,
}: TemplateDesignerHostFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [frameError, setFrameError] = useState('');
  const [activeTab, setActiveTab] = useState<TemplateDesignerTabKey>('form');
  const designerUrl = useMemo(() => buildVueDesignerUrl(row, version), [row, version]);
  const initMessage = useMemo<TemplateDesignerBridgeMessage>(() => ({
    type: 'init',
    context: buildHostContext(row, version, authToken),
    design: buildHostedDesignerSnapshot(row, version),
  }), [authToken, row, version]);

  useEffect(() => {
    setReady(false);
    setDirty(false);
    setFrameError('');
    setActiveTab('form');
  }, [designerUrl]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || !isTemplateDesignerHostEvent(event.data)) {
        return;
      }

      if (event.data.type === 'ready') {
        setReady(true);
        postToChild(iframeRef.current, initMessage);
        return;
      }
      if (event.data.type === 'dirty-change') {
        setDirty(event.data.dirty);
        return;
      }
      if (event.data.type === 'save-request') {
        onSave(event.data.payload)
          .then(() => {
            setDirty(false);
            postToChild(iframeRef.current, { type: 'save-success' });
          })
          .catch((error: unknown) => {
            postToChild(iframeRef.current, {
              type: 'save-error',
              message: error instanceof Error ? error.message : '保存失败',
            });
          });
        return;
      }
      if (event.data.type === 'close-request') {
        onClose();
        return;
      }
      if (event.data.type === 'error') {
        setFrameError(event.data.message || '设计器加载失败');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [initMessage, onClose, onSave]);

  const handleClose = () => {
    if (dirty && !window.confirm('当前设计有未保存修改，确认关闭吗？')) {
      return;
    }
    postToChild(iframeRef.current, { type: 'close' });
    onClose();
  };

  const handleSave = () => {
    postToChild(iframeRef.current, { type: 'save' });
  };

  const handleSelectTab = (tab: TemplateDesignerTabKey) => {
    setActiveTab(tab);
    postToChild(iframeRef.current, { type: 'set-active-tab', tab });
  };

  const handleImportTemplate = () => {
    postToChild(iframeRef.current, { type: 'import-template' });
  };

  const handleSimulateFill = () => {
    postToChild(iframeRef.current, { type: 'simulate-fill' });
  };

  const titleName = row.name?.trim() || '未命名表单';
  const titleVersion = version.version?.trim() || '-';

  return (
    <Box
      sx={{
        flex: '1 1 auto',
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f4f6fa',
      }}
    >
      <Box
        sx={{
          height: 54,
          flex: '0 0 auto',
          px: 2.5,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
          alignItems: 'center',
          columnGap: 2,
          bgcolor: '#1a1d23',
          color: '#fff',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<ArrowBackRoundedIcon fontSize="small" />}
            onClick={handleClose}
            sx={{ flex: '0 0 auto', color: 'rgba(255,255,255,.72)', minWidth: 96 }}
          >
            返回上一页
          </Button>
          <Box sx={{ width: '1px', height: 14, flex: '0 0 auto', bgcolor: 'rgba(255,255,255,.62)' }} />
          <Box
            title={`${titleName} : ${titleVersion}`}
            sx={{ minWidth: 0, display: 'flex', alignItems: 'baseline', overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            <Typography
              component="span"
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.2,
                color: 'rgba(255,255,255,.72)',
              }}
            >
              {titleName}
            </Typography>
            <Typography
              component="span"
              sx={{
                flex: '0 0 auto',
                ml: 1,
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.2,
                color: 'rgba(255,255,255,.72)',
              }}
            >
              : {titleVersion}
            </Typography>
          </Box>
          {dirty ? <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,.62)' }}>未保存</Typography> : null}
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ flex: '0 0 auto' }}>
          {TEMPLATE_DESIGNER_TABS.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                size="small"
                color="inherit"
                disabled={!ready}
                onClick={() => handleSelectTab(tab.key)}
                sx={{
                  minWidth: 88,
                  px: 1.25,
                  color: selected ? '#fff' : 'rgba(255,255,255,.68)',
                  bgcolor: selected ? 'rgba(255,255,255,.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: selected ? 'rgba(255,255,255,.22)' : 'transparent',
                  '&.Mui-disabled': {
                    color: selected ? '#fff' : 'rgba(255,255,255,.68)',
                    bgcolor: selected ? 'rgba(255,255,255,.12)' : 'transparent',
                    borderColor: selected ? 'rgba(255,255,255,.22)' : 'transparent',
                  },
                  '&:hover': {
                    bgcolor: selected ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.08)',
                    borderColor: selected ? 'rgba(255,255,255,.26)' : 'transparent',
                  },
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ flex: '0 0 auto', minWidth: 0 }}>
          {activeTab === 'form' ? (
            <>
              <Button
                size="small"
                color="inherit"
                disabled={!ready || saving}
                onClick={handleImportTemplate}
                sx={{
                  minWidth: 88,
                  color: 'rgba(255,255,255,.82)',
                  border: '1px solid rgba(255,255,255,.14)',
                  bgcolor: 'rgba(255,255,255,.04)',
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,.82)',
                    borderColor: 'rgba(255,255,255,.14)',
                    bgcolor: 'rgba(255,255,255,.04)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,.08)',
                    borderColor: 'rgba(255,255,255,.22)',
                  },
                }}
              >
                模板导入
              </Button>
              <Button
                size="small"
                color="inherit"
                disabled={!ready || saving}
                onClick={handleSimulateFill}
                sx={{
                  minWidth: 88,
                  color: 'rgba(255,255,255,.82)',
                  border: '1px solid rgba(255,255,255,.14)',
                  bgcolor: 'rgba(255,255,255,.04)',
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,.82)',
                    borderColor: 'rgba(255,255,255,.14)',
                    bgcolor: 'rgba(255,255,255,.04)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,.08)',
                    borderColor: 'rgba(255,255,255,.22)',
                  },
                }}
              >
                模拟填报
              </Button>
            </>
          ) : null}
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveRoundedIcon fontSize="small" />}
            disabled={!ready || saving}
            onClick={handleSave}
            sx={{
              minWidth: 80,
              bgcolor: '#444',
              '&.Mui-disabled': { bgcolor: '#444', color: '#fff' },
              '&:hover': { bgcolor: '#555' },
            }}
          >
            {saving ? '保存中' : '保存'}
          </Button>
          <Button size="small" variant="contained" onClick={handleClose} sx={{ minWidth: 72 }}>
            关闭
          </Button>
        </Stack>
      </Box>

      {frameError ? (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {frameError}
        </Alert>
      ) : null}

      <Box sx={{ position: 'relative', flex: '1 1 auto', width: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        {!ready ? (
          <Stack
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, bgcolor: '#f4f6fa' }}
          >
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: '#606266' }}>正在加载设计器</Typography>
          </Stack>
        ) : null}
        <iframe
          ref={iframeRef}
          title="表单模板设计器"
          src={designerUrl}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
            background: '#fff',
          }}
        />
      </Box>
    </Box>
  );
}
