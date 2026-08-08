import client from './client';
import type { AuditLogItem } from './audit';
import type { PageResult } from '@/types/common';

export interface ProductModelSource {
  id: string;
  name: string;
  code: string;
  version?: string | null;
  specification?: string | null;
  materialTypeName?: string | null;
  unit?: string | null;
  status: string;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  modelVersionCount: number;
  activeModelVersionCount: number;
}

export interface ProductProcessFormBinding {
  id?: string;
  dhrTemplateItemId?: string | null;
  formTemplateVersionId: string;
  templateName?: string | null;
  templateCode?: string | null;
  version?: string | null;
  required: boolean;
  sortOrder?: number | null;
}

export interface ProductProcessDocumentBinding {
  id?: string;
  documentVersionId: string;
  title?: string | null;
  code?: string | null;
  documentCategoryName?: string | null;
  version?: string | null;
  sortOrder?: number | null;
  pageStart?: number | null;
  pageEnd?: number | null;
}

export interface ProductProcessOperation {
  id?: string;
  routeNodeKey: string;
  operationId?: string | null;
  operationCode?: string | null;
  operationName: string;
  sortOrder?: number | null;
  forms: ProductProcessFormBinding[];
  documents: ProductProcessDocumentBinding[];
}

export interface ProductProcessVersion {
  id: string;
  version: string;
  productionMode: string;
  productionForm: string;
  routeVersionId: string;
  routeName?: string | null;
  routeCode?: string | null;
  routeVersion?: string | null;
  dhrTemplateVersionId: string;
  dhrTemplateName?: string | null;
  dhrTemplateCode?: string | null;
  dhrTemplateVersion?: string | null;
  description?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  status: string;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  operations: ProductProcessOperation[];
}

export interface ProductProcessModel {
  id: string;
  versions: ProductProcessVersion[];
}

export interface ProductModelWorkspace {
  product: ProductModelSource;
  model: ProductProcessModel | null;
}

export interface ProductModelRouteOption {
  id: string;
  routeId: string;
  routeName: string;
  version: string;
  versionCode?: string | null;
  status: string;
}

export interface ProductModelTemplateOption {
  id: string;
  templateId: string;
  code?: string | null;
  name: string;
  version?: string | null;
  versionCode?: string | null;
  status: string;
  categoryName?: string | null;
  dhrTemplateItemId?: string | null;
  directoryName?: string | null;
  directoryId?: string | null;
}

export interface ProductModelDhrDirectoryOption {
  id: string;
  parentId?: string | null;
  name: string;
  sortOrder?: number | null;
}

export interface ProductModelDocumentOption {
  id: string;
  documentId: string;
  code?: string | null;
  title?: string | null;
  documentCategoryName: string;
  version?: string | null;
  status: string;
  fileId?: string | null;
  fileName?: string | null;
  fileMimeType?: string | null;
}

export interface ProductModelOptions {
  routes: ProductModelRouteOption[];
  dhrTemplates: ProductModelTemplateOption[];
  formTemplates: ProductModelTemplateOption[];
  documents: ProductModelDocumentOption[];
  dhrDirectories: ProductModelDhrDirectoryOption[];
}

export interface ProductProcessVersionPayload {
  version: string;
  sourceVersionId?: string | null;
  productionMode: string;
  productionForm: string;
  routeVersionId: string;
  dhrTemplateVersionId: string;
  description?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  operationBindings?: Array<{
    routeNodeKey: string;
    sortOrder?: number | null;
    forms: Array<{ dhrTemplateItemId?: string | null; formTemplateVersionId: string; required: boolean; sortOrder?: number | null }>;
    documents: Array<{ documentVersionId: string; sortOrder?: number | null; pageStart?: number | null; pageEnd?: number | null }>;
  }>;
}

const basePath = '/master-data/product-modeling';

export const getProductModelingProducts = (params: { page?: number; size?: number; keyword?: string; status?: string }) =>
  client.get(`${basePath}/products`, { params }) as Promise<{ data: { data: PageResult<ProductModelSource> } }>;

export const getProductModelWorkspace = (productVersionId: string) =>
  client.get(`${basePath}/products/${productVersionId}`) as Promise<{ data: { data: ProductModelWorkspace } }>;

export const getProductModelOptions = (productVersionId: string, dhrTemplateVersionId?: string) =>
  client.get(`${basePath}/products/${productVersionId}/options`, { params: { dhrTemplateVersionId } }) as Promise<{ data: { data: ProductModelOptions } }>;

export const createProductProcessVersion = (productVersionId: string, body: ProductProcessVersionPayload) =>
  client.post(`${basePath}/products/${productVersionId}/versions`, body) as Promise<{ data: { data: ProductProcessVersion } }>;

export const updateProductProcessVersion = (productVersionId: string, versionId: string, body: ProductProcessVersionPayload) =>
  client.put(`${basePath}/products/${productVersionId}/versions/${versionId}`, body) as Promise<{ data: { data: ProductProcessVersion } }>;

export const deleteProductProcessVersion = (productVersionId: string, versionId: string) =>
  client.delete(`${basePath}/products/${productVersionId}/versions/${versionId}`);

export const getProductProcessVersionAuditLogs = (versionId: string) =>
  client.get('/audit/logs', {
    params: {
      page: 1,
      size: 100,
      sort: 'createdAt',
      order: 'desc',
      entityType: 'PRODUCT_PROCESS_VERSION',
      entityId: versionId,
    },
  }) as Promise<{ data: { data: PageResult<AuditLogItem> } }>;

export const getProductProcessOperationAuditLogs = (versionId: string) =>
  client.get('/audit/logs', {
    params: {
      page: 1,
      size: 100,
      sort: 'createdAt',
      order: 'desc',
      entityType: 'PRODUCT_PROCESS_OPERATION',
      entityId: versionId,
    },
  }) as Promise<{ data: { data: PageResult<AuditLogItem> } }>;
