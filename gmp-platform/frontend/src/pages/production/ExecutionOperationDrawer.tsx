import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Box, Button, Drawer, IconButton, Typography } from '@mui/material';
import { CloseRounded, SwapHorizRounded } from '@mui/icons-material';

export default function ExecutionOperationDrawer({ open, onOpen, onClose, disabled, currentName, currentStatus, currentStatusCode, container, children }: {
  open: boolean; onOpen: () => void; onClose: () => void; disabled: boolean;
  currentName: string; currentStatus: string; currentStatusCode?: string; container: () => HTMLElement | null; children: ReactNode;
}) {
  const wasOpen = useRef(open);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    let frame = 0;
    if (wasOpen.current && !open) {
      frame = requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    }
    wasOpen.current = open;
    return () => cancelAnimationFrame(frame);
  }, [open, disabled]);

  return <>
    <Box className="execution-operation-switch">
      <Typography component="span" className="execution-switch-status execution-status" data-status={currentStatusCode}>{currentStatus}</Typography>
      <Button ref={triggerRef} className="execution-switch-action" aria-label={`切换工序，当前${currentName}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} disabled={disabled}
        onClick={() => { if (open) onClose(); else onOpen(); }}><SwapHorizRounded /><span>切换工序</span></Button>
    </Box>
    <Drawer anchor="left" open={open} onClose={onClose} container={container} className="execution-operation-drawer"
      ModalProps={{ keepMounted: true }} PaperProps={{ role: 'dialog', 'aria-modal': true, 'aria-labelledby': `${id}-title`, id }}>
      <Box className="execution-drawer-heading"><Typography component="h2" id={`${id}-title`}>切换工序</Typography><IconButton size="small" aria-label="关闭工序抽屉" onClick={onClose}><CloseRounded fontSize="small" /></IconButton></Box>
      {children}
    </Drawer>
  </>;
}
