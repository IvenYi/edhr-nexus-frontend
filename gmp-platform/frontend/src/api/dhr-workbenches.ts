import client from './client';
import type { DhrInstancePage, DhrInstanceSummary, DhrSummaryVersionDetail, DhrInstanceDetail } from './dhr-instances';
import type { ExecutionButton, ExecutionCommand, ExecutionView } from './production-execution';

export interface DhrReviewTask {
  id: string; dhrId: string; versionId: string; dhrNo: string; versionNo: number; objectNo: string;
  workOrderNo: string; productName: string; nodeName: string; submittedBy: string; submittedAt: string;
  completedAt: string; status: string; snapshotHash: string; opinion: string; action: string;
}
export interface DhrReviewDetail extends DhrSummaryVersionDetail {
  task: DhrReviewTask; buttons: ExecutionButton[]; canAct: boolean;
  evidenceChanges: Array<{ recordId: string; instanceNo: string; message: string }>;
}
export const listDhrReviewTasks = async (params: { view: string; keyword: string; page: number; size: number }): Promise<{ content: DhrReviewTask[]; totalElements: number; totalPages: number }> => (await client.get('/dhr-reviews', { params })).data.data;
export const getDhrReviewTask = async (id: string): Promise<DhrReviewDetail> => (await client.get(`/dhr-reviews/${id}`)).data.data;
export const actDhrReview = async (id: string, command: { action: string; expectedSnapshotHash: string; opinion: string; account?: string; password?: string }) => (await client.post(`/dhr-reviews/${id}/actions`, command)).data.data;
export interface DhrFillingSummary extends DhrInstanceSummary { productionStatus: string | null }
export const listDhrFilling = async (params: { keyword: string; displayStatus: string; page: number; size: number }): Promise<Omit<DhrInstancePage, 'content'> & { content: DhrFillingSummary[] }> => (await client.get('/dhr-filling', { params })).data.data;
export interface DhrFillingView extends ExecutionView { directorySnapshot: DhrInstanceDetail['directorySnapshot']; dhrSummaryStatus: string }
export const getDhrFilling = async (id: string): Promise<DhrFillingView> => (await client.get(`/dhr-filling/${id}`)).data.data;
export const actDhrFilling = async (id: string, command: ExecutionCommand): Promise<DhrFillingView> => (await client.post(`/dhr-filling/${id}/actions`, command)).data.data;
export const createDhrSupplement = async (id: string, command: { revision: number; operationId: string; formId: string; reason: string; occurredAt: string }): Promise<DhrFillingView & { createdCopyId: string }> => (await client.post(`/dhr-filling/${id}/supplements`, command)).data.data;
export const dhrReferences = async (id: string, operationId: string, formId: string, fieldId: string, keyword: string, values: Record<string, unknown>): Promise<Array<{ id: string; name: string }>> => (await client.post(`/dhr-filling/${id}/references`, { operationId, formId, fieldId, keyword, values })).data.data;
export const reorganizeDhr = async (id: string, expectedVersionId: string, reason: string) => (await client.post(`/dhr-instances/${id}/summary/reorganize`, { expectedVersionId, reason })).data.data;
