/** Canonical visual contract for independent list tables and the MUI theme. */
export const listTableHeaderCellStyle = {
  height: 48,
  padding: '0 16px',
  color: '#606266',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
  backgroundColor: '#f5f7fa',
  borderBottom: '1px solid #e4e7ed',
} as const;

export const listTableHeaderCellSx = listTableHeaderCellStyle;

/** Canonical shadow at the left edge of a right-frozen table column. */
export const listTableStickyEdgeShadow = '-6px 0 8px -8px rgba(0, 0, 0, 0.35)';
const listTableBodyDividerShadow = 'inset 0 -1px 0 #ebeef5';

/** Shared paint contract for a right-frozen table cell. */
export const listTableStickyEdgeSx = {
  backgroundClip: 'padding-box',
  boxShadow: listTableStickyEdgeShadow,
  // Row-level body-cell rules also set boxShadow. Keep the frozen edge above
  // those rules without losing the row divider inside the sticky cell.
  '&&.MuiTableCell-body': {
    borderBottom: 'none',
    boxShadow: `${listTableStickyEdgeShadow}, ${listTableBodyDividerShadow}`,
  },
} as const;

/** Shared right-frozen operation-column geometry and edge paint. */
export function listTableStickyActionSx(width: number, layer: 'head' | 'body') {
  return {
    position: 'sticky' as const,
    right: 0,
    zIndex: layer === 'head' ? 4 : 2,
    width,
    minWidth: width,
    maxWidth: width,
    backgroundColor: layer === 'head' ? '#f5f7fa' : '#fff',
    ...listTableStickyEdgeSx,
  } as const;
}

export const listTableBodyCellSx = {
  height: 40,
  lineHeight: '20px',
  py: 0,
  borderBottom: 'none',
  boxShadow: listTableBodyDividerShadow,
} as const;

/**
 * Primary text in an independent list remains ordinary body text even when
 * the cell opens a detail view. The row or neutral button carries the action
 * affordance; the text itself is not styled as a hyperlink.
 */
export const listTablePrimaryTextSx = {
  color: '#303133',
  fontWeight: 400,
  fontFamily: 'inherit',
  fontSize: 14,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover': {
    color: '#303133',
    textDecoration: 'none',
  },
} as const;

/** Shared visual contract for a resizable list-table column handle. */
export const listColumnResizeHandleSx = {
  position: 'absolute' as const,
  top: 0,
  // Keep the entire 8px hitbox inside the current header cell. If it straddles
  // the edge, the following sticky cell can win hit-testing on the outside
  // half even though the resize handle is visibly present.
  right: 0,
  zIndex: 3,
  width: 8,
  height: '100%',
  cursor: 'col-resize',
  pointerEvents: 'auto' as const,
  userSelect: 'none' as const,
  touchAction: 'none' as const,
  '&::after': {
    content: '""',
    position: 'absolute' as const,
    top: '50%',
    // Render the 1px line on the inner side of the column boundary. Sticky
    // sibling cells paint their own background and cover any outside line.
    right: 0,
    transform: 'translateY(-50%)',
    // MUI System treats numeric widths in (0, 1] as percentages. Keep this
    // value explicit so the divider is 1px instead of filling the 8px hitbox.
    width: '1px',
    height: 18,
    bgcolor: '#dcdfe6',
    borderRadius: '1px',
    transition: 'background-color 120ms ease',
  },
  '&:hover': { bgcolor: '#d1e9ff' },
  '&:hover::after': { bgcolor: '#1890ff' },
} as const;
