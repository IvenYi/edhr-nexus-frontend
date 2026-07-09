import { Dialog, DialogContent } from '@mui/material';
import type { TemplateDesignerDialogProps } from './types';
import TemplateDesignerReactShell from './TemplateDesignerReactShell';

export default function TemplateDesignerReactDialog({
  open,
  row,
  version,
  onClose,
  onSave,
  saving,
}: TemplateDesignerDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            saving={saving}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
