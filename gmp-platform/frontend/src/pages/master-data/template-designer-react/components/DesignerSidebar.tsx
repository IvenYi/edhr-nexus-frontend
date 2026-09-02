import type { DragEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import FieldTypeIcon from './FieldTypeIcon';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField } from '../types';

const FIELD_POINTER_DROP_EVENT = 'template-designer-field-pointer-drop';
const FIELD_POINTER_HOVER_EVENT = 'template-designer-field-pointer-hover';
const POINTER_DRAG_THRESHOLD = 4;
const canvasFieldCardHeight = 56;

interface PointerDragState {
  fieldId: string;
  subTableId?: string;
  subTableField?: ModelField;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  active: boolean;
}

function normalizeSubTableField(input: unknown, index: number): ModelField | null {
  if (typeof input === 'string') {
    const name = input.trim();
    if (!name) return null;
    const field = getFieldTypeDefinition('text').defaultField(name, index + 1);
    return {
      ...field,
      id: `sub-field-${index + 1}`,
      code: `sub_field_${index + 1}`,
    };
  }
  if (!input || typeof input !== 'object') return null;

  const source = input as Partial<ModelField> & Record<string, unknown>;
  const definition = getFieldTypeDefinition(typeof source.type === 'string' ? source.type : 'text');
  const name = typeof source.name === 'string' && source.name.trim()
    ? source.name.trim()
    : typeof source.label === 'string' && source.label.trim()
      ? source.label.trim()
      : definition.label;
  const fallbackField = definition.defaultField(name, index + 1);

  return {
    ...fallbackField,
    id: typeof source.id === 'string' && source.id ? source.id : `sub-field-${index + 1}`,
    code: typeof source.code === 'string' && source.code ? source.code : `sub_field_${index + 1}`,
    name,
    groupId: typeof source.groupId === 'string' ? source.groupId : 'default-group',
    sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : index + 1,
    status: source.status === 'disabled' ? 'disabled' : 'enabled',
    description: typeof source.description === 'string' ? source.description : '',
    typeConfig: typeof source.typeConfig === 'object' && source.typeConfig
      ? { ...fallbackField.typeConfig, ...source.typeConfig }
      : { ...fallbackField.typeConfig },
  };
}

function getSubTableFields(field: ModelField): ModelField[] {
  const columns = field.typeConfig.columns;
  const fields = typeof columns === 'string'
    ? columns.split(/[\n,，]/).map((column, index) => normalizeSubTableField(column, index))
    : Array.isArray(columns)
      ? columns.map((column, index) => normalizeSubTableField(column, index))
      : [];

  return fields
    .filter((field): field is ModelField => Boolean(field))
    .filter((field) => field.type !== 'subTable')
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

export default function DesignerSidebar() {
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [pointerDrag, setPointerDrag] = useState<PointerDragState | null>(null);
  const dragPreviewRef = useRef<HTMLElement | null>(null);
  const pointerDragRef = useRef<PointerDragState | null>(null);
  const pointerDragCleanupRef = useRef<(() => void) | null>(null);
  const selectedSubTableField = useTemplateDesignerStore((state) => state.getSubTableFieldForSelectedRange());
  const modelFields = useTemplateDesignerStore((state) => (
    state.getAvailableFieldsForCurrentVersion()
      .filter((field) => field.type !== 'subTable')
      .sort((first, second) => first.sortOrder - second.sortOrder)
  ));
  const subTableFieldIdsUsedOnCanvas = useTemplateDesignerStore((state) => (
    selectedSubTableField ? state.subTableFieldIdsUsedOnCanvas(selectedSubTableField.id) : []
  ));
  const usedSubTableFieldIds = new Set(subTableFieldIdsUsedOnCanvas);
  const subTableFields = selectedSubTableField
    ? getSubTableFields(selectedSubTableField).filter((field) => !usedSubTableFieldIds.has(field.id))
    : [];
  const displayFields = selectedSubTableField ? subTableFields : modelFields;
  const isSubTableFieldList = Boolean(selectedSubTableField);
  const pointerDragField = pointerDrag?.active
    ? displayFields.find((field) => field.id === pointerDrag.fieldId) ?? null
    : null;

  const cleanupDragPreview = () => {
    dragPreviewRef.current?.remove();
    dragPreviewRef.current = null;
  };

  const updatePointerDrag = (nextDrag: PointerDragState | null) => {
    pointerDragRef.current = nextDrag;
    setPointerDrag(nextDrag);
  };

  const cleanupPointerDrag = () => {
    pointerDragCleanupRef.current?.();
    pointerDragCleanupRef.current = null;
    updatePointerDrag(null);
    setDraggingFieldId(null);
  };

  useEffect(() => () => {
    pointerDragCleanupRef.current?.();
    cleanupDragPreview();
  }, []);

  const handleFieldDragStart = (event: DragEvent<HTMLButtonElement>, field: ModelField) => {
    if (pointerDragRef.current?.fieldId === field.id) {
      event.preventDefault();
      return;
    }
    cleanupDragPreview();
    const fieldId = field.id;
    const sourceRect = event.currentTarget.getBoundingClientRect();
    const dragOffsetX = Math.max(0, Math.min(sourceRect.width, event.clientX - sourceRect.left));
    const dragOffsetY = Math.max(0, Math.min(sourceRect.height, event.clientY - sourceRect.top));
    const dragPreview = event.currentTarget.cloneNode(true) as HTMLButtonElement;
    dragPreview.style.position = 'fixed';
    dragPreview.style.top = '-10000px';
    dragPreview.style.left = '-10000px';
    dragPreview.style.display = 'flex';
    dragPreview.style.alignItems = 'center';
    dragPreview.style.justifyContent = 'flex-start';
    dragPreview.style.width = `${sourceRect.width}px`;
    dragPreview.style.minWidth = `${sourceRect.width}px`;
    dragPreview.style.height = `${sourceRect.height}px`;
    dragPreview.style.boxSizing = 'border-box';
    dragPreview.style.padding = '0 10px';
    dragPreview.style.backgroundColor = '#fff';
    dragPreview.style.border = '1px solid #edf1f7';
    dragPreview.style.borderRadius = '4px';
    dragPreview.style.boxShadow = '0 14px 36px rgba(15, 23, 42, 0.16)';
    dragPreview.style.opacity = '0.98';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = '9999';
    document.body.appendChild(dragPreview);
    dragPreviewRef.current = dragPreview;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-template-designer-field', fieldId);
    event.dataTransfer.setData('text/plain', fieldId);
    if (selectedSubTableField) {
      event.dataTransfer.setData('application/x-template-designer-sub-table-field', JSON.stringify({
        subTableId: selectedSubTableField.id,
        field,
      }));
    }
    event.dataTransfer.setDragImage(dragPreview, dragOffsetX, dragOffsetY);
    setDraggingFieldId(fieldId);
  };

  const handleFieldDragEnd = () => {
    cleanupDragPreview();
    setDraggingFieldId(null);
  };

  const findFieldDropCellAtPoint = (ownerDocument: Document, clientX: number, clientY: number) => {
    const elementUnderPointer = ownerDocument.elementFromPoint(clientX, clientY);
    const directCell = elementUnderPointer?.closest?.('[data-canvas-field-drop-cell="true"]') as HTMLElement | null;
    if (directCell) return directCell;

    return Array.from(ownerDocument.querySelectorAll<HTMLElement>('[data-canvas-field-drop-cell="true"]'))
      .find((cell) => {
        const rect = cell.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      }) ?? null;
  };

  const dispatchFieldPointerHover = (ownerDocument: Document, clientX: number, clientY: number) => {
    const dropCell = findFieldDropCellAtPoint(ownerDocument, clientX, clientY);
    const row = Number(dropCell?.getAttribute('data-sheet-cell-row'));
    const col = Number(dropCell?.getAttribute('data-sheet-cell-col'));
    const EventCtor = ownerDocument.defaultView?.CustomEvent ?? CustomEvent;

    ownerDocument.dispatchEvent(new EventCtor(FIELD_POINTER_HOVER_EVENT, {
      detail: dropCell && Number.isFinite(row) && Number.isFinite(col) ? { row, col } : null,
    }));
  };

  const clearFieldPointerHover = (ownerDocument: Document) => {
    const EventCtor = ownerDocument.defaultView?.CustomEvent ?? CustomEvent;

    ownerDocument.dispatchEvent(new EventCtor(FIELD_POINTER_HOVER_EVENT, { detail: null }));
  };

  const handleFieldPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, field: ModelField) => {
    if (event.button !== 0) return;

    event.preventDefault();
    cleanupPointerDrag();
    const fieldId = field.id;

    const ownerDocument = event.currentTarget.ownerDocument;
    const sourceRect = event.currentTarget.getBoundingClientRect();
    const pointerId = event.pointerId;
    const initialDrag: PointerDragState = {
      fieldId,
      pointerId,
      subTableId: selectedSubTableField?.id,
      subTableField: selectedSubTableField ? field : undefined,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      offsetX: Math.max(0, Math.min(sourceRect.width, event.clientX - sourceRect.left)),
      offsetY: Math.max(0, Math.min(sourceRect.height, event.clientY - sourceRect.top)),
      width: sourceRect.width,
      height: sourceRect.height,
      active: false,
    };

    const removeListeners = () => {
      ownerDocument.removeEventListener('pointermove', handlePointerMove);
      ownerDocument.removeEventListener('pointerup', handlePointerUp);
      ownerDocument.removeEventListener('pointercancel', handlePointerCancel);
    };

    const finishPointerDrag = (eventTarget: EventTarget | null, clientX: number, clientY: number) => {
      const currentDrag = pointerDragRef.current;
      removeListeners();
      pointerDragCleanupRef.current = null;

      if (currentDrag?.active) {
        const dropCell = findFieldDropCellAtPoint(ownerDocument, clientX, clientY);
        const row = Number(dropCell?.getAttribute('data-sheet-cell-row'));
        const col = Number(dropCell?.getAttribute('data-sheet-cell-col'));
        const wordTableBlockId = dropCell?.getAttribute('data-word-table-block-id');
        const wordTableCellId = dropCell?.getAttribute('data-word-table-cell-id');

        if (dropCell && (
          (Number.isFinite(row) && Number.isFinite(col))
          || (wordTableBlockId && wordTableCellId)
        )) {
          const EventCtor = ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
          ownerDocument.dispatchEvent(new EventCtor(FIELD_POINTER_DROP_EVENT, {
            detail: {
              fieldId: currentDrag.fieldId,
              subTableId: currentDrag.subTableId,
              subTableField: currentDrag.subTableField,
              row,
              col,
              wordTableBlockId,
              wordTableCellId,
              clientX,
              clientY,
              wordTableCellElement: dropCell,
            },
          }));
        }
      }

      if (eventTarget instanceof HTMLElement) {
        eventTarget.releasePointerCapture?.(pointerId);
      }
      updatePointerDrag(null);
      setDraggingFieldId(null);
      clearFieldPointerHover(ownerDocument);
    };

    function handlePointerMove(moveEvent: PointerEvent) {
      const currentDrag = pointerDragRef.current;
      if (!currentDrag || moveEvent.pointerId !== pointerId) return;

      const distance = Math.hypot(moveEvent.clientX - currentDrag.startX, moveEvent.clientY - currentDrag.startY);
      const active = currentDrag.active || distance >= POINTER_DRAG_THRESHOLD;
      const nextDrag = {
        ...currentDrag,
        currentX: moveEvent.clientX,
        currentY: moveEvent.clientY,
        active,
      };

      if (active) {
        moveEvent.preventDefault();
        setDraggingFieldId(currentDrag.fieldId);
        dispatchFieldPointerHover(ownerDocument, moveEvent.clientX, moveEvent.clientY);
      }
      updatePointerDrag(nextDrag);
    }

    function handlePointerUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      finishPointerDrag(upEvent.target, upEvent.clientX, upEvent.clientY);
    }

    function handlePointerCancel(cancelEvent: PointerEvent) {
      if (cancelEvent.pointerId !== pointerId) return;
      finishPointerDrag(cancelEvent.target, cancelEvent.clientX, cancelEvent.clientY);
    }

    updatePointerDrag(initialDrag);
    event.currentTarget.setPointerCapture?.(pointerId);
    ownerDocument.addEventListener('pointermove', handlePointerMove, { passive: false });
    ownerDocument.addEventListener('pointerup', handlePointerUp);
    ownerDocument.addEventListener('pointercancel', handlePointerCancel);
    pointerDragCleanupRef.current = removeListeners;
  };

  const renderFieldButtonContent = (field: ModelField) => {
    const definition = getFieldTypeDefinition(field.type);

    return (
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, width: '100%' }}>
        <FieldTypeIcon iconKey={definition.iconKey} sx={{ fontSize: 22, color: '#64748b', flex: '0 0 auto' }} />
        <Stack alignItems="flex-start" justifyContent="center" sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 15, color: '#303133', lineHeight: 1.25 }} noWrap>
            {field.name || '未命名字段'}
          </Typography>
          <Typography data-canvas-field-type-label="true" sx={{ fontSize: 13, color: '#909399', lineHeight: 1.25, maxWidth: '100%' }} noWrap>
            {definition.label}
          </Typography>
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack spacing={0.75} sx={{ p: 1.5, overflow: 'auto', height: '100%' }}>
      {displayFields.length ? (
        displayFields.map((field) => {
          const isDragging = field.id === draggingFieldId;

          return (
            <Button
              key={field.id}
              data-canvas-field-card="true"
              data-canvas-sub-table-field-card={isSubTableFieldList ? 'true' : undefined}
              data-canvas-field-sub-table-id={selectedSubTableField?.id}
              draggable={false}
              variant="text"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                height: canvasFieldCardHeight,
                minHeight: canvasFieldCardHeight,
                flex: `0 0 ${canvasFieldCardHeight}px`,
                px: 1.25,
                py: 0,
                borderRadius: 1,
                cursor: 'grab',
                opacity: isDragging ? 0 : 1,
                pointerEvents: isDragging ? 'none' : 'auto',
                textTransform: 'none',
                userSelect: 'none',
                '&:hover': { bgcolor: '#f5f7fb' },
                '&:active': { cursor: 'grabbing' },
              }}
              onPointerDown={(event) => handleFieldPointerDown(event, field)}
            >
              {renderFieldButtonContent(field)}
            </Button>
          );
        })
      ) : (
        <Stack
          data-canvas-field-empty-state="true"
          justifyContent="center"
          alignItems="center"
          sx={{ flex: 1, minHeight: 0 }}
        >
          <Typography sx={{ fontSize: 12, color: '#909399' }}>暂无可添加字段</Typography>
        </Stack>
      )}
      {pointerDrag?.active && pointerDragField ? (
        <Button
          data-canvas-field-drag-preview="true"
          variant="text"
          sx={{
            position: 'fixed',
            left: pointerDrag.currentX - pointerDrag.offsetX,
            top: pointerDrag.currentY - pointerDrag.offsetY,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: pointerDrag.width,
            height: pointerDrag.height,
            px: 1.25,
            py: 1,
            borderRadius: 1,
            bgcolor: '#fff',
            border: '1px solid #edf1f7',
            boxShadow: '0 14px 36px rgba(15, 23, 42, 0.16)',
            opacity: 0.98,
            pointerEvents: 'none',
            textTransform: 'none',
            mt: '0 !important',
          }}
        >
          {renderFieldButtonContent(pointerDragField)}
        </Button>
      ) : null}
    </Stack>
  );
}
