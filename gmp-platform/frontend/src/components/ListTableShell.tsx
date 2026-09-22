import { TableContainer, type TableContainerProps } from '@mui/material';
import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export interface ListTableColumn<Id extends string = string> {
  id: Id;
  width: number;
}

export interface ListTableShellProps extends Omit<TableContainerProps, 'children'> {
  /** The table's minimum canvas width. Defaults to the measured viewport width. */
  minTableWidth?: number;
  children: ReactNode | ((tableWidth: number) => ReactNode);
}

/**
 * Shared horizontal geometry for independent list tables and hierarchical
 * tables. Pages own columns, row rendering, actions, and domain behavior.
 */
export const ListTableShell = forwardRef<HTMLDivElement, ListTableShellProps>(function ListTableShell(
  { minTableWidth = 0, children, ...tableContainerProps },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateWidth = () => setViewportWidth(container.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const setContainerRef = (element: HTMLDivElement | null) => {
    containerRef.current = element;
    if (typeof forwardedRef === 'function') forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  };

  const tableWidth = Math.max(minTableWidth, viewportWidth);
  return (
    <TableContainer
      {...tableContainerProps}
      ref={setContainerRef}
      sx={[
        {
          // A table whose persisted columns were narrowed must still occupy
          // the visible list viewport; wider tables keep their scroll width.
          // Use min-width rather than flex growth so data rows keep their
          // canonical height instead of stretching to fill an empty body.
          '& > .MuiTable-root': { minWidth: '100% !important' },
        },
        ...(Array.isArray(tableContainerProps.sx) ? tableContainerProps.sx : [tableContainerProps.sx]),
      ]}
    >
      {typeof children === 'function' ? children(tableWidth) : children}
    </TableContainer>
  );
});

/**
 * Assign leftover viewport width across declared content columns while keeping
 * fixed columns (usually the operation column) unchanged. The same resolved
 * widths must be used by colgroup, the header, and every row.
 */
export function resolveListColumnWidths<Id extends string>(
  columns: readonly ListTableColumn<Id>[],
  tableWidth: number,
  preferredColumnId: Id,
  fixedColumnIds: readonly Id[] = [],
): Record<Id, number> {
  const widths = {} as Record<Id, number>;
  let baseWidth = 0;

  columns.forEach((column) => {
    widths[column.id] = column.width;
    baseWidth += column.width;
  });

  const expandableColumns = columns.filter((column) => !fixedColumnIds.includes(column.id));
  const extraWidth = tableWidth - baseWidth;
  if (extraWidth > 0 && expandableColumns.length > 0) {
    const preferredIndex = expandableColumns.findIndex((column) => column.id === preferredColumnId);
    const orderedColumns = preferredIndex > 0
      ? [...expandableColumns.slice(preferredIndex), ...expandableColumns.slice(0, preferredIndex)]
      : expandableColumns;
    const sharedExtraWidth = Math.floor(extraWidth / orderedColumns.length);
    let remainder = extraWidth % orderedColumns.length;
    orderedColumns.forEach((column) => {
      widths[column.id] += sharedExtraWidth + (remainder > 0 ? 1 : 0);
      remainder -= 1;
    });
  }

  return widths;
}
