import { useState } from 'react';
import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material';
import type { ProductionOutput } from '@/api/work-orders';

const labels: Record<string, string> = {
  PARTIAL: '部分汇总', UNIT_REVIEW: '待核对', PENDING: '待处理', FAILED: '处理失败',
  NOT_CONFIGURED: '未配置', NOT_STARTED: '未开工', LEGACY: '未配置（历史）', NO_DATA: '暂无数据', UNSUPPORTED: '未配置',
};

export function ProductionOutputValue({ output }: { output?: ProductionOutput }) {
  const groups = output?.groups ?? [];
  const value = output?.quantity != null ? `${output.quantity} ${output.unit || '（单位未填写）'}`
    : groups.length > 1 ? groups.map(group => `${group.quantity} ${group.unit || '（单位未填写）'}`).join('；') : '—';
  const label = output ? labels[output.status] : '暂无数据';
  return <Tooltip title={output?.message ?? '暂无产出数据'}><Stack component="span" spacing={0.25}>
    <Typography component="span" variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
    {label ? <Typography component="span" variant="caption" color={['PARTIAL', 'UNIT_REVIEW', 'FAILED'].includes(output?.status ?? '') ? 'warning.dark' : 'text.secondary'}>{label}</Typography> : null}
  </Stack></Tooltip>;
}

export function ProductionOutputDetails({ output }: { output?: ProductionOutput }) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const batches = output?.batches;
  const rows = batches ?? output?.sources ?? [];
  const safePage = Math.min(page, Math.max(0, Math.ceil(rows.length / size) - 1));
  return <Stack spacing={1}>
    <ProductionOutputValue output={output} />
    {output?.operationName ? <Typography variant="body2">最终产出工序：{output.operationName}</Typography> : null}
    <Typography variant="caption" color="text.secondary">{output?.message ?? '暂无产出数据'}</Typography>
    {rows.length ? <Box>
      <TableContainer sx={{ maxHeight: 320 }}><Table stickyHeader size="small" aria-label={batches ? '批次产出来源' : '正式报工产出来源'}>
        <TableHead><TableRow>{(batches ? ['批次', '最终产出工序', '累计产出', '说明'] : ['来源表单', '位置', '报工产出', '计入情况']).map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{batches ? batches.slice(safePage * size, (safePage + 1) * size).map((batch, index) => <TableRow key={batch.objectId ?? index}>
          <TableCell>{batch.objectNo}</TableCell><TableCell>{batch.operationName || '—'}</TableCell><TableCell><ProductionOutputValue output={batch} /></TableCell><TableCell>{batch.message}</TableCell>
        </TableRow>) : output?.sources?.slice(safePage * size, (safePage + 1) * size).map(source => <TableRow key={source.recordId}>
          <TableCell>{source.instanceNo}</TableCell><TableCell>{source.tableId ? `子表明细 · ${source.rowKey}` : '主表'}</TableCell>
          <TableCell>{source.quantity ?? '—'} {source.unit || '（单位未填写）'}</TableCell><TableCell>{source.included ? '已计入' : source.message}</TableCell>
        </TableRow>)}</TableBody>
      </Table></TableContainer>
      {rows.length > 20 ? <TablePagination component="div" count={rows.length} page={safePage} rowsPerPage={size} rowsPerPageOptions={[20, 50]}
        labelRowsPerPage="每页条数" labelDisplayedRows={({ from, to, count }) => `${from}–${to} / 共 ${count} 条`}
        getItemAriaLabel={type => type === 'next' ? '下一页' : type === 'previous' ? '上一页' : type === 'first' ? '首页' : '末页'}
        onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={event => { setSize(Number(event.target.value)); setPage(0); }} /> : null}
    </Box> : null}
  </Stack>;
}
