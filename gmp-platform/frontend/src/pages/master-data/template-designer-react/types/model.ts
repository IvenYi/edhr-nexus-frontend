import type { PropertySchemaItem } from './canvas';

export interface ModelFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface ModelField {
  id: string;
  code: string;
  name: string;
  type: string;
  groupId?: string | null;
  required?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  optionsText?: string;
  options?: ModelFieldOption[];
  config: Record<string, unknown>;
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
  type: string;
  label: string;
  compatibleComponents: string[];
  defaultField: () => ModelField;
  configSchema: PropertySchemaItem[];
}
