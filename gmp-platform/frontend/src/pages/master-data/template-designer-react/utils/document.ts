import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';
import type { TemplateDesignerSavePayload } from '@/pages/master-data/template-designer/templateDesignerBridge';
import type {
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
      pages: [{ id: 'page-1', name: '页面 1', nodes: [] }],
      currentPageId: 'page-1',
    },
    workflow: overrides?.workflow ?? {
      nodes: [],
      edges: [],
      config: {},
    },
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
  const persistedCanvas = parsePersistedSlice<CanvasDesignState>(safeParseJson(version.canvasDesignJson));
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
