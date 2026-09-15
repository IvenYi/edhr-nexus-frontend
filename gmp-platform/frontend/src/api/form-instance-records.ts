import client from './client';
import type { ExecutionForm } from './production-execution';

export interface FormInstanceRecord {
  id: string;
  instanceNo: string;
  templateId: string;
  versionId: string;
  status: string;
  fieldValues: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string;
  legacy: boolean;
}
export interface FormInstanceDetail extends FormInstanceRecord { snapshot: ExecutionForm }
export interface FormRecordQuery { templateId: string; instanceNo: string; keyword: string; occurredAt: string; operator: string; page: number; size: number }
export async function listFormInstanceRecords(params: FormRecordQuery) {
  const response = await client.get<{ data: { content: FormInstanceRecord[]; totalElements: number } }>('/form-instance-records', { params });
  return response.data.data;
}
export async function getFormInstanceRecord(templateId: string, id: string) {
  const response = await client.get<{ data: FormInstanceDetail }>(`/form-instance-records/${id}`, { params: { templateId } });
  return response.data.data;
}
