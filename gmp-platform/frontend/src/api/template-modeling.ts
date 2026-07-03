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
  modelDesignJson?: string | null;
  canvasDesignJson?: string | null;
  workflowDesignJson?: string | null;
  status?: string;
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

export const deleteFormTemplateVersion = (id: string | number, versionId: string | number) =>
  client.delete(`${templateModelingBase}/form-templates/${id}/versions/${versionId}`);

export const saveFormTemplateVersionDesign = (id: string | number, versionId: string | number, body: Pick<TemplateModelingPayload, 'modelDesignJson' | 'canvasDesignJson' | 'workflowDesignJson'>) =>
  client.put(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/design`, body) as Promise<{ data: { data: TemplateVersionRecord } }>;

export const getBatchRecordTemplates = (params?: TemplateModelingQuery) =>
  client.get(`${templateModelingBase}/batch-record-templates`, { params }) as Promise<{ data: { data: PageResult<TemplateModelingRecord> } }>;

export const createBatchRecordTemplate = (body: TemplateModelingPayload) =>
  client.post(`${templateModelingBase}/batch-record-templates`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const updateBatchRecordTemplate = (id: string | number, body: TemplateModelingPayload) =>
  client.put(`${templateModelingBase}/batch-record-templates/${id}`, body) as Promise<{ data: { data: TemplateModelingRecord } }>;

export const deleteBatchRecordTemplate = (id: string | number) =>
  client.delete(`${templateModelingBase}/batch-record-templates/${id}`);
