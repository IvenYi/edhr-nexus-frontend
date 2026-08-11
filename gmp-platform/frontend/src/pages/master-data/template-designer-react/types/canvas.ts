import type { ComponentType, MouseEvent as ReactMouseEvent } from 'react';
import type { ModelField } from './model';

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
  validationType?: 'none' | 'phone' | 'email';
  displayMode?: 'text' | 'link' | 'mask';
  autoWrap?: boolean;
  maskMode?: 'middle' | 'start' | 'end';
  maskDigits?: number;
  linkTarget?: 'blank' | 'self';
  widgetConfig?: Record<string, unknown>;
}

export interface CanvasNodeBindings extends Partial<Omit<FieldBinding, 'fieldId'>> {
  fieldId?: string;
  fieldIds?: string[];
  subTableId?: string;
  subTableFieldId?: string;
  subTableField?: ModelField;
  subTableRegion?: SubTableRegion;
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

export type SubTableRegionMode = 'record' | 'matrix';
export type SubTableRecordDirection = 'row' | 'column';

export interface SubTableRegionRange {
  pageId: string;
  range: CanvasSelectionRange;
  order: number;
}

export interface SubTableFixedRepeatConfig {
  type: 'fixed';
  count: number;
  stride: number;
}

export interface SubTableDynamicRepeatConfig {
  type: 'dynamic';
  minCount: number;
  maxCount?: number;
  addPosition: 'bottom';
  allowRemove: boolean;
  removeConfirm: true;
}

export type SubTableRepeatConfig = SubTableFixedRepeatConfig | SubTableDynamicRepeatConfig;

export interface SubTableRecordTemplateField {
  fieldId: string;
  rowOffset: number;
  colOffset: number;
  rowSpan?: number;
  colSpan?: number;
}

export interface SubTableRecordTemplate {
  direction: SubTableRecordDirection;
  anchor: {
    row: number;
    col: number;
  };
  groupRange?: CanvasSelectionRange;
  fields: SubTableRecordTemplateField[];
}

export interface SubTableMatrixDimension {
  source: 'static' | 'reference' | 'dynamic';
  labelFieldId?: string;
  items?: Array<{
    id: string;
    label: string;
    value: unknown;
  }>;
  allowAdd?: boolean;
}

export interface SubTableMatrixValueDefinition {
  fields: Array<{
    fieldId: string;
    role: 'value' | 'remark' | 'attachment';
  }>;
}

export interface SubTableMatrixDimensions {
  row: SubTableMatrixDimension;
  column: SubTableMatrixDimension;
  value: SubTableMatrixValueDefinition;
}

export interface SubTablePresentationConfig {
  showHeader: boolean;
  showIndex: boolean;
  emptyText: string;
  addEntry: 'bottom' | 'contextMenu' | 'both';
}

export interface SubTableRegion {
  id: string;
  fieldId: string;
  mode: SubTableRegionMode;
  ranges: SubTableRegionRange[];
  repeat: SubTableRepeatConfig;
  recordTemplate: SubTableRecordTemplate;
  dimensions?: SubTableMatrixDimensions;
  presentation: SubTablePresentationConfig;
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

export interface CanvasWordBlockLayout {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CanvasWordParagraphBlock {
  id: string;
  type: 'paragraph';
  text: string;
  style?: Record<string, unknown>;
  layout: CanvasWordBlockLayout;
}

export interface CanvasWordTableCell {
  id: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  text: string;
  style?: Record<string, unknown>;
  border?: CanvasCellBorder;
}

export interface CanvasWordTableBlock {
  id: string;
  type: 'table';
  layout: CanvasWordBlockLayout;
  columnWidths: number[];
  rowHeights: number[];
  cells: CanvasWordTableCell[];
}

export interface CanvasWordImageBlock {
  id: string;
  type: 'image';
  mediaId: string;
  layout: CanvasWordBlockLayout;
}

export type CanvasWordBlock = CanvasWordParagraphBlock | CanvasWordTableBlock | CanvasWordImageBlock;

export interface CanvasWordDocument {
  source: 'docx';
  contentWidth: number;
  contentHeight: number;
  blocks: CanvasWordBlock[];
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
  importedGridTop?: number;
}

export interface CanvasPage {
  id: string;
  name: string;
  nodes: CanvasNode[];
  wordDocument?: CanvasWordDocument;
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
  onCellMouseDown?: (event: ReactMouseEvent<HTMLElement>) => void;
  onCellContextMenu?: (event: ReactMouseEvent<HTMLElement>) => void;
  onOpenConfig?: () => void;
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
