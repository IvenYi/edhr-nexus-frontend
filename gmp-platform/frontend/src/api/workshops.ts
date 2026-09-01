import client from '@/api/client';
import type { PageResult } from '@/types/common';

export interface WorkshopRecord {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  referenced: boolean;
  codeEditable: boolean;
  deletable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkshopPayload {
  code: string;
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface WorkshopQuery {
  keyword?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page: number;
  size: number;
}

export async function getWorkshops(params: WorkshopQuery): Promise<PageResult<WorkshopRecord>> {
  const response = await client.get('/master-data/workshops', { params });
  return response.data.data as PageResult<WorkshopRecord>;
}

export async function createWorkshop(payload: WorkshopPayload): Promise<WorkshopRecord> {
  const response = await client.post('/master-data/workshops', payload);
  return response.data.data as WorkshopRecord;
}

export async function updateWorkshop(id: string, payload: WorkshopPayload): Promise<WorkshopRecord> {
  const response = await client.put(`/master-data/workshops/${id}`, payload);
  return response.data.data as WorkshopRecord;
}

export async function deleteWorkshop(id: string): Promise<void> {
  await client.delete(`/master-data/workshops/${id}`);
}
