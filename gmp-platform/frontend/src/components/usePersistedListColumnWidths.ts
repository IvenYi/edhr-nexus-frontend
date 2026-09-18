import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { getCurrentUserPreferenceStorageKey } from './ListColumnSettingsPopover';

export type ResizableListColumn<ColumnId extends string> = {
  id: ColumnId;
  width: number;
  minWidth?: number;
};

type ResizeSession<ColumnId extends string> = {
  columnId: ColumnId;
  pointerId: number;
  startX: number;
  startWidth: number;
  minWidth: number;
};

export function usePersistedListColumnWidths<ColumnId extends string>(
  columns: readonly ResizableListColumn<ColumnId>[],
  storagePrefix: string,
) {
  const storageKey = useMemo(() => getCurrentUserPreferenceStorageKey(storagePrefix), [storagePrefix]);
  const [widths, setWidths] = useState<Partial<Record<ColumnId, number>>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || '{}') as Record<string, unknown>;
      return Object.fromEntries(columns.flatMap((column) => {
        const value = raw[column.id];
        return typeof value === 'number' && Number.isFinite(value)
          ? [[column.id, Math.max(column.minWidth ?? 80, value)]]
          : [];
      })) as Partial<Record<ColumnId, number>>;
    } catch {
      return {};
    }
  });
  const resizeSessionRef = useRef<ResizeSession<ColumnId> | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(widths));
  }, [storageKey, widths]);

  const getColumnWidth = useCallback(
    (column: ResizableListColumn<ColumnId>) => Math.max(column.minWidth ?? 80, widths[column.id] ?? column.width),
    [widths],
  );

  const getResizeHandleProps = useCallback((column: ResizableListColumn<ColumnId>) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      resizeSessionRef.current = {
        columnId: column.id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: getColumnWidth(column),
        minWidth: column.minWidth ?? 80,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      const session = resizeSessionRef.current;
      if (!session || session.pointerId !== event.pointerId || session.columnId !== column.id) return;
      setWidths((current) => ({
        ...current,
        [column.id]: Math.max(session.minWidth, session.startWidth + event.clientX - session.startX),
      }));
    },
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (resizeSessionRef.current?.pointerId !== event.pointerId) return;
      resizeSessionRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => { resizeSessionRef.current = null; },
  }), [getColumnWidth]);

  return { getColumnWidth, getResizeHandleProps };
}
