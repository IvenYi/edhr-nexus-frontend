export interface TemplateDesignerSavePayload {
  modelDesignJson: string;
  canvasDesignJson: string;
  workflowDesignJson: string;
}

export type TemplateDesignerTabKey = 'model' | 'form' | 'process';

export interface TemplateDesignerHostContext {
  templateId: string | number;
  versionId: string | number;
  templateName: string;
  versionLabel: string;
  apiBaseUrl: string;
  authToken: string;
  tenantId?: string;
  readOnly?: boolean;
}

export interface HostedDesignerSnapshot {
  templateId: string | number;
  versionId: string | number;
  templateName: string;
  versionLabel: string;
  designerPayload: TemplateDesignerSavePayload;
}

export type TemplateDesignerBridgeMessage =
  | { type: 'init'; context: TemplateDesignerHostContext; design: HostedDesignerSnapshot }
  | { type: 'save' }
  | { type: 'set-active-tab'; tab: TemplateDesignerTabKey }
  | { type: 'import-template' }
  | { type: 'simulate-fill' }
  | { type: 'save-success' }
  | { type: 'save-error'; message: string }
  | { type: 'close' };

export type TemplateDesignerHostEvent =
  | { type: 'ready' }
  | { type: 'dirty-change'; dirty: boolean }
  | { type: 'save-request'; payload: TemplateDesignerSavePayload }
  | { type: 'close-request' }
  | { type: 'error'; message: string };

export function isTemplateDesignerBridgeMessage(input: unknown): input is TemplateDesignerBridgeMessage {
  if (!input || typeof input !== 'object') return false;
  const type = (input as { type?: unknown }).type;
  return type === 'init'
    || type === 'save'
    || type === 'set-active-tab'
    || type === 'import-template'
    || type === 'simulate-fill'
    || type === 'save-success'
    || type === 'save-error'
    || type === 'close';
}
