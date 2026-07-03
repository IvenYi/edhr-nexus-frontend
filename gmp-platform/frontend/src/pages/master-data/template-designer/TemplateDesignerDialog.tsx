import { Dialog, DialogContent } from '@mui/material';
import TemplateDesignerHostFrame from './TemplateDesignerHostFrame';
import type { TemplateDesignerDialogProps } from './templateDesignerTypes';

export default function TemplateDesignerDialog({ open, row, version, onClose, onSave, saving }: TemplateDesignerDialogProps) {
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
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#f4f6fa',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flex: '1 1 auto',
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: '#f4f6fa',
        }}
      >
        {row && version ? (
          <TemplateDesignerHostFrame
            row={row}
            version={version}
            authToken={localStorage.getItem('token') || ''}
            saving={saving}
            onClose={onClose}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
