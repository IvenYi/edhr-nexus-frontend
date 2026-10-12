import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Box } from '@mui/material';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';

interface SourceRequest {
  key: string;
  label: string;
  candidates: string[];
  onPick: (fieldId: string) => void;
}
interface PickerContext {
  request: SourceRequest | null;
  error: string;
  start: (request: SourceRequest) => void;
  cancel: (bindingId?: string) => void;
}
const Context = createContext<PickerContext | null>(null);
export const useProjectionCanvasPicker = () => useContext(Context);

/** Transient editor interaction only; selection never enters a template snapshot. */
export default function ProjectionCanvasPicker({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<SourceRequest | null>(null);
  const [error, setError] = useState('');
  const host = useRef<HTMLDivElement>(null);
  const cancel = (bindingId?: string) => {
    // A collapsing editor may unmount after the next editor starts picking.
    setRequest(current => !bindingId || current?.key.startsWith(`${bindingId}/`) ? null : current);
    if (!bindingId) setError('');
  };
  useEffect(() => {
    if (!request) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancel(); }
    };
    window.addEventListener('keydown', keydown, true);
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !host.current?.contains(event.target)) cancel(); };
    window.addEventListener('pointerdown', outside, true);
    const unsubscribe = useTemplateDesignerStore.subscribe((next, previous) => {
      if (next.document !== previous.document || next.activeTab !== previous.activeTab
        || next.activeCanvasRail !== previous.activeCanvasRail || !next.isCanvasSidebarVisible) cancel();
    });
    const nodes = host.current?.querySelectorAll<HTMLElement>('[data-projection-field-id]') ?? [];
    nodes.forEach(node => node.dataset.projectionPickable = String(request.candidates.includes(node.dataset.projectionFieldId ?? '')));
    return () => {
      window.removeEventListener('keydown', keydown, true); window.removeEventListener('pointerdown', outside, true); unsubscribe();
      nodes.forEach(node => delete node.dataset.projectionPickable);
    };
  }, [request]);
  const inCanvas = (target: EventTarget) => target instanceof Element && target.closest('[data-projection-canvas]');
  return <Context.Provider value={{ request, error, start: next => { setError(''); setRequest(next); }, cancel }}>
    <Box ref={host} sx={{ display: 'contents',
      '& [data-projection-pickable="true"]': { outline: '2px dashed #1890ff', outlineOffset: 1, cursor: 'crosshair' },
      '& [data-projection-pickable="true"]:hover': { outline: '2px solid #1890ff', bgcolor: '#e8f4ff' },
      '& [data-projection-pickable="false"]': { cursor: 'not-allowed' },
    }}
      onPointerDownCapture={event => { if (request && inCanvas(event.target)) { event.preventDefault(); event.stopPropagation(); } }}
      onMouseDownCapture={event => { if (request && inCanvas(event.target)) { event.preventDefault(); event.stopPropagation(); } }}
      onDoubleClickCapture={event => { if (request && inCanvas(event.target)) { event.preventDefault(); event.stopPropagation(); } }}
      onClickCapture={event => {
        if (!request || !inCanvas(event.target)) return;
        event.preventDefault(); event.stopPropagation();
        const id = (event.target as Element).closest<HTMLElement>('[data-projection-field-id]')?.dataset.projectionFieldId;
        if (!id || !request.candidates.includes(id)) { setError(`此处不能作为${request.label}，请选择蓝色标记的兼容字段。`); return; }
        request.onPick(id); cancel();
      }}>
      {children}
    </Box>
  </Context.Provider>;
}
