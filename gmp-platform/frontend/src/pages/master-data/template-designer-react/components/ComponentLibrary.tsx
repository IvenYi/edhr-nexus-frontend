import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import FormatListNumberedOutlined from '@mui/icons-material/FormatListNumberedOutlined';
import HorizontalRuleOutlined from '@mui/icons-material/HorizontalRuleOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import QrCode2Outlined from '@mui/icons-material/QrCode2Outlined';
import SuperscriptOutlined from '@mui/icons-material/SuperscriptOutlined';
import TextFieldsOutlined from '@mui/icons-material/TextFieldsOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import ViewWeekOutlined from '@mui/icons-material/ViewWeekOutlined';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { commonCanvasComponents, getComponentSheetHint, isCellDisplayComponent, type CommonCanvasComponentId } from '../registry/commonComponentRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

const COMMON_COMPONENT_MIME = 'application/x-template-designer-common-component';
const COMMON_COMPONENT_INSERT_EVENT = 'template-designer-common-component-insert';

function CommonComponentIcon({ icon }: { icon: typeof commonCanvasComponents[number]['icon'] }) {
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
  if (icon === 'table') return <TableChartOutlined sx={sx} />;
  return <TextFieldsOutlined sx={sx} />;
}

export default function ComponentLibrary() {
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const isFreeCanvas = currentPage?.sheet.canvasMode === 'paper';
  const dragCleanup = useRef<(() => void) | null>(null);
  const suppressClick = useRef(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; label: string } | null>(null);
  useEffect(() => () => dragCleanup.current?.(), []);

  const handleCellPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, componentId: CommonCanvasComponentId, label: string) => {
    if (isFreeCanvas || event.button !== 0 || !isCellDisplayComponent(componentId)) return;
    dragCleanup.current?.();
    suppressClick.current = false;
    const owner = event.currentTarget.ownerDocument;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let active = false;
    const cleanup = () => {
      owner.removeEventListener('pointermove', move);
      owner.removeEventListener('pointerup', up);
      owner.removeEventListener('pointercancel', cleanup);
      owner.removeEventListener('keydown', keydown);
      owner.defaultView?.removeEventListener('blur', cleanup);
      setDragPreview(null);
      dragCleanup.current = null;
    };
    const move = (pointer: PointerEvent) => {
      if (pointer.pointerId !== pointerId) return;
      if (!(pointer.buttons & 1)) { cleanup(); return; }
      active ||= Math.hypot(pointer.clientX - startX, pointer.clientY - startY) >= 4;
      if (active) {
        suppressClick.current = true;
        setDragPreview({ x: pointer.clientX, y: pointer.clientY, label });
      }
    };
    const up = (pointer: PointerEvent) => {
      if (pointer.pointerId !== pointerId) return;
      cleanup();
      if (!active) return;
      const EventCtor = owner.defaultView?.CustomEvent ?? CustomEvent;
      owner.dispatchEvent(new EventCtor(COMMON_COMPONENT_INSERT_EVENT, { detail: { componentId, clientX: pointer.clientX, clientY: pointer.clientY } }));
    };
    const keydown = (key: KeyboardEvent) => { if (key.key === 'Escape') cleanup(); };
    owner.addEventListener('pointermove', move);
    owner.addEventListener('pointerup', up);
    owner.addEventListener('pointercancel', cleanup);
    owner.addEventListener('keydown', keydown);
    owner.defaultView?.addEventListener('blur', cleanup);
    dragCleanup.current = cleanup;
  };

  const dispatchInsert = (componentId: CommonCanvasComponentId, ownerDocument: Document) => {
    const EventCtor = ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
    ownerDocument.dispatchEvent(new EventCtor(COMMON_COMPONENT_INSERT_EVENT, { detail: { componentId } }));
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, componentId: CommonCanvasComponentId) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(COMMON_COMPONENT_MIME, componentId);
    event.dataTransfer.setData('text/plain', componentId);
  };

  return (
    <Box data-common-component-library="true" sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          {commonCanvasComponents.map((component) => (
            <Tooltip key={component.id} title={isFreeCanvas || isCellDisplayComponent(component.id) ? `拖拽或点击插入${component.label}` : getComponentSheetHint(component.id)} placement="right">
              <span>
                <Button
                  data-common-component-card={component.id}
                  draggable={isFreeCanvas}
                  disabled={!isFreeCanvas && !isCellDisplayComponent(component.id)}
                  onDragStart={(event) => handleDragStart(event, component.id)}
                  onPointerDown={(event) => handleCellPointerDown(event, component.id, component.label)}
                  onClick={(event) => { if (!suppressClick.current) dispatchInsert(component.id, event.currentTarget.ownerDocument); suppressClick.current = false; }}
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
      {dragPreview ? <Box sx={{ position: 'fixed', left: dragPreview.x + 12, top: dragPreview.y + 12, zIndex: 2000, pointerEvents: 'none', px: 1.5, py: 0.75, bgcolor: '#fff', border: '1px solid #91caff', borderRadius: 1, boxShadow: '0 6px 20px #0002' }}>{dragPreview.label}</Box> : null}
    </Box>
  );
}
