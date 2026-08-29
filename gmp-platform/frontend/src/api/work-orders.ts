import client from './client';
import type { PageResult } from '@/types/common';

export interface WorkOrder {
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
  id: string; objectNo: string; objectType: 'BATCH' | 'SN'; workOrderId: string;
  productName: string; productCode: string; processVersionId: string; processVersion: string;
  targetQuantity: number; goodQuantity: number; ngQuantity: number; scrapQuantity: number;
  status: string; remark?: string | null; plannedStartAt?: string | null; plannedEndAt?: string | null; createdAt?: string | null; updatedAt?: string | null;
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
