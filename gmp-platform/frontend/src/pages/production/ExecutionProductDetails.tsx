import { useEffect, useId, useRef, useState } from 'react';
import { Box, Button, ClickAwayListener, IconButton, Paper, Popper, Typography } from '@mui/material';
import { CloseRounded, InfoOutlined } from '@mui/icons-material';
import type { ExecutionView } from '@/api/production-execution';

export default function ExecutionProductDetails({ context, container, suspended }: {
  context: ExecutionView['snapshot']['context']; container: () => HTMLElement | null; suspended: boolean;
}) {
  const [mode, setMode] = useState<'hover' | 'pinned' | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const id = useId();
  const cancelClose = () => clearTimeout(timer.current);
  const close = () => { cancelClose(); setMode(null); };
  const leave = () => { cancelClose(); if (mode === 'hover') timer.current = setTimeout(() => setMode(null), 150); };
  useEffect(() => { if (suspended) { clearTimeout(timer.current); setMode(null); } }, [suspended]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!mode || suspended) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault(); clearTimeout(timer.current); setMode(null);
      if (mode === 'pinned') trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [mode, suspended]);
  const fields = [
    ['产品名称', context.productName], ['产品编码', context.productCode], ['产品规格', context.specification],
    ['生产版本', context.processVersion], ['生产模式', context.productionMode],
    ['工艺路线', context.routeName], ['路线版本', context.routeVersion], ['eDHR', context.dhrName], ['eDHR 版本', context.dhrVersion],
  ];
  return <ClickAwayListener onClickAway={close}>
    <Box component="span" className="execution-product-details">
      <Button ref={trigger} className="execution-product-trigger" disabled={suspended} aria-label={`查看生产产品详情：${context.productName || '未配置'}`} aria-expanded={Boolean(mode) && !suspended} aria-controls={mode ? id : undefined} aria-haspopup="dialog"
        onPointerEnter={(event) => { cancelClose(); if (!suspended && event.pointerType === 'mouse' && !event.buttons) setMode(current => current ?? 'hover'); }}
        onPointerLeave={leave} onClick={() => { cancelClose(); setMode(current => current === 'pinned' ? null : 'pinned'); }}>
        <span>{context.productName || '未配置'}</span><InfoOutlined />
      </Button>
      <Popper open={Boolean(mode) && !suspended} anchorEl={trigger.current} container={container} placement="right-start" className="execution-product-popper" modifiers={[{ name: 'offset', options: { offset: [0, 10] } }]}>
        <Paper role="dialog" aria-labelledby={`${id}-title`} id={id} className="execution-product-paper" elevation={6} onPointerEnter={cancelClose} onPointerLeave={leave}>
          <Box className="execution-product-title"><Typography id={`${id}-title`} component="h3">生产产品详情</Typography><IconButton size="small" aria-label="关闭产品详情" onClick={() => { close(); trigger.current?.focus({ preventScroll: true }); }}><CloseRounded fontSize="small" /></IconButton></Box>
          <Box component="dl" className="execution-product-fields">{fields.map(([label, value]) => <Box key={label}><Typography component="dt">{label}</Typography><Typography component="dd">{value || '—'}</Typography></Box>)}</Box>
        </Paper>
      </Popper>
    </Box>
  </ClickAwayListener>;
}
