import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Box, ButtonBase, ClickAwayListener, IconButton, Paper, Popper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import type { ProductionOutput } from '@/api/work-orders';
import { quantitySourceRows, quantitySourceStatus, quantityText } from './productionQuantitySources';

const labels: Record<string, string> = {
  PARTIAL: '部分汇总', UNIT_REVIEW: '待核对', PENDING: '待处理', FAILED: '处理失败',
  NOT_CONFIGURED: '未配置', NOT_STARTED: '未开工', LEGACY: '未配置（历史）', NO_DATA: '暂无数据', UNSUPPORTED: '未配置',
};

const attributeLabels: Record<string, string> = { outputQuantity: '产出数量', goodQuantity: '良品数量', ngQuantity: '不良品数量', quantity: '数量', unit: '单位', unitLabel: '单位名称', reason: '原因', reasonLabel: '原因名称', category: '报废分类', categoryLabel: '分类名称', materialLotText: '物料批号', productionDate: '生产日期', reportStartTime: '报工开始时间', reportEndTime: '报工结束时间', workHours: '投入人时', reporterLabel: '报工人', teamText: '班组', documentNumberText: '关联单据号' };
const display = (value: unknown): string => value == null || value === '' ? '—' : typeof value === 'object' ? String((value as { name?: string; code?: string }).name || (value as { code?: string }).code || '—') : String(value);

const formStatusLabels: Record<string, string> = { COMPLETED: '已完成', IN_PROGRESS: '填报中', RUNNING: '进行中', DRAFT: '草稿', PENDING: '待填报', ACTIVE: '进行中', RETURNED: '已退回' };

function QuantitySources({ output, savedOutput }: { output?: ProductionOutput; savedOutput?: ProductionOutput }) {
  const rows = quantitySourceRows(output, savedOutput);
  return <Stack spacing={1.5} sx={{ minHeight: 0 }}>
    {savedOutput ? <Box sx={{ flexShrink: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', bgcolor: 'action.hover', borderRadius: 1, mb: 0.75 }}>
        {([['已生效数量', output], ['已填报数量', savedOutput]] as const).map(([title, metric], index) => <Box key={title} sx={{ px: 1.5, py: 1, borderLeft: index ? '1px solid' : undefined, borderColor: 'divider' }}><Typography variant="caption" color="text.secondary" component="div">{title}</Typography><Typography variant="subtitle2" sx={{ mt: 0.25, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>{quantityText(metric)}</Typography></Box>)}
      </Box>
      <Typography variant="caption" color="text.secondary" component="div">已填报包含已生效部分，不重复相加；仅累计可核对的同物料、同单位数量。</Typography>
    </Box> : <Typography variant="caption" color="text.secondary">{output?.message}</Typography>}
    <Box sx={{ maxHeight: 340, minHeight: 0, overflow: 'auto', overscrollBehavior: 'contain' }} tabIndex={0} aria-label="数量来源列表">
      {(savedOutput ? [['已生效', output], ['已填报', savedOutput]] as const : [['分项累计', output]] as const).map(([title, metric]) => (metric?.groups?.length ?? 0) > 1 ? <Box key={title} sx={{ pb: 1 }}><Typography variant="subtitle2">{title}</Typography>{metric?.groups?.map((group, i) => <Typography key={i} variant="body2">{group.materialName || '数量'}：{group.quantity} {group.unit || '单位未填写'}</Typography>)}</Box> : null)}
      {rows.length ? rows.map((row, index) => {
        const source = { ...row.effective, ...row.saved, currentMaterialType: row.effective?.currentMaterialType || row.saved?.currentMaterialType } as NonNullable<ProductionOutput['sources']>[number];
        const status = quantitySourceStatus(row);
        return <Box key={`${source.recordId}:${source.fieldId}:${index}`} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', '&:last-child': { mb: 0 } }}>
        <Box sx={{ px: 1.5, py: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1.5}><Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary">来源 {index + 1}</Typography><Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{source.instanceNo || '已保存表单'}</Typography></Box><Typography variant="body2" sx={{ flexShrink: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{source.quantity ?? '—'} {source.unit || '单位未填写'}</Typography></Stack>
          {savedOutput ? <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 0.75 }}><Typography variant="caption" sx={{ px: 0.75, border: '1px solid', borderColor: 'divider', borderRadius: 0.5, bgcolor: 'background.paper', color: 'text.secondary' }}>表单：{formStatusLabels[source.formStatus ?? ''] || '状态未记录'}</Typography><Typography variant="caption" sx={{ px: 0.75, borderRadius: 0.5, bgcolor: theme => alpha(status === '已生效' ? theme.palette.success.main : theme.palette.warning.main, 0.1), color: status === '已生效' ? 'success.dark' : 'warning.dark' }}>统计：{status}</Typography></Stack> : null}
        </Box>
        <Stack spacing={0.75} sx={{ p: 1.5 }}>
        {source.operationName ? <Typography variant="caption" color="text.secondary">工序：{source.operationName}</Typography> : null}
        {row.saved && row.effective && (row.saved.quantity !== row.effective.quantity || row.saved.unit !== row.effective.unit) ? <Typography variant="caption" color="warning.dark">生效记录值：{row.effective.quantity ?? '—'} {row.effective.unit || '单位未填写'}；与当前填报值不同</Typography> : null}
        {source.materialName ? <Typography variant="caption" component="div">物料：{source.materialName}{source.materialCode ? `（${source.materialCode}）` : ''}{source.currentMaterialType ? ` · 当前类别：${source.currentMaterialType}` : ''}</Typography> : null}
        <Typography variant="caption" component="div" color="text.secondary">{source.tableId ? `${source.tableName || '子表明细'} · ${source.rowLabel || source.rowKey}` : '主表'}{source.fieldName ? ` · ${source.fieldName}` : ''}</Typography>
        {row.effective?.message ? <Typography variant="caption" component="div" color={row.effective.included ? 'text.secondary' : 'warning.dark'}>{row.effective.message}</Typography> : null}
        {row.saved && !row.saved.included ? <Typography variant="caption" component="div" color="warning.dark">填报数据：{row.saved.message}</Typography> : null}
        <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: '104px minmax(0, 1fr)', borderTop: '1px solid', borderColor: 'divider', '& dt, & dd': { py: 0.5, px: 1, borderBottom: '1px solid', borderColor: 'divider' }, '& dt': { bgcolor: 'action.hover' } }}>
          {Object.entries(source.attributes ?? {}).filter(([key]) => attributeLabels[key]).map(([key, value]) => <Box key={key} sx={{ display: 'contents' }}><Typography component="dt" variant="caption" color="text.secondary">{attributeLabels[key]}</Typography><Typography component="dd" variant="caption" sx={{ m: 0, overflowWrap: 'anywhere' }}>{display(value)}</Typography></Box>)}
          {source.details?.map((detail, i) => <Box key={i} sx={{ display: 'contents' }}><Typography component="dt" variant="caption" color="text.secondary">{detail.name}</Typography><Typography component="dd" variant="caption" sx={{ m: 0, overflowWrap: 'anywhere' }}>{display(detail.value)}</Typography></Box>)}
        </Box>
        </Stack>
      </Box>; }) : <Typography variant="body2" color="text.secondary">暂无已记录来源</Typography>}
    </Box>
  </Stack>;
}

export function ProductionOutputValue({ output, savedOutput, label = '累计产出', suspended = false, compact = false }: { output?: ProductionOutput; savedOutput?: ProductionOutput; label?: string; suspended?: boolean; compact?: boolean }) {
  const [mode, setMode] = useState<'hover' | 'pinned' | null>(null);
  const [availableHeight, setAvailableHeight] = useState(340);
  const anchor = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const suppressFocus = useRef(false);
  const id = useId();
  const cancelClose = () => clearTimeout(timer.current);
  const close = (restore = false) => { cancelClose(); setMode(null); if (restore) requestAnimationFrame(() => { suppressFocus.current = true; anchor.current?.focus({ preventScroll: true }); }); };
  const leave = () => { cancelClose(); if (mode === 'hover') timer.current = setTimeout(() => setMode(current => current === 'hover' ? null : current), 150); };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (suspended) { clearTimeout(timer.current); setMode(null); } }, [suspended]);
  useLayoutEffect(() => {
    if (!mode || suspended) return;
    const measure = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const container = anchor.current?.closest('[role="dialog"], .MuiDrawer-paper, .execution-page')?.getBoundingClientRect();
      const top = Math.max(0, container?.top ?? 0) + 8;
      const bottom = Math.min(window.innerHeight, container?.bottom ?? window.innerHeight) - 8;
      setAvailableHeight(Math.max(0, Math.floor(Math.max(rect.top - top, bottom - rect.bottom) - 8)));
    };
    measure(); window.addEventListener('resize', measure); document.addEventListener('scroll', measure, true);
    return () => { window.removeEventListener('resize', measure); document.removeEventListener('scroll', measure, true); };
  }, [mode, suspended]);
  useEffect(() => {
    if (!mode) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(mode === 'pinned'); } };
    document.addEventListener('keydown', escape, true); return () => document.removeEventListener('keydown', escape, true);
  }, [mode]);
  const value = quantityText(output);
  const statusLabel = output ? labels[output.status] : '暂无数据';
  return <ClickAwayListener onClickAway={() => close()}><Box component="span" sx={{ display: 'inline-flex', maxWidth: '100%' }}>
    <ButtonBase ref={anchor} disabled={suspended} aria-label={`${label}：${value}${statusLabel ? `，${statusLabel}` : ''}，查看来源明细`} aria-haspopup="dialog" aria-expanded={Boolean(mode) && !suspended} aria-controls={mode && !suspended ? id : undefined}
      onPointerEnter={event => { cancelClose(); if (event.pointerType === 'mouse' && !event.buttons) setMode(current => current ?? 'hover'); }} onPointerLeave={leave}
      onFocus={() => { if (suppressFocus.current) suppressFocus.current = false; else setMode(current => current ?? 'hover'); }}
      onBlur={event => { if (!event.relatedTarget || !(event.relatedTarget as HTMLElement).closest(`#${CSS.escape(id)}`)) leave(); }}
      onClick={event => { event.stopPropagation(); cancelClose(); setMode(current => current === 'pinned' ? null : 'pinned'); }}
      sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', minWidth: 24, maxWidth: '100%', borderRadius: 0.5, color: 'primary.main', '&:hover': { color: 'primary.dark', textDecoration: 'underline' }, '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
      {!(compact && value === '—' && statusLabel) ? <Typography component="span" variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Typography> : null}
      {statusLabel ? <Typography component="span" variant="caption" color={['PARTIAL', 'UNIT_REVIEW', 'FAILED'].includes(output?.status ?? '') ? 'warning.dark' : 'inherit'}>{statusLabel}</Typography> : null}
    </ButtonBase>
    <Popper open={Boolean(mode) && !suspended} anchorEl={anchor.current} placement="bottom-start" container={() => anchor.current?.closest('[role="dialog"], .MuiDrawer-paper, .execution-page') || document.body} sx={{ zIndex: theme => theme.zIndex.tooltip }} modifiers={[{ name: 'offset', options: { offset: [0, 8] } }, { name: 'preventOverflow', options: { padding: 8 } }]}>
      <Paper id={id} role="dialog" aria-labelledby={`${id}-title`} elevation={4} onPointerEnter={cancelClose} onPointerLeave={leave} sx={{ width: 480, maxWidth: 'calc(100vw - 32px)', maxHeight: availableHeight, display: 'flex', flexDirection: 'column', p: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexShrink: 0, pb: 1, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}><Typography id={`${id}-title`} variant="subtitle2">{label}明细</Typography><IconButton size="small" aria-label="关闭数量明细" onClick={() => close(true)}><CloseRounded fontSize="small" /></IconButton></Stack>
        {output || savedOutput ? <QuantitySources output={output} savedOutput={savedOutput} /> : <Typography variant="body2">暂无已记录来源</Typography>}
      </Paper>
    </Popper>
  </Box></ClickAwayListener>;
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
