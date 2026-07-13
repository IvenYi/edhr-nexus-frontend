import type { CanvasDesignState } from './canvas';
import type { ModelDesignState } from './model';
import type { WorkflowDesignState } from './workflow';

export type TemplateDesignerTabKey = 'model' | 'canvas' | 'workflow';
export type TemplateDesignerCanvasRailKey = 'thumbnails' | 'fields' | 'grid' | 'layout';

export interface TemplateDesignerMeta {
  schema: 'edhr-template-designer-react';
  version: 1;
  templateId: string | number;
  versionId: string | number;
  templateName: string;
  versionLabel: string;
}

export interface TemplateDesignerDocument {
  meta: TemplateDesignerMeta;
  model: ModelDesignState;
  canvas: CanvasDesignState;
  workflow: WorkflowDesignState;
}

export interface ReactTemplateDesignerPersisted<T> {
  schema: 'edhr-template-designer-react';
  version: 1;
  payload: T;
}
