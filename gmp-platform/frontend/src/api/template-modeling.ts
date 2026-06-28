import client from './client';
import type { PageResult } from '@/types/common';

export type TemplateModelingPageKey = 'formTemplates' | 'batchRecordTemplates';

export interface TemplateModelingRecord {
  id: string | number;
  tenantId?: string;
  code: string;
  name: string;
  type?: string;
  categoryName?: string | null;
  description?: string | null;
  currentVersionId?: string | number | null;
  currentVersion?: TemplateVersionRecord | null;
  versions?: TemplateVersionRecord[];
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface TemplateVersionRecord {
  id: string | number;
  templateId?: string | number | null;
  version: string;
  description?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  sourceFileName?: string | null;
  sourceFileId?: string | number | null;
  sourceFileType?: string | null;
  importStatus?: string | null;
  modelDesignJson?: string | null;
  canvasDesignJson?: string | null;
  workflowDesignJson?: string | null;
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type TemplateCandidateAction = 'component' | 'staticText' | 'ignore';

export interface TemplateAnalysisPage {
  id: string;
  pageNumber: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | string;
  rotation?: number;
  dpi?: number;
  scanDetected?: boolean;
  background?: TemplateCanvasBackground | null;
  layerSummary?: {
    textCount: number;
    lineCount: number;
    imageCount: number;
  };
}

export interface TemplateAnalysisCandidate {
  id: string;
  status: 'pending' | 'confirmed' | 'ignored' | string;
  suggestedAction: TemplateCandidateAction | string;
  suggestedComponent?: string;
  fieldCode: string;
  fieldName: string;
  required?: boolean;
  pageId: string;
  labelBlockId?: string;
  valueAnchor?: { x: number; y: number; width: number; height: number };
  sourceText?: string;
  keyText?: string;
  valueText?: string;
  semanticRole?: 'keyValue' | 'staticText' | string;
  pairing?: Record<string, unknown>;
  reason?: string;
  confidence?: number;
}

export interface TemplateAnalysisBlock {
  id: string;
  pageId: string;
  kind: string;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  sourceType?: string;
  sourceRef?: Record<string, unknown>;
  confidence?: number;
}

export interface TemplateAnalysisDraft {
  schemaVersion?: string;
  analysisId: string;
  source?: TemplateCanvasSource;
  pages: TemplateAnalysisPage[];
  blocks?: TemplateAnalysisBlock[];
  candidates: TemplateAnalysisCandidate[];
}

export interface TemplateCandidateDecisionItem {
  candidateId: string;
  action: TemplateCandidateAction;
  fieldCode?: string;
  fieldName?: string;
  component?: string;
  required?: boolean;
}

export interface TemplateFieldCandidate {
  id?: string;
  code: string;
  name: string;
  type: string;
  required: boolean;
  status?: string;
  suggestedAction?: TemplateCandidateAction | string;
  suggestedComponent?: string;
  pageId?: string;
  valueAnchor?: { x: number; y: number; width: number; height: number };
  sourceText?: string;
  keyText?: string;
  valueText?: string;
  semanticRole?: 'keyValue' | 'staticText' | string;
  pairing?: Record<string, unknown>;
  reason?: string;
  confidence?: number;
}

export interface TemplateCanvasSource {
  fileId?: string | number | null;
  fileName?: string | null;
  fileType?: string | null;
  mimeType?: string | null;
  previewUrl?: string | null;
}

export interface TemplateCanvasBackground {
  type?: string;
  fileId?: string | number | null;
  url?: string | null;
  mimeType?: string | null;
}

export interface TemplateCanvasLayer {
  id: string;
  type: 'text' | 'table' | 'cell' | 'line' | 'shape' | 'image' | string;
  shapeType?: string;
  fileId?: string | number | null;
  url?: string | null;
  mimeType?: string | null;
  objectFit?: 'fill' | 'contain' | 'cover' | string;
  opacity?: number;
  rotation?: number;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | string;
  verticalAlign?: 'top' | 'middle' | 'bottom' | string;
  backgroundColor?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
  rows?: number;
  columns?: number;
  colSpan?: number;
  rowSpan?: number;
  showGrid?: boolean;
  editable?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  zIndex?: number;
  sourceCandidateId?: string;
  sourceType?: string;
  sourceRef?: Record<string, unknown>;
  confidence?: number;
}

export interface TemplateCanvasPage {
  id: string;
  pageNumber: number;
  width: number;
  height: number;
  orientation?: 'portrait' | 'landscape' | string;
  deskewApplied?: boolean;
  background?: TemplateCanvasBackground | null;
  layerSummary?: {
    textCount: number;
    lineCount: number;
    imageCount: number;
  };
  layers?: TemplateCanvasLayer[];
}

export interface TemplateInteractiveField {
  id: string;
  code: string;
  name?: string;
  type?: string;
  required?: boolean;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | string;
  component?: string;
  fillable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  anchor?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  dataBinding?: Record<string, unknown>;
  binding?: { fillable?: boolean; component?: string };
  sourceText?: string;
  keyText?: string;
  valueText?: string;
  semanticRole?: 'keyValue' | 'staticText' | string;
  pairing?: Record<string, unknown>;
  sourceCandidateId?: string;
}

export interface TemplateModelDesign {
  schemaVersion?: string;
  source?: TemplateCanvasSource;
  analysisDraft?: { analysisId?: string | number; status?: string } | null;
  analysis?: Record<string, unknown>;
  fields: TemplateInteractiveField[];
}

export interface TemplateCanvasDesign {
  schemaVersion?: string;
  strategy?: string;
  coordinateSystem?: Record<string, unknown>;
  editorCapabilities?: Record<string, unknown>;
  orientation?: 'portrait' | 'landscape' | string;
  source?: TemplateCanvasSource;
  pages: TemplateCanvasPage[];
  interactiveFields: TemplateInteractiveField[];
  fieldBindings?: Array<Record<string, unknown>>;
  fillRuntime?: Record<string, unknown>;
}

export interface TemplateImportResponse {
  version: TemplateVersionRecord;
  fieldCandidates: TemplateFieldCandidate[];
  modelDesign?: TemplateModelDesign | null;
  canvasDesign?: TemplateCanvasDesign | null;
  analysisDraft?: TemplateAnalysisDraft | null;
}

export interface OnlyOfficeEditorConfig {
  document: {
    fileType: string;
    key: string;
    title: string;
    url: string;
    permissions: {
      edit: boolean;
      download: boolean;
      print: boolean;
    };
  };
  documentType: 'word' | 'cell' | 'pdf' | string;
  editorConfig: {
    callbackUrl: string;
    mode?: 'edit' | 'view';
  };
  documentServerUrl: string;
  token?: string;
}

export interface TemplateCategoryRecord {
  id: string | number;
  name: string;
  count: number;
  sortOrder?: number | null;
  system?: boolean;
}

export interface TemplateModelingQuery {
  page?: number;
  size?: number;
  keyword?: string;
  name?: string;
  code?: string;
  categoryName?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TemplateModelingPayload {
  code?: string;
  name?: string;
  categoryName?: string | null;
  description?: string | null;
  versionDescription?: string | null;
  version?: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  sourceFileName?: string | null;
  sourceFileType?: string | null;
  modelDesignJson?: string | null;
  canvasDesignJson?: string | null;
  workflowDesignJson?: string | null;
  status?: string;
}

const templateModelingBase = '/master-data/template-modeling';
const TEMPLATE_SOURCE_IMPORT_TIMEOUT_MILLIS = 5 * 60 * 1000;

const templatePathByKey: Record<TemplateModelingPageKey, string> = {
  formTemplates: 'form-templates',
  batchRecordTemplates: 'batch-record-templates',
};

const pathFor = (pageKey: TemplateModelingPageKey) => templatePathByKey[pageKey];

export const getTemplateModelingCategories = (pageKey: TemplateModelingPageKey) =>
  client.get(`${templateModelingBase}/${pathFor(pageKey)}/categories`) as Promise<{ data: { data: TemplateCategoryRecord[] } }>;

export const createTemplateModelingCategory = (pageKey: TemplateModelingPageKey, body: { name: string }) =>
  client.post(`${templateModelingBase}/${pathFor(pageKey)}/categories`, body) as Promise<{ data: { data: TemplateCategoryRecord } }>;

export const updateTemplateModelingCategory = (pageKey: TemplateModelingPageKey, id: string | number, body: { name: string }) =>
  client.put(`${templateModelingBase}/${pathFor(pageKey)}/categories/${id}`, body) as Promise<{ data: { data: TemplateCategoryRecord } }>;

export const deleteTemplateModelingCategory = (pageKey: TemplateModelingPageKey, id: string | number) =>
  client.delete(`${templateModelingBase}/${pathFor(pageKey)}/categories/${id}`);

export const reorderTemplateModelingCategories = (pageKey: TemplateModelingPageKey, ids: Array<string | number>) =>
  client.put(`${templateModelingBase}/${pathFor(pageKey)}/categories/order`, { ids }) as Promise<{ data: { data: TemplateCategoryRecord[] } }>;

export const getFormTemplates = (params?: TemplateModelingQuery) =>
  client.get(`${templateModelingBase}/form-templates`, { params }) as Promise<{ data: { data: PageResult<TemplateModelingRecord> } }>;

export const createFormTemplate = (body: TemplateModelingPayload) =>
  client.post(`${templateModelingBase}/form-templates`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const updateFormTemplate = (id: string | number, body: TemplateModelingPayload) =>
  client.put(`${templateModelingBase}/form-templates/${id}`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const deleteFormTemplate = (id: string | number) =>
  client.delete(`${templateModelingBase}/form-templates/${id}`);

export const createFormTemplateVersion = (id: string | number, body: TemplateModelingPayload) =>
  client.post(`${templateModelingBase}/form-templates/${id}/versions`, body) as Promise<{ data: { data: TemplateVersionRecord } }>;

export const getFormTemplateVersion = (id: string | number, versionId: string | number) =>
  client.get(`${templateModelingBase}/form-templates/${id}/versions/${versionId}`) as Promise<{ data: { data: TemplateVersionRecord } }>;

export const deleteFormTemplateVersion = (id: string | number, versionId: string | number) =>
  client.delete(`${templateModelingBase}/form-templates/${id}/versions/${versionId}`);

export const saveFormTemplateDesign = (id: string | number, versionId: string | number, body: TemplateModelingPayload) =>
  client.put(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/design`, body) as Promise<{ data: { data: TemplateVersionRecord } }>;

export const importFormTemplateSourceFile = (id: string | number, versionId: string | number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/import`, formData, {
    headers: { 'Content-Type': undefined },
    timeout: TEMPLATE_SOURCE_IMPORT_TIMEOUT_MILLIS,
  }) as Promise<{ data: { data: TemplateImportResponse } }>;
};

export const reparseFormTemplateSourceFile = (id: string | number, versionId: string | number) =>
  client.post(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/source/reparse`, undefined, {
    timeout: TEMPLATE_SOURCE_IMPORT_TIMEOUT_MILLIS,
  }) as Promise<{ data: { data: TemplateImportResponse } }>;

export const getFormTemplateAnalysisDraft = (id: string | number, versionId: string | number, analysisId: string | number) =>
  client.get(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/analysis/${analysisId}`) as Promise<{ data: { data: TemplateAnalysisDraft } }>;

export const confirmFormTemplateAnalysisCandidates = (
  id: string | number,
  versionId: string | number,
  analysisId: string | number,
  decisions: TemplateCandidateDecisionItem[],
) =>
  client.put(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/analysis/${analysisId}/decisions`, {
    analysisId: String(analysisId),
    decisions,
  }) as Promise<{ data: { data: TemplateVersionRecord } }>;

export const getFormTemplateOnlyOfficeConfig = (id: string | number, versionId: string | number) =>
  client.get(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/onlyoffice/config`) as Promise<{ data: { data: OnlyOfficeEditorConfig } }>;

export const getBatchRecordTemplates = (params?: TemplateModelingQuery) =>
  client.get(`${templateModelingBase}/batch-record-templates`, { params }) as Promise<{ data: { data: PageResult<TemplateModelingRecord> } }>;

export const createBatchRecordTemplate = (body: TemplateModelingPayload) =>
  client.post(`${templateModelingBase}/batch-record-templates`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const updateBatchRecordTemplate = (id: string | number, body: TemplateModelingPayload) =>
  client.put(`${templateModelingBase}/batch-record-templates/${id}`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const deleteBatchRecordTemplate = (id: string | number) =>
  client.delete(`${templateModelingBase}/batch-record-templates/${id}`);
