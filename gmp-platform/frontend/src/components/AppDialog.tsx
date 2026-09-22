import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Alert, Button, DialogContent, DialogTitle, LinearProgress, Dialog as MuiDialog, GlobalStyles, IconButton, Tooltip, type DialogProps } from '@mui/material';
import { Close } from '@mui/icons-material';
import { checkDeletion, type DeletionTarget } from '@/api/deletionCheck';
import { DELETION_BLOCKED_EVENT, showDeletionProtection } from '@/api/deletionProtection';

export type AppDialogVariant = 'standard' | 'form';

export interface AppDialogProps extends DialogProps {
  children: ReactNode;
  hideCloseButton?: boolean;
  closeAriaLabel?: string;
  deletionTarget?: DeletionTarget | null;
  onDeletionBlocked?: () => void;
  variant?: AppDialogVariant;
}

/** Standard application dialog with a consistent, non-destructive close affordance. */
export default function AppDialog({ children, onClose, hideCloseButton = false, closeAriaLabel = '关闭', PaperProps, deletionTarget, onDeletionBlocked, variant = 'standard', ...props }: AppDialogProps) {
  const [check, setCheck] = useState<{ key: string; allowed: boolean; error?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const blockedRef = useRef(onDeletionBlocked);
  blockedRef.current = onDeletionBlocked;
  const type = deletionTarget?.type;
  const id = deletionTarget?.id;
  const key = type && id !== undefined ? `${type}:${id}` : '';
  useEffect(() => {
    setCheck(null);
    if (!props.open || !type || id === undefined) return;
    const controller = new AbortController();
    const close = () => blockedRef.current ? blockedRef.current() : closeRef.current?.({}, 'escapeKeyDown');
    window.addEventListener(DELETION_BLOCKED_EVENT, close);
    void checkDeletion({ type, id }, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.allowed) setCheck({ key: `${type}:${id}`, allowed: true });
      else if (result.impact) {
        close();
        showDeletionProtection(result.impact);
      } else setCheck({ key: `${type}:${id}`, allowed: false, error: '未能确认关联状态，请重试' });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setCheck({ key: `${type}:${id}`, allowed: false, error: error instanceof Error ? error.message : '关联检查失败，请重试' });
    });
    return () => { controller.abort(); window.removeEventListener(DELETION_BLOCKED_EVENT, close); };
  }, [props.open, type, id, attempt]);
  const checking = Boolean(key) && (check?.key !== key || !check.allowed);
  const checkError = check?.key === key ? check.error : undefined;
  const handleClose = (event: MouseEvent<HTMLButtonElement>) => onClose?.(event, 'escapeKeyDown');
  const paperClassName = ['app-dialog-paper', variant === 'form' && !props.fullScreen ? 'app-form-dialog-paper' : null, PaperProps?.className].filter(Boolean).join(' ');
  return <MuiDialog
    {...props}
    onClose={onClose}
    PaperProps={{ ...PaperProps, className: paperClassName }}
  >
    <GlobalStyles styles={{
      '.app-dialog-paper > .MuiDialogTitle-root': { paddingRight: 56 },
      '.app-form-dialog-paper > .MuiDialogTitle-root': {
        minHeight: 56,
        padding: '16px 24px',
        paddingRight: 56,
        borderBottom: '1px solid #e4e7ed',
        color: '#303133',
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.4,
      },
      '.app-form-dialog-paper > .MuiDialogContent-root': {
        padding: '20px 24px',
        borderTop: 0,
        borderBottom: '1px solid #e4e7ed',
        backgroundColor: '#fff',
      },
      '.app-form-dialog-paper > .MuiDialogActions-root': {
        minHeight: 56,
        padding: '12px 24px',
        gap: 12,
        borderTop: 0,
        backgroundColor: '#fff',
      },
      '.app-form-dialog-paper > .MuiDialogActions-root .MuiButton-root': {
        minWidth: 64,
      },
      '@media (max-width: 600px)': {
        '.app-form-dialog-paper > .MuiDialogTitle-root': { padding: '16px', paddingRight: 56, fontSize: 18 },
        '.app-form-dialog-paper > .MuiDialogContent-root': { padding: '20px 16px' },
        '.app-form-dialog-paper > .MuiDialogActions-root': { padding: '12px 16px' },
      },
    }} />
    {!hideCloseButton && onClose && <Tooltip title={closeAriaLabel} placement="left" arrow><IconButton aria-label={closeAriaLabel} onClick={handleClose} size="small" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2, color: '#606266', '&:hover': { color: '#303133', bgcolor: '#f5f7fa' } }}><Close fontSize="small" /></IconButton></Tooltip>}
    {checking ? <>
      <DialogTitle>{checkError ? '关联检查失败' : '正在检查关联'}</DialogTitle>
      <DialogContent>
        {checkError ? <><Alert severity="error">{checkError}</Alert><Button onClick={() => setAttempt((value) => value + 1)} sx={{ mt: 1 }}>重新检查</Button></> : <LinearProgress aria-label="正在检查删除关联" />}
      </DialogContent>
    </> : children}
  </MuiDialog>;
}
