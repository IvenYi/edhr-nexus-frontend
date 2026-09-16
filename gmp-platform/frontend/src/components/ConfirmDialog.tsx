import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  type DialogProps,
} from '@mui/material';
import AppDialog from '@/components/AppDialog';
import { WarningAmberOutlined } from '@mui/icons-material';
import type { DeletionTarget } from '@/api/deletionCheck';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
  initialFocus?: 'confirm' | 'cancel';
  container?: DialogProps['container'];
  deletionTarget?: DeletionTarget | null;
}

/**
 * Reusable confirmation dialog — replaces browser-native window.confirm().
 * Supports loading state for async operations and destructive action styling.
 */
export default function ConfirmDialog({
  open,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
  initialFocus = 'confirm',
  container,
  deletionTarget,
}: ConfirmDialogProps) {
  return (
    <AppDialog open={open} onClose={loading ? undefined : onCancel} container={container} maxWidth="xs" fullWidth deletionTarget={deletionTarget} onDeletionBlocked={onCancel}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        {destructive && <WarningAmberOutlined color="warning" />}
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: 14 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading} autoFocus={initialFocus === 'cancel'}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={loading}
          autoFocus={initialFocus === 'confirm'}
        >
          {loading ? '处理中...' : confirmText}
        </Button>
      </DialogActions>
    </AppDialog>
  );
}
