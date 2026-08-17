import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import FormatListNumberedOutlined from '@mui/icons-material/FormatListNumberedOutlined';
import HorizontalRuleOutlined from '@mui/icons-material/HorizontalRuleOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import QrCode2Outlined from '@mui/icons-material/QrCode2Outlined';
import SuperscriptOutlined from '@mui/icons-material/SuperscriptOutlined';
import TextFieldsOutlined from '@mui/icons-material/TextFieldsOutlined';
import ViewWeekOutlined from '@mui/icons-material/ViewWeekOutlined';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import type { DragEvent } from 'react';
import { commonDisplayComponents, type CommonDisplayComponentId } from '../registry/commonComponentRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

const COMMON_COMPONENT_MIME = 'application/x-template-designer-common-component';
const COMMON_COMPONENT_INSERT_EVENT = 'template-designer-common-component-insert';

function CommonComponentIcon({ icon }: { icon: typeof commonDisplayComponents[number]['icon'] }) {
  const sx = { fontSize: 24, color: '#7b8492' };
  if (icon === 'image') return <ImageOutlined sx={sx} />;
  if (icon === 'page') return <FormatListNumberedOutlined sx={sx} />;
  if (icon === 'barcode') return <ViewWeekOutlined sx={sx} />;
  if (icon === 'qr') return <QrCode2Outlined sx={sx} />;
  if (icon === 'columns') return <ViewWeekOutlined sx={sx} />;
  if (icon === 'superscript') return <SuperscriptOutlined sx={sx} />;
  if (icon === 'line') return <HorizontalRuleOutlined sx={sx} />;
  if (icon === 'serial') return <FormatListNumberedOutlined sx={sx} />;
  if (icon === 'time') return <AccessTimeOutlined sx={sx} />;
  return <TextFieldsOutlined sx={sx} />;
}

export default function ComponentLibrary() {
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const isFreeCanvas = currentPage?.sheet.canvasMode === 'paper';

  const dispatchInsert = (componentId: CommonDisplayComponentId, ownerDocument: Document) => {
    const EventCtor = ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
    ownerDocument.dispatchEvent(new EventCtor(COMMON_COMPONENT_INSERT_EVENT, { detail: { componentId } }));
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, componentId: CommonDisplayComponentId) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(COMMON_COMPONENT_MIME, componentId);
    event.dataTransfer.setData('text/plain', componentId);
  };

  return (
    <Box data-common-component-library="true" sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          {commonDisplayComponents.map((component) => (
            <Tooltip key={component.id} title={isFreeCanvas ? `拖拽或点击插入${component.label}` : '请先切换至画布模式'} placement="right">
              <span>
                <Button
                  data-common-component-card={component.id}
                  draggable={isFreeCanvas}
                  disabled={!isFreeCanvas}
                  onDragStart={(event) => handleDragStart(event, component.id)}
                  onClick={(event) => dispatchInsert(component.id, event.currentTarget.ownerDocument)}
                  variant="outlined"
                  sx={{
                    minWidth: 0,
                    width: '100%',
                    minHeight: 58,
                    justifyContent: 'flex-start',
                    gap: 1,
                    px: 1.25,
                    borderColor: '#dfe4ec',
                    borderRadius: 1,
                    color: '#30343b',
                    fontSize: 15,
                    fontWeight: 500,
                    textTransform: 'none',
                    bgcolor: '#fff',
                    '&:hover': { borderColor: '#91caff', bgcolor: '#f7fbff' },
                    '&.Mui-disabled': { borderColor: '#eaedf2', color: '#aeb6c2', bgcolor: '#fafbfd' },
                  }}
                >
                  <Stack alignItems="center" justifyContent="center" sx={{ flex: '0 0 24px' }}>
                    <CommonComponentIcon icon={component.icon} />
                  </Stack>
                  <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{component.label}</Box>
                </Button>
              </span>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
