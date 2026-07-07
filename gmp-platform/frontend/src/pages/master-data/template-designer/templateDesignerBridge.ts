import type { TemplateModelingRecord, TemplateVersionRecord } from '@/api/template-modeling';

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

export interface TemplateMockFillSnapshot extends HostedDesignerSnapshot {
  createdAt: number;
}

export type TemplateDesignerHostEvent =
  | { type: 'ready' }
  | { type: 'dirty-change'; dirty: boolean }
  | { type: 'save-request'; payload: TemplateDesignerSavePayload }
  | { type: 'simulate-fill-snapshot'; snapshot: HostedDesignerSnapshot }
  | { type: 'close-request' }
  | { type: 'error'; message: string };

export type TemplateDesignerBridgeMessage =
  | { type: 'init'; context: TemplateDesignerHostContext; design: HostedDesignerSnapshot }
  | { type: 'save' }
  | { type: 'set-active-tab'; tab: TemplateDesignerTabKey }
  | { type: 'import-template' }
  | { type: 'simulate-fill-snapshot-request' }
  | { type: 'save-success' }
  | { type: 'save-error'; message: string }
  | { type: 'close' };

const DEFAULT_VUE_DESIGNER_PATH = '/online-form/#/designer';
const DEFAULT_VUE_DESIGNER_DEV_PATH = '/template-designer-runtime/src/projects/online-form/index.html#/designer';
const TEMPLATE_MOCK_FILL_STORAGE_PREFIX = 'edhr.template_mock_fill.';
const TEMPLATE_MOCK_FILL_SNAPSHOT_TTL_MS = 1000 * 60 * 60 * 2;

function getEnvValue(name: string) {
  const value = import.meta.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function buildVueDesignerUrl(row: TemplateModelingRecord, version: TemplateVersionRecord) {
  const configuredOrigin = getEnvValue('VITE_TEMPLATE_DESIGNER_URL');
  const origin = configuredOrigin || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1');
  const defaultPath = import.meta.env.DEV ? DEFAULT_VUE_DESIGNER_DEV_PATH : DEFAULT_VUE_DESIGNER_PATH;
  const path = getEnvValue('VITE_TEMPLATE_DESIGNER_PATH') || defaultPath;
  const url = new URL(path, origin);
  const routeParams = new URLSearchParams();

  routeParams.set('hosted', '1');
  routeParams.set('id', '__local__');
  routeParams.set('template_id', String(row.id));
  routeParams.set('version_id', String(version.id));
  routeParams.set('doc_name', row.name || '表单模板');
  routeParams.set('parent_outline_path', '数据模块/模板建模/表单模板');

  if (url.hash) {
    const [hashPath, hashSearch = ''] = url.hash.slice(1).split('?');
    const hashParams = new URLSearchParams(hashSearch);
    routeParams.forEach((value, key) => hashParams.set(key, value));
    url.hash = `${hashPath}?${hashParams.toString()}`;
  } else {
    routeParams.forEach((value, key) => url.searchParams.set(key, value));
  }

  if (configuredOrigin) {
    return url.toString();
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildHostedDesignerSnapshot(row: TemplateModelingRecord, version: TemplateVersionRecord): HostedDesignerSnapshot {
  return {
    templateId: row.id,
    versionId: version.id,
    templateName: row.name,
    versionLabel: version.version,
    designerPayload: {
      modelDesignJson: version.modelDesignJson || '',
      canvasDesignJson: version.canvasDesignJson || '',
      workflowDesignJson: version.workflowDesignJson || '',
    },
  };
}

function createTemplateMockFillSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getTemplateMockFillStorageKey(sessionId: string) {
  return `${TEMPLATE_MOCK_FILL_STORAGE_PREFIX}${sessionId}`;
}

function cleanupTemplateMockFillSnapshots(now = Date.now()) {
  if (typeof window === 'undefined') return;

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(TEMPLATE_MOCK_FILL_STORAGE_PREFIX)) continue;

    try {
      const value = window.localStorage.getItem(key);
      const snapshot = value ? JSON.parse(value) as Partial<TemplateMockFillSnapshot> : null;
      if (!snapshot?.createdAt || now - snapshot.createdAt > TEMPLATE_MOCK_FILL_SNAPSHOT_TTL_MS) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(error);
      window.localStorage.removeItem(key);
    }
  }
}

export function saveTemplateMockFillSnapshot(snapshot: HostedDesignerSnapshot) {
  const sessionId = createTemplateMockFillSessionId();
  if (typeof window === 'undefined') return sessionId;

  cleanupTemplateMockFillSnapshots();
  window.localStorage.setItem(
    getTemplateMockFillStorageKey(sessionId),
    JSON.stringify({ ...snapshot, createdAt: Date.now() } satisfies TemplateMockFillSnapshot),
  );
  return sessionId;
}

export function loadTemplateMockFillSnapshot(sessionId?: string | null): TemplateMockFillSnapshot | null {
  if (!sessionId || typeof window === 'undefined') return null;

  try {
    const value = window.localStorage.getItem(getTemplateMockFillStorageKey(sessionId));
    if (!value) return null;
    const snapshot = JSON.parse(value) as TemplateMockFillSnapshot;
    if (!snapshot.createdAt || Date.now() - snapshot.createdAt > TEMPLATE_MOCK_FILL_SNAPSHOT_TTL_MS) {
      window.localStorage.removeItem(getTemplateMockFillStorageKey(sessionId));
      return null;
    }
    return snapshot;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export function buildTemplateMockFillUrl(sessionId: string) {
  const params = new URLSearchParams({ sid: sessionId });
  const path = `/master-data/form-templates/mock-fill?${params.toString()}`;
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).toString();
}

export function buildHostContext(
  row: TemplateModelingRecord,
  version: TemplateVersionRecord,
  authToken: string,
): TemplateDesignerHostContext {
  return {
    templateId: row.id,
    versionId: version.id,
    templateName: row.name,
    versionLabel: version.version,
    apiBaseUrl: '/api/v1',
    authToken,
    tenantId: row.tenantId,
  };
}

export function isTemplateDesignerHostEvent(input: unknown): input is TemplateDesignerHostEvent {
  if (!input || typeof input !== 'object') return false;
  const type = (input as { type?: unknown }).type;
  return type === 'ready'
    || type === 'dirty-change'
    || type === 'save-request'
    || type === 'simulate-fill-snapshot'
    || type === 'close-request'
    || type === 'error';
}
