import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';

export interface TemplateDesignerSavePayload {
  modelDesignJson: string;
  canvasDesignJson: string;
  workflowDesignJson: string;
}

export interface TemplateDesignerDialogProps {
  open: boolean;
  row: TemplateModelingRecord | null;
  version: TemplateVersionRecord | null;
  onClose: () => void;
  onSave: (payload: TemplateDesignerSavePayload) => Promise<unknown>;
  saving: boolean;
}
