import { Box, FormControl, MenuItem, Pagination, Select, Stack, Typography } from '@mui/material';

export const FORM_PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;

export const formTableHeaderCellSx = {
  height: 48,
  py: 0,
  color: '#606266',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  bgcolor: '#f5f7fa',
  borderBottom: '1px solid #e4e7ed',
};

export const formTableBodyCellSx = {
  height: 40,
  lineHeight: '20px',
  py: 0,
  borderBottom: 'none',
  boxShadow: 'inset 0 -1px 0 #ebeef5',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const formListFieldSx = {
  '& .MuiInputBase-root': { height: 40 },
  '& .MuiInputBase-input': { boxSizing: 'border-box' },
};

export const formListQueryPanelSx = {
  flex: '0 0 auto',
  border: '1px solid #e4e7ed',
  borderRadius: 1,
  bgcolor: '#fff',
  p: 2,
};

export const formListQueryGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
  gap: 1.5,
  alignItems: 'center',
};

export const formListAdvancedGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
  gap: 1.5,
  pt: 1.5,
  borderTop: '1px solid #ebeef5',
};

export const formListFilterActionsSx = {
  gridColumn: { xs: '1 / -1', md: 'auto' },
};

export function FormListPagination({
  totalElements,
  totalPages,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const pageCount = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page + 1, 1), pageCount);

  return (
    <Box sx={{ flex: '0 0 auto', minHeight: 56, px: 2, borderTop: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" sx={{ color: '#909399', whiteSpace: 'nowrap' }}>共 {totalElements} 条数据</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Pagination size="small" color="primary" page={currentPage} count={pageCount} onChange={(_, value) => onPageChange(value - 1)} />
        <FormControl size="small" sx={{ width: 116, minWidth: 116 }}>
          <Select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} sx={{ height: 32, fontSize: 14 }} inputProps={{ 'aria-label': '每页条数' }}>
            {FORM_PAGE_SIZE_OPTIONS.map((size) => <MenuItem key={size} value={size}>{size} 条/页</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}
