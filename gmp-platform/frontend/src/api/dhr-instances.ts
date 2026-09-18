import client from './client';

export type DhrStatus = 'IN_PROGRESS' | 'COMPLETED';
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
  snapshot: Record<string, unknown> & { name?: string; version?: string; model?: string; canvas?: string; fields?: Array<Record<string, unknown>>; dhrItemId?: string; workId?: string; sourceType?: string };
  updatedBy: string | null;
  updatedAt: string;
  fieldValues: Record<string, unknown>;
}

export interface DhrDirectoryItem {
  id: string;
  displayName?: string;
  formName?: string;
  formVersion?: string;
  required?: boolean;
  records: DhrEvidenceRecord[];
}

export interface DhrDirectory {
  id: string;
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
  status?: DhrStatus | '';
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

export interface DhrSummaryPlacement { recordId: string; targetNodeKey: string }

export interface DhrSummaryWorkspace {
  dhr: DhrInstanceDetail;
  candidates: DhrEvidenceRecord[];
  draft: null | { id: string; revision: number; overlayDirectories: DhrSummaryDirectoryOverlay[]; placements: DhrSummaryPlacement[] };
  versions: Array<{ id: string; versionNo: number; status: 'PENDING_REVIEW' | 'FORMALIZED'; reviewMode: 'NONE' | 'REQUIRED'; reviewWorkflowDefinitionId: string | null; reviewWorkflowVersionId: string | null; snapshotHash: string; submittedBy: string | null; submittedAt: string }>;
}

export async function getDhrSummaryWorkspace(id: string): Promise<DhrSummaryWorkspace> {
  return (await client.get(`/dhr-instances/${encodeURIComponent(id)}/summary`)).data.data;
}

export interface DhrSummaryVersionDetail {
  dhr: DhrInstanceDetail;
  version: DhrSummaryWorkspace['versions'][number] & {
    baseDirectory: DhrInstanceDetail['directorySnapshot'];
    overlayDirectories: DhrSummaryDirectoryOverlay[];
    candidates: DhrEvidenceRecord[];
  };
  placements: DhrSummaryPlacement[];
}

export async function getDhrSummaryVersion(id: string, versionId: string): Promise<DhrSummaryVersionDetail> {
  return (await client.get(`/dhr-instances/${encodeURIComponent(id)}/summary/versions/${encodeURIComponent(versionId)}`)).data.data;
}

export async function saveDhrSummaryDraft(id: string, body: { revision?: number; overlayDirectories: DhrSummaryDirectoryOverlay[]; placements: DhrSummaryPlacement[] }) {
  return (await client.put(`/dhr-instances/${encodeURIComponent(id)}/summary/draft`, body)).data.data as { id: string; revision: number };
}

export async function submitDhrSummary(id: string, expectedRevision: number) {
  return (await client.post(`/dhr-instances/${encodeURIComponent(id)}/summary/submit`, { expectedRevision })).data.data as { id: string; versionNo: number; status: 'PENDING_REVIEW' | 'FORMALIZED'; snapshotHash: string };
}
