import type { ReactNode } from 'react';
import AppDialog, { type AppDialogProps } from './AppDialog';

export interface FormDialogProps extends AppDialogProps {
  children: ReactNode;
}

/** Shared shell for ordinary create/edit form dialogs. Keep workspaces and previews on AppDialog. */
export default function FormDialog({ children, ...props }: FormDialogProps) {
  return <AppDialog {...props} variant="form">{children}</AppDialog>;
}
