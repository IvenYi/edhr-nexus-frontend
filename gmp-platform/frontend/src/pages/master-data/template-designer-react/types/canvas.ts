import type { ComponentType } from 'react';

export type PropertyEditorType = 'text' | 'textarea' | 'number' | 'switch' | 'select';

export interface PropertyOption {
  label: string;
  value: string | number;
}

export interface PropertySchemaItem {
  key: string;
  label: string;
  editor: PropertyEditorType;
  defaultValue?: unknown;
  options?: PropertyOption[];
}

export interface CanvasNodeBindings {
  fieldId?: string;
  fieldIds?: string[];
}

export interface CanvasNode {
  id: string;
  type: string;
  parentId?: string | null;
  children?: CanvasNode[];
  props: Record<string, unknown>;
  style: Record<string, unknown>;
  bindings?: CanvasNodeBindings;
}

export interface CanvasPage {
  id: string;
  name: string;
  nodes: CanvasNode[];
}

export interface CanvasDesignState {
  pages: CanvasPage[];
  currentPageId: string;
}

export interface DesignerRendererProps {
  node: CanvasNode;
  selected: boolean;
  onSelect: () => void;
}

export interface DesignerComponentDefinition {
  type: string;
  label: string;
  category: 'field' | 'layout' | 'container';
  propSchema: PropertySchemaItem[];
  createDefaultNode: () => CanvasNode;
  renderDesigner: ComponentType<DesignerRendererProps>;
}
