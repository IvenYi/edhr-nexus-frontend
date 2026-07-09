import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';
import type { TemplateDesignerSavePayload } from '@/pages/master-data/template-designer/templateDesignerBridge';
import type {
  CanvasPage,
  CanvasDesignState,
  ModelDesignState,
  ReactTemplateDesignerPersisted,
  TemplateDesignerDocument,
  TemplateDesignerMeta,
  WorkflowDesignState,
} from '../types';

function safeParseJson(input?: string | null) {
  if (!input?.trim()) return null;
  try {
    return JSON.parse(input) as unknown;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export function isReactTemplateDesignerPayload<T>(input: unknown): input is ReactTemplateDesignerPersisted<T> {
  if (!input || typeof input !== 'object') return false;
  const schema = (input as { schema?: unknown }).schema;
  return schema === 'edhr-template-designer-react';
}

function buildMeta(row: TemplateModelingRecord, version: TemplateVersionRecord): TemplateDesignerMeta {
  return {
    schema: 'edhr-template-designer-react',
    version: 1,
    templateId: row.id,
    versionId: version.id,
    templateName: row.name || '未命名表单',
    versionLabel: version.version || '-',
  };
}

function normalizeSizedList(count: number, values: unknown, fallback: number) {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length: count }, (_, index) => {
    const value = source[index];
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  });
}

export function createEmptyTemplateDesignerDocument(
  meta: TemplateDesignerMeta,
  overrides?: Partial<Pick<TemplateDesignerDocument, 'model' | 'canvas' | 'workflow'>>,
): TemplateDesignerDocument {
  return {
    meta,
    model: overrides?.model ?? {
      groups: [{ id: 'default-group', name: '默认分组' }],
      fields: [],
    },
    canvas: overrides?.canvas ?? {
      pages: [{
        id: 'page-1',
        name: '页面 1',
        nodes: [],
        sheet: {
          rowCount: 30,
          columnCount: 9,
          defaultRowHeight: 36,
          defaultColumnWidth: 98,
          rowHeights: Array.from({ length: 30 }, () => 36),
          columnWidths: Array.from({ length: 9 }, () => 98),
          showGridLines: true,
          showHeader: false,
          showFooter: false,
          showRuler: true,
          canvasMode: 'sheet',
          paperMode: 'table',
          paperOrientation: 'portrait',
          paperMarginTopMm: 5,
          paperMarginRightMm: 6,
          paperMarginBottomMm: 6,
          paperMarginLeftMm: 6,
        },
        cells: {},
        mergedCells: [],
        medias: [],
        images: [],
      }],
      currentPageId: 'page-1',
    },
    workflow: overrides?.workflow ?? {
      nodes: [],
      edges: [],
      config: {},
    },
  };
}

function normalizeCanvasPage(page: Partial<CanvasPage>, index: number): CanvasPage {
  const rowCount = page.sheet?.rowCount ?? 30;
  const columnCount = page.sheet?.columnCount ?? 9;
  const defaultRowHeight = page.sheet?.defaultRowHeight ?? 36;
  const defaultColumnWidth = page.sheet?.defaultColumnWidth ?? 98;

  return {
    id: page.id || `page-${index + 1}`,
    name: page.name || `页面 ${index + 1}`,
    nodes: page.nodes ?? [],
    sheet: {
      rowCount,
      columnCount,
      defaultRowHeight,
      defaultColumnWidth,
      rowHeights: normalizeSizedList(rowCount, page.sheet?.rowHeights, defaultRowHeight),
      columnWidths: normalizeSizedList(columnCount, page.sheet?.columnWidths, defaultColumnWidth),
      showGridLines: page.sheet?.showGridLines ?? true,
      showHeader: page.sheet?.showHeader ?? false,
      showFooter: page.sheet?.showFooter ?? false,
      showRuler: page.sheet?.showRuler ?? true,
      canvasMode: page.sheet?.canvasMode ?? 'sheet',
      paperMode: page.sheet?.paperMode ?? 'table',
      paperOrientation: page.sheet?.paperOrientation ?? 'portrait',
      paperMarginTopMm: page.sheet?.paperMarginTopMm ?? 5,
      paperMarginRightMm: page.sheet?.paperMarginRightMm ?? 6,
      paperMarginBottomMm: page.sheet?.paperMarginBottomMm ?? 6,
      paperMarginLeftMm: page.sheet?.paperMarginLeftMm ?? 6,
    },
    cells: page.cells ?? {},
    mergedCells: Array.isArray(page.mergedCells) ? page.mergedCells : [],
    medias: Array.isArray(page.medias) ? page.medias : [],
    images: Array.isArray(page.images) ? page.images : [],
  };
}

function normalizeCanvasState(canvas: CanvasDesignState | undefined): CanvasDesignState | undefined {
  if (!canvas) return undefined;
  const pages = (canvas.pages ?? []).map((page, index) => normalizeCanvasPage(page, index));
  if (!pages.length) {
    return createEmptyTemplateDesignerDocument({
      schema: 'edhr-template-designer-react',
      version: 1,
      templateId: 'unknown',
      versionId: 'unknown',
      templateName: '未命名表单',
      versionLabel: '-',
    }).canvas;
  }
  return {
    pages,
    currentPageId: canvas.currentPageId || pages[0].id,
  };
}

function parsePersistedSlice<T>(input: unknown): T | undefined {
  if (!isReactTemplateDesignerPayload<T>(input)) return undefined;
  return input.payload;
}

export function parseReactTemplateDesignerDocument(
  row: TemplateModelingRecord,
  version: TemplateVersionRecord,
): TemplateDesignerDocument {
  const persistedModel = parsePersistedSlice<ModelDesignState>(safeParseJson(version.modelDesignJson));
  const persistedCanvas = normalizeCanvasState(parsePersistedSlice<CanvasDesignState>(safeParseJson(version.canvasDesignJson)));
  const persistedWorkflow = parsePersistedSlice<WorkflowDesignState>(safeParseJson(version.workflowDesignJson));

  return createEmptyTemplateDesignerDocument(buildMeta(row, version), {
    model: persistedModel,
    canvas: persistedCanvas,
    workflow: persistedWorkflow,
  });
}

export function serializeTemplateDesignerDocument(document: TemplateDesignerDocument): TemplateDesignerSavePayload {
  const makePayload = <T,>(payload: T) => JSON.stringify({
    schema: 'edhr-template-designer-react',
    version: 1,
    payload,
  } satisfies ReactTemplateDesignerPersisted<T>);

  return {
    modelDesignJson: makePayload(document.model),
    canvasDesignJson: makePayload(document.canvas),
    workflowDesignJson: makePayload(document.workflow),
  };
}
