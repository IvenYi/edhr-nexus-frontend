import type { MouseEvent, ReactNode } from 'react';
import { Dialog as MuiDialog, GlobalStyles, IconButton, Tooltip, type DialogProps } from '@mui/material';
import { Close } from '@mui/icons-material';

interface AppDialogProps extends DialogProps {
  children: ReactNode;
  hideCloseButton?: boolean;
  closeAriaLabel?: string;
}

/** Standard application dialog with a consistent, non-destructive close affordance. */
export default function AppDialog({ children, onClose, hideCloseButton = false, closeAriaLabel = '关闭', PaperProps, ...props }: AppDialogProps) {
  const handleClose = (event: MouseEvent<HTMLButtonElement>) => onClose?.(event, 'escapeKeyDown');
  const paperClassName = ['app-dialog-paper', PaperProps?.className].filter(Boolean).join(' ');
  return <MuiDialog
    {...props}
    onClose={onClose}
    PaperProps={{ ...PaperProps, className: paperClassName }}
  >
    <GlobalStyles styles={{ '.app-dialog-paper > .MuiDialogTitle-root': { paddingRight: 56 } }} />
    {!hideCloseButton && onClose && <Tooltip title={closeAriaLabel} placement="left" arrow><IconButton aria-label={closeAriaLabel} onClick={handleClose} size="small" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2, color: '#606266', '&:hover': { color: '#303133', bgcolor: '#f5f7fa' } }}><Close fontSize="small" /></IconButton></Tooltip>}
    {children}
  </MuiDialog>;
}
