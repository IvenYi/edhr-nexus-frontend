import client from './client';
import type { PageResult } from '@/types/common';

export type ProcessModelingEntityType =
  | 'MATERIAL'
  | 'OPERATION'
  | 'ROUTE'
  | 'PRODUCT'
  | 'PRODUCT_FAMILY'
  | 'PROCESS_DOCUMENT';

export interface ProcessModelingBaseRecord {
  id: number | string;
  tenantId?: string;
  code: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  remark?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MaterialRecord extends ProcessModelingBaseRecord {
  specification?: string;
  version?: string;
  materialPurpose?: string;
  effectiveDate?: string;
  expiryDate?: string;
  materialTypeId?: string | number | null;
  materialTypeName?: string | null;
  unit?: string;
}

export interface MaterialGroupRecord extends MaterialRecord {
  versionCount?: number;
  effectiveVersionCount?: number;
  versions: MaterialRecord[];
}

export interface ProductRecord extends ProcessModelingBaseRecord {
  familyId?: string | number | null;
  productFamilyId?: string | number | null;
  materialTypeId?: string | number | null;
  materialTypeName?: string | null;
  specification?: string;
  unit?: string;
}

export interface ProductFamilyRecord extends ProcessModelingBaseRecord {}

export interface OperationRecord extends ProcessModelingBaseRecord {
  defaultDurationMinutes?: number | null;
  sortOrder?: number | null;
}

export interface RouteRecord extends ProcessModelingBaseRecord {
  productFamilyId?: string | number | null;
}

export interface ProcessDocumentRecord extends ProcessModelingBaseRecord {
  title: string;
  version?: string;
  fileReference?: string;
}

export type ProcessModelingRecord =
  | MaterialGroupRecord
  | MaterialRecord
  | OperationRecord
  | RouteRecord
  | ProductRecord
  | ProductFamilyRecord
  | ProcessDocumentRecord;

export interface ProcessModelingQuery {
  page?: number;
  size?: number;
  keyword?: string;
  materialName?: string;
  materialCode?: string;
  materialTypeName?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProcessModelingPayload {
  code?: string;
  name: string;
  description?: string;
  status?: string;
  remark?: string;
  specification?: string;
  unit?: string;
  materialTypeId?: string | number | null;
  materialTypeName?: string | null;
  productFamilyId?: string | number | null;
  version?: string;
  materialPurpose?: string;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  fileReference?: string;
  defaultDurationMinutes?: number | null;
  sortOrder?: number | null;
}

const processModelingBase = '/master-data/process-modeling';

const getProcessModelingList = <T extends ProcessModelingRecord>(path: string, params?: ProcessModelingQuery) =>
  client.get(`/master-data/process-modeling/${path}`, { params }) as Promise<{ data: { data: PageResult<T> } }>;

const createProcessModelingRecord = <T extends ProcessModelingRecord>(path: string, body: ProcessModelingPayload) =>
  client.post(`${processModelingBase}/${path}`, body) as Promise<{ data: { data: T } }>;

const updateProcessModelingRecord = <T extends ProcessModelingRecord>(path: string, id: string | number, body: ProcessModelingPayload) =>
  client.put(`${processModelingBase}/${path}/${id}`, body) as Promise<{ data: { data: T } }>;

const deleteProcessModelingRecord = (path: string, id: string | number) =>
  client.delete(`${processModelingBase}/${path}/${id}`);

export const getMaterials = (params?: ProcessModelingQuery) => getProcessModelingList<MaterialGroupRecord>('materials', params);
export const createMaterial = (body: ProcessModelingPayload) => createProcessModelingRecord<MaterialRecord>('materials', body);
export const updateMaterial = (id: string | number, body: ProcessModelingPayload) => updateProcessModelingRecord<MaterialRecord>('materials', id, body);
export const deleteMaterial = (id: string | number) => deleteProcessModelingRecord('materials', id);

export const getProcessOperations = (params?: ProcessModelingQuery) => getProcessModelingList<OperationRecord>('operations', params);
export const createProcessOperation = (body: ProcessModelingPayload) => createProcessModelingRecord<OperationRecord>('operations', body);
export const updateProcessOperation = (id: string | number, body: ProcessModelingPayload) => updateProcessModelingRecord<OperationRecord>('operations', id, body);
export const deleteProcessOperation = (id: string | number) => deleteProcessModelingRecord('operations', id);

export const getProcessRoutes = (params?: ProcessModelingQuery) => getProcessModelingList<RouteRecord>('routes', params);
export const createProcessRoute = (body: ProcessModelingPayload) => createProcessModelingRecord<RouteRecord>('routes', body);
export const updateProcessRoute = (id: string | number, body: ProcessModelingPayload) => updateProcessModelingRecord<RouteRecord>('routes', id, body);
export const deleteProcessRoute = (id: string | number) => deleteProcessModelingRecord('routes', id);

export const getProducts = (params?: ProcessModelingQuery) => getProcessModelingList<ProductRecord>('products', params);
export const createProduct = (body: ProcessModelingPayload) => createProcessModelingRecord<ProductRecord>('products', body);
export const updateProduct = (id: string | number, body: ProcessModelingPayload) => updateProcessModelingRecord<ProductRecord>('products', id, body);
export const deleteProduct = (id: string | number) => deleteProcessModelingRecord('products', id);

export const getProcessProductFamilies = (params?: ProcessModelingQuery) => getProcessModelingList<ProductFamilyRecord>('product-families', params);
export const createProcessProductFamily = (body: ProcessModelingPayload) => createProcessModelingRecord<ProductFamilyRecord>('product-families', body);
export const updateProcessProductFamily = (id: string | number, body: ProcessModelingPayload) => updateProcessModelingRecord<ProductFamilyRecord>('product-families', id, body);
export const deleteProcessProductFamily = (id: string | number) => deleteProcessModelingRecord('product-families', id);

export const getProcessDocuments = (params?: ProcessModelingQuery) => getProcessModelingList<ProcessDocumentRecord>('documents', params);
export const createProcessDocument = (body: ProcessModelingPayload) => createProcessModelingRecord<ProcessDocumentRecord>('documents', body);
export const updateProcessDocument = (id: string | number, body: ProcessModelingPayload) => updateProcessModelingRecord<ProcessDocumentRecord>('documents', id, body);
export const deleteProcessDocument = (id: string | number) => deleteProcessModelingRecord('documents', id);

// Product Families
export const getProductFamilies = (params?: Record<string, unknown>) =>
  client.get('/master-data/product-families', { params });
export const createProductFamily = (body: Record<string, unknown>) =>
  client.post('/master-data/product-families', body);
export const updateProductFamily = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/product-families/${id}`, body);
export const deleteProductFamily = (id: number) =>
  client.delete(`/master-data/product-families/${id}`);

// Units
export const getUnits = (params?: Record<string, unknown>) =>
  client.get('/master-data/units', { params });
export const createUnit = (body: Record<string, unknown>) =>
  client.post('/master-data/units', body);
export const updateUnit = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/units/${id}`, body);
export const deleteUnit = (id: number) =>
  client.delete(`/master-data/units/${id}`);

// Equipment Types
export const getEquipmentTypes = (params?: Record<string, unknown>) =>
  client.get('/master-data/equipment', { params });
export const createEquipmentType = (body: Record<string, unknown>) =>
  client.post('/master-data/equipment', body);
export const updateEquipmentType = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/equipment/${id}`, body);
export const deleteEquipmentType = (id: number) =>
  client.delete(`/master-data/equipment/${id}`);

// Operations
export const getOperations = (params?: Record<string, unknown>) =>
  client.get('/master-data/operations', { params });
export const createOperation = (body: Record<string, unknown>) =>
  client.post('/master-data/operations', body);
export const updateOperation = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/operations/${id}`, body);
export const deleteOperation = (id: number) =>
  client.delete(`/master-data/operations/${id}`);

// Routes
export const getRoutes = (params?: Record<string, unknown>) =>
  client.get('/master-data/routes', { params });
export const createRoute = (body: Record<string, unknown>) =>
  client.post('/master-data/routes', body);
export const updateRoute = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/routes/${id}`, body);
export const deleteRoute = (id: number) =>
  client.delete(`/master-data/routes/${id}`);

// SOP Documents
export const getSopDocuments = (params?: Record<string, unknown>) =>
  client.get('/master-data/sop-documents', { params });
export const createSopDocument = (body: Record<string, unknown>) =>
  client.post('/master-data/sop-documents', body);
export const updateSopDocument = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/sop-documents/${id}`, body);
export const deleteSopDocument = (id: number) =>
  client.delete(`/master-data/sop-documents/${id}`);
