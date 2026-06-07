export type EdhrPageType =
  | 'master'
  | 'list'
  | 'report'
  | 'transaction'
  | 'execution'
  | 'approval'
  | 'dashboard';

export type EdhrFieldUsage = 'query' | 'list' | 'form' | 'system';

export interface EdhrFieldMeta {
  id: string;
  name: string;
  label: string;
  required: boolean;
  system: boolean;
  usages: EdhrFieldUsage[];
}

export interface EdhrActionMeta {
  id: string;
  code: string;
  label: string;
  sourceLabel: string;
  permissionRequired: boolean;
  auditRequired: boolean;
}

export interface EdhrStateTransition {
  from: string;
  to: string;
  action: string;
  auditRequired: boolean;
}

export interface EdhrAuditEntry {
  id: string;
  pageCode: string;
  recordId: string;
  actionCode: string;
  actionLabel: string;
  operatorId: string;
  operatorName: string;
  operatedAt: string;
  beforeValue?: Record<string, unknown>;
  afterValue?: Record<string, unknown>;
  remark?: string;
}

export interface EdhrRecordStatusHistory {
  id: string;
  recordId: string;
  fromStatus: string;
  toStatus: string;
  actionCode: string;
  operatorName: string;
  changedAt: string;
  remark?: string;
}

export interface EdhrRecord {
  id: string;
  tenantId: string;
  pageCode: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  remark?: string;
  values: Record<string, unknown>;
}

export interface EdhrPageMeta {
  code: string;
  section: string;
  module: string;
  moduleSlug: string;
  group: string;
  groupSlug: string;
  title: string;
  label: string;
  pageSlug: string;
  path: string;
  type: EdhrPageType;
  positioning: string;
  businessScenario: string;
  boundary: string;
  interfaceSuggestion: string;
  apiSuggestions: string[];
  acceptanceCriteria: string;
  aiPrompt: string;
  stateFlow: string;
  baseStatuses: string[];
  businessStatuses: string[];
  queryFields: EdhrFieldMeta[];
  listFields: EdhrFieldMeta[];
  formFields: EdhrFieldMeta[];
  systemFields: EdhrFieldMeta[];
  fields: EdhrFieldMeta[];
  actions: EdhrActionMeta[];
  stateTransitions: EdhrStateTransition[];
}
