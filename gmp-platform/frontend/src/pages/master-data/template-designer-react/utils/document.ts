import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';
import type {
  CanvasPage,
  CanvasWordBlock,
  CanvasWordDocument,
  CanvasWordTableBlock,
  FieldType,
  ModelField,
  ModelFieldOption,
  CanvasDesignState,
  ModelDesignState,
  ReactTemplateDesignerPersisted,
  TemplateDesignerSavePayload,
  TemplateDesignerDocument,
  TemplateDesignerMeta,
  WorkflowDesignState,
} from '../types';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';
import { createLegacySubTableRegion, readNodeCellRange } from './subTableRegion';

function safeParseJson(input?: string | null, forEditing = false) {
  if (!input?.trim()) return undefined;
  try {
    return JSON.parse(input) as unknown;
  } catch (error) {
    if (forEditing) throw new Error('表单设计内容无法读取');
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

function normalizeFieldReportColumnWidths(input: unknown): Record<string, Record<string, number>> {
  if (!input || typeof input !== 'object') return {};

  return Object.entries(input as Record<string, unknown>).reduce<Record<string, Record<string, number>>>((scopes, [scopeKey, scopeValue]) => {
    if (!scopeKey || !scopeValue || typeof scopeValue !== 'object') return scopes;

    const widths = Object.entries(scopeValue as Record<string, unknown>).reduce<Record<string, number>>((columns, [columnKey, columnWidth]) => {
      const width = Number(columnWidth);
      if (columnKey && Number.isFinite(width) && width > 0) {
        columns[columnKey] = Math.round(width);
      }
      return columns;
    }, {});

    if (Object.keys(widths).length) {
      scopes[scopeKey] = widths;
    }
    return scopes;
  }, {});
}

const LEGACY_FIELD_TYPE_MAP: Record<string, FieldType> = {
  input: 'text',
  link: 'text',
  textarea: 'text',
  inputnumber: 'number',
  inputdouble: 'number',
  datepicker: 'datetime',
  datetimepicker: 'datetime',
  timepicker: 'datetime',
  radio: 'singleSelect',
  select: 'singleSelect',
  switch: 'singleSelect',
  checkbox: 'multiSelect',
  userpicker: 'reference',
  department: 'reference',
  'sub-table': 'subTable',
  readonlycmp: 'text',
};

function normalizeFieldType(type: unknown): FieldType {
  if (typeof type !== 'string') return 'text';
  if (getFieldTypeDefinition(type).type === type) {
    return type as FieldType;
  }
  return LEGACY_FIELD_TYPE_MAP[type] ?? 'text';
}

function parseOptionsText(optionsText: unknown): ModelFieldOption[] {
  if (typeof optionsText !== 'string' || !optionsText.trim()) return [];
  return optionsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [rawLabel, rawValue] = line.split(':');
      const label = rawLabel?.trim() || `选项${index + 1}`;
      const value = rawValue?.trim() || label;
      return {
        id: `option-${index + 1}`,
        label,
        value,
        sortOrder: index + 1,
        status: 'enabled',
      };
    });
}

function normalizeModelField(input: unknown, index: number): ModelField | null {
  if (!input || typeof input !== 'object') return null;

  const source = input as Record<string, unknown>;
  const type = normalizeFieldType(source.type);
  const definition = getFieldTypeDefinition(type);
  const name = typeof source.name === 'string' && source.name.trim()
    ? source.name.trim()
    : definition.label;
  const fallbackField = definition.defaultField(name, index + 1);
  const sourceConfig = typeof source.config === 'object' && source.config ? source.config : {};
  const sourceTypeConfig = typeof source.typeConfig === 'object' && source.typeConfig ? source.typeConfig : {};
  const options = Array.isArray(source.options) ? source.options : parseOptionsText(source.optionsText);

  return {
    ...fallbackField,
    id: typeof source.id === 'string' && source.id ? source.id : `field-${index + 1}`,
    code: typeof source.code === 'string' && source.code ? source.code : `field_${index + 1}`,
    name,
    groupId: typeof source.groupId === 'string' ? source.groupId : 'default-group',
    sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : index + 1,
    status: source.status === 'disabled' ? 'disabled' : 'enabled',
    description: typeof source.description === 'string' ? source.description : '',
    typeConfig: {
      ...fallbackField.typeConfig,
      ...sourceConfig,
      ...sourceTypeConfig,
      ...(options.length ? { options } : {}),
    },
  };
}

function normalizeModelState(model: ModelDesignState | undefined): ModelDesignState | undefined {
  if (!model) return undefined;
  const fields = Array.isArray(model.fields)
    ? model.fields.map((field, index) => normalizeModelField(field, index)).filter((field): field is ModelField => Boolean(field))
    : [];

  return {
    groups: Array.isArray(model.groups) && model.groups.length
      ? model.groups
      : [{ id: 'default-group', name: '默认分组' }],
    fields,
    fieldReportColumnWidths: normalizeFieldReportColumnWidths(model.fieldReportColumnWidths),
    projection: model.projection,
  };
}

export function createEmptyTemplateDesignerDocument(
  meta: TemplateDesignerMeta,
  overrides?: Partial<Pick<TemplateDesignerDocument, 'model' | 'canvas' | 'workflow'>>,
): TemplateDesignerDocument {
  return {
    meta,
    model: normalizeModelState(overrides?.model) ?? {
      groups: [{ id: 'default-group', name: '默认分组' }],
      fields: [],
      fieldReportColumnWidths: {},
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

function normalizeCanvasNodes(nodes: CanvasPage['nodes'], pageId: string): CanvasPage['nodes'] {
  return nodes.map((node) => {
    const cellRange = readNodeCellRange(node);
    const nextNode = node.type === 'sub-table'
      && node.bindings?.fieldId
      && !node.bindings.subTableRegion
      && cellRange
      ? {
          ...node,
          bindings: {
            ...node.bindings,
            subTableRegion: createLegacySubTableRegion({
              id: `sub-table-region-${node.id}`,
              fieldId: node.bindings.fieldId,
              pageId,
              range: cellRange,
            }),
          },
        }
      : node;

    if (!nextNode.children?.length) return nextNode;
    return {
      ...nextNode,
      children: normalizeCanvasNodes(nextNode.children, pageId),
    };
  });
}

function normalizeWordTableBlock(block: CanvasWordTableBlock): CanvasWordTableBlock {
  return {
    ...block,
    borderEncodingVersion: block.borderEncodingVersion === 2 ? 2 : undefined,
  };
}

function normalizeWordDocument(input: unknown): CanvasWordDocument | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const source = input as Partial<CanvasWordDocument>;
  if (source.source !== 'docx') return undefined;

  const contentWidth = Number(source.contentWidth);
  const contentHeight = Number(source.contentHeight);
  const blocks = Array.isArray(source.blocks)
    ? source.blocks
      .filter((block): block is CanvasWordBlock => Boolean(block && typeof block === 'object' && 'type' in block))
      .map((block) => block.type === 'table' ? normalizeWordTableBlock(block) : block)
    : [];

  if (!blocks.length) return undefined;

  return {
    source: 'docx',
    borderEncodingVersion: source.borderEncodingVersion === 2 ? 2 : undefined,
    contentWidth: Number.isFinite(contentWidth) && contentWidth > 0 ? contentWidth : 0,
    contentHeight: Number.isFinite(contentHeight) && contentHeight > 0 ? contentHeight : 0,
    blocks,
  };
}

function normalizeCanvasPage(page: Partial<CanvasPage>, index: number): CanvasPage {
  const rowCount = page.sheet?.rowCount ?? 30;
  const columnCount = page.sheet?.columnCount ?? 9;
  const defaultRowHeight = page.sheet?.defaultRowHeight ?? 36;
  const defaultColumnWidth = page.sheet?.defaultColumnWidth ?? 98;
  const pageId = page.id || `page-${index + 1}`;

  return {
    id: pageId,
    name: page.name || `页面 ${index + 1}`,
    nodes: normalizeCanvasNodes(page.nodes ?? [], pageId),
    wordDocument: normalizeWordDocument(page.wordDocument),
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
      importedGridTop: Number(page.sheet?.importedGridTop ?? 0) || 0,
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

function parsePersistedSlice<T>(input: unknown, part: 'model' | 'canvas' | 'workflow', forEditing = false): T | undefined {
  if (forEditing && input !== undefined) {
    const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    if (!isReactTemplateDesignerPayload<unknown>(input)) {
      const emptyKeys = part === 'model' ? ['fields', 'groups'] : part === 'canvas' ? ['layers', 'pages'] : ['nodes', 'edges'];
      if (object(input) && Object.keys(input).every(key => emptyKeys.includes(key) && Array.isArray(input[key]) && input[key].length === 0)) return undefined;
      throw new Error('表单设计内容无法读取');
    }
    if (input.version !== 1 || !object(input.payload)) throw new Error('表单设计内容无法读取');
    const arrayKeys = part === 'model' ? ['fields', 'groups'] : part === 'canvas' ? ['pages'] : ['nodes', 'edges'];
    for (const key of arrayKeys) {
      const items = input.payload[key];
      if (items !== undefined && (!Array.isArray(items) || items.some(item => !object(item)))) throw new Error('表单设计内容无法读取');
    }
    if (part === 'model' && Array.isArray(input.payload.fields)) {
      for (const field of input.payload.fields) {
        const type: unknown = field.type;
        if (type == null || (typeof type === 'string' && !type.trim())) continue;
        if (typeof type !== 'string' || (getFieldTypeDefinition(type).type !== type && !Object.prototype.hasOwnProperty.call(LEGACY_FIELD_TYPE_MAP, type))) {
          throw new Error('表单设计内容无法读取');
        }
      }
    }
  }
  if (!isReactTemplateDesignerPayload<T>(input)) return undefined;
  return input.payload;
}

export function parseReactTemplateDesignerDocument(
  row: TemplateModelingRecord,
  version: TemplateVersionRecord,
  options?: { forEditing?: boolean },
): TemplateDesignerDocument {
  const forEditing = options?.forEditing ?? false;
  const persistedModel = parsePersistedSlice<ModelDesignState>(safeParseJson(version.modelDesignJson, forEditing), 'model', forEditing);
  const persistedCanvas = normalizeCanvasState(parsePersistedSlice<CanvasDesignState>(safeParseJson(version.canvasDesignJson, forEditing), 'canvas', forEditing));
  const persistedWorkflow = parsePersistedSlice<WorkflowDesignState>(safeParseJson(version.workflowDesignJson, forEditing), 'workflow', forEditing);

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
