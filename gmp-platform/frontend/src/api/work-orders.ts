import client from './client';
import type { PageResult } from '@/types/common';

export interface ProductionOutput {
  quantity: string | null; unit: string | null; status: string; message: string;
  operationName?: string; objectNo?: string; objectId?: string;
  knownBatches?: number; totalBatches?: number;
  groups?: Array<{ quantity: string; unit: string; materialName?: string; materialCode?: string }>;
  quality?: Partial<Record<'goodQuantity' | 'ngQuantity' | 'scrapQuantity', ProductionOutput>>;
  operations?: Record<string, ProductionOutput>;
  batches?: ProductionOutput[];
  sources?: Array<{ recordId: string; instanceId: string; instanceNo: string; copyId?: string; formStatus?: string; projectionStatus?: string; bindingId: string; tableId: string; rowKey: string; fieldId: string; fieldName?: string; tableName?: string; rowLabel?: string; quantity?: string; unit: string; included: boolean; message?: string; operationName?: string; materialName?: string; materialCode?: string; currentMaterialType?: string; attributes?: Record<string, unknown>; details?: Array<{ name: string; value: unknown }> }>;
}

export interface WorkOrder {
  output?: ProductionOutput;
  id: string; orderNo: string; productId: string; productName: string; productCode: string;
  processVersionId?: string | null; processVersion: string; productionMode?: string | null; productionForm?: string | null;
  plannedQuantity: number; plannedStartAt?: string | null; plannedEndAt?: string | null; orderNumber?: string | null;
  status: string; remark?: string | null; createdAt?: string | null; updatedAt?: string | null;
}
export interface WorkOrderRequest {
  orderNo: string; orderNumber?: string | null; productId: string; processVersionId?: string | null;
  plannedQuantity: number; plannedStartAt?: string | null; plannedEndAt?: string | null; remark?: string;
}
export interface ProductionObject {
  output?: ProductionOutput;
  id: string; objectNo: string; objectType: 'BATCH' | 'SN'; workOrderId: string;
  productName: string; productCode: string; processVersionId: string; processVersion: string;
  targetQuantity: number; goodQuantity: number | null; ngQuantity: number | null; scrapQuantity: number | null;
  status: string; remark?: string | null; terminationReason?: string | null; terminationAt?: string | null; plannedStartAt?: string | null; plannedEndAt?: string | null; createdAt?: string | null; updatedAt?: string | null;
}
export interface ProcessOption {
  id: string;
  version: string;
  productionMode: string;
  productionForm: string;
  routeVersion?: string | null;
  dhrTemplateVersion?: string | null;
}
export interface SplitProductionObjectRequest { processVersionId?: string | null; targetQuantity: number; objectNo?: string; remark?: string; plannedStartAt?: string | null; plannedEndAt?: string | null; }
const basePath = '/production/work-orders';
export const listWorkOrders = (params: { page?: number; size?: number; keyword?: string; status?: string }) => client.get(basePath, { params }) as Promise<{ data: { data: PageResult<WorkOrder> } }>;
export const createWorkOrder = (body: WorkOrderRequest) => client.post(basePath, body) as Promise<{ data: { data: WorkOrder } }>;
export const updateWorkOrder = (id: string, body: WorkOrderRequest) => client.put(`${basePath}/${id}`, body) as Promise<{ data: { data: WorkOrder } }>;
export const cancelWorkOrder = (id: string) => client.post(`${basePath}/${id}/cancel`) as Promise<{ data: { data: WorkOrder } }>;
export const closeWorkOrder = (id: string) => client.post(`${basePath}/${id}/close`) as Promise<{ data: { data: WorkOrder } }>;
export const listProductionObjects = (workOrderId: string) => client.get(`/production/work-orders/${workOrderId}/objects`) as Promise<{ data: { data: ProductionObject[] } }>;
export const listProcessOptions = (workOrderId: string) => client.get(`/production/work-orders/${workOrderId}/process-options`) as Promise<{ data: { data: ProcessOption[] } }>;
export const splitProductionObject = (workOrderId: string, body: SplitProductionObjectRequest) => client.post(`/production/work-orders/${workOrderId}/objects`, body) as Promise<{ data: { data: ProductionObject } }>;
export const splitProductionObjectsBatch = (workOrderId: string, items: SplitProductionObjectRequest[]) => client.post(`/production/work-orders/${workOrderId}/objects/batch`, { items }) as Promise<{ data: { data: ProductionObject[] } }>;
export const startProductionObject = (id: string) => client.post(`/production/objects/${id}/start`) as Promise<{ data: { data: ProductionObject } }>;
export const completeProductionObject = (id: string) => client.post(`/production/objects/${id}/complete`) as Promise<{ data: { data: ProductionObject } }>;
export const cancelProductionObject = (id: string) => client.post(`/production/objects/${id}/cancel`) as Promise<{ data: { data: ProductionObject } }>;
export const endProductionObject = (id: string, reason: string) => client.post(`/production/objects/${id}/end`, { reason }) as Promise<{ data: { data: ProductionObject } }>;

export interface BatchRecord extends ProductionObject {
  workOrderNo: string;
  orderNumber?: string | null;
  productId: string;
}

export const listBatches = (params: { page?: number; size?: number; keyword?: string; status?: string }) =>
  client.get('/production/batches', { params }) as Promise<{ data: { data: PageResult<BatchRecord> } }>;
