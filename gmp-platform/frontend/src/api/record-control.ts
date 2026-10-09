import client from './client';
import type { ExecutionForm } from './production-execution';
import type { RecordControlBusinessType } from './record-control-workflow';

export interface RecordControlRecord {
  id: string;
  instance_no: string;
  object_id: string;
  status: string;
  template_code: string;
  template_name: string;
  version_number: string;
  current_revision_id: string | null;
  revision_no: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
  active_request_id: string | null;
  active_request_no: string | null;
  active_request_type: RecordControlBusinessType | null;
  snapshot: ExecutionForm;
  fieldValues: Record<string, unknown>;
}

export interface RecordControlRequest {
  id: string;
  request_no: string;
  request_type: RecordControlBusinessType;
  status: 'IN_REVIEW' | 'APPROVED' | 'RETURNED' | 'WITHDRAWN';
  reason_text: string;
  applicant_id: string;
  applicant_name: string | null;
  submitted_at: string;
  resolved_at: string | null;
  workflow_instance_id: string | null;
  instance_no: string;
  template_name: string | null;
  template_code: string | null;
  record_status: string;
}

export interface RecordControlRequestQuery {
  requestNo?: string;
  requestType?: RecordControlBusinessType | '';
  instanceNo?: string;
  templateName?: string;
  templateCode?: string;
  applicant?: string;
  submittedFrom?: string;
  submittedTo?: string;
  status?: RecordControlRequest['status'] | '';
}

export interface RecordControlRequestDetail extends RecordControlRequest {
  record_id: string;
  source_revision_id: string;
  source_revision_no: string;
  applicant_signature_id: string;
  workflow_definition_id: string;
  workflow_version_id: string;
  audit_correlation_id: string;
  snapshot: ExecutionForm;
  sourceValues: Record<string, unknown>;
  proposedValues?: Record<string, unknown>;
  diff?: Array<{ fieldId: string; fieldType: string; fieldPath: string;
    changeType: 'FIELD_CHANGED' | 'ROW_ADDED' | 'ROW_REMOVED' | 'FILE_ADDED' | 'FILE_REMOVED' | 'FILE_CHANGED';
    before: unknown; after: unknown }>;
  statusHistory: Array<{ status: RecordControlRequest['status']; action: string; operatorId?: string;
    eventId?: string; occurredAt: string }>;
}

export interface RecordControlRevision {
  id: string;
  revision_no: string;
  status: string;
  content_hash: string | null;
  request_id: string | null;
  created_by: string | null;
  created_at: string | null;
  fieldValues: Record<string, unknown>;
}

export interface SubmitRecordControlRequest {
  requestType: RecordControlBusinessType;
  instanceNo: string;
  sourceRevisionId: string;
  proposedValues?: Record<string, unknown>;
  reason: string;
  workflowDefinitionId: string;
  workflowVersionId: string;
  account: string;
  password: string;
  idempotencyKey: string;
}

export const findRecordByNumber = async (instanceNo: string): Promise<RecordControlRecord> =>
  (await client.get('/record-control/records/by-number', { params: { instanceNo } })).data.data;

export const submitRecordControlRequest = async (command: SubmitRecordControlRequest): Promise<RecordControlRequestDetail> =>
  (await client.post('/record-control/requests', command)).data.data;

export const listRecordControlRequests = async (scope: 'mine' | 'all', page = 0, size = 20,
  query: RecordControlRequestQuery = {}): Promise<{ content: RecordControlRequest[]; page: number; size: number; totalElements: number; totalPages: number }> =>
  (await client.get('/record-control/requests', { params: { scope, page, size, ...query } })).data.data;

export const getRecordControlRequest = async (requestId: string): Promise<RecordControlRequestDetail> =>
  (await client.get(`/record-control/requests/${requestId}`)).data.data;

export const listRecordRevisions = async (recordId: string): Promise<RecordControlRevision[]> =>
  (await client.get(`/record-control/records/${recordId}/revisions`)).data.data;

export const getRecordControlReferences = async (recordId: string, fieldId: string, keyword: string): Promise<Array<{ id: string; name: string }>> =>
  (await client.get(`/record-control/records/${recordId}/references`, { params: { fieldId, keyword } })).data.data;

export interface RecordControlWorkflowTask {
  id: string;
  instanceId: string;
  nodeId: string;
  status: string;
  assigneeId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export const listMyWorkflowTasks = async (scope: 'todo' | 'done', page = 1, size = 50): Promise<RecordControlWorkflowTask[]> =>
  (await client.get(`/workflow/tasks/${scope}`, { params: { page, size } })).data.data;

export const getRequestsForMyWorkflowTasks = async (instanceIds: string[]): Promise<RecordControlRequest[]> =>
  (await client.post('/record-control/requests/for-my-workflow-tasks', instanceIds)).data.data;
