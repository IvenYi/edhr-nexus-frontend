import client from './client';
import type { PageResult } from '@/types/common';

export interface DocumentCategory {
  id: string;
  name: string;
  count: number;
  sortOrder: number;
  system: boolean;
}

export interface ManagedDocumentVersion {
  id: string;
  documentId: string;
  version: string;
  code: string;
  fileId?: string | null;
  fileName?: string | null;
  fileMimeType?: string | null;
  description?: string | null;
  remark?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  status: 'ACTIVE' | 'EXPIRED';
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface ManagedDocument {
  id: string;
  title: string;
  categoryId?: string | null;
  categoryName?: string | null;
  description?: string | null;
  remark?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  versions: ManagedDocumentVersion[];
}

export interface DocumentWritePayload {
  code: string;
  title: string;
  categoryId?: string | null;
  description?: string | null;
  remark?: string | null;
  version: string;
  fileId?: string | null;
  versionDescription?: string | null;
  versionRemark?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
}

export interface DocumentVersionWritePayload {
  version: string;
  code: string;
  fileId?: string | null;
  description?: string | null;
  remark?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
}

const basePath = '/master-data/documents';

export const getDocuments = (params: { page?: number; size?: number; keyword?: string; categoryId?: string }) =>
  client.get(basePath, { params }) as Promise<{ data: { data: PageResult<ManagedDocument> } }>;

export const getDocumentCategories = () =>
  client.get(`${basePath}/categories`) as Promise<{ data: { data: DocumentCategory[] } }>;

export const createDocumentCategory = (body: { name: string }) =>
  client.post(`${basePath}/categories`, body) as Promise<{ data: { data: DocumentCategory } }>;

export const updateDocumentCategory = (categoryId: string, body: { name: string }) =>
  client.put(`${basePath}/categories/${categoryId}`, body) as Promise<{ data: { data: DocumentCategory } }>;

export const deleteDocumentCategory = (categoryId: string) =>
  client.delete(`${basePath}/categories/${categoryId}`);

export const reorderDocumentCategories = (ids: string[]) =>
  client.put(`${basePath}/categories/order`, { ids }) as Promise<{ data: { data: DocumentCategory[] } }>;

export const createDocument = (body: DocumentWritePayload) =>
  client.post(basePath, body) as Promise<{ data: { data: ManagedDocument } }>;

export const updateDocument = (documentId: string, body: Pick<DocumentWritePayload, 'title' | 'description' | 'remark'>) =>
  client.put(`${basePath}/${documentId}`, body) as Promise<{ data: { data: ManagedDocument } }>;

export const deleteDocument = (documentId: string) => client.delete(`${basePath}/${documentId}`);

export const createDocumentVersion = (documentId: string, body: DocumentVersionWritePayload) =>
  client.post(`${basePath}/${documentId}/versions`, body) as Promise<{ data: { data: ManagedDocumentVersion } }>;

export const updateDocumentVersion = (documentId: string, versionId: string, body: DocumentVersionWritePayload) =>
  client.put(`${basePath}/${documentId}/versions/${versionId}`, body) as Promise<{ data: { data: ManagedDocumentVersion } }>;

export const deleteDocumentVersion = (documentId: string, versionId: string) =>
  client.delete(`${basePath}/${documentId}/versions/${versionId}`);
