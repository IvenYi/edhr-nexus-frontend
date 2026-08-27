import client from './client';
import type { PageResult } from '@/types/common';

export interface WorkOrder {
  id: string; orderNo: string; productId: string; productName: string; productCode: string;
  processVersionId: string; processVersion: string; productionMode: string; productionForm: string;
  plannedQuantity: number; status: string; remark?: string | null; createdAt?: string | null; updatedAt?: string | null;
}
export interface WorkOrderRequest { productId: string; processVersionId: string; plannedQuantity: number; remark?: string; }
const basePath = '/production/work-orders';
export const listWorkOrders = (params: { page?: number; size?: number; keyword?: string; status?: string }) => client.get(basePath, { params }) as Promise<{ data: { data: PageResult<WorkOrder> } }>;
export const createWorkOrder = (body: WorkOrderRequest) => client.post(basePath, body) as Promise<{ data: { data: WorkOrder } }>;
export const updateWorkOrder = (id: string, body: WorkOrderRequest) => client.put(`${basePath}/${id}`, body) as Promise<{ data: { data: WorkOrder } }>;
export const cancelWorkOrder = (id: string) => client.post(`${basePath}/${id}/cancel`) as Promise<{ data: { data: WorkOrder } }>;
