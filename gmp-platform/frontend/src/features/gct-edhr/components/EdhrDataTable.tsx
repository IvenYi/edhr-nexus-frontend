import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import type { EdhrActionMeta, EdhrFieldMeta, EdhrPageMeta, EdhrRecord, EdhrSortDirection } from '../types';
import PermissionButton from './PermissionButton';

interface EdhrDataTableProps {
  page: EdhrPageMeta;
  records: EdhrRecord[];
  total: number;
  loading?: boolean;
  pagination: {
    page: number;
    pageSize: number;
  };
  sorting: {
    sortField?: string;
    sortDirection: EdhrSortDirection;
  };
  actions: EdhrActionMeta[];
  setPagination: (pagination: { page?: number; pageSize?: number }) => Promise<void>;
  setSorting: (sorting: { sortField?: string; sortDirection?: EdhrSortDirection }) => Promise<void>;
  selectRecord: (recordId: string | null) => Promise<void>;
  onRowAction: (action: EdhrActionMeta, record: EdhrRecord) => void;
}

const rowActionBlockList = new Set(['query', 'reset', 'create', 'add', 'import', 'export', 'download', 'batch_download']);

export default function EdhrDataTable({
  page,
  records,
  total,
  loading = false,
  pagination,
  sorting,
  actions,
  setPagination,
  setSorting,
  selectRecord,
  onRowAction,
}: EdhrDataTableProps) {
  const visibleFields = getVisibleFields(page).slice(0, 8);
  const rowActions = actions.filter((action) => !rowActionBlockList.has(action.code)).slice(0, 6);

  const handleSort = async (field: EdhrFieldMeta) => {
    const nextDirection: EdhrSortDirection =
      sorting.sortField === field.name && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    await setSorting({ sortField: field.name, sortDirection: nextDirection });
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden', bgcolor: '#fff' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 390px)', minHeight: 280 }}>
        <Table stickyHeader size="small" aria-label={`${page.title}列表`}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 96, fontWeight: 700 }}>状态</TableCell>
              {visibleFields.map((field) => (
                <TableCell key={field.id} sx={{ minWidth: 132, fontWeight: 700 }}>
                  <TableSortLabel
                    active={sorting.sortField === field.name}
                    direction={sorting.sortField === field.name ? sorting.sortDirection : 'asc'}
                    onClick={() => handleSort(field)}
                  >
                    {field.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ minWidth: 178, fontWeight: 700 }}>系统</TableCell>
              <TableCell align="right" sx={{ width: 220, fontWeight: 700 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={visibleFields.length + 3} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleFields.length + 3} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">暂无匹配数据</Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow
                  hover
                  key={record.id}
                  onClick={() => selectRecord(record.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Chip size="small" label={record.status} color={getStatusColor(record.status)} variant="outlined" />
                  </TableCell>
                  {visibleFields.map((field) => (
                    <TableCell key={field.id}>{formatRecordValue(getRecordValue(record, field))}</TableCell>
                  ))}
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">{record.updatedBy}</Typography>
                      <Typography variant="caption" color="text.disabled">{formatDateTime(record.updatedAt)}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      onClick={(event) => event.stopPropagation()}
                      sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25, flexWrap: 'wrap' }}
                    >
                      {rowActions.map((action) => (
                        <PermissionButton
                          key={action.id}
                          compact
                          action={action}
                          onClick={() => onRowAction(action, record)}
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={Math.max(0, pagination.page - 1)}
        rowsPerPage={pagination.pageSize}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="每页"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        onPageChange={(_, nextPage) => setPagination({ page: nextPage + 1 })}
        onRowsPerPageChange={(event) => setPagination({ page: 1, pageSize: Number(event.target.value) })}
      />
    </Paper>
  );
}

function getVisibleFields(page: EdhrPageMeta): EdhrFieldMeta[] {
  if (page.listFields.length > 0) return page.listFields;
  if (page.formFields.length > 0) return page.formFields.slice(0, 8);
  return page.fields.filter((field) => !field.system).slice(0, 8);
}

function getRecordValue(record: EdhrRecord, field: EdhrFieldMeta): unknown {
  if (field.name in record) return record[field.name as keyof EdhrRecord];
  return record.values[field.name] ?? record.values[field.label];
}

function formatRecordValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'number') return value.toLocaleString('zh-CN');
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
  return String(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

function getStatusColor(status: string): ChipProps['color'] {
  if (['已完成', '启用', '已放行', '通过'].some((item) => status.includes(item))) return 'success';
  if (['驳回', '禁用', '已删除', '失败'].some((item) => status.includes(item))) return 'error';
  if (['待', '草稿'].some((item) => status.includes(item))) return 'warning';
  if (['处理中', '执行中'].some((item) => status.includes(item))) return 'info';
  return 'default';
}
