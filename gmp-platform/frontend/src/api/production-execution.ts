import client from './client';
import type { ModelField } from '@/pages/master-data/template-designer-react/types';

export type ExecutionValues = Record<string, unknown>;
export interface ExecutionButton { action: string; label: string; requiresSignature?: boolean; requireOpinion?: boolean }
export interface ExecutionForm {
  sourceType?: 'CUSTOM';
  id: string; versionId: string; name: string; code: string; version: string; categoryName?: string | null;
  model: string; canvas: string; fields: ModelField[]; required?: boolean; fulfilledBy?: string; workId?: string; workNodeId?: string;
}
export interface ExecutionWork {
  id: string; name: string; version: string;
  nodes: Array<{ id: string; data: { kind: string; label: string; config?: { confirmationInstruction?: string; message?: string } } }>;
}
export interface ExecutionOperation {
  id: string; name: string; code?: string; type: string;
  forms: ExecutionForm[]; works: ExecutionWork[];
  documents: Array<{ id: string; name: string; version: string; code: string; fileId?: string; pageStart?: string; pageEnd?: string }>;
}
export interface ExecutionFormState { status: string; values: ExecutionValues; instanceNo?: string; savedAt?: string; active?: string[] }
export interface ExecutionFormControls { canAct?: boolean; buttons: ExecutionButton[]; permissions: Record<string, 'EDIT' | 'READ_ONLY'>; nodeName?: string }
export interface ExecutionFormCopies {
  instanceIds: string[]; status: string; ended: boolean; required: boolean; canAdd: boolean; canEnd: boolean;
  incomplete: string[]; instances: Record<string, ExecutionFormControls>;
}
export interface ExecutionView {
  operationOutputs?: Record<string, { status: 'READY' | 'NOT_CONFIGURED' | 'PENDING' | 'INVALID'; message: string; outputQuantity: string | null; goodQuantity: string | null; ngQuantity: string | null; scrapQuantity: string | null }>;
  snapshot: {
    context: { objectId: string; objectNo: string; objectType: string; workOrderNo: string; productName: string; productCode: string; specification?: string;
      targetQuantity?: number; unit?: string; processVersion?: string; routeName?: string; routeVersion?: string; dhrName?: string; dhrVersion?: string; productionMode?: string };
    operations: ExecutionOperation[];
    routeNodes?: Array<{ id: string; name?: string; type: string }>;
    routeEdges?: Array<{ source: string; target: string }>;
  };
  state: { operations: Record<string, { status: string; startedAt?: string; completedAt?: string; forms: Record<string, ExecutionFormState>; works: Record<string, { status: string; active: string[] }> }>;
    history: Array<{ operationId: string; operationName: string; action: string; operator: string; at: string; detail: string }> };
  availability: Record<string, { canStart: boolean; canComplete: boolean; canAttachForm?: boolean; startIssues: string[]; completionIssues: string[]; completionWarnings?: string[];
    forms: Record<string, ExecutionFormControls>; formCopies?: Record<string, ExecutionFormCopies> }>;
  attachedFormId?: string;
  revision: number; objectStatus: string; orderStatus: string; startedAt?: string; configurationError?: string; historicalWithoutExecution: boolean;
}
export interface ExecutionCommand {
  action: string; revision: number; operationId: string; formId?: string; workId?: string; nodeId?: string;
  instanceId?: string; acknowledgeIncomplete?: boolean;
  templateVersionId?: string; required?: boolean;
  values?: ExecutionValues; opinion?: string; account?: string; password?: string;
}
export interface ExecutionTemplate { versionId: string; name: string; code: string; version: string; categoryName?: string }
export type ExecutionEditors = Record<string, Record<string, { userId: string; name: string; avatarUrl?: string; sequences: number[] }>>;
export const getExecutionTemplates = async (keyword: string): Promise<ExecutionTemplate[]> =>
  (await client.get('/production/execution/form-templates', { params: { keyword } })).data.data;
export const getExecutionEditors = async (id: string, operationId: string): Promise<ExecutionEditors> =>
  (await client.get(`/production/execution/${id}/presence`, { params: { operationId } })).data.data;
export const updateExecutionEditor = async (id: string, operationId: string, command: { sessionId: string; formId: string; instanceId: string; editing: boolean }): Promise<ExecutionEditors> =>
  (await client.post(`/production/execution/${id}/presence`, command, { params: { operationId } })).data.data;
export const scanProduction = async (barcode: string): Promise<ExecutionView> => (await client.get('/production/execution/scan', { params: { barcode } })).data.data;
export const getProductionExecution = async (id: string): Promise<ExecutionView> => (await client.get(`/production/execution/${id}`)).data.data;
export const executeProduction = async (id: string, command: ExecutionCommand): Promise<ExecutionView> => (await client.post(`/production/execution/${id}/actions`, command)).data.data;
export const getExecutionReferences = async (id: string, operationId: string, formId: string, fieldId: string, keyword: string, values: Record<string, unknown> = {}): Promise<Array<{ id: string; name: string }>> =>
  (await client.post(`/production/execution/${id}/references`, { operationId, formId, fieldId, keyword, values })).data.data;
export const uploadExecutionFile = async (id: string, file: File): Promise<{ fileId: string; originalName: string }> => {
  const body = new FormData(); body.append('file', file); body.append('targetType', 'PRODUCTION_EXECUTION'); body.append('targetId', id);
  return (await client.post('/files/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
};
