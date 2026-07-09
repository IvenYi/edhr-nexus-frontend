import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';

export type TemplateDesignerMode = 'model' | 'canvas' | 'workflow';

export type TemplateDesignerPageOrientation = 'portrait' | 'landscape';

export type TemplateDesignerLayerType = 'text' | 'line' | 'table' | 'image' | 'field' | 'shape';

export interface TemplateDesignerPoint {
  x: number;
  y: number;
}

export interface TemplateDesignerRect extends TemplateDesignerPoint {
  width: number;
  height: number;
}

export interface TemplateDesignerLayer extends TemplateDesignerRect {
  id: string;
  pageId: string;
  type: TemplateDesignerLayerType;
  text?: string;
  label?: string;
  sourceCandidateId?: string;
  draggable?: boolean;
  locked?: boolean;
  selected?: boolean;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline' | 'line-through';
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
  };
}

export interface TemplateDesignerPage {
  id: string;
  pageNumber: number;
  width: number;
  height: number;
  orientation: TemplateDesignerPageOrientation;
  title?: string;
  layers: TemplateDesignerLayer[];
}

export interface TemplateDesignerFieldBinding extends TemplateDesignerRect {
  id: string;
  code: string;
  name: string;
  component: string;
  pageId: string;
  required?: boolean;
}

export interface TemplateDesignerDocumentSource {
  fileId?: string | number | null;
  fileName: string;
  fileType: string;
  mimeType?: string;
}

export interface TemplateDesignerDocument {
  schemaVersion: string;
  source: TemplateDesignerDocumentSource;
  pages: TemplateDesignerPage[];
  fields: TemplateDesignerFieldBinding[];
  workflowNodes: Array<Record<string, unknown>>;
  workflowEdges: Array<Record<string, unknown>>;
}

export interface TemplateDesignerDialogProps {
  open: boolean;
  row: TemplateModelingRecord | null;
  version: TemplateVersionRecord | null;
  onClose: () => void;
  onSave: (payload: { modelDesignJson: string; canvasDesignJson: string; workflowDesignJson: string }) => Promise<unknown>;
  saving: boolean;
}
