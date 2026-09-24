import type { SubjectRef } from '@/components/identity/SubjectSelector';
import type { WorkflowButtonConfig, WorkflowButtonEvent } from '@/components/flow-designer/WorkflowActionConfig';

export type FieldPermissions = Record<string, {
  defaultPermission?: 'EDIT' | 'READ_ONLY';
  editableFieldIds?: string[];
  readOnlyFieldIds?: string[];
}>;
export type EntryPermissionGroup = {
  id?: string;
  group: string;
  subjects?: SubjectRef[];
  defaultPermission?: 'EDIT' | 'READ_ONLY';
};
export type DirectFillConfig = {
  permissionGroups?: string[];
  permissionGroupRules?: EntryPermissionGroup[];
  conflictPolicy?: 'READ_ONLY_FIRST';
  defaultPermission?: 'EDIT' | 'READ_ONLY';
  buttons?: WorkflowButtonConfig[];
  buttonEvents?: WorkflowButtonEvent[];
  guardMode?: 'NONE' | 'BLOCK_ON_INVALID' | 'WARN_ON_INVALID';
  fieldPermissions?: FieldPermissions;
  eventBindings?: Record<string, { fieldId?: string }>;
};
export type FormFillSettingsValue = {
  fillMode?: 'DIRECT' | 'PROCESS';
  formProcessVersionId?: string;
  formProcessName?: string;
  directFillConfig?: DirectFillConfig;
  fieldPermissions?: FieldPermissions;
  eventBindings?: Record<string, { fieldId?: string }>;
};
export const fillMode = (value: FormFillSettingsValue) => value.fillMode ?? 'DIRECT';
export const directFillVersion = (config?: DirectFillConfig) => ({
  nodesJson: JSON.stringify([{ id: 'entry', data: { kind: 'START', label: '填报', config: config ?? {} } }]),
});
