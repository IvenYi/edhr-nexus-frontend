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

export const listTableBodyCellSx = {
  height: 40,
  lineHeight: '20px',
  py: 0,
  borderBottom: 'none',
  boxShadow: 'inset 0 -1px 0 #ebeef5',
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
