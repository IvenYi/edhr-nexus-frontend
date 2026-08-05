import {
  DialogContent,
} from '@mui/material';
import AppDialog from '@/components/AppDialog';
import type { TemplateDesignerDialogProps } from './types';
import TemplateDesignerReactShell from './TemplateDesignerReactShell';

export default function TemplateDesignerReactDialog({
  open,
  row,
  version,
  onClose,
  onSave,
  onAutoSave,
  saving,
}: TemplateDesignerDialogProps) {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      hideCloseButton
      fullScreen
      PaperProps={{
        sx: {
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {row && version ? (
          <TemplateDesignerReactShell
            row={row}
            version={version}
            onClose={onClose}
            onSave={onSave}
            onAutoSave={onAutoSave}
            saving={saving}
          />
        ) : null}
      </DialogContent>
    </AppDialog>
  );
}
