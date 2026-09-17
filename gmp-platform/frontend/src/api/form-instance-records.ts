import client from './client';
import type { ExecutionForm, ExecutionFormControls } from './production-execution';

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

// Global production-source queries. The existing template-scoped functions above remain compatible.
export interface FormInstanceSource {
  sourceType: 'PRODUCTION_EXECUTION'; sourceId: string;
  productionObjectId: string; productionObjectNo: string | null; productionObjectType: 'BATCH' | 'SN' | null;
  workOrderId: string | null; workOrderNo: string | null;
  operationId: string; operationName: string | null; formId: string; copyId: string;
}
export interface GlobalFormInstanceSummary {
  formInstanceId: string; instanceNo: string; templateId: string; templateVersionId: string;
  templateCode: string | null; templateName: string | null; templateVersion: string | null;
  recordStatus: string; createdById: string | null; createdByName: string | null;
  updatedById: string | null; updatedByName: string | null;
  /** Source-local ISO timestamps, NOT UTC. Historical source did not persist an offset. */
  createdAt: string | null; updatedAt: string; legacy: boolean; source: FormInstanceSource;
}
export interface GlobalFormInstanceDetail extends GlobalFormInstanceSummary {
  snapshot: ExecutionForm; fieldValues: Record<string, unknown>;
}
export interface GlobalFormInstanceQuery {
  instanceNo?: string; instanceNoContains?: string; templateId?: string; templateVersionId?: string;
  templateCode?: string; templateName?: string; sourceType?: 'PRODUCTION_EXECUTION'; sourceId?: string;
  productionObjectId?: string; productionObjectType?: 'BATCH' | 'SN'; productionObjectNo?: string;
  workOrderId?: string; workOrderNo?: string; operationId?: string;
  createdById?: string; updatedById?: string; recordStatus?: Array<'ACTIVE' | 'COMPLETED'>;
  createdFrom?: string; createdTo?: string; updatedFrom?: string; updatedTo?: string; keyword?: string;
  page?: number; size?: number; sort?: `${'createdAt' | 'updatedAt' | 'instanceNo' | 'templateCode'},${'asc' | 'desc'}`;
}
export interface GlobalFormInstancePage {
  content: GlobalFormInstanceSummary[]; page: number; size: number; totalElements: number; totalPages: number;
}
export async function listGlobalFormInstances(query: GlobalFormInstanceQuery = {}): Promise<GlobalFormInstancePage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item));
  }
  return (await client.get('/form-instances', { params })).data.data;
}
export async function getGlobalFormInstance(id: string): Promise<GlobalFormInstanceDetail> {
  return (await client.get(`/form-instances/${encodeURIComponent(id)}`)).data.data;
}
export async function getGlobalFormInstanceByNumber(instanceNo: string): Promise<GlobalFormInstanceDetail> {
  return (await client.get(`/form-instances/by-number/${encodeURIComponent(instanceNo)}`)).data.data;
}
export async function getFormInstanceFillContext(id: string): Promise<{
  formInstanceId: string; intent: 'FILL'; source: FormInstanceSource; revision: number; controls: ExecutionFormControls;
}> {
  return (await client.get(`/form-instances/${encodeURIComponent(id)}/operation-context`, { params: { intent: 'FILL' } })).data.data;
}

// Personal source worklists include unsaved copies and do not require global instance-view access.
export type FormWorklistView = 'FILLABLE' | 'CREATED' | 'FILLED' | 'REVIEW_PENDING' | 'REVIEW_DONE';
export interface FormWorklistIdentity {
  productionObjectId: string; operationId: string; formId: string; copyId: string;
}
export interface FormWorklistRow extends FormWorklistIdentity {
  view: FormWorklistView; formInstanceId: string | null; instanceNo: string | null;
  templateId: string; templateVersionId: string; templateCode: string | null;
  templateName: string | null; templateVersion: string | null;
  productionObjectNo: string | null; productionObjectType: 'BATCH' | 'SN' | null;
  workOrderId: string | null; workOrderNo: string | null; operationName: string;
  recordStatus: 'ACTIVE' | 'COMPLETED'; saved: boolean;
  /** Present only when this row is an explicit creation by the current user. */
  creationType: 'CUSTOM_FORM' | 'ADDED_COPY' | null;
  /** Explicit creation only; system initial copies and unknown legacy creators remain null. */
  creatorId: string | null; createdAt: string | null;
  /** Source execution update time, not an individual-copy edit time. All times are source-local ISO. */
  updatedAt: string; arrivedAt: string | null; handledAt: string | null;
  nodeId: string | null; nodeName: string | null; handledAction: 'SUBMIT' | 'APPROVE' | 'RETURN' | null;
  canTransfer?: boolean; transferLabel?: string | null; transferStyle?: 'PRIMARY' | 'DEFAULT' | 'DANGER' | null;
  transferFrom?: string | null; transferReason?: string | null; transferredAt?: string | null;
  revision: number; historyCoverage: 'STRUCTURED_EVENTS_ONLY';
}
export interface FormWorklistQuery {
  page?: number; size?: number; keyword?: string;
  instanceNo?: string; instanceNoContains?: string;
  templateId?: string; templateVersionId?: string; templateCode?: string; templateName?: string;
  productionObjectId?: string; productionObjectNo?: string; productionObjectType?: 'BATCH' | 'SN';
  workOrderId?: string; workOrderNo?: string; operationId?: string; formId?: string; copyId?: string;
  nodeId?: string; nodeName?: string; creatorId?: string; saved?: boolean;
  recordStatus?: Array<'ACTIVE' | 'COMPLETED'>; reviewResult?: 'APPROVE' | 'RETURN';
  createdFrom?: string; createdTo?: string; updatedFrom?: string; updatedTo?: string;
  submittedFrom?: string; submittedTo?: string; reviewedFrom?: string; reviewedTo?: string;
  arrivedFrom?: string; arrivedTo?: string;
}
export interface FormWorklistPage {
  content: FormWorklistRow[]; page: number; size: number; totalElements: number; totalPages: number;
  historyCoverage: 'STRUCTURED_EVENTS_ONLY';
}
export interface FormWorklistDetail extends FormWorklistRow {
  snapshot: ExecutionForm; fieldValues: Record<string, unknown>; controls: ExecutionFormControls;
  myEvents: Array<{
    at: string; operator: string; operationId: string; actionCode: 'SUBMIT' | 'APPROVE' | 'RETURN';
    formId: string; copyId: string; nodeId: string; nodeKind: 'START' | 'APPROVAL'; nodeName: string;
  }>;
}
export async function listFormWorklist(view: FormWorklistView, query: FormWorklistQuery = {}): Promise<FormWorklistPage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item));
  }
  return (await client.get(`/form-worklists/${encodeURIComponent(view)}`, { params })).data.data;
}
export async function getFormWorklistDetail(view: FormWorklistView, identity: FormWorklistIdentity): Promise<FormWorklistDetail> {
  const { productionObjectId, operationId, formId, copyId } = identity;
  return (await client.get(`/form-worklists/${encodeURIComponent(view)}/detail`, { params: { productionObjectId, operationId, formId, copyId } })).data.data;
}
