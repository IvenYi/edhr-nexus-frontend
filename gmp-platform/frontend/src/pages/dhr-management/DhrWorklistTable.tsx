import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import { InfoOutlined, TuneRounded, ViewColumnRounded } from '@mui/icons-material';
import { ListTableShell, resolveListColumnWidths } from '@/components/ListTableShell';
import TableStateCell from '@/components/TableStateCell';
import ListColumnSettingsPopover, { getCurrentUserPreferenceStorageKey, loadListColumnSettings, reorderListColumns } from '@/components/ListColumnSettingsPopover';
import { usePersistedListColumnWidths } from '@/components/usePersistedListColumnWidths';
import { listColumnResizeHandleSx, listTableBodyCellSx, listTableHeaderCellSx, listTableStickyEdgeSx } from '@/components/listTableStyles';
import { FormListPagination } from '@/pages/form-management/formManagementListStyles';

export interface DhrWorkColumn { id: string; label: string; width: number }
export default function DhrWorklistTable<T extends { id: string }>({ storageKey, columns, rows, loading, error, toolbar, helpText, cell, action, page, size, total, pages, onPage, onSize }: {
  storageKey: string; columns: readonly DhrWorkColumn[]; rows: T[]; loading: boolean; error?: string; toolbar?: ReactNode; helpText?: string;
  cell: (row: T, id: string) => ReactNode; action: (row: T) => ReactNode; page: number; size: number; total: number; pages: number;
  onPage: (page: number) => void; onSize: (size: number) => void;
}) {
  const key = useMemo(() => getCurrentUserPreferenceStorageKey(storageKey), [storageKey]);
  const dataColumns = useMemo(() => columns.filter(c => c.id !== 'status'), [columns]);
  const statusColumn = columns.find(c => c.id === 'status');
  const [settings, setSettings] = useState(() => loadListColumnSettings(key, dataColumns, 1));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { getColumnWidth, getResizeHandleProps } = usePersistedListColumnWidths(columns, `${storageKey}:widths`);
  useEffect(() => { localStorage.setItem(key, JSON.stringify(settings)); }, [key, settings]);
  const visible = settings.order.filter(id => !settings.hidden.includes(id)).map(id => dataColumns.find(c => c.id === id)!).filter(Boolean);
  const widths = [...visible.map(c => ({ id: c.id, width: getColumnWidth(c) })), ...(statusColumn ? [{ id: 'status', width: statusColumn.width }] : []), { id: 'actions', width: 64 }];
  const empty = loading || Boolean(error) || !rows.length;
  return <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden' }}>
    <Box sx={{ minHeight: 48, pl: toolbar ? 0 : 2, pr: toolbar ? 1.5 : 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #e4e7ed' }}>
      {toolbar}
      <Tooltip title="字段设置" arrow><IconButton size="small" aria-label="字段设置" onClick={e => setAnchor(e.currentTarget)} sx={{ width: 36, height: 36, border: '1px solid #e4e7ed', borderRadius: 1, ml: toolbar ? 'auto' : undefined }}><Box aria-hidden="true" sx={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ViewColumnRounded sx={{ fontSize: 21 }} /><TuneRounded sx={{ position: 'absolute', right: -3, bottom: -2, fontSize: 13, p: '1px', borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 0 0 1px #fff' }} /></Box></IconButton></Tooltip>
      {helpText && <Tooltip title={helpText} arrow><IconButton size="small" aria-label="当前视图说明" sx={{ color: '#909399' }}><InfoOutlined fontSize="small" /></IconButton></Tooltip>}
    </Box>
    <ListColumnSettingsPopover anchorEl={anchor} columns={dataColumns} settings={settings} onClose={() => setAnchor(null)} onToggle={id => setSettings(s => ({ ...s, hidden: s.hidden.includes(id) ? s.hidden.filter(k => k !== id) : [...s.hidden, id] }))} onReorder={(from, to) => setSettings(s => reorderListColumns(dataColumns, s, from, to))} />
    <ListTableShell minTableWidth={widths.reduce((sum, c) => sum + c.width, 0)} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{tableWidth => {
      const resolved = resolveListColumnWidths(widths, tableWidth, visible[0]?.id ?? 'actions', ['status', 'actions']);
      return <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: tableWidth, minWidth: tableWidth, height: empty ? '100%' : 'auto' }}>
        <colgroup>{widths.map(c => <col key={c.id} style={{ width: resolved[c.id] }} />)}</colgroup>
        <TableHead><TableRow>{visible.map(c => <TableCell key={c.id} sx={{ ...listTableHeaderCellSx, position: 'sticky', width: resolved[c.id] }}>{c.label}<Box aria-label={`调整${c.label}列宽`} sx={listColumnResizeHandleSx} {...getResizeHandleProps(c)} /></TableCell>)}{statusColumn && <TableCell align="center" sx={{ ...listTableHeaderCellSx, right: 64, width: statusColumn.width, zIndex: 4, ...listTableStickyEdgeSx }}>{statusColumn.label}</TableCell>}<TableCell align="center" sx={{ ...listTableHeaderCellSx, position: 'sticky', right: 0, width: 64, minWidth: 64, maxWidth: 64, zIndex: 4 }}>操作</TableCell></TableRow></TableHead>
        <TableBody>{empty ? <TableRow sx={{ height: '100%' }}><TableStateCell colSpan={widths.length} sx={{ height: '100%', color: error ? 'error.main' : 'text.secondary' }}>{loading ? '加载中…' : error || '暂无数据'}</TableStateCell></TableRow> : rows.map(row => <TableRow key={row.id} hover>{visible.map(c => <TableCell key={c.id} sx={listTableBodyCellSx}>{cell(row, c.id)}</TableCell>)}{statusColumn && <TableCell align="center" sx={{ ...listTableBodyCellSx, position: 'sticky', right: 64, width: statusColumn.width, bgcolor: '#fff', ...listTableStickyEdgeSx }}>{cell(row, 'status')}</TableCell>}<TableCell align="center" sx={{ ...listTableBodyCellSx, position: 'sticky', right: 0, width: 64, minWidth: 64, maxWidth: 64, bgcolor: '#fff' }}>{action(row)}</TableCell></TableRow>)}</TableBody>
      </Table>;
    }}</ListTableShell>
    <FormListPagination totalElements={total} totalPages={pages} page={page} pageSize={size} onPageChange={onPage} onPageSizeChange={onSize} />
  </Box>;
}
