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

export interface FieldBinding {
  fieldId: string;
  displayLabel?: string;
  required?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  helpText?: string;
  widgetConfig?: Record<string, unknown>;
}

export interface CanvasNodeBindings extends Partial<Omit<FieldBinding, 'fieldId'>> {
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

export type CanvasMode = 'sheet' | 'paper';
export type CanvasPaperMode = 'table' | 'free';
export type CanvasPaperOrientation = 'portrait' | 'landscape';

export interface CanvasSelectedCell {
  row: number;
  col: number;
}

export interface CanvasSelectionRange {
  t: number;
  l: number;
  b: number;
  r: number;
}

export interface CanvasCellBorder {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  color?: string;
}

export interface CanvasSheetCell {
  value?: string;
  style?: Record<string, unknown>;
  border?: CanvasCellBorder;
}

export interface CanvasSheetMedia {
  id: string;
  src: string;
}

export interface CanvasSheetImageLayout {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CanvasSheetImage {
  id: string;
  mediaId: string;
  layout: CanvasSheetImageLayout;
}

export interface CanvasSheetConfig {
  rowCount: number;
  columnCount: number;
  defaultRowHeight: number;
  defaultColumnWidth: number;
  rowHeights: number[];
  columnWidths: number[];
  showGridLines: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showRuler: boolean;
  canvasMode: CanvasMode;
  paperMode: CanvasPaperMode;
  paperOrientation: CanvasPaperOrientation;
  paperMarginTopMm: number;
  paperMarginRightMm: number;
  paperMarginBottomMm: number;
  paperMarginLeftMm: number;
}

export interface CanvasPage {
  id: string;
  name: string;
  nodes: CanvasNode[];
  sheet: CanvasSheetConfig;
  cells: Record<string, CanvasSheetCell>;
  mergedCells: CanvasSelectionRange[];
  medias: CanvasSheetMedia[];
  images: CanvasSheetImage[];
}

export interface CanvasDesignState {
  pages: CanvasPage[];
  currentPageId: string;
}

export interface DesignerRendererProps {
  node: CanvasNode;
  selected: boolean;
  onSelect: () => void;
  renderMode?: 'normal' | 'cell';
}

export interface DesignerComponentDefinition {
  type: string;
  label: string;
  category: 'field' | 'layout' | 'container';
  propSchema: PropertySchemaItem[];
  styleSchema?: PropertySchemaItem[];
  createDefaultNode: () => CanvasNode;
  renderDesigner: ComponentType<DesignerRendererProps>;
}
