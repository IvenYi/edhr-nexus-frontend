import client from '@/api/client';
import type { PageResult } from '@/types/common';

export type QualityReasonType = 'DEFECT' | 'SCRAP';
export interface QualityReasonPayload {
  code: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}
export interface QualityReasonRecord extends QualityReasonPayload {
  id: string;
  type: QualityReasonType;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
export async function getQualityReasons(type: QualityReasonType, params: { keyword?: string; status?: string; page: number; size: number }): Promise<PageResult<QualityReasonRecord>> {
  return (await client.get(`/master-data/quality-reasons/${type}`, { params })).data.data;
}
export async function saveQualityReason(type: QualityReasonType, id: string | undefined, value: QualityReasonPayload): Promise<QualityReasonRecord> {
  return (id ? await client.put(`/master-data/quality-reasons/${type}/${id}`, value) : await client.post(`/master-data/quality-reasons/${type}`, value)).data.data;
}
export async function deleteQualityReason(type: QualityReasonType, id: string): Promise<void> {
  await client.delete(`/master-data/quality-reasons/${type}/${id}`);
}
