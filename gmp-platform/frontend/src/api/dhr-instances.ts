import client from './client';

export type DhrStatus = 'IN_PROGRESS' | 'COMPLETED';
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
  templateName: string | null;
  templateVersion: string | null;
  status: string;
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
  page?: number;
  size?: number;
}): Promise<DhrInstancePage> {
  return (await client.get('/dhr-instances', { params })).data.data;
}

export async function getDhrInstance(id: string): Promise<DhrInstanceDetail> {
  return (await client.get(`/dhr-instances/${encodeURIComponent(id)}`)).data.data;
}
