import type { PropertySchemaItem } from './canvas';

export type FieldType =
  | 'text'
  | 'number'
  | 'datetime'
  | 'signature'
  | 'link'
  | 'attachment'
  | 'image'
  | 'singleSelect'
  | 'multiSelect'
  | 'reference'
  | 'subTable';

export type FieldTypeIconKey = FieldType;

export type ModelFieldStatus = 'enabled' | 'disabled';

export interface ModelFieldOption {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  status: ModelFieldStatus;
}

export interface ModelField {
  id: string;
  code: string;
  name: string;
  type: FieldType;
  groupId?: string | null;
  sortOrder: number;
  status: ModelFieldStatus;
  description?: string;
  typeConfig: Record<string, unknown>;
}

export interface ModelFieldGroup {
  id: string;
  name: string;
}

export interface ModelDesignState {
  groups: ModelFieldGroup[];
  fields: ModelField[];
}

export interface FieldTypeDefinition {
  type: FieldType;
  label: string;
  iconKey: FieldTypeIconKey;
  compatibleComponents: string[];
  defaultComponentType: string;
  defaultField: (name?: string, sortOrder?: number) => ModelField;
  typeConfigSchema: PropertySchemaItem[];
}
