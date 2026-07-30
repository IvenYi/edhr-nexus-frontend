import client from './client';
import type { PageResult } from '@/types/common';

export type TemplateModelingPageKey = 'formTemplates' | 'batchRecordTemplates';

export interface TemplateModelingRecord {
  id: string | number;
  tenantId?: string;
  code?: string | null;
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
  code?: string | null;
  offlineVersion?: string | null;
  isCurrent?: boolean;
  directoryCount?: number;
  evidenceCount?: number;
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
  offlineVersion?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  modelDesignJson?: string | null;
  canvasDesignJson?: string | null;
  workflowDesignJson?: string | null;
  status?: string;
}

export interface TemplateImportedCellBorder {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

export interface TemplateImportedCell {
  value?: string;
  style?: Record<string, unknown>;
  border?: TemplateImportedCellBorder | null;
}

export interface TemplateImportedRange {
  t: number;
  l: number;
  b: number;
  r: number;
}

export interface TemplateImportedGridPayload {
  rowHeights: number[];
  columnWidths: number[];
  cells: Record<string, TemplateImportedCell>;
  mergedCells: TemplateImportedRange[];
}

export interface TemplateImportedPagePayload {
  orientation: 'portrait' | 'landscape';
  canvasMode: 'sheet' | 'paper';
  paperMode: 'table' | 'free';
  grid: TemplateImportedGridPayload;
}

export interface DhrTemplateVersionRecord {
  id: string;
  version: string;
  code?: string | null;
  offlineVersion?: string | null;
  description?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'DISABLED' | string;
  isCurrent: boolean;
  createdAt?: string | null;
  directoryCount: number;
  evidenceCount: number;
}

export interface DhrTemplateWorkspaceRecord {
  templateId: string;
  templateCode?: string | null;
  templateName: string;
  versions: DhrTemplateVersionRecord[];
}

export interface DhrDirectoryRecord {
  id: string;
  parentId?: string | null;
  name: string;
  sortOrder: number;
}

export interface DhrEvidenceItemRecord {
  id: string;
  directoryId: string;
  formTemplateId?: string | null;
  formTemplateVersionId?: string | null;
  formCode: string;
  formName: string;
  formVersion: string;
  displayName?: string | null;
  isRequired: boolean;
  sortOrder: number;
}

export interface DhrTemplateCompositionRecord {
  version: DhrTemplateVersionRecord;
  directories: DhrDirectoryRecord[];
  items: DhrEvidenceItemRecord[];
}

export interface DhrFormTemplateOption {
  templateId: string;
  code: string;
  name: string;
  categoryName?: string | null;
  status: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  versions: DhrFormTemplateVersionOption[];
}

export interface DhrFormTemplateVersionOption {
  versionId: string;
  version: string;
  status: string;
  referenceable: boolean;
}

const templateModelingBase = '/master-data/template-modeling';

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

export const saveFormTemplateVersionDesign = (id: string | number, versionId: string | number, body: Pick<TemplateModelingPayload, 'modelDesignJson' | 'canvasDesignJson' | 'workflowDesignJson'>) =>
  client.put(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/design`, body) as Promise<{ data: { data: TemplateVersionRecord } }>;

export const importLegacyWordTemplate = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`${templateModelingBase}/form-templates/import/legacy-word`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as Promise<{ data: { data: TemplateImportedPagePayload } }>;
};

export const getBatchRecordTemplates = (params?: TemplateModelingQuery) =>
  client.get(`${templateModelingBase}/batch-record-templates`, { params }) as Promise<{ data: { data: PageResult<TemplateModelingRecord> } }>;

export const createBatchRecordTemplate = (body: TemplateModelingPayload) =>
  client.post(`${templateModelingBase}/batch-record-templates`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const updateBatchRecordTemplate = (id: string | number, body: TemplateModelingPayload) =>
  client.put(`${templateModelingBase}/batch-record-templates/${id}`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const deleteBatchRecordTemplate = (id: string | number) =>
  client.delete(`${templateModelingBase}/batch-record-templates/${id}`);

export const getDhrTemplateWorkspace = (templateId: string | number) =>
  client.get(`${templateModelingBase}/batch-record-templates/${templateId}/workspace`) as Promise<{ data: { data: DhrTemplateWorkspaceRecord } }>;

export const getDhrTemplateComposition = (templateId: string | number, versionId: string | number) =>
  client.get(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/composition`) as Promise<{ data: { data: DhrTemplateCompositionRecord } }>;

export const getDhrFormTemplateOptions = (templateId: string | number) =>
  client.get(`${templateModelingBase}/batch-record-templates/${templateId}/form-options`) as Promise<{ data: { data: DhrFormTemplateOption[] } }>;

export const createDhrTemplateVersion = (templateId: string | number, body?: { sourceVersionId?: string | number | null; version?: string | null; code?: string | null; offlineVersion?: string | null; description?: string | null; effectiveFrom?: string | null; effectiveTo?: string | null }) =>
  client.post(`${templateModelingBase}/batch-record-templates/${templateId}/versions`, body) as Promise<{ data: { data: DhrTemplateVersionRecord } }>;

export const updateDhrTemplateVersion = (templateId: string | number, versionId: string | number, body: { version: string; code?: string | null; offlineVersion?: string | null; description?: string | null; effectiveFrom?: string | null; effectiveTo?: string | null }) =>
  client.put(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}`, body) as Promise<{ data: { data: DhrTemplateVersionRecord } }>;

export const deleteDhrTemplateVersion = (templateId: string | number, versionId: string | number) =>
  client.delete(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}`);

export const createDhrDirectory = (templateId: string | number, versionId: string | number, body: { name: string; parentId?: string | number | null }) =>
  client.post(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/directories`, body) as Promise<{ data: { data: DhrDirectoryRecord } }>;

export const updateDhrDirectory = (templateId: string | number, versionId: string | number, directoryId: string | number, body: { name: string; parentId?: string | number | null }) =>
  client.put(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/directories/${directoryId}`, body) as Promise<{ data: { data: DhrDirectoryRecord } }>;

export const deleteDhrDirectory = (templateId: string | number, versionId: string | number, directoryId: string | number) =>
  client.delete(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/directories/${directoryId}`);

export const createDhrEvidenceItem = (templateId: string | number, versionId: string | number, directoryId: string | number, body: { formTemplateVersionId: string | number; displayName?: string | null }) =>
  client.post(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/directories/${directoryId}/items`, body) as Promise<{ data: { data: DhrEvidenceItemRecord } }>;

export const updateDhrEvidenceItem = (templateId: string | number, versionId: string | number, itemId: string | number, body: { isRequired?: boolean; displayName?: string | null }) =>
  client.put(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/items/${itemId}`, body) as Promise<{ data: { data: DhrEvidenceItemRecord } }>;

export const deleteDhrEvidenceItem = (templateId: string | number, versionId: string | number, itemId: string | number) =>
  client.delete(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/items/${itemId}`);

export const publishDhrTemplateVersion = (templateId: string | number, versionId: string | number) =>
  client.post(`${templateModelingBase}/batch-record-templates/${templateId}/versions/${versionId}/publish`) as Promise<{ data: { data: DhrTemplateVersionRecord } }>;
