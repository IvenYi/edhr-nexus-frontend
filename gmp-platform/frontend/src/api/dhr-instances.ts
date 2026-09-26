import client from './client';

export type DhrStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EARLY_TERMINATED';
export type DhrDisplayStatus = 'FILLING' | 'PENDING_SUMMARY' | 'SUMMARIZING' | 'PENDING_REVIEW' | 'FINALIZED' | 'TERMINATED' | 'STATUS_ERROR';
export type DhrProductionStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'EARLY_TERMINATED' | 'CANCELLED';
export type DhrSummaryStatus = 'NOT_STARTED' | 'DRAFT' | 'PENDING_REVIEW' | 'FORMALIZED';
export type DhrObjectType = 'BATCH' | 'SN';

export interface DhrInstanceSummary {
  id: string;
  dhrNo: string;
  productionObjectId: string;
  objectNo: string;
  objectType: DhrObjectType;
  workOrderId: string;
  workOrderNo: string;
  productCode: string | null;
  productName: string | null;
  processVersion: string | null;
  routeName: string | null;
  routeVersion: string | null;
  dhrTemplateName: string | null;
  dhrTemplateVersion: string | null;
  status: DhrStatus;
  displayStatus: DhrDisplayStatus;
  productionStatus: string | null;
  terminationReason: string | null;
  terminationAt: string | null;
  terminatedBy: string | null;
  terminationSnapshotAvailable: boolean;
  summaryStatus: DhrSummaryStatus;
  dhrReviewMode: 'NONE' | 'REQUIRED';
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  completedAt: string | null;
}

export interface DhrEvidenceRecord {
  id: string;
  instanceNo: string;
  operationId: string;
  operationName: string | null;
  formId: string;
  copyId: string;
  templateId: string;
  templateVersionId: string;
  templateCode: string | null;
  templateName: string | null;
  templateVersion: string | null;
  status: string;
  originKind: 'DIRECTORY' | 'WORK' | 'CUSTOM';
  snapshot: Record<string, unknown> & { name?: string; version?: string; model?: string; canvas?: string; fields?: Array<Record<string, unknown>>; dhrItemId?: string; workId?: string; workNodeId?: string; sourceType?: string };
  updatedBy: string | null;
  updatedAt: string;
  fieldValues: Record<string, unknown>;
}

export interface DhrDirectoryItem {
  id: string;
  sortOrder?: number;
  displayName?: string;
  formName?: string;
  formVersion?: string;
  required?: boolean;
  records: DhrEvidenceRecord[];
}

export interface DhrDirectory {
  id: string;
  sortOrder?: number;
  parentId: string | null;
  name: string;
  items: DhrDirectoryItem[];
}

export interface DhrInstanceDetail extends DhrInstanceSummary {
  productId: string;
  processVersionId: string;
  routeVersionId: string;
  routeCode: string | null;
  dhrTemplateId: string;
  dhrTemplateVersionId: string;
  dhrTemplateCode: string | null;
  context: Record<string, unknown>;
  directorySnapshot: { version?: string; directories: DhrDirectory[] };
  evidenceSummary: { itemCount: number; suppliedItemCount: number; recordCount: number; unmappedRecordCount: number };
  unmappedRecords: DhrEvidenceRecord[];
  recordsByOrigin: { directory: DhrEvidenceRecord[]; work: DhrEvidenceRecord[]; custom: DhrEvidenceRecord[] };
}

export interface DhrInstancePage {
  content: DhrInstanceSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function listDhrInstances(params: {
  keyword?: string;
  objectType?: DhrObjectType | '';
  productionStatus?: DhrProductionStatus | '';
  displayStatus?: DhrDisplayStatus | '';
  summaryStatus?: DhrSummaryStatus | 'PENDING_GROUP' | 'SUBMITTED_GROUP' | '';
  page?: number;
  size?: number;
}): Promise<DhrInstancePage> {
  return (await client.get('/dhr-instances', { params })).data.data;
}

export async function listDhrSummaryInstances(params: {
  keyword?: string;
  summaryStatus?: DhrSummaryStatus | 'PENDING_GROUP' | 'SUBMITTED_GROUP' | '';
  page?: number;
  size?: number;
}): Promise<DhrInstancePage> {
  return (await client.get('/dhr-instances/summary-list', { params })).data.data;
}

export async function getDhrInstance(id: string): Promise<DhrInstanceDetail> {
  return (await client.get(`/dhr-instances/${encodeURIComponent(id)}`)).data.data;
}

export interface DhrSummaryDirectoryOverlay {
  key: string;
  parentKey: string | null;
  name: string;
  sortOrder: number;
}

export interface DhrSummaryPlacement { recordId: string; targetNodeKey: string; beforeNodeKey?: string; displayOrder?: number; displayName?: string }

export interface DhrAttachment {
  id: string; name: string; mimeType: string; size: number; sha256: string;
  sourceKind: 'EXTERNAL_REPORT' | 'CERTIFICATE' | 'PAPER_SCAN' | 'OTHER'; purpose: string;
  originalRecordedAt: string | null; custodyLocation: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'; verifiedBy: string | null;
  verifiedAt: string | null; linkedBy: string | null; linkedAt: string;
}

export interface DhrSummaryWorkspace {
  sourceScopeHash: string;
  dhr: DhrInstanceDetail;
  candidates: DhrEvidenceRecord[];
  attachments: DhrAttachment[];
  draft: null | { id: string; revision: number; sourceScopeHash?: string | null; overlayDirectories: DhrSummaryDirectoryOverlay[]; placements: DhrSummaryPlacement[] };
  versions: Array<{ id: string; versionNo: number; evidenceModelVersion: number; status: 'PENDING_REVIEW' | 'FORMALIZED'; reviewOutcome?: 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED' | null; reviewMode: 'NONE' | 'REQUIRED'; reviewWorkflowDefinitionId: string | null; reviewWorkflowVersionId: string | null; snapshotHash: string; submittedBy: string | null; submittedAt: string }>;
}

export async function getDhrSummaryWorkspace(id: string): Promise<DhrSummaryWorkspace> {
  return (await client.get(`/dhr-instances/${encodeURIComponent(id)}/summary`)).data.data;
}

export interface DhrSummaryVersionDetail {
  evidenceChanges?: Array<{ recordId?: string; attachmentId?: string; instanceNo?: string; message: string }>;
  dhr: DhrInstanceDetail;
  version: DhrSummaryWorkspace['versions'][number] & {
    baseDirectory: DhrInstanceDetail['directorySnapshot'];
    overlayDirectories: DhrSummaryDirectoryOverlay[];
    candidates: DhrEvidenceRecord[];
    attachments: DhrAttachment[];
    checkResult?: { ruleVersion: string; checkedAt: string; checkedBy: string; actualRecordCount: number;
      manualReview?: { qualityAndExceptionsReviewed: boolean; sourceSignaturesReviewed: boolean; completeScopeReviewed: boolean;
        note: string; confirmedBy: string; confirmedAt: string } } | null;
  };
  placements: DhrSummaryPlacement[];
}

export async function getDhrSummaryVersion(id: string, versionId: string): Promise<DhrSummaryVersionDetail> {
  return (await client.get(`/dhr-instances/${encodeURIComponent(id)}/summary/versions/${encodeURIComponent(versionId)}`)).data.data;
}

export interface DhrAuditEvent {
  id: string; entityType: string; entityId: string; action: string; functionName: string | null;
  operator: string | null; at: string; reason: string | null; before: string | null; after: string | null;
}

export async function getDhrSummaryAudit(id: string, page = 0): Promise<{ page: number; total: number; events: DhrAuditEvent[] }> {
  return (await client.get(`/dhr-instances/${encodeURIComponent(id)}/summary/audit`, { params: { page } })).data.data;
}

export async function saveDhrSummaryDraft(id: string, body: { draftId?: string; revision?: number; expectedScopeHash: string; overlayDirectories: DhrSummaryDirectoryOverlay[]; placements: DhrSummaryPlacement[] }) {
  return (await client.put(`/dhr-instances/${encodeURIComponent(id)}/summary/draft`, body)).data.data as { id: string; revision: number };
}

export async function submitDhrSummary(id: string, expectedRevision: number, expectedDraftId: string, manualReview: { qualityAndExceptionsReviewed: true; sourceSignaturesReviewed: true; completeScopeReviewed: true; note: string }) {
  return (await client.post(`/dhr-instances/${encodeURIComponent(id)}/summary/submit`, { expectedRevision, expectedDraftId, manualReview })).data.data as { id: string; versionNo: number; status: 'PENDING_REVIEW' | 'FORMALIZED'; snapshotHash: string };
}

export async function uploadDhrAttachment(id: string, input: { file: File; sourceKind: DhrAttachment['sourceKind']; purpose: string; originalRecordedAt?: string; custodyLocation?: string }) {
  const data = new FormData();
  data.append('file', input.file);
  data.append('sourceKind', input.sourceKind);
  data.append('purpose', input.purpose);
  if (input.originalRecordedAt) data.append('originalRecordedAt', input.originalRecordedAt);
  if (input.custodyLocation) data.append('custodyLocation', input.custodyLocation);
  return (await client.post(`/dhr-instances/${encodeURIComponent(id)}/attachments`, data)).data.data as { attachmentId: string };
}

export async function verifyDhrAttachment(id: string, attachmentId: string) {
  await client.post(`/dhr-instances/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}/verify`);
}

export async function unlinkDhrAttachment(id: string, attachmentId: string, reason: string) {
  await client.post(`/dhr-instances/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}/unlink`, { reason });
}

export async function downloadDhrArchive(id: string, versionId: string, scope: 'FULL' | 'SELECTED', recordIds: string[] = [], attachmentIds: string[] = []) {
  const response = await client.get(`/dhr-instances/${encodeURIComponent(id)}/summary/versions/${encodeURIComponent(versionId)}/export`, {
    params: { scope, recordIds: recordIds.join(','), attachmentIds: attachmentIds.join(',') }, responseType: 'blob',
  });
  return response.data as Blob;
}

export async function downloadDhrAttachment(id: string, attachmentId: string, versionId?: string) {
  const response = await client.get(`/dhr-instances/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}/download`, { params: versionId ? { versionId } : undefined, responseType: 'blob' });
  return response.data as Blob;
}
